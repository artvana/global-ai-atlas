---
id: th-th-aiact-2026
title: "Thailand Artificial Intelligence Act"
short_name: "Thailand AI Act (2026)"
jurisdiction: Thailand
enacted_date: 2026-01-15
status: in_force
official_url: https://www.pertamapartners.com/insights/thailand-ai-regulations-2026
fetched_date: 2026-04-24
---
Thailand is positioning itself as Southeast Asia's AI hub while developing a regulatory framework that balances innovation with consumer protection and national security. This guide provides comprehensive analysis of Thailand's AI regulations, compliance requirements, and best practices for organizations deploying [artificial intelligence](/glossary/artificial-intelligence) systems in the Thai market.

## Thailand's AI Regulatory Framework

Thailand's approach to AI governance combines horizontal data protection legislation with sector-specific requirements and emerging AI-focused regulations.

### Personal Data Protection Act (PDPA)

Thailand's **Personal Data Protection Act B.E. 2562 (2019)**, fully enforced since **June 1, 2022**, serves as the foundation for AI data governance. Modeled after GDPR, the PDPA imposes comprehensive obligations on AI systems processing personal data.

**Core PDPA Principles:**

The principle of **lawfulness and consent** requires that all AI data processing rest on a valid legal basis. For general personal data, organizations must obtain explicit consent from data subjects. Sensitive personal data demands both explicit consent and a demonstration of necessity. Beyond consent, the PDPA recognizes several alternative legal bases: legitimate interest (subject to a balancing test), contract performance, legal compliance obligations, and the protection of vital interests.

The **purpose limitation** principle obligates organizations to specify AI processing purposes before data collection begins. Use of collected data must remain within those disclosed purposes, and any new processing objective requires fresh consent from data subjects. Organizations should document all purpose changes along with their justifications.

Under the **data minimization** principle, AI systems should collect only the data strictly necessary for stated purposes. Accumulating data for speculative "future use" is impermissible. Organizations must regularly review their data requirements and delete information when it is no longer needed for its original purpose.

The **accuracy and quality** principle requires organizations to maintain personal data that is accurate and current. This means establishing data quality assurance processes, implementing correction mechanisms for erroneous records, and conducting regular data validation exercises.

**Storage limitation** obligations require organizations to define retention periods for all personal data, implement automated deletion processes, maintain proper archival procedures, and document data disposal activities.

The **security** principle mandates the deployment of appropriate technical safeguards, administrative controls, and physical security measures. Organizations must also conduct vendor security assessments to ensure that third-party processors meet equivalent protection standards.

### PDPA Requirements for AI Systems

**Automated Decision-Making (Section 34):**

The PDPA grants data subjects the right not to be subject to decisions based solely on automated processing that produces legal effects or significantly affects them. Organizations deploying [automated decision-making](/glossary/automated-decision-making) systems must satisfy several **notification requirements**: informing data subjects that automated decision-making is in use, explaining the logic involved along with its significance and consequences, disclosing the categories of data used in decisions, and specifying applicable retention periods.

The Act also enshrines robust **data subject rights** in this context. Individuals may object to automated processing, request human intervention in decisions that affect them, express their views on automated outcomes, and contest decisions they believe are erroneous or unfair.

To comply with these provisions, organizations must implement meaningful **safeguards**, including human oversight mechanisms that allow qualified personnel to review and override automated decisions. Formal appeals processes should be established, decision logic and criteria must be thoroughly documented, and regular accuracy assessments should verify that automated systems are performing as intended.

**Data Protection Impact Assessment (DPIA):**

**Section 37** requires DPIAs for processing activities likely to result in high risk to data subjects' rights. AI applications that trigger this requirement include systematic large-scale profiling, automated decision-making that affects legal rights, large-scale processing of sensitive data, systematic monitoring of public areas, processing of children's data, and the use of innovative technologies. A compliant DPIA must contain a description of processing operations and their purposes, an assessment of necessity and proportionality, an evaluation of risks to data subjects, a description of safeguards and security measures, and documentation of consultation with the organization's data protection officer.

