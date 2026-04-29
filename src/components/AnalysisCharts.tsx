import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { AILaw } from '../types'
import { CATEGORY_LABELS, LEGAL_FAMILY_LABELS } from '../data/regulations'

interface Props { laws: AILaw[] }

const ACCENT   = '#1870D5'
const MUTED    = '#D4D4D8'
const GREEN    = '#16A34A'
const axisStyle = { fill: '#71717A', fontSize: 11 }

// ── small reusable components ───────────────────────────────────────────────

function StatCard({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="panel p-5">
      <div className="text-3xl font-bold text-odl-accent font-mono leading-none">{value}</div>
      <div className="text-sm font-medium text-odl-text mt-2">{label}</div>
      {sub && <div className="text-xs text-odl-subtle mt-1">{sub}</div>}
    </div>
  )
}

function Section({ title, insight, children }: { title: string; insight?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="pb-2.5 mb-1 border-b border-odl-border">
        <h2 className="text-xs font-semibold text-odl-subtle uppercase tracking-wider">{title}</h2>
      </div>
      {insight && <p className="text-xs text-odl-muted leading-relaxed mt-2.5 mb-4">{insight}</p>}
      {children}
    </div>
  )
}

function ChartTip({ active, payload, label, unit = '' }: {
  active?: boolean; payload?: { value: number }[]; label?: string; unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-odl-border rounded shadow-sm px-3 py-2 text-xs">
      <p className="text-odl-text font-medium mb-0.5">{label}</p>
      <p className="text-odl-accent font-mono">{payload[0].value}{unit}</p>
    </div>
  )
}

// ── main component ───────────────────────────────────────────────────────────

