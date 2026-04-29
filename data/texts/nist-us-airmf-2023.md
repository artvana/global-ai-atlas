---
id: nist-us-airmf-2023
title: "NIST Artificial Intelligence Risk Management Framework (AI RMF 1.0)"
short_name: "NIST AI Risk Management Framework 1.0"
jurisdiction: NIST
enacted_date: 2023-01-26
status: in_force
official_url: https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
fetched_date: 2026-04-29
---

# NIST AI Risk Management Framework (AI RMF 1.0)
**NIST AI 100-1 | January 2023**

## Overview

The AI RMF provides a structured approach to managing AI risks through four core functions: GOVERN, MAP, MEASURE, and MANAGE. It is a voluntary framework intended to help organizations incorporate trustworthiness into AI systems throughout their design, development, deployment, and use.

The framework applies to AI systems across sectors. It is designed for flexibility, enabling organizations to apply its functions based on their resources, capabilities, and risk tolerance. It does not supersede existing law or regulation.

---

## Part 1: Foundational Information

### Framing Risk

AI risk refers to the potential negative impacts of an AI system, including harms to individuals, groups, organizations, communities, or society. Risk management involves identifying, assessing, and responding to these risks on an ongoing basis.

AI systems exhibit unique risk characteristics compared to traditional software: they can make probabilistic judgments, their behavior can be opaque, and they can have cascading societal effects. Trustworthy AI must exhibit multiple characteristics simultaneously: accuracy, reliability, safety, security, explainability, interpretability, privacy-enhancement, fairness (bias management), accountability, and transparency.

### AI Actors

AI risk management is the responsibility of all "AI actors" — anyone who plays a role in the AI lifecycle, including designers, developers, deployers, evaluators, users, and those affected by AI systems.

---

## Part 2: Core and Profiles

### 5. AI RMF Core

The Core is composed of four functions: GOVERN, MAP, MEASURE, and MANAGE. Each function is broken down into categories and subcategories representing specific actions and outcomes.

---

## 5.1 GOVERN

GOVERN cultivates a culture of risk management across an organization. It establishes policies, processes, and accountability structures for identifying and managing AI risks, and connects technical AI development to organizational values.

**GOVERN 1:** Policies, processes, procedures, and practices related to AI risk mapping, measuring, and managing are in place, transparent, and effectively implemented.
- GOVERN 1.1: Legal and regulatory requirements involving AI are understood, managed, and documented.
- GOVERN 1.2: Characteristics of trustworthy AI are integrated into organizational policies, processes, procedures, and practices.
- GOVERN 1.3: Processes are in place to determine the needed level of risk management activities based on the organization's risk tolerance.
- GOVERN 1.4: Risk management outcomes are established through transparent policies and controls based on organizational risk priorities.
- GOVERN 1.5: Ongoing monitoring and periodic review of the risk management process are planned and roles clearly defined.
- GOVERN 1.6: Mechanisms are in place to inventory AI systems, resourced according to risk priorities.
- GOVERN 1.7: Processes are in place for safely decommissioning and phasing out AI systems.

**GOVERN 2:** Accountability structures are in place so that teams are empowered, responsible, and trained for AI risk management.
- GOVERN 2.1: Roles, responsibilities, and communication lines for AI risk management are documented and clear throughout the organization.
- GOVERN 2.2: Personnel and partners receive AI risk management training consistent with related policies and agreements.
- GOVERN 2.3: Executive leadership takes responsibility for decisions about risks associated with AI system development and deployment.

**GOVERN 3:** Workforce diversity, equity, inclusion, and accessibility are prioritized in AI risk management throughout the lifecycle.
- GOVERN 3.1: Decision-making on AI risks is informed by a diverse team (demographics, disciplines, experience, expertise).
- GOVERN 3.2: Policies define and differentiate roles and responsibilities for human-AI configurations and oversight.

**GOVERN 4:** Organizational teams foster a culture that considers and communicates AI risk.
- GOVERN 4.1: Policies promote a critical thinking and safety-first mindset in AI design, development, deployment, and use.
- GOVERN 4.2: Teams document and communicate risks and potential impacts of the AI technology they work with.
- GOVERN 4.3: Practices are in place to enable AI testing, incident identification, and information sharing.

