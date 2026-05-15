/**
 * Backfills official_text_url for US state bills that are missing it.
 *
 * Fix 1: Copy source_url from text file when it comes from a public domain.
 * Fix 2: Construct the public state legislature URL from region + bill_number + year.
 */

import * as fs from 'fs'

const DATA_PATH = 'data/regulations.json'
const PRIVATE_DOMAINS = ['statenet.com', 'custom.statenet.com']

interface Reg {
  id: string
  region?: string
  bill_number?: string
  official_text_url: string | null
  text_path?: string
  status?: string
}

const data: Reg[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))

// ── Helpers ───────────────────────────────────────────────────────────────

function extractYear(id: string): number | null {
  const m = id.match(/-(\d{4})$/)
  return m ? parseInt(m[1]) : null
}

function parseBill(billNumber: string): { type: string; num: number; raw: string } | null {
  const m = billNumber.trim().match(/^([A-Z]+)\s+(\d+)/)
  if (!m) return null
  return { type: m[1], num: parseInt(m[2]), raw: m[2] }
}

function pad(n: number | string, len: number) {
  return String(n).padStart(len, '0')
}

// Session year for biennial sessions (snap to the odd year)
function biennialStart(year: number) {
  return year % 2 === 1 ? year : year - 1
}

// ── State URL constructors ────────────────────────────────────────────────

