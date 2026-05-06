---
id: ca-ca-healthcanamldevice-2025
source_url: https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/guidance-documents/pre-market-guidance-machine-learning-enabled-medical-devices.html
fetched_date: 2026-05-06
fetch_status: OK
notes: April 2026. Cat. H164-354/2026E-PDF, ISBN 978-0-660-79792-2. Text provided manually from official PDF.
---

Pre-market guidance
for machine learning-
enabled medical
devices
Health Canada is the federal department responsible for helping the people of Canada maintain and improve
their health. Health Canada is committed to improving the lives of all of Canada's people and to making this country's
population among the healthiest in the world as measured by longevity, lifestyle and effective use of the public health
care system.
Également disponible en français sous le titre :
Lignes directrices préalables à la mise en marché pour les instruments médicaux fondés sur l'apprentissage machine
To obtain additional information, please contact:
Health Canada
Address Locator 0900C2
Ottawa, ON K1A 0K9
Tel.: 613-957-2991
Toll free: 1-866-225-0709
Fax: 613-941-5366
TTY: 1-800-465-7735
E-mail: publications-publications@hc-sc.gc.ca
© His Majesty the King in Right of Canada, as represented by the Minister of Health, 2026
Publication date: April 2026
Information contained in this publication or product may be reproduced, in whole or in part, and by any means, for
personal or public non-commercial purposes without charge or further permission, unless otherwise specified.
Commercial reproduction and distribution are prohibited except with written permission from Health Canada. To obtain
permission to reproduce any content owned by the Government of Canada available for commercial purposes, please
contact pubsadmin@hc-sc.gc.ca.
Cat.: H164-354/2026E-PDF
ISBN: 978-0-660-79792-2
Pub.: 250357
i
Table of Contents
Introduction ....................................................................................................................... 1
Scope and application ...................................................................................................... 2
Policy objective ................................................................................................................. 2
Policy statements .............................................................................................................. 3
Guidance for implementation ........................................................................................... 5
Good machine learning practice ...................................................................................... 6
Sex and gender-based analysis plus ............................................................................ 6
Design .............................................................................................................................. 7
Indications for use, intended use and contraindications ............................................... 7
Device description ........................................................................................................ 7
Predetermined change control plan.............................................................................. 8
Risk management .......................................................................................................... 12
Data selection and management ................................................................................... 13
Development and training .............................................................................................. 14
Testing and evaluation ................................................................................................... 15
Clinical validation ........................................................................................................... 16
Transparency ................................................................................................................. 17
Labelling ..................................................................................................................... 18
Post-market monitoring .................................................................................................. 20
Licence terms and conditions ..................................................................................... 20
1
Introduction
Artificial intelligence (AI) is a broad term for a category of algorithms and models that
perform tasks and exhibit behaviours such as learning and making decisions and
predictions. Machine learning (ML) is the subset of AI that allows ML training algorithms to
establish ML models when applied to data, rather than models that are explicitly
programmed.
Medical devices that use ML, in part or in whole, to achieve their intended medical purpose
are known as machine learning-enabled medical devices (MLMD). "Medical purpose"
refers to parts (a) through (e) of the "device" definition within the Food and Drugs Act (Act).
MLMD are subject to the Act and associated Medical Devices Regulations (Regulations).
In this guidance, "transparency" describes the degree to which appropriate and clear
information about a device (that could impact risks and patient outcomes) is
communicated to stakeholders (such as, patients, users, health care providers and
regulators). Transparency is an important aspect of the device's safety and effectiveness,
and helps stakeholders make informed decisions.
This guidance introduces the concept of a predetermined change control plan (PCCP). A
PCCP provides a mechanism for Health Canada to address cases where the regulatory
pre-authorization of planned changes to ML systems is needed to address a known risk.
Health Canada has adopted the MLMD terms and definitions used by the International
Medical Device Regulators Forum (IMDRF). Manufacturers are encouraged to review this
document:
• Machine learning-enabled medical devices: Key terms and definitions (IMDRF N67
document)
In this guidance, "ML training algorithm" refers to the software procedure that establishes
the parameters of an ML model by analyzing data. The "ML model" represents a
mathematical construct that generates an inference or prediction based on new input data
and is the result of an ML training algorithm learning from data. The "ML system" refers to
an ML-enabled software that meets the definition of medical device as per section 1 of the
Regulations, including ML models and the associated ML training algorithms.
2
Scope and application
This document provides guidance to manufacturers who are submitting a new or
amendment application for Class II, III and IV MLMD under the Regulations.
The information in this guidance relates to the ML system of an MLMD. It does not cover
the non-ML information required in a medical device licence application.
Manufacturers should also consult other relevant guidance relating to medical devices,
including the following:
• Guidance on supporting evidence to be provided for new and amended licence
applications for Class III and Class IV devices, not including in vitro diagnostic
devices (IVDDs)
• Class 3, in vitro diagnostic devices (IVD), new and amendment applications
• Class 4, in vitro diagnostic devices (IVD), new and amendment applications
• Software as a medical device (SaMD): Definition and classification
• Pre-market requirements for medical device cybersecurity – Summary
• Guidance for the interpretation of significant change of a medical device
• Guidance on clinical evidence requirements for medical devices
Policy objective
This guidance outlines supporting information to consider when manufacturers are
demonstrating the safety and effectiveness of an MLMD:
• for the purposes of applying for or amending a Class II, III or IV medical device
licence or
• at any point in the device lifecycle (Class I to Class IV)
3
Policy statements
An MLMD can be standalone software that meets the definition of a medical device. It can
also be a medical device that includes software that meets the definition of a medical
device.
An MLMD can be an in vitro diagnostic device (IVDD) or a non-IVDD. The risk
classification of an MLMD can range from Class I to Class IV.
Manufacturers should clearly state that the device uses ML in their cover letter for all Class
II, III and IV applications for an MLMD. Furthermore, for MLMDs that have a PCCP,
manufacturers should clearly state in their cover letter that their device includes a PCCP.
Excluding such statements could delay the application process.
Manufacturers should include a justification for the proposed medical device classification
applied to the MLMD. This justification should reference the classification rules outlined in
Schedule 1 of the Regulations.
Medical devices must meet the applicable requirements of sections 10 to 20 of the
Regulations. Manufacturers must ensure that objective evidence is available to support the
intended use of the MLMD, the safety and effectiveness of the device and the associated
claims.
An application must demonstrate that the MLMD (including the PCCP, as appropriate):
• meets, and will continue to meet, applicable safety and effectiveness requirements
• will maintain a high level of protection of health and safety and an acceptable level
of risk when weighed against the benefits to the patient
Class II, III and Class IV applications must include the information listed in section 32 of
the Regulations. Additional information may be requested at any time during our review of
an application (new or amendment) or after a device has been licensed.
Health Canada understands that manufacturers may use a variety of information,
methodologies and evidence to demonstrate that their MLMD is safe and effective.
Additionally, different intended uses or risk profiles may require different types or levels of
evidence. As such, we have outlined information for consideration rather than prescribing
4
the required information for all scenarios. Health Canada applies a risk-based approach to
determine the evidence requirements.
The guidance for implementation section of this document outlines the information to
consider including, or having available upon request, for an MLMD licence application. If
any of the information identified in this section is not available, manufacturers should offer
a justification or provide alternative information, as applicable.
Data referred to or used by manufacturers should be justified as adequately representative
of the Canadian population and clinical practice. Any data used to develop the MLMD or
demonstrate a device's safety and effectiveness should reflect the population for whom the
device is intended. For example, this could include consideration of skin pigmentation,
biological differences between sexes and other identity-based factors.
For those devices that are authorized with a PCCP, subsequent changes made according
to the authorized PCCP do not require that you submit a medical device licence
amendment application for a significant change. Those changes should be documented
within the manufacturer’s Quality Management System. PCCP-driven changes are still
subject to other licence amendment requirements, such as a change in identifier of the
device, and relevant post-market regulatory oversight.
For amendments to a device that are outside of an authorized PCCP, including changes to
the PCCP itself, the Regulations and relevant guidance documents should be consulted
before implementation. It's important to determine whether the change constitutes a
significant change and requires an application for a medical device licence amendment.
A PCCP may be submitted with applications for a new medical device licence or a medical
device licence amendment. Manufacturers may consider the pre-submission process, as
appropriate, to discuss a proposed PCCP prior to submitting a licence application.
This guidance represents Health Canada’s current thinking. We may revise this guidance
and adapt our policy approach as the technology matures and the regulatory oversight has
been optimized.
5
Guidance for implementation
Health Canada considers product lifecycle information to be essential in demonstrating the
safety and effectiveness of an MLMD. From our perspective, the MLMD lifecycle includes
the following components:
• good machine learning practice
• design
• risk management
• data selection and management
• development and training
• testing and evaluation
• clinical validation
• transparency
• post-market monitoring
Figure 1 gives a visual overview of the content areas discussed in this document. The
iterative components reflected in this lifecycle schematic are not mutually exclusive
and may not occur in the order indicated.
Figure 1: MLMD product lifecycle
6
Good machine learning practice
Good machine learning practice (GMLP) is important when designing, developing,
evaluating, deploying and maintaining an MLMD. This helps to ensure safe, effective and
high-quality medical devices. Additional information can be found in the Good Machine
Learning Practice for Medical Device Development: Guiding Principles.
The evidence provided with an application for an MLMD should include a description of
how the manufacturer has considered GMLP within the organization and implemented it
throughout the product lifecycle, as applicable. If applicable, this description should outline
the quality practices implemented to ensure that the PCCP change description will be
realized by following the PCCP change protocol.
Sex and gender-based analysis plus
Sex and gender-based analysis plus (SGBA Plus or GBA Plus) is an analytical process
used to assess how a product or initiative may affect diverse groups of people. This
process can be incorporated into the risk management approach used across the lifecycle
of the device.
Evidence demonstrates that biological, economic and social differences between diverse
groups of people contribute to differences in health risks and outcomes, their use of health
services and how they interact with the health system. Integrating SGBA Plus throughout
the lifecycle of a medical device will lead to more equitable health outcomes for Canada's
diverse population.
Over the lifecycle of the MLMD, manufacturers should apply SGBA Plus and consider the
unique anatomical, physiological and identity characteristics of patients. This includes:
• taking into consideration sex and gender, racial and ethnic minorities, elderly and
pediatric populations, and pregnant people
• collecting and analyzing disaggregated data on sub-populations in clinical
studies, training data and test data, as appropriate
7
Design
Indications for use, intended use and contraindications
For any Class II, III or IV MLMD, the intended use or medical purpose should be made
clear in the application. Provide all relevant information, including the following:
• the intended use and/or indications for use of the MLMD
• the medical purpose (for example, diagnosis, treatment, monitoring) and the
intended conditions, diseases or disorders
• the intended patient population
• the intended user
• the intended use environment
• device function information, as applicable, including:
o software inputs
o software outputs
o an explanation of how the software output fits into the healthcare workflow
o the degree of autonomy
 the capacity to perform a clinical function with no or limited user
