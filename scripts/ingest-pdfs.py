#!/usr/bin/env python3
"""
ingest-pdfs.py

Processes files in data/pdfs/ named {id}.pdf or {id}.txt and writes
full-text content to data/texts/{id}.md with proper frontmatter.

Usage:
  python3 scripts/ingest-pdfs.py            # process all new files
  python3 scripts/ingest-pdfs.py --id sg-sg-eioa-2024  # one specific id
  python3 scripts/ingest-pdfs.py --force    # re-process even if text exists
"""

import os, sys, json, argparse, pdfplumber, io, subprocess
from datetime import date

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDFS_DIR = os.path.join(PROJECT_ROOT, 'data', 'pdfs')
TEXTS_DIR = os.path.join(PROJECT_ROOT, 'data', 'texts')
TODAY = date.today().isoformat()

PARAPHRASE_IDS = set()  # track which had paraphrase status so we can clear it

def extract_pdf(path):
    with open(path, 'rb') as f:
        data = f.read()
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        pages = len(pdf.pages)
        text = ''
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text += t + '\n\n'
    return text, pages

def extract_txt(path):
    with open(path, encoding='utf-8', errors='replace') as f:
        text = f.read()
    return text, None

def extract_rtf(path):
    result = subprocess.run(['textutil', '-convert', 'txt', '-stdout', path],
                            capture_output=True, timeout=30)
    text = result.stdout.decode('utf-8', errors='replace')
    return text, None

def extract_rtfd(path):
    rtf_inside = os.path.join(path, 'TXT.rtf')
    if os.path.exists(rtf_inside):
        return extract_rtf(rtf_inside)
    raise ValueError(f'No TXT.rtf found inside {path}')

def get_url_from_db(law_id):
    regs_path = os.path.join(PROJECT_ROOT, 'data', 'regulations.json')
    with open(regs_path) as f:
        regs = json.load(f)
    r = next((r for r in regs if r['id'] == law_id), None)
    return r.get('official_url', '') if r else ''

def write_text_file(law_id, text, source_url='', pages=None):
    path = os.path.join(TEXTS_DIR, f'{law_id}.md')
    page_note = f' ({pages} pages)' if pages else ''
    with open(path, 'w') as f:
        f.write(f'---\n')
        f.write(f'id: {law_id}\n')
        if source_url:
            f.write(f'source_url: {source_url}\n')
        f.write(f'fetched_date: {TODAY}\n')
        f.write(f'---\n\n')
        f.write(text)
    return len(text), path

def process_id(law_id, force=False):
    text_path = os.path.join(TEXTS_DIR, f'{law_id}.md')

    # Check if already has real text (not paraphrase)
    if not force and os.path.exists(text_path):
        with open(text_path) as f:
            existing = f.read()
        if 'text_status: paraphrase' not in existing:
            # Check if it has real content
            has_content = len(existing) > 500
            if has_content:
                print(f'  {law_id}: already has text, skipping (use --force to overwrite)')
                return False

    # Look for source file (preference: rtfd > rtf > pdf > txt)
    rtfd_path = os.path.join(PDFS_DIR, f'{law_id}.rtfd')
    rtf_path = os.path.join(PDFS_DIR, f'{law_id}.rtf')
    pdf_path = os.path.join(PDFS_DIR, f'{law_id}.pdf')
    txt_path = os.path.join(PDFS_DIR, f'{law_id}.txt')

    if os.path.exists(rtfd_path):
        print(f'  {law_id}: extracting RTFD...', end=' ', flush=True)
        try:
            text, pages = extract_rtfd(rtfd_path)
        except Exception as e:
            print(f'ERROR: {e}')
            return False
    elif os.path.exists(rtf_path):
        print(f'  {law_id}: extracting RTF...', end=' ', flush=True)
        try:
            text, pages = extract_rtf(rtf_path)
        except Exception as e:
            print(f'ERROR: {e}')
            return False
    elif os.path.exists(pdf_path):
        print(f'  {law_id}: extracting PDF...', end=' ', flush=True)
        try:
            text, pages = extract_pdf(pdf_path)
            if len(text) < 100:
                print(f'WARN: only {len(text)} chars extracted — may be a scanned PDF')
                return False
        except Exception as e:
            print(f'ERROR: {e}')
            return False
    elif os.path.exists(txt_path):
        print(f'  {law_id}: reading TXT...', end=' ', flush=True)
        text, pages = extract_txt(txt_path)
    else:
        print(f'  {law_id}: no file found in data/pdfs/ (tried {law_id}.rtfd/.rtf/.pdf/.txt)')
        return False

    url = get_url_from_db(law_id)
    chars, out_path = write_text_file(law_id, text, source_url=url, pages=pages)
    print(f'OK — {chars:,} chars → {out_path}')
    return True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--id', type=str, help='Process a specific law ID only')
    parser.add_argument('--force', action='store_true', help='Overwrite existing text files')
    args = parser.parse_args()

    os.makedirs(TEXTS_DIR, exist_ok=True)

    if args.id:
        process_id(args.id, force=args.force)
        return

    # Scan data/pdfs/ for any {id}.pdf or {id}.txt files
    if not os.path.isdir(PDFS_DIR):
        print(f'data/pdfs/ not found')
        return

    candidates = set()
    for fname in os.listdir(PDFS_DIR):
        if fname.endswith('.rtfd'):
            candidates.add(fname[:-5])
        elif fname.endswith('.rtf'):
            candidates.add(fname[:-4])
        elif fname.endswith('.pdf'):
            candidates.add(fname[:-4])
        elif fname.endswith('.txt'):
            candidates.add(fname[:-4])

    # Cross-reference with known law IDs
    regs_path = os.path.join(PROJECT_ROOT, 'data', 'regulations.json')
    with open(regs_path) as f:
        regs = json.load(f)
    known_ids = {r['id'] for r in regs}

    matched = sorted(candidates & known_ids)
    unmatched = sorted(candidates - known_ids)

    if unmatched:
        print(f'Files with unrecognized IDs (no matching regulation): {unmatched}')

    print(f'Processing {len(matched)} file(s)...')
    processed = 0
    for law_id in matched:
        if process_id(law_id, force=args.force):
            processed += 1

    print(f'\nDone: {processed} file(s) ingested.')

if __name__ == '__main__':
    main()
