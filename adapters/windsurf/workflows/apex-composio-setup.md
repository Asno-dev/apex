---
name: composio-setup
description: "[Composio] Connect tools via apex-composio-setup"
workflow:
  steps:
    - name: setup
      description: Run Composio setup tool
      command: node src/composio-setup.mjs
    - name: setup-with-args
      description: Run Composio setup with API key and tool
      command: node src/composio-setup.mjs --api-key ak_your_key --tool gmail

## What it does
1. Paste your Composio API key (get from https://composio.dev/settings)
2. Enter a tool slug (e.g. gmail, github, slack, jira, notion)
3. Opens OAuth link in browser — authorize there
4. Done — config saved to `.composio-config.json`

## After connecting
Use `@toolName` to invoke (e.g. `@gmail`, `@github`, `@slack`, `@jira`)

## 1000+ tools available
Email, Calendar, CRM, Code repositories, Project management, Communication, Cloud services, Databases, and more

## Related
- `apex-composio-status` — Show connected tools
- `apex-composio-sync` — Force sync from Composio backend
---
