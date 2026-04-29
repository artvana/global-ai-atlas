import { useState, useMemo } from 'react'
import enforcementData from '../../data/enforcement.json'

interface EnforcementAction {
  id: string
  law_id: string
  law_short_name: string
  date: string
  enforcement_body: string
  respondent: string
  violation_type: string
  amount_usd: number | null
  outcome: string
  summary: string
  source_url: string
}

const actions = enforcementData as EnforcementAction[]

type SortKey = 'date' | 'amount_usd' | 'respondent'

function formatUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`
  return `$${(n / 1_000).toFixed(0)}K`
}

export function EnforcementView() {
  const [sortKey, setSortKey] = useState<SortKey>('amount_usd')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterLaw, setFilterLaw] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const lawNames = useMemo(() => {
    const seen = new Set<string>()
    return actions.filter(a => { if (seen.has(a.law_short_name)) return false; seen.add(a.law_short_name); return true })
      .map(a => a.law_short_name)
      .sort()
  }, [])

  const filtered = useMemo(() => {
    let list = filterLaw ? actions.filter(a => a.law_short_name === filterLaw) : [...actions]
    list.sort((a, b) => {
      let av: string | number = sortKey === 'amount_usd' ? (a.amount_usd ?? -1) : (sortKey === 'date' ? a.date : a.respondent)
      let bv: string | number = sortKey === 'amount_usd' ? (b.amount_usd ?? -1) : (sortKey === 'date' ? b.date : b.respondent)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [filterLaw, sortKey, sortDir])

  const totalFines = actions.reduce((s, a) => s + (a.amount_usd ?? 0), 0)
  const largestFine = Math.max(...actions.map(a => a.amount_usd ?? 0))
  const withMonetary = actions.filter(a => a.amount_usd != null).length

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-odl-subtle ml-1 text-[10px]">↕</span>
    return <span className="text-odl-accent ml-1 text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">AI Enforcement Actions</h2>
        <p className="text-xs text-odl-muted">Key enforcement cases and settlements under AI-related laws in the corpus.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Actions', value: actions.length },
          { label: 'Monetary Actions', value: withMonetary },
          { label: 'Total Value', value: formatUSD(totalFines) },
          { label: 'Largest Fine/Settlement', value: formatUSD(largestFine) },
        ].map(s => (
          <div key={s.label} className="panel p-3 text-center">
            <div className="text-lg font-bold text-odl-text font-mono">{s.value}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filterLaw}
          onChange={e => setFilterLaw(e.target.value)}
          className="bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent"
        >
          <option value="">All Laws</option>
          {lawNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="text-xs text-odl-muted">{filtered.length} action{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-odl-border">
                <th
                  className="text-left px-4 py-2.5 text-odl-muted font-medium cursor-pointer hover:text-odl-text whitespace-nowrap select-none"
                  onClick={() => handleSort('date')}
                >Date <SortIcon col="date" /></th>
                <th
                  className="text-left px-4 py-2.5 text-odl-muted font-medium cursor-pointer hover:text-odl-text whitespace-nowrap select-none"
                  onClick={() => handleSort('respondent')}
                >Respondent <SortIcon col="respondent" /></th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Law</th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Enforcement Body</th>
                <th
                  className="text-left px-4 py-2.5 text-odl-muted font-medium cursor-pointer hover:text-odl-text whitespace-nowrap select-none"
                  onClick={() => handleSort('amount_usd')}
                >Amount <SortIcon col="amount_usd" /></th>
                <th className="text-left px-4 py-2.5 text-odl-muted font-medium whitespace-nowrap">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(action => (
                <tr key={action.id} className="border-b border-odl-border/60 hover:bg-odl-accent-bg/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-odl-muted whitespace-nowrap">{action.date.slice(0, 7)}</td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <div className="font-medium text-odl-text leading-tight">{action.respondent}</div>
                    <div className="text-odl-subtle mt-0.5 leading-snug">{action.violation_type}</div>
                  </td>
                  <td className="px-4 py-3 text-odl-muted whitespace-nowrap">{action.law_short_name}</td>
                  <td className="px-4 py-3 text-odl-muted max-w-[160px]">{action.enforcement_body}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">
                    {action.amount_usd != null
                      ? <span className="text-odl-accent">{formatUSD(action.amount_usd)}</span>
                      : <span className="text-odl-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="text-odl-text">{action.outcome}</div>
                    <a href={action.source_url} target="_blank" rel="noreferrer" className="odl-link text-[10px] mt-0.5 block">
                      Source →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expanded summaries */}
        <div className="border-t border-odl-border mt-2 px-4 py-4 space-y-4">
          <h4 className="text-xs font-semibold text-odl-subtle uppercase tracking-wider">Case Summaries</h4>
          {filtered.map(action => (
            <div key={`sum-${action.id}`} className="border-b border-odl-border/40 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-odl-text text-xs">{action.respondent}</span>
                <span className="text-odl-subtle text-[10px]">·</span>
                <span className="text-odl-muted text-[10px]">{action.law_short_name}</span>
                <span className="text-odl-subtle text-[10px]">·</span>
                <span className="text-odl-muted font-mono text-[10px]">{action.date.slice(0, 7)}</span>
              </div>
              <p className="text-xs text-odl-muted leading-relaxed">{action.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
