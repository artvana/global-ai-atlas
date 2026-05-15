import type { AILaw, GuidanceDoc } from '../types'
import regulationsData from '../../data/regulations.json'
import guidanceData from '../../data/guidance.json'

export const regulations: AILaw[] = regulationsData as AILaw[]
export const guidance: GuidanceDoc[] = guidanceData as GuidanceDoc[]

export const CATEGORY_LABELS: Record<string, string> = {
  data_protection:      'Data Protection',
  algorithmic_systems:  'Algorithmic Systems',
  synthetic_media:      'Synthetic Media',
  biometric_identity:   'Biometric & Identity',
  ip_creative_rights:   'IP & Creative Rights',
  national_security:    'National Security',
  sector_healthcare:    'Healthcare',
  sector_employment:    'Employment',
  sector_financial:     'Financial Services',
  sector_education:     'Education',
  general_ai_governance:'AI Governance & Strategy',
}

export const STATUS_LABELS: Record<string, string> = {
  in_force:                  'In Force',
  enacted_not_yet_effective: 'Not Yet Effective',
  superseded:                'Superseded',
  failed:                    'Failed',
  withdrawn:                 'Withdrawn',
  pending:                   'Pending',
  draft:                     'Draft',
  proposed:                  'Proposed',
  vetoed:                    'Vetoed',
}

export const JURISDICTION_TYPE_LABELS: Record<string, string> = {
  supranational: 'Supranational',
  national:      'National',
  subnational:   'Subnational',
  agency:        'Regulatory Agency',
}

export const LEGAL_FAMILY_LABELS: Record<string, string> = {
  eu_risk_based:           'EU Risk-Based',
  us_consumer_protection:  'US Consumer Protection',
  us_administrative:       'US Administrative / Agency',
  china_state_sovereignty: 'China State Sovereignty',
  chinese_regulatory:      'Chinese Regulatory',
  uk_non_model:            'UK Non-Model',
  common_law:              'Common Law',
  soft_law:                'Soft Law / Non-Binding',
  hybrid:                  'Hybrid',
  standalone:              'Standalone',
}

export const STATUS_COLORS: Record<string, string> = {
  in_force:                  'text-odl-green bg-odl-green-bg border-green-200',
  enacted_not_yet_effective: 'text-odl-yellow bg-odl-yellow-bg border-yellow-200',
  superseded:                'text-odl-muted bg-odl-surface border-odl-border',
  failed:                    'text-odl-muted bg-odl-surface border-odl-border',
  withdrawn:                 'text-odl-muted bg-odl-surface border-odl-border',
  pending:                   'text-odl-yellow bg-odl-yellow-bg border-yellow-200',
  draft:                     'text-odl-yellow bg-odl-yellow-bg border-yellow-200',
  proposed:                  'text-odl-accent bg-odl-accent-bg border-odl-accent/30',
  vetoed:                    'text-odl-muted bg-odl-surface border-odl-border',
}

export const INSTRUMENT_TYPE_LABELS: Record<string, string> = {
  statute:              'Statute / Act',
  regulation:           'Regulation',
  executive_order:      'Executive Order',
  agency_rule:          'Agency Rule',
  treaty:               'Treaty / Convention',
  policy_framework:     'Policy Framework',
  voluntary_framework:  'Voluntary Framework',
  guidance:             'Guidance / Guidelines',
}
