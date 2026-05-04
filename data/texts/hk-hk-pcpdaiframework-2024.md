---
id: hk-hk-pcpdaiframework-2024
source_url: https://www.pcpd.org.hk/english/resources_centre/publications/files/ai_model_framework_e.pdf
fetched_date: 2026-05-04
---

# Artificial Intelligence: Model Personal Data Protection Framework

**Office of the Privacy Commissioner for Personal Data, Hong Kong (PCPD)**
**June 2024**

**Supporting Organisations:**
- Office of the Government Chief Information Officer
- Hong Kong Applied Science and Technology Research Institute

---

## Table of Contents

- Foreword
- Preface
- Introduction
- **Part I — AI Strategy and Governance**
  - 1.1 AI Strategy
  - 1.2 Governance Considerations for Procuring AI Solutions
  - 1.3 Governance Structure
  - 1.4 Training and Awareness Raising
- **Part II — Risk Assessment and Human Oversight**
  - 2.1 Risk Factors
  - 2.2 Determining the Level of Human Oversight
  - 2.3 Risk Mitigation Trade-offs
- **Part III — Customisation of AI Models and Implementation and Management of AI Systems**
  - 3.1 Data Preparation for Customisation and Use of AI
  - 3.2 Customisation and Implementation of AI Solutions
  - 3.3 Management and Continuous Monitoring of AI Systems
- **Part IV — Communication and Engagement with Stakeholders**
  - 4.1 Information Provision
  - 4.2 Data Subject Rights and Feedback
  - 4.3 Explainable AI
  - 4.4 Language and Manner
- Acknowledgement
- Appendix A — Data Protection Principles under the Personal Data (Privacy) Ordinance
- Appendix B — Main Publication Reference List

---

## Foreword

With its wide range of applications, artificial intelligence (AI) opens up abundant business opportunities. Although many enterprises are actively embracing AI technology with a view to increasing revenue, reducing expenditure and boosting productivity, the risks associated with AI should not be overlooked. For example, an AI system trained on insufficient or poor quality data may generate inaccurate or biased results. Further, if the training dataset contains personal data, they may be inadvertently disclosed during the output process.

Inevitably, the new risks arising from the innovative applications of AI present regulatory challenges. In response to the rapid development of AI, regulators around the world have rolled out various laws and regulations, including the Artificial Intelligence Act adopted by the European Parliament in March 2024, which aims to regulate AI systems according to their risk level, and the Interim Measures for the Management of Generative Artificial Intelligence Services issued by our Motherland in July 2023 with a view to promoting the healthy development of generative AI and regulating its application.

I am pleased that the Office of the Privacy Commissioner for Personal Data has published the Artificial Intelligence: Model Personal Data Protection Framework and taken the initiative to provide guidance for Hong Kong enterprises, enabling them to reap the benefits of AI technology while brushing up on personal data privacy protection. This publication will significantly enhance the level of AI governance within enterprises and ensure the proper use of the technology.

Adopting a risk-based approach, the Framework provides a set of practical and detailed recommendations for local enterprises intending to procure, implement and use AI systems. It covers the entire business process and provides pragmatic recommendations for enterprises, whether they are procuring existing AI solutions or customising AI solutions based on their needs. To ensure the protection of personal data privacy and the safe, ethical and responsible use of innovative technology, I encourage enterprises to refer to the Framework and implement the measures suggested within it when procuring and using AI systems.

**Prof Hon William WONG Kam-fai, MH**
Member of the National Committee of the Chinese People's Political Consultative Conference
Legislative Council Member
Associate Dean (External Affairs), Faculty of Engineering, the Chinese University of Hong Kong
June 2024

---

## Preface

The groundbreaking advancement of artificial intelligence (AI) is revolutionising our world in ways we never thought possible. My Office and I firmly believe that AI, although a double-edged sword, can be harnessed for the greater good provided that proper safeguards are in place, one of which is the implementation of a holistic personal data protection framework.

In August 2021, my Office took a significant step in this regard by publishing the Guidance on the Ethical Development and Use of Artificial Intelligence, which is one of the first leading guides in the Asia-Pacific region on the subject. Recognising that AI is a global challenge necessitating a global solution, we have striven to contribute at an international level by hosting international conferences on AI to facilitate meaningful dialogues among experts, and by co-sponsoring resolutions on responsible and trustworthy AI at the Global Privacy Assembly, a forum uniting over 130 data protection authorities.

