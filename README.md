<p align="center">
  <img src="https://img.shields.io/npm/v/@asno-dev/apex?style=flat-square&color=0ea5e9" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@asno-dev/apex?style=flat-square&color=38bdf8" alt="npm downloads" />
  <img src="https://img.shields.io/npm/l/@asno-dev/apex?style=flat-square&color=22c55e" alt="license" />
  <img src="https://img.shields.io/badge/agents-10-blueviolet?style=flat-square" alt="agents" />
  <img src="https://img.shields.io/badge/tools-56-orange?style=flat-square" alt="tools" />
  <img src="https://img.shields.io/badge/skills-25-teal?style=flat-square" alt="skills" />
   <img src="https://img.shields.io/badge/adapters-7-blue?style=flat-square" alt="adapters" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-green?style=flat-square" alt="node" />
</p>

<h1 align="center">⚡ APEX</h1>

<p align="center">
  <strong>10-Agent Senior Engineering Team for Any CLI Coding Agent</strong>
</p>

<p align="center">
  A zero-dependency orchestrator that routes your requests to 10 specialist AI agents — each with domain expertise, purpose-built tools, and the ability to dynamically call peers mid-task. Works with <strong>7 coding agents</strong> out of the box.
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-agents">Agents</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-skills">Skills</a> •
  <a href="#-mcp-servers">MCP Servers</a> •
  <a href="#%EF%B8%8F-commands">Commands</a> •
  <a href="#-composio-integration">Composio</a> •
  <a href="#%F0%9F%94%8B-mirage-vfs">Mirage VFS</a> •
  <a href="#-license">License</a>
</p>

---

## 🚀 Quick Start

```bash
npx @asno-dev/apex
```

The installer detects your coding agents and configures everything — MCP servers, agents, commands, skills.

That's it. Now talk to your coding agent:

```
@arch refactor this                → Max compresses your code
@ui build a login form             → Zara paints a WCAG AA form
@debug fix this error              → Kai runs 5-step debug protocol
@perf this is slow                 → Rex profiles & optimizes
@sec review auth code              → Vex scans for OWASP Top 10
@infra dockerize this              → Io outputs production-grade config
@nova any ideas?                   → Nova proposes non-obvious angles
@reed best caching strategy        → Dr. Reed compares options with evidence
@review check this code            → Rila gives structured PR review
@flex what's the MVP?              → Flex scores Value×Cost and cuts scope
```

### Built-in Commands

```
apex-docs                          → Create Word/Excel/PPT documents
apex-excel
apex-ppt

node apex/src/composio-setup.mjs       → Connect 1000+ external tools (Gmail, GitHub, Slack, etc.)
node apex/src/composio-status.mjs      → Show connected tools status
node apex/src/composio-status.mjs --sync → Force sync from Composio backend

apex-mirage ls /s3/                → Virtual filesystem across 50+ backends

/apex team                         → Switch to team mode (default)
/apex select a,b                   → Activate only specific agents
/apex status                       → Show current mode and active agents
```

---

## 🤖 Agents

APEX ships with **10 specialist agents**, each with a unique persona, domain expertise, and set of purpose-built tools.

| Badge | Tag | Name | Role | Specialty |
|:-----:|:---:|:----:|:-----|:----------|
| `[Arch]` | `@arch` | **Max** | Architect | System design, refactoring, structure. Compresses 50→1 line. |
| `[UI]` | `@ui` | **Zara** | UI/UX Designer | Mood-first, anti-slop. shadcn/ui + Tailwind. WCAG AA. 10 palettes. |
| `[Dbg]` | `@debug` | **Kai** | Debugger | 5-step protocol: reproduce → isolate → hypothesize → fix → prevent. |
| `[Perf]` | `@perf` | **Rex** | Performance Engineer | Profile first. Algorithm → DB → bundle → render. Baseline → optimize → measure. |
| `[Sec]` | `@sec` | **Vex** | Security Engineer | OWASP Top 10. CRITICAL/HIGH/MEDIUM. Every input is malicious. |
| `[Inf]` | `@infra` | **Io** | Infrastructure | Docker/k8s/CI-CD. Multi-stage builds. Non-root. Rollback always. |
| `[Nov]` | `@nova` | **Nova** | Creative | Non-obvious angles. Lib + npm + POC + downside analysis. |
| `[Res]` | `@reed` | **Dr. Reed** | Researcher | Evidence-based. ≥2 options with O(?) complexity. No opinions without data. |
| `[Rev]` | `@review` | **Rila** | Code Reviewer | Blocking → Suggestions → Praise. Specific praise always. |
| `[Fnd]` | `@flex` | **Flex** | Founder / PM | Value(1-3) × Cost(1-3). Ships 60%, defers 30%, kills 10%. |

