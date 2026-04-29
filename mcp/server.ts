#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.resolve(import.meta.dirname, '../data')
const REGULATIONS_PATH = path.join(DATA_DIR, 'regulations.json')

type Law = Record<string, unknown>

let regulations: Law[] = []

function loadData() {
  const raw = fs.readFileSync(REGULATIONS_PATH, 'utf-8')
  regulations = JSON.parse(raw)
}

function getTextPath(law: Law): string | null {
  const tp = law.text_path as string | undefined
  if (!tp) return null
  return path.resolve(DATA_DIR, '..', tp)
}

function matchesFilter(law: Law, filters: Record<string, string>): boolean {
  for (const [key, value] of Object.entries(filters)) {
    const v = value.toLowerCase()
    const field = law[key]
    if (field === undefined) continue
    const fieldStr = JSON.stringify(field).toLowerCase()
    if (!fieldStr.includes(v)) return false
  }
  return true
}

function searchLaw(law: Law, query: string): boolean {
  const q = query.toLowerCase()
  const searchable = [
    law.id,
    law.short_name,
    law.full_name,
    law.jurisdiction,
    law.region,
    law.summary,
    law.primary_category,
    JSON.stringify(law.categories),
    JSON.stringify(law.topics),
    JSON.stringify(law.sector_tags),
    JSON.stringify(law.technology_tags),
    JSON.stringify(law.key_obligations),
  ].join(' ').toLowerCase()
  return searchable.includes(q)
}

function stripMetadata(law: Law): Law {
  const { text_path: _tp, ...rest } = law
  return rest
}

