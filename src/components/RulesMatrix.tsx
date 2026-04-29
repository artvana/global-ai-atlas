import { useState, useMemo, useRef } from 'react'
import type { Rule, RuleCategory, RuleRelationship } from '../types'
import { RULE_CATEGORY_LABELS } from '../types'
import { rules as allRules } from '../data/rules'
import { regulations } from '../data/regulations'

// ── relationship config ───────────────────────────────────────────────────────

const REL_CONFIG: Record<RuleRelationship | 'absent', { label: string; color: string; dot: string }> = {
  origin:  { label: 'First instance',  color: '#1870D5', dot: 'bg-[#1870D5]' },
  agrees:  { label: 'Agrees',          color: '#16A34A', dot: 'bg-green-600'  },
  similar: { label: 'Similar',         color: '#D97706', dot: 'bg-amber-500'  },
  opposed: { label: 'Opposed',         color: '#DC2626', dot: 'bg-red-600'    },
  absent:  { label: 'Silent / absent', color: '#E4E4E7', dot: 'bg-zinc-200'   },
}

// Default law columns shown on first load (15 most analytically significant)
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

// ── tiny components ───────────────────────────────────────────────────────────

function RelDot({ rel, size = 12 }: { rel: RuleRelationship | 'absent'; size?: number }) {
  const cfg = REL_CONFIG[rel]
  return (
    <div
      className={`rounded-full flex-shrink-0 ${rel === 'absent' ? 'border border-zinc-200' : ''}`}
      style={{ width: size, height: size, background: rel === 'absent' ? 'transparent' : cfg.color }}
      title={cfg.label}
    />
  )
}

// ── tooltip / popover ─────────────────────────────────────────────────────────

interface CellDetail {
  rule: Rule
  lawId: string
  lawName: string
  x: number
  y: number
}

