import type { AILaw, SortField, SortDir } from '../types'
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../data/regulations'

interface Props {
  laws: AILaw[]
  sortField: SortField
  sortDir: SortDir
  onSort: (f: SortField) => void
  onSelect: (law: AILaw) => void
}

const COLUMNS: { key: SortField; label: string }[] = [
  { key: 'short_name',            label: 'Law' },
  { key: 'jurisdiction',          label: 'Jurisdiction' },
  { key: 'enacted_date',          label: 'Enacted' },
  { key: 'effective_date',        label: 'Effective' },
  { key: 'max_penalty_usd_approx',label: 'Max Penalty' },
]

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-odl-subtle ml-1 text-[10px]">↕</span>
  return <span className="text-odl-accent ml-1 text-[10px]">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function LawTable({ laws, sortField, sortDir, onSort, onSelect }: Props) {
  if (laws.length === 0) {
    return (
      <div className="text-center py-16 text-odl-muted text-sm">
        No laws match the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-odl-border">
            {COLUMNS.map(col => (
              <th
                key={col.key}
                className="text-left px-4 py-2.5 font-medium text-odl-muted text-xs cursor-pointer hover:text-odl-text select-none whitespace-nowrap"
                onClick={() => onSort(col.key)}
              >
                {col.label}
                <SortIcon active={sortField === col.key} dir={sortDir} />
              </th>
            ))}
            <th className="text-left px-4 py-2.5 font-medium text-odl-muted text-xs">Category</th>
            <th className="text-left px-4 py-2.5 font-medium text-odl-muted text-xs">Status</th>
            <th className="text-left px-4 py-2.5 font-medium text-odl-muted text-xs" title="Private Right of Action — whether individuals can sue directly under this law">PRA</th>
          </tr>
        </thead>
        <tbody>
          {laws.map(law => (
            <tr
              key={law.id}
              onClick={() => onSelect(law)}
              className="border-b border-odl-border/60 hover:bg-odl-accent-bg/40 cursor-pointer transition-colors group"
            >
              <td className="px-4 py-3 max-w-xs">
                <div className="font-medium text-odl-text leading-tight group-hover:text-odl-accent transition-colors flex items-center gap-1.5">
                  {law.short_name}
                  {law.last_verified && new Date(law.last_verified).getTime() < Date.now() - 180 * 24 * 60 * 60 * 1000 && (
                    <span className="text-amber-500 text-[10px] font-mono flex-shrink-0" title={`Last verified ${law.last_verified} — may be stale`}>⚠</span>
                  )}
                </div>
                {law.bill_number && (
                  <div className="text-xs text-odl-muted mt-0.5">{law.bill_number}</div>
                )}
              </td>
              <td className="px-4 py-3 text-xs whitespace-nowrap">
                <div className="text-odl-text">{law.country}</div>
                {law.jurisdiction !== law.country && (
                  <div className="text-odl-subtle text-[11px] mt-0.5">{law.jurisdiction}</div>
                )}
              </td>
              <td className="px-4 py-3 text-odl-muted font-mono text-xs whitespace-nowrap">
                {law.enacted_date ? law.enacted_date.slice(0, 7) : '—'}
              </td>
              <td className="px-4 py-3 text-odl-muted font-mono text-xs whitespace-nowrap">
                {law.effective_date ? law.effective_date.slice(0, 7) : '—'}
              </td>
              <td className="px-4 py-3 text-odl-subtle text-xs whitespace-nowrap">
                {law.max_penalty_usd_approx
                  ? `$${(law.max_penalty_usd_approx / 1000).toFixed(0)}K`
                  : law.max_penalty
                    ? <span className="text-odl-subtle italic">varies</span>
                    : <span className="text-odl-subtle">—</span>}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-odl-subtle">
                  {CATEGORY_LABELS[law.primary_category] ?? law.primary_category}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`badge ${STATUS_COLORS[law.status] ?? ''}`}>
                  {STATUS_LABELS[law.status] ?? law.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {law.provisions.private_right_of_action
                  ? <span className="text-odl-green font-semibold text-sm">✓</span>
                  : <span className="text-odl-subtle">–</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
