<p align="center">
  <img src="https://img.shields.io/npm/v/@asno-dev/apex?style=flat-square&color=0ea5e9" alt="npm version" />
  <img src="https://img.shields.io/npm/l/@asno-dev/apex?style=flat-square&color=22c55e" alt="license" />
  <img src="https://img.shields.io/badge/agents-10-blueviolet?style=flat-square" alt="agents" />
  <img src="https://img.shields.io/badge/tools-56-orange?style=flat-square" alt="tools" />
  <img src="https://img.shields.io/badge/skills-25-teal?style=flat-square" alt="skills" />
  <img src="https://img.shields.io/badge/adapters-16-blue?style=flat-square" alt="adapters" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-green?style=flat-square" alt="node" />
</p>

<h1 align="center">⚡ APEX</h1>

<p align="center">
  <strong>10-Agent Senior Engineering Team for Any CLI Coding Agent</strong>
</p>

<p align="center">
  A zero-dependency orchestrator that routes your requests to 10 specialist AI agents — each with domain expertise, purpose-built tools, and the ability to dynamically call peers mid-task. Works with <strong>16+ coding agents</strong> out of the box.
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-agents">Agents</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-skills">Skills</a> •
  <a href="#-mcp-servers">MCP Servers</a> •
  <a href="#-composio-integration">Composio</a> •
  <a href="#-license">License</a>
</p>

---

## 🚀 Quick Start

```bash
# Install globally via npm
npm install -g @asno-dev/apex

# Or run directly with npx (auto-detects your coding agents)
npx @asno-dev/apex

# Or install from source
git clone https://github.com/asno-dev/apex.git
cd apex
npm install
```

Then just talk to your coding agent:

```
@arch refactor this           → Max compresses your code
@ui build a login form        → Zara paints a WCAG AA compliant form
@debug fix this error         → Kai runs 5-step debug protocol
@perf this is slow            → Rex profiles & optimizes
@sec review auth code         → Vex scans for OWASP Top 10
@infra dockerize this         → Io outputs production-grade config
@nova any ideas?              → Nova proposes non-obvious angles
@reed best caching strategy   → Dr. Reed compares options with evidence
@review check this code       → Rila gives structured PR review
@flex what's the MVP?         → Flex scores Value×Cost and cuts scope
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
/apex select kai,rex      # Only debugger and performance active
/apex select arch,ui,infra  # Architecture + UI + Infrastructure
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

APEX supports **16+ coding agents** with dedicated adapters for each. Choose your preferred installation method.

### Universal (npm)

```bash
# Auto-detect installed agents and configure all of them
npx @asno-dev/apex

# Or install globally
npm install -g @asno-dev/apex
```

The CLI auto-detects which coding agents are installed on your system and copies the right configuration files for each one.

### Per-Agent Installation

<details>
<summary><strong>Claude Code</strong></summary>

**Via marketplace (recommended):**
```bash
/plugin marketplace add asno-dev/apex
/plugin install apex@apex
```
Restart Claude Code. APEX loads automatically.

**Manual:**
Copy `CLAUDE.md` to your project root and the `skills/` directory to `.claude/skills/`.
</details>

<details>
<summary><strong>Codex CLI</strong></summary>

```bash
codex plugin marketplace add asno-dev/apex
```
Open `/plugins`, select APEX, install. Then open `/hooks`, trust the lifecycle hooks.
</details>

<details>
<summary><strong>GitHub Copilot CLI</strong></summary>

```bash
copilot plugin marketplace add asno-dev/apex
copilot plugin install apex@apex
```
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Add to your `opencode.json`:
```json
{
  "plugin": ["@asno-dev/apex"]
}
```
Or from a local checkout:
```json
{
  "plugin": ["./.opencode/plugins/apex.mjs"]
}
```
</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

```bash
gemini extensions install https://github.com/asno-dev/apex
```
Loads `AGENTS.md` as always-on context every session.
</details>

<details>
<summary><strong>Cursor</strong></summary>

Copy `.cursor/rules/apex.mdc` to your project's `.cursor/rules/` directory.

Or use the installer:
```bash
npx @asno-dev/apex
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Copy `.windsurf/rules/apex.md` to your project's `.windsurf/` directory.
</details>

