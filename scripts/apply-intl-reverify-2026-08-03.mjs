#!/usr/bin/env node
/**
 * International (non-US) staleness re-verification pass — 2026-08-03.
 *
 * Every change below is sourced from an official government / regulator /
 * official-journal source that was fetched and read during the pass.
 * Records are only touched where an official source contradicted the stored
 * value; `last_verified` is stamped on all 15 checked records regardless.
 */
import { readFileSync, writeFileSync } from 'fs'

const PATH = new URL('../data/regulations.json', import.meta.url)
const all = JSON.parse(readFileSync(PATH, 'utf8'))
const VERIFIED = '2026-08-03'

const byId = new Map(all.map((r) => [r.id, r]))
const touched = []

function edit(id, fn) {
  const r = byId.get(id)
  if (!r) throw new Error(`missing record: ${id}`)
  const before = JSON.stringify(r)
  fn(r)
  r.last_verified = VERIFIED
  touched.push({ id, changed: JSON.stringify(r) !== before })
}

/* ------------------------------------------------------------------ Rwanda
 * Official Gazette n° Special of 15/10/2021 (cyber.gov.rw), Law N° 058/2021:
 *  - Art. 70: "This Law comes into force on the date of its publication in
 *    the Official Gazette" → publication was 15/10/2021, not the 13/10/2021
 *    signature date.
 *  - Art. 67: two-year transition for existing controllers/processors.
 *  - Arts. 53, 56-60: administrative fine RWF 2M-5M *or* 1% of global
 *    turnover; criminal fines up to RWF 25M with 7-10 years' imprisonment.
 *    The stored "up to RWF 5M" understated the cap.
 */
edit('rw-rw-dpa-2021', (r) => {
  r.effective_date = '2021-10-15'
  r.max_penalty =
    'Administrative fine RWF 2M–5M or 1% of global turnover of the preceding financial year (1% of turnover for corporate bodies); criminal offences carry 1–10 years imprisonment and fines of RWF 3M–25M (up to RWF 20M–25M for unlawful processing of sensitive personal data)'
  r.max_penalty_usd_approx = 17000
  r.notable =
    'Administrative fines are modest (RWF 2M–5M) but may instead be set at 1% of global turnover; criminal penalties reach 7–10 years imprisonment and RWF 25M for unlawful sensitive-data processing. No AI-specific provisions; foundational data law for East African nation.'
  r.summary =
    "Rwanda's first comprehensive data protection law establishes the National Cyber Security Authority (NCSA), through its Data Protection and Privacy Office, as supervisory authority. Sets foundational principles for lawful data processing applicable to AI systems operating in Rwanda, including data subject rights and mandatory registration of data controllers and processors. In force from publication in the Official Gazette on 15 October 2021 (Art. 70); the two-year transition period for controllers and processors already in operation (Art. 67) expired on 15 October 2023, so all obligations now apply in full."
  r.operative_dates =
    'In force on publication in the Official Gazette, 15 Oct 2021. Two-year transition for existing controllers/processors (Art. 67) expired 15 Oct 2023.'
})

/* ----------------------------------------------------------------- Ethiopia
 * Federal Negarit Gazette No. 35, 24 July 2024 (official copy hosted by the
 * Ministry of Innovation and Technology, mint.gov.et):
 *  - Art. 2(36): "Authority" = the Ethiopian Communications Authority
 *    established under Communications Proclamation No. 1148/2019 — the stored
 *    "Ethiopian Personal Data Protection Commission" does not exist.
 *  - Art. 70: enters into force on publication in the Negarit Gazeta.
 *  - Art. 60(2): fine up to 4% of total worldwide turnover; Art. 64: criminal
 *    fines ETB 60,000–600,000 with 1–10 years' imprisonment. The stored
 *    "up to ETB 2,000,000" appears nowhere in the Proclamation.
 *  - Art. 64(2)(d): criminal liability for failing to respect the right
 *    against automated decisions.
 *  - dataguidance.com replaced with the official government source.
 */
edit('et-et-pdpp-2024', (r) => {
  r.official_text_url =
    'http://www.mint.gov.et/documents/d/guest/proclamation_no-_1321_-2024personal_data_protection?download=true'
  r.enforcement_body = ['Ethiopian Communications Authority (ECA)']
  r.max_penalty =
    'Administrative fine up to 4% of total worldwide turnover of the preceding financial year (Art. 60(2)); criminal sanctions of 1–3 years imprisonment and/or ETB 60,000–100,000, 3–5 years and/or ETB 100,000–200,000, or 5–10 years and/or ETB 200,000–600,000 (Art. 64)'
  r.max_penalty_usd_approx = null
  r.summary =
    "Ethiopia's foundational personal data protection law, modeled on the GDPR, in force on publication in the Federal Negarit Gazette on 24 July 2024 (Art. 70). AI-relevant provisions include: the right not to be subject to solely automated decisions with significant effects — breach of which is a criminal offence under Art. 64(2)(d) — data protection impact assessments for high-risk processing including AI profiling, explicit consent for biometric data processing, and disclosure of the existence of automated decision-making and profiling in transparency notices. The Ethiopian Communications Authority (ECA), established under Communications Proclamation No. 1148/2019, is the supervisory authority (Art. 2(36)); detailed administrative offences and fine levels are left to Council of Ministers regulations (Art. 60(3))."
  r.notable =
    "First comprehensive data protection law in Ethiopia; supervision sits with the Ethiopian Communications Authority rather than a dedicated commission, and administrative fines are turnover-based (up to 4% of worldwide turnover). Includes automated decision-making rights applicable to AI systems, enforced by criminal sanction."
  r.operative_dates =
    'In force on publication in the Federal Negarit Gazette, 24 July 2024 (Art. 70). Administrative offence and fine detail deferred to Council of Ministers regulations (Art. 60(3)).'
})