### Cross-Border Data Transfers

**Section 28** restricts personal data transfers outside Thailand unless the destination country has adequate protection or other safeguards are in place.

Organizations have several **transfer mechanisms** available. The Personal Data Protection Committee may issue **adequacy decisions** recognizing countries with equivalent data protection standards, though as of 2026 no such designations have been made. **Standard Contractual Clauses** approved by the PDPC offer another pathway, covering data protection obligations, security requirements, sub-processor controls, audit and inspection rights, and data subject rights mechanisms. Multinational groups may adopt **Binding Corporate Rules** approved by the PDPC. Finally, organizations may rely on **explicit consent**, provided they clearly disclose the destination country, recipient details, purpose of the transfer, associated risks, and safeguards implemented.

**AI-Specific Transfer Considerations:**

When using international **cloud AI services**, organizations must prioritize Thai data residency options where available, ensure contractual compliance with the PDPA, implement encryption and access controls, conduct regular compliance audits, and maintain comprehensive documentation of all data flows.

For organizations **training models abroad**, the PDPA requires anonymization of training data where possible, completion of transfer impact assessments, implementation of contractual safeguards, maintenance of data inventories, and ongoing monitoring of adequacy conditions in the destination jurisdiction.

### Cybersecurity Act B.E. 2562 (2019)

Thailand's **Cybersecurity Act** governs critical information infrastructure (CII) protection, with direct implications for AI systems deployed in designated sectors.

The **National Cybersecurity Committee** designates CII operators across six sectors: banking and finance, information and telecommunications, transportation and logistics, energy and utilities, government services, and emergency services.

CII operators deploying AI systems must meet stringent **security requirements**. These include conducting risk assessments and maintaining ongoing risk management programs, implementing security monitoring and detection capabilities, establishing incident response procedures, maintaining business continuity plans, and undergoing regular security audits.

**Incident reporting** obligations require CII operators to provide immediate notification of cyber threats, submit detailed incident reports, document all remediation activities, and conduct lessons-learned analyses following security events.

CII operators must also demonstrate **government cooperation** by complying with security directives, participating in threat intelligence sharing programs, coordinating with authorities during cyber incidents, and granting access for government audits.

## Sector-Specific AI Regulations

### Financial Services

The **Bank of Thailand (BOT)** and **Securities and Exchange Commission (SEC)** regulate [AI in financial services](/glossary/ai-in-financial-services) through multiple overlapping frameworks.

The BOT's AI guidelines impose comprehensive **model risk management** requirements. Financial institutions must establish comprehensive [model governance](/glossary/model-governance) structures, conduct independent validation and testing of AI models, maintain ongoing performance monitoring, implement stress testing protocols, and schedule regular model reviews.

For **AI credit decisioning**, the BOT requires that credit models be explainable to both regulators and consumers. Institutions must conduct bias testing and implement mitigation strategies, establish appeals mechanisms for credit denials, ensure transparency in credit scoring methodologies, and document all known model limitations.

**Consumer protection** obligations require financial institutions to clearly disclose when AI is being used in customer interactions, maintain human oversight for complex decisions, establish complaint handling procedures, provide assurance of fair treatment, and conduct regular consumer impact assessments.

In the area of **anti-money laundering**, financial institutions deploying AI [transaction monitoring](/glossary/transaction-monitoring) systems must ensure that generated alerts are explainable, maintain complete audit trails, conduct regular effectiveness testing, and fulfill all regulatory reporting requirements.

The SEC imposes additional requirements specific to capital markets. **Algorithmic trading** systems require pre-deployment testing and SEC approval, real-time monitoring capabilities, circuit breaker mechanisms to prevent market disruption, comprehensive audit trail maintenance, and regular compliance reviews. **Robo-advisory services** must incorporate client suitability assessments, ensure risk profiling accuracy, provide algorithm disclosures, maintain human oversight, and implement performance monitoring.

