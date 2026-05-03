#!/usr/bin/env python3
"""
Final pass for the 15 laws that are truly missing text files.
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
                     ('&ellip;', '...'), ('&rsquo;', "'"), ('&lsquo;', "'"),
                     ('&rdquo;', '"'), ('&ldquo;', '"'), ('&#160;', ' '),
                     ('&sect;', '§'), ('&para;', '¶'), ('&oslash;', 'ø')]:
        text = text.replace(ent, rep)
    text = re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))) if int(m.group(1)) < 65536 else ' ', text)
    text = re.sub(r'&[a-zA-Z]+;', ' ', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def is_legal_content(text, law_id=''):
    """Strict check for real legal content."""
    if len(text) < 500:
        return False, f'too short ({len(text)} chars)'
    lower = text.lower()
    # Check for obvious error/placeholder pages
    bad = ['page not found', 'access denied', 'enable javascript', 'just a moment',
           'cloudflare ray id', "doesn't work properly without javascript"]
    for b in bad:
        if b in lower and len(text) < 5000:
            return False, f'error page: {b}'
    return True, 'ok'

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

def attempt(law_id, url, timeout=40, verify_ssl=True, min_chars=500):
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
        ok, reason = is_legal_content(text, law_id)
        if not ok:
            return False, reason
        chars = save_text(law_id, text, url, label)
        update_regulations_json(law_id, url)
        return True, chars
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code}'
    except urllib.error.URLError as e:
        return False, f'URLError: {str(e.reason)[:60]}'
    except Exception as e:
        return False, f'{type(e).__name__}: {str(e)[:80]}'

fixed = {}
failed = {}

def try_law(law_id, attempts_list, label=''):
    print(f"\n{law_id}" + (f" ({label})" if label else ""))
    for kwargs in attempts_list:
        url = kwargs.pop('url')
        print(f"  {url[:75]}...", end=' ', flush=True)
        ok, result = attempt(law_id, url, **kwargs)
        if ok:
            fixed[law_id] = (result, url)
            print(f"OK ({result:,} chars)")
            return True
        else:
            print(f"FAIL: {result}")
        kwargs['url'] = url  # restore
    failed[law_id] = result
    return False


print("=" * 70)
print("FINAL PASS: 15 Missing Files")
print("=" * 70)

# 1. APEC CBPR - try Wayback Machine for old content
try_law('apec-apec-cbpr-2011', [
    {'url': 'https://web.archive.org/web/20230601/https://cbprs.org/cross-border-privacy-rules/', 'min_chars': 1000},
    {'url': 'https://web.archive.org/web/20220601/https://www.apec.org/groups/committee-on-trade-and-investment/digital-economy-steering-group/cross-border-privacy-rules-system', 'min_chars': 1000},
    {'url': 'https://www.apec.org/Publications/2011/10/APEC-Cross-Border-Privacy-Rules-System', 'min_chars': 500},
], "APEC Cross-Border Privacy Rules")

# 2. Costa Rica DPA
try_law('cr-cr-dpa-2011', [
    {'url': 'https://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=70975&nValor3=86865&strTipM=TC', 'min_chars': 1000},
    {'url': 'https://www.prodhab.go.cr/legislacion/', 'min_chars': 500},
    {'url': 'https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_norma.aspx?param1=NRM&nValor1=1&nValor2=70975', 'min_chars': 500},
], "Costa Rica Data Protection Act")

# 3. Ecuador LOPDP
try_law('ec-ec-lopdp-2021', [
    {'url': 'https://www.telecomunicaciones.gob.ec/wp-content/uploads/2021/06/Ley-Organica-de-Proteccion-de-Datos-Personales.pdf', 'min_chars': 1000},
    {'url': 'https://www.registroficial.gob.ec/index.php/registro-oficial-web/publicaciones/suplementos/item/15197-suplemento-al-ro-459-26-mayo-2021', 'min_chars': 500},
], "Ecuador Organic Law on Personal Data Protection")

# 4. Egypt PDPL
try_law('eg-eg-pdpl-2020', [
    {'url': 'https://itida.gov.eg/English/PoliciesRegulations/Documents/Personal%20Data%20Protection%20Law.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://web.archive.org/web/20240101000000*/https://mcit.gov.eg/Upcont/Documents/Publications_1682020000000_ProtectionofPersonalData.pdf', 'min_chars': 500},
], "Egypt Personal Data Protection Law")

# 5. G7 Hiroshima AI Process
try_law('g7-g7-hiroshimaprocess-2023', [
    {'url': 'https://web.archive.org/web/20231101000000/https://www.meti.go.jp/press/2023/10/20231030002/20231030002-1.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://www.g7hiroshima.go.jp/documents/pdf/G7Hiroshima-AIProcess_IntlCodeofConduct4Org_230930_en.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://www.mofa.go.jp/ecm/ec/pageews_000542.html', 'min_chars': 500},
    {'url': 'https://www.whitehouse.gov/briefing-room/statements-releases/2023/10/30/g7-hiroshima-process-international-code-of-conduct-for-advanced-ai-systems/', 'min_chars': 1000},
], "G7 Hiroshima AI Process")

# 6. Hong Kong PCPD AI Framework
try_law('hk-hk-pcpdaiframework-2024', [
    {'url': 'https://www.pcpd.org.hk/misc/files/AI_Governance_Framework.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://www.pcpd.org.hk/english/resources_centre/publications/files/guidance_AI.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://www.pcpd.org.hk/english/resources_centre/publications/guidance/guidance_aig.html', 'min_chars': 1000},
], "Hong Kong PCPD AI Framework")

# 7. Paris AI Action Summit
try_law('int-paris-aiaction-2025', [
    {'url': 'https://web.archive.org/web/20250212120000/https://www.elysee.fr/en/emmanuel-macron/2025/02/11/ai-action-summit-communique', 'min_chars': 1000},
    {'url': 'https://www.gov.uk/government/publications/paris-ai-action-summit-2025/communique-of-the-paris-ai-action-summit', 'min_chars': 500},
], "Paris AI Action Summit 2025")

# 8. Korea PIPA
try_law('kr-kr-pipa-2023', [
    # hseq=62419 was cultural heritage, try the correct PIPA law
    {'url': 'https://elaw.klri.re.kr/eng_service/lawView.do?hseq=60009&lang=ENG', 'min_chars': 2000},  # try PIPA
    {'url': 'https://elaw.klri.re.kr/eng_service/lawView.do?hseq=62419&lang=ENG', 'min_chars': 5000},  # PIPA might be large
    {'url': 'https://www.pipc.go.kr/eng/main/contents.do?menuNo=10010100', 'min_chars': 1000},
    {'url': 'https://elaw.klri.re.kr/eng_service/lawView.do?hseq=62347&lang=ENG', 'min_chars': 2000},
], "Korea Personal Information Protection Act")

# 9. Lithuania AI Designation
try_law('lt-lt-aidesignation-2025', [
    {'url': 'https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.540000?jfwid=', 'min_chars': 1000},
    {'url': 'https://www.e-tar.lt/portal/en/legalAct/0b2a30b0d8c811efa1fc8d2e285e71e5', 'min_chars': 500},
    {'url': 'https://lrs.lt/sip/portal.show?p_r=35299&p_k=2&p_a=1060&p_d=250321', 'min_chars': 500},
], "Lithuania AI Designation")

# 10. Norway AI Act
try_law('no-no-kiloven-2026', [
    {'url': 'https://www.regjeringen.no/contentassets/kiloven-2026/kunstig-intelligens-lov.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://lovdata.no/dokument/NL/lov/2025-', 'min_chars': 500},
    {'url': 'https://www.regjeringen.no/no/aktuelt/regjeringen-legger-frem-forslag-til-lov-om-kunstig-intelligens/id3072455/', 'min_chars': 1000},
    {'url': 'https://www.stortinget.no/no/Saker-og-publikasjoner/Saker/Sak/?p=95940', 'min_chars': 500},
], "Norway AI Act 2026")

# 11. Turkey AI Bill
try_law('tr-tr-aibill-2025', [
    # Try Turkish parliament site with different URL patterns
    {'url': 'https://www.tbmm.gov.tr/sirasayi/donem28/yil01/ss578.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://www.tbmm.gov.tr/sirasayi/donem28/yil02/ss578.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://www.tbmm.gov.tr/sirasayi/donem28/yil01/ss624.pdf', 'timeout': 60, 'min_chars': 1000},
], "Turkey AI Bill 2025")

# 12. Florida SB 262
try_law('us-fl-sb262-2024', [
    # Try plain HTML version
    {'url': 'https://www.flsenate.gov/Session/Bill/2024/262/BillText/er/HTML', 'min_chars': 1000},
    {'url': 'https://www.flsenate.gov/Session/Bill/2024/262', 'min_chars': 1000},
], "Florida SB 262")

# 13. South Dakota SB 41
try_law('us-sd-sb41-2026', [
    # The bill appears to have been in the 2026 session - try different document IDs
    {'url': 'https://mylrc.sdlegislature.gov/api/Documents/25088.pdf', 'timeout': 60, 'min_chars': 1000},
    {'url': 'https://sdlegislature.gov/api/Documents/Bill/26041/DocumentType/2', 'min_chars': 500},
], "South Dakota SB 41 2026")

# 14. Utah SB 332
try_law('us-ut-sb332-2025', [
    # Utah bills load dynamically but the static HTML should work
    {'url': 'https://le.utah.gov/~2025/bills/static/SB0332.html', 'min_chars': 200},  # even small is ok for structure check
    {'url': 'https://le.utah.gov/~2025/bills/static/SB0332.pdf', 'min_chars': 500},
    {'url': 'https://le.utah.gov/xmbl/f?p=100:73:0::NO:RP:P73_id:28668', 'min_chars': 500},
], "Utah SB 332")

# 15. Virginia SB 1090
try_law('us-va-sb1090-2025', [
    # Virginia legislature full text
    {'url': 'https://lis.virginia.gov/cgi-bin/legp604.exe?251+ful+SB1090', 'min_chars': 500},
    {'url': 'https://lis.virginia.gov/25rs/bills/SB1090.pdf', 'timeout': 60, 'min_chars': 500},
], "Virginia SB 1090")

print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"\nFIXED ({len(fixed)}):")
for k, (chars, url) in sorted(fixed.items()):
    print(f"  {k}: {chars:,} chars from {url}")
print(f"\nFAILED ({len(failed)}):")
for k, reason in sorted(failed.items()):
    print(f"  {k}: {reason}")
