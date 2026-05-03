#!/usr/bin/env python3
"""
Fetch real law text from official URLs and replace AI-generated placeholder summaries.
"""
import urllib.request
import urllib.error
import re
import json
import os
import io
import time
from pathlib import Path

PROJECT = Path('/Users/art/Desktop/claude-projects/ai-regulation-db')
TODAY = '2026-05-02'
TEXTS_DIR = PROJECT / 'data' / 'texts'
PDFS_DIR = PROJECT / 'data' / 'pdfs'
REGS_JSON = PROJECT / 'data' / 'regulations.json'

# The 81 laws to fix (id -> url, None means no URL available)
LAWS = {
    'ae-adgm-dpr-2021': 'https://en.adgm.thomsonreuters.com/rulebooks/adgm-data-protection-regulations-2021',
    'ae-ae-pdpl-2021': 'https://u.ae/en/information-and-services/justice-security-and-the-law/cyber-security-and-information-technology/personal-data-protection',
    'apec-apec-cbpr-2011': 'https://www.apec.org/groups/committee-on-trade-and-investment/digital-economy-steering-group/cross-border-privacy-rules-system',
    'au-au-aisafetystd-2024': 'https://www.industry.gov.au/science-technology-and-innovation/technology/artificial-intelligence/australias-ai-safety-standard',
    'au-au-naistrategy-2021': 'https://www.industry.gov.au/publications/australias-artificial-intelligence-action-plan',
    'bh-bh-pdpl-2018': 'https://www.pdpa.gov.bh/',
    'bn-bn-pdpo-2021': 'https://www.aiti.gov.bn/pdpo',
    'ca-fed-aida-2022': 'https://www.parl.ca/DocumentViewer/en/44-1/bill/C-27/first-reading',
    'ci-ci-pdpa-2013': None,
    'cr-cr-dpa-2011': 'https://www.prodhab.go.cr/',
    'de-de-kimig-2026': 'https://www.bmwk.de/Redaktion/DE/Artikel/Digitale-Welt/kuenstliche-intelligenz-ki-massnahmengesetz.html',
    'do-do-dpa-2013': None,
    'dz-dz-pdpl-2018': None,
    'ec-ec-lopdp-2021': 'https://www.registroficial.gob.ec/',
    'eg-eg-pdpl-2020': 'https://mcit.gov.eg/Upcont/Documents/Publications_1682020000000_ProtectionofPersonalData.pdf',
    'g7-g7-hiroshimaprocess-2023': 'https://www.meti.go.jp/press/2023/10/20231030002/20231030002-1.pdf',
    'gb-gb-aiwhitepaper-2023': 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach',
    'hk-hk-pcpdaiframework-2024': 'https://www.pcpd.org.hk/',
    'il-il-ppa13-2024': 'https://www.gov.il/en/pages/privacy-protection-law-amendment-13',
    'int-bletchley-declaration-2023': 'https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023',
    'int-paris-aiaction-2025': 'https://www.elysee.fr/en/emmanuel-macron/2025/02/11/ai-action-summit-communique',
    'int-seoul-aisafety-2024': 'https://www.gov.uk/government/publications/seoul-ministerial-statement-for-advancing-ai-safety-international-collaboration-and-action/seoul-ministerial-statement-for-advancing-ai-safety-international-collaboration-and-action',
    'jo-jo-pdpl-2023': 'https://pdpc.gov.jo/',
    'jp-jp-aiprom-2025': 'https://regulations.ai/regulations/japan-2025-5-ai-promotion',
    'jp-jp-appi-2022': 'https://www.ppc.go.jp/en/legal/law/',
    'jp-jp-meti-aiguidelines-2024': 'https://www.meti.go.jp/press/2024/04/20240419004/20240419004-1.pdf',
    'kr-kr-pipa-2023': 'https://www.pipc.go.kr/eng/',
    'lt-lt-aidesignation-2025': 'https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.540000',
    'lv-lv-aicentre-2025': 'https://likumi.lv/ta/id/340000',
    'nist-us-ai600-1-2024': 'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf',
    'nist-us-airmf-2023': 'https://airc.nist.gov/RMF',
    'no-no-kiloven-2026': 'https://www.regjeringen.no/no/tema/naringsliv/konkurransepolitikk/digitale-markeder/kunstig-intelligens/id3074217/',
    'oecd-oecd-aiprinciples-2019': 'https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0449',
    'om-om-pdpl-2022': 'https://ita.gov.om/',
    'pa-pa-dpa-2019': None,
    'py-py-dpa-2020': None,
    'ru-ru-ailaw169-2025': 'https://publication.pravo.gov.ru/document/0001202501040001',
    'sg-sg-eioa-2024': 'https://sso.agc.gov.sg/Acts-Supp/34-2024/Published/20241022',
    'sg-sg-maigf-2020': 'https://www.pdpc.gov.sg/Help-and-Resources/2020/01/Model-AI-Governance-Framework',
    'sk-sk-aiconformity-2025': 'https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2025/318/',
    'sn-sn-dpa-2008': None,
    'tr-tr-aibill-2025': 'https://www2.tbmm.gov.tr/d28/2/2-3358.pdf',
    'tz-tz-pdpa-2022': None,
    'un-un-airesolution-2024': 'https://documents.un.org/doc/undoc/gen/n24/065/92/pdf/n2406592.pdf',
    'unesco-unesco-airecommendation-2021': 'https://unesdoc.unesco.org/ark:/48223/pf0000381137',
    'us-al-hb161-2024': 'https://legiscan.com/AL/bill/HB161/2024',
    'us-al-hb172-2024': 'https://legiscan.com/AL/bill/HB172/2024',
    'us-ar-hb1071-2025': 'https://www.arkleg.state.ar.us/Bills/Detail?id=HB1071&ddBiennium=2025&ddSession=2025R&Search=',
    'us-ca-ab316-2025': 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB316',
    'us-ca-ab489-2025': 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB489',
    'us-ca-ab853-2025': 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB853',
    'us-ca-sb1047-2024': 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB1047',
    'us-co-sb25b004-2025': 'https://leg.colorado.gov/bills/sb25b-004',
    'us-de-hb333-2024': 'https://legis.delaware.gov/BillDetail?LegislationId=140938',
    'us-fed-eo13960-2020': 'https://www.federalregister.gov/documents/2020/12/08/2020-27065/promoting-the-use-of-trustworthy-artificial-intelligence-in-the-federal-government',
    'us-fed-eo14365-2025': 'https://www.federalregister.gov/documents/2025/12/16/2025-31390/advancing-united-states-leadership-in-artificial-intelligence-infrastructure',
    'us-fed-omm2410-2024': 'https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf',
    'us-fed-ostp-aiborblueprint-2022': 'https://bidenwhitehouse.archives.gov/ostp/ai-bill-of-rights/',
    'us-fl-hb1161-2025': 'https://www.flsenate.gov/Session/Bill/2025/1161',
    'us-fl-hb757-2025': 'https://www.flsenate.gov/Session/Bill/2025/757',
    'us-fl-sb262-2024': 'https://www.flsenate.gov/Session/Bill/2024/262/BillText/er/PDF',
    'us-ftc-fakereviews-2024': 'https://www.federalregister.gov/documents/2024/08/22/2024-18781/trade-regulation-rule-on-the-use-of-consumer-reviews-and-testimonials',
    'us-hi-sb2687-2024': 'https://www.capitol.hawaii.gov/session/2024/bills/SB2687_CD1_.HTM',
    'us-ia-sf2417-2026': 'https://www.legis.iowa.gov/legislation/BillBook?ga=91&ba=SF2417',
    'us-md-hb820-2025': 'https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/hb0820',
    'us-md-sb360-2025': 'https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/sb0360',
    'us-md-sb936-2025': 'https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/sb0936',
    'us-ms-sb2426-2025': 'https://billstatus.ls.state.ms.us/2025/pdf/history/SB/SB2426.xml',
    'us-nm-hb182-2024': 'https://www.nmlegis.gov/Legislation/Legislation?chamber=H&legtype=B&legno=182&year=24',
    'us-ny-sb8391-2025': 'https://www.nysenate.gov/legislation/bills/2025/S8391',
    'us-ny-sb8420a-2025': 'https://www.nysenate.gov/legislation/bills/2025/S8420/amendment/A',
    'us-oh-hb96ai-2025': 'https://search.legislature.ohio.gov/api/docs/Legislation/document?legislationId=HB+96&legislationTypeId=1&sessionId=135&apiKey=4rS5THTB0fmqKGMTRLZN_g',
    'us-sd-sb41-2026': 'https://sdlegislature.gov/Session/Bill/26041',
    'us-tx-sb1188-2025': 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB1188',
    'us-tx-sb441-2025': 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB441',
    'us-ut-sb332-2025': 'https://le.utah.gov/~2025/bills/static/SB0332.html',
    'us-va-sb1090-2025': 'https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+SB1090',
    'us-wv-hb5690-2024': 'https://www.wvlegislature.gov/Bill_Status/bills_history.cfm?input=5690&year=2024&sessiontype=RS&btype=bill',
    'us-wy-hb102-2025': 'https://www.wyoleg.gov/Legislation/2025/HB0102',
    'uy-uy-dpa-2008': 'https://www.impo.com.uy/bases/leyes/18331-2008',
    'zw-zw-cyberdata-2021': None,
}

