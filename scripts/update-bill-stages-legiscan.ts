#!/usr/bin/env npx tsx
/**
 * Syncs US state bill stages from the LegiScan API.
 *
 * For each proposed US state bill:
 *  - Matches against LegiScan master list by bill number
 *  - Resolves terminal states: signed → in_force, vetoed, failed
 *  - Marks bills in ended sessions as failed (dead in committee)
 *  - Infers legislative_stage from LegiScan status + last_action text
 *
 * Usage:
 *   LEGISCAN_API_KEY=xxx npx tsx scripts/update-bill-stages-legiscan.ts
 *   LEGISCAN_API_KEY=xxx npx tsx scripts/update-bill-stages-legiscan.ts --state CA
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const RATE_LIMIT_MS = 250  // ≤4 req/s — free tier limit

const API_KEY = process.env.LEGISCAN_API_KEY
if (!API_KEY) { console.error('LEGISCAN_API_KEY is not set'); process.exit(1) }

const stateFilter = process.argv.includes('--state')
  ? process.argv[process.argv.indexOf('--state') + 1]?.toUpperCase()
  : null

// ─── LegiScan API ────────────────────────────────────────────────────────────

async function legiscan(params: Record<string, string>): Promise<any> {
  await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
  const url = new URL('https://api.legiscan.com/')
  url.search = new URLSearchParams({ key: API_KEY!, ...params }).toString()
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json() as any
  if (json.status !== 'OK') throw new Error(json.alert?.message ?? JSON.stringify(json).slice(0, 200))
  return json
}

// ─── Stage inference ─────────────────────────────────────────────────────────

// LegiScan bill.status codes:
//   1 = Introduced  2 = Engrossed (passed 1 chamber)  3 = Enrolled (passed both)
//   4 = Passed (signed)  5 = Vetoed  6 = Failed/Dead
function resolveFromLegiStatus(status: number, sessionEnded: boolean): {
  newStatus?: string
  legislative_stage?: string
} | null {
  if (status === 4) return { newStatus: 'in_force' }
  if (status === 5) return { newStatus: 'vetoed' }
  if (status === 6) return { newStatus: 'failed' }
  if (status === 3) return { legislative_stage: 'passed_legislature' }
  if (status === 2) return { legislative_stage: 'passed_one_chamber' }
  // status 1 — still in progress or dead in ended session
  if (sessionEnded) return { newStatus: 'failed' }
  return null  // active; infer from last_action text
}

function inferStageFromAction(action: string): string {
  const a = action.toLowerCase()
  if (/sign(ed)?|enacted|chaptered|approved by governor|became law/i.test(a)) return 'enacted'
  if (/veto(ed)?/i.test(a)) return 'vetoed'
  if (/fail(ed)?|died?|tabled|postponed indefinitely|laid on table|not adopted/i.test(a)) return 'failed'
  if (/sent to governor|transmitted to governor|enrolled|delivered to governor/i.test(a)) return 'passed_legislature'
  if (/passed (both|second chamber|senate and house)|concurr|final passage/i.test(a)) return 'passed_legislature'
  if (/passed (senate|house|assembly|chamber)|third reading passed|do pass/i.test(a)) return 'passed_one_chamber'
  if (/reported (out|favorably)|passed (sub)?committee|committee (vote|approved|passed)/i.test(a)) return 'passed_committee'
  if (/referred to|assigned to committee|re-?referred/i.test(a)) return 'in_committee'
  if (/introduced|filed|first reading|pre-?filed/i.test(a)) return 'introduced'
  return 'introduced'
}

// ─── Bill number normalization ────────────────────────────────────────────────
// Our DB stores "H 47", "S 1707", "A 412" etc.
// LegiScan stores "HB 47", "SB 1707", "AB 412", "HB0047" etc. — varies by state.
// Generate multiple variants for fuzzy matching.

function billVariants(raw: string): string[] {
  const clean = raw.trim().toUpperCase().replace(/\s+/g, '')
  const variants = new Set([clean, clean.replace(/^(\D+)0+(\d)/, '$1$2')])

  // "H47" ↔ "HB47", "S47" ↔ "SB47", "A47" ↔ "AB47", "J47" ↔ "JB47"
  const m1 = clean.match(/^([HSAJ])(R|CR|JR|SR)?(\d+)$/)
  if (m1) {
    const [, letter, suffix, num] = m1
    variants.add(`${letter}B${num}`)
    variants.add(`${letter}B${num.padStart(4, '0')}`)
    if (!suffix) {
      variants.add(`${letter}${num.padStart(4, '0')}`)
    }
  }

  // "HB47" → "H47"
  const m2 = clean.match(/^([HSAJ])B(\d+)$/)
  if (m2) {
    const [, letter, num] = m2
    variants.add(`${letter}${num}`)
    variants.add(`${letter}${num.padStart(4, '0')}`)
  }

  return [...variants]
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10)
  const regulations: any[] = JSON.parse(readFileSync(join(ROOT, 'data/regulations.json'), 'utf8'))

  // Proposed US state bills with a bill number
  const usBills = regulations.filter(r =>
    r.status === 'proposed' &&
    typeof r.region === 'string' &&
    /^US-[A-Z]{2}$/.test(r.region) &&
    r.bill_number &&
    (!stateFilter || r.region === `US-${stateFilter}`)
  )

  const byState: Record<string, any[]> = {}
  for (const bill of usBills) {
    const state = bill.region.slice(3)
    ;(byState[state] ??= []).push(bill)
  }

  console.log(`LegiScan sync: ${usBills.length} bills across ${Object.keys(byState).length} states`)
  if (stateFilter) console.log(`  Filtered to: ${stateFilter}`)

  // Fetch all sessions once
  console.log('Fetching session list...')
  const { sessions: allSessions } = await legiscan({ op: 'getSessionList', state: 'ALL' })

  const updates = new Map<string, Record<string, any>>()
  const unmatchedIds: string[] = []
  let totalMatched = 0

  for (const [state, bills] of Object.entries(byState)) {
    // Regular sessions only, newest first
    const sessions = (allSessions as any[])
      .filter(s => s.state_abbr === state && s.special === 0)
      .sort((a: any, b: any) => b.year_start - a.year_start)
      .slice(0, 2)  // current + previous session

    if (!sessions.length) {
      console.log(`  ${state}: no sessions found`)
      continue
    }

    // Build lookup: normalized bill number → our record
    const lookup: Record<string, any> = {}
    for (const bill of bills) {
      for (const v of billVariants(bill.bill_number)) {
        lookup[v] = bill
      }
    }

    const matched = new Set<string>()

    for (const session of sessions) {
      if (matched.size >= bills.length) break
      const sessionEnded = session.sine_die === 1

      let masterList: any[]
      try {
        const res = await legiscan({ op: 'getMasterList', id: String(session.session_id) })
        masterList = Object.values(res.masterlist).filter((b: any) => typeof b === 'object' && b.bill_id) as any[]
      } catch (e) {
        console.warn(`  ${state} session ${session.session_id}: ${e}`)
        continue
      }

      for (const entry of masterList) {
        const normNum = (entry.number as string | undefined)?.toUpperCase().replace(/\s+/g, '') ?? ''
        const ourBill = lookup[normNum]
        if (!ourBill || matched.has(ourBill.id)) continue

        matched.add(ourBill.id)

        const resolved = resolveFromLegiStatus(entry.status, sessionEnded)
        const update: Record<string, any> = { last_verified: today }

        if (entry.last_action_date) update.last_action_date = entry.last_action_date
        if (entry.last_action) update.last_action_description = String(entry.last_action).slice(0, 250)

        if (resolved) {
          if (resolved.newStatus) {
            update.status = resolved.newStatus
            if (resolved.newStatus === 'in_force' && !ourBill.enacted_date) {
              update.enacted_date = entry.last_action_date ?? today
            }
          } else if (resolved.legislative_stage) {
            update.legislative_stage = resolved.legislative_stage
          }
        } else {
          // Active session, status=1 — infer from last_action text
          const inferred = inferStageFromAction(entry.last_action ?? '')
          if (inferred === 'enacted') {
            update.status = 'in_force'
            if (!ourBill.enacted_date) update.enacted_date = entry.last_action_date ?? today
          } else if (inferred === 'vetoed') {
            update.status = 'vetoed'
          } else if (inferred === 'failed') {
            update.status = 'failed'
          } else {
            update.legislative_stage = inferred
          }
        }

        updates.set(ourBill.id, update)
      }
    }

    totalMatched += matched.size
    const unmatched = bills.length - matched.size
    bills.filter(b => !matched.has(b.id)).forEach(b => unmatchedIds.push(b.id))
    console.log(`  ${state}: ${matched.size}/${bills.length} matched${unmatched ? ` (${unmatched} not in LegiScan)` : ''}`)
  }

  // Apply updates
  const result = regulations.map(r => {
    const u = updates.get(r.id)
    if (!u) return r
    const updated = { ...r, ...u }
    // Remove legislative_stage for terminal statuses
    if (['in_force', 'vetoed', 'failed', 'rescinded', 'withdrawn'].includes(updated.status)) {
      delete updated.legislative_stage
    }
    return updated
  })

  // Summary
  const breakdown: Record<string, number> = {}
  for (const u of updates.values()) {
    const key = u.status ?? u.legislative_stage ?? 'refreshed'
    breakdown[key] = (breakdown[key] ?? 0) + 1
  }

  console.log(`\nResults: ${updates.size} bills updated, ${usBills.length - totalMatched} not found`)
  console.log('Breakdown:', breakdown)

  writeFileSync(join(ROOT, 'data/regulations.json'), JSON.stringify(result, null, 2))
  console.log('Written to data/regulations.json')

  writeFileSync('/tmp/legiscan-unmatched.json', JSON.stringify(unmatchedIds, null, 2))
  console.log(`Unmatched: ${unmatchedIds.length} bill(s) → /tmp/legiscan-unmatched.json`)
}

main().catch(e => { console.error(e); process.exit(1) })
