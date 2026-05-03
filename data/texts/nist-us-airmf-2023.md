---
id: nist-us-airmf-2023
source_url: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
fetched_date: 2026-05-02
content_type: pdf (48 pages)
---

NIST AI 100-1
Artificial Intelligence Risk Management
Framework (AI RMF 1.0)

NIST AI 100-1
Artificial Intelligence Risk Management
Framework (AI RMF 1.0)
Thispublicationisavailablefreeofchargefrom:
https://doi.org/10.6028/NIST.AI.100-1
January2023
U.S.DepartmentofCommerce
GinaM.Raimondo,Secretary
NationalInstituteofStandardsandTechnology
LaurieE.Locascio,NISTDirectorandUnderSecretaryofCommerceforStandardsandTechnology

Certain commercial entities, equipment, or materials may be identified in this document in order to describe
an experimental procedure or concept adequately. Such identification is not intended to imply recommenda-
tion or endorsement by the National Institute of Standards and Technology, nor is it intended to imply that
the entities, materials, or equipment are necessarily the best available for the purpose.
Thispublicationisavailablefreeofchargefrom: https://doi.org/10.6028/NIST.AI.100-1
UpdateScheduleandVersions
TheArtificialIntelligenceRiskManagementFramework(AIRMF)isintendedtobealivingdocument.
NISTwillreviewthecontentandusefulnessoftheFrameworkregularlytodetermineifanupdateisappro-
priate;areviewwithformalinputfromtheAIcommunityisexpectedtotakeplacenolaterthan2028. The
Frameworkwillemployatwo-numberversioningsystemtotrackandidentifymajorandminorchanges.The
firstnumberwillrepresentthegenerationoftheAIRMFanditscompaniondocuments(e.g., 1.0)andwill
change only with major revisions. Minor revisions will be tracked using “.n” after the generation number
(e.g.,1.1). AllchangeswillbetrackedusingaVersionControlTablewhichidentifiesthehistory,including
version number, date of change, and description of change. NIST plans to update the AI RMF Playbook
frequently.CommentsontheAIRMFPlaybookmaybesentviaemailtoAIframework@nist.govatanytime
andwillbereviewedandintegratedonasemi-annualbasis.

Table of Contents
ExecutiveSummary 1
Part1: FoundationalInformation 4
1 FramingRisk 4
1.1 UnderstandingandAddressingRisks,Impacts,andHarms 4
1.2 ChallengesforAIRiskManagement 5
1.2.1 RiskMeasurement 5
1.2.2 RiskTolerance 7
1.2.3 RiskPrioritization 7
1.2.4 OrganizationalIntegrationandManagementofRisk 8
2 Audience 9
3 AIRisksandTrustworthiness 12
3.1 ValidandReliable 13
3.2 Safe 14
3.3 SecureandResilient 15
3.4 AccountableandTransparent 15
3.5 ExplainableandInterpretable 16
3.6 Privacy-Enhanced 17
3.7 Fair–withHarmfulBiasManaged 17
4 EffectivenessoftheAIRMF 19
Part2: CoreandProfiles 20
5 AIRMFCore 20
5.1 Govern 21
5.2 Map 24
5.3 Measure 28
5.4 Manage 31
6 AIRMFProfiles 33
AppendixA:DescriptionsofAIActorTasksfromFigures2and3 35
AppendixB:HowAIRisksDifferfromTraditionalSoftwareRisks 38
AppendixC:AIRiskManagementandHuman-AIInteraction 40
AppendixD:AttributesoftheAIRMF 42
List of Tables
Table1 Categoriesandsubcategoriesforthe GOVERN function. 22
Table2 Categoriesandsubcategoriesforthe MAP function. 26
Table3 Categoriesandsubcategoriesforthe MEASURE function. 29
Table4 Categoriesandsubcategoriesforthe MANAGE function. 32
i

NISTAI100-1 AIRMF1.0
List of Figures
Fig.1 ExamplesofpotentialharmsrelatedtoAIsystems. TrustworthyAIsystems
and their responsible use can mitigate negative risks and contribute to bene-
fitsforpeople,organizations,andecosystems. 5
Fig.2 Lifecycle and Key Dimensions of an AI System. Modified from OECD
(2022) OECD Framework for the Classification of AI systems — OECD
Digital Economy Papers. The two inner circles show AI systems’ key di-
mensions and the outer circle shows AI lifecycle stages. Ideally, risk man-
agement efforts start with the Plan and Design function in the application
context and are performed throughout the AI system lifecycle. See Figure 3
forrepresentativeAIactors. 10
Fig.3 AI actors across AI lifecycle stages. See Appendix A for detailed descrip-
tions of AI actor tasks, including details about testing, evaluation, verifica-
tion, and validation tasks. Note that AI actors in the AI Model dimension
(Figure2)areseparatedasabestpractice,withthosebuildingandusingthe
modelsseparatedfromthoseverifyingandvalidatingthemodels. 11
Fig.4 Characteristics of trustworthy AI systems. Valid & Reliable is a necessary
condition of trustworthiness and is shown as the base for other trustworthi-
ness characteristics. Accountable & Transparent is shown as a vertical box
becauseitrelatestoallothercharacteristics. 12
Fig.5 Functions organize AI risk management activities at their highest level to
govern, map, measure, and manage AI risks. Governance is designed to be
a cross-cutting function to inform and be infused throughout the other three
functions. 20
Pageii

NISTAI100-1 AIRMF1.0
Executive Summary
Artificial intelligence (AI) technologies have significant potential to transform society and
people’s lives – from commerce and health to transportation and cybersecurity to the envi-
ronment and our planet. AI technologies can drive inclusive economic growth and support
scientific advancements that improve the conditions of our world. AI technologies, how-
ever,alsoposerisksthatcannegativelyimpactindividuals,groups,organizations,commu-
nities,society,theenvironment,andtheplanet. Likerisksforothertypesoftechnology,AI
riskscanemergeinavarietyofwaysandcanbecharacterizedaslong-orshort-term,high-
orlow-probability,systemicorlocalized,andhigh-orlow-impact.
The AI RMF refers to an AI system as an engineered or machine-based system that
can,foragivensetofobjectives,generateoutputssuchaspredictions,recommenda-
tions,ordecisionsinfluencingrealorvirtualenvironments. AIsystemsaredesigned
tooperatewithvaryinglevelsofautonomy(Adaptedfrom: OECDRecommendation
onAI:2019; ISO/IEC 22989:2022).
Whiletherearemyriadstandardsandbestpracticestohelporganizationsmitigatetherisks
of traditional software or information-based systems, the risks posed by AI systems are in
manywaysunique(SeeAppendixB).AIsystems,forexample,maybetrainedondatathat
canchangeovertime,sometimessignificantlyandunexpectedly,affectingsystemfunction-
ality and trustworthiness in ways that are hard to understand. AI systems and the contexts
inwhichtheyaredeployedarefrequentlycomplex,makingitdifficulttodetectandrespond
to failures when they occur. AI systems are inherently socio-technical in nature, meaning
they are influenced by societal dynamics and human behavior. AI risks – and benefits –
can emerge from the interplay of technical aspects combined with societal factors related
to how a system is used, its interactions with other AI systems, who operates it, and the
socialcontextinwhichitisdeployed.
TheserisksmakeAIauniquelychallengingtechnologytodeployandutilizebothfororga-
nizations and within society. Without proper controls, AI systems can amplify, perpetuate,
or exacerbate inequitable or undesirable outcomes for individuals and communities. With
propercontrols,AIsystemscanmitigateandmanageinequitableoutcomes.
AI risk management is a key component of responsible development and use of AI sys-
tems. Responsible AI practices can help align the decisions about AI system design, de-
velopment, and uses with intended aim and values. Core concepts in responsible AI em-
phasizehumancentricity,socialresponsibility,andsustainability. AIriskmanagementcan
drive responsible uses and practices by prompting organizations and their internal teams
who design, develop, and deploy AI to think more critically about context and potential
or unexpected negative and positive impacts. Understanding and managing the risks of AI
systemswillhelptoenhancetrustworthiness,andinturn,cultivatepublictrust.
Page1

