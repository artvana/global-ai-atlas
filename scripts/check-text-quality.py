#!/usr/bin/env python3
"""
check-text-quality.py
Scans all data/texts/*.md files for quality problems.
Checks: garbled text, too short, NOT FOUND, bill number mismatch,
        encoding issues, wrong jurisdiction, empty after frontmatter.

Usage: python3 scripts/check-text-quality.py [--verbose]
"""
import json, os, re, sys
from collections import defaultdict

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXTS_DIR   = os.path.join(PROJECT_ROOT, 'data', 'texts')
REGS_PATH   = os.path.join(PROJECT_ROOT, 'data', 'regulations.json')
VERBOSE     = '--verbose' in sys.argv

# ── helpers ──────────────────────────────────────────────────────────────────

def strip_frontmatter(raw):
    if raw.startswith('---'):
        end = raw.find('\n---', 3)
        if end > 0:
            return raw[end+4:].strip()
    return raw.strip()

def garbled_ratio(text):
    """Fraction of alpha-only tokens that are a single character."""
    tokens = text.split()
    alpha = [t for t in tokens if re.sub(r'[^a-zA-Z]', '', t)]
    if len(alpha) < 40:
        return 0.0
    single = sum(1 for t in alpha if len(re.sub(r'[^a-zA-Z]', '', t)) == 1)
    return single / len(alpha)

def bill_present(text, bill_number):
    """True if bill_number (or normalised variant) appears in text."""
    if not bill_number:
        return True
    upper = text.upper()
    bn    = bill_number.upper()
    # try as-is, no-space, hyphenated
    variants = [bn, bn.replace(' ', ''), bn.replace(' ', '-')]
    # also handle "CS/" prefixes: "CS/HB 919" -> also check "HB 919"
    if '/' in bn:
        variants.append(bn.split('/')[-1])
    # Expand common bill-number abbreviations to long-form (for state legislatures that
    # print long-form in enrolled text, e.g. "HB 178" -> also check "HOUSE BILL 178",
    # "HOUSE BILL NO. 178", "HOUSE FILE 178")
    import re as _re
    m = _re.match(r'^(HB|SB|AB|HF|SF|LB|HP|HD|SD|SJR|HJR|HCR|SCR)\s+(\d+\w*)$', bn)
    if m:
        prefix, num = m.group(1), m.group(2)
        expand = {
            'HB': ['HOUSE BILL', 'HOUSE BILL NO.', 'H.B. NO.', 'ENROLLED HOUSE BILL NO.'],
            'SB': ['SENATE BILL', 'SENATE BILL NO.', 'S.B. NO.', 'ENROLLED SENATE BILL NO.',
                   'SENATE ENROLLED ACT NO.'],
            'AB': ['ASSEMBLY BILL', 'ASSEMBLY BILL NO.'],
            'HF': ['HOUSE FILE', 'HOUSE FILE NO.'],
            'SF': ['SENATE FILE', 'SENATE FILE NO.'],
            'LB': ['LEGISLATIVE BILL', 'L.B.'],
            'HP': ['H.P.'],
            'HD': ['HOUSE DOCKET, NO.', 'HOUSE . . . . . . . . . . . . . . . NO.'],
            'SD': ['SENATE DOCKET, NO.', 'SENATE . . . . . . . . . . . . . . NO.'],
        }
        for long in expand.get(prefix, []):
            variants.append(f'{long} {num}')
    # For multi-bill strings (e.g. "HB 5141 / 5143 / 5144 / 5145"), also check each number
    nums = _re.findall(r'\b\d{3,}\b', bn)
    if len(nums) > 1:
        for n in nums:
            variants.append(n)
    # Single-letter prefix variants: "H 3021" -> "HB 3021", "HB3021", "H.B. 3021"
    sm = _re.match(r'^([HS])\s+(\d+\w*)$', bn)
    if sm:
        prefix, num = sm.group(1), sm.group(2)
        variants += [f'{prefix}B {num}', f'{prefix}B{num}', f'{prefix}.B. {num}',
                     f'{prefix}.B. NO. {num}', f'NO. {num}', f'NO.{num}']
        if prefix == 'H':
            variants += ['HOUSE . . . . . . . . . . . . . . . NO. ' + num,
                         'HOUSE . . . . . . . . . . . . . . NO. ' + num]
        elif prefix == 'S':
            variants += ['SENATE . . . . . . . . . . . . . . NO. ' + num,
                         'SENATE . . . . . . . . . . . . . . . NO. ' + num]
    # For California A/S bills: "A 1159" -> "NO. 1159" (CA format)
    cam = _re.match(r'^[AS]\s+(\d+)$', bn)
    if cam:
        variants.append('NO. ' + cam.group(1))
    return any(v in upper for v in variants)