# Local PDFs mappings
LOCAL_PDFS = {
    '24_0426_dhs_ai-ci-safety-security-guidelines-508c.pdf': 'us-dhs-aicisafety-2024',
    'C-63_1.pdf': 'ca-fed-c63-2024',
    'EUR-Lex - 52022PC0496 - EN - EUR-Lex.pdf': 'eu-eu-ailiability-2022',
    'Global Digital Compact - English_0.pdf': 'un-un-gdc-2024',
    'M-25-21-Accelerating-Federal-Use-of-AI-through-Innovation-Governance-and-Public-Trust.pdf': 'us-fed-omm2521-2025',
    'annex_08.pdf': None,  # unknown
    'upload_2024-09-09_1725849192841090989.pdf': None,  # unknown
    '9f6e99572739a3024c9cdaec53a0a0ef.pdf': None,  # unknown
}

import pdfplumber

def fetch_url(url, timeout=25):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        content_type = resp.headers.get('Content-Type', '')
        final_url = resp.geturl()
        data = resp.read()
    return data, content_type, final_url

def extract_pdf_text(data):
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        pages = []
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages[:100]):  # max 100 pages
            try:
                t = page.extract_text()
                if t:
                    pages.append(t)
            except Exception:
                pass
        return '\n\n'.join(pages), total_pages

