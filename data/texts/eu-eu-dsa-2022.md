---
id: eu-eu-dsa-2022
title: "Regulation (EU) 2022/2065 — Digital Services Act"
short_name: "EU Digital Services Act (DSA)"
jurisdiction: EU
enacted_date: 2022-10-19
status: in_force
official_url: https://eur-lex.europa.eu/eli/reg/2022/2065/oj
fetched_date: 2026-05-02
---

# Regulation (EU) 2022/2065 — Digital Services Act (DSA)

**European Parliament and Council of the European Union**
*Published in the Official Journal of the European Union on 27 October 2022. In force from 16 November 2022. Fully applicable from 17 February 2024 (17 August 2023 for VLOPs/VLOSEs).*

---

## Overview

The Digital Services Act (DSA) is a horizontal EU regulation that establishes a comprehensive framework governing online intermediary services — including hosting providers, online platforms, and very large online platforms (VLOPs) and very large online search engines (VLOSEs). Its central aim is to ensure that the digital environment remains safe, predictable, and trustworthy. The DSA repeals and replaces the relevant liability provisions of the 2000 E-Commerce Directive (2000/31/EC).

The DSA applies to all providers of intermediary services that offer services to recipients located in the EU, regardless of the provider's place of establishment. Obligations scale with the size and systemic role of the provider, creating a tiered structure: (1) all intermediary services, (2) hosting services, (3) online platforms (including marketplaces), and (4) VLOPs and VLOSEs (those with ≥45 million average monthly active users in the EU). As of mid-2025, the European Commission had designated 22 VLOPs and VLOSEs.

For AI and algorithmic systems specifically, the DSA imposes its most significant obligations on VLOPs and VLOSEs: mandatory recommender system transparency and user controls (Art. 27), annual independent algorithmic risk audits (Art. 37), systemic risk assessments and mitigation (Arts. 34–35), and meaningful data access for vetted researchers (Art. 40).

---

## Key AI/Algorithmic Provisions

### Article 27 — Transparency of Recommender Systems (All Online Platforms)

All online platforms (not just VLOPs) that use recommender systems must:

1. **Plain-language disclosure**: Set out in their terms and conditions, in plain and intelligible language, the main parameters used in their recommender systems, as well as any options available to users to modify or influence those parameters. "Main parameters" is defined broadly to include the criteria used to determine relevance, why those criteria were chosen, and whether user profiling is involved.

2. **User choice — at least one non-profiling option**: Platforms must offer at least one recommender system option that is not based on profiling (i.e., not based on inferring interests or characteristics from individual behaviour). This option must be easily accessible from the interface where recommendations are presented.

3. **Prominent accessibility**: The information on parameters must be provided in a clearly identifiable, accessible, and easy-to-use interface.

*Scope*: Applies to all "online platforms" as defined in Art. 3(i) — providers of hosting services that, at the request of a recipient, store and disseminate information to the public. This includes social media, app stores, travel/accommodation platforms, and online marketplaces.

---

### Article 38 — Additional Recommender System Transparency for VLOPs and VLOSEs

Very large online platforms and very large online search engines must, in addition to Art. 27 obligations:

1. **Prominent non-profiling option**: The non-profiling recommender option must be offered prominently in all relevant online interfaces, at the point where recommendations are presented — not merely buried in settings.

2. **Accessible from the interface itself**: Users must be able to access and activate the non-profiling option without leaving the primary interface.

*Relationship to Art. 27*: Art. 38 strengthens the Art. 27 obligations for VLOPs/VLOSEs; the non-profiling option must be the default prominent choice, and not just available on request.

---

### Articles 34–35 — Systemic Risk Assessment and Mitigation (VLOPs/VLOSEs)

**Article 34 — Risk Assessment**

VLOPs and VLOSEs must conduct at least annual assessments of systemic risks arising from the functioning of their service in the EU, including risks from the design or functioning of algorithmic systems. Specific risk categories include:

- Dissemination of illegal content (including illegal hate speech, CSAM, and terrorist content)
- Actual or foreseeable negative effects on fundamental rights
- Actual or foreseeable negative effects on civic discourse, electoral processes, and public security
- Actual or foreseeable negative effects on gender-based violence, public health, and minors

Risk assessments must specifically consider: algorithmic amplification (recommender systems, ranking, search), and the interaction between targeted advertising and the type of service.

**Article 35 — Risk Mitigation Measures**

VLOPs/VLOSEs must put in place reasonable, proportionate mitigation measures to address the risks identified under Art. 34. Mitigation measures may include:

- Adaptation of content moderation or recommender systems
- Adjustment of algorithmic outputs (e.g., limiting amplification of certain content)
- Strengthening internal processes or supervision
- Initiation or adjustment of content moderation policies
- Providing access to content provenance information
- Cooperation with trusted flaggers and authoritative bodies

---

### Article 37 — Independent Algorithmic Audits (VLOPs/VLOSEs)

VLOPs and VLOSEs must submit to at least annual independent audits to assess compliance with the DSA. The auditing entity must be independent of the VLOP/VLOSE, have expertise in risk management, technical competence, and is subject to a code of conduct. Audits must specifically examine:

