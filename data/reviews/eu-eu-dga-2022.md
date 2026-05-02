# EU Data Governance Act (DGA)
**ID**: `eu-eu-dga-2022`  
**TIER 2 — Sector-Specific & Binding (key fields review)**  

## ✅ Automated Checks — No Flags

## Database Claims

> Verify each field. The most consequential are marked ★.

| Field | Current Value |
|-------|--------------|
| ★ Status | `in_force` |
| ★ Instrument Binding | `True` |
| ★ Instrument Type | `regulation` |
| ★ Scope | `sector_specific` |
| Enacted Date | `2022-05-30` |
| Effective Date | `2022-06-23` |
| Jurisdiction | `EU` |
| Legal Family | `eu_risk_based` |
| Primary Category | `data_protection` |
| Who Regulated | `public_sector_bodies, data_intermediation_service_providers, data_altruism_organisations, data_holders, data_users` |
| ★ Max Penalty | Penalties determined by Member States; DGA requires effective, proportionate, and dissuasive penalties but does not specify a maximum |
| Max Penalty (USD approx) | None |
| ★ Private Right of Action | `False` |
| Risk Classification System | `False` |
| Prohibited Categories | `False` |
| Impact Assessment Required | `False` |
| Human Review Right | `False` |
| AI Interaction Disclosure | `False` |
| Biometric Protection | `False` |
| Instrument Binding (again) | `True` |
| AI Specific | `False` |
| Rules Extracted | 13 |
| Official URL | https://eur-lex.europa.eu/eli/reg/2022/868/oj |
| Last Verified | 2026-05-02 |

## Summary (verify for accuracy)

The Data Governance Act establishes EU-wide frameworks for re-using protected public sector data, operating trusted data intermediation services, and collecting voluntary data donations for general-interest purposes including AI research. Its data altruism mechanism enables individuals to lawfully contribute personal data (including health records and genomic data) to AI training datasets for public benefit, while the intermediation services framework prohibits data brokers from using pooled data to train their own AI models. The DGA provides the governance infrastructure underlying Common European Data Spaces in health, mobility, agriculture, and other sectors.

## Key Obligations (verify completeness and accuracy)

- Art. 5: Public sector bodies must allow re-use of protected data via secure processing environments; conditions must be non-discriminatory and cost-based
- Art. 11: Data intermediation service providers must notify national competent authority before operating
- Art. 12: Data intermediaries must not use shared data for their own commercial purposes, including AI model training
- Art. 12: Data intermediaries must be structurally separated from other commercial activities
- Art. 20: Recognised data altruism organisations must be non-profit, publish annual activity reports, and use data only for declared general-interest purposes
- Art. 25: Commission must adopt standardised European Data Altruism Consent Form compatible with GDPR
- Art. 17: Data altruism organisations must register on national registers to obtain recognised status

## Law Text (excerpt)

```
# Regulation (EU) 2022/868 — Data Governance Act (DGA)

**European Parliament and Council of the European Union**
*Published in the Official Journal on 3 June 2022. In force from 23 June 2022. Applicable from 24 September 2023.*

---

## Overview

The Data Governance Act (DGA) is a foundational EU regulation establishing mechanisms and structures to facilitate the voluntary sharing of data — including public sector data, personal data, and non-personal data — across the EU internal market. It is a key pillar of the European Data Strategy and complements the EU Data Act (Regulation (EU) 2023/2854), which governs mandatory B2B and B2G data sharing.

The DGA does not directly regulate AI systems but is highly relevant to AI development and deployment because it governs the conditions under which large-scale datasets — including datasets used to train AI models — can be made available, pooled, and shared. In particular, the DGA's data altruism framework creates a pathway for individuals and organisations to voluntarily contribute data (including personal data) for purposes including scientific research and the development of AI systems for the common good.

The DGA pursues four main ob
…
```

---

## Corrections

> Fill in only fields that need to change. Leave blank if the current value is correct.
> After completing all corrections, set `review_complete: true`.

```yaml
id: eu-eu-dga-2022
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