function Code({ children }: { children: string }) {
  return (
    <pre className="bg-odl-surface border border-odl-border rounded p-3 text-xs font-mono text-odl-text overflow-x-auto whitespace-pre-wrap select-all">
      {children}
    </pre>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-odl-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-odl-text mb-1.5">{title}</div>
        <div className="text-sm text-odl-muted leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  )
}

function Callout({ type, children }: { type: 'tip' | 'note' | 'check'; children: React.ReactNode }) {
  const styles = {
    tip:   'bg-blue-50 border-blue-200 text-blue-800',
    note:  'bg-amber-50 border-amber-200 text-amber-800',
    check: 'bg-green-50 border-green-200 text-green-800',
  }
  const icons = { tip: 'ℹ', note: '⚠', check: '✓' }
  return (
    <div className={`border rounded px-3 py-2.5 text-xs leading-relaxed flex gap-2 ${styles[type]}`}>
      <span className="flex-shrink-0 font-bold">{icons[type]}</span>
      <span>{children}</span>
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-odl-subtle uppercase tracking-wider pt-8 pb-3 border-b border-odl-border">
      {children}
    </h2>
  )
}

const TOOLS = [
  {
    name: 'Search regulations',
    tool: 'search_regulations',
    what: 'Find laws on any topic — searches names, summaries, obligations, and sector tags.',
    ask: '"Find all laws that regulate algorithmic hiring decisions."',
  },
  {
    name: 'Get full record',
    tool: 'get_regulation',
    what: 'Retrieve complete metadata for a specific law: provisions, penalties, enforcement body, policy positions, and legislative lineage.',
    ask: '"Show me the full record for the EU AI Act."',
  },
  {
    name: 'Compare laws',
    tool: 'compare_regulations',
    what: 'Side-by-side comparison of any number of laws on provisions, penalties, scope, and enforcement.',
    ask: '"Compare the EU AI Act, Colorado AI Act, and Brazil\'s AI Bill on prohibited uses and penalties."',
  },
  {
    name: 'Read legal text',
    tool: 'get_regulation_text',
    what: 'Retrieve the full text of a law as markdown. For long documents, Claude pages through it automatically.',
    ask: '"What does the full text of the EU AI Act say about high-risk AI in employment?"',
  },
  {
    name: 'Filter and list',
    tool: 'list_regulations',
    what: 'Browse the database with filters — by country, status, category, legal family, or any other field.',
    ask: '"List all binding AI laws currently in force in Asia-Pacific."',
  },
  {
    name: 'Database statistics',
    tool: 'get_stats',
    what: 'Summary counts by jurisdiction, status, category, and year — useful for the intro paragraph of any research note.',
    ask: '"Give me headline statistics on global AI regulation for my article."',
  },
]

export function MCPDocs() {
  return (
    <div className="max-w-2xl space-y-0">

      {/* Hero */}
      <div className="panel p-6 mb-2">
        <h1 className="text-base font-semibold text-odl-text mb-2">Use GAIA with Claude Desktop</h1>
        <p className="text-sm text-odl-muted leading-relaxed">
          Once set up, Claude can query this entire database on your behalf — searching laws, comparing provisions,
          reading full legal texts, and pulling statistics — all from a normal conversation.
          No search box. No manual lookup. Just ask.
        </p>
        <div className="mt-3 text-xs text-odl-subtle">
          Setup time: approximately 10 minutes · Works on Mac and Windows · Requires Claude Desktop (free or paid)
        </div>
      </div>

      <SectionHead>What you'll need</SectionHead>
      <div className="space-y-2 text-sm text-odl-muted">
        <p>Before you start, make sure you have these three things installed. Each link goes to the official download page.</p>
        <div className="grid grid-cols-1 gap-2 pt-1">
          {[
            {
              name: 'Claude Desktop',
              url: 'https://claude.ai/download',
              note: 'The desktop app — not the browser version. Download from claude.ai/download.',
            },
            {
              name: 'Node.js (LTS)',
              url: 'https://nodejs.org',
              note: 'Click the big "LTS" button on nodejs.org. This is the engine that runs the database server.',
            },
            {
              name: 'Git',
              url: 'https://git-scm.com/downloads',
              note: 'Lets you download the database to your computer. On Mac, you may already have it.',
            },
          ].map(item => (
            <div key={item.name} className="flex gap-3 panel p-3">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-odl-accent mt-2" />
              <div>
                <a href={item.url} target="_blank" rel="noreferrer" className="odl-link text-sm font-medium">{item.name}</a>
                <p className="text-xs text-odl-subtle mt-0.5">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionHead>Setup — step by step</SectionHead>
      <div className="space-y-6">

        <Step n={1} title="Open your Terminal">
          <p>
            <strong>On Mac:</strong> press <kbd className="border border-odl-border rounded px-1 py-0.5 text-xs font-mono bg-odl-surface">⌘ Space</kbd>, type <em>Terminal</em>, press Enter.
          </p>
          <p>
            <strong>On Windows:</strong> press <kbd className="border border-odl-border rounded px-1 py-0.5 text-xs font-mono bg-odl-surface">Win</kbd>, type <em>PowerShell</em>, press Enter.
          </p>
          <p>A black or white window will open with a blinking cursor. That's normal — it's waiting for you to type a command.</p>
        </Step>

        <Step n={2} title="Download the database">
          <p>Copy and paste this command into the Terminal window, then press Enter:</p>
          <Code>git clone https://github.com/artvana/global-ai-atlas.git</Code>
          <p>This downloads the entire database to a folder called <code className="text-xs bg-odl-surface border border-odl-border rounded px-1">global-ai-atlas</code> in your home directory. It takes about 30 seconds.</p>
        </Step>

        <Step n={3} title="Install dependencies">
          <p>Run these two commands one at a time, pressing Enter after each:</p>
          <Code>cd global-ai-atlas</Code>
          <Code>npm install</Code>
          <p>The second command downloads some small packages the server needs. You'll see a lot of text scroll past — that's normal. Wait until you see the cursor again before continuing.</p>
        </Step>

        <Step n={4} title="Find your Claude Desktop config file">
          <p><strong>On Mac,</strong> run this command to open the config file directly in a text editor:</p>
          <Code>open -e ~/Library/"Application Support"/Claude/claude_desktop_config.json</Code>
          <p>If you get a "file not found" error, Claude Desktop hasn't been opened yet. Open it once, quit it, then try again.</p>
          <p className="mt-2"><strong>On Windows,</strong> press <kbd className="border border-odl-border rounded px-1 py-0.5 text-xs font-mono bg-odl-surface">Win+R</kbd>, paste this path, press Enter:</p>
          <Code>%APPDATA%\Claude\claude_desktop_config.json</Code>
        </Step>

        <Step n={5} title="Add GAIA to the config file">
          <p>The file will look like <code className="text-xs bg-odl-surface border border-odl-border rounded px-1">{'{}'}</code> or already have some content. Replace everything in it with the following — but first, replace <code className="text-xs bg-odl-surface border border-odl-border rounded px-1">YOUR_USERNAME</code> with your actual computer username.</p>

          <div className="space-y-2">
            <p className="text-xs text-odl-subtle font-medium uppercase tracking-wide">Mac:</p>
            <Code>{`{
  "mcpServers": {
    "gaia": {
      "command": "npx",
      "args": [
        "tsx",
        "/Users/YOUR_USERNAME/global-ai-atlas/mcp/server.ts"
      ]
    }
  }
}`}</Code>
          </div>

          <div className="space-y-2 mt-3">
            <p className="text-xs text-odl-subtle font-medium uppercase tracking-wide">Windows:</p>
            <Code>{`{
  "mcpServers": {
    "gaia": {
      "command": "npx",
      "args": [
        "tsx",
        "C:\\\\Users\\\\YOUR_USERNAME\\\\global-ai-atlas\\\\mcp\\\\server.ts"
      ]
    }
  }
}`}</Code>
          </div>

          <Callout type="tip">
            Not sure what your username is? On Mac, run <code className="font-mono">whoami</code> in Terminal. On Windows, run <code className="font-mono">echo %USERNAME%</code> in PowerShell.
          </Callout>

          <p>Save the file after editing (<kbd className="border border-odl-border rounded px-1 py-0.5 text-xs font-mono bg-odl-surface">⌘S</kbd> on Mac, <kbd className="border border-odl-border rounded px-1 py-0.5 text-xs font-mono bg-odl-surface">Ctrl+S</kbd> on Windows).</p>
        </Step>

        <Step n={6} title="Restart Claude Desktop">
          <p>Quit Claude Desktop completely (don't just close the window — quit the app), then reopen it.</p>
          <p><strong>On Mac:</strong> right-click the Claude icon in your Dock → Quit, then reopen.</p>
          <p><strong>On Windows:</strong> right-click the Claude icon in the system tray → Exit, then reopen.</p>
        </Step>

        <Step n={7} title="Confirm it's working">
          <p>Start a new conversation in Claude Desktop and type:</p>
          <Code>How many AI regulations are in the GAIA database?</Code>
          <p>Claude should respond with a live count pulled directly from the database. If it answers from memory rather than querying the database, the server isn't connected yet — see Troubleshooting below.</p>
          <Callout type="check">
            You'll know it's working when you see a small tools icon or "Searching GAIA…" indicator appear while Claude is thinking.
          </Callout>
        </Step>

      </div>

      <SectionHead>What you can ask Claude</SectionHead>
      <div className="space-y-3">
        <p className="text-sm text-odl-muted">Once connected, these are the six capabilities available. You don't need to invoke them by name — just ask naturally and Claude will use the right tool.</p>
        {TOOLS.map(tool => (
          <div key={tool.tool} className="panel p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-odl-text">{tool.name}</span>
              <code className="text-[10px] font-mono text-odl-subtle border border-odl-border rounded px-1.5 py-0.5 bg-odl-surface">{tool.tool}</code>
            </div>
            <p className="text-sm text-odl-muted mb-2">{tool.what}</p>
            <p className="text-xs text-odl-subtle">Try asking: <em>{tool.ask}</em></p>
          </div>
        ))}
      </div>

      <SectionHead>Troubleshooting</SectionHead>
      <div className="space-y-4 text-sm text-odl-muted">
        {[
          {
            problem: 'Claude answers from memory instead of querying the database',
            fix: 'The server isn\'t connected. Double-check the path in your config file exactly matches where you cloned the repo, and that you\'ve fully quit and restarted Claude Desktop.',
          },
          {
            problem: '"command not found: npx" error',
            fix: 'Node.js isn\'t installed, or the Terminal hasn\'t reloaded since you installed it. Close and reopen your Terminal, then try running `node --version` to confirm Node is available.',
          },
          {
            problem: 'Config file doesn\'t exist',
            fix: 'Open Claude Desktop at least once so it creates the config directory, then quit and try again.',
          },
          {
            problem: 'Server connects but get_regulation_text returns nothing',
            fix: 'The full text files live in data/texts/ inside your cloned folder. Confirm that directory exists and isn\'t empty.',
          },
          {
            problem: 'The config file already has content',
            fix: 'Don\'t replace the whole file — instead, add the "gaia" block inside the existing "mcpServers" object alongside any existing entries.',
          },
        ].map(item => (
          <div key={item.problem} className="border-l-2 border-odl-border pl-4">
            <div className="font-medium text-odl-text mb-0.5">{item.problem}</div>
            <div>{item.fix}</div>
          </div>
        ))}
      </div>

      <SectionHead>Keeping the database up to date</SectionHead>
      <p className="text-sm text-odl-muted leading-relaxed">
        The database is updated weekly. To pull the latest regulations into your local copy,
        open Terminal, navigate to the folder, and run:
      </p>
      <Code>{`cd ~/global-ai-atlas
git pull`}</Code>
      <p className="text-sm text-odl-muted mt-2">No need to restart Claude Desktop after pulling — the server reads the files fresh each time.</p>

      <SectionHead>Contributing & source</SectionHead>
      <p className="text-sm text-odl-muted leading-relaxed">
        GAIA is open source under the MIT License.{' '}
        <a href="https://github.com/artvana/global-ai-atlas" target="_blank" rel="noreferrer" className="odl-link">
          github.com/artvana/global-ai-atlas
        </a>
        {' '}— if you spot a missing law, an incorrect date, or a metadata error,
        contributions via pull request are welcome. See CONTRIBUTING.md in the repository for the data schema and submission guide.
      </p>

    </div>
  )
}