### Automatic Routing

The orchestrator analyzes your request and routes to the best agent automatically:

| Your Request | Routed To |
|:-------------|:----------|
| Code is long/complex/messy | `@arch` |
| Build UI / component / page | `@ui` |
| Error / bug / crash / undefined | `@debug` |
| Slow / memory / performance | `@perf` |
| Auth / input / secrets / vuln | `@sec` |
| Deploy / Docker / CI / k8s | `@infra` |
| New idea / library / creative | `@nova` |
| Best way / which / research | `@reed` |
| Review / PR / merge / quality | `@review` |
| Scope / MVP / what to build | `@flex` |

### Task States

Every agent reports progress with a single icon:

```
🧠 Thinking  →  🔍 Exploring  →  ⚡ Working  →  🔧 Fixing  →  ✅ Verifying  →  ✨ Complete
```

---

## 🎛️ Modes

APEX supports three operating modes:

### Team Mode (Default)
The orchestrator routes your request to the best agent. That agent works and dynamically calls peers when needed. Zero pre-loading.

```
> refactor and optimize the API layer
# Orchestrator routes → @arch → @arch calls @perf when spotting N+1 queries
```

### Direct Mode
Address a specific agent directly. That agent becomes the lead with full authority.

```
@debug fix the authentication timeout
# Kai works directly, can still call @sec if a vulnerability is found
```

### Select Mode
Activate only specific agents for a focused session.

```
/apex select kai,rex              # Only debugger and performance active
/apex select arch,ui,infra        # Architecture + UI + Infrastructure
```

### Mode Commands

| Command | Description |
|:--------|:------------|
| `/apex team` | Switch to team mode (default) |
| `/apex select a,b` | Activate only specific agents |
| `/apex off` | Disable APEX |
| `/apex status` | Show current mode and active agents |
| `/apex help` | Show help guide |

---

## 📦 Installation

APEX supports **7 coding agents** — run once and everything is configured.

```bash
npx @asno-dev/apex
```

The installer auto-detects your agents and installs all APEX files into `apex/` + per-agent configs at the project root.

| Agent | Installed Files | `@arch` Works | MCP | Commands |
|:------|:----------------|:-------------:|:---:|:--------:|
| **Claude Code** | `.claude/plugin.json` + agents + commands + hooks | ✅ Native subagents | ✅ 3 servers | ✅ 8 commands |
| **Gemini CLI** | `.gemini/extension.json` + agents + commands | ✅ Extension agents | ✅ 3 servers | ✅ 8 commands |
| **Codex CLI** | `.codex/plugin.json` + mcp.toml + agents + skills | ✅ Native subagents | ✅ 3 servers | ✅ skills |
| **OpenCode** | `opencode.json` + plugin + `.opencode/agents/` | ✅ Native agents | ✅ 3 servers | ✅ via plugin |
| **Cursor** | `.cursor/mcp.json` + rules + agents + commands | ✅ Rule-based | ✅ 3 servers | ✅ 8 commands |
| **Antigravity** | `antigravity-extension.json` + `AGENTS.md` | ✅ Extension agents | ✅ 3 servers | ✅ via extension |
| **Cline / Kilo** | `.cline/mcp.json` + rules + agents + commands + `.clinerules` | ✅ Rule-based | ✅ 3 servers | ✅ 8 commands |

