/**
 * Rewrites rules where a named government agency is the grammatical subject,
 * turning them into portable policy principles. Deletes rules that are either
 * purely procedural or not AI-primary. Uses claude-haiku-4-5 (~$0.05 for 19 rules).
 *
 * Pre-mortem audit (2026-05-09): 27 agency-named rules found after section-ref fix ran.
 * 8 are hardcoded deletes (non-AI-primary or purely procedural); 19 get rewritten.
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Agencies that appear as grammatical subjects at the start of a rule
const SUBJECT_RE = /^(The\s+)?(DOE|NIST|NSF|OMB|OSTP|FTC|FDA|SEC|CFPB|DHS|DOD|DOJ|DOT|DARPA|NIH|EPA|CISA|NIA|NAIRR|NAIAC|AISI|ICO|FCA|PRA|CMA|BaFin|ACMA|OPC|CNIL|CNCPDP|ANPD|ANPCP|INAI|CNPD|AEPD|DPA|OAI|AI Safety Institute|Federal Trade Commission|Food and Drug Administration|Securities and Exchange Commission|Consumer Financial Protection Bureau|Department of Energy|Department of Defense|Department of Justice|National Institute of Standards and Technology|National Science Foundation|Office of Management and Budget|Office of Science and Technology Policy|Department of Homeland Security|Department of Transportation|Information Commissioner'?s? Office|Financial Conduct Authority|Competition and Markets Authority)\b/i

// Rules to delete outright — not AI-primary or purely procedural, confirmed by manual audit
const DELETE_IDS = new Set([
  // DOJ/CURES: prescription drug monitoring database, not AI regulation
  'us-ca-a82-2025-health-safety-code-11165-k-2',
  'us-ca-a82-2025-health-safety-code-11165-h-6-s',
  // EPA permitting under Clean Air/Water Acts for AI data centers — land-use, not AI governance
  'us-fed-eo14318-2025-sec-7-a',
  // DoD CIO: cryptographic modernization schedules — cybersecurity infrastructure, not AI
  'us-fed-nai-act-2020-sec-153-b',
  // DOE report to Congress within 6 months — purely procedural, no transferable principle
  'us-fed-nai-act-2020-sec-5501-e',
  // DOT: traffic signal modernization grant program (bill did not pass; marginal AI content)
  'us-fl-s1080-2026-24-s-339-85-1',
  // DOT: railroad crossing study + report to Governor — procedural + marginal AI
  'us-fl-s1080-2026-26-railroad-crossing-safety-te',
  // DOT: bridge infrastructure pilot module — recommendation in a pilot program bill, marginal AI
  'us-nj-a5777-2025-2-c-1',
])

async function rewriteRule(ruleText: string, category: string): Promise<string> {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Rewrite this AI regulation rule as a portable policy principle that applies across jurisdictions.
Remove the specific agency name and replace with a generic subject like "Government agencies", "The lead regulatory authority", "National AI standards bodies", "Designated oversight bodies", or similar.
Preserve the substantive obligation or policy intent. Use plain English, 1-2 sentences.
Keep the same general framing (must / shall / are required to / have authority to).

Category: ${category}
Original: ${ruleText}

Respond with ONLY the rewritten rule text, no quotes, no commentary.`,
    }],
  })
  return (resp.content[0] as { text: string }).text.trim()
}

async function main() {
  const rules: any[] = JSON.parse(fs.readFileSync('data/rules.json', 'utf8'))

  const affected = rules.filter(r => SUBJECT_RE.test(r.rule_text) && !DELETE_IDS.has(r.rule_id))
  const toDelete = rules.filter(r => DELETE_IDS.has(r.rule_id))

  console.log(`Agency-named rules: ${affected.length + toDelete.length} total`)
  console.log(`  ${toDelete.length} → delete (non-AI or procedural)`)
  console.log(`  ${affected.length} → rewrite`)
  console.log()

  const deleteIds = new Set([...DELETE_IDS])
  let fixed = 0, skipped = 0, failed = 0
  const ruleMap = new Map(rules.map(r => [r.rule_id, r]))

  for (let i = 0; i < affected.length; i++) {
    const rule = affected[i]
    try {
      const newText = await rewriteRule(rule.rule_text, rule.category)
      if (!newText) {
        console.warn(`  [${i+1}/${affected.length}] Empty response for ${rule.rule_id}, skipping`)
        skipped++
        continue
      }
      if (SUBJECT_RE.test(newText)) {
        // Rewrite didn't remove the agency — keep the result (partial improvement) but log it
        console.warn(`  [${i+1}/${affected.length}] Agency still present after rewrite: ${newText.slice(0, 80)}`)
      }
      ;(ruleMap.get(rule.rule_id) as any).rule_text = newText
      fixed++
    } catch (err) {
      console.error(`  [${i+1}/${affected.length}] Error on ${rule.rule_id}:`, err)
      failed++
    }
    if ((i + 1) % 10 === 0) console.log(`  ${i+1}/${affected.length} done`)
  }

  console.log(`\nRewrites: ${fixed} updated, ${skipped} skipped (empty), ${failed} errors`)

  const remainingRules = [...ruleMap.values()].filter((r: any) => !deleteIds.has(r.rule_id))
  console.log(`Deleting ${deleteIds.size} rules: ${rules.length} → ${remainingRules.length}`)

  fs.writeFileSync('data/rules.json', JSON.stringify(remainingRules, null, 2))

  // Clean up rules-progress.json if it references deleted rules
  const progressPath = 'data/rules-progress.json'
  if (fs.existsSync(progressPath)) {
    const progress: any[] = JSON.parse(fs.readFileSync(progressPath, 'utf8'))
    const cleaned = progress.filter((p: any) => !deleteIds.has(p.rule_id))
    if (cleaned.length < progress.length) {
      fs.writeFileSync(progressPath, JSON.stringify(cleaned, null, 2))
      console.log(`Cleaned rules-progress.json: removed ${progress.length - cleaned.length} entries`)
    }
  }

  console.log('Done.')
}

main().catch(console.error)