intervention
• contraindications
• all known limitations
Device description
Provide a detailed description of the MLMD, including any ML systems used to achieve an
intended medical purpose. Consider including the following information in the description
of the device or software:
• a statement that the device uses ML, which should also be included in the cover
letter
• if applicable, a confirmation that the MLMD includes a PCCP, which should also be
included in the cover letter
• a detailed description of the ML methods, training algorithms and architecture
8
o ML methods such as supervised learning, unsupervised learning, semi-
supervised learning and reinforcement learning
o ML training algorithm(s) such as convolutional neural networks, logistic
regression, support vector machines, generative adversarial networks (GAN),
transformers, generative pre-trained transformers
o ML architecture such as the ML software components, operating parameters,
development techniques, training loss functions, model tuning approaches
• a description of the data used to develop or train the ML system
o refer to the Data selection and management section of this guidance
• a description of the ML system output, intended users, how the output is intended to
be used within the health care workflow and the clinical degree of autonomy
o the capacity to perform a clinical function with no or limited clinical user
intervention
• an explanation of how the ML system works, the known factors influencing the
output and the interpretation of the system behaviour, if available
o for example, feature attributions to ML model predictions, how the outputs of the
ML model are impacted by changing input properties, saliency maps
• descriptions of the following:
o required device input parameters, input specifications and source(s) of device
input(s)
o all compatible medical devices, including software and hardware versions
o hardware requirements (for example: CPU, GPU and RAM requirements;
operating system)
Predetermined change control plan:
A PCCP is the documentation intended to describe changes that will be made to the
MLMD as well as the device bounds or limits (for example, performance envelope) and
how the changes will be implemented and assessed. The changes described in a PCCP
include those that would otherwise require a medical device licence amendment
application for a significant change prior to implementation. A PCCP includes a change
description, change protocol and impact assessment. If included, a PCCP is considered
part of the device design.
9
PCCPs should be risk-based and supported by evidence, take a total product lifecycle
perspective and provide a high degree of transparency. Additional information can be
found in the Predetermined change control plans for machine learning-enabled medical
devices: Guiding principles.
All modifications listed in a PCCP must ensure that the device continues to operate within
its intended use. Changes listed in a PCCP should not include changes to the medical
conditions, purposes or uses of an MLMD. Such changes require a medical device licence
amendment application prior to implementation.
Appropriate changes to list in a PCCP include those where pre-authorization addresses a
known risk while upholding the benefits to the patient. An example of such a change would
be the maintenance or improvement of performance to address the risk of ML performance
degradation over time. This performance degradation can be due to changes to the
environment, such as to the input data or the relationship between the input variables and
the target variable.
The use of a PCCP allows timely and ongoing management of risks while ensuring device
safety and effectiveness.
A PCCP consists of the following 3 components:
1. Change description
2. Change protocol
3. Impact assessment
The detailed PCCP, if applicable to the device, should:
• be a standalone section in the submission, typically within either the 'device
description' or 'software' section
• include references to any application information related to the PCCP that's outside
of the PCCP section, such as in the labelling or evidence used to demonstrate
safety and effectiveness
• consider the information outlined in the following 3 sections
1) Change description
The change description is the documentation that characterizes the device and the
proposed changes. It includes, but is not limited to:
10
• a description of the initial baseline device design and performance as well as the
design and performance envelope or limits over time:
o such as performance specifications and associated performance thresholds,
inputs, outputs and relevant technical specifications
• a list of specific changes to the MLMD that are proposed for pre-authorization that
would otherwise be significant changes in the absence of an authorized PCCP
• with each change listed, a detailed description of the following:
o motivation, rationale or trigger for the planned changes
 for example, performance thresholds, scheduled time intervals, user
