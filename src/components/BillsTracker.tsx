import { useState, useMemo } from 'react'
import { regulations } from '../data/regulations'

interface Bill {
  id: string
  jurisdiction: string
  jurisdiction_type: string
  region: string
  country?: string
  short_name: string
  full_name: string
  bill_number?: string
  status: string
  primary_category?: string
  summary?: string
  official_text_url?: string
  last_verified?: string
  last_action_date?: string | null
  last_action_description?: string | null
  legislative_stage?: string | null
  notable?: boolean
}

const bills = (regulations as unknown as Bill[]).filter(r => r.status === 'proposed')

const STAGES = [
  { key: 'introduced',         label: 'Introduced' },
  { key: 'in_committee',       label: 'In committee' },
  { key: 'passed_committee',   label: 'Committee cleared' },
  { key: 'passed_one_chamber', label: 'Passed chamber' },
  { key: 'passed_legislature', label: 'Passed legislature' },
  { key: 'awaiting_signature', label: 'Awaiting assent' },
]

const STAGE_ORDER: Record<string, number> = Object.fromEntries(
  STAGES.map((s, i) => [s.key, i + 1])
)

const STAGE_LABELS: Record<string, string> = Object.fromEntries(
  STAGES.map(s => [s.key, s.label])
)

const CATEGORY_LABELS: Record<string, string> = {
  synthetic_media_deepfake: 'Synthetic Media',
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

// Visual pipeline showing where a bill sits in the legislative process
function StagePipeline({ stage }: { stage: string | null | undefined }) {
  const current = STAGE_ORDER[stage ?? ''] ?? 0
  const isUnknown = !stage || stage === 'unknown'

  if (isUnknown) {
    return <span className="text-[10px] text-odl-subtle italic">Stage unknown</span>
  }

  return (
    <div className="flex items-center gap-px">
      {STAGES.map((s, i) => {
        const pos = i + 1
        const done = pos < current
        const active = pos === current
        return (
          <div key={s.key} className="flex items-center gap-px">
            <div
              title={s.label}
              className={`h-1.5 rounded-sm transition-colors ${
                active
                  ? current >= 5 ? 'bg-odl-green w-4' : current >= 4 ? 'bg-odl-yellow w-4' : 'bg-odl-accent w-4'
                  : done
                  ? current >= 5 ? 'bg-odl-green/40 w-3' : current >= 4 ? 'bg-odl-yellow/40 w-3' : 'bg-odl-accent/30 w-3'
                  : 'bg-odl-border w-3'
              }`}
            />
          </div>
        )
      })}
      <span className={`ml-1.5 text-[10px] font-medium ${
        current >= 5 ? 'text-odl-green' : current >= 4 ? 'text-odl-yellow' : 'text-odl-muted'
      }`}>
        {STAGE_LABELS[stage] ?? stage}
      </span>
    </div>
  )
}

function getStateCode(region: string): string {
  return region.startsWith('US-') ? region.slice(3) : region
}

const HOT_STAGES = new Set(['awaiting_signature', 'passed_legislature', 'passed_one_chamber'])

interface BillsTrackerProps { onViewLaw?: (id: string) => void }

export function BillsTracker({ onViewLaw }: BillsTrackerProps) {
  const [view, setView]                   = useState<'us' | 'global'>('us')
  const [stateFilter, setStateFilter]     = useState<string>('')
  const [countryFilter, setCountryFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [stageFilter, setStageFilter]     = useState<string>('')
  const [search, setSearch]               = useState('')

  const usStateBills = useMemo(() => bills.filter(b => b.region?.startsWith('US-')), [])
  const globalBills  = useMemo(() => bills.filter(b => !b.region?.startsWith('US-')), [])

  const activeBills = view === 'us' ? usStateBills : globalBills

  const hotBills = useMemo(() =>
    activeBills
      .filter(b => HOT_STAGES.has(b.legislative_stage ?? ''))
      .sort((a, b) => (STAGE_ORDER[b.legislative_stage ?? ''] ?? 0) - (STAGE_ORDER[a.legislative_stage ?? ''] ?? 0)),
  [activeBills])

  const states = useMemo(() => {
    const seen = new Set<string>()
    return usStateBills.map(b => b.region)
      .filter(r => { if (seen.has(r)) return false; seen.add(r); return true })
      .sort()
  }, [usStateBills])

  const countries = useMemo(() => {
    const seen = new Set<string>()
    return globalBills.map(b => b.country ?? b.jurisdiction)
      .filter((c): c is string => { if (!c || seen.has(c)) return false; seen.add(c); return true })
      .sort()
  }, [globalBills])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    return activeBills.map(b => b.primary_category).filter((c): c is string => {
      if (!c || seen.has(c)) return false; seen.add(c); return true
    }).sort()
  }, [activeBills])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return activeBills
      .filter(b => {
        if (view === 'us' && stateFilter && b.region !== stateFilter) return false
        if (view === 'global' && countryFilter && (b.country ?? b.jurisdiction) !== countryFilter) return false
        if (categoryFilter && b.primary_category !== categoryFilter) return false
        if (stageFilter && (b.legislative_stage ?? 'unknown') !== stageFilter) return false
        if (q && !b.short_name.toLowerCase().includes(q) &&
            !b.bill_number?.toLowerCase().includes(q) &&
            !b.jurisdiction.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => (STAGE_ORDER[b.legislative_stage ?? ''] ?? 0) - (STAGE_ORDER[a.legislative_stage ?? ''] ?? 0))
  }, [view, activeBills, stateFilter, countryFilter, categoryFilter, stageFilter, search])

  function switchView(v: 'us' | 'global') {
    setView(v)
    setStateFilter('')
    setCountryFilter('')
    setCategoryFilter('')
    setStageFilter('')
    setSearch('')
  }

  const hasFilters = stateFilter || countryFilter || categoryFilter || stageFilter || search

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-odl-text mb-1">Legislative Tracker</h2>
          <p className="text-xs text-odl-muted">Active AI legislative proposals currently before legislatures worldwide — not yet enacted.</p>
        </div>
        <div className="flex items-center gap-1 bg-odl-surface border border-odl-border rounded-md p-0.5 shrink-0">
          <button
            onClick={() => switchView('us')}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${view === 'us' ? 'bg-white text-odl-text shadow-sm' : 'text-odl-muted hover:text-odl-text'}`}
          >US States</button>
          <button
            onClick={() => switchView('global')}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${view === 'global' ? 'bg-white text-odl-text shadow-sm' : 'text-odl-muted hover:text-odl-text'}`}
          >Global</button>
        </div>
      </div>

      {/* Stats */}
      {view === 'us' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-text">{usStateBills.length}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">US State Bills</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-text">{new Set(usStateBills.map(b => b.region)).size}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">States Active</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-green">{hotBills.length}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">Passed ≥1 Chamber</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-text">{usStateBills.filter(b => !b.legislative_stage || b.legislative_stage === 'unknown').length}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">Stage Unknown</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-text">{globalBills.length}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">Bills</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-text">{new Set(globalBills.map(b => b.country ?? b.jurisdiction)).size}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">Countries</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-green">{hotBills.length}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">Passed ≥1 Chamber</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-lg font-bold font-mono text-odl-text">{new Set(globalBills.map(b => b.region)).size}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">Regions</div>
          </div>
        </div>
      )}

      {/* Close to passing spotlight */}
      {hotBills.length > 0 && (
        <div className="panel p-4">
          <h3 className="text-xs font-semibold text-odl-text mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-odl-green inline-block" />
            Close to passing
          </h3>
          <div className="divide-y divide-odl-border/40">
            {hotBills.map(bill => (
              <div key={bill.id} onClick={() => onViewLaw?.(bill.id)} className="flex items-start gap-4 py-2.5 first:pt-0 last:pb-0 cursor-pointer hover:bg-odl-surface/60 transition-colors rounded -mx-2 px-2">
                <div className="pt-0.5 shrink-0">
                  <StagePipeline stage={bill.legislative_stage} />
                </div>
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
                  <span className="text-[10px] font-mono text-odl-subtle shrink-0 pt-0.5">{bill.last_action_date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search bill name or number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent min-w-[200px]"
        />
        {view === 'us' ? (
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
          >
            <option value="">All states</option>
            {states.map(s => <option key={s} value={s}>{getStateCode(s)}</option>)}
          </select>
        ) : (
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
          >
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All topics</option>
          {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
        </select>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All stages</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          <option value="unknown">Stage unknown</option>
        </select>
        <span className="text-xs text-odl-muted">{filtered.length.toLocaleString()} bills</span>
        {hasFilters && (
          <button
            onClick={() => { setStateFilter(''); setCountryFilter(''); setCategoryFilter(''); setStageFilter(''); setSearch('') }}
            className="text-xs text-odl-accent hover:text-odl-accent-hover underline"
          >Clear</button>
        )}
      </div>

      {/* List */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-odl-border">
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Bill</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Jurisdiction</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Topic</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(bill => (
                <tr
                  key={bill.id}
                  onClick={() => onViewLaw?.(bill.id)}
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
                  <td className="px-4 py-3 min-w-[240px]">
                    <StagePipeline stage={bill.legislative_stage} />
                    {bill.last_action_description && (
                      <div className="text-[10px] text-odl-subtle mt-1 leading-snug max-w-xs">
                        {bill.last_action_description}
                        {bill.last_action_date && (
                          <span className="font-mono ml-1.5">{bill.last_action_date}</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-odl-subtle">No bills match the current filters.</div>
        )}
      </div>
    </div>
  )
}
