import { useMemo } from 'react'
import type { FilterState } from '../types'
import { CATEGORY_LABELS, STATUS_LABELS, LEGAL_FAMILY_LABELS, INSTRUMENT_TYPE_LABELS } from '../data/regulations'
import { regulations } from '../data/regulations'

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
  onReset: () => void
}

const selectCls = 'bg-white border border-odl-border text-odl-text rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-odl-accent focus:ring-1 focus:ring-odl-accent/20 transition-colors'

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-1.5 cursor-pointer select-none group bg-transparent border-0 p-0"
    >
      <div className={`relative w-7 h-4 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-odl-accent' : 'bg-odl-border'}`}>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-3' : ''}`} />
      </div>
      <span className="text-xs text-odl-muted group-hover:text-odl-text transition-colors">{label}</span>
    </button>
  )
}

export function FilterBar({ filters, onChange, onReset }: Props) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) => onChange({ ...filters, [key]: val })

  const { countries, subJurisdictions } = useMemo(() => {
    const countrySet = new Set<string>()
    const subMap = new Map<string, Set<string>>()

    for (const l of regulations) {
      countrySet.add(l.country)
      // Sub-jurisdictions: only when jurisdiction differs from country
      if (l.jurisdiction !== l.country) {
        if (!subMap.has(l.country)) subMap.set(l.country, new Set())
        subMap.get(l.country)!.add(l.jurisdiction)
      }
    }

    const sorted = [...countrySet].sort()
    // Pin Global / Regional to top
    const countries = sorted.includes('Global / Regional')
      ? ['Global / Regional', ...sorted.filter(c => c !== 'Global / Regional')]
      : sorted

    return {
      countries,
      subJurisdictions: Object.fromEntries(
        [...subMap.entries()].map(([c, s]) => [c, [...s].sort()])
      ),
    }
  }, [])

  const subOptions = filters.country ? (subJurisdictions[filters.country] ?? []) : []

  const subLabel = filters.country === 'Global / Regional'
    ? 'All Bodies'
    : filters.country === 'United States'
      ? 'All States / Agencies'
      : 'All Sub-Jurisdictions'

  const hasActive =
    filters.country !== '' || filters.state !== '' || filters.category !== '' ||
    filters.status !== '' || filters.legal_family !== '' || filters.instrument_type !== '' ||
    filters.private_right_of_action || filters.ai_specific || filters.instrument_binding ||
    filters.effective_date_from !== '' || filters.effective_date_to !== ''

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.country}
        onChange={e => onChange({ ...filters, country: e.target.value, state: '' })}
        className={selectCls}
      >
        <option value="">All Countries</option>
        {countries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {subOptions.length > 0 && (
        <select value={filters.state} onChange={e => set('state', e.target.value)} className={selectCls}>
          <option value="">{subLabel}</option>
          {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      <select value={filters.category} onChange={e => set('category', e.target.value as FilterState['category'])} className={selectCls}>
        <option value="">All Categories</option>
        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <select value={filters.status} onChange={e => set('status', e.target.value as FilterState['status'])} className={selectCls}>
        <option value="">All Statuses</option>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <select value={filters.legal_family} onChange={e => set('legal_family', e.target.value as FilterState['legal_family'])} className={selectCls}>
        <option value="">All Legislative Genealogies</option>
        {Object.entries(LEGAL_FAMILY_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <select value={filters.instrument_type} onChange={e => set('instrument_type', e.target.value as FilterState['instrument_type'])} className={selectCls}>
        <option value="">All Instrument Types</option>
        {Object.entries(INSTRUMENT_TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <div className="flex items-center gap-3 px-2 py-1.5 bg-white border border-odl-border rounded-md">
        <Toggle label="AI-Specific" checked={filters.ai_specific} onChange={v => set('ai_specific', v)} />
        <div className="w-px h-3 bg-odl-border" />
        <Toggle label="Private Right" checked={filters.private_right_of_action} onChange={v => set('private_right_of_action', v)} />
        <div className="w-px h-3 bg-odl-border" />
        <Toggle label="Binding" checked={filters.instrument_binding} onChange={v => set('instrument_binding', v)} />
      </div>

      {hasActive && (
        <button
          onClick={onReset}
          className="text-xs text-odl-muted hover:text-odl-red border border-odl-border hover:border-odl-red/40 rounded-md px-2.5 py-1.5 transition-colors bg-white"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