/* --------------------------------------------------------------- EU AI Act
 * Regulation (EU) 2026/1744 of 8 July 2026 (the "Digital Omnibus on AI")
 * amends Regulations (EU) 2024/1689, (EU) 2018/1139 and (EU) 2023/1230.
 * Council final adoption 29 June 2026 (Council press release 29/06/2026);
 * entered into force 27 July 2026 (European Commission, "Regulatory framework
 * for AI", digital-strategy.ec.europa.eu). Revised application dates and the
 * new Art. 5 prohibition on NCII/CSAM generation per the Council press
 * release and the Commission's AI Act timeline.
 */
edit('eu-eu-aiact-2024', (r) => {
  r.summary =
    "The world's first binding horizontal AI regulation establishing a risk-based framework for AI systems placed on the EU market or affecting EU persons. Prohibited AI practices include social scoring, real-time biometric surveillance in public spaces, subliminal manipulation, and predictive policing based solely on profiling. High-risk AI systems (healthcare, employment, education, critical infrastructure, law enforcement) require conformity assessment, technical documentation, registration in the EU AI database, and human oversight before market placement. General-purpose AI models face transparency obligations; those with systemic risk (exceeding 10^25 FLOPs training compute) must conduct safety evaluations and report incidents. Providers must implement post-market monitoring. Deployers in the public sector must conduct a fundamental rights impact assessment. Chatbots must identify as AI and synthetic media must be labelled. The EU AI Office supervises GPAI models; national market surveillance authorities enforce for other systems. AMENDED by the 'Digital Omnibus on AI' — Regulation (EU) 2026/1744 of 8 July 2026, in force 27 July 2026 — which (i) postpones the Annex III / Art. 6(2) high-risk obligations from 2 August 2026 to 2 December 2027 and the Annex I embedded-product high-risk obligations to 2 August 2028; (ii) adds new Art. 5 prohibitions on AI systems generating non-consensual intimate imagery and child sexual abuse material, applying from 2 December 2026; (iii) sets 2 December 2026 as the compliance date for Art. 50(2) machine-readable marking of synthetic audio, image, video and text; (iv) narrows the Art. 3(14) 'safety component' definition; (v) widens the Art. 10(5) basis for processing special-category data for bias detection beyond high-risk providers; (vi) gives the AI Office exclusive supervision of AI systems built on a provider's own GPAI models and of systems integrated into VLOPs/VLOSEs (Art. 75); and (vii) extends simplified documentation and proportionate penalties to 'small mid-cap' companies (<750 employees). The general application date of 2 August 2026 has now passed, as have the Art. 5 prohibitions (2 February 2025) and GPAI obligations (2 August 2025)."
  r.operative_dates =
    'Entered into force 1 Aug 2024. Prohibited practices (Art. 5) and AI literacy: 2 Feb 2025. GPAI model rules and governance: 2 Aug 2025. General application incl. Art. 50 transparency: 2 Aug 2026. New Art. 5 NCII/CSAM prohibitions and Art. 50(2) synthetic-media marking compliance: 2 Dec 2026. High-risk (Annex III / Art. 6(2)): 2 Dec 2027 (postponed from 2 Aug 2026 by Reg. (EU) 2026/1744). High-risk embedded in Annex I regulated products: 2 Aug 2028. Legacy public-authority systems: 2 Aug 2030.'
  r.implementation_phases = [
    { date: '2024-08-01', description: 'EU AI Act enters into force' },
    {
      date: '2025-02-02',
      description: 'Prohibited practices (Art. 5), general provisions and AI literacy obligations apply',
    },
    { date: '2025-08-02', description: 'GPAI model obligations, governance rules and penalties apply' },
    {
      date: '2026-08-02',
      description: 'General application date; Art. 50 transparency obligations apply',
    },
    {
      date: '2026-12-02',
      description:
        'New Art. 5 prohibitions on NCII/CSAM generation apply; Art. 50(2) machine-readable marking of synthetic content must be complied with (Reg. (EU) 2026/1744)',
    },
    {
      date: '2027-12-02',
      description:
        'High-risk AI obligations for Annex III / Art. 6(2) stand-alone systems apply — postponed from 2 Aug 2026 by Reg. (EU) 2026/1744',
    },
    {
      date: '2028-08-02',
      description:
        'High-risk obligations for AI as a safety component in Annex I regulated products apply — postponed from 2 Aug 2027',
    },
    {
      date: '2030-08-02',
      description: 'Legacy high-risk AI systems used by public authorities must be brought into compliance',
    },
  ]
  r.notable =
    "Phased implementation — prohibited practices from Feb 2025, GPAI obligations from Aug 2025, general application from Aug 2026. Amended by the Digital Omnibus on AI (Reg. (EU) 2026/1744, in force 27 July 2026), which delayed the high-risk regime to Dec 2027/Aug 2028 and added prohibitions on AI-generated NCII and CSAM from Dec 2026. Rule extraction captured recitals only; operative articles not extracted due to 604KB document length."
  r.legal_citation =
    'Regulation (EU) 2024/1689 of the European Parliament and of the Council, O.J. L 2024/1689, as amended by Regulation (EU) 2026/1744 of 8 July 2026 (Digital Omnibus on AI), O.J. L 2026/1744'
})

