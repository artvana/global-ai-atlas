import { useState, useMemo, Fragment } from 'react'
import type { AILaw } from '../types'
import { RULE_CATEGORY_LABELS } from '../types'
import { rules as allRules } from '../data/rules'
import { regulations } from '../data/regulations'

// ── relationship → numeric score ──────────────────────────────────────────────

const REL_SCORE: Record<string, number> = {
  origin: 4, identical: 4, agrees: 4, similar: 3, opposed: -1, absent: 0,
}

// Pairwise-meaningful stance labels — describes a jurisdiction's own position,
// not its relationship to a canonical origin rule
function stanceLabel(score: number): string {
  if (score >= 4) return 'Fully adopted'
  if (score >= 3) return 'Partially adopted'
  if (score < 0)  return 'Explicitly opposes'
  return 'Not regulated'
}

// ── region / jurisdiction helpers ─────────────────────────────────────────────

const REGION_ORDER = [
  'Supranational',
  'USA',
  'Canada',
  'Latin America',
  'Western Europe',
  'Eastern Europe & Central Asia',
  'East Asia',
  'South Asia',
  'Southeast Asia',
  'Pacific',
  'Middle East & North Africa',
  'Sub-Saharan Africa',
  'Other',
]

const REGION_COLORS: Record<string, string> = {
  Supranational:                   '#6D28D9',
  USA:                             '#1D4ED8',
  Canada:                          '#0891B2',
  'Latin America':                 '#0D9488',
  'Western Europe':                '#059669',
  'Eastern Europe & Central Asia': '#4D7C0F',
  'East Asia':                     '#D97706',
  'South Asia':                    '#A16207',
  'Southeast Asia':                '#B45309',
  Pacific:                         '#0C4A6E',
  'Middle East & North Africa':    '#DC2626',
  'Sub-Saharan Africa':            '#9D174D',
  Other:                           '#64748B',
}

const COUNTRY_REGION: Record<string, string> = {
  // Canada
  Canada: 'Canada',
  // Latin America & Caribbean
  Brazil: 'Latin America', Mexico: 'Latin America', Argentina: 'Latin America',
  Chile: 'Latin America', Colombia: 'Latin America', Peru: 'Latin America',
  Ecuador: 'Latin America', Uruguay: 'Latin America', Panama: 'Latin America',
  Paraguay: 'Latin America', 'Costa Rica': 'Latin America',
  'Dominican Republic': 'Latin America', 'Trinidad and Tobago': 'Latin America',
  // Western Europe (non-EU members; EU members handled via EU_MEMBER_COUNTRIES)
  'United Kingdom': 'Western Europe',
  Switzerland:      'Western Europe',
  Norway:           'Western Europe',
  Iceland:          'Western Europe',
  // Eastern Europe & Central Asia
  Russia:      'Eastern Europe & Central Asia',
  Ukraine:     'Eastern Europe & Central Asia',
  Serbia:      'Eastern Europe & Central Asia',
  Turkey:      'Eastern Europe & Central Asia',
  Kazakhstan:  'Eastern Europe & Central Asia',
  Uzbekistan:  'Eastern Europe & Central Asia',
  Azerbaijan:  'Eastern Europe & Central Asia',
  Kyrgyzstan:  'Eastern Europe & Central Asia',
  Tajikistan:  'Eastern Europe & Central Asia',
  Moldova:     'Eastern Europe & Central Asia',
  // East Asia
  China:                   'East Asia',
  Japan:                   'East Asia',
  'South Korea':           'East Asia',
  Taiwan:                  'East Asia',
  'Hong Kong':             'East Asia',
  'China (Hong Kong SAR)': 'East Asia',
  // South Asia
  India:      'South Asia',
  Bangladesh: 'South Asia',
  Pakistan:   'South Asia',
  'Sri Lanka': 'South Asia',
  Bhutan:     'South Asia',
  Nepal:      'South Asia',
  // Southeast Asia
  Singapore:           'Southeast Asia',
  Indonesia:           'Southeast Asia',
  Malaysia:            'Southeast Asia',
  Philippines:         'Southeast Asia',
  Thailand:            'Southeast Asia',
  Vietnam:             'Southeast Asia',
  'Brunei Darussalam': 'Southeast Asia',
  // Pacific
  Australia:    'Pacific',
  'New Zealand': 'Pacific',
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
}

