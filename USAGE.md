# APEX v2 — Installation Guide for All Agents

## Per-Agent Install (Primary — Marketplace)

### Claude Code
```
/plugin marketplace add asno-dev/apex
/plugin install apex@apex
```
Restart Claude Code. APEX loads automatically.

### Codex CLI
```
codex plugin marketplace add asno-dev/apex
```
Open `/plugins`, select APEX, install. Then open `/hooks`, trust the lifecycle hooks.

### GitHub Copilot CLI
```
copilot plugin marketplace add asno-dev/apex
copilot plugin install apex@apex
```

### OpenCode
Add to `opencode.json`:
```json
{ "plugin": ["@asno-dev/apex"] }
```
Or from a local checkout:
```json
{ "plugin": ["./.opencode/plugins/apex.mjs"] }
```

### Gemini CLI
```
gemini extensions install https://github.com/asno-dev/apex
```
Loads AGENTS.md as always-on context every session.

### Antigravity CLI
```
agy plugin install https://github.com/asno-dev/apex
```

### Devin CLI
```
devin plugins install asno-dev/apex
```

### Hermes Agent
```
hermes plugins install asno-dev/apex --enable
```
Restart Hermes after installing.

### Pi Agent
```
pi install git:github.com/asno-dev/apex
```

### Swival
```
swival skills add --global https://github.com/asno-dev/apex
swival skills add apex
```

### OpenClaw
```
clawhub install apex
```

### Cursor
Copy `.cursor/rules/apex.mdc` to your project's `.cursor/rules/` directory.

### Windsurf
Copy `.windsurf/rules/apex.md` to your project's `.windsurf/` directory.

### Cline / Kilo Code
Copy `.clinerules` to your project root.

### GitHub Copilot (editor)
Copy `.github/copilot-instructions.md` to your project's `.github/` directory.

### Kiro
Copy `adapters/kiro/apex.md` to `~/.kiro/steering/` (global) or `.kiro/steering/` (project).

### CodeWhale
Copy `AGENTS.md` to your project root. CodeWhale reads it automatically.

### npm (npx auto-installer — fallback)
```bash
npx @asno-dev/apex
```
Auto-detects your installed agents and copies the right files.

---

## Usage

```
@arch refactor this         → Max compresses code
@ui build a login form      → Zara paints WCAG AA form
@debug fix this error       → Kai 5-step debug
@perf this is slow          → Rex profiles & optimizes
@sec review auth code       → Vex OWASP scans
@infra dockerize this       → Io outputs production config
@nova any ideas             → Nova proposes novel angles
@reed best caching          → Dr. Reed compares options
@review check this code     → Rila blocks/suggests/praises
@flex what's the MVP?       → Flex scores & cuts scope
```

### Modes
- **Direct** — `@arch refactor this` = Max is main, can call peers
- **Team (default)** — Auto-routes to best agent, dynamic peers
- **Select** — `/apex select kai,rex` = only those agents active

### Mode Commands
```
/apex team        → Team mode (default)
/apex select a,b  → Select specific agents
/apex off         → Disable APEX
/apex status      → Show current mode
/apex help        → Show help
```

### Agent Chains
```
Full app:     @arch → @ui → @infra (sequential)
Bug patch:    @debug → @review (sequential)
System design: @arch ∥ @reed (parallel)
```

### Dynamic Peers
Any agent can call any peer mid-task:
- `@perf` finds SQL injection → calls `@sec`
- `@ui` needs backend → calls `@infra`
- `@debug` finds performance issue → calls `@perf`

---

## Tools (apex-hands)

Every agent has domain-specific tools via the `apex-hands` MCP server:

| Agent | Tools |
|-------|-------|
| @arch | blast_radius, dep_graph, complexity, extract_refactor, compose_check, module_boundary |
| @ui | contrast, palette_extract, a11y_audit, responsive_test, component_search |
| @debug | reproduce, stack_walk, log_mine, bisect_run, guard_inject, var_watch |
| @perf | profile, memory_profile, baseline_capture, measure, bundle_analyze, big_o |
| @sec | vuln_scan, secret_find, input_trace, auth_map, owasp_score, dependency_audit |
| @infra | docker_lint, k8s_validate, ci_check, deploy_dry, rollback_plan, health_check |
| @nova | poc_gen, lib_compass, alt_angle, trend_sniff, downside_check, approach_matrix |
| @reed | compare, complexity_calc, evidence_search, tradeoff_matrix, recommend |
| @review | diff_cat, anti_pattern, quality_gate, praise_find, review_card |
| @flex | value_cost, mvp_cut, risk_matrix, roadmap, effort_estimate |

---

## External Integrations

### Composio (1000+ tools)
```
/composio-setup        → Connect a tool
/composio-status       → Show connected tools
/composio-sync         → Force sync from backend
@toolName              → Invoke (e.g. @gmail, @github)
```

### Mirage VFS (50+ backends)
```
/mirage <bash command>  → Execute across mounted backends
```

### OfficeCLI (Word, Excel, PowerPoint)
```
/docs create a report
/excel build a budget
/ppt make a presentation
```
