# China GenAI Training Data Standards
**ID**: `cn-cn-trainingdata-2025`  
**TIER 2 — Sector-Specific & Binding (key fields review)**  

## ⚠ Automated Flags — Resolve Before Marking Reviewed
- 🟡 **WARNING [L6]**: sector-specific binding law but 0 rules extracted

## Database Claims

> Verify each field. The most consequential are marked ★.

| Field | Current Value |
|-------|--------------|
| ★ Status | `in_force` |
| ★ Instrument Binding | `True` |
| ★ Instrument Type | `regulation` |
| ★ Scope | `sector_specific` |
| Enacted Date | `2025-04-01` |
| Effective Date | `2025-11-01` |
| Jurisdiction | `China` |
| Legal Family | `china_state_sovereignty` |
| Primary Category | `algorithmic_systems` |
| Who Regulated | `developers` |
| ★ Max Penalty | Enforcement through sectoral regulations |
| Max Penalty (USD approx) | 7000 |
| ★ Private Right of Action | `False` |
| Risk Classification System | `False` |
| Prohibited Categories | `False` |
| Impact Assessment Required | `False` |
| Human Review Right | `False` |
| AI Interaction Disclosure | `False` |
| Biometric Protection | `False` |
| Instrument Binding (again) | `True` |
| AI Specific | `True` |
| Rules Extracted | 0 |
| Official URL | https://cset.georgetown.edu/publication/china-gen-ai-training-data-safety-standard-draft/ |
| Last Verified | 2026-04-24 |

## Summary (verify for accuracy)

Three national standards establish security requirements for GenAI training data: annotation security procedures, pre-training and fine-tuning data requirements, and basic service security standards. Mandate minimal use of 'unsafe' data, require regular model testing, and specify data provenance documentation.

## Key Obligations (verify completeness and accuracy)

- Technical requirements for training data quality assessment
- Documentation requirements for dataset composition and annotation
- Data provenance and lineage tracking for training datasets
- Prohibited content categories in training data

## Law Text (excerpt)

```
### Translation

# National Standard of the People’s Republic of China: Cybersecurity Technology—Safety Specifications for Generative Artificial Intelligence Pre-Training and Fine-Tuning Data (Draft for Feedback)

## 中华人民共和国国家标准：网络安全技术 生成式人工智能预训练和优化训练数据安全规范（征求意见稿）

November 7, 2025

Read our translation of a Chinese draft national standard that proposes safety and security rules for the training and fine-tuning data used to develop generative AI models.



_The following Chinese draft national standard proposes safety and security rules for the training and fine-tuning data used to develop generative AI models. The standard defines safety and security as including not only protection of people’s physical safety and disinformation prevention, but also censorship of content that criticizes Communist Party rule or presents China in an unflattering light. China issued a finalized version of these standards in April 2025, but, as of the publication date of this translation, CSET has not observed a publicly available full-text copy of the final version._

_An archived version of the Chinese source text is available online at:_    

### National Standard of the People’s Republic of China

…
```

---

## Corrections

> Fill in only fields that need to change. Leave blank if the current value is correct.
> After completing all corrections, set `review_complete: true`.

```yaml
id: cn-cn-trainingdata-2025
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