function CellPopover({ d, onClose }: { d: CellDetail; onClose: () => void }) {
  const inst = d.rule.instances.find(i => i.law_id === d.lawId)
  const rel: RuleRelationship | 'absent' = inst ? inst.relationship : 'absent'
  const cfg = REL_CONFIG[rel]

  return (
    <div
      className="fixed z-50 bg-white border border-odl-border rounded shadow-lg p-4 text-xs max-w-xs pointer-events-auto"
      style={{ left: Math.min(d.x + 12, window.innerWidth - 320), top: d.y + 12 }}
    >
      <button
        className="absolute top-2 right-2 text-odl-subtle hover:text-odl-text text-base leading-none"
        onClick={onClose}
      >×</button>
      <div className="flex items-center gap-2 mb-2">
        <RelDot rel={rel} size={10} />
        <span className="font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      <div className="font-semibold text-odl-text mb-1">{d.rule.rule_text.slice(0, 120)}…</div>
      {inst ? (
        <>
          <div className="text-odl-muted mt-2"><span className="font-medium">Law:</span> {d.lawName}</div>
          <div className="text-odl-muted"><span className="font-medium">Citation:</span> {inst.citation}</div>
          <div className="text-odl-subtle mt-2 leading-relaxed">{inst.notes}</div>
        </>
      ) : (
        <div className="text-odl-subtle mt-2">This law does not address this rule.</div>
      )}
      <div className="text-odl-subtle mt-2 pt-2 border-t border-odl-border">
        First introduced in:{' '}
        <span className="font-medium text-odl-muted">{d.rule.first_instance.law_name}</span>
        {' '}({d.rule.first_instance.date.slice(0, 4)})
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export function RulesMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all')
  const [ruleSearch, setRuleSearch] = useState('')
  const [selectedLawIds, setSelectedLawIds] = useState<Set<string>>(new Set(DEFAULT_LAW_IDS))
  const [showLawPicker, setShowLawPicker] = useState(false)
  const [lawSearch, setLawSearch] = useState('')
  const [popover, setPopover] = useState<CellDetail | null>(null)
  const [expandedRule, setExpandedRule] = useState<string | null>(null)
  const matrixRef = useRef<HTMLDivElement>(null)

  // Build law lookup map
  const lawMap = useMemo(() => {
    const m = new Map<string, { short_name: string; enacted_date: string }>()
    regulations.forEach(l => m.set(l.id, { short_name: l.short_name, enacted_date: l.enacted_date }))
    return m
  }, [])

  // Filtered + sorted laws for column display
  const displayLaws = useMemo(() => {
    return [...selectedLawIds]
      .map(id => ({ id, ...(lawMap.get(id) ?? { short_name: id, enacted_date: '0000' }) }))
      .sort((a, b) => a.enacted_date.localeCompare(b.enacted_date))
  }, [selectedLawIds, lawMap])

  // Filtered rules
  const displayRules = useMemo(() => {
    let r = allRules
    if (selectedCategory !== 'all') r = r.filter(rl => rl.category === selectedCategory)
    if (ruleSearch.trim()) {
      const q = ruleSearch.trim().toLowerCase()
      r = r.filter(rl =>
        rl.rule_text.toLowerCase().includes(q) ||
        rl.rule_text_technical.toLowerCase().includes(q) ||
        rl.tags.some(t => t.includes(q))
      )
    }
    // Group by category, sorted by first_instance date within each group
    return r.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      return a.first_instance.date.localeCompare(b.first_instance.date)
    })
  }, [selectedCategory, ruleSearch])

  // Categories present in the current set of rules
  const categories = useMemo(() => {
    const cats = new Set(allRules.map(r => r.category as RuleCategory))
    return ['all' as const, ...([...cats].sort())]
  }, [])

  // Law picker: all laws, optionally filtered
  const allLawsSorted = useMemo(() => {
    return [...regulations]
      .sort((a, b) => a.enacted_date.localeCompare(b.enacted_date))
      .filter(l => {
        if (!lawSearch.trim()) return true
        const q = lawSearch.toLowerCase()
        return l.short_name.toLowerCase().includes(q) || l.jurisdiction.toLowerCase().includes(q)
      })
  }, [lawSearch])

  function toggleLaw(id: string) {
    setSelectedLawIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCellClick(rule: Rule, lawId: string, e: React.MouseEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopover({ rule, lawId, lawName: lawMap.get(lawId)?.short_name ?? lawId, x: r.left, y: r.bottom })
  }

  // Group rules by category for section headers
  const grouped = useMemo(() => {
    const map = new Map<string, Rule[]>()
    for (const rule of displayRules) {
      const list = map.get(rule.category) ?? []
      list.push(rule)
      map.set(rule.category, list)
    }
    return map
  }, [displayRules])

  return (
    <div className="flex flex-col gap-4 max-w-screen-2xl" onClick={() => popover && setPopover(null)}>

      {/* ── Header ── */}
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">Rules Matrix</h2>
        <p className="text-xs text-odl-muted">
          Each row is a distinct legal rule, anchored to its first instance. Columns are laws.
          Cells show whether each law agrees, diverges, opposes, or is silent on that rule.
          {' '}<span className="text-odl-subtle">{allRules.length} rules · {regulations.length} laws indexed</span>
        </p>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 text-xs text-odl-muted">
        {(Object.entries(REL_CONFIG) as [RuleRelationship | 'absent', typeof REL_CONFIG[keyof typeof REL_CONFIG]][]).map(([rel, cfg]) => (
          <span key={rel} className="flex items-center gap-1.5">
            <RelDot rel={rel} size={10} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* ── Controls row ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent w-56"
          placeholder="Search rules..."
          value={ruleSearch}
          onChange={e => setRuleSearch(e.target.value)}
        />
        <select
          className="border border-odl-border rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-odl-accent"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value as RuleCategory | 'all')}
        >
          <option value="all">All categories</option>
          {categories.filter(c => c !== 'all').map(c => (
            <option key={c} value={c}>{RULE_CATEGORY_LABELS[c as RuleCategory]}</option>
          ))}
        </select>
        <button
          className="border border-odl-border rounded px-3 py-1.5 text-xs text-odl-muted hover:text-odl-text hover:bg-odl-surface"
          onClick={e => { e.stopPropagation(); setShowLawPicker(v => !v) }}
        >
          Laws shown ({selectedLawIds.size})
        </button>
        <span className="text-xs text-odl-subtle">{displayRules.length} rules shown</span>
      </div>

      {/* ── Law picker panel ── */}
      {showLawPicker && (
        <div className="panel p-4 max-h-72 overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <input
              className="border border-odl-border rounded px-3 py-1.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-odl-accent"
              placeholder="Search laws..."
              value={lawSearch}
              onChange={e => setLawSearch(e.target.value)}
            />
            <button className="text-xs text-odl-accent" onClick={() => setSelectedLawIds(new Set(DEFAULT_LAW_IDS))}>
              Reset to default
            </button>
            <button className="text-xs text-odl-subtle" onClick={() => setSelectedLawIds(new Set(regulations.map(l => l.id)))}>
              Select all
            </button>
            <button className="text-xs text-odl-subtle" onClick={() => setSelectedLawIds(new Set())}>
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {allLawsSorted.map(l => (
              <label key={l.id} className="flex items-center gap-2 text-xs text-odl-muted cursor-pointer hover:text-odl-text py-0.5">
                <input
                  type="checkbox"
                  checked={selectedLawIds.has(l.id)}
                  onChange={() => toggleLaw(l.id)}
                  className="accent-odl-accent"
                />
                <span className="truncate" title={l.short_name}>{l.short_name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Matrix ── */}
      <div className="panel overflow-hidden">
        <div ref={matrixRef} className="overflow-auto max-h-[calc(100vh-280px)]">
          <table className="border-collapse text-xs min-w-max">

            {/* Column headers */}
            <thead className="sticky top-0 z-20 bg-white">
              <tr>
                {/* Rule column header */}
                <th className="sticky left-0 z-30 bg-white border-b border-r border-odl-border px-3 py-2 text-left min-w-[320px] max-w-[320px]">
                  <div className="text-xs font-semibold text-odl-subtle uppercase tracking-wider">Rule</div>
                </th>
                <th className="sticky left-[320px] z-30 bg-white border-b border-r border-odl-border px-2 py-2 text-center min-w-[80px] text-odl-subtle">
                  First instance
                </th>
                {displayLaws.map(law => (
                  <th
                    key={law.id}
                    className="border-b border-r border-odl-border/50 px-1 py-2 text-center min-w-[44px] max-w-[44px]"
                  >
                    <div
                      className="text-[9px] font-medium text-odl-muted leading-tight"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 88, overflow: 'hidden' }}
                      title={law.short_name}
                    >
                      {law.short_name.length > 24 ? law.short_name.slice(0, 22) + '…' : law.short_name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[...grouped.entries()].map(([cat, catRules]) => (
                <>
                  {/* Category subheader */}
                  <tr key={`cat-${cat}`} className="bg-odl-surface">
                    <td
                      colSpan={2 + displayLaws.length}
                      className="sticky left-0 px-3 py-1.5 text-[10px] font-semibold text-odl-subtle uppercase tracking-wider border-b border-odl-border"
                    >
                      {RULE_CATEGORY_LABELS[cat as RuleCategory]} ({catRules.length})
                    </td>
                  </tr>

                  {/* Rule rows */}
                  {catRules.map(rule => {
                    const isExpanded = expandedRule === rule.rule_id
                    const instMap = new Map(rule.instances.map(i => [i.law_id, i]))
                    return (
                      <tr key={rule.rule_id} className="border-b border-odl-border/40 hover:bg-blue-50/30 group">

                        {/* Rule text — sticky left */}
                        <td
                          className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/30 border-r border-odl-border px-3 py-2 align-top min-w-[320px] max-w-[320px] cursor-pointer"
                          onClick={() => setExpandedRule(isExpanded ? null : rule.rule_id)}
                        >
                          <p className={`text-odl-text leading-snug ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {rule.rule_text}
                          </p>
                          {!isExpanded && (
                            <span className="text-[10px] text-odl-accent">click to expand</span>
                          )}
                          {isExpanded && (
                            <p className="text-odl-subtle mt-1 leading-snug text-[10px]">
                              {rule.rule_text_technical}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rule.tags.slice(0, 4).map(t => (
                              <span key={t} className="bg-odl-surface border border-odl-border/60 rounded-full px-1.5 py-px text-[9px] text-odl-subtle">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* First instance — sticky second column */}
                        <td className="sticky left-[320px] z-10 bg-white group-hover:bg-blue-50/30 border-r border-odl-border px-2 py-2 align-middle text-center min-w-[80px] max-w-[80px]">
                          <div className="text-[9px] text-odl-muted leading-tight" title={rule.first_instance.law_name}>
                            {rule.first_instance.date.slice(0, 4)}
                          </div>
                          <div className="text-[9px] text-odl-subtle leading-tight truncate" title={rule.first_instance.law_name}>
                            {rule.first_instance.law_name.split(',')[0].slice(0, 18)}
                          </div>
                        </td>

                        {/* Relationship cells */}
                        {displayLaws.map(law => {
                          const inst = instMap.get(law.id)
                          const rel: RuleRelationship | 'absent' = inst ? inst.relationship : 'absent'
                          return (
                            <td
                              key={law.id}
                              className="border-r border-odl-border/30 px-0 py-0 text-center align-middle min-w-[44px] cursor-pointer hover:opacity-80"
                              onClick={e => { e.stopPropagation(); handleCellClick(rule, law.id, e) }}
                            >
                              <div className="flex items-center justify-center h-full py-2">
                                {rel === 'absent' ? (
                                  <div className="w-2.5 h-2.5 rounded-full border border-zinc-200" />
                                ) : (
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ background: REL_CONFIG[rel].color }}
                                  />
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </>
              ))}

              {displayRules.length === 0 && (
                <tr>
                  <td colSpan={2 + displayLaws.length} className="px-4 py-8 text-center text-xs text-odl-subtle">
                    No rules match the current filters.
                    {allRules.length === 0 && (
                      <span> Run <code className="font-mono bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">npm run extract-rules</code> to populate the database.</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cell popover ── */}
      {popover && (
        <CellPopover d={popover} onClose={() => setPopover(null)} />
      )}

      {/* ── Footer note ── */}
      <p className="text-[10px] text-odl-subtle leading-relaxed">
        Seed data covers 20 canonical rules from the 15 most significant laws.
        Run <code className="font-mono bg-odl-surface border border-odl-border rounded px-1 py-px">npm run extract-rules</code> to
        process all {regulations.length} laws and expand this matrix to hundreds of rules automatically.
        The extraction script processes laws chronologically and appends new rules as rows.
      </p>

    </div>
  )
}