const REGIONAL_LABELS: Record<string, string> = {
  EU: 'European Union', CoE: 'Council of Europe',
  International: 'International / UN', APAC: 'APAC Regional', Africa: 'African Union',
}

const US_STATE_NAMES: Record<string, string> = {
  'US-AL': 'Alabama',        'US-AR': 'Arkansas',       'US-AZ': 'Arizona',
  'US-CA': 'California',     'US-CO': 'Colorado',       'US-CT': 'Connecticut',
  'US-DE': 'Delaware',       'US-FL': 'Florida',        'US-GA': 'Georgia',
  'US-HI': 'Hawaii',         'US-IA': 'Iowa',           'US-ID': 'Idaho',
  'US-IL': 'Illinois',       'US-IN': 'Indiana',        'US-KS': 'Kansas',
  'US-KY': 'Kentucky',       'US-LA': 'Louisiana',      'US-MD': 'Maryland',
  'US-ME': 'Maine',          'US-MI': 'Michigan',       'US-MN': 'Minnesota',
  'US-MS': 'Mississippi',    'US-MT': 'Montana',        'US-NC': 'North Carolina',
  'US-ND': 'North Dakota',   'US-NE': 'Nebraska',       'US-NH': 'New Hampshire',
  'US-NM': 'New Mexico',     'US-NV': 'Nevada',         'US-NY': 'New York',
  'US-NYC': 'New York City', 'US-OH': 'Ohio',           'US-OR': 'Oregon',
  'US-PA': 'Pennsylvania',   'US-RI': 'Rhode Island',   'US-SC': 'South Carolina',
  'US-SD': 'South Dakota',   'US-TN': 'Tennessee',      'US-TX': 'Texas',
  'US-UT': 'Utah',           'US-VT': 'Vermont',        'US-WA': 'Washington',
  'US-WI': 'Wisconsin',      'US-WV': 'West Virginia',  'US-WY': 'Wyoming',
  'US-PR': 'Puerto Rico',   'US-DC': 'Washington D.C.',
}

function lawColKey(law: AILaw): string {
  if (law.country === 'Global / Regional') return `regional:${law.region}`
  if (law.country === 'United States') return law.region === 'US' ? 'US-FED' : law.region
  return law.country
}

function colLabel(key: string): string {
  if (key.startsWith('regional:')) return REGIONAL_LABELS[key.slice(9)] ?? key.slice(9)
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

function colRegion(key: string): string {
  if (key === 'regional:EU') return 'Western Europe'
  if (key.startsWith('regional:')) return 'Supranational'
  if (key === 'US-FED' || key.startsWith('US-')) return 'USA'
  if (EU_MEMBER_COUNTRIES.has(key)) return 'Western Europe'
  return COUNTRY_REGION[key] ?? 'Other'
}

function colSortKey(key: string): string {
  const r = REGION_ORDER.indexOf(colRegion(key)).toString().padStart(2, '0')
  if (key === 'regional:EU') return `${r}_AA_European Union`  // EU sorts first within Europe
  if (key === 'US-FED') return `${r}_US_0`
  if (key.startsWith('US-')) return `${r}_US_1_${colLabel(key)}`
  return `${r}_ZZ_${colLabel(key)}`
}

// ── color mapping ─────────────────────────────────────────────────────────────

function simToColor(v: number): string {
  if (v < 0) {
    // Red for active conflict — saturates around -0.2
    const t = Math.pow(Math.min(1, -v * 5), 0.7)
    return `rgb(255,${Math.round(255 - t * 195)},${Math.round(255 - t * 195)})`
  }
  const t = Math.pow(Math.max(0, Math.min(1, v)), 0.65)
  if (t < 0.5) {
    const s = t / 0.5
    return `rgb(${Math.round(248 + s * (56 - 248))},${Math.round(250 + s * (189 - 250))},${Math.round(252 + s * (248 - 252))})`
  }
  const s = (t - 0.5) / 0.5
  return `rgb(${Math.round(56 + s * (7 - 56))},${Math.round(189 + s * (89 - 189))},${Math.round(248 + s * (133 - 248))})`
}

// ── greedy nearest-neighbour seriation ────────────────────────────────────────

function greedySeriation(sim: number[][], n: number): number[] {
  let bestAvg = -1, start = 0
  for (let i = 0; i < n; i++) {
    const avg = sim[i].reduce((s, x) => s + x, 0) / n
    if (avg > bestAvg) { bestAvg = avg; start = i }
  }
  const visited = new Set([start])
  const order = [start]
  let cur = start
  while (order.length < n) {
    let best = -1, bestJ = -1
    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && sim[cur][j] > best) { best = sim[cur][j]; bestJ = j }
    }
    if (bestJ < 0) break
    visited.add(bestJ); order.push(bestJ); cur = bestJ
  }
  for (let i = 0; i < n; i++) if (!visited.has(i)) order.push(i)
  return order
}

