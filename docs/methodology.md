# AI Regulation Repository — Methodology

**Open Data Labs** · Version 1.0 · April 24, 2026

---

## 1. Corpus Definition

### What counts as an "AI law"

An instrument is included if it meets **all three criteria**:

1. **Binding**: The instrument must be legally enforceable with penalties or enforcement mechanisms. Voluntary guidelines, white papers, and policy frameworks are excluded from the main corpus and tracked separately in `guidance.json`.

2. **AI-targeted**: AI, automated decision-making, machine learning, generative AI, or algorithmic systems must be the **primary** regulatory subject — not incidental. A cybersecurity law that mentions AI in one clause is excluded; a law whose operative provisions all concern AI is included.

3. **Enacted**: The instrument must have been signed into law, issued as a final rule, or adopted as a binding regulation. Bills that did not pass, proposed rules, and consultation drafts are excluded.

**Borderline cases** are included with `notable: "corpus boundary case — verify inclusion"` to flag them for review.

### What is excluded

| Exclusion | Rationale |
|-----------|-----------|
| Bills that did not pass | No binding force |
| Non-binding guidance (white papers, frameworks, guidelines) | No enforcement mechanism — tracked in `guidance.json` |
| Laws where AI is incidental | Scope criterion not met |
| Internal government-use policies with no private sector application | No private obligations |
| Resolutions, proclamations, study directives | No binding effect |
| Terminated proposed legislation (e.g. Canada AIDA) | Never enacted |

### Temporal scope

- **2020–present** for all jurisdictions (April 24, 2026 cut-off for this version)
- Pre-2020 laws included where they are the **primary existing legal instrument** with demonstrated AI relevance and active enforcement (e.g. Illinois BIPA 2008, GDPR 2016, California CCPA 2018)

### Geographic scope

| Tier | Jurisdictions |
|------|--------------|
| US Federal | All enacted federal AI legislation + binding agency rules explicitly targeting AI |
| US States | All 50 states + DC (all enacted AI laws) |
| International Tier 1 | EU, China, UK, South Korea, Japan |
| International Tier 2 | Canada, Brazil, Australia, Singapore |
| International Tier 3 | Council of Europe (treaty instruments) |

---

## 2. Source Hierarchy

When sources conflict, earlier sources in this list take priority:

1. **Official text** (congress.gov, federalregister.gov, state legislature sites, eur-lex.europa.eu, cac.gov.cn, legislation.gov.uk) — authoritative for enacted date, effective date, bill number, and penalty amounts
2. **IAPP AI Governance Legislation Tracker** — most current for US state law status
3. **NCSL AI Legislation Database** — comprehensive historical record for US state laws
4. **Troutman Privacy Blog** — weekly state AI law updates, particularly for 2025–2026 enactments
5. **MultiState AI Tracker** — cross-check for state law status
6. **DLA Piper Global AI Regulatory Tracker** — cross-check for international laws
7. **Baker Botts, King & Spalding, Nelson Mullins client alerts** — for penalty details and compliance analysis

Conflicts between sources are resolved by checking the official text. When official text is unavailable or unclear, the field is noted with `[VERIFY]` in the `notable` field.

---

## 3. Schema Decisions

### ID format

IDs follow `{jurisdiction_code}-{region_code}-{identifier}-{year}`:
- US federal: `us-fed-{shortname}-{year}` (e.g. `us-fed-eo14179-2025`)
- US state: `us-{state}-{shortname}-{year}` (e.g. `us-ca-sb53-2025`)
- International: `{country}-{country}-{shortname}-{year}` (e.g. `eu-eu-aiact-2024`)

### Category tagging

Multi-category tagging is allowed. `primary_category` reflects the dominant purpose:

| Situation | Decision |
|-----------|----------|
| Law covers multiple issues equally | Use `scope_structure` or `enforcement_architecture` as primary |
| Law addresses both transparency and individual rights | Use whichever appears in the operative clause |
| Sector-specific law | Use the sector category even if general transparency provisions are also present |

**Ambiguous cases:**
- Laws regulating chatbot disclosure to users → `transparency_disclosure` (not `individual_rights`) because the operative obligation is on the operator, not a right held by the user
- Laws prohibiting specific AI uses → `algorithmic_accountability` if about process, `content_synthetic_media` if about output

### `who_regulated` field

This reflects who faces affirmative obligations under the law:
- `developers`: those who create or train AI models
- `deployers`: those who integrate AI into products/services
- `both`: when the law explicitly creates obligations for both groups (e.g. EU AI Act)
- `government_only`: obligations only on public agencies
- `platforms`: hosting/distribution obligations (e.g. watermarking takedown obligations)

### Boolean provision flags

A provision flag is set to `true` only if the law creates a **direct, operative obligation** on that provision — not a tangential mention. The threshold:

