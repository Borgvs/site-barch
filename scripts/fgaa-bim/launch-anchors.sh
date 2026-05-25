#!/bin/bash
# Wrapper that launches run-anchors.sh in background and returns
chmod +x /Users/gustavo/Documents/Claude/Projects/Barch-system/site-barch/scripts/fgaa-bim/run-anchors.sh
nohup /Users/gustavo/Documents/Claude/Projects/Barch-system/site-barch/scripts/fgaa-bim/run-anchors.sh > /dev/null 2>&1 &
echo "PID: $!"
