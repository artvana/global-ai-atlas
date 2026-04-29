import { useState, useMemo, useEffect, useCallback, Fragment } from 'react'
import type { Rule, RuleCategory, RuleRelationship, AILaw } from '../types'
import { RULE_CATEGORY_LABELS } from '../types'
import { rules as allRules } from '../data/rules'
import { embeddings as precomputedEmbeddings } from '../data/embeddings'
import { regulations } from '../data/regulations'
import {
  loadEmbeddingData,
  initModel,
  searchRules as semanticSearch,
  computeConsensus,
  isModelReady,
  hasEmbeddings,
  type LoadProgress,
  type SearchResult,
} from '../lib/semanticSearch'

// ── layout ────────────────────────────────────────────────────────────────────

const DOT = 12
const CELL = 18
const REGION_COL = 22   // rotated region label column
const COUNTRY_COL = 116 // country name column

// ── relationship config ───────────────────────────────────────────────────────

type RelOrAbsent = RuleRelationship | 'absent'

const REL_CONFIG: Record<RelOrAbsent, { label: string; color: string; border?: string }> = {
  origin:   { label: 'Origin (first instance)', color: '#16A34A', border: '#18181B' },
  identical:{ label: 'Identical / agrees',      color: '#16A34A' },
  agrees:   { label: 'Identical / agrees',      color: '#16A34A' },
  similar:  { label: 'Similar',                 color: '#D97706' },
  opposed:  { label: 'Opposed',                 color: '#DC2626' },
  absent:   { label: 'No legislation found',   color: 'transparent' },
}

const LEGEND_ITEMS: RelOrAbsent[] = ['origin', 'identical', 'similar', 'opposed']

const REL_PRIORITY: Record<RelOrAbsent, number> = {
  origin: 5, identical: 4, agrees: 4, similar: 3, opposed: 2, absent: 0,
}

// ── category colors ───────────────────────────────────────────────────────────

const CAT_COLOR: Partial<Record<RuleCategory, string>> = {
  biometric_data:      '#7C3AED',
  prohibited_uses:     '#DC2626',
  impact_assessment:   '#D97706',
  human_review:        '#0891B2',
  data_rights:         '#059669',
  transparency:        '#0284C7',
  synthetic_media:     '#9333EA',
  enforcement:         '#B45309',
  risk_classification: '#BE123C',
  training_data:       '#15803D',
  foundation_models:   '#6D28D9',
  consent:             '#0F766E',
  employment_ai:       '#1D4ED8',
  general_governance:  '#475569',
}

// ── region mapping ────────────────────────────────────────────────────────────

const COUNTRY_REGION: Record<string, string> = {
  // Supranational (handled separately via 'regional:' prefix keys)
  // Americas
  'United States': 'Americas', 'Canada': 'Americas', 'Brazil': 'Americas',
  'Mexico': 'Americas', 'Argentina': 'Americas', 'Chile': 'Americas',
  'Colombia': 'Americas', 'Peru': 'Americas',
  // Europe
  'United Kingdom': 'Europe', 'France': 'Europe', 'Spain': 'Europe',
  'Italy': 'Europe', 'Denmark': 'Europe', 'Finland': 'Europe',
  'Ireland': 'Europe', 'Switzerland': 'Europe', 'Hungary': 'Europe',
  'Serbia': 'Europe', 'Ukraine': 'Europe', 'Russia': 'Europe',
  'Turkey': 'Europe',
  // Asia-Pacific
  'China': 'Asia-Pacific', 'Japan': 'Asia-Pacific', 'South Korea': 'Asia-Pacific',
  'Australia': 'Asia-Pacific', 'New Zealand': 'Asia-Pacific', 'Singapore': 'Asia-Pacific',
  'India': 'Asia-Pacific', 'Indonesia': 'Asia-Pacific', 'Malaysia': 'Asia-Pacific',
  'Philippines': 'Asia-Pacific', 'Thailand': 'Asia-Pacific', 'Vietnam': 'Asia-Pacific',
  'Taiwan': 'Asia-Pacific', 'Bangladesh': 'Asia-Pacific', 'Pakistan': 'Asia-Pacific',
  'Sri Lanka': 'Asia-Pacific', 'Kazakhstan': 'Asia-Pacific', 'Uzbekistan': 'Asia-Pacific',
  // Middle East & Africa
  'United Arab Emirates': 'Middle East & Africa', 'Saudi Arabia': 'Middle East & Africa',
  'Qatar': 'Middle East & Africa', 'Israel': 'Middle East & Africa',
  'Egypt': 'Middle East & Africa', 'Morocco': 'Middle East & Africa',
  'Tunisia': 'Middle East & Africa', 'South Africa': 'Middle East & Africa',
  'Nigeria': 'Middle East & Africa', 'Kenya': 'Middle East & Africa',
  'Rwanda': 'Middle East & Africa', 'Mauritius': 'Middle East & Africa',
  'Ethiopia': 'Middle East & Africa',
}