<details>
<summary><strong>Cline / Kilo Code</strong></summary>

Copy `.clinerules` to your project root.
</details>

<details>
<summary><strong>GitHub Copilot (Editor)</strong></summary>

Copy `.github/copilot-instructions.md` to your project's `.github/` directory.
</details>

<details>
<summary><strong>Devin CLI</strong></summary>

```bash
devin plugins install asno-dev/apex
```
</details>

<details>
<summary><strong>Hermes Agent</strong></summary>

```bash
hermes plugins install asno-dev/apex --enable
```
Restart Hermes after installing.
</details>

<details>
<summary><strong>Pi Agent</strong></summary>

```bash
pi install git:github.com/asno-dev/apex
```
</details>

<details>
<summary><strong>Antigravity CLI</strong></summary>

```bash
agy plugin install https://github.com/asno-dev/apex
```
</details>

<details>
<summary><strong>Kiro</strong></summary>

Copy `adapters/kiro/apex.md` to `~/.kiro/steering/` (global) or `.kiro/steering/` (project).
</details>

<details>
<summary><strong>Swival</strong></summary>

```bash
swival skills add --global https://github.com/asno-dev/apex
swival skills add apex
```
</details>

<details>
<summary><strong>OpenClaw</strong></summary>

```bash
clawhub install apex
```
</details>

<details>
<summary><strong>CodeWhale</strong></summary>

Copy `AGENTS.md` to your project root. CodeWhale reads it automatically.
</details>

### Shell Installers

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/asno-dev/apex/main/install.sh | sh

# Local from repo
./install.sh              # Project-local install
./install.sh --global     # Global install to ~/.config/

# Windows (PowerShell 7+)
.\install.ps1
```

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

APEX provides **3 MCP (Model Context Protocol) servers** with **56 purpose-built tools** across all 10 agents.

### apex-hands — Agent Domain Tools

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

#### MCP Configuration

For agents that support MCP, add to your config:

```json
{
  "mcp": {
    "apex-hands": {
      "type": "local",
      "command": ["node", "src/hands-server.mjs"]
    }
  }
}
```

### mirage-vfs — Virtual Filesystem

50+ backend support for filesystem operations across cloud storage, databases, and more.

```json
{
  "mcp": {
    "mirage-vfs": {
      "type": "local",
      "command": ["node", "src/mirage-server.mjs"]
    }
  }
}
```

```
/mirage <command>    # Execute across mounted backends
```

### apex-composio — External Tool Bridge

Bridges 1000+ external tools via Composio (see [Composio Integration](#-composio-integration)).

```json
{
  "mcp": {
    "apex-composio": {
      "type": "local",
      "command": ["node", "src/composio-server.mjs"]
    }
  }
}
```

---

## 🔌 Composio Integration

Connect **1000+ external tools** (Gmail, GitHub, Slack, Google Drive, Jira, Linear, Notion, and more) through [Composio](https://composio.dev).

### Setup via Terminal

Run the interactive setup wizard from your terminal:

```bash
# Start the interactive Composio setup wizard
node src/composio-setup.mjs
```

The setup wizard will:
1. Ask for your **Composio API key** (get one at [composio.dev](https://composio.dev))
2. Let you select which tools to connect (Gmail, GitHub, Slack, etc.)
3. Open an **OAuth link** in your browser for authorization
4. Save the connection config locally

### Check Status

```bash
# Show all connected tools and their status
node src/composio-status.mjs
```

### In-Agent Commands

Once Composio is set up, you can also manage it from within your coding agent:

```
/composio-setup          # Interactive setup — paste API key, get OAuth link
/composio-status         # Show connected tools and status
/composio-sync           # Force sync from Composio backend
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

Composio config is stored locally at `.composio-config.json`:

```json
{
  "apiKey": "ak_your_api_key",
  "userId": "your_user_id",
  "connections": [
    {
      "tool": "gmail",
      "label": "Gmail",
      "status": "ACTIVE",
      "authType": "OAUTH2"
    }
  ]
}
```

