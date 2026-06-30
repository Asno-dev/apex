---
description: "[Composio] Connect tools via apex-composio-setup"
---

# apex-composio-setup — Connect a Composio Tool

Connects an external service to the APEX system via Composio's 1000+ tool integrations.

## Usage

```
apex-composio-setup
```

You will be prompted to:
1. Select the tool to connect (e.g. Gmail, GitHub, Slack, Jira, Notion)
2. Paste an API key or follow an OAuth link

## Connected Tools

After connecting, invoke tools directly with `@toolName`:
- `@gmail` — Read/send emails
- `@github` — Manage repos, issues, PRs
- `@slack` — Send messages to channels
- `@jira` — Create and update tickets
- `@notion` — Read/write pages and databases

## See Also

`apex-composio-status` — Show connected tools
`apex-composio-sync` — Force sync from backend
