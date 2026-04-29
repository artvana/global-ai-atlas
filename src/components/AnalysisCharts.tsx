import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { AILaw } from '../types'
import { CATEGORY_LABELS, LEGAL_FAMILY_LABELS } from '../data/regulations'

interface Props { laws: AILaw[] }

const PROVISION_LABELS: Record<string, string> = {
  ai_interaction_disclosure:    'AI Disclosure',
  training_data_disclosure:     'Training Data Disclosure',
  content_labelling:            'Content Labelling',
  risk_classification_system:   'Risk Classification',
  impact_assessment_required:   'Impact Assessment',
  anti_discrimination:          'Anti-Discrimination',
  human_review_right:           'Human Review',
  opt_out_right:                'Opt-Out',
  biometric_protection:         'Biometric Protection',
  voice_likeness_protection:    'Voice/Likeness',
  data_rights_re_training:      'Data Rights (Training)',
  private_right_of_action:      'Private Right of Action',
  safe_harbor:                  'Safe Harbor',
  prohibited_categories:        'Prohibited Categories',
  agentic_ai_addressed:         'Agentic AI',
  algorithmic_pricing_addressed:'Algorithmic Pricing',
  training_data_compensation:   'Training Compensation',
}

const BLUE_SCALE  = ['#1870D5', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']
const GREEN_SCALE = ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0']

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-odl-border rounded-card p-4">
      <div className="text-2xl font-bold text-odl-accent">{value}</div>
      <div className="text-sm text-odl-text mt-0.5">{label}</div>
      {sub && <div className="text-xs text-odl-muted mt-0.5">{sub}</div>}
    </div>
  )
}

const TT = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-odl-border rounded shadow-sm px-3 py-2 text-xs">
      <p className="text-odl-text font-medium">{label}</p>
      <p className="text-odl-accent">{payload[0].value}{typeof payload[0].value === 'number' && payload[0].value <= 100 ? '%' : ''}</p>
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold text-odl-subtle uppercase tracking-wider mb-3">{children}</h2>
}

function ChartWrap({ children, height = 280 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="bg-white border border-odl-border rounded-card p-4" style={{ height }}>
      {children}
    </div>
  )
}