export function AnalysisCharts({ laws }: Props) {
  const active = useMemo(() => laws.filter(l => l.status !== 'superseded'), [laws])
  const n = active.length

  // headline numbers
  const inForce    = active.filter(l => l.status === 'in_force').length
  const binding    = active.filter(l => l.instrument_binding).length
  const aiSpecific = active.filter(l => l.ai_specific).length
  const pra        = active.filter(l => l.provisions?.private_right_of_action).length

  // countries (non-global, top 12)
  const byCountry = useMemo(() => {
    const counts: Record<string, number> = {}
    active.forEach(l => {
      if (l.country && l.country !== 'Global / Regional') {
        counts[l.country] = (counts[l.country] ?? 0) + 1
      }
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }))
  }, [active])

  // year-by-year (2018 onwards)
  const byYear = useMemo(() => {
    const counts: Record<string, number> = {}
    active.forEach(l => {
      const yr = l.enacted_date?.slice(0, 4)
      if (yr && parseInt(yr) >= 2018) counts[yr] = (counts[yr] ?? 0) + 1
    })
    return Object.entries(counts).sort().map(([yr, count]) => ({ yr, count }))
  }, [active])

  const preBoom = useMemo(() =>
    active.filter(l => {
      const yr = l.enacted_date?.slice(0, 4)
      return yr && parseInt(yr) < 2018
    }).length
  , [active])

  // legal family
  const byFamily = useMemo(() => {
    const counts: Record<string, number> = {}
    active.forEach(l => { counts[l.legal_family] = (counts[l.legal_family] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, count]) => ({ name: LEGAL_FAMILY_LABELS[k] ?? k, count }))
  }, [active])

  // subject matter
  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    active.forEach(l => { counts[l.primary_category] = (counts[l.primary_category] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, count]) => ({ name: CATEGORY_LABELS[k] ?? k, count }))
  }, [active])

  // provisions
  const PROVISION_LABELS: Record<string, string> = {
    prohibited_categories:      'Prohibited use categories',
    impact_assessment_required: 'Impact assessment required',
    human_review_right:         'Right to human review',
    risk_classification_system: 'Risk classification system',
    anti_discrimination:        'Anti-discrimination rules',
    content_labelling:          'AI content labelling',
    ai_interaction_disclosure:  'AI interaction disclosure',
    biometric_protection:       'Biometric data protection',
    opt_out_right:              'Right to opt out',
    training_data_disclosure:   'Training data disclosure',
    voice_likeness_protection:  'Voice / likeness protection',
    private_right_of_action:    'Private right of action',
    safe_harbor:                'Safe harbor provision',
    agentic_ai_addressed:       'Agentic AI addressed',
    algorithmic_pricing_addressed: 'Algorithmic pricing',
    training_data_compensation: 'Training data compensation',
    data_rights_re_training:    'Data rights re: training',
  }

  const provisions = useMemo(() =>
    Object.entries(PROVISION_LABELS).map(([key, label]) => {
      const count = active.filter(l => (l.provisions as unknown as Record<string, unknown>)?.[key] === true).length
      return { label, pct: n > 0 ? Math.round((count / n) * 100) : 0, count }
    }).sort((a, b) => b.pct - a.pct)
  , [active, n])

  // top penalties
  const penalties = useMemo(() =>
    [...active]
      .filter(l => l.max_penalty_usd_approx != null && (l.max_penalty_usd_approx ?? 0) > 0)
      .sort((a, b) => (b.max_penalty_usd_approx ?? 0) - (a.max_penalty_usd_approx ?? 0))
      .slice(0, 8)
  , [active])

  const maxPenalty = penalties[0]?.max_penalty_usd_approx ?? 1

  return (
    <div className="space-y-10 max-w-screen-lg">

      {/* ── Headline stats ── */}
      <Section title="Global snapshot">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard value={n} label="Active instruments" sub={`${preBoom} enacted before 2018`} />
          <StatCard value={active.filter(l => l.country !== 'Global / Regional').length > 0
            ? new Set(active.filter(l => l.country !== 'Global / Regional').map(l => l.country)).size
            : 0}
            label="Jurisdictions covered"
            sub={`${active.filter(l => l.jurisdiction_type === 'supranational').length} supranational bodies`}
          />
          <StatCard
            value={`${Math.round((binding / n) * 100)}%`}
            label="Legally binding"
            sub={`${n - binding} soft law or voluntary`}
          />
          <StatCard
            value={`${Math.round((inForce / n) * 100)}%`}
            label="Currently in force"
            sub={`${n - inForce} enacted but not yet effective`}
          />
        </div>
      </Section>

      {/* ── Legislative timeline ── */}
      <Section
        title="Legislative timeline"
        insight={`AI regulation accelerated sharply from 2023. The 47 laws enacted in 2024 alone exceed the entire output of every year before 2021 combined. The pace has not slowed: 2025 matched 2024 almost exactly.`}
      >
        <div className="panel p-5" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byYear} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <XAxis dataKey="yr" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={0} stroke="#E4E4E7" />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={48}>
                {byYear.map(d => (
                  <Cell
                    key={d.yr}
                    fill={parseInt(d.yr) >= 2023 ? ACCENT : '#93C5FD'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-5 mt-3 text-xs text-odl-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: ACCENT }} />
            2023 onwards
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-blue-200" />
            Before 2023
          </span>
        </div>
      </Section>

      {/* ── Country + Legal family ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <Section
          title="Most active jurisdictions"
          insight="The United States accounts for 44% of all tracked instruments, driven by state-level legislation. No country comes close."
        >
          <div className="panel p-4" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCountry} layout="vertical" margin={{ left: 8, right: 36, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={axisStyle} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={18}>
                  {byCountry.map((d, i) => (
                    <Cell key={d.name} fill={i === 0 ? ACCENT : '#93C5FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section
          title="Legislative genealogy"
          insight="The US consumer protection model is the dominant global template, followed by the EU risk-based approach. Most non-Western jurisdictions adopt hybrid or standalone frameworks."
        >
          <div className="panel p-4" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byFamily} layout="vertical" margin={{ left: 8, right: 36, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={axisStyle} width={150} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={18}>
                  {byFamily.map((d, i) => (
                    <Cell key={d.name} fill={i === 0 ? ACCENT : i === 1 ? '#3B82F6' : '#93C5FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

      </div>

      {/* ── Subject matter ── */}
      <Section
        title="Subject matter"
        insight="General AI governance frameworks, data protection, and synthetic media collectively account for three quarters of all instruments. Sector-specific laws remain a small minority."
      >
        <div className="panel p-5" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical" margin={{ left: 8, right: 40, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={axisStyle} width={175} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="count" fill={ACCENT} radius={[0, 3, 3, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* ── Key ratios ── */}
      <Section title="Instrument characteristics">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'AI-specific legislation',
              value: aiSpecific,
              pct: Math.round((aiSpecific / n) * 100),
              sub: `${n - aiSpecific} laws are general-purpose statutes that apply to AI`,
              color: ACCENT,
            },
            {
              label: 'Legally binding',
              value: binding,
              pct: Math.round((binding / n) * 100),
              sub: `${n - binding} instruments are voluntary frameworks or soft guidance`,
              color: GREEN,
            },
            {
              label: 'Private right of action',
              value: pra,
              pct: Math.round((pra / n) * 100),
              sub: `Most enforcement is government-only; individuals cannot sue directly`,
              color: '#D97706',
            },
          ].map(item => (
            <div key={item.label} className="panel p-5">
              <div className="flex items-end justify-between mb-3">
                <div className="text-2xl font-bold font-mono" style={{ color: item.color }}>{item.pct}%</div>
                <div className="text-xs text-odl-subtle font-mono">{item.value} / {n}</div>
              </div>
              <div className="h-1.5 bg-odl-surface rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
              </div>
              <div className="text-xs font-semibold text-odl-text mb-1">{item.label}</div>
              <div className="text-xs text-odl-subtle leading-relaxed">{item.sub}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Provision adoption ── */}
      <Section
        title="What laws actually require"
        insight={`Prohibited use categories (${provisions.find(p => p.label === 'Prohibited use categories')?.pct ?? 0}%) and impact assessments (${provisions.find(p => p.label === 'Impact assessment required')?.pct ?? 0}%) are the most widely adopted AI-specific obligations. Only ${provisions.find(p => p.label === 'Right to human review')?.pct ?? 0}% of laws guarantee a right to human review of automated decisions.`}
      >
        <div className="panel p-5" style={{ height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provisions} layout="vertical" margin={{ left: 8, right: 52, top: 0, bottom: 0 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={axisStyle}
                tickFormatter={v => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis type="category" dataKey="label" tick={axisStyle} width={192} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip unit="%" />} formatter={(v) => [`${v}%`, 'Laws']} />
              <Bar dataKey="pct" radius={[0, 3, 3, 0]} maxBarSize={16}>
                {provisions.map(p => (
                  <Cell
                    key={p.label}
                    fill={p.pct >= 30 ? ACCENT : p.pct > 0 ? '#93C5FD' : MUTED}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-5 mt-3 text-xs text-odl-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: ACCENT }} />
            Adopted by 30%+ of laws
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-blue-200" />
            Adopted by fewer than 30%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: MUTED }} />
            Rare or absent
          </span>
        </div>
      </Section>

      {/* ── Top penalties ── */}
      <Section
        title="Maximum financial penalties"
        insight="The EU AI Act's penalty structure cascades through all 27 member states via national implementation laws, making European instruments dominate this table. Figures are approximate USD equivalents."
      >
        <div className="panel overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-odl-border bg-odl-surface">
                <th className="text-left px-4 py-3 text-xs font-semibold text-odl-subtle">Law</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-odl-subtle hidden sm:table-cell">Jurisdiction</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-odl-subtle">Max. penalty (approx. USD)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-odl-subtle w-32 hidden md:table-cell">Scale</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((law, i) => {
                const usd = law.max_penalty_usd_approx ?? 0
                const pct = Math.round((usd / maxPenalty) * 100)
                return (
                  <tr key={law.id} className={`border-b border-odl-border/60 last:border-0 ${i === 0 ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-4 py-3 text-xs text-odl-text font-medium">{law.short_name}</td>
                    <td className="px-4 py-3 text-xs text-odl-muted hidden sm:table-cell">{law.jurisdiction}</td>
                    <td className="px-4 py-3 text-xs text-odl-accent font-mono font-semibold text-right">
                      ${usd.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="h-1.5 bg-odl-surface rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ACCENT }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

    </div>
  )
}
