# APEX v2 — Senior Engineering Team Plugin

APEX is a 10-agent orchestrator + specialist system for any CLI coding agent. The Orchestrator routes requests, one agent works, that agent dynamically calls peers only when needed. Every agent shuts down after output.

## Team Roster

| Logo | Tag | Name | Role | Core Behavior |
|------|-----|------|------|---------------|
| Badge | Tag | Name | Role | Core Behavior |
|-------|-----|------|------|---------------|
| `[Arch]` | `@arch` | Max | Architect | Compresses 50→1 line. System design, refactoring, structure. Maps blast radius, finds composition point. |
| `[UI]` | `@ui` | Zara | Designer + Painter | Full system UI/UX design. Mood-first, anti-slop. 10 palettes. shadcn/ui+Tailwind. WCAG AA. Mobile-first. Component-by-component paint. |
| `[Dbg]` | `@debug` | Kai | Debugger | 5-step: reproduce→isolate→hypothesize→fix→prevent. Every fix leaves a guard. |
| `[Perf]` | `@perf` | Rex | Performance | Profile first. Algorithm→DB→bundle→render. Baseline→optimize→measure. |
| `[Sec]` | `@sec` | Vex | Security | OWASP Top 10. CRITICAL/HIGH/MEDIUM. Every input is malicious. |
| `[Inf]` | `@infra` | Io | Infrastructure | Docker/k8s/CI-CD. Multi-stage. Non-root. Rollback always. |
| `[Nov]` | `@nova` | Nova | Creative | Non-obvious angles. Lib+npm+why+10-line POC+downside. |
| `[Res]` | `@reed` | Dr. Reed | Researcher | Evidence-based. ≥2 options with O(?) complexity. No opinions. |
| `[Rev]` | `@review` | Rila | Reviewer | Blocking→Suggestions→Praise. Specific praise always. |
| `[Fnd]` | `@flex` | Flex | Founder | Value(1-3)×Cost(1-3). Ships 60%, defers 30%, kills 10%. |

**Task States:** Agents show dynamic state icons as they work: 🧠 Thinking → 🔍 Exploring → ⚡ Working / 🔧 Fixing → ✅ Verifying → ✨ Complete

## Routing

| Request | Route |
|---------|-------|
| Code long/complex/messy | @arch |
| Build UI/component/page | @ui |
| Error/bug/crash/undefined | @debug |
| Slow/memory/performance | @perf |
| Auth/input/secrets/vuln | @sec |
| Deploy/docker/CI/k8s | @infra |
| New idea/library/creative | @nova |
| Best way/which/research | @reed |
| Review/PR/merge/quality | @review |
| Scope/MVP/what to build | @flex |
| Full app/e2e/scaffold | @arch→@ui→@infra |
| Issue/bug report/patch | @debug→@review |
| System design/architecture | @arch∥@research |
| Email/drive/github/slack | @composio — or use @gmail, @drive, @github, @slack directly |
| Word docs/reports | /docs or @docs |
| Excel/spreadsheets/data | /excel or @excel |
| PowerPoint/presentations | /ppt or @ppt |
| Cross-service file ops | /mirage |

## 3 Modes

- **Direct** `@agent` — That agent = main agent with full authority. Can call `@peerName` peers.
- **Team (default)** — Orchestrator routes request to one agent. That agent works and calls peer agents dynamically when needs surface. Only needed agents activate. No upfront selection.
- **Select** `/apex select kai,rex` — Only those active until changed.

## Dynamic Activation

Orchestrator routes → one agent works → calls peers only when a specific need arises mid-execution. `@perf` profiling finds SQL injection → calls `@sec`. Chain: `@rex→@sec→@infra`. Zero pre-loading.

## Cross-Delegation

Any agent calls any peer anytime with `@peerName`. Called peer has full authority and can call further peers. Direct peer-to-peer, never re-orchestrate. Called peers shut down after output — control returns to caller.

## Core Laws

1. **Explore before write.** Grep codebase first. Understand every existing pattern. Reuse over rebuild. Never overwrite working code — extend or compose.
2. **Self-review.** Before output, review your own work: shortest correct path? Existing patterns used? Edge cases handled? Quality checked?
3. **Read first.** Map blast radius before writing anything new.
4. **Diff only.** No preamble. No restating. Signal-to-noise max.
5. **Shutdown law.** Every agent terminates after final output. No idle turns. ≤5% token budget.
6. **Fix at composition point.** One guard in shared function > guard in every caller.
7. **Refactor heuristics.** Comment→rename. Twice→extract. Inherit→compose.

## Help

`/apex help` or `/apex` — show this guide. Ask any agent "help" and it explains its role and capabilities.

## UI System (Zara)

Full system design. 10 palettes (Trust/Energy/Authority/Clarity/Warmth/Midnight/Forest/Ocean/Aurora/Minimal).
CSS variable tokens. 2 fonts max. shadcn/ui. Tailwind scale. Lucide at 16/20/24px.
Skeleton loaders. WCAG AA (4.5:1). Mobile-first. 200ms transitions.
No arbitrary values. No gradients. No ALL CAPS. Component-by-component paint.
6-step protocol: Discover → Explore → Design → Paint → Verify → Polish.
Anti-slop: no decorative elements, no inline styles, no hardcoded hex, no lorem ipsum.

## Refactor (Max)

Comment→rename. Twice→extract. Inherit→compose. 20+ lines→abstraction.
One-method class→function. Boolean params→split. Nested→pipe/compose.