const REGIONAL_LABELS: Record<string, string> = {
  EU: 'European Union', CoE: 'Council of Europe',
  International: 'International / UN', APAC: 'APAC Regional', Africa: 'African Union',
}

const REGION_ORDER = ['Supranational', 'Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa', 'Other']

// ── row key helpers ───────────────────────────────────────────────────────────
// Laws with country='Global / Regional' are disambiguated by region field.

function lawRowKey(law: AILaw): string {
  if (law.country === 'Global / Regional') return `regional:${law.region}`
  return law.country
}

function rowLabel(key: string): string {
  if (key.startsWith('regional:')) return REGIONAL_LABELS[key.slice(9)] ?? key.slice(9)
  return key
}

function rowRegion(key: string): string {
  if (key.startsWith('regional:')) return 'Supranational'
  return COUNTRY_REGION[key] ?? 'Other'
}

// ── dot component ─────────────────────────────────────────────────────────────

function RelDot({ rel, size = DOT }: { rel: RelOrAbsent; size?: number }) {
  const cfg = REL_CONFIG[rel]
  if (rel === 'absent') return null
  return (
    <div className="flex-shrink-0 transition-transform duration-100 group-hover/cell:scale-110"
      style={{
        width: size, height: size,
        background: cfg.color,
        borderRadius: '50%',
        border: cfg.border ? `1.5px solid ${cfg.border}` : undefined,
        boxSizing: 'border-box',
      }}
    />
  )
}

// ── cell popover ──────────────────────────────────────────────────────────────

interface PopoverData {
  x: number; y: number
  rowKey: string
  mode: 'category' | 'rule'
  // category mode
  cat?: string
  catEntries?: Array<{ rule: Rule; rel: RelOrAbsent; lawId: string; lawName: string; citation?: string }>
  // rule mode
  rule?: Rule
  rel?: RelOrAbsent
  lawId?: string
  lawName?: string
  citation?: string
  notes?: string
}

