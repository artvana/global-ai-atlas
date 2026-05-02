---
id: eu-eu-dga-2022
title: "Regulation (EU) 2022/868 — Data Governance Act"
short_name: "EU Data Governance Act (DGA)"
jurisdiction: EU
enacted_date: 2022-05-30
status: in_force
official_url: https://eur-lex.europa.eu/eli/reg/2022/868/oj
fetched_date: 2026-05-02
---

# Regulation (EU) 2022/868 — Data Governance Act (DGA)

**European Parliament and Council of the European Union**
*Published in the Official Journal on 3 June 2022. In force from 23 June 2022. Applicable from 24 September 2023.*

---

## Overview

The Data Governance Act (DGA) is a foundational EU regulation establishing mechanisms and structures to facilitate the voluntary sharing of data — including public sector data, personal data, and non-personal data — across the EU internal market. It is a key pillar of the European Data Strategy and complements the EU Data Act (Regulation (EU) 2023/2854), which governs mandatory B2B and B2G data sharing.

The DGA does not directly regulate AI systems but is highly relevant to AI development and deployment because it governs the conditions under which large-scale datasets — including datasets used to train AI models — can be made available, pooled, and shared. In particular, the DGA's data altruism framework creates a pathway for individuals and organisations to voluntarily contribute data (including personal data) for purposes including scientific research and the development of AI systems for the common good.

The DGA pursues four main objectives:
1. Enabling re-use of certain categories of protected public sector data
2. Creating a trusted intermediary framework for data sharing (data intermediation services)
3. Establishing a voluntary European data altruism framework
4. Setting up an EU-level governance structure (European Data Innovation Board — EDIB)

---

## Key Provisions Relevant to AI and Data Sharing

### Chapter II — Re-use of Protected Public Sector Data (Articles 3–9)

**Scope**: Covers data held by public sector bodies that is subject to protection on grounds of commercial confidentiality, statistical confidentiality, intellectual property rights of third parties, or personal data protection (e.g., health records, social data, administrative data).

**Key mechanism**: Public sector bodies may allow re-use of such data under specific conditions — including via secure processing environments — rather than providing open access. This is the principal legal framework enabling researchers and AI developers to access sensitive public datasets (e.g., health records for medical AI training) in the EU.

**Conditions for re-use (Art. 5)**:
- Data must be anonymised/pseudonymised before provision where possible
- Where personal data is involved, re-use must comply with GDPR and may only take place in a secure processing environment controlled by the public sector body
- Specific technical and organisational conditions may be imposed (e.g., data minimisation, purpose limitation)
- Fees may be charged but must be non-discriminatory and cost-based

**Relevance to AI training**: Public sector datasets of significant value for AI training (medical imaging, geographic data, transport data, administrative records) become accessible under a defined legal framework rather than ad hoc arrangements. The "secure processing environment" model is particularly relevant for federated learning and privacy-preserving AI research.

---

### Chapter III — Requirements Applicable to Data Intermediation Services (Articles 10–15)

**Definition (Art. 2(11))**: Data intermediation services are services whose principal purpose is to establish commercial relationships for the purposes of data sharing between data subjects/holders and data users, through technical, legal, or other means. This includes data marketplaces, data pools, and personal data management services.

**Registration requirement (Art. 11)**: Providers of data intermediation services must notify the competent authority before they begin providing services. The notification regime is light-touch (a notification, not a licensing system) but creates a formal register of approved intermediaries.

**Conditions of provision (Art. 12)**:
- Data intermediation services must not use the data shared through them for purposes other than making it available to data users (i.e., they cannot exploit the data for their own commercial benefit, including training their own AI models)
- Services must be structurally separated from other commercial activities (to prevent conflicts of interest where the intermediary also develops AI products)
- Services must have procedures to prevent fraudulent or abusive access to data
- Services must provide a "secure and transparent environment" for processing data

**Relevance to AI**: The prohibition on intermediaries using shared data to train their own AI models (Art. 12(a)) is a significant structural constraint intended to build trust in data sharing ecosystems. This addresses a key concern that data brokers/marketplaces would exploit pooled datasets for their own model development.

---

### Chapter IV — Data Altruism (Articles 16–26)

**Definition (Art. 2(16))**: Data altruism means the voluntary sharing of data by individuals (data subjects) or legal persons on the basis of consent or permission, without remuneration, for objectives of general interest — including scientific research purposes or improving public services.

