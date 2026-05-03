---
id: sg-sg-maigf-2020
source_url: https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Resource-for-Organisation/AI/SGModelAIGovFramework2.pdf
fetched_date: 2026-05-02
content_type: pdf (70 pages)
---

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 1
MODEL
ARTIFICIAL INTELLIGENCE
GOVERNANCE FRAMEWORK
SECOND EDITION

TABLE OF CONTENTS
SUMMARY OF UPDATES ................................................................................... 4
FOREWORD .......................................................................................................... 7
1. PREAMBLE ........................................................................................................ 9
2. INTRODUCTION ............................................................................................... 12
Objectives ............................................................................................................... 13
Guiding Principles for the Model Framework ....................................................... 15
Assumptions ........................................................................................................... 17
Definitions ....... ........................................................................................................ 18
3. MODEL AI GOVERNANCE FRAMEWORK .................................................. 19
Internal Governance Structures and Measures ...................................................... 21
Determining the Level of Human Involvement in AI-augmented Decision-making . .... 28
Operations Management .......................................... ............................................. 35
Stakeholder Interaction and Communication ........................................................ 53
ANNEX A
For Reference: A Compilation of Existing AI Ethical Principles ............................. 64
ANNEX B
Algorithm Audits . ..................................................................................................... 67
ACKNOWLEDGEMENTS ..................................................................................... 68

4
SUMMARY
OF UPDATES
DATE
EDITION SUMMARY
RELEASED
FIRST 23 January Released the Model AI Governance Framework (First
2019 Edition) at the 2019 World Economic Forum Annual
Meeting in Davos, Switzerland.
SECOND 21 January Released the Model AI Governance Framework
2020 (Second Edition) at the 2020 World Economic Forum
Annual Meeting in Davos, Switzerland.
The key changes include:
• Addition of industry examples in each section to
illustrate how organisations have implemented AI
governance practices in that section;
• Updating the titles of two sections to accurately
reflect their content:
»
“Determining AI Decision-Making Model” to
“Determining the level of human involvement
in AI-augmented decision-making”;
»
“Customer Relationship Management” to
“Stakeholder interaction and communication”.
Section-specific changes include the following:
Determining the level of human involvement in AI-
augmented decision-making
• Clarified the “human-over-the-loop” approach
by explaining the human’s supervisory role in AI-
augmented decision-making.
• Clarified that organisations can consider other
factors such as the nature and reversibility of harm
and operational feasibility in determining the
level of human involvement in an organisation’s
decision-making process involving AI.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 5
DATE
EDITION SUMMARY
RELEASED
SECOND 21 January Operations management
2020 • Provided guidance to organisations to adopt a risk-
based approach when implementing measures by:
»
Identifying features or functionalities with the
greatest impact on stakeholders;
»
Considering which measure would be most
effective in building trust with stakeholders.
• Provided guidance on the necessity and relevance
of the various measures:
»
Clarified that datasets used for building AI
models may include both personal and non-
personal data;
»
Included new measures such as robustness,
reproducibility and auditability and provided
examples of helpful practices for these
measures.
Stakeholder interaction and communication
• Highlighted the importance of communication
with various internal and external stakeholders.
• Highlighted the need to consider the purpose
and context when interacting with the various
stakeholders.
• Provided suggestions on the level of information
to be provided when interacting with various
stakeholders.
Annex A – For reference: a compilation of existing
AI ethical principles (Annex A)
• Clarified that the list of AI ethical principles
provided is a compilation of existing AI principles
that is for reference only. Not all listed principles
are addressed in the Model AI Governance
Framework. Organisations could consider
incorporating other principles in Annex A into
their own corporate principles.

6
DATE
EDITION SUMMARY
RELEASED
SECOND 21 January Annex B – Algorithm Audits
2020 • Clarified that an algorithm audit is to be conducted
only if it is necessary to discover the actual
operations of algorithms comprised in models,
and only at the request of a regulator (as part of a
forensic investigation).
Annex C – Use Case
• Annex C has been removed. Instead, a separate
Compendium of Use Cases has been published
(go.gov.sg/ai-gov-use-cases).

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 7
FOREWORD
In 2019, the world saw significant advances in the sophistication and pervasive
use of artificial intelligence (“AI”). For instance, we witnessed the emergence
of next-generation AI-powered natural text generators like GPT-2, which can
generate passages that are difficult to distinguish from human writing. We
also saw the development of Dactyl, a robotic hand, which uses reinforcement
learning to grasp and manipulate common household objects with human-like
dexterity. These examples attest to the speed of AI’s advancement and how it
will become ubiquitous in our daily lives.
The discourse on AI ethics and governance has also moved forward. Over the
last two years, governments and international organisations have begun issuing
principles, frameworks and recommendations on AI ethics and governance.
In January 2019, Singapore launched our Model AI Governance Framework
(“Model Framework”) at the World Economic Forum in Davos. The Model
Framework’s unique contribution to the global discourse on AI ethics lies in
translating ethical principles into practical recommendations that organisations
could readily adopt to deploy AI responsibly. We are heartened by the diversity
of organisations that have adopted the practices outlined in the Model
Framework, which underscores its ease-of-use and relevance.
Singapore is proud to launch the second edition of the Model Framework. This
edition incorporates the experiences of organisations that have adopted AI, and
feedback from our participation in leading international platforms, such as the
European Commission’s High-Level Expert Group and the OECD Expert Group
on AI. Such input has enabled us to provide clearer and effective guidance for
organisations to implement AI responsibly.

