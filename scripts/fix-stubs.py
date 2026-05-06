#!/usr/bin/env python3
"""Fix stub/bad-fetch text files: IL, SC, RI, WI, OR, UT, OK."""

import os, sys, re, io, time, json, ssl, urllib.request
from datetime import date
from html import unescape
from html.parser import HTMLParser
import pdfplumber

# ── HTTP helpers ──────────────────────────────────────────────────────────────

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; AI-Regulation-DB)'}


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=CTX, timeout=timeout) as r:
        return r.read(), r.headers.get('Content-Type', '')


# ── HTML → plain text ─────────────────────────────────────────────────────────

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts, self._skip = [], False

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'nav', 'head'):
            self._skip = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'nav', 'head'):
            self._skip = False
        if tag in ('p', 'div', 'br', 'li', 'tr', 'h1', 'h2', 'h3', 'h4'):
            self.parts.append('\n')

    def handle_data(self, data):
        if not self._skip:
            self.parts.append(data)

    def get_text(self):
        return unescape(''.join(self.parts))


def html_to_text(html_bytes, encoding='utf-8'):
    try:
        text = html_bytes.decode(encoding, errors='replace')
    except Exception:
        text = html_bytes.decode('latin-1', errors='replace')
    p = TextExtractor()
    p.feed(text)
    raw = p.get_text()
    # Collapse blank lines
    lines = [l.rstrip() for l in raw.splitlines()]
    cleaned = []
    prev_blank = False
    for l in lines:
        blank = l.strip() == ''
        if blank and prev_blank:
            continue
        cleaned.append(l)
        prev_blank = blank
    return '\n'.join(cleaned).strip()


def pdf_to_text(pdf_bytes):
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        pages = []
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                pages.append(t)
    return '\n\n'.join(pages)


# ── Statenet fetcher ──────────────────────────────────────────────────────────

# Works for IL, SC, RI, OK, UT – borrow any valid client_md
# All share the same user token ciq=urn:user:PA196471263
STATENET_BASE = (
    'http://custom.statenet.com/public/resources.cgi'
    '?id=ID:bill:{bill_id}'
    '&ciq=urn:user:PA196471263'
    '&client_md={client_md}'
    '&mode=current_text'
)

# Known-good client_md values (bill-specific but any valid one works for fetching)
IL_CLIENT_MD = '91ebc12671535b8d23d0e91961cd4ed5'
SC_CLIENT_MD = '9c5a0fd794641ac6370a47e3f274c02a'
RI_CLIENT_MD = '91ebc12671535b8d23d0e91961cd4ed5'
OK_CLIENT_MD = '24202f3aa56d26f627dc1380d63c1b80'
UT_CLIENT_MD = '91ebc12671535b8d23d0e91961cd4ed5'


def fetch_statenet(bill_id, client_md):
    url = STATENET_BASE.format(bill_id=bill_id, client_md=client_md)
    data, _ = fetch(url)
    text = html_to_text(data, encoding='utf-8')
    return text, url


# ── Text file writer ──────────────────────────────────────────────────────────

TEXT_DIR = 'data/texts'
TODAY = date.today().isoformat()