NISTAI100-1 AIRMF1.0
Social responsibility can refer to the organization’s responsibility “for the impacts
of its decisions and activities on society and the environment through transparent
and ethical behavior” (ISO 26000:2010). Sustainability refers to the “state of the
global system, including environmental, social, and economic aspects, in which the
needs of the present are met without compromising the ability of future generations
to meet their own needs” (ISO/IEC TR 24368:2022). Responsible AI is meant to
result in technology that is also equitable and accountable. The expectation is that
organizational practices are carried out in accord with “professional responsibility,”
defined by ISO as an approach that “aims to ensure that professionals who design,
develop, or deploy AI systems and applications or AI-based products or systems,
recognize their unique position to exert influence on people, society, and the future
ofAI”(ISO/IEC TR 24368:2022).
As directed by the National Artificial Intelligence Initiative Act of 2020 (P.L. 116-283),
the goal of the AI RMF is to offer a resource to the organizations designing, developing,
deploying,orusingAIsystemstohelpmanagethemanyrisksofAIandpromotetrustwor-
thy and responsible development and use of AI systems. The Framework is intended to be
voluntary,rights-preserving,non-sector-specific,anduse-caseagnostic,providingflexibil-
ity to organizations of all sizes and in all sectors and throughout society to implement the
approachesintheFramework.
The Framework is designed to equip organizations and individuals – referred to here as
AI actors – with approaches that increase the trustworthiness of AI systems, and to help
foster the responsible design, development, deployment, and use of AI systems over time.
AI actors are defined by the Organisation for Economic Co-operation and Development
(OECD) as “those who play an active role in the AI system lifecycle, including organiza-
tions and individuals that deploy or operate AI” [OECD (2019) Artificial Intelligence in
Society—OECDiLibrary](SeeAppendixA).
The AI RMF is intended to be practical, to adapt to the AI landscape as AI technologies
continue to develop, and to be operationalized by organizations in varying degrees and
capacities so society can benefit from AI while also being protected from its potential
harms.
The Framework and supporting resources will be updated, expanded, and improved based
on evolving technology, the standards landscape around the world, and AI community ex-
perienceandfeedback. NISTwillcontinuetoaligntheAIRMFandrelatedguidancewith
applicable international standards, guidelines, and practices. As the AI RMF is put into
use,additionallessonswillbelearnedtoinformfutureupdatesandadditionalresources.
The Framework is divided into two parts. Part 1 discusses how organizations can frame
therisksrelatedtoAIanddescribestheintendedaudience. Next,AIrisksandtrustworthi-
ness are analyzed, outlining the characteristics of trustworthy AI systems, which include
Page2

NISTAI100-1 AIRMF1.0
valid and reliable, safe, secure and resilient, accountable and transparent, explainable and
interpretable,privacyenhanced,andfairwiththeirharmfulbiasesmanaged.
Part 2 comprises the “Core” of the Framework. It describes four specific functions to help
organizations address the risks of AI systems in practice. These functions – GOVERN,
MAP, MEASURE, and MANAGE – are broken down further into categories and subcate-
gories. While GOVERN applies to all stages of organizations’ AI risk management pro-
cesses and procedures, the MAP, MEASURE, and MANAGE functions can be applied in AI
system-specificcontextsandatspecificstagesoftheAIlifecycle.
Additional resources related to the Framework are included in the AI RMF Playbook,
whichisavailableviatheNISTAIRMFwebsite:
https://www.nist.gov/itl/ai-risk-management-framework.
Development of the AI RMF by NIST in collaboration with the private and public sec-
tors is directed and consistent with its broader AI efforts called for by the National AI
Initiative Act of 2020, the National Security Commission on Artificial Intelligence recom-
mendations, and the Plan for Federal Engagement in Developing Technical Standards and
Related Tools. Engagement with the AI community during this Framework’s development
– via responses to a formal Request for Information, three widely attended workshops,
publiccommentsonaconceptpaperandtwodraftsoftheFramework,discussionsatmul-
tiplepublicforums,andmanysmallgroupmeetings–hasinformeddevelopmentoftheAI
RMF 1.0 as well as AI research and development and evaluation conducted by NIST and
others. Priority research and additional guidance that will enhance this Framework will be
captured in an associated AI Risk Management Framework Roadmap to which NIST and
thebroadercommunitycancontribute.
Page3

NISTAI100-1 AIRMF1.0
Part 1: Foundational Information
1. Framing Risk
AI risk management offers a path to minimize potential negative impacts of AI systems,
such as threats to civil liberties and rights, while also providing opportunities to maximize
positive impacts. Addressing, documenting, and managing AI risks and potential negative
impactseffectivelycanleadtomoretrustworthyAIsystems.
1.1 UnderstandingandAddressingRisks,Impacts,andHarms
InthecontextoftheAIRMF,riskreferstothecompositemeasureofanevent’sprobability
of occurring and the magnitude or degree of the consequences of the corresponding event.
The impacts, or consequences, of AI systems can be positive, negative, or both and can
result in opportunities or threats (Adapted from: ISO 31000:2018). When considering the
negative impact of a potential event, risk is a function of 1) the negative impact, or magni-
tude of harm, that would arise if the circumstance or event occurs and 2) the likelihood of
occurrence (Adapted from: OMB Circular A-130:2016). Negative impact or harm can be
experienced by individuals, groups, communities, organizations, society, the environment,
andtheplanet.
“Riskmanagementreferstocoordinatedactivitiestodirectandcontrolanorganiza-
tionwithregardtorisk”(Source: ISO 31000:2018).
While risk management processes generally address negative impacts, this Framework of-
fers approaches to minimize anticipated negative impacts of AI systems and identify op-
portunities to maximize positive impacts. Effectively managing the risk of potential harms
couldleadtomoretrustworthyAIsystemsandunleashpotentialbenefitstopeople(individ-
uals,communities,andsociety),organizations,andsystems/ecosystems. Riskmanagement
canenableAIdevelopersanduserstounderstandimpactsandaccountfortheinherentlim-
itations and uncertainties in their models and systems, which in turn can improve overall
system performance and trustworthiness and the likelihood that AI technologies will be
usedinwaysthatarebeneficial.
TheAIRMFisdesignedtoaddressnewrisksastheyemerge. Thisflexibilityisparticularly
important where impacts are not easily foreseeable and applications are evolving. While
someAIrisksandbenefitsarewell-known,itcanbechallengingtoassessnegativeimpacts
andthedegreeofharms. Figure1providesexamplesofpotentialharmsthatcanberelated
toAIsystems.
AIriskmanagementeffortsshouldconsiderthathumansmayassumethatAIsystemswork
– and work well – in all settings. For example, whether correct or not, AI systems are
often perceived as being more objective than humans or as offering greater capabilities
thangeneralsoftware.
Page4