8
Singapore’s Info-communications Media Development Authority (“IMDA”)
and Personal Data Protection Commission (“PDPC”) have also partnered
the World Economic Forum Centre for the Fourth Industrial Revolution to
develop an Implementation and Self-Assessment Guide for Organisations
(“ISAGO”). The ISAGO complements the Model Framework by allowing
organisations to assess the alignment of their AI governance practices with the
Model Framework, while providing useful industry examples and practices.
We are also publishing a Compendium of Use Cases, which features real-
world examples of how organisations have implemented or aligned their AI
governance practices with the Model Framework. Together, these initiatives
enable any organisation to establish and refine its AI governance practices in
concrete and practical ways.
These initiatives play a critical role in Singapore’s National AI Strategy.
They epitomise our plans to develop a human-centric approach towards
AI governance that builds and sustains public trust. They also reflect our
emphasis on co-creating an AI ecosystem in a collaborative and inclusive
manner. The Model Framework and ISAGO will pave the way for future
developments, such as the training of professionals on ethical AI deployment,
and laying the groundwork for Singapore, and the world, to better address
AI’s impact on society.
The steps we take today will leave an indelible imprint on our collective future.
The Model Framework has been recognised as a firm foundation for the
responsible use of AI and its future evolution. We will build on this momentum
to advance a human-centric approach to AI – one that facilitates innovation
and safeguards public trust – to ensure AI’s positive impact on the world for
generations to come.
S Iswaran
Minister for Communications and Information
Singapore
January 2020

MMOODDEELL AARRTTIIFFIICCIIAALL IINNTTEELLLLIIGGEENNCCEE GGOOVVEERRNNAANNCCEE FFRRAAMMEEWWOORRKK 99
1. PREAMBLE

10
1.1 The Model Framework focuses primarily on four broad areas:
internal governance structures and measures, human involvement
in AI-augmented decision-making, operations management and
stakeholder interaction and communication.
While the Model Framework is certainly not limited in ambition,
it is ultimately limited by form, purpose and practical considerations
of scope. With that in mind, several caveats bear mentioning.
The Model Framework is –
a. Algorithm-agnostic
It does not focus on specific AI or data analytics
methodology. It applies to the design, application and
use of AI in general.
b. Technology-agnostic
It does not focus on specific systems, software or
technology, and will apply regardless of development
language and data storage method.
c. Sector-agnostic
It serves as a baseline set of considerations and
measures for organisations operating in any sector to
adopt. Specific sectors or organisations may choose
to include additional considerations and measures or
adapt this baseline set to meet their needs. The PDPC
encourages and will collaborate with public agencies
adapting the Model Framework for their sectors.
d. Scale- and Business-model-agnostic
It does not focus on organisations of a particular scale
or size. It can also be used by organisations engaging
in business-to-business or business-to-consumer
activities and operations, or in any other business model.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 11
1.2 It is recognised that there are a number of issues that are closely
interrelated to the ethical use and deployment of AI. This Model
Framework does not focus on these specific issues, which are
often sufficient in scope to warrant separate study and treatment.
Examples of these issues include:
a. Articulating a new set of ethical principles for AI. There
are already a number of attempts globally in
establishing a universal set of principles. While a
consistent core set of ethical principles is emerging,
there is also a penumbra of variation across cultures,
jurisdictions and industry sectors. The Model
Framework uses existing and common AI ethical
principles (a compilation of which is set out in Annex
A) and converts them into implementable practices.
b. Providing model frameworks and addressing issues
around data sharing, whether between the public
and private sectors or between organisations or
within consortia. There are a number of guides that
are relevant, such as the IMDA’s Trusted Data
Sharing Framework and the Guide to Data Valuation
for Data Sharing.
c. Discussing issues relating to the legal liabilities
associated with AI, intellectual property rights, and
societal impacts of AI (e.g. on employment,
competition, unequal access to AI products and
services by different segments of society, AI
technologies falling into hands of wrong people), etc.
These issues are nevertheless pertinent and can be
explored separately through platforms such as the
Centre for AI and Data Governance established in
the Singapore Management University School of Law.

1122
2. INTRODUCTION

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 13
OBJECTIVES
2.1 The exponential growth in data and computing power has fuelled
the advancement of data-driven technologies such as AI. AI can
be used by organisations to provide new goods and services,
boost productivity, enhance competitiveness, ultimately leading
to economic growth and a better quality of life. As with any new
technology, however, AI also introduces new ethical, legal and
governance challenges. These include risks of unintended
discrimination potentially leading to unfair outcomes, as well as
issues relating to consumers’ knowledge about how AI is involved
in making significant or sensitive decisions about them.
2.2 The PDPC,1 with advice from the Advisory Council, proposes this
second edition of the living and voluntary Model Framework as
a general, ready-to-use tool to enable organisations that are
deploying AI solutions at scale to do so in a responsible manner.
This Model Framework is not intended for organisations that are
deploying updated commercial off-the-shelf software packages
that happen to now incorporate AI in their feature set.
2.3 This voluntary Model Framework provides guidance on the key
issues to be considered and measures that can be implemented.
Adopting this Model Framework will require tailoring the measures
to address the risks identified for the implementing organisation.
The Model Framework is intended to assist organisations to
achieve the following objectives:
a. Build stakeholder confidence in AI through
organisations’ responsible use of AI to manage
different risks in AI deployment.
b. Demonstrate reasonable efforts to align internal
policies, structures and processes with relevant
accountability-based practices in data management
and protection (e.g. the Personal Data Protection Act
2012 (“PDPA”) and the OECD Privacy Principles).
1 Under section 5 of Singapore’s Personal Data Protection Act 2012, the IMDA is designated
as the PDPC.

