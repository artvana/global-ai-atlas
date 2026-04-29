# Database Schema Reference

This document defines every controlled-vocabulary field in `data/regulations.json`. When adding or editing records, consult these definitions to ensure consistent classification.

---

## `legal_family`

Describes the regulatory lineage or doctrinal tradition the instrument belongs to. Classifiers should ask: *What framework or jurisprudential tradition does this law derive from or implement?*

| Value | Definition | Canonical Examples |
|---|---|---|
| `eu_risk_based` | GDPR or EU AI Act risk-based framework, or laws directly modelled on them | GDPR, EU AI Act, Brazil LGPD, India DPDPA, Kenya DPA, Nigeria NDPA |
| `eu_ai_act_implementation` | EU member state law that designates national authorities or fills gaps left by EU AI Act — EU law directly applicable | Denmark AI Supplementary Act, Finland AI Supervision Act, Hungary AI Implementation Act |
| `us_consumer_protection` | US law (federal or state) framed as consumer protection — rooted in FTC Act tradition, comprehensive privacy, or algorithmic accountability for consumers | CCPA/CPRA, Colorado AI Act, Texas TRAIGA, Washington AI Act, BIPA, California SB 53 |
| `china_state_sovereignty` | Chinese law primarily serving state sovereignty, social stability, or content control objectives alongside data/AI governance | China GenAI Measures, China PIPL, China Algorithm Recommendations, China Cybersecurity Law |
| `uk_non_model` | UK post-Brexit law that consciously departs from EU model, favouring sector-led and principles-based governance | UK Online Safety Act, UK AI Opportunities Plan instruments, UK DUAA |
| `hybrid` | Combines two distinct doctrinal traditions in roughly equal measure | Vietnam AI Law (EU risk + China sovereignty), Brazil AI Act (EU risk + US liability) |
| `performer_rights` | Laws protecting individuals' voice, likeness, or identity from AI-generated reproduction — derived from right of publicity and entertainment law traditions | Tennessee ELVIS Act, Washington Forged Digital Likeness, California AB 1836, Mexico AI Voice/Image Rights |
| `synthetic_media_governance` | Laws specifically targeting deepfakes, NCII (non-consensual intimate imagery), or AI-generated election content — criminal or civil prohibition/disclosure approach | TAKE IT DOWN Act, DEFIANCE Act, state election deepfake laws, Colombia AI Criminal Aggravator |
| `national_ai_strategy` | AI promotion, governance framework, or strategy legislation — sets direction and institutions without imposing product-level obligations | Japan AI Promotion Act, Taiwan AI Basic Act, Peru AI Governance Law, US National AI Initiative Act |

**Decision rule**: If a law could fit two families, assign the family that best describes its *primary mechanism* — risk assessment → `eu_risk_based`; consumer complaint pathway → `us_consumer_protection`; identity consent → `performer_rights`.

---

## `scope`

Describes how broadly the instrument covers AI or data governance activity.

| Value | Definition | Examples |
|---|---|---|
| `comprehensive` | Covers all or most sectors and AI use cases; not limited to a single industry, technology type, or harm category | EU AI Act, GDPR, Colorado AI Act, Nigeria NDPA |
| `sector_specific` | Applies only to a defined industry or use case (healthcare, finance, employment, elections) | Mauritius Financial Services AI Rules, NYC LL144 (employment), Indiana HB 1271 (health insurance) |
| `single_issue` | Addresses exactly one legal mechanism, right, or obligation | Illinois BIPA (biometric consent), TAKE IT DOWN Act (platform takedown duty), EU designation acts (naming a supervisory authority) |

**Decision rule**: A law with 3+ distinct provision types across multiple sectors = `comprehensive`. A law with multiple provisions but all within one industry = `sector_specific`. A law that does one thing (requires disclosure, creates one right, designates one authority) = `single_issue`.

---

## `primary_category`

The single most important substantive topic the law addresses. Used for primary display and filtering. A law may have multiple `categories` but only one `primary_category`.

