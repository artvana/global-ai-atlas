#!/usr/bin/env python3
"""
Retry failed laws with alternative URLs and approaches.
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

def fetch_url(url, timeout=30, verify_ssl=True):
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

def is_real_content(text, law_id=''):
    if len(text) < 800:
        return False, f"too short ({len(text)} chars)"
    lower = text.lower()
    if any(x in lower for x in ['404 not found', 'page not found', '403 forbidden',
                                  'access denied', 'enable javascript', 'just a moment',
                                  'cloudflare ray id']):
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

def try_url(url, verify_ssl=True):
    """Try a URL, return (text, label) or raise exception."""
    data, content_type, final_url = fetch_url(url, verify_ssl=verify_ssl)
    is_pdf = ('pdf' in content_type.lower() or
              url.lower().endswith('.pdf') or
              final_url.lower().endswith('.pdf'))
    if is_pdf:
        text, num_pages = extract_pdf_text(data)
        label = f'pdf ({num_pages} pages)'
    else:
        text = clean_html(data)
        label = 'html'
    return text, label

def process_law(law_id, url_list, verify_ssl=True):
    """Try multiple URLs for a law. Returns (success, chars_or_error, url_used)."""
    if isinstance(url_list, str):
        url_list = [url_list]

    last_error = 'no URLs tried'
    for url in url_list:
        try:
            text, label = try_url(url, verify_ssl=verify_ssl)
            ok, reason = is_real_content(text, law_id)
            if not ok:
                last_error = reason
                continue
            chars = save_text(law_id, text, url, label)
            update_regulations_json(law_id, url)
            return True, chars, url
        except urllib.error.HTTPError as e:
            last_error = f'HTTP {e.code}: {e.reason}'
        except urllib.error.URLError as e:
            last_error = f'URLError: {e.reason}'
        except Exception as e:
            last_error = f'{type(e).__name__}: {str(e)[:100]}'

    return False, last_error, url_list[0] if url_list else None


# Alternative URL mappings for failed laws
# Key = law_id, Value = list of URLs to try in order
FALLBACKS = {
    # Australian AI Safety Standard - try direct content URL
    'au-au-aisafetystd-2024': [
        'https://www.industry.gov.au/sites/default/files/2024-09/australias-ai-safety-standard.pdf',
        'https://www.industry.gov.au/publications/australias-ai-safety-standard',
        'https://www.industry.gov.au/science-technology-and-innovation/technology/artificial-intelligence/australias-ai-safety-standard',
    ],
    # ADGM DPR 2021 - try direct PDF or alternate sources
    'ae-adgm-dpr-2021': [
        'https://adgm.com/regulations-and-legislation/regulations',
        'https://www.adgm.com/setting-up-in-adgm/legal-framework/regulations',
    ],
    # UAE Federal PDPL
    'ae-ae-pdpl-2021': [
        'https://u.ae/en/information-and-services/justice-security-and-the-law/cyber-security-and-information-technology/personal-data-protection-law',
        'https://tdra.gov.ae/en/aio/personal-data-protection-law',
    ],
    # APEC CBPR
    'apec-apec-cbpr-2011': [
        'https://www.apec.org/Publications/2011/10/APEC-Cross-Border-Privacy-Rules-System',
        'https://cbprs.org/cross-border-privacy-rules/',
    ],
    # Bahrain PDPL
    'bh-bh-pdpl-2018': [
        'https://www.pdpa.gov.bh/en',
        'https://www.pdpa.gov.bh/Laws',
    ],
    # Brunei PDPO
    'bn-bn-pdpo-2021': [
        'https://www.aiti.gov.bn/Shared%20Documents/Personal%20Data%20Protection%20Order%202021.pdf',
    ],
    # Germany KI-Massnahmengesetz
    'de-de-kimig-2026': [
        'https://www.gesetze-im-internet.de/kimig/',
        'https://dserver.bundestag.de/btd/20/142/2014278.pdf',
    ],
    # Egypt PDPL
    'eg-eg-pdpl-2020': [
        'https://mcit.gov.eg/Upcont/Documents/Publications_1682020000000_ProtectionofPersonalData.pdf',
        'https://www.egyptianlaw.net/personal-data-protection-law',
    ],
    # G7 Hiroshima AI Process
    'g7-g7-hiroshimaprocess-2023': [
        'https://www.meti.go.jp/press/2023/10/20231030002/20231030002-1.pdf',
        'https://digital-strategy.ec.europa.eu/en/library/hiroshima-process-international-guiding-principles-advanced-ai-system',
        'https://www.g7hiroshima.go.jp/documents/pdf/Leaders-Communique_2023_en.pdf',
    ],
    # Israel Privacy Protection Amendment 13
    'il-il-ppa13-2024': [
        'https://www.gov.il/BlobFolder/news/gov-il/he/Files/privacy_protection_amendment_13.pdf',
        'https://www.nevo.co.il/law_html/law01/500_001.htm',
    ],
    # Paris AI Action Summit
    'int-paris-aiaction-2025': [
        'https://www.elysee.fr/en/emmanuel-macron/2025/02/11/ai-action-summit-communique',
        'https://ia-action-summit.fr/en/communique/',
        'https://www.gov.uk/government/publications/paris-ai-action-summit-2025',
    ],
    # Seoul AI Safety Statement
    'int-seoul-aisafety-2024': [
        'https://www.gov.uk/government/publications/seoul-ministerial-statement-for-advancing-ai-safety-international-collaboration-and-action',
        'https://www.gov.uk/government/publications/seoul-declaration-on-ai',
    ],
    # Jordan PDPL
    'jo-jo-pdpl-2023': [
        'https://www.ipr.gov.jo/EchoBusV3.0/SystemAssets/PDFs/AR/Data%20Protection%20Law%20EN.pdf',
    ],
    # Japan AI Promotion Act
    'jp-jp-aiprom-2025': [
        'https://www.cao.go.jp/aistrategic/pdf/ai_promotion_law_outline.pdf',
        'https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/8c0a21fb-e040-4e6e-8e50-b8aeb63c48f5/af3b7f5b/20250219_meeting_ai-promotion_law_overview_01.pdf',
    ],
    # Japan APPI
    'jp-jp-appi-2022': [
        'https://www.ppc.go.jp/files/pdf/Act_for_the_Protection_of_Personal_Information.pdf',
        'https://www.ppc.go.jp/en/legal/law/',
    ],
    # Japan METI AI Guidelines
    'jp-jp-meti-aiguidelines-2024': [
        'https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20240419_1.pdf',
        'https://www.meti.go.jp/press/2024/04/20240419004/20240419004-1.pdf',
    ],
    # South Korea PIPA
    'kr-kr-pipa-2023': [
        'https://www.pipc.go.kr/eng/main/contents.do?menuNo=10010100',
        'https://elaw.klri.re.kr/eng_service/lawView.do?hseq=61939&lang=ENG',
    ],
    # Lithuania AI Designation
    'lt-lt-aidesignation-2025': [
        'https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.540000?jfwid=xdwikfljn',
        'https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&p_a=1060&p_d=250321',
    ],
    # Latvia AI Centre
    'lv-lv-aicentre-2025': [
        'https://likumi.lv/ta/id/340000-maklsliga-intelekta-centrs',
        'https://www.vestnesis.lv/op/2025/70.1',
    ],
    # NIST AI RMF
    'nist-us-airmf-2023': [
        'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf',
        'https://airc.nist.gov/static/media/RMF.pdf',
        'https://doi.org/10.6028/NIST.AI.100-1',
    ],
    # Oman PDPL (SSL bypass)
    'om-om-pdpl-2022': [
        'https://ita.gov.om/itaPortal/Pages/LegalAffairs.aspx',
        'https://www.mcit.gov.om/en/personal-data-protection',
    ],
    # Russia AI Law 169
    'ru-ru-ailaw169-2025': [
        'https://publication.pravo.gov.ru/document/0001202501040001',
        'https://rg.ru/documents/2025/01/04/fz-169.html',
    ],
    # Singapore EIOA
    'sg-sg-eioa-2024': [
        'https://sso.agc.gov.sg/Acts-Supp/34-2024/Published/20241022?DocDate=20241022',
        'https://www.mci.gov.sg/legislation/the-election-integrity-online-act',
    ],
    # Singapore Model AI Governance Framework
    'sg-sg-maigf-2020': [
        'https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Resource-for-Organisation/AI/SGModelAIGovFramework2.pdf',
        'https://www.pdpc.gov.sg/Help-and-Resources/2020/01/Model-AI-Governance-Framework',
    ],
    # Slovakia AI Conformity
    'sk-sk-aiconformity-2025': [
        'https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2025/318/20250601.html',
    ],
    # Turkey AI Bill
    'tr-tr-aibill-2025': [
        'https://www.tbmm.gov.tr/develop/owa/tasari_teklif_gd.onerge_bilgileri?kanunlar_sira_no=301',
        'https://www2.tbmm.gov.tr/d28/2/2-3358.pdf',
    ],
    # UN AI Resolution
    'un-un-airesolution-2024': [
        'https://documents.un.org/doc/undoc/gen/n24/065/92/pdf/n2406592.pdf',
        'https://digitallibrary.un.org/record/4043907/files/A_RES_78_311-EN.pdf',
        'https://www.un.org/en/ga/search/view_doc.asp?symbol=A/RES/78/311',
    ],
    # UNESCO AI Recommendation
    'unesco-unesco-airecommendation-2021': [
        'https://unesdoc.unesco.org/ark:/48223/pf0000381137.locale=en',
        'https://unesdoc.unesco.org/ark:/48223/pf0000381137_eng',
        'https://www.unesco.org/en/artificial-intelligence/recommendation-ethics',
    ],
    # US Alabama HB 161 - try direct bill text
    'us-al-hb161-2024': [
        'https://alison.legislature.state.al.us/files/pdf/SearchableInstruments/2024RS/HB161-enr.pdf',
        'https://legiscan.com/AL/text/HB161/id/2924890',
    ],
    # US Alabama HB 172
    'us-al-hb172-2024': [
        'https://alison.legislature.state.al.us/files/pdf/SearchableInstruments/2024RS/HB172-enr.pdf',
    ],
    # US Arkansas HB 1071
    'us-ar-hb1071-2025': [
        'https://www.arkleg.state.ar.us/Bills/FTPDocument?path=%2FBills%2F2025R%2FPublic%2FHB1071.pdf',
        'https://www.arkleg.state.ar.us/Acts/FTPDocument?path=%2FActs%2F2025R%2FPublic%2FACT175.PDF',
    ],
    # US EO 14365 (check if different URL pattern)
    'us-fed-eo14365-2025': [
        'https://www.federalregister.gov/documents/search?conditions%5Bterm%5D=14365',
        'https://www.whitehouse.gov/presidential-actions/executive-order-on-advancing-united-states-leadership-in-artificial-intelligence-infrastructure/',
    ],
    # US Hawaii SB 2687
    'us-hi-sb2687-2024': [
        'https://www.capitol.hawaii.gov/session/2024/bills/SB2687_CD1_.HTM',
        'https://capitol.hawaii.gov/session2024/bills/SB2687_.htm',
    ],
    # US New York SB 8391
    'us-ny-sb8391-2025': [
        'https://legislation.nysenate.gov/pdf/bills/2025/S8391',
        'https://www.nysenate.gov/sites/default/files/bills/2025/S8391.pdf',
    ],
    # US New York SB 8420A
    'us-ny-sb8420a-2025': [
        'https://legislation.nysenate.gov/pdf/bills/2025/S8420A',
    ],
    # US Ohio HB 96
    'us-oh-hb96ai-2025': [
        'https://www.legislature.ohio.gov/legislation/135/hb96',
        'https://search.legislature.ohio.gov/api/docs/Legislation/document?legislationId=HB+96&legislationTypeId=1&sessionId=135&apiKey=4rS5THTB0fmqKGMTRLZN_g',
        'https://codes.ohio.gov/assets/laws/bills/135/hb96/en/hb96_en.pdf',
    ],
    # US South Dakota SB 41 2026
    'us-sd-sb41-2026': [
        'https://sdlegislature.gov/api/Documents/Bill/25088/DocumentType/2',
        'https://mylrc.sdlegislature.gov/api/Documents/Bill/25088.pdf',
    ],
    # US Utah SB 332
    'us-ut-sb332-2025': [
        'https://le.utah.gov/~2025/bills/static/SB0332.html',
        'https://le.utah.gov/xmbl/f?p=100:2:0::::P2_SID,P2_SVID:2025,1',
    ],
    # US Virginia SB 1090
    'us-va-sb1090-2025': [
        'https://lis.virginia.gov/cgi-bin/legp604.exe?251+ful+SB1090+pdf',
        'https://lis.virginia.gov/cgi-bin/legp604.exe?251+ful+SB1090',
    ],
    # US Wyoming HB 102
    'us-wy-hb102-2025': [
        'https://wyoleg.gov/2025/Introduced/HB0102.pdf',
        'https://www.wyoleg.gov/Legislation/2025/HB0102',
    ],
}

print("=" * 70)
print("AI Regulation DB — Fetching Fallback URLs")
print(f"Date: {TODAY}")
print("=" * 70)
print()

fixed = {}
failed = {}

total = len(FALLBACKS)
for i, (law_id, urls) in enumerate(FALLBACKS.items(), 1):
    print(f"[{i:3d}/{total}] {law_id}:", end=' ', flush=True)
    print(f"trying {len(urls)} URL(s)...", end=' ', flush=True)

    success, result, url_used = process_law(law_id, urls)

    if success:
        fixed[law_id] = (result, url_used)
        print(f"OK ({result:,} chars)")
    else:
        failed[law_id] = (result, url_used)
        print(f"FAILED: {result}")

    time.sleep(0.5)

print()
print("=" * 70)
print(f"SUMMARY")
print("=" * 70)

print(f"\nFIXED ({len(fixed)}):")
for law_id, (chars, url) in sorted(fixed.items()):
    print(f"  {law_id}: {chars:,} chars from {url}")

print(f"\nSTILL FAILED ({len(failed)}):")
for law_id, (reason, url) in sorted(failed.items()):
    print(f"  {law_id}: {reason}")

print(f"\nTotal: {len(fixed)} fixed, {len(failed)} still failed")
