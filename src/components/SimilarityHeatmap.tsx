import { useState, useMemo, Fragment } from 'react'
import type { AILaw } from '../types'
import { rules as allRules } from '../data/rules'
import { regulations } from '../data/regulations'

// ── relationship → numeric score ──────────────────────────────────────────────

const REL_SCORE: Record<string, number> = {
  origin: 5, identical: 4, agrees: 4, similar: 3, opposed: 2, absent: 0,
}

// ── region / jurisdiction helpers (mirrors RulesMatrix) ───────────────────────

const REGION_ORDER = [
  'Supranational', 'Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa', 'Other',
]

const REGION_COLORS: Record<string, string> = {
  Supranational:         '#6D28D9',
  Americas:              '#0369A1',
  Europe:                '#059669',
  'Asia-Pacific':        '#D97706',
  'Middle East & Africa':'#DC2626',
  Other:                 '#64748B',
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
// 0 → near-white (#F8FAFC), 0.5 → sky-400 (#38BDF8), 1 → sky-800 (#075985)

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

const CELL     = 13   // px per cell
const HEADER_H = 114  // height of rotated column labels
const LABEL_W  = 136  // width of row label column
const DIAG_COL = '#1E293B'

// ── component ─────────────────────────────────────────────────────────────────

interface HoverState { i: number; j: number; x: number; y: number }

export function SimilarityHeatmap() {
  const [sortMode, setSortMode]   = useState<'region' | 'cluster'>('region')
  const [selected, setSelected]   = useState<number | null>(null)
  const [hover, setHover]         = useState<HoverState | null>(null)

  // ── compute coverage vectors + cosine similarity ──
  const { cols, simMatrix } = useMemo(() => {
    const bindingLaws = regulations.filter(l => l.instrument_binding)
    const colKeySet   = new Set<string>()
    bindingLaws.forEach(l => colKeySet.add(lawColKey(l)))
    const cols = [...colKeySet].sort((a, b) => colSortKey(a).localeCompare(colSortKey(b)))
    const n    = cols.length
    const ci   = new Map(cols.map((c, i) => [c, i]))
    const lawById = new Map(regulations.map(l => [l.id, l]))
    const m    = allRules.length

    // scores[col][rule] = best relationship score for that rule in that jurisdiction
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

    // cosine similarity
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
    return { cols, simMatrix: sim }
  }, [])

  const n = cols.length

  // ── ordered indices for display ──
  const order = useMemo(
    () => sortMode === 'cluster' ? greedySeriation(simMatrix, n) : Array.from({ length: n }, (_, i) => i),
    [sortMode, simMatrix, n],
  )

  // ── region boundaries (region mode only) ──
  const regionBounds = useMemo(() => {
    if (sortMode === 'cluster') return new Set<number>()
    const s = new Set<number>()
    for (let p = 1; p < order.length; p++) {
      if (colRegion(cols[order[p]]) !== colRegion(cols[order[p - 1]])) s.add(p)
    }
    return s
  }, [order, cols, sortMode])

  // ── top similar pairs for summary ──
  const topPairs = useMemo(() => {
    const pairs: { i: number; j: number; sim: number }[] = []
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s = simMatrix[i][j]
        if (s > 0.01) pairs.push({ i, j, sim: s })
      }
    }
    return pairs.sort((a, b) => b.sim - a.sim).slice(0, 8)
  }, [simMatrix, n])

  // ── global avg similarity (excluding diagonal) ──
  const globalAvg = useMemo(() => {
    let sum = 0, cnt = 0
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (i !== j) { sum += simMatrix[i][j]; cnt++ }
    return cnt ? sum / cnt : 0
  }, [simMatrix, n])

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

      {/* ── summary stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="panel p-3">
          <div className="text-lg font-semibold text-odl-text">{(globalAvg * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-odl-muted mt-0.5">Global avg. regulatory similarity</div>
        </div>
        <div className="panel p-3 col-span-2">
          <div className="text-[10px] text-odl-subtle font-medium mb-1.5 uppercase tracking-wide">Most similar pairs</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {topPairs.slice(0, 6).map(({ i, j, sim }) => (
              <div key={`${i}-${j}`} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: simToColor(sim) }} />
                <span className="text-[10px] text-odl-muted">
                  {colLabel(cols[i])} · {colLabel(cols[j])}
                </span>
                <span className="text-[10px] font-medium" style={{ color: simToColor(sim) }}>
                  {(sim * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── legend ── */}
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-28 rounded-sm" style={{
            background: 'linear-gradient(to right, #F8FAFC, #38BDF8, #075985)',
          }} />
          <div className="flex gap-6 text-[9px] text-odl-subtle">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: DIAG_COL }} />
          <span className="text-[10px] text-odl-subtle">Same jurisdiction</span>
        </div>
        {sortMode === 'region' && (
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 border-l-2 border-slate-400" />
            <span className="text-[10px] text-odl-subtle">Region boundary</span>
          </div>
        )}
        {Object.entries(REGION_COLORS).map(([r, c]) => (
          <div key={r} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm" style={{ background: c }} />
            <span className="text-[9px] text-odl-subtle">{r}</span>
          </div>
        ))}
      </div>

      {/* ── main layout: heatmap + optional sidebar ── */}
      <div className="flex gap-4">

        {/* heatmap */}
        <div className="overflow-auto" style={{ maxHeight: '72vh' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `${LABEL_W}px repeat(${n}, ${CELL}px)`,
          }}>

            {/* corner */}
            <div style={{ height: HEADER_H }} />

            {/* column headers */}
            {order.map((origIdx, pos) => {
              const key     = cols[origIdx]
              const label   = colLabel(key)
              const region  = colRegion(key)
              const isSelCol = selected === origIdx
              return (
                <div key={key} title={label} style={{
                  height:     HEADER_H,
                  width:      CELL,
                  display:    'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 3,
                  borderLeft: regionBounds.has(pos) ? '2px solid #CBD5E1' : undefined,
                  opacity: selected !== null && !isSelCol ? 0.3 : 1,
                  transition: 'opacity 0.15s',
                  cursor: 'pointer',
                }}
                  onClick={() => setSelected(p => p === origIdx ? null : origIdx)}
                >
                  <span style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: 9,
                    whiteSpace: 'nowrap',
                    color: isSelCol ? '#0369A1' : REGION_COLORS[region] ?? '#64748B',
                    fontWeight: isSelCol ? 700 : 400,
                  }}>
                    {label}
                  </span>
                </div>
              )
            })}

            {/* rows */}
            {order.map((rowOrig, rowPos) => {
              const rowKey   = cols[rowOrig]
              const rowReg   = colRegion(rowKey)
              const isSelRow = selected === rowOrig
              const bTop     = regionBounds.has(rowPos) ? '2px solid #CBD5E1' : '1px solid transparent'

              return (
                <Fragment key={rowKey}>
                  {/* row label */}
                  <div
                    title={colLabel(rowKey)}
                    style={{
                      height: CELL,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 5,
                      borderTop: bTop,
                      opacity: selected !== null && !isSelRow ? 0.3 : 1,
                      transition: 'opacity 0.15s',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelected(p => p === rowOrig ? null : rowOrig)}
                  >
                    <span style={{
                      fontSize: 9,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: LABEL_W - 8,
                      color: isSelRow ? '#0369A1' : REGION_COLORS[rowReg] ?? '#64748B',
                      fontWeight: isSelRow ? 700 : 400,
                      direction: 'rtl',
                      unicodeBidi: 'plaintext',
                    }}>
                      {colLabel(rowKey)}
                    </span>
                  </div>

                  {/* cells */}
                  {order.map((colOrig, colPos) => {
                    const isDiag  = rowOrig === colOrig
                    const sv      = simMatrix[rowOrig][colOrig]
                    const isHov   = hover?.i === rowOrig && hover?.j === colOrig
                    const isSelRC = selected === rowOrig || selected === colOrig
                    const bLeft   = regionBounds.has(colPos) ? '2px solid #CBD5E1' : undefined

                    return (
                      <div
                        key={cols[colOrig]}
                        style={{
                          width:      CELL,
                          height:     CELL,
                          background: isDiag ? DIAG_COL : simToColor(sv),
                          borderTop:  bTop,
                          borderLeft: bLeft,
                          outline:    isHov ? '2px solid #0369A1' : undefined,
                          zIndex:     isHov ? 5 : undefined,
                          position:   'relative',
                          opacity:    selected !== null && !isSelRC ? 0.25 : 1,
                          transition: 'opacity 0.15s',
                          cursor:     isDiag ? 'default' : 'crosshair',
                        }}
                        onMouseEnter={e => !isDiag && setHover({ i: rowOrig, j: colOrig, x: e.clientX, y: e.clientY })}
                        onMouseMove={e  => !isDiag && setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : null)}
                        onMouseLeave={() => setHover(null)}
                      />
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        </div>

        {/* sidebar: similarity rankings for selected jurisdiction */}
        {selected !== null && (
          <div className="w-56 flex-shrink-0 panel p-3 overflow-y-auto" style={{ maxHeight: '72vh' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-semibold text-odl-text">{colLabel(cols[selected])}</div>
                <div className="text-[9px] text-odl-subtle">similarity ranking</div>
              </div>
              <button className="text-odl-subtle hover:text-odl-text text-sm" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: n }, (_, i) => i)
                .filter(i => i !== selected)
                .sort((a, b) => simMatrix[selected][b] - simMatrix[selected][a])
                .map(j => {
                  const sv  = simMatrix[selected][j]
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
                        <div className="h-full rounded-full" style={{
                          width: `${sv * 100}%`,
                          background: simToColor(sv),
                        }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* ── tooltip ── */}
      {hover && (
        <div style={{
          position:  'fixed',
          left:      Math.min(hover.x + 14, window.innerWidth  - 260),
          top:       Math.min(hover.y + 14, window.innerHeight - 80),
          zIndex:    9999,
          background: 'white',
          border:    '1px solid #E2E8F0',
          borderRadius: 6,
          padding:   '7px 11px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          pointerEvents: 'none',
          minWidth:  200,
        }}>
          <div className="text-[11px] font-semibold text-odl-text mb-1">
            {colLabel(cols[hover.i])} × {colLabel(cols[hover.j])}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-odl-surface overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${simMatrix[hover.i][hover.j] * 100}%`,
                background: simToColor(simMatrix[hover.i][hover.j]),
              }} />
            </div>
            <span className="text-[11px] font-semibold" style={{ color: simToColor(simMatrix[hover.i][hover.j]) }}>
              {(simMatrix[hover.i][hover.j] * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-[9px] text-odl-subtle mt-1">regulatory similarity</div>
        </div>
      )}
    </div>
  )
}
