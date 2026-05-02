---
id: sg-sg-maigf-2020
title: "Singapore Model AI Governance Framework — Second Edition (2020)"
short_name: "Singapore Model AI Governance Framework (2020)"
jurisdiction: SG
enacted_date: 2020-01-21
status: in_force
official_url: https://www.pdpc.gov.sg/Help-and-Resources/2020/01/Model-AI-Governance-Framework
fetched_date: 2026-05-02
---

# Singapore Model AI Governance Framework — Second Edition (2020)

**Personal Data Protection Commission (PDPC), Singapore**
*Published 21 January 2020 at the World Economic Forum Annual Meeting, Davos.*

---

## Overview

The Singapore Model AI Governance Framework (MAIGF), Second Edition, is a voluntary, non-binding guidance document published by Singapore's Personal Data Protection Commission (PDPC). It provides detailed, practical guidance for private-sector organisations on how to deploy AI responsibly and in a manner that is explainable, transparent, and human-centric.

The Framework was first published in January 2019 (First Edition) at the World Economic Forum. The Second Edition, released in January 2020, incorporates feedback from industry consultation, expands coverage to include new technology developments, and adds a self-assessment guide and a compendium of use cases illustrating implementation across industries including financial services, healthcare, and human resources.

The Framework is deliberately non-prescriptive and principles-based, reflecting Singapore's "pro-innovation" regulatory philosophy. Rather than mandating specific technical controls, it offers a risk-tiered decision-making structure designed to help organisations calibrate governance measures to the probability and severity of harm from AI deployment. The Framework has been highly influential internationally — it informed the OECD AI Principles, shaped ASEAN's AI Governance Framework (2023), and is cited by regulators in the UK, Australia, Canada, and across Asia-Pacific.

---

## Key AI Governance Provisions

### Principle 1 — Internal Governance Structures and Measures

Organisations should establish clear internal governance to ensure AI systems are deployed responsibly. This includes:

**Board and Senior Leadership Accountability**:
- Senior management should be aware of and accountable for the organisation's AI strategy and risk posture
- AI governance should be integrated into existing enterprise risk management (ERM) frameworks
- Clear ownership of AI-related decisions should be assigned (who is responsible for AI system performance and ethics)

**Role Clarity**:
- Organisations should clearly define roles and responsibilities for AI development, deployment, and monitoring
- The Framework identifies three key roles: (a) AI model developers, (b) AI system owners/operators, and (c) end-users — each with distinct accountability
- Where AI is supplied by a third party (vendor), organisations should conduct vendor due diligence including review of vendor's AI governance practices

**Documentation and Record-Keeping**:
- Maintain documentation of AI system design choices, training data sources, and performance benchmarks
- Documentation supports explainability and incident response

---

### Principle 2 — Determining the Level of Human Involvement in AI-Augmented Decision-Making

The Framework's most operationally distinctive contribution is its structured approach to calibrating human oversight based on risk. It identifies a spectrum of human involvement:

**Three models of human-AI interaction**:
1. **Human-in-the-loop**: A human is involved in every individual AI decision before it is executed (highest oversight; appropriate for highest-risk decisions)
2. **Human-over-the-loop**: A human monitors AI decisions at a systemic level and can intervene, but does not review every individual decision (intermediate oversight; appropriate for medium-risk decisions)
3. **Human-out-of-the-loop**: AI makes and executes decisions without real-time human intervention (lowest oversight; appropriate only for low-risk, reversible decisions)

**Risk calibration factors**:
The Framework sets out a matrix for determining appropriate human oversight, based on:
- **Probability of harm**: How likely is the AI decision to cause harm?
- **Severity of harm**: How severe and reversible is the potential harm? (Categories: negligible, minor, moderate, significant, critical)
- **Breadth of harm**: How many individuals could be affected?
- **Vulnerability of affected individuals**: Are those affected particularly vulnerable (e.g., children, elderly, medical patients)?

Organisations should map their AI use cases to this matrix and select the appropriate oversight model accordingly. For example:
- Credit scoring for large loan decisions: high probability × significant harm × broad impact → human-in-the-loop required
- Real-time fraud detection (reversible blocks): low probability × moderate harm → human-over-the-loop acceptable
- Automated product recommendations: low probability × negligible harm → human-out-of-the-loop acceptable

---

### Principle 3 — Operations Management

**Training Data**:
- Training data should be representative and free of biases that could lead to discriminatory outcomes
- Organisations should assess whether their training data is relevant and sufficient for the intended use case
- Data lineage should be documented (sources, collection methods, consent basis)
- Where personal data is used for training, PDPA compliance is required

