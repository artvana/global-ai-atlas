#!/usr/bin/env npx tsx
/**
 * AI Regulation Update Checker
 *
 * Fetches primary tracker sources, compares against the existing corpus,
 * and writes a digest to data/updates/YYYY-MM-DD.md.
 *
 * Run manually: npx tsx scripts/check-updates.ts
 * Run via scheduled agent: called by weekly Claude agent
 *
 * Outputs:
 *   data/updates/YYYY-MM-DD.md  — human-readable digest
 *   data/updates/YYYY-MM-DD.json — structured diff for downstream use
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const TODAY = new Date().toISOString().slice(0, 10)
const UPDATES_DIR = join(ROOT, 'data/updates')

// Ensure updates directory exists
mkdirSync(UPDATES_DIR, { recursive: true })

// Load existing corpus
const existing: { id: string; short_name: string; enacted_date: string; jurisdiction: string }[] =
  JSON.parse(readFileSync(join(ROOT, 'data/regulations.json'), 'utf8'))

const existingIds = new Set(existing.map(l => l.id))

/**
 * Primary sources to check. Each has a URL and parsing hints.
 * The scheduled Claude agent uses these URLs with WebFetch.
 */
export const TRACKER_SOURCES = [
  {
    name: 'IAPP US State AI Governance Tracker',
    url: 'https://iapp.org/resources/article/us-state-ai-governance-legislation-tracker/',
    focus: 'US state enacted AI laws',
    check: 'Look for any laws marked "Enacted" that were enacted since the last check date',
  },
  {
    name: 'NCSL AI Legislation Database',
    url: 'https://www.ncsl.org/financial-services/artificial-intelligence-legislation-database',
    focus: 'US state AI legislation status',
    check: 'Look for bills with "Enacted" or "Signed" status not in current corpus',
  },
  {
    name: 'Troutman Privacy Blog',
    url: 'https://www.troutmanprivacy.com/category/state-legislation/',
    focus: 'Weekly US state AI law updates',
    check: 'Most recent posts — any newly enacted state AI laws?',
  },
  {
    name: 'MultiState AI Tracker',
    url: 'https://www.multistate.ai/artificial-intelligence-ai-legislation',
    focus: 'US state AI bills status',
    check: 'Filter by "Enacted" — anything new?',
  },
  {
    name: 'EUR-Lex AI Act implementing acts',
    url: 'https://eur-lex.europa.eu/search.html?scope=EURLEX&text=artificial+intelligence+2024%2F1689&lang=en&type=quick&qid=1',
    focus: 'EU AI Act implementing regulations and delegated acts',
    check: 'Any new Commission implementing decisions or delegated acts under Regulation 2024/1689?',
  },
  {
    name: 'CAC China AI regulations',
    url: 'http://www.cac.gov.cn/wxb_pdf/0228.pdf',
    focus: 'New Chinese AI regulations from CAC',
    check: 'Any new binding CAC regulations on AI/algorithms/synthetic media?',
  },
  {
    name: 'AI Watch Global Regulatory Tracker',
    url: 'https://www.whitecase.com/insight-our-thinking/ai-watch-global-regulatory-tracker-overview',
    focus: 'Global AI regulatory developments',
    check: 'Any new binding AI laws in tracked jurisdictions?',
  },
]

/**
 * Structured prompt for the Claude agent to use when checking updates.
 * The agent should fetch each URL, parse for new enacted laws,
 * and compare against the existing corpus.
 */
export function buildAgentPrompt(sinceDate: string): string {
  const existingSummary = existing
    .map(l => `  - ${l.id}: ${l.short_name} (${l.jurisdiction}, enacted ${l.enacted_date})`)
    .join('\n')

  return `You are checking for newly enacted AI laws to add to a regulatory database.

## Current corpus (${existing.length} laws)
${existingSummary}

## Task
Check the following sources for AI laws enacted AFTER ${sinceDate} that are NOT already in the corpus above.

For each source, fetch the URL and look for newly enacted (not just proposed) laws.

### Sources to check:
${TRACKER_SOURCES.map(s => `
**${s.name}**
URL: ${s.url}
Focus: ${s.focus}
What to look for: ${s.check}
`).join('\n')}

## Output format
For each new law found, provide:
1. **Jurisdiction** (state/country)
2. **Short name** (e.g. "Minnesota HF 4114")
3. **Full official name**
4. **Enacted date** (YYYY-MM-DD)
5. **Effective date** (YYYY-MM-DD if known)
6. **Status** (in_force / enacted_not_yet_effective)
7. **Primary category** (use: transparency_disclosure / algorithmic_accountability / individual_rights / content_synthetic_media / biometric_identity / sector_specific_healthcare / sector_specific_employment / sector_specific_financial / scope_structure / enforcement_architecture)
8. **Summary** (2-3 sentences)
9. **Official text URL**
10. **Max penalty** (if stated)

Also note:
- Any laws in the corpus with STATUS CHANGES (e.g. came into force, was revised, was superseded)
- Any laws with NOTABLE DEVELOPMENTS (amendments, enforcement actions, court challenges)

Format the output as a markdown report that will be saved to data/updates/${TODAY}.md.
Start with a brief executive summary of what changed.`
}

// Print corpus stats and generate the agent prompt
console.log(`\nAI Regulation Update Checker`)
console.log(`Current corpus: ${existing.length} laws`)
console.log(`Today: ${TODAY}`)
console.log(`\nAgent prompt written to data/updates/${TODAY}-prompt.txt`)

const prompt = buildAgentPrompt('2026-04-24')
writeFileSync(join(UPDATES_DIR, `${TODAY}-prompt.txt`), prompt)

console.log(`\nSources to check:`)
TRACKER_SOURCES.forEach(s => console.log(`  - ${s.name}: ${s.url}`))
console.log(`\nRun the weekly scheduled agent to fetch updates and generate the digest.`)
console.log(`Or run manually with: npx tsx scripts/run-update-agent.ts`)