To support the Global AI Governance Initiative of the Motherland, my Office has developed the Artificial Intelligence: Model Personal Data Protection Framework ("Model Framework"), which targets organisations procuring, implementing and using AI systems that involve the use of personal data. The Model Framework aligns with general business processes and is structured to ensure the effective governance of AI systems that adheres to the three Data Stewardship Values and seven Ethical Principles advocated in our AI guidance of 2021.

**Ada CHUNG Lai-ling**
Privacy Commissioner for Personal Data
June 2024

---

## Introduction

1. Artificial intelligence ("AI") has no universal definition but generally refers to a family of technologies that mimic human intelligence and involve the use of computer programmes and machines to perform or automate tasks, including solving problems, providing recommendations and predictions, making decisions and generating contents by inferring from input data.

### The 2021 AI Guidance

2. In August 2021, the PCPD published the Guidance on the Ethical Development and Use of Artificial Intelligence ("2021 AI Guidance"), with recommendations that primarily target organisations that develop and use AI systems involving the use of personal data.

3. The 2021 AI Guidance recommends that organisations embrace three Data Stewardship Values, namely, (1) being respectful, (2) being beneficial, and (3) being fair. It encourages organisations to adopt the seven internationally recognised Ethical Principles for AI, namely (1) accountability, (2) human oversight, (3) transparency and interpretability, (4) data privacy, (5) fairness, (6) beneficial AI, and (7) reliability, robustness and security.

### The Trend of AI Adoption

4. In recent years, AI has experienced seismic changes with the advent of foundation models. Foundation models are AI models that have been trained on a vast amount of unstructured data, which allows them to be adapted for a wide range of tasks, operations and applications. Large language models ("LLMs"), for example, are foundation models trained on text data that can be adapted to facilitate tasks which require natural language processing, such as chatbots.

5. As more organisations are adopting AI into their operations, there has been an increasing trend, especially among small and medium-sized enterprises, towards purchasing AI solutions from vendors and developers that are tailored to the purchasers' specific use cases, instead of developing AI systems from scratch.

### Focus of this Model Framework

6. This Model Framework provides a set of recommendations on the best practices for any organisations procuring, implementing and using any type of AI systems that involve the use of personal data, which may include predictive AI and generative AI.

7. In this Model Framework, the term "organisations" refers to organisations that procure AI solutions from third parties and engage in the handling of personal data in (a) customising an AI system to improve its performance for a specific domain or use case and/or (b) operating the AI system; and the term "AI supplier" refers to both AI developers and/or AI vendors who provide AI solutions to the organisations.

### Compliance with the Personal Data (Privacy) Ordinance

8. Organisations should ensure compliance with the requirements under the Personal Data (Privacy) Ordinance ("PDPO"), including the six Data Protection Principles ("DPPs") in Schedule 1 thereto, when handling personal data in the process of procuring, implementing and using AI solutions.

9. The recommendations in this Model Framework are by no means exhaustive. Organisations should adopt other measures as appropriate to comply with the PDPO and to adhere to the Data Stewardship Values and the Ethical Principles for AI.

10. The PCPD advocates the adoption of a Personal Data Privacy Management Programme ("PMP") to ensure the responsible collection, holding, processing and use of personal data, thereby enhancing data governance.

### Model Personal Data Protection Framework

11. To ensure that the Data Stewardship Values and the Ethical Principles for AI are implemented, organisations should formulate appropriate policies, practices and procedures when they procure, implement and use AI solutions by taking into consideration the recommended measures in the following areas:

- AI Strategy and Governance (Part I)
- Risk Assessment and Human Oversight (Part II)
- Customisation of AI Models and Implementation and Management of AI Systems (Part III)
- Communication and Engagement with Stakeholders (Part IV)

12. In general, organisations sourcing third-party AI solutions should adopt a risk-based approach to procuring, implementing and using AI systems, as part of a broader, holistic approach to AI governance in their organisations.

---

## Part I — AI Strategy and Governance

13. Buy-in from and active participation by top management (such as executive or board level) are essential ingredients of success in the ethical and responsible procurement, implementation and use of AI systems. Organisations should have an internal AI governance strategy, which generally comprises an (i) AI strategy, (ii) governance considerations for procuring AI solutions, and (iii) an AI governance committee (or similar body) to steer the process.

### 1.1 AI Strategy

