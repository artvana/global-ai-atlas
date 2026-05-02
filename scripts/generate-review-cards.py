#!/usr/bin/env python3
"""
generate-review-cards.py

Generates one review card per law in data/reviews/{id}.md
Each card contains:
  - All database claims
  - Automated QA flag results
  - Relevant law text excerpt
  - A corrections block the lawyer fills in

After filling corrections, run:
  python3 scripts/apply-corrections.py

Usage:
  python3 scripts/generate-review-cards.py              # all laws
  python3 scripts/generate-review-cards.py --tier 1     # tier 1 only
  python3 scripts/generate-review-cards.py --id eu-eu-aiact-2024  # single law
  python3 scripts/generate-review-cards.py --flagged    # only laws with automated flags
"""

import json, os, re, sys, argparse
from datetime import date

TODAY = date.today().isoformat()
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load():
    with open(f'{PROJECT_ROOT}/data/regulations.json') as f:
        regs = json.load(f)
    with open(f'{PROJECT_ROOT}/data/rules.json') as f:
        rules = json.load(f)
    try:
        with open(f'{PROJECT_ROOT}/data/review-status.json') as f:
            status = json.load(f)
    except FileNotFoundError:
        status = {}
    return regs, rules, status

def rule_counts(rules):
    counts = {}
    for r in rules:
        lid = r['first_instance']['law_id']
        counts[lid] = counts.get(lid, 0) + 1
    return counts

def review_tier(r, n_rules):
    binding = r.get('instrument_binding', False)
    scope = r.get('scope', '')
    status = r.get('status', '')
    active = status in ('in_force', 'enacted_not_yet_effective')
    if binding and scope == 'comprehensive' and active:   return 1
    if binding and scope == 'sector_specific' and active: return 2
    if binding and scope == 'single_issue':               return 3
    return 4

TIER_LABELS = {
    1: 'TIER 1 — Comprehensive & Binding (full review required)',
    2: 'TIER 2 — Sector-Specific & Binding (key fields review)',
    3: 'TIER 3 — Single-Issue & Binding (binding claim + penalty)',
    4: 'TIER 4 — Soft Law / Inactive (binding status only)',
}

SOFT_TYPES = {'voluntary_framework', 'policy_framework', 'guidance'}
VALID_SCOPES = {'comprehensive', 'sector_specific', 'single_issue'}

def run_checks(r, n_rules):
    """Return list of (severity, code, message) tuples."""
    issues = []
    lid = r['id']
    binding = r.get('instrument_binding', False)
    itype = r.get('instrument_type', '')
    status = r.get('status', '')
    scope = r.get('scope', '')
    effective = r.get('effective_date', '') or ''
    prov = r.get('provisions', {})
    penalty = r.get('max_penalty_usd_approx')

    if itype in SOFT_TYPES and binding:
        issues.append(('CRITICAL', 'L1', f'instrument_type={itype!r} but instrument_binding=true'))
    if penalty and not binding:
        issues.append(('CRITICAL', 'L3', f'max_penalty set (${penalty:,}) but instrument_binding=false'))
    if prov.get('private_right_of_action') and not binding:
        issues.append(('CRITICAL', 'L4', 'private_right_of_action=true but instrument not binding'))
    if status == 'in_force' and effective and effective > TODAY:
        issues.append(('CRITICAL', 'L5', f'status=in_force but effective_date={effective} is future'))
    if scope not in VALID_SCOPES:
        issues.append(('CRITICAL', 'L12', f'scope={scope!r} is not a valid value'))
    if lid.startswith('us-fed-') and binding and scope == 'comprehensive':
        issues.append(('CRITICAL', 'L7', 'US federal comprehensive+binding — no such statute exists'))
    if binding and scope == 'comprehensive' and n_rules < 5 and r.get('text_path'):
        issues.append(('WARNING', 'L6', f'comprehensive law but only {n_rules} rules extracted'))
    if binding and scope == 'sector_specific' and n_rules == 0 and r.get('text_path'):
        issues.append(('WARNING', 'L6', f'sector-specific binding law but 0 rules extracted'))
    text_path = r.get('text_path', '')
    if text_path:
        full_path = os.path.join(PROJECT_ROOT, text_path)
        if not os.path.exists(full_path):
            issues.append(('CRITICAL', 'L13', f'text_path={text_path!r} does not exist'))
        else:
            with open(full_path, 'rb') as tf:
                body = tf.read().decode('utf-8', errors='replace')
            body = re.sub(r'^---.*?---\s*', '', body, flags=re.DOTALL).strip()
            if len(body) < 500:
                issues.append(('CRITICAL', 'L13', f'text file is only {len(body)} chars — wrong page?'))
            if any(p in body[:2000] for p in ['Sorry, we could not find', 'Error 404', '404 Not Found']):
                issues.append(('CRITICAL', 'L13', 'text file contains 404 page content'))
            nav = ['Print version', 'Skip to main', 'Impressão', 'Cadastrar']
            found = [p for p in nav if p.lower() in body[:3000].lower()]
            if found:
                issues.append(('WARNING', 'L13', f'text file may be navigation page: {found}'))

    if r.get('legal_family') == 'soft_law' and binding:
        issues.append(('CRITICAL', 'L9', 'legal_family=soft_law but instrument_binding=true'))

    return issues