**The European Register of Recognised Data Altruism Organisations (Art. 17)**: Organisations may apply for registration as "Recognised Data Altruism Organisations" (RDAOs) on a national register, and thereafter on a European register maintained by the Commission. Registration confers:
- A trust mark (Art. 23) signalling legitimacy to data contributors
- Eligibility to collect altruistic data contributions across the EU under a harmonised legal framework
- Access to the European Common European Data Spaces for which altruistic data is pooled

**Conditions for RDAOs (Art. 20)**:
- Must be non-profit or operate through a non-profit entity
- Must separate data altruism activities from other commercial activities
- Must maintain a public register of all data altruism activities and publish annual activity reports
- Must use data only for declared general-interest purposes

**European Data Altruism Consent Form (Art. 25)**: The Commission must adopt an implementing act establishing a standardised European Data Altruism Consent Form enabling individuals to give, refuse, or revoke consent for their data to be used for altruistic purposes. This form must be machine-readable and compatible with GDPR consent requirements.

**Relevance to AI training data**: The data altruism framework is specifically designed to enable large-scale voluntary contributions of personal data (e.g., medical records, genomic data, mobility data) for AI training for public benefit. This provides a lawful basis and structured framework for building training datasets that comply with GDPR without relying on individual ad hoc consent agreements. The regime is directly relevant to AI developers building health AI, mobility AI, and similar systems using EU citizen data.

---

### Chapter V — European Data Innovation Board (Articles 27–31)

The DGA establishes the European Data Innovation Board (EDIB) as the EU-level advisory and coordination body. The EDIB:

- Advises and assists the Commission on data sharing and governance issues
- Facilitates cross-border data sharing by coordinating national competent authorities
- Maintains guidelines for common European Data Spaces (including the European Health Data Space)
- Advises on cross-border data altruism activities

---

### Cross-Border Data Sharing and Common European Data Spaces

The DGA provides the legal infrastructure for sectoral Common European Data Spaces — large-scale pooling of data from multiple actors in a given sector for shared purposes including AI development. Designated data spaces include:

- European Health Data Space (governed by separate Regulation (EU) 2025/327)
- Mobility Data Space
- Agricultural Data Space
- Manufacturing Data Space
- Financial Data Space
- Energy Data Space

Each Data Space may define its own governance rules for AI training data access, consistent with the DGA framework.

---

### Article 2 — Key Definitions Relevant to AI

- **Data holder** (Art. 2(8)): Any legal or natural person who has the right or obligation to use and make available certain data, including data about their products or services. AI developers are data holders in respect of AI-generated data.
- **Data user** (Art. 2(9)): A natural or legal person who has lawful access to certain data and has the right to use it, including for AI training and model development.
- **Data sharing** (Art. 2(1)): The provision of data by a data subject or data holder to a data user for the purpose of joint or individual use of the data, based on voluntary agreements or Union or national law — directly applicable to AI training data arrangements.

---

## Enforcement Structure

**Competent authorities**: Each Member State designates one or more competent authorities responsible for:
- Maintaining the national register of data altruism organisations
- Processing notifications from data intermediation service providers
- Imposing penalties for non-compliance

**Penalties (Art. 34)**: Member States must lay down rules on effective, proportionate, and dissuasive penalties for infringements. The DGA does not itself specify maximum penalty thresholds (unlike the DSA or AI Act), leaving this to Member States. Most Member States have adopted civil administrative fines.

**Cross-border coordination**: The EDIB coordinates between national competent authorities for cross-border data sharing arrangements.

---

## Relationship to Other EU Instruments

| Instrument | Relationship |
|-----------|-------------|
| GDPR (2016/679) | DGA is complementary; personal data shared under DGA must comply with GDPR. DGA provides additional structures (consent forms, secure environments) for GDPR-compliant data sharing. |
| EU Data Act (2023/2854) | Data Act governs mandatory B2B and B2G data sharing; DGA governs voluntary sharing and intermediaries. Together they form the EU's data sharing framework. |
| EU AI Act (2024/1689) | AI Act Art. 10 requires high-quality training data; DGA provides legal framework for sourcing such data from public sector and altruistic sources. |
| European Health Data Space | The EHDS Regulation (2025/327) builds on DGA infrastructure for health data re-use, including for AI training in the health sector. |

---

## Implementation Timeline

| Date | Event |
|------|-------|
| 3 June 2022 | Published in Official Journal |
| 23 June 2022 | Entry into force |
| 24 September 2023 | Applicable (15 months after entry into force) |
| 2023–2025 | Member States designate competent authorities; national altruism registers established |
| 2024 | Commission adopts implementing acts on European Data Altruism Consent Form and European register of RDAOs |
