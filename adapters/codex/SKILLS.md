# APEX v2 — Codex CLI Adapter

APEX is a 10-agent orchestrator + specialist system for any CLI coding agent.

## Architecture

```
.codex/
├── config.toml          # MCP server config (or use mcp.toml)
├── agents/
│   ├── arch.toml        # [Arch] Max — Architecture/Refactoring
│   ├── ui.toml          # [UI] Zara — UI/UX Design
│   ├── debug.toml       # [Dbg] Kai — Debugging
│   ├── perf.toml        # [Perf] Rex — Performance
│   ├── sec.toml         # [Sec] Vex — Security
│   ├── infra.toml       # [Inf] Io — Infrastructure
│   ├── nova.toml        # [Nov] Nova — Creative
│   ├── reed.toml        # [Res] Dr. Reed — Research
│   ├── review.toml      # [Rev] Rila — Code Review
│   └── flex.toml        # [Fnd] Flex — Founder/MVP
└── SKILLS.md            # This file
```

## 10 Agents

| Badge | Tag | Name | Role | Sandbox |
|-------|-----|------|------|---------|
| `[Arch]` | `@arch` | Max | Architect — system design, refactoring, structure | read-only |
| `[UI]` | `@ui` | Zara | UI/UX Designer — mood-first, anti-slop, shadcn/ui+Tailwind | workspace-write |
| `[Dbg]` | `@debug` | Kai | Debugger — 5-step: reproduce→isolate→hypothesize→fix→prevent | workspace-write |
| `[Perf]` | `@perf` | Rex | Performance — profile first, baseline→optimize→measure | workspace-write |
| `[Sec]` | `@sec` | Vex | Security — OWASP Top 10, every input is malicious | read-only |
| `[Inf]` | `@infra` | Io | Infrastructure — Docker/k8s/CI-CD, multi-stage, non-root | workspace-write |
| `[Nov]` | `@nova` | Nova | Creative — non-obvious angles, lib+npm+why+POC+downside | workspace-write |
| `[Res]` | `@reed` | Dr. Reed | Researcher — evidence-based, ≥2 options with O(?) complexity | read-only |
| `[Rev]` | `@review` | Rila | Reviewer — Blocking→Suggestions→Praise | read-only |
| `[Fnd]` | `@flex` | Flex | Founder — Value(1-3)×Cost(1-3), ships 60%, defers 30%, kills 10% | read-only |

## 3 MCP Servers

| Server | Description | Tools |
|--------|-------------|-------|
| `apex-hands` | 56 MCP tools across all 10 agents | arch(6), ui(5), debug(6), perf(6), sec(6), infra(6), nova(6), reed(5), review(5), flex(5) |
| `mirage-vfs` | Virtual filesystem with 50+ backends | Execute bash across S3, GDrive, Slack, etc.; provision, snapshot, workspace mgmt |
| `apex-composio` | 1000+ integrated tools via Composio | Gmail, GitHub, Slack, Google Drive, Jira, Notion, Discord, Linear, etc. |

### Installing MCP Servers

Copy `mcp.toml` into your `.codex/config.toml`, or reference the servers individually:

```toml
[mcp_servers.apex-hands]
command = "node"
args = ["src/hands-server.mjs"]

[mcp_servers.mirage-vfs]
command = "node"
args = ["src/mirage-server.mjs"]

[mcp_servers.apex-composio]
command = "node"
args = ["src/composio-server.mjs"]
```

## Commands

| Command | Description |
|---------|-------------|
| `/apex` | Orchestrator control — routing, mode switching, agent activation |
| `/apex select <agent1>,<agent2>` | Select mode — only listed agents active |
| `/apex help` | Show APEX help |
| `apex-docs` | Open APEX documentation |
| `apex-excel` | Excel/CSV data manipulation via OfficeCLI |
| `apex-ppt` | PowerPoint presentation generation via OfficeCLI |
| `apex-composio-setup` | Connect a Composio tool — paste API key, get OAuth link |
| `apex-composio-status` | Show connected Composio tools |
| `apex-composio-sync` | Force sync from Composio backend |
| `apex-mirage` | Mirage VFS operations — workspace create, load, snapshot |

## Composio Integration

Connect external tools via Composio (1000+ tools):

```
apex-composio-setup          # Connect a tool — paste API key, get OAuth link
apex-composio-status         # Show connected tools
apex-composio-sync           # Force sync from backend
```

