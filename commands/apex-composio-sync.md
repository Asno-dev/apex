---
description: "[Composio] Force sync via apex-composio-sync"
---

## Composio Sync

Force refresh all connected Composio tools from the backend.

### Run
```bash
node src/composio-status.mjs --sync
```

### What it does
- Re-fetches all tool definitions from Composio API
- Syncs connection status for all registered tools
- Updates the MCP tool list with latest schemas

### Related commands
- `/composio-setup` — Add a new tool connection
- `/composio-status` — Check connection status