### Verify

| Agent | Command |
|:------|:--------|
| **Claude Code** | `claude` → type `@arch` → Max responds |
| **Codex CLI** | `codex` → type `@arch` → Max responds |
| **Gemini CLI** | `gemini` → type `@arch` → Max responds |
| **OpenCode** | `opencode` → type `@arch` → Max responds |
| **Cursor** | Open project — MCP servers + rules active |
| **Cline / Kilo** | Open project — MCP servers + rules active |
| **Antigravity** | `agy` → type `@arch` → Max responds |

---

## ⌨️ Commands

All APEX commands use the `apex-` prefix for clean namespacing — no collisions with built-in agent commands.

| Command | Description |
|:--------|:------------|
| `apex-docs` | Create/edit Word documents via OfficeCLI |
| `apex-excel` | Create/edit Excel spreadsheets via OfficeCLI |
| `apex-ppt` | Create PowerPoint presentations via OfficeCLI |
| `node apex/src/composio-setup.mjs` | Connect external tools — paste API key, get OAuth link |
| `node apex/src/composio-status.mjs` | Show connected tools and API key status |
| `node apex/src/composio-status.mjs --sync` | Force sync from Composio backend |
| `apex-mirage <command>` | Execute commands across mounted virtual filesystem backends |
| `/apex team\|select\|off\|status\|help` | APEX mode control |

---

## 🧠 Skills

APEX includes **25 pre-built skills** — composable, multi-step workflows that any agent can invoke.

### Agent Skills (10)

Each agent has its own core skill defining its persona, behavior, and domain rules:

| Skill | Agent | Description |
|:------|:------|:------------|
| `apex-arch` | Max | System architecture, refactoring heuristics, blast radius mapping |
| `apex-ui` | Zara | UI/UX design system, palette selection, component painting |
| `apex-debug` | Kai | 5-step debug protocol, stack walking, guard injection |
| `apex-perf` | Rex | Profiling, baseline capture, Big-O analysis |
| `apex-sec` | Vex | OWASP scanning, secret detection, input tracing |
| `apex-infra` | Io | Docker linting, k8s validation, CI/CD pipeline checks |
| `apex-nova` | Nova | POC generation, library compass, trend analysis |
| `apex-reed` | Dr. Reed | Evidence search, tradeoff matrices, complexity calculation |
| `apex-review` | Rila | Diff categorization, anti-pattern detection, quality gates |
| `apex-flex` | Flex | Value-cost scoring, MVP cutting, effort estimation |

### Workflow Skills (15)

Pre-composed multi-agent workflows for common engineering tasks:

| Skill | Agents Used | Description |
|:------|:------------|:------------|
| `refactor` | @arch | Code compression and structural refactoring |
| `ui-generate` | @ui | Generate UI components from descriptions |
| `debug-protocol` | @debug | Full 5-step debugging workflow |
| `perf-audit` | @perf | End-to-end performance audit |
| `sec-review` | @sec | Security review with OWASP scoring |
| `pr-review` | @review | Structured pull request review |
| `system-design` | @arch, @reed | Architecture design with research backing |
| `research` | @reed | Evidence-based technology research |
| `mvp-cut` | @flex | MVP scoping and feature prioritization |
| `full-stack-scaffold` | @arch → @ui → @infra | Complete app scaffolding pipeline |
| `test-harness` | @debug | Test suite generation |
| `bug-patch` | @debug → @review | Bug fix with review verification |
| `requirements-to-spec` | @flex → @arch | Requirements analysis to technical spec |
| `deploy-pipeline` | @infra | CI/CD pipeline generation |

---

## 🔧 MCP Servers

APEX provides **3 MCP (Model Context Protocol) servers** with **56 purpose-built tools** across all 10 agents, plus **6 virtual filesystem tools** and **1000+ external tool bridges**.

### 1. apex-hands — 56 Agent Domain Tools

The primary MCP server. 56 tools organized by agent domain:

| Agent | Tools | Description |
|:------|:------|:------------|
| `@arch` | `blast_radius` `dep_graph` `complexity` `extract_refactor` `compose_check` `module_boundary` | Architecture analysis |
| `@ui` | `contrast` `palette_extract` `a11y_audit` `responsive_test` `component_search` | UI/UX tooling |
| `@debug` | `reproduce` `stack_walk` `log_mine` `bisect_run` `guard_inject` `var_watch` | Debugging instruments |
| `@perf` | `profile` `memory_profile` `baseline_capture` `measure` `bundle_analyze` `big_o` | Performance profiling |
| `@sec` | `vuln_scan` `secret_find` `input_trace` `auth_map` `owasp_score` `dependency_audit` | Security scanning |
| `@infra` | `docker_lint` `k8s_validate` `ci_check` `deploy_dry` `rollback_plan` `health_check` | Infrastructure ops |
| `@nova` | `poc_gen` `lib_compass` `alt_angle` `trend_sniff` `downside_check` `approach_matrix` | Creative exploration |
| `@reed` | `compare` `complexity_calc` `evidence_search` `tradeoff_matrix` `recommend` | Research tools |
| `@review` | `diff_cat` `anti_pattern` `quality_gate` `praise_find` `review_card` | Code review |
| `@flex` | `value_cost` `mvp_cut` `risk_matrix` `roadmap` `effort_estimate` | Product management |

**MCP Config:**
```json
{
  "mcpServers": {
    "apex-hands": {
      "type": "local",
      "command": ["node", "apex/src/hands-server.mjs"]
    }
  }
}
```

### 2. mirage-vfs — Virtual Filesystem (50+ Backends)

Unified filesystem across S3, GDrive, Slack, Redis, Postgres, and more.

**MCP Config:**
```json
{
  "mcpServers": {
    "mirage-vfs": {
      "type": "local",
      "command": ["node", "apex/src/mirage-server.mjs"]
    }
  }
}
```

**Usage:**
```
apex-mirage ls /s3/                    — List files in S3 bucket
apex-mirage cp /gdrive/report.pdf /data/  — Copy from Google Drive
apex-mirage grep -r error /s3/logs/    — Search across backends
apex-mirage cat /slack/channel/messages  — Read Slack messages
```

**Setup:** `pip install mirage-ai && npm install -g @struktoai/mirage-cli`

### 3. apex-composio — 1000+ External Tool Bridge

Bridges Gmail, GitHub, Slack, Jira, Notion, and 1000+ more tools.

**MCP Config:**
```json
{
  "mcpServers": {
    "apex-composio": {
      "type": "local",
      "command": ["node", "apex/src/composio-server.mjs"]
    }
  }
}
```

### All 3 MCP Servers in One Config

The root `.mcp.json` includes all three servers:
```json
{
  "mcpServers": {
    "apex-hands": { "command": ["node", "apex/src/hands-server.mjs"] },
    "mirage-vfs": { "command": ["node", "apex/src/mirage-server.mjs"] },
    "apex-composio": { "command": ["node", "apex/src/composio-server.mjs"] }
  }
}
```

---

## 🔌 Composio Integration

