/**
 * Rewrites rule_text for rules that contain section/statute references,
 * turning them into portable policy principles without citations.
 * Uses claude-haiku-4-5 for speed and low cost (~$0.50 for 304 rules).
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SECTION_RE = /§\s*\d|[Ss]ection\s+\d|[Aa]rticle\s+\d+[\(\s]|[Ss]ubsection|[Cc]lause\s+\d|[Pp]aragraph\s+\d|\d+\s+U\.S\.C\./

async function rewriteRule(ruleText: string, category: string): Promise<string> {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Rewrite this AI/data regulation rule as a portable policy principle.
Remove all section numbers (§ 15(b), Art. 5(1)(a)), statutory citations (47 U.S.C. § 230), and cross-references to specific provisions.
Preserve the substantive obligation/prohibition/right. Use plain English, 1-2 sentences. Keep the same general framing (You must / You cannot / Individuals have the right to).
If the rule's only substance IS the cross-reference (e.g. "preserves rights under § 230"), express the underlying principle instead (e.g. "Platform operators retain existing safe harbor immunities for third-party content").

Category: ${category}
Original: ${ruleText}

Respond with ONLY the rewritten rule text, no quotes, no commentary.`,
    }],
  })
  return (resp.content[0] as { text: string }).text.trim()
}

async function main() {
  const rules = JSON.parse(fs.readFileSync('data/rules.json', 'utf8'))
  const affected = rules.filter((r: any) => SECTION_RE.test(r.rule_text))
  console.log(`Rewriting ${affected.length} rules...`)

  let fixed = 0, failed = 0
  const ruleMap = new Map(rules.map((r: any) => [r.rule_id, r]))

  for (let i = 0; i < affected.length; i++) {
    const rule = affected[i]
    try {
      const newText = await rewriteRule(rule.rule_text, rule.category)
      if (newText && !SECTION_RE.test(newText)) {
        ;(ruleMap.get(rule.rule_id) as any).rule_text = newText
        fixed++
      } else {
        console.warn(`  [${i+1}] Still has section ref after rewrite, skipping: ${newText?.slice(0, 80)}`)
        failed++
      }
    } catch (err) {
      console.error(`  [${i+1}] Error on ${rule.rule_id}:`, err)
      failed++
    }
    if ((i + 1) % 50 === 0) console.log(`  ${i+1}/${affected.length} done`)
  }

  fs.writeFileSync('data/rules.json', JSON.stringify([...ruleMap.values()], null, 2))
  console.log(`Done. Fixed: ${fixed}, failed/skipped: ${failed}`)
}

main().catch(console.error)