feedback
o cause or source of the changes to the device
 for example, re-training with new or appended data
o effect of the changes on the device
 for example, modified performance, changes in device inputs or outputs
o where the changes apply
 for example, uniformly across all marketed devices, non-uniformly across
marketed devices based on unique characteristics of a clinical site or
patient
o who will make the changes
 for example, manufacturer, qualified clinical user, non-clinical user,
patient, automatically by the software
o planned frequency of changes
o any anticipated modifications to the device description, labelling, user interface
2) Change protocol
The change protocol describes the set of policies and procedures that control how
changes, as outlined in the change description, will be implemented and managed. The
protocol ensures ongoing safety and effectiveness.
Aspects of the change protocol that may need to be part of the licence application include,
but are not limited to, plans for ongoing:
• Data management
11
o may include, for example, plans for collecting, annotating, curating, validating,
determining reference standard or ground truth, quality assurance
• Risk management
o may include, for example, plans for ongoing risk identification, monitoring and
response
• Modification procedures
o may include, for example, plans for re-training, learning techniques, update
triggers, pre-update verification and validation methods, such as ML system
performance validation and its impact on the performance of the MLMD if
applicable
• Update procedures
o may include, for example, version tracking and control such as traceability,
ongoing documentation of the PCCP execution history, deployment plan, end-
user communication plan, labelling update plan and user acceptance testing
• Monitoring
o may include, for example, plans for post-update testing and performance
monitoring, regular challenge components (to evaluate how the performance
degrades), frequency of assessments and triggers for evaluation, statistical
analysis plan, plans for device surveillance, complaint handling and reporting
incidents
• Corrective actions
o may include, for example, roll-back plans, backup and recovery procedures,
retraining criteria and objectives, and customer communications
Each change in the change description should be clearly traceable to the relevant aspects
of the change protocol (for example, through a traceability table).
3) Impact assessment
The impact assessment outlines the potential influence and implications of the changes
listed in the PCCP. Aspects it should consider include, but are not limited to:
• the benefits and risks of implementing the PCCP and the risk controls in place
• how the change protocol will continue to ensure the ongoing safety and
effectiveness of the device
12
• the collective impact of all proposed changes on the MLMD and the impacts on
other elements of the clinical workflow, including on other medical devices
Risk management
Manufacturers should conduct the necessary risk management across the lifecycle of the
MLMD and consider providing descriptions of:
• the risks identified for the MLMD and the associated risk controls in place to
eliminate or reduce those risks
• the technique used to perform the initial and ongoing risk assessment and the
system used for risk level categorization and acceptability
• the results of the risk assessment
The following items, as applicable, should be considered in the risk analysis:
• erroneous outputs, such as:
o false positive or false negative results
o incorrect information for use in a medical purpose such as diagnosis or
treatment
o generated outputs that are delusions, confabulated, inappropriate, false or
misleading
• bias
o a systematic difference in treatment of certain objects, people or groups in
comparison to others
o note that the management of unwanted bias should consider the identity
characteristics of the intended population, the technical characteristics of the
device and device inputs, the context of device use, dataset sources, data
management, device development and performance evaluation
o note that SGBA Plus analysis may address some sources of unwanted bias
• overfitting
o an issue that occurs when a model is fit to properties that are specific to the
training examples (for example, random noise), resulting in a model that does
not apply to the general problem it's meant to address
• underfitting
13
o an issue that occurs when a model is not fit to all relevant properties of the
population from the training examples, resulting in a model that does not apply
to the general problem it's meant to address
• degradation of ML system performance
o an issue that can occur due to shifts in population demographics or disease
incidence, changes in clinical practice, changes in clinical disease presentation,
changes in input format or quality
• automation bias
o an issue that occurs when a user's conclusion is overly reliant on the device
output while ignoring contrary data or conflicting human decisions
• alarm fatigue
o an issue that occurs when a user is desensitized to alarms due to excessive
exposure, which can result in missed alarms
• risks associated with using a PCCP
• impacts of a PCCP on risk management
When performing the risk management for an MLMD, consider referring to the current
version of the following resource:
• ISO 14971, Medical devices - Application of risk management to medical devices
Data selection and management
The quality of the datasets used to develop an MLMD will influence the quality of the
device. The data characterization is an important aspect of the device evaluation.
When describing the selection and management of data for an MLMD, consider providing
the following elements:
• descriptions of the training, tuning and test datasets used to develop and evaluate
the ML system, such as:
o sample sizes with and without the condition, clinical characteristics and
demographic statistics
o a comparison between the prevalence within the dataset and the intended
population
14
o methods and environments in which the data were collected
o data collection devices
o single versus multi-centre data, personalized data
o justifications to support the dataset characteristics, for example, according to:
 their relation to the intended use
 statistical considerations
 identity factors (such as sex, gender, race or age)
 consideration of subgroups, such as under-represented populations
 representation of the Canadian population
