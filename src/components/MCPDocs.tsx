function Code({ children }: { children: string }) {
  return (
    <pre className="bg-odl-surface border border-odl-border rounded p-3.5 text-xs font-mono text-odl-text overflow-x-auto whitespace-pre-wrap select-all leading-relaxed">
      {children}
    </pre>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-odl-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <div className="text-sm font-semibold text-odl-text mb-3">{title}</div>
        <div className="space-y-3 text-sm text-odl-muted leading-relaxed">{children}</div>
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
    <div className={`border rounded px-4 py-3 text-xs leading-relaxed flex gap-2.5 ${styles[type]}`}>
      <span className="flex-shrink-0 font-bold mt-px">{icons[type]}</span>
      <span>{children}</span>
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-odl-subtle uppercase tracking-wider mt-12 mb-5 pb-2.5 border-b border-odl-border first:mt-0">
      {children}
    </h2>
  )
}

const TOOLS = [
  {
    name: 'Search regulations',
    tool: 'search_regulations',
    what: 'Find laws on any topic. Searches names, summaries, obligations, and sector tags across the full database.',
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
    what: 'Browse the database with filters by country, status, category, legal family, or any other field.',
    ask: '"List all binding AI laws currently in force in Asia-Pacific."',
  },
  {
    name: 'Database statistics',
    tool: 'get_stats',
    what: 'Summary counts by jurisdiction, status, category, and year. Useful for the intro paragraph of any research note.',
    ask: '"Give me headline statistics on global AI regulation for my article."',
  },
]