def extract_pdf_text_from_file(filepath):
    with pdfplumber.open(filepath) as pdf:
        pages = []
        total_pages = len(pdf.pages)
        for page in pdf.pages[:100]:
            try:
                t = page.extract_text()
                if t:
                    pages.append(t)
            except Exception:
                pass
        return '\n\n'.join(pages), total_pages

def clean_html(html_bytes):
    try:
        text = html_bytes.decode('utf-8', errors='replace')
    except Exception:
        text = str(html_bytes)
    # Remove scripts and styles
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<nav[^>]*>.*?</nav>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<header[^>]*>.*?</header>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<footer[^>]*>.*?</footer>', '', text, flags=re.DOTALL|re.IGNORECASE)
    # Replace block tags with newlines
    text = re.sub(r'<(?:br|p|div|h[1-6]|li|tr|blockquote)[^>]*>', '\n', text, flags=re.IGNORECASE)
    # Remove remaining tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Decode HTML entities
    for ent, rep in [('&nbsp;', ' '), ('&amp;', '&'), ('&lt;', '<'), ('&gt;', '>'),
                     ('&quot;', '"'), ('&#39;', "'"), ('&mdash;', '—'), ('&ndash;', '–'),
                     ('&hellip;', '...'), ('&rsquo;', "'"), ('&lsquo;', "'"),
                     ('&rdquo;', '"'), ('&ldquo;', '"'), ('&#160;', ' '),
                     ('&sect;', '§'), ('&para;', '¶')]:
        text = text.replace(ent, rep)
    # Also handle numeric entities
    text = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))) if int(m.group(1)) < 65536 else ' ', text)
    text = re.sub(r'&[a-zA-Z]+;', ' ', text)
    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def is_real_content(text, law_id):
    """Check if text contains real legal content, not just a placeholder or error page."""
    if len(text) < 800:
        return False, f"too short ({len(text)} chars)"

    # Check for common error/redirect patterns
    lower = text.lower()
    if any(x in lower for x in ['404 not found', 'page not found', '403 forbidden',
                                  'access denied', 'blocked', 'enable javascript',
                                  'please enable', 'just a moment', 'cloudflare']):
        # But only fail if the content is short (could be mentioned in actual content)
        if len(text) < 3000:
            return False, "error/blocked page"

    return True, "ok"

def save_text(law_id, text, source_url, content_type_label='html'):
    """Save text to data/texts/{id}.md with frontmatter."""
    text_truncated = text[:60000]
    out = f'---\nid: {law_id}\nsource_url: {source_url}\nfetched_date: {TODAY}\ncontent_type: {content_type_label}\n---\n\n{text_truncated}'
    path = TEXTS_DIR / f'{law_id}.md'
    path.write_text(out, encoding='utf-8')
    return len(text)

def update_regulations_json(law_id, url):
    """Update official_text_url in regulations.json if it was null."""
    with open(REGS_JSON, 'r', encoding='utf-8') as f:
        regs = json.load(f)

    updated = False
    for reg in regs:
        if reg['id'] == law_id:
            if not reg.get('official_text_url'):
                reg['official_text_url'] = url
                updated = True
            break

    if updated:
        with open(REGS_JSON, 'w', encoding='utf-8') as f:
            json.dump(regs, f, indent=2, ensure_ascii=False)

    return updated

