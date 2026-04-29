# Inclusion and Exclusion Criteria

This document defines what qualifies for inclusion in the AI Regulation Database. Editors adding records must satisfy these criteria before committing a new entry.

---

## Inclusion Criteria

An instrument is eligible for inclusion if it meets **all** of the following:

### 1. Subject-matter threshold

The instrument must do at least **one** of the following:

- Create legally binding obligations or enforceable rights specifically related to artificial intelligence, machine learning, automated decision-making, or algorithmic systems; OR
- Establish a regulatory framework, agency, or formal supervisory structure whose primary mandate concerns AI; OR
- Impose requirements on the development, deployment, or use of AI systems in a defined sector or use case (employment, healthcare, financial services, biometric data, generative AI, synthetic media, etc.); OR
- Be a major soft-law or voluntary instrument from an international body or standards organisation with recognised global reach (OECD, UNESCO, ISO/IEC, G7, Council of Europe, UN General Assembly) that directly addresses AI governance.

### 2. Jurisdictional scope

- Enacted or adopted by a national government, a recognised sub-national authority (US state, Canadian province, EU member state), a regional body (EU, ASEAN, African Union), or a recognised international organisation; OR
- A US federal executive order or agency rule directly addressing AI.

### 3. Formal adoption

- The instrument has been formally enacted (statute signed into law), adopted (resolution passed, regulation published in official gazette), or issued (executive order, agency rule, final guidance) by an authorised body; OR
- For soft-law/voluntary instruments: formally published by the issuing body in final form (not in draft).

### 4. Verifiability

- An official text URL must be obtainable — the full text (or an official summary from the enacting body) must be linkable and the source must be publicly accessible.

---

## Exclusion Criteria

An instrument is **excluded** if it meets any of the following:

| Exclusion | Rationale |
|---|---|
| Pure data protection law with no AI-specific provisions | General GDPR-equivalent privacy laws already covered by the GDPR itself in the lineage; duplicative without AI-specific content |
| Draft legislation (pre-enactment) | Unstable content; status changes frequently; creates maintenance burden without informational payoff |
| Regional/local ordinances below state/provincial level | City and county ordinances (other than NYC LL144, which is treated as a statutory exception given its precedent significance) |
| Press releases, policy speeches, or strategy documents without legal force | These belong in `data/guidance.json`, not `data/regulations.json` |
| Expired or sunset instruments with no ongoing legal effect | Add `status: 'superseded'` if replaced; exclude entirely if simply lapsed with no successor |
| Instruments whose AI coverage is incidental | A cybersecurity law that mentions "AI-generated attacks" in passing is not an AI governance instrument |
| Duplicative sub-national instruments where a parent instrument exists and expressly pre-empts | Record only the parent |

---

## Borderline Cases

### Sector guidance that is quasi-binding

Some agency guidance (FDA, SEC, FTC) is not formally binding but is treated as binding in practice because non-compliance triggers enforcement. Include if: (a) the issuing body has taken enforcement action under the guidance, OR (b) the guidance establishes a safe harbour or testing requirement that is formally codified.

Set `instrument_binding: false` and `instrument_type: 'guidance'`.

### EU implementing acts and member state supplementary laws

Include EU member state laws **only** if they designate a national competent authority, create a national enforcement mechanism, or add substantive provisions beyond the EU AI Act itself. Pure transposition that adds nothing is excluded. Set `legal_family: 'eu_ai_act_implementation'`.

### Voluntary frameworks with broad adoption

Include if the instrument is from an OECD, UNESCO, ISO/IEC, G7, or UN body AND has generated measurable follow-on legislation in at least two jurisdictions. The OECD AI Principles and NIST AI RMF meet this bar; a single company's internal AI ethics framework does not.

### Sub-national laws in federations

Include US state laws that:
- Enact a substantive AI obligation (not merely a study, task force, or report requirement); AND
- Have been enacted (signed into law), not merely introduced.

Exclude bills that failed committee, died in chamber, or were vetoed.

---

## data/guidance.json vs data/regulations.json

Use `data/guidance.json` for instruments that do not meet the inclusion criteria for `regulations.json` but are still notable:
- Regulatory guidance and FAQs from enforcers (FTC, ICO, CNIL)
- Policy documents with strategic (but not binding) effect
- Industry codes and voluntary frameworks that fall short of the soft-law threshold

---

## Precedent Exceptions

The following instruments are included despite borderline status, with explicit `notable` fields explaining the exception:

| ID | Exception |
|---|---|
| `us-ny-ll144-2021` | NYC local ordinance, included due to first-in-world employment AI bias audit requirement and ongoing enforcement |
| `us-ftc-aipolicy-2023` | FTC policy statement, included due to active enforcement programme generating major precedent |

Any future exception must be documented here with the same format.