• data inclusion and exclusion criteria and a justification for removing any data
• descriptions of techniques used to address data imbalances (for example, specific
sampling methods or data augmentation techniques used to address a dataset that
has low disease prevalence) and a justification
• a description of how data integrity was maintained during curation and how data
quality and accuracy were ensured, including a description of any data
augmentation or imputation practices
o for example, geometric transformations or synthetic generative outputs, intended
to enhance the size and quality of datasets
• an explanation of how bias in the dataset was controlled during development
Development and training
Consider providing descriptions of the ML development, training and tuning approaches,
including the following elements:
• a detailed description of the methods used to develop, train and tune the ML system
and a justification to support these methods
• a characterization of the reference standard used in training and tuning, including:
o the process and methodology used to define the reference standard
o a justification to support the chosen reference standard
o a description of any uncertainty and associated limitations
15
• a description of the inputs and parameters used to develop the ML system and any
features extracted from the input data
Testing and evaluation
Consider including the following information on ML system performance testing as part of
the performance/bench testing or software verification and validation:
• a description of the methods used to test or evaluate the ML system performance
• a description of the data used to test the ML system
o refer to the Data selection and management section of this guidance
• a characterization of the reference standard used in testing, including:
o the process and methodology used to define the reference standard
o a justification to support the chosen reference standard
o a description of any uncertainty and associated limitations
• descriptions of the chosen performance metrics, acceptance criteria and operating
point/threshold, with clinical and risk-based justifications
• evidence to demonstrate that the ML system performs as intended and meets
expected performance requirements when integrated as part of the medical device
system or software
• evidence to support the performance of the ML system for appropriate subgroups,
including at the relevant intersections, for example according to:
o identity factors (such as sex, gender, race, age)
o under-represented populations
o clinical status (such as diagnosis, stage, grade)
o clinical features (such as tissue density, lesion type, co-occurrence of
conditions)
• evidence to support inter-compatibility with all supported input and output devices
• robustness testing
o for example, intentional testing with unexpected inputs
• statistical tests of significance, where appropriate
16
• estimate of the uncertainty of the outputs, with supporting evidence and a
justification to support the method used to determine the uncertainty
• the ML software version that was tested, which should represent the appropriate
release version
• an explanation of the software version numbering system and the identification and
traceability of the ML system or model version
Clinical validation
In a medical device licence application for a Class III or IV MLMD, manufacturers should
provide the appropriate clinical evidence, including clinical validation studies, to support
the safe and effective clinical use of their device. This information should be available
upon request for Class II MLMD.
For more information on clinical evidence requirements, consult:
• Guidance on clinical evidence requirements for medical devices
• Companion document: Examples of clinical evidence requirements for medical
devices
The clinical evidence should support that the trained, tuned and tested ML system, and the
MLMD with that ML system, is safe and effective and performs as intended in the intended
population.
Examples of clinical evidence that can be used include:
• clinical validation studies, including descriptions of:
o the type of study performed
o the study design and statistical methods
o the rationale for the study design and methods, including:
 relevance to the intended use of the device
 comparison to standard of care
 the use of retrospective and/or prospective evaluations
