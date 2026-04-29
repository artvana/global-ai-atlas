import { useState, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import type { AILaw } from '../types'
import { regulations } from '../data/regulations'

// ISO 3166-1 numeric codes — what world-atlas uses as geo.id
const COUNTRY_TO_ISO_NUMERIC: Record<string, string> = {
  'Argentina':            '032',
  'Australia':            '036',
  'Bangladesh':           '050',
  'Brazil':               '076',
  'Canada':               '124',
  'Chile':                '152',
  'China':                '156',
  'Colombia':             '170',
  'Denmark':              '208',
  'Egypt':                '818',
  'Ethiopia':             '231',
  'Finland':              '246',
  'France':               '250',
  'Hungary':              '348',
  'India':                '356',
  'Indonesia':            '360',
  'Ireland':              '372',
  'Israel':               '376',
  'Italy':                '380',
  'Japan':                '392',
  'Kazakhstan':           '398',
  'Kenya':                '404',
  'Malaysia':             '458',
  'Mauritius':            '480',
  'Mexico':               '484',
  'Morocco':              '504',
  'New Zealand':          '554',
  'Nigeria':              '566',
  'Pakistan':             '586',
  'Peru':                 '604',
  'Philippines':          '608',
  'Qatar':                '634',
  'Russia':               '643',
  'Rwanda':               '646',
  'Saudi Arabia':         '682',
  'Serbia':               '688',
  'Singapore':            '702',
  'South Africa':         '710',
  'South Korea':          '410',
  'Spain':                '724',
  'Sri Lanka':            '144',
  'Switzerland':          '756',
  'Taiwan':               '158',
  'Thailand':             '764',
  'Tunisia':              '788',
  'Turkey':               '792',
  'Ukraine':              '804',
  'United Arab Emirates': '784',
  'United Kingdom':       '826',
  'United States':        '840',
  'Uzbekistan':           '860',
  'Vietnam':              '704',
}

const ISO_TO_COUNTRY = Object.fromEntries(
  Object.entries(COUNTRY_TO_ISO_NUMERIC).map(([c, iso]) => [iso, c])
)

// EU member states — all EU instruments apply to them
const EU_MEMBER_ISO = new Set([
  '040','056','100','191','196','203','208','233','246','250',
  '276','300','348','372','380','428','440','442','470','528',
  '616','620','642','703','705','724','752',
])

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function getColor(count: number): string {
  if (count === 0)   return '#E9ECEF'
  if (count === 1)   return '#C2D9F5'
  if (count <= 3)    return '#8ABDE8'
  if (count <= 6)    return '#4F96D6'
  if (count <= 10)   return '#1F6FBB'
  return '#0D4A8A'
}

interface Tooltip {
  x: number
  y: number
  country: string
  nationalLaws: AILaw[]
  euLaws: AILaw[]
}

const LEGEND = [
  { label: 'None',  color: '#E9ECEF' },
  { label: '1',     color: '#C2D9F5' },
  { label: '2–3',   color: '#8ABDE8' },
  { label: '4–6',   color: '#4F96D6' },
  { label: '7–10',  color: '#1F6FBB' },
  { label: '11+',   color: '#0D4A8A' },
]

export function GAIAMap() {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const [zoom, setZoom] = useState(1)

  // All EU-jurisdiction instruments (apply to all 27 member states)
  const euLaws = useMemo(() =>
    regulations.filter(l => l.country === 'Global / Regional' && l.jurisdiction === 'European Union'),
  [])

  const lawsByISO = useMemo(() => {
    const map = new Map<string, AILaw[]>()
    for (const law of regulations) {
      const iso = COUNTRY_TO_ISO_NUMERIC[law.country]
      if (!iso) continue
      if (!map.has(iso)) map.set(iso, [])
      map.get(iso)!.push(law)
    }
    return map
  }, [])

  const totalCovered = useMemo(() =>
    new Set(regulations.map(l => l.country).filter(c => c !== 'Global / Regional')).size
  , [])

  const withLaws = useMemo(() =>
    [...lawsByISO.entries()].filter(([, laws]) => laws.length > 0).length
  , [lawsByISO])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold text-odl-text mb-1">GAIA — Global AI Atlas</h2>
        <p className="text-xs text-odl-muted">
          AI regulatory coverage by jurisdiction. {withLaws} countries with at least one national instrument tracked.
          EU member states include {euLaws.length} EU-level instrument{euLaws.length !== 1 ? 's' : ''} in their totals.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Countries Covered', value: totalCovered },
          { label: 'Total Instruments', value: regulations.filter(l => l.country !== 'Global / Regional').length },
          { label: 'Supranational', value: regulations.filter(l => l.country === 'Global / Regional').length },
          { label: 'With Binding Law', value: regulations.filter(l => l.instrument_binding && l.country !== 'Global / Regional').length },
        ].map(s => (
          <div key={s.label} className="panel p-3 text-center">
            <div className="text-lg font-bold text-odl-text font-mono">{s.value}</div>
            <div className="text-[10px] text-odl-subtle mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="panel overflow-hidden relative">
        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.5, 4))}
            className="w-6 h-6 bg-white border border-odl-border rounded text-odl-muted hover:text-odl-text text-sm leading-none flex items-center justify-center"
          >+</button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.5, 1))}
            className="w-6 h-6 bg-white border border-odl-border rounded text-odl-muted hover:text-odl-text text-sm leading-none flex items-center justify-center"
          >−</button>
        </div>

        {/* geoEquirectangular at 900×450 fills the viewBox at scale 143 (2πS ≈ 898, πS ≈ 449) */}
        <ComposableMap
          projection="geoEquirectangular"
          projectionConfig={{ scale: 143, center: [0, 0] }}
          width={900}
          height={450}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup zoom={zoom} minZoom={1} maxZoom={4}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: { id: string; rsmKey: string; properties: Record<string, string> }[] }) =>
                geographies.map(geo => {
                  const iso = String(geo.id).padStart(3, '0')
                  const nationalLaws = lawsByISO.get(iso) ?? []
                  const isEU = EU_MEMBER_ISO.has(iso)
                  const effectiveCount = nationalLaws.length + (isEU ? euLaws.length : 0)
                  const country = ISO_TO_COUNTRY[iso]
                  const fill = getColor(effectiveCount)
                  const interactive = effectiveCount > 0 || !!country
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#FFFFFF"
                      strokeWidth={0.3}
                      onMouseEnter={(e: MouseEvent) => {
                        if (interactive) setTooltip({ x: e.clientX, y: e.clientY, country: country ?? '', nationalLaws, euLaws: isEU ? euLaws : [] })
                      }}
                      onMouseMove={(e: MouseEvent) => {
                        if (interactive) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default:  { outline: 'none' },
                        hover:    { fill: effectiveCount > 0 ? '#0D4A8A' : '#D1D5DB', outline: 'none', cursor: effectiveCount > 0 ? 'pointer' : 'default' },
                        pressed:  { outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 border border-odl-border rounded px-2.5 py-1.5">
          <span className="text-[10px] text-odl-subtle mr-1">Instruments:</span>
          {LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-odl-subtle">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supranational bodies */}
      <section>
        <h3 className="text-xs font-semibold text-odl-subtle tracking-[0.08em] uppercase mb-3 pb-1.5 border-b border-odl-border">
          Global / Regional Instruments
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(
            regulations
              .filter(l => l.country === 'Global / Regional')
              .reduce<Record<string, AILaw[]>>((acc, l) => {
                const key = l.jurisdiction
                acc[key] = [...(acc[key] ?? []), l]
                return acc
              }, {})
          ).sort((a, b) => b[1].length - a[1].length).map(([body, laws]) => (
            <div key={body} className="flex items-center justify-between px-3 py-2 border border-odl-border rounded text-xs">
              <span className="font-medium text-odl-text">{body}</span>
              <span className="text-odl-subtle font-mono">{laws.length} instrument{laws.length !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top covered countries */}
      <section>
        <h3 className="text-xs font-semibold text-odl-subtle tracking-[0.08em] uppercase mb-3 pb-1.5 border-b border-odl-border">
          Most Active Jurisdictions
        </h3>
        <div className="space-y-1.5">
          {[...lawsByISO.entries()]
            .map(([iso, laws]) => ({
              country: ISO_TO_COUNTRY[iso] ?? iso,
              laws,
              effective: laws.length + (EU_MEMBER_ISO.has(iso) ? euLaws.length : 0),
            }))
            .sort((a, b) => b.effective - a.effective)
            .slice(0, 10)
            .map(({ country, laws, effective }) => {
              const max = Math.max(...[...lawsByISO.entries()].map(([iso, l]) =>
                l.length + (EU_MEMBER_ISO.has(iso) ? euLaws.length : 0)
              ), 1)
              return (
                <div key={country} className="flex items-center gap-3 text-xs">
                  <span className="text-odl-muted w-36 flex-shrink-0 text-right">{country}</span>
                  <div className="flex-1 h-2 bg-odl-surface rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{ width: `${(effective / max) * 100}%`, backgroundColor: getColor(effective) }}
                    />
                  </div>
                  <span className="text-odl-subtle font-mono w-6 text-right">{laws.length}</span>
                </div>
              )
            })}
        </div>
      </section>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white border border-odl-border rounded shadow-lg px-3 py-2.5 text-xs pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14, maxWidth: 240 }}
        >
          <div className="font-semibold text-odl-text mb-1.5">{tooltip.country || 'Unknown'}</div>
          {tooltip.euLaws.length > 0 && tooltip.nationalLaws.length === 0 ? (
            <>
              <div className="text-odl-muted mb-1">{tooltip.euLaws.length} EU instrument{tooltip.euLaws.length !== 1 ? 's' : ''} · no national laws</div>
              {tooltip.euLaws.slice(0, 4).map(l => (
                <div key={l.id} className="text-odl-subtle leading-snug truncate">— {l.short_name}</div>
              ))}
            </>
          ) : (
            <>
              <div className="text-odl-muted mb-1">
                {tooltip.nationalLaws.length} national
                {tooltip.euLaws.length > 0 ? ` + ${tooltip.euLaws.length} EU` : ''}
                {' '}instrument{(tooltip.nationalLaws.length + tooltip.euLaws.length) !== 1 ? 's' : ''}
              </div>
              {tooltip.nationalLaws.slice(0, 3).map(l => (
                <div key={l.id} className="text-odl-subtle leading-snug truncate">— {l.short_name}</div>
              ))}
              {tooltip.nationalLaws.length > 3 && (
                <div className="text-odl-subtle mt-0.5">+{tooltip.nationalLaws.length - 3} more national</div>
              )}
              {tooltip.euLaws.length > 0 && (
                <div className="text-odl-subtle mt-1 pt-1 border-t border-odl-border/50">
                  + {tooltip.euLaws.length} EU instrument{tooltip.euLaws.length !== 1 ? 's' : ''}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
