#!/usr/bin/env python3
"""
review-server.py

Local review UI server. Run with:
  python3 scripts/review-server.py

Then open http://localhost:7331 in your browser.

Provides:
  - Visual list of all laws needing review, grouped by tier and flagged status
  - Per-law review card view (claims, flags, law text excerpt)
  - "Run Agent" button: calls Claude to research the law and propose corrections
  - "Apply" button: writes agent's proposed corrections to regulations.json
  - "Mark Reviewed (no changes)" button: marks law as verified without changes
"""

import html as html_module
import json, os, re, sys, yaml, threading, time
from datetime import date
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.request
import anthropic

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
REVIEWS_DIR = DATA_DIR / "reviews"
TODAY = date.today().isoformat()

ANTHROPIC_CLIENT = anthropic.Anthropic()

# ── Data loading ──────────────────────────────────────────────────────────────

def load_data():
    with open(DATA_DIR / "regulations.json") as f:
        regs = json.load(f)
    with open(DATA_DIR / "rules.json") as f:
        rules = json.load(f)
    try:
        with open(DATA_DIR / "review-status.json") as f:
            review_status = json.load(f)
    except FileNotFoundError:
        review_status = {}
    return regs, rules, review_status

def save_regulations(regs):
    with open(DATA_DIR / "regulations.json", "w") as f:
        json.dump(regs, f, indent=2, ensure_ascii=False)

def save_review_status(review_status):
    with open(DATA_DIR / "review-status.json", "w") as f:
        json.dump(review_status, f, indent=2)

# ── QA checks (from generate-review-cards.py) ────────────────────────────────

SOFT_TYPES = {"voluntary_framework", "policy_framework", "guidance"}
VALID_SCOPES = {"comprehensive", "sector_specific", "single_issue"}

def rule_counts(rules):
    counts = {}
    for r in rules:
        lid = r["first_instance"]["law_id"]
        counts[lid] = counts.get(lid, 0) + 1
    return counts

def review_tier(r, n_rules):
    binding = r.get("instrument_binding", False)
    scope = r.get("scope", "")
    status = r.get("status", "")
    active = status in ("in_force", "enacted_not_yet_effective")
    if binding and scope == "comprehensive" and active:   return 1
    if binding and scope == "sector_specific" and active: return 2
    if binding and scope == "single_issue":               return 3
    return 4

TIER_LABELS = {
    1: "Comprehensive & Binding",
    2: "Sector-Specific & Binding",
    3: "Single-Issue & Binding",
    4: "Soft Law / Inactive",
}

def run_checks(r, n_rules):
    issues = []
    lid = r["id"]
    binding = r.get("instrument_binding", False)
    itype = r.get("instrument_type", "")
    status = r.get("status", "")
    scope = r.get("scope", "")
    effective = r.get("effective_date", "") or ""
    prov = r.get("provisions", {})
    penalty = r.get("max_penalty_usd_approx")

    if itype in SOFT_TYPES and binding:
        issues.append(("CRITICAL", "L1", f"instrument_type={itype!r} but instrument_binding=true"))
    if penalty and not binding:
        issues.append(("CRITICAL", "L3", f"max_penalty set but instrument_binding=false"))
    if prov.get("private_right_of_action") and not binding:
        issues.append(("CRITICAL", "L4", "private_right_of_action=true but instrument not binding"))
    if status == "in_force" and effective and effective > TODAY:
        issues.append(("CRITICAL", "L5", f"status=in_force but effective_date={effective} is future"))
    if scope not in VALID_SCOPES:
        issues.append(("CRITICAL", "L12", f"scope={scope!r} is not valid"))
    if lid.startswith("us-fed-") and binding and scope == "comprehensive":
        issues.append(("CRITICAL", "L7", "US federal comprehensive+binding — no such statute exists"))
    if binding and scope == "comprehensive" and n_rules < 5 and r.get("text_path"):
        issues.append(("WARNING", "L6", f"comprehensive law but only {n_rules} rules extracted"))
    if binding and scope == "sector_specific" and n_rules == 0 and r.get("text_path"):
        issues.append(("WARNING", "L6", f"sector-specific binding law but 0 rules extracted"))
    text_path = r.get("text_path", "")
    if text_path:
        full_path = PROJECT_ROOT / text_path
        if not full_path.exists():
            issues.append(("CRITICAL", "L13", f"text_path does not exist"))
    if r.get("legal_family") == "soft_law" and binding:
        issues.append(("CRITICAL", "L9", "legal_family=soft_law but instrument_binding=true"))
    return issues

def get_text_excerpt(r, max_chars=1500):
    text_path = r.get("text_path", "")
    if not text_path:
        return None
    full_path = (PROJECT_ROOT / text_path).resolve()
    if not str(full_path).startswith(str(PROJECT_ROOT.resolve()) + os.sep):
        return None
    if not full_path.exists():
        return None
    body = full_path.read_text(errors="replace")
    body = re.sub(r"^---.*?---\s*", "", body, flags=re.DOTALL).strip()
    body = re.sub(r"!\[.*?\]\(.*?\)", "", body)
    body = re.sub(r"\[.*?\]\(.*?\)", "", body)
    body = body.strip()
    if len(body) > max_chars:
        return body[:max_chars] + "\n…"
    return body

# ── Agent verification ────────────────────────────────────────────────────────

