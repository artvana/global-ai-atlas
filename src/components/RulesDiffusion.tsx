import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, Cell,
} from 'recharts'
import { rules } from '../data/rules'
import { regulations } from '../data/regulations'
import { RULE_CATEGORY_LABELS } from '../types'
import type { RuleCategory } from '../types'

// ── colour palette (14 categories) ───────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  general_governance: '#94A3B8',
  training_data:      '#3B82F6',
  enforcement:        '#EF4444',
  synthetic_media:    '#8B5CF6',
  transparency:       '#06B6D4',
  data_rights:        '#10B981',
  prohibited_uses:    '#F97316',
  biometric_data:     '#EC4899',
  impact_assessment:  '#F59E0B',
  risk_classification:'#6366F1',
  human_review:       '#14B8A6',
  employment_ai:      '#84CC16',
  consent:            '#A78BFA',
  foundation_models:  '#0EA5E9',
}

// ── custom tooltip (avoids recharts v3 .color crash on Cell-colored bars) ────
function ChartTip({ active, payload, label }: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-odl-border rounded shadow-sm px-3 py-2 text-xs max-w-[220px]">
      {label && <p className="text-odl-text font-medium mb-1 truncate">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-odl-muted" style={{ color: p.color ?? '#64748B' }}>
          {p.name ? `${p.name}: ` : ''}{p.value}
        </p>
      ))}
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function adoptionCount(rule: { instances: { relationship: string }[] }): number {
  return rule.instances.filter(i => i.relationship === 'identical' || i.relationship === 'agrees').length
}

// ── Introduction timeline chart ───────────────────────────────────────────────

