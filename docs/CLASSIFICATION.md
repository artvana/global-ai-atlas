# Classification Methodology

This document explains how each structured field in a law record should be assigned. For controlled-vocabulary fields (enum types), consult `docs/SCHEMA.md` for the full value list and decision rules. This document covers the analytical judgment required to apply those values consistently.

---

## Guiding Principle

**Classify what the law primarily does, not what it could do.** A law that contains one comprehensive anti-discrimination provision and five disclosure requirements is primarily a transparency/disclosure law, not an anti-discrimination law. Classification should reflect the dominant legal mechanism, not the widest possible reading.

When uncertain, ask: *What enforcement action would a regulator bring under this law?* The answer reveals the primary category.

---

## `primary_category` and `categories`

### Step 1: Identify all substantive provisions

List every distinct legal mechanism in the instrument:
- Disclosure requirements → `transparency_disclosure`
- Audit or impact assessment mandates → `algorithmic_accountability`
- Individual rights (opt-out, correction, review) → `individual_rights`
- Agency powers, penalties, civil procedure → `enforcement_architecture`
- Definitions, institutional setup, national strategy → `scope_structure`
- Healthcare context → `sector_specific_healthcare`
- Employment context → `sector_specific_employment`
- Financial services context → `sector_specific_financial`
- Education context → `sector_specific_education`
- Deepfakes, synthetic audio/video, NCII → `content_synthetic_media`
- Facial recognition, biometric data → `biometric_identity`
- Defence, intelligence, critical security → `national_security`
- Power grids, water systems, transport infrastructure → `infrastructure_energy`
- Copyright, training data licensing → `intellectual_property`

### Step 2: Assign `categories` (multi-value)

Include every category that has a **substantive, non-incidental** provision in the law. A definition section that mentions AI does not qualify a law for `scope_structure`; a dedicated section creating a national AI council does.

Practical thresholds:
- At least one full article, section, or clause devoted to the topic
- The provision creates an obligation, right, or power — not merely a finding or recital

### Step 3: Assign `primary_category` (single value)

Choose the category that:
1. Has the most enforcement consequences (penalty triggers, cause of action)
2. Is mentioned most prominently in the law's title, purpose clause, or legislative history
3. Is the mechanism most likely to generate the first legal challenge or enforcement action

**Tie-break**: if two categories are equally primary, choose the one higher in this priority list: `algorithmic_accountability` > `individual_rights` > `transparency_disclosure` > `enforcement_architecture` > `scope_structure` > sector-specific > `content_synthetic_media` > `biometric_identity`.

---

## `legal_family`

`legal_family` describes doctrinal lineage — the jurisprudential tradition a law derives from or implements. It is **not** the same as jurisdiction or region.

### Common errors to avoid

| Wrong | Correct | Reason |
|---|---|---|
| EU member state law tagged `eu_risk_based` | `eu_ai_act_implementation` | EU AI Act directly applies; member state law fills gaps only |
| US deepfake law tagged `us_consumer_protection` | `synthetic_media_governance` | Performer consent and criminal prohibition laws have a distinct lineage from consumer protection |
| National strategy document tagged `hybrid` | `national_ai_strategy` | Strategy laws without product obligations are not hybrid; they are their own family |
| ELVIS Act lineage laws tagged `us_consumer_protection` | `performer_rights` | Right-of-publicity lineage, not consumer protection |

### Determining lineage

Ask:
1. Did the drafters cite a specific model? (Legislative history, committee reports, hearings)
2. Does the mechanism match a known family? (Risk-tier classification → EU; AG enforcement + consumer complaint → US; content control mandate → China)
3. If two families are equally present in roughly equal measure → `hybrid`

---

## `scope`

`scope` describes breadth of coverage, not sophistication.

| Classification | Test |
|---|---|
| `comprehensive` | Covers 3+ distinct sectors OR covers all AI without sector restriction |
| `sector_specific` | Covers one industry or one defined use-case environment |
| `single_issue` | Does exactly one thing (creates one right, requires one disclosure, designates one authority) |

**Common error**: laws with long text but narrow effect. A 200-page statute that solely governs biometric data collection is `single_issue` in scope. Length ≠ scope breadth.

---

## `who_regulated`

`who_regulated` identifies the regulated entity — the party who bears primary legal obligation.

- **developers**: those who build, train, or fine-tune the model or system
- **deployers**: those who put a pre-built system into operational use (employers, healthcare providers, lenders)
- **platforms**: online intermediaries whose obligation is content hosting/removal, not model development
- **government_only**: law applies only to public-sector bodies; explicitly excludes private sector

Most modern AI laws regulate both `developers` AND `deployers`. EU AI Act: `["developers", "deployers"]`. BIPA: `["deployers"]` (no training obligation; consent required at collection time). NYC LL144: `["deployers"]` (employers using AEDT).

Do not use `"both"` — always enumerate the array.

---

## `instrument_binding`

A binary judgment on whether the instrument creates legally enforceable obligations.