### Healthcare

The **Food and Drug Administration (FDA) Thailand** and the **Ministry of Public Health** regulate medical AI devices and health data processing.

AI medical devices are classified by risk level under a tiered system. **Class I (Low Risk)** encompasses administrative AI tools with minimal patient impact. **Class II (Medium Risk)** covers clinical decision support systems, which require medical device registration, performance validation, clinical evidence, and post-market surveillance. **Class III (High Risk)** applies to autonomous diagnostic or treatment AI, demanding rigorous clinical trials, extensive safety documentation, ongoing safety monitoring, and adverse event reporting.

The **Health Data Protection Act**, currently under development, will impose enhanced requirements including stricter consent standards, prohibition on health data exports (except for treatment purposes), elevated security measures, mandatory health data impact assessments, and strengthened patient access rights.

Organizations implementing **clinical AI** must ensure that physician oversight is mandatory for all AI-assisted clinical decisions. AI-generated outputs must be clearly labeled, documentation of AI system limitations must be readily available, continuing education on AI tools must be provided to healthcare professionals, and patients must be notified when AI is used in their care.

### Telecommunications and Broadcasting

The **National Broadcasting and Telecommunications Commission (NBTC)** oversees [AI content moderation](/glossary/ai-content-moderation) and recommendation systems operating in Thailand.

Under **content regulation** requirements, AI systems must be capable of identifying and addressing illegal content (including child exploitation and terrorism-related material), defamatory content, misinformation during emergencies, and content that violates Thai cultural norms.

The NBTC also mandates **recommendation algorithm transparency**. Platforms must disclose personalization criteria to users, provide meaningful user controls over recommendation algorithms, implement protections for minors, and take steps to limit the formation of filter bubbles.

**Platform accountability** obligations require platforms to maintain content moderation standards, offer appeals processes for content removal decisions, publish transparency reports, and cooperate with Thai authorities on enforcement matters.

## Thailand's National AI Strategy

Thailand's **National AI Strategy and Action Plan (2022-2027)** guides the country's AI development and regulation through five strategic pillars. The first pillar, **AI Infrastructure**, focuses on developing computing resources, datasets, and platforms to support AI innovation. The **AI Workforce** pillar aims to build talent through education, training programs, and immigration policies that attract skilled professionals. **AI Innovation** supports startups, research and development, and technology transfer. The **AI Adoption** pillar encourages implementation across industries, with particular emphasis on supporting SMEs. Finally, the **AI Governance** pillar drives the development of regulatory frameworks, ethical guidelines, and technical standards.

Several **regulatory initiatives** support this strategy. The **Digital Economy Promotion Agency (DEPA)** operates regulatory sandboxes that allow organizations to test innovative AI applications under temporary regulatory exemptions, enabling controlled experimentation while providing regulators with practical learning opportunities.

Thailand is also developing a national **AI Ethics Framework** built around six core principles: human-centric AI development, fairness and non-discrimination, transparency and explainability, accountability and oversight, privacy and security, and social and environmental well-being.

On the standards front, the **Thai Industrial Standards Institute (TISI)** is adopting international AI standards including **ISO/IEC 42001** (AI Management Systems), **ISO/IEC 23894** ([AI Risk Management](/glossary/ai-risk-management)), **ISO/IEC 22989** (AI Concepts and Terminology), and various sector-specific standards.

## Compliance Implementation Framework

### Phase 1: Scoping and Assessment (Months 1-2)

The first phase requires a thorough **AI system inventory**. Organizations must identify all AI systems that process Thai personal data, classify each by risk level and data sensitivity, map data flows and processing activities, and determine which regulatory requirements apply to each system.

