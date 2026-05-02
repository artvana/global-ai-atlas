import { useState, useMemo, useEffect, useCallback, Fragment } from 'react'
import type { Rule, RuleCategory, RuleRelationship, AILaw } from '../types'
import { RULE_CATEGORY_LABELS } from '../types'
import { rules as allRules } from '../data/rules'
import { embeddings as precomputedEmbeddings } from '../data/embeddings'
import { regulations } from '../data/regulations'
import {
  loadEmbeddingData, initModel,
  searchRules as semanticSearch,
  computeConsensus, isModelReady, hasEmbeddings,
  type LoadProgress, type SearchResult,
} from '../lib/semanticSearch'

// ── layout constants ──────────────────────────────────────────────────────────

const DOT  = 11
const CELL = 18
const CAT_COL = 26   // left-side category label column

// ── relationship config ───────────────────────────────────────────────────────

type RelOrAbsent = RuleRelationship | 'absent'

const REL_CONFIG: Record<RelOrAbsent, { label: string; color: string; border?: string }> = {
  origin:   { label: 'Origin (first instance)', color: '#16A34A', border: '#18181B' },
  identical:{ label: 'Identical / agrees',      color: '#16A34A' },
  agrees:   { label: 'Identical / agrees',      color: '#16A34A' },
  similar:  { label: 'Similar',                 color: '#D97706' },
  opposed:  { label: 'Opposed',                 color: '#DC2626' },
  absent:   { label: 'No legislation',          color: 'transparent' },
}

const LEGEND_ITEMS: RelOrAbsent[] = ['origin', 'identical', 'similar', 'opposed']

const REL_PRIORITY: Record<RelOrAbsent, number> = {
  origin: 5, identical: 4, agrees: 4, similar: 3, opposed: 2, absent: 0,
}

// ── category colors ───────────────────────────────────────────────────────────

const CAT_COLOR: Partial<Record<RuleCategory, string>> = {
  // Prohibitions & Risk Framework
  prohibited_applications:  '#DC2626',
  risk_classification:       '#9F1239',
  biometric_data:            '#C026D3',
  // Individual Rights
  data_subject_rights:       '#059669',
  consent:                   '#0F766E',
  human_oversight:           '#0891B2',
  explainability:            '#0369A1',
  // Transparency & Documentation
  disclosure:                '#2563EB',
  technical_documentation:   '#4F46E5',
  // Ex Ante Obligations
  conformity_assessment:     '#D97706',
  registration_notification: '#EA580C',
  // Data & Model Governance
  training_data_quality:     '#16A34A',
  data_provenance:           '#15803D',
  foundation_models:         '#6D28D9',
  synthetic_media:           '#9333EA',
  // Sector-Specific
  employment_ai:             '#7C3AED',
  // Institutional & Enforcement
  accountability_governance: '#475569',
  enforcement_penalties:     '#B45309',
  private_redress:           '#92400E',
}

// ── region / jurisdiction helpers ─────────────────────────────────────────────

const REGION_ORDER = ['Supranational', 'Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa', 'Other']

const COUNTRY_REGION: Record<string, string> = {
  'Canada': 'Americas',    'Brazil': 'Americas',  'Mexico': 'Americas',
  'Argentina': 'Americas', 'Chile': 'Americas',   'Colombia': 'Americas', 'Peru': 'Americas',
  'United Kingdom': 'Europe',    'France': 'Europe',      'Spain': 'Europe',
  'Italy': 'Europe',             'Denmark': 'Europe',     'Finland': 'Europe',
  'Ireland': 'Europe',           'Switzerland': 'Europe', 'Hungary': 'Europe',
  'Serbia': 'Europe',            'Ukraine': 'Europe',     'Russia': 'Europe',
  'Turkey': 'Europe',
  'China': 'Asia-Pacific',       'Japan': 'Asia-Pacific',  'South Korea': 'Asia-Pacific',
  'Australia': 'Asia-Pacific',   'New Zealand': 'Asia-Pacific', 'Singapore': 'Asia-Pacific',
  'India': 'Asia-Pacific',       'Indonesia': 'Asia-Pacific',   'Malaysia': 'Asia-Pacific',
  'Philippines': 'Asia-Pacific', 'Thailand': 'Asia-Pacific',    'Vietnam': 'Asia-Pacific',
  'Taiwan': 'Asia-Pacific',      'Bangladesh': 'Asia-Pacific',  'Pakistan': 'Asia-Pacific',
  'Sri Lanka': 'Asia-Pacific',   'Kazakhstan': 'Asia-Pacific',  'Uzbekistan': 'Asia-Pacific',
  'United Arab Emirates': 'Middle East & Africa', 'Saudi Arabia': 'Middle East & Africa',
  'Qatar': 'Middle East & Africa',  'Israel': 'Middle East & Africa',
  'Egypt': 'Middle East & Africa',  'Morocco': 'Middle East & Africa',
  'Tunisia': 'Middle East & Africa','South Africa': 'Middle East & Africa',
  'Nigeria': 'Middle East & Africa','Kenya': 'Middle East & Africa',
  'Rwanda': 'Middle East & Africa', 'Mauritius': 'Middle East & Africa',
  'Ethiopia': 'Middle East & Africa',
}

