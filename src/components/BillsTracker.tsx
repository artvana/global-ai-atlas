import { useState, useMemo } from 'react'
import { regulations } from '../data/regulations'

interface Regulation {
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
  country?: string
}

const bills = (regulations as Regulation[]).filter(r => r.status === 'proposed')

const CATEGORY_LABELS: Record<string, string> = {
  synthetic_media_deepfake: 'Synthetic Media',
  consumer_protection: 'Consumer Protection',
  health_ai: 'Healthcare AI',
  government_ai_use: 'Government AI Use',
  education_ai: 'Education AI',
  employment_ai: 'Employment AI',
  general_ai_governance: 'General AI Governance',
  criminal_justice: 'Criminal Justice',
  elections_political: 'Elections',
  data_protection: 'Data Protection',
  algorithmic_systems: 'Algorithmic Systems',
  biometric_identity: 'Biometric Identity',
  national_security: 'National Security',
  ip_creative_rights: 'IP & Creative Rights',
}


function getYear(bill: Regulation): string {
  const m = bill.id.match(/-(\d{4})$/)
  return m ? m[1] : bill.last_verified?.slice(0, 4) ?? '—'
}

function getStateCode(region: string): string {
  return region.startsWith('US-') ? region.slice(3) : region
}

export function BillsTracker() {
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [stateFilter, setStateFilter] = useState<string>('')
  const [yearFilter, setYearFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const usStateBills = useMemo(() => bills.filter(b => b.region?.startsWith('US-')), [])
  const globalBills = useMemo(() => bills.filter(b => !b.region?.startsWith('US-')), [])

  const states = useMemo(() => {
    const seen = new Set<string>()
    return usStateBills.map(b => b.region).filter(r => { if (seen.has(r)) return false; seen.add(r); return true })
      .sort()
  }, [usStateBills])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    return bills.map(b => b.primary_category).filter((c): c is string => {
      if (!c || seen.has(c)) return false; seen.add(c); return true
    }).sort()
  }, [])

  const years = useMemo(() => {
    const seen = new Set<string>()
    return bills.map(getYear).filter(y => { if (y === '—' || seen.has(y)) return false; seen.add(y); return true })
      .sort().reverse()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return bills.filter(b => {
      if (categoryFilter && b.primary_category !== categoryFilter) return false
      if (stateFilter && b.region !== stateFilter) return false
      if (yearFilter && getYear(b) !== yearFilter) return false
      if (q && !b.short_name.toLowerCase().includes(q) && !b.bill_number?.toLowerCase().includes(q) &&
          !b.jurisdiction.toLowerCase().includes(q)) return false
      return true
    })
  }, [categoryFilter, stateFilter, yearFilter, search])

  const stateCount = new Set(usStateBills.map(b => b.region)).size

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">Legislative Tracker</h2>
        <p className="text-xs text-odl-muted">Active AI bills currently before legislatures — not yet signed into law.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Active Bills', value: bills.length, color: 'text-odl-text' },
          { label: 'US States',    value: stateCount,   color: 'text-odl-text' },
          { label: 'Other Jurisdictions', value: globalBills.length, color: 'text-odl-text' },
        ].map(s => (
          <div key={s.label} className="panel p-3 text-center">
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Non-US callout */}
      {globalBills.length > 0 && (
        <div className="panel p-3 flex items-center gap-3 text-xs text-odl-muted">
          <span className="text-odl-accent font-semibold">{globalBills.length}</span>
          <span>non-US bills tracked — {globalBills.map(b => b.jurisdiction).join(', ')}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search bill name, number, jurisdiction…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent min-w-[220px]"
        />
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All jurisdictions</option>
          {states.map(s => <option key={s} value={s}>{getStateCode(s)}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
        </select>
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-xs text-odl-muted ml-1">{filtered.length.toLocaleString()} bill{filtered.length !== 1 ? 's' : ''}</span>
        {(categoryFilter || stateFilter || yearFilter || search) && (
          <button
            onClick={() => { setCategoryFilter(''); setStateFilter(''); setYearFilter(''); setSearch('') }}
            className="text-xs text-odl-accent hover:text-odl-accent-hover underline"
          >Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-odl-border">
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Bill</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Jurisdiction</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Category</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Year</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Topics</th>
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
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="font-medium text-odl-text leading-tight">{bill.short_name}</div>
                      {bill.bill_number && (
                        <div className="text-odl-subtle font-mono text-[10px] mt-0.5">{bill.bill_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-odl-muted whitespace-nowrap">
                      {bill.region?.startsWith('US-') ? getStateCode(bill.region) : bill.jurisdiction}
                    </td>
                    <td className="px-4 py-3 text-odl-muted whitespace-nowrap">
                      {bill.primary_category ? (CATEGORY_LABELS[bill.primary_category] ?? bill.primary_category) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-odl-muted">
                      {getYear(bill)}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="flex flex-wrap gap-1">
                        {(bill.topics ?? []).slice(0, 3).map(t => (
                          <span key={t} className="bg-odl-surface-2 text-odl-muted px-1.5 py-0.5 rounded text-[10px]">{t}</span>
                        ))}
                        {(bill.topics ?? []).length > 3 && (
                          <span className="text-odl-subtle text-[10px]">+{(bill.topics ?? []).length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === bill.id && (
                    <tr key={`${bill.id}-exp`} className="border-b border-odl-border/60 bg-odl-accent-bg/20">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="text-xs text-odl-text leading-relaxed mb-2 max-w-3xl">
                          {bill.summary ?? bill.full_name}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-odl-subtle">
                          {bill.official_text_url && (
                            <a href={bill.official_text_url} target="_blank" rel="noreferrer" className="odl-link">
                              Official text →
                            </a>
                          )}
                          {bill.summary_url && (
                            <a href={bill.summary_url} target="_blank" rel="noreferrer" className="odl-link">
                              Summary →
                            </a>
                          )}
                          {bill.last_verified && (
                            <span>Last verified {bill.last_verified}</span>
                          )}
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
    </div>
  )
}
