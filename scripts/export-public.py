#!/usr/bin/env python3
"""
export-public.py

Produces the public-ready release of the database.

Outputs:
  dist-data/
    regulations.json          — full database with review metadata stripped
    regulations-reviewed.json — only laws that have passed human review
    rules.json                — full rules corpus
    manifest.json             — dataset metadata, version, coverage stats
    METHODOLOGY.md            — methodology and disclaimer document

Usage:
  python3 scripts/export-public.py --version 1.0.0
"""

import json, os, argparse, re
from datetime import date, datetime

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = date.today().isoformat()

DISCLAIMER = """# Methodology & Disclaimer

## About This Dataset

The Global AI Regulation Database is a structured, machine-readable dataset of
artificial intelligence laws, regulations, standards, and policy frameworks from
jurisdictions worldwide. It is maintained by OpenDataLabs.

## Coverage

The dataset covers:
- National statutes and regulations with AI-specific or AI-applicable scope
- Supranational instruments (EU regulations, directives, international agreements)
- Sub-national laws (US state laws, EU member state implementation acts)
- Binding administrative rules and executive instruments
- Non-binding frameworks, standards, and guidance documents (clearly flagged)

## Methodology

Each entry in the database is sourced from official government or international
organisation publications. Fields are populated through a combination of:

1. **Automated extraction** — AI-assisted analysis of official legal texts
2. **Automated validation** — 28 invariant checks for structural and logical
   consistency (binding coherence, date logic, referential integrity, text
   quality)
3. **Human legal review** — A qualified legal professional reviews each entry
   against the official source text, with particular attention to:
   - Whether the instrument creates legally binding obligations
   - Scope and applicability
   - Key provisions (private right of action, risk classification, prohibited
     categories, penalties)
   - Summary accuracy

## Review Status

Each entry carries a `review_status` field:
- `automated` — passed automated validation checks; not yet human-reviewed
- `reviewed` — verified by a qualified legal professional against the source text
- `expert_reviewed` — additionally verified by a subject-matter expert

## Limitations and Disclaimer

**This dataset is provided for informational and research purposes only.**

It does not constitute legal advice. The law changes frequently and entries may
not reflect the most recent amendments, judicial interpretations, or regulatory
guidance. The classification of instruments as binding or non-binding reflects
the database editors' assessment and may differ from other interpretations.

Penalties are stated in the currency and terms of the source instrument.
USD approximations use prevailing exchange rates at the time of last verification
and are indicative only.

For advice specific to your situation, consult a qualified legal practitioner
admitted in the relevant jurisdiction.

## Citation

When citing this dataset, please use:

> OpenDataLabs Global AI Regulation Database, v{VERSION} ({DATE}).
> https://opendatalabs.xyz/global-ai-atlas

## License

Database contents are made available under the Creative Commons Attribution 4.0
International License (CC BY 4.0). You are free to share and adapt the material
for any purpose, provided you give appropriate credit.

## Corrections

To report an error or suggest an update, please open an issue at:
https://github.com/opendatalabs/ai-regulation-db/issues
"""

def load_all():
    with open(f'{PROJECT_ROOT}/data/regulations.json') as f:
        regs = json.load(f)
    with open(f'{PROJECT_ROOT}/data/rules.json') as f:
        rules = json.load(f)
    try:
        with open(f'{PROJECT_ROOT}/data/review-status.json') as f:
            review_status = json.load(f)
    except FileNotFoundError:
        review_status = {}
    return regs, rules, review_status

def add_review_metadata(reg, review_status):
    """Annotate each regulation with its review status for the public export."""
    lid = reg['id']
    rs = review_status.get(lid, {})
    status = rs.get('status', 'automated')
    reg = dict(reg)
    reg['_review'] = {
        'status': status,
        'reviewed_by': rs.get('reviewed_by', '') if status != 'automated' else None,
        'reviewed_date': rs.get('reviewed_date', '') if status != 'automated' else None,
    }
    return reg

