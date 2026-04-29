#!/usr/bin/env python3
"""
reclassify-categories.py

Expands the 14-category taxonomy to 20 academically precise categories
suitable for comparative law analysis.

Phase 0 – Simple renames (no API needed):
  prohibited_uses    → prohibited_applications
  impact_assessment  → conformity_assessment
  human_review       → human_oversight
  data_rights        → data_subject_rights

Phase 1 – Claude-assisted splits (processes all rules in each source category):
  general_governance → accountability_governance | registration_notification | general_governance
  enforcement        → enforcement_penalties | private_redress
  training_data      → training_data_quality | data_provenance
  transparency       → disclosure | explainability | technical_documentation

Usage:
  ANTHROPIC_API_KEY=… python3 scripts/reclassify-categories.py
"""

import json, sys, time
from pathlib import Path
import anthropic

ROOT  = Path(__file__).resolve().parent.parent
RULES = ROOT / 'data' / 'rules.json'

RENAMES = {
    'prohibited_uses':  'prohibited_applications',
    'impact_assessment':'conformity_assessment',
    'human_review':     'human_oversight',
    'data_rights':      'data_subject_rights',
}

# Split definitions: category → {target_categories: description}
SPLITS = {
    'general_governance': {
        'accountability_governance': (
            'Organisational governance obligations: internal risk management, AI governance programs, '
            'post-market monitoring, auditing and third-party audits, board-level accountability, '
            'responsibility allocation between providers/deployers, algorithmic impact on society, '
            'corrective action obligations.'
        ),
        'registration_notification': (
            'Administrative pre-market controls: mandatory registration of AI systems with a public authority, '
            'licensing or authorisation requirements, pre-deployment notification or conformity marking (CE mark), '
            'AI system databases/registries, prior approval by a regulator.'
        ),
        'general_governance': (
            'Jurisdictional scope, definitions, and applicability thresholds only: who or what is subject to '
            'the law, what counts as an AI system, territorial/personal scope, exemptions, '
            'sunset/review clauses. Use ONLY when neither above applies.'
        ),
    },
    'enforcement': {
        'enforcement_penalties': (
            'Public enforcement by a regulatory authority: administrative fines, regulatory penalties, '
            'criminal sanctions, supervisory powers, market surveillance, orders to suspend or withdraw '
            'AI systems, injunctions sought by regulators, corrective measures ordered by authorities.'
        ),
        'private_redress': (
            'Individual civil redress: private right of action by individuals or data subjects, '
            'civil liability of providers/deployers, class or collective actions, compensation or '
            'damages payable to affected persons, judicial redress mechanisms, safe harbour defences '
            'in the context of individual claims.'
        ),
    },
    'training_data': {
        'training_data_quality': (
            'Quality and governance of training datasets: representativeness, accuracy and completeness '
            'requirements, bias detection and testing obligations, data validation, data minimisation '
            'in a training context, data governance policies, dataset documentation (datasheets).'
        ),
        'data_provenance': (
            'Provenance, IP rights, and consent for training data: copyright and intellectual-property '
            'obligations when scraping or licensing training data, consent or opt-out rights of individuals '
            'regarding use of their data for training, data sourcing and chain-of-custody documentation, '
            'rights of copyright holders over AI-generated outputs derived from their works.'
        ),
    },
    'transparency': {
        'disclosure': (
            'User-facing notification that AI is being used: informing individuals or the public that '
            'they are interacting with or subject to an AI system, labelling of AI-generated or AI-assisted '
            'outputs in products/services, right to know about automated decision-making affecting them.'
        ),
        'explainability': (
            'Individual right to understand and contest AI decisions: right to a meaningful explanation '
            'of the logic and factors behind an automated decision, algorithmic explainability for '
            'affected persons, right to contest or appeal an AI decision, human review triggered by '
            'the individual exercising a right (not a general oversight duty).'
        ),
        'technical_documentation': (
            'Regulator-facing and operator-facing record-keeping: technical files, system cards, '
            'audit logs, registers of AI systems maintained for supervisory purposes, transparency '
            'reports submitted to authorities, documentation standards for providers/operators — '
            'obligations owed to regulators or for internal compliance, not directly to individuals.'
        ),
    },
}

