# GAIA — Global AI Atlas

A structured, machine-readable database of AI legislation, regulations, and policy instruments worldwide. 164 instruments across 52+ jurisdictions as of April 2026.

**Maintainer:** [Art Abal](https://github.com/artvana) · MIT License · Contributions welcome

---

## What's in the database

Each record in [`data/regulations.json`](data/regulations.json) captures:

- **Metadata** — jurisdiction, status, category, legal family, dates
- **Provisions** — binding status, AI-specificity, private right of action, penalty ranges
- **Lineage** — `inspired_by` and `influenced` cross-references between laws
- **Issue positions** — stance on facial recognition, generative AI, algorithmic accountability
- **Key obligations** — human oversight, impact assessments, transparency, audit rights
- **Full legal text** (where available) in `data/texts/`

## Schema quick reference

| Field | Type | Values |
|---|---|---|
| `id` | string | `{iso}-{jurisdiction}-{slug}-{year}` |
| `country` | string | Country name or `"Global / Regional"` |
| `jurisdiction` | string | Country, state, agency, or supranational body |
| `jurisdiction_type` | enum | `supranational · national · subnational · agency` |
| `status` | enum | `in_force · enacted_not_yet_effective · superseded · failed` |
| `primary_category` | enum | See categories below |
| `legal_family` | enum | `eu_risk_based · us_consumer_protection · china_state_sovereignty · uk_non_model · hybrid · standalone` |
| `instrument_binding` | boolean | Creates binding legal obligations |
| `ai_specific` | boolean | AI-specific vs. general tech/data law |
| `operative_dates` | string\|null | Free-text for phased implementation timelines |

### Categories

| Value | Subject matter |
|---|---|
| `data_protection` | Personal data, privacy, data subject rights |
| `algorithmic_systems` | Automated decision-making, accountability |
| `synthetic_media` | Deepfakes, AI-generated content, watermarking |
| `biometric_identity` | Facial recognition, biometric data |
| `ip_creative_rights` | Copyright, training data, AI authorship |
| `national_security` | Defence, surveillance, critical infrastructure |
| `sector_healthcare` | Medical AI, clinical decision support |
| `sector_employment` | Hiring algorithms, workplace AI |
| `sector_financial` | Credit scoring, trading, financial AI |
| `sector_education` | EdTech, academic integrity |
| `general_ai_governance` | Horizontal AI governance frameworks |

## Running locally

```bash
npm install
npm run dev        # Web app → localhost:5173
npm run validate   # Validate regulations.json against schema
npm run mcp        # Start MCP server (stdio)
```

## MCP Server

GAIA ships a [Model Context Protocol](https://modelcontextprotocol.io) server so AI assistants can query the database as a live tool.

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gaia": {
      "command": "npx",
      "args": ["tsx", "/path/to/global-ai-atlas/mcp/server.ts"]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add gaia -- npx tsx /path/to/global-ai-atlas/mcp/server.ts
```

### Tools exposed

| Tool | Description |
|---|---|
| `list_regulations` | List and filter by any metadata field |
| `search_regulations` | Full-text search across names, summaries, topics |
| `get_regulation` | Full record for a single instrument by ID |
| `get_regulation_text` | Full legal text (paginated) |
| `compare_regulations` | Side-by-side of provisions, penalties, scope |
| `get_stats` | Aggregate statistics across the database |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version:

1. Edit `data/regulations.json` following the schema
2. Run `npm run validate`
3. Open a PR with sources linked

New instruments, metadata corrections, and full-text additions are all welcome.

## License

MIT — data and code are free to use, adapt, and redistribute with attribution.