def get_text_excerpt(r, max_chars=1200):
    text_path = r.get('text_path', '')
    if not text_path:
        return None
    full_path = os.path.join(PROJECT_ROOT, text_path)
    if not os.path.exists(full_path):
        return None
    with open(full_path, 'rb') as f:
        body = f.read().decode('utf-8', errors='replace')
    body = re.sub(r'^---.*?---\s*', '', body, flags=re.DOTALL).strip()
    # Skip image tags and nav cruft
    body = re.sub(r'!\[.*?\]\(.*?\)', '', body)
    body = re.sub(r'\[.*?\]\(.*?\)', '', body)
    body = body.strip()
    if len(body) > max_chars:
        return body[:max_chars] + '\n…'
    return body

def format_card(r, n_rules, review_status_entry, all_reg_ids):
    lid = r['id']
    tier = review_tier(r, n_rules)
    issues = run_checks(r, n_rules)
    prov = r.get('provisions', {})
    text_excerpt = get_text_excerpt(r)

    critical = [i for i in issues if i[0] == 'CRITICAL']
    warnings = [i for i in issues if i[0] == 'WARNING']

    reviewed = review_status_entry.get('status', 'pending')
    reviewed_date = review_status_entry.get('reviewed_date', '')
    reviewed_by = review_status_entry.get('reviewed_by', '')

    lines = []
    def h(s): lines.append(s)

    h(f'# {r.get("short_name", lid)}')
    h(f'**ID**: `{lid}`  ')
    h(f'**{TIER_LABELS[tier]}**  ')
    if reviewed != 'pending':
        h(f'**Review status**: {reviewed} — {reviewed_by} on {reviewed_date}')
    h('')

    # ── Automated flags ──────────────────────────────────────────────────
    if critical or warnings:
        h('## ⚠ Automated Flags — Resolve Before Marking Reviewed')
        for sev, code, msg in critical:
            h(f'- 🔴 **CRITICAL [{code}]**: {msg}')
        for sev, code, msg in warnings:
            h(f'- 🟡 **WARNING [{code}]**: {msg}')
    else:
        h('## ✅ Automated Checks — No Flags')
    h('')

    # ── Database claims ──────────────────────────────────────────────────
    h('## Database Claims')
    h('')
    h('> Verify each field. The most consequential are marked ★.')
    h('')
    h(f'| Field | Current Value |')
    h(f'|-------|--------------|')
    h(f'| ★ Status | `{r.get("status","")}` |')
    h(f'| ★ Instrument Binding | `{r.get("instrument_binding","")}` |')
    h(f'| ★ Instrument Type | `{r.get("instrument_type","")}` |')
    h(f'| ★ Scope | `{r.get("scope","")}` |')
    h(f'| Enacted Date | `{r.get("enacted_date","—")}` |')
    h(f'| Effective Date | `{r.get("effective_date","—")}` |')
    h(f'| Jurisdiction | `{r.get("jurisdiction","")}` |')
    h(f'| Legal Family | `{r.get("legal_family","")}` |')
    h(f'| Primary Category | `{r.get("primary_category","")}` |')
    h(f'| Who Regulated | `{", ".join(r.get("who_regulated",[]))}` |')
    h(f'| ★ Max Penalty | {r.get("max_penalty","—")} |')
    h(f'| Max Penalty (USD approx) | {r.get("max_penalty_usd_approx","—")} |')
    h(f'| ★ Private Right of Action | `{prov.get("private_right_of_action","")}` |')
    h(f'| Risk Classification System | `{prov.get("risk_classification_system","")}` |')
    h(f'| Prohibited Categories | `{prov.get("prohibited_categories","")}` |')
    h(f'| Impact Assessment Required | `{prov.get("impact_assessment_required","")}` |')
    h(f'| Human Review Right | `{prov.get("human_review_right","")}` |')
    h(f'| AI Interaction Disclosure | `{prov.get("ai_interaction_disclosure","")}` |')
    h(f'| Biometric Protection | `{prov.get("biometric_protection","")}` |')
    h(f'| Instrument Binding (again) | `{r.get("instrument_binding","")}` |')
    h(f'| AI Specific | `{r.get("ai_specific","")}` |')
    h(f'| Rules Extracted | {n_rules} |')
    h(f'| Official URL | {r.get("official_text_url","—")} |')
    h(f'| Last Verified | {r.get("last_verified","—")} |')
    h('')

    # ── Summary ──────────────────────────────────────────────────────────
    h('## Summary (verify for accuracy)')
    h('')
    h(r.get('summary', '—'))
    h('')

    if r.get('key_obligations'):
        h('## Key Obligations (verify completeness and accuracy)')
        h('')
        for ob in r['key_obligations']:
            h(f'- {ob}')
        h('')

    # ── Law text ─────────────────────────────────────────────────────────
    if text_excerpt:
        h('## Law Text (excerpt)')
        h('')
        h('```')
        h(text_excerpt)
        h('```')
        h('')
    else:
        h('## Law Text')
        h('')
        h('*No text file available — review based on official URL above.*')
        h('')

    # ── Corrections block ─────────────────────────────────────────────────
    h('---')
    h('')
    h('## Corrections')
    h('')
    h('> Fill in only fields that need to change. Leave blank if the current value is correct.')
    h('> After completing all corrections, set `review_complete: true`.')
    h('')
    h('```yaml')
    h(f'id: {lid}')
    h(f'review_complete: false')
    h(f'reviewed_by:')
    h(f'notes:')
    h(f'')
    h(f'# Core legal determinations (★ fields above)')
    h(f'status:')
    h(f'instrument_binding:')
    h(f'instrument_type:')
    h(f'scope:')
    h(f'enacted_date:')
    h(f'effective_date:')
    h(f'legal_family:')
    h(f'max_penalty:')
    h(f'max_penalty_usd_approx:')
    h(f'')
    h(f'# Provisions (true/false)')
    h(f'private_right_of_action:')
    h(f'risk_classification_system:')
    h(f'prohibited_categories:')
    h(f'impact_assessment_required:')
    h(f'human_review_right:')
    h(f'ai_interaction_disclosure:')
    h(f'')
    h(f'# Free-text corrections')
    h(f'summary:')
    h(f'key_obligations_add:    # items to add (one per line, prefix with -)')
    h(f'key_obligations_remove: # items to remove (one per line, prefix with -)')
    h(f'notable:')
    h('```')

    return '\n'.join(lines)

