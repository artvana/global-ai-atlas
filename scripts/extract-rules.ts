/**
 * extract-rules.ts
 *
 * Processes all laws chronologically and builds data/rules.json.
 * For each law it:
 *   1. Extracts every distinct legal rule (using the law's full text if available,
 *      otherwise falls back to summary + key_obligations).
 *   2. Groups extracted rules by category, then matches each group against only
 *      the existing rules in that same category (category-first matching).
 *      This keeps each matching prompt focused (~50-80 rules) instead of sending
 *      all 1,000+ rules, improving accuracy and reducing token cost.
 *   3. Adds each rule as a new row (if genuinely new) or appends an instance
 *      (agrees / similar / opposed) to the matching existing rule.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/extract-rules.ts
 *
 * The script is resumable: it writes progress to data/rules-progress.json and
 * skips laws already processed. Delete that file to start over.
 *
 * Output: data/rules.json (overwrites existing with enriched version)
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')

// ── paths ─────────────────────────────────────────────────────────────────────

const REGULATIONS_PATH = path.join(PROJECT_ROOT, 'data', 'regulations.json')
const RULES_PATH       = path.join(PROJECT_ROOT, 'data', 'rules.json')
const PROGRESS_PATH    = path.join(PROJECT_ROOT, 'data', 'rules-progress.json')
const TEXTS_DIR        = path.join(PROJECT_ROOT, 'data', 'texts')

// ── types ─────────────────────────────────────────────────────────────────────

type RuleRelationship = 'origin' | 'identical' | 'agrees' | 'similar' | 'opposed'

interface RuleLawInstance {
  law_id: string
  relationship: RuleRelationship
  citation: string
  notes: string
  variant_of?: string
  instrument_binding?: boolean
  instrument_type?: string
}

interface Rule {
  rule_id: string
  rule_text: string
  rule_text_technical: string
  category: string
  tags: string[]
  first_instance: {
    law_id: string
    law_name: string
    citation: string
    date: string
  }
  instances: RuleLawInstance[]
}

interface Law {
  id: string
  short_name: string
  full_name: string
  jurisdiction: string
  enacted_date: string
  summary: string
  key_obligations?: string[]
  text_path?: string
  status?: string
  instrument_binding?: boolean
  instrument_type?: string
}

interface ExtractedRule {
  citation: string
  rule_text: string
  rule_text_technical: string
  category: string
  tags: string[]
}

interface MatchResult {
  index: number           // position in the category-local extracted list
  matched_rule_id: string | null
  relationship: 'identical' | 'agrees' | 'similar' | 'opposed' | null
  variant_of?: string
  notes: string
  is_new: boolean
  category?: string
}

// ── helpers ───────────────────────────────────────────────────────────────────

function readJSON<T>(p: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T }
  catch { return fallback }
}

function writeJSON(p: string, data: unknown): void {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const MIN_TEXT_LENGTH = 1000 // files below this are treated as placeholder/error pages

function readFullText(law: Law): string | null {
  if (!law.text_path) return null
  const resolved = path.resolve(PROJECT_ROOT, law.text_path)
  if (!resolved.startsWith(PROJECT_ROOT + path.sep)) return null
  try {
    const text = fs.readFileSync(resolved, 'utf8')
    if (text.length < MIN_TEXT_LENGTH) return null
    if (text.includes('Text not yet available') || text.includes('Text pending')) return null
    return text
  } catch { return null }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
}

function makeRuleId(lawId: string, citation: string): string {
  return `${lawId}-${slugify(citation)}`
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callWithRetry(
  fn: () => Promise<string>,
  retries = 3,
  delayMs = 10000
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isLast = attempt === retries - 1
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  API error (attempt ${attempt + 1}/${retries}): ${msg}`)
      if (isLast) throw err
      console.error(`  Retrying in ${delayMs / 1000}s...`)
      await sleep(delayMs)
    }
  }
  throw new Error('unreachable')
}

// ── extraction prompt ─────────────────────────────────────────────────────────

function buildExtractionPrompt(law: Law, text: string | null): string {
  const body = text
    ? `FULL LEGAL TEXT (first 12000 chars):\n${text.slice(0, 12000)}`
    : `SUMMARY: ${law.summary}\n\nKEY OBLIGATIONS:\n${(law.key_obligations ?? []).join('\n')}`

  const instrumentContext = law.instrument_binding === false
    ? `INSTRUMENT TYPE: ${law.instrument_type ?? 'policy_framework'} — this is VOLUNTARY / SOFT LAW. Rules from this instrument are recommendations or best practices, not legally enforceable mandates. Still extract each distinct normative standard as a rule, but note in rule_text that it is a recommendation (e.g. "Organizations should...", "It is recommended that...").`
    : `INSTRUMENT TYPE: ${law.instrument_type ?? 'statute'} — this is a BINDING LEGAL INSTRUMENT. Extract enforceable obligations, prohibitions, and rights.`

  return `You are building a global AI-law comparative database. Your task is to extract every distinct RULE from the following law.

${instrumentContext}

A RULE is a specific normative standard — an obligation, prohibition, right, or recommended practice. Examples:
- Binding obligations ("You must obtain written consent before collecting biometric data")
- Binding prohibitions ("AI may not be used for social scoring")
- Rights ("Individuals have the right to appeal an AI decision")
- Voluntary recommendations ("Organizations should conduct a risk assessment before deployment")

Law: ${law.full_name}
Jurisdiction: ${law.jurisdiction}
Enacted: ${law.enacted_date}

${body}

For each rule, output a JSON object:
{
  "citation": "the specific article/section reference, e.g. '§ 15(b)' or 'Art. 5(1)(h)'",
  "rule_text": "plain English, 1-2 sentences, using 'You must...', 'You cannot...', or 'Individuals have the right to...' framing. Assume the reader is a business or policy-maker subject to this law.",
  "rule_text_technical": "precise legal framing preserving all qualifications and conditions",
  "category": "one of: biometric_data | prohibited_applications | conformity_assessment | human_oversight | data_subject_rights | disclosure | enforcement_penalties | risk_classification | training_data_quality | foundation_models | consent | employment_ai | synthetic_media | accountability_governance | data_provenance | private_redress | registration_notification | explainability | technical_documentation | institutional_framework | definitions_scope",
  "tags": ["array of 3-6 lowercase snake_case keywords"]
}

Category guidance for the two structural categories:
- Use "definitions_scope" for: definitions of key terms (AI system, high-risk AI, deployer, etc.), territorial/extraterritorial scope rules, who the law applies to, exemptions and carve-outs (SMEs, open-source, R&D, national security).
- Use "institutional_framework" for: establishing or designating regulatory/supervisory bodies, AI offices, sandboxes, advisory committees, inter-agency coordination, international cooperation between regulators.
- Do NOT use these for substantive obligations — a requirement that a regulator must conduct audits is "conformity_assessment", not "institutional_framework".

Return ONLY a valid JSON array of rule objects. No commentary, no markdown fences. If the law is a pure policy framework with no enforceable rules, return an empty array [].`
}

// ── category-first matching prompt ────────────────────────────────────────────
// Called once per category group — only passes existing rules in that category.

function buildCategoryMatchingPrompt(
  law: Law,
  categoryRules: ExtractedRule[],
  existingInCategory: Rule[],
  categoryLabel: string
): string {
  const existingList = existingInCategory.map(r =>
    `  { "rule_id": "${r.rule_id}", "first_law": "${r.first_instance.law_id}", "rule_text": "${r.rule_text.slice(0, 150).replace(/"/g, "'")}" }`
  ).join('\n')

  const newList = categoryRules.map((r, i) =>
    `  [${i}] citation="${r.citation}" rule_text="${r.rule_text.slice(0, 150).replace(/"/g, "'")}"`
  ).join('\n')

  const instrumentNote = law.instrument_binding === false
    ? `NOTE: This is a SOFT LAW / VOLUNTARY instrument (${law.instrument_type}). Its rules are recommendations, not binding mandates. When matching to existing rules from binding laws, use "similar" rather than "agrees" unless the voluntary standard is substantively identical in scope and content.`
    : `NOTE: This is a BINDING LEGAL INSTRUMENT (${law.instrument_type ?? 'statute'}).`

  return `You are maintaining a cross-jurisdictional AI-law rules database. All rules below belong to the category: "${categoryLabel}".

For each newly extracted rule, determine whether it matches an existing rule in this category and what the relationship is.

RELATIONSHIP TYPES (use the most precise one):
- "identical": near-verbatim copy or copy-paste adoption — the new law's text is functionally the same as an existing rule. Use when the law clearly borrowed directly from another.
- "agrees": independently adopted the same substantive requirement, but drafted it differently (different phrasing, structure, or minor scope variation).
- "similar": same underlying concept but with meaningful differences in standard, threshold, coverage, or burden. Use when comparing binding vs. voluntary instruments where scope or obligation level differs significantly.
- "opposed": explicitly contradicts or rejects the premise of the existing rule.
- null: genuinely new rule not yet in the database.

For "identical" relationships, also return variant_of: the first_law value from the existing rule whose text this one most closely copies.

${instrumentNote}

New law: ${law.full_name} (${law.jurisdiction}, ${law.enacted_date})

EXISTING RULES IN CATEGORY "${categoryLabel}" (${existingInCategory.length}):
${existingList || '  (none yet — all rules in this category will be new)'}

NEW RULES FROM THIS LAW IN THIS CATEGORY (${categoryRules.length}):
${newList}

Return a JSON array, one object per new rule, in the same order:
[
  {
    "index": 0,
    "matched_rule_id": "<existing rule_id or null>",
    "relationship": "identical" | "agrees" | "similar" | "opposed" | null,
    "variant_of": "<first_law id, only when relationship is identical>",
    "notes": "one sentence on what matches, what differs, or what is new",
    "is_new": true | false
  }
]

Return ONLY valid JSON. No markdown, no commentary.`
}

// ── category-first matching ───────────────────────────────────────────────────

async function matchByCategoryFirst(
  client: Anthropic,
  law: Law,
  extracted: ExtractedRule[],
  rulesByCategory: Map<string, Rule[]>
): Promise<MatchResult[]> {
  // Group extracted rules by their category (assigned during extraction)
  const grouped = new Map<string, { globalIdx: number; rule: ExtractedRule }[]>()
  for (let i = 0; i < extracted.length; i++) {
    const cat = extracted[i].category
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push({ globalIdx: i, rule: extracted[i] })
  }

  const categories = [...grouped.keys()]
  console.log(`  Matching across ${categories.length} categories: ${categories.join(', ')}`)

  // Run all category matching calls in parallel
  const categoryResults = await Promise.all(
    categories.map(async cat => {
      const group = grouped.get(cat)!
      const existingInCat = rulesByCategory.get(cat) ?? []
      const categoryLabel = cat

      const prompt = buildCategoryMatchingPrompt(
        law,
        group.map(g => g.rule),
        existingInCat,
        categoryLabel
      )

      const rawMatches = await callWithRetry(async () => {
        const msg = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          messages: [{ role: 'user', content: prompt }],
        })
        const content = msg.content[0]
        return content.type === 'text' ? content.text : ''
      })

      const jsonStart = rawMatches.indexOf('[')
      const jsonEnd = rawMatches.lastIndexOf(']')
      if (jsonStart < 0 || jsonEnd <= jsonStart) return []

      const catMatches = JSON.parse(rawMatches.slice(jsonStart, jsonEnd + 1)) as Array<{
        index: number
        matched_rule_id: string | null
        relationship: MatchResult['relationship']
        variant_of?: string
        notes: string
        is_new: boolean
      }>

      // Remap category-local indices to global indices
      return catMatches.map(m => ({
        ...m,
        index: group[m.index]?.globalIdx ?? m.index,
        category: cat,
      })) as MatchResult[]
    })
  )

  return categoryResults.flat()
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set.')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })

  // Load data
  const rawRegs = readJSON<Law[] | { regulations: Law[] }>(REGULATIONS_PATH, [])
  const allLaws: Law[] = Array.isArray(rawRegs) ? rawRegs : rawRegs.regulations

  // Sort chronologically; laws with no enacted_date sort to the end
  const laws = allLaws
    .filter(l => l.status !== 'superseded' && l.status !== 'failed')
    .sort((a, b) => (a.enacted_date ?? '9999').localeCompare(b.enacted_date ?? '9999'))

  // Load existing rules
  let rules: Rule[] = readJSON<Rule[]>(RULES_PATH, [])
  console.log(`Loaded ${rules.length} existing rules from rules.json`)

  // Load progress (set of already-processed law IDs)
  const progress = readJSON<{ processed: string[] }>(PROGRESS_PATH, { processed: [] })
  const processed = new Set(progress.processed)
  console.log(`Already processed: ${processed.size} laws`)

  const toProcess = laws.filter(l => !processed.has(l.id))
  console.log(`Laws to process: ${toProcess.length} (of ${laws.length} total)`)
  console.log()

  for (let i = 0; i < toProcess.length; i++) {
    const law = toProcess[i]
    console.log(`[${i + 1}/${toProcess.length}] ${law.id} — ${law.short_name}`)

    const fullText = readFullText(law)
    console.log(`  Full text: ${fullText ? `${fullText.length} chars` : 'not available, using summary'}`)

    // Step 1: Extract rules from this law
    let extracted: ExtractedRule[] = []
    try {
      const extractionPrompt = buildExtractionPrompt(law, fullText)
      const rawExtraction = await callWithRetry(async () => {
        const msg = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 16000,
          messages: [{ role: 'user', content: extractionPrompt }],
        })
        const content = msg.content[0]
        return content.type === 'text' ? content.text : ''
      })

      const jsonStart = rawExtraction.indexOf('[')
      const jsonEnd = rawExtraction.lastIndexOf(']')
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        extracted = JSON.parse(rawExtraction.slice(jsonStart, jsonEnd + 1)) as ExtractedRule[]
      }
      console.log(`  Extracted ${extracted.length} rules`)
    } catch (err) {
      console.error(`  Failed to extract rules: ${err}`)
      processed.add(law.id)
      writeJSON(PROGRESS_PATH, { processed: [...processed] })
      continue
    }

    if (extracted.length === 0) {
      console.log('  No rules extracted — marking as processed.')
      processed.add(law.id)
      writeJSON(PROGRESS_PATH, { processed: [...processed] })
      continue
    }

    // Step 2: Category-first matching — build per-category index, then match in parallel
    const rulesByCategory = new Map<string, Rule[]>()
    for (const rule of rules) {
      if (!rulesByCategory.has(rule.category)) rulesByCategory.set(rule.category, [])
      rulesByCategory.get(rule.category)!.push(rule)
    }

    let matches: MatchResult[] = []
    try {
      matches = await matchByCategoryFirst(client, law, extracted, rulesByCategory)
    } catch (err) {
      console.error(`  Failed to match rules: ${err}`)
      processed.add(law.id)
      writeJSON(PROGRESS_PATH, { processed: [...processed] })
      continue
    }

    // Step 3: Apply matches — update existing rules or add new ones
    let newRules = 0
    let matchedRules = 0

    for (let j = 0; j < extracted.length; j++) {
      const ext = extracted[j]
      const match = matches.find(m => m.index === j)

      if (!match) continue

      const instBase = {
        instrument_binding: law.instrument_binding ?? true,
        instrument_type: law.instrument_type,
      }

      if (!match.is_new && match.matched_rule_id) {
        // Add an instance to an existing rule
        const existing = rules.find(r => r.rule_id === match.matched_rule_id)
        if (existing) {
          const alreadyHas = existing.instances.some(inst => inst.law_id === law.id)
          if (!alreadyHas && match.relationship) {
            const inst: RuleLawInstance = {
              law_id: law.id,
              relationship: match.relationship,
              citation: ext.citation,
              notes: match.notes,
              ...instBase,
            }
            if (match.relationship === 'identical' && match.variant_of) {
              inst.variant_of = match.variant_of
            }
            existing.instances.push(inst)
            matchedRules++
          }
        }
      } else {
        // New rule — add it with this law as the origin
        const ruleId = makeRuleId(law.id, ext.citation)
        if (rules.some(r => r.rule_id === ruleId)) continue

        const newRule: Rule = {
          rule_id: ruleId,
          rule_text: ext.rule_text,
          rule_text_technical: ext.rule_text_technical,
          category: match.category ?? ext.category ?? 'general_governance',
          tags: ext.tags ?? [],
          first_instance: {
            law_id: law.id,
            law_name: law.full_name,
            citation: ext.citation,
            date: law.enacted_date,
          },
          instances: [
            {
              law_id: law.id,
              relationship: 'origin',
              citation: ext.citation,
              notes: `Rule introduced in ${law.short_name} (${law.jurisdiction}, ${law.enacted_date}).`,
              ...instBase,
            },
          ],
        }
        rules.push(newRule)
        newRules++
      }
    }

    console.log(`  +${newRules} new rules, ${matchedRules} instances added to existing rules`)

    // Save progress after each law
    processed.add(law.id)
    writeJSON(RULES_PATH, rules)
    writeJSON(PROGRESS_PATH, { processed: [...processed] })

    // Rate limit: pause between laws to avoid hitting API limits
    if (i < toProcess.length - 1) {
      await sleep(2000)
    }
  }

  console.log()
  console.log(`Done. rules.json now contains ${rules.length} rules across ${processed.size} processed laws.`)
  console.log('Run "npm run embed-rules" to generate/refresh embeddings separately.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
