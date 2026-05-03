#!/usr/bin/env python3
"""
Final targeted fetches for remaining hard cases, plus cleanup of bad saves.
"""
import urllib.request
import urllib.error
import ssl
import re
import json
import io
import time
from pathlib import Path

PROJECT = Path('/Users/art/Desktop/claude-projects/ai-regulation-db')
TODAY = '2026-05-02'
TEXTS_DIR = PROJECT / 'data' / 'texts'
REGS_JSON = PROJECT / 'data' / 'regulations.json'

import pdfplumber

def fetch_url(url, timeout=40, verify_ssl=True):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    req = urllib.request.Request(url, headers=headers)
    if not verify_ssl:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            ct = resp.headers.get('Content-Type', '')
            fu = resp.geturl()
            data = resp.read()
    else:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            ct = resp.headers.get('Content-Type', '')
            fu = resp.geturl()
            data = resp.read()
    return data, ct, fu

def extract_pdf_text(data):
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        pages = []
        total = len(pdf.pages)
        for page in pdf.pages[:100]:
            try:
                t = page.extract_text()
                if t:
                    pages.append(t)
            except Exception:
                pass
        return '\n\n'.join(pages), total

def clean_html(html_bytes):
    try:
        text = html_bytes.decode('utf-8', errors='replace')
    except Exception:
        text = str(html_bytes)
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<nav[^>]*>.*?</nav>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<header[^>]*>.*?</header>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<footer[^>]*>.*?</footer>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<(?:br|p|div|h[1-6]|li|tr|blockquote)[^>]*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    for ent, rep in [('&nbsp;', ' '), ('&amp;', '&'), ('&lt;', '<'), ('&gt;', '>'),
                     ('&quot;', '"'), ('&#39;', "'"), ('&mdash;', '—'), ('&ndash;', '–'),
                     ('&hellip;', '...'), ('&rsquo;', "'"), ('&lsquo;', "'"),
                     ('&rdquo;', '"'), ('&ldquo;', '"'), ('&#160;', ' '),
                     ('&sect;', '§'), ('&para;', '¶')]:
        text = text.replace(ent, rep)
    text = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))) if int(m.group(1)) < 65536 else ' ', text)
    text = re.sub(r'&[a-zA-Z]+;', ' ', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def save_text(law_id, text, source_url, content_type_label='html'):
    text_truncated = text[:60000]
    out = f'---\nid: {law_id}\nsource_url: {source_url}\nfetched_date: {TODAY}\ncontent_type: {content_type_label}\n---\n\n{text_truncated}'
    path = TEXTS_DIR / f'{law_id}.md'
    path.write_text(out, encoding='utf-8')
    return len(text)

def update_regulations_json(law_id, url):
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

def attempt(law_id, url, verify_ssl=True, timeout=40, min_chars=1000):
    try:
        data, ct, fu = fetch_url(url, timeout=timeout, verify_ssl=verify_ssl)
        is_pdf = 'pdf' in ct.lower() or url.lower().endswith('.pdf') or fu.lower().endswith('.pdf')
        if is_pdf:
            text, pages = extract_pdf_text(data)
            label = f'pdf ({pages} pages)'
        else:
            text = clean_html(data)
            label = 'html'
        if len(text) < min_chars:
            return False, f'too short ({len(text)} chars)'
        lower = text.lower()
        if any(x in lower for x in ['page not found', 'access denied', 'enable javascript',
                                      'just a moment', 'cloudflare ray id']):
            if len(text) < 3000:
                return False, 'error/blocked page'
        chars = save_text(law_id, text, url, label)
        update_regulations_json(law_id, url)
        return True, chars
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code}'
    except urllib.error.URLError as e:
        return False, f'URLError: {e.reason}'
    except Exception as e:
        return False, f'{type(e).__name__}: {str(e)[:80]}'

fixed = {}
failed = {}

def try_law(law_id, attempts):
    for url, kwargs in attempts:
        print(f"    {url[:70]}...", end=' ', flush=True)
        ok, result = attempt(law_id, url, **kwargs)
        if ok:
            fixed[law_id] = (result, url)
            print(f"OK ({result:,} chars)")
            return True
        else:
            print(f"FAIL: {result}")
    failed[law_id] = result
    return False

print("=" * 70)
print("Final targeted fetch pass")
print("=" * 70)

