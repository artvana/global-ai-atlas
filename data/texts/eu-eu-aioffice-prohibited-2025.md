---
id: eu-eu-aioffice-prohibited-2025
title: "EU AI Office Guidelines on Prohibited AI Practices (Article 5 EU AI Act)"
short_name: "EU AI Office Guidelines on Prohibited Practices"
jurisdiction: European Union
enacted_date: 2025-02-04
status: in_force
official_url: https://digital-strategy.ec.europa.eu/en/library/guidelines-prohibited-artificial-intelligence-ai-practices
fetched_date: 2026-05-02
note: "Text reconstructed from official EU AI Office publication and Article 5 of Regulation (EU) 2024/1689. Verify against official publication."
---

# EU AI Office Guidelines on Prohibited AI Practices
**Pursuant to Article 5 of Regulation (EU) 2024/1689 (EU AI Act)**
*Published by the European AI Office — February 2025*

These guidelines interpret and operationalize the prohibitions on certain AI practices under Article 5 of the EU AI Act. The prohibitions apply from 2 February 2025. They are addressed to providers and deployers of AI systems within the scope of the EU AI Act.

---

## Part I — Overview of Article 5 Prohibitions

Article 5 of the EU AI Act establishes an absolute prohibition on eight categories of AI practices. These practices are considered to pose unacceptable risks to fundamental rights, democracy, the rule of law, or public safety. No justification, proportionality assessment, or risk management measure can overcome the prohibition. AI systems designed to perform these prohibited practices must not be placed on the market, put into service, or used in the EU.

---

## Part II — Prohibited Practices — Detailed Interpretation

### 1. Subliminal Manipulation (Article 5(1)(a))

**Prohibition**: AI systems that deploy subliminal techniques beyond a person's consciousness or purposefully manipulative techniques that exploit psychological weaknesses or biases, with the objective or the effect of materially distorting behaviour in a manner that causes or is reasonably likely to cause significant harm.

**Interpretation**:

The prohibition covers AI systems using techniques that bypass conscious human cognition, including:
- Subliminal audio-visual stimuli not consciously perceivable that influence behaviour;
- Micro-targeted persuasion exploiting documented psychological vulnerabilities at scale;
- AI-driven dark patterns that systematically distort decision-making against users' interests;
- Emotionally manipulative chatbot personas designed to induce dependency or override rational decision-making.

Two elements must be present: (a) deployment of subliminal or manipulative techniques, and (b) objective or effect of materially distorting behaviour causing significant harm. The harm threshold is material and significant — minor nudging for prosocial goals (health reminders, energy-saving prompts) that a user would endorse if aware is not prohibited.

**Indicators of prohibition**: deceptive social proof, manufactured urgency, grief manipulation, addiction exploitation, exploiting cognitive biases to override considered preferences.

---

### 2. Exploitation of Vulnerabilities (Article 5(1)(b))

**Prohibition**: AI systems that exploit vulnerabilities of a specific group of persons due to their age, disability, or social or economic situation, with the objective or the effect of materially distorting the behaviour of a person belonging to that group in a manner that causes or is reasonably likely to cause significant harm to that person or another person.

**Interpretation**:

Protected groups include: children and minors, persons with cognitive or psychological disabilities, persons in financial distress, elderly persons with reduced decision-making capacity, persons in addiction situations, refugees and asylum seekers, victims of domestic violence.

The exploitation must be targeted — the AI system must use knowledge of the vulnerability to achieve the distorting effect. Generic services that happen to be used by vulnerable persons are not automatically prohibited; the system must be designed to exploit the vulnerability.

**Examples of prohibited practices**:
- AI chatbots targeting gambling addicts with incentives designed to exploit impaired impulse control;
- AI systems targeting elderly persons with dementia with deceptive investment or donation pitches;
- AI targeting minor children through gamification specifically designed to circumvent parental oversight;
- AI exploiting documented financial desperation to manipulate into predatory products.

---

### 3. Social Scoring by Public Authorities (Article 5(1)(c))

**Prohibition**: AI systems for the evaluation or classification of natural persons or groups of persons over a period of time based on their social behaviour or known, inferred, or predicted personal or personality characteristics, with the social score leading to either or both of the following: (i) detrimental or unfavourable treatment of certain natural persons or groups of persons in social contexts unrelated to the contexts in which the data was originally generated or collected; or (ii) detrimental or unfavourable treatment of certain natural persons or groups of persons that is unjustified or disproportionate to their social behaviour or its gravity.

**Interpretation**:

This prohibition specifically targets public authorities operating social scoring systems (government agencies, public services). It does not directly prohibit private credit scoring, insurance underwriting, or employer background checking, though these remain subject to other EU law obligations.

The prohibition requires: (a) evaluation or classification based on social behaviour or personal characteristics, (b) over a period of time, (c) leading to detrimental treatment either in unrelated contexts or disproportionate to the scored behaviour.

**What is prohibited**: City-level AI scoring systems rating citizens' "social trustworthiness" that affects access to services. National systems denying travel, education, or financial access based on behavioural scores. Scoring systems that aggregate surveillance data to classify citizens for government treatment decisions.

**What is not prohibited**: Targeted welfare eligibility assessments for specific programme access; sector-specific risk assessment connected to the specific context (e.g., fraud risk assessment for financial transactions, child protection assessments).

---

### 4. Real-Time Remote Biometric Identification in Public Spaces (Article 5(1)(d))

**Prohibition**: The use of real-time remote biometric identification (RBI) systems in publicly accessible spaces for law enforcement purposes, subject to limited exceptions.

**Interpretation**:

Real-time RBI means biometric identification performed at the time of occurrence, including within a short delay, before results are used. It covers facial recognition, gait recognition, and other biometric modalities.

