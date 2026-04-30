import { useState, lazy, Suspense, Component, type ReactNode } from 'react'
import { SearchInterface } from './components/SearchInterface'
import { AnalysisCharts } from './components/AnalysisCharts'
import { EnforcementView } from './components/EnforcementView'
import { MCPDocs } from './components/MCPDocs'
import { SimilarityHeatmap } from './components/SimilarityHeatmap'
import { regulations } from './data/regulations'

// Lazy-load the map so a react-simple-maps compat error doesn't crash the whole app
const GAIAMap = lazy(() => import('./components/GAIAMap').then(m => ({ default: m.GAIAMap })))

type Tab = 'convergence' | 'stats' | 'map' | 'laws' | 'enforcement' | 'mcp'

const TAB_LABELS: Record<Tab, string> = {
  convergence: 'Convergence Map',
  stats:       'Summary Stats',
  map:         'GAIA Map',
  laws:        'Laws Database',
  enforcement: 'Enforcement',
  mcp:         'MCP Server',
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-sm text-odl-muted border border-odl-border rounded">
          <div className="font-semibold text-odl-text mb-1">Failed to load this view</div>
          <div className="font-mono text-xs text-odl-subtle">{String(this.state.error)}</div>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [tab, setTab] = useState<Tab>('convergence')

  return (
    <div className="min-h-screen bg-odl-surface">
      <header className="bg-white border-b border-odl-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-0 flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-odl-text">GAIA</span>
              <span className="text-odl-subtle text-xs">Global AI Atlas</span>
            </div>
            <div className="h-4 w-px bg-odl-border" />
            <nav className="flex gap-0.5">
              {(['convergence', 'stats', 'map', 'laws', 'enforcement', 'mcp'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    tab === t
                      ? 'bg-odl-accent text-white'
                      : 'text-odl-muted hover:text-odl-text hover:bg-odl-surface'
                  }`}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-xs text-odl-subtle">
            <span>{regulations.length} instruments · 23 enforcement actions</span>
            <span>Updated Apr 2026</span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6">
        <ErrorBoundary>
          {tab === 'convergence' && <SimilarityHeatmap />}
          {tab === 'laws'        && <SearchInterface />}
          {tab === 'map'         && (
            <Suspense fallback={<div className="py-16 text-center text-xs text-odl-subtle">Loading map…</div>}>
              <GAIAMap />
            </Suspense>
          )}
          {tab === 'stats'       && <AnalysisCharts laws={regulations} />}
          {tab === 'enforcement' && <EnforcementView />}
          {tab === 'mcp'         && <MCPDocs />}
        </ErrorBoundary>
      </main>

      <footer className="border-t border-odl-border mt-16 py-6">
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between text-xs text-odl-subtle">
          <span>GAIA — Global AI Atlas · v1.0 · April 2026</span>
          <div className="flex items-center gap-4">
            <a href="./docs/methodology.md" className="odl-link">Methodology</a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
