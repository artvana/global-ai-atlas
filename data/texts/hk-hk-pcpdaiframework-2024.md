---
id: hk-hk-pcpdaiframework-2024
title: "Artificial Intelligence: Model Personal Data Protection Framework (Hong Kong Privacy Commissioner for Personal Data)"
short_name: "Hong Kong PCPD AI Framework 2024"
jurisdiction: Hong Kong
enacted_date: 2024-06-01
status: in_force
official_url: https://www.pcpd.org.hk/
fetched_date: 2026-05-01
---

# Artificial Intelligence: Model Personal Data Protection Framework
**Privacy Commissioner for Personal Data (PCPD) — Hong Kong**
*Hong Kong SAR — Published June 2024*

---

## Overview / Background

The "Artificial Intelligence: Model Personal Data Protection Framework" was published by Hong Kong's Privacy Commissioner for Personal Data (PCPD) in June 2024. It is a comprehensive practical framework designed to help organizations operating in Hong Kong navigate the use of AI systems that involve the collection, processing, and use of personal data. The framework is non-binding but reflects the PCPD's interpretation of how the Personal Data (Privacy) Ordinance (PDPO, Cap. 486) applies to AI systems, and adherence to the framework is relevant to demonstrating compliance with the PDPO.

The framework addresses the full lifecycle of AI deployment — from procurement through development, deployment, and ongoing monitoring — and covers all major AI paradigms including generative AI, large language models, predictive analytics, computer vision, and automated decision systems. It is organized around four phases corresponding to the AI lifecycle, each with practical checklists and guidance for compliance officers and governance practitioners.

Hong Kong's PDPO does not contain AI-specific provisions. The PCPD framework bridges this gap by articulating how the PDPO's six Data Protection Principles (DPPs) apply to AI contexts, and by providing sector-neutral operational guidance. The framework draws on international standards including the OECD AI Principles, the ISO/IEC 42001 AI management system standard, and GDPR-adjacent frameworks, while remaining calibrated to Hong Kong's legal and commercial environment.

This framework is particularly significant for multinational organizations with operations in both Hong Kong and mainland China, as it establishes a clear set of expectations distinct from the PRC's Personal Information Protection Law (PIPL) and AI-specific regulations.

## Key Provisions / Chapters

### Phase 1 — AI Procurement (Due Diligence)
- Organizations must conduct due diligence on AI vendors before engaging their services, specifically assessing:
  - What personal data the AI vendor will access, process, or retain
  - Whether the vendor's data practices comply with the PDPO and the vendor's own privacy policies
  - The vendor's data breach response and notification procedures
  - Contractual protections (data processor agreements, sub-processor restrictions, audit rights)
- Organizations should assess the training data practices of AI model providers, including whether training data included personal data of Hong Kong residents and whether appropriate consents were obtained
- Procurement checklists and model contract clauses are provided as annexes

### Phase 2 — AI Development (Privacy by Design)
- Organizations developing AI systems in-house or customizing AI models must embed privacy by design principles from the earliest stages
- Data minimization: training datasets must be limited to personal data necessary for the stated purpose; data subjects' information should be anonymized or pseudonymized where possible
- Purpose limitation: personal data collected for other purposes should not be repurposed for AI training without fresh consent or a new lawful basis
- Data quality: training data must be accurate, representative, and free from systematic biases that could lead to discriminatory outputs
- Data retention: training data and model outputs containing personal data should be retained only for as long as necessary and securely deleted when no longer required
- Documentation: organizations must maintain records of training data sources, data processing decisions, and model architecture choices

### Phase 3 — AI Deployment (Transparency and Oversight)
- **AI interaction disclosure:** Organizations deploying AI-powered customer interactions (chatbots, virtual assistants, automated correspondence) must notify individuals that they are interacting with an AI system, not a human
- **Transparency of AI decisions:** Where AI systems make or inform significant decisions about individuals (credit, employment, healthcare, insurance), organizations should disclose that AI is used in the decision process and the nature of the AI's role
- **Access controls:** Personal data processed by AI systems must be protected by appropriate access controls; AI systems should operate on a principle of least privilege
- **Human oversight mechanisms:** For decisions with significant impact on individuals, organizations must implement human review processes; AI recommendations should be treated as inputs to human decision-making, not as final determinations
- **Data subject rights:** Organizations must have procedures to handle PDPO data access requests and correction requests in relation to data processed by AI systems

### Phase 4 — AI Monitoring (Ongoing Governance)
- **Ongoing audits:** AI systems processing personal data should be subject to regular privacy audits assessing continued compliance with the PDPO and the framework
- **Bias and fairness testing:** Organizations should conduct periodic bias assessments to identify and mitigate discriminatory patterns in AI outputs, particularly for systems affecting protected characteristics
- **Incident response:** Organizations must establish and test AI-specific incident response plans addressing scenarios including: AI system generating harmful outputs; unauthorized access to AI training data; and AI-related data breaches
- **Model drift monitoring:** AI systems should be monitored for degradation in performance or accuracy that could lead to adverse impacts on data subjects
- **Stakeholder communication:** Material changes to AI systems processing personal data should be communicated to affected individuals

### Generative AI Specific Guidance
- Particular attention to generative AI risks: generation of content containing individuals' personal data; "hallucination" producing inaccurate information about identifiable individuals; and risk of training data memorization and extraction
- Organizations deploying generative AI for customer-facing applications must implement content filtering and output review mechanisms
- Employees using generative AI tools must be trained not to input personal data without appropriate safeguards (contractual protections, data processing agreements with the AI tool provider)

### Relationship with the PDPO
The framework maps each phase to specific Data Protection Principles under the PDPO:
- DPP 1 (Purpose and Collection): Phases 1 and 2
- DPP 2 (Accuracy and Retention): Phases 2 and 4
- DPP 3 (Use of Data): Phases 2 and 3
- DPP 4 (Security): Phases 2, 3, and 4
- DPP 5 (Openness): Phase 3
- DPP 6 (Access and Correction): Phase 3

## Enforcement & Penalties

The framework itself carries no enforcement mechanism or penalties. However:
- Non-compliance with the underlying PDPO can result in enforcement notices, compliance orders, and civil liability
- The PCPD may use organizations' adherence to (or deviation from) the framework as evidence in enforcement proceedings under the PDPO
- Maximum penalties under the PDPO for serious violations (e.g., doxxing provisions): up to HKD 1 million and 5 years imprisonment
- The PCPD publishes investigation reports and enforcement decisions that name non-compliant organizations
- Organizations subject to PDPO enforcement for AI-related violations may be required to implement the framework's measures as a remedial condition