**GOVERN 5:** Processes are in place for robust engagement with relevant AI actors.
- GOVERN 5.1: Policies collect, consider, prioritize, and integrate feedback from external parties regarding potential societal impacts.
- GOVERN 5.2: Mechanisms enable teams to regularly incorporate adjudicated feedback from AI actors into system design.

**GOVERN 6:** Policies address AI risks and benefits from third-party software, data, and supply chain issues.
- GOVERN 6.1: Policies address AI risks from third-party entities, including intellectual property infringement risks.
- GOVERN 6.2: Contingency processes handle failures or incidents in third-party data or AI systems deemed high-risk.

---

## 5.2 MAP

MAP establishes context to frame risks related to an AI system. It identifies the system's purpose, potential uses, affected populations, and potential impacts — positive and negative.

**MAP 1:** Context is established and understood.
- MAP 1.1: Intended purposes, beneficial uses, context-specific laws, norms, and prospective deployment settings are understood and documented, including user expectations and potential impacts on individuals, communities, and society.
- MAP 1.2: Interdisciplinary AI actor participation with diverse demographics and domain expertise is documented.
- MAP 1.3: The organization's mission and goals for AI technology are understood and documented.
- MAP 1.4: Business value or context of business use is clearly defined or re-evaluated.
- MAP 1.5: Organizational risk tolerances are determined and documented.
- MAP 1.6: System requirements are elicited from relevant AI actors, with socio-technical implications considered.

**MAP 2:** Categorization of the AI system is performed.
- MAP 2.1: Specific tasks and implementation methods are defined (classifiers, generative models, recommenders, etc.).
- MAP 2.2: Information about AI system knowledge limits and human oversight of outputs is documented.
- MAP 2.3: Scientific integrity, TEVV (test, evaluation, verification, validation), and data quality considerations are identified and documented.

**MAP 3:** AI capabilities, targeted usage, goals, and expected benefits and costs are understood.
- MAP 3.1: Potential benefits of intended AI functionality and performance are examined and documented.
- MAP 3.2: Potential costs, including non-monetary costs from AI errors or poor trustworthiness, are examined and documented.
- MAP 3.3: Targeted application scope is specified based on capability, context, and AI system categorization.
- MAP 3.4: Processes for operator proficiency with AI performance and relevant standards are defined and documented.
- MAP 3.5: Processes for human oversight are defined, assessed, and documented per GOVERN policies.

**MAP 4:** Risks and benefits are mapped for all components including third-party software and data.
- MAP 4.1: Approaches for mapping AI technology and legal risks of components, including third-party use, are followed and documented.
- MAP 4.2: Internal risk controls for AI system components, including third-party technologies, are identified and documented.

**MAP 5:** Impacts to individuals, groups, communities, organizations, and society are characterized.
- MAP 5.1: Likelihood and magnitude of each identified impact — based on expected use, past uses, public incident reports, and external feedback — are identified and documented.
- MAP 5.2: Practices for supporting regular engagement with AI actors and integrating feedback about positive, negative, and unanticipated impacts are in place.

---

## 5.3 MEASURE

MEASURE employs quantitative, qualitative, or mixed-method tools to analyze, assess, benchmark, and monitor AI risk and impacts. It informs the MANAGE function through rigorous testing and documentation.

**MEASURE 1:** Appropriate methods and metrics are identified and applied.
- MEASURE 1.1: Measurement approaches for AI risks identified in MAP are selected, starting with the most significant risks. Unmeasurable risks are documented.
- MEASURE 1.2: Appropriateness of AI metrics and effectiveness of existing controls are regularly assessed and updated.
- MEASURE 1.3: Internal experts not involved in front-line development and/or independent assessors conduct regular assessments.

