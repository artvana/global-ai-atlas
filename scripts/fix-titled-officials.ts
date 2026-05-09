/**
 * Final cleanup pass: rewrites the ~116 rules that still reference titled
 * government officials ("Secretary of Commerce", "Director of NSF", etc.)
 * Run: ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/fix-titled-officials.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TITLED_RE = /\b(Secretary of|Director of|Administrator of|Commissioner of|Chief (Information|AI|Data|Technology|Digital) Officer|Under Secretary|Deputy Secretary|Assistant Secretary|Attorney General|Governor|Comptroller)\b/i

async function rewrite(ruleText: string, category: string): Promise<string> {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 250,
    messages: [{
      role: 'user',
      content: `Rewrite this AI regulation rule as a portable policy principle that applies across jurisdictions.
Replace titled government officials ("Secretary of Commerce", "Director of NSF", "Attorney General", etc.) with generic roles:
- Cabinet secretaries / ministers → "The responsible minister" or "The lead government ministry"
- Agency directors / administrators → "The lead regulatory authority" or "Government agencies"
- Chief AI/Data/Technology Officers → "Designated AI governance officers" or "Government AI leads"
- Attorney General → "The national enforcement authority"
- Commissioner → "The designated commissioner" or "Supervisory authorities"
Preserve the substantive obligation. Plain English, 1-2 sentences.

Category: ${category}
Original: ${ruleText}

Respond with ONLY the rewritten rule text, no quotes, no commentary.`,
    }],
  })
  return (resp.content[0] as { text: string }).text.trim()
}

async function main() {
  const rules: any[] = JSON.parse(fs.readFileSync('data/rules.json', 'utf8'))
  const affected = rules.filter(r => TITLED_RE.test(r.rule_text))
  console.log(`Rewriting ${affected.length} titled-official rules...`)

  const ruleMap = new Map(rules.map(r => [r.rule_id, r]))
  let fixed = 0, failed = 0

  for (let i = 0; i < affected.length; i++) {
    const rule = affected[i]
    try {
      const newText = await rewrite(rule.rule_text, rule.category)
      if (newText) {
        ;(ruleMap.get(rule.rule_id) as any).rule_text = newText
        fixed++
      } else {
        failed++
      }
    } catch (err) {
      console.error(`  [${i+1}] Error on ${rule.rule_id}:`, err)
      failed++
    }
    if ((i + 1) % 25 === 0) console.log(`  ${i+1}/${affected.length} done`)
  }

  console.log(`Done. Fixed: ${fixed}, failed: ${failed}`)
  fs.writeFileSync('data/rules.json', JSON.stringify([...ruleMap.values()], null, 2))
}

main().catch(console.error)
