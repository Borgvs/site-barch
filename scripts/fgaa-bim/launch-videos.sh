#!/bin/bash
chmod +x /Users/gustavo/Documents/Claude/Projects/Barch-system/site-barch/scripts/fgaa-bim/run-videos.sh
nohup /Users/gustavo/Documents/Claude/Projects/Barch-system/site-barch/scripts/fgaa-bim/run-videos.sh > /dev/null 2>&1 &
echo "PID: $!"
