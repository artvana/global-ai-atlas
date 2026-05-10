import { useState, useMemo, useRef, useEffect } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import Fuse from 'fuse.js'
import type { AILaw, Rule } from '../types'
import { regulations } from '../data/regulations'
import rulesData from '../../data/rules.json'
import topoData from 'world-atlas/countries-110m.json'

const BINDING_LAW_IDS = new Set(regulations.filter(l => l.instrument_binding).map(l => l.id))

// Rule explorer only shows rules with at least one instance from a binding law
const rules = (rulesData as Rule[]).filter(r => r.instances.some(i => BINDING_LAW_IDS.has(i.law_id)))

// ── ISO lookups ───────────────────────────────────────────────────────────
const COUNTRY_TO_ISO: Record<string, string> = {
  'Algeria':'012','Argentina':'032','Australia':'036','Azerbaijan':'031',
  'Bahrain':'048','Bangladesh':'050','Benin':'204','Bhutan':'064','Brazil':'076',
  'Brunei Darussalam':'096','Cameroon':'120','Canada':'124','Chile':'152',
  'China':'156','Colombia':'170','Costa Rica':'188','Denmark':'208',
  'Dominican Republic':'214','Ecuador':'218','Egypt':'818','Estonia':'233',
  'Ethiopia':'231','Finland':'246','France':'250','Germany':'276','Ghana':'288',
  'Hungary':'348','India':'356','Indonesia':'360','Ireland':'372','Israel':'376',
  'Italy':'380','Ivory Coast':'384','Japan':'392','Jordan':'400',
  'Kazakhstan':'398','Kenya':'404','Kuwait':'414','Kyrgyzstan':'417',
  'Latvia':'428','Lithuania':'440','Malaysia':'458','Malta':'470',
  'Mauritius':'480','Mexico':'484','Moldova':'498','Morocco':'504',
  'Namibia':'516','Nepal':'524','New Zealand':'554','Nigeria':'566',
  'Norway':'578','Oman':'512','Pakistan':'586','Panama':'591','Paraguay':'600',
  'Peru':'604','Philippines':'608','Qatar':'634','Romania':'642',
  'Russia':'643','Rwanda':'646','Saudi Arabia':'682','Senegal':'686',
  'Serbia':'688','Singapore':'702','South Africa':'710','South Korea':'410',
  'Spain':'724','Sri Lanka':'144','Sweden':'752','Switzerland':'756',
  'Taiwan':'158','Tajikistan':'762','Tanzania':'834','Thailand':'764',
  'Trinidad and Tobago':'780','Tunisia':'788','Turkey':'792','Uganda':'800',
  'Ukraine':'804','United Arab Emirates':'784','United Kingdom':'826',
  'United States':'840','Uruguay':'858','Uzbekistan':'860',
  'Vietnam':'704','Zambia':'894','Zimbabwe':'716',
}
const ISO_TO_COUNTRY = Object.fromEntries(Object.entries(COUNTRY_TO_ISO).map(([c, iso]) => [iso, c]))

const EU_MEMBER_ISO   = new Set(['040','056','100','191','196','203','208','233','246','250','276','300','348','372','380','428','440','442','470','528','616','620','642','703','705','724','752'])
const GCC_MEMBER_ISO  = new Set(['682','784','634','414','048','512'])
const ASEAN_MEMBER_ISO = new Set(['096','116','360','418','458','104','608','702','764','704'])

const LAW_BY_ID = new Map(regulations.map(l => [l.id, l]))

// ── Colour scales ─────────────────────────────────────────────────────────
type BindingFilter = 'all' | 'binding' | 'policy'

function getCountColor(n: number) {
  if (n === 0)  return '#E9ECEF'
  if (n === 1)  return '#C2D9F5'
  if (n <= 3)   return '#8ABDE8'
  if (n <= 6)   return '#4F96D6'
  if (n <= 10)  return '#1F6FBB'
  return '#0D4A8A'
}