/* ------------------------------------------------------------------- GDPR
 * Regulation (EU) 2016/679 is unchanged: Art. 22 stands as enacted. The
 * Commission's Digital Omnibus proposal of 19 Nov 2025 would amend the GDPR,
 * but only the AI half of the package has been adopted (Reg. (EU) 2026/1744);
 * the data half (GDPR/ePrivacy/NIS2) is still in negotiation as of 3 Aug 2026.
 * URL and metadata confirmed correct — no substantive change.
 */
edit('eu-eu-gdpr-2016', (r) => {
  r.summary =
    'Article 22 GDPR grants individuals the right not to be subject to solely automated decisions (including profiling) that produce legal or similarly significant effects. Requires human intervention, explanation, and contestation rights when exceptions apply. First major binding regulation of AI decision-making globally. Art. 22 remains unamended: the Commission\'s Digital Omnibus package (proposed 19 November 2025) would amend the GDPR — including the treatment of pseudonymised data — but only the AI limb was adopted (Regulation (EU) 2026/1744, in force 27 July 2026); the data limb covering the GDPR, ePrivacy and NIS2 was still under Council and Parliament negotiation as of August 2026.'
})

/* ------------------------------------------- China — GenAI Interim Measures
 * cac.gov.cn full text confirmed live: CAC et al. Order, published
 * 13 July 2023, effective 15 August 2023. Not amended. Summary updated to
 * situate it within the framework built out since (labelling Measures 2025,
 * anthropomorphic-interaction Measures 2026, amended Cybersecurity Law 2026).
 */
edit('cn-cn-genai-2023', (r) => {
  r.summary =
    "China's first binding GenAI regulation requires CAC security assessment and algorithm filing before public deployment of generative models. Prohibits content violating socialist core values, mandates real-name user registration, requires training data security and personal information protection, and mandates AI-generated content labelling. Adopted by the CAC with six other ministries and effective 15 August 2023; text unamended as of August 2026, but now sits inside a wider stack — the AI-Generated Synthetic Content Labelling Measures (effective 1 September 2025), the Anthropomorphic AI Interaction Services Interim Measures (effective July 2026), and the amended Cybersecurity Law (effective 1 January 2026), whose new Art. 20 addresses AI safety and development."
  r.legal_citation =
    'Interim Measures for the Administration of Generative Artificial Intelligence Services, CAC/NDRC/MoE/MOST/MIIT/MPS/NRTA (published 13 July 2023, eff. 15 Aug. 2023)'
})

/* --------------------------------------- China — Deep Synthesis Provisions
 * Official full text: cac.gov.cn/2022-12/11/c_1672221949354811.htm.
 *  - It is CAC/MIIT/MPS Order No. 12 (not "CAC/MPS Order No. 11"), reviewed
 *    at the CAC's 21st meeting on 3 Nov 2022, signed 25 Nov 2022, effective
 *    10 Jan 2023.
 *  - Art. 22 does not set fines: it refers penalties to other laws and
 *    administrative regulations, with heavier punishment for serious
 *    consequences, plus public-security penalties and criminal liability.
 *    The stored "RMB 50M or 5% annual turnover" is the PIPL cap, not this
 *    instrument's.
 */