# ---- Clean up bad saves from previous passes ----
BAD_SAVES = ['eg-eg-pdpl-2020', 'kr-kr-pipa-2023']
for law_id in BAD_SAVES:
    f = TEXTS_DIR / f'{law_id}.md'
    if f.exists():
        content = f.read_text()
        if len(content) < 2000 or 'تجاوز' in content or 'GOVERNMENT-FUNDED RESEARCH' in content:
            print(f"Removing bad save: {law_id}")
            f.unlink()

# ---- Egypt PDPL ----
print("\neg-eg-pdpl-2020 (Egypt Personal Data Protection Law 2020)")
try_law('eg-eg-pdpl-2020', [
    # Try Wayback Machine for the MCIT PDF
    ('https://web.archive.org/web/2024/https://mcit.gov.eg/Upcont/Documents/Publications_1682020000000_ProtectionofPersonalData.pdf', {}),
    ('https://www.ictregulationtoolkit.org/en/Document.aspx?id=3616', {'min_chars': 500}),
])

# ---- Australia AI Safety Standard ----
print("\nau-au-aisafetystd-2024 (Australia AI Safety Standard)")
try_law('au-au-aisafetystd-2024', [
    ('https://www.industry.gov.au/sites/default/files/2024-09/australias-ai-safety-standard.pdf', {'timeout': 60}),
    ('https://aistandard.gov.au/', {'timeout': 30}),
    # The industry.gov.au URL format changed - try variants
    ('https://www.industry.gov.au/sites/default/files/2024-10/australias-ai-safety-standard.pdf', {'timeout': 60}),
])

# ---- Korea PIPA ----
print("\nkr-kr-pipa-2023 (Korea Personal Information Protection Act)")
try_law('kr-kr-pipa-2023', [
    # Try KLRI with correct law number for PIPA
    ('https://elaw.klri.re.kr/eng_service/lawView.do?hseq=62419&lang=ENG', {}),  # PIPA 2023 amendment
    ('https://elaw.klri.re.kr/eng_service/lawView.do?hseq=59529&lang=ENG', {}),  # PIPA 2020
    ('https://elaw.klri.re.kr/eng_service/lawView.do?hseq=55371&lang=ENG', {}),  # PIPA older
    ('https://www.pipc.go.kr/eng/main/contents.do?menuNo=10010100', {'min_chars': 500}),
])

# ---- G7 Hiroshima AI Process ----
print("\ng7-g7-hiroshimaprocess-2023 (G7 Hiroshima Process AI Principles)")
try_law('g7-g7-hiroshimaprocess-2023', [
    ('https://www.mofa.go.jp/files/100573473.pdf', {'timeout': 60}),
    ('https://www.meti.go.jp/press/2023/10/20231030002/20231030002-1.pdf', {'timeout': 60}),
    # EC page had content but was thin - try wayback
    ('https://web.archive.org/web/2024/https://digital-strategy.ec.europa.eu/en/library/hiroshima-process-international-guiding-principles-advanced-ai-system', {}),
])

# ---- UN AI Resolution ----
print("\nun-un-airesolution-2024 (UN Resolution A/RES/78/311 on AI)")
try_law('un-un-airesolution-2024', [
    ('https://documents.un.org/prod/ods.nsf/xpdf.xsp?doc=A/RES/78/311&lang=E', {'timeout': 60}),
    ('https://documents-dds-ny.un.org/doc/UNDOC/GEN/N24/065/92/PDF/N2406592.pdf', {'timeout': 60}),
    ('https://daccess-ods.un.org/access.nsf/Get?OpenAgent&DS=A/RES/78/311&Lang=E', {'timeout': 60}),
])

# ---- Hawaii SB 2687 ----
print("\nus-hi-sb2687-2024 (Hawaii SB 2687)")
try_law('us-hi-sb2687-2024', [
    # Try different URL patterns for Hawaii legislature
    ('https://www.capitol.hawaii.gov/session2024/bills/SB2687_CD1_.HTM', {'min_chars': 500}),
    ('https://capitol.hawaii.gov/sessions/session2024/bills/SB2687_.HTM', {'min_chars': 500}),
    ('https://capitol.hawaii.gov/sessions/session2024/bills/SB2687_SD2_.HTM', {'min_chars': 500}),
])

# ---- New York SB 8391 ----
print("\nus-ny-sb8391-2025 (New York SB 8391)")
try_law('us-ny-sb8391-2025', [
    ('https://legislation.nysenate.gov/pdf/bills/2025/S8391', {'timeout': 60}),
    ('https://nyassembly.gov/leg/?default_fld=&leg_video=&bn=S8391&term=2025&Summary=Y&Text=Y', {'timeout': 30, 'min_chars': 500}),
])

