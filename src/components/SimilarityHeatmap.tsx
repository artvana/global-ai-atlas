import { useState, useMemo, Fragment } from 'react'
import type { AILaw } from '../types'
import { RULE_CATEGORY_LABELS } from '../types'
import { rules as allRules } from '../data/rules'
import { regulations } from '../data/regulations'

// ── relationship → numeric score ──────────────────────────────────────────────

const REL_SCORE: Record<string, number> = {
  origin: 5, identical: 4, agrees: 4, similar: 3, opposed: 2, absent: 0,
}

const REL_LABEL: Record<number, string> = {
  5: 'Origin', 4: 'Identical / agrees', 3: 'Similar', 2: 'Opposed', 0: 'Absent',
}

// ── region / jurisdiction helpers ─────────────────────────────────────────────

const REGION_ORDER = [
  'Supranational', 'Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa', 'Other',
]

const REGION_COLORS: Record<string, string> = {
  Supranational:           '#6D28D9',
  Americas:                '#0369A1',
  Europe:                  '#059669',
  'Asia-Pacific':          '#D97706',
  'Middle East & Africa':  '#DC2626',
  Other:                   '#64748B',
}

const COUNTRY_REGION: Record<string, string> = {
  Canada: 'Americas', Brazil: 'Americas', Mexico: 'Americas',
  Argentina: 'Americas', Chile: 'Americas', Colombia: 'Americas', Peru: 'Americas',
  'United Kingdom': 'Europe', France: 'Europe', Spain: 'Europe',
  Italy: 'Europe', Denmark: 'Europe', Finland: 'Europe',
  Ireland: 'Europe', Switzerland: 'Europe', Hungary: 'Europe',
  Serbia: 'Europe', Ukraine: 'Europe', Russia: 'Europe', Turkey: 'Europe',
  China: 'Asia-Pacific', Japan: 'Asia-Pacific', 'South Korea': 'Asia-Pacific',
  Australia: 'Asia-Pacific', 'New Zealand': 'Asia-Pacific', Singapore: 'Asia-Pacific',
  India: 'Asia-Pacific', Indonesia: 'Asia-Pacific', Malaysia: 'Asia-Pacific',
  Philippines: 'Asia-Pacific', Thailand: 'Asia-Pacific', Vietnam: 'Asia-Pacific',
  Taiwan: 'Asia-Pacific', Bangladesh: 'Asia-Pacific', Pakistan: 'Asia-Pacific',
  'Sri Lanka': 'Asia-Pacific', Kazakhstan: 'Asia-Pacific', Uzbekistan: 'Asia-Pacific',
  'United Arab Emirates': 'Middle East & Africa', 'Saudi Arabia': 'Middle East & Africa',
  Qatar: 'Middle East & Africa', Israel: 'Middle East & Africa',
  Egypt: 'Middle East & Africa', Morocco: 'Middle East & Africa',
  Tunisia: 'Middle East & Africa', 'South Africa': 'Middle East & Africa',
  Nigeria: 'Middle East & Africa', Kenya: 'Middle East & Africa',
  Rwanda: 'Middle East & Africa', Mauritius: 'Middle East & Africa',
  Ethiopia: 'Middle East & Africa',
}

const REGIONAL_LABELS: Record<string, string> = {
  EU: 'European Union', CoE: 'Council of Europe',
  International: 'International / UN', APAC: 'APAC Regional', Africa: 'African Union',
}

