/**
 * Fix remaining "should" rules in the binding-law explorer set.
 * - Rules where <50% of instances come from binding laws → deleted
 * - Rules where >=50% come from binding laws → rewritten to hard mandate language
 * Run: ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/fix-soft-language.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function harden(ruleText: string, category: string): Promise<string> {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Rewrite this AI regulation rule as a clear binding legal obligation.
Replace soft language ("should", "are encouraged to", "it is recommended that") with hard mandate language ("must", "shall", "are required to").
Keep the substantive requirement unchanged. Plain English, 1-2 sentences.

Category: ${category}
Original: ${ruleText}

Respond with ONLY the rewritten rule text, no quotes, no commentary.`,
    }],
  })
  return (resp.content[0] as { text: string }).text.trim()
}

async function main() {
  const rules: any[] = JSON.parse(fs.readFileSync('data/rules.json', 'utf8'))
  const regs: any[]  = JSON.parse(fs.readFileSync('data/regulations.json', 'utf8'))

  const bindingIds = new Set(regs.filter((r: any) => r.instrument_binding).map((r: any) => r.id))
  const SOFT_RE = /\bshould\b/i

  const softRules = rules.filter((r: any) =>
    SOFT_RE.test(r.rule_text) &&
    !/\(recommendation\)/i.test(r.rule_text) &&
    r.instances.some((i: any) => bindingIds.has(i.law_id))
  )

  const toDelete  = new Set(softRules.filter((r: any) => {
    const b = r.instances.filter((i: any) => bindingIds.has(i.law_id)).length
    return b / r.instances.length < 0.5
  }).map((r: any) => r.rule_id))

  const toRewrite = softRules.filter((r: any) => !toDelete.has(r.rule_id))

  console.log(`Deleting ${toDelete.size} minority-binding soft rules`)
  console.log(`Rewriting ${toRewrite.length} majority-binding soft rules`)

  // Rewrite
  const ruleMap = new Map(rules.map((r: any) => [r.rule_id, r]))
  let rewritten = 0, failed = 0

  for (let i = 0; i < toRewrite.length; i++) {
    const rule = toRewrite[i]
    try {
      const newText = await harden(rule.rule_text, rule.category)
      if (newText) {
        ;(ruleMap.get(rule.rule_id) as any).rule_text = newText
        rewritten++
      } else {
        failed++
      }
    } catch (err) {
      console.error(`  [${i+1}] Error on ${rule.rule_id}:`, err)
      failed++
    }
    if ((i + 1) % 10 === 0) console.log(`  ${i+1}/${toRewrite.length} rewritten`)
  }

  // Delete
  const cleaned = [...ruleMap.values()].filter((r: any) => !toDelete.has(r.rule_id))

  console.log(`Done. Rewritten: ${rewritten}, failed: ${failed}, deleted: ${toDelete.size}`)
  console.log(`Rules: ${rules.length} → ${cleaned.length}`)
  fs.writeFileSync('data/rules.json', JSON.stringify(cleaned, null, 2))
}

main().catch(console.error)
