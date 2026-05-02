#!/usr/bin/env python3
"""
apply-corrections.py

Reads all review cards in data/reviews/ that have review_complete: true,
applies corrections to regulations.json, and updates review-status.json.

Usage:
  python3 scripts/apply-corrections.py          # apply all completed cards
  python3 scripts/apply-corrections.py --dry-run # show what would change
  python3 scripts/apply-corrections.py --id eu-eu-aiact-2024
"""

import json, os, re, sys, yaml, argparse
from datetime import date

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = date.today().isoformat()

PROVISION_FIELDS = {
    'private_right_of_action', 'risk_classification_system', 'prohibited_categories',
    'impact_assessment_required', 'human_review_right', 'ai_interaction_disclosure',
    'biometric_protection', 'training_data_disclosure', 'content_labelling',
    'anti_discrimination', 'human_review_right', 'opt_out_right',
    'voice_likeness_protection', 'data_rights_re_training', 'safe_harbor',
    'agentic_ai_addressed', 'algorithmic_pricing_addressed', 'training_data_compensation',
}

TOP_LEVEL_FIELDS = {
    'status', 'instrument_binding', 'instrument_type', 'scope',
    'enacted_date', 'effective_date', 'legal_family', 'max_penalty',
    'max_penalty_usd_approx', 'summary', 'notable', 'ai_specific',
}

def parse_corrections_block(card_text):
    """Extract the YAML corrections block from the review card."""
    m = re.search(r'```yaml\n(.*?)```', card_text, re.DOTALL)
    if not m:
        return None
    try:
        return yaml.safe_load(m.group(1))
    except Exception as e:
        print(f'  ERROR parsing YAML: {e}')
        return None

def coerce_bool(v):
    if isinstance(v, bool): return v
    if isinstance(v, str):
        if v.lower() in ('true', 'yes', '1'): return True
        if v.lower() in ('false', 'no', '0'): return False
    return v

def apply_to_reg(reg, corr, dry_run=False):
    changes = []
    lid = reg['id']

    for field in TOP_LEVEL_FIELDS:
        val = corr.get(field)
        if val is None or val == '': continue
        old = reg.get(field)
        if field == 'instrument_binding':
            val = coerce_bool(val)
        if hasattr(val, 'isoformat'):
            val = val.isoformat()
        if field == 'max_penalty_usd_approx' and val:
            try: val = int(float(str(val).replace(',','')))
            except: pass
        if old != val:
            changes.append(f'  {field}: {old!r} → {val!r}')
            if not dry_run:
                reg[field] = val

    for field in PROVISION_FIELDS:
        val = corr.get(field)
        if val is None or val == '': continue
        val = coerce_bool(val)
        old = reg.get('provisions', {}).get(field)
        if old != val:
            changes.append(f'  provisions.{field}: {old!r} → {val!r}')
            if not dry_run:
                reg.setdefault('provisions', {})[field] = val

    # Key obligations
    to_add = corr.get('key_obligations_add', '') or ''
    to_remove = corr.get('key_obligations_remove', '') or ''
    if to_add or to_remove:
        existing = reg.get('key_obligations', [])
        adds = [line.lstrip('- ').strip() for line in str(to_add).splitlines() if line.strip().lstrip('- ')]
        removes = [line.lstrip('- ').strip() for line in str(to_remove).splitlines() if line.strip().lstrip('- ')]
        new_list = [o for o in existing if o not in removes] + adds
        if new_list != existing:
            changes.append(f'  key_obligations: {len(existing)} items → {len(new_list)} items')
            if not dry_run:
                reg['key_obligations'] = new_list

    if not dry_run and changes:
        reg['last_verified'] = TODAY

    return changes

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--id', type=str)
    args = parser.parse_args()

    with open(f'{PROJECT_ROOT}/data/regulations.json') as f:
        regs = json.load(f)

    try:
        with open(f'{PROJECT_ROOT}/data/review-status.json') as f:
            review_status = json.load(f)
    except FileNotFoundError:
        review_status = {}

    reg_by_id = {r['id']: r for r in regs}
    review_dir = f'{PROJECT_ROOT}/data/reviews'

    cards = sorted(os.listdir(review_dir))
    if args.id:
        cards = [f'{args.id}.md']

    applied = 0
    total_changes = 0

    for fname in cards:
        if not fname.endswith('.md'): continue
        lid = fname[:-3]

        card_path = os.path.join(review_dir, fname)
        with open(card_path) as f:
            card_text = f.read()

        corr = parse_corrections_block(card_text)
        if not corr:
            continue
        if not corr.get('review_complete'):
            continue
        if lid not in reg_by_id:
            print(f'WARN: {lid} not in regulations.json — skipping')
            continue

        changes = apply_to_reg(reg_by_id[lid], corr, dry_run=args.dry_run)

        reviewer = str(corr.get('reviewed_by', '') or '').strip()
        notes = str(corr.get('notes', '') or '').strip()

        review_status[lid] = {
            'status': 'reviewed',
            'reviewed_by': reviewer or 'unspecified',
            'reviewed_date': TODAY,
            'changes_count': len(changes),
            'notes': notes,
        }

        if changes:
            prefix = '[DRY RUN] ' if args.dry_run else ''
            print(f'{prefix}{lid} — {len(changes)} change(s):')
            for c in changes:
                print(c)
            total_changes += len(changes)
        else:
            print(f'✓ {lid} — verified, no changes needed')

        applied += 1

    if not args.dry_run:
        with open(f'{PROJECT_ROOT}/data/regulations.json', 'w') as f:
            json.dump(regs, f, indent=2, ensure_ascii=False)
        with open(f'{PROJECT_ROOT}/data/review-status.json', 'w') as f:
            json.dump(review_status, f, indent=2)
        print(f'\nApplied {applied} reviewed cards, {total_changes} field changes.')
    else:
        print(f'\n[DRY RUN] Would apply {applied} reviewed cards, {total_changes} field changes.')

if __name__ == '__main__':
    main()
