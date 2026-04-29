export type Category =
  | 'data_protection'
  | 'algorithmic_systems'
  | 'synthetic_media'
  | 'biometric_identity'
  | 'ip_creative_rights'
  | 'national_security'
  | 'sector_healthcare'
  | 'sector_employment'
  | 'sector_financial'
  | 'sector_education'
  | 'general_ai_governance'

export type JurisdictionType = 'supranational' | 'national' | 'subnational' | 'agency'

export type InstrumentType = 'statute' | 'regulation' | 'executive_order' | 'agency_rule' | 'treaty' | 'policy_framework' | 'voluntary_framework' | 'guidance'

export type Status = 'in_force' | 'enacted_not_yet_effective' | 'superseded' | 'failed'

export type WhoRegulated = 'developers' | 'deployers' | 'government_only' | 'platforms'

export type Scope = 'comprehensive' | 'sector_specific' | 'single_issue'

export type LegalFamily =
  | 'eu_risk_based'
  | 'us_consumer_protection'
  | 'china_state_sovereignty'
  | 'uk_non_model'
  | 'hybrid'
  | 'standalone'

export type PreemptionStatus =
  | 'preempts_lower'
  | 'targeted_for_preemption'
  | 'at_risk'
  | 'low_risk'
  | 'n/a'
  | 'complementary_to_eu'    // EU member state law that supplements but cannot contradict EU AI Act
  | 'subnatl_no_preemption'  // Sub-national law (province/canton) with no higher preemption risk

export type AntiDiscriminationStandard = 'impact_based' | 'intent_based' | 'defers_to_existing' | null

// Vector-search metadata types
export type SectorTag =
  | 'healthcare'
  | 'employment'
  | 'financial_services'
  | 'education'
  | 'housing'
  | 'transportation'
  | 'entertainment_media'
  | 'government_services'
  | 'law_enforcement'
  | 'critical_infrastructure'
  | 'consumer'
  | 'telecommunications'
  | 'all_sectors'

export type TechnologyTag =
  | 'generative_ai'
  | 'large_language_models'
  | 'facial_recognition'
  | 'biometric_data'
  | 'recommendation_systems'
  | 'decision_support_systems'
  | 'autonomous_systems'
  | 'deepfake'
  | 'voice_cloning'
  | 'image_synthesis'
  | 'predictive_analytics'
  | 'computer_vision'
  | 'natural_language_processing'
  | 'content_moderation_ai'
  | 'agentic_systems'

// ─── Issue-position vocabulary ────────────────────────────────────────────────
// Each value is a standardized position on the debate spectrum for that issue.
// Used in issue_positions to map every law to the article's section-5 analysis.

export type ImpactAssessmentPos =
  | 'mandatory_third_party_audit'       // EU AI Act high-risk (Annex VI conformity)
  | 'mandatory_internal_pre_deployment' // Colorado, Washington, Brazil
  | 'mandatory_sector_audit'            // NYC LL144, NY RAISE (annual bias audit)
  | 'mandatory_safety_evaluation'       // CA SB 53, Japan AI Promotion
  | 'mandatory_security_assessment'     // China GenAI
  | 'mandatory_privacy_impact'          // GDPR, India DPDPA Rules
  | 'not_addressed'

export type ProhibitedCategoriesPos =
  | 'comprehensive_multi_domain'        // EU AI Act (8+ prohibited uses)
  | 'state_political_control'           // China (content harmful to party/state)
  | 'targeted_harm_prevention'          // TX TRAIGA (CSAM, self-harm AI, social credit)
  | 'healthcare_professional_ai'        // TN SB 1580, ME LD 2082 (unlicensed AI therapy)
  | 'election_deepfakes'                // MI, MN, FL, IN, NC, NV (election content)
  | 'algorithmic_price_coordination'    // CA AB 325, MD HB 895
  | 'automated_claims_denial'           // Indiana HB 1271 (health insurance)
  | 'not_addressed'

export type HumanReviewPos =
  | 'right_to_refuse_all_automated'     // GDPR Art. 22 — no purely automated legal decisions
  | 'right_to_request_review'           // Colorado, Washington, EU AI Act (high-risk), CoE
  | 'mandatory_human_in_loop'           // Indiana HB 1271, China Algorithm Rec, China PIPL
  | 'notice_and_explanation_only'       // Australia, CCPA
  | 'not_addressed'

