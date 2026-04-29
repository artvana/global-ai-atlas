/**
 * semanticSearch.ts
 *
 * Embedding-based semantic search for the rules matrix.
 * Uses @xenova/transformers (all-MiniLM-L6-v2, 384 dims) to embed both
 * the stored rules and live search queries.
 *
 * Usage:
 *   1. Call loadEmbeddingData(data) once at startup with data/embeddings.json contents
 *   2. Call initModel() when user first interacts with the search bar
 *   3. Call searchRules(query, rules) to rank rules by similarity
 *   4. Call computeConsensus(rule) to determine which law is the de-facto standard
 */

import type { Rule } from '../types'

// ── embeddings store ──────────────────────────────────────────────────────────

let embeddingData: Record<string, number[]> = {}

export function loadEmbeddingData(data: Record<string, number[]>) {
  embeddingData = data
}

export function hasEmbeddings(): boolean {
  return Object.keys(embeddingData).length > 0
}

// ── model loading ─────────────────────────────────────────────────────────────

type Pipeline = (text: string, opts: Record<string, unknown>) => Promise<{ data: Float32Array }>

let _pipeline: Pipeline | null = null
let _loading = false
let _loadPromise: Promise<void> | null = null

export type LoadProgress = { loaded: number; total: number; pct: number }

export async function initModel(onProgress?: (p: LoadProgress) => void): Promise<void> {
  if (_pipeline) return
  if (_loadPromise) return _loadPromise

  _loading = true
  _loadPromise = (async () => {
    const { pipeline, env } = await import('@xenova/transformers')
    // Allow remote model downloads
    env.allowRemoteModels = true

    _pipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        progress_callback: onProgress
          ? (info: { status: string; loaded?: number; total?: number }) => {
              if (info.status === 'progress' && info.loaded != null && info.total) {
                onProgress({ loaded: info.loaded, total: info.total, pct: info.loaded / info.total * 100 })
              }
            }
          : undefined,
      }
    ) as Pipeline
    _loading = false
  })()

  return _loadPromise
}

export function isModelLoading() { return _loading }
export function isModelReady()  { return _pipeline !== null }

// ── embedding ─────────────────────────────────────────────────────────────────

export async function embedText(text: string): Promise<number[]> {
  if (!_pipeline) throw new Error('Model not initialised — call initModel() first')
  const out = await _pipeline(text, { pooling: 'mean', normalize: true })
  return Array.from(out.data)
}

// ── cosine similarity ─────────────────────────────────────────────────────────

function cosine(a: number[], b: number[]): number {
  // Assumes both vectors are already L2-normalised (all-MiniLM outputs normalised)
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  return dot
}

// ── search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  rule: Rule
  score: number   // cosine similarity, 0–1
}

export async function searchRules(
  query: string,
  rules: Rule[],
  topN = 30,
  threshold = 0.25
): Promise<SearchResult[]> {
  const qEmb = await embedText(query)

  return rules
    .map(rule => {
      const rEmb = embeddingData[rule.rule_id]
      const score = rEmb ? cosine(qEmb, rEmb) : 0
      return { rule, score }
    })
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

// ── consensus computation ─────────────────────────────────────────────────────
//
// The de-facto consensus is the law whose version is most widely adopted.
// We count "adoptions" = identical + agrees instances that reference a given
// variant_of (or default to the first-instance law when variant_of is absent).
// The law with the highest adoption count wins.
// Falls back to first_instance when there is no clear dominant version.

export interface ConsensusResult {
  law_id: string
  adoptions: number          // how many laws have adopted this version
  isFirstInstance: boolean
}

export function computeConsensus(rule: Rule): ConsensusResult {
  const counts = new Map<string, number>()

  // Seed the first-instance with 0 adoptions (so it appears in the map)
  counts.set(rule.first_instance.law_id, 0)

  for (const inst of rule.instances) {
    if (inst.relationship === 'origin') continue  // don't count self
    if (inst.relationship === 'identical' || inst.relationship === 'agrees') {
      // Which version is this law following?
      const ref = inst.variant_of ?? rule.first_instance.law_id
      counts.set(ref, (counts.get(ref) ?? 0) + 1)
    }
  }

  // Find max
  let bestId = rule.first_instance.law_id
  let bestCount = 0
  for (const [id, count] of counts) {
    if (count > bestCount) { bestId = id; bestCount = count }
  }

  return {
    law_id: bestId,
    adoptions: bestCount,
    isFirstInstance: bestId === rule.first_instance.law_id,
  }
}
