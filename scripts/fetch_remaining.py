#!/usr/bin/env python3
"""
Final targeted retry for remaining failed laws.
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

def fetch_url(url, timeout=40, verify_ssl=True, extra_headers=None):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, headers=headers)
    if not verify_ssl:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            content_type = resp.headers.get('Content-Type', '')
            final_url = resp.geturl()
            data = resp.read()
    else:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content_type = resp.headers.get('Content-Type', '')
            final_url = resp.geturl()
            data = resp.read()
    return data, content_type, final_url

def extract_pdf_text(data):
    with pdfplumber.open(io.BytesIO(data)) as pdf:
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

def is_real_content(text, min_chars=800):
    if len(text) < min_chars:
        return False, f"too short ({len(text)} chars)"
    lower = text.lower()
    if any(x in lower for x in ['404 not found', 'page not found', 'access denied',
                                  'enable javascript', 'just a moment', 'cloudflare ray id']):
        if len(text) < 3000:
            return False, "error/blocked page"
    return True, "ok"

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

def process(law_id, url, verify_ssl=True, min_chars=800, extra_headers=None, timeout=40):
    """Try fetching a single URL. Returns (success, result, url)."""
    try:
        data, content_type, final_url = fetch_url(url, timeout=timeout, verify_ssl=verify_ssl, extra_headers=extra_headers)
        is_pdf = ('pdf' in content_type.lower() or
                  url.lower().endswith('.pdf') or
                  final_url.lower().endswith('.pdf'))
        if is_pdf:
            text, num_pages = extract_pdf_text(data)
            label = f'pdf ({num_pages} pages)'
        else:
            text = clean_html(data)
            label = 'html'
        ok, reason = is_real_content(text, min_chars=min_chars)
        if not ok:
            return False, reason
        chars = save_text(law_id, text, url, label)
        update_regulations_json(law_id, url)
        return True, chars
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code}: {e.reason}'
    except urllib.error.URLError as e:
        return False, f'URLError: {e.reason}'
    except Exception as e:
        return False, f'{type(e).__name__}: {str(e)[:100]}'

fixed = {}
failed = {}

def try_law(law_id, attempts):
    """
    attempts: list of (url, kwargs) tuples
    Returns True if any succeeds.
    """
    for url, kwargs in attempts:
        print(f"    Trying: {url[:70]}...", end=' ', flush=True)
        ok, result = process(law_id, url, **kwargs)
        if ok:
            fixed[law_id] = (result, url)
            print(f"OK ({result:,} chars)")
            return True
        else:
            print(f"FAILED: {result}")
    failed[law_id] = result
    return False

print("=" * 70)
print("Targeted Retry of Remaining Failed Laws")
print("=" * 70)

# --- ADGM DPR 2021 ---
print("\n[1] ae-adgm-dpr-2021 (ADGM Data Protection Regulations 2021)")
try_law('ae-adgm-dpr-2021', [
    ('https://www.adgm.com/media/2mxhntng/adgm-data-protection-regulations-2021.pdf', {}),
    ('https://adgm.com/setting-up-in-adgm/legal-framework/regulations', {}),
    ('https://www.adgm.com/setting-up-in-adgm/legal-framework', {}),
])

# --- UAE Federal PDPL ---
print("\n[2] ae-ae-pdpl-2021 (UAE Personal Data Protection Law)")
try_law('ae-ae-pdpl-2021', [
    ('https://tdra.gov.ae/en/aio/personal-data-protection-law', {'timeout': 40}),
    ('https://u.ae/en/information-and-services/justice-security-and-the-law/cyber-security-and-information-technology/personal-data-protection-law', {'timeout': 40}),
    ('https://privacylaw.ae/', {'timeout': 30}),
])

# --- APEC CBPR ---
print("\n[3] apec-apec-cbpr-2011 (APEC Cross-Border Privacy Rules)")
try_law('apec-apec-cbpr-2011', [
    ('https://www.apec.org/publications/2011/10/apec-cross-border-privacy-rules-system', {}),
    ('https://cbprs.org/cross-border-privacy-rules/', {}),
    ('https://www.apec.org/groups/committee-on-trade-and-investment/-/media/files/groups/desg/cbprs/cbprs-policies-and-guidelines-cross-border-privacy-rules-system.pdf', {}),
])

# --- Australia AI Safety Standard ---
print("\n[4] au-au-aisafetystd-2024 (Australia AI Safety Standard)")
try_law('au-au-aisafetystd-2024', [
    ('https://www.industry.gov.au/sites/default/files/2024-09/australias-ai-safety-standard.pdf', {}),
    ('https://www.industry.gov.au/sites/default/files/2024-09/ai-safety-standard.pdf', {}),
    ('https://www.industry.gov.au/publications/australias-ai-safety-standard', {}),
    ('https://www.industry.gov.au/sites/default/files/2024/09/australias-ai-safety-standard.pdf', {}),
])

# --- Bahrain PDPL ---
print("\n[5] bh-bh-pdpl-2018 (Bahrain Personal Data Protection Law)")
try_law('bh-bh-pdpl-2018', [
    ('https://www.moic.gov.bh/en/Tiles/CyberSecurity/PersonalDataProtection', {}),
    ('https://www.legalopinion.bh/laws/pdpl/', {}),
])

# --- Brunei PDPO ---
print("\n[6] bn-bn-pdpo-2021 (Brunei Personal Data Protection Order)")
try_law('bn-bn-pdpo-2021', [
    ('https://www.agc.gov.bn/AGC%20Images/LAWS/Gazette_PDF/2021/EN/s071.pdf', {}),
    ('https://www.aiti.gov.bn/SitePages/PDPO.aspx', {}),
])

# --- Egypt PDPL ---
print("\n[7] eg-eg-pdpl-2020 (Egypt Personal Data Protection Law)")
try_law('eg-eg-pdpl-2020', [
    ('https://www.mcit.gov.eg/Upcont/Documents/Publications_1682020000000_ProtectionofPersonalData.pdf', {}),
    ('https://manshurat.org/node/14662', {}),
    ('https://www.egyptianlaw.net/personal-data-protection-law', {}),
])

# --- Paris AI Action Summit ---
print("\n[8] int-paris-aiaction-2025 (Paris AI Action Summit Communique)")
try_law('int-paris-aiaction-2025', [
    ('https://www.gouvernement.fr/en/the-paris-ai-action-summit', {}),
    ('https://ia-action-summit.fr/communique/', {}),
    ('https://www.elysee.fr/en/emmanuel-macron/2025/02/11/ai-action-summit-communique', {}),
])

# --- Seoul AI Safety ---
print("\n[9] int-seoul-aisafety-2024 (Seoul AI Safety Statement)")
try_law('int-seoul-aisafety-2024', [
    ('https://www.gov.uk/government/publications/seoul-declaration-on-ai/seoul-declaration-on-ai', {}),
    ('https://www.gov.uk/government/publications/seoul-ai-safety-summit-2024', {}),
    ('https://www.gov.uk/government/publications/seoul-ai-summit-communique', {}),
])

# --- Jordan PDPL ---
print("\n[10] jo-jo-pdpl-2023 (Jordan Personal Data Protection Law)")
try_law('jo-jo-pdpl-2023', [
    ('https://www.ipr.gov.jo/EchoBusV3.0/SystemAssets/PDFs/AR/Data%20Protection%20Law%20EN.pdf', {}),
    ('https://www.legislation.jo/en', {}),
])

# --- Japan AI Promotion ---
print("\n[11] jp-jp-aiprom-2025 (Japan AI Promotion Act)")
try_law('jp-jp-aiprom-2025', [
    ('https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/8c0a21fb-e040-4e6e-8e50-b8aeb63c48f5/af3b7f5b/20250219_meeting_ai-promotion_law_overview_01.pdf', {}),
    ('https://www.cao.go.jp/aistrategic/pdf/ai_promotion_law_outline.pdf', {}),
    ('https://www.meti.go.jp/policy/it_policy/ai/ai_promotion_law.html', {}),
])

# --- Japan APPI ---
print("\n[12] jp-jp-appi-2022 (Japan Act on Protection of Personal Information)")
try_law('jp-jp-appi-2022', [
    ('https://www.ppc.go.jp/files/pdf/Act_for_the_Protection_of_Personal_Information.pdf', {}),
    ('https://elaw.klri.re.kr/eng_service/lawView.do?hseq=58799&lang=ENG', {}),
    ('https://www.japaneselawtranslation.go.jp/en/laws/view/4241', {}),
])

# --- Japan METI AI Guidelines ---
print("\n[13] jp-jp-meti-aiguidelines-2024 (Japan METI AI Guidelines)")
try_law('jp-jp-meti-aiguidelines-2024', [
    ('https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20240419_1.pdf', {}),
    ('https://www.meti.go.jp/press/2024/04/20240419004/20240419004-1.pdf', {'timeout': 60}),
    ('https://www.meti.go.jp/press/2024/04/20240419004/20240419004.html', {}),
])

# --- Oman PDPL ---
print("\n[14] om-om-pdpl-2022 (Oman Personal Data Protection Law)")
try_law('om-om-pdpl-2022', [
    ('https://ita.gov.om/itaPortal/Pages/LegalAffairs.aspx', {'verify_ssl': False}),
    ('https://www.rop.gov.om/english/legal-affairs', {}),
])

# --- Russia AI Law ---
print("\n[15] ru-ru-ailaw169-2025 (Russia AI Federal Law)")
try_law('ru-ru-ailaw169-2025', [
    ('https://rg.ru/documents/2025/01/04/fz-169.html', {}),
    ('https://publication.pravo.gov.ru/document/0001202501040001', {}),
    ('https://sozd.duma.gov.ru/bill/623906-8', {}),
])

# --- Singapore EIOA ---
print("\n[16] sg-sg-eioa-2024 (Singapore Elections (Integrity of Online Communication) Act)")
try_law('sg-sg-eioa-2024', [
    ('https://sso.agc.gov.sg/Acts-Supp/34-2024/Published/20241022?DocDate=20241022&WholeDoc=1', {}),
    ('https://www.mci.gov.sg/-/media/MCI/MCIWebsite/Documents/ELECTIONS-INTEGRITY-ONLINE-AMENDMENT-ACT-2024.pdf', {}),
    ('https://sso.agc.gov.sg/Acts/EIOCA2024', {}),
])

# --- Slovakia AI Conformity ---
print("\n[17] sk-sk-aiconformity-2025 (Slovakia AI Conformity Assessment Law)")
try_law('sk-sk-aiconformity-2025', [
    ('https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2025/318/20250601.html', {}),
    ('https://www.nrsr.sk/web/Default.aspx?sid=zakony/zakon&MasterID=8800', {}),
])

# --- UN AI Resolution ---
print("\n[18] un-un-airesolution-2024 (UN AI Resolution 78/311)")
try_law('un-un-airesolution-2024', [
    ('https://digitallibrary.un.org/record/4043907/files/A_RES_78_311-EN.pdf', {}),
    ('https://undocs.org/A/RES/78/311', {}),
    ('https://www.un.org/en/ga/search/view_doc.asp?symbol=A/RES/78/311', {}),
])

# --- US Hawaii SB 2687 ---
print("\n[19] us-hi-sb2687-2024 (Hawaii SB 2687)")
try_law('us-hi-sb2687-2024', [
    ('https://capitol.hawaii.gov/sessions/session2024/bills/SB2687_CD1_.HTM', {}),
    ('https://www.capitol.hawaii.gov/sessions/session2024/bills/SB2687_CD1_.HTM', {}),
    ('https://capitol.hawaii.gov/session2024/bills/SB2687_CD1_.HTM', {}),
])

# --- US New York SB 8391 ---
print("\n[20] us-ny-sb8391-2025 (New York SB 8391)")
try_law('us-ny-sb8391-2025', [
    ('https://legislation.nysenate.gov/pdf/bills/2025/S8391', {}),
    ('https://www.nysenate.gov/sites/default/files/bills/2025/S8391.pdf', {}),
    ('https://nyassembly.gov/leg/?bn=S8391&term=2025', {}),
])

# --- US New York SB 8420A ---
print("\n[21] us-ny-sb8420a-2025 (New York SB 8420A)")
try_law('us-ny-sb8420a-2025', [
    ('https://legislation.nysenate.gov/pdf/bills/2025/S8420A', {'timeout': 50}),
    ('https://www.nysenate.gov/legislation/bills/2025/S8420/amendment/A', {'timeout': 50}),
])

# --- US Ohio HB 96 ---
print("\n[22] us-oh-hb96ai-2025 (Ohio HB 96)")
try_law('us-oh-hb96ai-2025', [
    ('https://www.legislature.ohio.gov/legislation/135/hb96', {'timeout': 50}),
    ('https://codes.ohio.gov/assets/laws/bills/135/hb96/en/hb96_en.pdf', {'timeout': 50}),
])

# --- US South Dakota SB 41 ---
print("\n[23] us-sd-sb41-2026 (South Dakota SB 41)")
try_law('us-sd-sb41-2026', [
    ('https://mylrc.sdlegislature.gov/api/Documents/Bill/25088.pdf', {}),
    ('https://sdlegislature.gov/api/Documents/Bill/25088/DocumentType/2/DocumentStatus/1', {}),
    ('https://sdlegislature.gov/Session/Bill/26041/Bill', {}),
])

# --- US Utah SB 332 ---
print("\n[24] us-ut-sb332-2025 (Utah SB 332)")
try_law('us-ut-sb332-2025', [
    ('https://le.utah.gov/~2025/bills/static/SB0332.html', {}),
    ('https://le.utah.gov/xmbl/f?p=100:2:0::::P2_SID,P2_SVID:2025,1', {}),
    ('https://le.utah.gov/~2025/bills/static/SB0332.pdf', {}),
])

# --- US Virginia SB 1090 ---
print("\n[25] us-va-sb1090-2025 (Virginia SB 1090)")
try_law('us-va-sb1090-2025', [
    ('https://lis.virginia.gov/cgi-bin/legp604.exe?251+ful+SB1090', {}),
    ('https://lis.virginia.gov/cgi-bin/legp604.exe?251+ful+SB1090+pdf', {}),
    ('https://law.lis.virginia.gov/chapterscodeofvirginia/', {}),
])

# Special cases not in original list but worth trying
print("\n[26] kr-kr-pipa-2023 (Korea PIPA) - re-checking content")
# Check if what we saved was good enough
existing = (TEXTS_DIR / 'kr-kr-pipa-2023.md').read_text(errors='replace')
if len(existing) > 2000:
    print("    Already saved with good content")
    fixed['kr-kr-pipa-2023'] = (len(existing), 'already saved')
else:
    try_law('kr-kr-pipa-2023', [
        ('https://elaw.klri.re.kr/eng_service/lawView.do?hseq=61939&lang=ENG', {}),
        ('https://www.pipc.go.kr/eng/main/contents.do?menuNo=10010100', {}),
    ])

print("\n[27] lt-lt-aidesignation-2025 - re-checking content")
existing = (TEXTS_DIR / 'lt-lt-aidesignation-2025.md').read_text(errors='replace')
print(f"    Current content: {len(existing)} chars")

print("\n[28] tr-tr-aibill-2025 - re-checking content")
existing = (TEXTS_DIR / 'tr-tr-aibill-2025.md').read_text(errors='replace')
print(f"    Current content: {len(existing)} chars")
# Try to get actual bill PDF in Turkish
try_law('tr-tr-aibill-2025', [
    ('https://www2.tbmm.gov.tr/d28/1/1-0578.pdf', {}),
    ('https://www2.tbmm.gov.tr/d28/2/2-3358.pdf', {'timeout': 40}),
])

print("\n[29] g7-g7-hiroshimaprocess-2023 - re-checking content")
existing = (TEXTS_DIR / 'g7-g7-hiroshimaprocess-2023.md').read_text(errors='replace')
print(f"    Current content: {len(existing)} chars")
if len(existing) < 5000:
    # Try the actual guiding principles document
    try_law('g7-g7-hiroshimaprocess-2023', [
        ('https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/1e4bd5f0-8af6-4d17-9651-4cae59c8dab5/df6fe8e2/20231030_meeting_ai_government_hiroshima_1.pdf', {}),
        ('https://www.whitehouse.gov/wp-content/uploads/2023/10/G7-Hiroshima-AI-Process-International-Guiding-Principles.pdf', {}),
    ])

print()
print("=" * 70)
print("FINAL SUMMARY")
print("=" * 70)

print(f"\nFIXED ({len(fixed)}):")
for law_id, (chars, url) in sorted(fixed.items()):
    print(f"  {law_id}: {chars:,} chars from {url}")

print(f"\nSTILL FAILED ({len(failed)}):")
for law_id, reason in sorted(failed.items()):
    print(f"  {law_id}: {reason}")

print(f"\nTotal: {len(fixed)} fixed, {len(failed)} still failed")