export type PRAPos =
  | 'statutory_damages_class_actions'   // BIPA ($1,000–$5,000/violation, no actual harm req.)
  | 'actual_damages_injunction'         // DEFIANCE, TN ELVIS, GA SB 396, CA AB 1836
  | 'limited_statutory_damages'         // Oregon ($1,000), CA SB 243 ($1,000)
  | 'product_liability_pathway'         // EU PLD (AI as defective product)
  | 'not_addressed'

export type SyntheticMediaPos =
  | 'criminal_civil_platform_takedown'  // TAKE IT DOWN Act (all three mechanisms)
  | 'criminal_prohibition'              // Michigan, Nevada (felony election deepfakes)
  | 'civil_remedy_ncii'                 // DEFIANCE Act
  | 'performer_consent_civil'           // TN ELVIS, GA SB 396, CA AB 1836/2602
  | 'election_disclosure_required'      // FL, MN, IN, NC (label only)
  | 'watermark_technical_requirement'   // EU AI Act GPAI, CA SB 942, WA HB 1170
  | 'platform_content_duty'             // UK Online Safety Act
  | 'consent_required_general'          // China Deep Synthesis (all individuals)
  | 'not_addressed'

export type BiometricDataPos =
  | 'consent_destruction_statutory_damages' // BIPA (4 elements: consent + policy + no sale + destruction)
  | 'public_surveillance_prohibition'       // EU AI Act (bans real-time biometric in public)
  | 'special_category_explicit_consent'     // GDPR, India DPDPA, China PIPL
  | 'opt_out_available'                     // CCPA/CPRA
  | 'not_addressed'

export type TrainingDataPos =
  | 'public_website_disclosure'         // CA AB 2013 (publicly accessible summary)
  | 'regulator_technical_documentation' // EU AI Act (filed with authority, not public)
  | 'copyright_provenance_required'     // CT PA 25-113 (includes copyright sources)
  | 'security_content_compliance'       // China GenAI (content compliance focus)
  | 'data_broker_notification'          // CA SB 361 (consumer opt-out when data used for training)
  | 'quality_standards_only'            // China training data standards
  | 'not_addressed'

export type ContentLabelingPos =
  | 'watermark_plus_detection_tool'     // CA SB 942, WA HB 1170 (invisible watermark + free detector)
  | 'mandatory_all_ai_content'          // China AI Labelling GB45438, China GenAI
  | 'mandatory_political_only'          // FL, MN, IN, NC, NV (election content only)
  | 'chatbot_identity_on_request'       // Utah, Oregon, Idaho, Nebraska, Maine, NH
  | 'gpai_synthetic_content_flag'       // EU AI Act GPAI (watermark AI-generated content)
  | 'not_addressed'

export type AntiDiscriminationPos =
  | 'strict_liability_disparate_impact' // IL HB 3773 (strict liability for discriminatory outcomes)
  | 'reasonable_care_disparate_impact'  // Colorado, Washington (impact-based, reasonable care)
  | 'fundamental_rights_assessment'     // EU AI Act (FRIA required for certain high-risk)
  | 'audit_transparency_only'           // NYC LL144 (publish bias audit, no substantive standard)
  | 'defers_to_existing_civil_rights'   // Most US laws
  | 'not_addressed'

export type RiskClassificationPos =
  | 'tiered_comprehensive_binding'      // EU AI Act (4 tiers, all AI, binding)
  | 'binary_high_risk_binding'          // Colorado, Washington, Brazil, Vietnam
  | 'security_tier_binding'             // China GenAI (security assessment tiers)
  | 'frontier_compute_threshold'        // CA SB 53 (training compute as risk proxy)
  | 'tiered_national_strategy'          // South Korea, Japan, CoE (policy, not product regulation)
  | 'not_addressed'

export type EnforcementModelPos =
  | 'large_regulator_plus_civil_liability' // EU AI Act + PLD companion (€35M + civil courts)
  | 'criminal_plus_civil_plus_class'       // BIPA (criminal + statutory damages + class actions)
  | 'moderate_ag_civil_penalties'          // Colorado ($20K), Texas ($200K), Washington
  | 'small_penalty_disclosure_only'        // Chatbot laws ($1–10K/violation)
  | 'criminal_misdemeanor_plus_civil'      // TN ELVIS, state deepfake laws
  | 'treaty_domestic_implementation'       // CoE Convention
  | 'not_addressed'