A comprehensive **PDPA compliance assessment** should follow, reviewing the legal bases for all processing activities, evaluating consent mechanisms, assessing data subject rights processes, examining cross-border transfer safeguards, and reviewing security measures.

The **sector-specific review** component requires organizations to identify industry-specific requirements, assess compliance with sectoral regulations, review licensing and registration status, and evaluate reporting obligations.

The phase concludes with a **gap analysis** that compares the current state of compliance to regulatory requirements, identifies documentation gaps, assesses technical control deficiencies, and evaluates the adequacy of existing governance structures.

### Phase 2: Governance and Organization (Months 2-4)

**PDPA Section 41** requires the appointment of a **Data Protection Officer (DPO)** for government agencies, organizations processing large volumes of personal data, organizations that regularly process sensitive data, and organizations conducting large-scale systematic monitoring. The DPO is responsible for monitoring PDPA compliance, advising on data protection obligations, conducting training and awareness programs, serving as the regulatory contact point, and performing internal audits.

Organizations should also establish a cross-functional **AI Governance Committee** responsible for ensuring AI strategy alignment with business objectives, overseeing risk assessment and management, guiding ethical AI implementation, monitoring compliance, and coordinating incident response.

Clear **roles and responsibilities** must be defined, including data controller and processor designations, decision-making authorities, escalation procedures, and accountability assignments.

### Phase 3: Technical Implementation (Months 3-6)

The technical phase begins with **consent management** infrastructure. Organizations must implement consent capture mechanisms, deploy preference management systems, enable straightforward consent withdrawal, and maintain comprehensive consent records.

Processes must be established to handle all **data subject rights** under the PDPA: access requests (Section 30), correction and deletion requests (Sections 31 and 32), data portability (Section 33), objections to processing (Section 34), and restriction of processing (Section 35).

**Privacy-enhancing technologies** should be deployed across AI systems, including data minimization techniques, pseudonymization and anonymization capabilities, encryption for data at rest and in transit, robust access controls and authentication, and [differential privacy techniques](/glossary/differential-privacy-techniques) for model training.

Organizations must also implement **AI transparency mechanisms** such as explainability tools and techniques, model documentation systems, performance monitoring dashboards, and audit logging infrastructure.

Core **security controls** should include multi-factor authentication, network segmentation, intrusion detection and prevention systems, security information and event management (SIEM) platforms, and regular vulnerability assessments.

### Phase 4: Documentation and Policies (Months 4-7)

**Section 39** requires organizations to maintain **Records of Processing Activities (ROPA)** that document processing purposes, data categories and sources, data subject categories, data recipients and transfers, retention periods, and security measures.

**Data Protection Impact Assessments** must include processing operation descriptions, necessity and proportionality assessments, risk identification and evaluation, mitigation measures, and records of DPO consultation.

For cross-border data flows, **Transfer Impact Assessments** should analyze the destination country's legal framework, evaluate practical safeguards, assess associated risks, and identify any supplementary measures required.

Organizations must also develop a comprehensive suite of **policies and procedures**, including a public-facing privacy policy, an internal data protection policy, an AI ethics and governance policy, a data retention and disposal policy, an incident response plan, a vendor management policy, and a training and awareness program.

### Phase 5: Training and Culture (Months 6-8)

**Awareness training** should cover PDPA principles and requirements, data subject rights, security awareness, and incident identification and reporting procedures for all staff.

**Role-specific training** addresses the distinct needs of different teams. DPOs require certification and continuing education. AI developers need training on privacy-by-design principles. Marketing teams must understand consent requirements. Customer service teams should be equipped to handle data subject rights requests. IT security teams need specialized training on incident response procedures.

**Executive education** should cover the strategic implications of compliance, an overview of organizational risk and liability, governance responsibilities, and current regulatory enforcement trends.

### Phase 6: Testing and Validation (Months 7-9)

**Internal audits** during this phase should test compliance controls, review policy adherence, check documentation completeness, and validate technical controls.