# ---- New York SB 8420A ----
print("\nus-ny-sb8420a-2025 (New York SB 8420A)")
try_law('us-ny-sb8420a-2025', [
    ('https://legislation.nysenate.gov/pdf/bills/2025/S8420A', {'timeout': 60}),
])

# ---- Ohio HB 96 ----
print("\nus-oh-hb96ai-2025 (Ohio HB 96)")
try_law('us-oh-hb96ai-2025', [
    ('https://www.legislature.ohio.gov/legislation/135/hb96', {'timeout': 60}),
    # Try the API with different format
    ('https://search.legislature.ohio.gov/api/docs/Legislation/document?legislationId=HB+96&legislationTypeId=1&sessionId=135&apiKey=4rS5THTB0fmqKGMTRLZN_g', {'timeout': 60, 'min_chars': 200}),
])

# ---- South Dakota SB 41 ----
print("\nus-sd-sb41-2026 (South Dakota SB 41 2026)")
try_law('us-sd-sb41-2026', [
    ('https://mylrc.sdlegislature.gov/api/Documents/Bill/25088.pdf', {'timeout': 60}),
    ('https://sdlegislature.gov/Session/Bill/26041', {'min_chars': 300}),
])

# ---- Utah SB 332 ----
print("\nus-ut-sb332-2025 (Utah SB 332)")
try_law('us-ut-sb332-2025', [
    # Utah bills - try direct PDF
    ('https://le.utah.gov/~2025/bills/static/SB0332.pdf', {'timeout': 40, 'min_chars': 500}),
    ('https://le.utah.gov/~2025/bills/static/SB0332.html', {'timeout': 40, 'min_chars': 300}),
    # Wayback machine
    ('https://web.archive.org/web/2025/https://le.utah.gov/~2025/bills/static/SB0332.html', {'min_chars': 300}),
])

# ---- Virginia SB 1090 ----
print("\nus-va-sb1090-2025 (Virginia SB 1090)")
try_law('us-va-sb1090-2025', [
    # Try different Virginia legislature URL patterns
    ('https://lis.virginia.gov/cgi-bin/legp604.exe?251+ful+SB1090+pdf', {'timeout': 40, 'min_chars': 300}),
    ('https://lis.virginia.gov/25rs/bills/SB1090.pdf', {'timeout': 40, 'min_chars': 300}),
    ('https://law.lis.virginia.gov/admincode/', {'min_chars': 500}),
])

# ---- ADGM DPR 2021 ----
print("\nae-adgm-dpr-2021 (ADGM Data Protection Regulations 2021)")
try_law('ae-adgm-dpr-2021', [
    # Try Wayback Machine
    ('https://web.archive.org/web/2024/https://en.adgm.thomsonreuters.com/rulebooks/adgm-data-protection-regulations-2021', {'min_chars': 500}),
    # Try alternate adgm.com URLs
    ('https://www.adgm.com/regulations/legal-framework', {'min_chars': 500}),
])

# ---- UAE PDPL ----
print("\nae-ae-pdpl-2021 (UAE Personal Data Protection Law)")
try_law('ae-ae-pdpl-2021', [
    ('https://tdra.gov.ae/en/aio/personal-data-protection-law', {'timeout': 60}),
    ('https://www.lexarabia.com/en/uae/federal-decree-law-45-2021/', {'min_chars': 500}),
])

# ---- APEC CBPR ----
print("\napec-apec-cbpr-2011 (APEC Cross-Border Privacy Rules)")
try_law('apec-apec-cbpr-2011', [
    ('https://www.apec.org/docs/default-source/Publications/2011/10/APEC-Cross-Border-Privacy-Rules-System/10_ec_crossborderprivacy.pdf', {'timeout': 60}),
    ('https://cbprs.org/', {'min_chars': 500}),
])

# ---- Bahrain PDPL ----
print("\nbh-bh-pdpl-2018 (Bahrain Personal Data Protection Law)")
try_law('bh-bh-pdpl-2018', [
    ('https://www.moict.gov.bh/en/Tiles/CyberSecurity/PersonalDataProtection', {'min_chars': 500}),
    ('https://www.legalopinion.bh/laws/pdpl/', {'min_chars': 500}),
])

# ---- Brunei PDPO ----
print("\nbn-bn-pdpo-2021 (Brunei Personal Data Protection Order)")
try_law('bn-bn-pdpo-2021', [
    ('https://www.agc.gov.bn/AGC%20Images/LAWS/Gazette_PDF/2021/EN/s071.pdf', {'timeout': 60}),
])

