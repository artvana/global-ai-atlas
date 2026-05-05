---
id: asean-asean-aigov-genai-2025
source_url: https://asean.org
fetched_date: 2026-05-04
---

# EXPANDED ASEAN GUIDE ON AI GOVERNANCE AND ETHICS — GENERATIVE AI

---

## EXECUTIVE SUMMARY

### What this Expanded Guide is for

This document supplements and supports the *ASEAN Guide on AI Governance and Ethics (2024)* with policy considerations related to generative AI (Gen AI). It provides a view of the opportunities and risks of Gen AI and recommends a range of policy actions for ASEAN to support its responsible adoption. These recommendations emphasise the importance of promoting the numerous benefits of Gen AI alongside thoughtful, proportional, and regionally interoperable measures that ensure its safety.

### Potential Risks of Gen AI

This Guide aims to provide guidance on addressing the six Gen AI risks identified in the ASEAN AI Guide (2024):

- Mistakes and anthropomorphism
- Factually inaccurate responses and disinformation
- Deepfakes, impersonation, fraudulent and malicious activities
- Infringement of intellectual property rights
- Privacy and confidentiality
- Propagation of embedded biases

This Guide also explores frontier and systemic risks posed by long-term evolution in the capabilities of highly advanced Gen AI models, but which are not widespread in ASEAN at this time.

### Policy Recommendations for Addressing Gen AI Risks

The Guide's recommendations are organised across nine ecosystem dimensions:

1. Accountability
2. Data
3. Trusted Development and Deployment
4. Incident Reporting
5. Testing and Assurance
6. Security
7. Content Provenance
8. Safety and Alignment Research & Development
9. AI for Public Good

### Use Cases

Four use cases illustrate implementation:

- **PhoGPT** — VinAI (Vietnam)
- **Project Moonshot** — AI Verify Foundation (Singapore)
- **Responsible AI Internal Programme** — Accenture (ASEAN-wide)
- **ThaiLLM** — BDI, NSTDA, VISTEC and collaborators (Thailand)

---

# 01 — INTRODUCTION

## 1.1 Context

A major advancement occurred in the field of Artificial Intelligence (AI) in the mid-2010s with the development of the first Generative AI ("Gen AI") systems, which instead of the descriptions or predictions of earlier AI systems could draw on a large dataset to create "content." This content could take the form of text, images, audio, videos, computer code, and a wide variety of other materials.

### Fundamentals of Gen AI

Traditional AI, sometimes called predictive or diagnostic AI, is trained on data to complete tasks like classifying data or providing recommendations. Gen AI is a family of technologies that is distinct because it uses some of these same fundamental machine learning approaches, in combination with a large dataset, to produce content.

It is a recent innovation in AI technology that builds on the past several decades of innovation in machine learning and deep learning. The outputs of modern Gen AI can sometimes resemble authentic content, such as text that appears to be written by a human, images that resemble real photographs, or audio that resembles human speech. It typically does so in response to user instructions, in the form of a short written statement called a prompt.

The core technologies powering most Gen AI are called foundation models. These are probabilistic statistical models that are trained on content and designed to generate it. This training is typically supplemented with techniques that further adjust foundation models to improve quality or safety. This can be done by third parties. One or more foundation models working together, combined with the enabling infrastructure, user interface, additional safety measures, and application layer that modifies how they are to be used, is called a Gen AI system.

While Gen AI systems can sometimes imitate human behaviours, they are not creative, self-aware, or intelligent. Instead, they are powerful tools for inferring statistical trends from a dataset and applying those trends to produce new content that resembles its training dataset. Some Gen AI systems continue to update their datasets and improve over time or evolve in response to their use.

Gen AI shares many of the same characteristics and challenges of advanced forms of traditional AI, such as having outputs that are hard to explain or having the potential to inadvertently learn undesirable behaviours from training data.

### Economic Opportunity

Gen AI represents a leap forward in AI capabilities and an enormous economic and social opportunity for ASEAN member states, with its total economic opportunity across the greater APAC region estimated to reach nearly **S$6 trillion through 2038**. Gen AI can automate repetitive tasks, accelerate creative creative endeavours, and improve the personalisation and responsiveness of public services. The capability of some Gen AI systems to interact with user prompts written in "natural language" rather than computer code presents an opportunity to democratise access to AI for users and small businesses without the need for extensive technical knowledge.