const REL_PRIORITY: Record<string, number> = { identical:5, agrees:4, similar:3, origin:2, opposed:1 }
const REL_COLOR: Record<string, string>    = { identical:'#16a34a', agrees:'#4ade80', similar:'#fbbf24', origin:'#6366f1', opposed:'#ef4444' }
const REL_LABEL: Record<string, string>    = { identical:'Fully adopted', agrees:'Adopted', similar:'Partially adopted', origin:'Origin / first instance', opposed:'Explicitly opposes' }

const RULE_LEGEND  = [
  { label:'Origin',             color:REL_COLOR.origin    },
  { label:'Fully adopted',      color:REL_COLOR.identical },
  { label:'Adopted',            color:REL_COLOR.agrees    },
  { label:'Partially adopted',  color:REL_COLOR.similar   },
  { label:'Explicitly opposes', color:REL_COLOR.opposed   },
  { label:'Not regulated',      color:'#E9ECEF'           },
]
const COUNT_LEGEND = [
  { label:'None', color:'#E9ECEF' }, { label:'1', color:'#C2D9F5' },
  { label:'2–3',  color:'#8ABDE8' }, { label:'4–6', color:'#4F96D6' },
  { label:'7–10', color:'#1F6FBB' }, { label:'11+', color:'#0D4A8A' },
]

// ── Category metadata ─────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = {
  accountability_governance: 'Accountability & Governance',
  biometric_data:            'Biometric Data',
  conformity_assessment:     'Conformity Assessment',
  consent:                   'Consent',
  data_provenance:           'Data Provenance',
  data_subject_rights:       'Data Subject Rights',
  definitions_scope:         'Definitions & Scope',
  disclosure:                'Disclosure',
  employment_ai:             'Employment & AI',
  enforcement_penalties:     'Enforcement & Penalties',
  explainability:            'Explainability',
  foundation_models:         'Foundation Models',
  human_oversight:           'Human Oversight',
  institutional_framework:   'Institutional Framework',
  private_redress:           'Private Redress',
  prohibited_applications:   'Prohibited Applications',
  registration_notification: 'Registration & Notification',
  risk_classification:       'Risk Classification',
  synthetic_media:           'Synthetic Media',
  technical_documentation:   'Technical Documentation',
  training_data_quality:     'Training Data Quality',
}

// Pre-compute per-category stats at module level
const CAT_RULE_COUNTS = rules.reduce<Record<string, number>>((acc, r) => {
  acc[r.category] = (acc[r.category] ?? 0) + 1
  return acc
}, {})
const SORTED_CATS = Object.keys(CAT_RULE_COUNTS).sort((a, b) =>
  (CAT_LABELS[a] ?? a).localeCompare(CAT_LABELS[b] ?? b)
)

// Fuse for text search within a displayed rule list
const ruleFuse = new Fuse(rules, {
  keys: [{ name: 'rule_text', weight: 2 }, { name: 'tags', weight: 1 }],
  threshold: 0.35,
})

// ── Types ─────────────────────────────────────────────────────────────────
interface AdoptionEntry { relationship: string; lawName: string; lawId: string }
interface TooltipData {
  x: number; y: number; country: string
  laws?: AILaw[]
  adoption?: AdoptionEntry | null
}

