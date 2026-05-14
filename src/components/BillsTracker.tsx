import { useState, useMemo } from 'react'
import { regulations } from '../data/regulations'

interface Bill {
  id: string
  jurisdiction: string
  jurisdiction_type: string
  region: string
  short_name: string
  full_name: string
  instrument_type?: string
  bill_number?: string
  status: string
  primary_category?: string
  categories?: string[]
  topics?: string[]
  summary?: string
  official_text_url?: string
  summary_url?: string
  last_verified?: string
  last_action_date?: string | null
  last_action_description?: string | null
  legislative_stage?: string | null
  notable?: boolean
}

const bills = (regulations as unknown as Bill[]).filter(r => r.status === 'proposed')

// Stage ordering for sorting (higher = more advanced)
const STAGE_ORDER: Record<string, number> = {
  awaiting_signature:  6,
  passed_legislature:  5,
  passed_one_chamber:  4,
  passed_committee:    3,
  in_committee:        2,
  introduced:          1,
  unknown:             0,
}

const STAGE_LABELS: Record<string, string> = {
  awaiting_signature:  'Awaiting signature',
  passed_legislature:  'Passed legislature',
  passed_one_chamber:  'Passed one chamber',
  passed_committee:    'Out of committee',
  in_committee:        'In committee',
  introduced:          'Introduced',
  unknown:             'Stage unknown',
}

const STAGE_COLORS: Record<string, string> = {
  awaiting_signature:  'bg-odl-green-bg text-odl-green border border-odl-green/30',
  passed_legislature:  'bg-odl-green-bg text-odl-green border border-odl-green/30',
  passed_one_chamber:  'bg-odl-yellow-bg text-odl-yellow border border-odl-yellow/30',
  passed_committee:    'bg-odl-yellow-bg text-odl-yellow border border-odl-yellow/30',
  in_committee:        'bg-odl-surface-2 text-odl-muted border border-odl-border',
  introduced:          'bg-odl-surface-2 text-odl-muted border border-odl-border',
  unknown:             'bg-odl-surface-2 text-odl-subtle border border-odl-border',
}

const CATEGORY_LABELS: Record<string, string> = {
  synthetic_media_deepfake: 'Synthetic Media & Deepfakes',
  consumer_protection:      'Consumer Protection',
  health_ai:                'Healthcare AI',
  government_ai_use:        'Government AI Use',
  education_ai:             'Education AI',
  employment_ai:            'Employment AI',
  general_ai_governance:    'General AI Governance',
  criminal_justice:         'Criminal Justice',
  elections_political:      'Elections & Political',
  data_protection:          'Data Protection',
  algorithmic_systems:      'Algorithmic Systems',
  biometric_identity:       'Biometric Identity',
  national_security:        'National Security',
  ip_creative_rights:       'IP & Creative Rights',
}