## 1.2 Objectives and Target Audience

This Guide is designed as a resource for ASEAN policymakers to understand the primary challenges they might encounter when working on subjects related to Gen AI, as well as potential strategies for addressing them.

This Guide is meant to be used in conjunction with the ASEAN AI Guide (2024). Unless otherwise specified, the definitions, recommendations, and practices set out in that document continue to apply here.

## 1.3 Guiding Principles for the Gen AI Framework

The ASEAN AI Guide (2024) set out seven guiding principles for fostering trust in AI. These principles continue to be relevant; however, Gen AI introduces additional considerations.

### Transparency and Explainability

Transparency in AI involves clear disclosure of its usage, how it is involved in decision-making, the kind of data used, and purpose of its use. Explainability is the ability to articulate AI's decision-making process.

Gen AI systems may be more complex, with behaviours and outputs that can be unclear or challenging to explain (e.g. so-called "black box" algorithms). It is important to build public trust by ensuring that users are aware that they are interacting with Gen AI and of how data is being used. Such disclosure will need to be balanced against other competing considerations, such as the need to protect proprietary or commercially sensitive information.

Several explainability techniques are being developed, and post-hoc explanation methods, which analyse models after they have generated their output, are becoming increasingly sophisticated. While organisations should ideally aim to develop or choose Gen AI models that are more explainable, this may not always be possible. Other options could include improving traceability — though this may also have its limits given the inherent nature of Gen AI.

### Fairness and Equity

Fairness and equity in AI focuses on having safeguards in place to ensure that AI does not exacerbate or amplify existing discriminatory or unjust impacts across different demographics.

Foundation models underpinning Gen AI systems are often trained on large swathes of internet-sourced data, which may reflect existing social biases. There are also concerns over whether such data is fully representative of different perspectives or cultures due to the potential for oversampling well-connected populations in common languages.

Gen AI, if not managed well, can magnify societal biases through a variety of mechanisms, including by "learning" biases in training datasets, receiving biased feedback during fine-tuning, or incorporating biases from user inputs during inference.

> **Footnote on metrics:** Common metrics for evaluating LLM fairness include BOLD (Bias in Open-Ended Language Generation Dataset) statistics, which contains 23,679 internet-sourced prompts related to profession, gender, race, religious belief, and political ideology. RealToxicityPrompts is another widely used library containing over 100,000 prompts.

### Security and Safety

Safety in AI involves risk assessments and mitigation for developers, deployers and users. Security in AI is about ensuring the confidentiality, integrity and availability of AI systems, including against malicious attacks.

Many in the Gen AI industry mitigate risks using technical methods such as Reinforcement Learning from Human Feedback (RLHF) and Constitutional AI. Current methods of evaluating Gen AI models for safety can involve red teaming to expose unsafe behaviours.

Measures should be taken to guard against "prompt injection," "data poisoning," and other kinds of Gen AI-specific attacks. A useful reference for a taxonomy of relevant attacks is NIST's AI 100-2 E2023.

### Human-centricity

Gen AI has the potential to impact human lives and livelihoods both positively and negatively. The absence of a human-centric approach can lead to employment disruptions, reduced social benefits, and various forms of exclusion. Gen AI should be used to enhance human creativity and promote collaboration between humans and AI, thereby expanding the creative potential of individuals instead of reducing it.

### Privacy and Data Governance

Gen AI has raised privacy, intellectual property and personal data protection issues due to the practice of "scraping" training data from the internet, which may include personal data. The ability for Gen AI to "memorise" and release training data as output increases the risks of accidental disclosure.

Organisations should follow a privacy-by-design methodology, including:
- Minimising data collection to what is necessary
- Data anonymisation where doing so does not unjustifiably jeopardise model effectiveness
- Introducing safeguards within the model to refuse to disclose personal data
- Ensuring appropriate grounds or a legal basis to process personal data

To facilitate proper data governance, organisations should establish data traceability, internally verify accuracy and integrity, and be transparent within reasonable commercial bounds about training data sources and processing.

### Accountability and Integrity

Notably, the development and deployment of Gen AI involves multiple layers in the tech stack. Control over the Gen AI system may also shift between deployers, developers and users across the value chain. This has an impact on how responsibility can be shared between different stakeholders.

The importance of dynamic testing to address unforeseen behaviours, and clear, adaptable terms and conditions to manage accountability as systems evolve, is highlighted.

