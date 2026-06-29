# APEX

[![npm version](https://img.shields.io/npm/v/@asno-dev/apex?color=blue)](https://www.npmjs.com/package/@asno-dev/apex)
[![license](https://img.shields.io/npm/l/@asno-dev/apex)](https://github.com/asno-dev/apex/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@asno-dev/apex)](https://www.npmjs.com/package/@asno-dev/apex)

**10-agent senior engineering team for any CLI coding agent.**

Route tasks to specialist agents: architecture, UI, debugging, performance, security, infrastructure, creative, research, review, and MVP scoping. Every agent shuts down after output. Zero bloat.

## Quick Start

```bash
npm install -g @asno-dev/apex
```

Then follow the [per-agent install instructions](#per-agent-install) for your coding agent.

## Team

| Agent | Role | Tools |
|-------|------|-------|
| `@arch` Max | Architect — system design, refactoring | blast_radius, dep_graph, complexity, extract_refactor, compose_check, module_boundary |
| `@ui` Zara | UI/UX Designer — mood-first, anti-slop | contrast, palette_extract, a11y_audit, responsive_test, component_search |
| `@debug` Kai | Debugger — 5-step debug protocol | reproduce, stack_walk, log_mine, bisect_run, guard_inject, var_watch |
| `@perf` Rex | Performance — profile first | profile, memory_profile, baseline_capture, measure, bundle_analyze, big_o |
| `@sec` Vex | Security — OWASP Top 10 | vuln_scan, secret_find, input_trace, auth_map, owasp_score, dependency_audit |
| `@infra` Io | Infrastructure — Docker/k8s/CI-CD | docker_lint, k8s_validate, ci_check, deploy_dry, rollback_plan, health_check |
| `@nova` Nova | Creative — non-obvious angles | poc_gen, lib_compass, alt_angle, trend_sniff, downside_check, approach_matrix |
| `@reed` Dr. Reed | Researcher — evidence-based | compare, complexity_calc, evidence_search, tradeoff_matrix, recommend |
| `@review` Rila | Reviewer — structured PR review | diff_cat, anti_pattern, quality_gate, praise_find, review_card |
| `@flex` Flex | Founder — MVP scope cutter | value_cost, mvp_cut, risk_matrix, roadmap, effort_estimate |

**Total: 56 tools across 10 agents.**

## Per-Agent Install

### OpenCode (Default)

```bash
# Add to .opencode/agents/ or use global config
# AGENTS.md is the universal instruction file
```

### Claude Code

```bash
# Copy .claude/skills/ to your project
cp -r .claude/skills/ your-project/.claude/skills/
# Add CLAUDE.md to your project root
cp CLAUDE.md your-project/
```

### Cursor

```bash
# Copy .cursor/rules/ to your project
cp -r .cursor/rules/ your-project/.cursor/rules/
# Copy .cursorrules to your project root
cp .cursorrules your-project/
```

### Windsurf

```bash
# Copy .windsurf/rules/ to your project
cp -r .windsurf/rules/ your-project/.windsurf/rules/
```

### Cline

```bash
# Copy .clinerules to your project root
cp .clinerules your-project/
```

### Copilot

```bash
# Copy .github/copilot-instructions.md to your project
cp .github/copilot-instructions.md your-project/.github/
```

### Codex / Gemini / Devin / Hermes / Pi

```bash
# Copy AGENTS.md to your project root
cp AGENTS.md your-project/
```

## Usage

### Direct Mode

```
@arch refactor this function
@debug fix this TypeError
@ui build a dashboard
@perf optimize this query
@sec review this auth code
```

### Team Mode (Default)

```
/orchestrate refactor this function
```

The orchestrator routes to the best agent. That agent calls peers when needed.

### Select Mode

```
/apex select kai,rex
```

Only those agents active until changed.

## MCP Tools

56 tools via `apex-hands` MCP server:

| Agent | Tools |
|-------|-------|
| `@arch` | blast_radius, dep_graph, complexity, extract_refactor, compose_check, module_boundary |
| `@ui` | contrast, palette_extract, a11y_audit, responsive_test, component_search |
| `@debug` | reproduce, stack_walk, log_mine, bisect_run, guard_inject, var_watch |
| `@perf` | profile, memory_profile, baseline_capture, measure, bundle_analyze, big_o |
| `@sec` | vuln_scan, secret_find, input_trace, auth_map, owasp_score, dependency_audit |
| `@infra` | docker_lint, k8s_validate, ci_check, deploy_dry, rollback_plan, health_check |
| `@nova` | poc_gen, lib_compass, alt_angle, trend_sniff, downside_check, approach_matrix |
| `@reed` | compare, complexity_calc, evidence_search, tradeoff_matrix, recommend |
| `@review` | diff_cat, anti_pattern, quality_gate, praise_find, review_card |
| `@flex` | value_cost, mvp_cut, risk_matrix, roadmap, effort_estimate |

## Composio (1000+ Tools)

Connect external tools via Composio:

```bash
/composio-setup    # Start Composio webapp
/composio-status   # Show connected tools
/composio-sync     # Force sync from backend
```

## Mirage VFS (50+ Backends)

Virtual filesystem across S3, GDrive, Slack, and more:

```bash
/mirage list       # List mounted backends
/mirage mount s3   # Mount S3 bucket
```

## License

MIT