edit('cn-cn-deepsynthesis-2023', (r) => {
  r.official_text_url = 'https://www.cac.gov.cn/2022-12/11/c_1672221949354811.htm'
  r.summary_url = 'https://www.chinalawtranslate.com/en/deep-synthesis/'
  r.max_penalty =
    'No standalone fine: Art. 22 refers penalties to applicable laws and administrative regulations (Cybersecurity Law, PIPL, Data Security Law), with heavier punishment where serious consequences result; public-security penalties and criminal liability apply where conduct crosses those thresholds'
  r.max_penalty_usd_approx = null
  r.summary =
    'Regulates deep synthesis (deepfake/AI-generated) technology for text, voice, images, video and immersive virtual scenes. Service providers and technical supporters must verify real user identities, run ethics/security reviews, file algorithms, monitor content for illegal use and disinformation, and label synthetic content — conspicuously where content could mislead as to authenticity. Prohibits deep synthesis implicating national security, public interest or reputational harm. Adopted as CAC/MIIT/MPS Order No. 12 on 25 November 2022, effective 10 January 2023; unamended, though its labelling regime has since been operationalised in detail by the 2025 AI-Generated Synthetic Content Labelling Measures and mandatory standard GB 45438-2025.'
  r.legal_citation =
    'Provisions on the Administration of Deep Synthesis Internet Information Services, CAC/MIIT/MPS Order No. 12 (25 Nov. 2022, eff. 10 Jan. 2023)'
})

/* ------------------------------------------ China — AI Labelling Measures
 * CAC notice 国信办通字〔2025〕2号 of 14 March 2025 issuing the Measures
 * (cac.gov.cn/2025-03/14/c_1743654684782215.htm), effective 1 Sept 2025.
 * SAMR national-standard register (openstd.samr.gov.cn) records GB 45438-2025
 * as a *mandatory* (强制性) standard, issued 2025-02-28, effective 2025-09-01,
 * status 现行 (in force).
 */
edit('cn-cn-ailabelling-2025', (r) => {
  r.official_text_url = 'https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm'
  r.summary_url =
    'https://openstd.samr.gov.cn/bzgk/gb/std_list?p.p1=0&p.p90=circulation_date&p.p91=desc&p.p2=%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%E7%94%9F%E6%88%90%E5%90%88%E6%88%90'
  r.summary =
    'Mandates visible and embedded (metadata/watermark) labels for all AI-generated and synthetic content distributed publicly in China, covering text, images, audio, video, and virtual scenes. Issued by the CAC with MIIT, MPS and NRTA on 14 March 2025 (国信办通字〔2025〕2号) and effective 1 September 2025, paired with GB 45438-2025 "Cybersecurity technology — Labelling method for AI-generated synthetic content", a mandatory (强制性) national standard issued 28 February 2025 and effective the same day. The standard specifies metadata fields including provider code, content ID, and timestamp. Labels must persist when content is downloaded; platforms must verify and retain implicit labels, and users must not remove or forge them.'
  r.legal_citation =
    'Measures for Labelling of AI-Generated Synthetic Content, CAC/MIIT/MPS/NRTA 国信办通字〔2025〕2号 (14 Mar. 2025, eff. 1 Sept. 2025); mandatory national standard GB 45438-2025 (issued 28 Feb. 2025, eff. 1 Sept. 2025)'
})

/* ------------------------------------------------------------- China PIPL
 * chinalawtranslate.com/en/personal-information-protection-law/ now 404s.
 * Replaced with the official CAC republication of the NPC text (HTTPS) and
 * the National People's Congress original as source_url. Adoption
 * 20 Aug 2021 / effect 1 Nov 2021 confirmed against both. PIPL itself is
 * unamended; the Cybersecurity Law amendment effective 1 Jan 2026 aligned
 * cross-references and penalty standards between the two.
 */
edit('cn-cn-pipl-2021', (r) => {
  r.official_text_url = 'https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm'
  r.source_url = 'http://www.npc.gov.cn/npc/c2/c30834/202108/t20210820_313088.html'
  r.summary =
    "China's comprehensive personal data law directly applicable to AI: requires lawful basis for processing personal data in AI training, mandates consent for sensitive data, grants individuals rights to access, correct, and delete data, and prohibits unreasonable differential treatment based on automated decision-making. Art. 24 requires transparency and fair outcomes in automated decision-making, an option not based on personal characteristics (or a means to refuse) for personalised recommendations and marketing, and the right to an explanation and to refuse decisions made solely by automated means with significant effects. Adopted by the NPC Standing Committee on 20 August 2021 and effective 1 November 2021; unamended, though the Cybersecurity Law amendment effective 1 January 2026 harmonised cross-references and penalty standards between the two statutes."
})

/* -------------------------------- China — GenAI training data GB standards
 * SAMR national-standard register (openstd.samr.gov.cn) records all three as
 * issued 2025-04-25 (not 2025-04-01), effective 2025-11-01, 推荐性 (GB/T,
 * recommended) and 现行:
 *   GB/T 45652-2025 生成式人工智能预训练和优化训练数据安全规范
 *   GB/T 45654-2025 生成式人工智能服务安全基本要求
 *   GB/T 45674-2025 生成式人工智能数据标注安全规范
 * The stored "GB/T 45694-2025" citation does not exist. The register also
 * shows two later GenAI standards: GB/T 46800-2025 (social-impact assessment
 * guide, eff. 2025-12-02) and GB/T 47863-2026 (service-provider compliance
 * management guide, issued 2026-07-02, eff. 2026-11-01).
 */
