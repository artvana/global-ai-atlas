import { useState } from 'react'
import changelogData from '../../data/changelog.json'

interface AddedLaw {
  id: string
  name: string
  jurisdiction: string
  status: string
}

interface PromotedLaw {
  id: string
  name: string
  from: string
  to: string
}

interface ChangelogEntry {
  date: string
  trigger: string
  added: AddedLaw[]
  promoted: PromotedLaw[]
  stage_updates: number
  enforcement_added: number
  rules_added: number
  total_instruments: number
  note?: string
}

const entries = changelogData as ChangelogEntry[]

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function formatMonth(dateStr: string) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

const STATUS_LABEL: Record<string, string> = {
  in_force: 'In force',
  enacted_not_yet_effective: 'Enacted',
  proposed: 'Proposed',
  failed: 'Failed',
  vetoed: 'Vetoed',
  superseded: 'Superseded',
}

const STATUS_CLASS: Record<string, string> = {
  in_force: 'bg-green-50 text-green-700 border-green-200',
  enacted_not_yet_effective: 'bg-blue-50 text-blue-700 border-blue-200',
  proposed: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
  vetoed: 'bg-red-50 text-red-600 border-red-200',
}

function SummaryLine({ entry }: { entry: ChangelogEntry }) {
  const parts: string[] = []
  if (entry.added.length > 0) parts.push(`${entry.added.length} instrument${entry.added.length !== 1 ? 's' : ''} added`)
  if (entry.promoted.length > 0) parts.push(`${entry.promoted.length} promoted to in force`)
  if (entry.stage_updates > 0) parts.push(`${entry.stage_updates} stage update${entry.stage_updates !== 1 ? 's' : ''}`)
  if (entry.enforcement_added > 0) parts.push(`${entry.enforcement_added} enforcement action${entry.enforcement_added !== 1 ? 's' : ''}`)
  if (entry.rules_added > 0) parts.push(`${entry.rules_added} rules extracted`)
  return (
    <span className="text-odl-muted">
      {parts.length > 0 ? parts.join(' · ') : 'No data changes this run'}
    </span>
  )
}

function EntryDetail({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="mt-4 space-y-4 pt-4 border-t border-odl-border">
      {entry.note && (
        <p className="text-xs text-odl-muted italic">{entry.note}</p>
      )}

      {entry.added.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wider mb-2">
            New instruments
          </div>
          <div className="space-y-1.5">
            {entry.added.map(law => (
              <div key={law.id} className="flex items-center gap-3 text-xs">
                <span className="text-odl-subtle w-32 shrink-0 truncate">{law.jurisdiction}</span>
                <span className="text-odl-text flex-1 truncate">{law.name}</span>
                <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-medium ${STATUS_CLASS[law.status] ?? 'bg-odl-surface text-odl-muted border-odl-border'}`}>
                  {STATUS_LABEL[law.status] ?? law.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.promoted.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wider mb-2">
            Promoted to in force
          </div>
          <div className="space-y-1.5">
            {entry.promoted.map(law => (
              <div key={law.id} className="flex items-center gap-3 text-xs">
                <span className="text-odl-text flex-1 truncate">{law.name}</span>
                <span className="shrink-0 text-odl-subtle text-[10px]">
                  {STATUS_LABEL[law.from] ?? law.from} → In force
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function WhatsNew() {
  // First entry is expanded by default
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]))

  function toggle(i: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  if (entries.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-odl-subtle">
        No updates yet — check back after the next weekly run.
      </div>
    )
  }

  // Group entries by calendar month
  const groups: { month: string; items: Array<{ entry: ChangelogEntry; index: number }> }[] = []
  for (let i = 0; i < entries.length; i++) {
    const month = formatMonth(entries[i].date)
    const last = groups[groups.length - 1]
    if (last && last.month === month) {
      last.items.push({ entry: entries[i], index: i })
    } else {
      groups.push({ month, items: [{ entry: entries[i], index: i }] })
    }
  }

  const latest = entries[0]

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-base font-semibold text-odl-text">What's New</h1>
          <p className="text-xs text-odl-muted mt-1">
            Database updates from the GAIA curator agent, published every Monday.
          </p>
        </div>
        <div className="text-right text-xs text-odl-subtle">
          <div className="font-medium text-odl-text">{latest.total_instruments.toLocaleString()}</div>
          <div>instruments in database</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {groups.map(group => (
          <div key={group.month}>
            {/* Month divider */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium text-odl-muted shrink-0">{group.month}</span>
              <div className="flex-1 border-t border-odl-border" />
            </div>

            {/* Entries in this month */}
            <div className="space-y-2">
              {group.items.map(({ entry, index }) => {
                const hasDetail = entry.added.length > 0 || entry.promoted.length > 0 || !!entry.note
                const isExpanded = expanded.has(index)

                return (
                  <div key={index} className="rounded border border-odl-border bg-odl-bg overflow-hidden">
                    <div
                      className={`px-4 py-3 flex items-start justify-between gap-4 ${hasDetail ? 'cursor-pointer hover:bg-odl-surface transition-colors' : ''}`}
                      onClick={hasDetail ? () => toggle(index) : undefined}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-odl-text">{formatDate(entry.date)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-odl-border text-odl-subtle">
                            {entry.trigger}
                          </span>
                        </div>
                        <div className="text-xs">
                          <SummaryLine entry={entry} />
                        </div>
                      </div>
                      {hasDetail && (
                        <span className="text-odl-subtle text-[10px] shrink-0 mt-1 select-none">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                    {isExpanded && hasDetail && (
                      <div className="px-4 pb-4">
                        <EntryDetail entry={entry} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-odl-subtle text-center">
        Updates are automated — each entry is generated by the weekly curator run and reviewed before publishing.
      </p>
    </div>
  )
}
