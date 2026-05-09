/**
 * Merges rules that express the same AI policy principle across jurisdictions.
 * Run AFTER fix-proper-nouns.ts — proper noun removal makes duplicates textually apparent.
 *
 * Algorithm:
 *   1. Within each category, compute Jaccard word-overlap for all pairs
 *   2. Pairs >= 0.45 similarity → ask Haiku "same principle? YES/NO"
 *   3. Confirmed pairs: merge the smaller rule's instances into the larger one, delete the smaller
 *
 * ~479 candidate pairs, ~$0.15 with claude-haiku-4-5.
 * Run: npx tsx scripts/dedup-rules.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const JACCARD_THRESHOLD = 0.45

const STOP = new Set([
  'the','a','an','and','or','of','to','in','for','with','by','on','at','that','this',
  'is','are','must','shall','may','you','your','its','their','as','be','been','have',
  'has','had','if','not','any','all','from','it','under','such','each','when','where',
  'whether','no','without','other','than','which','who','what','upon','within','after',
  'before','about','into','through','including','provide','ensure','require','use',
])

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w))
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a), sb = new Set(b)
  let inter = 0
  sa.forEach(w => { if (sb.has(w)) inter++ })
  return inter / (sa.size + sb.size - inter)
}

async function isSamePrinciple(textA: string, textB: string): Promise<boolean> {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    messages: [{
      role: 'user',
      content: `Do these two AI regulation rules express the same policy principle, such that a jurisdiction complying with one would effectively comply with the other?

Rule A: ${textA}
Rule B: ${textB}

Answer with only YES or NO.`,
    }],
  })
  const answer = (resp.content[0] as { text: string }).text.trim().toUpperCase()
  return answer.startsWith('YES')
}

function mergeRules(keep: any, drop: any): void {
  const existingLawIds = new Set(keep.instances.map((i: any) => i.law_id))
  for (const inst of drop.instances) {
    if (!existingLawIds.has(inst.law_id)) {
      keep.instances.push(inst)
      existingLawIds.add(inst.law_id)
    }
  }
  // Update first_instance to the earlier of the two
  const keepDate = new Date(keep.first_instance?.date ?? '9999')
  const dropDate = new Date(drop.first_instance?.date ?? '9999')
  if (dropDate < keepDate) {
    keep.first_instance = drop.first_instance
  }
}

async function main() {
  const rules: any[] = JSON.parse(fs.readFileSync('data/rules.json', 'utf8'))

  // Group by category
  const byCategory = new Map<string, any[]>()
  for (const rule of rules) {
    const cat = rule.category ?? 'uncategorized'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(rule)
  }

  // Find candidate pairs via Jaccard within each category
  const candidates: [any, any][] = []
  for (const [cat, catRules] of byCategory) {
    const tokens = catRules.map(r => tokenize(r.rule_text))
    for (let i = 0; i < catRules.length; i++) {
      for (let j = i + 1; j < catRules.length; j++) {
        if (jaccard(tokens[i], tokens[j]) >= JACCARD_THRESHOLD) {
          candidates.push([catRules[i], catRules[j]])
        }
      }
    }
  }
  console.log(`Found ${candidates.length} candidate pairs across all categories`)

  // Ask Haiku to confirm each pair
  const toMerge: [any, any][] = []
  let confirmed = 0, rejected = 0, errors = 0

  for (let i = 0; i < candidates.length; i++) {
    const [a, b] = candidates[i]
    try {
      const same = await isSamePrinciple(a.rule_text, b.rule_text)
      if (same) {
        toMerge.push([a, b])
        confirmed++
      } else {
        rejected++
      }
    } catch (err) {
      console.error(`  Error on pair ${a.rule_id} / ${b.rule_id}:`, err)
      errors++
    }
    if ((i + 1) % 50 === 0) {
      console.log(`  ${i+1}/${candidates.length} checked — ${confirmed} confirmed, ${rejected} rejected`)
    }
  }

  console.log(`\nConfirmation done: ${confirmed} merges, ${rejected} rejected, ${errors} errors`)

  if (toMerge.length === 0) {
    console.log('No merges needed — rules.json unchanged.')
    return
  }

  // Build merge map: for each pair, keep the rule with more instances (wider coverage)
  // Mark rules to delete
  const ruleMap = new Map(rules.map(r => [r.rule_id, r]))
  const deleteIds = new Set<string>()
  let mergeCount = 0

  for (const [a, b] of toMerge) {
    // Skip if one is already slated for deletion
    if (deleteIds.has(a.rule_id) || deleteIds.has(b.rule_id)) continue

    const keepRule = a.instances.length >= b.instances.length ? a : b
    const dropRule = a.instances.length >= b.instances.length ? b : a

    const keep = ruleMap.get(keepRule.rule_id)!
    const drop = ruleMap.get(dropRule.rule_id)!

    console.log(`  Merge: "${drop.rule_text.slice(0, 60)}..." → "${keep.rule_text.slice(0, 60)}..."`)
    mergeRules(keep, drop)
    deleteIds.add(drop.rule_id)
    mergeCount++
  }

  const remaining = [...ruleMap.values()].filter(r => !deleteIds.has(r.rule_id))
  console.log(`\nMerged ${mergeCount} rules: ${rules.length} → ${remaining.length}`)

  fs.writeFileSync('data/rules.json', JSON.stringify(remaining, null, 2))
  console.log('Done.')
}

main().catch(console.error)
