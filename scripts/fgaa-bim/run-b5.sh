#!/bin/bash
# Run B5 master generation in background. Logs to tmp/bim-v1/B5.log
cd "$(dirname "$0")/../.."
export PATH=/opt/homebrew/bin:$PATH
export $(grep -v '^#' .env.local | grep '=' | xargs)
nohup /opt/homebrew/bin/node scripts/fgaa-bim/01-bim-master.mjs > tmp/bim-v1/B5.log 2>&1 &
echo "PID: $!"