const server = new Server(
  { name: 'ai-regulation-db', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_regulations',
      description:
        'List all AI regulations. Optionally filter by field values. Returns metadata only (no full text).',
      inputSchema: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description:
              'Key-value pairs to filter by (e.g. {"region":"EU","status":"in_force"}). Values are substring-matched.',
            additionalProperties: { type: 'string' },
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 50)',
          },
        },
      },
    },
    {
      name: 'search_regulations',
      description:
        'Full-text search across law names, summaries, jurisdictions, topics, categories, and obligations.',
      inputSchema: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Max results (default 20)' },
        },
      },
    },
    {
      name: 'get_regulation',
      description:
        'Get complete metadata for a specific regulation by its ID, including issue_positions, provisions, key_obligations, and lineage.',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Regulation ID (e.g. "eu-eu-aiact-2024")' },
        },
      },
    },
    {
      name: 'get_regulation_text',
      description:
        'Get the full legal text of a regulation (markdown). For very large documents, use offset/limit to paginate.',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Regulation ID' },
          offset: {
            type: 'number',
            description: 'Character offset to start reading from (default 0)',
          },
          limit: {
            type: 'number',
            description: 'Max characters to return (default 50000, max 200000)',
          },
        },
      },
    },
    {
      name: 'get_stats',
      description: 'Get summary statistics about the entire regulation database.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'compare_regulations',
      description:
        'Compare two or more regulations side-by-side on key fields: provisions, penalties, scope, issue_positions.',
      inputSchema: {
        type: 'object',
        required: ['ids'],
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of regulation IDs to compare',
          },
        },
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params

  try {
    if (name === 'list_regulations') {
      const filters = (args.filters as Record<string, string>) ?? {}
      const limit = (args.limit as number) ?? 50
      const results = regulations
        .filter((l) => matchesFilter(l, filters))
        .slice(0, limit)
        .map(stripMetadata)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ count: results.length, regulations: results }, null, 2),
          },
        ],
      }
    }

    if (name === 'search_regulations') {
      const query = args.query as string
      const limit = (args.limit as number) ?? 20
      const results = regulations
        .filter((l) => searchLaw(l, query))
        .slice(0, limit)
        .map((l) => ({
          id: l.id,
          short_name: l.short_name,
          jurisdiction: l.jurisdiction,
          region: l.region,
          status: l.status,
          enacted_date: l.enacted_date,
          primary_category: l.primary_category,
          summary: l.summary,
        }))
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ count: results.length, results }, null, 2),
          },
        ],
      }
    }

    if (name === 'get_regulation') {
      const id = args.id as string
      const law = regulations.find((l) => l.id === id)
      if (!law) {
        return {
          content: [{ type: 'text', text: `No regulation found with id: ${id}` }],
          isError: true,
        }
      }
      const textPath = getTextPath(law)
      const textSize = textPath && fs.existsSync(textPath)
        ? fs.statSync(textPath).size
        : null
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ...stripMetadata(law),
                _text_available: !!textPath,
                _text_size_bytes: textSize,
                _text_hint: textSize
                  ? `Use get_regulation_text("${id}") to retrieve the full legal text (${Math.round(textSize / 1024)}KB)`
                  : null,
              },
              null,
              2
            ),
          },
        ],
      }
    }

    if (name === 'get_regulation_text') {
      const id = args.id as string
      const offset = (args.offset as number) ?? 0
      const limit = Math.min((args.limit as number) ?? 50000, 200000)
      const law = regulations.find((l) => l.id === id)
      if (!law) {
        return {
          content: [{ type: 'text', text: `No regulation found with id: ${id}` }],
          isError: true,
        }
      }
      const textPath = getTextPath(law)
      if (!textPath || !fs.existsSync(textPath)) {
        return {
          content: [{ type: 'text', text: `No text file available for: ${id}` }],
          isError: true,
        }
      }
      const full = fs.readFileSync(textPath, 'utf-8')
      const slice = full.slice(offset, offset + limit)
      const hasMore = offset + limit < full.length
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id,
              short_name: law.short_name,
              total_chars: full.length,
              offset,
              returned_chars: slice.length,
              has_more: hasMore,
              next_offset: hasMore ? offset + limit : null,
              text: slice,
            }),
          },
        ],
      }
    }

    if (name === 'get_stats') {
      const counter = (key: string) =>
        regulations.reduce<Record<string, number>>((acc, l) => {
          const v = String(l[key] ?? 'unknown')
          acc[v] = (acc[v] ?? 0) + 1
          return acc
        }, {})

      const byYear = regulations.reduce<Record<string, number>>((acc, l) => {
        const y = String(l.enacted_date ?? '').slice(0, 4)
        if (y) acc[y] = (acc[y] ?? 0) + 1
        return acc
      }, {})

      const regions = new Set(regulations.map((l) => l.region as string)).size
      const jurisdictions = new Set(regulations.map((l) => l.jurisdiction as string)).size
      const countries = new Set(
        regulations
          .filter((l) => l.jurisdiction_type !== 'international' && l.jurisdiction_type !== 'federal')
          .map((l) => l.region as string)
      ).size

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                total_instruments: regulations.length,
                unique_regions: regions,
                unique_jurisdictions: jurisdictions,
                unique_countries_subnational: countries,
                by_status: counter('status'),
                by_jurisdiction_type: counter('jurisdiction_type'),
                by_primary_category: counter('primary_category'),
                by_instrument_type: counter('instrument_type'),
                by_region: counter('region'),
                by_year_enacted: byYear,
              },
              null,
              2
            ),
          },
        ],
      }
    }

    if (name === 'compare_regulations') {
      const ids = args.ids as string[]
      const results = ids.map((id) => {
        const law = regulations.find((l) => l.id === id)
        if (!law) return { id, error: 'not found' }
        return {
          id: law.id,
          short_name: law.short_name,
          jurisdiction: law.jurisdiction,
          status: law.status,
          enacted_date: law.enacted_date,
          effective_date: law.effective_date,
          scope: law.scope,
          who_regulated: law.who_regulated,
          max_penalty_usd_approx: law.max_penalty_usd_approx,
          provisions: law.provisions,
          issue_positions: law.issue_positions,
          key_obligations: law.key_obligations,
          preemption_status: law.preemption_status,
          inspired_by: law.inspired_by,
          influenced: law.influenced,
        }
      })
      return {
        content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
      }
    }

    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${String(err)}` }],
      isError: true,
    }
  }
})

loadData()
const transport = new StdioServerTransport()
await server.connect(transport)
