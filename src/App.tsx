import { useState, lazy, Suspense, Component, type ReactNode } from 'react'
import { SearchInterface } from './components/SearchInterface'
import { WhatsNew } from './components/WhatsNew'
import { BillsTracker } from './components/BillsTracker'
import { MCPDocs } from './components/MCPDocs'
import { MethodologyDocs } from './components/MethodologyDocs'
import { SimilarityHeatmap } from './components/SimilarityHeatmap'
import { LawDetail } from './components/LawDetail'
import { regulations } from './data/regulations'
// Lazy-load the map so a react-simple-maps compat error doesn't crash the whole app
const GAIAMap = lazy(() => import('./components/GAIAMap').then(m => ({ default: m.GAIAMap })))

type Tab = 'convergence' | 'map' | 'laws' | 'bills' | 'whatsnew' | 'mcp' | 'methodology'

const TAB_LABELS: Record<Tab, string> = {
  convergence:  'Convergence Map',
  map:          'Global Map',
  laws:         'Database',
  bills:        'Bills Tracker',
  whatsnew:     'What\'s New',
  mcp:          'MCP Server',
  methodology:  'Methodology',
}

class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }
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
  const [tab, setTab] = useState<Tab>('map')
  const [lawModalId, setLawModalId] = useState<string | null>(null)
  const lawModal = lawModalId ? regulations.find(r => r.id === lawModalId) ?? null : null

  function openLaw(id: string) {
    setLawModalId(id)
  }

  return (
    <div className="min-h-screen bg-odl-surface">
      <header className="bg-odl-bg border-b border-odl-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-0 flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-normal tracking-wide text-odl-text">GAIA</span>
              <span className="text-odl-subtle text-xs">Global AI Atlas</span>
            </div>
            <div className="h-4 w-px bg-odl-border" />
            <nav className="flex gap-0.5">
              {(['map', 'convergence', 'laws', 'bills', 'whatsnew', 'mcp', 'methodology'] as Tab[]).map(t => (
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
            <span>{regulations.length} instruments</span>
            <span>Updated May 2026</span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6">
        {tab === 'convergence' && <ErrorBoundary resetKey="convergence"><SimilarityHeatmap onViewLaw={openLaw} /></ErrorBoundary>}
        {tab === 'laws'        && <ErrorBoundary resetKey="laws"><SearchInterface /></ErrorBoundary>}
        {tab === 'map'         && (
          <ErrorBoundary resetKey="map">
            <Suspense fallback={<div className="py-16 text-center text-xs text-odl-subtle">Loading map…</div>}>
              <GAIAMap onViewLaw={openLaw} />
            </Suspense>
          </ErrorBoundary>
        )}
        {tab === 'bills'       && <ErrorBoundary resetKey="bills"><BillsTracker onViewLaw={openLaw} /></ErrorBoundary>}
        {tab === 'whatsnew'    && <ErrorBoundary resetKey="whatsnew"><WhatsNew /></ErrorBoundary>}
        {tab === 'mcp'         && <ErrorBoundary resetKey="mcp"><MCPDocs /></ErrorBoundary>}
        {tab === 'methodology' && <ErrorBoundary resetKey="methodology"><MethodologyDocs /></ErrorBoundary>}
      </main>

      {lawModal && <LawDetail law={lawModal} onClose={() => setLawModalId(null)} />}

      <footer className="border-t border-odl-border mt-16 py-6">
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between text-xs text-odl-subtle">
          <span>GAIA — Global AI Atlas · v1.0 · May 2026</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setTab('methodology')} className="odl-link">Methodology</button>
            <a href="mailto:art@abal.art" className="odl-link">art@abal.art</a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