- `true`: statute, regulation, executive order, agency rule, or treaty with domestic ratification effect
- `false`: voluntary framework, policy guidance, recommendations, soft-law codes of practice, national AI strategy documents without mandatory implementation mechanism

When in doubt: *Could a regulator bring an enforcement action for non-compliance without additional legislation?* Yes → `true`. No → `false`.

---

## `ai_specific`

Distinguishes purpose-built AI governance from general law that happens to apply to AI.

- `true`: the law's title, scope clause, or primary operative provisions specifically address artificial intelligence, machine learning, automated decision-making, or algorithmic systems
- `false`: general law (data protection, consumer protection, civil rights) that applies to AI as a consequence of its broader scope

Examples:
- GDPR: `false` (general data protection law; AI provisions arise from broad scope)
- EU AI Act: `true` (purpose-built AI product regulation)
- Illinois BIPA: `false` (biometric data law predates modern AI; AI is one application)
- Colorado AI Act: `true` (statute specifically governs high-risk AI systems)

---

## `preemption_status`

This field requires legal judgment about the federal-state (or EU-member state, or international) relationship.

### US context

| Status | When to assign |
|---|---|
| `preempts_lower` | Federal statute with express or field-preemption clause; assign to the federal instrument |
| `targeted_for_preemption` | A federal bill has been introduced that explicitly names this state law as a target |
| `at_risk` | Active federal AI legislation is advancing; state law is in the same subject-matter space |
| `low_risk` | No current federal activity; state law is in an area where federal preemption is historically absent |

### EU context

| Status | When to assign |
|---|---|
| `preempts_lower` | EU Regulation (directly applicable); assign to the EU instrument |
| `complementary_to_eu` | EU member state law operating within EU AI Act discretion (national authority designation, procedural rules) |
| `n/a` | National law in a unitary state; international treaty |

### Sub-national context

| Status | When to assign |
|---|---|
| `subnatl_no_preemption` | Canadian province, Swiss canton — federal law exists but does not preempt this instrument |
| `at_risk` / `low_risk` | As above, per degree of federal activity |

---

## `provisions` — boolean fields

Each boolean provision answers: *Does this instrument create this type of legal obligation, right, or mechanism — not merely mention it?*

A recital, finding, or whereas clause does not qualify. A definition section does not qualify. Only operative provisions with enforcement consequences count.

### Specific guidance

| Provision | Set `true` when |
|---|---|
| `ai_interaction_disclosure` | Law requires entities to inform individuals they are interacting with an AI (chatbot disclosure rules, AI-generated content labelling affecting end users) |
| `training_data_disclosure` | Law requires disclosure of what data was used to train a model (to regulator, public, or affected persons) |
| `content_labelling` | Law requires AI-generated content to carry a visible or machine-readable mark |
| `risk_classification_system` | Law creates tiers or categories of AI risk with different obligations per tier |
| `impact_assessment_required` | Law mandates a formal assessment (internal or third-party) before deployment |
| `anti_discrimination` | Law prohibits discriminatory outcomes or processes in AI decisions |
| `human_review_right` | Law grants individuals a right to request human review of an automated decision |
| `opt_out_right` | Law grants individuals a right to opt out of automated profiling or decision-making |
| `biometric_protection` | Law requires consent, policy, or retention limits for biometric data (facial, voice, fingerprint) |
| `voice_likeness_protection` | Law requires consent before AI replication of an individual's voice or likeness |
| `data_rights_re_training` | Law gives individuals rights over use of their data for AI training (opt-out, notification, compensation) |
| `private_right_of_action` | Law explicitly grants individuals a civil cause of action (not merely AG enforcement) |
| `safe_harbor` | Law provides an affirmative defence or immunity for good-faith compliance |
| `prohibited_categories` | Law flatly prohibits specific AI uses (real-time biometric surveillance, social scoring, manipulative AI) |
| `agentic_ai_addressed` | Law has operative provisions specifically addressing autonomous AI agents, multi-agent systems, or AI with tool-use/autonomous action capabilities |
| `algorithmic_pricing_addressed` | Law addresses AI-enabled price coordination or algorithmic rent/pricing collusion |
| `training_data_compensation` | Law creates a right to compensation for creators/individuals whose data is used for AI training |

---

## `issue_positions`

Issue positions require cross-referencing the controlled vocabulary in `src/types/index.ts`. Each position represents a specific stance on a policy debate.

Rules:
- Use `not_addressed` when the law is silent on the issue — never `null` for a classified record
- `null` means "not yet coded" — all classified records should have non-null entries
- Use the most specific position available; `not_addressed` is a last resort, not a default

When a law partially addresses an issue (e.g., mentions biometric data only in the context of one sector), still code the position but reflect the limitation in the `detail` field.

---

## `last_verified`

Set to the ISO date (YYYY-MM-DD) when you personally verified:
- The status field still reflects current law
- The effective_date is correct or updated with any delays
- The official_text_url still resolves
- No significant amendment has occurred since the prior verification

Records verified more than 6 months ago display a stale warning in the UI. Update `last_verified` after each review, even if no data changed.
