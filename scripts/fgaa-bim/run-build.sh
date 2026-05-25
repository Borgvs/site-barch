#!/bin/bash
cd "$(dirname "$0")/../.."
export PATH=/opt/homebrew/bin:$PATH
LOG="tmp/bim-v1/build.log"
echo "━━━ Build started: $(date) ━━━" > "$LOG"
/opt/homebrew/bin/npm run build >> "$LOG" 2>&1
RC=$?
echo "" >> "$LOG"
echo "━━━ Build finished RC=$RC: $(date) ━━━" >> "$LOG"
exit $RC