**MEASURE 2:** AI systems are evaluated for trustworthy characteristics.
- MEASURE 2.1: Test sets, metrics, and tools used during TEVV are documented.
- MEASURE 2.2: Evaluations involving human subjects meet applicable requirements and represent the relevant population.
- MEASURE 2.3: AI system performance or assurance criteria are measured and demonstrated for conditions similar to deployment settings.
- MEASURE 2.4: AI system functionality and behavior are monitored when in production.
- MEASURE 2.5: The AI system is demonstrated to be valid and reliable; limitations of generalizability are documented.
- MEASURE 2.6: The AI system is regularly evaluated for safety risks; residual negative risk must not exceed risk tolerance and the system must fail safely.
- MEASURE 2.7: AI system security and resilience are evaluated and documented.
- MEASURE 2.8: Transparency and accountability risks are examined and documented.
- MEASURE 2.9: The AI model is explained, validated, and documented; outputs are interpreted within context.
- MEASURE 2.10: Privacy risk of the AI system is examined and documented.
- MEASURE 2.11: Fairness and bias are evaluated and results are documented.
- MEASURE 2.12: Environmental impact and sustainability of AI model training and management are assessed and documented.
- MEASURE 2.13: Effectiveness of employed TEVV metrics and processes is evaluated and documented.

**MEASURE 3:** Mechanisms for tracking identified AI risks over time are in place.
- MEASURE 3.1: Approaches, personnel, and documentation regularly identify and track existing, unanticipated, and emergent AI risks.
- MEASURE 3.2: Risk tracking is considered where AI risks are difficult to assess using current measurement techniques.
- MEASURE 3.3: Feedback processes for end users and impacted communities to report problems and appeal outcomes are established.

**MEASURE 4:** Feedback about efficacy of measurement is gathered and assessed.
- MEASURE 4.1: Measurement approaches for AI risks are connected to deployment contexts and informed through consultation with domain experts.
- MEASURE 4.2: Measurement results on AI system trustworthiness in deployment contexts are validated through domain expert input.
- MEASURE 4.3: Measurable performance improvements or declines based on field data and stakeholder consultation are identified and documented.

---

## 5.4 MANAGE

MANAGE allocates risk resources to mapped and measured risks on a regular basis. It includes plans for responding to, recovering from, and communicating about incidents and events.

**MANAGE 1:** AI risks are prioritized, responded to, and managed based on MAP and MEASURE outputs.
- MANAGE 1.1: A determination is made whether the AI system achieves its intended purposes and whether development or deployment should proceed.
- MANAGE 1.2: Treatment of documented AI risks is prioritized based on impact, likelihood, and available resources.
- MANAGE 1.3: Responses to high-priority AI risks are developed, planned, and documented. Response options include mitigating, transferring, avoiding, or accepting.
- MANAGE 1.4: Negative residual risks to downstream acquirers and end users are documented.

**MANAGE 2:** Strategies to maximize AI benefits and minimize negative impacts are planned, implemented, and documented.
- MANAGE 2.1: Resources required to manage AI risks are considered alongside viable non-AI alternatives.
- MANAGE 2.2: Mechanisms are applied to sustain the value of deployed AI systems.
- MANAGE 2.3: Procedures respond to and recover from previously unknown risks when identified.
- MANAGE 2.4: Mechanisms are in place to supersede, disengage, or deactivate AI systems demonstrating performance inconsistent with intended use.

**MANAGE 3:** AI risks and benefits from third-party entities are managed.
- MANAGE 3.1: AI risks and benefits from third-party resources are regularly monitored, with controls applied and documented.
- MANAGE 3.2: Pre-trained models used for development are monitored as part of regular AI system maintenance.

**MANAGE 4:** Risk treatments including response, recovery, and communication plans are documented and regularly monitored.
- MANAGE 4.1: Post-deployment AI system monitoring plans are implemented, including mechanisms for user input, appeal and override, decommissioning, incident response, recovery, and change management.
- MANAGE 4.2: Measurable activities for continual improvements are integrated into AI system updates with regular stakeholder engagement.
- MANAGE 4.3: Incidents and errors are communicated to relevant AI actors, including affected communities. Processes for tracking, responding to, and recovering from incidents are followed and documented.

---

## Appendix B: How AI Risks Differ from Traditional Software Risks

AI systems exhibit properties that make risk management more complex than traditional software:

1. **Opacity**: AI system decision-making processes may not be fully explainable even to their developers.
2. **Data dependence**: AI system behavior is shaped by training data; biases in data can produce biased outcomes.
3. **Non-determinism**: The same input may produce different outputs across runs, complicating verification.
4. **Emergent behavior**: AI systems may exhibit behaviors not anticipated by their developers.
5. **Context sensitivity**: Performance may degrade significantly when deployed in contexts that differ from training.
6. **Third-party dependencies**: AI systems often rely on third-party models, datasets, and services, each with its own risk profile.
