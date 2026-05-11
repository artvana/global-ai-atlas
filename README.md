# GAIA — Global AI Atlas

A structured, open database of AI legislation, regulations, and policy instruments worldwide — with a web interface for exploration and an MCP server for AI-assisted research.

**2,482 instruments · 488 in force · 427 binding · 90 jurisdictions · 3,128 extracted rules**

Maintained by [Art Abal](https://abal.art) · MIT License · [art@abal.art](mailto:art@abal.art)

---

## What's in the database

Each record in [`data/regulations.json`](data/regulations.json) captures:

- **Identity** — jurisdiction, instrument type, bill number, enactment and effective dates
- **Status** — `in_force`, `enacted_not_yet_effective`, `proposed`, `vetoed`, `failed`, `rescinded`
- **Classification** — primary category, legal family, AI-specificity, binding status
- **Provisions** — private right of action, human review right, penalty ranges (USD approx), enforcement body
- **Lineage** — `inspired_by` and `influenced` cross-references between laws
- **Full legal text** (where available) in [`data/texts/`](data/texts/)
- **Extracted rules** — 3,128 discrete policy obligations from binding instruments in [`data/rules.json`](data/rules.json)

## Web interface

The atlas ships as a React app with five views:

| Tab | What it does |
|-----|-------------|
| **Convergence Map** | Pairwise similarity heatmap across all jurisdictions using modified cosine similarity over rule vectors |
| **Global Map** | World choropleth of instruments in force; filter by binding/policy. Includes Rule Explorer: browse 21 policy categories, see adoption rates per rule, recolour map by jurisdiction alignment |
| **Laws Database** | Full-text searchable table with filters for country, status, category, legal family, binding status, private right of action, and date range. CSV/JSON export |
| **Enforcement** | Enforcement actions tracker (beta) |
| **Methodology** | Academic documentation of corpus definition, rule extraction procedure, and the mathematical framework behind the convergence computation |

## Running locally

```bash
npm install
npm run dev        # Web app → localhost:5173
npm run validate   # Validate regulations.json against schema
npm run mcp        # Start MCP server (stdio)
```

## MCP Server

GAIA ships a [Model Context Protocol](https://modelcontextprotocol.io) server so AI assistants can query the full database as a live tool — searching laws, comparing provisions, reading legal texts, and exploring cross-jurisdictional rule adoption.

### Claude Desktop setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Replace `/path/to/global-ai-atlas` with the actual path where you cloned the repo.

### Claude Code (CLI)

```bash
claude mcp add gaia -- npx tsx /path/to/global-ai-atlas/mcp/server.ts
```

### Available tools

| Tool | Description |
|------|-------------|
| `list_regulations` | List and filter instruments by any metadata field |
| `search_regulations` | Full-text search across names, summaries, obligations, topics |
| `get_regulation` | Complete record for a single instrument by ID |
| `get_regulation_text` | Full legal text (paginated for long documents) |
| `compare_regulations` | Side-by-side comparison of provisions, penalties, and scope |
| `get_stats` | Aggregate statistics across the database |
| `list_rule_categories` | List all 21 policy-area categories with rule counts |
| `search_rules` | Keyword search over extracted rule text and tags |
| `get_rule` | Full rule record including all jurisdiction instances |
| `get_rule_consensus` | Most widely adopted rules ranked by binding-law adoption count |

### Example queries

```
Which EU AI Act requirements have been adopted by the most jurisdictions globally?
Compare the penalty regimes in the EU AI Act, Colorado SB 24-205, and Brazil's AI Bill.
List all binding laws currently in force in Southeast Asia.
Find all rules about algorithmic hiring decisions in binding instruments.
```

## Schema quick reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | `{iso}-{jurisdiction}-{slug}-{year}` |
| `status` | enum | `in_force · enacted_not_yet_effective · proposed · vetoed · failed · rescinded` |
| `instrument_binding` | boolean | Creates legally enforceable obligations with penalties |
| `instrument_type` | enum | `statute · executive_order · regulation · directive · treaty · guidance` |
| `legal_family` | enum | `eu_risk_based · us_consumer_protection · china_state_sovereignty · uk_non_model · hybrid · standalone` |
| `primary_category` | enum | One of 21 policy categories (see Methodology tab) |
| `max_penalty_usd_approx` | number\|null | Statutory maximum penalty, USD approximate |
| `provisions.*` | boolean | Operative obligation flags |

## Data files

| File | Contents |
|------|----------|
| `data/regulations.json` | All 2,482 instrument records |
| `data/rules.json` | 8,528 extracted policy rules with cross-jurisdiction instance mapping |
| `data/texts/` | Full legal texts as Markdown (where available) |
| `data/enforcement.json` | Enforcement actions tracker |

## Methodology

Corpus definition, inclusion criteria, rule extraction procedure, and the mathematical framework for the Convergence Map are documented in the [Methodology tab](https://github.com/artvana/global-ai-atlas) of the web app and in [`docs/methodology.md`](docs/methodology.md).

Key points:
- Instruments included only if binding, AI-targeted, and enacted
- Rules extracted from full legal texts using LLM with structured prompts
- Cross-jurisdictional deduplication via Jaccard similarity + LLM confirmation
- Convergence computed as conflict-weighted cosine similarity over rule adoption vectors

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version:

1. Edit `data/regulations.json` following the schema in [`SCHEMA.md`](SCHEMA.md)
2. Run `npm run validate` — resolve all errors before submitting
3. Open a PR with sources linked in the `notable` field

New instruments, metadata corrections, full-text additions, and enforcement actions are all welcome.

## Contact

Questions, corrections, or collaboration: [art@abal.art](mailto:art@abal.art)

## License

MIT — data and code are free to use, adapt, and redistribute with attribution.