export interface IssueEntry<T extends string = string> {
  position: T
  detail: string   // 1-sentence description of how this specific law addresses the issue
}

export interface IssuePositions {
  impact_assessment:         IssueEntry<ImpactAssessmentPos>         | null
  prohibited_categories:     IssueEntry<ProhibitedCategoriesPos>     | null
  human_review_rights:       IssueEntry<HumanReviewPos>              | null
  private_right_of_action:   IssueEntry<PRAPos>                      | null
  synthetic_media:           IssueEntry<SyntheticMediaPos>           | null
  biometric_data:            IssueEntry<BiometricDataPos>            | null
  training_data_transparency: IssueEntry<TrainingDataPos>            | null
  content_labeling:          IssueEntry<ContentLabelingPos>          | null
  anti_discrimination:       IssueEntry<AntiDiscriminationPos>       | null
  risk_classification:       IssueEntry<RiskClassificationPos>       | null
  enforcement_model:         IssueEntry<EnforcementModelPos>         | null
}

// ─── Legislative background ───────────────────────────────────────────────────

export interface LawBackground {
  origin: string              // What triggered this law — incident, advocacy, international influence
  key_drafters: string[]      // Named legislators, aides, law firms, think tanks
  key_advocates: string[]     // Industry groups, civil society, unions that pushed for it
  key_opposition: string[]    // Who opposed it and why
  unique_features: string[]   // What this law does that no other law does
  legislative_notes: string   // Brief history of the bill's path
}

export interface Provisions {
  ai_interaction_disclosure: boolean
  training_data_disclosure: boolean
  content_labelling: boolean
  risk_classification_system: boolean
  impact_assessment_required: boolean
  anti_discrimination: boolean
  anti_discrimination_standard: AntiDiscriminationStandard
  human_review_right: boolean
  opt_out_right: boolean
  biometric_protection: boolean
  voice_likeness_protection: boolean
  data_rights_re_training: boolean
  private_right_of_action: boolean
  safe_harbor: boolean
  prohibited_categories: boolean
  agentic_ai_addressed: boolean
  algorithmic_pricing_addressed: boolean
  training_data_compensation: boolean
}

export interface AILaw {
  id: string
  country: string
  jurisdiction: string
  jurisdiction_type: JurisdictionType
  region: string
  short_name: string
  full_name: string
  instrument_type: InstrumentType
  bill_number: string | null
  enacted_date: string
  effective_date: string | null
  operative_dates: string | null
  status: Status
  superseded_by: string | null
  categories: Category[]
  primary_category: Category
  scope: Scope
  who_regulated: WhoRegulated[]
  provisions: Provisions
  enforcement_body: string[]
  max_penalty: string | null
  max_penalty_usd_approx: number | null
  preemption_status: PreemptionStatus
  preemption_notes: string | null
  legal_family: LegalFamily
  inspired_by: string[]
  influenced: string[]
  official_text_url: string
  summary_url: string | null
  last_verified: string
  summary: string
  notable: string | null
  // Vector-search metadata
  legal_citation: string
  topics: string[]
  sector_tags: SectorTag[]
  technology_tags: TechnologyTag[]
  key_obligations: string[]
  // Whether this is purpose-built AI governance (true) vs. general law applicable to AI (false)
  ai_specific: boolean
  // Whether this instrument creates legally binding obligations (false = soft law / voluntary)
  instrument_binding: boolean
  // Full text storage
  text_path?: string          // relative path to data/texts/{id}.md
  // Phased implementation timeline (for laws with staggered obligation dates)
  implementation_phases?: { date: string; description: string }[]
  // Issue-level structured analysis
  issue_positions?: IssuePositions
  background?: LawBackground
}

export interface GuidanceDoc {
  id: string
  jurisdiction: string
  jurisdiction_type: JurisdictionType
  region: string
  short_name: string
  full_name: string
  instrument_type: string
  published_date: string
  issuing_body: string
  official_url: string
  summary: string
  notable: string | null
}

export interface ProvisionStat {
  count: number
  percentage: number
  jurisdictions: string[]
}

export interface LegalFamilyStat {
  characteristic_provisions: string[]
  avg_penalty_usd: number
  has_private_right_of_action_pct: number
}

