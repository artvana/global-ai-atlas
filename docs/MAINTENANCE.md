# Maintenance and Verification Cadence

This document defines the process for keeping the database accurate, current, and structurally sound over time.

---

## Quarterly Review Cycle

The database undergoes a full review **once per quarter** (January, April, July, October). The review covers:

### 1. Status audits

For every law with `status: 'enacted_not_yet_effective'` or `status: 'enacted_not_effective'`:
- Check whether the effective date has passed or an implementation trigger has occurred
- Update to `'in_force'` if applicable
- Update `effective_date` if a commencement order has been issued since last review

For every law with `status: 'in_force'`:
- Check whether a repeal, amendment, or suspension has occurred
- Update to `'under_revision'` or `'superseded'` as appropriate

### 2. Stale record review

Run the following to identify records needing reverification:

```bash
python3 -c "
import json
from datetime import datetime, timedelta
with open('data/regulations.json') as f:
    laws = json.load(f)
cutoff = (datetime.today() - timedelta(days=180)).strftime('%Y-%m-%d')
stale = [l for l in laws if l.get('last_verified', '') < cutoff]
print(f'{len(stale)} stale records:')
for l in sorted(stale, key=lambda x: x.get('last_verified','')):
    print(f'  {l[\"last_verified\"]}  {l[\"id\"]}  {l[\"short_name\"]}')
"
```

Each stale record requires:
1. Verify the `official_text_url` still resolves
2. Confirm no amendment or repeal has occurred since `last_verified`
3. Update `last_verified` to today's date
4. If changes found, update the relevant fields

### 3. New instrument scan

Once per quarter, search for new instruments in the following sources:

| Source | Coverage |
|---|---|
| EUR-Lex (eur-lex.europa.eu/search) | EU regulations and directives |
| Congress.gov | US federal bills enacted into law |
| NCSL AI Legislative Database | US state laws |
| OECD.AI Policy Observatory | National AI strategies and policies |
| Stanford CDDRL AI Governance Database | Cross-reference for new national laws |
| Access Now Digital Rights Hub | Emerging market and civil society tracking |
| ISO/IEC JTC1 SC42 publications | New AI standards |

Run each search filtered to the past 3 months. Apply `docs/INCLUSION_CRITERIA.md` to any candidate instrument.

### 4. Penalty and enforcement update

For laws with `max_penalty_usd_approx`, check whether:
- Currency exchange rates have moved >10% (update USD approximation)
- Penalty amounts have been amended
- New enforcement actions are available for `data/enforcement.json`

---

## Immediate-trigger updates

Certain events require out-of-cycle updates within **5 business days**:

| Trigger | Action required |
|---|---|
| Law enacted | Add new record; set `status: 'enacted_not_yet_effective'` if future effective date |
| Law takes effect | Update `status` to `'in_force'` |
| Law repealed or superseded | Update `status`; set `superseded_by` |
| Major enforcement action (fine >$1M, injunction, criminal charge) | Add record to `data/enforcement.json` |
| Official text URL breaks (404) | Find replacement URL and update; add archive.org link if unavailable |
| Constitutional challenge filed | Add to `notable` field; consider `status: 'under_revision'` if injunction granted |

---

## data/enforcement.json maintenance

Add a new entry when:
- A government body imposes a fine, ban, or compliance order under a covered law
- A private plaintiff files or settles a class action under a covered law
- A court issues an injunction with AI-specific effect

Each entry requires: verified `source_url` from a primary source (court filing, regulator press release, official gazette). Do not use press reports alone as the source; link to the underlying document.

---

## Schema and type changes

When adding a new field or extending a controlled vocabulary:

1. Update `src/types/index.ts` first (TypeScript union or interface)
2. Update `docs/SCHEMA.md` with the new value definition and decision rule
3. Update `docs/CLASSIFICATION.md` if the field requires editorial guidance
4. Run `npm run build` to confirm no type errors
5. Backfill all existing records with the new field (use a Python script in the project root)
6. Verify `SearchInterface.tsx` `EMPTY_FILTERS`, `FilterBar.tsx`, and `LawDetail.tsx` display as needed

Never add values to a union type without also updating `SCHEMA.md` — type exhaustiveness checks will not catch documentation gaps.

---

## Data integrity validation

Before any commit touching `data/regulations.json`, run:

```bash
python3 scripts/validate.py
```

If no validate.py exists, manually verify:
- All `id` values are unique
- All `inspired_by` and `influenced` IDs reference records that exist in the file
- All `primary_category` values appear in `categories`
- All `status` values are from the controlled vocabulary
- No `who_regulated` entries use `'both'` (invalid)
- All records have `instrument_binding` and `ai_specific` populated

---

## Ownership

| Responsibility | Owner |
|---|---|
| Quarterly review coordination | Database maintainer |
| US state law tracking | Maintainer + NCSL feeds |
| EU instrument tracking | Maintainer + EUR-Lex alerts |
| Enforcement action tracking | Maintainer |
| Schema changes | Maintainer (requires build verification) |

---

## Versioning

The database uses calendar versioning in the app footer (`Updated [Month] [Year]`). Update this string in `src/App.tsx` at the conclusion of each quarterly review.

Data exports (`data/regulations.json`, `data/enforcement.json`) are not versioned separately — git history provides the audit trail. Tag major schema changes (e.g., addition of `instrument_binding` field) with a git tag: `schema/YYYY-MM-DD`.
