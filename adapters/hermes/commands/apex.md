---
description: APEX v2 — 10-agent senior engineering team mode control
---

# /apex — Mode Control

Controls the APEX orchestrator modes and displays status.

## Usage

| Command | Description |
|---------|-------------|
| `/apex team` | Team mode (default) — orchestrator routes to best agent, dynamic peers |
| `/apex select arch,debug,kai` | Select mode — only specified agents active until changed |
| `/apex direct arch` | Direct mode — @arch is main agent with full authority |
| `/apex off` | Disable APEX |
| `/apex status` | Show current mode and active agents |
| `/apex help` | Show this help |

## Modes

1. **Direct** `@agent` — Named agent = main agent with full authority. Can call `@peerName` peers.
2. **Team (default)** — Orchestrator routes request to one agent. That agent calls peers dynamically.
3. **Select** `/apex select kai,rex` — Only those agents active until changed.

## Agent Tags

`@arch` `@ui` `@debug` `@perf` `@sec` `@infra` `@nova` `@reed` `@review` `@flex`