const US_STATE_NAMES: Record<string, string> = {
  'US-AR': 'Arkansas',       'US-CA': 'California',     'US-CO': 'Colorado',
  'US-CT': 'Connecticut',    'US-FL': 'Florida',        'US-GA': 'Georgia',
  'US-ID': 'Idaho',          'US-IL': 'Illinois',       'US-IN': 'Indiana',
  'US-KY': 'Kentucky',       'US-MD': 'Maryland',       'US-ME': 'Maine',
  'US-MI': 'Michigan',       'US-MN': 'Minnesota',      'US-MT': 'Montana',
  'US-NC': 'North Carolina', 'US-NE': 'Nebraska',       'US-NH': 'New Hampshire',
  'US-NV': 'Nevada',         'US-NY': 'New York',       'US-OR': 'Oregon',
  'US-TN': 'Tennessee',      'US-TX': 'Texas',          'US-UT': 'Utah',
  'US-WA': 'Washington',
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

function colRegion(key: string): string {
  if (key.startsWith('regional:')) return 'Supranational'
  if (key === 'US-FED' || key.startsWith('US-')) return 'Americas'
  return COUNTRY_REGION[key] ?? 'Other'
}

function colSortKey(key: string): string {
  const r = REGION_ORDER.indexOf(colRegion(key)).toString().padStart(2, '0')
  if (key === 'US-FED') return `${r}_US_0`
  if (key.startsWith('US-')) return `${r}_US_1_${colLabel(key)}`
  return `${r}_ZZ_${colLabel(key)}`
}

// ── color mapping ─────────────────────────────────────────────────────────────

function simToColor(v: number): string {
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

interface HoverState  { i: number; j: number; x: number; y: number }
interface ComparedPair { i: number; j: number }

export function SimilarityHeatmap() {
  const [sortMode, setSortMode]     = useState<'region' | 'cluster'>('region')
  const [selected, setSelected]     = useState<number | null>(null)
  const [hover, setHover]           = useState<HoverState | null>(null)
  const [comparedPair, setCompared] = useState<ComparedPair | null>(null)

  // ── compute coverage vectors + cosine similarity ──
  const { cols, simMatrix, scores, insights } = useMemo(() => {
    const bindingLaws = regulations.filter(l => l.instrument_binding)
    const colKeySet   = new Set<string>()
    bindingLaws.forEach(l => colKeySet.add(lawColKey(l)))
    const cols = [...colKeySet].sort((a, b) => colSortKey(a).localeCompare(colSortKey(b)))
    const n    = cols.length
    const ci   = new Map(cols.map((c, i) => [c, i]))
    const lawById = new Map(regulations.map(l => [l.id, l]))
    const m    = allRules.length

    // scores[col][rule] = best relationship score
    const scores: number[][] = Array.from({ length: n }, () => new Array(m).fill(0))
    allRules.forEach((rule, rIdx) => {
      rule.instances.forEach(inst => {
        const law = lawById.get(inst.law_id)
        if (!law?.instrument_binding) return
        const cIdx = ci.get(lawColKey(law))
        if (cIdx === undefined) return
        const sc = REL_SCORE[inst.relationship] ?? 0
        if (sc > scores[cIdx][rIdx]) scores[cIdx][rIdx] = sc
      })
    })

    // cosine similarity matrix
    const norms = scores.map(v => Math.sqrt(v.reduce((s, x) => s + x * x, 0)))
    const sim: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (let i = 0; i < n; i++) {
      sim[i][i] = 1
      for (let j = i + 1; j < n; j++) {
        if (!norms[i] || !norms[j]) continue
        let dot = 0
        for (let k = 0; k < m; k++) dot += scores[i][k] * scores[j][k]
        sim[i][j] = sim[j][i] = dot / (norms[i] * norms[j])
      }
    }

    // ── insights ──
    const avgSim = Array.from({ length: n }, (_, i) => {
      let s = 0; for (let j = 0; j < n; j++) if (i !== j) s += sim[i][j]
      return s / Math.max(n - 1, 1)
    })
    const globalAvg  = avgSim.reduce((s, x) => s + x, 0) / n
    const centralIdx = avgSim.indexOf(Math.max(...avgSim))
    const isolatedIdx = avgSim.indexOf(Math.min(...avgSim))

    let topSim = 0, topI = 0, topJ = 1
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        if (sim[i][j] > topSim) { topSim = sim[i][j]; topI = i; topJ = j }

    const colRegionOf = cols.map(c =>
      c.startsWith('regional:') ? 'Supranational'
      : (c === 'US-FED' || c.startsWith('US-')) ? 'Americas'
      : COUNTRY_REGION[c] ?? 'Other'
    )
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

    return {
      cols, simMatrix: sim, scores,
      insights: { globalAvg, centralIdx, isolatedIdx, topI, topJ, topSim, withinAvg, crossAvg, usStateAvg, avgSim },
    }
  }, [])

  const n = cols.length
  const { globalAvg, centralIdx, isolatedIdx, topI, topJ, topSim, withinAvg, crossAvg, usStateAvg } = insights

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
    const shared: RuleEntry[] = [], onlyI: RuleEntry[] = [], onlyJ: RuleEntry[] = []

    for (let k = 0; k < allRules.length; k++) {
      const si = scores[i][k], sj = scores[j][k]
      if (si >= 3 && sj >= 3) shared.push({ ruleIdx: k, si, sj })
      else if (si >= 3 && sj < 2) onlyI.push({ ruleIdx: k, si, sj })
      else if (sj >= 3 && si < 2) onlyJ.push({ ruleIdx: k, si, sj })
    }
    return {
      shared: shared.sort((a, b) => Math.min(b.si, b.sj) - Math.min(a.si, a.sj)).slice(0, 20),
      onlyI:  onlyI.sort((a, b) => b.si - a.si).slice(0, 15),
      onlyJ:  onlyJ.sort((a, b) => b.sj - a.sj).slice(0, 15),
    }
  }, [comparedPair, scores])

  // ── score badge ──
  function ScoreBadge({ score }: { score: number }) {
    const colors: Record<number, string> = {
      5: 'bg-green-100 text-green-800', 4: 'bg-green-100 text-green-700',
      3: 'bg-amber-100 text-amber-700', 2: 'bg-red-100 text-red-700', 0: 'bg-slate-100 text-slate-500',
    }
    return (
      <span className={`text-[9px] font-medium px-1 py-0.5 rounded flex-shrink-0 ${colors[score] ?? colors[0]}`}>
        {REL_LABEL[score] ?? 'Absent'}
      </span>
    )
  }

  return (
    <div>
      {/* ── header + controls ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-odl-text">Regulatory Convergence Map</h2>
          <p className="text-xs text-odl-muted mt-0.5">
            Cosine similarity of jurisdiction coverage profiles · {n} jurisdictions · {allRules.length} rules · binding only
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-odl-subtle">Order:</span>
          {(['region', 'cluster'] as const).map(m => (
            <button key={m} onClick={() => setSortMode(m)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                sortMode === m ? 'bg-odl-accent text-white' : 'text-odl-muted hover:text-odl-text border border-odl-border'
              }`}>
              {m === 'region' ? 'By Region' : 'Cluster'}
            </button>
          ))}
        </div>
      </div>

      {/* ── key findings ── */}
      <div className="panel p-4 mb-4">
        <div className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wider mb-3">Key Findings</div>
        <div className="grid grid-cols-5 divide-x divide-odl-border gap-0">

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
            <div className="text-xs font-semibold text-violet-700 leading-tight">{colLabel(cols[centralIdx])}</div>
            <div className="text-[10px] font-bold text-violet-600 mt-0.5">{(insights.avgSim[centralIdx] * 100).toFixed(0)}% avg</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">most influential — highest avg similarity to all others</div>
          </div>

          <div className="px-4">
            <div className="text-2xl font-semibold text-emerald-600">+{((withinAvg - crossAvg) * 100).toFixed(0)}pp</div>
            <div className="text-[10px] text-odl-muted mt-0.5 leading-snug">
              same-region pairs ({(withinAvg * 100).toFixed(0)}%) vs cross-region ({(crossAvg * 100).toFixed(0)}%)
            </div>
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
      <div className="flex items-center gap-5 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-28 rounded-sm" style={{ background: 'linear-gradient(to right, #F8FAFC, #38BDF8, #075985)' }} />
          <div className="flex gap-6 text-[9px] text-odl-subtle"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm border border-odl-border" style={{ background: DIAG_COL }} />
          <span className="text-[10px] text-odl-subtle">Same jurisdiction</span>
        </div>
        {sortMode === 'region' && (
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 border-l-2 border-slate-400" />
            <span className="text-[10px] text-odl-subtle">Region boundary</span>
          </div>
        )}
        <span className="text-[10px] text-odl-subtle">· Click a label to rank · Click a cell to compare rules</span>
        {Object.entries(REGION_COLORS).map(([r, c]) => (
          <div key={r} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm" style={{ background: c }} />
            <span className="text-[9px] text-odl-subtle">{r}</span>
          </div>
        ))}
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
              return (
                <div key={key} title={colLabel(key)} style={{
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
                    {colLabel(key)}
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
                  <div title={colLabel(rowKey)} style={{
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
                      {colLabel(rowKey)}
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

                {/* shared rules */}
                {comparison.shared.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
                      ✓ Shared rules ({comparison.shared.length})
                    </div>
                    <div className="space-y-2">
                      {comparison.shared.map(({ ruleIdx, si, sj }) => {
                        const rule = allRules[ruleIdx]
                        return (
                          <div key={rule.rule_id} className="text-[10px] border-l-2 border-emerald-300 pl-2">
                            <div className="text-[8px] text-emerald-600 font-medium mb-0.5">
                              {RULE_CATEGORY_LABELS[rule.category as keyof typeof RULE_CATEGORY_LABELS] ?? rule.category}
                            </div>
                            <div className="text-odl-muted leading-snug mb-1">
                              {rule.rule_text.slice(0, 110)}{rule.rule_text.length > 110 ? '…' : ''}
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              <ScoreBadge score={si} />
                              <ScoreBadge score={sj} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* only in A */}
                {comparison.onlyI.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[9px] font-semibold text-sky-700 uppercase tracking-wide mb-1.5">
                      {colLabel(cols[comparedPair.i])} only ({comparison.onlyI.length})
                    </div>
                    <div className="space-y-2">
                      {comparison.onlyI.map(({ ruleIdx, si }) => {
                        const rule = allRules[ruleIdx]
                        return (
                          <div key={rule.rule_id} className="text-[10px] border-l-2 border-sky-300 pl-2">
                            <div className="text-[8px] text-sky-600 font-medium mb-0.5">
                              {RULE_CATEGORY_LABELS[rule.category as keyof typeof RULE_CATEGORY_LABELS] ?? rule.category}
                            </div>
                            <div className="text-odl-muted leading-snug mb-1">
                              {rule.rule_text.slice(0, 90)}{rule.rule_text.length > 90 ? '…' : ''}
                            </div>
                            <ScoreBadge score={si} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* only in B */}
                {comparison.onlyJ.length > 0 && (
                  <div>
                    <div className="text-[9px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                      {colLabel(cols[comparedPair.j])} only ({comparison.onlyJ.length})
                    </div>
                    <div className="space-y-2">
                      {comparison.onlyJ.map(({ ruleIdx, sj }) => {
                        const rule = allRules[ruleIdx]
                        return (
                          <div key={rule.rule_id} className="text-[10px] border-l-2 border-amber-300 pl-2">
                            <div className="text-[8px] text-amber-600 font-medium mb-0.5">
                              {RULE_CATEGORY_LABELS[rule.category as keyof typeof RULE_CATEGORY_LABELS] ?? rule.category}
                            </div>
                            <div className="text-odl-muted leading-snug mb-1">
                              {rule.rule_text.slice(0, 90)}{rule.rule_text.length > 90 ? '…' : ''}
                            </div>
                            <ScoreBadge score={sj} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
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
        for (let k = 0; k < allRules.length; k++) {
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
                    const rule = allRules[ruleIdx]
                    return (
                      <div key={rule.rule_id} className="text-[10px]">
                        <div className="text-[8px] text-emerald-600 font-medium">
                          {RULE_CATEGORY_LABELS[rule.category as keyof typeof RULE_CATEGORY_LABELS] ?? rule.category}
                        </div>
                        <div className="text-odl-muted leading-snug">
                          {rule.rule_text.slice(0, 85)}{rule.rule_text.length > 85 ? '…' : ''}
                        </div>
                        <div className="text-[8px] text-odl-subtle mt-0.5">
                          {colLabel(cols[i])}: {REL_LABEL[si]} · {colLabel(cols[j])}: {REL_LABEL[sj]}
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