def process_law(law_id, url):
    """Fetch and process a single law. Returns (success, chars_or_error, url_used)."""
    if url is None:
        return None, 'no URL', None

    try:
        data, content_type, final_url = fetch_url(url)

        is_pdf = ('pdf' in content_type.lower() or
                  url.lower().endswith('.pdf') or
                  final_url.lower().endswith('.pdf'))

        if is_pdf:
            text, num_pages = extract_pdf_text(data)
            label = f'pdf ({num_pages} pages)'
        else:
            text = clean_html(data)
            label = 'html'

        ok, reason = is_real_content(text, law_id)
        if not ok:
            return False, reason, url

        chars = save_text(law_id, text, url, label)
        update_regulations_json(law_id, url)
        return True, chars, url

    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code}: {e.reason}', url
    except urllib.error.URLError as e:
        return False, f'URLError: {e.reason}', url
    except Exception as e:
        return False, f'{type(e).__name__}: {str(e)[:100]}', url

def process_local_pdf(filename, law_id):
    """Extract text from a local PDF and save it."""
    if law_id is None:
        return None, 'no law ID mapping'

    pdf_path = PDFS_DIR / filename
    if not pdf_path.exists():
        return False, f'file not found: {pdf_path}'

    try:
        text, num_pages = extract_pdf_text_from_file(pdf_path)
        ok, reason = is_real_content(text, law_id)
        if not ok:
            return False, reason

        source_url = f'local:data/pdfs/{filename}'
        chars = save_text(law_id, text, source_url, f'local_pdf ({num_pages} pages)')
        return True, chars
    except Exception as e:
        return False, f'{type(e).__name__}: {str(e)[:100]}'


# ============================================================
# MAIN
# ============================================================

print("=" * 70)
print("AI Regulation DB — Fetching Real Law Texts")
print(f"Date: {TODAY}")
print("=" * 70)
print()

fixed = {}    # law_id -> (chars, url)
failed = {}   # law_id -> (reason, url)
no_url = []   # law_id

# Process laws with URLs
total = len(LAWS)
print(f"Processing {total} laws...\n")

for i, (law_id, url) in enumerate(LAWS.items(), 1):
    if url is None:
        no_url.append(law_id)
        print(f"[{i:3d}/{total}] {law_id}: NO URL (skipping)")
        continue

    print(f"[{i:3d}/{total}] {law_id}: fetching {url[:70]}...", end=' ', flush=True)
    success, result, used_url = process_law(law_id, url)

    if success is None:
        no_url.append(law_id)
        print("NO URL")
    elif success:
        fixed[law_id] = (result, used_url)
        print(f"OK ({result:,} chars)")
    else:
        failed[law_id] = (result, used_url)
        print(f"FAILED: {result}")

    # Small delay to be polite
    time.sleep(0.5)

print()
print("=" * 70)
print("Processing local PDFs...")
print("=" * 70)

local_fixed = {}
local_failed = {}
local_skipped = {}

for filename, law_id in LOCAL_PDFS.items():
    print(f"\n  {filename} -> {law_id}: ", end='', flush=True)
    if law_id is None:
        local_skipped[filename] = 'no law ID mapping'
        print("SKIP (no mapping)")
        continue

    success, result = process_local_pdf(filename, law_id)
    if success is True:
        local_fixed[law_id] = (result, filename)
        print(f"OK ({result:,} chars)")
    elif success is False:
        local_failed[filename] = result
        print(f"FAILED: {result}")
    else:
        local_skipped[filename] = result
        print(f"SKIP: {result}")

# ============================================================
# SUMMARY TABLE
# ============================================================
print()
print("=" * 70)
print(f"SUMMARY")
print("=" * 70)
print()

all_fixed_count = len(fixed) + len(local_fixed)
all_failed_count = len(failed) + len(local_failed)

print(f"FIXED ({len(fixed)} laws from URLs + {len(local_fixed)} from local PDFs = {all_fixed_count} total):")
for law_id, (chars, url) in sorted(fixed.items()):
    print(f"  {law_id}: {chars:,} chars from {url}")
for law_id, (chars, filename) in sorted(local_fixed.items()):
    print(f"  {law_id}: {chars:,} chars from local PDF {filename}")

print()
print(f"FAILED ({len(failed)} laws from URLs + {len(local_failed)} local PDFs = {all_failed_count} total):")
for law_id, (reason, url) in sorted(failed.items()):
    print(f"  {law_id}: {reason}")
for filename, reason in sorted(local_failed.items()):
    print(f"  [local] {filename}: {reason}")

print()
print(f"NO URL ({len(no_url)} laws): {', '.join(no_url)}")

if local_skipped:
    print()
    print(f"LOCAL PDFs SKIPPED ({len(local_skipped)}):")
    for filename, reason in local_skipped.items():
        print(f"  {filename}: {reason}")

print()
print(f"Total: {all_fixed_count} fixed, {all_failed_count} failed, {len(no_url)} no-URL")