Global config is stored at `~/.apex/config.json`:

```json
{
  "userId": "your_user_id",
  "authConfigs": {
    "gmail": "ac_xxxxx",
    "github": "ac_xxxxx"
  }
}
```

> **Note:** API keys and auth configs are stored locally and **never committed** to the repository (`.composio-config.json` is in `.gitignore` and `.npmignore`).


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

// Get version
console.log(apex.version); // "3.0.0"

// List all agents
console.log(apex.agents);
// ['arch', 'ui', 'debug', 'perf', 'sec', 'infra', 'nova', 'reed', 'review', 'flex']

// Get a specific agent's skill content
const archSkill = apex.getSkill('arch');

// Get the main APEX orchestrator skill
const mainSkill = apex.getMainSkill();

// Get adapter files for a specific coding agent
const cursorAdapter = apex.getAdapter('cursor');

// List all available adapters
const adapters = apex.listAdapters();
// ['claude-code', 'cursor', 'opencode', 'cline', 'copilot', ...]

// Get AGENTS.md content
const agentsMd = apex.getAgentsMd();
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

## ⚙️ Configuration Files

### `plugin.json` — Marketplace Manifest
```json
{
  "name": "apex",
  "displayName": "APEX v2 — Senior Engineering Team",
  "version": "3.0.0",
  "tags": ["architecture", "design", "debugging", "performance", "security"],
  "categories": ["workflow", "code-quality", "design", "testing", "deployment"]
}
```

### `plugin.yaml` — Capabilities
Declares all provided hooks, commands, and skills:
- **Hooks**: `pre_tool_use`, `post_tool_use`
- **Commands**: `apex`, `apex-arch`, `apex-ui`, `apex-debug`, `apex-perf`, `apex-sec`, `apex-infra`, `apex-nova`, `apex-reed`, `apex-review`, `apex-flex`
- **Skills**: 25 total (10 agent + 15 workflow)

### `opencode.json` — Full OpenCode Configuration
Complete OpenCode integration with all 10 agents as subagents, 3 MCP servers, and 17 commands.

### `gemini-extension.json` — Gemini CLI Extension
Loads `AGENTS.md` as always-on context for every Gemini session.

---

## 🧪 Development

```bash
# Clone the repository
git clone https://github.com/asno-dev/apex.git
cd apex

# Run validation
npm test

# The test suite verifies:
# - All adapter rule files are in sync with AGENTS.md
# - Skills have valid YAML frontmatter
# - Plugin manifests are consistent
```

### Project Structure

| Directory | Purpose |
|:----------|:--------|
| `adapters/` | Per-agent config files (16 agents) |
| `skills/` | SKILL.md files for orchestrator and agents |
| `src/` | MCP servers and tool implementations |
| `src/hands/` | Individual tool modules per agent |
| `hooks/` | Lifecycle hooks for session management |
| `scripts/` | Build and validation scripts |
| `docs/` | Extended design documentation |
| `bin/` | CLI entry point |

---

## 📋 Requirements

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- At least one supported coding agent installed

### Zero Dependencies

APEX has **zero production dependencies**. It uses only Node.js built-in modules (`fs`, `path`, `os`, `child_process`). This means:
- ⚡ Instant install
- 🔒 No supply chain risk
- 📦 Tiny package size

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Guidelines

- Follow the [Core Laws](#core-laws) in your contributions
- Keep adapters in sync — run `npm test` before submitting
- Add skills with proper YAML frontmatter
- Document new tools in the appropriate `hands/*.mjs` module

---

## 📄 License

[MIT](LICENSE) © [asno-dev](https://github.com/asno-dev)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

---

## ⭐ Star History

If APEX helps your workflow, give it a ⭐ on [GitHub](https://github.com/asno-dev/apex)!

---

<p align="center">
  Built with ⚡ by <a href="https://github.com/asno-dev">asno-dev</a>
</p>

<p align="center">
  <a href="https://x.com/LKanth9406">Follow on X</a> •
  <a href="https://www.reddit.com/u/AdhesivenessTight914/s/Nxr1nHJM1b">Follow on Reddit</a>
</p>
