/**
 * extract-large.ts
 *
 * Supplements extract-rules.ts for documents that exceed MAX_TEXT_CHARS.
 * For each law in CRITICAL_IDS it:
 *   1. Removes existing rules/instances for that law from rules.json
 *   2. Splits the full text into overlapping 180k-char chunks
 *   3. Extracts rules from each chunk independently
 *   4. Deduplicates extracted rules across chunks (by citation)
 *   5. Runs category-first matching and merges results back into rules.json
 *
 * Run AFTER extract-rules.ts has finished:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/extract-large.ts
 *
 * Resumable: progress is tracked in data/rules-large-progress.json.
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')

// ── paths ─────────────────────────────────────────────────────────────────────

const REGULATIONS_PATH   = path.join(PROJECT_ROOT, 'data', 'regulations.json')
const RULES_PATH         = path.join(PROJECT_ROOT, 'data', 'rules.json')
const PROGRESS_PATH      = path.join(PROJECT_ROOT, 'data', 'rules-large-progress.json')

// ── config ────────────────────────────────────────────────────────────────────

const EXTRACTION_MODEL = process.env.EXTRACTION_MODEL ?? 'claude-opus-4-7'
const MATCHING_MODEL   = process.env.MATCHING_MODEL   ?? 'claude-sonnet-4-6'

const CHUNK_SIZE    = 180_000   // chars per chunk
const CHUNK_OVERLAP = 20_000    // overlap between consecutive chunks

// Laws to process — all texts that exceed 190k chars and are dedicated AI/data laws
const CRITICAL_IDS = [
  'eu-eu-aiact-2024',
  'eu-eu-gdpr-2016',
  'us-fed-nai-act-2020',
  'eu-eu-cra-2024',
  'za-za-popia-2013',
  'nz-nz-privacyact-2020',
  'us-ny-a3008-2025',
  'de-de-kimig-2026',
  'no-no-kiloven-2026',
  'us-mn-hb2432-2025',
  'us-md-s283-2026',
  'us-md-s427-2025',
  'us-md-h498-2025',
  'us-mn-s3870-2026',
  'us-mn-s4365-2026',
  'us-mn-s4612-2026',
  'us-mn-s1417-2025',
  'us-mo-s1233-2026',
  'us-mo-h3068-2026',
  'us-mo-s60-2025',
  'us-mo-s66-2025',
  'us-oh-h455-2026',
  'us-oh-h455-2025',
  'us-ut-s38-2026',
  'us-ut-h289-2026',
  'us-ut-h368-2025',
  'co-co-conpes4144-2025',
  'my-my-aigeguidelines-2024',
  'mu-mu-naistrategy-2026',
  'us-fed-avmrule-2024',
  'us-fed-sec1557ai-2024',
  'us-fed-nistai1004-2024',
  'us-fed-nistai1002-2025',
]

// ── types (mirrors extract-rules.ts) ─────────────────────────────────────────

type RuleRelationship = 'origin' | 'identical' | 'agrees' | 'similar' | 'opposed' | 'rejected'

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
  first_instance: { law_id: string; law_name: string; citation: string; date: string }
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
  index: number
  matched_rule_id: string | null
  relationship: 'identical' | 'agrees' | 'similar' | 'opposed' | 'rejected' | null
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

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

async function callWithRetry(fn: () => Promise<string>, retries = 3, delayMs = 10000): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try { return await fn() }
    catch (err: unknown) {
      const isLast = attempt === retries - 1
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  API error (attempt ${attempt + 1}/${retries}): ${msg}`)
      if (isLast) throw err
      await sleep(delayMs)
    }
  }
  throw new Error('unreachable')
}

function stripMarkup(raw: string): string {
  let t = raw
  if (t.startsWith('---')) {
    const fmEnd = t.indexOf('\n---\n', 4)
    if (fmEnd >= 0) t = t.slice(fmEnd + 5)
  }
  t = t
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&sect;/g, '§')
    .replace(/&para;/g, '¶').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => {
      const n = parseInt(code, 10)
      return n > 31 && n < 127 ? String.fromCharCode(n) : ' '
    })
  t = t.replace(/\s*red struck out text denotes deleted text[^\n]*/gi, '')
  t = t.replace(/^\s*\d{4} [A-Z]{2} [A-Z]+ \d+\s+Author:.*?Version Date:[^\n]*\n?/gm, '')
  t = t.replace(/\n{3,}/g, '\n\n')
  return t.trim()
}

/** Split text into overlapping chunks. */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  if (text.length <= chunkSize) return [text]
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    if (end === text.length) break
    start = end - overlap
  }
  return chunks
}

/** Normalise a citation string for deduplication comparison. */
function normCitation(c: string): string {
  return c.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9()]/g, '')
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
}