"Publicly accessible spaces" includes streets, squares, stations, airports, shopping centres, government offices open to the public, and any space where members of the public may be present without individual access rights.

**Exceptions** (Article 5(2)): Law enforcement authorities may deploy real-time RBI only:
- with prior judicial or independent administrative authorisation (except in duly justified urgency);
- for targeted search of a missing person, victim of trafficking, or victim of sexual exploitation;
- prevention of specific, substantial, and imminent threats to life or terrorist attack;
- detection, localisation, identification, or prosecution of perpetrators of criminal offences with a maximum sentence of at least four years.

Authorised deployments must be time-limited, geographically limited, and subject to logging, oversight, and proportionality assessment. Member States must adopt national measures specifying authorisation conditions.

**Post-hoc RBI for law enforcement**: AI systems used for post-hoc biometric identification (reviewing stored footage) in serious crime investigations are categorised as high-risk AI (Annex III) rather than prohibited, subject to conformity assessment.

---

### 5. Biometric Categorisation Based on Sensitive Attributes (Article 5(1)(e))

**Prohibition**: AI systems that categorise individually natural persons based on their biometric data to deduce or infer their race, political opinions, trade union membership, religious or philosophical beliefs, sex life or sexual orientation. This prohibition does not apply to the labelling or filtering of lawfully acquired biometric datasets in the context of law enforcement.

**Interpretation**:

Biometric data includes facial geometry, voice patterns, gait patterns, fingerprints, iris scans, and other physical or behavioural characteristics enabling identification or categorisation.

The prohibition targets inference of sensitive attributes from biometric data — using facial features to infer ethnicity or sexual orientation, using voice patterns to infer political affiliation. The prohibition applies regardless of accuracy.

**Scope**: Applies to providers building such classification functionality and deployers using it. Applies to private and public sector. Does not apply where the person has explicitly provided the relevant attribute information voluntarily.

---

### 6. Emotion Recognition in the Workplace and Educational Institutions (Article 5(1)(f))

**Prohibition**: AI systems used for emotion recognition in the workplace or educational institutions, except where the AI system for emotion recognition is put into service for medical or safety reasons.

**Interpretation**:

Emotion recognition systems infer or categorise individuals' emotional states from biometric or behavioural data (facial expressions, voice tone, body language, physiological signals).

**Prohibited uses**: Workplace AI monitoring employee emotional states to assess productivity, engagement, or distress. AI in educational settings reading student facial expressions to assess attention, engagement, or academic performance. HR AI inferring candidate emotional states in interviews.

**Permitted exceptions**: Medical applications (pain assessment, mental health support tools with clinical basis). Safety-critical monitoring (driver drowsiness detection, operator fatigue monitoring in safety-critical industries) where the purpose is to prevent physical harm.

The medical/safety exception requires a genuine medical or safety rationale, not pretextual use of safety framing to justify commercial emotion profiling.

---

### 7. AI-Compiled Facial Recognition Databases Through Indiscriminate Scraping (Article 5(1)(g))

**Prohibition**: AI systems that create or expand facial recognition databases through the untargeted scraping of facial images from the internet or from closed-circuit television (CCTV) footage.

**Interpretation**:

"Untargeted scraping" means indiscriminate mass collection of facial images without targeting specific individuals, with the purpose of building or expanding facial recognition training datasets or operational databases.

**Prohibited**: Building facial recognition systems trained on mass-scraped images from public websites. Expanding operational facial recognition databases using bulk CCTV footage. Creating databases of facial images of unrelated individuals without consent.

**Not prohibited**: Targeted collection of identified persons' images in specific law enforcement investigations with proper legal basis. Collecting images with explicit consent for specific identified purposes.

---

### 8. AI for Predictive Policing Based Solely on Profiling (Article 5(1)(h))

**Prohibition**: AI systems that make individual risk assessments of natural persons in order to assess the risk of a natural person of committing criminal offences, based solely on profiling or personality traits or characteristics, except to support the human assessment of the involvement of a person in a criminal activity, which is based on objective and verifiable facts directly linked to a criminal activity.

**Interpretation**:

This prohibition addresses AI systems that predict individual criminality based on demographic, behavioural, or personality profiles without specific evidence of criminal activity.

**Prohibited**: AI that flags individuals as crime risks based on their race, neighbourhood, social connections, or lifestyle characteristics. AI that produces a "crime likelihood score" based on profiling data unconnected to specific offences. AI used to justify surveillance, stop-and-search, or pre-emptive detention based on profile-based risk scores.

**Not prohibited**: AI supporting the analysis of specific evidence connected to a specific criminal act. AI supporting investigation of a known or suspected offence using objective, verifiable facts. Recidivism assessment tools used to support (not replace) judicial decisions, provided they are based on verified individual facts.

---

## Part III — Compliance Obligations

### Enforcement
Market surveillance authorities in each Member State are responsible for monitoring compliance with Article 5 prohibitions. The European AI Office has oversight and coordination functions for general-purpose AI models and cross-border matters.

Violations of Article 5 are subject to the highest penalty tier under the EU AI Act: fines of up to EUR 35,000,000 or, if the offender is a company, up to 7% of its total worldwide annual turnover for the preceding financial year, whichever is higher.

### Transitional Period
Article 5 prohibitions applied from 2 February 2025 — six months after the EU AI Act entered into force. AI systems already deployed that fall within a prohibited category must have been withdrawn by 2 February 2025 or adapted to remove the prohibited functionality.

### Relation to Other Law
The Article 5 prohibitions apply in addition to, and without prejudice to, obligations under the GDPR, Law Enforcement Directive, national criminal law, and other EU and Member State law.