### Robustness and Reliability

Gen AI systems should be sufficiently robust to cope with errors during execution, unexpected or erroneous input, or potential changes in their operating environment. However, in some cases Gen AI systems can produce inconsistent results due to factors like biases in training data, data quality issues, or model architecture.

Developers and deployers should aim to create measurable quantitative benchmarks and/or standards for acceptable outcomes, acknowledging that the behaviour of Gen AI systems will not be deterministic but will instead fall within a certain range. Developers and deployers should consider implementing guardrails to prevent their Gen AI systems from responding to out-of-context or erroneous prompts.

---

# 02 — GEN AI RISKS

## 2.1 New or Enhanced Risks

Gen AI carries risks that may require new approaches to governance to address. The six unique Gen AI risks described by the ASEAN AI Guide (2024) are:

**1. Mistakes and anthropomorphism:** Gen AI systems can make highly coherent and persuasive mistakes, often referred to as "hallucinations" — such as providing incorrect medical advice or generating vulnerable software code.

**2. Factually inaccurate responses and disinformation:** Gen AI systems can amplify false or misleading information, shaping public perception and eroding trust in reliable sources.

**3. Deepfakes, impersonation, fraudulent and malicious activities:** Gen AI systems pose risks of impersonation or misinformation by creating realistic content like deepfakes and phishing emails, making it harder to prevent identity theft, identify deception, and protect confidential information.

**4. Infringement of intellectual property rights:** The development and use of Gen AI systems may lead to legal repercussions if copyrighted works are used as training data without an appropriate legal basis, or if generated content too closely resembles existing works.

**5. Privacy and confidentiality:** Gen AI systems can occasionally memorise and reproduce specific training data, or otherwise allow malicious actors to reconstruct sensitive information through their prompts. Employees may also inadvertently disclose confidential data during interactions.

**6. Propagation of embedded biases:** Gen AI systems can inherit and reflect biases from their training data, leading to biased or toxic outputs that reinforce stereotypes.

## 2.2 Frontier and Systemic Risks for Future Consideration

Frontier risks are primarily concerned with the use, controllability, and value-alignment of highly advanced Gen AI systems.

**Use risks:** Dangerous information (such as information related to CBRNE — Chemical, Biological, Radiological, Nuclear, and high-yield Explosive — weapons) could potentially be accessed using Gen AI systems, increasing the capabilities of malicious actors. There are additional concerns around how Gen AI can increase the scale and sophistication of scams and fraud or generate non-consensual deepfake pornography.

**Controllability:** The expert community is divided over when and whether AI could become fully autonomous and independent of human constraint. There is broad consensus that current technology does not have the capability to pose such risks. However, there is ongoing scientific debate on how plausible such scenarios are, when they might occur, and how difficult it is to mitigate them.

**Misalignment:** In the longer term, there is concern about the risk of misalignment as agentic, self-improving AI systems able to work autonomously without human oversight pursue goals in ways that harm human interests.

**Systemic risks:** Long-term systemic risks include potential labour market impacts, privacy risks, and environmental effects. There is concern over the growing use of computing power in general-purpose AI development and the corresponding rapid increase in energy usage, leading to further increases in CO2 emissions and water consumption.

Above all, experts have noted that it is difficult to assess the downstream societal impact of Gen AI; there is currently insufficient research to produce rigorous and comprehensive risk assessment methodologies in this domain.

---

# 03 — POLICY RECOMMENDATIONS

*This section is intended for ASEAN policymakers. Recommendations to national policymakers are not included.*

## 3.1 Accountability

Like most software, Gen AI involves multiple layers in its technology stack. Organisations are likely to choose to partner with a software provider or explore open-source options to access Gen AI models. They may also license whole software systems from partners (e.g., chatbots powered by LLMs) or use Gen AI in a software-as-a-service (SaaS) model.

Useful models include shared responsibility frameworks in other domains, particularly cloud computing, where the framework demarcates roles of providers and customers and sets out clear service standards.

### Areas for ASEAN to explore:

**(a) Developing a common understanding around shared responsibility**

ASEAN can encourage and facilitate collaboration among developers, deployers, regulators, cloud providers, and civil society. Potential outputs from such forums can include a voluntary framework or set of principles for all stakeholders in the Gen AI value chain, including model creators and cloud providers. Such output should also align with existing international developments and best practices, e.g., the **Hiroshima Process International Code of Conduct for Organisations Developing Advanced AI Systems**.