**Penetration testing** involves conducting external security assessments, identifying vulnerabilities, verifying remediation effectiveness, and evaluating the organization's ongoing security posture.

**AI model validation** requires evaluating performance metrics, testing for bias, verifying explainability, and analyzing edge cases that may produce unexpected outcomes.

**Incident response exercises**, including tabletop exercises and simulated data breaches, should test response procedures and validate communication protocols to ensure the organization can respond effectively to real incidents.

### Phase 7: Continuous Compliance (Ongoing)

Sustained compliance requires ongoing **monitoring and metrics**, including compliance KPIs displayed on dashboards, data subject rights request tracking, incident response metrics, training completion rates, and audit findings tracking.

**Regular reviews** should include quarterly compliance assessments, annual internal audits, periodic DPIA updates, and scheduled policy reviews to ensure all documentation remains current.

**Regulatory tracking** is essential in Thailand's evolving landscape. Organizations should monitor PDPC guidance and rulings, track sectoral regulatory developments, follow AI governance trends both domestically and internationally, and participate in industry consultations.

## Penalties and Enforcement

The PDPA establishes significant penalties for non-compliance across administrative, civil, and criminal categories.

The **Personal Data Protection Committee** holds broad **administrative penalty** powers. The PDPC may order the cessation of processing activities, require corrective measures, impose data deletion, suspend cross-border transfers, and order public disclosure of violations.

**Civil penalties** include compensation for damages caused by data protection violations, court-ordered compliance measures, and injunctive relief.

**Criminal penalties** under the PDPA are substantial. **Section 70** addresses processing without consent or a valid legal basis, carrying penalties of **imprisonment up to 1 year**, a **fine up to THB 1 million (approximately USD 28,000)**, or both. **Section 71** targets unlawful disclosure or transfer of personal data with identical penalties of **imprisonment up to 1 year** and a **fine up to THB 1 million**, or both. **Section 72** penalizes failure to comply with PDPC orders, again with potential **imprisonment up to 1 year** and a **fine up to THB 1 million**, or both. **Section 73** addresses failure to notify data breaches, with a **fine up to THB 5 million (approximately USD 140,000)**.

Current **enforcement trends** indicate increasing scrutiny of international platforms operating in Thailand, a growing regulatory focus on consent and transparency practices, heightened attention to automated decision-making, active investigation of data breaches, and more frequent public enforcement actions accompanied by regulatory guidance.

## Best Practices for Thailand AI Compliance

### 1\. Implement Robust Consent Mechanisms

Effective consent design demands granular, specific consent requests presented in clear, plain language. Consent prompts should be prominently placed and easily accessible, with withdrawal mechanisms that are just as simple as the original consent process. Organizations must maintain thorough records of all consent obtained.

Equally important is avoiding common **consent pitfalls**. Pre-ticked consent boxes are impermissible under the PDPA. Consent must not be bundled with unrelated agreements, processing must not begin before consent is obtained, and consent must never be made a condition for accessing unrelated services.

### 2\. Build Privacy by Design into AI

Privacy considerations must be embedded from the earliest stages of AI system development. This means implementing data minimization by default, applying pseudonymization wherever possible, automating data retention and deletion processes, adopting [privacy-preserving machine learning](/glossary/privacy-preserving-machine-learning) techniques such as federated learning, and conducting regular privacy impact assessments throughout the system lifecycle.

### 3\. Ensure AI Transparency and Explainability

Organizations should implement **explainable AI** practices using model interpretability techniques such as LIME and SHAP, maintaining decision documentation and complete audit trails, providing user-facing explanations of AI-driven outcomes, and publishing regular transparency reports.

Clear **communication** with data subjects is equally critical. Organizations must disclose when AI is being used, explain decision-making logic in meaningful terms, provide substantive information rather than generic notices, and use language that is accessible to a general audience.

### 4\. Conduct Regular Bias Assessments