function makeRuleId(lawId: string, citation: string): string {
  return `${lawId}-${slugify(citation)}`
}

// ── prompts (identical to extract-rules.ts) ───────────────────────────────────

function buildExtractionPrompt(law: Law, chunkText: string, chunkNum: number, totalChunks: number, isRejected = false): string {
  const instrumentContext = law.instrument_binding === false
    ? `INSTRUMENT TYPE: ${law.instrument_type ?? 'policy_framework'} — VOLUNTARY / SOFT LAW.`
    : `INSTRUMENT TYPE: ${law.instrument_type ?? 'statute'} — BINDING LEGAL INSTRUMENT.`

  const rejectedNote = isRejected
    ? `\nIMPORTANT — REJECTED/FAILED BILL: Extract rules as written; they will be recorded as "rejected" premises.`
    : ''

  const chunkNote = totalChunks > 1
    ? `\nDOCUMENT CHUNK ${chunkNum} of ${totalChunks} (${chunkText.length.toLocaleString()} chars). Extract only rules that appear in THIS chunk. Ignore anything that appears to be cut off mid-sentence at the end.`
    : ''

  return `You are building a global AI-law comparative database. Extract every distinct RULE from the following law or bill.

${instrumentContext}${rejectedNote}${chunkNote}

SCOPE FILTER — MANDATORY: Only extract rules about AI systems, algorithms, automated decision-making, personal data, biometric data, or data governance. Ignore unrelated provisions.

A RULE is a specific normative standard — an obligation, prohibition, right, or recommendation.

MECE EXTRACTION RULES:
1. ONE obligation per rule.
2. Do not split a single obligation into multiple rules.
3. Each rule must be independently meaningful.
4. Aim for the level of a single enforceable obligation.
5. No duplicates within the same law.

Law: ${law.full_name}
Jurisdiction: ${law.jurisdiction}
Enacted/Proposed: ${law.enacted_date ?? 'unknown'}

FULL LEGAL TEXT (chunk ${chunkNum}/${totalChunks}):
${chunkText}

For each rule, output:
{
  "citation": "article/section reference",
  "rule_text": "plain English, 1-2 sentences, 'You must...' framing",
  "rule_text_technical": "precise legal framing",
  "category": "one of: biometric_data | prohibited_applications | conformity_assessment | human_oversight | data_subject_rights | disclosure | enforcement_penalties | risk_classification | training_data_quality | foundation_models | consent | employment_ai | synthetic_media | accountability_governance | data_provenance | private_redress | registration_notification | explainability | technical_documentation | institutional_framework | definitions_scope",
  "tags": ["3-6 lowercase snake_case keywords"]
}

Return ONLY a valid JSON array. If no AI/data rules in this chunk, return [].`
}

function buildMatchingPrompt(law: Law, categoryRules: ExtractedRule[], existingInCategory: Rule[], categoryLabel: string): string {
  const existingList = existingInCategory.map(r =>
    `  { "rule_id": "${r.rule_id}", "first_law": "${r.first_instance.law_id}", "rule_text": "${r.rule_text.slice(0, 150).replace(/"/g, "'")}" }`
  ).join('\n')

  const newList = categoryRules.map((r, i) =>
    `  [${i}] citation="${r.citation}" rule_text="${r.rule_text.slice(0, 150).replace(/"/g, "'")}"`
  ).join('\n')

  const isRejected = law.status === 'failed' || law.status === 'vetoed'
  const instrumentNote = isRejected
    ? `NOTE: REJECTED/FAILED BILL. Use relationship "rejected" for every rule.`
    : law.instrument_binding === false
      ? `NOTE: SOFT LAW / VOLUNTARY instrument.`
      : `NOTE: BINDING LEGAL INSTRUMENT.`

  return `You are maintaining a cross-jurisdictional AI-law rules database. Category: "${categoryLabel}".

RELATIONSHIP TYPES:
- "identical": near-verbatim copy from another law
- "agrees": same requirement, different phrasing
- "similar": same concept, meaningful differences in standard or scope
- "opposed": contradicts an existing rule
- "rejected": from a failed/vetoed bill
- null: genuinely new rule

${instrumentNote}

New law: ${law.full_name} (${law.jurisdiction}, ${law.enacted_date ?? 'unknown'})

EXISTING RULES IN CATEGORY "${categoryLabel}" (${existingInCategory.length}):
${existingList || '  (none yet)'}

NEW RULES FROM THIS LAW (${categoryRules.length}):
${newList}

Return JSON array, one object per new rule:
[{ "index": 0, "matched_rule_id": "<id or null>", "relationship": "...", "variant_of": "<first_law if identical>", "notes": "one sentence", "is_new": true|false }]

Return ONLY valid JSON.`
}