| Flag set `true` | Flag left `false` |
|-----------------|-------------------|
| Human review right: law grants individuals right to request human review of AI decision | Human review right: law mentions human oversight as a best practice |
| Training data disclosure: law requires public disclosure of training data | Training data disclosure: law mentions training data in a definitional clause only |
| Anti-discrimination: law creates anti-discrimination standard for AI systems | Anti-discrimination: existing anti-discrimination law applies by implication |

### `max_penalty_usd_approx`

For comparison purposes only. Conversion methodology:
- EUR → USD at 1.10 (April 2026 approximate rate)
- KRW → USD at current rate
- AUD → USD at 0.64
- Penalties expressed as percentages of revenue: use stated maximum absolute figure if available; otherwise `null`
- "Per violation" vs. aggregate: use the per-violation maximum, which represents the ceiling for a single enforcement action

### `legal_family`

Classifies the **design philosophy** of the law:

| Family | Characteristics |
|--------|----------------|
| `eu_risk_based` | Risk tiers, conformity assessment, human oversight requirements, modelled on EU AI Act structure |
| `us_consumer_protection` | UDAP framework, AG enforcement, safe harbor, notification-centric |
| `china_state_sovereignty` | Content controls, ideological alignment requirements, CAC licensing, security assessments |
| `uk_non_model` | Sector regulator principles-based approach, no standalone AI act structure |
| `hybrid` | Combines elements of two or more families |
| `standalone` | Purpose-built for a single issue with no clear family resemblance |

---

## 4. Limitations

**This dataset cannot tell you:**

1. **Whether a law is being enforced.** Enacted ≠ enforced. Many state chatbot laws have no enforcement history yet.

2. **Compliance burden.** The boolean provision flags capture presence/absence of a requirement, not its complexity or compliance cost.

3. **Private sector applicability outside the stated jurisdiction.** Extraterritorial scope varies by law and is not systematically captured.

4. **Updates post April 24, 2026.** This dataset has a hard cut-off date. Colorado SB 24-205 revision, EU AI Act implementing acts, and other pending developments are flagged in `notable` but not pre-populated.

5. **Sub-jurisdictional laws below city level.** Only NYC Local Law 144 is included from city/county level; other municipal AI ordinances are outside scope.

6. **Industry-specific binding rules below agency-rule level.** EEOC enforcement guidance, FTC consent orders, and similar sub-regulatory instruments require case-by-case assessment.

---

## 5. Update Cadence

**Monthly review process:**

1. Check IAPP State AI Governance Tracker for new enactments
2. Check Troutman Privacy blog for weekly state updates
3. Check NCSL database for newly enacted bills
4. Check EUR-Lex for new EU implementing acts under AI Act
5. Check CAC website for Chinese regulations
6. Run `npx tsx scripts/validate.ts` — resolve all errors before committing

**To add a new law:**

1. Assign ID following `{jurisdiction}-{region}-{shortname}-{year}` format
2. Fill all required fields — no field left blank without a `null` and explanation in `notable`
3. Verify `official_text_url` links to the primary source text
4. Set `last_verified` to today's date
5. Run validation script
6. If law was inspired by or influenced existing entries, update the `inspired_by`/`influenced` fields on both records
7. Rebuild `data/regulations.csv` (export from UI or run conversion script)

**To update an existing entry:**

1. Update the relevant fields
2. Update `last_verified`
3. If a law has been revised or superseded, create a new entry for the replacement and set `superseded_by` on the old entry
4. Run validation script

---

## 6. Known Gaps

The following laws are in scope but awaiting full field completion or official text verification:

| Law | Issue |
|-----|-------|
| Illinois HB 3773 (penalty details) | Official IDHR penalty schedule not published |
| Tennessee SB 1580 (enacted date exact) | Legislature site down at time of check |
| Maine LD 2082 (effective date) | Effective date clause ambiguous in enrolled text |
| Maryland HB 895 (penalty) | Penalty clause cross-references consumer protection law — exact max not stated |
| Washington HB 2225 (final enrolled text) | Pre-signature version used — confirm final bill number |
| EU AI Act (implementing acts) | Multiple Commission implementing acts expected 2025–2026 not yet adopted |
| FTC AI binding orders | Consent orders against specific companies not systematically catalogued — requires manual review |
| China training data standards (official text) | English translation not available; summarized from CSET reporting |

---

## 7. Corpus Boundary Cases

Laws flagged with `notable: "corpus boundary case — verify inclusion"` are included provisionally and should be reviewed against the inclusion criteria at next update:

- **Washington HB 2225** — Comprehensive law with significant AI provisions but also covers non-AI automated systems broadly
- **California CCPA/CPRA** — Included because CPPA's ADMT regulations are directly AI-targeted; the base CCPA statute is included as the authorizing law
- **GDPR Article 22** — Pre-AI regulation included because of demonstrated enforcement against AI systems and as historical reference
- **Illinois BIPA** — Pre-AI regulation included because of substantial AI application in facial recognition and voice AI enforcement actions
- **Colorado SB 24-205** — Under revision; included because currently enacted and effective date active, but text may change significantly

---

*For questions about methodology: art@opendatalabs.xyz*