export function GAIAMap({ onViewLaw }: { onViewLaw?: (id: string) => void } = {}) {
  const [tooltip, setTooltip]             = useState<TooltipData | null>(null)
  const [zoom, setZoom]                   = useState(1)
  const [bindingFilter, setBindingFilter] = useState<BindingFilter>('all')
  // Rule explorer state
  const [ruleCategory, setRuleCategory]   = useState<string | null>(null)
  const [ruleQuery, setRuleQuery]         = useState('')
  const [selectedRule, setSelectedRule]   = useState<Rule | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Reset search when category changes
  useEffect(() => { setRuleQuery('') }, [ruleCategory])

  // ── Filtered regulations for law-count mode (in force only) ──────────
  const filteredRegs = useMemo(() => {
    const inForce = regulations.filter(l => l.status === 'in_force')
    if (bindingFilter === 'binding') return inForce.filter(l => l.instrument_binding)
    if (bindingFilter === 'policy')  return inForce.filter(l => !l.instrument_binding)
    return inForce
  }, [bindingFilter])

  // Supranational blocs — cascaded to all member-state ISO codes
  const euLaws = useMemo(() =>
    filteredRegs.filter(l => l.country === 'European Union')
  , [filteredRegs])

  const gccLaws = useMemo(() =>
    filteredRegs.filter(l => l.country === 'Gulf Cooperation Council')
  , [filteredRegs])

  const aseanLaws = useMemo(() =>
    filteredRegs.filter(l => l.country === 'Global / Regional' && l.jurisdiction === 'ASEAN')
  , [filteredRegs])

  const lawsByISO = useMemo(() => {
    const map = new Map<string, AILaw[]>()
    for (const law of filteredRegs) {
      const iso = COUNTRY_TO_ISO[law.country]
      if (!iso) continue
      if (!map.has(iso)) map.set(iso, [])
      map.get(iso)!.push(law)
    }
    return map
  }, [filteredRegs])

  // ── Rules in selected category, sorted by adoption ──────────────────
  const categoryRules = useMemo(() => {
    if (!ruleCategory) return []
    return rules
      .filter(r => r.category === ruleCategory)
      .sort((a, b) => b.instances.length - a.instances.length)
  }, [ruleCategory])

  const displayedRules = useMemo(() => {
    if (!ruleQuery.trim()) return categoryRules.slice(0, 30)
    return ruleFuse.search(ruleQuery.trim())
      .map(r => r.item)
      .filter(r => r.category === ruleCategory)
      .slice(0, 30)
  }, [categoryRules, ruleQuery, ruleCategory])

  // ── Adoption map for selected rule ───────────────────────────────────
  const adoptionByISO = useMemo((): Map<string, AdoptionEntry> | null => {
    if (!selectedRule) return null
    const map = new Map<string, AdoptionEntry>()
    function trySet(iso: string, entry: AdoptionEntry) {
      const ex = map.get(iso)
      if (!ex || (REL_PRIORITY[entry.relationship] ?? 0) > (REL_PRIORITY[ex.relationship] ?? 0)) map.set(iso, entry)
    }
    for (const inst of selectedRule.instances) {
      const law = LAW_BY_ID.get(inst.law_id)
      if (!law) continue
      const entry: AdoptionEntry = { relationship: inst.relationship, lawName: law.short_name, lawId: law.id }
      if (law.country === 'Global / Regional') {
        if (law.jurisdiction === 'European Union') EU_MEMBER_ISO.forEach(iso => trySet(iso, entry))
        else if (law.jurisdiction === 'Gulf Cooperation Council') GCC_MEMBER_ISO.forEach(iso => trySet(iso, entry))
        else if (/ASEAN/i.test(law.jurisdiction)) ASEAN_MEMBER_ISO.forEach(iso => trySet(iso, entry))
      } else {
        const iso = COUNTRY_TO_ISO[law.country]
        if (iso) trySet(iso, entry)
      }
    }
    return map
  }, [selectedRule])

  const adoptionGroups = useMemo(() => {
    if (!adoptionByISO) return null
    const groups: Record<string, string[]> = {}
    adoptionByISO.forEach((entry, iso) => {
      const c = ISO_TO_COUNTRY[iso] ?? iso
      if (!groups[entry.relationship]) groups[entry.relationship] = []
      groups[entry.relationship].push(c)
    })
    Object.values(groups).forEach(a => a.sort())
    return groups
  }, [adoptionByISO])

  const totalCovered = useMemo(() =>
    new Set(regulations.map(l => l.country).filter(c => c !== 'Global / Regional')).size
  , [])

  // ── Binding filter toggle ─────────────────────────────────────────────
  const FILTER_OPTS: { key: BindingFilter; label: string }[] = [
    { key: 'all',     label: 'All instruments' },
    { key: 'binding', label: 'Binding laws only' },
    { key: 'policy',  label: 'Policies & strategies' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* ── Rule Explorer panel ─────────────────────────────────────────── */}
      <div className="panel p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-odl-text">Rule Explorer</h2>
            <p className="text-xs text-odl-muted mt-0.5">
              Pick a policy area to see how a specific requirement has spread across jurisdictions.
            </p>
          </div>
          {(ruleCategory || selectedRule) && (
            <button
              onClick={() => { setSelectedRule(null); setRuleCategory(null); setRuleQuery('') }}
              className="text-xs text-odl-muted hover:text-odl-text border border-odl-border rounded px-2 py-1 ml-4 flex-shrink-0"
            >
              ✕ Start over
            </button>
          )}
        </div>

        {/* Step 1 — category grid */}
        {!ruleCategory && !selectedRule && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {SORTED_CATS.map(cat => (
              <button
                key={cat}
                onClick={() => setRuleCategory(cat)}
                className="text-left px-3 py-2.5 border border-odl-border rounded hover:border-odl-accent hover:bg-odl-surface transition-colors"
              >
                <div className="text-xs font-medium text-odl-text leading-snug">
                  {CAT_LABELS[cat] ?? cat}
                </div>
                <div className="text-[10px] text-odl-subtle mt-0.5">
                  {CAT_RULE_COUNTS[cat]} rules
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — rule list within category */}
        {ruleCategory && !selectedRule && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => { setRuleCategory(null); setRuleQuery('') }}
                className="text-xs text-odl-muted hover:text-odl-text"
              >
                ← back
              </button>
              <span className="text-xs text-odl-subtle">·</span>
              <span className="text-xs font-medium text-odl-text">{CAT_LABELS[ruleCategory] ?? ruleCategory}</span>
              <span className="text-[10px] text-odl-subtle">({CAT_RULE_COUNTS[ruleCategory]} rules, sorted by adoption)</span>
            </div>
            <input
              ref={searchRef}
              type="text"
              value={ruleQuery}
              onChange={e => setRuleQuery(e.target.value)}
              placeholder="Filter within this category…"
              className="w-full text-xs border border-odl-border rounded px-3 py-1.5 mb-3 focus:outline-none focus:border-odl-accent"
            />
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {displayedRules.length === 0 && (
                <p className="text-xs text-odl-muted py-2">No matching rules.</p>
              )}
              {displayedRules.map(rule => (
                <button
                  key={rule.rule_id}
                  onClick={() => setSelectedRule(rule)}
                  className="w-full text-left px-3 py-2 border border-odl-border rounded hover:border-odl-accent hover:bg-odl-surface transition-colors flex items-start gap-3"
                >
                  <span className="text-[10px] font-mono text-white bg-odl-accent rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                    {rule.instances.length}
                  </span>
                  <p className="text-xs text-odl-text line-clamp-2 leading-relaxed">{rule.rule_text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — selected rule display */}
        {selectedRule && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setSelectedRule(null)}
                className="text-xs text-odl-muted hover:text-odl-text"
              >
                ← back to {CAT_LABELS[ruleCategory ?? selectedRule.category] ?? selectedRule.category}
              </button>
            </div>
            <div className="bg-odl-surface border border-odl-border rounded p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] text-odl-subtle uppercase tracking-wide">
                  {CAT_LABELS[selectedRule.category] ?? selectedRule.category}
                </span>
                <span className="text-[10px] text-white bg-odl-accent rounded px-1.5 py-0.5 font-mono">
                  {selectedRule.instances.length} jurisdictions
                </span>
              </div>
              <p className="text-xs text-odl-text leading-relaxed">{selectedRule.rule_text}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats + binding filter (default map mode only) ───────────────── */}
      {!selectedRule && (
        <>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 mr-4">
              {[
                { label: 'Countries Covered', value: totalCovered },
                { label: 'National Instruments', value: filteredRegs.filter(l => l.country !== 'Global / Regional' && l.country !== 'European Union' && l.country !== 'Gulf Cooperation Council').length },
                { label: 'Supranational',        value: filteredRegs.filter(l => l.country === 'Global / Regional' || l.country === 'European Union' || l.country === 'Gulf Cooperation Council').length },
                { label: 'Binding Laws',         value: filteredRegs.filter(l => l.instrument_binding && l.country !== 'Global / Regional' && l.country !== 'European Union' && l.country !== 'Gulf Cooperation Council').length },
              ].map(s => (
                <div key={s.label} className="panel p-3 text-center">
                  <div className="text-lg font-bold text-odl-text font-mono">{s.value}</div>
                  <div className="text-[10px] text-odl-subtle mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {FILTER_OPTS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setBindingFilter(key)}
                  className={`text-[11px] px-3 py-1.5 rounded border transition-colors text-left ${
                    bindingFilter === key
                      ? 'bg-odl-accent text-white border-odl-accent'
                      : 'border-odl-border text-odl-muted hover:text-odl-text hover:border-odl-border-strong bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <div className="panel overflow-hidden relative">
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="w-6 h-6 bg-white border border-odl-border rounded text-odl-muted hover:text-odl-text text-sm leading-none flex items-center justify-center">+</button>
          <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="w-6 h-6 bg-white border border-odl-border rounded text-odl-muted hover:text-odl-text text-sm leading-none flex items-center justify-center">−</button>
        </div>

        <ComposableMap projection="geoEquirectangular" projectionConfig={{ scale: 143, center: [0, 0] }} width={900} height={450} style={{ width: '100%', height: 'auto' }}>
          <ZoomableGroup zoom={zoom} minZoom={1} maxZoom={4}>
            <Geographies geography={topoData}>
              {({ geographies }: { geographies: { id: string; rsmKey: string; properties: Record<string, string> }[] }) =>
                geographies.map(geo => {
                  const iso = String(geo.id).padStart(3, '0')
                  const country = ISO_TO_COUNTRY[iso] ?? ''
                  let fill: string, hoverFill: string, tooltipData: TooltipData

                  if (adoptionByISO) {
                    const entry = adoptionByISO.get(iso) ?? null
                    fill = entry ? (REL_COLOR[entry.relationship] ?? '#94A3B8') : '#E9ECEF'
                    hoverFill = entry ? fill : '#D1D5DB'
                    tooltipData = { x: 0, y: 0, country, adoption: entry }
                  } else {
                    const laws = [
                      ...(lawsByISO.get(iso) ?? []),
                      ...(EU_MEMBER_ISO.has(iso)    ? euLaws    : []),
                      ...(GCC_MEMBER_ISO.has(iso)   ? gccLaws   : []),
                      ...(ASEAN_MEMBER_ISO.has(iso) ? aseanLaws : []),
                    ]
                    fill = getCountColor(laws.length)
                    hoverFill = laws.length > 0 ? '#0D4A8A' : '#D1D5DB'
                    tooltipData = { x: 0, y: 0, country, laws }
                  }

                  return (
                    <Geography key={geo.rsmKey} geography={geo} fill={fill} stroke="#FFFFFF" strokeWidth={0.3}
                      onMouseEnter={(e: MouseEvent) => { if (country) setTooltip({ ...tooltipData, x: e.clientX, y: e.clientY }) }}
                      onMouseMove={(e: MouseEvent)  => { if (country) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null) }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: { outline: 'none' },
                        hover:   { fill: hoverFill, outline: 'none', cursor: country ? 'pointer' : 'default' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 bg-white/90 border border-odl-border rounded px-2.5 py-1.5 max-w-sm">
          <span className="text-[10px] text-odl-subtle mr-1">{selectedRule ? 'Adoption:' : 'Instruments:'}</span>
          {(selectedRule ? RULE_LEGEND : COUNT_LEGEND).map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-odl-subtle">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Adoption breakdown (rule mode) ──────────────────────────────── */}
      {selectedRule && adoptionGroups && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['origin','identical','agrees','similar','opposed'] as const)
            .filter(rel => adoptionGroups[rel]?.length)
            .map(rel => (
              <section key={rel}>
                <h3 className="text-xs font-semibold text-odl-subtle tracking-[0.08em] uppercase mb-2 pb-1.5 border-b border-odl-border flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: REL_COLOR[rel] }} />
                  {REL_LABEL[rel]} · {adoptionGroups[rel].length}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {adoptionGroups[rel].map(c => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 bg-odl-surface border border-odl-border rounded text-odl-muted">{c}</span>
                  ))}
                </div>
              </section>
            ))
          }
          {adoptionByISO?.size === 0 && (
            <p className="text-xs text-odl-muted col-span-full">No jurisdictions in the database have adopted this rule yet.</p>
          )}
        </div>
      )}

      {/* ── Law-count mode: global / regional instruments ────────────────── */}
      {!selectedRule && (
        <section>
          <h3 className="text-xs font-semibold text-odl-subtle tracking-[0.08em] uppercase mb-3 pb-1.5 border-b border-odl-border">
            Global / Regional Instruments
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            {Object.entries(
              filteredRegs.filter(l => l.country === 'Global / Regional')
                .reduce<Record<string, AILaw[]>>((acc, l) => { acc[l.jurisdiction] = [...(acc[l.jurisdiction] ?? []), l]; return acc }, {})
            ).sort((a, b) => b[1].length - a[1].length).map(([body, laws]) => (
              <div key={body}>
                <div className="text-[10px] font-semibold text-odl-subtle uppercase tracking-wide mb-1.5">{body}</div>
                <div className="space-y-1">
                  {laws.map(law => (
                    <button
                      key={law.id}
                      onClick={() => onViewLaw?.(law.id)}
                      className="w-full text-left px-3 py-2 border border-odl-border rounded text-xs hover:border-odl-accent hover:bg-odl-surface transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-odl-text leading-snug">{law.short_name}</span>
                      <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono ${law.instrument_binding ? 'bg-odl-accent/10 text-odl-accent' : 'bg-odl-surface text-odl-subtle border border-odl-border'}`}>
                        {law.instrument_binding ? 'binding' : 'policy'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tooltip ──────────────────────────────────────────────────────── */}
      {tooltip && (
        <div className="fixed z-50 bg-white border border-odl-border rounded shadow-lg px-3 py-2.5 text-xs pointer-events-none" style={{ left: tooltip.x + 14, top: tooltip.y + 14, maxWidth: 240 }}>
          <div className="font-semibold text-odl-text mb-1.5">{tooltip.country || 'Unknown'}</div>
          {tooltip.adoption !== undefined ? (
            tooltip.adoption ? (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: REL_COLOR[tooltip.adoption.relationship] }} />
                  <span className="font-medium text-odl-text">{REL_LABEL[tooltip.adoption.relationship]}</span>
                </div>
                <div className="text-odl-subtle truncate">via {tooltip.adoption.lawName}</div>
              </>
            ) : <div className="text-odl-muted">Not regulated</div>
          ) : (tooltip.laws && (
            tooltip.laws.length === 0
              ? <div className="text-odl-muted">No instruments in force</div>
              : <>
                  <div className="text-odl-muted mb-1">{tooltip.laws.length} instrument{tooltip.laws.length !== 1 ? 's' : ''} in force</div>
                  {tooltip.laws.slice(0, 4).map(l => <div key={l.id} className="text-odl-subtle leading-snug truncate">— {l.short_name}</div>)}
                  {tooltip.laws.length > 4 && <div className="text-odl-subtle mt-0.5">+{tooltip.laws.length - 4} more</div>}
                </>
          ))}
        </div>
      )}
    </div>
  )
}
