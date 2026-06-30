---
description: "[Composio] Connect tools via apex-composio-setup"
---

## Composio Setup

Connect external tools (Gmail, GitHub, Slack, Jira, Notion, etc.) via Composio.

### Run the setup
```bash
node src/composio-setup.mjs
```

Or with arguments:
```bash
node src/composio-setup.mjs --api-key ak_your_key --tool gmail
```

### What it does
1. Paste your Composio API key (get from https://composio.dev/settings)
2. Enter a tool slug (e.g. gmail, github, slack, jira, notion)
3. Opens OAuth link in browser — authorize there
4. Done — config saved to `.composio-config.json`

### After connecting
Use `@toolName` to invoke (e.g. `@gmail`, `@github`, `@slack`, `@jira`)

### Related commands
- `/composio-status` — Show connected tools
- `/composio-sync` — Force sync from Composio backend