edit('cn-cn-trainingdata-2025', (r) => {
  r.enacted_date = '2025-04-25'
  r.official_text_url =
    'https://openstd.samr.gov.cn/bzgk/gb/std_list?p.p1=0&p.p90=circulation_date&p.p91=desc&p.p2=%E7%94%9F%E6%88%90%E5%BC%8F%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD'
  r.full_name =
    'Cybersecurity Technology — Generative AI Training Data and Service Security Standards: GB/T 45652-2025 (pre-training and fine-tuning training data security), GB/T 45654-2025 (basic security requirements for generative AI services), GB/T 45674-2025 (generative AI data annotation security)'
  r.summary =
    "Three national standards issued by SAMR and the Standardization Administration on 25 April 2025 and effective 1 November 2025 establish security requirements across the generative AI data lifecycle: GB/T 45652-2025 covers pre-training and fine-tuning data security (provenance, source screening, content filtering), GB/T 45674-2025 covers annotation security (annotator qualification, annotation rules, quality checks), and GB/T 45654-2025 sets basic security requirements for generative AI services including corpus safety, model testing and answer-quality controls. All three are recommended standards (GB/T, 推荐性) rather than mandatory, but they operationalise the CAC security assessment required by the 2023 Generative AI Interim Measures and are used as the assessment benchmark in practice. Two further GenAI standards followed: GB/T 46800-2025 on assessing the social impact of generative AI (effective 2 December 2025) and GB/T 47863-2026 on compliance management for service providers (issued 2 July 2026, effective 1 November 2026)."
  r.legal_citation =
    'GB/T 45652-2025, GB/T 45654-2025 and GB/T 45674-2025, SAMR / Standardization Administration of China (issued 25 Apr. 2025, eff. 1 Nov. 2025)'
  r.notable =
    'Recommended (GB/T) rather than mandatory standards, but function as the de facto benchmark for the CAC security assessment that generative AI services must pass before public release.'
})

/* -------------------------------------------- China — Algorithm Recommendations
 * Official full text: cac.gov.cn/2022-01/04/c_1642894606364259.htm.
 *  - Order No. 9 was made by four bodies — CAC, MIIT, MPS and SAMR (the
 *    stored citation added a fifth, "MCC"). Reviewed at the CAC's 20th
 *    meeting on 16 Nov 2021, signed 31 Dec 2021, effective 1 Mar 2022.
 *  - Arts. 31 and 33 set the fine: warning/criticism and rectification order,
 *    escalating to suspension of information updates plus RMB 10,000-100,000.
 */
edit('cn-cn-algorec-2022', (r) => {
  r.official_text_url = 'https://www.cac.gov.cn/2022-01/04/c_1642894606364259.htm'
  r.max_penalty =
    'Warning, public criticism and rectification order; for refusal to rectify or serious cases, suspension of information updates plus a fine of RMB 10,000–100,000 (Arts. 31, 33); public-security penalties or criminal liability where applicable'
  r.max_penalty_usd_approx = 14000
  r.summary =
    'First globally binding regulation of algorithmic recommendation systems. Requires providers with public-opinion or social-mobilisation capacity to file their algorithms with the CAC within ten working days of launch, offer users an option to switch off algorithmic recommendation, enable modification or deletion of user tags, conduct security assessments, and publicise the basic principles and purpose of their algorithms. Prohibits algorithmic price discrimination against existing customers, addictive or excessive-spending design targeting minors, and unfair scheduling of platform workers. Adopted as CAC/MIIT/MPS/SAMR Order No. 9 on 31 December 2021, effective 1 March 2022; unamended as of August 2026.'
  r.legal_citation =
    'Provisions on the Administration of Algorithmic Recommendations in Internet Information Services, CAC/MIIT/MPS/SAMR Order No. 9 (31 Dec. 2021, eff. 1 Mar. 2022)'
})

/* --------------------------------------------- UK Online Safety Act 2023
 * legislation.gov.uk revised text and its recorded effects confirm the Act
 * has been amended:
 *  - Crime and Policing Act 2026 (c. 20, Royal Assent 29 April 2026), s. 248
 *    inserts OSA s. 216A — a power for the Secretary of State to extend the
 *    illegal-content duties to "AI services", defined as any internet service
 *    capable (in whole or part) of generating AI-generated content. s. 216A is
 *    present in the current revised text on legislation.gov.uk.
 *  - The same Act amends Sch. 7 (priority offences), ss. 101-102 and repeals
 *    s. 184; the Data (Use and Access) Act 2025 (Consequential Amendments and
 *    Transitional Provision) Regulations 2026 (SI 2026/386) make further
 *    amendments.
 *  - Ofcom's published position is that generative AI and chatbot services
 *    can already fall in scope where they meet the user-to-user or search
 *    definitions; the Government announced on 16 February 2026 that it would
 *    legislate for chatbots not currently in scope.
 */
