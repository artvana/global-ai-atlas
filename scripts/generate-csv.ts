#!/usr/bin/env npx tsx
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const regulations = JSON.parse(readFileSync(join(ROOT, 'data/regulations.json'), 'utf8'))

const provKeys = Object.keys(regulations[0]?.provisions ?? {}).filter((k: string) => k !== 'anti_discrimination_standard')

const headers = [
  'id', 'short_name', 'full_name', 'jurisdiction', 'jurisdiction_type', 'region',
  'instrument_type', 'bill_number', 'enacted_date', 'effective_date', 'status',
  'primary_category', 'categories', 'scope', 'who_regulated', 'legal_family',
  'enforcement_body', 'max_penalty', 'max_penalty_usd_approx',
  'preemption_status', 'official_text_url', 'last_verified', 'summary', 'notable',
  ...provKeys,
]

function esc(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = Array.isArray(val) ? val.join('; ') : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const rows = regulations.map((l: Record<string, unknown>) => {
  const provisions = l.provisions as Record<string, unknown>
  return [
    l.id, l.short_name, l.full_name, l.jurisdiction, l.jurisdiction_type, l.region,
    l.instrument_type, l.bill_number, l.enacted_date, l.effective_date, l.status,
    l.primary_category, (l.categories as string[]).join('; '), l.scope,
    (l.who_regulated as string[]).join('; '), l.legal_family,
    (l.enforcement_body as string[]).join('; '), l.max_penalty, l.max_penalty_usd_approx,
    l.preemption_status, l.official_text_url, l.last_verified, l.summary, l.notable,
    ...provKeys.map(k => provisions[k]),
  ].map(esc).join(',')
})

const csv = [headers.join(','), ...rows].join('\n')
writeFileSync(join(ROOT, 'data/regulations.csv'), csv)
console.log(`Generated regulations.csv — ${regulations.length} rows`)
