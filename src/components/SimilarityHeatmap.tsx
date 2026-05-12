import { useState, useMemo, Fragment } from 'react'
import type { AILaw } from '../types'
import { RULE_CATEGORY_LABELS } from '../types'
import { rules as allRules } from '../data/rules'
import { regulations } from '../data/regulations'

const LAW_BY_ID = new Map(regulations.map(l => [l.id, l]))

// ── relationship → numeric score ──────────────────────────────────────────────

const REL_SCORE: Record<string, number> = {
  origin: 5, identical: 4, agrees: 3, similar: 2, opposed: -1, absent: 0,
}

// Reserved column key for the international soft-law reference column.
// Instruments that publish globally but bind nobody (OECD, UNESCO, G7, ISO, etc.)
// score into this column instead of cascading to country columns.
const INTL_REF_KEY = 'intl-ref'

// Pairwise-meaningful stance labels — describes a jurisdiction's own position,
// not its relationship to a canonical origin rule
function stanceLabel(score: number): string {
  if (score >= 4) return 'Fully adopted'
  if (score >= 1) return 'Partially adopted'
  if (score < 0)  return 'Explicitly opposes'
  return 'Not regulated'
}

const STANCE_TIPS: Record<string, string> = {
  'Fully adopted':      'This jurisdiction has this rule on the books, worded nearly the same way.',
  'Partially adopted':  'A version of this rule exists, but scoped differently or with different conditions.',
  'Explicitly opposes': 'This jurisdiction has actively legislated against this requirement.',
  'Not regulated':      'No matching rule found under the current filter.',
}

// ── region / jurisdiction helpers ─────────────────────────────────────────────

// World Bank regional groupings + Supranational for international bodies
const REGION_ORDER = [
  'Supranational',
  'North America',
  'Latin America & Caribbean',
  'Europe & Central Asia',
  'Middle East & North Africa',
  'Sub-Saharan Africa',
  'South Asia',
  'East Asia & Pacific',
  'Other',
]

const REGION_COLORS: Record<string, string> = {
  Supranational:               '#6D28D9',
  'North America':             '#1D4ED8',
  'Latin America & Caribbean': '#0D9488',
  'Europe & Central Asia':     '#059669',
  'Middle East & North Africa':'#DC2626',
  'Sub-Saharan Africa':        '#9D174D',
  'South Asia':                '#A16207',
  'East Asia & Pacific':       '#D97706',
  Other:                       '#64748B',
}

const REGION_SHORT: Record<string, string> = {
  Supranational:               'Intl',
  'North America':             'N. America',
  'Latin America & Caribbean': 'Lat. America',
  'Europe & Central Asia':     'Europe & C. Asia',
  'Middle East & North Africa':'Mid. East & N. Africa',
  'Sub-Saharan Africa':        'Sub-Saharan Africa',
  'South Asia':                'South Asia',
  'East Asia & Pacific':       'E. Asia & Pacific',
  Other:                       'Other',
}

const COUNTRY_REGION: Record<string, string> = {
  // North America
  Canada: 'North America',
  // Latin America & Caribbean
  Brazil: 'Latin America & Caribbean', Mexico: 'Latin America & Caribbean',
  Argentina: 'Latin America & Caribbean', Chile: 'Latin America & Caribbean',
  Colombia: 'Latin America & Caribbean', Peru: 'Latin America & Caribbean',
  Ecuador: 'Latin America & Caribbean', Uruguay: 'Latin America & Caribbean',
  Panama: 'Latin America & Caribbean', Paraguay: 'Latin America & Caribbean',
  'Costa Rica': 'Latin America & Caribbean',
  'Dominican Republic': 'Latin America & Caribbean',
  'Trinidad and Tobago': 'Latin America & Caribbean',
  // Europe & Central Asia (non-EU; EU members handled via EU_MEMBER_COUNTRIES)
  'United Kingdom': 'Europe & Central Asia',
  Switzerland:      'Europe & Central Asia',
  Norway:           'Europe & Central Asia',
  Iceland:          'Europe & Central Asia',
  Russia:           'Europe & Central Asia',
  Ukraine:          'Europe & Central Asia',
  Serbia:           'Europe & Central Asia',
  Turkey:           'Europe & Central Asia',
  Kazakhstan:       'Europe & Central Asia',
  Uzbekistan:       'Europe & Central Asia',
  Azerbaijan:       'Europe & Central Asia',
  Kyrgyzstan:       'Europe & Central Asia',
  Tajikistan:       'Europe & Central Asia',
  Moldova:          'Europe & Central Asia',
  // Middle East & North Africa
  'United Arab Emirates': 'Middle East & North Africa',
  'Saudi Arabia':         'Middle East & North Africa',
  Qatar:                  'Middle East & North Africa',
  Israel:                 'Middle East & North Africa',
  Egypt:                  'Middle East & North Africa',
  Morocco:                'Middle East & North Africa',
  Tunisia:                'Middle East & North Africa',
  Algeria:                'Middle East & North Africa',
  Jordan:                 'Middle East & North Africa',
  Oman:                   'Middle East & North Africa',
  Bahrain:                'Middle East & North Africa',
  Kuwait:                 'Middle East & North Africa',
  // Sub-Saharan Africa
  'South Africa':  'Sub-Saharan Africa',
  Nigeria:         'Sub-Saharan Africa',
  Kenya:           'Sub-Saharan Africa',
  Rwanda:          'Sub-Saharan Africa',
  Mauritius:       'Sub-Saharan Africa',
  Ethiopia:        'Sub-Saharan Africa',
  Ghana:           'Sub-Saharan Africa',
  Uganda:          'Sub-Saharan Africa',
  Tanzania:        'Sub-Saharan Africa',
  Zimbabwe:        'Sub-Saharan Africa',
  'Ivory Coast':   'Sub-Saharan Africa',
  Senegal:         'Sub-Saharan Africa',
  Benin:           'Sub-Saharan Africa',
  Cameroon:        'Sub-Saharan Africa',
  Namibia:         'Sub-Saharan Africa',
  Zambia:          'Sub-Saharan Africa',
  // South Asia
  India:       'South Asia',
  Bangladesh:  'South Asia',
  Pakistan:    'South Asia',
  'Sri Lanka': 'South Asia',
  Bhutan:      'South Asia',
  Nepal:       'South Asia',
  // East Asia & Pacific (East Asia + Southeast Asia + Pacific)
  China:                   'East Asia & Pacific',
  Japan:                   'East Asia & Pacific',
  'South Korea':           'East Asia & Pacific',
  Taiwan:                  'East Asia & Pacific',
  'Hong Kong':             'East Asia & Pacific',
  'China (Hong Kong SAR)': 'East Asia & Pacific',
  Singapore:               'East Asia & Pacific',
  Indonesia:               'East Asia & Pacific',
  Malaysia:                'East Asia & Pacific',
  Philippines:             'East Asia & Pacific',
  Thailand:                'East Asia & Pacific',
  Vietnam:                 'East Asia & Pacific',
  'Brunei Darussalam':     'East Asia & Pacific',
  Australia:               'East Asia & Pacific',
  'New Zealand':           'East Asia & Pacific',
}