NISTAI100-1 AIRMF1.0
Fig.1. ExamplesofpotentialharmsrelatedtoAIsystems. TrustworthyAIsystemsandtheir
responsibleusecanmitigatenegativerisksandcontributetobenefitsforpeople,organizations,and
ecosystems.
1.2 ChallengesforAIRiskManagement
Severalchallengesaredescribedbelow. Theyshouldbetakenintoaccountwhenmanaging
risksinpursuitofAItrustworthiness.
1.2.1 RiskMeasurement
AI risks or failures that are not well-defined or adequately understood are difficult to mea-
surequantitativelyorqualitatively. TheinabilitytoappropriatelymeasureAIrisksdoesnot
implythatanAIsystemnecessarilyposeseitherahighorlowrisk. Someriskmeasurement
challengesinclude:
Risksrelatedtothird-partysoftware,hardware,anddata: Third-partydataorsystems
can accelerate research and development and facilitate technology transition. They also
maycomplicateriskmeasurement. Riskcanemergebothfromthird-partydata,softwareor
hardwareitselfandhowitisused. Riskmetricsormethodologiesusedbytheorganization
developing the AI system may not align with the risk metrics or methodologies uses by
the organization deploying or operating the system. Also, the organization developing
theAIsystemmaynotbetransparentabouttheriskmetricsormethodologiesitused. Risk
measurementandmanagementcanbecomplicatedbyhowcustomersuseorintegratethird-
party data or systems into AI products or services, particularly without sufficient internal
governancestructuresandtechnicalsafeguards. Regardless,allpartiesandAIactorsshould
manage risk in the AI systems they develop, deploy, or use as standalone or integrated
components.
Tracking emergent risks: Organizations’ risk management efforts will be enhanced by
identifying and tracking emergent risks and considering techniques for measuring them.
Page5

NISTAI100-1 AIRMF1.0
AI system impact assessment approaches can help AI actors understand potential impacts
orharmswithinspecificcontexts.
Availability of reliable metrics: The current lack of consensus on robust and verifiable
measurement methods for risk and trustworthiness, and applicability to different AI use
cases, is an AI risk measurement challenge. Potential pitfalls when seeking to measure
negative risk or harms include the reality that development of metrics is often an institu-
tionalendeavorandmayinadvertentlyreflectfactorsunrelatedtotheunderlyingimpact. In
addition, measurement approaches can be oversimplified, gamed, lack critical nuance, be-
come relied upon in unexpected ways, or fail to account for differences in affected groups
andcontexts.
Approachesformeasuringimpactsonapopulationworkbestiftheyrecognizethatcontexts
matter,thatharmsmayaffectvariedgroupsorsub-groupsdifferently,andthatcommunities
orothersub-groupswhomaybeharmedarenotalwaysdirectusersofasystem.
Risk at different stages of the AI lifecycle: Measuring risk at an earlier stage in the AI
lifecycle may yield different results than measuring risk at a later stage; some risks may
be latent at a given point in time and may increase as AI systems adapt and evolve. Fur-
thermore, different AI actors across the AI lifecycle can have different risk perspectives.
For example, an AI developer who makes AI software available, such as pre-trained mod-
els, can have a different risk perspective than an AI actor who is responsible for deploying
that pre-trained model in a specific use case. Such deployers may not recognize that their
particularusescouldentailriskswhichdifferfromthoseperceivedbytheinitialdeveloper.
All involved AI actors share responsibilities for designing, developing, and deploying a
trustworthyAIsystemthatisfitforpurpose.
Risk in real-world settings: While measuring AI risks in a laboratory or a controlled
environmentmayyieldimportantinsightspre-deployment,thesemeasurementsmaydiffer
fromrisksthatemergeinoperational,real-worldsettings.
Inscrutability: Inscrutable AI systems can complicate risk measurement. Inscrutability
can be a result of the opaque nature of AI systems (limited explainability or interpretabil-
ity), lack of transparency or documentation in AI system development or deployment, or
inherentuncertaintiesinAIsystems.
Humanbaseline: RiskmanagementofAIsystemsthatareintendedtoaugmentorreplace
human activity, for example decision making, requires some form of baseline metrics for
comparison. ThisisdifficulttosystematizesinceAIsystemscarryoutdifferenttasks–and
performtasksdifferently–thanhumans.
Page6

NISTAI100-1 AIRMF1.0
1.2.2 RiskTolerance
While the AI RMF can be used to prioritize risk, it does not prescribe risk tolerance. Risk
tolerance refers to the organization’s or AI actor’s (see Appendix A) readiness to bear the
risk in order to achieve its objectives. Risk tolerance can be influenced by legal or regula-
tory requirements (Adapted from: ISO GUIDE 73). Risk tolerance and the level of risk that
isacceptabletoorganizationsorsocietyarehighlycontextualandapplicationanduse-case
specific. Risk tolerances can be influenced by policies and norms established by AI sys-
tem owners, organizations, industries, communities, or policy makers. Risk tolerances are
likely to change over time as AI systems, policies, and norms evolve. Different organiza-
tions may have varied risk tolerances due to their particular organizational priorities and
resourceconsiderations.
Emerging knowledge and methods to better inform harm/cost-benefit tradeoffs will con-
tinuetobedevelopedanddebatedbybusinesses,governments,academia,andcivilsociety.
TotheextentthatchallengesforspecifyingAIrisktolerancesremainunresolved,theremay
becontextswhereariskmanagementframeworkisnotyetreadilyapplicableformitigating
negativeAIrisks.
The Framework is intended to be flexible and to augment existing risk practices
which should align with applicable laws, regulations, and norms. Organizations
should follow existing regulations and guidelines for risk criteria, tolerance, and
response established by organizational, domain, discipline, sector, or professional
requirements. Somesectorsorindustriesmayhaveestablisheddefinitionsofharmor
established documentation, reporting, and disclosure requirements. Within sectors,
risk management may depend on existing guidelines for specific applications and
use case settings. Where established guidelines do not exist, organizations should
definereasonablerisktolerance. Oncetoleranceisdefined,thisAIRMFcanbeused
tomanagerisksandtodocumentriskmanagementprocesses.
1.2.3 RiskPrioritization
Attemptingtoeliminatenegativeriskentirelycanbecounterproductiveinpracticebecause
not all incidents and failures can be eliminated. Unrealistic expectations about risk may
lead organizations to allocate resources in a manner that makes risk triage inefficient or
impractical or wastes scarce resources. A risk management culture can help organizations
recognize that not all AI risks are the same, and resources can be allocated purposefully.
Actionable risk management efforts lay out clear guidelines for assessing trustworthiness
of each AI system an organization develops or deploys. Policies and resources should be
prioritizedbasedontheassessedrisklevelandpotentialimpactofanAIsystem. Theextent
to which an AI system may be customized or tailored to the specific context of use by the
AIdeployercanbeacontributingfactor.
Page7

