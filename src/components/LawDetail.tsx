import * as Dialog from '@radix-ui/react-dialog'
import type { AILaw } from '../types'
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS, LEGAL_FAMILY_LABELS } from '../data/regulations'
import { regulations } from '../data/regulations'
import enforcementData from '../../data/enforcement.json'

const ISSUE_LABELS: Record<string, string> = {
  impact_assessment:          'Impact Assessment',
  prohibited_categories:      'Prohibited Uses',
  human_review_rights:        'Human Review Rights',
  private_right_of_action:    'Private Right of Action',
  synthetic_media:            'Synthetic Media',
  biometric_data:             'Biometric Data',
  training_data_transparency: 'Training Data Transparency',
  content_labeling:           'Content Labeling',
  anti_discrimination:        'Anti-Discrimination',
  risk_classification:        'Risk Classification',
  enforcement_model:          'Enforcement Model',
}

function fmtPosition(pos: string): string {
  return pos.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface Props {
  law: AILaw
  onClose: () => void
}

const PROVISION_LABELS: Record<string, string> = {
  ai_interaction_disclosure:    'AI Interaction Disclosure',
  training_data_disclosure:     'Training Data Disclosure',
  content_labelling:            'Content Labelling',
  risk_classification_system:   'Risk Classification System',
  impact_assessment_required:   'Impact Assessment Required',
  anti_discrimination:          'Anti-Discrimination',
  human_review_right:           'Human Review Right',
  opt_out_right:                'Opt-Out Right',
  biometric_protection:         'Biometric Protection',
  voice_likeness_protection:    'Voice/Likeness Protection',
  data_rights_re_training:      'Data Rights re: Training',
  private_right_of_action:      'Private Right of Action',
  safe_harbor:                  'Safe Harbor',
  prohibited_categories:        'Prohibited Categories',
  agentic_ai_addressed:         'Agentic AI',
  algorithmic_pricing_addressed:'Algorithmic Pricing',
  training_data_compensation:   'Training Data Compensation',
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold text-odl-subtle tracking-[0.08em] uppercase mb-3 pb-1.5 border-b border-odl-border">
      {children}
    </h3>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2 border-b border-odl-border/50 last:border-0 text-xs">
      <span className="text-odl-subtle pt-px">{label}</span>
      <span className="text-odl-text">{children}</span>
    </div>
  )
}

function Check({ val }: { val: boolean }) {
  return val
    ? <span className="text-odl-green text-xs font-semibold">Yes</span>
    : <span className="text-odl-subtle text-xs">—</span>
}