14
2.4 To assist organisations in implementing the Model Framework,
the PDPC has also prepared a complementary ISAGO. The ISAGO
helps organisations assess the alignment of their AI governance
practices and processes with the Model Framework. It also provides
additional useful industry references and examples that further
clarify the recommendations set out in this Model Framework.
2.5 The extent to which organisations adopt the recommendations
in this Model Framework depends on several factors, including
the nature and complexity of the AI used by organisations, the
extent to which AI is employed in the organisations’ decision-
making, and the severity and probability of the impact of the
autonomous decision on individuals.
2.6 To elaborate: AI technologies may be used to augment a human
decision-maker or to autonomously make a decision. For instance,
the impact of an autonomous decision in medical diagnosis is
arguably greater than that in a product recommendation. The
commercial risks of AI deployment is therefore proportionate to
the impact on individuals. Generally, where the cost of
implementing AI technologies in an ethical manner outweighs
the expected benefits, organisations should consider whether
alternative non-AI solutions should be adopted. The considerations
and recommendations set out in this Framework are intended
to guide organisations that have decided to deploy AI
technologies at scale.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 15
GUIDING PRINCIPLES
2.7 The Model Framework is based on two high-level guiding
principles that promote trust in AI and understanding of the use
of AI technologies:
a. Organisations using AI in decision-making should
ensure that the decision-making process is explainable,
transparent and fair.
Although perfect explainability, transparency and
fairness are impossible to attain, organisations should
strive to ensure that their use or application of AI is
undertaken in a manner that reflects the objectives
of these principles as far as possible. This helps build
trust and confidence in AI.
b. AI solutions should be human-centric.
As AI is used to amplify human capabilities, the
protection of the interests of human beings, including
their well-being and safety, should be the primary
considerations in the design, development and
deployment of AI.
Organisations should ensure that
AI decision-making processes are
explainable, transparent and fair,
while AI solutions should be
human-centric.

16
2.8 Like other technologies, AI aims to increase human productivity.
However, unlike earlier technologies, some aspects of autonomous
predictions or decisions made by AI may not be fully explainable.
As AI technologies can make decisions that affect individuals, or
have a significant impact on society, markets or economies,
organisations should consider using this Model Framework to
guide their deployment of AI.
2.9 Organisations should detail a set of ethical principles when they
embark on deployment of AI at scale within their processes or
to empower their products and/or services. Where necessary,
organisations may wish to refer to the compilation of AI ethical
principles in Annex A. As far as possible, organisations should
also review their existing corporate values and incorporate the
ethical principles that they have articulated. Some of the ethical
principles (e.g. safety) may be articulated as risks that can be
incorporated into the corporate risk management framework.
The Model Framework is designed to assist organisations by
incorporating ethical principles into familiar and pre-existing
corporate governance structures, and thereby aid in guiding the
adoption of AI in an organisation.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 17
ASSUMPTIONS
2.10 The Model Framework aims to discuss good data management
practices in general. The Model Framework is mainly applicable
to machine learning models (as compared to pure decision
tree-driven AI models).
2.11 The Model Framework does not address the risk of catastrophic
failure due to cyber-attacks on an organisation heavily dependent
on AI. Organisations remain responsible for ensuring the
availability, reliability, quality and safety of their products and
services, regardless of whether AI technologies are used.
2.12 Adopting this voluntary Model Framework will not absolve
organisations from compliance with current laws and regulations.
However, as this is an accountability-based framework, adopting
it will assist organisations in demonstrating that they had
implemented accountability-based practices in data management
and protection, e.g. the PDPA and OECD Privacy Principles.
2.13 Further, it should be noted that certain industry sectors (such
as in the finance, healthcare, and legal sectors) may be regulated
by existing sector-specific laws, regulations or guidelines
relevant to the sector. For example, the Monetary Authority of
Singapore published the Principles to Promote Fairness, Ethics,
Accountability and Transparency in the Use of Artificial
Intelligence and Data Analytics in Singapore’s Financial Sector
(the “FEAT Principles”) to provide guidance to firms that use
AI and data analytics to offer financial products and services.2
Organisations are advised to remain mindful of such laws,
regulations and guidelines, as adopting the Model Framework
does not mean that organisations are in compliance with such
sector-specific laws, regulations or guidelines.
2 Monetary Authority of Singapore, “Principles to Promote Fairness, Ethics, Accountability
and Transparency (FEAT) in the Use of Artificial Intelligence and Data Analytics in Singapore’s
Financial Sector” (12 November 2018) <https://www.mas.gov.sg/publications/monographs
or-information-paper/2018/FEAT>.

18
DEFINITIONS
2.14 The following simplified diagram depicts the key stakeholders
in an AI adoption process discussed in the Model Framework.
The adoption process does not distinguish between business-
to-consumer (“B2C”), business-to-business (“B2B”), and business-
to-business-to-consumer (“B2B2C”) relationships.
AI Solution Providers Organisations Individuals
2.15 Some terms used in AI may have different definitions depending
on context and use. The definitions of some key terms used in
this Model Framework are as follows:
refers to a set of technologies that seek to simulate human
“AI”
traits such as knowledge, reasoning, problem solving,
perception, learning and planning, and, depending on the AI model, produce an
output or decision (such as a prediction, recommendation, and/or classification).
AI technologies rely on AI algorithms to generate models. The most appropriate
model(s) is/are selected and deployed in a production system.3
“AI Solution develop AI solutions or application systems that make
Providers”
use of AI technology. These include not just commercial
off-the-shelf products, online services, mobile applications, and other software
that consumers can use directly, but also B2B2C applications, e.g. AI-powered
fraud detection software sold to financial institutions. They also include device
and equipment manufacturers that integrate AI-powered features into their
products, and those whose solutions are not standalone products but are meant
to be integrated into a final product. Some organisations develop their own AI
solutions and can be their own solution providers.
refers to companies or other entities that adopt or deploy
“Organisations”
AI solutions in their operations, such as backroom
operations (e.g. processing applications for loans), front-of-house services (e.g.
e-commerce portal or ride-hailing app), or the sale or distribution of devices
that provide AI-powered features (e.g. smart home appliances).
can, depending on the context, refer to persons to whom
“Individuals”
organisations intend to supply AI products and/or services,
or persons who have already purchased the AI products and/or services. These
may be referred to as “consumers” or “customers” as well.
3 This definition of AI was adapted from various sources, and contextualised accordingly for the purposes of this Model
Framework. It should not be taken to be an authoritative or exhaustive definition.

MMOODDEELL A ARRTTIFIFICICIAIALL I NINTTEELLLLIGIGEENNCCEE G GOOVVEERRNNAANNCCEE F FRRAAMMEEWWOORRKK 1 199
3. MODEL AI
GOVERNANCE
FRAMEWORK