## 3.2 Data

Data is the key building block in all machine learning approaches. Gen AI is built on data: by learning from ever-larger datasets of real content, Gen AI has leapt forward in its capabilities.

For ASEAN to reap the benefits of Gen AI, there is a need to ensure access to high-quality data in sufficient volumes. For example, access to data in ASEAN languages can improve the performance of Gen AI for these languages.

### Areas for ASEAN to explore:

**(a) Facilitating data sharing to develop ASEAN-relevant models**

ASEAN can promote the collation of high-quality open datasets and support for industry data sharing. Publicly shared data, combined with data sharing or sales among industry actors, offers opportunities to level the playing field — especially for smaller firms — and minimise risks like feedback loops. ASEAN Member States can collaborate to share expertise and develop best practices, such as a compendium of machine-readable data sources from across ASEAN and in regionally relevant languages.

**Box: BDI, NSTDA, VISTEC and collaborators — ThaiLLM**

Thai-language applications of Gen AI have been constrained by the limited performance and cultural sensitivity of leading LLMs developed in Western countries. ThaiLLM is a public sector initiative to train an open-source LLM specifically on a corpus of Thai-language text. ThaiLLM aspires to become a shared national infrastructure, allowing LLM developers to contribute their own Thai-language text datasets under open-source licenses.

**Box: VinAI — PhoGPT**

VinAI's PhoGPT was trained on a dataset of over 102 billion words of Vietnamese text from sources like Wikipedia, books, legal documents, and news articles. As an open-source model, PhoGPT encourages innovation, collaboration, and broader access to Vietnamese-language AI technology. VinAI plans to extend PhoGPT to other underrepresented ASEAN languages.

**Box: AI Singapore — SEA-LION**

AI Singapore has developed a family of open-source LLMs called SEA-LION (South East Asian Languages in One Network). The latest version supports Bahasa Indonesia, Burmese, Chinese, English, Filipino, Khmer, Lao, Malay, Tamil, Thai, and Vietnamese. The model is also expanding into major regional dialects, such as Javanese and Sundanese in Indonesia, and Visayan and Ilocano in the Philippines.

**(b) Developing a common approach to personal data protection and data governance in AI**

Tools include the **ASEAN Framework on Personal Data Protection** and platforms such as the **ASEAN Data Protection and Privacy Forum (ADPPF)**.

Apart from personal data protection, attention could be paid to developing regional guidelines or common approaches towards data handling, storage, and governance for Gen AI. Where relevant, ASEAN should take reference from existing data governance practices from bodies like ISO, NIST, and the OECD to reduce global fragmentation and support cross-border trade.

## 3.3 Trusted Development and Deployment

The integration of best practices for safety, ethics, and functionality into the governance process is important.

In Gen AI development, several safety best practices are commonly accepted:
- Reinforcement learning to enhance model quality through human or automated feedback
- Grounding methods to ensure outputs remain contextually appropriate
- Tailored design of application components
- Transparency features and user empowerment tools

Deployment best practices focus on model evaluation:
- Comparing performance to standard industry benchmarks
- Adversarial testing (red teaming)
- RAGAs evaluations for retrieval-augmented generation systems
- Input/output filtering, user training, human moderation, continuous system monitoring

Transparency around safety best practices is akin to "food or ingredient labels" — providing relevant information to downstream deployers and end users, so they can make informed decisions.

### Areas for ASEAN to explore:

**(a) Establishing guidelines for the development and deployment of Gen AI models and/or applications**

ASEAN should prioritise alignment and interoperability with the work of bodies like ISO, NIST, and the OECD. Guidelines should function as a horizontal baseline that can be adapted to sector-specific considerations.

**(b) Coalescing around common disclosure elements**

A careful balance in disclosure is required to consider both the need of deployers to understand the tools they are using and the need for developers to protect trade secrets and intellectual property.

**Box: Accenture Responsible AI Internal Programme**

Three elements:
- Conducting RAI Risk Assessments for each use case
- Systemic Enablement for RAI Testing to embed risk-based controls
- Ongoing Monitoring and Compliance

The programme has supported the delivery of thousands of AI solutions and has delivered training to over 750,000 employees.

## 3.4 Incident Reporting

When Gen AI systems create harm of sufficient severity, these are often referred to as "incidents." Incident reporting is an established practice that can support continuous improvement.

