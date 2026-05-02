# ADGM Data Protection Regulations 2021
**ID**: `ae-adgm-dpr-2021`  
**TIER 1 — Comprehensive & Binding (full review required)**  

## ⚠ Automated Flags — Resolve Before Marking Reviewed
- 🟡 **WARNING [L6]**: comprehensive law but only 3 rules extracted

## Database Claims

> Verify each field. The most consequential are marked ★.

| Field | Current Value |
|-------|--------------|
| ★ Status | `in_force` |
| ★ Instrument Binding | `True` |
| ★ Instrument Type | `statute` |
| ★ Scope | `comprehensive` |
| Enacted Date | `2021-02-14` |
| Effective Date | `2021-02-14` |
| Jurisdiction | `ADGM (Abu Dhabi Global Market)` |
| Legal Family | `eu_risk_based` |
| Primary Category | `data_protection` |
| Who Regulated | `all` |
| ★ Max Penalty | Up to USD 28 million for serious violations |
| Max Penalty (USD approx) | 28000000 |
| ★ Private Right of Action | `True` |
| Risk Classification System | `False` |
| Prohibited Categories | `False` |
| Impact Assessment Required | `True` |
| Human Review Right | `True` |
| AI Interaction Disclosure | `False` |
| Biometric Protection | `True` |
| Instrument Binding (again) | `True` |
| AI Specific | `False` |
| Rules Extracted | 3 |
| Official URL | https://en.adgm.thomsonreuters.com/rulebooks/adgm-data-protection-regulations-2021 |
| Last Verified | 2026-05-01 |

## Summary (verify for accuracy)

The ADGM Data Protection Regulations 2021 establish a comprehensive GDPR-aligned data protection framework for entities operating in Abu Dhabi's international financial free zone. Key provisions include lawful basis requirements, full data subject rights (access, rectification, erasure, portability, objection), automated decision-making rights requiring human oversight for significant AI-driven decisions, mandatory DPIAs for high-risk AI processing, 72-hour breach notification, cross-border transfer mechanisms, and DPO requirements. Penalties reach USD 28 million for serious violations.

## Key Obligations (verify completeness and accuracy)

- Process personal data only on a valid lawful basis (consent, contract, legal obligation, vital interests, public task, legitimate interests)
- Conduct DPIAs before commencing high-risk processing including systematic automated profiling
- Provide individuals with rights to contest automated decisions and obtain human intervention
- Notify ADGM Registration Authority of data breaches within 72 hours
- Appoint a Data Protection Officer for large-scale or sensitive data processing activities

## Law Text (excerpt)

```
# Abu Dhabi Global Market Data Protection Regulations 2021
**ADGM Board of Directors Resolution No. 3 of 2021**
*Abu Dhabi Global Market (ADGM) Financial Free Zone — In force February 14, 2021*

---

## Overview / Background

The Abu Dhabi Global Market (ADGM) Data Protection Regulations 2021 (DPR 2021) establish a comprehensive GDPR-aligned data protection framework applicable within the ADGM financial free zone on Al Maryah Island in Abu Dhabi. The DPR 2021 replaced the ADGM Data Protection Regulations 2015, introducing a substantially modernized regime reflecting developments in EU data protection law, the emergence of artificial intelligence in financial services, and lessons from the 2015 regulations.

ADGM is an international financial centre and free zone operating under its own legal system (English common law), regulatory framework, and court system, distinct from both the UAE federal legal system and the Dubai International Financial Centre (DIFC). The DPR 2021 is administered by the ADGM Registration Authority, in coordination with the ADGM Financial Services Regulatory Authority (FSRA) for financial sector entities.

The DPR 2021 applies to all personal data processing 
…
```

---

## Corrections

> Fill in only fields that need to change. Leave blank if the current value is correct.
> After completing all corrections, set `review_complete: true`.

```yaml
id: ae-adgm-dpr-2021
review_complete: true
reviewed_by: art@opendatalabs.xyz
notes: Instrument type confirmed as statute — Board of Directors resolution has statutory force in ADGM's constitutional structure. Effective date corrected to Feb 2022 (existing entities transition deadline, the operative compliance date). Enacted date confirmed as Feb 14 (publication date). Max penalty confirmed at USD 28M cap.

# Core legal determinations (★ fields above)
status:
instrument_binding:
instrument_type:
scope:
enacted_date:
effective_date: 2022-02-14
legal_family:
max_penalty:
max_penalty_usd_approx:

# Provisions (true/false)
private_right_of_action:
risk_classification_system:
prohibited_categories:
impact_assessment_required:
human_review_right:
ai_interaction_disclosure:

# Free-text corrections
summary: "The ADGM Data Protection Regulations 2021 establish a comprehensive GDPR-aligned data protection framework for entities operating in Abu Dhabi's international financial free zone. Enacted by the ADGM Board of Directors on 14 February 2021, with staggered compliance deadlines: new entities by August 2021, existing entities by February 2022. Key provisions include lawful basis requirements, full data subject rights (access, rectification, erasure, portability, objection), rights to contest automated decisions and obtain human intervention, mandatory DPIAs for high-risk processing, 72-hour breach notification, cross-border transfer mechanisms, and DPO requirements. Administrative penalties capped at USD 28 million; data subjects may also claim compensation for material and non-material damage through the ADGM Courts."
key_obligations_add:
  - Register with the ADGM Office of Data Protection and pay required annual fees
  - Implement data protection by design and by default in all processing systems
key_obligations_remove:
notable: Staggered implementation — new entities from August 2021, existing entities from February 2022. Data subjects have a civil right of action in ADGM Courts for material and non-material damages, mirroring GDPR Article 82.
```