20
MODEL AI GOVERNANCE
FRAMEWORK
3.1 This Model Framework comprises guidance on measures
promoting the responsible use of AI that organisations should
adopt in the following key areas:
a. Internal governance structures and measures
Adapting existing or setting up internal
governance structure and measures to
incorporate values, risks, and responsibilities
relating to algorithmic decision-making.
b. Determining the level of human involvement
in AI-augmented decision-making
A methodology to aid organisations in setting
its risk appetite for use of AI, i.e. determining
acceptable risks and identifying an appropriate
level of human involvement in AI-augmented
decision-making.
c. Operations management
Issues to be considered when developing,
selecting and maintaining AI models, including
data management.
d. Stakeholder interaction and communication
Strategies for communicating with an
organisation’s stakeholders, and the
management of relationships with them.
3.2 Organisations adopting this Model Framework may find that not
all elements are relevant. This Model Framework is meant to be
flexible, and organisations can adapt the Model Framework to
suit their needs and adopting those elements that are relevant.
3.3 To help organisations better understand the Model Framework,
we have included (in each section) illustrations demonstrating
how real-world companies have implemented certain practices
described in that specific section. In addition, the PDPC has
also released a Compendium of Use Cases that illustrates how
various local and international organisations have put in place
AI governance practices that are aligned to all sections of the
Model Framework.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 21
INTERNAL GOVERNANCE
STRUCTURES AND MEASURES
3.4 This section is intended to guide organisations in developing
appropriate internal governance structures that allow organisations
to have appropriate oversight over how AI technologies are
brought into their operations and/or products and services.
3.5 Internal governance structures and measures help to ensure robust
oversight over an organisation’s use of AI. The organisation’s
existing internal governance structures can be adapted, and/or
new structures can be implemented if necessary. For example,
risks associated with the use of AI can be managed within the
enterprise risk management structure, while ethical considerations
can be introduced as corporate values and managed through
ethics review boards or similar structures.
Ethical considerations can be
introduced as corporate values and
managed through ethics review
boards or similar structures.
3.6 Organisations may also consider determining the appropriate
features in their internal governance structures. For example,
when relying completely on a centralised governance mechanism
is not optimal, a de-centralised one could be considered to
incorporate ethical considerations into day-to-day decision-
making at the operational level, if necessary. The sponsorship,
support and participation of the organisation’s top management
and its board of directors in the organisation’s AI governance
are crucial.

22
3.7 Organisations may wish to consider including features that
are relevant to the development of their internal governance
structure, such as:
1. Clear roles and responsibilities for the ethical
deployment of AI
a. Responsibility for and oversight of the various stages
and activities involved in AI deployment should be
allocated to the appropriate personnel and/or
departments. If necessary and possible, consider
establishing a coordinating body, having relevant
expertise and proper representation from across
the organisation.
b. Personnel and/or departments having internal AI
governance functions should be fully aware of their
roles and responsibilities, be properly trained, and be
provided with the resources and guidance needed for
them to discharge their duties.
c. Key roles and responsibilities that can be allocated
include:
i. Using any existing risk management framework and
applying risk control measures (see “Risk management
and internal controls” below) to:
o Assess and manage the risks of deploying AI,
including any potential adverse impact on the
individuals (e.g. who are most vulnerable, how
are they impacted, how to assess the scale of
the impact, how to get feedback from those
impacted, etc.).
o Decide on the appropriate level of human
involvement in AI-augmented decision-making.
o Manage the AI model training and selection
process.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 23
ii. Maintenance, monitoring, documentation and review
of the AI models that have been deployed, with a
view to taking remediation measures where needed.
iii. Reviewing communications channels and interactions
with stakeholders to provide disclosure and effective
feedback channels.
iv. Ensuring relevant staff dealing with AI systems are
properly trained. Where applicable and necessary,
staff who are working and interacting directly with
AI models may need to be trained to interpret AI
model output and decisions and to detect and
manage bias in data. Other staff whose work deals
with the AI system (e.g. a customer relationship
officer answering customer queries about the AI
system, or a salesperson using an AI-enabled
product to make a recommendation) should be
trained to be at least aware of and sensitive to the
benefits, risks and limitations when using AI, so that
they know when to alert subject-matter experts
within their organisations.

24
2. Risk management and internal controls
a. Organisations can consider implementing a sound
system of risk management and internal controls that
specifically addresses the risks involved in the
deployment of the selected AI model.
b. Such measures include:
i. Using reasonable efforts to ensure that the datasets
used for AI model training are adequate for the
intended purpose, and to assess and manage the
risks of inaccuracy or bias, as well as reviewing
exceptions identified during model training.
Virtually, no dataset is completely unbiased.
Organisations should strive to understand the ways
in which datasets may be biased and address this
in their safety measures and deployment strategies.
ii. Establishing monitoring and reporting systems as
well as processes to ensure that the appropriate
level of management is aware of the performance
of and other issues relating to the deployed AI.
Where appropriate, the monitoring can include
autonomous monitoring to effectively scale human
oversight. AI systems can be designed to report
on the confidence level of their predictions, and
explainability features could focus on why the AI
model had a certain level of confidence.
iii. Ensuring proper knowledge transfer whenever there
are changes in key personnel involved in AI
activities. This will reduce the risk of staff movement
creating a gap in internal governance.
iv. Reviewing the internal governance structure and
measures when there are significant changes to
organisational structure or key personnel involved.
v. Periodically reviewing the internal governance
structure and measures to ensure their continued
relevance and effectiveness.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 25
CUJO AI:
ILLUSTRATION ON INTERNAL GOVERNANCE
STRUCTURES AND MEASURES
CUJO AI is a network intelligence software company in the telecommunications
operators’ market. Headquartered in the US, it seeks to develop and deploy AI
to improve security, control, privacy of connected devices in homes and businesses.
CUJO AI has implemented clear internal governance structures and measures
to ensure robust oversight of its use of AI. Its multi-stakeholder governance
structures facilitate decisions at appropriate levels:
consisting of the Chief Technology Officer, the
A Research Board
Head of Labs and the Chief Data Scientist, approves
the AI development and deployment. In particular, the Chief Technology Officer
oversees four technical teams which consists of more than 100 employees.
Their roles and responsibilities are clearly defined:
a. Research team performs data analysis, research and develop Machine
Learning (“ML”) models and AI algorithms;
b. Engineering team builds software, cloud services and applications;
c. Operation team deploys the AI model and upgrade platform; and
d. Delivery team engages with operators and integrate services.
consisting of the Chief Technology Officer, Chief
An Architecture
Architect Officer and lead engineers, ensures the
Steering Group
robustness of the AI/ML models before deployment.
(“ASG”)
The ASG has bi-weekly meetings where the research
team shares its findings on the ML models and AI algorithms (e.g. data, approach
and assumptions).
oversee the AI development and deployment
PhD-level employees
process, and strive to implement academic review
standards for each new feature development.
In addition, CUJO AI has developed a general Code of Ethics (“Code”) for its
employees. All new employees are introduced to the CUJO AI local country
document and process repository. For example, CUJO AI’s office in Finland provides
its employees with an electronic “CUJO employee handbook”. The handbook
describes in detail the Code, while covering other topics such as business ethics
and conduct. Employees carry out their tasks and responsibilities on the basis of
the following ethical principles:

26
a. To conduct business in an honest and ethical manner across its various
offices around the world;
b. To base decisions on honesty, fairness, respect, responsibility, integrity,
trust, and sound business judgment;
c. That no illegal or unethical conduct on the part of officers, directors,
employees, or affiliates is in the company’s best interest; and
d. Not to compromise the company’s principles for short-term advantage.
MASTERCARD:
ILLUSTRATION ON INTERNAL GOVERNANCE
STRUCTURES AND MEASURES
Mastercard is a technology company in the global payments industry. Its
global payments processing network connects consumers, financial
institutions, merchants, governments and businesses in more than 210
countries and territories. To achieve its vision, Mastercard leveraged AI in
many applications such as fraud prevention, forecasting future spending
trends and improving user retail experience.
To ensure robust oversight of Mastercard’s use of AI, Mastercard established
a Governance Council to review and approve the implementation of AI
applications that are determined to be high risk. The Governance Council is
chaired by its Executive Vice President of the Artificial Intelligence Center of
Excellence, and whose members include the Chief Data Officer, Chief Privacy
Officer, Chief Information Security Officer, data scientists and representatives
from business teams.
Mastercard has defined clear roles and responsibilities for the Governance
Council. Each representative on the Council brings their expertise to the decision-
making process:

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 27
a. will review the proposal for implementation of
Chief Data Officer
and Chief Privacy AI to ensure that the:
Officer • Data is fit for purpose for AI;
• AI is used for an ethical purpose; and
• Impact to an individual is appropriate and
potential harms (including risks to privacy
and data protection) are sufficiently
mitigated.
b. Chief Information will ensure that security by design is
implemented.
Security Officer
that build and implement AI are in continued
c.
Data Science teams dialogue with the Data Office and the Privacy
Office, so that there is continued information
sharing regarding the required governance and the lifecycle of a particular
implementation of an AI application.
Mastercard has also implemented risk management and internal controls to
address the risk involved in the AI deployment. For example, Mastercard
conducts initial risk scoring to determine the risk of the proposed AI activity,
which includes an evaluation of multiple factors including alignment with
corporate initiatives, the data types and sources utilised, and the impact on
individuals from AI decisions.
In addition, Mastercard will identify potential mitigants as part of the process
to reduce the level of risk posed by the data being collected or potential biases
in the activity. If an AI project has been identified as high risk, it will be referred
to the Governance Council for review. Low risk projects will not be subjected
to a review and can proceed to the model development stage.

28
DETERMINING THE LEVEL OF
HUMAN INVOLVEMENT IN AI-
AUGMENTED DECISION-MAKING
3.8 This section is intended to help organisations determine the
appropriate extent of human oversight in AI-augmented
decision-making.
3.9 Having clarity on the objective of using AI is a key first step in
determining the extent of human oversight. Organisations can
start by deciding on their commercial objectives of using AI (e.g.
ensuring consistency in decision-making, improving operational
efficiency and reducing costs, or introducing new product features
to increase consumer choice). These commercial objectives can
then be weighed against the risks of using AI in the organisation’s
decision-making. This assessment should be guided by
organisations’ corporate values, which in turn, could reflect the
societal norms or expectations of the territories in which the
organisations operate.
Before deploying AI solutions,
organisations should decide on their
commercial objectives of using AI, and
then weigh them against the risks of using
AI in the organisation’s decision-making.
3.10 It is also desirable for organisations operating in multiple countries
to consider the differences in societal norms, values and/or
expectations, where possible. For example, gaming advertisements
may be acceptable in one country but not in another. Even within
a country, risks may vary significantly depending on where AI is
deployed. For example, risks to individuals associated with
recommendation engines that promote products in an online
mall or automating the approval of online applications for travel
insurance may be lower than the risks associated with algorithmic
trading facilities offered to sophisticated investors.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 29
3.11 Some risks to individuals may only manifest at group level. For
example, widespread adoption of a stock recommendation
algorithm might cause herding behaviour, increasing overall
market volatility if sufficiently large numbers of individuals make
similar decisions at the same time. In addition to risks to individuals,
other types of risks may also be identified (e.g. risk to an
organisation’s commercial reputation).
3.12 Organisations’ weighing of their commercial objectives against
the risks of using AI should ideally be guided by their corporate
values. Organisations can assess if the intended AI deployment
and the selected model for algorithmic decision-making are
consistent with their own core values. Any inconsistencies and
deviations should be conscious decisions made by organisations
with a clearly defined and documented rationale.
3.13 As identifying commercial objectives, risks and determining the
appropriate level of human involvement in AI-augmented
decision-making is an iterative and ongoing process, it is
desirable for organisations to continually identify and review
risks relevant to their technology solutions, mitigate those risks,
and maintain a response plan should mitigation fail. Documenting
this process through a periodically reviewed risk impact
assessment helps organisations develop clarity and confidence
in using the AI solutions. It will also help organisations respond
to potential challenges from individuals, other organisations or
businesses, and regulators.