NISTAI100-1 AIRMF1.0
When applying the AI RMF, risks which the organization determines to be highest for the
AI systems within a given context of use call for the most urgent prioritization and most
thorough risk management process. In cases where an AI system presents unacceptable
negativerisklevels–suchaswheresignificantnegativeimpactsareimminent,severeharms
are actually occurring, or catastrophic risks are present – development and deployment
should cease in a safe manner until risks can be sufficiently managed. If an AI system’s
development,deployment,andusecasesarefoundtobelow-riskinaspecificcontext,that
maysuggestpotentiallylowerprioritization.
RiskprioritizationmaydifferbetweenAIsystemsthataredesignedordeployedtodirectly
interact with humans as compared to AI systems that are not. Higher initial prioritization
maybecalledforinsettingswheretheAIsystemistrainedonlargedatasetscomprisedof
sensitiveorprotecteddatasuchaspersonallyidentifiableinformation,orwheretheoutputs
oftheAIsystemshavedirectorindirectimpactonhumans. AIsystemsdesignedtointeract
only with computational systems and trained on non-sensitive datasets (for example, data
collectedfromthephysicalenvironment)maycallforlowerinitialprioritization. Nonethe-
less, regularly assessing and prioritizing risk based on context remains important because
non-human-facingAIsystemscanhavedownstreamsafetyorsocialimplications.
Residual risk – defined as risk remaining after risk treatment (Source: ISO GUIDE 73) –
directlyimpactsendusersoraffectedindividualsandcommunities. Documentingresidual
riskswillcallforthesystemprovidertofullyconsidertherisksofdeployingtheAIproduct
andwillinformendusersaboutpotentialnegativeimpactsofinteractingwiththesystem.
1.2.4 OrganizationalIntegrationandManagementofRisk
AI risks should not be considered in isolation. Different AI actors have different responsi-
bilitiesandawarenessdependingontheirrolesinthelifecycle. Forexample,organizations
developing an AI system often will not have information about how the system may be
used. AI risk management should be integrated and incorporated into broader enterprise
riskmanagementstrategiesandprocesses. TreatingAIrisksalongwithothercriticalrisks,
suchascybersecurityandprivacy,willyieldamoreintegratedoutcomeandorganizational
efficiencies.
The AI RMF may be utilized along with related guidance and frameworks for managing
AI system risks or broader enterprise risks. Some risks related to AI systems are common
acrossothertypesofsoftwaredevelopmentanddeployment. Examplesofoverlappingrisks
include: privacy concerns related to the use of underlying data to train AI systems; the en-
ergy and environmental implications associated with resource-heavy computing demands;
securityconcernsrelatedtotheconfidentiality,integrity,andavailabilityofthesystemand
its training and output data; and general security of the underlying software and hardware
forAIsystems.
Page8

NISTAI100-1 AIRMF1.0
Organizations need to establish and maintain the appropriate accountability mechanisms,
roles and responsibilities, culture, and incentive structures for risk management to be ef-
fective. UseoftheAIRMFalonewillnotleadtothesechangesorprovidetheappropriate
incentives. Effective risk management is realized through organizational commitment at
senior levels and may require cultural change within an organization or industry. In addi-
tion,smalltomedium-sizedorganizationsmanagingAIrisksorimplementingtheAIRMF
may face different challenges than large organizations, depending on their capabilities and
resources.
2. Audience
Identifying and managing AI risks and potential impacts – both positive and negative – re-
quires a broad set of perspectives and actors across the AI lifecycle. Ideally, AI actors will
represent a diversity of experience, expertise, and backgrounds and comprise demograph-
ically and disciplinarily diverse teams. The AI RMF is intended to be used by AI actors
acrosstheAIlifecycleanddimensions.
The OECD has developed a framework for classifying AI lifecycle activities according to
fivekeysocio-technicaldimensions,eachwithpropertiesrelevantforAIpolicyandgover-
nance,includingriskmanagement[OECD(2022)OECDFrameworkfortheClassification
of AI systems — OECD Digital Economy Papers]. Figure 2 shows these dimensions,
slightly modified by NIST for purposes of this framework. The NIST modification high-
lights the importance of test, evaluation, verification, and validation (TEVV) processes
throughoutanAIlifecycleandgeneralizestheoperationalcontextofanAIsystem.
AI dimensions displayed in Figure 2 are the Application Context, Data and Input, AI
Model, and Task and Output. AI actors involved in these dimensions who perform or
managethedesign,development,deployment,evaluation,anduseofAIsystemsanddrive
AIriskmanagementeffortsaretheprimaryAIRMFaudience.
RepresentativeAIactorsacrossthelifecycledimensionsarelistedinFigure3anddescribed
in detail in Appendix A. Within the AI RMF, all AI actors work together to manage risks
and achieve the goals of trustworthy and responsible AI. AI actors with TEVV-specific
expertiseareintegratedthroughouttheAIlifecycleandareespeciallylikelytobenefitfrom
theFramework. Performedregularly,TEVVtaskscanprovideinsightsrelativetotechnical,
societal,legal,andethicalstandardsornorms,andcanassistwithanticipatingimpactsand
assessing and tracking emergent risks. As a regular process within an AI lifecycle, TEVV
allowsforbothmid-courseremediationandpost-hocriskmanagement.
The People & Planet dimension at the center of Figure 2 represents human rights and the
broader well-being of society and the planet. The AI actors in this dimension comprise
a separate AI RMF audience who informs the primary audience. These AI actors may in-
cludetradeassociations,standardsdevelopingorganizations,researchers,advocacygroups,
Page9

NISTAI100-1 AIRMF1.0
Fig.2. LifecycleandKeyDimensionsofanAISystem. ModifiedfromOECD(2022)OECD
FrameworkfortheClassificationofAIsystems—OECDDigitalEconomyPapers. Thetwoinner
circlesshowAIsystems’keydimensionsandtheoutercircleshowsAIlifecyclestages. Ideally,
riskmanagementeffortsstartwiththePlanandDesignfunctionintheapplicationcontextandare
performedthroughouttheAIsystemlifecycle. SeeFigure3forrepresentativeAIactors.
environmental groups, civil society organizations, end users, and potentially impacted in-
dividualsandcommunities. Theseactorscan:
• assistinprovidingcontextandunderstandingpotentialandactualimpacts;
• beasourceofformalorquasi-formalnormsandguidanceforAIriskmanagement;
• designateboundariesforAIoperation(technical,societal,legal,andethical);and
• promote discussion of the tradeoffs needed to balance societal values and priorities
related to civil liberties and rights, equity, the environment and the planet, and the
economy.
Successful risk management depends upon a sense of collective responsibility among AI
actors shown in Figure 3. The AI RMF functions, described in Section 5, require diverse
perspectives, disciplines, professions, and experiences. Diverse teams contribute to more
open sharing of ideas and assumptions about the purposes and functions of technology –
making these implicit aspects more explicit. This broader collective perspective creates
opportunitiesforsurfacingproblemsandidentifyingexistingandemergentrisks.
Page10