export function LawDetail({ law, onClose }: Props) {
  const relatedLaws = (ids: string[]) =>
    ids.map(id => regulations.find(r => r.id === id)).filter(Boolean) as AILaw[]

  const isStale = law.last_verified
    ? new Date(law.last_verified).getTime() < Date.now() - 180 * 24 * 60 * 60 * 1000
    : false

  const enforcementActions = (enforcementData as {
    id: string; law_id: string; date: string; enforcement_body: string
    respondent: string; violation_type: string; amount_usd: number | null
    outcome: string; summary: string; source_url: string
  }[]).filter(e => e.law_id === law.id)

  const issueEntries = law.issue_positions
    ? (Object.entries(law.issue_positions)
        .filter(([, v]) => v !== null && (v as { position: string }).position !== 'not_addressed') as [string, { position: string; detail: string }][])
    : []

  return (
    <Dialog.Root open onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/25" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-screen w-full max-w-[680px] bg-white shadow-2xl border-l border-odl-border overflow-y-auto focus:outline-none"
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-odl-border px-8 py-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${STATUS_COLORS[law.status] ?? ''}`}>
                  {STATUS_LABELS[law.status]}
                </span>
                {!law.ai_specific && (
                  <span className="badge text-odl-subtle bg-odl-surface border-odl-border">General Law</span>
                )}
                {!law.instrument_binding && (
                  <span className="badge text-odl-subtle bg-odl-surface border-odl-border">Soft Law</span>
                )}
              </div>
              <Dialog.Title className="text-base font-semibold text-odl-text leading-snug">
                {law.short_name}
              </Dialog.Title>
              {law.full_name !== law.short_name && (
                <Dialog.Description className="text-xs text-odl-subtle mt-1 leading-snug">
                  {law.full_name}
                </Dialog.Description>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex-shrink-0 text-odl-subtle hover:text-odl-text transition-colors mt-0.5 w-6 h-6 flex items-center justify-center rounded hover:bg-odl-surface"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="px-8 py-6 space-y-8">
            {/* Stale notice */}
            {isStale && (
              <div className="text-xs text-amber-700 border border-amber-200 bg-amber-50 rounded px-3 py-2 flex gap-2">
                <span className="font-semibold flex-shrink-0">Note:</span>
                <span>Last verified {law.last_verified}. Verify with the official source before relying on this record.</span>
              </div>
            )}

            {/* Summary */}
            <div>
              <p className="text-sm text-odl-muted leading-relaxed">{law.summary}</p>
              {law.notable && (
                <p className="text-xs text-odl-muted italic mt-3 pt-3 border-t border-odl-border">{law.notable}</p>
              )}
            </div>

            {/* Core record */}
            <section>
              <SectionHeading>Record</SectionHeading>
              <Row label="Country">{law.country}</Row>
              {law.jurisdiction !== law.country && (
                <Row label={law.country === 'Global / Regional' ? 'Body' : 'Sub-Jurisdiction'}>
                  {law.jurisdiction}
                </Row>
              )}
              <Row label="Region">{law.region}</Row>
              {law.bill_number && <Row label="Bill No.">{law.bill_number}</Row>}
              <Row label="Instrument">{law.instrument_type.replace(/_/g, ' ')}</Row>
              <Row label="Enacted"><span className="font-mono">{law.enacted_date}</span></Row>
              <Row label="Effective"><span className="font-mono">{law.effective_date ?? '—'}</span></Row>
              {law.operative_dates && (
                <Row label="Operative Dates">{law.operative_dates}</Row>
              )}
              <Row label="Scope">{law.scope.replace(/_/g, ' ')}</Row>
              <Row label="Applies to">{law.who_regulated.join(', ')}</Row>
              <Row label="Legislative Genealogy">{LEGAL_FAMILY_LABELS[law.legal_family] ?? law.legal_family}</Row>
              <Row label="Legal Citation"><span className="font-mono text-odl-muted">{law.legal_citation || '—'}</span></Row>
            </section>

            {/* Implementation phases */}
            {law.implementation_phases && law.implementation_phases.length > 0 && (
              <section>
                <SectionHeading>Implementation Timeline</SectionHeading>
                <ol className="space-y-2">
                  {law.implementation_phases.map((phase, i) => (
                    <li key={i} className="flex gap-4 text-xs">
                      <span className="text-odl-subtle font-mono flex-shrink-0 w-20">{phase.date}</span>
                      <span className="text-odl-muted">{phase.description}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Enforcement */}
            <section>
              <SectionHeading>Enforcement</SectionHeading>
              <Row label="Body">{law.enforcement_body.join(', ')}</Row>
              <Row label="Max Penalty">{law.max_penalty ?? '—'}</Row>
              {law.max_penalty_usd_approx != null && (
                <Row label="Approx. USD">${law.max_penalty_usd_approx.toLocaleString()}</Row>
              )}
              <Row label="Preemption">{law.preemption_status.replace(/_/g, ' ')}</Row>
              {law.preemption_notes && <Row label="Preemption Notes">{law.preemption_notes}</Row>}
            </section>

            {/* Categories */}
            <section>
              <SectionHeading>Categories</SectionHeading>
              <div className="flex flex-wrap gap-1.5">
                {law.categories.map(cat => (
                  <span key={cat} className={`badge ${
                    cat === law.primary_category
                      ? 'text-odl-accent bg-odl-accent-bg border-odl-accent/30'
                      : 'text-odl-subtle bg-odl-surface border-odl-border'
                  }`}>
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                ))}
              </div>
            </section>

            {/* Provisions */}
            <section>
              <SectionHeading>Provisions</SectionHeading>
              <div className="grid grid-cols-2 gap-x-6">
                {Object.entries(PROVISION_LABELS).map(([key, label]) => {
                  const val = (law.provisions as unknown as Record<string, unknown>)[key]
                  if (typeof val !== 'boolean') return null
                  return (
                    <div key={key} className="flex items-center justify-between py-1.5 border-b border-odl-border/40 last:border-0 text-xs">
                      <span className="text-odl-subtle">{label}</span>
                      <Check val={val} />
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Issue Positions */}
            {issueEntries.length > 0 && (
              <section>
                <SectionHeading>Issue Positions</SectionHeading>
                <div className="space-y-3">
                  {issueEntries.map(([key, entry]) => (
                    <div key={key} className="border border-odl-border rounded p-3">
                      <div className="flex items-start gap-3 justify-between mb-1">
                        <span className="text-xs font-medium text-odl-text">{ISSUE_LABELS[key] ?? key}</span>
                        <span className="text-[10px] font-mono text-odl-accent bg-odl-accent-bg border border-odl-accent/20 px-1.5 py-0.5 rounded flex-shrink-0">
                          {fmtPosition(entry.position)}
                        </span>
                      </div>
                      <p className="text-xs text-odl-muted leading-relaxed">{entry.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Topics & Obligations */}
            {(law.topics?.length > 0 || law.key_obligations?.length > 0 || law.sector_tags?.length > 0 || law.technology_tags?.length > 0) && (
              <section>
                <SectionHeading>Metadata</SectionHeading>
                {law.topics?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] text-odl-subtle uppercase tracking-wide mb-1.5">Topics</div>
                    <div className="flex flex-wrap gap-1">
                      {law.topics.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded border border-odl-border bg-odl-surface text-odl-muted">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {law.sector_tags?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] text-odl-subtle uppercase tracking-wide mb-1.5">Sectors</div>
                    <div className="flex flex-wrap gap-1">
                      {law.sector_tags.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">{t.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
                {law.technology_tags?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] text-odl-subtle uppercase tracking-wide mb-1.5">Technologies</div>
                    <div className="flex flex-wrap gap-1">
                      {law.technology_tags.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded border border-odl-border bg-odl-surface text-odl-muted">{t.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
                {law.key_obligations?.length > 0 && (
                  <div>
                    <div className="text-[11px] text-odl-subtle uppercase tracking-wide mb-1.5">Key Obligations</div>
                    <ul className="space-y-1.5">
                      {law.key_obligations.map((ob, i) => (
                        <li key={i} className="flex gap-2 text-xs text-odl-muted">
                          <span className="text-odl-border flex-shrink-0 mt-1">—</span>
                          <span className="leading-relaxed">{ob}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Legislative Lineage */}
            {(law.inspired_by.length > 0 || law.influenced.length > 0) && (
              <section>
                <SectionHeading>Legislative Lineage</SectionHeading>
                {law.inspired_by.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] text-odl-subtle uppercase tracking-wide mb-1.5">Derived from</div>
                    <div className="flex flex-wrap gap-1.5">
                      {relatedLaws(law.inspired_by).map(r => (
                        <span key={r.id} className="text-xs px-2 py-1 border border-odl-border bg-odl-surface text-odl-muted rounded">{r.short_name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {law.influenced.length > 0 && (
                  <div>
                    <div className="text-[11px] text-odl-subtle uppercase tracking-wide mb-1.5">Influenced</div>
                    <div className="flex flex-wrap gap-1.5">
                      {relatedLaws(law.influenced).map(r => (
                        <span key={r.id} className="text-xs px-2 py-1 border border-odl-border bg-odl-surface text-odl-muted rounded">{r.short_name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Legislative Background */}
            {law.background && (
              <section>
                <SectionHeading>Legislative Background</SectionHeading>
                <Row label="Origin">{law.background.origin}</Row>
                {law.background.legislative_notes && (
                  <Row label="History">{law.background.legislative_notes}</Row>
                )}
                {law.background.key_drafters?.length > 0 && (
                  <Row label="Key Drafters">{law.background.key_drafters.join(', ')}</Row>
                )}
                {law.background.key_advocates?.length > 0 && (
                  <Row label="Advocates">{law.background.key_advocates.join(', ')}</Row>
                )}
                {law.background.key_opposition?.length > 0 && (
                  <Row label="Opposition">{law.background.key_opposition.join(', ')}</Row>
                )}
                {law.background.unique_features?.length > 0 && (
                  <div className="pt-3 mt-1">
                    <div className="text-[11px] text-odl-subtle uppercase tracking-wide mb-2">Distinctive Features</div>
                    <ul className="space-y-1.5">
                      {law.background.unique_features.map((f, i) => (
                        <li key={i} className="flex gap-2 text-xs text-odl-muted">
                          <span className="text-odl-border flex-shrink-0 mt-1">—</span>
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Enforcement Actions */}
            {enforcementActions.length > 0 && (
              <section>
                <SectionHeading>Enforcement Actions ({enforcementActions.length})</SectionHeading>
                <div className="space-y-3">
                  {enforcementActions.map(action => (
                    <div key={action.id} className="border border-odl-border rounded p-3">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-odl-text">{action.respondent}</span>
                        <span className="text-[10px] text-odl-subtle font-mono flex-shrink-0">{action.date.slice(0, 7)}</span>
                      </div>
                      {action.amount_usd != null && (
                        <div className="text-xs font-medium text-odl-text mb-1.5">
                          ${action.amount_usd >= 1_000_000
                            ? `${(action.amount_usd / 1_000_000).toFixed(0)}M`
                            : `${(action.amount_usd / 1_000).toFixed(0)}K`}
                          {' '}· {action.outcome}
                        </div>
                      )}
                      {action.amount_usd == null && (
                        <div className="text-xs text-odl-muted mb-1.5">{action.outcome}</div>
                      )}
                      <p className="text-xs text-odl-subtle leading-relaxed">{action.summary}</p>
                      <a href={action.source_url} target="_blank" rel="noreferrer" className="odl-link text-[10px] mt-1.5 block">
                        Source →
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sources */}
            <section>
              <SectionHeading>Sources</SectionHeading>
              <Row label="Official Text">
                <a href={law.official_text_url} target="_blank" rel="noreferrer" className="odl-link break-all">{law.official_text_url}</a>
              </Row>
              {law.summary_url && (
                <Row label="Summary">
                  <a href={law.summary_url} target="_blank" rel="noreferrer" className="odl-link break-all">{law.summary_url}</a>
                </Row>
              )}
              <Row label="Last Verified"><span className="font-mono">{law.last_verified}</span></Row>
              <Row label="Record ID"><span className="font-mono text-odl-subtle">{law.id}</span></Row>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
