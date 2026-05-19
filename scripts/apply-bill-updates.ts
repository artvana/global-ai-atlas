#!/usr/bin/env npx tsx
/**
 * Merges one or more JSON patch files into data/regulations.json.
 *
 * Each patch file is a JSON object: { [bill_id]: { fields_to_update } }
 * Later files override earlier files for the same bill ID.
 *
 * Usage:
 *   npx tsx scripts/apply-bill-updates.ts /tmp/updates-*.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const TERMINAL_STATUSES = new Set(['in_force', 'vetoed', 'failed', 'rescinded', 'withdrawn'])

function main() {
  const files = process.argv.slice(2)

  if (files.length === 0) {
    console.log('No patch files provided — nothing to do.')
    process.exit(0)
  }

  // Merge all patches: later files override earlier for same ID
  const merged: Record<string, Record<string, any>> = {}

  for (const file of files) {
    if (!existsSync(file)) {
      console.warn(`Warning: file not found, skipping: ${file}`)
      continue
    }

    let patch: Record<string, Record<string, any>>
    try {
      const raw = readFileSync(file, 'utf8').trim()
      if (!raw || raw === '{}') {
        console.log(`  ${file}: empty — skipping`)
        continue
      }
      patch = JSON.parse(raw)
      if (typeof patch !== 'object' || Array.isArray(patch)) {
        console.warn(`Warning: ${file} is not a JSON object — skipping`)
        continue
      }
    } catch (e) {
      console.warn(`Warning: invalid JSON in ${file} — skipping (${e})`)
      continue
    }

    const count = Object.keys(patch).length
    console.log(`  ${file}: ${count} update(s)`)

    for (const [id, fields] of Object.entries(patch)) {
      merged[id] = { ...(merged[id] ?? {}), ...fields }
    }
  }

  const totalPatches = Object.keys(merged).length
  if (totalPatches === 0) {
    console.log('No valid updates found across all patch files — regulations.json unchanged.')
    process.exit(0)
  }

  // Load regulations
  const regPath = join(ROOT, 'data/regulations.json')
  const regulations: any[] = JSON.parse(readFileSync(regPath, 'utf8'))

  // Apply updates
  let applied = 0
  const result = regulations.map(r => {
    const patch = merged[r.id]
    if (!patch) return r

    const updated = { ...r, ...patch }

    // Remove legislative_stage for terminal statuses
    if (TERMINAL_STATUSES.has(updated.status)) {
      delete updated.legislative_stage
    }

    applied++
    return updated
  })

  // Warn about patch IDs not found in regulations
  const regIds = new Set(regulations.map(r => r.id))
  for (const id of Object.keys(merged)) {
    if (!regIds.has(id)) {
      console.warn(`Warning: patch ID not found in regulations.json: ${id}`)
    }
  }

  writeFileSync(regPath, JSON.stringify(result, null, 2))
  console.log(`\nApplied ${applied} update(s) to data/regulations.json`)
}

main()