export interface AnalysisOutput {
  corpus_stats: {
    total_laws: number
    by_jurisdiction_type: Record<string, number>
    by_year_enacted: Record<string, number>
    by_primary_category: Record<string, number>
    by_legal_family: Record<string, number>
  }
  provision_prevalence: Record<string, ProvisionStat>
  enforcement_stats: {
    has_private_right_of_action: { count: number; percentage: number; jurisdictions: string[] }
    has_safe_harbor: { count: number; percentage: number; jurisdictions: string[] }
    median_max_penalty_usd: number
    highest_penalties: { jurisdiction: string; amount: string }[]
  }
  convergence: {
    high_convergence: string[]
    medium_convergence: string[]
    low_convergence: string[]
    absent: string[]
  }
  legal_family_comparison: Record<string, LegalFamilyStat>
}

export interface ValidationError {
  id: string
  field: string
  issue: string
  severity: 'error' | 'warning'
}

export type SortField = 'enacted_date' | 'effective_date' | 'max_penalty_usd_approx' | 'jurisdiction' | 'short_name'
export type SortDir = 'asc' | 'desc'

// ─── Rules Matrix ────────────────────────────────────────────────────────────

export type RuleCategory =
  | 'biometric_data'
  | 'prohibited_uses'
  | 'impact_assessment'
  | 'human_review'
  | 'data_rights'
  | 'transparency'
  | 'synthetic_media'
  | 'enforcement'
  | 'risk_classification'
  | 'training_data'
  | 'foundation_models'
  | 'consent'
  | 'employment_ai'
  | 'general_governance'

export const RULE_CATEGORY_LABELS: Record<RuleCategory, string> = {
  biometric_data:    'Biometric Data',
  prohibited_uses:   'Prohibited Uses',
  impact_assessment: 'Impact Assessment',
  human_review:      'Human Review Rights',
  data_rights:       'Individual Data Rights',
  transparency:      'Transparency & Disclosure',
  synthetic_media:   'Synthetic Media',
  enforcement:       'Enforcement & Liability',
  risk_classification: 'Risk Classification',
  training_data:     'Training Data',
  foundation_models: 'Foundation Models / GPAI',
  consent:           'Consent',
  employment_ai:     'Employment AI',
  general_governance:'General AI Governance',
}

// How a specific law stands relative to the canonical rule.
// Ordered from strongest agreement to strongest opposition:
export type RuleRelationship =
  | 'origin'      // this law invented the rule — chronological first instance
  | 'identical'   // near-verbatim copy or copy-paste adoption; functionally indistinguishable
  | 'agrees'      // independently adopted the same substantive requirement
  | 'similar'     // same concept but with meaningful differences in standard, scope, or burden
  | 'opposed'     // explicitly contradicts or rejects the premise of the rule
  // 'absent' is the implicit default when a law does not appear in the instances array

export interface RuleLawInstance {
  law_id: string
  relationship: RuleRelationship
  citation: string       // e.g. "§ 15(b)" or "Art. 5(1)(h)"
  notes: string          // one sentence on what differs or why it matches
  variant_of?: string    // law_id whose version this one most closely follows;
                         // used to compute the de-facto consensus
  instrument_binding?: boolean       // whether this law creates legally binding obligations
  instrument_type?: InstrumentType   // statute | voluntary_framework | policy_framework | …
}

export interface RuleFirstInstance {
  law_id: string
  law_name: string   // full citation-friendly name
  citation: string
  date: string       // ISO date — chronological primacy
}

export interface Rule {
  rule_id: string                  // "{first_law_id}-{section_slug}"
  rule_text: string                // plain English premise, 1-3 sentences
  rule_text_technical: string      // precise legal framing
  category: RuleCategory
  tags: string[]
  first_instance: RuleFirstInstance
  instances: RuleLawInstance[]     // all non-absent laws; absent is the default
  // De-facto consensus: computed at runtime from adoption counts.
  // The law whose version is most widely adopted (most identical + agrees).
  // May differ from first_instance when a later law became the dominant template.
  consensus_law_id?: string        // override if known (e.g. set by extraction script)
}

export interface FilterState {
  search: string
  country: string
  state: string
  category: Category | ''
  status: Status | ''
  legal_family: LegalFamily | ''
  private_right_of_action: boolean
  ai_specific: boolean
  instrument_binding: boolean
  effective_date_from: string
  effective_date_to: string
}