Thorough **bias testing** requires analyzing training data for embedded biases, evaluating model outputs across demographic groups, conducting formal fairness audits, and implementing bias mitigation techniques where disparities are identified.

Beyond initial testing, organizations must maintain **ongoing performance monitoring** through continuous bias surveillance, regular model retraining and validation, testing with diverse datasets, and active stakeholder feedback mechanisms.

### 5\. Establish Strong Vendor Management

When working with **third-party AI providers**, organizations must conduct thorough due diligence on data practices, establish contractual data protection obligations, perform regular vendor audits, coordinate incident response procedures, and define clear exit and data return procedures.

Maintaining **accountability** requires clearly defined controller-processor agreements, disciplined sub-processor management, documentation of all processing instructions, and regular compliance reviews of the vendor relationship.

### 6\. Engage with Thai Regulators

**Proactive regulatory engagement** positions organizations favorably in Thailand's evolving AI landscape. Organizations should participate in PDPC public consultations, join industry working groups focused on AI governance, seek regulatory guidance when facing uncertainty, maintain open communication channels with relevant authorities, and consider sandbox participation for novel AI applications through the DEPA program.

## Looking Ahead: Thailand's AI Regulatory Evolution

Thailand's AI regulatory landscape will continue developing as the government refines its approach to balancing innovation and protection.

An **enhanced AI governance framework** is expected in the coming years. Thailand may introduce comprehensive AI-specific legislation, establish a risk-based AI classification system, mandate AI registration for high-risk systems, require [algorithmic impact assessments](/glossary/algorithmic-impact-assessment), and develop AI auditing and certification schemes.

**Sector-specific AI regulations** are also anticipated, including more detailed financial AI requirements from the BOT and SEC, clearer medical AI regulatory pathways from the FDA, educational AI guidelines, and government AI procurement standards.

On the international front, Thailand is likely to pursue greater **alignment** with regional and global frameworks. This includes harmonizing with the ASEAN Digital Economy Framework, adopting ISO AI standards more broadly, seeking adequacy recognition from GDPR jurisdictions, and participating in international AI governance initiatives.

**Enforcement maturation** will bring more frequent PDPC enforcement actions, published guidance on AI compliance, industry-specific compliance frameworks, and expanded capacity building for regulators and courts.

## Conclusion

Thailand offers a dynamic environment for AI innovation supported by an increasingly sophisticated regulatory framework. The PDPA provides a strong foundation for data governance, while sector-specific regulations address industry-specific risks. Emerging AI governance initiatives signal Thailand's commitment to responsible AI development.

Success in the Thai market requires proactive compliance with existing requirements, engagement with evolving regulations, and commitment to ethical AI practices that respect Thai legal standards and cultural values. Organizations that invest in robust governance, transparency, and stakeholder trust will be well-positioned to thrive in Thailand's AI economy.

[Explore AI compliance requirements across Southeast Asia in our regional guide](/insights).

_Ready to navigate Thailand's AI regulatory landscape? [Contact Pertama Partners](/contact) for expert compliance advisory services._

## Common Questions

### 

Thailand's AI regulatory framework centers on the Personal Data Protection Act (PDPA) B.E. 2562, which governs how AI systems collect and process personal data. The Cybersecurity Act B.E. 2562 applies to AI systems in critical infrastructure sectors. Sector-specific regulations from the Bank of Thailand, SEC, FDA Thailand, and NBTC govern AI in financial services, healthcare, and telecommunications respectively. Thailand's National AI Strategy (2022-2027) guides AI governance development, including ethics frameworks, sandbox programs, and standards adoption.

### 

Yes, Section 34 of the PDPA grants data subjects the right not to be subject to decisions based solely on automated processing that produces legal effects or significantly affects them. Organizations must inform data subjects about automated decision-making, explain the logic and significance, disclose data categories used, and provide mechanisms for human intervention, objection, and contesting outcomes. This applies to AI credit scoring, hiring algorithms, insurance pricing, and similar automated decisions affecting individuals' rights.