function StageBadge({ stage }: { stage: string | null | undefined }) {
  const s = stage ?? 'unknown'
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${STAGE_COLORS[s] ?? STAGE_COLORS.unknown}`}>
      {STAGE_LABELS[s] ?? s}
    </span>
  )
}

function getStateCode(region: string): string {
  return region.startsWith('US-') ? region.slice(3) : region
}

// Bills with real momentum — passed at least one chamber
const HOT_STAGES = new Set(['awaiting_signature', 'passed_legislature', 'passed_one_chamber'])

export function BillsTracker() {
  const [stateFilter, setStateFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [stageFilter, setStageFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<'categories' | 'list'>('categories')

  const usStateBills = useMemo(() => bills.filter(b => b.region?.startsWith('US-')), [])
  const globalBills  = useMemo(() => bills.filter(b => !b.region?.startsWith('US-')), [])
  const hotBills     = useMemo(() => bills.filter(b => HOT_STAGES.has(b.legislative_stage ?? '')), [])

  const states = useMemo(() => {
    const seen = new Set<string>()
    return usStateBills.map(b => b.region)
      .filter(r => { if (seen.has(r)) return false; seen.add(r); return true })
      .sort()
  }, [usStateBills])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    return bills.map(b => b.primary_category).filter((c): c is string => {
      if (!c || seen.has(c)) return false; seen.add(c); return true
    }).sort()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return bills
      .filter(b => {
        if (stateFilter && b.region !== stateFilter) return false
        if (categoryFilter && b.primary_category !== categoryFilter) return false
        if (stageFilter && (b.legislative_stage ?? 'unknown') !== stageFilter) return false
        if (q && !b.short_name.toLowerCase().includes(q) &&
            !b.bill_number?.toLowerCase().includes(q) &&
            !b.jurisdiction.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => (STAGE_ORDER[b.legislative_stage ?? 'unknown'] ?? 0) - (STAGE_ORDER[a.legislative_stage ?? 'unknown'] ?? 0))
  }, [stateFilter, categoryFilter, stageFilter, search])

  // Group bills by category for category view
  const byCategory = useMemo(() => {
    const map = new Map<string, Bill[]>()
    bills.forEach(b => {
      const cat = b.primary_category ?? 'other'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(b)
    })
    // Sort categories by bill count desc
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [])

  const stageCount = (cat: string) => {
    const catBills = byCategory.find(([c]) => c === cat)?.[1] ?? []
    const counts: Record<string, number> = {}
    catBills.forEach(b => {
      const s = b.legislative_stage ?? 'unknown'
      counts[s] = (counts[s] ?? 0) + 1
    })
    return counts
  }

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id)
  }

  const hasFilters = stateFilter || categoryFilter || stageFilter || search

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">Legislative Tracker</h2>
        <p className="text-xs text-odl-muted">Active AI bills currently before legislatures — not yet signed into law.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="panel p-3 text-center">
          <div className="text-lg font-bold font-mono text-odl-text">{bills.length}</div>
          <div className="text-[10px] text-odl-subtle mt-0.5">Active Bills</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-lg font-bold font-mono text-odl-text">{new Set(usStateBills.map(b => b.region)).size}</div>
          <div className="text-[10px] text-odl-subtle mt-0.5">US States</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-lg font-bold font-mono text-odl-green">{hotBills.length}</div>
          <div className="text-[10px] text-odl-subtle mt-0.5">Passed ≥1 Chamber</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-lg font-bold font-mono text-odl-text">{globalBills.length}</div>
          <div className="text-[10px] text-odl-subtle mt-0.5">Non-US Bills</div>
        </div>
      </div>

      {/* Close to passing spotlight */}
      {hotBills.length > 0 && (
        <div className="panel p-4">
          <h3 className="text-xs font-semibold text-odl-text mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-odl-green inline-block" />
            Close to passing
          </h3>
          <div className="space-y-2">
            {hotBills
              .sort((a, b) => (STAGE_ORDER[b.legislative_stage ?? ''] ?? 0) - (STAGE_ORDER[a.legislative_stage ?? ''] ?? 0))
              .map(bill => (
              <div key={bill.id} className="flex items-start gap-3 py-2 border-b border-odl-border/40 last:border-0 last:pb-0">
                <StageBadge stage={bill.legislative_stage} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-odl-text">{bill.short_name}</span>
                    {bill.bill_number && <span className="text-[10px] font-mono text-odl-subtle">{bill.bill_number}</span>}
                    <span className="text-[10px] text-odl-subtle">
                      {bill.region?.startsWith('US-') ? getStateCode(bill.region) : bill.jurisdiction}
                    </span>
                  </div>
                  {bill.last_action_description && (
                    <div className="text-[10px] text-odl-muted mt-0.5">{bill.last_action_description}</div>
                  )}
                </div>
                {bill.last_action_date && (
                  <span className="text-[10px] font-mono text-odl-subtle shrink-0">{bill.last_action_date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View toggle + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-odl-border overflow-hidden text-xs shrink-0">
          <button
            onClick={() => setView('categories')}
            className={`px-3 py-1.5 ${view === 'categories' ? 'bg-odl-accent text-white' : 'text-odl-muted hover:text-odl-text hover:bg-odl-surface'}`}
          >By topic</button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 border-l border-odl-border ${view === 'list' ? 'bg-odl-accent text-white' : 'text-odl-muted hover:text-odl-text hover:bg-odl-surface'}`}
          >Full list</button>
        </div>

        <input
          type="text"
          placeholder="Search bill name or number…"
          value={search}
          onChange={e => { setSearch(e.target.value); setView('list') }}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent min-w-[200px]"
        />
        <select
          value={stateFilter}
          onChange={e => { setStateFilter(e.target.value); setView('list') }}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All jurisdictions</option>
          {states.map(s => <option key={s} value={s}>{getStateCode(s)}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setView('list') }}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All topics</option>
          {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
        </select>
        <select
          value={stageFilter}
          onChange={e => { setStageFilter(e.target.value); setView('list') }}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All stages</option>
          {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setStateFilter(''); setCategoryFilter(''); setStageFilter(''); setSearch('') }}
            className="text-xs text-odl-accent hover:text-odl-accent-hover underline"
          >Clear</button>
        )}
      </div>

      {/* Category cards view */}
      {view === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {byCategory.map(([cat, catBills]) => {
            const counts = stageCount(cat)
            const hot = catBills.filter(b => HOT_STAGES.has(b.legislative_stage ?? '')).length
            return (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setView('list') }}
                className="panel p-4 text-left hover:border-odl-accent-light transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="text-xs font-semibold text-odl-text leading-snug group-hover:text-odl-accent transition-colors">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </div>
                  <span className="text-lg font-bold font-mono text-odl-text shrink-0">{catBills.length}</span>
                </div>

                {/* Stage mini-bar */}
                <div className="flex gap-px h-1.5 rounded overflow-hidden mb-3">
                  {[
                    { key: 'awaiting_signature',  color: 'bg-odl-green' },
                    { key: 'passed_legislature',   color: 'bg-odl-green' },
                    { key: 'passed_one_chamber',   color: 'bg-odl-yellow' },
                    { key: 'passed_committee',     color: 'bg-odl-yellow/60' },
                    { key: 'in_committee',         color: 'bg-odl-border-strong' },
                    { key: 'introduced',           color: 'bg-odl-border' },
                    { key: 'unknown',              color: 'bg-odl-surface-2' },
                  ].map(({ key, color }) => {
                    const n = counts[key] ?? 0
                    if (!n) return null
                    return (
                      <div
                        key={key}
                        className={`${color} rounded-sm`}
                        style={{ flex: n }}
                        title={`${STAGE_LABELS[key]}: ${n}`}
                      />
                    )
                  })}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-odl-subtle">
                  {hot > 0 && (
                    <span className="text-odl-green font-medium">{hot} passed ≥1 chamber</span>
                  )}
                  <span>{new Set(catBills.map(b => b.region)).size} jurisdictions</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Full list view */}
      {view === 'list' && (
        <div className="panel overflow-hidden">
          <div className="px-4 py-2 border-b border-odl-border text-[10px] text-odl-subtle">
            {filtered.length.toLocaleString()} bill{filtered.length !== 1 ? 's' : ''} · sorted by stage (most advanced first)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-odl-border">
                  <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Bill</th>
                  <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Jurisdiction</th>
                  <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Topic</th>
                  <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Stage</th>
                  <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Last action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bill => (
                  <>
                    <tr
                      key={bill.id}
                      onClick={() => toggleExpand(bill.id)}
                      className="border-b border-odl-border/60 hover:bg-odl-accent-bg/30 transition-colors cursor-pointer select-none"
                    >
                      <td className="px-4 py-3 max-w-[240px]">
                        <div className="font-medium text-odl-text leading-tight">{bill.short_name}</div>
                        {bill.bill_number && (
                          <div className="text-odl-subtle font-mono text-[10px] mt-0.5">{bill.bill_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-odl-muted whitespace-nowrap">
                        {bill.region?.startsWith('US-') ? getStateCode(bill.region) : bill.jurisdiction}
                      </td>
                      <td className="px-4 py-3 text-odl-muted max-w-[160px]">
                        {bill.primary_category ? (CATEGORY_LABELS[bill.primary_category] ?? bill.primary_category) : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StageBadge stage={bill.legislative_stage} />
                      </td>
                      <td className="px-4 py-3 text-odl-muted max-w-[200px]">
                        {bill.last_action_date
                          ? <span className="font-mono text-[10px]">{bill.last_action_date}</span>
                          : <span className="text-odl-subtle">—</span>}
                      </td>
                    </tr>
                    {expanded === bill.id && (
                      <tr key={`${bill.id}-exp`} className="border-b border-odl-border/60 bg-odl-accent-bg/20">
                        <td colSpan={5} className="px-4 py-4">
                          {bill.last_action_description && (
                            <div className="text-[10px] text-odl-muted mb-2 font-medium">{bill.last_action_description}</div>
                          )}
                          <div className="text-xs text-odl-text leading-relaxed mb-3 max-w-3xl">
                            {bill.summary ?? bill.full_name}
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-odl-subtle">
                            {bill.official_text_url && (
                              <a href={bill.official_text_url} target="_blank" rel="noreferrer" className="odl-link">
                                Official text →
                              </a>
                            )}
                            {bill.last_verified && <span>Verified {bill.last_verified}</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-odl-subtle">No bills match the current filters.</div>
          )}
        </div>
      )}
    </div>
  )
}
