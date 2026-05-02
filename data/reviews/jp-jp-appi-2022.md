# Japan APPI (2022 Amendments)
**ID**: `jp-jp-appi-2022`  
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
| Enacted Date | `2021-06-04` |
| Effective Date | `2022-04-01` |
| Jurisdiction | `Japan` |
| Legal Family | `standalone` |
| Primary Category | `data_protection` |
| Who Regulated | `developers, deployers, all` |
| ★ Max Penalty | Up to JPY 100 million (~$650K) for organizations; JPY 1 million for individuals |
| Max Penalty (USD approx) | 650000 |
| ★ Private Right of Action | `False` |
| Risk Classification System | `False` |
| Prohibited Categories | `False` |
| Impact Assessment Required | `False` |
| Human Review Right | `False` |
| AI Interaction Disclosure | `False` |
| Biometric Protection | `True` |
| Instrument Binding (again) | `True` |
| AI Specific | `False` |
| Rules Extracted | 3 |
| Official URL | https://www.ppc.go.jp/en/legal/law/ |
| Last Verified | 2026-05-01 |

## Summary (verify for accuracy)

Japan's 2022 APPI amendments represent the most expansive revision of Japan's primary personal data protection law, introducing mandatory breach notification, a strengthened opt-out regime for third-party data transfers requiring PPC registration, new data subject rights including cessation of third-party provision, tightened cross-border transfer rules with explicit consent requirements, and a new pseudonymously processed information category enabling AI development use cases. Corporate penalties increased tenfold to JPY 100 million.

## Key Obligations (verify completeness and accuracy)

- Mandatory breach notification to PPC and affected individuals for qualifying incidents
- Registration with PPC required before third-party data transfers via opt-out mechanism
- Explicit consent required for cross-border transfers with full destination country disclosure
- Data subjects may request cessation of third-party provision of their personal data
- Sensitive personal information (health, criminal, biometric) requires explicit consent for any transfer

## Law Text (excerpt)

```
# Act on the Protection of Personal Information (APPI) — 2022 Amendments
**Act No. 57 of 2003, as amended by Act No. 77 of 2021, in force June 2022**
*Japan — In force April 1, 2022*

---

## Overview / Background

Japan's Act on the Protection of Personal Information (APPI) is the country's primary statute governing the collection, use, and management of personal data by private-sector businesses. Originally enacted in 2003, the APPI underwent a significant set of amendments in 2020 (effective October 2021) and again via Act No. 77 of 2021 (enacted June 4, 2021, fully effective April 1, 2022). The 2022 amendments represent the most expansive expansion of individual rights and organizational obligations in the APPI's history, aligning Japan more closely with international data protection norms while retaining distinctly Japanese features such as the concept of "anonymously processed information" and "pseudonymously processed information."

The Personal Information Protection Commission (PPC) is the independent government authority responsible for administering and enforcing the APPI across the private sector. The PPC may issue guidelines, conduct investigations, require reports, ca
…
```

---

## Corrections

> Fill in only fields that need to change. Leave blank if the current value is correct.
> After completing all corrections, set `review_complete: true`.

```yaml
id: jp-jp-appi-2022
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