30
WHAT ARE THE THREE BROAD
APPROACHES OF HUMAN INVOLVEMENT
IN AI-AUGMENTED DECISION-MAKING?
3.14 Based on the risk management approach described above, the Model Framework
identifies three broad approaches to classify the various degrees of human oversight
in the decision-making process:
a. Human-in-the-loop suggests that human oversight is active and involved,
with the human retaining full control and the AI only providing recommendations
or input. Decisions cannot be exercised without affirmative actions by the
human, such as a human command to proceed with a given decision.
For example, a doctor may use AI to identify possible diagnoses of and
treatments for an unfamiliar medical condition. However, the doctor will
make the final decision on the diagnosis and the corresponding treatment.
This model requires AI to provide enough information for the human to
make an informed decision (e.g. factors that are used in the decision, their
value and weighting, correlations).
b. Human-out-of-the-loop suggests that there is no human oversight over
the execution of decisions. The AI system has full control without the option
of human override.
For example, a product recommendation solution may automatically suggest
products and services to individuals based on pre-determined demographic
and behavioural profiles. AI can also dynamically create new profiles, then
make product and service suggestions rather than relying on predetermined
categories.
A machine learning model might also be used by an airline to forecast
demand or likely disruptions, and the outputs of this model are used by a
solver module to optimise the airline’s scheduling, without a human in the
loop.
c. Human-over-the-loop (or human-on-the-loop) suggests that human oversight
is involved to the extent that the human is in a monitoring or supervisory
role, with the ability to take over control when the AI model encounters
unexpected or undesirable events (such as model failure). This approach
allows humans to adjust parameters during the operation of the algorithm.
For example, a GPS navigation system plans the route from Point A to Point
B, offering several possible routes for the driver to pick. The driver can alter
parameters (e.g. due to unforeseen road congestions) during the trip without
having to re-programme the route.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 31
3.17 The matrix, however, should not be taken to imply that the
probability of harm and severity of harm are the only factors to
be considered in determining the level of human oversight in an
organisation’s decision-making process involving AI (although
they are generally two of the more important factors).4
3.18 For safety-critical systems, it would be prudent for organisations
to ensure that a person be allowed to assume control, with the
AI system providing sufficient information for that person to make
meaningful decisions or to safely shut down the system where
human control is not possible.
mraH
fo
ytireveS
3.15 The Model Framework also proposes a design framework
(structured as a matrix) to help organisations determine the level
of human involvement required in AI-augmented decision-making.
This design framework is structured along two axes: the (a)
probability; and (b) severity of harm to an individual (or organisation)
as a result of the decision made by an organisation about that
individual (or organisation).
3.16 The definition of “harm” and the computation of probability and
severity will depend on the context and vary from sector to sector.
For example, the considerations of a hospital regarding the harm
associated with a wrong diagnosis of a patient’s medical condition
will differ from the considerations of a clothing store’s regarding the
harm associated with a wrong product recommendation for apparels.
High severity High severity
Low probability High probability
Low severity Low severity
Low probability High probability
Probability of Harm
4 Other factors that organisations in various contexts may consider relevant, could also include:
(a) the nature of harm (i.e. whether the harm is physical or intangible in nature); (b) the
reversibility of harm, and as a corollary to this, the ability for individuals to obtain recourse;
and (c) whether it is operationally feasible or meaningful for a human to be involved in a
decision-making process (e.g. having a human-in-the-loop would be unfeasible in high-
speed financial trading, and be impractical in the case of driverless vehicles).

32
An online retail store wishes to use AI to fully automate
the recommendation of food products to individuals based
HIGHLY
on their browsing behaviours and purchase histories. The RECOMMENDED!
automation will meet the organisation’s commercial
objective of operational efficiency.
Probability-severity assessment
The definition of harm can be the impact of making product recommendations
that do not address the perceived needs of the individuals. The severity of
harm in making the wrong product recommendations to individuals may be
low since individuals ultimately decide whether to make the purchase. The
probability of harm may be high or low depending on the efficiency and
efficacy of the AI solution.
Degree of human intervention in decision-making process
Given the low severity of harm, the assessment points to an approach that
requires no human intervention (i.e. human-out-of-the-loop).
Regular review
The organisation regularly reviews its approach (i.e. human-out-of-the-loop)
to re-assess the severity and probability of harm, and as societal norms and
values evolve.
Note: This is a simple illustration using bright-line norms and values. Organisations can consider testing this method
of determining the AI decision-making model against cases with more challenging and complex ethical dilemmas.
mraH
fo
ytireveS
USING THE PROBABILITY-SEVERITY OF HARM MATRIX
High severity High severity
Low probability High probability
Low severity Low severity
Low probability High probability
Human-out-
of-the-loop
Probability of Harm

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 33
SUADE LABS:
ILLUSTRATION ON DETERMINING THE LEVEL OF HUMAN
INVOLVEMENT IN AI-AUGMENTED DECISION-MAKING
Suade Labs (“Suade”) is a RegTech firm that operates globally and is a World
Economic Forum Technology Pioneer. Suade provides an AI-enabled solution
that allows financial institutions to process large volumes of granular data and
generate the required regulatory data, calculations, and reports with the
necessary controls and governance. Suade’s solution also allows users to analyse
the impact of the existing stock of regulation, including the impact of individual
pieces of legislation.
In determining the level of human involvement in decision-making using AI,
Suade considered the following key factors:
a. Degree of domain knowledge (e.g. legal or policy-making knowledge)
required to accurately interpret the results of the algorithm.
b. Cost of non-compliance to regulation if the AI tool does not accurately
analyse the impact of regulation and provide correct suggestions for regulatory
compliance.
As Suade’s solution requires a certain degree of domain knowledge from
human experts, and given that the cost of regulatory non-compliance as a
result of incorrect recommendations made by the AI solution will be significant
to users, Suade has thus adopted a human-in-the-loop approach for its AI
solution.
On the other hand, when it comes to tuning the AI model, Suade adopts a
human-over-the-loop approach. In general, Suade tunes the AI model to
automatically favour the identification of false positives over false negatives.
However, Suade conducted user research, which informed them that some
users prefer the model to favour false negatives over false positives. Therefore,
Suade adopts a human-over-the-loop approach so that the AI model can
be tuned to account for the differing preferences of its users with respect
to whether the algorithm produces results that favours false positives or
false negatives.