14. Organisations should formulate an AI strategy to demonstrate the commitment of top management to the ethical and responsible procurement, implementation and use of AI. The AI strategy, which should provide directions on the purposes for which AI solutions may be procured, and how AI systems should be implemented and used, may include the following elements:

(i) Defining the functions that AI systems would serve in the technological ecosystem of the organisation;
(ii) Setting out ethical principles for the procurement, implementation and use of AI solutions;
(iii) Determining the unacceptable uses of AI systems in the organisation;
(iv) Establishing an AI inventory to facilitate the implementation of governance measures;
(v) Establishing specific internal policies and procedures regarding how to ethically procure, implement and use AI solutions;
(vi) Ensuring that the appropriate technical infrastructure is in place to support lawful, responsible and quality AI implementation and use;
(vii) Regularly communicating the AI strategy, policies and procedures to all relevant personnel;
(viii) Considering emerging laws and regulations that may be applicable to the procurement, implementation and use of AI; and
(ix) Continuously reviewing and adjusting the AI strategy based on feedback.

### 1.2 Governance Considerations for Procuring AI Solutions

15. The procurement of AI solutions generally involves engaging third parties to customise AI systems or buying/subscribing to off-the-shelf AI systems/services. Such procurement practices typically include the following steps:

(i) Sourcing appropriate AI solutions and considering the expertise and reputation of AI suppliers;
(ii) Selecting the AI solution with AI models that are suitable for the organisation's purposes;
(iii) Collecting and preparing the organisation's data for customising the AI model (if necessary);
(iv) Customising the AI model for particular purpose (if necessary);
(v) Testing, evaluating and validating the AI model;
(vi) Testing and auditing the system and its components for security and privacy risks; and
(vii) Integrating the AI solution into the organisation's systems.

16. An organisation intending to invest in AI solutions is recommended to consider governance issues including: the purposes of using AI; privacy and security obligations; international technical and governance standards; criteria for reviewing AI solutions; data processor agreements; policy on handling AI-generated output; and evaluation of AI suppliers' competence.

### 1.3 Governance Structure

20. An internal governance structure with sufficient resources, expertise and authority should be established to steer the implementation of the AI strategy and oversee the procurement, implementation and use of AI systems. An AI governance structure may include:

(i) An AI governance committee (or similar body) with participation by senior management and interdisciplinary collaboration, reporting to the board and overseeing the whole life cycle of all AI solutions;
(ii) Clear roles and responsibilities for different divisions or personnel; and
(iii) Adequate resources in terms of both finance and manpower.

### 1.4 Training and Awareness Raising

21. To ensure that AI-related policies are properly applied, adequate training should be provided to all relevant personnel to ensure that they have the appropriate knowledge, skills and awareness to work in an environment using AI systems.

22. Any personal data privacy protection training covering the requirements of the PDPO and the organisation's privacy policies should also cover the collection and use of personal data in the procurement, implementation and use of AI systems.

23. The importance of ethical AI and applicable principles should be conveyed to all relevant personnel through staff meetings or other internal communications to cultivate and promote an ethical and privacy-protecting culture.

---

## Part II — Risk Assessment and Human Oversight

24. The risk levels of different AI systems depend on how the organisation uses the systems and the specific purposes for which they are used. For example:

- An AI system which assesses the credit worthiness of individuals tends to carry a higher risk than a system used to present individuals with personalised advertisements.
- A generative AI tool used for internal translation is less likely to have a significant impact on individuals than a generative AI chatbot generating direct responses to customer enquiries.
- An AI system with full autonomous decision-making capabilities may be riskier than a system that involves some degree of human operation.

25. A risk-based approach should be adopted in the procurement, use and management of AI systems. Comprehensive risk assessment is necessary for organisations to systematically identify, analyse and evaluate the risks, including privacy risks, involved in the process.

26. Risk assessments should be conducted by a cross-functional team during the procurement process or when significant updates are made to an existing AI system. All risk assessments should be properly documented.

### 2.1 Risk Factors

27. As the use of AI often involves the use of personal data, it is essential to address data privacy risks. Organisations should consider the following factors in a risk assessment:

(i) The allowable uses of the data for customising procured AI solutions, having regard to DPP 3 of the PDPO;
(ii) The volume of personal data required for customising AI models and collected by the AI system during operation;
(iii) The sensitivity of the data involved, having regard to DPP 4 of the PDPO;
(iv) The quality of the data involved, taking into account source, reliability, integrity, accuracy, consistency, completeness, relevance and usability;
(v) The security of personal data used in an AI system; and
(vi) The probability that privacy risks will materialise and the potential severity of the harm.

