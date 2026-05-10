import { regulations } from '../data/regulations'
import rulesData from '../../data/rules.json'
import type { Rule } from '../types'

const rules = rulesData as Rule[]
const TOTAL = regulations.length
const IN_FORCE = regulations.filter(r => r.status === 'in_force').length
const BINDING = regulations.filter(r => r.instrument_binding).length
const COUNTRIES = new Set(
  regulations
    .filter(r => r.country !== 'Global / Regional' && r.country !== 'European Union' && r.country !== 'Gulf Cooperation Council')
    .map(r => r.country)
).size
const BINDING_IDS = new Set(regulations.filter(r => r.instrument_binding).map(r => r.id))
const EXPLORER_RULES = rules.filter(r =>
  r.instances.some(i => BINDING_IDS.has(i.law_id)) &&
  !/\(recommendation\)/i.test(r.rule_text)
).length
const CATEGORIES = new Set(rules.map(r => r.category)).size

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-sm font-semibold text-odl-text mt-12 mb-4 pb-2 border-b border-odl-border first:mt-0 scroll-mt-16">
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-odl-text mt-6 mb-2">{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-odl-muted leading-relaxed mb-3">{children}</p>
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-odl-surface border border-odl-border rounded px-6 py-4 my-4 font-mono text-sm text-odl-text overflow-x-auto">
      {children}
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-odl-border">
            {headers.map(h => (
              <th key={h} className="text-left py-2 px-3 font-semibold text-odl-subtle uppercase tracking-wide text-[10px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-odl-surface'}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-odl-muted leading-snug border-b border-odl-border/40">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-odl-accent/40 pl-4 my-4 text-xs text-odl-muted leading-relaxed italic">
      {children}
    </div>
  )
}

export function MethodologyDocs() {
  return (
    <div className="max-w-3xl">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-odl-subtle uppercase tracking-widest mb-2">Open Data Labs · Technical Report</p>
        <h1 className="text-xl font-bold text-odl-text mb-1 leading-tight">
          GAIA: Global AI Atlas — Methodology
        </h1>
        <p className="text-xs text-odl-muted">Version 1.1 · May 2026 · <a href="mailto:art@opendatalabs.xyz" className="odl-link">art@opendatalabs.xyz</a></p>
      </div>

      {/* Abstract */}
      <div className="panel p-5 mb-8">
        <p className="text-[10px] font-semibold text-odl-subtle uppercase tracking-widest mb-3">Abstract</p>
        <p className="text-sm text-odl-muted leading-relaxed mb-4">
          The Global AI Atlas (GAIA) is a structured database of AI-specific legal instruments, covering {TOTAL.toLocaleString()} instruments
          across {COUNTRIES} national jurisdictions plus supranational bodies. Of these, {IN_FORCE.toLocaleString()} are currently in force
          and {BINDING.toLocaleString()} are legally binding. From the full-text corpus of binding laws, {EXPLORER_RULES.toLocaleString()} discrete
          policy rules have been extracted across {CATEGORIES} thematic categories and cross-referenced to show adoption
          patterns across jurisdictions. This document describes the inclusion criteria, data model, rule extraction
          procedure, and the mathematical framework underlying the Convergence Map.
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-odl-border">
          {[
            { n: TOTAL.toLocaleString(),          label: 'Total instruments' },
            { n: IN_FORCE.toLocaleString(),        label: 'In force' },
            { n: BINDING.toLocaleString(),         label: 'Binding' },
            { n: COUNTRIES,                        label: 'Jurisdictions' },
            { n: EXPLORER_RULES.toLocaleString(),  label: 'Extracted rules' },
            { n: CATEGORIES,                       label: 'Policy categories' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-odl-text font-mono">{s.n}</div>
              <div className="text-[10px] text-odl-subtle">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Corpus Definition */}
      <H2 id="corpus">1. Corpus Definition and Inclusion Criteria</H2>
      <P>An instrument is included if it satisfies all three criteria simultaneously:</P>

      <Table
        headers={['Criterion', 'Threshold', 'Excludes']}
        rows={[
          ['Binding', 'Legally enforceable with penalties or enforcement mechanisms', 'Voluntary guidelines, white papers, policy frameworks'],
          ['AI-targeted', 'AI, ADM, ML, generative AI, or algorithmic systems are the primary regulatory subject', 'Laws where AI appears in one incidental clause'],
          ['Enacted', 'Signed into law, issued as final rule, or adopted as binding regulation', 'Proposed bills, consultation drafts, failed legislation'],
        ]}
      />

      <P>
        Borderline cases are included with <code className="text-[11px] bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">notable: "corpus boundary case — verify inclusion"</code>.
        Pre-2020 instruments are included where they are the primary existing legal instrument with demonstrated AI relevance
        and active enforcement (e.g. Illinois BIPA 2008, GDPR 2016, California CCPA 2018).
      </P>

      <H3>Temporal and geographic scope</H3>
      <P>
        Coverage spans 2008–May 2026. All 50 US states and DC are covered at state level; federal AI legislation and binding agency rules are catalogued separately.
        International coverage prioritises jurisdictions with enacted AI-specific law. Bills that did not pass,
        proposed rules, and vetoed legislation are retained in the database with appropriate status flags to support
        legislative tracking and historical analysis.
      </P>


      {/* 3. Rule Extraction */}
      <H2 id="extraction">3. Rule Extraction</H2>
      <P>
        Full legal texts are fetched for all instruments where an official URL is available and stored as Markdown
        in <code className="text-[11px] bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">data/texts/</code>.
        Each text is then processed through an automated extraction pipeline to produce discrete, atomic policy rules.
      </P>

      <H3>3.1 Extraction procedure</H3>
      <P>
        Each law text is segmented into logical chunks and submitted to a large language model (Claude Haiku) with a
        structured prompt that instructs the model to identify operative legal obligations as discrete, self-contained
        sentences. The prompt specifies:
      </P>
      <ul className="text-sm text-odl-muted leading-relaxed mb-4 list-disc pl-5 space-y-1">
        <li>One rule per discrete legal obligation — compound provisions are split</li>
        <li>Passive/active voice normalised to active ("Operators must…" not "AI systems are required to…")</li>
        <li>Subject must be a generic role (developer, operator, deployer, provider) — not a named agency or law</li>
        <li>Each rule assigned to one of {CATEGORIES} canonical categories</li>
      </ul>

      <H3>3.2 Cross-jurisdictional deduplication</H3>
      <P>
        Rules extracted from different jurisdictions are compared to identify semantic equivalents. Candidate pairs
        are identified using Jaccard word-overlap similarity above a threshold of 0.45, then confirmed by a
        language model with a binary YES/NO prompt ("Do these two rules express the same substantive obligation?").
        Confirmed duplicates are merged: instance arrays are combined, the rule with more instances is retained as
        canonical, and the earliest first-instance date is preserved.
      </P>

      <H3>3.3 Quality filters</H3>
      <P>Rules are excluded from the public Rule Explorer if:</P>
      <ul className="text-sm text-odl-muted leading-relaxed mb-4 list-disc pl-5 space-y-1">
        <li>No instance comes from a binding instrument (<code className="text-[11px] bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">instrument_binding = false</code> for all instances)</li>
        <li>Fewer than 50% of instances are from binding instruments and the rule text uses recommendation language</li>
        <li>The rule text contains <code className="text-[11px] bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">(recommendation)</code>, indicating a policy-document origin</li>
      </ul>
      <P>
        Rules from binding instruments that used soft language ("should") after the initial extraction pass were rewritten
        to use mandatory language ("must", "shall") via a secondary correction pass.
      </P>

      {/* 4. Convergence Methodology */}
      <H2 id="convergence">4. Convergence Map Methodology</H2>
      <P>
        The Convergence Map computes pairwise regulatory similarity across all jurisdictions. Each jurisdiction is
        represented as a vector in rule space; similarity is computed using a modified cosine measure that
        penalises explicit regulatory conflict.
      </P>

      <H3>4.1 Rule corpus for similarity</H3>
      <P>
        Similarity is computed over substantive rules only. Rules in the <code className="text-[11px] bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">definitions_scope</code> and{' '}
        <code className="text-[11px] bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">institutional_framework</code> categories are excluded — they describe legal
        architecture rather than substantive obligations, and shared boilerplate would inflate similarity scores
        without reflecting genuine policy alignment.
      </P>

      <H3>4.2 Adoption scores</H3>
      <P>
        Each rule–jurisdiction pair is assigned a score <em>s</em> reflecting how closely the jurisdiction has
        adopted the rule relative to the canonical origin:
      </P>

      <Table
        headers={['Relationship', 'Score s', 'Meaning']}
        rows={[
          ['origin',    '5', 'Jurisdiction originated or first enacted this rule'],
          ['identical', '4', 'Verbatim or near-verbatim adoption'],
          ['agrees',    '3', 'Substantively equivalent, different drafting'],
          ['similar',   '2', 'Materially similar with notable differences'],
          ['absent',    '0', 'No coverage of this rule'],
          ['opposed',  '−1', 'Explicit legal conflict with the rule'],
        ]}
      />

      <P>
        Where a jurisdiction has multiple laws covering the same rule, the highest positive score is used.
        The opposed score is applied only where no positive score exists — i.e. the jurisdiction actively
        contradicts a rule it has not itself adopted.
      </P>

      <H3>4.3 Jurisdiction vectors</H3>
      <P>
        Let <em>R</em> be the set of all substantive rules (|<em>R</em>| = <em>n</em>) and let{' '}
        <em>J</em> be the set of jurisdictions. Each jurisdiction <em>j</em> ∈ <em>J</em> is represented as a
        vector:
      </P>
      <Formula>
        <span className="block">v<sub>j</sub> = (s<sub>j,1</sub>, s<sub>j,2</sub>, … , s<sub>j,n</sub>)  ∈  ℝⁿ</span>
        <span className="block mt-2 text-odl-muted text-xs">where s<sub>j,i</sub> ∈ {'{ −1, 0, 2, 3, 4, 5 }'} is the adoption score of rule i for jurisdiction j</span>
      </Formula>

      <H3>4.4 Modified cosine similarity</H3>
      <P>
        Standard cosine similarity would treat conflict (<em>s</em> = −1) symmetrically with soft adoption, which
        misrepresents the qualitative difference between non-adoption and explicit contradiction. GAIA uses a
        conflict-weighted dot product:
      </P>
      <Formula>
        <span className="block">sim(A, B)  =  φ(v<sub>A</sub>, v<sub>B</sub>)  /  (‖v<sub>A</sub>‖₊ · ‖v<sub>B</sub>‖₊)</span>
        <span className="block mt-4 text-odl-muted text-xs">Conflict-weighted dot product:</span>
        <span className="block mt-1">
          φ(v<sub>A</sub>, v<sub>B</sub>)  =  Σᵢ  f(s<sub>A,i</sub>, s<sub>B,i</sub>)
        </span>
        <span className="block mt-3 text-odl-muted text-xs">Element-wise function:</span>
        <span className="block mt-1">
          {'f(a, b) = '}
          <span className="ml-2">
            a·b &nbsp;&nbsp;&nbsp;&nbsp; if a {'>'} 0 and b {'>'} 0 &nbsp;&nbsp; (agreement)<br />
            <span className="ml-16">3·a·b &nbsp; if sign(a) ≠ sign(b) &nbsp; (conflict penalty ×3)<br /></span>
            <span className="ml-16">0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; otherwise &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (shared non-adoption)</span>
          </span>
        </span>
        <span className="block mt-4 text-odl-muted text-xs">Positive-only norm (conflict does not inflate the denominator):</span>
        <span className="block mt-1">
          ‖v‖₊  =  √( Σᵢ  s<sub>i</sub>² · 𝟙[s<sub>i</sub> {'>'} 0] )
        </span>
      </Formula>
      <Note>
        The conflict multiplier of 3 was calibrated so that a single explicit contradiction between two
        jurisdictions (e.g. one banning a practice the other mandates) reduces similarity by approximately
        the same magnitude as the absence of three mutually agreed rules.
      </Note>

      <H3>4.5 Jurisdiction inheritance (supranational cascade)</H3>
      <P>
        EU regulations and directives are directly applicable or impose transposition obligations across all
        27 EU member states. All EU instruments — both binding and non-binding — cascade to member state
        columns: binding instruments set scores directly; codes of practice and guidelines contribute
        at the <em>similar</em> (score 2) level unless the member state has enacted a domestic transposing
        instrument, in which case the higher domestic score applies.
      </P>
      <P>
        Non-EU regional instruments (GCC, ASEAN) cascade only where{' '}
        <code className="text-[11px] bg-odl-surface border border-odl-border rounded px-1.5 py-0.5">instrument_binding = true</code>.
        International soft-law bodies (OECD, UNESCO, G7, ISO) are routed to a dedicated{' '}
        <em>International/UN</em> reference column and excluded from country-to-country similarity metrics.
      </P>

      <H3>4.6 Colour scale</H3>
      <P>
        The heatmap uses a diverging scale centred on the dynamic global mean μ, recalculated as the filter
        set changes:
      </P>
      <Formula>
        <span className="block">μ  =  (1 / |P|)  Σ<sub>(A,B) ∈ P</sub>  sim(A, B)</span>
        <span className="block mt-2 text-odl-muted text-xs">where P is the set of all ordered country pairs, excluding the intl-ref column</span>
        <span className="block mt-4">colour(sim)  =  lerp(blue, white, amber, (sim − (μ − 2σ)) / 4σ)  ·  γ</span>
        <span className="block mt-2 text-odl-muted text-xs">γ = 0.6 (perceptual gamma applied to spread the dense low-similarity band 0–10%)</span>
        <span className="block mt-2 text-odl-muted text-xs">Values outside [μ − 2σ, μ + 2σ] saturate. Negative sim (active conflict) renders as crimson.</span>
      </Formula>

      {/* 5. Structural Limitations */}
      <H2 id="limitations">5. Known Structural Limitations</H2>

      <Table
        headers={['Limitation', 'Effect', 'Status']}
        rows={[
          [
            'Intra-EU structural inflation',
            '16 EU member states have no domestic AI laws; their vectors are entirely EU-sourced, giving cosine sim = 1.0 with each other and inflating the global mean by ~3 pp.',
            'Excluded from most-aligned-pair insight; displayed as-is in matrix',
          ],
          [
            'intl-ref alignment is aspirational',
            'sim(country, intl-ref) reflects thematic overlap with international soft-law, not formal adoption. High alignment may be coincidental.',
            'Column labelled "International / UN"; excluded from aggregate metrics',
          ],
          [
            'Rule coverage ≠ compliance equivalence',
            'A score of 2 ("similar") does not guarantee regulatory equivalence for compliance purposes — it indicates thematic overlap at rule granularity.',
            'Design limitation; documented in all exports',
          ],
          [
            'Extraction model variance',
            'LLM-based rule extraction introduces non-determinism. Two runs on the same text may yield slightly different rule counts or split points.',
            'Mitigated by human review of high-variance categories',
          ],
          [
            'Penalty comparison is approximate',
            'max_penalty_usd_approx uses fixed exchange rates (EUR 1.10, AUD 0.64) as of April 2026 and statutory maxima, not actual enforcement outcomes.',
            'Field suffix "_approx" and methodology note in schema',
          ],
        ]}
      />

      {/* 6. Data Model */}
      <H2 id="schema">6. Data Model Summary</H2>
      <H3>6.1 Instrument record key fields</H3>
      <Table
        headers={['Field', 'Type', 'Description']}
        rows={[
          ['id', 'string', 'Unique identifier: {country}-{region}-{name}-{year}'],
          ['status', 'enum', 'in_force · enacted_not_yet_effective · proposed · vetoed · failed · rescinded'],
          ['instrument_binding', 'boolean', 'True only if legally enforceable with penalties or enforcement mechanism'],
          ['instrument_type', 'enum', 'statute · executive_order · regulation · directive · treaty · guidance'],
          ['legal_family', 'enum', 'eu_risk_based · us_consumer_protection · china_state_sovereignty · uk_non_model · hybrid · standalone'],
          ['provisions.*', 'boolean', 'Operative obligation flags (private_right_of_action, human_review_right, etc.)'],
          ['max_penalty_usd_approx', 'number | null', 'Statutory maximum penalty in USD, approximate (see §5)'],
        ]}
      />
      <H3>6.2 Rule record key fields</H3>
      <Table
        headers={['Field', 'Type', 'Description']}
        rows={[
          ['rule_id', 'string', 'Unique rule identifier'],
          ['rule_text', 'string', 'Plain-English binding obligation statement'],
          ['category', 'string', 'One of 21 canonical policy categories'],
          ['instances[].law_id', 'string', 'Foreign key to instrument record'],
          ['instances[].relationship', 'enum', 'origin · identical · agrees · similar · opposed · rejected'],
          ['instances[].instrument_binding', 'boolean', 'Binding flag of the source instrument (denormalised for query performance)'],
          ['first_instance', 'object', 'law_id and date of the earliest known adoption'],
        ]}
      />

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-odl-border text-xs text-odl-subtle">
        <p>
          GAIA is open source under the MIT License.{' '}
          <a href="https://github.com/artvana/global-ai-atlas" target="_blank" rel="noreferrer" className="odl-link">
            github.com/artvana/global-ai-atlas
          </a>
          {' '}· Questions or corrections: <a href="mailto:art@opendatalabs.xyz" className="odl-link">art@opendatalabs.xyz</a>
        </p>
      </div>

    </div>
  )
}