def wrong_jurisdiction_hints(text, law_id):
    """Very basic: for US state bills check the state name appears."""
    # Extract state prefix from id like us-ca-ab2602-2024
    parts = law_id.split('-')
    if len(parts) < 3 or parts[0] != 'us' or parts[1] == 'fed':
        return []
    state_code = parts[1].upper()
    # Map of state codes to full names that should appear in enrolled bills
    state_names = {
        'AL':'ALABAMA','AK':'ALASKA','AZ':'ARIZONA','AR':'ARKANSAS',
        'CA':'CALIFORNIA','CO':'COLORADO','CT':'CONNECTICUT','DE':'DELAWARE',
        'FL':'FLORIDA','GA':'GEORGIA','HI':'HAWAII','ID':'IDAHO',
        'IL':'ILLINOIS','IN':'INDIANA','IA':'IOWA','KS':'KANSAS',
        'KY':'KENTUCKY','LA':'LOUISIANA','ME':'MAINE','MD':'MARYLAND',
        'MA':'MASSACHUSETTS','MI':'MICHIGAN','MN':'MINNESOTA','MS':'MISSISSIPPI',
        'MO':'MISSOURI','MT':'MONTANA','NE':'NEBRASKA','NV':'NEVADA',
        'NH':'NEW HAMPSHIRE','NJ':'NEW JERSEY','NM':'NEW MEXICO','NY':'NEW YORK',
        'NC':'NORTH CAROLINA','ND':'NORTH DAKOTA','OH':'OHIO','OK':'OKLAHOMA',
        'OR':'OREGON','PA':'PENNSYLVANIA','RI':'RHODE ISLAND','SC':'SOUTH CAROLINA',
        'SD':'SOUTH DAKOTA','TN':'TENNESSEE','TX':'TEXAS','UT':'UTAH',
        'VT':'VERMONT','VA':'VIRGINIA','WA':'WASHINGTON','WV':'WEST VIRGINIA',
        'WI':'WISCONSIN','WY':'WYOMING','PR':'PUERTO RICO','GU':'GUAM',
    }
    expected = state_names.get(state_code)
    if not expected:
        return []
    text_upper = text[:3000].upper()
    if expected not in text_upper:
        return [f'Expected "{expected}" in first 3000 chars']
    return []

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    with open(REGS_PATH) as f:
        regs = json.load(f)
    reg_by_id = {r['id']: r for r in regs}

    issues   = []   # (law_id, severity, issue_type, detail)
    ok_count = 0

    for fname in sorted(os.listdir(TEXTS_DIR)):
        if not fname.endswith('.md'):
            continue

        law_id = fname[:-3]
        path   = os.path.join(TEXTS_DIR, fname)

        try:
            with open(path, encoding='utf-8', errors='replace') as fh:
                raw = fh.read()
        except Exception as e:
            issues.append((law_id, 'HIGH', 'READ_ERROR', str(e)))
            continue

        content = strip_frontmatter(raw)
        size    = len(content)
        reg     = reg_by_id.get(law_id)

        # ── HIGH severity checks ──────────────────────────────────────────
        if not content or size < 50:
            issues.append((law_id, 'HIGH', 'EMPTY', f'{size} chars after frontmatter'))
            continue

        if 'NOT FOUND' in content[:600].upper():
            issues.append((law_id, 'HIGH', 'NOT_FOUND', f'{size} chars'))
            continue

        gr = garbled_ratio(content)
        if gr > 0.30:
            issues.append((law_id, 'HIGH', 'GARBLED', f'{gr:.0%} single-char tokens, {size} chars'))
            continue

        # ── MEDIUM severity checks ────────────────────────────────────────
        if size < 300:
            issues.append((law_id, 'MEDIUM', 'VERY_SHORT', f'{size} chars'))
            continue

        enc_errors = content.count('�')
        if enc_errors > 100:
            issues.append((law_id, 'MEDIUM', 'ENCODING', f'{enc_errors} replacement chars'))
            continue

        # Bill-number check — only for subnational bills where bill_number is set
        if reg:
            bn = reg.get('bill_number') or ''
            jt = reg.get('jurisdiction_type', '')
            if bn and jt == 'subnational' and size > 500:
                if not bill_present(content[:8000], bn):
                    issues.append((law_id, 'MEDIUM', 'BILL_NUM_MISSING',
                                   f'"{bn}" not found in first 8000 chars (size={size})'))

        # ── LOW severity checks ───────────────────────────────────────────
        hints = wrong_jurisdiction_hints(content, law_id)
        for h in hints:
            issues.append((law_id, 'LOW', 'JURISDICTION_HINT', h))

        ok_count += 1

    # ── report ───────────────────────────────────────────────────────────────
    high   = [(i, t, d) for (l, s, t, d) in [(x[0],x[1],x[2],x[3]) for x in issues] if s == 'HIGH' ]
    medium = [(i, t, d) for (i, s, t, d) in [(x[0],x[1],x[2],x[3]) for x in issues] if s == 'MEDIUM']
    low    = [(i, t, d) for (i, s, t, d) in [(x[0],x[1],x[2],x[3]) for x in issues] if s == 'LOW'  ]

    total_files = ok_count + len(issues)
    print(f'Scanned {total_files} files — {ok_count} OK, {len(issues)} flagged')
    print(f'  HIGH: {len(high)}   MEDIUM: {len(medium)}   LOW: {len(low)}\n')

    for severity, label, bucket in [
        ('HIGH',   '🔴 HIGH — likely wrong/corrupt content', high),
        ('MEDIUM', '🟡 MEDIUM — possible issues',            medium),
        ('LOW',    '🔵 LOW — worth spot-checking',          low),
    ]:
        if not bucket:
            continue
        print(f'\n{"="*60}')
        print(f'{label} ({len(bucket)})')
        print('='*60)
        by_type = defaultdict(list)
        for law_id, issue_type, detail in bucket:
            by_type[issue_type].append((law_id, detail))
        for t, items in sorted(by_type.items()):
            print(f'\n  [{t}] ({len(items)})')
            for law_id, detail in sorted(items):
                print(f'    {law_id}: {detail}')

    if VERBOSE:
        print('\n\nAll issues (raw):')
        for row in sorted(issues):
            print(row)

if __name__ == '__main__':
    main()
