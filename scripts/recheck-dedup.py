#!/usr/bin/env python3
"""
Re-run dedup checks for the 4 category pairs that failed with JSON parse errors.
Uses embedding cosine similarity to pre-filter candidates before sending to the model,
so large categories (1000+ rules) don't blow the context limit.
"""
import json, os, sys, math, time, anthropic

PAIRS = [
    ('disclosure', 'synthetic_media'),
    ('disclosure', 'consent'),
    ('accountability_governance', 'institutional_framework'),
    ('data_subject_rights', 'private_redress'),
]
SIMILARITY_THRESHOLD = 0.88  # cosine similarity floor for candidate pairs
MAX_CANDIDATES = 60          # max pairs to send to model per category pair
MATCHING_MODEL = 'claude-sonnet-4-6'

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def find_candidates(rules_a, rules_b, embs, threshold, max_pairs):
    """Return (rule_a, rule_b, similarity) pairs above threshold, sorted by similarity desc."""
    candidates = []
    for ra in rules_a:
        ea = embs.get(ra['rule_id'])
        if not ea:
            continue
        for rb in rules_b:
            eb = embs.get(rb['rule_id'])
            if not eb:
                continue
            sim = cosine(ea, eb)
            if sim >= threshold:
                candidates.append((ra, rb, sim))
    candidates.sort(key=lambda x: -x[2])
    return candidates[:max_pairs]


def check_pair_with_model(client, cat_a, cat_b, candidates):
    lines_a = '\n'.join(
        f'{ra["rule_id"]}: {ra["rule_text"][:150]}' for ra, _, _ in candidates
    )
    lines_b = '\n'.join(
        f'{rb["rule_id"]}: {rb["rule_text"][:150]}' for _, rb, _ in candidates
    )
    # Deduplicate (same rule may appear in multiple candidate pairs)
    seen_a = {}
    seen_b = {}
    for ra, rb, _ in candidates:
        seen_a[ra['rule_id']] = ra
        seen_b[rb['rule_id']] = rb

    list_a = '\n'.join(f'{r["rule_id"]}: {r["rule_text"][:150]}' for r in seen_a.values())
    list_b = '\n'.join(f'{r["rule_id"]}: {r["rule_text"][:150]}' for r in seen_b.values())

    prompt = f"""You are reviewing an AI-law rules database for near-duplicate rules placed in different categories.

These are high-similarity candidate pairs (pre-filtered by embedding similarity):

Category A ("{cat_a}", {len(seen_a)} candidate rules):
{list_a}

Category B ("{cat_b}", {len(seen_b)} candidate rules):
{list_b}

Identify pairs (one from A, one from B) that describe the same substantive legal obligation and should be merged. Be conservative — only flag genuine duplicates, not merely related rules. Companion bills covering the same statutory section count as duplicates.

Return ONLY a JSON array with no other text:
[{{"rule_id_a": "...", "rule_id_b": "...", "reason": "one sentence"}}]

If no duplicates, return exactly: []"""

    msg = client.messages.create(
        model=MATCHING_MODEL,
        max_tokens=2000,
        messages=[{'role': 'user', 'content': prompt}],
    )
    raw = msg.content[0].text if msg.content[0].type == 'text' else ''
    start = raw.find('[')
    end = raw.rfind(']')
    if start < 0 or end <= start:
        raise ValueError(f'No JSON array found in response: {raw[:200]}')
    return json.loads(raw[start:end + 1])


def main():
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print('Error: ANTHROPIC_API_KEY not set')
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    rules_list = json.load(open(os.path.join(PROJECT_ROOT, 'data', 'rules.json')))
    embs = json.load(open(os.path.join(PROJECT_ROOT, 'data', 'embeddings.json')))

    by_cat = {}
    for r in rules_list:
        by_cat.setdefault(r['category'], []).append(r)

    # Load existing suspects so we don't lose them
    suspects_path = os.path.join(PROJECT_ROOT, 'data', 'dedup-suspects.json')
    existing = json.load(open(suspects_path)) if os.path.exists(suspects_path) else []
    existing_pairs = {(s['rule_a'], s['rule_b']) for s in existing}

    new_suspects = []

    for cat_a, cat_b in PAIRS:
        rules_a = by_cat.get(cat_a, [])
        rules_b = by_cat.get(cat_b, [])
        print(f'\n--- {cat_a} ({len(rules_a)}) / {cat_b} ({len(rules_b)}) ---')

        candidates = find_candidates(rules_a, rules_b, embs, SIMILARITY_THRESHOLD, MAX_CANDIDATES)
        print(f'  Candidates above {SIMILARITY_THRESHOLD} similarity: {len(candidates)}')

        if not candidates:
            print('  No candidates — skipping model call')
            continue

        try:
            found = check_pair_with_model(client, cat_a, cat_b, candidates)
            added = 0
            for f in found:
                pair = (f['rule_id_a'], f['rule_id_b'])
                rev_pair = (f['rule_id_b'], f['rule_id_a'])
                if pair in existing_pairs or rev_pair in existing_pairs:
                    print(f'  (already known) {f["rule_id_a"]} ↔ {f["rule_id_b"]}')
                    continue
                new_suspects.append({
                    'rule_a': f['rule_id_a'], 'rule_b': f['rule_id_b'],
                    'cat_a': cat_a, 'cat_b': cat_b,
                })
                existing_pairs.add(pair)
                print(f'  NEW SUSPECT: {f["rule_id_a"]} ↔ {f["rule_id_b"]}: {f["reason"]}')
                added += 1
            if not added:
                print('  No new suspects found')
        except Exception as e:
            print(f'  ERROR: {e}')

        time.sleep(1)

    if new_suspects:
        all_suspects = existing + new_suspects
        json.dump(all_suspects, open(suspects_path, 'w'), indent=2)
        print(f'\n{len(new_suspects)} new suspects added. Total: {len(all_suspects)}')
    else:
        print('\nNo new suspects found across all 4 pairs.')


if __name__ == '__main__':
    main()