### 

Cross-border transfers of personal data from Thailand require compliance with PDPA Section 28. Transfer mechanisms include: (1) adequacy decisions from the Personal Data Protection Committee (none designated yet); (2) PDPC-approved standard contractual clauses; (3) binding corporate rules for multinationals; or (4) explicit consent with clear disclosure. For AI training data, organizations should anonymize data where possible, conduct transfer impact assessments, implement contractual safeguards, and maintain comprehensive documentation of transfers and safeguards.

### 

Section 41 of the PDPA requires DPO appointment for government agencies, organizations processing large volumes of personal data, organizations regularly processing sensitive data, or organizations conducting large-scale systematic monitoring. Most AI operations involving significant personal data processing will trigger DPO requirements. The DPO monitors PDPA compliance, advises on data protection obligations, conducts training, serves as regulatory contact, and performs internal audits. DPOs must have expertise in data protection law and practices.

### 

The PDPA establishes significant penalties: criminal penalties include imprisonment up to 1 year and/or fines up to THB 1 million (approximately USD 28,000) for processing without consent, unlawful disclosure, or failure to comply with PDPC orders. Failure to notify data breaches carries fines up to THB 5 million (approximately USD 140,000). The PDPC may also issue administrative orders to cease processing, require corrective measures, impose data deletion, or suspend cross-border transfers. Civil liability includes compensation for damages caused by violations.

### 

Section 37 requires DPIAs for processing likely to result in high risk to data subjects' rights. AI systems requiring DPIAs include: systematic large-scale profiling, automated decision-making affecting legal rights, large-scale processing of sensitive data, systematic public area monitoring, children's data processing, and innovative technology use. The DPIA must describe processing operations, assess necessity and proportionality, evaluate risks, identify safeguards, and involve the DPO. Conduct DPIAs before deploying high-risk AI systems and update them when processing changes significantly.

### 

The Cybersecurity Act B.E. 2562 (2019) applies to critical information infrastructure (CII) operators in banking, finance, telecommunications, transportation, energy, government, and emergency services. AI systems operated by CII entities must comply with security measures including risk assessments, security monitoring, incident response procedures, business continuity planning, and regular audits. CII operators must immediately report cyber threats, provide detailed incident reports, and cooperate with government agencies. This affects AI infrastructure security, data protection, and operational resilience requirements.

### References

1.  Overview of Thailand Personal Data Protection Act B.E. 2562 (2019). Norton Rose Fulbright (2022). [View source](https://www.nortonrosefulbright.com/en/knowledge/publications/e29d223d/overview-of-thailand-personal-data-protection-act-be2562-2019)
2.  Thailand Personal Data Protection Act. U.S. International Trade Administration (2023). [View source](https://www.trade.gov/market-intelligence/thailand-personal-data-protection-act)
3.  Digital Economy Promotion Agency (depa) — About. depa Thailand (2024). [View source](https://www.depa.or.th/en/about-depa/background)
4.  A Closer Look at Vietnam's New AI Law: What It Means for AI Businesses. Tilleke & Gibbins (2025). [View source](https://www.tilleke.com/insights/a-closer-look-at-vietnams-new-ai-law-what-it-means-for-ai-businesses/)
5.  ASEAN Guide on AI Governance and Ethics. ASEAN Secretariat (2024). [View source](https://asean.org/wp-content/uploads/2024/02/ASEAN-Guide-on-AI-Governance-and-Ethics_beautified_201223_v2.pdf)
6.  Advancing AI Ethics and Governance in Thailand. OpenGov Asia (2023). [View source](https://opengovasia.com/2023/04/15/advancing-ai-ethics-and-governance-in-thailand/)
7.  Master Plan for Digital Economy. depa Thailand (2024). [View source](https://www.depa.or.th/en/master-plan-digital-economy/master-plan-for-digital-economy-66-67)