Incident reporting and response can take several forms:
- Vulnerability reporting (before incidents happen)
- Internal reporting through proper channels
- External reporting to regulatory authorities, users, customers, or value chain participants

Gen AI also often operates in an environment where existing technology-agnostic incident reporting requirements may apply (e.g., personal data breach notifications).

Reporting should proportionately balance the benefits of comprehensive reports with the practicality of doing so, such as by tiering the need for reporting to the severity of incidents.

### Areas for ASEAN to explore:

**(a) Creating a common understanding around incident reporting and incident management**

Commonly accepted incident reporting terminology in other domains, like cybersecurity, should be drawn upon. This can include referencing existing work by organisations like the **OECD**, particularly its **Expert Group on AI Incidents**.

## 3.5 Testing and Assurance

Third-party testing and eventually formal auditing of Gen AI systems has been highlighted as key to supporting their responsible operation. Using third-party organisations to assess models, in addition to internal assessment, can build user trust by ensuring impartiality and credibility.

However, defining a testing methodology for Gen AI that is reliable and consistent is a work in progress. There is also a need to have sufficient numbers of independent entities to conduct such testing.

### Areas for ASEAN to explore:

**(a) Developing regionally applicable benchmarks and testing tools**

ASEAN has a unique opportunity to lead in developing standardised regional evaluation metrics and benchmarks. Regional benchmarks can include both qualitative and quantitative indicators relevant to ASEAN's unique linguistic, cultural, and societal contexts.

ASEAN should consider agreeing on a list of evaluation tools and techniques preferred for use across the region.

**Box: AI Verify Foundation Project Moonshot**

Project Moonshot is an open-sourced toolkit designed to streamline LLM application testing by facilitating benchmarking and red-teaming at scale. It helps organisations:
- Select the right industry-leading benchmarks
- Systematically scale validation and red teaming
- Communicate safety information to non-technical stakeholders
- Incorporate considerations relevant to ASEAN's cultural context

The toolkit integrates benchmarks from partners like MLCommons and the Beijing Academy of AI.

## 3.6 Security

The development and deployment of Gen AI systems introduces unique cybersecurity challenges. The opaque nature of Gen AI adds complexity — making it more challenging for defenders to detect and prevent attacks.

While established cybersecurity best practices remain valuable, Gen AI may also require tailored security to address unique considerations, including safeguards against novel threat vectors such as adversarial machine learning.

### Areas for ASEAN to explore:

**(a) Supporting and coordinating measures to promote vulnerability detection**

Vulnerability detection initiatives — such as bug bounties and ethical hacking incentives — will play a crucial role. A key focus area should be facilitating vulnerability reporting across both public and private sector boundaries.

**Box: Republic of Korea AI Ethical Impact Assessment Framework (2023)**

Established by the Ministry of Science and ICT to identify and manage ethical impacts of AI-based services. Assessments are conducted by the Korea Information Society Development Institute (KISDI). In 2024, the framework was being piloted for AI-based video synthesis services.

**(b) Promoting security knowledge-sharing among AI ecosystem stakeholders**

Regular information-sharing among ASEAN-region stakeholders will be critical, including information on adversarial tactics, techniques, and case studies. Investment in new tools and security safeguards (e.g., digital forensics tools for Gen AI) is important.

**(c) Establishing guidelines on security by design**

A continually evolving library of common security threats and taxonomy can aid cybersecurity authorities, AI Safety Institutes, industry, and civil society. ASEAN should align with frameworks from ISO, NIST, and OECD where relevant.

**Box: Cyber Security Agency of Singapore — Guidance on the Security of AI Systems**

Launched at Singapore International Cyber Week in October 2024:
- **Guidelines on Securing AI Systems** — articulates risk management principles and desired outcomes
- **Companion Guide on Securing AI Systems** — practical reference with specific actionable measures, security controls, and best practices

These documents are kept "live" and updated regularly.

## 3.7 Content Provenance

The outputs of Gen AI can be challenging to distinguish from original content produced by humans. Deepfakes have legitimate applications in marketing, historical reconstruction, education, and training, but also present opportunities for misuse, including impersonation and the spread of misinformation.

Without clear labelling practices or advanced content provenance tools, it can be difficult to determine when media has been generated by AI. Malicious actors could use legitimate Gen AI tools to spread misinformation or disinformation, including to undermine electoral processes.