| Value | Label | Definition |
|---|---|---|
| `transparency_disclosure` | Transparency & Disclosure | Requires entities to reveal AI use, provide explanations, or disclose model information |
| `algorithmic_accountability` | Algorithmic Accountability | Imposes obligations to assess, audit, or document algorithmic systems' impacts |
| `individual_rights` | Individual Rights | Creates rights for individuals: access, correction, opt-out, human review, erasure |
| `enforcement_architecture` | Enforcement Architecture | Primarily structures the regulatory system, agency powers, penalties, and procedures |
| `scope_structure` | Scope & Structure | Framework laws that define what AI is, create institutions, or set national strategy |
| `sector_specific_healthcare` | Healthcare | AI governance in clinical, pharmaceutical, or public health contexts |
| `sector_specific_employment` | Employment | AI in hiring, performance management, or workplace decisions |
| `sector_specific_financial` | Financial | AI in credit, insurance, trading, or financial services |
| `sector_specific_education` | Education | AI in academic assessment, tutoring, or educational administration |
| `content_synthetic_media` | Synthetic Media | Deepfakes, AI-generated images/audio/video, NCII, and election content |
| `biometric_identity` | Biometric & Identity | Facial recognition, fingerprints, voice prints, and biometric data collection |
| `national_security` | National Security | AI in defence, intelligence, or critical national infrastructure protection |
| `infrastructure_energy` | Infrastructure & Energy | AI in power grids, transportation, water systems, and critical infrastructure |
| `intellectual_property` | Intellectual Property | Copyright, patent, or licensing implications of AI-generated or AI-trained content |

---

## `who_regulated`

The regulated entities — those on whom the law places primary obligations.

| Value | Definition | Notes |
|---|---|---|
| `developers` | Entities that build, train, or design AI systems | Called "providers" in EU AI Act; "developers" in US law |
| `deployers` | Entities that put AI systems into use in a specific context | Also covers operators, employers using AI tools, businesses deploying third-party AI |
| `government_only` | Law applies only to government agencies or public bodies | Excludes private sector |
| `platforms` | Online intermediaries with hosting or distribution obligations | Social media, app stores, search engines |

**Decision rule**: Use an array. Most comprehensive laws apply to both `developers` and `deployers`. Do not use `both` (invalid). Do not use terms like `employers`, `providers`, or `importers` — map to the closest valid value. EU "importers and distributors" → `deployers`.

---

## `preemption_status`

The risk that a higher-level law displaces this instrument. Primarily designed for US federal/state dynamics, extended for EU and sub-national contexts.

| Value | Definition | Use when |
|---|---|---|
| `preempts_lower` | This instrument expressly or impliedly displaces lower-level rules in the same space | Federal law with preemption clause; EU Regulation in areas of EU exclusive competence |
| `targeted_for_preemption` | A higher-level instrument is explicitly designed to preempt this law | State law where a federal bill specifically targets it |
| `at_risk` | A credible higher-level preemption risk exists though not yet enacted | State law in an area where federal preemption is actively debated |
| `low_risk` | No significant preemption risk at present | Most national laws; US state laws in areas without active federal activity |
| `n/a` | Preemption concept does not apply (international treaties, single-tier jurisdictions without sub-national variation) | CoE Convention, Singapore national laws, unitary state laws |
| `complementary_to_eu` | EU member state law that supplements the EU AI Act/GDPR within the discretion granted — EU Regulation is directly applicable; member state law fills gaps only | Italy AI Law, Denmark AI Supplementary Act, Hungary AI Implementation |
| `subnatl_no_preemption` | Sub-national law (Canadian province, Swiss canton) operating without active higher-level preemption risk | Quebec Law 25, Ontario EDSTA |

---

## `instrument_type`

The legal form of the instrument.

| Value | Definition |
|---|---|
| `statute` | Act of parliament or legislature |
| `regulation` | Subordinate/delegated legislation (SI, CFR rule, EU implementing/delegated regulation) |
| `executive_order` | Presidential or gubernatorial executive directive |
| `agency_rule` | Rule issued by an independent regulatory agency (FTC, SEC, FDA) |
| `treaty` | International treaty or convention requiring domestic ratification |
| `policy_framework` | Official government policy document with significant legal or operational effect (but not legally binding in itself) |
| `voluntary_framework` | Industry-adopted or intergovernmental soft-law instrument |
| `guidance` | Regulatory guidance, advisory, or circular issued by an authority |

---

## `status`

The current legal status of the instrument.

| Value | Meaning |
|---|---|
| `in_force` | Enacted and currently operative |
| `enacted_not_yet_effective` | Passed into law but not yet operative (transition period running) |
| `enacted_not_effective` | Passed but effectiveness contingent on further action (commencement order, regulatory trigger) |
| `under_revision` | Currently operative but subject to an active formal revision process |
| `superseded` | Replaced by a newer instrument |
| `failed` | Proposed, debated, then withdrawn, rejected, or lapsed |

---

## Issue Position Values

Each `issue_positions` field uses a controlled vocabulary. `not_addressed` is a valid position meaning the law explicitly or implicitly does not cover this issue — it must not be confused with a `null` value (which means the field has not yet been coded).

Full vocabulary for each issue dimension is defined in `src/types/index.ts`.