const REGIONAL_LABELS: Record<string, string> = {
  EU: 'European Union', CoE: 'Council of Europe',
  International: 'International / UN', APAC: 'APAC Regional', Africa: 'African Union',
}

const US_STATE_NAMES: Record<string, string> = {
  'US-AK': 'Alaska',         'US-AL': 'Alabama',        'US-AR': 'Arkansas',
  'US-AZ': 'Arizona',        'US-CA': 'California',     'US-CO': 'Colorado',
  'US-CT': 'Connecticut',    'US-DC': 'Washington D.C.','US-DE': 'Delaware',
  'US-FL': 'Florida',        'US-GA': 'Georgia',        'US-GU': 'Guam',
  'US-HI': 'Hawaii',         'US-IA': 'Iowa',           'US-ID': 'Idaho',
  'US-IL': 'Illinois',       'US-IN': 'Indiana',        'US-KS': 'Kansas',
  'US-KY': 'Kentucky',       'US-LA': 'Louisiana',      'US-MA': 'Massachusetts',
  'US-MD': 'Maryland',       'US-ME': 'Maine',          'US-MI': 'Michigan',
  'US-MN': 'Minnesota',      'US-MO': 'Missouri',       'US-MS': 'Mississippi',
  'US-MT': 'Montana',        'US-NC': 'North Carolina', 'US-ND': 'North Dakota',
  'US-NE': 'Nebraska',       'US-NH': 'New Hampshire',  'US-NJ': 'New Jersey',
  'US-NM': 'New Mexico',     'US-NV': 'Nevada',         'US-NY': 'New York',
  'US-NYC': 'New York City', 'US-OH': 'Ohio',           'US-OK': 'Oklahoma',
  'US-OR': 'Oregon',         'US-PA': 'Pennsylvania',   'US-PR': 'Puerto Rico',
  'US-RI': 'Rhode Island',   'US-SC': 'South Carolina', 'US-SD': 'South Dakota',
  'US-TN': 'Tennessee',      'US-TX': 'Texas',          'US-UT': 'Utah',
  'US-VA': 'Virginia',       'US-VT': 'Vermont',        'US-WA': 'Washington',
  'US-WI': 'Wisconsin',      'US-WV': 'West Virginia',  'US-WY': 'Wyoming',
}

function lawColKey(law: AILaw): string {
  if (law.country === 'European Union') return 'regional:EU'
  if (law.country === 'Global / Regional') return `regional:${law.region}`
  if (law.country === 'International') return INTL_REF_KEY
  if (law.country === 'United States') {
    if (law.region === 'US' || law.region === 'North America') return 'US-FED'
    return law.region
  }
  return law.country
}

function colLabel(key: string): string {
  if (key === INTL_REF_KEY) return 'International / UN'
  if (key.startsWith('regional:')) return REGIONAL_LABELS[key.slice(9)] ?? key.slice(9)
  if (key === 'US') return 'United States'
  if (key === 'US-FED') return 'US Federal'
  if (key.startsWith('US-')) return US_STATE_NAMES[key] ?? key.slice(3)
  return key
}

// EU member states are represented by the EU column. Their domestic laws may
// supplement EU law but don't warrant separate columns in a global convergence map.
const EU_MEMBER_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden',
])

const GCC_MEMBERS = new Set([
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait', 'Oman',
])

// Maps region codes (from Global / Regional laws) to member country sets.
// null = International: apply to all jurisdictions already in the matrix.
const REGIONAL_EXPANSION: Record<string, Set<string> | null> = {
  EU: EU_MEMBER_COUNTRIES,
  CoE: new Set([
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
    'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
    'United Kingdom', 'Switzerland', 'Norway', 'Iceland',
    'Turkey', 'Serbia', 'Ukraine', 'Moldova', 'Azerbaijan',
  ]),
  APAC: new Set([
    'China', 'Japan', 'South Korea', 'Taiwan',
    'Singapore', 'Indonesia', 'Malaysia', 'Philippines', 'Thailand', 'Vietnam', 'Brunei Darussalam',
    'India', 'Bangladesh', 'Pakistan', 'Sri Lanka',
    'Australia', 'New Zealand',
  ]),
  Africa: new Set([
    'South Africa', 'Nigeria', 'Kenya', 'Rwanda', 'Ethiopia', 'Ghana', 'Uganda', 'Tanzania',
    'Zimbabwe', 'Ivory Coast', 'Senegal', 'Benin', 'Cameroon', 'Namibia', 'Zambia', 'Mauritius',
    'Egypt', 'Morocco', 'Tunisia', 'Algeria',
  ]),
  International: null,
}

function colRegion(key: string): string {
  if (key === INTL_REF_KEY) return 'Supranational'
  if (key.startsWith('regional:')) return 'Supranational'
  if (key === 'US' || key === 'US-FED' || key.startsWith('US-')) return 'North America'
  if (EU_MEMBER_COUNTRIES.has(key)) return 'Europe & Central Asia'
  return COUNTRY_REGION[key] ?? 'Other'
}

function colSortKey(key: string): string {
  const r = REGION_ORDER.indexOf(colRegion(key)).toString().padStart(2, '0')
  if (key === 'US') return `${r}_US_0`
  if (key === 'US-FED') return `${r}_US_0b`
  if (key.startsWith('US-')) return `${r}_US_1_${colLabel(key)}`
  return `${r}_ZZ_${colLabel(key)}`
}

// ── color mapping ─────────────────────────────────────────────────────────────
// Diverging scale centred at 0 (no overlap = white).
// Positive similarity → green-500; negative (explicit conflict) → red-500.
// Cap the green side at mean + 2σ with sqrt spread to open the dense low band.

function simToColor(v: number, mean = 0.067, std = 0.074): string {
  if (v < 0) {
    // Explicit conflict (opposed label) — white → red-500, saturates at ~-0.15
    const t = Math.pow(Math.min(1, -v / 0.15), 0.7)
    return `rgb(255,${Math.round(255 - t * 187)},${Math.round(255 - t * 187)})`
  }
  // No overlap (v = 0) → white. Similarity → white → green-500 (#22C55E).
  const cap = Math.max(mean + 2 * std, 0.01)
  const t = Math.pow(Math.min(1, v / cap), 0.5)
  return `rgb(${Math.round(255 - t * 221)},${Math.round(255 - t * 58)},${Math.round(255 - t * 161)})`
}

// ── layout constants ──────────────────────────────────────────────────────────

const CELL     = 13
const HEADER_H = 114
const LABEL_W  = 136
const DIAG_COL = '#E2E8F0'

// ── component ─────────────────────────────────────────────────────────────────

type LawBucket = 'in_force' | 'bills' | 'policies' | 'other'

interface HeatmapFilters { in_force: boolean; bills: boolean; policies: boolean; other: boolean }

