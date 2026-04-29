import { useState, useMemo, useEffect, useCallback, Fragment } from 'react'
import type { Rule, RuleCategory, RuleRelationship } from '../types'
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

// ── relationship config ───────────────────────────────────────────────────────

type RelOrAbsent = RuleRelationship | 'absent'

const REL_CONFIG: Record<RelOrAbsent, { label: string; color: string; border?: string; square?: boolean }> = {
  origin:   { label: 'Origin (first instance)', color: '#18181B', square: true },
  identical:{ label: 'Identical / copy',         color: '#7C3AED' },
  agrees:   { label: 'Agrees',                   color: '#16A34A' },
  similar:  { label: 'Similar',                  color: '#D97706' },
  opposed:  { label: 'Opposed',                  color: '#DC2626' },
  absent:   { label: 'Silent / absent',          color: 'transparent', border: '#D4D4D8' },
}

const DEFAULT_LAW_IDS = [
  'eu-eu-aiact-2024',
  'eu-eu-gdpr-2016',
  'us-il-bipa-2008',
  'us-ca-ccpa-cpra-2018',
  'us-co-sb205-2024',
  'us-nyc-ll144-2021',
  'us-tx-hb149-2025',
  'us-wa-hb2225-2026',
  'br-br-aiact-2025',
  'br-br-lgpd-2018',
  'cn-cn-genai-2023',
  'us-tn-elvisa-2024',
  'us-ca-ab2013-2024',
  'us-ca-sb53-2025',
  'us-fed-take-it-down-2026',
]

const DOT = 18   // dot diameter px
const CELL = 26  // cell width/height px (dot + padding)

// ── dot component ─────────────────────────────────────────────────────────────

function RelDot({ rel, size = DOT }: { rel: RelOrAbsent; size?: number }) {
  const cfg = REL_CONFIG[rel]
  return (
    <div
      className="flex-shrink-0 transition-transform duration-100 group-hover/cell:scale-110"
      style={{
        width: size,
        height: size,
        background: cfg.color,
        borderRadius: cfg.square ? 3 : '50%',
        border: cfg.border ? `1.5px solid ${cfg.border}` : undefined,
      }}
    />
  )
}

// ── cell popover ──────────────────────────────────────────────────────────────

interface CellDetail { rule: Rule; lawId: string; lawName: string; x: number; y: number }