Technical solutions include digital watermarking and cryptographic provenance. These solutions are designed to be tamper-resistant, but are not foolproof — some watermarks may still be vulnerable to modification, and some identifying metadata could still be removed from files.

The **Coalition for Content Provenance and Authenticity (C2PA)** is a global consortium working to define uniform technical standards for cryptographic provenance metadata. Technology companies such as Google and Meta are implementing AI labelling on platforms such as YouTube and Instagram.

### Areas for ASEAN to explore:

**(a) Supporting development and capabilities around content**

The adoption of content provenance technologies should be accompanied by policies and enforcement measures. ASEAN's role is to use its convening power to encourage knowledge sharing. Developing a regional repository of real-world examples of techniques and approaches towards establishing content provenance would also enable users to learn more.

## 3.8 Safety and Alignment Research & Development

Many safety and alignment issues have been raised regarding Gen AI systems, and there is consensus that more research is needed. Many of these systems' effects are not yet well-understood, and technical methods to guarantee system behaviours are still being debated extensively.

### Areas for ASEAN to explore:

**(a) Sharing on AI safety and alignment research**

Where ASEAN Member States establish AI Safety Institutes (AISIs) or other national bodies with a mandate to study AI safety, platforms for dialogue amongst these institutes can enhance their efforts by developing partnerships and preventing duplicative work.

ASEAN should leverage such institutes, especially those established in the region, to plug into international conversations on AI safety.

## 3.9 AI for Public Good

Gen AI is a powerful, transformative tool with the potential to significantly improve people's lives. Citizens can use Gen AI to accelerate daily tasks. Governments can use Gen AI to make citizen services more personal or responsive. Companies can use Gen AI to create new products and services and to improve speed and efficiency.

### Areas for ASEAN to explore:

**(a) Creating a compendium of Gen AI use cases**

A regional compendium of responsible Gen AI use cases, especially when promoted by member states and accessible in multiple languages, can serve as a knowledge reference. A particular focus on public sector use cases is likely to be helpful.

**(b) Promoting awareness and education on Gen AI**

ASEAN can serve as the vehicle for educational measures — publicity campaigns, skill-building workshops and training initiatives, or hosting online resources. Awareness-building activities can promote digital literacy and ensure that citizens are aware of the risks of Gen AI. Helping citizens learn how to spot AI-generated content or use provenance markings, especially in lower-opportunity communities, is an opportunity.

Educational initiatives can also help ensure that workforces are prepared for changes that Gen AI creates.

---

# 04 — CONCLUSION

The new challenges of Gen AI do not outweigh the substantial opportunities presented by this technology to improve people's lives, create economic opportunity, and empower new groups in society. This Guide is collaboratively developed by all ASEAN Member States and will serve as a foundation for ASEAN to take forward future work.

**ASEAN Member States are recommended to apply, on a voluntary basis, the recommendations in this Guide. Nothing in this Guide may be interpreted as replacing or changing any party's legal obligations or rights under any ASEAN Member State's laws.**

---

# APPENDIX: USE CASES

## PhoGPT — VinAI (Vietnam)

VinAI is a subsidiary of the Vingroup conglomerate focused on developing innovative AI-based products and services. Beyond commercial software development, VinAI is also an active research institution that publishes academic papers and releases open-source software.

In 2023, VinAI launched PhoGPT, the first open-source LLM developed for Vietnamese language and culture. PhoGPT was developed in response to the success of other LLMs trained predominantly on English-language datasets reflecting Western cultural attitudes — limiting performance and relevance of Vietnamese-language applications.

### Features of PhoGPT

- **PhoGPT-4B (base):** 3.7 billion parameters, trained on 102 billion words of Vietnamese-language text from Wikipedia, medical texts, books, legal documents, news articles
- Trained over three months on a relatively small number of processors — much less costly than leading commercial models
- Ranked ahead of many leading LLMs at the time of release in Vietnam-specific accuracy tests
- **PhoGPT-4B-Chat:** Specialised version fine-tuned on 70,000 instructional prompts and 290,000 conversations for chatbot applications

### Open-Source Deployment

PhoGPT is freely available online — allowing developers and researchers to access, modify, retrain, fine-tune, or modify the model. This fosters innovation and collaboration, promotes transparency, and reaches the widest possible audience.

### Value and Impact