edit('uk-uk-onlinesafety-2023', (r) => {
  r.summary =
    "UK Online Safety Act imposes platform duties to prevent illegal content, protect children, and ensure user safety. Requires risk assessments, proactive content moderation technology, and compliance with Ofcom codes for regulated user-to-user and search services; Ofcom has published its register of categorised services and additional Category 1 duties. Ofcom's published position is that generative AI and chatbot services are already in scope where they meet the user-to-user or search service definitions. The Act has since been amended: the Crime and Policing Act 2026 (c. 50 amended by c. 20, Royal Assent 29 April 2026) inserted new s. 216A by its s. 248, empowering the Secretary of State to extend the illegal-content, fraudulent-advertising, CSEA-reporting, fees and OFCOM enforcement regimes to \"AI services\" — any internet service capable of generating AI-generated content, whatever proportion of its content is AI-generated — and to do so for illegal AI-generated content of all kinds rather than only priority illegal content. That Act also amended Sch. 7 priority offences and ss. 101–102 and repealed s. 184; SI 2026/386 made further consequential amendments under the Data (Use and Access) Act 2025. The s. 216A duties require implementing regulations and had not been made as of August 2026. UK still has no dedicated AI Act."
  r.operative_dates =
    'Royal Assent 26 Oct 2023; illegal content duties in force 17 Mar 2025; children\'s safety duties from 25 July 2025; categorised-service (Category 1/2A/2B) duties phased through 2026. Amended by the Crime and Policing Act 2026 (c. 20, Royal Assent 29 Apr 2026), which inserted the s. 216A power over "AI services"; implementing regulations under s. 216A not yet made as of 3 Aug 2026.'
  r.notable =
    'Not an AI statute, but the Crime and Policing Act 2026 added OSA s. 216A — a Henry VIII power to extend the illegal-content regime to any internet service capable of generating AI content, which would bring stand-alone LLM assistants and chatbots squarely within Ofcom\'s remit once regulations are made.'
  r.legal_citation =
    'Online Safety Act 2023, c. 50, as amended by the Crime and Policing Act 2026, c. 20, s. 248 and by SI 2026/386'
})

/* ----------------------------------------------- South Korea AI Basic Act
 * law.go.kr (National Law Information Center) open API for
 * 인공지능 발전과 신뢰 기반 조성 등에 관한 기본법:
 *  - Original enactment: Act No. 20676, promulgated 21 Jan 2025; addendum
 *    Art. 1 — in force one year after promulgation, i.e. 22 Jan 2026 (digital
 *    medical device element from 24 Jan 2026). The stored citation
 *    "Act No. 20882 (2024)" is wrong, as was the background note giving
 *    promulgation as 22 Jan 2025.
 *  - Current consolidated version: 일부개정 (partial amendment) by Act
 *    No. 21311, promulgated 20 Jan 2026, in force 22 Jan 2026, with
 *    Arts. 3(5), 6(2)(7)-(8), 17-2, 18, 22-3 and 35(1) second sentence in
 *    force from 21 Jul 2026.
 *  - Art. 43: administrative fine up to KRW 30M; Art. 42: up to 3 years'
 *    imprisonment or KRW 30M fine for disclosure of official secrets.
 *  - official_text_url moved from the third-party aibasicact.kr to law.go.kr.
 */