const DEFAULT_HEATMAP_FILTERS: HeatmapFilters = { in_force: true, bills: false, policies: false, other: false }

const BUCKET_LABELS: Record<LawBucket, string> = {
  in_force: 'Laws in Force',
  bills:    'Bills',
  policies: 'Policies',
  other:    'Other',
}

const BUCKET_HINTS: Record<LawBucket, string> = {
  in_force: 'Binding instruments currently in effect',
  bills:    'Passed / signed but not yet effective',
  policies: 'Non-binding soft law, frameworks & guidance',
  other:    'Treaties, superseded or miscellaneous instruments',
}

function classifyLaw(l: { instrument_binding?: boolean; status?: string }): LawBucket {
  if (!l.instrument_binding) return 'policies'
  if (l.status === 'in_force') return 'in_force'
  if (l.status === 'enacted_not_yet_effective') return 'bills'
  return 'other'
}

interface HoverState  { i: number; j: number; x: number; y: number }
interface ComparedPair { i: number; j: number }

// Inline definition tooltip — dotted underline, hover card above the term.
function Tip({ label, text }: { label: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="border-b border-dotted border-current cursor-help">{label}</span>
      {show && (
        <span style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, width: 240, zIndex: 9999 }}
          className="block bg-white border border-odl-border rounded shadow-lg px-2.5 py-2 text-[10px] text-odl-text leading-relaxed pointer-events-none font-normal not-italic whitespace-normal">
          {text}
        </span>
      )}
    </span>
  )
}

