#!/usr/bin/env python3
"""
mece-pass.py  —  Two-phase MECE clean-up for rules.json

Phase 1 – Reclassify
  Every rule currently in 'general_governance' is reviewed by Claude and
  re-assigned to the most specific applicable category.

Phase 2 – Consolidate
  Within each category, embedding cosine similarity finds near-duplicate
  pairs. Claude decides MERGE / KEEP. Merges combine instances.

Usage:
  ANTHROPIC_API_KEY=… python3 scripts/mece-pass.py
"""

import json, os, sys, time
from pathlib import Path
from collections import defaultdict
import anthropic

ROOT   = Path(__file__).resolve().parent.parent
RULES  = ROOT / 'data' / 'rules.json'
EMBS   = ROOT / 'data' / 'embeddings.json'

CATEGORIES = {
    'biometric_data':      'Biometric data collection, processing, consent, retention, or storage rules',
    'prohibited_uses':     'Outright prohibitions on specific AI applications (social scoring, manipulation, real-time biometric surveillance, etc.)',
    'impact_assessment':   'Requirements to conduct a risk, impact, or conformity assessment before deploying AI',
    'human_review':        'Requirements for human oversight, meaningful human review, appeal rights, or override mechanisms',
    'data_rights':         'User rights regarding personal data used in AI (access, correction, deletion, portability, opt-out)',
    'transparency':        'Disclosure that AI is being used, explanation of AI decisions, documentation obligations, or labelling',
    'synthetic_media':     'Deepfakes, AI-generated images/audio/video, watermarking, labelling of synthetic content',
    'enforcement':         'Penalties, fines, enforcement powers, private rights of action, or regulatory authority',
    'risk_classification': 'Frameworks that classify AI systems into risk tiers or levels (high-risk, limited risk, etc.)',
    'training_data':       'Data quality, documentation, bias testing, provenance, or licensing for training datasets',
    'foundation_models':   'Rules specifically targeting large / general-purpose / foundation AI models or GPAI',
    'consent':             'Requirements to obtain explicit informed consent from individuals before applying AI to them',
    'employment_ai':       'Rules specifically governing AI use in hiring, performance evaluation, or workplace monitoring',
    'general_governance':  'USE ONLY when no more specific category applies: broad compliance programs, accountability frameworks, registries, definitions, jurisdictional scope',
}

CAT_LIST = '\n'.join(f'  {k}: {v}' for k, v in CATEGORIES.items())

MERGE_THRESHOLD = 0.83
BATCH           = 10

# ── helpers ───────────────────────────────────────────────────────────────────

def cosine(a, b):
    return sum(x*y for x,y in zip(a, b))

def load():
    rules = json.loads(RULES.read_text())
    embs  = json.loads(EMBS.read_text())
    return rules, embs

def save(rules):
    RULES.write_text(json.dumps(rules, indent=2, ensure_ascii=False))

# ── Phase 1: reclassify general_governance ────────────────────────────────────

RECLASS_PROMPT = """You are classifying legal rules extracted from AI regulation laws.
Assign each rule to the MOST SPECIFIC applicable category from:

{cat_list}

Rules:
{items}

Reply with one line per rule:
  RULE 1: <category_key>
  RULE 2: <category_key>
  ...

Use ONLY the exact keys listed above. Prefer specific categories over general_governance."""

def reclassify_batch(client, batch):
    items = '\n'.join(
        f'  RULE {i+1}: {r["rule_text"][:220]}'
        for i, r in enumerate(batch)
    )
    resp = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=512,
        messages=[{'role': 'user', 'content': RECLASS_PROMPT.format(
            cat_list=CAT_LIST, items=items
        )}]
    )
    assignments = {}
    for line in resp.content[0].text.strip().split('\n'):
        line = line.strip()
        if line.upper().startswith('RULE'):
            parts = line.split(':', 1)
            if len(parts) == 2:
                try:
                    idx  = int(parts[0].upper().replace('RULE','').strip()) - 1
                    cat  = parts[1].strip().split()[0].lower()
                    if idx < len(batch) and cat in CATEGORIES:
                        assignments[idx] = cat
                except (ValueError, IndexError):
                    pass
    return assignments

def phase1_reclassify(rules, client):
    gg = [r for r in rules if r['category'] == 'general_governance']
    print(f'\nPhase 1 – Reclassify {len(gg)} general_governance rules')

    BATCH_R = 20
    changes = 0
    id_to_idx = {r['rule_id']: i for i, r in enumerate(rules)}

    for i in range(0, len(gg), BATCH_R):
        batch = gg[i:i+BATCH_R]
        assignments = reclassify_batch(client, batch)
        for j, cat in assignments.items():
            rule = batch[j]
            if cat != 'general_governance':
                rules[id_to_idx[rule['rule_id']]]['category'] = cat
                changes += 1
        sys.stdout.write(f'\r  Processed {min(i+BATCH_R, len(gg))}/{len(gg)} — {changes} reclassified')
        sys.stdout.flush()
        time.sleep(0.15)

    print(f'\n  Done. {changes} rules reclassified out of {len(gg)}')
    return rules