const REGIONAL_LABELS: Record<string, string> = {
  EU: 'European Union', CoE: 'Council of Europe',
  International: 'International / UN', APAC: 'APAC Regional', Africa: 'African Union',
}

// US federal region code = 'US'; state codes = 'US-CA', 'US-TX', etc.
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

// Full display name used in popover titles and tooltips
function colLabel(key: string): string {
  if (key.startsWith('regional:')) return REGIONAL_LABELS[key.slice(9)] ?? key.slice(9)
  if (key === 'US-FED') return 'US Federal'
  if (key.startsWith('US-')) return `${US_STATE_NAMES[key] ?? key.slice(3)}`
  return key
}

// Short label used in vertical column headers
function colHeaderLabel(key: string): string {
  if (key.startsWith('regional:')) return REGIONAL_LABELS[key.slice(9)] ?? key.slice(9)
  if (key === 'US-FED') return 'Federal'
  if (key.startsWith('US-')) return US_STATE_NAMES[key] ?? key.slice(3)
  return key
}

function colRegion(key: string): string {
  if (key.startsWith('regional:')) return 'Supranational'
  if (key === 'US-FED' || key.startsWith('US-')) return 'Americas'
  return COUNTRY_REGION[key] ?? 'Other'
}

// Sort key: puts US-FED first in Americas, then US states, then other Americas
function colSortKey(key: string): string {
  const r = REGION_ORDER.indexOf(colRegion(key)).toString().padStart(2, '0')
  if (key === 'US-FED') return `${r}_US_0`
  if (key.startsWith('US-')) return `${r}_US_1_${colLabel(key)}`
  return `${r}_ZZ_${colLabel(key)}`
}

// ── dot component ─────────────────────────────────────────────────────────────

function RelDot({ rel, size = DOT }: { rel: RelOrAbsent; size?: number }) {
  if (rel === 'absent') return null
  const cfg = REL_CONFIG[rel]
  return (
    <div className="flex-shrink-0 transition-transform duration-100 group-hover/cell:scale-110"
      style={{
        width: size, height: size, background: cfg.color,
        borderRadius: '50%',
        border: cfg.border ? `1.5px solid ${cfg.border}` : undefined,
        boxSizing: 'border-box',
      }} />
  )
}

// ── cell popover ──────────────────────────────────────────────────────────────

interface PopoverInst {
  rel: RelOrAbsent
  lawId: string
  lawName: string
  citation?: string
  notes?: string
  binding: boolean
}

interface PopoverData {
  x: number; y: number
  rule: Rule
  colKey: string
  instances: PopoverInst[]
}