function IntroductionTimeline() {
  const data = useMemo(() => {
    const byYear: Record<number, Record<string, number>> = {}
    for (const rule of rules) {
      const y = parseInt(rule.first_instance.date?.slice(0, 4) ?? '0', 10)
      if (!y || y < 2010) continue
      byYear[y] ??= {}
      byYear[y][rule.category] = (byYear[y][rule.category] ?? 0) + 1
    }
    const years = Object.keys(byYear).map(Number).sort()
    return years.map(y => ({ year: String(y), ...byYear[y] }))
  }, [])

  const categories = useMemo(() =>
    [...new Set(rules.map(r => r.category))].sort()
  , [])

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-semibold text-odl-text mb-1">New rules introduced per year</h3>
      <p className="text-[10px] text-odl-subtle mb-3">
        Count of rules with their first legal instance in that year, grouped by category.
        Tallies the origin of each distinct legal norm, not total laws passed.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={28} />
          <Tooltip content={<ChartTip />} />
          <Legend
            iconSize={8}
            wrapperStyle={{ fontSize: 9, paddingTop: 8 }}
            formatter={(value) => RULE_CATEGORY_LABELS[value as RuleCategory] ?? value}
          />
          {categories.map(cat => (
            <Bar key={cat} dataKey={cat} stackId="a" fill={CAT_COLORS[cat] ?? '#CBD5E1'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Binding vs soft-law origin breakdown ─────────────────────────────────────

function BindingVsSoftTimeline() {
  const lawBindingMap = useMemo(() => {
    const m = new Map<string, boolean>()
    regulations.forEach(r => m.set(r.id, r.instrument_binding ?? true))
    return m
  }, [])

  const data = useMemo(() => {
    const byYear: Record<number, { binding: number; soft: number }> = {}
    for (const rule of rules) {
      const y = parseInt(rule.first_instance.date?.slice(0, 4) ?? '0', 10)
      if (!y || y < 2010) continue
      byYear[y] ??= { binding: 0, soft: 0 }
      const isBinding = lawBindingMap.get(rule.first_instance.law_id) ?? true
      if (isBinding) byYear[y].binding++
      else byYear[y].soft++
    }
    return Object.keys(byYear).map(Number).sort().map(y => ({
      year: String(y),
      'Binding law origin': byYear[y].binding,
      'Soft-law origin': byYear[y].soft,
    }))
  }, [lawBindingMap])

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-semibold text-odl-text mb-1">Binding vs. soft-law rule origins</h3>
      <p className="text-[10px] text-odl-subtle mb-3">
        Whether each rule's first instance came from a legally binding instrument (statute, regulation)
        or a soft-law instrument (voluntary framework, policy, guidance).
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={28} />
          <Tooltip content={<ChartTip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 9, paddingTop: 8 }} />
          <Bar dataKey="Binding law origin" fill="#1D4ED8" stackId="a" />
          <Bar dataKey="Soft-law origin" fill="#94A3B8" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Diffusion tracker: soft-law → binding law pipeline ───────────────────────

interface DiffusionEntry {
  rule_id: string
  rule_text: string
  category: string
  softYear: number
  bindingYear: number | null
  lag: number | null        // years from soft-law intro to first binding adoption
  adoptions: number
}

function DiffusionTracker() {
  const lawMap = useMemo(() => {
    const m = new Map<string, { binding: boolean; year: number }>()
    regulations.forEach(r => m.set(r.id, {
      binding: r.instrument_binding ?? true,
      year: parseInt(r.enacted_date?.slice(0, 4) ?? '0', 10),
    }))
    return m
  }, [])

  const entries = useMemo<DiffusionEntry[]>(() => {
    return rules
      .filter(r => {
        // Only rules with soft-law as first instance
        const orig = lawMap.get(r.first_instance.law_id)
        return orig && !orig.binding
      })
      .map(r => {
        const softYear = parseInt(r.first_instance.date?.slice(0, 4) ?? '0', 10)
        // Earliest binding adoption
        const bindingInsts = r.instances
          .filter(i => {
            const m = lawMap.get(i.law_id)
            return m?.binding && (i.relationship === 'identical' || i.relationship === 'agrees' || i.relationship === 'similar')
          })
          .map(i => lawMap.get(i.law_id)!.year)
          .filter(y => y > 0)
        const bindingYear = bindingInsts.length > 0 ? Math.min(...bindingInsts) : null
        return {
          rule_id: r.rule_id,
          rule_text: r.rule_text,
          category: r.category,
          softYear,
          bindingYear,
          lag: bindingYear != null && softYear > 0 ? bindingYear - softYear : null,
          adoptions: adoptionCount(r),
        }
      })
      .filter(e => e.softYear > 0)
      .sort((a, b) => (b.lag ?? -999) - (a.lag ?? -999))
  }, [lawMap])

  const adopted = entries.filter(e => e.bindingYear != null)
  const notAdopted = entries.filter(e => e.bindingYear == null)
  const avgLag = adopted.length > 0
    ? (adopted.reduce((s, e) => s + (e.lag ?? 0), 0) / adopted.length).toFixed(1)
    : 'n/a'

  const [showAll, setShowAll] = useState(false)
  const displayedAdopted = showAll ? adopted : adopted.slice(0, 15)

  return (
    <div className="panel p-4 space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-odl-text mb-1">Soft-law → Binding law diffusion pipeline</h3>
        <p className="text-[10px] text-odl-subtle">
          Rules that originated in non-binding instruments (OECD, UNESCO, G7, voluntary frameworks)
          and were later adopted in legally binding statutes or regulations. Average lag: <strong>{avgLag} years</strong>.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-odl-surface rounded p-3 text-center">
          <div className="text-lg font-semibold text-odl-text">{entries.length}</div>
          <div className="text-[10px] text-odl-subtle">Rules with soft-law origin</div>
        </div>
        <div className="bg-blue-50 rounded p-3 text-center">
          <div className="text-lg font-semibold text-blue-700">{adopted.length}</div>
          <div className="text-[10px] text-odl-subtle">Adopted in binding law</div>
        </div>
        <div className="bg-gray-50 rounded p-3 text-center">
          <div className="text-lg font-semibold text-odl-muted">{notAdopted.length}</div>
          <div className="text-[10px] text-odl-subtle">Still soft-law only</div>
        </div>
      </div>

      {/* Table of adopted rules */}
      <div>
        <h4 className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wider mb-2">
          Soft-law origins adopted in binding law (by diffusion lag)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-odl-border bg-odl-surface">
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-odl-subtle">Rule</th>
                <th className="px-2 py-1.5 text-left text-[10px] font-medium text-odl-subtle">Category</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium text-odl-subtle">Soft</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium text-odl-subtle">Binding</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium text-odl-subtle">Lag</th>
                <th className="px-2 py-1.5 text-right text-[10px] font-medium text-odl-subtle">Adoptions</th>
              </tr>
            </thead>
            <tbody>
              {displayedAdopted.map(e => (
                <tr key={e.rule_id} className="border-b border-odl-border/40 hover:bg-blue-50/20">
                  <td className="px-2 py-1.5 max-w-[360px]">
                    <p className="line-clamp-2 text-odl-text leading-snug">{e.rule_text}</p>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-odl-surface border border-odl-border text-odl-subtle">
                      {RULE_CATEGORY_LABELS[e.category as RuleCategory] ?? e.category}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right text-odl-muted">{e.softYear}</td>
                  <td className="px-2 py-1.5 text-right text-blue-700 font-medium">{e.bindingYear}</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className={`font-medium ${(e.lag ?? 0) >= 5 ? 'text-amber-600' : (e.lag ?? 0) >= 2 ? 'text-odl-muted' : 'text-green-700'}`}>
                      {e.lag != null ? `${e.lag}y` : '—'}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right text-odl-muted">{e.adoptions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {adopted.length > 15 && (
          <button
            className="mt-2 text-xs text-odl-accent hover:underline"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? 'Show less' : `Show all ${adopted.length} rules`}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Most-adopted rules ────────────────────────────────────────────────────────

function TopAdoptedRules() {
  const top = useMemo(() =>
    [...rules]
      .map(r => ({ ...r, adoptions: adoptionCount(r) }))
      .filter(r => r.adoptions > 0)
      .sort((a, b) => b.adoptions - a.adoptions)
      .slice(0, 25)
  , [])

  const data = top.map(r => ({
    name: r.rule_text.slice(0, 55) + (r.rule_text.length > 55 ? '…' : ''),
    adoptions: r.adoptions,
    category: r.category,
    fill: CAT_COLORS[r.category] ?? '#CBD5E1',
  }))

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-semibold text-odl-text mb-1">Top 25 most-adopted rules</h3>
      <p className="text-[10px] text-odl-subtle mb-3">
        Rules with the most "identical" + "agrees" instances across all laws in the corpus.
        High adoption = de-facto global consensus on this requirement.
      </p>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
        >
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={340}
            tick={{ fontSize: 9 }}
          />
          <Tooltip content={<ChartTip />} />
          <Bar dataKey="adoptions" fill="#94A3B8" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── main export ───────────────────────────────────────────────────────────────

export function RulesDiffusion() {
  const totalRules = rules.length
  const totalAdoptions = useMemo(() =>
    rules.reduce((s, r) => s + adoptionCount(r), 0)
  , [])
  const bindingLaws = regulations.filter(r => r.instrument_binding !== false).length
  const softLaws = regulations.length - bindingLaws

  return (
    <div className="flex flex-col gap-6 max-w-screen-2xl">
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">Rule Diffusion & Timeline</h2>
        <p className="text-xs text-odl-muted leading-relaxed">
          How legal norms travel across time and jurisdictions — from voluntary recommendations
          to binding law. Corpus: <strong>{totalRules}</strong> distinct rules,{' '}
          <strong>{totalAdoptions}</strong> cross-jurisdiction adoptions,{' '}
          <strong>{bindingLaws}</strong> binding instruments, <strong>{softLaws}</strong> soft-law instruments.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <IntroductionTimeline />
        <BindingVsSoftTimeline />
      </div>

      <DiffusionTracker />

      <TopAdoptedRules />
    </div>
  )
}
