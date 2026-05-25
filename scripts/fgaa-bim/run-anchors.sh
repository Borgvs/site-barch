#!/bin/bash
# Run the full anchor derivation chain B4 → B3 → B2 → B1 → B0 sequentially.
# Each anchor depends on the previous (uses it as source via FLUX.1 Kontext Max).
cd "$(dirname "$0")/../.."
export PATH=/opt/homebrew/bin:$PATH
export $(grep -v '^#' .env.local | grep '=' | xargs)

LOG="tmp/bim-v1/anchors.log"
echo "━━━ FGAA-BIM v1.0 · Cadeia B4 → B0 ━━━" > "$LOG"
echo "Started: $(date)" >> "$LOG"

for ANCHOR in B4 B3 B2 B1 B0; do
  echo "" >> "$LOG"
  echo "━━━━━━━━━━━━━━━━ Generating $ANCHOR ━━━━━━━━━━━━━━━━" >> "$LOG"
  /opt/homebrew/bin/node scripts/fgaa-bim/02-bim-anchors.mjs "$ANCHOR" >> "$LOG" 2>&1
  if [ $? -ne 0 ]; then
    echo "FAILED at $ANCHOR" >> "$LOG"
    exit 1
  fi
done

echo "" >> "$LOG"
echo "━━━ CADEIA COMPLETA: $(date) ━━━" >> "$LOG"