// ── layout constants ──────────────────────────────────────────────────────────

const CELL     = 13
const HEADER_H = 114
const LABEL_W  = 136
const DIAG_COL = '#FFFFFF'

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

export function SimilarityHeatmap() {
  const [sortMode, setSortMode]           = useState<'region' | 'cluster'>('region')
  const [heatmapFilters, setHeatmapFilters] = useState<HeatmapFilters>(DEFAULT_HEATMAP_FILTERS)
  const [selected, setSelected]           = useState<number | null>(null)
  const [hover, setHover]                 = useState<HoverState | null>(null)
  const [comparedPair, setCompared]       = useState<ComparedPair | null>(null)
  const [expanded, setExpanded]           = useState<Set<string>>(new Set())

  const toggleBucket = (bucket: LawBucket) => {
    setHeatmapFilters(f => ({ ...f, [bucket]: !f[bucket] }))
    setSelected(null)
    setCompared(null)
  }

  // ── compute coverage vectors + cosine similarity ──
  const { cols, simMatrix, scores, atRiskCols, insights, substantiveRules } = useMemo(() => {
    const candidateLaws = regulations.filter(l => heatmapFilters[classifyLaw(l)])
    const candidateIds = new Set(candidateLaws.map(l => l.id))
    const lawById = new Map(regulations.map(l => [l.id, l]))

    // Exclude definitions_scope from similarity — definitional boilerplate creates
    // false convergence signal that obscures genuine substantive policy alignment.
    const substantiveRules = allRules.filter(r => r.category !== 'definitions_scope' && r.category !== 'institutional_framework')
    const m = substantiveRules.length

    // EU expansion only applies when in-force laws are included — EU law is binding on all 27 members.
    const applyEuExpansion = heatmapFilters.in_force

    // Compute EU baseline scores for expansion (binding EU laws only)
    const euScoreVec = new Array(m).fill(0) as number[]
    if (applyEuExpansion) {
      substantiveRules.forEach((rule, rIdx) => {
        rule.instances.forEach(inst => {
          const law = lawById.get(inst.law_id)
          if (!law?.instrument_binding || lawColKey(law) !== 'regional:EU') return
          const sc = REL_SCORE[inst.relationship] ?? 0
          if (sc > 0 && sc > euScoreVec[rIdx]) euScoreVec[rIdx] = sc
          else if (sc < 0 && euScoreVec[rIdx] === 0) euScoreVec[rIdx] = sc
        })
      })
    }

    const colKeySet = new Set<string>()
    candidateLaws.forEach(l => {
      const k = lawColKey(l)
      if (k !== 'regional:EU') colKeySet.add(k)
    })
    if (applyEuExpansion) EU_MEMBER_COUNTRIES.forEach(c => colKeySet.add(c))
    const cols = [...colKeySet].sort((a, b) => colSortKey(a).localeCompare(colSortKey(b)))
    const n    = cols.length
    const ci   = new Map(cols.map((c, i) => [c, i]))

    // scores[col][rule]: positive = adopted (3–4), negative (−1) = explicitly opposes, 0 = absent
    const scores: number[][] = Array.from({ length: n }, () => new Array(m).fill(0))
    substantiveRules.forEach((rule, rIdx) => {
      rule.instances.forEach(inst => {
        if (!candidateIds.has(inst.law_id)) return
        const law = lawById.get(inst.law_id)
        if (!law) return
        const cIdx = ci.get(lawColKey(law))
        if (cIdx === undefined) return
        const sc = REL_SCORE[inst.relationship] ?? 0
        if (sc > 0 && sc > scores[cIdx][rIdx]) scores[cIdx][rIdx] = sc
        else if (sc < 0 && scores[cIdx][rIdx] === 0) scores[cIdx][rIdx] = sc
      })
    })

    // EU expansion: apply EU baseline as floor for all 27 member state columns
    if (applyEuExpansion) {
      const euMemberIdxs = cols.map((c, i) => EU_MEMBER_COUNTRIES.has(c) ? i : -1).filter(i => i >= 0)
      for (let rIdx = 0; rIdx < m; rIdx++) {
        const euSc = euScoreVec[rIdx]
        if (euSc <= 0) continue
        for (const mIdx of euMemberIdxs) {
          if (scores[mIdx][rIdx] < euSc) scores[mIdx][rIdx] = euSc
        }
      }
    }

    // Columns with at-risk preemption status (US state laws that may be federally preempted)
    const atRiskCols = new Set<string>()
    candidateLaws.forEach(l => {
      if ((l as any).preemption_status === 'at_risk') {
        const k = lawColKey(l)
        if (ci.has(k)) atRiskCols.add(k)
      }
    })

    // Similarity: norms use only positive (adoption) scores so opposition doesn't
    // inflate the denominator. Dot product weights conflict 3× to distinguish
    // active disagreement from mere absence.
    const CONFLICT_WEIGHT = 3
    const pos = (x: number) => Math.max(0, x)
    const norms = scores.map(v => Math.sqrt(v.reduce((s, x) => s + pos(x) ** 2, 0)))
    const sim: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (let i = 0; i < n; i++) {
      sim[i][i] = 1
      for (let j = i + 1; j < n; j++) {
        if (!norms[i] || !norms[j]) continue
        let dot = 0
        for (let k = 0; k < m; k++) {
          const si = scores[i][k], sj = scores[j][k]
          if      (si > 0 && sj > 0) dot += si * sj                       // agreement
          else if (si > 0 && sj < 0) dot += CONFLICT_WEIGHT * si * sj     // conflict (negative)
          else if (si < 0 && sj > 0) dot += CONFLICT_WEIGHT * si * sj     // conflict (negative)
          else if (si < 0 && sj < 0) dot += si * sj                       // shared opposition: weak positive
        }
        sim[i][j] = sim[j][i] = dot / (norms[i] * norms[j])
      }
    }

    // ── insights ──
    const avgSim = Array.from({ length: n }, (_, i) => {
      let s = 0; for (let j = 0; j < n; j++) if (i !== j) s += sim[i][j]
      return s / Math.max(n - 1, 1)
    })
    const globalAvg   = avgSim.reduce((s, x) => s + x, 0) / n
    const isolatedIdx = avgSim.indexOf(Math.min(...avgSim))

    // Exclude intra-EU pairs from "most aligned" — their similarity is structural
    // (shared EU law), not an independent policy convergence signal.
    let topSim = 0, topI = 0, topJ = 1
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        if (EU_MEMBER_COUNTRIES.has(cols[i]) && EU_MEMBER_COUNTRIES.has(cols[j])) continue
        if (sim[i][j] > topSim) { topSim = sim[i][j]; topI = i; topJ = j }
      }

    const colRegionOf = cols.map(c => colRegion(c))
    let withinSum = 0, withinCnt = 0, crossSum = 0, crossCnt = 0
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i === j) continue
      if (colRegionOf[i] === colRegionOf[j]) { withinSum += sim[i][j]; withinCnt++ }
      else                                   { crossSum  += sim[i][j]; crossCnt++ }
    }
    const withinAvg = withinCnt ? withinSum / withinCnt : 0
    const crossAvg  = crossCnt  ? crossSum  / crossCnt  : 0

    const usIdxs = cols.map((c, i) => (c.startsWith('US-') && c !== 'US-FED') ? i : -1).filter(x => x >= 0)
    let usSum = 0, usCnt = 0
    for (const i of usIdxs) for (const j of usIdxs)
      if (i !== j) { usSum += sim[i][j]; usCnt++ }
    const usStateAvg = usCnt ? usSum / usCnt : 0

    // Per-region consistency: average pairwise similarity within each region
    const regionScores: { region: string; avg: number; count: number }[] = []
    for (const region of REGION_ORDER) {
      const idxs = cols.map((_c, i) => colRegionOf[i] === region ? i : -1).filter(i => i >= 0)
      if (idxs.length < 2) continue
      let s = 0, cnt = 0
      for (const i of idxs) for (const j of idxs) {
        if (i !== j) { s += sim[i][j]; cnt++ }
      }
      regionScores.push({ region, avg: cnt ? s / cnt : 0, count: idxs.length })
    }
    regionScores.sort((a, b) => b.avg - a.avg)

    return {
      cols, simMatrix: sim, scores, atRiskCols, substantiveRules,
      insights: { globalAvg, isolatedIdx, topI, topJ, topSim, withinAvg, crossAvg, usStateAvg, avgSim, regionScores },
    }
  }, [heatmapFilters])

  const n = cols.length
  const { globalAvg, isolatedIdx, topI, topJ, topSim, withinAvg, crossAvg, usStateAvg, regionScores } = insights
  const activeRules = substantiveRules

  // ── ordered display ──
  const order = useMemo(
    () => sortMode === 'cluster' ? greedySeriation(simMatrix, n) : Array.from({ length: n }, (_, i) => i),
    [sortMode, simMatrix, n],
  )

  // ── region boundaries ──
  const regionBounds = useMemo(() => {
    if (sortMode === 'cluster') return new Set<number>()
    const s = new Set<number>()
    for (let p = 1; p < order.length; p++) {
      if (colRegion(cols[order[p]]) !== colRegion(cols[order[p - 1]])) s.add(p)
    }
    return s
  }, [order, cols, sortMode])

  // ── rule comparison for clicked pair ──
  const comparison = useMemo(() => {
    if (!comparedPair) return null
    const { i, j } = comparedPair
    type RuleEntry = { ruleIdx: number; si: number; sj: number }
    const agreed: RuleEntry[] = [], onlyI: RuleEntry[] = [], onlyJ: RuleEntry[] = [], conflict: RuleEntry[] = []

    for (let k = 0; k < activeRules.length; k++) {
      const si = scores[i][k], sj = scores[j][k]
      const iCovered = si >= 3, jCovered = sj >= 3
      const iOpposes = si < 0, jOpposes = sj < 0

      if (iCovered && jCovered)                         agreed.push({ ruleIdx: k, si, sj })
      else if (iCovered && jOpposes)                    conflict.push({ ruleIdx: k, si, sj })
      else if (jCovered && iOpposes)                    conflict.push({ ruleIdx: k, si, sj })
      else if (iCovered && sj === 0)                    onlyI.push({ ruleIdx: k, si, sj })
      else if (jCovered && si === 0)                    onlyJ.push({ ruleIdx: k, si, sj })
    }
    return {
      agreed:   agreed.sort((a, b) => Math.min(b.si, b.sj) - Math.min(a.si, a.sj)).slice(0, 20),
      onlyI:    onlyI.sort((a, b) => b.si - a.si).slice(0, 15),
      onlyJ:    onlyJ.sort((a, b) => b.sj - a.sj).slice(0, 15),
      conflict: conflict.slice(0, 10),
    }
  }, [comparedPair, scores])

  return (
    <div>
      {/* ── header + controls ── */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex-shrink-0">
          <h2 className="text-sm font-semibold text-odl-text">Regulatory Convergence Map</h2>
          <p className="text-xs text-odl-muted mt-0.5">
            Cosine similarity of jurisdiction coverage profiles · {n} jurisdictions · {activeRules.length} substantive rules (of {allRules.length} total)
          </p>
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
          {/* sort mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-odl-subtle">Order:</span>
            {(['region', 'cluster'] as const).map(m => (
              <button key={m} onClick={() => setSortMode(m)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  sortMode === m ? 'bg-odl-accent text-white' : 'text-odl-muted hover:text-odl-text border border-odl-border bg-white'
                }`}>
                {m === 'region' ? 'By Region' : 'Cluster'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── key findings ── */}
      <div className="panel p-4 mb-4">
        <div className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wider mb-3">Key Findings</div>
        <div className="grid grid-cols-4 divide-x divide-odl-border gap-0">

          <div className="pr-4">
            <div className="text-2xl font-semibold text-odl-text">{(globalAvg * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-odl-muted mt-0.5 leading-snug">avg. regulatory similarity across all {n}×{n} jurisdiction pairs</div>
          </div>

          <div className="px-4">
            <div className="text-xs font-semibold leading-tight" style={{ color: simToColor(topSim) }}>
              {colLabel(cols[topI])} · {colLabel(cols[topJ])}
            </div>
            <div className="text-[10px] font-bold mt-0.5" style={{ color: simToColor(topSim) }}>
              {(topSim * 100).toFixed(0)}% similar
            </div>
            <div className="text-[10px] text-odl-subtle mt-0.5">most aligned pair globally</div>
          </div>

          <div className="px-4">
            <div className="text-[10px] font-semibold text-odl-text mb-1.5">Regional Consistency</div>
            <div className="space-y-1">
              {regionScores.slice(0, 4).map(({ region, avg, count }) => (
                <div key={region} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-odl-muted truncate w-28 flex-shrink-0" title={region}>{region}</span>
                  <div className="h-1.5 flex-1 bg-odl-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${avg * 100}%`, background: simToColor(avg) }} />
                  </div>
                  <span className="text-[9px] font-medium flex-shrink-0" style={{ color: simToColor(avg) }}>{(avg * 100).toFixed(0)}%</span>
                  <span className="text-[8px] text-odl-subtle flex-shrink-0">({count})</span>
                </div>
              ))}
            </div>
            <div className="text-[8px] text-odl-subtle mt-1">within-region avg · {(withinAvg * 100).toFixed(0)}% vs {(crossAvg * 100).toFixed(0)}% cross-region</div>
          </div>

          <div className="pl-4">
            <div className="text-xs font-semibold text-odl-muted leading-tight">{colLabel(cols[isolatedIdx])}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{(insights.avgSim[isolatedIdx] * 100).toFixed(0)}% avg</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">most isolated · least integrated into global frameworks</div>
          </div>

        </div>

        {/* US states note */}
        {usStateAvg > 0 && (
          <div className="mt-3 pt-3 border-t border-odl-border flex items-center gap-2">
            <div className="text-[10px] text-odl-subtle">
              <span className="font-medium text-odl-muted">US state internal coherence:</span>{' '}
              states share {(usStateAvg * 100).toFixed(0)}% avg similarity with each other — driven by shared synthetic-media and employment-AI legislation.
            </div>
          </div>
        )}
      </div>

      {/* ── legend ── */}
      <div className="panel p-3 mb-4 space-y-2">
        <div className="flex items-center gap-6 flex-wrap">
          {/* colour scale */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-red-500">Conflict</span>
            <div className="h-2.5 w-32 rounded-sm" style={{ background: 'linear-gradient(to right, rgb(255,60,60), #F8FAFC, #38BDF8, #075985)' }} />
            <span className="text-[9px] font-semibold text-sky-700">Convergent</span>
          </div>
          {/* diagonal */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-odl-border" style={{ background: DIAG_COL }} />
            <span className="text-[9px] text-odl-subtle">Same jurisdiction</span>
          </div>
          {/* region boundary */}
          {sortMode === 'region' && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 border-l-2 border-slate-400" />
              <span className="text-[9px] text-odl-subtle">Region boundary</span>
            </div>
          )}
          {/* preemption */}
          <div className="flex items-center gap-1">
            <span className="text-[9px]">⚠</span>
            <span className="text-[9px] text-odl-subtle">Federal preemption risk</span>
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
              return (
                <div key={key} style={{
                  height: HEADER_H, width: CELL, display: 'flex',
                  alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3,
                  borderLeft: regionBounds.has(pos) ? '2px solid #CBD5E1' : undefined,
                  opacity: selected !== null && !isSelCol ? 0.3 : 1,
                  transition: 'opacity 0.15s', cursor: 'pointer',
                  position: 'sticky', top: 0, zIndex: 3, background: 'white',
                }}
                  onClick={() => setSelected(p => p === origIdx ? null : origIdx)}
                >
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
                        background: isDiag ? DIAG_COL : simToColor(sv),
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
        {(selected !== null || comparedPair !== null) && (
          <div className="w-64 flex-shrink-0 panel p-3 overflow-y-auto" style={{ maxHeight: '72vh' }}>

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
                            <span className="text-[10px] font-medium flex-shrink-0" style={{ color: simToColor(sv) }}>
                              {(sv * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-odl-surface rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${sv * 100}%`, background: simToColor(sv) }} />
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
                          background: simToColor(simMatrix[comparedPair.i][comparedPair.j]),
                        }} />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: simToColor(simMatrix[comparedPair.i][comparedPair.j]) }}>
                        {(simMatrix[comparedPair.i][comparedPair.j] * 100).toFixed(0)}% similar
                      </span>
                    </div>
                  </div>
                  <button className="text-odl-subtle hover:text-odl-text text-sm" onClick={() => setCompared(null)}>×</button>
                </div>

                {(() => {
                  const labelA = colLabel(cols[comparedPair.i])
                  const labelB = colLabel(cols[comparedPair.j])

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
                        <div className="flex flex-col gap-0.5 text-[9px]">
                          <span className="text-odl-subtle">
                            {labelA}: <span className={`font-medium ${si >= 3 ? 'text-odl-text' : si < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                              {stanceLabel(si)}
                            </span>
                          </span>
                          <span className="text-odl-subtle">
                            {labelB}: <span className={`font-medium ${sj >= 3 ? 'text-odl-text' : sj < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                              {stanceLabel(sj)}
                            </span>
                          </span>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <>
                      {/* Agreement */}
                      {comparison.agreed.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
                            Agreement · {comparison.agreed.length} rules
                          </div>
                          <div className="space-y-2">
                            {comparison.agreed.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#6EE7B7" />)}
                          </div>
                        </div>
                      )}

                      {/* Conflict */}
                      {comparison.conflict.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[9px] font-semibold text-red-700 uppercase tracking-wide mb-1.5">
                            Disagreement · {comparison.conflict.length} rules
                          </div>
                          <div className="space-y-2">
                            {comparison.conflict.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#FCA5A5" />)}
                          </div>
                        </div>
                      )}

                      {/* Unique to A */}
                      {comparison.onlyI.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[9px] font-semibold text-sky-700 uppercase tracking-wide mb-1.5">
                            Unique to {labelA} · {comparison.onlyI.length} rules
                          </div>
                          <div className="space-y-2">
                            {comparison.onlyI.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#93C5FD" />)}
                          </div>
                        </div>
                      )}

                      {/* Unique to B */}
                      {comparison.onlyJ.length > 0 && (
                        <div>
                          <div className="text-[9px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                            Unique to {labelB} · {comparison.onlyJ.length} rules
                          </div>
                          <div className="space-y-2">
                            {comparison.onlyJ.map(e => <RuleCard key={activeRules[e.ruleIdx].rule_id} {...e} borderColor="#FCD34D" />)}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </>
            )}
          </div>
        )}
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
                <div className="h-full rounded-full" style={{ width: `${sv * 100}%`, background: simToColor(sv) }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: simToColor(sv) }}>
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
