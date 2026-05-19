import { useState, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import type { AILaw, FilterState, SortField, SortDir } from '../types'
import { regulations } from '../data/regulations'
import { FilterBar } from './FilterBar'
import { LawTable } from './LawTable'
import { LawDetail } from './LawDetail'

const EMPTY_FILTERS: FilterState = {
  search: '',
  country: '',
  state: '',
  category: '',
  status: '',
  legal_family: '',
  instrument_type: '',
  private_right_of_action: false,
  ai_specific: false,
  instrument_binding: false,
  effective_date_from: '',
  effective_date_to: '',
}

const fuse = new Fuse(regulations, {
  keys: [
    { name: 'short_name',       weight: 2 },
    { name: 'full_name',        weight: 1.5 },
    { name: 'jurisdiction',     weight: 1.5 },
    { name: 'bill_number',      weight: 1.5 },
    { name: 'summary',          weight: 1 },
    { name: 'topics',           weight: 1 },
    { name: 'key_obligations',  weight: 0.8 },
    { name: 'notable',          weight: 0.7 },
    { name: 'legal_citation',   weight: 0.5 },
  ],
  threshold: 0.35,
  includeScore: true,
})

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v)
  // Quote every cell — prevents injection and handles embedded commas/newlines
  return `"${s.replace(/"/g, '""')}"`
}

function exportCSV(laws: AILaw[]) {
  if (laws.length === 0) return
  const provKeys = Object.keys(laws[0].provisions).filter(k => k !== 'anti_discrimination_standard')
  const headers = [
    'id','short_name','jurisdiction','jurisdiction_type','region',
    'instrument_type','bill_number','enacted_date','effective_date','status',
    'primary_category','scope','legal_family','ai_specific','instrument_binding',
    'max_penalty','max_penalty_usd_approx',
    'private_right_of_action','preemption_status','official_text_url','last_verified','summary',
    ...provKeys,
  ]
  const rows = laws.map(l => [
    l.id, l.short_name, l.jurisdiction, l.jurisdiction_type, l.region,
    l.instrument_type, l.bill_number, l.enacted_date, l.effective_date, l.status,
    l.primary_category, l.scope, l.legal_family, l.ai_specific, l.instrument_binding,
    l.max_penalty, l.max_penalty_usd_approx,
    l.provisions?.private_right_of_action, l.preemption_status, l.official_text_url, l.last_verified,
    l.summary,
    ...provKeys.map(k => (l.provisions as unknown as Record<string, unknown>)?.[k]),
  ].map(csvCell))
  const csv = [headers.map(csvCell).join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'ai-regulations.csv'; a.click()
  URL.revokeObjectURL(url)
}

function exportJSON(laws: AILaw[]) {
  const blob = new Blob([JSON.stringify(laws, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'ai-regulations.json'; a.click()
  URL.revokeObjectURL(url)
}

export function SearchInterface() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [sortField, setSortField] = useState<SortField>('enacted_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<AILaw | null>(null)

  const handleSort = useCallback((field: SortField) => {
    setSortDir(prev => sortField === field ? (prev === 'asc' ? 'desc' : 'asc') : 'desc')
    setSortField(field)
  }, [sortField])

  const filtered = useMemo(() => {
    let results: AILaw[]
    if (filters.search.trim()) {
      results = fuse.search(filters.search.trim()).map(r => r.item)
    } else {
      results = [...regulations]
    }
    if (filters.country) results = results.filter(l =>
      l.country === filters.country ||
      (l.applies_in && l.applies_in.includes(filters.country))
    )
    if (filters.state) results = results.filter(l => l.jurisdiction === filters.state)
    if (filters.category) results = results.filter(l => l.categories.includes(filters.category as AILaw['primary_category']))
    if (filters.status) results = results.filter(l => l.status === filters.status)
    if (filters.legal_family) results = results.filter(l => l.legal_family === filters.legal_family)
    if (filters.instrument_type) results = results.filter(l => l.instrument_type === filters.instrument_type)
    if (filters.private_right_of_action) results = results.filter(l => l.provisions?.private_right_of_action)
    if (filters.ai_specific) results = results.filter(l => l.ai_specific)
    if (filters.instrument_binding) results = results.filter(l => l.instrument_binding)
    if (filters.effective_date_from) results = results.filter(l => l.effective_date && l.effective_date >= filters.effective_date_from)
    if (filters.effective_date_to) results = results.filter(l => l.effective_date && l.effective_date <= filters.effective_date_to)

    if (!filters.search.trim()) {
      results.sort((a, b) => {
        let av: string | number = a[sortField] ?? ''
        let bv: string | number = b[sortField] ?? ''
        if (sortField === 'max_penalty_usd_approx') { av = a.max_penalty_usd_approx ?? -1; bv = b.max_penalty_usd_approx ?? -1 }
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return results
  }, [filters, sortField, sortDir])

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Export */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-odl-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search laws by name, jurisdiction, topic, obligation…"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-white border border-odl-border text-odl-text rounded-md text-sm outline-none focus:border-odl-accent focus:ring-1 focus:ring-odl-accent/20 transition-colors placeholder:text-odl-subtle"
          />
        </div>
        <button onClick={() => exportCSV(filtered)} className="px-3 py-2 text-xs border border-odl-border text-odl-muted hover:text-odl-text hover:border-odl-border-strong rounded-md transition-colors bg-white whitespace-nowrap">
          Export CSV
        </button>
        <button onClick={() => exportJSON(filtered)} className="px-3 py-2 text-xs border border-odl-border text-odl-muted hover:text-odl-text hover:border-odl-border-strong rounded-md transition-colors bg-white whitespace-nowrap">
          Export JSON
        </button>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />

      {/* Count */}
      <div className="text-xs text-odl-muted">
        <span className="text-odl-text font-medium">{filtered.length}</span> of {regulations.length} laws
        {filters.search && <span className="ml-1">— results for "<span className="text-odl-text">{filters.search}</span>"</span>}
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <LawTable laws={filtered} sortField={sortField} sortDir={sortDir} onSort={handleSort} onSelect={setSelected} />
      </div>

      {selected && <LawDetail law={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
