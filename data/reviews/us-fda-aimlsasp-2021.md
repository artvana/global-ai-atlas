# FDA AI/ML Action Plan for Software as Medical Device
**ID**: `us-fda-aimlsasp-2021`  
**TIER 2 — Sector-Specific & Binding (key fields review)**  

## ⚠ Automated Flags — Resolve Before Marking Reviewed
- 🟡 **WARNING [L6]**: sector-specific binding law but 0 rules extracted

## Database Claims

> Verify each field. The most consequential are marked ★.

| Field | Current Value |
|-------|--------------|
| ★ Status | `in_force` |
| ★ Instrument Binding | `True` |
| ★ Instrument Type | `agency_rule` |
| ★ Scope | `sector_specific` |
| Enacted Date | `2021-01-12` |
| Effective Date | `2021-01-12` |
| Jurisdiction | `FDA` |
| Legal Family | `us_consumer_protection` |
| Primary Category | `sector_healthcare` |
| Who Regulated | `developers` |
| ★ Max Penalty | Per 21 U.S.C. 333 — up to $15,000 per violation for device violations |
| Max Penalty (USD approx) | 15000 |
| ★ Private Right of Action | `False` |
| Risk Classification System | `True` |
| Prohibited Categories | `False` |
| Impact Assessment Required | `True` |
| Human Review Right | `True` |
| AI Interaction Disclosure | `True` |
| Biometric Protection | `False` |
| Instrument Binding (again) | `True` |
| AI Specific | `True` |
| Rules Extracted | 0 |
| Official URL | https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device |
| Last Verified | 2026-04-29 |

## Summary (verify for accuracy)

The FDA's AI/ML Action Plan for Software as Medical Device (SaMD) establishes the agency's regulatory approach to AI-enabled medical devices. It outlines five action areas: tailored regulatory framework for AI/ML-based SaMD, good machine learning practice standards, patient-centred approaches, algorithm transparency, and real-world performance monitoring. The Action Plan underpins FDA's pre-submission program for AI medical devices and is being updated through the Predetermined Change Control Plan (PCCP) pathway.

## Key Obligations (verify completeness and accuracy)

- Premarket submission (510(k) or PMA) for AI/ML-based SaMD
- Good Machine Learning Practice standards compliance
- Algorithm transparency for clinical users
- Post-market performance monitoring and adverse event reporting
- Predetermined Change Control Plan for continuously learning algorithms

## Law Text (excerpt)

```
Artificial intelligence (AI) and machine learning (ML) technologies have the potential to transform health care by deriving new and important insights from the vast amount of data generated during the delivery of health care every day. Medical device manufacturers are using these technologies to innovate their products to better assist health care providers and improve patient care. The complex and dynamic processes involved in the development, deployment, use, and maintenance of AI technologies benefit from careful management throughout the medical product life cycle.

## On this page:

-   
-   
-   
-   
-   

* * *

## What Is Artificial Intelligence and Machine Learning?

**Artificial Intelligence** is a machine-based system that can, for a given set of human-defined objectives, make predictions, recommendations, or decisions influencing real or virtual environments. Artificial intelligence systems use machine- and human-based inputs to perceive real and virtual environments; abstract such perceptions into models through analysis in an automated manner; and use model inference to formulate options for information or action.

**Machine Learning** is a set of techniques that can
…
```

---

## Corrections

> Fill in only fields that need to change. Leave blank if the current value is correct.
> After completing all corrections, set `review_complete: true`.

```yaml
id: us-fda-aimlsasp-2021
review_complete: false
reviewed_by:
notes:

# Core legal determinations (★ fields above)
status:
instrument_binding:
instrument_type:
scope:
enacted_date:
effective_date:
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
summary:
key_obligations_add:    # items to add (one per line, prefix with -)
key_obligations_remove: # items to remove (one per line, prefix with -)
notable:
```