# ---- Japan AI Promotion ----
print("\njp-jp-aiprom-2025 (Japan AI Promotion Act)")
try_law('jp-jp-aiprom-2025', [
    ('https://www.meti.go.jp/policy/it_policy/ai/ai_promotion_law.html', {'timeout': 60}),
    ('https://www.japaneselawtranslation.go.jp/en/laws/view/4501', {'timeout': 40}),
    ('https://www.japaneselawtranslation.go.jp/en/laws/view/4500', {'timeout': 40}),
])

# ---- Japan METI AI Guidelines ----
print("\njp-jp-meti-aiguidelines-2024 (Japan METI AI Guidelines)")
try_law('jp-jp-meti-aiguidelines-2024', [
    ('https://www.meti.go.jp/press/2024/04/20240419004/20240419004.html', {'timeout': 60}),
    ('https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/20240419_report.html', {'timeout': 60}),
])

# ---- Paris AI Action 2025 ----
print("\nint-paris-aiaction-2025 (Paris AI Action Summit 2025)")
try_law('int-paris-aiaction-2025', [
    ('https://www.elysee.fr/admin/upload/default/0001/16/summitcommunique_en.pdf', {'timeout': 60}),
    ('https://www.diplomatie.gouv.fr/en/french-foreign-policy/digital-diplomacy/artificial-intelligence/', {'min_chars': 500}),
    # Try archived version
    ('https://web.archive.org/web/20250212/https://www.elysee.fr/en/emmanuel-macron/2025/02/11/ai-action-summit-communique', {'min_chars': 500}),
])

# ---- Seoul AI Safety ----
print("\nint-seoul-aisafety-2024 (Seoul AI Safety Statement)")
try_law('int-seoul-aisafety-2024', [
    ('https://www.gov.uk/government/publications/seoul-ministerial-statement-for-advancing-ai-safety-international-collaboration-and-action', {'min_chars': 500}),
    # Try Wayback Machine
    ('https://web.archive.org/web/2024/https://www.gov.uk/government/publications/seoul-ministerial-statement-for-advancing-ai-safety-international-collaboration-and-action/seoul-ministerial-statement-for-advancing-ai-safety-international-collaboration-and-action', {}),
])

# ---- Jordan PDPL ----
print("\njo-jo-pdpl-2023 (Jordan Personal Data Protection Law)")
try_law('jo-jo-pdpl-2023', [
    ('https://www.ipr.gov.jo/EchoBusV3.0/SystemAssets/PDFs/AR/Data%20Protection%20Law%20EN.pdf', {'timeout': 60}),
])

# ---- Oman PDPL ----
print("\nom-om-pdpl-2022 (Oman Personal Data Protection Law)")
try_law('om-om-pdpl-2022', [
    ('https://www.scp.gov.om/pages/legaldocs.aspx', {'min_chars': 400, 'verify_ssl': False}),
    ('https://moci.gov.om/en/laws/', {'min_chars': 400}),
])

# ---- Russia AI Law ----
print("\nru-ru-ailaw169-2025 (Russia Federal Law on AI)")
try_law('ru-ru-ailaw169-2025', [
    ('https://sozd.duma.gov.ru/bill/623906-8', {'timeout': 60}),
    ('https://base.garant.ru/70271830/', {'timeout': 40, 'min_chars': 500}),
])

# ---- Singapore EIOA ----
print("\nsg-sg-eioa-2024 (Singapore Elections (Integrity of Online Communication) Act)")
try_law('sg-sg-eioa-2024', [
    ('https://sso.agc.gov.sg/Acts-Supp/34-2024/Published/20241022?WholeDoc=1', {'min_chars': 500}),
])

# ---- Turkey AI Bill ----
print("\ntr-tr-aibill-2025 (Turkey AI Bill)")
try_law('tr-tr-aibill-2025', [
    ('https://www.tbmm.gov.tr/develop/owa/tasari_teklif_gd.onerge_bilgileri?kanunlar_sira_no=301', {'min_chars': 500}),
])

print()
print("=" * 70)
print("FINAL PASS SUMMARY")
print("=" * 70)

print(f"\nFIXED ({len(fixed)}):")
for law_id, (chars, url) in sorted(fixed.items()):
    print(f"  {law_id}: {chars:,} chars from {url}")

print(f"\nSTILL FAILED ({len(failed)}):")
for law_id, reason in sorted(failed.items()):
    print(f"  {law_id}: {reason}")

print(f"\nTotal: {len(fixed)} fixed, {len(failed)} still failed")