NISTAI100-1 AIRMF1.0
,gnitsettuobasliatedgnidulcni,sksatrotcaIAfosnoitpircseddeliatedrofAxidneppAeeS
.segatselcycefilIAssorcasrotcaIA
.3.giF
htiw,ecitcarptsebasadetarapesera)2erugiF(noisnemidledoMIAehtnisrotcaIAtahtetoN
.sksatnoitadilavdna,noitacfiirev,noitaulave
.sledomehtgnitadilavdnagniyfirevesohtmorfdetarapessledomehtgnisudnagnidliubesoht
Page11

NISTAI100-1 AIRMF1.0
3. AI Risks and Trustworthiness
For AI systems to be trustworthy, they often need to be responsive to a multiplicity of cri-
teria that are of value to interested parties. Approaches which enhance AI trustworthiness
can reduce negative AI risks. This Framework articulates the following characteristics of
trustworthy AI and offers guidance for addressing them. Characteristics of trustworthy AI
systems include: valid and reliable, safe, secure and resilient, accountable and trans-
parent, explainable and interpretable, privacy-enhanced, and fair with harmful bias
managed. Creating trustworthy AI requires balancing each of these characteristics based
on the AI system’s context of use. While all characteristics are socio-technical system at-
tributes, accountability and transparency also relate to the processes and activities internal
to an AI system and its external setting. Neglecting these characteristics can increase the
probabilityandmagnitudeofnegativeconsequences.
Fig.4. CharacteristicsoftrustworthyAIsystems. Valid&Reliableisanecessaryconditionof
trustworthinessandisshownasthebaseforothertrustworthinesscharacteristics. Accountable&
Transparentisshownasaverticalboxbecauseitrelatestoallothercharacteristics.
Trustworthinesscharacteristics(showninFigure4)areinextricablytiedtosocialandorga-
nizationalbehavior,thedatasetsusedbyAIsystems,selectionofAImodelsandalgorithms
andthedecisionsmadebythosewhobuildthem,andtheinteractionswiththehumanswho
provideinsightfromandoversightofsuchsystems. Humanjudgmentshouldbeemployed
when deciding on the specific metrics related to AI trustworthiness characteristics and the
precisethresholdvaluesforthosemetrics.
Addressing AItrustworthiness characteristics individuallywill not ensure AIsystem trust-
worthiness; tradeoffs are usually involved, rarely do all characteristics apply in every set-
ting, and some will be more or less important in any given situation. Ultimately, trustwor-
thinessisasocialconceptthatrangesacrossaspectrumandisonlyasstrongasitsweakest
characteristics.
WhenmanagingAIrisks,organizationscanfacedifficultdecisionsinbalancingthesechar-
acteristics. Forexample,incertainscenariostradeoffsmayemergebetweenoptimizingfor
interpretability and achieving privacy. In other cases, organizations might face a tradeoff
between predictive accuracy and interpretability. Or, under certain conditions such as data
sparsity, privacy-enhancing techniques can result in a loss in accuracy, affecting decisions
Page12

NISTAI100-1 AIRMF1.0
about fairness and other values in certain domains. Dealing with tradeoffs requires tak-
ing into account the decision-making context. These analyses can highlight the existence
andextentoftradeoffsbetweendifferentmeasures,buttheydonotanswerquestionsabout
howtonavigatethetradeoff. Thosedependonthevaluesatplayintherelevantcontextand
shouldberesolvedinamannerthatisbothtransparentandappropriatelyjustifiable.
There are multiple approaches for enhancing contextual awareness in the AI lifecycle. For
example, subject matter experts can assist in the evaluation of TEVV findings and work
with product and deployment teams to align TEVV parameters to requirements and de-
ployment conditions. When properly resourced, increasing the breadth and diversity of
input from interested parties and relevant AI actors throughout the AI lifecycle can en-
hance opportunities for informing contextually sensitive evaluations, and for identifying
AI system benefits and positive impacts. These practices can increase the likelihood that
risksarisinginsocialcontextsaremanagedappropriately.
Understanding and treatment of trustworthiness characteristics depends on an AI actor’s
particularrolewithintheAIlifecycle. ForanygivenAIsystem,anAIdesignerordeveloper
mayhaveadifferentperceptionofthecharacteristicsthanthedeployer.
Trustworthiness characteristics explained in this document influence each other.
Highly secure but unfair systems, accurate but opaque and uninterpretable systems,
and inaccurate but secure, privacy-enhanced, and transparent systems are all unde-
sirable. Acomprehensiveapproachtoriskmanagementcallsforbalancingtradeoffs
among the trustworthiness characteristics. It is the joint responsibility of all AI ac-
tors to determine whether AI technology is an appropriate or necessary tool for a
givencontextorpurpose,andhowtouseitresponsibly. Thedecisiontocommission
or deploy an AI system should be based on a contextual assessment of trustworthi-
ness characteristics and the relative risks, impacts, costs, and benefits, and informed
byabroadsetofinterestedparties.
3.1 ValidandReliable
Validation is the “confirmation, through the provision of objective evidence, that the re-
quirements for a specific intended use or application have been fulfilled” (Source: ISO
9000:2015). Deployment of AI systems which are inaccurate, unreliable, or poorly gener-
alizedtodataandsettingsbeyondtheirtrainingcreatesandincreasesnegativeAIrisksand
reducestrustworthiness.
Reliabilityisdefinedinthesamestandardasthe“abilityofanitemtoperformasrequired,
without failure, for a given time interval, under given conditions” (Source: ISO/IEC TS
5723:2022). Reliability is a goal for overall correctness of AI system operation under the
conditions of expected use and over a given period of time, including the entire lifetime of
thesystem.
Page13

NISTAI100-1 AIRMF1.0
Accuracy and robustness contribute to the validity and trustworthiness of AI systems, and
canbeintensionwithoneanotherinAIsystems.
Accuracy is defined by ISO/IEC TS 5723:2022 as “closeness of results of observations,
computations, or estimates to the true values or the values accepted as being true.” Mea-
sures of accuracy should consider computational-centric measures (e.g., false positive and
false negative rates), human-AI teaming, and demonstrate external validity (generalizable
beyond the training conditions). Accuracy measurements should always be paired with
clearlydefinedandrealistictestsets–thatarerepresentativeofconditionsofexpecteduse
– and details about test methodology; these should be included in associated documen-
tation. Accuracy measurements may include disaggregation of results for different data
segments.
Robustness or generalizability is defined as the “ability of a system to maintain its level
of performance under a variety of circumstances” (Source: ISO/IEC TS 5723:2022). Ro-
bustness is a goal for appropriate system functionality in a broad set of conditions and
circumstances, including uses of AI systems not initially anticipated. Robustness requires
not only that the system perform exactly as it does under expected uses, but also that it
should perform in ways that minimize potential harms to people if it is operating in an
unexpectedsetting.
Validity and reliability for deployed AI systems are often assessed by ongoing testing or
monitoring that confirms a system is performing as intended. Measurement of validity,
accuracy,robustness,andreliabilitycontributetotrustworthinessandshouldtakeintocon-
siderationthatcertaintypesoffailurescancausegreaterharm. AIriskmanagementefforts
should prioritize the minimization of potential negative impacts, and may need to include
humaninterventionincaseswheretheAIsystemcannotdetectorcorrecterrors.
3.2 Safe
AI systems should “not under defined conditions, lead to a state in which human life,
health,property,ortheenvironmentisendangered”(Source: ISO/IEC TS 5723:2022). Safe
operationofAIsystemsisimprovedthrough:
• responsibledesign,development,anddeploymentpractices;
• clearinformationtodeployersonresponsibleuseofthesystem;
• responsibledecision-makingbydeployersandendusers;and
• explanationsanddocumentationofrisksbasedonempiricalevidenceofincidents.
Different types of safety risks may require tailored AI risk management approaches based
on context and the severity of potential risks presented. Safety risks that pose a potential
riskofseriousinjuryordeathcallforthemosturgentprioritizationandmostthoroughrisk
managementprocess.
Page14

NISTAI100-1 AIRMF1.0
Employing safety considerations during the lifecycle and starting as early as possible with
planninganddesigncanpreventfailuresorconditionsthatcanrenderasystemdangerous.
Other practical approaches for AI safety often relate to rigorous simulation and in-domain
testing, real-time monitoring, and the ability to shut down, modify, or have human inter-
ventionintosystemsthatdeviatefromintendedorexpectedfunctionality.
AI safety risk management approaches should take cues from efforts and guidelines for
safety in fields such as transportation and healthcare, and align with existing sector- or
application-specificguidelinesorstandards.
3.3 SecureandResilient
AI systems, as well as the ecosystems in which they are deployed, may be said to be re-
silientiftheycanwithstandunexpectedadverseeventsorunexpectedchangesintheirenvi-
ronmentoruse–oriftheycanmaintaintheirfunctionsandstructureinthefaceofinternal
and external change and degrade safely and gracefully when this is necessary (Adapted
from: ISO/IEC TS 5723:2022). Common security concerns relate to adversarial examples,
data poisoning, and the exfiltration of models, training data, or other intellectual property
through AI system endpoints. AI systems that can maintain confidentiality, integrity, and
availability through protection mechanisms that prevent unauthorized access and use may
be said to be secure. Guidelines in the NIST Cybersecurity Framework and Risk Manage-
mentFrameworkareamongthosewhichareapplicablehere.
Security and resilience are related but distinct characteristics. While resilience is the abil-
ity to return to normal function after an unexpected adverse event, security includes re-
silience but also encompasses protocols to avoid, protect against, respond to, or recover
from attacks. Resilience relates to robustness and goes beyond the provenance of the data
toencompassunexpectedoradversarialuse(orabuseormisuse)ofthemodelordata.
3.4 AccountableandTransparent
Trustworthy AI depends upon accountability. Accountability presupposes transparency.
TransparencyreflectstheextenttowhichinformationaboutanAIsystemanditsoutputsis
availabletoindividualsinteractingwithsuchasystem–regardlessofwhethertheyareeven
awarethattheyaredoingso. Meaningfultransparencyprovidesaccesstoappropriatelevels
of information based on the stage of the AI lifecycle and tailored to the role or knowledge
of AI actors or individuals interacting with or using the AI system. By promoting higher
levelsofunderstanding,transparencyincreasesconfidenceintheAIsystem.
This characteristic’s scope spans from design decisions and training data to model train-
ing, the structure of the model, its intended use cases, and how and when deployment,
post-deployment, or end user decisions were made and by whom. Transparency is often
necessaryforactionableredressrelatedtoAIsystemoutputsthatareincorrectorotherwise
lead to negative impacts. Transparency should consider human-AI interaction: for exam-
Page15

NISTAI100-1 AIRMF1.0
ple, how a human operator or user is notified when a potential or actual adverse outcome
caused by an AI system is detected. A transparent system is not necessarily an accurate,
privacy-enhanced, secure, or fair system. However, it is difficult to determine whether an
opaque system possesses such characteristics, and to do so over time as complex systems
evolve.
TheroleofAIactorsshouldbeconsideredwhenseekingaccountabilityfortheoutcomesof
AIsystems. TherelationshipbetweenriskandaccountabilityassociatedwithAIandtech-
nologicalsystemsmorebroadlydiffersacrosscultural,legal,sectoral,andsocietalcontexts.
When consequences are severe, such as when life and liberty are at stake, AI developers
and deployers should consider proportionally and proactively adjusting their transparency
andaccountabilitypractices. Maintainingorganizationalpracticesandgoverningstructures
forharmreduction,likeriskmanagement,canhelpleadtomoreaccountablesystems.
Measures to enhance transparency and accountability should also consider the impact of
theseeffortsontheimplementingentity,includingthelevelofnecessaryresourcesandthe
needtosafeguardproprietaryinformation.
Maintaining the provenance of training data and supporting attribution of the AI system’s
decisions to subsets of training data can assist with both transparency and accountability.
Training data may also be subject to copyright and should follow applicable intellectual
propertyrightslaws.
AstransparencytoolsforAIsystemsandrelateddocumentationcontinuetoevolve,devel-
opers of AI systems are encouraged to test different types of transparency tools in cooper-
ationwithAIdeployerstoensurethatAIsystemsareusedasintended.
3.5 ExplainableandInterpretable
Explainability refers to a representation of the mechanisms underlying AI systems’ oper-
ation, whereas interpretability refers to the meaning of AI systems’ output in the context
of their designed functional purposes. Together, explainability and interpretability assist
those operating or overseeing an AI system, as well as users of an AI system, to gain
deeper insights into the functionality and trustworthiness of the system, including its out-
puts. The underlying assumption is that perceptions of negative risk stem from a lack of
ability to make sense of, or contextualize, system output appropriately. Explainable and
interpretableAIsystemsofferinformationthatwillhelpendusersunderstandthepurposes
andpotentialimpactofanAIsystem.
Risk from lack of explainability may be managed by describing how AI systems function,
with descriptions tailored to individual differences such as the user’s role, knowledge, and
skilllevel. Explainablesystemscanbedebuggedandmonitoredmoreeasily,andtheylend
themselvestomorethoroughdocumentation,audit,andgovernance.
Page16

NISTAI100-1 AIRMF1.0
Risks to interpretability often can be addressed by communicating a description of why
an AI system made a particular prediction or recommendation. (See “Four Principles of
Explainable Artificial Intelligence” and “Psychological Foundations of Explainability and
InterpretabilityinArtificialIntelligence”foundhere.)
Transparency, explainability, and interpretability are distinct characteristics that support
each other. Transparency can answer the question of “what happened” in the system. Ex-
plainability can answer the question of “how” a decision was made in the system. Inter-
pretability can answer the question of “why” a decision was made by the system and its
meaningorcontexttotheuser.
3.6 Privacy-Enhanced
Privacyrefersgenerallytothenormsandpracticesthathelptosafeguardhumanautonomy,
identity, and dignity. These norms and practices typically address freedom from intrusion,
limiting observation, or individuals’ agency to consent to disclosure or control of facets of
their identities (e.g., body, data, reputation). (See The NIST Privacy Framework: A Tool
forImprovingPrivacythroughEnterpriseRiskManagement.)
Privacyvaluessuchasanonymity,confidentiality,andcontrolgenerallyshouldguidechoices
for AI system design, development, and deployment. Privacy-related risks may influence
security, bias, and transparency and come with tradeoffs with these other characteristics.
Likesafetyandsecurity,specifictechnicalfeaturesofanAIsystemmaypromoteorreduce
privacy. AI systems can also present new risks to privacy by allowing inference to identify
individualsorpreviouslyprivateinformationaboutindividuals.
Privacy-enhancingtechnologies(“PETs”)forAI,aswellasdataminimizingmethodssuch
as de-identification and aggregation for certain model outputs, can support design for
privacy-enhanced AI systems. Under certain conditions such as data sparsity, privacy-
enhancing techniques can result in a loss in accuracy, affecting decisions about fairness
andothervaluesincertaindomains.
3.7 Fair–withHarmfulBiasManaged
FairnessinAIincludesconcernsforequalityandequitybyaddressingissuessuchasharm-
fulbiasanddiscrimination. Standardsoffairnesscanbecomplexanddifficulttodefinebe-
causeperceptionsoffairnessdifferamongculturesandmayshiftdependingonapplication.
Organizations’ risk management efforts will be enhanced by recognizing and considering
these differences. Systems in which harmful biases are mitigated are not necessarily fair.
For example, systems in which predictions are somewhat balanced across demographic
groups may still be inaccessible to individuals with disabilities or affected by the digital
divideormayexacerbateexistingdisparitiesorsystemicbiases.
Page17

NISTAI100-1 AIRMF1.0
Biasisbroaderthandemographicbalanceanddatarepresentativeness. NISThasidentified
three major categories of AI bias to be considered and managed: systemic, computational
and statistical, and human-cognitive. Each of these can occur in the absence of prejudice,
partiality, or discriminatory intent. Systemic bias can be present in AI datasets, the orga-
nizational norms, practices, and processes across the AI lifecycle, and the broader society
that uses AI systems. Computational and statistical biases can be present in AI datasets
andalgorithmicprocesses,andoftenstemfromsystematicerrorsduetonon-representative
samples. Human-cognitive biases relate to how an individual or group perceives AI sys-
tem information to make a decision or fill in missing information, or how humans think
about purposes and functions of an AI system. Human-cognitive biases are omnipresent
indecision-makingprocessesacrosstheAIlifecycleandsystemuse,includingthedesign,
implementation,operation,andmaintenanceofAI.
Bias exists in many forms and can become ingrained in the automated systems that help
make decisions about our lives. While bias is not always a negative phenomenon, AI sys-
tems can potentially increase the speed and scale of biases and perpetuate and amplify
harmstoindividuals,groups,communities,organizations,andsociety. Biasistightlyasso-
ciated with the concepts of transparency as well as fairness in society. (For more informa-
tionaboutbias,includingthethreecategories,seeNISTSpecialPublication1270,Towards
aStandardforIdentifyingandManagingBiasinArtificialIntelligence.)
Page18

NISTAI100-1 AIRMF1.0
4. Effectiveness of the AI RMF
Evaluations of AI RMF effectiveness – including ways to measure bottom-line improve-
ments in the trustworthiness of AI systems – will be part of future NIST activities, in
conjunctionwiththeAIcommunity.
Organizations and other users of the Framework are encouraged to periodically evaluate
whether the AI RMF has improved their ability to manage AI risks, including but not lim-
itedtotheirpolicies,processes,practices,implementationplans,indicators,measurements,
and expected outcomes. NIST intends to work collaboratively with others to develop met-
rics, methodologies, and goals for evaluating the AI RMF’s effectiveness, and to broadly
shareresultsandsupportinginformation. Frameworkusersareexpectedtobenefitfrom:
• enhanced processes for governing, mapping, measuring, and managing AI risk, and
clearlydocumentingoutcomes;
• improved awareness of the relationships and tradeoffs among trustworthiness char-
acteristics,socio-technicalapproaches,andAIrisks;
• explicitprocessesformakinggo/no-gosystemcommissioninganddeploymentdeci-
sions;
• established policies, processes, practices, and procedures for improving organiza-
tionalaccountabilityeffortsrelatedtoAIsystemrisks;
• enhancedorganizationalculturewhichprioritizestheidentificationandmanagement
of AI system risks and potential impacts to individuals, communities, organizations,
andsociety;
• better information sharing within and across organizations about risks, decision-
makingprocesses,responsibilities,commonpitfalls,TEVVpractices,andapproaches
forcontinuousimprovement;
• greatercontextualknowledgeforincreasedawarenessofdownstreamrisks;
• strengthenedengagementwithinterestedpartiesandrelevantAIactors;and
• augmentedcapacityforTEVVofAIsystemsandassociatedrisks.
Page19

NISTAI100-1 AIRMF1.0
Part 2: Core and Profiles
5. AI RMF Core
TheAIRMFCoreprovidesoutcomesandactionsthatenabledialogue,understanding,and
activities to manage AI risks and responsibly develop trustworthy AI systems. As illus-
trated in Figure 5, the Core is composed of four functions: GOVERN, MAP, MEASURE,
and MANAGE. Each of these high-level functions is broken down into categories and sub-
categories. Categoriesandsubcategoriesaresubdividedintospecificactionsandoutcomes.
Actionsdonotconstituteachecklist,noraretheynecessarilyanorderedsetofsteps.
Fig.5. FunctionsorganizeAIriskmanagementactivitiesattheirhighestleveltogovern,map,
measure,andmanageAIrisks. Governanceisdesignedtobeacross-cuttingfunctiontoinform
andbeinfusedthroughouttheotherthreefunctions.
Risk management should be continuous, timely, and performed throughout the AI system
lifecycle dimensions. AI RMF Core functions should be carried out in a way that reflects
diverseandmultidisciplinaryperspectives,potentiallyincludingtheviewsofAIactorsout-
sidetheorganization. Havingadiverseteamcontributestomoreopensharingofideasand
assumptions about purposes and functions of the technology being designed, developed,
Page20

NISTAI100-1 AIRMF1.0
deployed, or evaluated – which can create opportunities to surface problems and identify
existingandemergentrisks.
An online companion resource to the AI RMF, the NIST AI RMF Playbook, is available
to help organizations navigate the AI RMF and achieve its outcomes through suggested
tactical actions they can apply within their own contexts. Like the AI RMF, the Playbook
is voluntary and organizations can utilize the suggestions according to their needs and
interests. Playbook users can create tailored guidance selected from suggested material
fortheirownuseandcontributetheirsuggestionsforsharingwiththebroadercommunity.
AlongwiththeAIRMF,thePlaybookispartoftheNISTTrustworthyandResponsibleAI
ResourceCenter.
Framework users may apply these functions as best suits their needs for managing
AI risks based on their resources and capabilities. Some organizations may choose
to select from among the categories and subcategories; others may choose and have
thecapacitytoapplyallcategoriesandsubcategories. Assumingagovernancestruc-
ture is in place, functions may be performed in any order across the AI lifecycle as
deemed to add value by a user of the framework. After instituting the outcomes in
GOVERN, most users of the AI RMF would start with the MAP function and con-
tinue to MEASURE or MANAGE. However users integrate the functions, the process
should be iterative, with cross-referencing between functions as necessary. Simi-
larly, there are categories and subcategories with elements that apply to multiple
functions,orthatlogicallyshouldtakeplacebeforecertainsubcategorydecisions.
5.1 Govern
The GOVERN function:
• cultivatesandimplementsacultureofriskmanagementwithinorganizationsdesign-
ing,developing,deploying,evaluating,oracquiringAIsystems;
• outlines processes, documents, and organizational schemes that anticipate, identify,
andmanagetherisksasystemcanpose,includingtousersandothersacrosssociety
–andprocedurestoachievethoseoutcomes;
• incorporatesprocessestoassesspotentialimpacts;
• provides a structure by which AI risk management functions can align with organi-
zationalprinciples,policies,andstrategicpriorities;
• connects technical aspects of AI system design and development to organizational
values and principles, and enables organizational practices and competencies for the
individuals involved in acquiring, training, deploying, and monitoring such systems;
and
• addresses full product lifecycle and associated processes, including legal and other
issuesconcerninguseofthird-partysoftwareorhardwaresystemsanddata.
Page21

NISTAI100-1 AIRMF1.0
GOVERN is a cross-cutting function that is infused throughout AI risk management and
enablestheotherfunctionsoftheprocess. Aspectsof GOVERN,especiallythoserelatedto
compliance or evaluation, should be integrated into each of the other functions. Attention
to governance is a continual and intrinsic requirement for effective AI risk management
overanAIsystem’slifespanandtheorganization’shierarchy.
Strong governance can drive and enhance internal practices and norms to facilitate orga-
nizational risk culture. Governing authorities can determine the overarching policies that
direct an organization’s mission, goals, values, culture, and risk tolerance. Senior leader-
ship sets the tone for risk management within an organization, and with it, organizational
culture. Management aligns the technical aspects of AI risk management to policies and
operations. Documentation can enhance transparency, improve human review processes,
andbolsteraccountabilityinAIsystemteams.
After putting in place the structures, systems, processes, and teams described in the GOV-
ERN function, organizations should benefit from a purpose-driven culture focused on risk
understanding and management. It is incumbent on Framework users to continue to ex-
ecute the GOVERN function as knowledge, cultures, and needs or expectations from AI
actorsevolveovertime.
PracticesrelatedtogoverningAIrisksaredescribedintheNISTAIRMFPlaybook. Table
1liststhe GOVERN function’scategoriesandsubcategories.
Table1: Categoriesandsubcategoriesforthe GOVERN function.
Categories Subcategories
GOVERN 1: GOVERN 1.1: Legal and regulatory requirements involving AI
Policies,processes, areunderstood,managed,anddocumented.
procedures,and
GOVERN 1.2: The characteristics of trustworthy AI are inte-
practicesacrossthe
grated into organizational policies, processes, procedures, and
organizationrelated
practices.
tothemapping,
GOVERN 1.3: Processes, procedures, and practices are in place
measuring,and
todeterminetheneededlevelofriskmanagementactivitiesbased
managingofAI
ontheorganization’srisktolerance.
risksareinplace,
transparent,and GOVERN1.4: Theriskmanagementprocessanditsoutcomesare
implemented established through transparent policies, procedures, and other
effectively. controlsbasedonorganizationalriskpriorities.
Continuedonnextpage
Page22

NISTAI100-1 AIRMF1.0
Table1: Categoriesandsubcategoriesforthe GOVERN function. (Continued)
Categories Subcategories
GOVERN 1.5: Ongoing monitoring and periodic review of the
risk management process and its outcomes are planned and or-
ganizational roles and responsibilities clearly defined, including
determiningthefrequencyofperiodicreview.
GOVERN 1.6: Mechanisms are in place to inventory AI systems
andareresourcedaccordingtoorganizationalriskpriorities.
GOVERN 1.7: Processes and procedures are in place for decom-
missioning and phasing out AI systems safely and in a man-
ner that does not increase risks or decrease the organization’s
trustworthiness.
GOVERN 2: GOVERN 2.1: Roles and responsibilities and lines of communi-
Accountability cationrelatedtomapping,measuring,andmanagingAIrisksare
structuresarein documented and are clear to individuals and teams throughout
placesothatthe theorganization.
appropriateteams
GOVERN 2.2: The organization’s personnel and partners receive
andindividualsare
AI riskmanagement training to enablethem to perform theirdu-
empowered,
ties and responsibilities consistent with related policies, proce-
responsible,and
dures,andagreements.
trainedformapping,
GOVERN 2.3: Executive leadership of the organization takes re-
measuring,and
sponsibility for decisions about risks associated with AI system
managingAIrisks.
developmentanddeployment.
GOVERN 3: GOVERN 3.1: Decision-making related to mapping, measuring,
Workforcediversity, and managing AI risks throughout the lifecycle is informed by a
equity,inclusion, diverse team (e.g., diversity of demographics, disciplines, expe-
andaccessibility rience,expertise,andbackgrounds).
processesare
GOVERN 3.2: Policies and procedures are in place to define and
prioritizedinthe
differentiate roles and responsibilities for human-AI configura-
mapping,
tionsandoversightofAIsystems.
measuring,and
managingofAI
risksthroughoutthe
lifecycle.
GOVERN 4: GOVERN 4.1: Organizational policies and practices are in place
Organizational tofosteracriticalthinkingandsafety-firstmindsetinthedesign,
teamsarecommitted development, deployment, and uses of AI systems to minimize
toaculture potentialnegativeimpacts.
Continuedonnextpage
Page23

NISTAI100-1 AIRMF1.0
Table1: Categoriesandsubcategoriesforthe GOVERN function. (Continued)
Categories Subcategories
thatconsidersand GOVERN 4.2: Organizational teams document the risks and po-
communicatesAI tentialimpactsoftheAItechnologytheydesign,develop,deploy,
risk. evaluate,anduse,andtheycommunicateabouttheimpactsmore
broadly.
GOVERN 4.3: Organizational practices are in place to enable AI
testing,identificationofincidents,andinformationsharing.
GOVERN 5: GOVERN 5.1: Organizational policies and practices are in place
Processesarein to collect, consider, prioritize, and integrate feedback from those
placeforrobust external to the team that developed or deployed the AI system
engagementwith regarding the potential individual and societal impacts related to
relevantAIactors. AIrisks.
GOVERN 5.2: Mechanisms are established to enable the team
that developed or deployed AI systems to regularly incorporate
adjudicated feedback from relevant AI actors into system design
andimplementation.
GOVERN 6: Policies GOVERN 6.1: Policies and procedures are in place that address
andproceduresare AIrisksassociatedwiththird-partyentities,includingrisksofin-
inplacetoaddress fringementofathird-party’sintellectualpropertyorotherrights.
AIrisksandbenefits
GOVERN 6.2: Contingency processes are in place to handle
arisingfrom
failures or incidents in third-party data or AI systems deemed to
third-partysoftware
behigh-risk.
anddataandother
supplychainissues.
5.2 Map
The MAP function establishes the context to frame risks related to an AI system. The AI
lifecycle consists of many interdependent activities involving a diverse set of actors (See
Figure 3). In practice, AI actors in charge of one part of the process often do not have full
visibility or control over other parts and their associated contexts. The interdependencies
between these activities, and among the relevant AI actors, can make it difficult to reliably
anticipateimpactsofAIsystems. Forexample,earlydecisionsini