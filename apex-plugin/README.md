# APEX v2 — Senior Engineering Team

> A 10-agent orchestrator + specialist system for any CLI coding agent. Routes requests to specialists, dynamically activates peers only when needed, and shuts down every agent after output. Zero idle tokens.

[![npm version](https://img.shields.io/npm/v/@asno-dev/apex.svg)](https://www.npmjs.com/package/@asno-dev/apex)
[![license](https://img.shields.io/npm/l/@asno-dev/apex.svg)](https://github.com/asno-dev/apex/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@asno-dev/apex.svg)](https://nodejs.org)

**Works with 16+ coding agents:** Claude Code, Codex, Cursor, Cline, Kilo, Copilot, Windsurf, Gemini CLI, Devin, Hermes, Pi, Antigravity, OpenCode, OpenClaw, Kiro, CodeWhale, Swival.

---

## Table of Contents

- [Quick Start](#quick-start)
- [What is APEX](#what-is-apex)
- [Installation](#installation)
- [The Team](#the-team)
- [Usage Examples](#usage-examples)
- [3 Modes](#3-modes)
- [Agent Chains](#agent-chains)
- [Dynamic Peers](#dynamic-peers)
- [56 Tools (apex-hands)](#56-tools-apex-hands)
- [25 Skills](#25-skills)
- [Composio Integration (1000+ Tools)](#composio-integration-1000-tools)
- [Mirage VFS (50+ Backends)](#mirage-vfs-50-backends)
- [Architecture](#architecture)
- [Node.js API](#nodejs-api)
- [CLI Reference](#cli-reference)
- [Core Laws](#core-laws)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
npx @asno-dev/apex
```

That's it. The CLI detects your installed coding agents and copies the right files to your project. Restart your agent and start using `@arch`, `@ui`, `@debug`, etc.

---

## What is APEX

APEX gives your coding agent a **10-person senior engineering team**. Instead of one AI doing everything, you get specialized agents — each an expert in their domain.

**How it works:**

1. You type a request (e.g., `@debug fix this error`)
2. The orchestrator routes to the right agent
3. That agent works and calls peers only when a specific need arises
4. Every agent shuts down after output — no idle tokens

**The result:** Higher quality code, faster iterations, and domain expertise for every task.

---

## Installation

### Universal Install (any project)

```bash
npx @asno-dev/apex
```

### Curl Install (Linux/macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/asno-dev/apex/main/install.sh | sh
```

### PowerShell Install (Windows)

```powershell
irm https://raw.githubusercontent.com/asno-dev/apex/main/install.ps1 | iex
```

### Per-Agent Install

| Agent | Install Command |
|-------|----------------|
| **Claude Code** | `/plugin marketplace add asno-dev/apex` |
| **Codex** | `codex plugin marketplace add asno-dev/apex` |
| **Gemini CLI** | `gemini extensions install https://github.com/asno-dev/apex` |
| **OpenCode** | Add `"@asno-dev/apex"` to `opencode.json` plugins |
| **Cursor** | Copy `.cursor/rules/apex.mdc` to your project |
| **Cline/Kilo** | Copy `.clinerules` to your project root |
| **Copilot** | Copy `.github/copilot-instructions.md` to your project |
| **Windsurf** | Copy `.windsurf/rules.md` to your project |
| **Devin** | `devin plugins install asno-dev/apex` |
| **Hermes** | `hermes plugins install asno-dev/apex --enable` |
| **Pi** | `pi install git:github.com/asno-dev/apex` |
| **Antigravity** | `agy plugin install https://github.com/asno-dev/apex` |
| **OpenClaw** | `clawhub install apex` |
| **Kiro** | Copy `adapters/kiro/apex.md` to `~/.kiro/steering/` |
| **CodeWhale** | Copy `AGENTS.md` to your project root |
| **Swival** | `swival skills add --global https://github.com/asno-dev/apex` |

---

## The Team

| Badge | Tag | Name | Role | Core Behavior |
|-------|-----|------|------|---------------|
| `[Arch]` | `@arch` | Max | Architect | Compresses 50→1 line. System design, refactoring, structure. Maps blast radius, finds composition point. |
| `[UI]` | `@ui` | Zara | UI/UX Designer + Frontend Engineer | Full system design. Mood-first, anti-slop. 10 palettes. shadcn/ui + Tailwind. WCAG AA. Mobile-first. |
| `[Dbg]` | `@debug` | Kai | Debugger | 5-step: reproduce→isolate→hypothesize→fix→prevent. Every fix leaves a guard. |
| `[Perf]` | `@perf` | Rex | Performance | Profile first. Algorithm→DB→bundle→render. Baseline→optimize→measure. |
| `[Sec]` | `@sec` | Vex | Security | OWASP Top 10. CRITICAL/HIGH/MEDIUM severity. Every input is malicious. |
| `[Inf]` | `@infra` | Io | Infrastructure | Docker/k8s/CI-CD. Multi-stage builds. Non-root. Rollback always. |
| `[Nov]` | `@nova` | Nova | Creative | Non-obvious angles. Library recommendations + npm + why + 10-line POC + downside. |
| `[Res]` | `@reed` | Dr. Reed | Researcher | Evidence-based. ≥2 options with O(?) complexity. No opinions. |
| `[Rev]` | `@review` | Rila | Reviewer | Blocking→Suggestions→Praise. Specific praise always. |
| `[Fnd]` | `@flex` | Flex | Founder | Value(1-3)×Cost(1-3). Ships 60%, defers 30%, kills 10%. |

**Task States:** Agents show dynamic state icons as they work:

```
🧠 Thinking → 🔍 Exploring → ⚡ Working / 🔧 Fixing → ✅ Verifying → ✨ Complete
```

---

## Usage Examples

### Architecture & Refactoring (`@arch`)
```
@arch refactor this function        → Max compresses 50 lines to 1
@arch map the blast radius          → Shows all files affected by a change
@arch check for circular deps       → Dependency graph analysis
@arch simplify this class           → Extracts, composes, reduces complexity
```

### UI/UX Design (`@ui`)
```
@ui build a login form              → Zara paints WCAG AA form with shadcn/ui
@ui create a dashboard              → Full layout with 10-palette system
@ui fix contrast issues             → Automatic WCAG AA compliance
@ui make it responsive              → Mobile-first, breakpoint-aware
```

### Debugging (`@debug`)
```
@debug fix this error               → Kai 5-step debug protocol
@debug reproduce the crash          → Creates minimal reproduction
@debug find the root cause          → Stack walk + variable watch
@debug add guards                   → Prevents regression
```

### Performance (`@perf`)
```
@perf this is slow                  → Rex profiles and optimizes
@perf reduce bundle size            → Analyzes and tree-shakes
@perf fix memory leak               → Heap profiling + GC analysis
@perf optimize queries              → N+1 detection + index suggestions
```

### Security (`@sec`)
```
@sec review auth code               → Vex OWASP Top 10 scan
@sec check for secrets              → Hardcoded API key detection
@sec audit inputs                   → SQL injection, XSS, path traversal
@sec dependency audit               → CVE scanning + license compliance
```

### Infrastructure (`@infra`)
```
@infra dockerize this               → Multi-stage Dockerfile with non-root
@infra set up CI/CD                 → GitHub Actions pipeline
@infra validate k8s manifests       → Security contexts + resource limits
@infra plan rollback                → Step-by-step rollback with verification
```

### Creative (`@nova`)
```
@nova any ideas                     → Nova proposes 3 non-obvious approaches
@nova find a library for X          → Searches npm with pros/cons
@nova create a POC                  → 10-line proof of concept
@nova what are the downsides        → Critical analysis of approach
```

### Research (`@reed`)
```
@reed best caching strategy         → Dr. Reed compares options with evidence
@reed which ORM to use              → Structured comparison table
@reed analyze complexity            → O(?) notation with explanation
@reed recommend approach            → Final recommendation with confidence
```

### Code Review (`@review`)
```
@review check this PR               → Rila blocks/suggests/praises
@review find anti-patterns          → Magic numbers, god functions, deep nesting
@review quality gate                → Lint, types, tests, naming check
@review praise good code            → Highlights exceptional quality
```

### MVP Scoping (`@flex`)
```
@flex what's the MVP?               → Flex scores value×cost, cuts scope
@flex prioritize features           → ROI-sorted table
@flex risk assessment               → Ship vs delay risk matrix
@flex build roadmap                 → Now/Next/Later phased plan
```

---

## 3 Modes

### Direct Mode
```bash
@arch refactor this
```
Max (Architect) becomes the main agent with full authority. Can call peers via `@peerName`.

### Team Mode (Default)
```
refactor this messy function
```
Orchestrator automatically routes to the best agent. That agent calls peers dynamically as needs arise. Only needed agents activate — zero pre-loading.

### Select Mode
```bash
/apex select kai,rex
```
Only Kai (Debugger) and Rex (Performance) are active. All others dormant until changed.

### Mode Commands
```bash
/apex team        → Team mode (default)
/apex select a,b  → Select specific agents
/apex off         → Disable APEX
/apex status      → Show current mode and active agents
/apex help        → Show help
```

---

## Agent Chains

Agents can chain together for complex workflows:

```
Full app:       @arch → @ui → @infra        (sequential)
Bug patch:      @debug → @review             (sequential)
System design:  @arch ∥ @reed                (parallel)
Security fix:   @sec → @debug → @infra       (sequential)
Performance:    @perf → @sec → @infra        (sequential)
```

### Dynamic Peers
Any agent can call any peer mid-task:
- `@perf` profiling finds SQL injection → calls `@sec`
- `@ui` needs backend API → calls `@infra`
- `@debug` finds performance issue → calls `@perf`
- `@arch` detects security concern → calls `@sec`

---

## 56 Tools (apex-hands)

Every agent has domain-specific tools via the `apex-hands` MCP server:

### @arch — Max's Tools (6)
| Tool | Description |
|------|-------------|
| `arch_blast_radius` | Analyze all files affected by changing a symbol/function |
| `arch_dep_graph` | Full dependency/import tree with circular dep detection |
| `arch_complexity` | Cyclomatic complexity per function/method |
| `arch_extract_refactor` | Find duplicated code, suggest extraction points |
| `arch_compose_check` | Module boundary violations, circular deps, leaks |
| `arch_module_boundary` | Public API surface, internal leakage, cohesion score |

### @ui — Zara's Tools (5)
| Tool | Description |
|------|-------------|
| `ui_contrast` | WCAG AA (4.5:1) and AAA (7:1) contrast checking |
| `ui_palette_extract` | Read CSS variables, validate 5-color palette convention |
| `ui_a11y_audit` | Missing alt text, aria labels, focus rings, semantic HTML |
| `ui_responsive_test` | Preview at sm/md/lg/xl breakpoints |
| `ui_component_search` | Search component library, return props API + examples |

### @debug — Kai's Tools (6)
| Tool | Description |
|------|-------------|
| `debug_reproduce` | Generate minimal standalone reproduction script |
| `debug_stack_walk` | Parse stack trace, annotate frames, identify root cause |
| `debug_log_mine` | Search logs for error/timeout/crash patterns |
| `debug_bisect_run` | Git bisect with test command to find bug-introducing commit |
| `debug_guard_inject` | Generate assertion/validation guard to prevent regression |
| `debug_var_watch` | Set up variable watchpoints for read/write tracing |

### @perf — Rex's Tools (6)
| Tool | Description |
|------|-------------|
| `perf_profile` | CPU profiler, returns hot paths sorted by self-time |
| `perf_memory_profile` | Heap profiler, allocation hotspots + GC pressure |
| `perf_baseline_capture` | Save current metrics as JSON baseline |
| `perf_measure` | Compare against stored baseline, return diff with % change |
| `perf_bundle_analyze` | Module sizes, total size, duplicate dependencies |
| `perf_big_o` | Algorithmic time/space complexity estimation |

### @sec — Vex's Tools (6)
| Tool | Description |
|------|-------------|
| `sec_vuln_scan` | Dependency CVE scanning, sorted by severity |
| `sec_secret_find` | Hardcoded secrets, API keys, tokens via regex |
| `sec_input_trace` | Trace user input from entry to all sinks |
| `sec_auth_map` | Map auth guards, routes, middleware; find unprotected paths |
| `sec_owasp_score` | Score codebase against OWASP Top 10 categories |
| `sec_dependency_audit` | Deep tree audit, outdated packages, license compliance |

### @infra — Io's Tools (6)
| Tool | Description |
|------|-------------|
| `infra_docker_lint` | Non-root user, multi-stage, layer caching, no secrets |
| `infra_k8s_validate` | K8s manifest schema + security contexts + resource limits |
| `infra_ci_check` | CI/CD pipeline audit for bottlenecks, caching, security |
| `infra_deploy_dry` | Simulate deployment — show what would change |
| `infra_rollback_plan` | Step-by-step rollback with verification checks |
| `infra_health_check` | Probe service endpoint, report health + response time |

### @nova — Nova's Tools (6)
| Tool | Description |
|------|-------------|
| `nova_poc_gen` | ≤10-line proof of concept using specified library |
| `nova_lib_compass` | Search npm/pip/cargo for matching libraries |
| `nova_alt_angle` | 3 non-obvious alternative solutions with pros/cons |
| `nova_trend_sniff` | Web search for latest trends in a domain |
| `nova_downside_check` | Downsides, footguns, gotchas for a library/approach |
| `nova_approach_matrix` | Compare approaches: perf, maint, DX, safety, ecosystem |

### @reed — Dr. Reed's Tools (5)
| Tool | Description |
|------|-------------|
| `reed_compare` | 2+ options with evidence, pros/cons, complexity, refs |
| `reed_complexity_calc` | Time/space complexity bounds in O(?) notation |
| `reed_evidence_search` | Search project docs, issues, RFCs for evidence |
| `reed_tradeoff_matrix` | Score options across custom dimensions (1-5 scale) |
| `reed_recommend` | Final recommendation with rationale + confidence |

### @review — Rila's Tools (5)
| Tool | Description |
|------|-------------|
| `review_diff_cat` | Categorize diff as feature/bugfix/refactor/test/docs/style |
| `review_anti_pattern` | Magic numbers, god functions, deep nesting, shotgun surgery |
| `review_quality_gate` | Lint, types, tests, naming conventions check |
| `review_praise_find` | Highlight exceptional quality, clarity, cleverness |
| `review_card` | Full structured PR review: summary, blocks, suggestions, praise |

### @flex — Flex's Tools (5)
| Tool | Description |
|------|-------------|
| `flex_value_cost` | Score items by Value(1-3) and Cost(1-3), ROI-sorted |
| `flex_mvp_cut` | 60/30/10 rule: Ship 60%, Defer 30%, Kill 10% |
| `flex_risk_matrix` | Risk of shipping vs risk of delaying |
| `flex_roadmap` | Now/Next/Later phased roadmap from prioritized list |
| `flex_effort_estimate` | T-shirt sizing (S/M/L/XL) with confidence range |

**Total: 56 tools across 10 agents.**

---

## 25 Skills

APEX includes 25 pre-built skills for common development tasks:

### Agent Skills
| Skill | Description |
|-------|-------------|
| `apex` | Main orchestrator — routes requests to specialists |
| `apex-arch` | System design, refactoring, code structure |
| `apex-ui` | Full system UI/UX design with 10 palettes |
| `apex-debug` | 5-step debug protocol with guards |
| `apex-perf` | Profile-first performance optimization |
| `apex-sec` | OWASP Top 10 security auditing |
| `apex-infra` | Docker/k8s/CI-CD infrastructure |
| `apex-nova` | Creative non-obvious solutions |
| `apex-reed` | Evidence-based research |
| `apex-review` | Structured PR review |
| `apex-flex` | MVP scoping and prioritization |

### Task Skills
| Skill | Description |
|-------|-------------|
| `refactor` | Clean, simplify, improve code |
| `debug-protocol` | Fix bugs with the 5-step protocol |
| `perf-audit` | Optimize slowness, memory, timeouts |
| `sec-review` | Security audit for auth, inputs, APIs |
| `pr-review` | Review diffs and PRs |
| `research` | Compare approaches, select libraries |
| `system-design` | Architecture and technical design |
| `mvp-cut` | Prioritize features, scope MVP |
| `full-stack-scaffold` | Build complete apps from scratch |
| `test-harness` | Write tests, add coverage |
| `bug-patch` | Fix GitHub issues and bug reports |
| `deploy-pipeline` | Set up CI/CD and automation |
| `requirements-to-spec` | Product ideas to technical specs |
| `ui-generate` | Build UI components and pages |

---

## Composio Integration (1000+ Tools)

Composio connects APEX to external services via OAuth. After setup, use `@composio` to execute any connected tool.

### Setup

```bash
# Start the Composio webapp
/composio-setup

# Or manually
.\apex-composio\apex-composio.ps1 setup
```

The webapp opens at `http://localhost:3001` where you can connect tools like Gmail, GitHub, Slack, Notion, and 1000+ more.

### Commands

| Command | Action |
|---------|--------|
| `/composio-setup` | Start Composio webapp at localhost:3001 |
| `/composio-status` | Show connected tools and API key status |
| `/composio-sync` | Force sync connected tools from backend |
| `@composio` | Execute ANY connected tool |

### Usage Examples

```
@composio GMAIL_SEND_EMAIL { to: "user@example.com", subject: "Hello", body: "World" }
@composio GITHUB_CREATE_ISSUE { owner: "user", repo: "project", title: "Bug report" }
@composio SLACK_SEND_MESSAGE { channel: "#general", text: "Deployment complete" }
```

### Connected Tools Auto-Detection

Connected tools are auto-detected by `@composio`. Run `/composio-status` to see the live list. Only tools you've actually connected are available — nothing is hardcoded.

---

## Mirage VFS (50+ Backends)

Mirage is a Virtual File System that mounts S3, GDrive, Slack, Gmail, Redis, Postgres, and more as a single filesystem.

### Commands

```bash
/mirage ls /s3/logs/              # List S3 bucket
/mirage cp /gdrive/report.csv .   # Copy from Google Drive
/mirage grep -r error /s3/logs/   # Search across backends
```

### Supported Backends

S3, Google Drive, Google Sheets, Slack, Gmail, Redis, Postgres, MongoDB, Dropbox, OneDrive, SharePoint, FTP, SFTP, and 40+ more.

---

## Architecture

```
apex-plugin/
├── skills/                    # 25 skills (source of truth)
│   ├── apex/SKILL.md          # Main orchestrator
│   ├── apex-arch/SKILL.md     # Architect
│   ├── apex-ui/SKILL.md       # UI Painter
│   ├── apex-debug/SKILL.md    # Debugger
│   ├── apex-perf/SKILL.md     # Performance
│   ├── apex-sec/SKILL.md      # Security
│   ├── apex-infra/SKILL.md    # Infrastructure
│   ├── apex-nova/SKILL.md     # Creative
│   ├── apex-reed/SKILL.md     # Researcher
│   ├── apex-review/SKILL.md   # Reviewer
│   ├── apex-flex/SKILL.md     # Founder
│   └── ... (14 more task skills)
│
├── hooks/                     # Lifecycle hooks
│   ├── apex-activate.js       # Session start — injects APEX into system prompt
│   ├── apex-subagent.js       # Subagent injection — injects agent context
│   └── apex-mode-tracker.js   # Mode state — tracks team/direct/select/off
│
├── adapters/                  # 16 agent-specific adapters
│   ├── claude-code/           # plugin.json, hooks.json
│   ├── opencode/              # apex.mjs (full plugin with orchestrator)
│   ├── cursor/                # rules/apex.mdc
│   ├── cline/                 # apex.md
│   ├── copilot/               # instructions.md
│   ├── windsurf/              # rules/apex.md
│   ├── gemini/                # extension.json
│   ├── codex/                 # plugin.json
│   ├── devin/                 # plugin.yaml
│   ├── hermes/                # __init__.py, plugin.yaml
│   ├── pi/                    # extension.json, package.json
│   ├── antigravity/           # extension.json
│   ├── openclaw/              # apex.md, package.json
│   ├── kiro/                  # apex.md
│   ├── codewhale/             # AGENTS.md
│   └── swival/                # apex.md, apex/SKILL.md
│
├── src/                       # MCP servers + tool implementations
│   ├── hands-server.mjs       # apex-hands MCP server (56 tools)
│   ├── composio-server.mjs    # Composio MCP server
│   ├── mirage-server.mjs      # Mirage VFS MCP server
│   ├── config.mjs             # Config manager (~/.apex/config.json)
│   └── hands/                 # Tool modules
│       ├── arch.mjs           # 6 architecture tools
│       ├── ui.mjs             # 5 UI tools
│       ├── debug.mjs          # 6 debugging tools
│       ├── perf.mjs           # 6 performance tools
│       ├── sec.mjs            # 6 security tools
│       ├── infra.mjs          # 6 infrastructure tools
│       ├── nova.mjs           # 6 creative tools
│       ├── reed.mjs           # 5 research tools
│       ├── review.mjs         # 5 review tools
│       └── flex.mjs           # 5 founder tools
│
├── bin/apex.js                # CLI installer (npx @asno-dev/apex)
├── index.js                   # Node.js API entry point
├── AGENTS.md                  # Universal agent instructions
├── CLAUDE.md                  # Claude Code specific instructions
├── USAGE.md                   # Installation guide for all 16 agents
├── plugin.json                # Claude Code plugin manifest
├── plugin.yaml                # Codex/Hermes plugin manifest
├── gemini-extension.json      # Gemini CLI extension manifest
├── opencode.json              # OpenCode plugin config
├── install.sh                 # Bash installer
├── install.ps1                # PowerShell installer
└── package.json               # npm package: @asno-dev/apex
```

---

## Node.js API

```javascript
const apex = require('@asno-dev/apex');

// Get all agent names
console.log(apex.agents);
// ['arch', 'ui', 'debug', 'perf', 'sec', 'infra', 'nova', 'reed', 'review', 'flex']

// Get a specific agent's skill content
const archSkill = apex.getSkill('arch');
console.log(archSkill); // Full SKILL.md content for Max the Architect

// Get main APEX orchestrator skill
const mainSkill = apex.getMainSkill();
console.log(mainSkill); // Full orchestrator instructions

// Get adapter files for a specific agent
const claudeAdapter = apex.getAdapter('claude-code');
// { 'plugin.json': '...', 'hooks.json': '...' }

// List all available adapters
console.log(apex.listAdapters());
// ['antigravity', 'claude-code', 'cline', 'codewhale', 'codex', ...]

// Get AGENTS.md content
const agentsMd = apex.getAgentsMd();
console.log(agentsMd); // Full universal agent instructions

// Get package directory
console.log(apex.dir); // '/path/to/node_modules/@asno-dev/apex'

// Get specific directories
console.log(apex.skillsDir); // '/path/to/skills'
console.log(apex.hooksDir);  // '/path/to/hooks'
console.log(apex.adaptersDir); // '/path/to/adapters'
```

### API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `apex.agents` | `string[]` | All 10 agent names |
| `apex.dir` | `string` | Package root directory |
| `apex.skillsDir` | `string` | Skills directory path |
| `apex.hooksDir` | `string` | Hooks directory path |
| `apex.adaptersDir` | `string` | Adapters directory path |
| `apex.getSkill(name)` | `string\|null` | SKILL.md content for an agent |
| `apex.getMainSkill()` | `string\|null` | Main apex/SKILL.md content |
| `apex.getAdapter(name)` | `object\|null` | All files for an adapter directory |
| `apex.listAdapters()` | `string[]` | All adapter directory names |
| `apex.getAgentsMd()` | `string\|null` | AGENTS.md content |

---

## CLI Reference

### `npx @asno-dev/apex`

Detects installed coding agents and copies appropriate files to your project.

```bash
npx @asno-dev/apex              # Install to current directory
npx @asno-dev/apex /path/to/project  # Install to specific directory
```

**What it does:**
1. Copies `AGENTS.md` to your project root
2. Detects installed agents (Claude Code, Cursor, OpenCode, etc.)
3. Copies agent-specific files (rules, plugins, hooks)
4. Copies skills directory to `.claude/skills/`
5. Prints summary and quick-start guide

### `npx @asno-dev/apex --help`

Show help and available options.

---

## Core Laws

Every APEX agent follows these 7 laws:

1. **Explore before write.** Grep codebase first. Understand every existing pattern. Reuse over rebuild. Never overwrite working code — extend or compose.

2. **Self-review.** Before output, review your own work: shortest correct path? Existing patterns used? Edge cases handled? Quality checked?

3. **Read first.** Map blast radius before writing anything new.

4. **Diff only.** No preamble. No restating. Signal-to-noise max.

5. **Shutdown law.** Every agent terminates after final output. No idle turns. ≤5% token budget.

6. **Fix at composition point.** One guard in shared function > guard in every caller.

7. **Refactor heuristics.** Comment→rename. Twice→extract. Inherit→compose.

---

## UI System (Zara)

Zara follows a strict design system:

- **10 Palettes:** Trust, Energy, Authority, Clarity, Warmth, Midnight, Forest, Ocean, Aurora, Minimal
- **CSS Variables:** Token-based design system
- **2 Fonts Max:** No font proliferation
- **shadcn/ui + Tailwind:** Component library + utility CSS
- **WCAG AA:** 4.5:1 contrast ratio minimum
- **Mobile-First:** Responsive at sm/md/lg/xl breakpoints
- **200ms Transitions:** Consistent animation timing
- **Skeleton Loaders:** No spinner animations

**Anti-Slop Rules:**
- No decorative elements
- No inline styles
- No hardcoded hex colors
- No lorem ipsum
- No ALL CAPS
- No gradients (flat colors only)

**6-Step Protocol:**
1. Discover — Understand the problem
2. Explore — Research existing patterns
3. Design — Plan the component
4. Paint — Build component-by-component
5. Verify — Test contrast, responsiveness, accessibility
6. Polish — Final refinements

---

## Refactor Heuristics (Max)

Max follows these refactoring rules:

- **Comment→rename** — If you write a comment, rename instead
- **Twice→extract** — If you see it twice, extract to shared function
- **Inherit→compose** — Prefer composition over inheritance
- **20+ lines→abstraction** — Any function over 20 lines gets abstracted
- **One-method class→function** — Convert single-method classes to functions
- **Boolean params→split** — Split boolean parameters into separate functions
- **Nested→pipe/compose** — Flatten nested conditionals with pipe/compose

---

## Troubleshooting

### Agent not detecting APEX
- Restart your coding agent after installation
- Check that files were copied to the correct location
- Run `npx @asno-dev/apex` again to reinstall

### Tools not working
- Ensure Node.js >= 18.0.0 is installed
- Check that `src/` directory exists in the package
- Run `npm ls @asno-dev/apex` to verify installation

### Composio not connecting
- Run `/composio-setup` to start the webapp
- Open `http://localhost:3001` in your browser
- Connect tools via OAuth
- Run `/composio-sync` to refresh connected tools

### Mode not changing
- Run `/apex status` to check current mode
- Run `/apex team` to reset to default mode
- Check that `.opencode/.apex-active` file exists

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/asno-dev/apex.git
cd apex/apex-plugin
npm install
npm test
```

### Adding a New Agent

1. Create `skills/apex-<name>/SKILL.md` with agent instructions
2. Create `adapters/<name>/` with agent-specific files
3. Add tool implementations in `src/hands/<name>.mjs`
4. Register tools in `src/hands-server.mjs`
5. Update `index.js` to include the new agent

### Adding a New Skill

1. Create `skills/<skill-name>/SKILL.md`
2. Add YAML frontmatter with name and description
3. Write the skill instructions in the body

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Links

- **npm:** [@asno-dev/apex](https://www.npmjs.com/package/@asno-dev/apex)
- **GitHub:** [github.com/asno-dev/apex](https://github.com/asno-dev/apex)
- **Issues:** [github.com/asno-dev/apex/issues](https://github.com/asno-dev/apex/issues)

---

**Built with care by the APEX team.**