VinAI's research has supported a number of local universities and helped facilitate its ongoing AI Residency programme, which has trained over 100 young Vietnamese AI scientists. An international technology firm has collaborated with VinAI to include PhoGPT in its AI software platform. Supports the **Data dimension**.

## Project Moonshot — AI Verify Foundation (Singapore)

The AI Verify Foundation was established in June 2023 by Singapore's Infocomm Media Development Authority (IMDA), bringing together over 150 organisations across the global AI ecosystem. In June 2024, IMDA worked with industry partners to build Project Moonshot, an open-source LLM Evaluation Toolkit.

### Challenges Addressed

- **Numerous Benchmark Options** — Lack of clarity on how to approach the enormous number of available LLM benchmarks
- **Scaling Challenges** — Difficulty of systematically selecting, validating, and red-teaming models at scale
- **Communication barriers** — Difficulty in communicating technical safety information to non-technical stakeholders
- **Cultural Sensitivity** — Lack of tools and benchmarks sensitive to ASEAN's regional values, culture, and linguistic context

### Capabilities

**Benchmarking:** Curates industry-leading benchmarks into a single tool. Includes open-source benchmarks plus closed-source benchmarks via partnerships with MLCommons and the Beijing Academy of AI.

**Red-Teaming:** Automates traditionally human-driven red teaming using algorithmic methods and LLMs to generate effective red-teaming prompts. Modular architecture allows integration via API, command line, or web interface.

### Users Impacted

1. Organisations validating their LLMs before release
2. Organisations choosing an LLM model for their context or use case
3. Organisations with LLM applications looking to strengthen their guardrails

Supports the **Testing and Assurance dimension**.

## Responsible AI Internal Programme — Accenture (ASEAN-wide)

Accenture is a global professional services firm with approximately 750,000 employees across 120 countries, with a large presence in six ASEAN member states. Accenture started its Responsible AI Internal Programme in 2022.

### Accenture's Responsible AI Principles

- Human by design
- Fairness
- Transparency / Explainability / Accuracy
- Safety
- Accountability
- Compliance / Data Privacy / Cybersecurity
- Sustainability

### Three Programme Elements

1. **Conduct AI Risk Assessment** — Standard screening and assessment procedures for initial risk assessments and regulatory reviews
2. **Systemic Enablement for RAI Testing** — Institutionalising approach into compliance programme, implementing standards for AI procurement, embedding controls, developing benchmark testing tools and persona-based training
3. **Ongoing Monitoring and Compliance** — Quality assurance programmes, monitoring capabilities, incident remediation, red teaming

System owners can interact with a Gen AI chatbot to resolve issues or queries related to risk assessment.

### Training

- Basic responsible AI training rolled out across 750,000 people
- Deeper AI ethics training available for the 30,000 most directly involved

### Value and Impact

Has facilitated the evaluation of thousands of client engagements, Accenture assets, and internal applications. Supports the **Trusted Development and Deployment dimension**.

## ThaiLLM — BDI, NSTDA, VISTEC and collaborators (Thailand)

The Thai government is investing around USD 3 million (S$3.8 million) to develop ThaiLLM, spearheaded by the **Big Data Institute (BDI)** with collaborators including:

- National Science and Technology Development Agency (NSTDA)
- Vidyasirimedhi Institute of Science and Technology (VISTEC)
- National Electronics and Computer Technology Center (NECTEC)
- AI Entrepreneur Association of Thailand (AIEAT)
- AI Association of Thailand (AIAT)
- Chulalongkorn University
- Mahidol University

### Challenges Addressed

- Leading LLMs are trained on predominantly English-language datasets reflecting Western cultural attitudes
- Small or emerging companies in Thailand may lack capabilities to support Thai-language LLM development of their own

### Vision

ThaiLLM is intended to serve as a common national infrastructure where all LLM developers can contribute their datasets. The infrastructure will be managed under open licenses and will be open source, enabling all stakeholders to benefit. ThaiLLM also seeks to provide trainings to increase the number of AI users and AI professionals in Thailand.

### Value and Impact

Looks to foster Thai startup development by lowering costs, increasing access to Gen AI capabilities, and decreasing dependence on foreign AI solutions. Supports the **Data dimension**.

---

# APPENDIX: METHODOLOGY

This document was developed on the basis of an extensive literature review and reflects extensive consultations conducted between the ASEAN Member States.

### Key Documents Referenced

