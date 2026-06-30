---
description: "[Composio] Show connected tools via apex-composio-status"
---

## Composio Status

Check which Composio tools are connected and their status.

### Run
```bash
node src/composio-status.mjs
```

### Shows
- API key status (configured / missing)
- Connected tools list with status (ACTIVE / INACTIVE)
- Connection IDs for each tool
- Quick usage examples for each connected tool

### Related commands
- `/composio-setup` — Add a new tool connection
- `/composio-sync` — Force sync from Composio backend