o a description of the model studied (including the ML software version and the ML
methods and training algorithms)
17
o a characterization of study participants and confirmation that the study
population is independent of the data used for ML system development, training
and tuning
o the rationale for the study population, which may include:
 the relation to the intended use
 the representation across sex, gender, race, age and/or other identity
factors
 statistical considerations
o study results, overall and for appropriate subgroups
o limitations
• relevant clinical data from published sources
• device-related investigations
o for example, comparator device clinical data
• usability/human factors testing
• device-specific evaluations
• real-world evidence (RWE) and post-market clinical experience
The clinical evidence should accompany a justification to support the level of evidence.
This justification should establish that the evidence is sufficient to demonstrate:
• the device is safe and effective for the intended population when used as described
in the 'intended use' and/or 'indications for use' statement
• as appropriate, the impacts of the device on different sexes, genders and diverse
populations, including racial and ethnic groups, and pediatric and older populations
Transparency
Transparency requirements should consider the various stakeholders involved in a
patient’s health care across the lifecycle of the device (for example, patients, users, health
care providers and regulators). Relevant aspects include the intended use and information
about device development and performance and (when available) how an output or result
is reached or the basis for a decision or action (sometimes referred to as explainability,
which is one part of transparency). Additional information can be found in
the Transparency for machine learning-enabled medical devices: Guiding principles.
18
Transparency should be considered throughout the device lifecycle and within the:
• device labelling (including instruction for use)
• software user interface
• medical device licence application
Transparency should continue to be considered during device use and upon device
changes.
The following subsection outlines transparency considerations for MLMD labelling for the
end-user.
Labelling
Manufacturers should provide copies of the labelling, including those pertaining to the ML
system, within applications for Class II, III and IV MLMDs. Health Canada will review the
labels against the requirements outlined in sections 21, 22 and 23 of the Regulations.
Directions for use or instructions for use for the device, as well as product brochures,
websites and marketing material with claims related to the ML system, are all considered
labelling.
The following ML system information should be considered for inclusion in MLMD labelling,
as applicable:
• indications for use, intended use and contraindications (refer to the section
under Design)
• instructions for the user, such as:
o how to use the ML system software to generate an output
o how to interpret the software interface, including:
 the ML system output and any information provided to help users
