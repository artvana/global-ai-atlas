#!/bin/bash
# run-pipeline.sh — run large-text extraction, embeddings, and commit in one go.
# Usage: ANTHROPIC_API_KEY=sk-... bash scripts/run-pipeline.sh

set -e

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY is not set."
  echo "Usage: ANTHROPIC_API_KEY=sk-... bash scripts/run-pipeline.sh"
  exit 1
fi

echo "========================================"
echo "Step 1/3: Large-text chunked extraction"
echo "========================================"
npx tsx scripts/extract-large.ts

echo ""
echo "========================================"
echo "Step 2/3: Generate embeddings"
echo "========================================"
npx tsx scripts/embed-rules.ts

echo ""
echo "========================================"
echo "Step 3/3: Commit results"
echo "========================================"

RULES=$(python3 -c "import json; r=json.load(open('data/rules.json')); print(len(r))")
SUSPECTS=""
if [ -f data/dedup-suspects.json ]; then
  SUSPECTS=$(python3 -c "import json; s=json.load(open('data/dedup-suspects.json')); print(len(s))")
fi

git add data/rules.json data/embeddings.json
[ -f data/dedup-suspects.json ] && git add data/dedup-suspects.json
[ -f data/rules-large-progress.json ] && git add data/rules-large-progress.json

git commit -m "$(cat <<EOF
Complete rules extraction: large-text chunking + embeddings

- Re-processed 33 large AI/data laws (EU AI Act, GDPR, CRA, NIST docs,
  NZ Privacy Act, POPIA, Colombia CONPES, Malaysia guidelines, etc.)
  using 180k-char overlapping chunks to capture full document content
- rules.json now contains ${RULES} rules
- Embeddings regenerated for all rules (all-MiniLM-L6-v2, 384 dims)
${SUSPECTS:+- ${SUSPECTS} cross-category dedup suspects in data/dedup-suspects.json}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

echo ""
echo "========================================"
echo "Done."
echo "========================================"
if [ -f data/dedup-suspects.json ] && [ "$SUSPECTS" -gt 0 ]; then
  echo ""
  echo "${SUSPECTS} dedup suspects to review:"
  python3 -c "
import json
suspects = json.load(open('data/dedup-suspects.json'))
for s in suspects:
    print(f\"  {s['rule_a']} ({s['cat_a']}) <-> {s['rule_b']} ({s['cat_b']})\")
"
fi
