---
id: eu-eu-gpai-guidelines-2025
title: "European Commission Guidelines on the Scope of Obligations for Providers of General-Purpose AI Models (Article 53 EU AI Act)"
short_name: "EU GPAI Guidelines (Art. 53)"
jurisdiction: European Union
enacted_date: 2025-07-18
status: in_force
official_url: https://digital-strategy.ec.europa.eu/en/policies/ai-act
fetched_date: 2026-05-01
---

# European Commission Guidelines on the Scope of Obligations for Providers of General-Purpose AI Models (Article 53 EU AI Act)

**Commission Guidelines under Article 53 EU AI Act**
*European Union — 18 July 2025 (in force 2 August 2025)*

---

## Overview

The European Commission published these binding interpretive Guidelines on 18 July 2025 pursuant to Article 96 of the EU AI Act, providing authoritative guidance on the scope of obligations imposed on providers of General-Purpose AI (GPAI) models under Article 53 of the Regulation. The Guidelines entered into force on 2 August 2025, coinciding with the date the GPAI chapter of the EU AI Act became applicable.

These Guidelines are legally distinct from the non-binding GPAI Code of Practice developed under Article 56 through a multi-stakeholder process. Commission Guidelines under the EU AI Act constitute hard law — they carry interpretive authority and, while not directly creating new obligations beyond the Regulation itself, they bind national competent authorities and the EU AI Office in their enforcement activities.

The Guidelines address a key threshold question: which AI models qualify as "general-purpose AI models" within the meaning of Article 3(63) of the EU AI Act, and consequently which providers fall within the scope of the obligations in Articles 53–55. They also clarify the specific documentation, transparency, and compliance obligations attaching to GPAI model providers, and the conditions under which a GPAI model is classified as posing systemic risk.

## Key Provisions

### Scope of GPAI Model Definition

The Guidelines interpret Article 3(63) to define a general-purpose AI model as a model trained on a broad range of data using self-supervision at scale, capable of competently performing a wide range of distinct tasks. The Guidelines clarify that:

- Models fine-tuned from a GPAI base model retain GPAI model status unless the fine-tuning fundamentally restricts the model to a single specific task
- Models distributed exclusively via API for a narrow set of predefined downstream tasks may fall outside scope if the provider contractually restricts use and technically prevents general-purpose deployment
- Open-weight models released publicly qualify as GPAI models regardless of whether the provider charges for access
- Multimodal models (text, image, audio, video) are covered provided they meet the general-purpose criterion

### Compliance Obligations for GPAI Model Providers (Article 53)

Providers of GPAI models that are not designated as systemic-risk models must comply with the following obligations:

**Technical Documentation.** Providers must prepare and maintain technical documentation in accordance with Annex XI of the EU AI Act, covering: model architecture; training methodology; training data sources and composition summary; evaluation benchmarks and results; known limitations and foreseeable misuse cases; energy consumption during training.

**Training Data Summary.** Providers must make publicly available a sufficiently detailed summary of the content used to train the GPAI model, enabling downstream providers and deployers to understand data composition without requiring disclosure of proprietary datasets. The Guidelines specify that the summary must identify major data categories, geographical coverage, temporal range, and language coverage.

**Copyright Compliance Policy.** Providers must implement, maintain, and publish a policy on compliance with EU copyright law, particularly as it relates to text and data mining exceptions under Directive (EU) 2019/790. This policy must include a process for rights-holders to opt out of having their content used for training purposes.

**Technical Documentation for Downstream Providers.** Providers placing GPAI models on the market must provide downstream providers with sufficient technical information to enable them to comply with their own obligations under the EU AI Act, including information on the model's capabilities and limitations.

**Incident Reporting.** Providers must report serious incidents to the EU AI Office within defined timeframes where those incidents relate to their GPAI model's operation across the EU.

### Systemic Risk Designation and Enhanced Obligations (Articles 51 and 55)

The Guidelines clarify the criteria for systemic risk designation. A GPAI model is presumed to have systemic risk if it was trained using a total computing power exceeding **10²⁵ floating point operations (FLOPs)**. This threshold is rebuttable: the Commission may designate lower-threshold models as systemic risk on the basis of other criteria including number of users, cross-sectoral reach, or capability evaluations.

The training compute threshold for general GPAI model classification (triggering Article 53 obligations) is **10²³ FLOPs**, as established in the EU AI Act's Annex XIII and confirmed by these Guidelines.

Providers of systemic-risk GPAI models face additional obligations under Article 55:

- Conduct model evaluation including adversarial testing (red-teaming) in accordance with standardized protocols
- Assess and mitigate systemic risks including cascading effects, large-scale manipulation, and critical infrastructure disruption
- Implement cybersecurity measures commensurate with the systemic risk profile
- Report serious incidents to the EU AI Office within 24 hours of becoming aware
- Ensure energy-efficiency reporting and mitigation plans

### Relationship to the GPAI Code of Practice

The Guidelines clarify the legal relationship between binding Article 53 obligations and the voluntary GPAI Code of Practice developed under Article 56. Compliance with the Code of Practice creates a rebuttable presumption of conformity with Articles 53 and 55 obligations. Providers that do not adhere to the Code must demonstrate compliance through alternative means.

### Enforcement

Enforcement of GPAI obligations rests primarily with the EU AI Office, with national competent authorities retaining jurisdiction over downstream deployers. The maximum penalty for GPAI providers failing to comply with Article 53 or 55 obligations is up to **3% of worldwide annual turnover** (or €15 million for Article 53 obligations; €15 million / 3% for Article 55 systemic-risk obligations). Providing false or misleading information to the EU AI Office may attract a penalty of up to 1% of worldwide annual turnover.
