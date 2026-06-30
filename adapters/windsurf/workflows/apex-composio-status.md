---
name: composio-status
description: "[Composio] Show connected tools via apex-composio-status"
workflow:
  steps:
    - name: status
      description: Show Composio status
      command: node src/composio-status.mjs

## Shows
- API key status (configured / missing)
- Connected tools list with status (ACTIVE / INACTIVE)
- Connection IDs for each tool
- Quick usage examples for each connected tool

## Related
- `apex-composio-setup` — Add a new tool connection
- `apex-composio-sync` — Force sync from Composio backend
---
