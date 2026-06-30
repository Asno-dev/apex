---
description: "[Composio] Connect tools — paste API key, get OAuth link, done"
agent: composio
---

Starting Composio setup...

**Run the setup script:**
```bash
node src/composio-setup.mjs
```

**Or with arguments:**
```bash
node src/composio-setup.mjs --api-key ak_your_key --tool gmail
```

**What it does:**
1. Paste your Composio API key (get from composio.dev/settings)
2. Enter a tool slug (e.g. gmail, github, slack)
3. Opens OAuth link in browser — authorize there
4. Done — config saved to `.composio-config.json`

**After connecting**, use `@toolName` to invoke (e.g. `@gmail`, `@github`).

**Commands:**
- `/composio-setup` — Add a new tool
- `/composio-status` — Show connected tools
- `/composio-sync` — Force sync from backend
