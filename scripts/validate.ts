#!/usr/bin/env npx tsx
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const regulations = JSON.parse(readFileSync(join(ROOT, 'data/regulations.json'), 'utf8'))

interface ValidationError {
  id: string
  field: string
  issue: string
  severity: 'error' | 'warning'
}

const errors: ValidationError[] = []
function error(id: string, field: string, issue: string) { errors.push({ id, field, issue, severity: 'error' }) }
function warn(id: string, field: string, issue: string)  { errors.push({ id, field, issue, severity: 'warning' }) }

const today = new Date().toISOString().slice(0, 10)
const ids = new Set<string>()

// Allowed enum values
const VALID_STATUS           = new Set(['in_force', 'enacted_not_yet_effective', 'superseded', 'failed'])
const VALID_JURISDICTION_TYPE = new Set(['supranational', 'national', 'subnational', 'agency'])
const VALID_LEGAL_FAMILY     = new Set(['eu_risk_based', 'us_consumer_protection', 'china_state_sovereignty', 'uk_non_model', 'hybrid', 'standalone'])
const VALID_CATEGORIES       = new Set([
  'data_protection', 'algorithmic_systems', 'synthetic_media', 'biometric_identity',
  'ip_creative_rights', 'national_security', 'sector_healthcare', 'sector_employment',
  'sector_financial', 'sector_education', 'general_ai_governance',
])

for (const law of regulations) {
  const id = law.id ?? 'UNKNOWN'

  // Duplicate IDs
  if (ids.has(id)) error(id, 'id', `Duplicate ID: ${id}`)
  ids.add(id)

  // Required fields
  if (!law.status)       error(id, 'status', 'Missing status field')
  if (!law.enacted_date) error(id, 'enacted_date', 'Missing enacted_date')
  if (!law.summary || String(law.summary).trim().length < 20) warn(id, 'summary', 'Missing or very short summary')

  // Enum validation
  if (law.status && !VALID_STATUS.has(law.status)) {
    error(id, 'status', `Invalid status "${law.status}". Must be one of: ${[...VALID_STATUS].join(' | ')}`)
  }
  if (law.jurisdiction_type && !VALID_JURISDICTION_TYPE.has(law.jurisdiction_type)) {
    error(id, 'jurisdiction_type', `Invalid jurisdiction_type "${law.jurisdiction_type}". Must be one of: ${[...VALID_JURISDICTION_TYPE].join(' | ')}`)
  }
  if (law.legal_family && !VALID_LEGAL_FAMILY.has(law.legal_family)) {
    error(id, 'legal_family', `Invalid legal_family "${law.legal_family}". Must be one of: ${[...VALID_LEGAL_FAMILY].join(' | ')}`)
  }
  if (law.primary_category && !VALID_CATEGORIES.has(law.primary_category)) {
    error(id, 'primary_category', `Invalid primary_category "${law.primary_category}"`)
  }
  for (const cat of (law.categories ?? [])) {
    if (!VALID_CATEGORIES.has(cat)) {
      error(id, 'categories', `Invalid category "${cat}"`)
    }
  }

  // jurisdiction_type consistency
  if (law.country === 'Global / Regional' && law.jurisdiction_type !== 'supranational') {
    error(id, 'jurisdiction_type', `country is "Global / Regional" but jurisdiction_type is "${law.jurisdiction_type}" — should be "supranational"`)
  }

  // Subnational laws need a bill_number
  if (law.jurisdiction_type === 'subnational' && !law.bill_number) {
    warn(id, 'bill_number', 'Subnational law missing bill_number')
  }

  // superseded_by chain resolution
  if (law.superseded_by) {
    const target = regulations.find((r: { id: string }) => r.id === law.superseded_by)
    if (!target) error(id, 'superseded_by', `superseded_by references unknown ID: ${law.superseded_by}`)

    // No circular chains
    const visited = new Set<string>()
    let cur = law
    while (cur.superseded_by) {
      if (visited.has(cur.id)) { error(id, 'superseded_by', `Circular superseded_by chain at ${id}`); break }
      visited.add(cur.id)
      cur = regulations.find((r: { id: string }) => r.id === cur.superseded_by)
      if (!cur) break
    }
  }

  // Cross-reference integrity
  for (const ref of (law.inspired_by ?? [])) {
    if (!regulations.find((r: { id: string }) => r.id === ref)) {
      warn(id, 'inspired_by', `inspired_by references unknown ID: ${ref}`)
    }
  }
  for (const ref of (law.influenced ?? [])) {
    if (!regulations.find((r: { id: string }) => r.id === ref)) {
      warn(id, 'influenced', `influenced references unknown ID: ${ref}`)
    }
  }

  // Effective date anomalies
  if (law.effective_date) {
    if (law.status === 'in_force' && law.effective_date > today) {
      warn(id, 'effective_date', `Status is in_force but effective_date ${law.effective_date} is in the future`)
    }
    if (law.status === 'enacted_not_yet_effective' && law.effective_date < today) {
      warn(id, 'effective_date', `Status is enacted_not_yet_effective but effective_date ${law.effective_date} is in the past — consider updating to in_force`)
    }
  }

  // Provisions completeness
  const requiredProvisions = [
    'ai_interaction_disclosure', 'training_data_disclosure', 'content_labelling',
    'risk_classification_system', 'impact_assessment_required', 'anti_discrimination',
    'anti_discrimination_standard', 'human_review_right', 'opt_out_right',
    'biometric_protection', 'voice_likeness_protection', 'data_rights_re_training',
    'private_right_of_action', 'safe_harbor', 'prohibited_categories',
    'agentic_ai_addressed', 'algorithmic_pricing_addressed', 'training_data_compensation',
  ]
  for (const key of requiredProvisions) {
    if (!(key in (law.provisions ?? {}))) {
      error(id, `provisions.${key}`, `Missing provision field: ${key}`)
    }
  }
}

// Write results
const output = {
  run_date: today,
  total_laws: regulations.length,
  error_count: errors.filter(e => e.severity === 'error').length,
  warning_count: errors.filter(e => e.severity === 'warning').length,
  errors,
}
writeFileSync(join(ROOT, 'data/validation_errors.json'), JSON.stringify(output, null, 2))

const errs  = errors.filter(e => e.severity === 'error')
const warns = errors.filter(e => e.severity === 'warning')

console.log(`\nValidation complete: ${regulations.length} laws, run date ${today}`)
console.log(`  Errors:   ${errs.length}`)
console.log(`  Warnings: ${warns.length}`)
if (errs.length  > 0) { console.log('\nERRORS:');   errs.forEach(e  => console.log(`  [${e.id}] ${e.field}: ${e.issue}`)) }
if (warns.length > 0) { console.log('\nWARNINGS:'); warns.forEach(e => console.log(`  [${e.id}] ${e.field}: ${e.issue}`)) }

if (errs.length > 0) {
  console.log('\nResults written to data/validation_errors.json')
  process.exit(1)
} else {
  console.log('\nAll checks passed.')
}