def compute_manifest(regs, rules, review_status, version):
    reviewed_ids = {lid for lid, rs in review_status.items() if rs.get('status') == 'reviewed'}
    binding_count = sum(1 for r in regs if r.get('instrument_binding'))
    active_count = sum(1 for r in regs if r.get('status') in ('in_force','enacted_not_yet_effective'))

    country_count = len({r['country'] for r in regs})

    by_status = {}
    for r in regs:
        s = r.get('status','unknown')
        by_status[s] = by_status.get(s, 0) + 1

    by_region = {}
    for r in regs:
        reg = r.get('region','Other')
        # Collapse US states into USA for manifest
        if reg and reg.startswith('US-'): reg = 'USA'
        by_region[reg] = by_region.get(reg, 0) + 1

    rule_counts = {}
    for rule in rules:
        lid = rule['first_instance']['law_id']
        rule_counts[lid] = rule_counts.get(lid, 0) + 1
    laws_with_rules = sum(1 for lid in rule_counts if rule_counts[lid] > 0)

    return {
        'version': version,
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'as_of_date': TODAY,
        'coverage': {
            'total_instruments': len(regs),
            'binding_instruments': binding_count,
            'active_instruments': active_count,
            'countries_and_jurisdictions': country_count,
            'rules_extracted': len(rules),
            'laws_with_rules': laws_with_rules,
        },
        'review_coverage': {
            'human_reviewed': len(reviewed_ids),
            'automated_only': len(regs) - len(reviewed_ids),
            'review_pct': round(len(reviewed_ids) / len(regs) * 100, 1),
        },
        'by_status': by_status,
        'by_region': by_region,
        'dataset_url': 'https://opendatalabs.xyz/global-ai-atlas',
        'source_repo': 'https://github.com/opendatalabs/ai-regulation-db',
        'license': 'CC BY 4.0',
        'citation': f'OpenDataLabs Global AI Regulation Database, v{version} ({TODAY}). https://opendatalabs.xyz/global-ai-atlas',
        'disclaimer': 'For informational purposes only. Does not constitute legal advice. Consult qualified legal counsel for jurisdiction-specific guidance.',
    }

def strip_internal_fields(reg):
    """Remove fields that are internal tooling state, not for public export."""
    reg = dict(reg)
    for internal in ('text_path',):
        reg.pop(internal, None)
    return reg

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', default='1.0.0')
    parser.add_argument('--reviewed-only', action='store_true',
                        help='Only export human-reviewed laws in regulations-reviewed.json')
    args = parser.parse_args()

    regs, rules, review_status = load_all()
    reviewed_ids = {lid for lid, rs in review_status.items() if rs.get('status') == 'reviewed'}

    out_dir = f'{PROJECT_ROOT}/dist-data'
    os.makedirs(out_dir, exist_ok=True)

    # ── Full database (all instruments, with review status annotation)
    full_export = [add_review_metadata(strip_internal_fields(r), review_status) for r in regs]
    with open(f'{out_dir}/regulations.json', 'w') as f:
        json.dump(full_export, f, indent=2, ensure_ascii=False)
    print(f'Exported {len(full_export)} regulations → dist-data/regulations.json')

    # ── Reviewed-only subset
    reviewed_export = [r for r in full_export if r['id'] in reviewed_ids]
    with open(f'{out_dir}/regulations-reviewed.json', 'w') as f:
        json.dump(reviewed_export, f, indent=2, ensure_ascii=False)
    print(f'Exported {len(reviewed_export)} reviewed regulations → dist-data/regulations-reviewed.json')

    # ── Rules corpus (unchanged)
    with open(f'{out_dir}/rules.json', 'w') as f:
        json.dump(rules, f, indent=2, ensure_ascii=False)
    print(f'Exported {len(rules)} rules → dist-data/rules.json')

    # ── Manifest
    manifest = compute_manifest(regs, rules, review_status, args.version)
    with open(f'{out_dir}/manifest.json', 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f'Exported manifest → dist-data/manifest.json')

    # ── Methodology
    methodology = DISCLAIMER.replace('{VERSION}', args.version).replace('{DATE}', TODAY)
    with open(f'{out_dir}/METHODOLOGY.md', 'w') as f:
        f.write(methodology)
    print(f'Exported methodology → dist-data/METHODOLOGY.md')

    # ── Summary
    pct = manifest['review_coverage']['review_pct']
    print(f'\n{"═"*50}')
    print(f'Release v{args.version} — {TODAY}')
    print(f'  {len(regs)} instruments · {len(rules)} rules')
    print(f'  {len(reviewed_ids)}/{len(regs)} ({pct}%) human-reviewed')
    if pct < 50:
        print(f'  ⚠ Review coverage below 50% — consider labelling as beta')
    elif pct < 80:
        print(f'  ⚠ Review coverage below 80% — consider labelling as RC')
    else:
        print(f'  ✓ Review coverage ≥ 80% — suitable for stable release')

if __name__ == '__main__':
    main()