interpret each output (for example, saliency maps and confidence
scores)
o how to perform calibrations, local validation and ongoing performance
monitoring
• device design information, such as:
o a statement that the device includes ML
19
o how the ML system works, for example:
 ML approaches and training algorithms
 feature attributions to ML model predictions, factors influencing the
output, if available
o required device input parameters, input specifications and source(s) of device
input(s)
o compatible medical devices, including software and hardware versions
o hardware and software requirements (for example, CPU requirements, operating
system)
o dataset characterizations of training and test datasets, such as:
 data collection environment/method
 determination of reference standard
 sample sizes with and without the condition, clinical characteristics,
demographic statistics
 inclusion/exclusion criteria
• device change information, such as:
o a statement communicating that the device includes a PCCP or pre-authorized
changes that would otherwise require regulatory review, if applicable
o the intended changes within a PCCP and expected update frequency, as
applicable
o any requirements for the user to perform software updates
o notifications when a software update occurs and the impacts on device
performance, labelling or use (including updated labelling and updated
performance information)
• device performance information, such as:
o chosen performance metrics and acceptance criteria as well as the operating
point/threshold
o detailed results of the performance testing, including results for appropriate
subgroups and the performance uncertainty (for example, confidence intervals)
o summaries of clinical studies, if applicable, including detailed characterization of
the study participants, methods and results
20
• device limitation information, such as:
o data characterization limitations
o limitations in the development techniques
o limitations in the performance evaluation
o known failure modes
o applicable warnings or cautions related to the ML system
Manufacturers should consider including a structured summary of the key ML system
information in the labelling (sometimes referred to as a model card, data card or model
facts).
Post-market monitoring
Manufacturers should consider including a description of the processes, surveillance and
performance monitoring plans and risk mitigations in place to ensure ongoing performance
and inter-compatibility of the ML system.
This should consider the impact on ML system outputs or clinical workflows that could
result from:
• ML system performance degradation over time
• shifts in the input data distribution after deployment
• changes in the ML system inputs or input sources
• changes to how the ML system outputs are handled by compatible products
This should include references to any related information in the risk analysis and the
PCCP, if applicable.
Licence terms and conditions
At the time of licensing, all requirements related to medical device safety and effectiveness
under sections 10 to 20 of the Regulations must be met.
As per subsection 36(2) of the Regulations, the Minister may, at any time, impose T&Cs
on a licence, or amend those T&Cs. The goal of imposing or amending T&Cs is to meet 1
or more of the following objectives:
21
• maintaining the safety and effectiveness of the device
o by ensuring the device continues to meet applicable safety and effectiveness
requirements under sections 10 to 20 of the Regulations
• optimizing the benefits and managing the risks associated with the device
• identifying any changes relating to those device benefits and risks and managing
uncertainties related to the device benefits and risks
For example, the ongoing safety and effectiveness of marketed MLMDs may be
strengthened by imposing T&Cs to manage uncertainties related to the benefits and risks
associated with ML and PCCPs.
Before imposing or amending a T&C, the Minister will first consider whether:
• there are uncertainties relating to the benefits or risks associated with the device
o for example, although overall evidence demonstrates an acceptable benefit-risk
profile, the benefits weighed against the risks may be less known in certain
population subgroups
• the requirements under the Act and its regulations are sufficient to meet the stated
objectives
o by considering, for example, if there are other legislative tools that can be used
to meet the objectives instead of using T&Cs
• the proposed T&C may contribute to those objectives being met
• compliance with the proposed T&C is technically feasible
• there are less burdensome ways for those objectives to be met
The outcome of these considerations don't determine whether the Minister will impose or
amend a T&C. Rather, the considerations help to inform the Minister's decision.
For more information, consult the Guidance on terms and conditions for class II to IV
medical devices.
