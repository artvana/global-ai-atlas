# EU AI Act
**ID**: `eu-eu-aiact-2024`  
**TIER 1 — Comprehensive & Binding (full review required)**  

## ⚠ Automated Flags — Resolve Before Marking Reviewed
- 🟡 **WARNING [L6]**: comprehensive law but only 3 rules extracted

## Database Claims

> Verify each field. The most consequential are marked ★.

| Field | Current Value |
|-------|--------------|
| ★ Status | `in_force` |
| ★ Instrument Binding | `True` |
| ★ Instrument Type | `regulation` |
| ★ Scope | `comprehensive` |
| Enacted Date | `2024-06-13` |
| Effective Date | `2024-08-01` |
| Jurisdiction | `European Union` |
| Legal Family | `eu_risk_based` |
| Primary Category | `algorithmic_systems` |
| Who Regulated | `developers, deployers` |
| ★ Max Penalty | €35M or 7% global annual turnover (prohibited AI); €15M or 3% (high-risk non-compliance); €7.5M or 1% (misleading info) |
| Max Penalty (USD approx) | 38500000 |
| ★ Private Right of Action | `False` |
| Risk Classification System | `True` |
| Prohibited Categories | `True` |
| Impact Assessment Required | `True` |
| Human Review Right | `True` |
| AI Interaction Disclosure | `True` |
| Biometric Protection | `True` |
| Instrument Binding (again) | `True` |
| AI Specific | `True` |
| Rules Extracted | 3 |
| Official URL | https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng |
| Last Verified | 2026-04-24 |

## Summary (verify for accuracy)

The world's first binding horizontal AI regulation establishes a risk-based framework: prohibited AI practices (social scoring, mass biometric surveillance, manipulation) banned from Feb 2025; high-risk AI (healthcare, employment, critical infrastructure) requires conformity assessment, registration, and human oversight from Aug 2025; general-purpose AI models face transparency obligations; full enforcement August 2026.

## Key Obligations (verify completeness and accuracy)

- Prohibited practices: real-time biometric surveillance in public, social scoring, manipulation of subliminal vulnerabilities
- High-risk AI systems must undergo conformity assessment before market placement
- General-purpose AI models (GPAI) with significant systemic risk require safety evaluations
- Providers must maintain technical documentation and register in EU AI database
- Deployers must conduct fundamental rights impact assessment for certain high-risk uses
- EU AI Office to supervise GPAI models; national supervisory authorities for other systems

## Law Text (excerpt)

```
Official Journal  
of the European Union

EN

L series

* * *

  

2024/1689

12.7.2024

REGULATION (EU) 2024/1689 OF THE EUROPEAN PARLIAMENT AND OF THE COUNCIL

of 13 June 2024

laying down harmonised rules on artificial intelligence and amending Regulations (EC) No 300/2008, (EU) No 167/2013, (EU) No 168/2013, (EU) 2018/858, (EU) 2018/1139 and (EU) 2019/2144 and Directives 2014/90/EU, (EU) 2016/797 and (EU) 2020/1828 (Artificial Intelligence Act)

(Text with EEA relevance)

THE EUROPEAN PARLIAMENT AND THE COUNCIL OF THE EUROPEAN UNION,

Having regard to the Treaty on the Functioning of the European Union, and in particular Articles 16 and 114 thereof,

Having regard to the proposal from the European Commission,

After transmission of the draft legislative act to the national parliaments,

Having regard to the opinion of the European Economic and Social Committee ,

Having regard to the opinion of the European Central Bank ,

Having regard to the opinion of the Committee of the Regions ,

Acting in accordance with the ordinary legislative procedure ,

Whereas:

 

(1)

The purpose of this Regulation is to improve the functioning of the internal market by laying down a uniform lega
…
```

---

## Corrections

> Fill in only fields that need to change. Leave blank if the current value is correct.
> After completing all corrections, set `review_complete: true`.

```yaml
id: eu-eu-aiact-2024
review_complete: true
reviewed_by: art@opendatalabs.xyz
notes: All obligations treated as in force given phased implementation is underway. Rules extracted from recitals only — operative articles not captured by extractor due to document length (604KB). Rule count understates coverage significantly.

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
summary: The world's first binding horizontal AI regulation establishing a risk-based framework for AI systems placed on the EU market or affecting EU persons. Prohibited AI practices include social scoring, real-time biometric surveillance in public spaces, subliminal manipulation, and predictive policing based solely on profiling. High-risk AI systems (healthcare, employment, education, critical infrastructure, law enforcement) require conformity assessment, technical documentation, registration in the EU AI database, and human oversight before market placement. General-purpose AI models face transparency obligations; those with systemic risk (exceeding 10^25 FLOPs training compute) must conduct safety evaluations and report incidents. Providers must implement post-market monitoring. Deployers in the public sector must conduct a fundamental rights impact assessment. Chatbots must identify as AI and synthetic media must be labelled. The EU AI Office supervises GPAI models; national market surveillance authorities enforce for other systems.
key_obligations_add:
  - Providers of limited-risk AI systems (chatbots, emotion recognition, deepfakes) must ensure transparency disclosures to affected persons (Article 50)
  - Providers of high-risk AI must implement post-market monitoring systems and report serious incidents to national authorities (Article 72)
key_obligations_remove:
notable: Phased implementation — prohibited practices from Feb 2025, GPAI obligations from Aug 2025, high-risk AI obligations from Aug 2026. Rule extraction captured recitals only; operative articles not extracted due to 604KB document length.
```