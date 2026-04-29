/**
 * embed-rules.ts
 *
 * Generates embeddings for all rules in data/rules.json using the
 * all-MiniLM-L6-v2 model (384 dims) and writes them to data/embeddings.json.
 *
 * Run after extract-rules.ts, or independently to refresh embeddings:
 *   npx tsx scripts/embed-rules.ts
 *
 * No API key required — runs the model locally via @xenova/transformers.
 */

import { pipeline, env } from '@xenova/transformers'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const RULES_PATH      = path.join(PROJECT_ROOT, 'data', 'rules.json')
const EMBEDDINGS_PATH = path.join(PROJECT_ROOT, 'data', 'embeddings.json')

env.allowRemoteModels = true

interface Rule {
  rule_id: string
  rule_text: string
  rule_text_technical: string
  tags: string[]
}

async function main() {
  console.log('Loading embedding model (all-MiniLM-L6-v2)...')
  console.log('First run downloads ~22 MB from HuggingFace — cached after that.')

  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    progress_callback: (info: { status: string; file?: string; progress?: number }) => {
      if (info.status === 'progress' && info.progress != null) {
        process.stdout.write(`\r  Downloading ${info.file ?? ''}: ${Math.round(info.progress)}%   `)
      }
    }
  })
  console.log('\nModel ready.')

  const rules: Rule[] = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'))
  const existing: Record<string, number[]> = fs.existsSync(EMBEDDINGS_PATH)
    ? JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf8'))
    : {}

  const toEmbed = rules.filter(r => !existing[r.rule_id])
  console.log(`${rules.length} rules total, ${toEmbed.length} need embeddings.`)

  if (toEmbed.length === 0) {
    console.log('All rules already embedded. Nothing to do.')
    return
  }

  const embeddings: Record<string, number[]> = { ...existing }

  for (let i = 0; i < toEmbed.length; i++) {
    const rule = toEmbed[i]
    process.stdout.write(`\r[${i + 1}/${toEmbed.length}] ${rule.rule_id.slice(0, 50).padEnd(50)}`)

    // Embed: combine rule_text + tags for richer representation
    const text = `${rule.rule_text} ${rule.tags.join(' ')}`
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    embeddings[rule.rule_id] = Array.from(output.data as Float32Array)
  }

  fs.writeFileSync(EMBEDDINGS_PATH, JSON.stringify(embeddings, null, 2) + '\n')
  console.log(`\n\nDone. ${Object.keys(embeddings).length} embeddings written to data/embeddings.json`)
  console.log('Commit the file and push to redeploy the app with semantic search enabled.')
}

main().catch(err => {
  console.error('\nFatal:', err)
  process.exit(1)
})