def build_agent_prompt(r, n_rules, issues):
    prov = r.get("provisions", {})
    text_excerpt = get_text_excerpt(r) or "(no text file available)"
    flags_text = "\n".join(f"- [{sev}] {code}: {msg}" for sev, code, msg in issues) or "None"

    return f"""You are verifying a law database entry for the AI regulation database.
Research this law using web search and verify each field, then produce a structured correction proposal.

## Law being verified
ID: {r['id']}
Name: {r.get('short_name', r['id'])}
Jurisdiction: {r.get('jurisdiction', '—')}
Official URL: {r.get('official_text_url', '—')}

## Current database claims
- Status: {r.get('status')}
- Instrument Binding: {r.get('instrument_binding')}
- Instrument Type: {r.get('instrument_type')}
- Scope: {r.get('scope')}
- Enacted Date: {r.get('enacted_date', '—')}
- Effective Date: {r.get('effective_date', '—')}
- Legal Family: {r.get('legal_family')}
- Max Penalty: {r.get('max_penalty', '—')}
- Max Penalty USD approx: {r.get('max_penalty_usd_approx', '—')}
- Private Right of Action: {prov.get('private_right_of_action')}
- Risk Classification System: {prov.get('risk_classification_system')}
- Prohibited Categories: {prov.get('prohibited_categories')}
- Impact Assessment Required: {prov.get('impact_assessment_required')}
- Human Review Right: {prov.get('human_review_right')}
- AI Interaction Disclosure: {prov.get('ai_interaction_disclosure')}
- Biometric Protection: {prov.get('biometric_protection')}
- AI Specific: {r.get('ai_specific')}
- Rules Extracted: {n_rules}

## Automated flags
{flags_text}

## Current summary
{r.get('summary', '—')}

## Current key obligations
{chr(10).join('- ' + ob for ob in r.get('key_obligations', [])) or '(none)'}

## Law text excerpt
{text_excerpt}

## Instructions
1. Web search for this law using its name, jurisdiction, and official URL.
2. Verify each field above against authoritative sources.
3. Pay special attention to: binding status, penalty amounts, effective dates, private right of action.
4. Check if the summary and key obligations are accurate and complete.

## Required output format (JSON only, no other text)
{{
  "verified_correct": ["list", "of", "field_names", "that_are_correct"],
  "corrections": {{
    "field_name": "corrected_value"
  }},
  "summary_accurate": true,
  "corrected_summary": null,
  "obligations_to_add": [],
  "obligations_to_remove": [],
  "needs_human_review": ["items requiring legal judgment"],
  "notes": "general notes for the reviewer",
  "confidence": "high|medium|low"
}}

Valid field names for corrections: status, instrument_binding, instrument_type, scope, enacted_date, effective_date, legal_family, max_penalty, max_penalty_usd_approx, summary, private_right_of_action, risk_classification_system, prohibited_categories, impact_assessment_required, human_review_right, ai_interaction_disclosure, biometric_protection, ai_specific

Return ONLY the JSON object, nothing else."""


# In-memory store for agent results (law_id -> result)
agent_results = {}
agent_running = set()
resolution_results = {}
resolution_running = set()

def run_agent_for_law(law_id):
    """Run in a background thread."""
    agent_running.add(law_id)
    try:
        regs, rules, _ = load_data()
        rc = rule_counts(rules)
        r = next((x for x in regs if x["id"] == law_id), None)
        if not r:
            agent_results[law_id] = {"error": "Law not found"}
            return

        n_rules = rc.get(law_id, 0)
        issues = run_checks(r, n_rules)
        prompt = build_agent_prompt(r, n_rules, issues)

        response = ANTHROPIC_CLIENT.messages.create(
            model="claude-opus-4-7",
            max_tokens=2048,
            tools=[{
                "name": "web_search",
                "type": "computer_20241022",
            }] if False else [],  # web search not available in this context; use knowledge
            messages=[{"role": "user", "content": prompt}]
        )

        raw = response.content[0].text.strip()
        # Extract JSON from response
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result["law_id"] = law_id
            result["generated_at"] = TODAY
            agent_results[law_id] = result
        else:
            agent_results[law_id] = {"error": "Could not parse agent response", "raw": raw[:500]}
    except Exception as e:
        agent_results[law_id] = {"error": str(e)}
    finally:
        agent_running.discard(law_id)

def apply_agent_result(law_id, result, reviewed_by="art@opendatalabs.xyz"):
    """Apply an agent result to regulations.json."""
    regs, rules, review_status = load_data()
    r = next((x for x in regs if x["id"] == law_id), None)
    if not r:
        return False, "Law not found"

    changes = []
    corrections = result.get("corrections", {})

    PROVISION_FIELDS = {
        "private_right_of_action", "risk_classification_system", "prohibited_categories",
        "impact_assessment_required", "human_review_right", "ai_interaction_disclosure",
        "biometric_protection", "ai_specific",
    }
    TOP_LEVEL = {
        "status", "instrument_binding", "instrument_type", "scope",
        "enacted_date", "effective_date", "legal_family", "max_penalty", "max_penalty_usd_approx",
    }

    for field, val in corrections.items():
        if val is None or val == "":
            continue
        if field == "summary":
            if r.get("summary") != val:
                changes.append(f"summary updated")
                r["summary"] = val
        elif field in TOP_LEVEL:
            if field == "instrument_binding":
                val = bool(val)
            if field == "max_penalty_usd_approx" and val:
                try: val = int(float(str(val).replace(",", "")))
                except: pass
            if r.get(field) != val:
                changes.append(f"{field}: {r.get(field)!r} → {val!r}")
                r[field] = val
        elif field in PROVISION_FIELDS:
            old = r.get("provisions", {}).get(field)
            if field == "ai_specific":
                if r.get("ai_specific") != val:
                    changes.append(f"ai_specific: {r.get('ai_specific')!r} → {val!r}")
                    r["ai_specific"] = val
            else:
                if old != val:
                    changes.append(f"provisions.{field}: {old!r} → {val!r}")
                    r.setdefault("provisions", {})[field] = val

    # Handle corrected_summary
    if not result.get("summary_accurate") and result.get("corrected_summary"):
        new_summary = result["corrected_summary"]
        if r.get("summary") != new_summary:
            changes.append("summary updated from agent")
            r["summary"] = new_summary

    # Handle obligations
    to_add = result.get("obligations_to_add", [])
    to_remove = result.get("obligations_to_remove", [])
    if to_add or to_remove:
        existing = r.get("key_obligations", [])
        new_list = [o for o in existing if o not in to_remove] + to_add
        if new_list != existing:
            changes.append(f"key_obligations: {len(existing)} → {len(new_list)} items")
            r["key_obligations"] = new_list

    r["last_verified"] = TODAY
    save_regulations(regs)

    review_status[law_id] = {
        "status": "reviewed",
        "reviewed_by": reviewed_by,
        "reviewed_date": TODAY,
        "changes_count": len(changes),
        "notes": result.get("notes", ""),
        "agent_assisted": True,
    }
    save_review_status(review_status)

    return True, changes


