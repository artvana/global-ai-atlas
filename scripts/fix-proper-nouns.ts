/**
 * Rewrites all rules that contain proper noun references to specific agencies,
 * laws, or regulatory frameworks — replacing them with portable generic equivalents.
 * This is a prerequisite for the dedup-rules pass, which merges rules that become
 * semantically equivalent after proper nouns are removed.
 *
 * ~265 rules, ~$0.07 with claude-haiku-4-5.
 *
 * Rules in DELETE_IDS are removed outright (non-AI-primary or purely procedural).
 * Run: npx tsx scripts/fix-proper-nouns.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Any rule touching these proper nouns needs rewriting
const PROPER_NOUN_RE = /\b(NIST|NSF|OMB|OSTP|FTC|FDA|SEC|CFPB|DHS|DOD|DOJ|DOT|DOE|DARPA|NIH|EPA|CISA|FCC|EEOC|HHS|DOL|DOC|CMS|ICO|FCA|PRA|CMA|BaFin|ACMA|OPC|CNIL|CNCPDP|ANPD|ANPCP|INAI|CNPD|AEPD|ENISA|EDPB|ARCOM|DGCCRF|PEReN|MAS|SEBI|APRA|AI Safety Institute|Federal Trade Commission|Food and Drug Administration|Securities and Exchange Commission|Consumer Financial Protection Bureau|Department of (Energy|Defense|Justice|Transportation|Homeland Security|Labor|Commerce|Health)|National Institute of Standards|National Science Foundation|Office of Management and Budget|Office of Science and Technology|Environmental Protection Agency|Information Commissioner'?s? Office|Financial Conduct Authority|Competition and Markets Authority|European Data Protection|California (Attorney General|Privacy Protection Agency)|CCPA|GDPR|HIPAA|FERPA|COPPA|FTC Act|Clean Air Act|Clean Water Act|CERCLA|TSCA|CURES|NIST AI|AI RMF)\b/i

// Non-AI-primary or purely procedural rules — delete rather than rewrite
const DELETE_IDS = new Set([
  'us-ca-a82-2025-health-safety-code-11165-k-2',   // DOJ CURES: drug records, not AI
  'us-ca-a82-2025-health-safety-code-11165-h-6-s', // DOJ CURES: drug data sharing, not AI
  'us-fed-eo14318-2025-sec-7-a',                    // EPA permitting under Clean Air/Water Acts, not AI governance
  'us-fed-nai-act-2020-sec-153-b',                  // DoD CIO: cryptographic modernization schedules, not AI
  'us-fed-nai-act-2020-sec-5501-e',                 // DOE: report to Congress — purely procedural
  'us-fl-s1080-2026-24-s-339-85-1',                 // DOT traffic signal grant (bill did not pass, marginal AI)
  'us-fl-s1080-2026-26-railroad-crossing-safety-te',// DOT railroad study + report to Governor
  'us-nj-a5777-2025-2-c-1',                         // DOT bridge pilot module (recommendation, marginal AI)
])

async function rewriteRule(ruleText: string, category: string): Promise<string> {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 250,
    messages: [{
      role: 'user',
      content: `Rewrite this AI regulation rule as a portable policy principle that applies across jurisdictions.

Apply ALL of the following:
1. Replace specific agency/body names (NIST, FTC, ICO, CNIL, FCA, FDA, OMB, OSTP, NSF, DOE, DOD, EPA, DHS, ENISA, EDPB, etc.) with generic equivalents:
   - Standards bodies → "National AI standards bodies" or "AI standards bodies"
   - Consumer/competition enforcers → "Consumer protection regulators" or "Competition authorities"
   - Data protection authorities → "Data protection authorities"
   - Science funding agencies → "Government science funding agencies"
   - Defense/security agencies → "Defense and security agencies"
   - Central oversight bodies → "Central government oversight bodies"
   - Sector regulators (FDA, FCA, etc.) → "Sector-specific regulators" or the relevant sector (e.g. "Financial regulators", "Health regulators")
2. Replace named laws and frameworks (CCPA, GDPR, HIPAA, FTC Act, Clean Air Act, etc.) with generic equivalents:
   - CCPA/GDPR/PDPA → "applicable data protection law" or "privacy rights under applicable law"
   - FTC Act → "consumer protection law"
   - NIST AI RMF / AI RMF → "an applicable AI risk management framework"
   - Named statutes cited as authority → "applicable law" or "relevant sector regulations"
3. If the rule is a definition (e.g. "X means..."), keep the definition but remove the law-specific qualifier (e.g. drop "under the CCPA").
4. Preserve the substantive obligation, right, or prohibition. Use plain English, 1-2 sentences.

Category: ${category}
Original: ${ruleText}

Respond with ONLY the rewritten rule text, no quotes, no commentary.`,
    }],
  })
  return (resp.content[0] as { text: string }).text.trim()
}

async function main() {
  const rules: any[] = JSON.parse(fs.readFileSync('data/rules.json', 'utf8'))

  const toDelete = rules.filter(r => DELETE_IDS.has(r.rule_id))
  const toRewrite = rules.filter(r => !DELETE_IDS.has(r.rule_id) && PROPER_NOUN_RE.test(r.rule_text))

  console.log(`Proper noun rules found: ${toRewrite.length + toDelete.length}`)
  console.log(`  ${toDelete.length} → delete (non-AI-primary or purely procedural)`)
  console.log(`  ${toRewrite.length} → rewrite`)
  console.log()

  const ruleMap = new Map(rules.map(r => [r.rule_id, r]))
  let fixed = 0, skipped = 0, failed = 0

  for (let i = 0; i < toRewrite.length; i++) {
    const rule = toRewrite[i]
    try {
      const newText = await rewriteRule(rule.rule_text, rule.category)
      if (!newText) {
        console.warn(`  [${i+1}/${toRewrite.length}] Empty response for ${rule.rule_id}, skipping`)
        skipped++
        continue
      }
      if (PROPER_NOUN_RE.test(newText)) {
        console.warn(`  [${i+1}/${toRewrite.length}] Still contains proper noun: ${newText.slice(0, 80)}`)
      }
      ;(ruleMap.get(rule.rule_id) as any).rule_text = newText
      fixed++
    } catch (err) {
      console.error(`  [${i+1}/${toRewrite.length}] Error on ${rule.rule_id}:`, err)
      failed++
    }
    if ((i + 1) % 25 === 0) console.log(`  ${i+1}/${toRewrite.length} done`)
  }

  console.log(`\nRewrites: ${fixed} updated, ${skipped} skipped (empty), ${failed} errors`)

  const remaining = [...ruleMap.values()].filter((r: any) => !DELETE_IDS.has(r.rule_id))
  console.log(`Deleting ${toDelete.length} rules: ${rules.length} → ${remaining.length}`)

  fs.writeFileSync('data/rules.json', JSON.stringify(remaining, null, 2))
  console.log('Done. Run dedup-rules.ts next.')
}

main().catch(console.error)