edit('kr-kr-aibasicact-2024', (r) => {
  r.official_text_url =
    'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5%EB%B0%9C%EC%A0%84%EA%B3%BC%EC%8B%A0%EB%A2%B0%EA%B8%B0%EB%B0%98%EC%A1%B0%EC%84%B1%EB%93%B1%EC%97%90%EA%B4%80%ED%95%9C%EA%B8%B0%EB%B3%B8%EB%B2%95'
  r.source_url = 'https://www.law.go.kr/lsInfoP.do?lsiSeq=268543'
  r.summary_url = 'https://aibasicact.kr/'
  r.summary =
    "South Korea's comprehensive AI framework consolidates 19 bills, requiring developers and deployers of 'high-impact AI' (healthcare, finance, transportation, employment, and other statutorily listed domains) to meet transparency, risk-management and documentation obligations. Mandates disclosure that a product or service uses generative AI and human-perceptible marking of generative AI outputs, with clearly perceptible labelling required for realistic synthetic content such as deepfakes. Foreign operators above a threshold must appoint a domestic representative. Promulgated as Act No. 20676 on 21 January 2025 and in force from 22 January 2026 (one year after promulgation). Amended before commencement by Act No. 21311, promulgated 20 January 2026 and in force 22 January 2026 — legislating the reorganised National AI Strategy Committee, promoting public-sector AI adoption, creating the statutory basis for an AI research institute, supporting accessibility and cost assistance for AI-vulnerable groups, and enabling public data to be supplied as training data — with Arts. 3(5), 6(2)(7)–(8), 17-2, 18, 22-3 and the second sentence of Art. 35(1) taking effect on 21 July 2026 alongside the amended Enforcement Decree. Penalties are low by international standards: administrative fines up to KRW 30M (Art. 43), plus up to 3 years' imprisonment or a KRW 30M fine for unlawful disclosure of official secrets (Art. 42)."
  r.operative_dates =
    'Promulgated 21 Jan 2025 (Act No. 20676); in force 22 Jan 2026 (one year after promulgation), digital medical device element from 24 Jan 2026. Amended by Act No. 21311 (promulgated 20 Jan 2026, in force 22 Jan 2026); Arts. 3(5), 6(2)(7)-(8), 17-2, 18, 22-3 and Art. 35(1) second sentence in force 21 Jul 2026.'
  r.implementation_phases = [
    { date: '2024-12-26', description: 'AI Basic Act passed by the National Assembly' },
    { date: '2025-01-21', description: 'Promulgated as Act No. 20676' },
    {
      date: '2026-01-22',
      description: 'Act takes effect one year after promulgation; obligations and KRW 30M administrative fines apply',
    },
    {
      date: '2026-01-24',
      description: 'High-impact AI definition extended to digital medical devices (original addendum, Art. 1 proviso)',
    },
    {
      date: '2026-07-21',
      description:
        'Amended provisions under Act No. 21311 (Arts. 3(5), 6(2)(7)-(8), 17-2, 18, 22-3, 35(1) second sentence) and the amended Enforcement Decree take effect',
    },
  ]
  r.legal_citation =
    'Framework Act on the Development of Artificial Intelligence and Establishment of Trust, Act No. 20676 (promulgated 21 Jan. 2025), as amended by Act No. 21311 (promulgated 20 Jan. 2026)'
  r.notable =
    'Passed December 2024, promulgated January 2025, in force 22 January 2026 and amended by Act No. 21311 two days before commencement. Innovation-first design with light penalties (KRW 30M administrative fine cap) contrasts with the EU approach.'
  r.background.legislative_notes =
    'Multiple AI framework bills introduced in the 20th and 21st National Assemblies from 2020 onward; the consolidated bill passed the National Assembly on 26 December 2024 and was promulgated as Act No. 20676 on 21 January 2025; the one-year transition period expired on 22 January 2026 when obligations came into force. A partial amendment (Act No. 21311) was promulgated on 20 January 2026, two days before commencement, with a further tranche of provisions effective 21 July 2026.'
})

/* --------------------------------------------- Japan AI Promotion Act
 * Cabinet Office AI Act page (www8.cao.go.jp/cstp/ai/ai_act/ai_act.html) and
 * the e-Gov statute database (laws.e-gov.go.jp, law ID 507AC0000000053):
 *  - The Act is 令和7年法律第53号 — Act No. 53 of 2025, not "Act No. 14 of
 *    2025" as stored.
 *  - Promulgated 4 June 2025, partly in force on promulgation, fully in force
 *    1 September 2025 (including the AI Strategy Headquarters provisions).
 *  - Cabinet Office announcement of 6 Feb 2026 (cao.go.jp/press/new_wave/
 *    20260206.html): the first statutory 人工智能基本計画 (AI Basic Plan)
 *    under the Act was adopted by Cabinet decision on 23 December 2025, to be
 *    revised annually for the time being.
 */
edit('jp-jp-aiprom-2025', (r) => {
  r.summary =
    "Japan's first binding AI law establishes a national AI promotion framework with a cabinet-level AI Strategy Headquarters (Ch. 4) chaired by the Prime Minister, and requires the government to adopt a statutory AI Basic Plan (Art. 18). Emphasizes research investment, talent development, data infrastructure and international AI leadership rather than restrictions, with duties of cooperation rather than prohibitions on developers and users. No direct monetary penalties — relies on sector-specific laws and guidance for enforcement. Deliberate contrast to the EU's risk-based prohibitive approach. Promulgated as Act No. 53 of 2025 on 4 June 2025, partly in force on promulgation and fully in force from 1 September 2025. The first AI Basic Plan under the Act was adopted by Cabinet decision on 23 December 2025 — Japan's first national AI strategy — built on three principles (reconciling innovation promotion with risk response, agile response, integrated domestic/external policy) and four directions (accelerating AI use, strengthening AI development capability, leading AI governance, continuous transformation); the Cabinet Office states it will be revised annually for the time being."
  r.operative_dates =
    'Promulgated 4 June 2025 as Act No. 53 of 2025; partly in force on promulgation; fully in force 1 September 2025 (including AI Strategy Headquarters provisions). First statutory AI Basic Plan adopted by Cabinet decision 23 December 2025, to be revised annually.'
  r.implementation_phases = [
    { date: '2025-05-28', description: 'Act passed by the National Diet' },
    { date: '2025-06-04', description: 'Promulgated as Act No. 53 of 2025; some provisions in force on promulgation' },
    {
      date: '2025-09-01',
      description: 'Act fully in force, including establishment of the AI Strategy Headquarters',
    },
    {
      date: '2025-12-23',
      description: 'First statutory AI Basic Plan (人工知能基本計画) adopted by Cabinet decision',
    },
  ]
  r.legal_citation =
    'Act on Promotion of Research, Development and Utilization of Artificial Intelligence-Related Technologies, Act No. 53 of 2025 (Japan)'
  r.notable =
    'Innovation-first framework law with no penalties; represents Japan\'s "soft law" approach to AI governance. Its operative output is the annually revised AI Basic Plan, first adopted by Cabinet decision on 23 December 2025.'
})