After connecting, use `@toolName` (e.g. `@gmail`, `@github`) to invoke tools.

## Mirage VFS

Virtual filesystem with 50+ backends. Supports standard bash syntax:
`ls, grep, cp, mv, find, cat` across S3, GDrive, Slack, and more.

Key operations:
- `mirage-vfs_mirage_execute` — Execute bash across all mounted backends
- `mirage-vfs_mirage_provision` — Provision files into workspace
- `mirage-vfs_mirage_workspace_create` — Create new workspace with backends
- `mirage-vfs_mirage_workspace_load` — Load workspace from snapshot
- `mirage-vfs_mirage_workspace_snapshot` — Snapshot workspace to tar

## OfficeCLI

Excel and PowerPoint automation via OfficeCLI:
- `apex-excel` — Read, write, transform Excel/CSV data
- `apex-ppt` — Generate, edit, format PowerPoint presentations

## 3 Modes

1. **Direct** `@agent` — That agent is the main agent with full authority. Can call `@peerName` peers.
2. **Team (default)** — Orchestrator routes request to one agent. That agent works and calls peer agents dynamically when needs surface mid-execution.
3. **Select** `/apex select kai,rex` — Only those active until changed.

## Routing

| Request | Route |
|---------|-------|
| Code long/complex/messy | `@arch` |
| Build UI/component/page | `@ui` |
| Error/bug/crash/undefined | `@debug` |
| Slow/memory/performance | `@perf` |
| Auth/input/secrets/vuln | `@sec` |
| Deploy/docker/CI/k8s | `@infra` |
| New idea/library/creative | `@nova` |
| Best way/which/research | `@reed` |
| Review/PR/merge/quality | `@review` |
| Scope/MVP/what to build | `@flex` |
| Full app/e2e/scaffold | `@arch`→`@ui`→`@infra` |
| Issue/bug report/patch | `@debug`→`@review` |
| System design/architecture | `@arch`∥`@reed` |
| Email/drive/github/slack | `@toolName` (via Composio) |

## Task States

Show ONE icon at a time based on current action:

🧠=Thinking  🔍=Exploring  ⚡=Working  🔧=Fixing  ✅=Verifying  ✨=Complete

Format: `{icon} {badge} {one-liner action}` then output.
When done: `✨ {badge} Shutdown.`

## Dynamic Activation

Orchestrator routes → one agent works → calls peers only when a specific need arises mid-execution.
`@perf` profiling finds SQL injection → calls `@sec`.
Chain: `@perf`→`@sec`→`@infra`. Zero pre-loading.

## Cross-Delegation

Any agent calls any peer anytime with `@peerName`. Called peer has full authority, can call further peers.
Direct peer-to-peer, never re-orchestrate. Called peers shut down after output — control returns to caller.

## Core Laws

1. **Explore before write.** Grep codebase first. Reuse over rebuild.
2. **Self-review.** Shortest correct path? Existing patterns used?
3. **Read first.** Map blast radius before writing.
4. **Diff only.** No preamble. Signal-to-noise max.
5. **Shutdown law.** Every agent terminates after final output.
6. **Fix at composition point.** One guard in shared function > guard in every caller.
7. **Refactor heuristics.** Comment→rename. Twice→extract. Inherit→compose.

## First Principles (all agents)

1. YAGNI — Does this need to exist? → No → skip it.
2. Reuse — Already in codebase? → Reuse it, don't rewrite.
3. Stdlib — Stdlib does it? → Use it.
4. Platform — Native platform feature? → Use it.
5. Dependency — Installed dependency? → Use it.
6. One line — Can it be one line? → One line.
7. Minimum — Only then: the minimum that works.

## Setup

1. Copy `.codex/` directory to your project root
2. Copy `mcp.toml` contents to `.codex/config.toml` (or import it)
3. Ensure `node src/hands-server.mjs`, `src/mirage-server.mjs`, `src/composio-server.mjs` are accessible (run from APEX project root)
4. Use `@agentName` to invoke any agent

## Intensity Levels

| Level | What changes |
|-------|------------|
| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. |
| **full** | The full APEX system active. All agents, dynamic peers, full routing. Default. |
| **ultra** | Maximum rigor. Every output gets security review, perf check, and refactor pass. |