export function MCPDocs() {
  return (
    <div className="max-w-2xl">

      {/* Hero */}
      <div className="panel p-6 mb-8">
        <h1 className="text-base font-semibold text-odl-text mb-2.5">Use GAIA with Claude Desktop</h1>
        <p className="text-sm text-odl-muted leading-relaxed mb-4">
          Once set up, Claude can query this entire database on your behalf: searching laws, comparing provisions,
          reading full legal texts, and pulling statistics, all from a normal conversation.
          No search box. No manual lookup. Just ask.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-odl-subtle pt-3 border-t border-odl-border">
          <span>Setup time: approximately 10 minutes</span>
          <span>·</span>
          <span>Works on Mac and Windows</span>
          <span>·</span>
          <span>Requires Claude Desktop (free or paid)</span>
        </div>
      </div>

      <SectionHead>What you will need</SectionHead>
      <p className="text-sm text-odl-muted mb-4">
        Before you start, make sure you have these three things installed. Each link goes to the official download page.
      </p>
      <div className="space-y-3">
        {[
          {
            name: 'Claude Desktop',
            url: 'https://claude.ai/download',
            note: 'The desktop app, not the browser version. Download from claude.ai/download.',
          },
          {
            name: 'Node.js (LTS)',
            url: 'https://nodejs.org',
            note: 'Click the large "LTS" button on nodejs.org. This is the engine that runs the database server.',
          },
          {
            name: 'Git',
            url: 'https://git-scm.com/downloads',
            note: 'Lets you download the database to your computer. On Mac, you may already have it.',
          },
        ].map(item => (
          <div key={item.name} className="flex gap-4 panel p-4">
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-odl-accent mt-1.5" />
            <div>
              <a href={item.url} target="_blank" rel="noreferrer" className="odl-link text-sm font-semibold">{item.name}</a>
              <p className="text-sm text-odl-subtle mt-1">{item.note}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHead>Setup, step by step</SectionHead>
      <div className="space-y-8">

        <Step n={1} title="Open your Terminal">
          <p>
            <strong>On Mac:</strong> press <kbd className="border border-odl-border rounded px-1.5 py-0.5 text-xs font-mono bg-odl-surface">Command Space</kbd>, type <em>Terminal</em>, and press Enter.
          </p>
          <p>
            <strong>On Windows:</strong> press the <kbd className="border border-odl-border rounded px-1.5 py-0.5 text-xs font-mono bg-odl-surface">Windows key</kbd>, type <em>PowerShell</em>, and press Enter.
          </p>
          <p>A black or white window will open with a blinking cursor. It is waiting for you to type a command.</p>
        </Step>

        <Step n={2} title="Download the database">
          <p>Copy and paste this command into the Terminal window, then press Enter:</p>
          <Code>git clone https://github.com/artvana/global-ai-atlas.git</Code>
          <p>This downloads the entire database to a folder called <code className="text-xs bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">global-ai-atlas</code> in your home directory. It takes about 30 seconds.</p>
        </Step>

        <Step n={3} title="Install dependencies">
          <p>Run these two commands one at a time, pressing Enter after each:</p>
          <Code>cd global-ai-atlas</Code>
          <Code>npm install</Code>
          <p>The second command downloads some small packages the server needs. You will see a lot of text scroll past. That is normal. Wait until you see the cursor again before continuing.</p>
        </Step>

        <Step n={4} title="Open the Claude Desktop config file">
          <p><strong>On Mac,</strong> run this command to open the config file in a text editor:</p>
          <Code>open -e ~/Library/"Application Support"/Claude/claude_desktop_config.json</Code>
          <p>If you see a "file not found" error, Claude Desktop has not been opened yet. Open it once, quit it, then run the command again.</p>
          <p><strong>On Windows,</strong> press <kbd className="border border-odl-border rounded px-1.5 py-0.5 text-xs font-mono bg-odl-surface">Win + R</kbd>, paste this path, and press Enter:</p>
          <Code>%APPDATA%\Claude\claude_desktop_config.json</Code>
        </Step>

        <Step n={5} title="Add GAIA to the config file">
          <p>
            The file will contain <code className="text-xs bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">{'{}'}</code> or some existing content.
            Replace everything in it with the text below.
            Before saving, replace <code className="text-xs bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">YOUR_USERNAME</code> with your actual computer username.
          </p>

          <div>
            <p className="text-xs font-semibold text-odl-subtle uppercase tracking-wide mb-2">Mac</p>
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

          <div>
            <p className="text-xs font-semibold text-odl-subtle uppercase tracking-wide mb-2">Windows</p>
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

          <p>
            Save the file after editing.{' '}
            <kbd className="border border-odl-border rounded px-1.5 py-0.5 text-xs font-mono bg-odl-surface">Cmd S</kbd> on Mac,{' '}
            <kbd className="border border-odl-border rounded px-1.5 py-0.5 text-xs font-mono bg-odl-surface">Ctrl S</kbd> on Windows.
          </p>

          <Callout type="note">
            If the config file already has content, do not replace the whole file. Instead, add the "gaia" block inside the existing "mcpServers" object, alongside any entries that are already there.
          </Callout>
        </Step>

        <Step n={6} title="Restart Claude Desktop">
          <p>Quit Claude Desktop completely, then reopen it. Closing the window is not enough; you need to quit the application.</p>
          <p><strong>On Mac:</strong> right-click the Claude icon in your Dock, choose Quit, then reopen.</p>
          <p><strong>On Windows:</strong> right-click the Claude icon in the system tray, choose Exit, then reopen.</p>
        </Step>

        <Step n={7} title="Confirm it is working">
          <p>Start a new conversation in Claude Desktop and type:</p>
          <Code>How many AI regulations are in the GAIA database?</Code>
          <p>Claude should respond with a live count pulled directly from the database. If it answers from general knowledge instead, the server is not connected yet. Check the Troubleshooting section below.</p>
          <Callout type="check">
            You will know it is working when you see a small tools icon or a brief "Searching GAIA" notice appear while Claude is thinking.
          </Callout>
        </Step>

      </div>

      <SectionHead>What you can ask Claude</SectionHead>
      <p className="text-sm text-odl-muted mb-5">
        Once connected, these six capabilities are available. You do not need to name them; just ask naturally and Claude will use the right one.
      </p>
      <div className="space-y-3">
        {TOOLS.map(tool => (
          <div key={tool.tool} className="panel p-5">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-sm font-semibold text-odl-text">{tool.name}</span>
              <code className="text-[10px] font-mono text-odl-subtle border border-odl-border rounded px-1.5 py-0.5 bg-odl-surface">{tool.tool}</code>
            </div>
            <p className="text-sm text-odl-muted leading-relaxed mb-3">{tool.what}</p>
            <p className="text-xs text-odl-subtle leading-relaxed">Try asking: <em>{tool.ask}</em></p>
          </div>
        ))}
      </div>

      <SectionHead>Troubleshooting</SectionHead>
      <div className="space-y-6">
        {[
          {
            problem: 'Claude answers from general knowledge instead of querying the database',
            fix: 'The server is not connected. Double-check that the path in your config file exactly matches the folder where you cloned the repo, and that you have fully quit and restarted Claude Desktop.',
          },
          {
            problem: '"command not found: npx" error in Terminal',
            fix: 'Node.js is not installed, or the Terminal has not reloaded since you installed it. Close and reopen Terminal, then run "node --version" to confirm Node is available.',
          },
          {
            problem: 'Config file does not exist',
            fix: 'Open Claude Desktop at least once so it creates the config directory, then quit it and try the setup step again.',
          },
          {
            problem: 'Server connects but reading full legal texts returns nothing',
            fix: 'The full text files live in the data/texts/ folder inside your cloned directory. Confirm that folder exists and is not empty.',
          },
          {
            problem: 'The config file already has content from another MCP server',
            fix: 'Do not replace the whole file. Add the "gaia" block inside the existing "mcpServers" object, alongside the entries that are already there.',
          },
        ].map(item => (
          <div key={item.problem} className="border-l-2 border-odl-border pl-5">
            <div className="text-sm font-semibold text-odl-text mb-1.5">{item.problem}</div>
            <div className="text-sm text-odl-muted leading-relaxed">{item.fix}</div>
          </div>
        ))}
      </div>

      <SectionHead>Keeping the database up to date</SectionHead>
      <p className="text-sm text-odl-muted leading-relaxed mb-4">
        The database is updated weekly. To pull the latest regulations into your local copy,
        open Terminal and run these two commands:
      </p>
      <Code>{`cd ~/global-ai-atlas\ngit pull`}</Code>
      <p className="text-sm text-odl-muted leading-relaxed mt-4">
        No need to restart Claude Desktop after pulling. The server reads the files fresh each time it is called.
      </p>

      <SectionHead>Contributing and source</SectionHead>
      <p className="text-sm text-odl-muted leading-relaxed">
        GAIA is open source under the MIT License.{' '}
        <a href="https://github.com/artvana/global-ai-atlas" target="_blank" rel="noreferrer" className="odl-link">
          github.com/artvana/global-ai-atlas
        </a>.{' '}
        If you spot a missing law, an incorrect date, or a metadata error,
        contributions via pull request are welcome. See CONTRIBUTING.md in the repository for the data schema and submission guide.
      </p>

    </div>
  )
}