Connect **1000+ external tools** (Gmail, GitHub, Slack, Google Drive, Jira, Linear, Notion, and more) through [Composio](https://composio.dev).

### Setup

```bash
# Interactive setup wizard
node apex/src/composio-setup.mjs
```

The wizard will:
1. Ask for your **Composio API key** (get one at [composio.dev](https://composio.dev))
2. Let you select which tools to connect (gmail, github, slack, jira, etc.)
3. Open an **OAuth link** in your browser for authorization
4. Save the connection config to `.composio-config.json`

### Status & Sync

```bash
node apex/src/composio-status.mjs          # Show all connected tools and their status
node apex/src/composio-status.mjs --sync   # Force refresh tool definitions from backend
```

### Usage

After connecting a tool, invoke it with `@toolName`:

```
@gmail send an email to the team about the release
@github create a PR from feature branch
@slack post build status to #deployments
@jira create a ticket for this bug
@notion update the architecture doc
```

### Configuration

Stored at `.composio-config.json` (auto-added to `.gitignore` / `.npmignore`):

```json
{
  "apiKey": "ak_your_api_key",
  "userId": "your_user_id",
  "connections": [
    { "tool": "gmail", "label": "Gmail", "status": "ACTIVE", "authType": "OAUTH2" }
  ]
}
```

---

## 🔗 Agent Chains

Agents can be chained for complex workflows:

### Sequential Chains
```
Full app:        @arch → @ui → @infra      # Design → Paint → Deploy
Bug patch:       @debug → @review           # Fix → Verify
Spec to code:    @flex → @arch → @ui        # Scope → Design → Build
```

### Parallel Chains
```
System design:   @arch ∥ @reed              # Architecture + Research in parallel
```

### Dynamic Peer Calling
Any agent can call any peer mid-task:
- `@perf` finds SQL injection → calls `@sec`
- `@ui` needs a backend API → calls `@infra`
- `@debug` finds performance issue → calls `@perf`
- `@review` finds security concern → calls `@sec`

---

## 📄 Programmatic API

Use APEX as a Node.js library:

```javascript
const apex = require('@asno-dev/apex');

console.log(apex.version);          // "3.0.2"
console.log(apex.agents);           // ['arch', 'ui', 'debug', 'perf', 'sec', 'infra', 'nova', 'reed', 'review', 'flex']
console.log(apex.listAdapters());   // ['claude-code', 'cursor', 'opencode', 'cline', 'copilot', ...]

const archSkill = apex.getSkill('arch');
const cursorAdapter = apex.getAdapter('cursor');
```

---

## 🎨 Design System (Zara)

Zara's UI design system includes:

- **10 curated palettes**: Trust, Energy, Authority, Clarity, Warmth, Midnight, Forest, Ocean, Aurora, Minimal
- **CSS variable tokens** for all colors as `:root` variables
- **2 fonts max** per project
- **shadcn/ui** component library + **Tailwind CSS** scale
- **WCAG AA** compliance (4.5:1 contrast ratio minimum)
- **Mobile-first** responsive design
- **200ms** max transition duration
- **Skeleton loaders** for async content
- **Semantic HTML** throughout

### Anti-Slop Rules
- No decorative elements without purpose
- No inline styles
- No hardcoded hex colors
- No lorem ipsum in production
- No gradients without justification
- No ALL CAPS text

---

## 📋 Requirements

- **Node.js** ≥ 18.0.0
- At least one supported coding agent installed

### Zero Dependencies

APEX has **zero production dependencies**. It uses only Node.js built-in modules:
- ⚡ Instant install
- 🔒 No supply chain risk
- 📦 Tiny package size

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Guidelines
- Follow the Core Laws in your contributions
- Keep adapters in sync — run `npm test` before submitting
- Add skills with proper YAML frontmatter
- Document new tools in the appropriate `hands/*.mjs` module

---

## 🧪 Development

```bash
git clone https://github.com/asno-dev/apex.git
cd apex
npm test
```

### Project Structure

| Directory | Purpose |
|:----------|:--------|
| `adapters/` | Per-agent config files (16 agents) |
| `agents/` | Canonical agent definitions (10 agents) |
| `commands/` | Canonical command definitions (8 commands) |
| `skills/` | SKILL.md files for orchestrator and agents |
| `src/` | MCP servers and tool implementations |
| `src/hands/` | Individual tool modules per agent |
| `hooks/` | Lifecycle hooks for session management |
| `scripts/` | Build and validation scripts |
| `docs/` | Extended design documentation |
| `bin/` | CLI entry point |

---

## 📄 License

[MIT](LICENSE) © [asno-dev](https://github.com/asno-dev)

---

<p align="center">
  Built with ⚡ by <a href="https://github.com/asno-dev">asno-dev</a>
</p>

<p align="center">
  <a href="https://x.com/LKanth9406">Follow on X</a> •
  <a href="https://www.reddit.com/u/AdhesivenessTight914/s/Nxr1nHJM1b">Follow on Reddit</a>
</p>