function stateUrl(region: string, billNumber: string, id: string): string | null {
  const state = region.slice(3)           // "US-NY" → "NY"
  const year = extractYear(id)
  if (!year || !billNumber) return null
  const bill = parseBill(billNumber)
  if (!bill) return null
  const { type, num, raw } = bill

  switch (state) {

    // NEW YORK — nysenate.gov
    // Session = odd year of 2-year session. Bills from 2026 are still 2025 session.
    case 'NY': {
      const sess = biennialStart(year)
      return `https://nysenate.gov/legislation/bills/${sess}/${type}${num}`
    }

    // CALIFORNIA — leginfo.legislature.ca.gov
    // bill_id = {yr1}{yr2}0{TYPE}{number}  e.g. 202520260SB53
    case 'CA': {
      const s = biennialStart(year)
      const sess = `${s}${s + 1}`
      // Normalise type: S→SB, A→AB
      const t = type === 'S' ? 'SB' : type === 'A' ? 'AB' : type
      return `https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=${sess}0${t}${num}`
    }

    // MARYLAND — mgaleg.maryland.gov  (single-year sessions)
    case 'MD': {
      const t = type.toLowerCase()  // SB→sb, HB→hb
      return `https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/${t}${pad(num, 4)}?ys=${year}rs`
    }

    // MASSACHUSETTS — malegislature.gov
    // Session number: 194th = 2025-2026, 193rd = 2023-2024, 192nd = 2021-2022
    case 'MA': {
      const sess = 192 + Math.floor((biennialStart(year) - 2021) / 2)
      const t = type === 'S' ? 'S' : type === 'H' ? 'H' : type
      return `https://malegislature.gov/Bills/${sess}/${t}${num}`
    }

    // TEXAS — capitol.texas.gov
    // 89th Legislature = 2025, 88th = 2023, etc.
    case 'TX': {
      const leg = 89 + Math.floor((year - 2025) / 2)
      const t = type === 'H' ? 'HB' : type === 'S' ? 'SB' : type
      return `https://capitol.texas.gov/BillLookup/History.aspx?LegSess=${leg}R&Bill=${t}${num}`
    }

    // MINNESOTA — revisor.mn.gov
    // Uses HF / SF. Session year is odd-year start.
    case 'MN': {
      const f = biennialStart(year)
      // MN bill_number already has type: HF 2432, SF 1119, H 1606, S 1119
      const t = type === 'H' ? 'HF' : type === 'S' ? 'SF' : type
      return `https://www.revisor.mn.gov/bills/bill.php?b=${t}${num}&f=${f}&ssn=0&y=${f}`
    }

    // VIRGINIA — lis.virginia.gov
    // Session code = "{2-digit-year}{session-type-digit}"  2025 regular = 251, 2026 = 261
    case 'VA': {
      const code = `${String(year).slice(2)}1`
      const t = type === 'H' ? 'HB' : type === 'S' ? 'SB' : type
      return `https://lis.virginia.gov/cgi-bin/legp604.exe?${code}+sum+${t}${num}`
    }

    // HAWAII — capitol.hawaii.gov  (single-year sessions)
    case 'HI': {
      const t = type === 'H' ? 'HB' : type === 'S' ? 'SB' : type
      return `https://capitol.hawaii.gov/session${year}/lists/measure_indiv.aspx?billtype=${t}&billnumber=${num}`
    }

    // TENNESSEE — wapp.capitol.tn.gov
    case 'TN': {
      const t = type === 'H' ? 'HB' : type === 'S' ? 'SB' : type
      return `https://wapp.capitol.tn.gov/apps/BillInfo/Default.aspx?BillNumber=${t}${num}`
    }

    // FLORIDA — flsenate.gov (Senate) / myfloridahouse.gov (House)
    case 'FL': {
      if (['S', 'SB', 'CS/SB', 'CS/CS/SB'].some(p => type.startsWith(p.replace(/\//g,'')))) {
        return `https://www.flsenate.gov/Session/Bill/${year}/${pad(num, 4)}`
      }
      // House bills: flsenate also lists companion bills; use as fallback
      return `https://www.myfloridahouse.gov/Sections/Bills/billsdetail.aspx?BillId=${year}${pad(num, 4)}`
    }

    // WASHINGTON — app.leg.wa.gov
    case 'WA': {
      return `https://app.leg.wa.gov/billsummary?BillNumber=${num}&Year=${year}&Initiative=false`
    }

    // IOWA — legis.iowa.gov
    // 91st GA = 2025-2026, 90th = 2023-2024
    case 'IA': {
      const ga = 91 + Math.floor((biennialStart(year) - 2025) / 2)
      // Iowa uses HF/SF for chamber bills, HSB/SSB for study bills
      const t = type === 'H' ? 'HF' : type === 'S' ? 'SF' : type
      return `https://www.legis.iowa.gov/legislation/BillBook?ba=${t}${num}&ga=${ga}`
    }

    // WISCONSIN — docs.legis.wisconsin.gov
    // Session = biennial start year
    case 'WI': {
      const sess = biennialStart(year)
      // type: A→ab, S→sb, AB→ab, SB→sb
      const t = (type === 'A' || type === 'AB') ? 'ab' : (type === 'S' || type === 'SB') ? 'sb' : type.toLowerCase()
      return `https://docs.legis.wisconsin.gov/${sess}/proposals/${t}${num}`
    }

    // CONNECTICUT — cga.ct.gov
    case 'CT': {
      const t = type === 'S' ? 'SB' : type === 'H' ? 'HB' : type
      return `https://www.cga.ct.gov/asp/cgabillstatus/cgabillstatus.asp?selBillType=Bill&bill_num=${t}-${num}&which_year=${year}`
    }

    // RHODE ISLAND — webserver.rilegislature.gov
    case 'RI': {
      const yy = String(year).slice(2)
      const t = type === 'S' ? 'S' : type === 'H' ? 'H' : type
      return `https://webserver.rilegislature.gov/BillText/BillText${yy}/${t}${num}.pdf`
    }

    // PENNSYLVANIA — legis.state.pa.us  (biennial session, sYear = odd year)
    case 'PA': {
      const sYear = biennialStart(year)
      const body = (type === 'H' || type === 'HB') ? 'H' : 'S'
      return `https://www.legis.state.pa.us/cfdocs/billInfo/billInfo.cfm?sYear=${sYear}&sInd=0&body=${body}&type=B&bn=${num}`
    }

    // COLORADO — leg.colorado.gov
    // URL format: hb{yy}-{number} or sb{yy}-{number}
    case 'CO': {
      const yy = String(year).slice(2)
      const t = (['H', 'HB'].includes(type)) ? 'hb' : (['S', 'SB'].includes(type)) ? 'sb' : type.toLowerCase()
      return `https://leg.colorado.gov/bills/${t}${yy}-${num}`
    }

    // ARIZONA — azleg.gov
    // 57th Legislature = 2025 (1R) and 2026 (2R)
    case 'AZ': {
      const legNum = 55 + Math.ceil((biennialStart(year) - 2021) / 2)
      const session = year % 2 === 1 ? '1R' : '2R'
      const t = (['H', 'HB'].includes(type)) ? 'hb' : (['S', 'SB'].includes(type)) ? 'sb' : type.toLowerCase()
      return `https://www.azleg.gov/legtext/${legNum}leg/${session}/bills/${t}${num}.htm`
    }

    // NORTH CAROLINA — ncleg.gov
    case 'NC': {
      const t = type === 'H' ? 'H' : type === 'S' ? 'S' : type
      return `https://www.ncleg.gov/BillLookUp/${year}/${t}${num}`
    }

    // OHIO — legislature.ohio.gov
    // 136th GA = 2025-2026, 135th = 2023-2024
    case 'OH': {
      const ga = 136 + Math.floor((biennialStart(year) - 2025) / 2)
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://www.legislature.ohio.gov/legislation/legislation-summary?id=GA${ga}-${t}-${num}`
    }

    // SOUTH CAROLINA — scstatehouse.gov
    // Session 126 = 2025-2026, 125 = 2023-2024
    case 'SC': {
      const sessNum = 124 + Math.ceil((biennialStart(year) - 2021) / 2)
      const yearRange = `${biennialStart(year)}-${biennialStart(year) + 1}`
      return `https://www.scstatehouse.gov/sess${sessNum}_${yearRange}/bills/${num}.htm`
    }

    // INDIANA — iga.in.gov
    case 'IN': {
      const chamber = (['H', 'HB'].includes(type)) ? 'house' : 'senate'
      return `https://iga.in.gov/legislative/${year}/bills/${chamber}-${num}/details`
    }

    // MICHIGAN — legislature.mi.gov
    case 'MI': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://www.legislature.mi.gov/Bills/Bill?ObjectName=${year}-${t}-${pad(num, 4)}`
    }

    // ILLINOIS — ilga.gov
    // 104th GA = 2025-2026, 103rd = 2023-2024
    case 'IL': {
      const ga = 104 + Math.floor((biennialStart(year) - 2025) / 2)
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://www.ilga.gov/legislation/BillStatus.asp?DocNum=${num}&DocTypeID=${t}&GA=${ga}`
    }

    // KANSAS — kslegislature.org
    // Session format: b{year}_{year+1}  e.g. b2025_26
    case 'KS': {
      const s = biennialStart(year)
      const t = (['S', 'SB'].includes(type)) ? 'sb' : (['H', 'HB'].includes(type)) ? 'hb' : type.toLowerCase()
      return `https://www.kslegislature.org/li/b${s}_${String(s + 1).slice(2)}/measures/bills/${t}${num}/`
    }

    // NEBRASKA — nebraskalegislature.gov  (unicameral, LB / LR)
    case 'NE': {
      // 109th Legislature = 2025-2026
      const leg = 109 + Math.floor((biennialStart(year) - 2025) / 2)
      return `https://nebraskalegislature.gov/bills/search_by_number.php?Legislature=${leg}&type=bill&number=${type}${num}&Submit=Search`
    }

    // OREGON — olis.oregonlegislature.gov
    case 'OR': {
      const sess = year % 2 === 1 ? `${year}R1` : `${year}R1`
      const t = type === 'H' ? 'HB' : type === 'S' ? 'SB' : type
      return `https://olis.oregonlegislature.gov/liz/${sess}/Measures/Overview/${t}${num}`
    }

    // OKLAHOMA — oklegislature.gov
    case 'OK': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      // 60th Legislature: 2025 session ≈ 6000, 2026 ≈ 6001 (approximate; OK uses internal codes)
      const sessCode = year === 2025 ? 6000 : year === 2026 ? 6001 : 6000
      return `https://www.oklegislature.gov/BillInfo.aspx?Bill=${t}${num}&Session=${sessCode}`
    }

    // GEORGIA — legis.ga.gov
    case 'GA': {
      const t = type === 'H' ? 'HB' : type === 'S' ? 'SB' : type
      const sess = `${biennialStart(year)}${biennialStart(year) + 1}`
      return `https://www.legis.ga.gov/legislation/en-US/Display/${sess}/${t}/${num}`
    }

    // MISSOURI — house.mo.gov / senate.mo.gov
    case 'MO': {
      if (['H', 'HB', 'HJR'].includes(type)) {
        return `https://house.mo.gov/Bill.aspx?bill=${type === 'H' ? 'HB' : type}${num}&year=${year}&code=R`
      }
      return `https://www.senate.mo.gov/${String(year).slice(2)}info/BTS_Web/Bill.aspx?SessionType=R&BillID=${type}${num}`
    }

    // NEW JERSEY — pub.njleg.gov
    case 'NJ': {
      // NJ session: 221st = 2024-2025, 222nd = 2026-2027
      // Session dir is the even year at start of session
      const sessYear = year % 2 === 1 ? year - 1 : year
      const t = type === 'A' ? 'A' : type === 'S' ? 'S' : type
      // Directory grouping is to nearest 500
      const dir = Math.ceil(num / 500) * 500
      return `https://pub.njleg.gov/Bills/${sessYear}/${t}${dir}/${num}_I1.HTM`
    }

    // ALASKA — akleg.gov
    case 'AK': {
      const t = type === 'H' ? 'HB' : type === 'S' ? 'SB' : type
      return `https://www.akleg.gov/basis/Bill/Detail/${year}?Root=${t}${pad(num, 4)}`
    }

    // NEW MEXICO — nmlegis.gov
    case 'NM': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://www.nmlegis.gov/Legislation/Legislation?chamber=${t[0]}&legType=B&legNo=${num}&year=${String(year).slice(2)}`
    }

    // PUERTO RICO — oslpr.org
    case 'PR': {
      return `https://www.oslpr.org/2025-2028/toc/${type}${num}/`
    }

    // LOUISIANA — legis.la.gov
    case 'LA': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://legis.la.gov/legis/BillInfo.aspx?s=${year}RS&b=${t}${num}&sbi=y`
    }

    // MISSISSIPPI — billstatus.ls.state.ms.us
    case 'MS': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://billstatus.ls.state.ms.us/documents/${year}/pdf/${t === 'HB' ? 'house' : 'senate'}/${t}${pad(num,4)}.xml`
    }

    // VERMONT — legislature.vermont.gov
    case 'VT': {
      const t = type === 'H' ? 'H' : type === 'S' ? 'S' : type
      return `https://legislature.vermont.gov/bill/status/${biennialStart(year)}/${t}${num}`
    }

    // UTAH — le.utah.gov
    case 'UT': {
      const t = (['S', 'SB'].includes(type)) ? 'SB' : (['H', 'HB'].includes(type)) ? 'HB' : type
      return `https://le.utah.gov/~${year}/bills/${t === 'SB' ? 'sbillint' : 'hbillint'}/${t}${pad(num,4)}.htm`
    }

    // ALABAMA — alison.legislature.state.al.us
    case 'AL': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://alison.legislature.state.al.us/pdf/SearchableInstruments/${year}RS/PrintedVersions/${t}${num}.pdf`
    }

    // WEST VIRGINIA — wvlegislature.gov
    case 'WV': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://www.wvlegislature.gov/Bill_Status/bills_text.cfm?billdoc=${t}${num}&yr=${year}&sesstype=RS&i=1`
    }

    // KENTUCKY — apps.legislature.ky.gov
    case 'KY': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://apps.legislature.ky.gov/record/${String(year).slice(2)}rs/${t}${num}/bill.doc`
    }

    // NEVADA — leg.state.nv.us
    case 'NV': {
      // NV meets odd years only; 2025 = 83rd session
      const sess = 83 + Math.floor((year - 2025) / 2)
      const t = (['A', 'AB'].includes(type)) ? 'AB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://www.leg.state.nv.us/App/NELIS/REL/${sess}/Bill/${t}${num}/Overview`
    }

    // ARKANSAS — www.arkleg.state.ar.us
    case 'AR': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://www.arkleg.state.ar.us/Bills/Detail?id=${t}${num}&ddBienniumSession=${biennialStart(year)}%2F${year % 2 === 1 ? 'R' : 'F'}`
    }

    // IDAHO — legislature.idaho.gov
    case 'ID': {
      const t = (['H', 'HB'].includes(type)) ? 'H' : (['S', 'SB'].includes(type)) ? 'S' : type
      return `https://legislature.idaho.gov/sessioninfo/${year}/legislation/${t}${pad(num,4)}/`
    }

    // MAINE — legislature.maine.gov
    case 'ME': {
      // Maine uses HP (House Paper) and SP (Senate Paper); LD = Legislative Document
      const t = type  // keep as-is: HP, SP, LD, H, S
      const leg = 132 + Math.floor((biennialStart(year) - 2025) / 2)
      return `https://legislature.maine.gov/billtracking/bills/LD/LD${num}/${leg}th.asp`
    }

    // NEW HAMPSHIRE — gencourt.state.nh.us
    case 'NH': {
      const t = type === 'S' ? 'SB' : type === 'H' ? 'HB' : type
      return `https://gencourt.state.nh.us/bill_Status/billinfo.aspx?id=${num}&inflect=2`
    }

    // MONTANA — leg.mt.gov
    case 'MT': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      const sess = 69 + Math.floor((year - 2025) / 2)
      return `https://leg.mt.gov/bills/${year}/${t}/${t}${pad(num,4)}.pdf`
    }

    // DELAWARE — legis.delaware.gov
    case 'DE': {
      const sess = 153 + Math.floor((biennialStart(year) - 2025) / 2)
      return `https://legis.delaware.gov/BillDetail?LegislationId=${num}`
    }

    // MISSISSIPPI — already handled above
    // SOUTH DAKOTA — sdlegislature.gov
    case 'SD': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://sdlegislature.gov/Session/Bill/${num}/${year}`
    }

    // NORTH DAKOTA — ndlegis.gov
    case 'ND': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SB'].includes(type)) ? 'SB' : type
      return `https://ndlegis.gov/assembly/${Math.floor((year - 2021) / 2) + 67}/regular/bill-overview/${t}${pad(num,4)}.html`
    }

    // WYOMING — wyoleg.gov
    case 'WY': {
      const t = (['H', 'HB'].includes(type)) ? 'HB' : (['S', 'SF'].includes(type)) ? 'SF' : type
      return `https://wyoleg.gov/Legislation/${year}/${t}${pad(num,4)}`
    }

    // GUAM — guamlegislature.com
    case 'GU': {
      return `https://www.guamlegislature.com/Bills_Introduced_${String(year).slice(2)}/${type}${num}-${String(year).slice(2)}.pdf`
    }

    default:
      return null
  }
}