# ── Phase 2: consolidate near-duplicates ─────────────────────────────────────

MERGE_PROMPT = """Review these similar rule pairs extracted from AI regulation laws.
Decide MERGE (same legal premise, can be combined) or KEEP (distinct premises).

Merge criteria: same core obligation/prohibition/right, just worded differently.
Keep criteria: different actors, thresholds, conditions, or meaningfully distinct sub-requirements.

{items}

Reply: "PAIR 1: MERGE" or "PAIR 1: KEEP" — one line per pair. Be conservative, prefer KEEP when uncertain."""

def find_candidates(rules, embs, threshold):
    by_cat = defaultdict(list)
    for r in rules:
        by_cat[r['category']].append(r)

    pairs = []
    for cat, rs in by_cat.items():
        for i in range(len(rs)):
            for j in range(i+1, len(rs)):
                a, b = rs[i], rs[j]
                ea = embs.get(a['rule_id'])
                eb = embs.get(b['rule_id'])
                if ea and eb:
                    sim = cosine(ea, eb)
                    if sim >= threshold:
                        pairs.append((sim, a, b))
    pairs.sort(reverse=True)
    return pairs

def review_batch(client, batch):
    items = '\n\n'.join(
        f'PAIR {i+1} (sim={sim:.3f}, cat={a["category"]}):\n  A: {a["rule_text"][:200]}\n  B: {b["rule_text"][:200]}'
        for i, (sim, a, b) in enumerate(batch)
    )
    resp = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=600,
        messages=[{'role': 'user', 'content': MERGE_PROMPT.format(items=items)}]
    )
    merges = set()
    for line in resp.content[0].text.strip().split('\n'):
        line = line.strip()
        if 'PAIR' in line.upper() and ':' in line:
            parts = line.split(':', 1)
            try:
                idx = int(parts[0].upper().replace('PAIR','').strip()) - 1
                if idx < len(batch) and 'MERGE' in parts[1].upper():
                    _, a, b = batch[idx]
                    merges.add((a['rule_id'], b['rule_id']))
            except (ValueError, IndexError):
                pass
    return merges

def apply_merges(rules, merge_ids):
    rule_map = {r['rule_id']: dict(r) for r in rules}
    absorbed = {}

    n = 0
    for id_a, id_b in merge_ids:
        while id_a in absorbed: id_a = absorbed[id_a]
        while id_b in absorbed: id_b = absorbed[id_b]
        if id_a == id_b or id_a not in rule_map or id_b not in rule_map:
            continue

        a, b = rule_map[id_a], rule_map[id_b]

        # Keep earlier first_instance
        if b['first_instance']['date'] < a['first_instance']['date']:
            a['first_instance'] = b['first_instance']

        # Merge instances (dedup by law_id)
        seen = {inst['law_id'] for inst in a['instances']}
        for inst in b['instances']:
            if inst['law_id'] not in seen:
                a['instances'].append(inst)
                seen.add(inst['law_id'])

        # Merge tags
        a['tags'] = list(dict.fromkeys(a.get('tags', []) + b.get('tags', [])))[:8]

        absorbed[id_b] = id_a
        del rule_map[id_b]
        n += 1

    return list(rule_map.values()), n

def phase2_consolidate(rules, embs, client):
    total_merged = 0
    for pass_num in range(1, 4):
        pairs = find_candidates(rules, embs, MERGE_THRESHOLD)
        print(f'\nPhase 2 pass {pass_num} — {len(pairs)} candidate pairs (threshold={MERGE_THRESHOLD})')
        if not pairs:
            break

        all_merges = set()
        for i in range(0, len(pairs), BATCH):
            batch = pairs[i:i+BATCH]
            merges = review_batch(client, batch)
            all_merges.update(merges)
            sys.stdout.write(f'\r  Reviewed {min(i+BATCH, len(pairs))}/{len(pairs)} — {len(all_merges)} to merge')
            sys.stdout.flush()
            time.sleep(0.15)
        print()

        rules, n = apply_merges(rules, all_merges)
        total_merged += n
        print(f'  Merged {n} pairs → {len(rules)} rules')
        if n == 0:
            break

    print(f'\nPhase 2 complete. Total merged: {total_merged}')
    return rules

# ── summary ───────────────────────────────────────────────────────────────────

def print_summary(rules, label):
    cats: dict = {}
    for r in rules:
        cats[r['category']] = cats.get(r['category'], 0) + 1
    print(f'\n{label} ({len(rules)} rules):')
    for c, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f'  {n:4d}  {c}')

# ── main ──────────────────────────────────────────────────────────────────────

def main():
    print('Loading…')
    rules, embs = load()
    print_summary(rules, 'BEFORE')

    client = anthropic.Anthropic()

    rules = phase1_reclassify(rules, client)
    rules = phase2_consolidate(rules, embs, client)

    print_summary(rules, 'AFTER')
    save(rules)
    print(f'\nWritten to {RULES}')

if __name__ == '__main__':
    main()
