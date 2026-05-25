#!/bin/bash
chmod +x /Users/gustavo/Documents/Claude/Projects/Barch-system/site-barch/scripts/fgaa-bim/run-build.sh
nohup /Users/gustavo/Documents/Claude/Projects/Barch-system/site-barch/scripts/fgaa-bim/run-build.sh > /dev/null 2>&1 &
echo "PID: $!"