**Algorithmic Models**:
- Organisations should regularly test AI models for performance, accuracy, and fairness
- Testing should include adversarial testing (stress testing, edge cases) where appropriate for the risk level
- Model drift should be monitored — AI models' performance can degrade over time as data distributions shift
- Organisations should have procedures for model retraining, version control, and rollback

**Explainability**:
The Framework dedicates significant attention to explainability as a practical governance tool:
- For decisions affecting individuals, organisations should be able to explain the factors that led to a particular outcome
- Explainability serves two purposes: (a) enabling individuals to understand and contest decisions, and (b) enabling internal audit and oversight
- The Framework acknowledges the technical challenge of explainability in deep learning systems and suggests that where full technical explainability is not possible, organisations should at minimum be able to explain the process by which the AI system was designed and validated
- Recommended approaches include: surrogate models, LIME (Local Interpretable Model-agnostic Explanations), SHAP (SHapley Additive exPlanations), and attention mechanisms

**Repeatability and Consistency**:
- AI decisions should be consistent for similar cases — unexplained inconsistency undermines trust
- Stochastic models (e.g., generative AI outputs) require particular attention to consistency governance

---

### Principle 4 — Stakeholder Interaction and Communication

**Customer-Facing Transparency**:
- Organisations should inform individuals when they are interacting with an AI system (as opposed to a human), especially where this is material to the interaction (e.g., AI customer service chatbots)
- Organisations should provide meaningful explanations when AI-based decisions adversely affect individuals
- Explanations should be in plain language, actionable, and proportionate to the decision's impact

**Consent and Data Rights**:
- Where personal data is used to train or operate AI systems, organisations must comply with Singapore's Personal Data Protection Act (PDPA) — including obtaining consent where required
- Individuals should understand how their data is being used in AI systems

**Redress Mechanisms**:
- Organisations should provide accessible mechanisms for individuals to raise concerns about AI-based decisions
- Where AI decisions are contestable, a human review process should be available

**Vulnerable Populations**:
- Special care should be taken when AI systems affect vulnerable populations including children, elderly persons, and individuals in crisis situations

---

## Supplementary Guidance

### Implementation and Self-Assessment Guide (Annex)

The Second Edition includes a detailed self-assessment guide with 61 questions across the four governance areas. The guide is designed for use by compliance, legal, and technology teams and enables organisations to:
- Identify gaps in their current AI governance
- Prioritise improvements based on risk
- Document governance measures for regulatory or audit purposes

### Compendium of Use Cases

The Second Edition adds a Compendium of Use Cases illustrating application of the Framework across:
- **Financial services**: Credit scoring, fraud detection, insurance underwriting, algorithmic trading
- **Healthcare**: Clinical decision support, medical imaging AI, patient triage
- **Human resources**: Automated CV screening, employee performance management
- **Marketing and retail**: Personalisation, dynamic pricing

Each use case illustrates how the risk-calibration matrix and human oversight models apply in practice.

---

## Relationship to Other Frameworks and Influence

| Framework | Relationship |
|-----------|-------------|
| PDPA (Singapore, 2012/2021) | The MAIGF complements PDPA obligations; AI systems using personal data must comply with both |
| ASEAN Guide on AI Governance (2023) | Directly draws on MAIGF structure and principles |
| OECD AI Principles (2019) | MAIGF informed OECD Principles; both reflect similar risk-based, human-centric approach |
| UK ICO/CDEI Guidance | UK regulators have cited MAIGF as a model for sector-based AI governance |
| Australia AI Ethics Framework | Shares common principles with MAIGF; both non-binding and principles-based |
| EU AI Act | MAIGF's risk-tiered human oversight models influenced discussions of human oversight requirements in the AI Act |

---

## Subsequent Developments

- **2022**: PDPC published the "Model AI Governance Framework for Generative AI" consultation (subsequently the Cataloguing LLM Evaluations project, 2023)
- **2023**: PDPC published the "Generative AI Governance Framework" discussion paper extending MAIGF principles to large language models
- **2024**: PDPC published AI governance guidance for generative AI in the context of the revised Singapore AI Strategy 2.0 (December 2023)
- The MAIGF Second Edition remains the foundational reference document for AI governance in Singapore as of May 2026

---

## Key Limitations

- **Non-binding**: The Framework is voluntary and carries no legal penalties for non-compliance
- **Private sector focus**: Does not directly address government use of AI (governed by Singapore's AI in Government framework)
- **Limited enforcement**: Unlike the EU AI Act or Singapore's PDPA, there is no enforcement mechanism tied to the Framework
- **Pre-generative AI**: The Second Edition (2020) predates the widespread deployment of large language models; PDPC has published supplementary guidance for generative AI use cases