BATCH = 15

def build_prompt(cat: str, targets: dict, rules: list) -> str:
    options = '\n'.join(
        f'  {k}: {v}'
        for k, v in targets.items()
    )
    items = '\n'.join(
        f'RULE {i+1}: {r["rule_text"][:240]}'
        for i, r in enumerate(rules)
    )
    return f"""You are classifying legal rules extracted from AI regulation laws into precise sub-categories for comparative law analysis.

Each rule currently has category "{cat}". Assign each to the most appropriate sub-category:

{options}

Rules to classify:
{items}

Reply with exactly one line per rule:
RULE 1: <category_key>
RULE 2: <category_key>
...

Use only the exact keys listed above. Be precise — prefer specific categories over the general fallback."""


def split_category(client: anthropic.Anthropic, rules: list, cat: str, targets: dict) -> dict:
    """Returns {rule_id: new_category} for all rules in this category."""
    results = {}
    keys = list(targets.keys())

    for i in range(0, len(rules), BATCH):
        batch = rules[i:i + BATCH]
        prompt = build_prompt(cat, targets, batch)

        resp = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=600,
            messages=[{'role': 'user', 'content': prompt}]
        )

        for line in resp.content[0].text.strip().split('\n'):
            line = line.strip()
            if not line.upper().startswith('RULE'):
                continue
            parts = line.split(':', 1)
            if len(parts) < 2:
                continue
            try:
                idx = int(parts[0].upper().replace('RULE', '').strip()) - 1
                assigned = parts[1].strip().split()[0].lower()
                if idx < len(batch) and assigned in keys:
                    results[batch[idx]['rule_id']] = assigned
            except (ValueError, IndexError):
                pass

        done = min(i + BATCH, len(rules))
        sys.stdout.write(f'\r  {cat}: {done}/{len(rules)} classified')
        sys.stdout.flush()
        time.sleep(0.15)

    print()
    return results


def print_dist(rules: list, label: str) -> None:
    from collections import Counter
    counts = Counter(r['category'] for r in rules)
    print(f'\n{label} ({len(rules)} rules):')
    for cat, n in counts.most_common():
        print(f'  {n:4d}  {cat}')


def main() -> None:
    print('Loading rules…')
    rules: list = json.loads(RULES.read_text())
    print_dist(rules, 'BEFORE')

    # Phase 0 — simple renames
    print('\nPhase 0 – Renaming categories…')
    renamed = 0
    for r in rules:
        if r['category'] in RENAMES:
            r['category'] = RENAMES[r['category']]
            renamed += 1
    print(f'  Renamed {renamed} rules')

    # Phase 1 — Claude-assisted splits
    client = anthropic.Anthropic()

    for src_cat, targets in SPLITS.items():
        cat_rules = [r for r in rules if r['category'] == src_cat]
        if not cat_rules:
            print(f'\nSkipping {src_cat} (0 rules)')
            continue

        print(f'\nPhase 1 – Splitting {len(cat_rules)} {src_cat} rules into {list(targets.keys())}')
        assignments = split_category(client, cat_rules, src_cat, targets)

        # Apply
        id_map = {r['rule_id']: i for i, r in enumerate(rules)}
        changed = 0
        for rule_id, new_cat in assignments.items():
            if rule_id in id_map:
                rules[id_map[rule_id]]['category'] = new_cat
                changed += 1

        unassigned = len(cat_rules) - changed
        if unassigned:
            print(f'  Warning: {unassigned} rules not assigned — keeping as {src_cat}')
        print(f'  Applied {changed} assignments')

    print_dist(rules, 'AFTER')

    RULES.write_text(json.dumps(rules, indent=2, ensure_ascii=False))
    print(f'\nWritten to {RULES}')
    print('Next: npm run embed-rules  (regenerate embeddings for the new categories)')


if __name__ == '__main__':
    main()