function CellPopover({ d, onClose }: { d: PopoverData; onClose: () => void }) {
  const country = colLabel(d.colKey)
  const best = d.instances[0]
  const consensus = useMemo(() => computeConsensus(d.rule), [d.rule])

  return (
    <div
      className="fixed z-50 bg-white border border-odl-border rounded-lg shadow-2xl p-4 text-xs max-w-sm pointer-events-auto"
      style={{ left: Math.min(d.x + 12, window.innerWidth - 340), top: Math.min(d.y + 12, window.innerHeight - 320) }}
      onClick={e => e.stopPropagation()}>
      <button className="absolute top-2 right-2 text-odl-subtle hover:text-odl-text text-base leading-none" onClick={onClose}>×</button>

      {/* Country + rule */}
      <div className="font-semibold text-odl-text mb-0.5 pr-4">{country}</div>
      <p className="text-odl-muted leading-snug mb-3 text-[11px]">{d.rule.rule_text}</p>

      {d.instances.length === 0 ? (
        <p className="text-odl-subtle">No legislation found.</p>
      ) : (
        <div className="space-y-2.5">
          {d.instances.map((inst, i) => (
            <div key={inst.lawId + i} className={i > 0 ? 'border-t border-odl-border/40 pt-2' : ''}>
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <RelDot rel={inst.rel} size={9} />
                <span className="font-medium text-odl-text text-[10px]">{inst.lawName}</span>
                <span className={`text-[8px] font-bold px-1 rounded ${inst.binding ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {inst.binding ? 'BINDING' : 'SOFT'}
                </span>
              </div>
              <div className="pl-4 space-y-0.5 text-[10px] text-odl-muted">
                <div style={{ color: REL_CONFIG[inst.rel].color === 'transparent' ? '#A1A1AA' : REL_CONFIG[inst.rel].color }}>
                  {REL_CONFIG[inst.rel].label}
                </div>
                {inst.citation && <div className="text-odl-subtle">{inst.citation}</div>}
                {inst.notes && <p className="text-odl-subtle leading-relaxed">{inst.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-odl-border space-y-0.5 text-[9px] text-odl-subtle">
        <div><span className="font-medium">First instance:</span> {d.rule.first_instance.law_name} ({d.rule.first_instance.date.slice(0,4)})</div>
        {consensus.adoptions > 0 && (
          <div><span className="font-medium">Adopted by:</span> {consensus.adoptions} jurisdictions
            {!consensus.isFirstInstance && <span className="ml-1 text-amber-600 font-medium">★ consensus shifted</span>}
          </div>
        )}
        {best && <div><span className="font-medium">Category:</span> {RULE_CATEGORY_LABELS[d.rule.category as RuleCategory] ?? d.rule.category}</div>}
      </div>
    </div>
  )
}

// ── semantic search panel ─────────────────────────────────────────────────────

function SemanticSearchPanel({ onResults, onClear }: { onResults: (r: SearchResult[]) => void; onClear: () => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading-model' | 'searching'>('idle')
  const [pct, setPct] = useState(0)

  const run = useCallback(async () => {
    if (!query.trim()) { onClear(); return }
    if (!hasEmbeddings()) return
    if (!isModelReady()) {
      setStatus('loading-model')
      await initModel((p: LoadProgress) => setPct(Math.round(p.pct)))
    }
    setStatus('searching')
    try { onResults(await semanticSearch(query.trim(), allRules)) }
    finally { setStatus('idle') }
  }, [query, onResults, onClear])

  return (
    <div className="panel p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent"
          placeholder="Semantic search… e.g. 'consent before collecting biometric data'"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) onClear() }}
          onKeyDown={e => e.key === 'Enter' && run()}
        />
        <button className="px-3 py-1.5 text-xs bg-odl-accent text-white rounded hover:bg-odl-accent/90 disabled:opacity-50"
          onClick={run} disabled={status !== 'idle'}>
          {status === 'searching' ? 'Searching…' : 'Search'}
        </button>
        {query && <button className="text-xs text-odl-subtle hover:text-odl-text" onClick={() => { setQuery(''); onClear() }}>Clear</button>}
      </div>
      {status === 'loading-model' && (
        <div className="text-xs text-odl-muted">
          Loading model ({pct}%)…
          <div className="h-1 bg-odl-surface rounded-full mt-1 w-40 overflow-hidden">
            <div className="h-full bg-odl-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {!hasEmbeddings() && status === 'idle' && (
        <p className="text-xs text-odl-subtle">
          Semantic search requires <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code>.
        </p>
      )}
    </div>
  )
}

// ── export ────────────────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
function esc(s: string): string {
  const str = String(s ?? '')
  return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str
}

// ── instrument filter type ────────────────────────────────────────────────────

type InstrumentFilter = 'all' | 'binding' | 'soft'

// ── main component ────────────────────────────────────────────────────────────

export function RulesMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all')
  const [ruleSearch, setRuleSearch] = useState('')
  const [instrumentFilter, setInstrumentFilter] = useState<InstrumentFilter>('binding')
  const [semanticResults, setSemanticResults] = useState<SearchResult[] | null>(null)
  const [popover, setPopover] = useState<PopoverData | null>(null)

  useEffect(() => { loadEmbeddingData(precomputedEmbeddings) }, [])

  // law_id → { short_name, binding, colKey }
  const lawMeta = useMemo(() => {
    const m = new Map<string, { short_name: string; binding: boolean; colKey: string }>()
    regulations.forEach(l => m.set(l.id, {
      short_name: l.short_name,
      binding: l.instrument_binding ?? true,
      colKey: lawColKey(l),
    }))
    return m
  }, [])

  // Ordered country columns: Supranational first, then by region, then alpha
  const displayCols = useMemo(() => {
    const keys = [...new Set(regulations.map(l => lawColKey(l)))]
    return keys.sort((a, b) => colSortKey(a).localeCompare(colSortKey(b)))
  }, [])

  // Region groups for the column header row
  const colRegionGroups = useMemo(() => {
    const groups: { region: string; span: number }[] = []
    for (const key of displayCols) {
      const r = colRegion(key)
      const last = groups[groups.length - 1]
      if (last && last.region === r) last.span++
      else groups.push({ region: r, span: 1 })
    }
    return groups
  }, [displayCols])

  // Column separator indices: region changes + US sub-group transitions
  const regionBoundary = useMemo(() => {
    const s = new Set<number>()
    displayCols.forEach((key, i) => {
      if (i === 0) return
      const prev = displayCols[i - 1]
      // Region-level boundary
      if (colRegion(key) !== colRegion(prev)) { s.add(i); return }
      // US-FED → first US state
      if (prev === 'US-FED' && key.startsWith('US-')) { s.add(i); return }
      // Last US state → first non-US Americas
      if (prev.startsWith('US-') && !key.startsWith('US-') && key !== 'US-FED') s.add(i)
    })
    return s
  }, [displayCols])

  // Filtered rule rows
  const displayRules = useMemo(() => {
    if (semanticResults) return semanticResults.map(r => r.rule)
    let r = allRules
    if (selectedCategory !== 'all') r = r.filter(rl => rl.category === selectedCategory)
    if (ruleSearch.trim()) {
      const q = ruleSearch.trim().toLowerCase()
      r = r.filter(rl => rl.rule_text.toLowerCase().includes(q) || rl.tags.some(t => t.includes(q)))
    }
    if (instrumentFilter !== 'all') {
      r = r.filter(rl => {
        const b = lawMeta.get(rl.first_instance.law_id)?.binding ?? true
        return instrumentFilter === 'binding' ? b : !b
      })
    }
    return r.sort((a, b) =>
      a.category !== b.category ? a.category.localeCompare(b.category) : a.first_instance.date.localeCompare(b.first_instance.date)
    )
  }, [selectedCategory, ruleSearch, semanticResults, instrumentFilter, lawMeta])

  // Rules grouped by category (null in semantic mode)
  const grouped = useMemo(() => {
    if (semanticResults) return null
    const m = new Map<string, Rule[]>()
    for (const rule of displayRules) {
      const list = m.get(rule.category) ?? []; list.push(rule); m.set(rule.category, list)
    }
    return m
  }, [displayRules, semanticResults])

  const allCategories = useMemo(() =>
    [...new Set(allRules.map(r => r.category as RuleCategory))].sort()
  , [])

  // Pre-compute matrix: rule_id → colKey → best cell
  const matrix = useMemo(() => {
    const m = new Map<string, Map<string, { rel: RelOrAbsent; lawId: string }>>()
    for (const rule of displayRules) {
      const rm = new Map<string, { rel: RelOrAbsent; lawId: string }>()
      m.set(rule.rule_id, rm)
      for (const inst of rule.instances) {
        const meta = lawMeta.get(inst.law_id)
        if (!meta) continue
        if (instrumentFilter === 'binding' && !meta.binding) continue
        if (instrumentFilter === 'soft' && meta.binding) continue
        const rel = (inst.relationship ?? 'absent') as RelOrAbsent
        const existing = rm.get(meta.colKey)
        if (!existing || REL_PRIORITY[rel] > REL_PRIORITY[existing.rel]) {
          rm.set(meta.colKey, { rel, lawId: inst.law_id })
        }
      }
    }
    return m
  }, [displayRules, instrumentFilter, lawMeta])

  function handleCellClick(rule: Rule, colKey: string, e: React.MouseEvent) {
    e.stopPropagation()
    // Collect all instances from this jurisdiction for this rule
    const instances: PopoverInst[] = rule.instances
      .filter(inst => {
        const meta = lawMeta.get(inst.law_id)
        if (!meta || meta.colKey !== colKey) return false
        if (instrumentFilter === 'binding' && !meta.binding) return false
        if (instrumentFilter === 'soft' && meta.binding) return false
        return true
      })
      .map(inst => {
        const meta = lawMeta.get(inst.law_id)!
        return {
          rel: (inst.relationship ?? 'absent') as RelOrAbsent,
          lawId: inst.law_id,
          lawName: meta.short_name,
          citation: inst.citation,
          notes: inst.notes,
          binding: meta.binding,
        }
      })
      .sort((a, b) => REL_PRIORITY[b.rel] - REL_PRIORITY[a.rel])
    setPopover({ x: e.clientX, y: e.clientY, rule, colKey, instances })
  }

  function exportCsv() {
    const header = ['rule_id', 'category', 'rule_text', ...displayCols.map(k => esc(colLabel(k)))].join(',')
    const rows = displayRules.map(rule => {
      const rm = matrix.get(rule.rule_id)
      return [rule.rule_id, rule.category, esc(rule.rule_text), ...displayCols.map(k => rm?.get(k)?.rel ?? 'absent')].join(',')
    })
    downloadFile([header, ...rows].join('\n'), 'gaia-rules-by-country.csv', 'text/csv')
  }

  const HEADER_H = 112  // px — room for longest country name at font-size 9

  return (
    <div className="flex flex-col gap-4 max-w-screen-2xl" onClick={() => setPopover(null)}>

      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">Rules Matrix</h2>
        <p className="text-xs text-odl-muted leading-relaxed">
          Rows are individual rules, grouped by category. Columns are jurisdictions — each dot shows the strongest
          position any law in that jurisdiction takes on the rule. Hover or click for the specific law.
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
        <span className="text-odl-subtle/70">Empty = no legislation</span>
      </div>

      {/* Semantic search */}
      <SemanticSearchPanel onResults={setSemanticResults} onClear={() => setSemanticResults(null)} />

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent"
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value as RuleCategory | 'all'); setSemanticResults(null) }}>
          <option value="all">All categories</option>
          {allCategories.map(c => (
            <option key={c} value={c}>{RULE_CATEGORY_LABELS[c as RuleCategory]}</option>
          ))}
        </select>
        <input
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent w-44"
          placeholder="Filter rules…"
          value={ruleSearch}
          onChange={e => { setRuleSearch(e.target.value); setSemanticResults(null) }}
        />
        <div className="flex items-center rounded border border-odl-border overflow-hidden">
          {(['all', 'binding', 'soft'] as InstrumentFilter[]).map(f => (
            <button key={f}
              className={`px-2.5 py-1.5 text-xs transition-colors ${instrumentFilter === f ? 'bg-odl-accent text-white' : 'text-odl-muted hover:bg-odl-surface'}`}
              onClick={() => setInstrumentFilter(f)}>
              {f === 'all' ? 'All' : f === 'binding' ? '⚖ Binding' : '📋 Soft law'}
            </button>
          ))}
        </div>
        <span className="text-xs text-odl-subtle">{displayRules.length} rules · {displayCols.length} jurisdictions</span>
        <button className="px-2 py-1.5 text-xs border border-odl-border rounded text-odl-muted hover:text-odl-text hover:bg-odl-surface" onClick={exportCsv}>↓ CSV</button>
      </div>

      {/* ── Matrix ── */}
      <div className="panel overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-280px)]">
          <table className="border-collapse" style={{ tableLayout: 'fixed' }}>

            <thead className="sticky top-0 z-20 bg-white">
              {/* Region header row */}
              <tr>
                <th style={{ width: CAT_COL, minWidth: CAT_COL, padding: 0, borderBottom: '1px solid #E4E4E7' }} />
                {colRegionGroups.map((g, gi) => (
                  <th key={`${g.region}-${gi}`} colSpan={g.span}
                    style={{
                      padding: '2px 0',
                      borderBottom: '1px solid #E4E4E7',
                      borderLeft: gi > 0 ? '2px solid rgba(59,130,246,0.25)' : undefined,
                      textAlign: 'center',
                      fontSize: 7, fontWeight: 700, color: '#71717A',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      overflow: 'hidden', whiteSpace: 'nowrap',
                    }}>
                    {g.region}
                  </th>
                ))}
              </tr>

              {/* US sub-group header row: "United States" spanning FED + all states */}
              {(() => {
                const fedIdx = displayCols.indexOf('US-FED')
                const usCount = displayCols.filter(k => k === 'US-FED' || k.startsWith('US-')).length
                if (fedIdx < 0 || usCount === 0) return null
                const preSpan = fedIdx
                const postSpan = displayCols.length - fedIdx - usCount
                return (
                  <tr>
                    <th style={{ width: CAT_COL, minWidth: CAT_COL, padding: 0, borderBottom: '1px solid #E4E4E7' }} />
                    {preSpan > 0 && <th colSpan={preSpan} style={{ padding: 0, borderBottom: '1px solid #E4E4E7' }} />}
                    <th colSpan={usCount}
                      style={{
                        padding: '1px 0', textAlign: 'center',
                        borderBottom: '1px solid #E4E4E7',
                        borderLeft: '2px solid rgba(59,130,246,0.35)',
                        borderRight: '2px solid rgba(59,130,246,0.35)',
                        fontSize: 7, fontWeight: 700, color: '#1D4ED8',
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                        background: 'rgba(219,234,254,0.25)',
                      }}>
                      United States
                    </th>
                    {postSpan > 0 && <th colSpan={postSpan} style={{ padding: 0, borderBottom: '1px solid #E4E4E7' }} />}
                  </tr>
                )
              })()}

              {/* Jurisdiction column headers */}
              <tr>
                <th style={{ width: CAT_COL, minWidth: CAT_COL, padding: 0, borderBottom: '2px solid #E4E4E7', borderRight: '1px solid #D4D4D8' }} />
                {displayCols.map((key, ci) => {
                  const isUS = key === 'US-FED' || key.startsWith('US-')
                  return (
                    <th key={key}
                      style={{
                        width: CELL, minWidth: CELL, padding: 0,
                        borderBottom: '2px solid #E4E4E7',
                        borderRight: '1px solid rgba(228,228,231,0.35)',
                        borderLeft: regionBoundary.has(ci) ? '2px solid rgba(59,130,246,0.3)' : undefined,
                        background: isUS ? 'rgba(219,234,254,0.15)' : undefined,
                      }}
                      title={`${colLabel(key)}${isUS ? ' (United States)' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: HEADER_H, paddingBottom: 5 }}>
                        <span style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          fontSize: 9, fontWeight: 600,
                          color: isUS ? '#1D4ED8' : '#52525B',
                          letterSpacing: '0.03em', whiteSpace: 'nowrap',
                        }}>
                          {colHeaderLabel(key)}
                        </span>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {semanticResults ? (
                // Flat rows (no category grouping) for semantic search
                displayRules.map(rule => {
                  const rm = matrix.get(rule.rule_id)
                  return (
                    <tr key={rule.rule_id} className="hover:bg-blue-50/20">
                      <td className="p-0 border-r border-odl-border/50 select-none"
                        style={{ width: CAT_COL, minWidth: CAT_COL }}>
                        <div className="flex items-center justify-center" style={{ height: CELL }}>
                          <div style={{ width: 6, height: 6, borderRadius: 1, background: CAT_COLOR[rule.category as RuleCategory] ?? '#94A3B8' }}
                            title={RULE_CATEGORY_LABELS[rule.category as RuleCategory] ?? rule.category} />
                        </div>
                      </td>
                      {displayCols.map((key, ci) => {
                        const cell = rm?.get(key)
                        const isUS = key === 'US-FED' || key.startsWith('US-')
                        return (
                          <td key={key}
                            className="group/cell p-0 cursor-pointer hover:bg-blue-100/60 border-r border-odl-border/15"
                            style={{
                              width: CELL, minWidth: CELL,
                              borderLeft: regionBoundary.has(ci) ? '2px solid rgba(59,130,246,0.2)' : undefined,
                              background: isUS ? 'rgba(219,234,254,0.12)' : undefined,
                            }}
                            onClick={e => handleCellClick(rule, key, e)}
                            title={cell ? `${colLabel(key)} · ${cell.rel} · hover for law` : `${colLabel(key)} · No legislation`}>
                            <div className="flex items-center justify-center" style={{ height: CELL }}>
                              {cell && <RelDot rel={cell.rel} />}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              ) : grouped ? (
                [...grouped.entries()].map(([cat, catRules], gIdx, arr) => (
                  <Fragment key={cat}>
                    {catRules.map((rule, rIdx) => {
                      const rm = matrix.get(rule.rule_id)
                      return (
                        <tr key={rule.rule_id} className="hover:bg-blue-50/20">
                          {/* Category label — rowspan */}
                          {rIdx === 0 && (
                            <td rowSpan={catRules.length}
                              className="border-r border-odl-border/50 select-none"
                              style={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                textAlign: 'center', verticalAlign: 'middle',
                                fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
                                color: CAT_COLOR[cat as RuleCategory] ?? '#71717A',
                                textTransform: 'uppercase',
                                width: CAT_COL, minWidth: CAT_COL,
                                padding: '4px 2px', whiteSpace: 'nowrap',
                              }}>
                              {RULE_CATEGORY_LABELS[cat as RuleCategory] ?? cat}
                            </td>
                          )}
                          {/* Country cells */}
                          {displayCols.map((key, ci) => {
                            const cell = rm?.get(key)
                            const isUS = key === 'US-FED' || key.startsWith('US-')
                            return (
                              <td key={key}
                                className="group/cell p-0 cursor-pointer hover:bg-blue-100/60 border-r border-odl-border/15"
                                style={{
                                  width: CELL, minWidth: CELL,
                                  borderLeft: regionBoundary.has(ci) ? '2px solid rgba(59,130,246,0.2)' : undefined,
                                  background: isUS ? 'rgba(219,234,254,0.12)' : undefined,
                                }}
                                onClick={e => handleCellClick(rule, key, e)}
                                title={cell
                                  ? `${rule.rule_text.slice(0, 70)}… · ${colLabel(key)} · ${REL_CONFIG[cell.rel].label}`
                                  : `${rule.rule_text.slice(0, 70)}… · ${colLabel(key)} · No legislation`}>
                                <div className="flex items-center justify-center" style={{ height: CELL }}>
                                  {cell && <RelDot rel={cell.rel} />}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                    {/* Category separator */}
                    {gIdx < arr.length - 1 && (
                      <tr>
                        <td colSpan={1 + displayCols.length}
                          style={{ height: 3, background: '#3B82F6', opacity: 0.3, padding: 0 }} />
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : null}

              {displayRules.length === 0 && (
                <tr>
                  <td colSpan={1 + displayCols.length} className="px-4 py-10 text-center text-xs text-odl-subtle">
                    No rules match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {popover && <CellPopover d={popover} onClose={() => setPopover(null)} />}

      <div className="text-[10px] text-odl-subtle space-y-0.5">
        <p>Columns are jurisdictions, separated by region. Each dot is the strongest position any law in that jurisdiction takes on the rule. Click for the specific law and citation.</p>
        <p>Semantic search: <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code></p>
      </div>
    </div>
  )
}