/* ------------------------------------------------------- Vietnam AI Law
 * Official Government Gazette (Công báo) entry for Law No. 134/2025/QH15
 * (congbao.chinhphu.vn/van-ban/luat-so-134-2025-qh15-468694.htm): issued
 * 10 Dec 2025, signed by National Assembly Chairman Tran Thanh Man,
 * published in Công báo No. 40, effective 1 Mar 2026 — all confirming the
 * stored dates. The commercial luatvietnam.vn translation is replaced as
 * official_text_url by the Gazette record and the Government's PDF.
 */
edit('vn-vn-ailaw-2025', (r) => {
  r.official_text_url = 'https://congbao.chinhphu.vn/van-ban/luat-so-134-2025-qh15-468694.htm'
  r.source_url = 'https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/12/134-luat-qh.pdf'
  r.summary_url =
    'https://english.luatvietnam.vn/law-no-134-2025-qh15-dated-december-10-2025-of-the-national-assembly-on-artificial-intelligence-422299-doc1.html'
  r.summary =
    "Vietnam's first standalone comprehensive AI law establishes risk-based classification (high, medium, low risk) for AI systems across 8 chapters and 35 articles, covering research, development, supply, deployment and use of AI systems, infrastructure and human-resource development, ethics and responsibilities, inspection and supervision, and state management of AI. Passed by the National Assembly on 10 December 2025, signed by Chairman Tran Thanh Man, published in Công báo No. 40 and in force since 1 March 2026. High-risk applications in finance, healthcare, and education have an 18-month grace period (until September 2027); other sectors have 12 months. Applies to both domestic and foreign AI providers affecting Vietnam."
})

/* ------------------------------------------------------------- India DPDPA
 * The stored MeitY PDF URL 404s and the e-Gazette URL is unreachable; both
 * replaced with live official MeitY sources.
 * PIB press release PRID 2190655 / "DPDP Rules, 2025 Notified" (17 Nov 2025):
 * the DPDP Rules, 2025 were notified on 14 November 2025, "mark[ing] the full
 * operationalisation of the Digital Personal Data Protection Act, 2023", with
 * an eighteen-month phased compliance period. The stored claim that
 * implementing rules were "still being finalized as of April 2026" is wrong,
 * and effective_date is corrected from the 11 Aug 2023 enactment date to the
 * 14 Nov 2025 commencement (the Act's s. 1(2) left commencement to
 * appointment by the Central Government). Penalty cap of Rs 250 crore
 * confirmed by PIB.
 */
edit('in-in-dpdpa-2023', (r) => {
  r.official_text_url = 'https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf'
  r.source_url = 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023'
  r.effective_date = '2025-11-14'
  r.summary =
    "India's first comprehensive data protection law with AI-relevant provisions covering automated processing and data subject rights for AI-processed personal data. Establishes the Data Protection Board of India for enforcement, with appeals to the Telecom Disputes Settlement and Appellate Tribunal. Enacted 11 August 2023 but commenced only on 14 November 2025, when MeitY notified the Digital Personal Data Protection Rules, 2025 — described by the Government as marking the full operationalisation of the Act — following consultation that drew 6,915 inputs. The Rules provide for an eighteen-month phased compliance period, so substantive Data Fiduciary obligations bite progressively through to 2027, with the Board and definitional provisions effective immediately. Penalties run to Rs 250 crore for failure to maintain reasonable security safeguards, Rs 200 crore for breach-notification or children's-data failures, and Rs 50 crore for other contraventions."
  r.operative_dates =
    'Enacted 11 Aug 2023; commencement left to Central Government notification under s. 1(2). Commenced 14 Nov 2025 with notification of the DPDP Rules, 2025; eighteen-month phased compliance period for substantive Data Fiduciary obligations.'
  r.implementation_phases = [
    { date: '2023-08-11', description: 'DPDPA enacted (No. 22 of 2023); commencement deferred to notification' },
    { date: '2025-01-03', description: 'Draft DPDP Rules published for public consultation (6,915 inputs received)' },
    {
      date: '2025-11-14',
      description:
        'DPDP Rules, 2025 notified; Act commences — Data Protection Board of India and definitional provisions effective',
    },
    {
      date: '2027-05-14',
      description:
        'End of the eighteen-month phased compliance period for substantive Data Fiduciary obligations under the DPDP Rules, 2025',
    },
  ]
  r.notable =
    "Implementing rules notified 14 November 2025, commencing the Act more than two years after enactment; substantive obligations phase in over eighteen months. AI-specific provisions are implicit rather than explicit."
})

writeFileSync(PATH, JSON.stringify(all, null, 2))
console.log(`records touched: ${touched.length}`)
for (const t of touched) console.log(`  ${t.changed ? 'CHANGED' : 'stamped'}  ${t.id}`)
