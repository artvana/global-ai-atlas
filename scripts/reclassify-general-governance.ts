/**
 * reclassify-general-governance.ts
 *
 * Re-classifies every rule currently in the "general_governance" category
 * into either "definitions_scope" or "institutional_framework".
 *
 * definitions_scope:    definitions of key terms, territorial/extraterritorial
 *                       scope, who the law applies to, exemptions, carve-outs.
 *
 * institutional_framework: establishing/designating regulatory or supervisory
 *                           bodies, AI offices, sandboxes, advisory committees,
 *                           inter-agency coordination, international cooperation
 *                           between regulators.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/reclassify-general-governance.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const RULES_PATH = path.join(PROJECT_ROOT, 'data', 'rules.json')

interface Rule {
  rule_id: string
  rule_text: string
  rule_text_technical: string
  category: string
  tags: string[]
  first_instance: { law_id: string; law_name: string; citation: string; date: string }
  instances: unknown[]
}

function readJSON<T>(p: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T }
  catch { return fallback }
}

function writeJSON(p: string, data: unknown): void {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const BATCH_SIZE = 40

async function classifyBatch(
  client: Anthropic,
  rules: Rule[]
): Promise<{ rule_id: string; category: 'definitions_scope' | 'institutional_framework' }[]> {
  const list = rules.map((r, i) =>
    `[${i}] rule_id="${r.rule_id}"\n    rule_text="${r.rule_text.slice(0, 200).replace(/"/g, "'")}"`
  ).join('\n\n')

  const prompt = `You are re-classifying AI law rules from an overly broad "general_governance" category into two precise categories.

CATEGORY DEFINITIONS:

"definitions_scope" — Use for rules that:
  - Define key terms (what counts as "AI system", "high-risk AI", "deployer", "developer", etc.)
  - Establish who the law applies to (territorial scope, extraterritorial reach)
  - Create exemptions or carve-outs (SMEs, open-source, R&D, national security exceptions)
  - Set applicability thresholds (e.g. minimum training compute, user count thresholds)

"institutional_framework" — Use for rules that:
  - Establish or designate a regulatory/supervisory body, AI office, or enforcement authority
  - Create advisory committees, expert groups, or inter-agency coordination mechanisms
  - Establish regulatory sandboxes or pilot programs
  - Require international cooperation BETWEEN regulators (not obligations ON companies)
  - Set up appeal or review bodies

RULES TO CLASSIFY (${rules.length}):

${list}

Return a JSON array, one object per rule in the same order:
[
  { "rule_id": "<id>", "category": "definitions_scope" | "institutional_framework" },
  ...
]

Return ONLY valid JSON. No markdown, no commentary.`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const start = text.indexOf('['), end = text.lastIndexOf(']')
      if (start >= 0 && end > start) {
        return JSON.parse(text.slice(start, end + 1))
      }
    } catch (err) {
      console.error(`  Attempt ${attempt + 1} failed: ${err}`)
      if (attempt < 2) await sleep(8000)
    }
  }
  return []
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }

  const client = new Anthropic({ apiKey })
  const rules: Rule[] = readJSON(RULES_PATH, [])

  const toReclassify = rules.filter(r => r.category === 'general_governance')
  console.log(`Found ${toReclassify.length} rules in general_governance to re-classify`)
  console.log(`Processing in batches of ${BATCH_SIZE}...`)
  console.log()

  const reclassified = new Map<string, string>()

  for (let i = 0; i < toReclassify.length; i += BATCH_SIZE) {
    const batch = toReclassify.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(toReclassify.length / BATCH_SIZE)
    console.log(`Batch ${batchNum}/${totalBatches} (rules ${i + 1}–${Math.min(i + BATCH_SIZE, toReclassify.length)})`)

    const results = await classifyBatch(client, batch)

    for (const r of results) {
      reclassified.set(r.rule_id, r.category)
    }

    console.log(`  → ${results.length} classified`)

    if (i + BATCH_SIZE < toReclassify.length) await sleep(1500)
  }

  // Apply classifications
  let defCount = 0, instCount = 0, missCount = 0
  for (const rule of rules) {
    if (rule.category !== 'general_governance') continue
    const newCat = reclassified.get(rule.rule_id)
    if (newCat === 'definitions_scope') { rule.category = 'definitions_scope'; defCount++ }
    else if (newCat === 'institutional_framework') { rule.category = 'institutional_framework'; instCount++ }
    else { missCount++ }
  }

  writeJSON(RULES_PATH, rules)

  console.log()
  console.log(`Done.`)
  console.log(`  → definitions_scope:      ${defCount}`)
  console.log(`  → institutional_framework: ${instCount}`)
  console.log(`  → unclassified (kept as general_governance): ${missCount}`)
  console.log(`rules.json updated.`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
