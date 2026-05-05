---
id: sg-sg-pdpcaiguidelines-2024
source_url: https://www.pdpc.gov.sg/guidelines-and-consultation/2024/02/advisory-guidelines-on-use-of-personal-data-in-ai-recommendation-and-decision-systems
fetched_date: 2026-05-05
pdf_url: https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/advisory-guidelines/advisory-guidelines-on-the-use-of-personal-data-in-ai-recommendation-and-decision-systems.pdf
published_date: 2024-03-01
---

# Advisory Guidelines on the Use of Personal Data in AI Recommendation and Decision Systems

**Personal Data Protection Commission (PDPC) — Singapore**

*Issued: 1 March 2024*

*Note: This text was reconstructed from official PDPC summaries, regulatory databases, and law firm analyses. The PDF source at pdpc.gov.sg is access-restricted. This record should be verified and replaced with the full PDF text when direct access is available.*

---

## 1. Introduction

The Personal Data Protection Commission (PDPC) published these Advisory Guidelines to clarify how Singapore's Personal Data Protection Act 2012 (PDPA) applies when organisations use personal data in AI systems that make recommendations, predictions, or decisions affecting individuals.

These guidelines are not legally binding on their own, but they set practical compliance expectations and reflect the PDPC's likely enforcement positions regarding PDPA obligations. Non-compliance with underlying PDPA obligations can expose organisations to enforcement actions, compliance directions, financial penalties, and corrective measures.

**Scope:** The guidelines address AI recommendation and decision systems — systems embedding machine learning models that assist with or make automated decisions. The guidelines explicitly do not address generative AI systems, which raise distinct privacy concerns that the PDPC intends to address separately.

The guidelines are structured around three stages of the AI system lifecycle:
1. **Development, Testing, and Monitoring**
2. **Deployment** (business-to-consumer)
3. **Procurement** (business-to-business)

---

## 2. Key Definitions

**AI System:** A system embedding one or more machine learning models that assists with or makes recommendations, predictions, or decisions.

**AI Developer:** An organisation that builds or trains AI models, whether an internal team or a third-party provider.

**Service Provider / Data Intermediary:** A third-party developer or supplier that processes personal data on behalf of a client organisation, subject to data intermediary obligations under the PDPA.

**Personal Data:** Any data about an individual who can be identified from that data or from that data and other information that the organisation has or is likely to have access to, as defined under the PDPA.

**Anonymisation:** The process of removing identifying information such that individuals cannot be re-identified — data that has been successfully anonymised is no longer personal data under the PDPA.

**Pseudonymisation:** The replacement of directly identifying information with a pseudonym or code; pseudonymised data retains its status as personal data because re-identification is possible using the key.

---

## 3. Lawful Basis for Processing Personal Data in AI

### 3.1 Meaningful Consent

The default position under the PDPA is that organisations must obtain **meaningful consent** — explicit, informed agreement from individuals — before collecting, using, or disclosing their personal data for AI training, testing, or deployment.

Consent is meaningful when:
- The individual is notified of the purpose(s) for which their data will be used;
- The notification is clear, accurate, and accessible; and
- The individual provides voluntary agreement (not bundled or coerced).

### 3.2 Business Improvement Exception

Organisations may process personal data without consent where the **Business Improvement Exception** applies. This exception permits use of personal data for:
- Developing or enhancing products or services;
- Improving operational efficiency; or
- Offering personalised services.

**Key limitation:** The Business Improvement Exception permits intra-group data sharing only; it does not extend to cross-company sharing of personal data.

### 3.3 Research Exception

The **Research Exception** allows organisations to use personal data without consent for commercial research that advances science and engineering, provided the research does not have a specific product roadmap associated with it.

**Key distinction from Business Improvement Exception:** The Research Exception permits cross-company data sharing that would otherwise require consent.

### 3.4 Documentation Requirements

Organisations must document which lawful basis applies to each specific processing activity associated with AI system development, testing, and operation. Where an exception is relied upon, the documentation should demonstrate that all criteria for the exception are satisfied.

---

## 4. Stage 1: Development, Testing, and Monitoring

### 4.1 Consent and Exception Assessment

Before commencing development, organisations should evaluate:
- Whether meaningful consent is required or whether a statutory exception applies;
- The data attributes to be used and whether they are necessary for the intended AI purpose; and
- Whether data subjects have reasonable expectations that their data would be used in this manner.

### 4.2 Data Minimisation and De-identification

Organisations must use only the minimum personal data necessary for the AI development purpose. Requirements include:

- Using only necessary data attributes and volumes;
- Implementing **pseudonymisation** and **anonymisation** as preferred practices to reduce privacy risk;
- Acknowledging that re-identification risks remain even after de-identification; and
- Conducting regular assessments of whether each data attribute remains necessary.