- Compliance with Art. 34 risk assessments and Art. 35 mitigation measures
- Compliance with transparency obligations (Arts. 24–27, 39)
- Compliance with the prohibition on dark patterns (Art. 25)
- Compliance with advertising transparency (Art. 26)

Audit reports must be transmitted to the platform, the relevant Digital Services Coordinator, and the European Commission. VLOPs/VLOSEs must publish the final audit report (possibly redacted for confidentiality) and provide an implementation report responding to audit recommendations.

*Key implementation detail*: The European Commission adopted Delegated Regulation (EU) 2023/2409 establishing the methodology and procedural standards for the auditing framework.

---

### Article 40 — Data Access and Scrutiny (VLOPs/VLOSEs)

**Researcher Access**

The Digital Services Coordinator of the establishment (or the Commission for EU-level coordination) may grant vetted researchers access to data of VLOPs/VLOSEs for the purpose of conducting research that contributes to the detection, identification, and understanding of systemic risks. Conditions:

- Researchers must be affiliated with a research organisation (university, research institute, or similar)
- Researchers must meet data access and protection standards set out in the DSA and the Digital Services Coordinator's rules
- Access may be via API or other means specified by the VLOP/VLOSE

**Vetted Researcher Programme**

VLOPs and VLOSEs must provide vetted researchers, upon their reasoned request, with access to their data that is strictly necessary for their research. Platforms may impose conditions on use (confidentiality, data minimisation, etc.) but may not unreasonably restrict access.

**Annual Publication of Algorithmic Data**

VLOPs/VLOSEs must publish, at least annually, a publicly accessible repository of all advertisements displayed on their interfaces (Art. 39 — advertising repository), including information on targeting parameters used. This repository is searchable and constitutes a transparency tool for researchers and civil society.

---

### Article 26 — Advertising Transparency (All Online Platforms)

All online platforms must ensure that recipients of an advertisement can identify:
1. That the communication is an advertisement
2. The natural or legal person on whose behalf the advertisement is displayed
3. The main parameters used to determine the recipient as a target of the advertisement

VLOPs/VLOSEs must provide more detailed targeting parameter information (Art. 39 advertising repository).

---

### Article 25 — Prohibition of Dark Patterns

All online platforms are prohibited from designing, organising, or operating their online interfaces in ways that deceive or manipulate recipients of the service or impair or distort their ability to make free and informed decisions. Specific prohibited practices include:

- Giving more visual prominence to certain choices in a way that steers users
- Repeatedly requesting a user to make a choice that has already been made
- Making revocation of a consent harder than giving it

This provision is relevant to AI-powered user interfaces and recommendation presentation.

---

### Articles 17–20 — Notice and Action / Complaint Mechanisms

Online platforms must provide users with an internal complaint-handling system that is free of charge and accessible. For algorithmic decisions specifically, users must receive an explanation when content is removed or restricted, and must have access to a complaints mechanism and out-of-court dispute settlement.

---

## Enforcement and Penalties

**Enforcement architecture**:
- **Digital Services Coordinators (DSCs)**: Each EU Member State designates a DSC as the national competent authority for DSA enforcement within its territory. DSCs have investigative, enforcement, and sanctioning powers.
- **European Commission**: Has exclusive supervisory jurisdiction over VLOPs and VLOSEs for systemic compliance (Chapters III and IV obligations). The Commission may itself investigate and impose fines on VLOPs/VLOSEs.
- **European Board for Digital Services**: Advisory body coordinating DSC activities.

**Penalties**:
- For non-compliance by VLOPs/VLOSEs: up to **6% of global annual worldwide turnover** in the preceding financial year.
- For providing incorrect, incomplete, or misleading information: up to **1% of annual worldwide turnover**.
- For repeated infringements: the Commission may temporarily ban VLOPs/VLOSEs from providing services in the EU, following multiple infringement findings within 12 months.
- For systemic risk infringements by VLOPs/VLOSEs, the Commission may also impose interim measures.

**Notable enforcement actions (as of May 2026)**:
- The Commission opened formal proceedings against X (formerly Twitter), Meta, TikTok, and others in 2024 under Art. 34/37 obligations.
- The Commission fined X in 2024 and 2025 for non-compliance with DSA transparency and researcher access obligations (proceedings ongoing as of May 2026).

---

## Implementation Timeline

| Date | Event |
|------|-------|
| 27 October 2022 | Published in Official Journal |
| 16 November 2022 | Entry into force |
| 17 August 2023 | Applicable to designated VLOPs and VLOSEs |
| 17 February 2024 | Fully applicable to all platforms |
| 17 February 2025 | First annual audit cycle due for VLOPs/VLOSEs |

---

## Relationship to Other EU Instruments

- **EU AI Act (2024/1689)**: The AI Act governs the development and deployment of AI systems as products/services; the DSA governs the deployment and systemic effects of algorithmic systems on online platforms. Recommender systems subject to DSA Art. 27 may also be subject to AI Act risk classification if they constitute high-risk AI systems.
- **GDPR (2016/679)**: DSA Art. 26(3) prohibits targeting advertising based on special categories of personal data (Art. 9 GDPR) and on profiling of minors. GDPR lawful basis requirements apply alongside DSA obligations.
- **EU Data Act (2023/2854)** and **Data Governance Act (2022/868)**: DSA Art. 40 researcher access provisions interact with data governance frameworks for structuring lawful data sharing.
