#!/usr/bin/env bash
# ClaudeCurate — Claude Code Stop hook
# Paste your webhook token below, then add this to ~/.claude/settings.json:
#
# {
#   "hooks": {
#     "Stop": [{ "matcher": "", "hooks": [{ "type": "command", "command": "bash ~/claude-hook.sh" }] }]
#   }
# }

set -euo pipefail

WEBHOOK_TOKEN="YOUR_WEBHOOK_TOKEN_HERE"
API_URL="https://your-deployed-api.com/api/webhook/claude-hook"

PAYLOAD=$(cat)
TASK_DESC=$(echo "$PAYLOAD" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('description') or data.get('task_description') or data.get('message', ''))
" 2>/dev/null || echo "")

[ -z "$TASK_DESC" ] && exit 0

curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"webhookToken\":\"$WEBHOOK_TOKEN\",\"taskDescription\":\"$TASK_DESC\"}" \
  > /dev/null

exit 0