// ── purge existing data for a law ─────────────────────────────────────────────

function purgeLawFromRules(rules: Rule[], lawId: string): Rule[] {
  // Remove rules whose sole instance is this law
  const purged = rules.filter(r => {
    const onlyThisLaw = r.instances.every(i => i.law_id === lawId)
    return !onlyThisLaw
  })
  // Remove instances of this law from rules that have other instances too
  for (const rule of purged) {
    rule.instances = rule.instances.filter(i => i.law_id !== lawId)
    // If first_instance was from this law, update it to the next earliest instance
    if (rule.first_instance.law_id === lawId && rule.instances.length > 0) {
      const first = rule.instances[0]
      rule.first_instance = {
        law_id: first.law_id,
        law_name: first.law_id,
        citation: first.citation,
        date: '',
      }
    }
  }
  // Remove rules that now have no instances
  return purged.filter(r => r.instances.length > 0)
}

// ── matching ──────────────────────────────────────────────────────────────────

async function matchByCategoryFirst(
  client: Anthropic,
  law: Law,
  extracted: ExtractedRule[],
  rulesByCategory: Map<string, Rule[]>
): Promise<MatchResult[]> {
  const grouped = new Map<string, { globalIdx: number; rule: ExtractedRule }[]>()
  for (let i = 0; i < extracted.length; i++) {
    const cat = extracted[i].category
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push({ globalIdx: i, rule: extracted[i] })
  }

  const categories = [...grouped.keys()]
  console.log(`  Matching across ${categories.length} categories: ${categories.join(', ')}`)

  const categoryResults = await Promise.all(
    categories.map(async cat => {
      const group = grouped.get(cat)!
      const existingInCat = rulesByCategory.get(cat) ?? []
      const prompt = buildMatchingPrompt(law, group.map(g => g.rule), existingInCat, cat)

      const rawMatches = await callWithRetry(async () => {
        const msg = await client.messages.create({
          model: MATCHING_MODEL,
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
        index: number; matched_rule_id: string | null; relationship: MatchResult['relationship']
        variant_of?: string; notes: string; is_new: boolean
      }>

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
  if (!apiKey) { console.error('ANTHROPIC_API_KEY not set.'); process.exit(1) }

  const client = new Anthropic({ apiKey })

  const allLaws: Law[] = JSON.parse(fs.readFileSync(REGULATIONS_PATH, 'utf8'))
  const lawMap = new Map(allLaws.map(l => [l.id, l]))

  let rules: Rule[] = readJSON<Rule[]>(RULES_PATH, [])
  const progress = readJSON<{ processed: string[] }>(PROGRESS_PATH, { processed: [] })
  const processed = new Set(progress.processed)

  const toProcess = CRITICAL_IDS.filter(id => !processed.has(id))
  console.log(`Large-text laws to process: ${toProcess.length} of ${CRITICAL_IDS.length}`)
  console.log(`Extraction: ${EXTRACTION_MODEL} | Matching: ${MATCHING_MODEL}`)
  console.log(`Chunk size: ${CHUNK_SIZE.toLocaleString()} chars, overlap: ${CHUNK_OVERLAP.toLocaleString()} chars\n`)

  for (let i = 0; i < toProcess.length; i++) {
    const lawId = toProcess[i]
    const law = lawMap.get(lawId)
    if (!law) { console.log(`[${i+1}/${toProcess.length}] ${lawId} — NOT FOUND in regulations.json`); continue }

    console.log(`[${i+1}/${toProcess.length}] ${lawId} — ${law.short_name ?? law.full_name}`)

    // Load and clean text
    if (!law.text_path || !fs.existsSync(law.text_path)) {
      console.log(`  No text file — skipping`)
      processed.add(lawId)
      writeJSON(PROGRESS_PATH, { processed: [...processed] })
      continue
    }

    const raw = fs.readFileSync(law.text_path, 'utf8')
    const text = stripMarkup(raw)
    const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP)
    console.log(`  Text: ${text.length.toLocaleString()} chars → ${chunks.length} chunks`)

    // Step 1: Purge existing data for this law so we start fresh
    const rulesBefore = rules.length
    rules = purgeLawFromRules(rules, lawId)
    console.log(`  Purged ${rulesBefore - rules.length} stale rules/instances for ${lawId}`)

    // Step 2: Extract rules from each chunk
    const isRejected = law.status === 'failed' || law.status === 'vetoed'
    const allExtracted: ExtractedRule[] = []

    for (let c = 0; c < chunks.length; c++) {
      console.log(`  Chunk ${c + 1}/${chunks.length} (${chunks[c].length.toLocaleString()} chars)...`)
      try {
        const prompt = buildExtractionPrompt(law, chunks[c], c + 1, chunks.length, isRejected)
        const raw = await callWithRetry(async () => {
          const msg = await client.messages.create({
            model: EXTRACTION_MODEL,
            max_tokens: 16000,
            messages: [{ role: 'user', content: prompt }],
          })
          const content = msg.content[0]
          return content.type === 'text' ? content.text : ''
        })
        const jsonStart = raw.indexOf('[')
        const jsonEnd = raw.lastIndexOf(']')
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const chunk_rules = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as ExtractedRule[]
          console.log(`    → ${chunk_rules.length} rules extracted`)
          allExtracted.push(...chunk_rules)
        }
      } catch (err) {
        console.error(`  Chunk ${c + 1} extraction failed: ${err}`)
      }
      if (c < chunks.length - 1) await sleep(1500)
    }

    // Step 3: Deduplicate across chunks by citation
    const seen = new Map<string, ExtractedRule>()
    for (const rule of allExtracted) {
      const key = normCitation(rule.citation)
      if (!seen.has(key)) {
        seen.set(key, rule)
      }
      // If same citation seen again (from overlap), keep the one with longer rule_text
      else if (rule.rule_text.length > seen.get(key)!.rule_text.length) {
        seen.set(key, rule)
      }
    }
    const deduped = [...seen.values()]
    console.log(`  ${allExtracted.length} raw → ${deduped.length} after cross-chunk deduplication`)

    if (deduped.length === 0) {
      console.log('  No rules extracted — marking as processed.')
      processed.add(lawId)
      writeJSON(PROGRESS_PATH, { processed: [...processed] })
      continue
    }

    // Step 4: Category-first matching
    const rulesByCategory = new Map<string, Rule[]>()
    for (const rule of rules) {
      if (!rulesByCategory.has(rule.category)) rulesByCategory.set(rule.category, [])
      rulesByCategory.get(rule.category)!.push(rule)
    }

    let matches: MatchResult[] = []
    try {
      matches = await matchByCategoryFirst(client, law, deduped, rulesByCategory)
    } catch (err) {
      console.error(`  Matching failed: ${err}`)
      processed.add(lawId)
      writeJSON(PROGRESS_PATH, { processed: [...processed] })
      continue
    }

    // Step 5: Apply matches
    let newRules = 0, matchedRules = 0
    for (let j = 0; j < deduped.length; j++) {
      const ext = deduped[j]
      const match = matches.find(m => m.index === j)
      if (!match) continue

      const instBase = { instrument_binding: law.instrument_binding ?? true, instrument_type: law.instrument_type }

      if (!match.is_new && match.matched_rule_id) {
        const existing = rules.find(r => r.rule_id === match.matched_rule_id)
        if (existing) {
          const alreadyHas = existing.instances.some(inst => inst.law_id === lawId)
          const rel = isRejected ? 'rejected' : match.relationship
          if (!alreadyHas && rel) {
            const inst: RuleLawInstance = {
              law_id: lawId, relationship: rel, citation: ext.citation,
              notes: isRejected
                ? `${law.short_name} (${law.jurisdiction}) proposed this but was ${law.status}.`
                : match.notes,
              ...instBase,
            }
            if (match.relationship === 'identical' && match.variant_of && !isRejected) inst.variant_of = match.variant_of
            existing.instances.push(inst)
            matchedRules++
          }
        }
      } else {
        const ruleId = makeRuleId(lawId, ext.citation)
        if (rules.some(r => r.rule_id === ruleId)) continue
        rules.push({
          rule_id: ruleId,
          rule_text: ext.rule_text,
          rule_text_technical: ext.rule_text_technical,
          category: match.category ?? ext.category,
          tags: ext.tags ?? [],
          first_instance: { law_id: lawId, law_name: law.full_name, citation: ext.citation, date: law.enacted_date ?? '' },
          instances: [{
            law_id: lawId,
            relationship: isRejected ? 'rejected' : 'origin',
            citation: ext.citation,
            notes: isRejected
              ? `Proposed in ${law.short_name} (${law.jurisdiction}) but ${law.status}.`
              : `Rule introduced in ${law.short_name} (${law.jurisdiction}, ${law.enacted_date}).`,
            ...instBase,
          }],
        })
        newRules++
      }
    }

    console.log(`  +${newRules} new rules, ${matchedRules} instances added`)
    processed.add(lawId)
    writeJSON(RULES_PATH, rules)
    writeJSON(PROGRESS_PATH, { processed: [...processed] })
    await sleep(2000)
  }

  console.log(`\nDone. rules.json now contains ${rules.length} rules.`)
  console.log('Run "npx tsx scripts/embed-rules.ts" to regenerate embeddings.')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