def compute_progress(regs, rules_counts, review_status):
    tiers = {1:[], 2:[], 3:[], 4:[]}
    for r in regs:
        t = review_tier(r, rules_counts.get(r['id'], 0))
        tiers[t].append(r['id'])

    reviewed = {lid for lid, s in review_status.items() if s.get('status') == 'reviewed'}
    flagged = set()
    for r in regs:
        if run_checks(r, rules_counts.get(r['id'], 0)):
            flagged.add(r['id'])

    return tiers, reviewed, flagged

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--tier', type=int, choices=[1,2,3,4])
    parser.add_argument('--id', type=str)
    parser.add_argument('--flagged', action='store_true')
    parser.add_argument('--progress', action='store_true')
    args = parser.parse_args()

    regs, rules, review_status = load()
    rc = rule_counts(rules)
    all_reg_ids = {r['id'] for r in regs}

    if args.progress:
        tiers, reviewed, flagged = compute_progress(regs, rc, review_status)
        total = len(regs)
        print(f'\nReview Progress — {len(reviewed)}/{total} laws reviewed\n')
        for t in [1,2,3,4]:
            ids = tiers[t]
            rev_count = sum(1 for lid in ids if lid in reviewed)
            flag_count = sum(1 for lid in ids if lid in flagged)
            print(f'  Tier {t}: {rev_count}/{len(ids)} reviewed  ({flag_count} flagged)')
        print()
        return

    # Determine which laws to generate cards for
    target = regs
    if args.id:
        target = [r for r in regs if r['id'] == args.id]
    elif args.tier:
        target = [r for r in regs if review_tier(r, rc.get(r['id'], 0)) == args.tier]
    elif args.flagged:
        target = [r for r in regs if run_checks(r, rc.get(r['id'], 0))]

    # Sort: flagged first, then by tier, then by jurisdiction
    def sort_key(r):
        issues = run_checks(r, rc.get(r['id'], 0))
        n_critical = sum(1 for i in issues if i[0] == 'CRITICAL')
        tier = review_tier(r, rc.get(r['id'], 0))
        return (0 if n_critical else 1, tier, r.get('country',''), r['id'])

    target.sort(key=sort_key)

    os.makedirs(f'{PROJECT_ROOT}/data/reviews', exist_ok=True)

    generated = 0
    for r in target:
        lid = r['id']
        n_rules = rc.get(lid, 0)
        rs_entry = review_status.get(lid, {})

        # Don't regenerate already-reviewed cards unless forced
        out_path = f'{PROJECT_ROOT}/data/reviews/{lid}.md'
        if os.path.exists(out_path) and rs_entry.get('status') == 'reviewed' and not args.id:
            continue

        card = format_card(r, n_rules, rs_entry, all_reg_ids)
        with open(out_path, 'w') as f:
            f.write(card)
        generated += 1

    print(f'Generated {generated} review cards in data/reviews/')
    if not args.id:
        print(f'Run with --progress to see overall review status.')
        print(f'Run apply-corrections.py after filling in corrections.')

if __name__ == '__main__':
    main()
