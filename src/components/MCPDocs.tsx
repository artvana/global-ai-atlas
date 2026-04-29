const SERVER_PATH = '/Users/art/Desktop/claude-projects/ai-regulation-db'

const TOOLS = [
  {
    name: 'list_regulations',
    description: 'List all regulations with optional field filters.',
    example: '{"filters": {"region": "EU", "status": "in_force"}, "limit": 50}',
  },
  {
    name: 'search_regulations',
    description: 'Full-text search across names, summaries, topics, jurisdictions, and obligations.',
    example: '{"query": "biometric facial recognition employment", "limit": 20}',
  },
  {
    name: 'get_regulation',
    description: 'Full metadata for a single law by ID — provisions, penalties, issue positions, lineage.',
    example: '{"id": "eu-eu-aiact-2024"}',
  },
  {
    name: 'get_regulation_text',
    description: 'Full legal text (markdown). Paginate with offset/limit for large documents.',
    example: '{"id": "eu-eu-aiact-2024", "offset": 0, "limit": 50000}',
  },
  {
    name: 'compare_regulations',
    description: 'Side-by-side comparison of provisions, penalties, scope, and issue positions.',
    example: '{"ids": ["eu-eu-aiact-2024", "us-co-sb24205-2024", "br-br-aiact-2025"]}',
  },
  {
    name: 'get_stats',
    description: 'Summary statistics: counts by status, jurisdiction type, region, category, year.',
    example: '{}',
  },
]

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-odl-surface border border-odl-border rounded-card p-3 text-xs font-mono text-odl-muted overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold text-odl-subtle uppercase tracking-wider mb-3 mt-8 first:mt-0">{children}</h2>
}

export function MCPDocs() {
  return (
    <div className="max-w-3xl space-y-0">
      <div className="panel p-6 mb-6">
        <h1 className="text-base font-semibold text-odl-text mb-1">AI Regulation DB — MCP Server</h1>
        <p className="text-sm text-odl-muted leading-relaxed">
          This repository ships an MCP (Model Context Protocol) server that gives Claude — or any MCP-compatible agent — structured access to the full regulation database, including legal text, metadata, provisions, penalties, and issue-level analysis.
        </p>
      </div>

      <SectionHead>Setup</SectionHead>
      <div className="space-y-3">
        <p className="text-sm text-odl-muted">The server is already wired into Claude's project config. To use it in a new Claude Code session, add this to <code className="text-xs bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">~/.claude.json</code> under <code className="text-xs bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">projects["/path/to/project"].mcpServers</code>:</p>
        <Code>{`"ai-regulation-db": {
  "command": "npx",
  "args": ["tsx", "${SERVER_PATH}/mcp/server.ts"],
  "type": "stdio"
}`}</Code>

        <p className="text-sm text-odl-muted mt-4">Or run it directly to test:</p>
        <Code>{`cd ${SERVER_PATH}
npm run mcp`}</Code>
      </div>

      <SectionHead>Available Tools</SectionHead>
      <div className="space-y-3">
        {TOOLS.map(tool => (
          <div key={tool.name} className="panel p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <code className="text-sm font-mono font-semibold text-odl-accent">{tool.name}</code>
            </div>
            <p className="text-sm text-odl-muted mb-3">{tool.description}</p>
            <div className="text-xs text-odl-subtle mb-1">Example input</div>
            <Code>{tool.example}</Code>
          </div>
        ))}
      </div>

      <SectionHead>Data Model</SectionHead>
      <div className="panel p-4 space-y-3">
        <p className="text-sm text-odl-muted">Each regulation record includes:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            ['id, short_name, full_name', 'Identifiers'],
            ['jurisdiction, jurisdiction_type, region', 'Geography'],
            ['enacted_date, effective_date, status', 'Timeline'],
            ['instrument_type, legal_family, scope', 'Classification'],
            ['provisions (17 boolean flags)', 'What the law requires'],
            ['issue_positions (11 structured positions)', 'Policy stance analysis'],
            ['max_penalty, max_penalty_usd_approx', 'Enforcement'],
            ['key_obligations, topics, sector_tags', 'Semantic metadata'],
            ['inspired_by, influenced', 'Legislative lineage'],
            ['text_path → full markdown text', 'Legal text (paginated)'],
          ].map(([field, label]) => (
            <div key={field} className="flex flex-col gap-0.5">
              <code className="text-odl-accent text-[11px]">{field}</code>
              <span className="text-odl-subtle">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionHead>Example Queries for Claude</SectionHead>
      <div className="space-y-2 text-sm text-odl-muted">
        {[
          'Compare the EU AI Act, Colorado AI Act, and Brazil AI Act on prohibited categories and enforcement.',
          'Which laws have a private right of action and biometric protection?',
          'Show me all in-force national AI laws in Asia-Pacific.',
          'What does the full text of the EU AI Act say about high-risk AI systems in employment?',
          'Which US state laws have the highest maximum penalties?',
          'Find all laws that address synthetic media and deepfakes.',
          'Compare how different jurisdictions handle algorithmic pricing.',
        ].map(q => (
          <div key={q} className="flex gap-2 items-start">
            <span className="text-odl-accent mt-0.5 flex-shrink-0">→</span>
            <span>"{q}"</span>
          </div>
        ))}
      </div>

      <SectionHead>Open Source</SectionHead>
      <p className="text-sm text-odl-muted leading-relaxed">
        This database and MCP server are open source under the MIT License. The regulation data, full legal texts, metadata schema, and MCP server are all included in the repository.
        Contributions — new laws, metadata corrections, text updates — are welcome via pull request.
      </p>
    </div>
  )
}
