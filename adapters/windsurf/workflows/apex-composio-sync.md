---
name: composio-sync
description: "[Composio] Force sync via apex-composio-sync"
workflow:
  steps:
    - name: sync
      description: Sync Composio tools
      command: node src/composio-status.mjs --sync

## What it does
- Re-fetches all tool definitions from Composio API
- Syncs connection status for all registered tools
- Updates the MCP tool list with latest schemas

## Related
- `apex-composio-setup` — Add a new tool connection
- `apex-composio-status` — Check connection status
---