def fetch_and_save_text(law_id, url):
    """Fetch URL content, convert to clean text, save as law text file. Returns (ok, message)."""
    if not re.fullmatch(r"[a-z0-9][a-z0-9\-]{2,80}", law_id):
        return False, "invalid law_id"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            content_type = resp.headers.get("Content-Type", "")

        # For PDFs, just note we can't process them
        if "pdf" in content_type.lower() or url.lower().endswith(".pdf"):
            return False, "URL points to a PDF — paste the text content manually using the Resolution box instead."

        html = raw.decode("utf-8", errors="replace")

        # Strip HTML tags
        text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"&nbsp;", " ", text)
        text = re.sub(r"&amp;", "&", text)
        text = re.sub(r"&lt;", "<", text)
        text = re.sub(r"&gt;", ">", text)
        text = re.sub(r"&quot;", '"', text)
        text = re.sub(r"&#\d+;", "", text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = text.strip()

        if len(text) < 200:
            return False, f"Fetched content too short ({len(text)} chars) — may be a login page or error."

        # Save with frontmatter
        regs, _, _ = load_data()
        r = next((x for x in regs if x["id"] == law_id), None)
        short_name = r.get("short_name", law_id) if r else law_id

        out = f"""---
id: {law_id}
source_url: {url}
fetched_date: {TODAY}
---

{text[:50000]}"""

        text_path = PROJECT_ROOT / "data" / "texts" / f"{law_id}.md"
        text_path.write_text(out, encoding="utf-8")

        # Update official_text_url in regulations.json if not set
        if r and not r.get("official_text_url"):
            r["official_text_url"] = url
            if not r.get("text_path"):
                r["text_path"] = f"data/texts/{law_id}.md"
            save_regulations(regs)

        return True, f"Saved {len(text):,} chars from {url}"

    except Exception as e:
        return False, str(e)


def run_resolution_for_law(law_id, user_assessment):
    """Interpret free-text reviewer assessment and apply corrections. Runs in background thread."""
    resolution_running.add(law_id)
    try:
        regs, rules, _ = load_data()
        rc = rule_counts(rules)
        r = next((x for x in regs if x["id"] == law_id), None)
        if not r:
            resolution_results[law_id] = {"error": "Law not found"}
            return

        prov = r.get("provisions", {})
        prompt = f"""You are updating an AI regulation database entry based on a reviewer's written assessment.

## Law: {r.get('short_name', law_id)} ({law_id})

## Current database values
- Status: {r.get('status')}
- Instrument Binding: {r.get('instrument_binding')}
- Instrument Type: {r.get('instrument_type')}
- Scope: {r.get('scope')}
- Enacted Date: {r.get('enacted_date', '—')}
- Effective Date: {r.get('effective_date', '—')}
- Legal Family: {r.get('legal_family')}
- Max Penalty: {r.get('max_penalty', '—')}
- Max Penalty USD approx: {r.get('max_penalty_usd_approx', '—')}
- Private Right of Action: {prov.get('private_right_of_action')}
- Risk Classification System: {prov.get('risk_classification_system')}
- Prohibited Categories: {prov.get('prohibited_categories')}
- Impact Assessment Required: {prov.get('impact_assessment_required')}
- Human Review Right: {prov.get('human_review_right')}
- AI Interaction Disclosure: {prov.get('ai_interaction_disclosure')}
- Biometric Protection: {prov.get('biometric_protection')}
- AI Specific: {r.get('ai_specific')}

## Current summary
{r.get('summary', '—')}

## Current key obligations
{chr(10).join('- ' + ob for ob in r.get('key_obligations', [])) or '(none)'}

## Reviewer's assessment
{user_assessment}

## Task
Interpret the reviewer's assessment and produce the exact database corrections needed.
The reviewer is a qualified lawyer — trust their judgment completely.
If they say a field is wrong, correct it. If they provide new summary text, use it verbatim.
If they list obligations to add or remove, do exactly that.

## Required output format (JSON only, no other text)
{{
  "corrections": {{
    "field_name": "corrected_value"
  }},
  "corrected_summary": null,
  "obligations_to_add": [],
  "obligations_to_remove": [],
  "notes": "brief summary of what was changed and why",
  "confidence": "high"
}}

Valid field names: status, instrument_binding, instrument_type, scope, enacted_date, effective_date, legal_family, max_penalty, max_penalty_usd_approx, summary, private_right_of_action, risk_classification_system, prohibited_categories, impact_assessment_required, human_review_right, ai_interaction_disclosure, biometric_protection, ai_specific

Return ONLY the JSON object."""

        response = ANTHROPIC_CLIENT.messages.create(
            model="claude-opus-4-7",
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = response.content[0].text.strip()
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result["law_id"] = law_id
            result["generated_at"] = TODAY
            result["summary_accurate"] = not bool(result.get("corrected_summary"))
            resolution_results[law_id] = result
        else:
            resolution_results[law_id] = {"error": "Could not parse response", "raw": raw[:500]}
    except Exception as e:
        resolution_results[law_id] = {"error": str(e)}
    finally:
        resolution_running.discard(law_id)


# ── HTML UI ───────────────────────────────────────────────────────────────────

def render_html_list():
    regs, rules, review_status = load_data()
    rc = rule_counts(rules)
    reviewed_ids = {lid for lid, s in review_status.items() if s.get("status") == "reviewed"}

    # Group by tier
    by_tier = {1: [], 2: [], 3: [], 4: []}
    for r in regs:
        n = rc.get(r["id"], 0)
        t = review_tier(r, n)
        issues = run_checks(r, n)
        n_critical = sum(1 for i in issues if i[0] == "CRITICAL")
        n_warn = sum(1 for i in issues if i[0] == "WARNING")
        reviewed = r["id"] in reviewed_ids
        by_tier[t].append({
            "id": r["id"],
            "name": r.get("short_name", r["id"]),
            "jurisdiction": r.get("jurisdiction", ""),
            "status": r.get("status", ""),
            "binding": r.get("instrument_binding", False),
            "n_critical": n_critical,
            "n_warn": n_warn,
            "reviewed": reviewed,
        })

    total = len(regs)
    n_reviewed = len(reviewed_ids)

    rows_html = ""
    for t in [1, 2, 3, 4]:
        laws = by_tier[t]
        n_rev = sum(1 for l in laws if l["reviewed"])
        n_flag = sum(1 for l in laws if l["n_critical"] > 0 or l["n_warn"] > 0)
        rows_html += f"""
        <tr class="tier-header">
          <td colspan="5">
            <strong>Tier {t} — {TIER_LABELS[t]}</strong>
            <span class="tier-stats">{n_rev}/{len(laws)} reviewed · {n_flag} flagged</span>
          </td>
        </tr>"""
        # Sort: critical first, then warnings, then unreviewed
        laws.sort(key=lambda l: (0 if l["n_critical"] else 1 if l["n_warn"] else 2, l["name"]))
        for l in laws:
            flags = ""
            if l["n_critical"]:
                flags += f'<span class="badge critical">{l["n_critical"]} critical</span> '
            if l["n_warn"]:
                flags += f'<span class="badge warning">{l["n_warn"]} warning</span>'
            reviewed_badge = '<span class="badge reviewed">✓ reviewed</span>' if l["reviewed"] else ""
            rows_html += f"""
        <tr class="law-row {'reviewed' if l['reviewed'] else ''}">
          <td><a href="/review/{l['id']}">{l['name']}</a></td>
          <td class="small">{l['jurisdiction']}</td>
          <td class="small">{l['status']}</td>
          <td>{flags}{reviewed_badge}</td>
          <td><a href="/review/{l['id']}" class="btn-small">Review →</a></td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html>
<head>
<title>AI Regulation DB — Review Queue</title>
<style>
  body {{ font-family: -apple-system, sans-serif; max-width: 1100px; margin: 0 auto; padding: 24px; background: #f8f9fa; }}
  h1 {{ font-size: 1.4rem; margin-bottom: 4px; }}
  .progress {{ background: #e9ecef; border-radius: 8px; height: 8px; margin: 12px 0 24px; }}
  .progress-bar {{ background: #198754; border-radius: 8px; height: 8px; width: {int(n_reviewed/total*100)}%; }}
  .progress-label {{ font-size: 0.85rem; color: #666; margin-bottom: 4px; }}
  table {{ width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }}
  th {{ background: #343a40; color: white; padding: 10px 12px; text-align: left; font-size: 0.8rem; text-transform: uppercase; letter-spacing: .05em; }}
  td {{ padding: 9px 12px; border-bottom: 1px solid #f0f0f0; font-size: 0.875rem; }}
  .small {{ color: #666; font-size: 0.8rem; }}
  .tier-header td {{ background: #e9ecef; font-size: 0.85rem; padding: 8px 12px; }}
  .tier-stats {{ float: right; color: #666; font-weight: normal; }}
  .law-row:hover td {{ background: #f8f9fa; }}
  .law-row.reviewed td {{ opacity: 0.6; }}
  .badge {{ display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }}
  .badge.critical {{ background: #f8d7da; color: #842029; }}
  .badge.warning {{ background: #fff3cd; color: #664d03; }}
  .badge.reviewed {{ background: #d1e7dd; color: #0a3622; }}
  .btn-small {{ background: #0d6efd; color: white; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; }}
  .btn-small:hover {{ background: #0b5ed7; }}
  a {{ color: #0d6efd; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
</style>
</head>
<body>
<h1>AI Regulation DB — Review Queue</h1>
<div class="progress-label">{n_reviewed} of {total} laws reviewed ({int(n_reviewed/total*100)}%)</div>
<div class="progress"><div class="progress-bar"></div></div>
<table>
  <thead><tr>
    <th>Law</th><th>Jurisdiction</th><th>Status</th><th>Flags</th><th></th>
  </tr></thead>
  <tbody>{rows_html}</tbody>
</table>
</body>
</html>"""


def render_result_panel(res, source, law_id):
    """Render a correction proposal panel (used for both agent and resolution results)."""
    if "error" in res:
        return f'<div class="agent-error">Error: {res["error"]}</div>'

    corrections = res.get("corrections", {})
    corr_rows = ""
    for field, val in corrections.items():
        corr_rows += f"<tr><td>{field}</td><td class='val'>{val!r}</td></tr>"
    if not corr_rows:
        corr_rows = "<tr><td colspan='2' style='color:#666'>No field corrections — summary/obligation changes only</td></tr>"

    oblig_add = res.get("obligations_to_add", [])
    oblig_remove = res.get("obligations_to_remove", [])
    oblig_html = ""
    if oblig_add:
        oblig_html += "<strong>Add:</strong><ul>" + "".join(f"<li>{o}</li>" for o in oblig_add) + "</ul>"
    if oblig_remove:
        oblig_html += "<strong>Remove:</strong><ul>" + "".join(f"<li>{o}</li>" for o in oblig_remove) + "</ul>"

    summary_section = ""
    if not res.get("summary_accurate") and res.get("corrected_summary"):
        summary_section = f'<h4>Corrected Summary</h4><p class="corrected-text">{res["corrected_summary"]}</p>'

    needs_review = res.get("needs_human_review", [])
    needs_html = ("".join(f"<li>{item}</li>" for item in needs_review)) if needs_review else ""

    apply_endpoint = "/api/apply-result" if source == "agent" else "/api/apply-resolution"
    label = "Agent" if source == "agent" else "Your resolution"

    return f"""
    <div class="result-panel">
      <div class="result-header">
        {label} · confidence: <strong>{res.get('confidence','?')}</strong> · {res.get('generated_at','')}
      </div>
      <div class="result-notes">{res.get('notes','')}</div>
      {summary_section}
      <h4>Proposed field corrections</h4>
      <table class="corrections-table">
        <thead><tr><th>Field</th><th>New value</th></tr></thead>
        <tbody>{corr_rows}</tbody>
      </table>
      {'<h4>Obligation changes</h4>' + oblig_html if oblig_html else ''}
      {'<h4>Needs your judgment</h4><ul>' + needs_html + '</ul>' if needs_html else ''}
      <div class="apply-bar">
        <button onclick="applyResult('{apply_endpoint}')" class="btn btn-apply">✓ Apply to database</button>
      </div>
    </div>"""


def render_html_review(law_id):
    regs, rules, review_status = load_data()
    rc = rule_counts(rules)
    r = next((x for x in regs if x["id"] == law_id), None)
    if not r:
        return "<h1>Law not found</h1>"

    n_rules = rc.get(law_id, 0)
    issues = run_checks(r, n_rules)
    prov = r.get("provisions", {})
    rs = review_status.get(law_id, {})
    is_reviewed = rs.get("status") == "reviewed"
    text_excerpt = get_text_excerpt(r) or "(no text file available)"

    # Full text link
    text_path = r.get("text_path", "")
    fulltext_link = f'<a href="/text/{law_id}" target="_blank" class="fulltext-link">📄 View full text</a>' if text_path else ""

    flags_html = ""
    for sev, code, msg in issues:
        cls = "critical" if sev == "CRITICAL" else "warning"
        icon = "🔴" if sev == "CRITICAL" else "🟡"
        flags_html += f'<div class="flag {cls}">{icon} <strong>[{code}]</strong> {msg}</div>'
    if not flags_html:
        flags_html = '<div class="flag ok">✅ No automated flags</div>'

    # Agent result panel
    agent_panel = ""
    if law_id in agent_results:
        agent_panel = render_result_panel(agent_results[law_id], "agent", law_id)
    elif law_id in agent_running:
        agent_panel = '<div class="result-running"><span class="spinner">⟳</span> Agent is researching… <button onclick="location.reload()" class="btn-refresh">Refresh</button></div>'

    # Resolution result panel
    resolution_panel = ""
    if law_id in resolution_results:
        resolution_panel = render_result_panel(resolution_results[law_id], "resolution", law_id)
    elif law_id in resolution_running:
        resolution_panel = '<div class="result-running"><span class="spinner">⟳</span> Applying your resolution… <button onclick="location.reload()" class="btn-refresh">Refresh</button></div>'

    reviewed_banner = ""
    if is_reviewed:
        method = "agent-assisted" if rs.get("agent_assisted") else "manual"
        reviewed_banner = f"""<div class="reviewed-banner">
          ✓ Reviewed ({method}) by {rs.get('reviewed_by','?')} on {rs.get('reviewed_date','?')}
          · {rs.get('changes_count',0)} changes{' · ' + rs.get('notes','') if rs.get('notes') else ''}
        </div>"""

    def field_row(label, value, star=False):
        s = " <span class='star'>★</span>" if star else ""
        return f"<tr><td class='field-label'>{label}{s}</td><td>{value}</td></tr>"

    fields_html = "".join([
        field_row("Status", r.get("status",""), star=True),
        field_row("Instrument Binding", r.get("instrument_binding",""), star=True),
        field_row("Instrument Type", r.get("instrument_type",""), star=True),
        field_row("Scope", r.get("scope",""), star=True),
        field_row("Enacted Date", r.get("enacted_date","—")),
        field_row("Effective Date", r.get("effective_date","—")),
        field_row("Jurisdiction", r.get("jurisdiction","")),
        field_row("Legal Family", r.get("legal_family","")),
        field_row("Max Penalty", r.get("max_penalty","—"), star=True),
        field_row("Max Penalty USD approx", r.get("max_penalty_usd_approx","—")),
        field_row("Private Right of Action", prov.get("private_right_of_action",""), star=True),
        field_row("Risk Classification System", prov.get("risk_classification_system","")),
        field_row("Prohibited Categories", prov.get("prohibited_categories","")),
        field_row("Impact Assessment Required", prov.get("impact_assessment_required","")),
        field_row("Human Review Right", prov.get("human_review_right","")),
        field_row("AI Interaction Disclosure", prov.get("ai_interaction_disclosure","")),
        field_row("Biometric Protection", prov.get("biometric_protection","")),
        field_row("AI Specific", r.get("ai_specific","")),
        field_row("Rules Extracted", n_rules),
        field_row("Official URL", f'<a href="{r.get("official_text_url","")}" target="_blank">{r.get("official_text_url","—")}</a>'),
    ])

    obligations_html = "".join(f"<li>{ob}</li>" for ob in r.get("key_obligations", [])) or "<li>(none)</li>"

    return f"""<!DOCTYPE html>
<html>
<head>
<title>{r.get('short_name', law_id)} — Review</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1080px; margin: 0 auto; padding: 24px; background: #f8f9fa; color: #212529; }}
  .topbar {{ display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }}
  .back {{ color: #0d6efd; text-decoration: none; font-size: 0.875rem; }}
  .fulltext-link {{ font-size: 0.85rem; color: #0d6efd; text-decoration: none; padding: 3px 8px; border: 1px solid #0d6efd; border-radius: 4px; }}
  .fulltext-link:hover {{ background: #e8f0fe; }}
  h1 {{ font-size: 1.25rem; margin: 6px 0 4px; }}
  .meta {{ color: #666; font-size: 0.82rem; margin-bottom: 16px; }}
  .reviewed-banner {{ background: #d1e7dd; border: 1px solid #a3cfbb; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 0.875rem; }}
  .layout {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }}
  .card {{ background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 16px; }}
  .card h3 {{ margin: 0 0 10px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: .06em; color: #888; }}
  .flag {{ padding: 6px 10px; border-radius: 4px; margin-bottom: 5px; font-size: 0.84rem; }}
  .flag.critical {{ background: #f8d7da; }} .flag.warning {{ background: #fff3cd; }} .flag.ok {{ background: #d1e7dd; }}
  table.fields {{ width: 100%; border-collapse: collapse; font-size: 0.83rem; }}
  .field-label {{ color: #555; width: 48%; padding: 4px 0; vertical-align: top; }}
  .star {{ color: #e67e22; font-size: 0.75rem; }}
  table.fields td {{ padding: 4px 0; border-bottom: 1px solid #f2f2f2; }}
  .law-text {{ font-family: ui-monospace, monospace; font-size: 0.77rem; white-space: pre-wrap; background: #f8f9fa; padding: 12px; border-radius: 4px; max-height: 260px; overflow-y: auto; border: 1px solid #e9ecef; line-height: 1.5; }}
  .summary {{ font-size: 0.875rem; line-height: 1.6; }}
  .obligations {{ font-size: 0.875rem; padding-left: 18px; line-height: 1.6; }}
  .obligations li {{ margin-bottom: 3px; }}
  /* Action panel */
  .action-panel {{ background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-top: 0; }}
  .action-panel h3 {{ margin: 0 0 14px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: .06em; color: #888; }}
  .three-buttons {{ display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }}
  .btn {{ padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: opacity .15s; }}
  .btn:hover {{ opacity: .85; }}
  .btn:disabled {{ opacity: .5; cursor: default; }}
  .btn-agent {{ background: #0d6efd; color: white; }}
  .btn-resolve {{ background: #6f42c1; color: white; }}
  .btn-done {{ background: #6c757d; color: white; }}
  .btn-apply {{ background: #198754; color: white; }}
  .btn-refresh {{ background: none; border: 1px solid #999; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 0.8rem; margin-left: 8px; }}
  /* Resolution textarea */
  .resolution-box {{ display: none; margin-bottom: 16px; }}
  .resolution-box textarea {{ width: 100%; height: 120px; padding: 10px; border: 1px solid #ced4da; border-radius: 6px; font-size: 0.875rem; font-family: inherit; resize: vertical; }}
  .resolution-box .hint {{ font-size: 0.78rem; color: #888; margin-top: 4px; }}
  .resolution-box .submit-row {{ margin-top: 8px; display: flex; gap: 8px; align-items: center; }}
  /* Result panels */
  .result-panel {{ background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-top: 4px; }}
  .result-header {{ font-size: 0.82rem; color: #666; margin-bottom: 8px; }}
  .result-notes {{ background: white; border-left: 3px solid #6f42c1; padding: 8px 12px; border-radius: 0 4px 4px 0; font-size: 0.875rem; margin-bottom: 12px; }}
  .result-running {{ background: #fff3cd; padding: 10px 14px; border-radius: 6px; font-size: 0.875rem; }}
  .agent-error {{ background: #f8d7da; padding: 10px 14px; border-radius: 6px; font-size: 0.875rem; }}
  table.corrections-table {{ width: 100%; border-collapse: collapse; font-size: 0.84rem; margin-bottom: 12px; }}
  table.corrections-table th {{ background: #e9ecef; padding: 7px 10px; text-align: left; font-weight: 600; }}
  table.corrections-table td {{ padding: 6px 10px; border-bottom: 1px solid #f0f0f0; }}
  td.val {{ font-family: ui-monospace, monospace; font-size: 0.8rem; }}
  .apply-bar {{ margin-top: 14px; }}
  .corrected-text {{ background: #d1e7dd; padding: 10px 12px; border-radius: 4px; font-size: 0.875rem; line-height: 1.5; }}
  h4 {{ margin: 14px 0 6px; font-size: 0.85rem; font-weight: 600; }}
  .spinner {{ display: inline-block; animation: spin 1s linear infinite; }}
  @keyframes spin {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
  a {{ color: #0d6efd; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
  .divider {{ border: none; border-top: 1px solid #e9ecef; margin: 16px 0; }}
</style>
</head>
<body>
<div class="topbar">
  <a href="/" class="back">← All laws</a>
  {fulltext_link}
</div>
<h1>{r.get('short_name', law_id)}</h1>
<div class="meta">
  <code>{law_id}</code> · Tier {review_tier(r, n_rules)} — {TIER_LABELS[review_tier(r, n_rules)]}
  · {r.get('jurisdiction','')} · {r.get('status','')}
</div>

{reviewed_banner}

<div class="layout">
  <div>
    <div class="card">
      <h3>Automated Flags</h3>
      {flags_html}
    </div>
    <div class="card">
      <h3>Database Claims <span style="font-size:0.72rem;color:#bbb;font-weight:normal">&nbsp;★ = most consequential</span></h3>
      <table class="fields"><tbody>{fields_html}</tbody></table>
    </div>
  </div>
  <div>
    <div class="card">
      <h3>Summary</h3>
      <p class="summary">{r.get('summary','—')}</p>
    </div>
    <div class="card">
      <h3>Key Obligations</h3>
      <ul class="obligations">{obligations_html}</ul>
    </div>
    <div class="card">
      <h3>Law Text Excerpt</h3>
      <div class="law-text">{text_excerpt}</div>
    </div>
  </div>
</div>

<div class="action-panel">
  <h3>Your Decision</h3>
  <div class="three-buttons">
    <button onclick="runAgent(this)" class="btn btn-agent">🔍 Agentic Assistance</button>
    <button onclick="toggleResolution()" class="btn btn-resolve">✏️ Resolution</button>
    <button onclick="markDone()" class="btn btn-done">✓ Resolved — No Changes</button>
  </div>

  <div class="resolution-box" id="resolutionBox">
    <textarea id="resolutionText" placeholder="Describe what needs to change. E.g.: 'The effective date is wrong — should be 2023-06-01 based on the Official Journal. The penalty is €50M not €35M. Add an obligation about post-market monitoring.'"></textarea>
    <div class="hint">Plain English. The agent will interpret your assessment and update the database fields accordingly.</div>
    <div class="submit-row">
      <button onclick="submitResolution(this)" class="btn btn-resolve">Submit resolution</button>
    </div>
  </div>

  {('<hr class="divider"><h4 style="margin-top:0">Agentic Assistance Result</h4>' + agent_panel) if agent_panel else ''}
  {('<hr class="divider"><h4 style="margin-top:0">Resolution Result</h4>' + resolution_panel) if resolution_panel else ''}
</div>

<div class="action-panel" style="margin-top:12px">
  <h3>Source Text</h3>
  <p style="font-size:.84rem;color:#666;margin:0 0 10px">
    Current file: <code>{r.get('text_path') or '(none)'}</code>
    {f'&nbsp;·&nbsp;<a href="/text/{law_id}" target="_blank">view</a>' if r.get('text_path') else ''}
  </p>
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <input id="sourceUrl" type="url" placeholder="Paste correct source URL…"
      value="{r.get('official_text_url') or ''}"
      style="flex:1;min-width:300px;padding:8px 10px;border:1px solid #ced4da;border-radius:6px;font-size:.875rem">
    <button onclick="fetchText()" class="btn btn-agent" style="white-space:nowrap">⬇ Fetch &amp; replace text</button>
  </div>
  <div id="fetchMsg" style="font-size:.82rem;margin-top:8px;color:#666"></div>
  <div style="margin-top:10px">
    <details>
      <summary style="font-size:.82rem;color:#666;cursor:pointer">Or paste text directly</summary>
      <textarea id="pasteText" style="width:100%;height:160px;margin-top:8px;padding:10px;border:1px solid #ced4da;border-radius:6px;font-size:.8rem;font-family:ui-monospace,monospace" placeholder="Paste raw law text here…"></textarea>
      <button onclick="saveText()" class="btn btn-resolve" style="margin-top:6px;font-size:.82rem;padding:6px 14px">Save pasted text</button>
    </details>
  </div>
</div>

<script>
const lawId = {json.dumps(law_id)};

function toggleResolution() {{
  const box = document.getElementById('resolutionBox');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
  if (box.style.display === 'block') document.getElementById('resolutionText').focus();
}}

async function runAgent(btn) {{
  btn.disabled = true;
  btn.textContent = '⟳ Researching…';
  await fetch('/api/run-agent', {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{law_id: lawId}})
  }});
  pollStatus('/api/agent-status/' + lawId);
}}

async function submitResolution(btn) {{
  const text = document.getElementById('resolutionText').value.trim();
  if (!text) {{ alert('Please describe what needs to change.'); return; }}
  btn.disabled = true;
  btn.textContent = '⟳ Processing…';
  await fetch('/api/run-resolution', {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{law_id: lawId, assessment: text}})
  }});
  pollStatus('/api/resolution-status/' + lawId);
}}

function pollStatus(url) {{
  const interval = setInterval(async () => {{
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'running') {{
      clearInterval(interval);
      location.reload();
    }}
  }}, 2000);
}}

async function applyResult(endpoint) {{
  if (!confirm('Apply these corrections to the database?')) return;
  const res = await fetch(endpoint, {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{law_id: lawId}})
  }});
  const data = await res.json();
  if (data.ok) {{
    location.reload();
  }} else {{
    alert('Error: ' + data.error);
  }}
}}

async function markDone() {{
  if (!confirm('Mark as reviewed with no changes?')) return;
  const res = await fetch('/api/mark-reviewed', {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{law_id: lawId}})
  }});
  const data = await res.json();
  if (data.ok) location.reload();
  else alert('Error: ' + data.error);
}}

async function fetchText() {{
  const url = document.getElementById('sourceUrl').value.trim();
  if (!url) {{ alert('Paste a URL first.'); return; }}
  const msg = document.getElementById('fetchMsg');
  msg.textContent = '⟳ Fetching…';
  const res = await fetch('/api/fetch-text', {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{law_id: lawId, url}})
  }});
  const data = await res.json();
  msg.textContent = data.ok ? '✓ ' + data.message : '✗ ' + data.error;
  msg.style.color = data.ok ? '#198754' : '#dc3545';
  if (data.ok) setTimeout(() => location.reload(), 1200);
}}

async function saveText() {{
  const text = document.getElementById('pasteText').value.trim();
  if (!text) {{ alert('Nothing to save.'); return; }}
  const res = await fetch('/api/save-text', {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{law_id: lawId, text}})
  }});
  const data = await res.json();
  if (data.ok) {{ alert('Saved.'); location.reload(); }}
  else alert('Error: ' + data.error);
}}
</script>
</body>
</html>"""

# ── HTTP server ───────────────────────────────────────────────────────────────

class ReviewHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress default logging

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_html(self, html, status=200):
        body = html.encode()
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "":
            self.send_html(render_html_list())
        elif path.startswith("/review/"):
            law_id = path[len("/review/"):]
            self.send_html(render_html_review(law_id))
        elif path.startswith("/api/agent-status/"):
            law_id = path[len("/api/agent-status/"):]
            if law_id in agent_running:
                self.send_json({"status": "running"})
            elif law_id in agent_results:
                self.send_json({"status": "done", "result": agent_results[law_id]})
            else:
                self.send_json({"status": "idle"})

        elif path.startswith("/api/resolution-status/"):
            law_id = path[len("/api/resolution-status/"):]
            if law_id in resolution_running:
                self.send_json({"status": "running"})
            elif law_id in resolution_results:
                self.send_json({"status": "done"})
            else:
                self.send_json({"status": "idle"})

        elif path.startswith("/text/"):
            law_id = path[len("/text/"):]
            regs, _, _ = load_data()
            r = next((x for x in regs if x["id"] == law_id), None)
            if r and r.get("text_path"):
                text_path_val = r["text_path"]
                full_path = (PROJECT_ROOT / text_path_val).resolve()
                # Guard against path traversal
                if not str(full_path).startswith(str(PROJECT_ROOT.resolve()) + os.sep):
                    self.send_html("<h1>Forbidden</h1>", 403)
                    return
                if full_path.exists():
                    content = full_path.read_text(errors="replace")
                    name = r.get("short_name", law_id)
                    safe_name    = html_module.escape(name)
                    safe_law_id  = html_module.escape(law_id)
                    safe_content = html_module.escape(content)
                    safe_path    = html_module.escape(text_path_val)
                    html_out = f"""<!DOCTYPE html><html><head><title>{safe_name} — Full Text</title>
<style>body{{font-family:-apple-system,sans-serif;max-width:860px;margin:0 auto;padding:24px;}}
.back{{color:#0d6efd;text-decoration:none;font-size:.875rem;display:block;margin-bottom:16px;}}
pre{{white-space:pre-wrap;font-size:.82rem;line-height:1.6;background:#f8f9fa;padding:16px;border-radius:6px;border:1px solid #e9ecef;}}
h1{{font-size:1.2rem;margin-bottom:4px;}}
.meta{{color:#666;font-size:.82rem;margin-bottom:16px;}}
</style></head><body>
<a href="/review/{safe_law_id}" class="back">← Back to review card</a>
<h1>{safe_name}</h1>
<div class="meta"><code>{safe_law_id}</code> · {safe_path}</div>
<pre>{safe_content}</pre>
</body></html>"""
                    self.send_html(html_out)
                else:
                    self.send_html("<h1>Text file not found</h1>", 404)
            else:
                self.send_html("<h1>No text file for this law</h1>", 404)
        else:
            self.send_html("<h1>Not found</h1>", 404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        path = urlparse(self.path).path

        if path == "/api/run-agent":
            law_id = body.get("law_id", "")
            if not law_id:
                self.send_json({"error": "missing law_id"}, 400)
                return
            if law_id not in agent_running:
                t = threading.Thread(target=run_agent_for_law, args=(law_id,), daemon=True)
                t.start()
            self.send_json({"ok": True, "status": "running"})

        elif path == "/api/run-resolution":
            law_id = body.get("law_id", "")
            assessment = body.get("assessment", "")
            if not law_id or not assessment:
                self.send_json({"error": "missing law_id or assessment"}, 400)
                return
            if law_id not in resolution_running:
                t = threading.Thread(target=run_resolution_for_law, args=(law_id, assessment), daemon=True)
                t.start()
            self.send_json({"ok": True, "status": "running"})

        elif path == "/api/apply-result":
            law_id = body.get("law_id", "")
            result = agent_results.get(law_id)
            if not result:
                self.send_json({"error": "No agent result for this law"}, 400)
                return
            ok, changes = apply_agent_result(law_id, result)
            if ok:
                self.send_json({"ok": True, "changes": changes})
            else:
                self.send_json({"error": changes}, 500)

        elif path == "/api/apply-resolution":
            law_id = body.get("law_id", "")
            result = resolution_results.get(law_id)
            if not result:
                self.send_json({"error": "No resolution result for this law"}, 400)
                return
            ok, changes = apply_agent_result(law_id, result)
            if ok:
                self.send_json({"ok": True, "changes": changes})
            else:
                self.send_json({"error": changes}, 500)

        elif path == "/api/fetch-text":
            law_id = body.get("law_id", "")
            url = body.get("url", "")
            if not law_id or not url:
                self.send_json({"error": "missing law_id or url"}, 400)
                return
            ok, msg = fetch_and_save_text(law_id, url)
            if ok:
                self.send_json({"ok": True, "message": msg})
            else:
                self.send_json({"error": msg})

        elif path == "/api/save-text":
            law_id = body.get("law_id", "")
            text = body.get("text", "")
            if not law_id or not text:
                self.send_json({"error": "missing law_id or text"}, 400)
                return
            if not re.fullmatch(r"[a-z0-9][a-z0-9\-]{2,80}", law_id):
                self.send_json({"error": "invalid law_id"}, 400)
                return
            text_path = PROJECT_ROOT / "data" / "texts" / f"{law_id}.md"
            out = f"---\nid: {law_id}\nsaved_date: {TODAY}\n---\n\n{text}"
            text_path.write_text(out, encoding="utf-8")
            # Ensure text_path is set in regulations.json
            regs, _, _ = load_data()
            r = next((x for x in regs if x["id"] == law_id), None)
            if r and not r.get("text_path"):
                r["text_path"] = f"data/texts/{law_id}.md"
                save_regulations(regs)
            self.send_json({"ok": True})

        elif path == "/api/mark-reviewed":
            law_id = body.get("law_id", "")
            _, _, review_status = load_data()
            review_status[law_id] = {
                "status": "reviewed",
                "reviewed_by": "art@opendatalabs.xyz",
                "reviewed_date": TODAY,
                "changes_count": 0,
                "notes": "Verified — no changes needed",
                "agent_assisted": False,
            }
            save_review_status(review_status)
            self.send_json({"ok": True})

        else:
            self.send_json({"error": "not found"}, 404)


def main():
    port = 7331
    os.chdir(PROJECT_ROOT)
    print(f"\n{'='*50}")
    print(f"  AI Regulation Review UI")
    print(f"  http://localhost:{port}")
    print(f"{'='*50}\n")
    server = HTTPServer(("localhost", port), ReviewHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")

if __name__ == "__main__":
    main()