**AI Seoul Summit**
- International Scientific Report on the Safety of Advanced AI: Interim Report (2024)
- Seoul Declaration for Safe, Innovative and Inclusive AI (2024)

**AI Verify Foundation**
- Cataloguing LLM Evaluations (2023)
- Model AI Governance Framework (Second Edition) (2020)
- Model AI Governance Framework for Generative AI (2024)

**Centre for Data Ethics and Innovation (UK)**
- The Roadmap to an Effective AI Assurance Ecosystem (2021)

**Council of Europe**
- Council of Europe Framework Convention on AI and Human Rights, Democracy and the Rule of Law (2024)

**European Commission (EU)**
- EU AI Act (2024)

**Google**
- An AI Opportunity Agenda for ASEAN (2024)

**Group of Seven**
- Hiroshima Process Code of Conduct for Organisations Developing Advanced AI Systems (2023)

**Infocomm Media Development Authority (Singapore)**
- Generative AI: Implications for Trust and Governance (2023)

**International Standards Organisation**
- ISO/IEC 42001:2023 — Information Technology — AI — Management System (2023)

**Meta**
- Open Loop US Program: Red-Teaming & Synthetic Content (2024)

**Microsoft**
- Global Governance: Goals and Lessons for AI (2024)

**Ministry of Foreign Affairs (China)**
- Global AI Governance Initiative (2023)
- Shanghai Declaration on Global AI Governance (2024)

**Monetary Authority of Singapore**
- Emerging Risks and Opportunities of Generative AI for Banks (2024)

**National Information Security Standardisation Technical Committee (TC260) (China)**
- AI Safety Governance Framework (v1.0) (2024)

**National Institute of Standards and Technology (US)**
- Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations (AI 100-2 E2023) (2024)
- AI Risk Management Framework (AI RMF 1.0) (2023)
- AI RMF: Generative AI Profile (NIST AI 600-1) (2024)

**Office for Artificial Intelligence (UK)**
- A Pro-Innovation Approach to AI Regulation (2023)

**OECD**
- Stocktaking for the Development of an AI Incident Definition (2023)
- Initial Policy Considerations for Generative AI (2023)
- Recommendations of the Council on AI (2024)

**Stanford Institute for Human-Centered AI**
- AI Index Report (2024)

**United Nations**
- Resolution A/RES/78/265 — Seizing the Opportunities of Safe, Secure and Trustworthy AI Systems for Sustainable Development
- Resolution A/RES/78/311 — Enhancing International Cooperation for AI Capacity Building

**UNESCO**
- Recommendation on the Ethics of AI (2021)

**US-EU Trade and Technology Council**
- TTC Joint Roadmap on Evaluation and Measurement Tools for Trustworthy AI and Risk Management (2022)

**White House (US)**
- Blueprint for an AI Bill of Rights (2022)
- Executive Order on the Safe, Secure, and Trustworthy Development and Use of AI (2023)

The perspective of subject matter experts in Gen AI development and deployment from Accenture was also consulted.

---

# REFERENCES

1. Accenture. "Gen AI-powered reinvention: APAC's opportunity to outpace the competition." https://www.accenture.com/content/dam/accenture/final/accenture-com/document-3/Accenture-Gen-AI-Powered-Reinvention.pdf

2. Bai, Y., et al. "Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback." https://arxiv.org/abs/2204.05862

3. Bai, Y., et al. "Constitutional AI: Harmlessness from AI Feedback." https://arxiv.org/pdf/2212.08073

4. Meta Open Loop. "Red-Teaming & Synthetic Content." https://www.usprogram.openloop.org/site/assets/files/1/openloop_us_phase1_report_and_annex.pdf

5. IBM. "What is Shadow IT?" https://www.ibm.com/topics/shadow-it

6. Liu, Y., et al. "Prompt Injection attack against LLM-integrated Applications." https://arxiv.org/pdf/2306.05499

7. OWASP. "LLM03:2025 Supply Chain." https://genai.owasp.org/llmrisk/llm032025-supplychain/

8. Vassilev, A., Oprea, A., Fordyce, A., and Anderson, H. "Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations." https://csrc.nist.gov/pubs/ai/100/2/e2023/final

9. OECD. "Defining AI Incidents and Related Terms." https://www.oecd-ilibrary.org/science-and-technology/defining-ai-incidents-and-related-terms_d1a8d965-en