function CellPopover({ d, onClose }: { d: PopoverData; onClose: () => void }) {
  const label = rowLabel(d.rowKey)

  return (
    <div
      className="fixed z-50 bg-white border border-odl-border rounded-lg shadow-2xl p-4 text-xs max-w-sm pointer-events-auto"
      style={{ left: Math.min(d.x + 12, window.innerWidth - 340), top: Math.min(d.y + 12, window.innerHeight - 300) }}
      onClick={e => e.stopPropagation()}
    >
      <button className="absolute top-2 right-2 text-odl-subtle hover:text-odl-text text-base leading-none" onClick={onClose}>×</button>

      <div className="font-semibold text-odl-text mb-1 pr-4">{label}</div>

      {d.mode === 'category' && d.cat !== undefined && (
        <>
          <div className="text-[10px] text-odl-subtle uppercase tracking-wide mb-2 font-medium">
            {RULE_CATEGORY_LABELS[d.cat as RuleCategory] ?? d.cat}
          </div>
          {(!d.catEntries || d.catEntries.length === 0) ? (
            <p className="text-odl-subtle">No legislation found in this category.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {d.catEntries.map((e, i) => (
                <div key={i} className="border-t border-odl-border/40 pt-1.5 first:border-0 first:pt-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <RelDot rel={e.rel} size={8} />
                    <span className="font-medium text-odl-text text-[10px]">{e.lawName}</span>
                  </div>
                  <p className="text-odl-muted leading-snug text-[10px] pl-4">{e.rule.rule_text.slice(0, 120)}{e.rule.rule_text.length > 120 ? '…' : ''}</p>
                  {e.citation && <p className="text-odl-subtle text-[9px] pl-4 mt-0.5">{e.citation}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {d.mode === 'rule' && d.rule && (
        <>
          {d.rel && d.rel !== 'absent' ? (
            <div className="flex items-center gap-1.5 mb-2">
              <RelDot rel={d.rel} size={8} />
              <span className="text-[10px] font-medium" style={{ color: REL_CONFIG[d.rel].color }}>
                {REL_CONFIG[d.rel].label}
              </span>
            </div>
          ) : (
            <p className="text-odl-subtle mb-2">No legislation found for this rule.</p>
          )}
          <p className="text-odl-text leading-snug mb-2 text-[11px]">{d.rule.rule_text}</p>
          {d.lawName && (
            <div className="border-t border-odl-border pt-2 space-y-0.5 text-[10px] text-odl-muted">
              <div><span className="font-medium text-odl-text">{d.lawName}</span></div>
              {d.citation && <div>{d.citation}</div>}
              {d.notes && <p className="text-odl-subtle mt-1">{d.notes}</p>}
            </div>
          )}
          {(() => {
            const consensus = computeConsensus(d.rule)
            return consensus.adoptions > 0 ? (
              <div className="mt-1.5 text-[9px] text-odl-subtle">
                <span className="font-medium">Consensus:</span> {consensus.law_id}
                <span className="ml-1">({consensus.adoptions} adopted)</span>
              </div>
            ) : null
          })()}
        </>
      )}
    </div>
  )
}

// ── semantic search panel ─────────────────────────────────────────────────────

function SemanticSearchPanel({ onResults, onClear }: { onResults: (r: SearchResult[]) => void; onClear: () => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading-model' | 'searching' | 'no-embeddings'>('idle')
  const [modelProgress, setModelProgress] = useState(0)
  const hasEmb = hasEmbeddings()

  const handleSearch = useCallback(async () => {
    if (!query.trim()) { onClear(); return }
    if (!hasEmb) { setStatus('no-embeddings'); return }
    if (!isModelReady()) {
      setStatus('loading-model')
      await initModel((p: LoadProgress) => setModelProgress(Math.round(p.pct)))
    }
    setStatus('searching')
    try { onResults(await semanticSearch(query.trim(), allRules)) }
    finally { setStatus('idle') }
  }, [query, hasEmb, onResults, onClear])

  return (
    <div className="panel p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent"
          placeholder="Semantic search… e.g. 'consent before collecting biometric data'"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) onClear() }}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="px-3 py-1.5 text-xs bg-odl-accent text-white rounded hover:bg-odl-accent/90 disabled:opacity-50"
          onClick={handleSearch} disabled={status === 'loading-model' || status === 'searching'}>
          {status === 'searching' ? 'Searching…' : 'Search'}
        </button>
        {query && <button className="text-xs text-odl-subtle hover:text-odl-text" onClick={() => { setQuery(''); onClear() }}>Clear</button>}
      </div>
      {status === 'loading-model' && (
        <div className="text-xs text-odl-muted">
          Loading model ({modelProgress}%)…
          <div className="h-1 bg-odl-surface rounded-full mt-1 w-40 overflow-hidden">
            <div className="h-full bg-odl-accent rounded-full transition-all" style={{ width: `${modelProgress}%` }} />
          </div>
        </div>
      )}
      {!hasEmb && status === 'idle' && (
        <p className="text-xs text-odl-subtle">
          Semantic search requires <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code>.
        </p>
      )}
    </div>
  )
}

// ── export helpers ────────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function escCsv(s: string): string {
  const str = String(s ?? '')
  return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str
}

// ── instrument filter ─────────────────────────────────────────────────────────

type InstrumentFilter = 'all' | 'binding' | 'soft'

// ── matrix cell data ──────────────────────────────────────────────────────────

interface BestCell {
  rel: RelOrAbsent
  lawId: string
  lawName: string
  citation?: string
  notes?: string
}

// ── main component ────────────────────────────────────────────────────────────

export function RulesMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all')
  const [ruleSearch, setRuleSearch] = useState('')
  const [instrumentFilter, setInstrumentFilter] = useState<InstrumentFilter>('all')
  const [semanticResults, setSemanticResults] = useState<SearchResult[] | null>(null)
  const [popover, setPopover] = useState<PopoverData | null>(null)

  useEffect(() => { loadEmbeddingData(precomputedEmbeddings) }, [])

  // law metadata lookup
  const lawMeta = useMemo(() => {
    const m = new Map<string, { short_name: string; instrument_binding: boolean; rowKey: string }>()
    regulations.forEach(l => m.set(l.id, {
      short_name: l.short_name,
      instrument_binding: l.instrument_binding ?? true,
      rowKey: lawRowKey(l),
    }))
    return m
  }, [])

  // all unique row keys (one per country/supranational body)
  const allRowKeys = useMemo(() => {
    const s = new Set<string>()
    regulations.forEach(l => s.add(lawRowKey(l)))
    return [...s]
  }, [])

  // row groups: region → sorted row keys
  const rowGroups = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const key of allRowKeys) {
      const r = rowRegion(key)
      if (!map.has(r)) map.set(r, [])
      map.get(r)!.push(key)
    }
    for (const [, keys] of map) keys.sort((a, b) => rowLabel(a).localeCompare(rowLabel(b)))
    return REGION_ORDER.map(r => ({ region: r, keys: map.get(r) ?? [] })).filter(g => g.keys.length > 0)
  }, [allRowKeys])

  // filtered rules for column mode (specific category / search)
  const colRules = useMemo(() => {
    if (semanticResults) return semanticResults.map(r => r.rule)
    if (selectedCategory === 'all') return []  // use category aggregate mode
    let r = allRules.filter(rl => rl.category === selectedCategory)
    if (ruleSearch.trim()) {
      const q = ruleSearch.trim().toLowerCase()
      r = r.filter(rl => rl.rule_text.toLowerCase().includes(q) || rl.tags.some(t => t.includes(q)))
    }
    if (instrumentFilter !== 'all') {
      r = r.filter(rl => {
        const b = lawMeta.get(rl.first_instance.law_id)?.instrument_binding ?? true
        return instrumentFilter === 'binding' ? b : !b
      })
    }
    return r.sort((a, b) => a.first_instance.date.localeCompare(b.first_instance.date))
  }, [selectedCategory, ruleSearch, semanticResults, instrumentFilter, lawMeta])

  const isCategoryMode = selectedCategory === 'all' && !semanticResults

  // all distinct categories (for category mode columns)
  const allCategories = useMemo(() =>
    [...new Set(allRules.map(r => r.category as RuleCategory))].sort()
  , [])

  // Pre-compute matrix: rowKey → (cat or rule_id) → BestCell
  const matrix = useMemo(() => {
    const m = new Map<string, Map<string, BestCell>>()

    const rulesSource = isCategoryMode ? allRules : colRules
    const getKey = isCategoryMode
      ? (rule: Rule) => rule.category
      : (rule: Rule) => rule.rule_id

    for (const rule of rulesSource) {
      const colKey = getKey(rule)
      for (const inst of rule.instances) {
        if (instrumentFilter !== 'all') {
          const b = lawMeta.get(inst.law_id)?.instrument_binding ?? true
          if (instrumentFilter === 'binding' && !b) continue
          if (instrumentFilter === 'soft'    &&  b) continue
        }
        const meta = lawMeta.get(inst.law_id)
        if (!meta) continue
        const rowKey = meta.rowKey

        if (!m.has(rowKey)) m.set(rowKey, new Map())
        const rm = m.get(rowKey)!

        const rel = (inst.relationship ?? 'absent') as RelOrAbsent
        const existing = rm.get(colKey)
        if (!existing || REL_PRIORITY[rel] > REL_PRIORITY[existing.rel]) {
          rm.set(colKey, {
            rel, lawId: inst.law_id, lawName: meta.short_name,
            citation: inst.citation, notes: inst.notes,
          })
        }
      }
    }
    return m
  }, [isCategoryMode, colRules, instrumentFilter, lawMeta])

  // For category popover: all entries in that category for a rowKey
  function getCatEntries(rowKey: string, cat: string) {
    const entries: PopoverData['catEntries'] = []
    const catRules = allRules.filter(r => r.category === cat)
    for (const rule of catRules) {
      for (const inst of rule.instances) {
        const meta = lawMeta.get(inst.law_id)
        if (!meta || meta.rowKey !== rowKey) continue
        entries.push({
          rule,
          rel: (inst.relationship ?? 'absent') as RelOrAbsent,
          lawId: inst.law_id,
          lawName: meta.short_name,
          citation: inst.citation,
        })
      }
    }
    entries.sort((a, b) => REL_PRIORITY[b.rel] - REL_PRIORITY[a.rel])
    return entries
  }

  function handleCellClick(e: React.MouseEvent, rowKey: string, colKey: string, rule?: Rule) {
    e.stopPropagation()
    const cell = matrix.get(rowKey)?.get(colKey)

    if (isCategoryMode) {
      setPopover({
        x: e.clientX, y: e.clientY,
        rowKey, mode: 'category', cat: colKey,
        catEntries: getCatEntries(rowKey, colKey),
      })
    } else {
      setPopover({
        x: e.clientX, y: e.clientY,
        rowKey, mode: 'rule', rule,
        rel: cell?.rel ?? 'absent',
        lawId: cell?.lawId,
        lawName: cell?.lawName,
        citation: cell?.citation,
        notes: cell?.notes,
      })
    }
  }

  function exportCsv() {
    const cols = isCategoryMode
      ? allCategories.map(c => ({ key: c, label: RULE_CATEGORY_LABELS[c] ?? c }))
      : colRules.map(r => ({ key: r.rule_id, label: r.rule_text.slice(0, 60) }))
    const header = ['region', 'jurisdiction', ...cols.map(c => escCsv(c.label))].join(',')
    const rows = rowGroups.flatMap(g => g.keys.map(key => {
      const rm = matrix.get(key)
      return [g.region, escCsv(rowLabel(key)), ...cols.map(c => rm?.get(c.key)?.rel ?? 'absent')].join(',')
    }))
    downloadFile([header, ...rows].join('\n'), 'gaia-comparative.csv', 'text/csv')
  }

  const totalCountries = rowGroups.reduce((s, g) => s + g.keys.length, 0)
  const colCount = isCategoryMode ? allCategories.length : colRules.length

  return (
    <div className="flex flex-col gap-4 max-w-screen-2xl" onClick={() => setPopover(null)}>

      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">Rules Matrix — Comparative View</h2>
        <p className="text-xs text-odl-muted leading-relaxed">
          Rows are jurisdictions grouped by region. Columns are rule categories (overview) or individual rules (select a category).
          Dots show the strongest relationship any law in that jurisdiction has for each rule. Click a dot for details.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-odl-muted items-center">
        {LEGEND_ITEMS.map(rel => {
          const cfg = REL_CONFIG[rel]
          return (
            <span key={rel} className="flex items-center gap-1.5">
              <div style={{
                width: 10, height: 10, background: cfg.color, borderRadius: '50%',
                border: cfg.border ? `1.5px solid ${cfg.border}` : undefined,
                flexShrink: 0, boxSizing: 'border-box',
              }} />
              {cfg.label}
            </span>
          )
        })}
        <span className="text-odl-subtle">Empty cell = no legislation</span>
      </div>

      {/* Semantic search */}
      <SemanticSearchPanel onResults={setSemanticResults} onClear={() => setSemanticResults(null)} />

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent"
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value as RuleCategory | 'all'); setSemanticResults(null) }}>
          <option value="all">All categories (overview)</option>
          {allCategories.map(c => (
            <option key={c} value={c}>{RULE_CATEGORY_LABELS[c as RuleCategory]}</option>
          ))}
        </select>
        {selectedCategory !== 'all' && (
          <input
            className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent w-44"
            placeholder="Filter rules…"
            value={ruleSearch}
            onChange={e => { setRuleSearch(e.target.value); setSemanticResults(null) }}
          />
        )}
        <div className="flex items-center rounded border border-odl-border overflow-hidden">
          {(['all','binding','soft'] as InstrumentFilter[]).map(f => (
            <button key={f}
              className={`px-2.5 py-1.5 text-xs transition-colors ${instrumentFilter === f ? 'bg-odl-accent text-white' : 'text-odl-muted hover:bg-odl-surface'}`}
              onClick={() => setInstrumentFilter(f)}>
              {f === 'all' ? 'All' : f === 'binding' ? '⚖ Binding' : '📋 Soft law'}
            </button>
          ))}
        </div>
        <span className="text-xs text-odl-subtle">
          {totalCountries} jurisdictions · {colCount} {isCategoryMode ? 'categories' : 'rules'}
        </span>
        <button
          className="px-2 py-1.5 text-xs border border-odl-border rounded text-odl-muted hover:text-odl-text hover:bg-odl-surface"
          onClick={exportCsv}>↓ CSV</button>
      </div>

      {/* ── Matrix ── */}
      <div className="panel overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-280px)]">
          <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 z-20 bg-white">
              <tr>
                {/* Corner: region + country columns */}
                <th style={{ width: REGION_COL, minWidth: REGION_COL, borderBottom: '1px solid #E4E4E7', padding: 0 }} />
                <th style={{ width: COUNTRY_COL, minWidth: COUNTRY_COL, borderBottom: '1px solid #E4E4E7', borderRight: '1px solid #D4D4D8', padding: 0 }} />

                {isCategoryMode ? (
                  // Category mode: vertical rotated labels
                  allCategories.map(cat => (
                    <th key={cat}
                      style={{ width: CELL, minWidth: CELL, padding: 0, borderBottom: '1px solid #E4E4E7', borderRight: '1px solid rgba(228,228,231,0.4)' }}
                      title={RULE_CATEGORY_LABELS[cat] ?? cat}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 96, paddingBottom: 4 }}>
                        <span style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          fontSize: 8, fontWeight: 700, letterSpacing: '0.07em',
                          color: CAT_COLOR[cat] ?? '#52525B',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}>
                          {RULE_CATEGORY_LABELS[cat] ?? cat}
                        </span>
                      </div>
                    </th>
                  ))
                ) : (
                  // Rule mode: tiny colored squares, hover for rule text
                  colRules.map(rule => (
                    <th key={rule.rule_id}
                      style={{ width: CELL, minWidth: CELL, padding: 0, borderBottom: '1px solid #E4E4E7', borderRight: '1px solid rgba(228,228,231,0.4)' }}
                      title={rule.rule_text.slice(0, 140)}>
                      <div className="flex items-center justify-center py-1">
                        <div style={{ width: DOT, height: DOT, background: CAT_COLOR[rule.category as RuleCategory] ?? '#94A3B8', borderRadius: 2 }} />
                      </div>
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody>
              {rowGroups.map((group, gIdx) => (
                <Fragment key={group.region}>
                  {group.keys.map((rowKey, rIdx) => (
                    <tr key={rowKey} className="group hover:bg-blue-50/20">
                      {/* Region label — rowspan over all countries in this group */}
                      {rIdx === 0 && (
                        <td
                          rowSpan={group.keys.length}
                          className="border-r border-odl-border/30 select-none bg-white"
                          style={{
                            width: REGION_COL, minWidth: REGION_COL,
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            textAlign: 'center', verticalAlign: 'middle',
                            fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
                            color: '#A1A1AA', textTransform: 'uppercase',
                            padding: '4px 2px', whiteSpace: 'nowrap',
                            borderBottom: '1px solid #E4E4E7',
                          }}>
                          {group.region}
                        </td>
                      )}

                      {/* Country name */}
                      <td className="border-r border-odl-border/50 px-2 py-0 select-none"
                        style={{ width: COUNTRY_COL, minWidth: COUNTRY_COL, height: CELL }}>
                        <span className="text-[10px] text-odl-text font-medium truncate block leading-none"
                          style={{ lineHeight: `${CELL}px` }}>
                          {rowLabel(rowKey)}
                        </span>
                      </td>

                      {/* Data cells */}
                      {isCategoryMode ? (
                        allCategories.map(cat => {
                          const cell = matrix.get(rowKey)?.get(cat)
                          return (
                            <td key={cat}
                              className="group/cell p-0 cursor-pointer hover:bg-blue-50/60 border-r border-odl-border/15"
                              style={{ width: CELL, minWidth: CELL }}
                              onClick={e => handleCellClick(e, rowKey, cat)}
                              title={cell ? `${rowLabel(rowKey)} · ${RULE_CATEGORY_LABELS[cat as RuleCategory]} · ${REL_CONFIG[cell.rel].label} · ${cell.lawName}` : `${rowLabel(rowKey)} · ${RULE_CATEGORY_LABELS[cat as RuleCategory]} · No legislation`}>
                              <div className="flex items-center justify-center" style={{ height: CELL }}>
                                {cell && <RelDot rel={cell.rel} />}
                              </div>
                            </td>
                          )
                        })
                      ) : (
                        colRules.map(rule => {
                          const cell = matrix.get(rowKey)?.get(rule.rule_id)
                          return (
                            <td key={rule.rule_id}
                              className="group/cell p-0 cursor-pointer hover:bg-blue-50/60 border-r border-odl-border/15"
                              style={{ width: CELL, minWidth: CELL }}
                              onClick={e => handleCellClick(e, rowKey, rule.rule_id, rule)}
                              title={cell ? `${rowLabel(rowKey)} · ${cell.lawName} · ${REL_CONFIG[cell.rel].label}` : `${rowLabel(rowKey)} · No legislation`}>
                              <div className="flex items-center justify-center" style={{ height: CELL }}>
                                {cell && <RelDot rel={cell.rel} />}
                              </div>
                            </td>
                          )
                        })
                      )}
                    </tr>
                  ))}

                  {/* Region separator */}
                  {gIdx < rowGroups.length - 1 && (
                    <tr>
                      <td colSpan={2 + colCount} style={{ height: 3, background: '#3B82F6', opacity: 0.3, padding: 0 }} />
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popover */}
      {popover && <CellPopover d={popover} onClose={() => setPopover(null)} />}

      {/* Footer */}
      <div className="text-[10px] text-odl-subtle">
        Overview: 14 category columns, each showing the strongest relationship any law in that jurisdiction has.
        Select a category to drill into individual rules. Click any dot for law details.
      </div>
    </div>
  )
}
