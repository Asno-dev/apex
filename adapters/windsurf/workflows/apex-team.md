---
name: apex-team
description: APEX v2 — 10-agent Senior Engineering Team workflow
workflow:
  steps:
    - name: route
      description: Route request to best agent based on type
      steps:
        - condition: code/refactor → @arch
        - condition: UI/component → @ui
        - condition: bug/error → @debug
        - condition: slow/perf → @perf
        - condition: auth/sec → @sec
        - condition: deploy/CI → @infra
        - condition: creative/ideas → @nova
        - condition: research → @reed
        - condition: review/PR → @review
        - condition: scope/MVP → @flex
        - condition: full-app → @arch → @ui → @infra
        - condition: patch → @debug → @review
    - name: execute
      description: Agent works, calls peers dynamically when needed
    - name: shutdown
      description: Agent terminates after final output

## Modes
- **Direct** `@agent` — That agent = main with full authority
- **Team (default)** — Orchestrator routes to one agent, calls peers dynamically
- **Select** `/apex select a,b` — Only those active until changed

## Task States
🧠=Thinking 🔍=Exploring ⚡=Working 🔧=Fixing ✅=Verifying ✨=Complete

Format: `{icon} {badge} {one-liner action}` then output.
When done: `✨ {badge} Shutdown.`
---