// ── Fix 1: Copy source_url from text files when it's a public URL ─────────

let fix1 = 0
let fix2 = 0
let skipped = 0

for (const rec of data) {
  if (rec.official_text_url) continue

  // Fix 1: copy source_url from text file if it's a public domain
  if (rec.text_path) {
    try {
      const content = fs.readFileSync(rec.text_path, 'utf8')
      const match = content.match(/^source_url:\s*(.+)$/m)
      if (match) {
        const src = match[1].trim()
        const isPrivate = PRIVATE_DOMAINS.some(d => src.includes(d))
        if (!isPrivate && src.startsWith('http')) {
          rec.official_text_url = src
          fix1++
          continue
        }
      }
    } catch { /* text file unreadable — fall through to Fix 2 */ }
  }

  // Fix 2: construct public legislature URL from state + bill number + year
  if (!rec.region?.startsWith('US-')) {
    skipped++
    continue
  }
  const url = stateUrl(rec.region, rec.bill_number ?? '', rec.id)
  if (url) {
    rec.official_text_url = url
    fix2++
  } else {
    skipped++
  }
}

console.log(`Fix 1 (public source_url copied): ${fix1}`)
console.log(`Fix 2 (legislature URL generated): ${fix2}`)
console.log(`Skipped (no pattern / non-US):     ${skipped}`)
console.log(`Total updated: ${fix1 + fix2}`)

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
console.log('Written.')
