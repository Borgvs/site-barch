#!/bin/bash
# Submit 5 Veo jobs + poll until all complete + download
cd "$(dirname "$0")/../.."
export PATH=/opt/homebrew/bin:$PATH
export $(grep -v '^#' .env.local | grep '=' | xargs)

LOG="tmp/bim-v1/videos.log"
echo "━━━ FGAA-BIM v1.0 · Fase 3 + Polling ━━━" > "$LOG"
echo "Started: $(date)" >> "$LOG"

echo "" >> "$LOG"
echo "━━━ SUBMIT ━━━" >> "$LOG"
/opt/homebrew/bin/node scripts/fgaa-bim/03-bim-videos-submit.mjs >> "$LOG" 2>&1
if [ $? -ne 0 ]; then echo "SUBMIT FAILED" >> "$LOG"; exit 1; fi

echo "" >> "$LOG"
echo "━━━ POLL ━━━" >> "$LOG"
/opt/homebrew/bin/node scripts/fgaa-bim/03-bim-videos-poll.mjs >> "$LOG" 2>&1

echo "" >> "$LOG"
echo "━━━ FASE 3 COMPLETA: $(date) ━━━" >> "$LOG"