function CellPopover({ d, onClose }: { d: CellDetail; onClose: () => void }) {
  const inst = d.rule.instances.find(i => i.law_id === d.lawId)
  const rel: RelOrAbsent = inst ? inst.relationship : 'absent'
  const cfg = REL_CONFIG[rel]
  const consensus = useMemo(() => computeConsensus(d.rule), [d.rule])

  return (
    <div
      className="fixed z-50 bg-white border border-odl-border rounded-lg shadow-2xl p-4 text-xs max-w-xs pointer-events-auto"
      style={{ left: Math.min(d.x + 10, window.innerWidth - 320), top: Math.min(d.y + 10, window.innerHeight - 260) }}
      onClick={e => e.stopPropagation()}
    >
      <button className="absolute top-2 right-2 text-odl-subtle hover:text-odl-text text-base leading-none" onClick={onClose}>×</button>

      {/* Relationship badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <RelDot rel={rel} size={10} />
        <span className="font-semibold text-[10px] uppercase tracking-wide" style={{ color: cfg.color === '#18181B' ? '#18181B' : cfg.color }}>
          {cfg.label}
        </span>
      </div>

      {/* Rule text */}
      <p className="text-odl-text leading-snug mb-2.5 text-[11px]">{d.rule.rule_text}</p>

      {/* Category + tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        <span className="bg-odl-surface border border-odl-border rounded px-1.5 py-px text-[9px] text-odl-subtle font-medium">
          {RULE_CATEGORY_LABELS[d.rule.category as RuleCategory] ?? d.rule.category}
        </span>
        {d.rule.tags.slice(0, 2).map(t => (
          <span key={t} className="bg-odl-surface border border-odl-border/60 rounded px-1.5 py-px text-[9px] text-odl-subtle">{t}</span>
        ))}
      </div>

      {inst ? (
        <div className="space-y-1 text-odl-muted border-t border-odl-border pt-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-odl-text">{d.lawName}</span>
            {inst.instrument_type && (
              <span className={`text-[8px] font-bold px-1.5 py-px rounded ${inst.instrument_binding !== false ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {inst.instrument_binding !== false ? 'BINDING' : 'SOFT LAW'}
              </span>
            )}
          </div>
          <div><span className="font-medium text-odl-text">Citation:</span> {inst.citation}</div>
          {inst.variant_of && <div><span className="font-medium text-odl-text">Copied from:</span> {inst.variant_of}</div>}
          {inst.notes && <p className="text-odl-subtle leading-relaxed mt-1">{inst.notes}</p>}
        </div>
      ) : (
        <p className="text-odl-subtle border-t border-odl-border pt-2.5">This law is silent on this rule.</p>
      )}

      <div className="mt-2.5 pt-2 border-t border-odl-border space-y-0.5 text-[9px] text-odl-subtle">
        <div><span className="font-medium">First:</span> {d.rule.first_instance.law_name} ({d.rule.first_instance.date.slice(0, 4)})</div>
        {consensus.adoptions > 0 && (
          <div>
            <span className="font-medium">Consensus:</span> {consensus.law_id}
            <span className="ml-1 text-odl-subtle">({consensus.adoptions} adopted)</span>
            {!consensus.isFirstInstance && <span className="ml-1 text-amber-600 font-medium">★ later</span>}
          </div>
        )}
      </div>
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
    try {
      const results = await semanticSearch(query.trim(), allRules)
      onResults(results)
    } finally { setStatus('idle') }
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
      {(status === 'no-embeddings' || (!hasEmb && status === 'idle')) && (
        <p className="text-xs text-odl-subtle">
          Semantic search requires <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code>.
        </p>
      )}
    </div>
  )
}

// ── export helpers ────────────────────────────────────────────────────────────

function escCsv(s: string): string {
  const str = String(s ?? '')
  return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function ExportButtons({ rules, laws }: { rules: Rule[]; laws: { id: string; short_name: string }[] }) {
  function exportJson() {
    downloadFile(JSON.stringify(rules, null, 2), 'gaia-rules.json', 'application/json')
  }
  function exportCsv() {
    const lawIds = laws.map(l => l.id)
    const headers = ['rule_id','category','rule_text','rule_text_technical','tags','first_law_id','first_law_name','first_citation','first_date','total_instances','binding_instances','adoptions',...lawIds.map(id=>`rel:${id}`)]
    const rows = rules.map(r => {
      const instMap = new Map(r.instances.map(i => [i.law_id, i]))
      const adoptions = r.instances.filter(i => i.relationship === 'identical' || i.relationship === 'agrees').length
      const bindingInst = r.instances.filter(i => i.instrument_binding !== false).length
      return [r.rule_id,r.category,r.rule_text,r.rule_text_technical,r.tags.join('; '),r.first_instance.law_id,r.first_instance.law_name,r.first_instance.citation,r.first_instance.date,String(r.instances.length),String(bindingInst),String(adoptions),...lawIds.map(id=>instMap.get(id)?.relationship??'absent')].map(escCsv).join(',')
    })
    downloadFile([headers.join(','),...rows].join('\n'), 'gaia-rules.csv', 'text/csv')
  }
  return (
    <div className="flex gap-1">
      <button className="px-2 py-1.5 text-xs border border-odl-border rounded text-odl-muted hover:text-odl-text hover:bg-odl-surface" onClick={exportCsv} title={`Export ${rules.length} rules to CSV`}>↓ CSV</button>
      <button className="px-2 py-1.5 text-xs border border-odl-border rounded text-odl-muted hover:text-odl-text hover:bg-odl-surface" onClick={exportJson} title={`Export ${rules.length} rules to JSON`}>↓ JSON</button>
    </div>
  )
}

// ── instrument filter ─────────────────────────────────────────────────────────

type InstrumentFilter = 'all' | 'binding' | 'soft'

// ── main component ────────────────────────────────────────────────────────────

export function RulesMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all')
  const [ruleSearch, setRuleSearch] = useState('')
  const [selectedLawIds, setSelectedLawIds] = useState<Set<string>>(new Set(DEFAULT_LAW_IDS))
  const [showLawPicker, setShowLawPicker] = useState(false)
  const [lawSearch, setLawSearch] = useState('')
  const [instrumentFilter, setInstrumentFilter] = useState<InstrumentFilter>('all')
  const [popover, setPopover] = useState<CellDetail | null>(null)
  const [semanticResults, setSemanticResults] = useState<SearchResult[] | null>(null)

  useEffect(() => { loadEmbeddingData(precomputedEmbeddings) }, [])

  const lawMap = useMemo(() => {
    const m = new Map<string, { short_name: string; enacted_date: string; instrument_binding: boolean; instrument_type: string }>()
    regulations.forEach(l => m.set(l.id, { short_name: l.short_name, enacted_date: l.enacted_date, instrument_binding: l.instrument_binding ?? true, instrument_type: l.instrument_type ?? 'statute' }))
    return m
  }, [])

  const displayLaws = useMemo(() =>
    [...selectedLawIds]
      .map(id => ({ id, ...(lawMap.get(id) ?? { short_name: id, enacted_date: '0000', instrument_binding: true, instrument_type: 'statute' }) }))
      .filter(l => instrumentFilter === 'binding' ? l.instrument_binding : instrumentFilter === 'soft' ? !l.instrument_binding : true)
      .sort((a, b) => a.enacted_date.localeCompare(b.enacted_date))
  , [selectedLawIds, lawMap, instrumentFilter])

  const displayRules = useMemo(() => {
    if (semanticResults) return semanticResults.map(r => r.rule)
    let r = allRules
    if (instrumentFilter !== 'all') r = r.filter(rl => {
      const b = lawMap.get(rl.first_instance.law_id)?.instrument_binding ?? true
      return instrumentFilter === 'binding' ? b : !b
    })
    if (selectedCategory !== 'all') r = r.filter(rl => rl.category === selectedCategory)
    if (ruleSearch.trim()) {
      const q = ruleSearch.trim().toLowerCase()
      r = r.filter(rl => rl.rule_text.toLowerCase().includes(q) || rl.rule_text_technical.toLowerCase().includes(q) || rl.tags.some(t => t.includes(q)))
    }
    return r.sort((a, b) => a.category !== b.category ? a.category.localeCompare(b.category) : a.first_instance.date.localeCompare(b.first_instance.date))
  }, [selectedCategory, ruleSearch, semanticResults, instrumentFilter, lawMap])

  const grouped = useMemo(() => {
    if (semanticResults) return null
    const map = new Map<string, Rule[]>()
    for (const rule of displayRules) {
      const list = map.get(rule.category) ?? []; list.push(rule); map.set(rule.category, list)
    }
    return map
  }, [displayRules, semanticResults])

  const categories = useMemo(() => {
    const cats = new Set(allRules.map(r => r.category as RuleCategory))
    return ['all' as const, ...([...cats].sort())]
  }, [])

  const allLawsSorted = useMemo(() =>
    [...regulations].sort((a,b) => a.enacted_date.localeCompare(b.enacted_date))
      .filter(l => !lawSearch.trim() || l.short_name.toLowerCase().includes(lawSearch.toLowerCase()) || l.jurisdiction.toLowerCase().includes(lawSearch.toLowerCase()))
  , [lawSearch])

  function toggleLaw(id: string) {
    setSelectedLawIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function handleCellClick(rule: Rule, lawId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setPopover({ rule, lawId, lawName: lawMap.get(lawId)?.short_name ?? lawId, x: e.clientX, y: e.clientY })
  }

  // Flat rows for semantic search mode (no grouping)
  function FlatRows({ rules }: { rules: Rule[] }) {
    return (
      <>
        {rules.map(rule => {
          const instMap = new Map(rule.instances.map(i => [i.law_id, i]))
          return (
            <tr key={rule.rule_id}>
              {/* Category indicator in flat mode */}
              <td className="p-0 border-r border-odl-border/40" style={{ width: 28, minWidth: 28 }}>
                <div className="flex items-center justify-center" style={{ height: CELL }}>
                  <div className="w-2 h-2 rounded-sm" style={{ background: '#94A3B8' }} title={RULE_CATEGORY_LABELS[rule.category as RuleCategory] ?? rule.category} />
                </div>
              </td>
              {displayLaws.map(law => {
                const inst = instMap.get(law.id)
                const rel: RelOrAbsent = inst ? inst.relationship : 'absent'
                return (
                  <td key={law.id} className="p-0 group/cell cursor-pointer hover:bg-blue-50/40"
                    style={{ width: CELL, minWidth: CELL }}
                    onClick={e => handleCellClick(rule, law.id, e)}
                    title={`${rule.rule_text.slice(0, 80)}… · ${law.short_name} · ${cfg_label(rel)}`}>
                    <div className="flex items-center justify-center" style={{ height: CELL }}>
                      <RelDot rel={rel} />
                    </div>
                  </td>
                )
              })}
            </tr>
          )
        })}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-screen-2xl" onClick={() => popover && setPopover(null)}>

      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">Rules Matrix</h2>
        <p className="text-xs text-odl-muted leading-relaxed">
          Each row is a distinct legal rule. Dots show how each law relates to it — click any dot for details.
          Rules are grouped by category. Column headers are laws (hover for name). Separator lines divide categories.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-odl-muted items-center">
        {(Object.entries(REL_CONFIG) as [RelOrAbsent, typeof REL_CONFIG[RelOrAbsent]][]).map(([rel, cfg]) => (
          <span key={rel} className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 12, background: cfg.color, borderRadius: cfg.square ? 2 : '50%', border: cfg.border ? `1.5px solid ${cfg.border}` : undefined, flexShrink: 0 }} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Semantic search */}
      <SemanticSearchPanel onResults={setSemanticResults} onClear={() => setSemanticResults(null)} />

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent w-44"
          placeholder="Keyword filter…"
          value={ruleSearch}
          onChange={e => { setRuleSearch(e.target.value); setSemanticResults(null) }}
        />
        <select
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent"
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value as RuleCategory | 'all'); setSemanticResults(null) }}>
          <option value="all">All categories</option>
          {categories.filter(c => c !== 'all').map(c => (
            <option key={c} value={c}>{RULE_CATEGORY_LABELS[c as RuleCategory]}</option>
          ))}
        </select>
        <div className="flex items-center rounded border border-odl-border overflow-hidden">
          {(['all','binding','soft'] as InstrumentFilter[]).map(f => (
            <button key={f}
              className={`px-2.5 py-1.5 text-xs transition-colors ${instrumentFilter === f ? 'bg-odl-accent text-white' : 'text-odl-muted hover:bg-odl-surface'}`}
              onClick={() => { setInstrumentFilter(f); setSemanticResults(null) }}>
              {f === 'all' ? 'All' : f === 'binding' ? '⚖ Binding' : '📋 Soft law'}
            </button>
          ))}
        </div>
        <button
          className="border border-odl-border rounded px-3 py-1.5 text-xs text-odl-muted hover:text-odl-text hover:bg-odl-surface"
          onClick={e => { e.stopPropagation(); setShowLawPicker(v => !v) }}>
          Laws ({selectedLawIds.size})
        </button>
        <span className="text-xs text-odl-subtle">
          {semanticResults ? `${semanticResults.length} matches` : `${displayRules.length} rules · ${displayLaws.length} laws`}
        </span>
        <ExportButtons rules={displayRules} laws={displayLaws} />
      </div>

      {/* Law picker */}
      {showLawPicker && (
        <div className="panel p-4 max-h-64 overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <input
              className="border border-odl-border rounded px-3 py-1.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-odl-accent"
              placeholder="Search laws…" value={lawSearch} onChange={e => setLawSearch(e.target.value)} />
            <button className="text-xs text-odl-accent" onClick={() => setSelectedLawIds(new Set(DEFAULT_LAW_IDS))}>Reset</button>
            <button className="text-xs text-odl-subtle" onClick={() => setSelectedLawIds(new Set(regulations.map(l => l.id)))}>All</button>
            <button className="text-xs text-odl-subtle" onClick={() => setSelectedLawIds(new Set())}>None</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {allLawsSorted.map(l => (
              <label key={l.id} className="flex items-center gap-1.5 text-xs text-odl-muted cursor-pointer hover:text-odl-text py-0.5">
                <input type="checkbox" checked={selectedLawIds.has(l.id)} onChange={() => toggleLaw(l.id)} className="accent-odl-accent" />
                <span className={`text-[8px] font-bold px-1 rounded leading-none flex-shrink-0 ${l.instrument_binding ?? true ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{l.instrument_binding ?? true ? 'B' : 'S'}</span>
                <span className="truncate" title={l.short_name}>{l.short_name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Matrix ── */}
      <div className="panel overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 z-20 bg-white">
              <tr>
                {/* Category label column header (empty corner) */}
                <th style={{ width: 28, minWidth: 28, borderBottom: '1px solid #E4E4E7', borderRight: '1px solid #E4E4E7', padding: 0 }} />
                {displayLaws.map(law => (
                  <th key={law.id}
                    style={{ width: CELL, minWidth: CELL, padding: 0, borderBottom: '1px solid #E4E4E7', borderRight: '1px solid rgba(228,228,231,0.4)' }}
                    title={`${law.short_name} · ${law.enacted_date.slice(0,4)} · ${law.instrument_binding ? 'Binding' : 'Soft law'}`}>
                    <div className="flex items-center justify-center py-1">
                      {/* Column header: black square, same size as origin dot */}
                      <div style={{ width: DOT, height: DOT, background: '#18181B', borderRadius: 3 }} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {semanticResults ? (
                // ── Flat / semantic search mode ──
                <FlatRows rules={displayRules} />
              ) : grouped ? (
                // ── Grouped by category ──
                [...grouped.entries()].map(([cat, catRules], gIdx, arr) => (
                  <Fragment key={cat}>
                    {catRules.map((rule, rIdx) => {
                      const instMap = new Map(rule.instances.map(i => [i.law_id, i]))
                      return (
                        <tr key={rule.rule_id} className="group">
                          {/* Category label — rowspan covers all rules in this group */}
                          {rIdx === 0 && (
                            <td
                              rowSpan={catRules.length}
                              className="border-r border-odl-border/50 select-none"
                              style={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                color: '#71717A',
                                textTransform: 'uppercase',
                                width: 28,
                                minWidth: 28,
                                padding: '4px 2px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {RULE_CATEGORY_LABELS[cat as RuleCategory] ?? cat}
                            </td>
                          )}
                          {/* Law cells */}
                          {displayLaws.map(law => {
                            const inst = instMap.get(law.id)
                            const rel: RelOrAbsent = inst ? inst.relationship : 'absent'
                            return (
                              <td
                                key={law.id}
                                className="group/cell p-0 cursor-pointer hover:bg-blue-50/50 border-r border-odl-border/20"
                                style={{ width: CELL, minWidth: CELL }}
                                onClick={e => handleCellClick(rule, law.id, e)}
                                title={`${rule.rule_text.slice(0, 80)}… · ${law.short_name} · ${REL_CONFIG[rel].label}`}
                              >
                                <div className="flex items-center justify-center" style={{ height: CELL }}>
                                  <RelDot rel={rel} />
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
                        <td
                          colSpan={1 + displayLaws.length}
                          style={{ height: 3, background: '#3B82F6', padding: 0, opacity: 0.35 }}
                        />
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : null}

              {displayRules.length === 0 && (
                <tr>
                  <td colSpan={1 + displayLaws.length} className="px-4 py-10 text-center text-xs text-odl-subtle">
                    No rules match.{allRules.length === 0 && <span> Run <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run extract-rules</code> to populate.</span>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popover */}
      {popover && <CellPopover d={popover} onClose={() => setPopover(null)} />}

      {/* Footer */}
      <div className="text-[10px] text-odl-subtle space-y-0.5">
        <p>Click any dot for rule text, citation, and relationship details. Hover for a quick preview.</p>
        <p>Semantic search: <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code> · Extract rules: <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">ANTHROPIC_API_KEY=… npm run extract-rules</code></p>
      </div>
    </div>
  )
}

// Helper used inline in FlatRows
function cfg_label(rel: RelOrAbsent) { return REL_CONFIG[rel].label }