34
GRAB:
ILLUSTRATION ON DETERMINING THE LEVEL OF HUMAN
INVOLVEMENT IN AI-AUGMENTED DECISION-MAKING
Grab is a Singapore-based company that offers ride-hailing transport services,
food delivery and e-payment solutions. It uses AI across its platform, from ride
allocation, detecting safety incidents, to identifying fraudulent transactions. In
particular, Grab uses AI to improve the overall quality of trip allocations and
minimise trip cancellations.
To allocate trips successfully, Grab’s AI model considers drivers’ preferences
based on the following key factors:
a. Driver’s preferences for certain trip types;
b. Preferred locations where a driver start and end their day; and
c. Other selective driving behaviours.
In determining the level of human involvement in its AI’s decision-making
for trip allocation, Grab considered the following key factors:
a. The scale of real-time decision-making required. As Grab has to make over
5,000 trip allocations every minute, this would mean an impact to customers
in terms of efficiency and cost if a human had to review each trip allocation; and
b. The severity and probability to users should the AI model work in a sub-
optimal manner.
Among other factors, Grab considered that: (1) it is not technically feasible for
a human to make such high volume of trip allocations in a short amount of time;
and (2) there is often little or no harm to life should there be less than optimal
trip allocations. Hence, Grab decided to adopt a human-out-of-the-loop
approach for its AI model deployed for trip allocation, while continuously
reviewing the AI model to ensure optimal performance.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 35
OPERATIONS MANAGEMENT
3.19 This section is intended to help organisations adopt responsible
measures in the operations aspect of their AI adoption process.
A reference AI adoption process is set out in order to provide a
context for the recommendations for good governance in respect
of the organisation’s data, algorithm and AI model.
3.20 The Model Framework uses the following generalised AI model
development and deployment process to describe phases in
implementing an AI solution by an organisation.5 It should be
noted that this process is not always uni-directional – it can, and
usually is, a continuous process of learning.
Data Preparation Algorithms Chosen Model
Stage 1: Stage 2: Stage 3:
Raw data is formatted Models are trained on The chosen model is
and cleansed so the dataset and used to produce
conclusions can be algorithms may be probability scores that
drawn accurately. applied. This includes can be incorporated
Generally, accuracy and statistical or machine into applications to
insights increase with learning models offer predictions, make
relevance and the including decision trees decisions, solve
amount of data. and neural networks. The problems and trigger
results are examined and actions.
models are iterated until
the most appropriate
model emerges.
Machine
Learning
Algorithms
Raw
Data
Data pre- Prepared Apply Candidate Chosen
processing Data Algorithms Model Model
Raw and/or Train
Data AI Model
Application
Iterate until data is ready Iterate for most appropriate model
5 Adapted from “Machine learning at scale” Microsoft Azure (2 December 2018) <https://
docs.microsoft.com/en-us/azure/architecture/data-guide/big-data/machine-learning-at-
scale> (accessed December 2019).

36
3.21 During deployment, algorithms such as linear regression
algorithms, decision trees, or neural networks are applied for
analysis on training datasets. The resulting algorithmic models
are examined and algorithms are iterated until a model that
produces the most appropriate results for the use case emerges.
This model and its results are then incorporated into applications
to offer predictions, make decisions, solve problems and trigger
actions. The intimate interaction between data and algorithm/
model is the focus of this part of the Model Framework.
DATA FOR MODEL DEVELOPMENT
3.22 Datasets used for building models may come from multiple
sources, and could include both personal and non-personal data.
The quality and selection of data from each of these sources are
critical to the success of an AI solution. If a model is built using
biased, inaccurate or non-representative data, the risks of
unintended discriminatory decisions from the model will increase.
To ensure the effectiveness of an
AI solution, relevant departments
within the organisation with
responsibilities over quality of data,
model training and model selection
must work together to put in place
good data accountability practices.
3.23 The persons who are involved in training and selecting models
for deployment may be internal staff or external service providers.
It is ideal for the models deployed in an intelligent system to
have an internal departmental owner, who will be the one making
decisions on which models to deploy. To ensure the effectiveness
of an AI solution, it would be helpful for relevant departments
within the organisation with responsibilities over quality of data,
model training and model selection to work together to put
in place good data accountability practices. These include
the following:

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 37
a. Understanding the lineage of data: This means
knowing where the data originally came from, how it
was collected, curated and moved within the
organisation, and how its accuracy is maintained over
time. Data lineage can be represented visually to trace
how the data moves from its source to its destination,
how the data gets transformed along the way, where
it interacts with other data, and how the representations
change. There are three types of data lineage:
i. Backward data lineage looks at the data from its
end-use and backdating it to its source.
ii. Forward data lineage begins at the data’s source
and follows it through to its end-use.
iii. End-to-end data lineage combines the two and
looks at the entire solution from both the data’s
source to its end-use and from its end-use to its
source.
Keeping a data provenance record allows an
organisation to ascertain the quality of the data based
on its origin and subsequent transformation, trace
potential sources of errors, update data, and attribute
data to their sources.
In some instances, the origin of data could be
difficult to establish. One example could be datasets
obtained from a trusted third-party which may have
commingled data from multiple sources. It would be
prudent for organisations to assess the risks of using
such data and manage them accordingly.