### 4.3 Data Protection Impact Assessments (DPIAs)

Organisations should conduct DPIAs during the development phase, documenting:
- The nature of the AI system and the personal data used;
- Identified risks to individuals;
- Mitigations implemented; and
- Residual risks and how they are managed.

### 4.4 Testing, Evaluation, and Bias Mitigation

Organisations must:
- Validate model performance using suitable and representative datasets;
- Conduct bias assessments, particularly for characteristics that correlate with protected attributes under Singapore law;
- Implement bias mitigation procedures where adverse impacts are identified; and
- Maintain documentation of evaluation results.

### 4.5 Ongoing Monitoring

After deployment, organisations must continue monitoring AI systems for:
- Accuracy drift and performance degradation;
- Emergence of unfair or discriminatory outcomes; and
- Changes in data inputs that may affect model behaviour.

---

## 5. Stage 2: Deployment (Business-to-Consumer)

### 5.1 Consent and Notification at Deployment

When deploying AI systems that use personal data, organisations must:
- Provide individuals with clear notification at or before the point of data collection;
- Describe the type of personal data collected and the purpose;
- Explain how personal data influences the AI's recommendations or decisions;
- Identify which features of personal data are more likely to influence the product's outputs; and
- Provide this notification in plain, accessible language.

Where AI systems materially affect individual outcomes (e.g., credit scoring, hiring decisions, healthcare recommendations), notifications should be proportionate to the significance of the decision.

### 5.2 Legitimate Interests and Other PDPA Exceptions at Deployment

Organisations may rely on PDPA exceptions during deployment for specific purposes, such as:
- Detecting illegal activities or security threats; or
- Other purposes identified in the First, Second, or Third Schedules to the PDPA.

### 5.3 Accountability Policies

Organisations are expected to maintain transparent internal accountability policies addressing:
- **Fairness:** How the AI system is designed and monitored to avoid unfair outcomes;
- **Safeguards:** Technical and organisational measures protecting personal data;
- **Consent practices:** How consent is obtained, recorded, and respected; and
- **Data quality:** How data accuracy is maintained and how erroneous data is corrected.

---

## 6. Stage 3: Procurement (Business-to-Business)

### 6.1 Data Intermediary Obligations

Third-party developers and suppliers who process personal data on behalf of a client organisation are **data intermediaries** under the PDPA and must:
- Implement adequate technical and organisational safeguards protecting personal data;
- Comply with the Protection and Retention Limitation Obligations under the PDPA;
- Maintain records of **data provenance** (the origins and transformation history of personal data used for AI training); and
- Enable client organisations to audit and verify compliance.

### 6.2 Contractual Requirements

Contracts between organisations and service providers for AI system development should:
- Clearly allocate PDPA obligations and responsibilities;
- Require the service provider to implement specified technical and organisational safeguards;
- Include audit rights enabling the client to verify compliance; and
- Address protocols for model updates that may change how personal data is processed.

### 6.3 Data Provenance Records

Service providers must maintain records sufficient to demonstrate:
- The origin of data used to train AI models;
- How data was transformed or processed during model development;
- Which data subjects' data was included or excluded from training; and
- How data mapping was maintained throughout the AI system lifecycle.

---

## 7. Accountability and Documentation

Across all three stages, organisations must maintain:

- **Data Protection Impact Assessments (DPIAs)** documenting risks and mitigations;
- **Provenance records** tracking data origins and transformations;
- **Model evaluation logs** recording testing results and bias assessments;
- **Decisioning rationale records** where AI systems make decisions affecting individuals; and
- **Retention schedules** aligned with the PDPA Retention Limitation Obligation.

---

## 8. Relationship to Other Frameworks

These guidelines complement Singapore's broader AI governance ecosystem:

- **IMDA's Model AI Governance Framework** — which sets out principles and implementation considerations for responsible AI;
- **AI Verify** — IMDA's testing framework and toolkit for validating AI governance claims;
- **PDPC's Guide to Basic Anonymisation** — providing technical guidance on de-identification; and
- **Sector-specific standards**, such as Monetary Authority of Singapore (MAS) requirements for financial institutions.

The guidelines align with international AI governance principles of transparency, fairness, robustness, and accountability.

---

## 9. Scope Limitation — Generative AI

These guidelines explicitly do not apply to **generative AI systems** (including large language models and foundation models). The use of personal data to train foundation models, or as input to generative AI applications, raises distinct privacy concerns that the PDPC has indicated it will address in separate guidance.

---

*Issued by the Personal Data Protection Commission, Singapore*
*Date of Issue: 1 March 2024*
*For questions, contact: info@pdpc.gov.sg*