export function SimilarityHeatmap({ onViewLaw }: { onViewLaw?: (id: string) => void } = {}) {
  const [heatmapFilters, setHeatmapFilters] = useState<HeatmapFilters>(DEFAULT_HEATMAP_FILTERS)
  const [selected, setSelected]           = useState<number | null>(null)
  const [hover, setHover]                 = useState<HoverState | null>(null)
  const [comparedPair, setCompared]       = useState<ComparedPair | null>(null)
  const [expanded, setExpanded]           = useState<Set<string>>(new Set())
  const [usCollapsed, setUsCollapsed]     = useState(true)
  const [methodologyOpen, setMethodologyOpen] = useState(false)

  const toggleBucket = (bucket: LawBucket) => {
    setHeatmapFilters(f => ({ ...f, [bucket]: !f[bucket] }))
    setSelected(null)
    setCompared(null)
  }

  // ── compute coverage vectors + cosine similarity ──
  const { cols, simMatrix, scores, atRiskCols, insights, substantiveRules, regionMatrix, presentRegions, usHasStates } = useMemo(() => {
    const candidateLaws = regulations.filter(l => heatmapFilters[classifyLaw(l)])
    const candidateIds = new Set(candidateLaws.map(l => l.id))
    const lawById = new Map(regulations.map(l => [l.id, l]))

    // Exclude definitions_scope from similarity — definitional boilerplate creates
    // false convergence signal that obscures genuine substantive policy alignment.
    const substantiveRules = allRules.filter(r =>
      r.category !== 'definitions_scope' &&
      r.category !== 'institutional_framework' &&
      r.category !== 'data_subject_rights' &&
      r.category !== 'private_redress' &&
      r.category !== 'enforcement_penalties'
    )
    const m = substantiveRules.length

    // Build column set.
    // EU (binding or non-binding) cascades to 27 member country columns.
    // Non-EU regional soft-law (non-binding CoE, ASEAN, AU, GCC) and all
    // Global/International instruments score into a single 'intl-ref' reference
    // column instead — publication is not adoption.
    const colKeySet = new Set<string>()
    candidateLaws.forEach(l => {
      const k = lawColKey(l)
      if (k === INTL_REF_KEY) {
        colKeySet.add(INTL_REF_KEY)
      } else if (k.startsWith('regional:')) {
        const region = k.slice(9)
        if (region === 'EU') {
          EU_MEMBER_COUNTRIES.forEach(c => colKeySet.add(c))
        } else if (region === 'International') {
          colKeySet.add(INTL_REF_KEY)
        } else {
          // CoE, APAC, Africa: cascade only if binding; soft-law goes to intl-ref
          if (l.instrument_binding) {
            REGIONAL_EXPANSION[region]?.forEach(c => colKeySet.add(c))
          } else {
            colKeySet.add(INTL_REF_KEY)
          }
        }
      } else if (l.country === 'Gulf Cooperation Council') {
        if (l.instrument_binding) {
          GCC_MEMBERS.forEach(c => colKeySet.add(c))
        } else {
          colKeySet.add(INTL_REF_KEY)
        }
      } else {
        colKeySet.add(k)
      }
    })

    const cols = [...colKeySet].sort((a, b) => colSortKey(a).localeCompare(colSortKey(b)))
    const n    = cols.length
    const ci   = new Map(cols.map((c, i) => [c, i]))

    // scores[col][rule]: positive = adopted (3–4), negative (−1) = explicitly opposes, 0 = absent
    const scores: number[][] = Array.from({ length: n }, () => new Array(m).fill(0))

    const applyScore = (cIdx: number, rIdx: number, sc: number) => {
      if (sc > 0 && sc > scores[cIdx][rIdx]) scores[cIdx][rIdx] = sc
      else if (sc < 0 && scores[cIdx][rIdx] === 0) scores[cIdx][rIdx] = sc
    }

    substantiveRules.forEach((rule, rIdx) => {
      rule.instances.forEach(inst => {
        if (!candidateIds.has(inst.law_id)) return
        const law = lawById.get(inst.law_id)
        if (!law) return
        const sc = REL_SCORE[inst.relationship] ?? 0
        if (sc === 0) return

        const k = lawColKey(law)

        if (k === INTL_REF_KEY) {
          const cIdx = ci.get(INTL_REF_KEY)
          if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
        } else if (k.startsWith('regional:')) {
          const region = k.slice(9)
          if (region === 'EU') {
            for (const member of EU_MEMBER_COUNTRIES) {
              const cIdx = ci.get(member)
              if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
            }
          } else if (region === 'International') {
            const cIdx = ci.get(INTL_REF_KEY)
            if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
          } else {
            // CoE, APAC, Africa: cascade only if binding; soft-law → intl-ref
            if (law.instrument_binding) {
              const members = REGIONAL_EXPANSION[region]
              if (members) {
                for (const member of members) {
                  const cIdx = ci.get(member)
                  if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
                }
              }
            } else {
              const cIdx = ci.get(INTL_REF_KEY)
              if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
            }
          }
        } else if (law.country === 'Gulf Cooperation Council') {
          if (law.instrument_binding) {
            for (const member of GCC_MEMBERS) {
              const cIdx = ci.get(member)
              if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
            }
          } else {
            const cIdx = ci.get(INTL_REF_KEY)
            if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
          }
        } else {
          const cIdx = ci.get(k)
          if (cIdx !== undefined) applyScore(cIdx, rIdx, sc)
        }
      })
    })

    // Drop columns with no coverage under the current filter to declutter the map
    const activeMask  = scores.map(sv => sv.some(s => s !== 0))
    let fCols         = cols.filter((_, i) => activeMask[i])
    let fScores       = scores.filter((_, i) => activeMask[i])
    const ciF         = new Map(fCols.map((c, i) => [c, i]))

    // USA collapse: merge all US-FED + US-* columns into a single 'United States' column
    const usHasStates = fCols.some(c => c === 'US-FED' || c.startsWith('US-'))
    if (usCollapsed && usHasStates) {
      const usColIdxs = fCols.map((c, i) => (c === 'US-FED' || c.startsWith('US-')) ? i : -1).filter(x => x >= 0)
      const usIdxSet  = new Set(usColIdxs)
      const mergedUS  = new Array(m).fill(0)
      for (const ui of usColIdxs) {
        for (let k = 0; k < m; k++) {
          if (fScores[ui][k] > 0 && fScores[ui][k] > mergedUS[k]) mergedUS[k] = fScores[ui][k]
          else if (fScores[ui][k] < 0 && mergedUS[k] === 0) mergedUS[k] = fScores[ui][k]
        }
      }
      const baseCols   = fCols.filter((_, i) => !usIdxSet.has(i))
      const baseScores = fScores.filter((_, i) => !usIdxSet.has(i))
      const usSortKey  = colSortKey('US')
      const insertAt   = baseCols.findIndex(c => colSortKey(c) > usSortKey)
      if (insertAt < 0) {
        fCols   = [...baseCols, 'US']
        fScores = [...baseScores, mergedUS]
      } else {
        fCols   = [...baseCols.slice(0, insertAt), 'US', ...baseCols.slice(insertAt)]
        fScores = [...baseScores.slice(0, insertAt), mergedUS, ...baseScores.slice(insertAt)]
      }
    }
    let nF = fCols.length

    // Columns with at-risk preemption status (US state laws that may be federally preempted)
    const atRiskCols = new Set<string>()
    candidateLaws.forEach(l => {
      if (l.preemption_status === 'at_risk') {
        const k = lawColKey(l)
        if (usCollapsed && (k === 'US-FED' || k.startsWith('US-'))) {
          // don't propagate ⚠ to the collapsed 'US' column — only show on individual states
        } else if (ciF.has(k)) {
          atRiskCols.add(k)
        }
      }
    })

    // Similarity: norms use only positive (adoption) scores so opposition doesn't
    // inflate the denominator. Dot product weights conflict 3× to distinguish
    // active disagreement from mere absence.
    const CONFLICT_WEIGHT = 3
    const pos = (x: number) => Math.max(0, x)
    const norms = fScores.map(v => Math.sqrt(v.reduce((s, x) => s + pos(x) ** 2, 0)))
    const sim: number[][] = Array.from({ length: nF }, () => new Array(nF).fill(0))
    for (let i = 0; i < nF; i++) {
      sim[i][i] = 1
      for (let j = i + 1; j < nF; j++) {
        if (!norms[i] || !norms[j]) continue
        let dot = 0
        for (let k = 0; k < m; k++) {
          const si = fScores[i][k], sj = fScores[j][k]
          if      (si > 0 && sj > 0) dot += si * sj                       // agreement
          else if (si > 0 && sj < 0) dot += CONFLICT_WEIGHT * si * sj     // conflict (negative)
          else if (si < 0 && sj > 0) dot += CONFLICT_WEIGHT * si * sj     // conflict (negative)
          else if (si < 0 && sj < 0) dot += si * sj                       // shared opposition: weak positive
        }
        sim[i][j] = sim[j][i] = dot / (norms[i] * norms[j])
      }
    }

    // ── insights ──
    // intlRefFIdx: index of the reference column in fCols (-1 if not present).
    // It stays in the display matrix but is excluded from country-to-country metrics.
    const intlRefFIdx = fCols.indexOf(INTL_REF_KEY)
    const avgSim = Array.from({ length: nF }, (_, i) => {
      let s = 0; for (let j = 0; j < nF; j++) if (i !== j) s += sim[i][j]
      return s / Math.max(nF - 1, 1)
    })
    let globalAvgSum = 0, globalAvgCnt = 0, isolatedMin = Infinity, isolatedIdx = 0
    for (let i = 0; i < nF; i++) {
      if (i === intlRefFIdx) continue
      globalAvgSum += avgSim[i]; globalAvgCnt++
      if (avgSim[i] < isolatedMin) { isolatedMin = avgSim[i]; isolatedIdx = i }
    }
    const globalAvg = globalAvgCnt ? globalAvgSum / globalAvgCnt : 0

    // Std dev of raw off-diagonal country-to-country pairs (calibrates colour scale)
    let pairSumSq = 0, pairSum = 0, pairCnt = 0
    for (let i = 0; i < nF; i++) {
      if (i === intlRefFIdx) continue
      for (let j = i + 1; j < nF; j++) {
        if (j === intlRefFIdx) continue
        pairSum += sim[i][j]; pairSumSq += sim[i][j] ** 2; pairCnt++
      }
    }
    const globalStd = pairCnt > 1
      ? Math.sqrt(Math.max(0, pairSumSq / pairCnt - (pairSum / pairCnt) ** 2))
      : 0.074

    // Exclude intra-EU pairs and the intl-ref column from "most aligned" — both
    // reflect structural inheritance rather than independent policy convergence.
    let topSim = 0, topI = 0, topJ = 1
    for (let i = 0; i < nF; i++) {
      if (i === intlRefFIdx) continue
      for (let j = i + 1; j < nF; j++) {
        if (j === intlRefFIdx) continue
        if (EU_MEMBER_COUNTRIES.has(fCols[i]) && EU_MEMBER_COUNTRIES.has(fCols[j])) continue
        if (sim[i][j] > topSim) { topSim = sim[i][j]; topI = i; topJ = j }
      }
    }

    const colRegionOf = fCols.map(c => colRegion(c))
    let withinSum = 0, withinCnt = 0, crossSum = 0, crossCnt = 0
    for (let i = 0; i < nF; i++) for (let j = 0; j < nF; j++) {
      if (i === j) continue
      if (colRegionOf[i] === colRegionOf[j]) { withinSum += sim[i][j]; withinCnt++ }
      else                                   { crossSum  += sim[i][j]; crossCnt++ }
    }
    const withinAvg = withinCnt ? withinSum / withinCnt : 0
    const crossAvg  = crossCnt  ? crossSum  / crossCnt  : 0

    const usIdxs = fCols.map((c, i) => (c.startsWith('US-') && c !== 'US-FED') ? i : -1).filter(x => x >= 0)
    let usSum = 0, usCnt = 0
    for (const i of usIdxs) for (const j of usIdxs)
      if (i !== j) { usSum += sim[i][j]; usCnt++ }
    const usStateAvg = usCnt ? usSum / usCnt : 0

    // Per-region consistency: average pairwise similarity within each region
    const regionScores: { region: string; avg: number; count: number }[] = []
    for (const region of REGION_ORDER) {
      const idxs = fCols.map((_c, i) => colRegionOf[i] === region ? i : -1).filter(i => i >= 0)
      if (idxs.length < 2) continue
      let s = 0, cnt = 0
      for (const i of idxs) for (const j of idxs) {
        if (i !== j) { s += sim[i][j]; cnt++ }
      }
      regionScores.push({ region, avg: cnt ? s / cnt : 0, count: idxs.length })
    }
    regionScores.sort((a, b) => b.avg - a.avg)

    // Region×region cross-similarity matrix for the overview sidebar
    const presentRegions = REGION_ORDER.filter(region =>
      fCols.some(c => colRegion(c) === region && c !== INTL_REF_KEY)
    )
    const regionMatrix: number[][] = presentRegions.map((rA, ri) =>
      presentRegions.map((rB, rj) => {
        const idxsA = fCols.map((c, i) => (colRegion(c) === rA && c !== INTL_REF_KEY) ? i : -1).filter(x => x >= 0)
        const idxsB = fCols.map((c, i) => (colRegion(c) === rB && c !== INTL_REF_KEY) ? i : -1).filter(x => x >= 0)
        if (ri === rj) {
          let s = 0, cnt = 0
          for (const i of idxsA) for (const j of idxsA) if (i !== j) { s += sim[i][j]; cnt++ }
          return cnt ? s / cnt : NaN
        }
        let s = 0, cnt = 0
        for (const i of idxsA) for (const j of idxsB) { s += sim[i][j]; cnt++ }
        return cnt ? s / cnt : NaN
      })
    )

    return {
      cols: fCols, simMatrix: sim, scores: fScores, atRiskCols, substantiveRules,
      insights: { globalAvg, globalStd, isolatedIdx, topI, topJ, topSim, withinAvg, crossAvg, usStateAvg, avgSim, regionScores },
      regionMatrix, presentRegions, usHasStates,
    }
  }, [heatmapFilters, usCollapsed])

  const n = cols.length
  const { globalAvg, globalStd, topI, topJ, topSim, withinAvg, crossAvg } = insights
  const colorOf = (v: number) => simToColor(v, globalAvg, globalStd)
  const activeRules = substantiveRules

  // ── ordered display ──
  const order = useMemo(
    () => Array.from({ length: n }, (_, i) => i),
    [n],
  )

  // ── region boundaries ──
  const regionBounds = useMemo(() => {
    const s = new Set<number>()
    for (let p = 1; p < order.length; p++) {
      if (colRegion(cols[order[p]]) !== colRegion(cols[order[p - 1]])) s.add(p)
    }
    return s
  }, [order, cols])

  // ── rule comparison for clicked pair ──
  const comparison = useMemo(() => {
    if (!comparedPair) return null
    const { i, j } = comparedPair
    type RuleEntry = { ruleIdx: number; si: number; sj: number }
    const agreed: RuleEntry[] = [], onlyI: RuleEntry[] = [], onlyJ: RuleEntry[] = [], conflict: RuleEntry[] = []

    for (let k = 0; k < activeRules.length; k++) {
      const si = scores[i][k], sj = scores[j][k]
      const iCovered = si > 0, jCovered = sj > 0
      const iOpposes = si < 0, jOpposes = sj < 0

      if (iCovered && jCovered)                         agreed.push({ ruleIdx: k, si, sj })
      else if (iCovered && jOpposes)                    conflict.push({ ruleIdx: k, si, sj })
      else if (jCovered && iOpposes)                    conflict.push({ ruleIdx: k, si, sj })
      else if (iCovered && sj === 0)                    onlyI.push({ ruleIdx: k, si, sj })
      else if (jCovered && si === 0)                    onlyJ.push({ ruleIdx: k, si, sj })
    }
    return {
      agreed:   agreed.sort((a, b) => Math.min(b.si, b.sj) - Math.min(a.si, a.sj)).slice(0, 20),
      onlyI:    onlyI.sort((a, b) => b.si - a.si).slice(0, 30),
      onlyJ:    onlyJ.sort((a, b) => b.sj - a.sj).slice(0, 30),
      conflict: conflict.slice(0, 30),
    }
  }, [comparedPair, scores])

  return (
    <div>
      {/* ── header + controls ── */}
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="flex-shrink-0">
          <h2 className="text-sm font-semibold text-odl-text">Regulatory Convergence Map</h2>
          <p className="text-xs text-odl-muted mt-0.5">
            <Tip label="Cosine similarity" text="How similar two jurisdictions' AI rulebooks are — 0% means nothing in common, 100% means identical. Negative values mean active disagreement." /> of jurisdiction coverage profiles · {n} jurisdictions · <Tip label={`${activeRules.length} substantive rules`} text="Excludes definitions and administrative boilerplate. Only rules that say what you must or can't do." />
          </p>
          {/* inline stats strip */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[10px] text-odl-subtle">
              Avg similarity <span className="font-semibold text-odl-text">{(globalAvg * 100).toFixed(0)}%</span>
            </span>
            <span className="text-[10px] text-odl-subtle">·</span>
            <span className="text-[10px] text-odl-subtle">
              <Tip label="Within-region" text="How similar countries in the same region are to each other." /> <span className="font-semibold text-odl-text">{(withinAvg * 100).toFixed(0)}%</span>
              {' '}vs <Tip label="cross-region" text="How similar countries in different regions are to each other." /> <span className="font-semibold text-odl-text">{(crossAvg * 100).toFixed(0)}%</span>
            </span>
            <span className="text-[10px] text-odl-subtle">·</span>
            <span className="text-[10px] text-odl-subtle">
              <Tip label="Best aligned" text="The two jurisdictions that have converged most on the same rules. EU member pairs are excluded — they share law by default, so that's not really convergence." />: <span className="font-semibold text-odl-text">{colLabel(cols[topI])} ↔ {colLabel(cols[topJ])}</span>
              {' '}({(topSim * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {/* instrument checkboxes */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-odl-border rounded-md">
            {(Object.keys(BUCKET_LABELS) as LawBucket[]).map(bucket => (
              <label key={bucket} className="flex items-center gap-1.5 cursor-pointer select-none group" title={BUCKET_HINTS[bucket]}>
                <div
                  onClick={() => toggleBucket(bucket)}
                  className={`relative w-7 h-4 rounded-full transition-colors flex-shrink-0 ${heatmapFilters[bucket] ? 'bg-odl-accent' : 'bg-odl-border'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${heatmapFilters[bucket] ? 'translate-x-3' : ''}`} />
                </div>
                <span className="text-xs text-odl-muted group-hover:text-odl-text transition-colors whitespace-nowrap">{BUCKET_LABELS[bucket]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── legend ── */}
      <div className="panel p-3 mb-4 space-y-2">
        <div className="flex items-center gap-6 flex-wrap">
          {/* colour scale */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-odl-subtle">Conflict</span>
              <div className="h-2.5 w-28 rounded-sm" style={{ background: 'linear-gradient(to right, rgb(239,68,68), #ffffff, rgb(34,197,94))' }} />
              <span className="text-[9px] text-odl-subtle">Aligned</span>
            </div>
            <span className="text-[9px] text-odl-subtle">· white = no overlap</span>
          </div>
          {/* diagonal */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ background: DIAG_COL }} />
            <span className="text-[9px] text-odl-subtle">Same jurisdiction</span>
          </div>
          {/* region boundary */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 border-l-2 border-slate-400" />
            <span className="text-[9px] text-odl-subtle">Region boundary</span>
          </div>
          {/* preemption */}
          <div className="flex items-center gap-1">
            <span className="text-[9px]">⚠</span>
            <Tip label={<span className="text-[9px] text-odl-subtle">Federal preemption risk</span>}
              text="If Congress passes a federal AI law, some state laws could be overridden. ⚠ flags states where this risk has been identified." />
          </div>
          {/* interaction hint */}
          <span className="text-[9px] text-odl-subtle italic ml-auto">Click a label to rank · Click a cell to compare rules</span>
        </div>
        {/* region key */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-odl-border">
          {Object.entries(REGION_COLORS).map(([r, c]) => (
            <div key={r} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: c }} />
              <span className="text-[9px] text-odl-muted">{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── methodology note ── */}
      <div className="mb-3">
        <button
          onClick={() => setMethodologyOpen(v => !v)}
          className="flex items-center gap-1 text-[10px] text-odl-subtle hover:text-odl-muted transition-colors"
        >
          <span>{methodologyOpen ? '▾' : '▸'}</span>
          <span>ⓘ How this works</span>
        </button>
        {methodologyOpen && (
          <div className="mt-1.5 px-3 py-2 bg-odl-surface border border-odl-border rounded text-[10px] text-odl-muted leading-relaxed max-w-2xl">
            Each jurisdiction is represented as a vector of rule-coverage scores across {activeRules.length} substantive AI policy rules
            (definitions and institutional framework rules excluded to avoid boilerplate inflation).
            Similarity is the cosine of that vector — 100% means identical rule portfolios, 0% means no overlap, negative means explicit conflict.
            EU instruments cascade to all 27 member states; binding regional treaties cascade to members; non-binding international soft-law
            (OECD, UNESCO, G7) scores into a shared reference column rather than individual countries.
            {usHasStates && (usCollapsed
              ? ' The "United States" column shows the highest-coverage score across all federal and state laws combined.'
              : ' US federal and state laws are shown as separate columns.')}
          </div>
        )}
      </div>

      {/* ── main layout ── */}
      <div className="flex gap-4">

        {/* heatmap */}
        <div className="overflow-auto" style={{ maxHeight: '72vh' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `${LABEL_W}px repeat(${n}, ${CELL}px)` }}>

            {/* corner */}
            <div style={{ height: HEADER_H, position: 'sticky', top: 0, left: 0, zIndex: 4, background: 'white' }} />

            {/* column headers */}
            {order.map((origIdx, pos) => {
              const key      = cols[origIdx]
              const isSelCol = selected === origIdx
              const isAtRisk = atRiskCols.has(key)
              // Show expand/collapse toggle on the US collapsed column,
              // and a collapse toggle on US-FED (leftmost US column when expanded)
              const showExpand   = key === 'US' && usHasStates
              const showCollapse = key === 'US-FED' && usHasStates
              return (
                <div key={key} style={{
                  height: HEADER_H, width: CELL, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 3,
                  borderLeft: regionBounds.has(pos) ? '2px solid #CBD5E1' : undefined,
                  opacity: selected !== null && !isSelCol ? 0.3 : 1,
                  transition: 'opacity 0.15s', cursor: 'pointer',
                  position: 'sticky', top: 0, zIndex: 3, background: 'white',
                }}
                  onClick={() => setSelected(p => p === origIdx ? null : origIdx)}
                >
                  {(showExpand || showCollapse) && (
                    <div
                      title={showExpand ? 'Expand to individual US states' : 'Collapse US states'}
                      onClick={e => { e.stopPropagation(); setUsCollapsed(v => !v); setSelected(null); setCompared(null) }}
                      style={{
                        fontSize: 13, lineHeight: 1, marginBottom: 4, cursor: 'pointer',
                        color: REGION_COLORS['North America'],
                        background: '#EFF6FF', borderRadius: 3, padding: '1px 2px',
                        border: `1px solid ${REGION_COLORS['North America']}`,
                      }}
                    >
                      {showExpand ? '⊞' : '⊟'}
                    </div>
                  )}
                  <span style={{
                    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                    fontSize: 9, whiteSpace: 'nowrap',
                    color: isSelCol ? '#0369A1' : REGION_COLORS[colRegion(key)] ?? '#64748B',
                    fontWeight: isSelCol ? 700 : 400,
                  }}>
                    {colLabel(key)}{isAtRisk ? ' ⚠' : ''}
                  </span>
                </div>
              )
            })}

            {/* rows */}
            {order.map((rowOrig, rowPos) => {
              const rowKey   = cols[rowOrig]
              const isSelRow = selected === rowOrig
              const bTop     = regionBounds.has(rowPos) ? '2px solid #CBD5E1' : '1px solid transparent'

              return (
                <Fragment key={rowKey}>
                  {/* row label */}
                  <div title={`${colLabel(rowKey)}${atRiskCols.has(rowKey) ? ' ⚠ Some laws have federal preemption risk' : ''}`} style={{
                    height: CELL, display: 'flex', alignItems: 'center',
                    justifyContent: 'flex-end', paddingRight: 5, borderTop: bTop,
                    opacity: selected !== null && !isSelRow ? 0.3 : 1,
                    transition: 'opacity 0.15s', cursor: 'pointer',
                    position: 'sticky', left: 0, zIndex: 2, background: 'white',
                  }}
                    onClick={() => setSelected(p => p === rowOrig ? null : rowOrig)}
                  >
                    <span style={{
                      fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis', maxWidth: LABEL_W - 8,
                      color: isSelRow ? '#0369A1' : REGION_COLORS[colRegion(rowKey)] ?? '#64748B',
                      fontWeight: isSelRow ? 700 : 400,
                      direction: 'rtl', unicodeBidi: 'plaintext',
                    }}>
                      {colLabel(rowKey)}{atRiskCols.has(rowKey) ? ' ⚠' : ''}
                    </span>
                  </div>

                  {/* cells */}
                  {order.map((colOrig, colPos) => {
                    const isDiag  = rowOrig === colOrig
                    const sv      = simMatrix[rowOrig][colOrig]
                    const isHov   = hover?.i === rowOrig && hover?.j === colOrig
                    const isComp  = comparedPair?.i === rowOrig && comparedPair?.j === colOrig
                    const isSelRC = selected === rowOrig || selected === colOrig
                    return (
                      <div key={cols[colOrig]} style={{
                        width: CELL, height: CELL,
                        background: isDiag ? DIAG_COL : colorOf(sv),
                        borderTop:  bTop,
                        borderLeft: regionBounds.has(colPos) ? '2px solid #CBD5E1' : undefined,
                        outline: isComp ? '2px solid #7C3AED' : isHov ? '2px solid #0369A1' : undefined,
                        zIndex: (isComp || isHov) ? 5 : undefined,
                        position: 'relative',
                        opacity: selected !== null && !isSelRC ? 0.25 : 1,
                        transition: 'opacity 0.15s',
                        cursor: isDiag ? 'default' : 'pointer',
                      }}
                        onMouseEnter={e => !isDiag && setHover({ i: rowOrig, j: colOrig, x: e.clientX, y: e.clientY })}
                        onMouseMove={e  => !isDiag && setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : null)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => !isDiag && setCompared(p =>
                          p?.i === rowOrig && p?.j === colOrig ? null : { i: rowOrig, j: colOrig }
                        )}
                      />
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        </div>

        {/* sidebar */}
        <div className="w-72 flex-shrink-0 panel p-3 overflow-y-auto" style={{ maxHeight: '72vh' }}>

            {/* region×region overview (empty state) */}
            {selected === null && comparedPair === null && (
              <>
                <div className="text-[10px] font-semibold text-odl-text mb-0.5">Cross-Region Similarity</div>
                <div className="text-[9px] text-odl-subtle mb-2">Average regulatory alignment between region pairs · click a cell or label on the map to drill in</div>
                <div className="overflow-x-auto">
                  <table className="border-collapse" style={{ fontSize: 8 }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 10 }} />
                        {presentRegions.map(r => (
                          <th key={r} className="pb-1 font-normal" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 90, verticalAlign: 'bottom', width: 30 }}>
                            <span style={{ color: REGION_COLORS[r] ?? '#64748B' }}>{REGION_SHORT[r] ?? r}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {presentRegions.map((rA, ri) => (
                        <tr key={rA}>
                          <td className="pr-1.5 font-normal whitespace-nowrap text-right" style={{ color: REGION_COLORS[rA] ?? '#64748B' }}>
                            {REGION_SHORT[rA] ?? rA}
                          </td>
                          {presentRegions.map((rB, rj) => {
                            const v = regionMatrix[ri]?.[rj]
                            const isDiag = ri === rj
                            const bg = isNaN(v) ? '#F1F5F9' : simToColor(v, globalAvg, globalStd)
                            // Use dark text on light cells, light text on dark cells
                            const textColor = (!isNaN(v) && v > globalAvg) ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.45)'
                            return (
                              <td key={rB}
                                title={`${rA} × ${rB}: ${isNaN(v) ? 'n/a' : (v * 100).toFixed(0) + '%'}`}
                                style={{
                                  width: 30, height: 26,
                                  background: isDiag && isNaN(v) ? '#F1F5F9' : bg,
                                  border: '1px solid #E2E8F0',
                                  textAlign: 'center', verticalAlign: 'middle',
                                  color: textColor,
                                  fontWeight: isDiag ? 600 : 400,
                                }}
                              >
                                {!isNaN(v) ? `${(v * 100).toFixed(0)}%` : ''}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-[8px] text-odl-subtle mt-1.5 italic">Diagonal = within-region consistency</div>
              </>
            )}

            {/* similarity ranking (selected jurisdiction) */}
            {selected !== null && comparedPair === null && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-semibold text-odl-text">{colLabel(cols[selected])}</div>
                    <div className="text-[9px] text-odl-subtle">similarity ranking · click a cell to compare rules</div>
                  </div>
                  <button className="text-odl-subtle hover:text-odl-text text-sm" onClick={() => setSelected(null)}>×</button>
                </div>
                <div className="space-y-1.5">
                  {Array.from({ length: n }, (_, i) => i)
                    .filter(i => i !== selected)
                    .sort((a, b) => simMatrix[selected][b] - simMatrix[selected][a])
                    .map(j => {
                      const sv = simMatrix[selected][j]
                      const lbl = colLabel(cols[j])
                      return (
                        <div key={cols[j]}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-odl-muted truncate mr-1" title={lbl}>{lbl}</span>
                            <span className="text-[10px] font-medium flex-shrink-0" style={{ color: colorOf(sv) }}>
                              {(sv * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-odl-surface rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${sv * 100}%`, background: colorOf(sv) }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </>
            )}

            {/* rule comparison (clicked pair) */}
            {comparedPair !== null && comparison !== null && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-semibold text-odl-text leading-tight">
                      {colLabel(cols[comparedPair.i])} × {colLabel(cols[comparedPair.j])}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-1.5 w-16 rounded-full bg-odl-surface overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${simMatrix[comparedPair.i][comparedPair.j] * 100}%`,
                          background: colorOf(simMatrix[comparedPair.i][comparedPair.j]),
                        }} />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: colorOf(simMatrix[comparedPair.i][comparedPair.j]) }}>
                        {(simMatrix[comparedPair.i][comparedPair.j] * 100).toFixed(0)}% similar
                      </span>
                    </div>
                  </div>
                  <button className="text-odl-subtle hover:text-odl-text text-sm" onClick={() => setCompared(null)}>×</button>
                </div>

                {(() => {
                  const labelA = colLabel(cols[comparedPair.i])
                  const labelB = colLabel(cols[comparedPair.j])
                  const colKeyA = cols[comparedPair.i]
                  const colKeyB = cols[comparedPair.j]

                  function getSourceLaws(rule: typeof activeRules[0], colKey: string) {
                    const matches = rule.instances.filter(inst => {
                      const law = LAW_BY_ID.get(inst.law_id)
                      if (!law || !heatmapFilters[classifyLaw(law)]) return false
                      if ((REL_SCORE[inst.relationship] ?? 0) <= 0) return false
                      const k = lawColKey(law)
                      if (colKey === 'US') return k === 'US-FED' || k.startsWith('US-')
                      if (EU_MEMBER_COUNTRIES.has(colKey)) return k === colKey || k === 'regional:EU'
                      return k === colKey
                    })
                    matches.sort((a, b) => (REL_SCORE[b.relationship] ?? 0) - (REL_SCORE[a.relationship] ?? 0))
                    const seen = new Set<string>()
                    return matches
                      .filter(inst => { if (seen.has(inst.law_id)) return false; seen.add(inst.law_id); return true })
                      .slice(0, 3)
                      .map(inst => LAW_BY_ID.get(inst.law_id)!)
                  }

                  function RuleCard({ ruleIdx, si, sj, borderColor }: { ruleIdx: number; si: number; sj: number; borderColor: string }) {
                    const rule = activeRules[ruleIdx]
                    const isExpanded = expanded.has(rule.rule_id)
                    const truncated = rule.rule_text.length > 100
                    return (
                      <div
                        className="text-[10px] pl-2 cursor-pointer"
                        style={{ borderLeft: `2px solid ${borderColor}` }}
                        onClick={() => setExpanded(prev => {
                          const next = new Set(prev)
                          next.has(rule.rule_id) ? next.delete(rule.rule_id) : next.add(rule.rule_id)
                          return next
                        })}
                      >
                        <div className="text-[8px] font-medium mb-0.5" style={{ color: borderColor }}>
                          {RULE_CATEGORY_LABELS[rule.category as keyof typeof RULE_CATEGORY_LABELS] ?? rule.category}
                        </div>
                        <div className="text-odl-muted leading-snug mb-1">
                          {isExpanded ? rule.rule_text : rule.rule_text.slice(0, 100)}
                          {!isExpanded && truncated && <span className="text-odl-subtle"> …<span className="underline decoration-dotted ml-0.5">more</span></span>}
                          {isExpanded && truncated && <span className="text-odl-subtle ml-0.5 underline decoration-dotted">less</span>}
                        </div>
                        <div className="flex flex-col gap-1 text-[9px]">
                          <div>
                            <span className="text-odl-subtle">
                              {labelA}: <span className={`font-medium ${si >= 3 ? 'text-odl-text' : si < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                <Tip label={stanceLabel(si)} text={STANCE_TIPS[stanceLabel(si)]} />
                              </span>
                            </span>
                            {si > 0 && (
                              <div className="flex flex-wrap gap-0.5 mt-0.5">
                                {getSourceLaws(rule, colKeyA).map(law => (
                                  <button key={law.id}
                                    onClick={e => { e.stopPropagation(); onViewLaw?.(law.id) }}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] text-odl-muted hover:text-odl-accent transition-colors border border-odl-border bg-odl-surface hover:bg-white">
                                    {law.short_name} ↗
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-odl-subtle">
                              {labelB}: <span className={`font-medium ${sj >= 3 ? 'text-odl-text' : sj < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                <Tip label={stanceLabel(sj)} text={STANCE_TIPS[stanceLabel(sj)]} />
                              </span>
                            </span>
                            {sj > 0 && (
                              <div className="flex flex-wrap gap-0.5 mt-0.5">
                                {getSourceLaws(rule, colKeyB).map(law => (
                                  <a key={law.id} href={law.official_text_url ?? law.summary_url ?? '#'} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] text-odl-muted hover:text-odl-accent transition-colors border border-odl-border bg-odl-surface hover:bg-white">
                                    {law.short_name} ↗
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <>
                      {/* Disagreements — explicit conflict (one adopted, other opposed) */}
                      {comparison.conflict.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[9px] font-semibold text-red-700 uppercase tracking-wide mb-1.5">
                            Disagreements · {comparison.conflict.length} rule{comparison.conflict.length !== 1 ? 's' : ''}
                          </div>
                          <div className="space-y-2">
                            {comparison.conflict.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#FCA5A5" />)}
                          </div>
                        </div>
                      )}

                      {/* Gaps — one jurisdiction has legislated, the other hasn't */}
                      {(comparison.onlyI.length > 0 || comparison.onlyJ.length > 0) && (
                        <div className="mb-3">
                          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            Gaps · {comparison.onlyI.length + comparison.onlyJ.length} rules
                          </div>
                          {comparison.onlyI.length > 0 && (
                            <div className="mb-2">
                              <div className="text-[9px] text-slate-400 font-medium mb-1">
                                In {labelA} · not in {labelB} — {comparison.onlyI.length}
                              </div>
                              <div className="space-y-2">
                                {comparison.onlyI.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#CBD5E1" />)}
                              </div>
                            </div>
                          )}
                          {comparison.onlyJ.length > 0 && (
                            <div className="mb-2">
                              <div className="text-[9px] text-slate-400 font-medium mb-1">
                                In {labelB} · not in {labelA} — {comparison.onlyJ.length}
                              </div>
                              <div className="space-y-2">
                                {comparison.onlyJ.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#CBD5E1" />)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Alignments — both jurisdictions have legislated */}
                      {comparison.agreed.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
                            Alignments · {comparison.agreed.length} rules
                          </div>
                          <div className="space-y-2">
                            {comparison.agreed.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#6EE7B7" />)}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </>
            )}
          </div>
      </div>

      {/* ── hover tooltip ── */}
      {hover && !comparedPair && (() => {
        const { i, j } = hover
        const sv = simMatrix[i][j]
        // find top shared rules (both score ≥ 3) for the tooltip
        const sharedRules: { ruleIdx: number; si: number; sj: number }[] = []
        for (let k = 0; k < activeRules.length; k++) {
          const si = scores[i][k], sj = scores[j][k]
          if (si >= 3 && sj >= 3) sharedRules.push({ ruleIdx: k, si, sj })
        }
        sharedRules.sort((a, b) => Math.min(b.si, b.sj) - Math.min(a.si, a.sj))
        const onlyICount = scores[i].filter((s, k) => s >= 3 && scores[j][k] < 2).length
        const onlyJCount = scores[j].filter((s, k) => s >= 3 && scores[i][k] < 2).length

        return (
          <div style={{
            position: 'fixed',
            left: Math.min(hover.x + 14, window.innerWidth  - 320),
            top:  Math.min(hover.y + 14, window.innerHeight - 260),
            zIndex: 9999, background: 'white', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '10px 12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
            pointerEvents: 'none', width: 300,
          }}>
            {/* header */}
            <div className="text-[11px] font-semibold text-odl-text mb-1">
              {colLabel(cols[i])} × {colLabel(cols[j])}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 flex-1 rounded-full bg-odl-surface overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${sv * 100}%`, background: colorOf(sv) }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: colorOf(sv) }}>
                {(sv * 100).toFixed(0)}% similarity
              </span>
            </div>

            {/* shared rules */}
            {sharedRules.length > 0 ? (
              <>
                <div className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                  {sharedRules.length} shared rules · top examples
                </div>
                <div className="space-y-1.5 mb-2">
                  {sharedRules.slice(0, 3).map(({ ruleIdx, si, sj }) => {
                    const rule = activeRules[ruleIdx]
                    return (
                      <div key={rule.rule_id} className="text-[10px]">
                        <div className="text-[8px] text-emerald-600 font-medium">
                          {RULE_CATEGORY_LABELS[rule.category as keyof typeof RULE_CATEGORY_LABELS] ?? rule.category}
                        </div>
                        <div className="text-odl-muted leading-snug">
                          {rule.rule_text.slice(0, 85)}{rule.rule_text.length > 85 ? '…' : ''}
                        </div>
                        <div className="text-[8px] text-odl-subtle mt-0.5">
                          {colLabel(cols[i])}: {stanceLabel(si)} · {colLabel(cols[j])}: {stanceLabel(sj)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="text-[10px] text-odl-subtle mb-2">No strongly shared rules.</div>
            )}

            {/* divergence counts */}
            <div className="flex gap-3 text-[9px] border-t border-odl-border pt-1.5">
              <span className="text-sky-600">{onlyICount} rules unique to {colLabel(cols[i])}</span>
              <span className="text-amber-600">{onlyJCount} rules unique to {colLabel(cols[j])}</span>
            </div>
            <div className="text-[8px] text-odl-subtle mt-1">click to see full rule-by-rule breakdown</div>
          </div>
        )
      })()}

    </div>
  )
}
