import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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

const REL_CONFIG: Record<RelOrAbsent, { label: string; color: string; border?: string }> = {
  origin:   { label: 'First instance',  color: '#1870D5' },
  identical:{ label: 'Identical / copy',color: '#7C3AED' },
  agrees:   { label: 'Agrees',          color: '#16A34A' },
  similar:  { label: 'Similar',         color: '#D97706' },
  opposed:  { label: 'Opposed',         color: '#DC2626' },
  absent:   { label: 'Silent / absent', color: 'transparent', border: '#D4D4D8' },
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

// ── helpers ───────────────────────────────────────────────────────────────────

function RelDot({ rel, size = 12 }: { rel: RelOrAbsent; size?: number }) {
  const cfg = REL_CONFIG[rel]
  return (
    <div
      className="rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: cfg.color,
        border: cfg.border ? `1.5px solid ${cfg.border}` : undefined,
      }}
      title={cfg.label}
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
      className="fixed z-50 bg-white border border-odl-border rounded shadow-xl p-4 text-xs max-w-sm pointer-events-auto"
      style={{ left: Math.min(d.x + 12, window.innerWidth - 340), top: d.y + 12 }}
      onClick={e => e.stopPropagation()}
    >
      <button className="absolute top-2 right-2 text-odl-subtle hover:text-odl-text" onClick={onClose}>×</button>

      <div className="flex items-center gap-2 mb-2">
        <RelDot rel={rel} size={10} />
        <span className="font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>

      <p className="text-odl-text leading-snug mb-3">{d.rule.rule_text}</p>

      {inst ? (
        <div className="space-y-1.5 text-odl-muted">
          <div className="flex items-center gap-2">
            <span className="font-medium text-odl-text">Law:</span>
            <span>{d.lawName}</span>
            {inst.instrument_type && (
              <span
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                  inst.instrument_binding !== false
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
                title={inst.instrument_type}
              >
                {inst.instrument_binding !== false ? 'BINDING' : 'SOFT LAW'}
              </span>
            )}
          </div>
          {inst.instrument_type && (
            <div className="text-odl-subtle text-[10px]">
              Instrument type: <span className="font-medium">{inst.instrument_type.replace(/_/g, ' ')}</span>
            </div>
          )}
          <div><span className="font-medium text-odl-text">Citation:</span> {inst.citation}</div>
          {inst.variant_of && (
            <div><span className="font-medium text-odl-text">Copied from:</span> {inst.variant_of}</div>
          )}
          <p className="text-odl-subtle leading-relaxed mt-1">{inst.notes}</p>
        </div>
      ) : (
        <p className="text-odl-subtle">This law is silent on this rule.</p>
      )}

      <div className="mt-3 pt-3 border-t border-odl-border space-y-1 text-odl-subtle">
        <div>
          <span className="font-medium text-odl-muted">First introduced:</span>{' '}
          {d.rule.first_instance.law_name} ({d.rule.first_instance.date.slice(0, 4)})
        </div>
        {consensus.adoptions > 0 && (
          <div>
            <span className="font-medium text-odl-muted">De-facto consensus:</span>{' '}
            {consensus.law_id}
            {' '}
            <span className="text-odl-subtle">({consensus.adoptions} law{consensus.adoptions !== 1 ? 's' : ''} adopted this version)</span>
            {!consensus.isFirstInstance && (
              <span className="ml-1 text-amber-600 font-medium">(later than first instance)</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── semantic search panel ─────────────────────────────────────────────────────

function SemanticSearchPanel({
  onResults,
  onClear,
}: {
  onResults: (results: SearchResult[]) => void
  onClear: () => void
}) {
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
    } finally {
      setStatus('idle')
    }
  }, [query, hasEmb, onResults, onClear])

  return (
    <div className="panel p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            className="w-full border border-odl-border rounded px-3 py-2 text-xs pr-24 focus:outline-none focus:ring-1 focus:ring-odl-accent"
            placeholder="Find rules by concept... e.g. 'consent before collecting biometric data'"
            value={query}
            onChange={e => { setQuery(e.target.value); if (!e.target.value) onClear() }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          className="px-3 py-2 text-xs bg-odl-accent text-white rounded hover:bg-odl-accent/90 disabled:opacity-50"
          onClick={handleSearch}
          disabled={status === 'loading-model' || status === 'searching'}
        >
          {status === 'searching' ? 'Searching…' : 'Search'}
        </button>
        {query && (
          <button className="text-xs text-odl-subtle hover:text-odl-text" onClick={() => { setQuery(''); onClear() }}>
            Clear
          </button>
        )}
      </div>

      {status === 'loading-model' && (
        <div className="text-xs text-odl-muted">
          Loading embedding model ({modelProgress}%)…
          <div className="h-1 bg-odl-surface rounded-full mt-1 overflow-hidden w-48">
            <div className="h-full bg-odl-accent rounded-full transition-all" style={{ width: `${modelProgress}%` }} />
          </div>
        </div>
      )}
      {status === 'no-embeddings' && (
        <p className="text-xs text-amber-600">
          No embeddings found. Run <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code> to enable semantic search.
        </p>
      )}
      {!hasEmb && status === 'idle' && (
        <p className="text-xs text-odl-subtle">
          Semantic search is available after running{' '}
          <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code>.
          Until then, use the text filter above the matrix.
        </p>
      )}
    </div>
  )
}

// ── export helpers ────────────────────────────────────────────────────────────

function escCsv(s: string): string {
  const str = String(s ?? '')
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

interface ExportButtonsProps {
  rules: Rule[]
  laws: { id: string; short_name: string }[]
}

function ExportButtons({ rules, laws }: ExportButtonsProps) {
  function exportJson() {
    downloadFile(JSON.stringify(rules, null, 2), 'gaia-rules.json', 'application/json')
  }

  function exportCsv() {
    const lawIds = laws.map(l => l.id)
    const headers = [
      'rule_id', 'category', 'rule_text', 'rule_text_technical', 'tags',
      'first_law_id', 'first_law_name', 'first_citation', 'first_date',
      'total_instances', 'binding_instances', 'adoptions',
      ...lawIds.map(id => `rel:${id}`),
    ]
    const rows = rules.map(r => {
      const instMap = new Map(r.instances.map(i => [i.law_id, i]))
      const adoptions = r.instances.filter(i => i.relationship === 'identical' || i.relationship === 'agrees').length
      const bindingInst = r.instances.filter(i => i.instrument_binding !== false).length
      return [
        r.rule_id, r.category, r.rule_text, r.rule_text_technical,
        r.tags.join('; '),
        r.first_instance.law_id, r.first_instance.law_name,
        r.first_instance.citation, r.first_instance.date,
        String(r.instances.length), String(bindingInst), String(adoptions),
        ...lawIds.map(id => instMap.get(id)?.relationship ?? 'absent'),
      ].map(escCsv).join(',')
    })
    downloadFile([headers.join(','), ...rows].join('\n'), 'gaia-rules.csv', 'text/csv')
  }

  return (
    <div className="flex gap-1">
      <button
        className="px-2.5 py-1.5 text-xs border border-odl-border rounded text-odl-muted hover:text-odl-text hover:bg-odl-surface"
        onClick={exportCsv}
        title={`Export ${rules.length} rules to CSV`}
      >
        ↓ CSV
      </button>
      <button
        className="px-2.5 py-1.5 text-xs border border-odl-border rounded text-odl-muted hover:text-odl-text hover:bg-odl-surface"
        onClick={exportJson}
        title={`Export ${rules.length} rules to JSON`}
      >
        ↓ JSON
      </button>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

type InstrumentFilter = 'all' | 'binding' | 'soft'

const INSTRUMENT_FILTER_LABELS: Record<InstrumentFilter, string> = {
  all:     'All instruments',
  binding: 'Binding law only',
  soft:    'Soft law / policy only',
}

export function RulesMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all')
  const [ruleSearch, setRuleSearch] = useState('')
  const [selectedLawIds, setSelectedLawIds] = useState<Set<string>>(new Set(DEFAULT_LAW_IDS))
  const [showLawPicker, setShowLawPicker] = useState(false)
  const [lawSearch, setLawSearch] = useState('')
  const [instrumentFilter, setInstrumentFilter] = useState<InstrumentFilter>('all')
  const [popover, setPopover] = useState<CellDetail | null>(null)
  const [expandedRule, setExpandedRule] = useState<string | null>(null)
  const [semanticResults, setSemanticResults] = useState<SearchResult[] | null>(null)
  const matrixRef = useRef<HTMLDivElement>(null)

  // Load pre-computed embeddings on mount
  useEffect(() => {
    loadEmbeddingData(precomputedEmbeddings)
  }, [])

  const lawMap = useMemo(() => {
    const m = new Map<string, { short_name: string; enacted_date: string; instrument_binding: boolean; instrument_type: string }>()
    regulations.forEach(l => m.set(l.id, {
      short_name: l.short_name,
      enacted_date: l.enacted_date,
      instrument_binding: l.instrument_binding ?? true,
      instrument_type: l.instrument_type ?? 'statute',
    }))
    return m
  }, [])

  const displayLaws = useMemo(() =>
    [...selectedLawIds]
      .map(id => ({ id, ...(lawMap.get(id) ?? { short_name: id, enacted_date: '0000', instrument_binding: true, instrument_type: 'statute' }) }))
      .filter(l => {
        if (instrumentFilter === 'binding') return l.instrument_binding
        if (instrumentFilter === 'soft') return !l.instrument_binding
        return true
      })
      .sort((a, b) => a.enacted_date.localeCompare(b.enacted_date))
  , [selectedLawIds, lawMap, instrumentFilter])

  // When semantic search returns results, show those rules in score order
  const displayRules = useMemo(() => {
    if (semanticResults) {
      return semanticResults.map(r => r.rule)
    }
    let r = allRules
    // In soft-law mode, show rules that have at least one soft-law instance
    // In binding mode, show rules from binding instruments
    if (instrumentFilter !== 'all') {
      r = r.filter(rl => {
        const originBinding = lawMap.get(rl.first_instance.law_id)?.instrument_binding ?? true
        if (instrumentFilter === 'binding') return originBinding
        if (instrumentFilter === 'soft') return !originBinding
        return true
      })
    }
    if (selectedCategory !== 'all') r = r.filter(rl => rl.category === selectedCategory)
    if (ruleSearch.trim()) {
      const q = ruleSearch.trim().toLowerCase()
      r = r.filter(rl =>
        rl.rule_text.toLowerCase().includes(q) ||
        rl.rule_text_technical.toLowerCase().includes(q) ||
        rl.tags.some(t => t.includes(q))
      )
    }
    return r.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      return a.first_instance.date.localeCompare(b.first_instance.date)
    })
  }, [selectedCategory, ruleSearch, semanticResults, instrumentFilter, lawMap])

  const grouped = useMemo(() => {
    // When showing semantic results, don't group — results are ranked by similarity
    if (semanticResults) return null
    const map = new Map<string, Rule[]>()
    for (const rule of displayRules) {
      const list = map.get(rule.category) ?? []
      list.push(rule)
      map.set(rule.category, list)
    }
    return map
  }, [displayRules, semanticResults])

  const categories = useMemo(() => {
    const cats = new Set(allRules.map(r => r.category as RuleCategory))
    return ['all' as const, ...([...cats].sort())]
  }, [])

  const allLawsSorted = useMemo(() =>
    [...regulations]
      .sort((a, b) => a.enacted_date.localeCompare(b.enacted_date))
      .filter(l => {
        if (!lawSearch.trim()) return true
        const q = lawSearch.toLowerCase()
        return l.short_name.toLowerCase().includes(q) || l.jurisdiction.toLowerCase().includes(q)
      })
  , [lawSearch])

  function toggleLaw(id: string) {
    setSelectedLawIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCellClick(rule: Rule, lawId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopover({ rule, lawId, lawName: lawMap.get(lawId)?.short_name ?? lawId, x: r.left, y: r.bottom })
  }

  function RuleRows({ rules }: { rules: Rule[] }) {
    return (
      <>
        {rules.map(rule => {
          const isExpanded = expandedRule === rule.rule_id
          const instMap = new Map(rule.instances.map(i => [i.law_id, i]))
          const consensus = computeConsensus(rule)
          const showConsensus = consensus.adoptions > 0 && !consensus.isFirstInstance

          return (
            <tr key={rule.rule_id} className="border-b border-odl-border/40 hover:bg-blue-50/20 group">
              {/* Rule text */}
              <td
                className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/20 border-r border-odl-border px-3 py-2 align-top min-w-[300px] max-w-[300px] cursor-pointer"
                onClick={() => setExpandedRule(isExpanded ? null : rule.rule_id)}
              >
                <p className={`text-odl-text leading-snug text-xs ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {rule.rule_text}
                </p>
                {isExpanded && (
                  <p className="text-odl-subtle mt-1.5 leading-snug text-[10px]">{rule.rule_text_technical}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {rule.tags.slice(0, 3).map(t => (
                    <span key={t} className="bg-odl-surface border border-odl-border/60 rounded-full px-1.5 py-px text-[9px] text-odl-subtle">
                      {t}
                    </span>
                  ))}
                </div>
              </td>

              {/* First instance + consensus */}
              <td className="sticky left-[300px] z-10 bg-white group-hover:bg-blue-50/20 border-r border-odl-border px-2 py-2 align-middle min-w-[96px] max-w-[96px]">
                <div className="text-[9px] leading-tight">
                  <div className="text-odl-subtle font-medium">First: {rule.first_instance.date.slice(0, 4)}</div>
                  <div className="text-odl-subtle truncate" title={rule.first_instance.law_name}>
                    {rule.first_instance.law_name.split(',')[0].slice(0, 16)}
                  </div>
                  {showConsensus && (
                    <div className="mt-1 text-amber-700 font-medium truncate" title={`De-facto consensus: ${consensus.law_id}`}>
                      ★ {consensus.law_id.slice(0, 16)}
                      <span className="text-amber-500 ml-0.5">({consensus.adoptions})</span>
                    </div>
                  )}
                </div>
              </td>

              {/* Relationship dots */}
              {displayLaws.map(law => {
                const inst = instMap.get(law.id)
                const rel: RelOrAbsent = inst ? inst.relationship : 'absent'
                return (
                  <td
                    key={law.id}
                    className="border-r border-odl-border/30 text-center align-middle min-w-[40px] max-w-[40px] cursor-pointer hover:bg-odl-surface/60"
                    onClick={e => handleCellClick(rule, law.id, e)}
                  >
                    <div className="flex items-center justify-center py-2">
                      <RelDot rel={rel} size={11} />
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
          Each row is a distinct legal rule anchored to its first instance. Cells show how each law
          relates to that rule. <strong>De-facto consensus</strong> (★) is the version most widely
          adopted. Column headers show <span className="font-bold text-blue-700 bg-blue-100 px-1 rounded text-[9px]">B</span>{' '}
          for binding instruments (statutes, regulations) and <span className="font-bold text-gray-500 bg-gray-100 px-1 rounded text-[9px]">S</span>{' '}
          for soft law (voluntary frameworks, guidelines). Use the instrument filter to compare enforced vs. recommended standards.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-odl-muted">
        {(Object.entries(REL_CONFIG) as [RelOrAbsent, typeof REL_CONFIG[RelOrAbsent]][]).map(([rel, cfg]) => (
          <span key={rel} className="flex items-center gap-1.5">
            <RelDot rel={rel} size={10} />
            {cfg.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-amber-700">
          <span className="font-bold">★</span>
          De-facto consensus (most adopted version)
        </span>
      </div>

      {/* Semantic search */}
      <SemanticSearchPanel
        onResults={setSemanticResults}
        onClear={() => setSemanticResults(null)}
      />

      {/* Keyword controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent w-48"
          placeholder="Keyword filter..."
          value={ruleSearch}
          onChange={e => { setRuleSearch(e.target.value); setSemanticResults(null) }}
        />
        <select
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent"
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value as RuleCategory | 'all'); setSemanticResults(null) }}
        >
          <option value="all">All categories</option>
          {categories.filter(c => c !== 'all').map(c => (
            <option key={c} value={c}>{RULE_CATEGORY_LABELS[c as RuleCategory]}</option>
          ))}
        </select>
        {/* Instrument type filter */}
        <div className="flex items-center rounded border border-odl-border overflow-hidden">
          {(['all', 'binding', 'soft'] as InstrumentFilter[]).map(f => (
            <button
              key={f}
              className={`px-2.5 py-1.5 text-xs transition-colors ${
                instrumentFilter === f
                  ? 'bg-odl-accent text-white'
                  : 'text-odl-muted hover:bg-odl-surface'
              }`}
              onClick={() => { setInstrumentFilter(f); setSemanticResults(null) }}
              title={INSTRUMENT_FILTER_LABELS[f]}
            >
              {f === 'all' ? 'All' : f === 'binding' ? '⚖ Binding' : '📋 Soft law'}
            </button>
          ))}
        </div>
        <button
          className="border border-odl-border rounded px-3 py-1.5 text-xs text-odl-muted hover:text-odl-text hover:bg-odl-surface"
          onClick={e => { e.stopPropagation(); setShowLawPicker(v => !v) }}
        >
          Laws shown ({selectedLawIds.size})
        </button>
        <span className="text-xs text-odl-subtle">
          {semanticResults ? `${semanticResults.length} semantic matches` : `${displayRules.length} rules · ${displayLaws.length} law cols`}
        </span>
        <ExportButtons rules={displayRules} laws={displayLaws} />
      </div>

      {/* Law picker */}
      {showLawPicker && (
        <div className="panel p-4 max-h-64 overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <input
              className="border border-odl-border rounded px-3 py-1.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-odl-accent"
              placeholder="Search laws..."
              value={lawSearch}
              onChange={e => setLawSearch(e.target.value)}
            />
            <button className="text-xs text-odl-accent" onClick={() => setSelectedLawIds(new Set(DEFAULT_LAW_IDS))}>Reset</button>
            <button className="text-xs text-odl-subtle" onClick={() => setSelectedLawIds(new Set(regulations.map(l => l.id)))}>All</button>
            <button className="text-xs text-odl-subtle" onClick={() => setSelectedLawIds(new Set())}>None</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {allLawsSorted.map(l => {
              const isBinding = l.instrument_binding ?? true
              return (
                <label key={l.id} className="flex items-center gap-1.5 text-xs text-odl-muted cursor-pointer hover:text-odl-text py-0.5">
                  <input type="checkbox" checked={selectedLawIds.has(l.id)} onChange={() => toggleLaw(l.id)} className="accent-odl-accent" />
                  <span
                    className={`text-[8px] font-bold px-1 rounded leading-none flex-shrink-0 ${
                      isBinding ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}
                    title={l.instrument_type}
                  >
                    {isBinding ? 'B' : 'S'}
                  </span>
                  <span className="truncate" title={`${l.short_name} [${l.instrument_type}]`}>{l.short_name}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Matrix */}
      <div className="panel overflow-hidden">
        <div ref={matrixRef} className="overflow-auto max-h-[calc(100vh-320px)]">
          <table className="border-collapse text-xs min-w-max">
            <thead className="sticky top-0 z-20 bg-white">
              <tr>
                <th className="sticky left-0 z-30 bg-white border-b border-r border-odl-border px-3 py-2 text-left min-w-[300px] max-w-[300px]">
                  <span className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wider">Rule</span>
                </th>
                <th className="sticky left-[300px] z-30 bg-white border-b border-r border-odl-border px-2 py-2 text-left min-w-[96px] max-w-[96px]">
                  <span className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wider">Origin / ★ Consensus</span>
                </th>
                {displayLaws.map(law => (
                  <th key={law.id} className="border-b border-r border-odl-border/50 px-0 py-2 text-center min-w-[40px] max-w-[40px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`text-[8px] font-bold px-1 rounded leading-none ${
                          law.instrument_binding
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        title={law.instrument_binding ? `Binding: ${law.instrument_type}` : `Soft law: ${law.instrument_type}`}
                      >
                        {law.instrument_binding ? 'B' : 'S'}
                      </span>
                      <div
                        className="text-[9px] font-medium text-odl-muted leading-tight mx-auto"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 80, overflow: 'hidden' }}
                        title={`${law.short_name} [${law.instrument_type}]`}
                      >
                        {law.short_name.length > 22 ? law.short_name.slice(0, 20) + '…' : law.short_name}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {semanticResults ? (
                // Semantic search results: flat list, no category grouping
                <RuleRows rules={displayRules} />
              ) : grouped ? (
                // Normal view: grouped by category
                [...grouped.entries()].map(([cat, catRules]) => (
                  <>
                    <tr key={`cat-${cat}`} className="bg-odl-surface">
                      <td
                        colSpan={2 + displayLaws.length}
                        className="sticky left-0 px-3 py-1.5 text-[10px] font-semibold text-odl-subtle uppercase tracking-wider border-b border-odl-border"
                      >
                        {RULE_CATEGORY_LABELS[cat as RuleCategory]} · {catRules.length} rule{catRules.length !== 1 ? 's' : ''}
                      </td>
                    </tr>
                    <RuleRows rules={catRules} />
                  </>
                ))
              ) : null}

              {displayRules.length === 0 && (
                <tr>
                  <td colSpan={2 + displayLaws.length} className="px-4 py-10 text-center text-xs text-odl-subtle">
                    No rules match.
                    {allRules.length === 0 && (
                      <span> Run <code className="font-mono bg-odl-surface border border-odl-border rounded px-1.5">npm run extract-rules</code> overnight to populate.</span>
                    )}
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
      <div className="text-[10px] text-odl-subtle leading-relaxed space-y-1">
        <p>
          <strong>Semantic search:</strong> powered by all-MiniLM-L6-v2 (384-dim embeddings).
          Run <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">npm run embed-rules</code> to
          generate embeddings for all rules, then commit <code className="font-mono">data/embeddings.json</code>.
        </p>
        <p>
          <strong>Expand the corpus:</strong> run{' '}
          <code className="font-mono bg-odl-surface border border-odl-border rounded px-1">ANTHROPIC_API_KEY=… npm run extract-rules</code>{' '}
          to process all {regulations.length} laws chronologically. Current seed: {allRules.length} rules.
        </p>
      </div>
    </div>
  )
}