28. From a wider ethical perspective, the risk assessment should also take into account: the potential impacts of the AI system on affected individuals, the organisation and the wider community; the probability, severity and duration of the impacts; and the adequacy of mitigation measures.

29. Potential impacts on individuals as a result of the use of AI systems may affect their legal rights, human rights (including privacy rights), employment or educational prospects, as well as their access and eligibility to services. An AI system likely to produce output that may have such significant impacts on individuals would generally be considered high risk.

### 2.2 Determining the Level of Human Oversight

30. In adopting a risk-based approach, the types and extent of risk mitigation measures should correspond with and be proportionate to the levels of the identified risks.

31. Human oversight is a key measure for mitigating the risks of using AI. Ultimately, human actors should be held accountable for the decisions and output made by AI.

32. In general:
- A **high-risk AI system** should take a "human-in-the-loop" approach, where human actors retain control of the decision-making process to prevent and/or mitigate errors or improper output and/or decisions made by AI.
- An AI system with **minimal or low risks** may take a "human-out-of-the-loop" approach, whereby the AI system is given the capability to adopt output and/or make decisions without human intervention.
- If neither approach is suitable, organisations may consider a **"human-in-command"** approach, whereby human actors make use of the output of the AI system and oversee the operation of the AI system and intervene whenever necessary.

### 2.3 Risk Mitigation Trade-offs

34. When seeking to mitigate AI risks, organisations may need to strike a balance when conflicting criteria emerge and make trade-offs, including:

1. **Predictive accuracy vs. Output explainability** — Certain AI models are easier to interpret but have less predictive accuracy; deep learning neural networks are generally more accurate but are often "black boxes."
2. **Statistical accuracy of data vs. Data minimisation** — More data may improve accuracy but organisations should ensure only adequate data is used.
3. **Explainability vs. Data security/privacy** — Providing explanations may reveal information about the AI model's inner workings.
4. **Output accuracy vs. Privacy enhancing technologies** — PETs such as synthetic data or differential privacy can minimise personal data use but may affect output accuracy.

---

## Part III — Customisation of AI Models and Implementation and Management of AI Systems

### 3.1 Data Preparation for Customisation and Use of AI

39. Internal proprietary data, often involving personal data, may be used in both the customisation and decision-making or output stages. Good data governance in the customisation and operation of AI not only protects individuals' personal data privacy but also ensures data quality, which is critical to the robustness and fairness of AI systems.

41. Organisations should take the following steps in the preparation of datasets:
- Measures must be adopted to ensure compliance with the requirements under the PDPO;
- Minimising the amount of personal data involved in the customisation and use of AI models;
- Managing the quality of the data used; and
- Properly documenting the handling of data for the customisation and use of AI.

### 3.2 Customisation and Implementation of AI Solutions

42. If customisation is necessary, organisations need to apply the prepared data to customise the procured AI model to suit the specific needs and purposes of AI use.

43. In proportion to the level of risks involved, there should be rigorous testing and validation of the AI models to ensure that they perform as intended, and their reliability, robustness and fairness should be evaluated before deployment.

44. Organisations may need to take into account other considerations for compliance with the PDPO, depending on how the AI solution is to be integrated, whether it will be hosted on an on-premises server or on a cloud server provided by a third party.

46. Organisations should consider adopting the following measures to ensure that an AI system is robust, reliable and secure: implementing measures to minimise the risk of attacks against machine learning models; implementing internal guidelines for staff on acceptable input; establishing multiple layers of mitigation to prevent system errors; establishing contingency plans; and establishing mechanisms to ensure sufficient transparency of the AI system's operations.

### 3.3 Management and Continuous Monitoring of AI Systems

47. AI systems should be monitored and reviewed continuously because the risk factors related to their use may change over time. An AI model itself may also evolve as it learns over time.

48. High-risk AI systems would necessitate more frequent and stringent monitoring and review than low-risk systems. Organisations should consider: maintaining proper documentation; monitoring and logging input to AI systems; conducting re-assessments when significant changes occur; conducting periodic reviews of AI models; monitoring for "model drift" or "model decay"; establishing ongoing feedback channels; ensuring appropriate human oversight; maintaining robust security measures; and regularly evaluating the wider technological landscape.

