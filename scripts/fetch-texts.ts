#!/usr/bin/env npx tsx
/**
 * Fetches full legislative text for every law in regulations.json.
 * Saves to data/texts/{id}.md with YAML frontmatter.
 * Updates text_path field in regulations.json.
 *
 * Run:  npx tsx scripts/fetch-texts.ts
 * Skip already-fetched:  npx tsx scripts/fetch-texts.ts --skip-existing
 * Single law:            npx tsx scripts/fetch-texts.ts --id eu-eu-aiact-2024
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'

import { PDFParse } from 'pdf-parse'

// ─── Config ────────────────────────────────────────────────────────────────

const ROOT = join(import.meta.dirname, '..')
const DATA_PATH = join(ROOT, 'data/regulations.json')
const TEXTS_DIR = join(ROOT, 'data/texts')
const DELAY_MS = 800
const TIMEOUT_MS = 30_000

const args = process.argv.slice(2)
const SKIP_EXISTING = args.includes('--skip-existing')
const ONLY_ID = args.find(a => a.startsWith('--id='))?.split('=')[1]

// ─── Alternative URL overrides ──────────────────────────────────────────────
// For sites that block scraping or return wrong content, use a more accessible mirror.
// GovInfo.gov has excellent HTML coverage of all enacted US federal public laws.
const URL_OVERRIDES: Record<string, string> = {
  // Federal — congress.gov blocks; govinfo.gov serves enacted law HTML
  'us-fed-take-it-down-2026':  'https://www.govinfo.gov/content/pkg/PLAW-119publ1/html/PLAW-119publ1.htm',
  'us-fed-defiance-act-2024':  'https://www.govinfo.gov/content/pkg/PLAW-118publ92/html/PLAW-118publ92.htm',
  // NAI Act: use Congress.gov text viewer (plain text version via GovInfo)
  'us-fed-nai-act-2020':       'https://www.govinfo.gov/content/pkg/BILLS-116hr6395enr/html/BILLS-116hr6395enr.htm',
  // EO 14179 — federalregister.gov blocked, whitehouse.gov times out; American Presidency Project
  'us-fed-eo14179-2025':       'https://www.presidency.ucsb.edu/documents/executive-order-14179-removing-barriers-american-leadership-artificial-intelligence',
  // IL — ilga.gov TLS incompatible with this environment even via curl; use Wayback Machine
  'us-il-bipa-2008':      'https://web.archive.org/web/20241201000000if_/https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3004',
  'us-il-hb3773-2024':    'https://dhr.illinois.gov/about-us/legislative-updates/artificial-intelligence-in-employment.html',
  'us-il-aiea-2024':      'https://web.archive.org/web/20241201000000if_/https://www.ilga.gov/legislation/publicacts/103/103-0754.htm',
  // NC, NV, FL — these block in this environment; user should run locally
  // GA SB396 — legis.ga.gov is a JS SPA; no accessible text source found, placeholder
  // 'us-ga-sb396-2024': ...
  // MX — dof.gob.mx homepage only; use specific DOF nota_detalle for LFT AI amendment
  'mx-mx-laborai-2026': 'https://www.dof.gob.mx/nota_detalle.php?codigo=5749621&fecha=19/02/2025',
  // CoE — coe.int Cloudflare-blocked; use Wayback Machine raw PDF (if_ strips toolbar)
  'coe-coe-aiconv-2024': 'https://web.archive.org/web/20241230232546if_/https://rm.coe.int/1680afae3c',
  // China — cac.gov.cn blocks; use chinalawtranslate.com for GenAI interim and PIPL
  'cn-cn-genai-2023':        'https://www.chinalawtranslate.com/en/generative-ai-interim/',
  'cn-cn-pipl-2021':         'https://www.chinalawtranslate.com/en/personal-information-protection-law-of-the-peoples-republic-of-china/',
  // India DPDPA — meity.gov.in PDF 404; use gazette notification HTML
  'in-in-dpdpa-2023':        'https://egazette.gov.in/WriteReadData/2023/247647.pdf',
  // SG Online Safety — blocked in env; use IMDA summary
  'sg-sg-onlinesafety-2025': 'https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2025/imda-releases-online-safety-codes-of-practice',
  // AU Privacy Act — legislation.gov.au Act No. 128 of 2024 (Privacy and Other Legislation Amendment)
  'au-au-privacyact-2024':   'https://www.legislation.gov.au/C2024A00128/asmade/text',
  // CA CCPA — leginfo JS-rendered; CA OAG has full text
  'us-ca-ccpa-cpra-2018':    'https://oag.ca.gov/privacy/ccpa',
  // MN HF4114 — revisor.mn.gov navigation page; use direct bill text
  'us-mn-hf4114-2024':  'https://www.revisor.mn.gov/bills/text.php?number=HF4114&version=0&session=ls93&session_year=2024&session_number=0',
  // FL SB262 — flsenate.gov blocked; use HTML enrolled version
  'us-fl-sb262-2024':   'https://flsenate.gov/Session/Bill/2024/262/BillText/c2/HTML',
  // NH — gencourt.state.nh.us 403; gencourt.org is an alternate mirror
  'us-nh-hb143-2025':   'https://gencourt.org/bill/2025/HB143',
  // ME — legislature.maine.gov PDFs empty; use HTML bill display page
  'us-me-ld2082-2026':  'https://legislature.maine.gov/legis/bills/display_ps.asp?snum=132&ld=2082',
  // CT — cga.ct.gov TLS incompatible with Node.js fetch; use Wayback Machine PDF
  'us-ct-pa25113-2025': 'https://web.archive.org/web/20251223043649if_/https://www.cga.ct.gov/2025/ACT/PA/PDF/2025PA-00113-R00SB-01295-PA.PDF',
  // TN ELVIS Act — capitol.tn.gov TLS-blocked; use Wayback Machine PDF
  'us-tn-elvisa-2024':  'https://web.archive.org/web/20260109093626if_/https://www.capitol.tn.gov/Bills/113/Bill/HB2091.pdf',
  // MI PA 263/266 — legislature.mi.gov TLS-blocked; use Wayback Machine PDF
  'us-mi-pa263266-2023': 'https://web.archive.org/web/20250417215157if_/https://www.legislature.mi.gov/documents/2023-2024/publicact/pdf/2023-PA-0263.pdf',
  // NE LB 525 — nebraskalegislature.gov TLS-blocked; use Wayback Machine PDF
  'us-ne-lb525-2026':   'https://web.archive.org/web/20250515064342if_/https://nebraskalegislature.gov/FloorDocs/109/PDF/Intro/LB525.pdf',
  // ID SB 1297 — legislature.idaho.gov TLS-blocked; use Wayback Machine PDF
  'us-id-sb1297-2026':  'https://web.archive.org/web/20260414172847if_/https://legislature.idaho.gov/wp-content/uploads/sessioninfo/2026/legislation/S1297E1.pdf',
  // WA HB 2225 — lawfilesext.leg.wa.gov TLS-blocked; use Wayback Machine enrolled PDF
  'us-wa-hb2225-2026':  'https://web.archive.org/web/20260402202221if_/https://lawfilesext.leg.wa.gov/biennium/2025-26/Pdf/Bills/House%20Passed%20Legislature/2225-S.PL.pdf',
  // EUR-Lex — rate-limited (202 "please wait"); use Wayback Machine snapshots
  'eu-eu-cra-2024':     'https://web.archive.org/web/20241212063625if_/https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2847',
  'eu-eu-pld-2024':     'https://web.archive.org/web/20250112224320if_/https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024L2853',
  // NY RAISE Act — nysenate.gov Cloudflare-blocked; use Wayback Machine snapshot
  'us-ny-raiseact-2025': 'https://web.archive.org/web/20251117012634if_/https://www.nysenate.gov/legislation/bills/2025/S6953/amendment/original',
  // NY A3008 — nysenate.gov Cloudflare-blocked; use Wayback Machine
  'us-ny-a3008-2025':    'https://web.archive.org/web/20251110000000if_/https://www.nysenate.gov/legislation/bills/2025/A3008',
  // Quebec Law 25 — canlii.org 403; use Publications du Québec PDF
  'ca-qc-law25-2021':    'https://www.publicationsduquebec.gouv.qc.ca/fileadmin/Fichiers_client/lois_et_reglements/LoisAnnuelles/en/2021/2021C25A.PDF',
  // UK DUAA 2025 — use legislation.gov.uk plain text
  'uk-uk-duaa-2025':     'https://www.legislation.gov.uk/ukpga/2025/18/enacted',
  // France SREN — legifrance.gouv.fr 403; use WIPO Lex
  'fr-fr-sren-2024':     'https://www.wipo.int/wipolex/en/legislation/details/22589',
  // UAE PDPL — u.ae 404; use DLA Piper translation via Wayback
  'ae-ae-pdpl-2021':     'https://web.archive.org/web/20230601000000if_/https://www.dlapiper.com/en/us/insights/publications/2021/10/uae-federal-data-protection-law-2021/',
  // Saudi Arabia PDPL — sdaia.gov.sa PDF (direct link, may need Wayback)
  'sa-sa-pdpl-2021':     'https://web.archive.org/web/20240101000000if_/https://sdaia.gov.sa/en/SDAIA/about/Documents/Personal%20Data%20Protection%20Law%20En%20V2-2022.pdf',
  // Nigeria NDPA — ndpb.gov.ng; use GlobaLex or direct legislation portal
  'ng-ng-ndpa-2023':     'https://web.archive.org/web/20240101000000if_/https://ndpb.gov.ng/Publications/NigeriaDataProtectionAct2023.pdf',
  // Egypt PDPL — use GlobaLex analysis or alternate English version
  'eg-eg-pdpl-2020':     'https://web.archive.org/web/20240101000000if_/https://mcit.gov.eg/Upcont/Documents/Publications_1682020000_.pdf',
  // Indonesia PDP — use Wayback Machine for peraturan.go.id page
  'id-id-pdp-2022':      'https://web.archive.org/web/20230101000000if_/https://peraturan.go.id/files/uu-27-2022.pdf',
  // Philippines DPA — officialgazette via Wayback 403; use NPC website Wayback or WIPO Lex
  'ph-ph-dpa-2012':      'https://web.archive.org/web/20240601000000if_/https://privacy.gov.ph/data-privacy-act/',
  // Kazakhstan AI Law — Library of Congress 403; use EY Kazakhstan article
  'kz-kz-ailaw-2025':    'https://www.ey.com/en_kz/technical/tax-alerts/2025/12/law-on-artificial-intelligence-kazakhstan',
  // US AI in Government Act — congress.gov 403; use GovInfo.gov enacted text
  'us-fed-aiga-2020':    'https://www.govinfo.gov/content/pkg/BILLS-116hr2575enr/html/BILLS-116hr2575enr.htm',
  // MA H.4744 — malegislature.gov fetch error; use Wayback Machine
  'us-ma-h4744-2024':    'https://web.archive.org/web/20240901000000if_/https://malegislature.gov/Bills/193/H4744',
  // NJ A3540 — pub.njleg.gov fetch error; use Wayback Machine NJ legislature
  'us-nj-a3540-2025':    'https://web.archive.org/web/20250501000000if_/https://pub.njleg.gov/Bills/2024/AL24/49_.HTM',
  // PA Act 125 (SB 1213) — use Wayback Machine PA legislature
  'us-pa-act125-2024':   'https://web.archive.org/web/20250101000000if_/https://www.palegis.us/legislation/bills/2023/sb1213',
  // RI H5872 — webserver.rileg.gov failed; use Wayback Machine RI legislature
  'us-ri-h5872-2025':    'https://web.archive.org/web/20250901000000if_/https://webserver.rileg.gov/Bills/2025/H5872.pdf',
  // WI Act 123 — docs.legis.wisconsin.gov fetch error; use Wayback
  'us-wi-act123-2024':   'https://web.archive.org/web/20240401000000if_/https://docs.legis.wisconsin.gov/2023/related/acts/123.pdf',
  // WI Act 34 (2025) — use Wayback snapshot of Wisconsin legislature page
  'us-wi-act34-2025':    'https://web.archive.org/web/20251106133835if_/https://docs.legis.wisconsin.gov/2025/related/acts/34',
  // Rwanda DPA — rura.rw 404; try Rwanda government portal Wayback
  'rw-rw-dpa-2021':      'https://web.archive.org/web/20220101000000if_/https://www.rura.rw/fileadmin/Documents/Laws/Law_relating_to_the_protection_of_personal_data_and_privacy_in_Rwanda.pdf',
  // Ontario Bill 194 — CanLII 403; use Ontario e-Laws
  'ca-on-edsta-2024':    'https://www.ontario.ca/laws/statute/s24024#BK1',
  // Chile Ley 21.719 — bcn.cl might require JS; use IAPP/BCN PDF
  'cl-cl-dpa-2024':      'https://www.bcn.cl/leychile/navegar?idNorma=1209272',
  // Taiwan AI Basic Act — moda.gov.tw press release has summary; use it
  'tw-tw-aibasicact-2025': 'https://moda.gov.tw/en/press/press-releases/18316',
  // Spain AI Sandbox — BOE direct link (already a good URL, but add retry)
  'es-es-aisandbox-2023': 'https://www.boe.es/eli/es/rd/2023/11/08/817/dof/eng',
  // Denmark AI Supplementary — retsinformation.dk JS-rendered; use Wayback snapshot (2026-02-15)
  'dk-dk-aisupplementary-2025': 'https://web.archive.org/web/20260215182844if_/https://www.retsinformation.dk/eli/lta/2025/467',
  // EU Data Act — EUR-LEX homepage is JS-rendered; use direct HTML endpoint
  'eu-eu-dataact-2023':         'https://web.archive.org/web/20250101000000if_/https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854',
  // NIST AI RMF — airc.nist.gov is a JS SPA; use the direct PDF publication
  'nist-us-airmf-2023':         'https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf',
  // G7 Hiroshima — meti.go.jp 404; use OECD copy of the code of conduct
  'g7-g7-hiroshimaprocess-2023':'https://www.oecd.org/content/dam/oecd/en/topics/policy-issues/artificial-intelligence/G7-Hiroshima-Process-International-Guiding-Principles.pdf',
  // OECD AI Principles — JS-rendered; use the PDF version from OECD
  'oecd-oecd-aiprinciples-2019':'https://www.oecd.org/content/dam/oecd/en/topics/policy-issues/artificial-intelligence/OECD-AI-Principles-2019.pdf',
  // UNESCO AI Recommendation — JS-rendered; use the PDF from UNESCO
  'unesco-unesco-airecommendation-2021': 'https://unesdoc.unesco.org/ark:/48223/pf0000381137/PDF/381137eng.pdf.multi',
  // UN Resolution — direct PDF
  'un-un-airesolution-2024':    'https://documents.un.org/doc/undoc/gen/n24/065/92/pdf/n2406592.pdf',
  // Beijing GenAI — cac.gov.cn blocked; use ChinaLawTranslate
  'cn-bj-genai-2023':           'https://www.chinalawtranslate.com/en/beijing-generative-ai-services/',
  // China Facial Recognition — use ChinaLawTranslate English translation
  'cn-cn-facialrec-2024':       'https://www.chinalawtranslate.com/en/facial-recognition-security-measures/',
  // ASEAN AI Governance — use Wayback snapshot of the PDF
  'asean-asean-aigovernance-2023': 'https://web.archive.org/web/20240101000000if_/https://asean.org/wp-content/uploads/2023/11/ASEAN-Guide-on-AI-Governance-and-Ethics_2nd-Ed.pdf',
  // FTC AI Policy — the ftc.gov/policy URL is a 404; use the TechFTC blog post
  'us-ftc-aipolicy-2023':       'https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2023/11/generative-ai-raises-competition-concerns',
  // CFPB Circular — correct URL for the circular text page
  'us-cfpb-aicircular-2023':    'https://files.consumerfinance.gov/f/documents/cfpb_circular-2023-03_explainability-requirements-for-adverse-action-notices_2023-09.pdf',
  // SEC AI Conflict — use the Federal Register HTML version
  'us-sec-aiconflict-2023':     'https://www.federalregister.gov/documents/2023/08/09/2023-16742/conflicts-of-interest-associated-with-the-use-of-predictive-data-analytics-by-broker-dealers-and',
  // Canada Voluntary GenAI Code — use Wayback Machine snapshot
  'ca-fed-genaicode-2023':      'https://web.archive.org/web/20241201000000if_/https://ised-isde.canada.ca/site/ised/en/voluntary-code-conduct-responsible-development-and-management-advanced-generative-ai-systems',
  // Switzerland FADP — fedlex direct link (may need Wayback)
  'ch-ch-fadp-2023':            'https://web.archive.org/web/20240101000000if_/https://www.fedlex.admin.ch/eli/cc/2022/491/en',
}

// ─── Domains with TLS cert issues that curl handles but Node.js rejects ───────
const CURL_CERT_DOMAINS = new Set(['www.dof.gob.mx', 'dof.gob.mx'])

// ─── Turndown (HTML → Markdown) ─────────────────────────────────────────────

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})
td.remove(['script', 'style', 'nav', 'footer', 'header', 'noscript', 'iframe', 'form', 'button', 'aside'])

// ─── Domain-specific content selectors ─────────────────────────────────────
// Maps hostname patterns to the CSS selector(s) that contain the bill text.
// First match wins; '' = use body as fallback.

const DOMAIN_SELECTORS: [RegExp, string[]][] = [
  [/federalregister\.gov/,       ['#full-text-content-right .fr-document', '#full-text-content-right', 'article']],
  [/congress\.gov/,              ['.generated-html-container', '#legismain-fullpage-wrapper', 'article.page']],
  [/leginfo\.legislature\.ca/,  ['.bill-section', '.bill-content', '#bill_all', 'div.leginfo-text']],
  [/leg\.colorado\.gov/,         ['.efts-html', '#doc_content', '.bill-body', 'main']],
  [/capitol\.texas\.gov/,        ['#bill_text', '.bill-body', 'body']],
  [/ilga\.gov/,                  ['.ilga-body', '.legislation-body', '#content', 'main', 'body']],
  [/lawfilesext\.leg\.wa\.gov/,  ['body']],
  [/app\.leg\.wa\.gov/,          ['.bill-section', '#bill-content', 'article', 'main']],
  [/rules\.cityofnewyork\.us/,   ['article', '.entry-content', 'main']],
  [/capitol\.tn\.gov/,           ['body']],
  [/le\.utah\.gov/,              ['#main-container', '.bill-text', 'main', 'body']],
  [/iga\.in\.gov/,               ['.legislation-body', 'main', 'body']],
  [/olis\.oregonlegislature\.gov/, ['.bill-section', 'article', 'main', 'body']],
  [/legislature\.idaho\.gov/,    ['#bill-text', '.bill-content', 'main', 'body']],
  [/nebraskalegislature\.gov/,   ['#bill-text', '.bill-content', 'main', 'body']],
  [/legislature\.maine\.gov/,    ['.bill-text', '#content', 'main', 'body']],
  [/mgaleg\.maryland\.gov/,      ['.bill-content', '#bill-section', 'main', 'body']],
  [/eur-lex\.europa\.eu/,        ['#text', '.eli-subdivision', '#document1', 'main']],
  [/cac\.gov\.cn/,               ['#zlDiv', '.article_content', '.content', 'main']],
  [/chinalawtranslate\.com/,     ['.entry-content', 'article', 'main']],
  [/legislation\.gov\.uk/,       ['div.LegClearFix', '#legislation', 'main', 'article']],
  [/aibasicact\.kr/,             ['article', 'main', '#content']],
  [/legislation\.gov\.au/,       ['.primary', '#content', 'main', 'article']],
  [/rm\.coe\.int/,               ['body']],
  [/regulations\.ai/,            ['article', 'main', '.content']],
  [/nysenate\.gov/,              ['.bill-text', '.content-primary', 'article', 'main']],
  [/legislature\.ky\.gov/,       ['#bill-text', '.legBody', 'main', 'body']],
  [/apps\.legislature\.ky\.gov/, ['#bill-text', '.legBody', 'main', 'body']],
  [/cga\.ct\.gov/,               ['#bill-text', '.legBody', 'pre', 'main', 'body']],
  [/gencourt\.state\.nh\.us/,    ['pre', '.bill-text', 'main', 'body']],
  [/archive\.legmt\.gov/,        ['.bill-text', 'pre', 'main', 'body']],
  [/legislature\.mi\.gov/,       ['#bill-text', '.bill-content', 'pre', 'body']],
  [/revisor\.mn\.gov/,           ['#bill-text', '.bill-contents', 'pre', 'body']],
  [/flsenate\.gov/,              ['.bill-text', '#SectionContent', 'pre', 'body']],
  [/legis\.ga\.gov/,             ['.BillAlloc', '#bill-text', 'pre', 'body']],
  [/ncleg\.gov/,                 ['.bill-text', '#billContent', 'pre', 'body']],
  [/leg\.state\.nv\.us/,         ['pre', '.bill-text', 'main', 'body']],
  [/luatvietnam\.vn/,            ['.content-detail', 'article', 'main']],
  [/pertamapartners\.com/,       ['article', '.entry-content', 'main']],
  [/meity\.gov\.in/,             ['.content', 'article', 'main', 'body']],
  [/sso\.agc\.gov\.sg/,          ['#legis-body', '.legis-body', 'main', 'body']],
  [/dof\.gob\.mx/,               ['.texto', 'article', 'main', 'body']],
  [/camara\.leg\.br/,            ['#content', 'article', 'main', 'body']],
  [/nvleg\.gov/,                 ['pre', '.bill-text', 'main', 'body']],
]

function selectorsForUrl(url: string): string[] {
  try {
    const host = new URL(url).hostname
    for (const [pattern, sels] of DOMAIN_SELECTORS) {
      if (pattern.test(host)) return sels
    }
  } catch {}
  return ['main', 'article', '#content', 'body']
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...opts,
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        ...(opts.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(id)
  }
}

function extractTextFromHtml(html: string, url: string): string {
  const $ = cheerio.load(html)
  const selectors = selectorsForUrl(url)
  for (const sel of selectors) {
    const el = $(sel)
    if (el.length && el.text().trim().length > 200) {
      return td.turndown($.html(el))
    }
  }
  // Fallback: convert entire body
  return td.turndown($.html('body') || html)
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 })
  const result = await parser.getText()
  return result.text
}

function makeFrontmatter(law: Record<string, unknown>): string {
  return [
    '---',
    `id: ${law.id}`,
    `title: "${String(law.full_name ?? law.short_name).replace(/"/g, '\\"')}"`,
    `short_name: "${law.short_name}"`,
    `jurisdiction: ${law.jurisdiction}`,
    `enacted_date: ${law.enacted_date}`,
    `status: ${law.status}`,
    `official_url: ${law.official_text_url}`,
    `fetched_date: ${new Date().toISOString().split('T')[0]}`,
    '---',
    '',
  ].join('\n')
}

// ─── Main ──────────────────────────────────────────────────────────────────

mkdirSync(TEXTS_DIR, { recursive: true })

const laws = JSON.parse(readFileSync(DATA_PATH, 'utf8')) as Record<string, unknown>[]

const toProcess = ONLY_ID ? laws.filter(l => l.id === ONLY_ID) : laws
if (ONLY_ID && toProcess.length === 0) {
  console.error(`No law found with id: ${ONLY_ID}`)
  process.exit(1)
}

let success = 0
let skipped = 0
let failed = 0
const failures: { id: string; url: string; error: string }[] = []

for (const law of toProcess) {
  const id = String(law.id)
  const primaryUrl = String(law.official_text_url)
  const url = URL_OVERRIDES[id] ?? primaryUrl
  const outPath = join(TEXTS_DIR, `${id}.md`)
  const relPath = `data/texts/${id}.md`

  if (SKIP_EXISTING && existsSync(outPath)) {
    law.text_path = relPath
    skipped++
    continue
  }

  process.stdout.write(`  Fetching ${id} ... `)

  try {
    let bodyText = ''
    const isPdf = url.toLowerCase().includes('.pdf')

    const needsCurlCert = (() => {
      try { return CURL_CERT_DOMAINS.has(new URL(url).hostname) } catch { return false }
    })()

    if (needsCurlCert) {
      const raw = execSync(
        `curl -sL --insecure --max-time 30 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "${url}"`,
        { maxBuffer: 20 * 1024 * 1024 },
      )
      bodyText = extractTextFromHtml(raw.toString(), url)
      console.log(`HTML via curl (${Math.round(bodyText.length / 1000)}k chars)`)
    } else {
      const res = await fetchWithTimeout(url)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      }

      const contentType = res.headers.get('content-type') ?? ''

      if (contentType.includes('pdf') || isPdf) {
        const buf = Buffer.from(await res.arrayBuffer())
        bodyText = await extractPdfText(buf)
        console.log(`PDF (${Math.round(bodyText.length / 1000)}k chars)`)
      } else {
        const html = await res.text()
        bodyText = extractTextFromHtml(html, url)
        console.log(`HTML (${Math.round(bodyText.length / 1000)}k chars)`)
      }
    }

    if (bodyText.trim().length < 100) {
      throw new Error('Content too short — page may require JavaScript rendering')
    }

    const frontmatter = makeFrontmatter(law)
    writeFileSync(outPath, frontmatter + bodyText, 'utf8')
    law.text_path = relPath
    success++

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`FAILED: ${msg}`)
    failures.push({ id, url, error: msg })

    // Write a placeholder so the file exists and is discoverable
    const placeholder = makeFrontmatter(law) +
      `> **Text not yet available**\n>\n` +
      `> Fetch failed: ${msg}\n>\n` +
      `> To add manually, paste the statute text below this block.\n`
    writeFileSync(outPath, placeholder, 'utf8')
    law.text_path = relPath
    failed++
  }

  await delay(DELAY_MS)
}

// Write updated regulations.json with text_path fields
writeFileSync(DATA_PATH, JSON.stringify(laws, null, 2))

console.log('\n─── Summary ───────────────────────────────────────')
console.log(`  Success:  ${success}`)
console.log(`  Skipped:  ${skipped}`)
console.log(`  Failed:   ${failed}`)

if (failures.length > 0) {
  console.log('\nFailed fetches:')
  for (const f of failures) {
    console.log(`  ${f.id}`)
    console.log(`    ${f.url}`)
    console.log(`    ${f.error}`)
  }
  console.log('\nPlaceholder files created for failures — paste text manually or re-run after fixing URLs.')
}