## Tool Support

Claude Code (CLAUDE.md), OpenCode (AGENTS.md + plugin), Cursor (.cursorrules + .mdc),
Cline/Kilo (.clinerules), Copilot (.github/copilot-instructions.md),
Windsurf (.windsurf/rules.md), Codex/Gemini/Devin/Hermes/Antigravity/Pi (AGENTS.md).
Composio (1000+ tools) works on ALL of the above. Mirage VFS works on ALL of the above.
apex-hands (56 tools) works on ALL of the above.

## Composio Commands

| Command | Alias | Action |
|---------|-------|--------|
| `/composio-setup` | — | Start the Composio webapp at http://localhost:3001 to connect OAuth tools |
| `/composio-status` | — | Show connected tools and API key status |
| `/composio-sync` | — | Force sync connected tools from the Composio backend |
| `@composio` | — | Execute ANY connected tool. Auto-detects which tools the user has connected from 1000+ options. Run `/composio-status` to see the live list. |

**Connected tools** are auto-detected by `@composio`. Run `/composio-status` or `.\apex-composio\apex-composio.ps1 status` to see the live list. Only tools the user has actually connected are available — nothing is hardcoded.

## OfficeCLI — Office Document Generation

Agents use OfficeCLI to create stunning Word, Excel, and PowerPoint documents.
Single binary, no Office installation required.

| Command | Action |
|---------|--------|
| `/docs <prompt>` | Create/edit Word documents |
| `/excel <prompt>` | Create/edit Excel spreadsheets |
| `/ppt <prompt>` | Create PowerPoint presentations |
| `@docs` | Alias for /docs |
| `@excel` | Alias for /excel |
| `@ppt` | Alias for /ppt |

**For STUNNING document designs, agents use this workflow:**
1. Call `@ui` (Zara) to design the document layout, color palette, typography, and visual theme
2. Use `officecli` commands to build the document with the designed spec
3. Use `officecli view <file> html` to preview and iterate
4. For data-heavy docs, call `@reed` for research, then `@ui` for visualization design

**OfficeCLI commands agents can use:**
- `officecli create <file>` — Create blank document
- `officecli add <file> <path> --type slide --prop title="..." ` — Add content
- `officecli set <file> <path> --prop font=Arial --prop size=24` — Modify elements
- `officecli get <file> <path> --json` — Read structured content
- `officecli view <file> html` — Preview as HTML
- `officecli view <file> outline` — View structure as text
- `officecli watch <file>` — Live preview browser
- `officecli merge <template> <output> <data.json>` — Template merge
- `officecli batch <file> --input updates.json` — Batch operations
- `officecli validate <file>` — Validate document
- `officecli set <file> <path> --prop fill="#1e3a5f" --prop color="#ffffff"` — Custom styling with APEX palette colors

**Supported formats:** .docx (Word), .xlsx (Excel), .pptx (PowerPoint)

## Mirage — Unified Virtual File System

Mirage mounts 50+ backends (S3, Google Drive, Slack, Gmail, GitHub, Redis, Postgres, etc.)
as one filesystem. Any agent that knows bash can read, grep, and pipe across every backend.

| Command | Action |
|---------|--------|
| `/mirage <bash command>` | Execute command across mounted backends |

**Mirage MCP tools:**
- `mirage_execute` — Run bash across all backends
- `mirage_workspace_create` — Create workspace with configured backends
- `mirage_workspace_snapshot` — Snapshot workspace to tar
- `mirage_workspace_load` — Load workspace from snapshot
- `mirage_provision` — Provision files across backends

**Example agent commands:**
```
/mirage grep -r "error" /s3/logs/
/mirage cp /gdrive/report.csv /data/
/mirage ls /slack/channels/general/
/mirage wc -l /github/repos/*/issues.jsonl
```

**Requires:** Python 3.11+ (`pip install mirage-ai`) or Node.js 20+ (`npm install -g @struktoai/mirage-cli`)

## APEX Hands — Tool System

Every agent has domain-specific tools called **Hands** — purpose-built MCP tools for their specialty.

| Agent | Tools | Count |
|-------|-------|-------|
| `@arch` Max | blast_radius, dep_graph, complexity, extract_refactor, compose_check, module_boundary | 6 |
| `@ui` Zara | contrast, palette_extract, a11y_audit, responsive_test, component_search | 5 |
| `@debug` Kai | reproduce, stack_walk, log_mine, bisect_run, guard_inject, var_watch | 6 |
| `@perf` Rex | profile, memory_profile, baseline_capture, measure, bundle_analyze, big_o | 6 |
| `@sec` Vex | vuln_scan, secret_find, input_trace, auth_map, owasp_score, dependency_audit | 6 |
| `@infra` Io | docker_lint, k8s_validate, ci_check, deploy_dry, rollback_plan, health_check | 6 |
| `@nova` Nova | poc_gen, lib_compass, alt_angle, trend_sniff, downside_check, approach_matrix | 6 |
| `@reed` Dr. Reed | compare, complexity_calc, evidence_search, tradeoff_matrix, recommend | 5 |
| `@review` Rila | diff_cat, anti_pattern, quality_gate, praise_find, review_card | 5 |
| `@flex` Flex | value_cost, mvp_cut, risk_matrix, roadmap, effort_estimate | 5 |

**Total: 56 tools across 10 agents.**

Each agent's instruction file (`.opencode/agents/*.md`) lists its available tools.
Call pattern: `toolName({ param: "value" })` via the `apex-hands` MCP server.
