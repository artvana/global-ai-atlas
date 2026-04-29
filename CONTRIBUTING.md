# Contributing to GAIA — Global AI Atlas

Thank you for helping keep the world's AI regulatory landscape documented. This guide covers how to add new instruments, fix metadata, and submit pull requests.

## Ways to contribute

- **Add a new regulation** — a law, executive order, agency rule, or international framework not yet in the database
- **Fix metadata** — incorrect dates, wrong category, missing provisions
- **Add legal text** — a markdown file in `data/texts/` for an instrument that doesn't have one yet
- **Update status** — mark a proposed law as enacted, or an enacted law as in force

## Adding a new regulation

### 1. Find the official source

Every record needs a verifiable official source: a government gazette, parliamentary record, or official regulatory body publication. Do not use news articles as the primary source.

### 2. Add the record to `data/regulations.json`

Each record is a JSON object. Minimum required fields:

```jsonc
{
  "id": "us-ca-sb1047-2025",          // {iso}-{jurisdiction_slug}-{law_slug}-{year}
  "short_name": "California SB 1047", // Short display name
  "full_name": "Safe and Secure Innovation for Frontier Artificial Intelligence Models Act",
  "country": "United States",         // Country name or "Global / Regional"
  "jurisdiction": "California",       // State, agency, or body; equals country for national laws
  "jurisdiction_type": "subnational", // supranational | national | subnational | agency
  "region": "North America",
  "status": "failed",                 // in_force | enacted_not_yet_effective | superseded | failed
  "enacted_date": "2024-09-29",       // YYYY-MM-DD or null
  "effective_date": null,             // YYYY-MM-DD or null
  "operative_dates": null,            // Free text for phased timelines, or null
  "last_verified": "2026-04-29",      // Date you verified this record
  "source_url": "https://leginfo.legislature.ca.gov/...",
  "primary_category": "general_ai_governance",
  "categories": ["general_ai_governance"],
  "legal_family": "us_consumer_protection",
  "instrument_binding": false,
  "ai_specific": true,
  "summary": "One paragraph plain-English summary of what the law does.",
  "provisions": {
    "private_right_of_action": false,
    "max_penalty_usd_approx": null,
    "enforcement_body": null,
    "extraterritorial": false
  },
  "inspired_by": [],     // IDs of laws this was modelled on
  "influenced": []       // IDs of laws this has influenced
}
```

### ID format

- `{2-3 letter country ISO}` - `{jurisdiction slug}` - `{law slug}` - `{year}`
- Use lowercase and hyphens only
- Examples: `eu-eu-aiact-2024`, `us-ca-sb53-2024`, `afu-afu-aistrategy-2024`
- For US federal agencies: `us-ftc-aipolicy-2023`
- For supranational bodies: `{body iso}-{body}-{slug}-{year}` e.g. `oecd-oecd-aiprinciples-2019`

### jurisdiction_type rules

| Situation | Value |
|---|---|
| UN, EU, OECD, ASEAN, G7, African Union | `supranational` |
| National parliament/congress law | `national` |
| US state, Canadian province, Chinese city | `subnational` |
| FTC, CFPB, NIST, FDA, SEC, EEOC, etc. | `agency` |

When `jurisdiction_type` is `supranational`, set `country` to `"Global / Regional"` and `jurisdiction` to the body name (`"European Union"`, `"OECD"`, etc.).

### 3. Run validation

```bash
npm run validate
```

Fix any errors before submitting.

### 4. Optionally add full legal text

If you have the full text (or a clean markdown version of it), add a file to `data/texts/` named `{id}.md` and set `"text_path": "data/texts/{id}.md"` in the record.

### 5. Open a pull request

- Title: `Add: {Short Name} ({Jurisdiction})`
- Body: include the official source URL and a one-sentence summary of what the law does
- One law per PR where possible (makes review faster)

## Fixing metadata

For corrections to existing records:
- PR title: `Fix: {Short Name} — {what changed}`
- Explain in the PR body why the current value is wrong and what the correct value is, with a source

## Questions

Open an issue if you're unsure about categorisation, legal family classification, or whether something belongs in the database.