49. Organisations are recommended to consider establishing an **AI Incident Response Plan** encompassing: defining an AI incident; monitoring for AI incidents; reporting an AI incident; containing an AI incident; investigating an AI incident; and recovering from an AI incident.

50. Internal audits (and independent assessments, where necessary) should be conducted periodically to ensure that the use of AI continues to comply with the relevant policies of the organisation and align with its AI strategy.

---

## Part IV — Communication and Engagement with Stakeholders

### 4.1 Information Provision

51. An organisation's use of AI should be transparent to stakeholders to demonstrate the organisation's adherence to the "Transparency and Interpretability" principle. Organisations should communicate and engage effectively and regularly with stakeholders, in particular internal staff, AI suppliers, individual customers and regulators.

52. Where personal data are involved, organisations must communicate the required information to the data subjects concerned in accordance with DPP 1(3) and DPP 5 of the PDPO, including the purpose for which the personal data are used, the classes of persons to whom the data may be transferred, and the organisation's policies and practices in relation to personal data.

53. To enhance transparency, organisations should consider: clearly and prominently disclosing the use of AI systems; providing adequate information on the purposes, benefits, limitations and effects of using AI systems; and disclosing the results of risk assessment of their AI systems.

### 4.2 Data Subject Rights and Feedback

55. Where an organisation using AI processes personal data, it should take note that data subjects have the right to submit data access requests and data correction requests respectively under sections 18 and 22 of the PDPO.

56. For an AI system that produces decisions/output that may have a significant impact on individuals, organisations should, to the extent possible, provide channels for individuals to provide feedback, seek explanation, and/or request human intervention.

### 4.3 Explainable AI

58. Making the decisions and output of AI explainable is the key to building trust with stakeholders. Explanations, where feasible, may include: how and to what extent AI has been involved in the decision-making process; how personal data has been used; and the major factors leading to the automated decisions/output by the AI system.

### 4.4 Language and Manner

60. Communication with stakeholders, particularly consumers, should be in plain language that is clear and understandable to lay persons, and such communication should be drawn to the attention of stakeholders.

---

## Appendix A — Data Protection Principles under the Personal Data (Privacy) Ordinance

The Personal Data (Privacy) Ordinance (Cap. 486) ("PDPO") governs the collection, holding, processing and use of personal data by both private and public sectors. The PDPO is technology-neutral and principle-based.

- **DPP 1 — Purpose and Manner of Collection:** Personal data shall only be collected for a lawful purpose directly related to a function or activity of the data user. The means of collection shall be lawful and fair. The data collected shall be necessary and adequate but not excessive for such purpose.
- **DPP 2 — Accuracy and Duration of Retention:** Data users must take all practicable steps to ensure that personal data is accurate and is not kept longer than is necessary for the fulfilment of the purpose for which the data is used.
- **DPP 3 — Use of Data:** Prohibits the use of personal data for any new purpose which is different from and unrelated to the original purpose of collection, unless express and voluntary consent has been obtained from the data subjects.
- **DPP 4 — Data Security:** Requires data users to take all practicable steps to protect the personal data they hold against unauthorized or accidental access, processing, erasure, loss or use.
- **DPP 5 — Openness and Transparency:** Obliges data users to take all practicable steps to ensure certain information, including their policies and practices in relation to personal data, is generally available to the public.
- **DPP 6 — Access and Correction:** Provides data subjects with the right to request access to and correction of their own personal data.

---

## Appendix B — Main Publication Reference List

- NIST, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)* (2023)
- ISO/IEC 23894:2023 — Information technology — Artificial intelligence — Guidance on risk management
- ISO/IEC 42001:2023 — Information technology — Artificial intelligence management system
- OECD, *AI principles* (2024)
- UNESCO, *Recommendation on the Ethics of Artificial Intelligence* (2023)
- PCPD, *Guidance on the Ethical Development and Use of Artificial Intelligence* (2021)
- Singapore IMDA and AI Verify Foundation, *Proposed Model AI Governance Framework For Generative AI* (2024)

---

*Published by the Office of the Privacy Commissioner for Personal Data, Hong Kong. June 2024.*
*Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).*
*PCPD Website: pcpd.org.hk | Tel: 2827 2827 | Address: Unit 1303, 13/F., Dah Sing Financial Centre, 248 Queen's Road East, Wanchai, Hong Kong*