export function AnalysisCharts({ laws }: Props) {
  const activeLaws = useMemo(() => laws.filter(l => l.status !== 'superseded'), [laws])
  const n = activeLaws.length

  const provisionStats = useMemo(() =>
    Object.keys(PROVISION_LABELS).map(key => {
      const count = activeLaws.filter(l => (l.provisions as unknown as Record<string, unknown>)[key] === true).length
      return { key, label: PROVISION_LABELS[key], count, pct: n > 0 ? Math.round((count / n) * 100) : 0 }
    }).sort((a, b) => b.pct - a.pct),
  [activeLaws, n])

  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    activeLaws.forEach(l => { counts[l.primary_category] = (counts[l.primary_category] ?? 0) + 1 })
    return Object.entries(counts).map(([k, v]) => ({ label: CATEGORY_LABELS[k] ?? k, count: v })).sort((a, b) => b.count - a.count)
  }, [activeLaws])

  const byFamily = useMemo(() => {
    const counts: Record<string, number> = {}
    activeLaws.forEach(l => { counts[l.legal_family] = (counts[l.legal_family] ?? 0) + 1 })
    return Object.entries(counts).map(([k, v]) => ({ label: LEGAL_FAMILY_LABELS[k] ?? k, count: v })).sort((a, b) => b.count - a.count)
  }, [activeLaws])

  const byYear = useMemo(() => {
    const counts: Record<string, number> = {}
    activeLaws.forEach(l => { const yr = l.enacted_date?.slice(0, 4); if (yr) counts[yr] = (counts[yr] ?? 0) + 1 })
    return Object.entries(counts).sort().map(([k, v]) => ({ label: k, count: v }))
  }, [activeLaws])

  const byJurisdictionType = useMemo(() => {
    const counts: Record<string, number> = {}
    activeLaws.forEach(l => { counts[l.jurisdiction_type] = (counts[l.jurisdiction_type] ?? 0) + 1 })
    return counts
  }, [activeLaws])

  const aiSpecificCount = activeLaws.filter(l => l.ai_specific).length
  const bindingCount = activeLaws.filter(l => l.instrument_binding).length
  const praLaws = activeLaws.filter(l => l.provisions.private_right_of_action)
  const highPenalty = [...activeLaws]
    .filter(l => l.max_penalty_usd_approx != null)
    .sort((a, b) => (b.max_penalty_usd_approx ?? 0) - (a.max_penalty_usd_approx ?? 0))
    .slice(0, 6)

  const convergenceHigh = provisionStats.filter(p => p.pct >= 70)
  const convergenceMed  = provisionStats.filter(p => p.pct >= 30 && p.pct < 70)
  const convergenceLow  = provisionStats.filter(p => p.pct > 0 && p.pct < 30)
  const absent          = provisionStats.filter(p => p.pct === 0)

  const axisStyle = { fill: '#71717A', fontSize: 11 }

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div>
        <SectionHead>Corpus Overview</SectionHead>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Active Laws" value={n} sub="excl. superseded" />
          <StatCard label="Private Right of Action" value={`${Math.round((praLaws.length / n) * 100)}%`} sub={`${praLaws.length} of ${n} laws`} />
          <StatCard label="In Force" value={activeLaws.filter(l => l.status === 'in_force').length} sub={`${activeLaws.filter(l => l.status !== 'in_force').length} not yet effective`} />
          <StatCard
            label="By Jurisdiction"
            value={`${byJurisdictionType.supranational ?? 0} supranational`}
            sub={`${byJurisdictionType.national ?? 0} national · ${byJurisdictionType.subnational ?? 0} subnational · ${byJurisdictionType.agency ?? 0} agency`}
          />
        </div>
      </div>

      {/* Provision Prevalence */}
      <div>
        <SectionHead>Provision Prevalence — % of active laws</SectionHead>
        <ChartWrap height={360}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provisionStats} layout="vertical" margin={{ left: 150, right: 50, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} tick={axisStyle} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="label" tick={axisStyle} width={145} />
              <Tooltip content={<TT />} />
              <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                {provisionStats.map(entry => (
                  <Cell key={entry.key} fill={entry.pct >= 70 ? '#16A34A' : entry.pct >= 30 ? '#1870D5' : '#D4D4D8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-2 text-xs text-odl-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-odl-green inline-block" /> ≥70% high convergence</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-odl-accent inline-block" /> 30–69% medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-odl-border-strong inline-block" /> &lt;30% low</span>
          </div>
        </ChartWrap>
      </div>

      {/* Category + Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHead>By Primary Category</SectionHead>
          <ChartWrap height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 140, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={axisStyle} />
                <YAxis type="category" dataKey="label" tick={axisStyle} width={135} />
                <Tooltip content={<TT />} />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {byCategory.map((_e, i) => <Cell key={_e.label} fill={BLUE_SCALE[i % BLUE_SCALE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        </div>
        <div>
          <SectionHead>Enacted by Year</SectionHead>
          <ChartWrap height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byYear} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<TT />} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {byYear.map((ye, i) => <Cell key={ye.label} fill={GREEN_SCALE[Math.min(i, GREEN_SCALE.length - 1)]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        </div>
      </div>

      {/* Legal Family */}
      <div>
        <SectionHead>By Legal Family</SectionHead>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {byFamily.map(({ label, count }) => (
            <div key={label} className="bg-white border border-odl-border rounded-card p-3 flex items-center justify-between">
              <span className="text-sm text-odl-muted">{label}</span>
              <span className="text-xl font-bold text-odl-accent">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI-specific + Binding split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHead>AI-Specific vs. General Law (AI-Applicable)</SectionHead>
          <div className="bg-white border border-odl-border rounded-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-odl-muted mb-1">
                  <span>AI-Specific</span>
                  <span className="font-mono">{aiSpecificCount} / {n}</span>
                </div>
                <div className="h-2.5 bg-odl-surface rounded-full overflow-hidden">
                  <div className="h-full bg-odl-accent rounded-full" style={{ width: `${Math.round((aiSpecificCount / n) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xl font-bold text-odl-accent font-mono w-12 text-right">{Math.round((aiSpecificCount / n) * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-odl-muted mb-1">
                  <span>General Law (AI-Applicable)</span>
                  <span className="font-mono">{n - aiSpecificCount} / {n}</span>
                </div>
                <div className="h-2.5 bg-odl-surface rounded-full overflow-hidden">
                  <div className="h-full bg-odl-border-strong rounded-full" style={{ width: `${Math.round(((n - aiSpecificCount) / n) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xl font-bold text-odl-subtle font-mono w-12 text-right">{Math.round(((n - aiSpecificCount) / n) * 100)}%</span>
            </div>
          </div>
        </div>
        <div>
          <SectionHead>Legally Binding vs. Soft Law / Voluntary</SectionHead>
          <div className="bg-white border border-odl-border rounded-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-odl-muted mb-1">
                  <span>Legally Binding</span>
                  <span className="font-mono">{bindingCount} / {n}</span>
                </div>
                <div className="h-2.5 bg-odl-surface rounded-full overflow-hidden">
                  <div className="h-full bg-odl-green rounded-full" style={{ width: `${Math.round((bindingCount / n) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xl font-bold text-odl-green font-mono w-12 text-right">{Math.round((bindingCount / n) * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-odl-muted mb-1">
                  <span>Soft Law / Voluntary</span>
                  <span className="font-mono">{n - bindingCount} / {n}</span>
                </div>
                <div className="h-2.5 bg-odl-surface rounded-full overflow-hidden">
                  <div className="h-full bg-odl-yellow rounded-full" style={{ width: `${Math.round(((n - bindingCount) / n) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xl font-bold text-odl-yellow font-mono w-12 text-right">{Math.round(((n - bindingCount) / n) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Convergence */}
      <div>
        <SectionHead>Provision Convergence</SectionHead>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ConvergenceBlock label="High ≥70%" items={convergenceHigh} color="text-odl-green" />
          <ConvergenceBlock label="Medium 30–69%" items={convergenceMed}  color="text-odl-accent" />
          <ConvergenceBlock label="Low <30%"   items={convergenceLow}  color="text-odl-subtle" />
          <ConvergenceBlock label="Absent 0%"  items={absent}          color="text-odl-subtle" />
        </div>
      </div>

      {/* Top Penalties */}
      <div>
        <SectionHead>Highest Maximum Penalties</SectionHead>
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-odl-border">
                <th className="text-left px-4 py-2.5 text-odl-subtle font-medium text-xs">Law</th>
                <th className="text-left px-4 py-2.5 text-odl-subtle font-medium text-xs">Jurisdiction</th>
                <th className="text-left px-4 py-2.5 text-odl-subtle font-medium text-xs">Amount</th>
                <th className="text-right px-4 py-2.5 text-odl-subtle font-medium text-xs">Approx. USD</th>
              </tr>
            </thead>
            <tbody>
              {highPenalty.map(law => (
                <tr key={law.id} className="border-b border-odl-border/60 last:border-0">
                  <td className="px-4 py-2.5 text-odl-text text-xs">{law.short_name}</td>
                  <td className="px-4 py-2.5 text-odl-muted text-xs">{law.jurisdiction}</td>
                  <td className="px-4 py-2.5 text-odl-muted text-xs">{law.max_penalty}</td>
                  <td className="px-4 py-2.5 text-odl-accent text-xs text-right font-mono font-medium">
                    ${(law.max_penalty_usd_approx ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRA */}
      {praLaws.length > 0 && (
        <div>
          <SectionHead>Laws with Private Right of Action ({praLaws.length})</SectionHead>
          <div className="flex flex-wrap gap-1.5">
            {praLaws.map(l => (
              <span key={l.id} className="badge text-odl-green bg-odl-green-bg border-green-200">{l.short_name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConvergenceBlock({ label, items, color }: { label: string; items: { key: string; label: string; pct: number }[]; color: string }) {
  return (
    <div className="bg-white border border-odl-border rounded-card p-3">
      <div className={`text-xs font-semibold mb-2 ${color}`}>{label}</div>
      {items.length === 0
        ? <div className="text-xs text-odl-subtle italic">None</div>
        : <ul className="space-y-1">{items.map(i => (
            <li key={i.key} className="text-xs text-odl-muted flex justify-between gap-2">
              <span>{i.label}</span><span className="text-odl-subtle">{i.pct}%</span>
            </li>
          ))}</ul>}
    </div>
  )
}