def write_text(reg_id, text, source_url):
    path = os.path.join(TEXT_DIR, reg_id + '.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'---\n')
        f.write(f'id: {reg_id}\n')
        f.write(f'source_url: {source_url}\n')
        f.write(f'fetched_date: {TODAY}\n')
        f.write(f'fetch_status: OK\n')
        f.write(f'---\n\n')
        f.write(text)
    return os.path.getsize(path)


def text_looks_valid(text, min_len=1000):
    """Basic sanity check: has some real content."""
    if len(text) < min_len:
        return False
    bad_markers = [
        'something went wrong',
        'resource not available',
        'bills & laws',
        'skip navigation\nhome\ndocuments\nsenate\nassembly',
        'homehouses enat',
    ]
    lower = text.lower()
    return not any(m in lower for m in bad_markers)


# ── Wisconsin PDF ─────────────────────────────────────────────────────────────

WI_PDF_BASE = 'https://docs.legis.wisconsin.gov/document/proposaltext/2025/REG/{bill_code}.pdf'


def fetch_wi_bill(reg_id):
    # reg_id like us-wi-a292-2025 or us-wi-s295-2026
    parts = reg_id.split('-')
    bill_part = parts[2]  # a292, s295, a1109, etc.
    if bill_part.startswith('a'):
        code = 'AB' + bill_part[1:]
    elif bill_part.startswith('s'):
        code = 'SB' + bill_part[1:]
    else:
        return None, None
    url = WI_PDF_BASE.format(bill_code=code)
    data, ctype = fetch(url)
    if b'%PDF' not in data[:10]:
        return None, url
    text = pdf_to_text(data)
    return text, url


# ── Oregon: re-extract from already-saved binary PDF ─────────────────────────

def reextract_or_bill(reg_id):
    path = os.path.join(TEXT_DIR, reg_id + '.md')
    raw = open(path, 'rb').read()
    # The file contains the frontmatter and then binary PDF bytes mixed in
    # Find where the PDF starts (after the YAML frontmatter)
    fm_end = raw.find(b'---\n\n')
    if fm_end < 0:
        fm_end = raw.find(b'---\n')
        fm_end = raw.find(b'---\n', fm_end + 4)
    pdf_start = raw.find(b'%PDF', fm_end)
    if pdf_start < 0:
        return None, None
    pdf_bytes = raw[pdf_start:]
    text = pdf_to_text(pdf_bytes)
    # Extract source_url from frontmatter
    fm_text = raw[:pdf_start].decode('utf-8', errors='replace')
    src = ''
    for line in fm_text.split('\n'):
        if line.startswith('source_url:'):
            src = line.replace('source_url:', '').strip()
    return text, src


# ── Main fix routines ─────────────────────────────────────────────────────────

def fix_il_bills():
    bills = [
        ('us-il-h2655-2025', 'IL2025000H2655', IL_CLIENT_MD),
        ('us-il-h3021-2025', 'IL2025000H3021', IL_CLIENT_MD),
        ('us-il-h3021-2026', 'IL2025000H3021', IL_CLIENT_MD),
        ('us-il-h3646-2025', 'IL2025000H3646', IL_CLIENT_MD),
        ('us-il-h4945-2026', 'IL2025000H4945', IL_CLIENT_MD),
        ('us-il-h496-2025',  'IL2025000H496',  IL_CLIENT_MD),
        ('us-il-h4988-2026', 'IL2025000H4988', IL_CLIENT_MD),
        ('us-il-h5044-2026', 'IL2025000H5044', IL_CLIENT_MD),
        ('us-il-h5642-2026', 'IL2025000H5642', IL_CLIENT_MD),
        ('us-il-s1366-2025', 'IL2025000S1366', IL_CLIENT_MD),
        ('us-il-s1792-2025', 'IL2025000S1792', IL_CLIENT_MD),
        ('us-il-s2398-2025', 'IL2025000S2398', IL_CLIENT_MD),
        ('us-il-s2780-2026', 'IL2025000S2780', IL_CLIENT_MD),
        ('us-il-s2927-2026', 'IL2025000S2927', IL_CLIENT_MD),
        ('us-il-s2995-2026', 'IL2025000S2995', IL_CLIENT_MD),
        ('us-il-s3027-2026', 'IL2025000S3027', IL_CLIENT_MD),
        ('us-il-s3492-2026', 'IL2025000S3492', IL_CLIENT_MD),
        ('us-il-s3901-2026', 'IL2025000S3901', IL_CLIENT_MD),
        ('us-il-s456-2025',  'IL2025000S456',  IL_CLIENT_MD),
        ('us-il-s971-2025',  'IL2025000S971',  IL_CLIENT_MD),
        ('us-il-h1859-2025', 'IL2025000H1859', IL_CLIENT_MD),
    ]
    return _fix_statenet_batch('Illinois', bills)


def fix_sc_bills():
    bills = [
        ('us-sc-h3404-2025', 'SC2025000H3404', SC_CLIENT_MD),
        ('us-sc-h3796-2025', 'SC2025000H3796', SC_CLIENT_MD),
        ('us-sc-h4509-2025', 'SC2025000H4509', SC_CLIENT_MD),
        ('us-sc-s225-2025',  'SC2025000S225',  SC_CLIENT_MD),
        ('us-sc-s443-2025',  'SC2025000S443',  SC_CLIENT_MD),
        ('us-sc-s72-2025',   'SC2025000S72',   SC_CLIENT_MD),
        ('us-sc-h4582-2026', 'SC2025000H4582', SC_CLIENT_MD),
        ('us-sc-s734-2026',  'SC2025000S734',  SC_CLIENT_MD),
    ]
    return _fix_statenet_batch('South Carolina', bills)


def fix_ri_bills():
    bills = [
        ('us-ri-h7129-2026', 'RI2025000H7129', RI_CLIENT_MD),
        ('us-ri-h7538-2026', 'RI2025000H7538', RI_CLIENT_MD),
        ('us-ri-h7543-2026', 'RI2025000H7543', RI_CLIENT_MD),
        ('us-ri-h7764-2026', 'RI2025000H7764', RI_CLIENT_MD),
        ('us-ri-h7849-2026', 'RI2025000H7849', RI_CLIENT_MD),
        ('us-ri-s2266-2026', 'RI2025000S2266', RI_CLIENT_MD),
        ('us-ri-s2570-2026', 'RI2025000S2570', RI_CLIENT_MD),
    ]
    return _fix_statenet_batch('Rhode Island', bills)


def fix_ut_ok_bills():
    bills = [
        ('us-ut-sb149-2024', 'UT2024000S149', UT_CLIENT_MD),
        ('us-ok-s224-2025',  'OK2025000S224',  OK_CLIENT_MD),
    ]
    return _fix_statenet_batch('UT/OK', bills)


def _fix_statenet_batch(label, bills):
    ok, fail = 0, []
    for reg_id, bill_id, client_md in bills:
        try:
            text, url = fetch_statenet(bill_id, client_md)
            if text_looks_valid(text, min_len=300):
                sz = write_text(reg_id, text, url)
                print(f'  ✓ {reg_id}: {sz:,}B')
                ok += 1
            else:
                print(f'  ✗ {reg_id}: content too short or bad ({len(text)}B)')
                fail.append(reg_id)
        except Exception as e:
            print(f'  ✗ {reg_id}: {e}')
            fail.append(reg_id)
        time.sleep(0.5)
    print(f'{label}: {ok}/{len(bills)} succeeded')
    return fail


def fix_wi_bills():
    wi_stubs = [
        'us-wi-a292-2025', 'us-wi-a33-2025', 'us-wi-a415-2025',
        'us-wi-a959-2026', 'us-wi-a1109-2026',
        'us-wi-s1066-2026', 'us-wi-s295-2025', 'us-wi-s400-2025',
        'us-wi-s932-2026',
        # Duplicates that share the same PDF
        'us-wi-a292-2026', 'us-wi-a33-2026', 'us-wi-s295-2026',
    ]
    ok, fail = 0, []
    seen = {}  # bill_code → text (avoid re-fetching same PDF for -2025/-2026 pairs)
    for reg_id in wi_stubs:
        parts = reg_id.split('-')
        bill_part = parts[2]
        if bill_part.startswith('a'):
            code = 'AB' + bill_part[1:]
        else:
            code = 'SB' + bill_part[1:]
        if code in seen:
            text, url = seen[code]
        else:
            try:
                text, url = fetch_wi_bill(reg_id)
                if text is None:
                    print(f'  ✗ {reg_id}: PDF fetch failed ({url})')
                    fail.append(reg_id)
                    continue
                seen[code] = (text, url)
                time.sleep(0.5)
            except Exception as e:
                print(f'  ✗ {reg_id}: {e}')
                fail.append(reg_id)
                continue
        if text_looks_valid(text, min_len=300):
            sz = write_text(reg_id, text, url)
            print(f'  ✓ {reg_id}: {sz:,}B')
            ok += 1
        else:
            print(f'  ✗ {reg_id}: invalid content ({len(text)}B)')
            fail.append(reg_id)
    print(f'Wisconsin: {ok}/{len(wi_stubs)} succeeded')
    return fail


def fix_or_bills():
    or_stubs = [
        'us-or-h2230-2025', 'us-or-h3315-2025',
        'us-or-h3771-2025', 'us-or-s414-2025',
    ]
    ok, fail = 0, []
    for reg_id in or_stubs:
        try:
            text, url = reextract_or_bill(reg_id)
            if text and text_looks_valid(text, min_len=500):
                sz = write_text(reg_id, text, url)
                print(f'  ✓ {reg_id}: {sz:,}B (re-extracted from saved PDF)')
                ok += 1
            else:
                print(f'  ✗ {reg_id}: re-extraction failed ({len(text) if text else 0}B)')
                fail.append(reg_id)
        except Exception as e:
            print(f'  ✗ {reg_id}: {e}')
            fail.append(reg_id)
    print(f'Oregon: {ok}/{len(or_stubs)} succeeded')
    return fail


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    all_failed = []

    print('\n=== Illinois (ILGA error → Statenet) ===')
    all_failed += fix_il_bills()

    print('\n=== South Carolina (wrong session + 2026) ===')
    all_failed += fix_sc_bills()

    print('\n=== Rhode Island (nav stubs → Statenet) ===')
    all_failed += fix_ri_bills()

    print('\n=== Utah & Oklahoma ===')
    all_failed += fix_ut_ok_bills()

    print('\n=== Wisconsin (nav stubs → PDF) ===')
    all_failed += fix_wi_bills()

    print('\n=== Oregon (binary PDF → re-extract) ===')
    all_failed += fix_or_bills()

    print('\n' + '='*60)
    if all_failed:
        print(f'STILL FAILED ({len(all_failed)}):')
        for f in all_failed:
            print(f'  {f}')
    else:
        print('All fixes succeeded!')
