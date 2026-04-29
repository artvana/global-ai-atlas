/**
 * extract-rules.ts
 *
 * Processes all 164 laws chronologically and builds data/rules.json.
 * For each law it:
 *   1. Extracts every distinct legal rule (using the law's full text if available,
 *      otherwise falls back to summary + key_obligations).
 *   2. Compares extracted rules against rules already in the database.
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

type RuleRelationship = 'origin' | 'agrees' | 'similar' | 'opposed'

interface RuleLawInstance {
  law_id: string
  relationship: RuleRelationship
  citation: string
  notes: string
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
}

interface ExtractedRule {
  citation: string
  rule_text: string
  rule_text_technical: string
  category: string
  tags: string[]
}

interface MatchResult {
  citation: string
  matched_rule_id: string | null
  relationship: 'agrees' | 'similar' | 'opposed' | null
  notes: string
  is_new: boolean
  rule_text?: string
  rule_text_technical?: string
  category?: string
  tags?: string[]
}

// ── helpers ───────────────────────────────────────────────────────────────────

function readJSON<T>(p: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T }
  catch { return fallback }
}

function writeJSON(p: string, data: unknown): void {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function readFullText(law: Law): string | null {
  if (!law.text_path) return null
  const resolved = path.resolve(PROJECT_ROOT, law.text_path)
  if (!resolved.startsWith(PROJECT_ROOT + path.sep)) return null
  try { return fs.readFileSync(resolved, 'utf8') } catch { return null }
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

  return `You are building a global AI-law comparative database. Your task is to extract every distinct legal RULE from the following law.

A RULE is a specific, enforceable legal obligation, prohibition, right, or standard — not a policy goal or aspiration. Examples:
- Obligations ("must obtain written consent before collecting biometric data")
- Prohibitions ("may not use AI for social scoring")
- Rights ("individuals have the right to appeal an AI decision")
- Technical requirements ("AI systems must include human override capability")

Law: ${law.full_name}
Jurisdiction: ${law.jurisdiction}
Enacted: ${law.enacted_date}

${body}

For each rule, output a JSON object:
{
  "citation": "the specific article/section reference, e.g. '§ 15(b)' or 'Art. 5(1)(h)'",
  "rule_text": "plain English, 1-2 sentences, using 'You must...', 'You cannot...', or 'Individuals have the right to...' framing. Assume the reader is a business or policy-maker subject to this law.",
  "rule_text_technical": "precise legal framing preserving all qualifications and conditions",
  "category": "one of: biometric_data | prohibited_uses | impact_assessment | human_review | data_rights | transparency | synthetic_media | enforcement | risk_classification | training_data | foundation_models | consent | employment_ai | general_governance",
  "tags": ["array of 3-6 lowercase snake_case keywords"]
}

Return ONLY a valid JSON array of rule objects. No commentary, no markdown fences. If the law is a pure policy framework with no enforceable rules, return an empty array [].`
}

// ── matching prompt ───────────────────────────────────────────────────────────

function buildMatchingPrompt(law: Law, extracted: ExtractedRule[], existing: Rule[]): string {
  const existingList = existing.map(r =>
    `  { "rule_id": "${r.rule_id}", "rule_text": "${r.rule_text.slice(0, 120).replace(/"/g, "'")}" }`
  ).join('\n')

  const newList = extracted.map((r, i) =>
    `  [${i}] citation="${r.citation}" rule_text="${r.rule_text.slice(0, 120).replace(/"/g, "'")}"`
  ).join('\n')

  return `You are maintaining a cross-jurisdictional AI-law rules database. Below are rules already in the database, followed by rules newly extracted from a new law.

For each newly extracted rule, determine:
1. Does it match an existing rule in the database (same legal concept)?
   - "agrees": substantially the same obligation / prohibition / right (possibly different penalty or scope)
   - "similar": same concept but with meaningful differences in standard, burden, or coverage
   - "opposed": explicitly contradicts or rejects the premise of the existing rule
   - null if no match (it is a genuinely new rule not yet in the database)

2. If it is a new rule, confirm its category.

New law being processed: ${law.full_name} (${law.jurisdiction}, ${law.enacted_date})

EXISTING RULES IN DATABASE (${existing.length} total):
${existingList || '  (none yet)'}

NEWLY EXTRACTED RULES FROM THIS LAW (${extracted.length} total):
${newList}

Return a JSON array with one object per newly extracted rule, in the same order:
[
  {
    "index": 0,
    "matched_rule_id": "<rule_id from existing database, or null if new>",
    "relationship": "agrees" | "similar" | "opposed" | null,
    "notes": "one sentence explaining the match (what differs, why it matches, what makes it distinct)",
    "is_new": true | false,
    "category": "<category — required if is_new is true, optional otherwise>"
  }
]

Return ONLY a valid JSON array. No commentary, no markdown fences.`
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

  // Sort chronologically
  const laws = allLaws
    .filter(l => l.status !== 'superseded' && l.status !== 'failed')
    .sort((a, b) => a.enacted_date.localeCompare(b.enacted_date))

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
          model: 'claude-opus-4-7',
          max_tokens: 4096,
          messages: [{ role: 'user', content: extractionPrompt }],
        })
        const content = msg.content[0]
        return content.type === 'text' ? content.text : ''
      })

      // Parse JSON, tolerating minor formatting issues
      const jsonStart = rawExtraction.indexOf('[')
      const jsonEnd = rawExtraction.lastIndexOf(']')
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        extracted = JSON.parse(rawExtraction.slice(jsonStart, jsonEnd + 1)) as ExtractedRule[]
      }
      console.log(`  Extracted ${extracted.length} rules`)
    } catch (err) {
      console.error(`  Failed to extract rules: ${err}`)
      // Mark as processed so we don't retry in a loop
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

    // Step 2: Match extracted rules against existing database
    let matches: MatchResult[] = []
    try {
      const matchingPrompt = buildMatchingPrompt(law, extracted, rules)
      const rawMatches = await callWithRetry(async () => {
        const msg = await client.messages.create({
          model: 'claude-opus-4-7',
          max_tokens: 4096,
          messages: [{ role: 'user', content: matchingPrompt }],
        })
        const content = msg.content[0]
        return content.type === 'text' ? content.text : ''
      })

      const jsonStart = rawMatches.indexOf('[')
      const jsonEnd = rawMatches.lastIndexOf(']')
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        matches = JSON.parse(rawMatches.slice(jsonStart, jsonEnd + 1)) as MatchResult[]
      }
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
      const match = matches.find(m => m.index === j) ?? matches[j]

      if (!match) continue

      if (!match.is_new && match.matched_rule_id) {
        // Add an instance to an existing rule
        const existing = rules.find(r => r.rule_id === match.matched_rule_id)
        if (existing) {
          // Avoid duplicate instances for the same law
          const alreadyHas = existing.instances.some(inst => inst.law_id === law.id)
          if (!alreadyHas && match.relationship) {
            existing.instances.push({
              law_id: law.id,
              relationship: match.relationship,
              citation: ext.citation,
              notes: match.notes,
            })
            matchedRules++
          }
        }
      } else {
        // New rule — add it with this law as the origin
        const ruleId = makeRuleId(law.id, ext.citation)
        // Avoid duplicate rule IDs
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
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