38
b. Ensuring data quality: Organisations are encouraged
to understand and address factors that may affect the
quality of data, such as:
i. The accuracy of the dataset, in terms of how well
the values in the dataset match the true
characteristics of the entities described by the
dataset;
ii. The completeness of the dataset, both in terms
of attributes and items;
iii. The veracity of the dataset, which refers to how
credible the data is, including whether the data
originated from a reliable source;
iv. How recently the dataset was compiled or updated;
v. The relevance of the dataset and the context for
data collection, as it may affect the interpretation
of and reliance on the data for the intended
purpose;
vi. The integrity of the dataset that has been joined
from multiple datasets, which refers to how well
extraction and transformation have been
performed;
vii. The usability of the dataset, including how well
the dataset is structured in a machine-
understandable form; and
viii. Human interventions (e.g. if any human has filtered,
applied labels, or edited the data).
c. Minimising inherent bias: There are many types of
bias relevant to AI. The Model Framework focuses on
inherent bias in datasets, which may lead to undesired
outcomes such as unintended discriminatory decisions.
Organisations should be aware that the data which
they provide to AI systems could contain inherent biases
and are encouraged to take steps to mitigate such
bias. The two common types of bias in data include:

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 39
i. Selection bias: This bias occurs when the data
used to produce the model are not fully
representative of the actual data or environment
that the model may receive or function in. Common
examples of selection bias in datasets are omission
bias and stereotype bias. Omission bias describes
the omission of certain characteristics from the
dataset. For example, a dataset consisting only
of Asian faces will exhibit omission bias if it is used
for facial recognition training for a population that
includes non-Asians. A dataset of vehicle types
within the central business district on a weekday
may exhibit stereotype bias weighted in favour of
cars, buses and motorcycles but under-represent
bicycles if it is used to model the types of
transportation available in Singapore.
ii. Measurement bias: This bias occurs when the
data collection device causes the data to be
systematically skewed in a particular direction. For
example, the training data could be obtained using
a camera with a colour filter that has been turned
off, thereby skewing the machine learning result.
While identifying and addressing inherent bias in
datasets may not be easy, organisations can mitigate
the risk of inherent bias by having a heterogeneous
dataset (i.e. collecting data from a variety of reliable
sources). Another way is to ensure the dataset is as
complete as possible, both from the perspective of
data attributes and data items. Premature removal of
data attributes can make it difficult to identify and
address inherent bias.

40
d. Different datasets for training, testing, and
validation: Different datasets are required for training,
testing, and validation. The model is trained using
the training data, while the model’s accuracy is
determined using the test data. Where applicable,
the model could also be checked for systematic bias
by testing it on different demographic groups to
observe whether any groups are being systematically
advantaged or disadvantaged.
Finally, the trained model can be validated using the
validation dataset. It is considered good practice to
split a large dataset into subsets for these purposes,
if it does not lead to a significant reduction in the
quality of data in terms of accuracy and representation.
However, where this is not possible (e.g. if the
organisation is not working with large datasets or are
using pre-trained models as in the case of transfer
learning), organisations are encouraged to be cognisant
of the risks of systematic bias and put in place
appropriate safeguards.
e. Periodic reviewing and updating of datasets: It
would be prudent for datasets (including training,
testing, and validation datasets) to be reviewed
periodically to ensure accuracy, quality, currency,
relevance and reliability. Where necessary, the datasets
can be updated with new input data obtained from
actual use of the AI models deployed in production.
When such new input data is used, organisations need
to be aware of potential bias as using new input data
that has already gone through a model once could
create a reinforcement bias.
3.24 Even if only non-personal data are used for the training of AI
models (including personal data that has been anonymised), the
good data accountability practices above remain relevant.

MODEL ARTIFICIAL INTELLIGENCE GOVERNANCE FRAMEWORK 41
SUADE LABS:
ILLUSTRATION ON MANAGING DATA FOR MODEL DEVELOPMENT
Suade (introduced above) has developed an AI-enabled solution that helps
financial institutions generate the required data and reports to comply with
regulatory requirements in the jurisdictions where they operate.
As the data used for Suade’s AI model development directly affects its quality
and performance, Suade has adopted several good data accountability practices.
For example, to ensure that regulatory data comes from a credible and reliable
source, Suade obtains and updates regulatory data only from the relevant
regulators. In addition, Suade tags the datasets used with additional metadata.
This allows Suade to trace datasets back to their original source when needed,
such as where inconsistencies are found. Further, in order to trace which particular
datasets were used in an AI model, Suade also documents and stores such
information pertaining to model development on its database.
Suade also minimises the inherent risks of AI models through responsible
data tagging. By using a larger number of taggers (i.e. people who tag data),
Suade aims to make the output of its AI models as neutral as possible, and
reduce the risk of its taggers being influenced by the context of the data (which
often comprise of text) they are annotating. In other words, Suade uses as
many individuals as practicable to tag data to reduce the risk of tagger bias.
In addition, Suade developed a tagging system to facilitate the annotation of
data. This system is used to generate training data used by the algorithm.
Suade will further develop this tagging system to enhance its ability to manage
multiple annotators and to better select datasets used for model training.
Suade also periodically updates the tagging system with new data. New training
data is subsequently fed repeatedly back into the AI model. This way, the AI
model is able to continuously learn from new sets of data.
Another data accountability practice that Suade adopts is the use of validation
schema checks at various stages of data transformation. This is a process in
which Suade verifies that the data schema accurately represents the data from
the source, to ensure that there are no errors in factors such as the data’s
formatting and content.

42
PYMETRICS:
ILLUSTRATION ON MANAGING BIASES
IN DATASETS FOR MODEL DEVELOPMENT
pymetrics is a technology provider that uses neuroscience insights and 