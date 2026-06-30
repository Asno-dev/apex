# Coding Agent Platforms: Extensibility Research

**Researcher:** Dr. Reed (APEX)  
**Date:** 2026-06-30  
**Coverage:** 15 platforms across 4 extensibility dimensions  
**Evidence:** Official docs, GitHub repos, changelogs, community guides  

---

## Executive Summary

The coding agent ecosystem in 2026 has converged on a common architecture: **MCP (Model Context Protocol)** as the standard for tool integration, **Markdown+YAML frontmatter agents** for subagent definition, **slash commands** for user-facing shortcuts, and **plugins** as distribution units. However, implementation maturity varies dramatically.

**Three tiers of extensibility maturity:**

| Tier | Platforms | Characteristics |
|------|-----------|----------------|
| **Mature** | Claude Code, Codex, Cursor, Windsurf, Gemini CLI, Devin | Full MCP + subagents + slash commands + plugins/hooks |
| **Developing** | Cline/Kilo, Kiro, Hermes, Antigravity, PI-agent | Most features present, some gaps or partial implementations |
| **Emerging** | Swival, OpenClaw, CodeWhale | Core extensibility present, ecosystem less mature |

---

## 1. Claude Code (Anthropic)

### MCP Config Format
- **Files:** `~/.claude.json` (user/local scopes), `.mcp.json` (project scope)
- **Format:** JSON with `mcpServers` top-level key
- **Scopes:** `local` (default, per-project in `~/.claude.json`), `project` (`.mcp.json`, checked in), `user` (global in `~/.claude.json`)
- **CLI:** `claude mcp add <name> -- <command>` with `--scope local|project|user`
- **Transports:** stdio (local), Streamable HTTP (remote)
- **Plugin MCP:** Plugins can bundle `.mcp.json` — servers auto-started when plugin enabled

**Example:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### Custom Agents / Subagents
- **Location:** `.claude/agents/*.md` (project) or `~/.claude/agents/*.md` (user)
- **Format:** YAML frontmatter + Markdown body (system prompt)
- **Fields:** `name`, `description`, `model`, `tools`, `disallowedTools`, `permissionMode`, `mcpServers`, `hooks`, `maxTurns`, `skills`, `initialPrompt`, `memory`, `effort`, `background`, `isolation`, `color`
- **Invocation:** Auto-delegated by main agent, or explicit `@agent-name`, or `--agent` flag
- **Plugins:** Plugin subagents cannot use `hooks`, `mcpServers`, or `permissionMode`

### Custom Commands / Slash Commands
- **Files:** `.claude/commands/*.md` (legacy) or `.claude/skills/<name>/SKILL.md` (recommended)
- **Format:** Markdown with optional YAML frontmatter (`description`, `argument-hint`, `model`, `allowed-tools`)
- **MCP Prompts:** MCP server prompts appear as `/mcp__servername__promptname`
- **Skills:** Skills merge with commands — a skill at `.claude/skills/deploy/SKILL.md` creates `/deploy`

### Plugins / Hooks
- **Hooks:** `PreToolUse`, `PostToolUse`, `SubagentStart`, `SubagentStop`, `ConfigChange`, `Elicitation`, etc.
- **Hook types:** `command` (shell), `http` (POST), `mcp_tool` (call MCP), `prompt` (LLM eval), `agent` (multi-turn verification)
- **Plugins:** `.codex-plugin/plugin.json` manifest, bundles skills + MCP + hooks + app connectors
- **Marketplace:** Git-backed or local directories; `codex plugin marketplace add owner/repo`

### Limitations
- Plugin subagents cannot use hooks, MCP servers, or permissionMode
- Plugins cannot be committed to project config (user-scoped only)
- No `codex mcp validate` or `codex mcp tools` subcommands
- Custom prompts (deprecated in favor of skills)
- Plugin subagents don't support `maxTurns` or `memory`

---

## 2. Codex (OpenAI)

### MCP Config Format
- **Files:** `~/.codex/config.toml` (global), `.codex/config.toml` (project)
- **Format:** TOML with `[mcp_servers.<name>]` tables
- **CLI:** `codex mcp add <name> [--command ...] [--url ...]`
- **Transports:** stdio, Streamable HTTP
- **Features:** OAuth 2.0 flow, bearer token auth, env var expansion, per-server `enabled`, `required`, `startup_timeout_sec`, `tool_timeout_sec`, `default_tools_approval_mode`

**Example:**
```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_TOKEN = "env-var-name" }

[mcp_servers.my-service]
url = "https://service.example.com/mcp/"
bearer_token_env_var = "TOKEN_VAR"
```

### Custom Agents / Subagents
- **Files:** `.codex/agents/*.toml` (project)
- **Format:** TOML agent definitions
- **CLI:** `codex agent` command family
- **Built-in:** Orchestrator, planner, researcher, reviewer subagent types
- **Skills:** `.agents/skills/*/SKILL.md` — reusable instruction bundles

### Custom Commands / Slash Commands
- **Built-in:** `/mcp`, `/plugins`, `/init`, `/plan-mode`, `/review`, `/status`, `/feedback`
- **Custom prompts (deprecated):** `~/.codex/prompts/*.md` with YAML frontmatter
- **Skills as commands:** Skills invoked with `$skill-name` or `/skill-name`

### Plugins / Hooks
- **Hooks:** `hooks.json` with lifecycle events (PreToolUse, PostToolUse, etc.)
- **Plugins:** `.codex-plugin/plugin.json` manifest, bundles skills + MCP + app connectors + hooks
- **Marketplace:** `codex plugin marketplace add owner/repo`
- **Plugin MCP servers:** Isolated under `[plugins."name".mcp_servers.*]`
- **Requirements.toml:** Enterprise policy controls (MCP allowlists, etc.)

### Limitations
- Plugins cannot be declared in project `.codex/config.toml` (user-scoped only)
- No `enable/disable` subcommand for MCP servers (must edit config.toml)
- No tool listing or validation from CLI
- Custom prompts deprecated in favor of skills

---

## 3. GitHub Copilot (Microsoft)

### MCP Config Format
- **Files:** `.vscode/mcp.json` (workspace), user profile `mcp.json`, `~/.copilot/mcp-config.json` (CLI)
- **Format:** JSON with `servers` (VS Code) or `mcpServers` (CLI) top-level key
- **VS Code CLI:** `code --add-mcp '{"name":"...","command":"..."}'`
- **Copilot CLI:** `copilot mcp add <name> -- <command>`
- **Transports:** stdio, HTTP/SSE
- **GitHub Registry:** Curated MCP servers via VS Code Extensions view
- **Dev Containers:** `customizations.vscode.mcp` section in `devcontainer.json`

**Example (VS Code):**
```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/mcp-server-playwright"]
    }
  }
}
```

**Example (Copilot CLI):**
```json
{
  "mcpServers": {
    "playwright": {
      "type": "local",
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "tools": ["*"]
    }
  }
}
```

### Custom Agents / Subagents
- **VS Code Extensions:** Register `chatParticipants` in `package.json` → `@name` in chat
- **SDK-based:** `@github/copilot-sdk` for programmatic agent registration
- **`.github/extensions/`:** Local extension system with JSON-RPC, SDK v1.0.44+
- **Custom agents:** Via Copilot SDK `joinSession()` with MCP config, tools, hooks

### Custom Commands / Slash Commands
- **Built-in:** `@github`, `@azure`, `@vscode`, `/mcp`, `/tools`, `/fix`, `/explain`, `/tests`, `/docs`
- **Custom Chat Participants:** Registered via VS Code extension `chatParticipants` in `package.json`
- **MCP Prompts:** `/mcp.servername.promptname`
- **SDK Extensions:** Slash commands via Copilot SDK `session` object

### Plugins / Hooks
- **VS Code Extensions:** Full extension API (contribute commands, views, menus)
- **Copilot SDK Extensions:** `.github/extensions/` — hooks (`PreToolUse`, `PostToolUse`), system prompt customization, MCP config, infinite sessions
- **Discoverability:** Automatic discovery from Claude Desktop, etc. via `chat.mcp.discovery.enabled`

### Limitations
- No native subagent system (must use VS Code extension API or Copilot SDK)
- `.vscode/mcp.json` not source-controlled (recommended to use `.vscode/mcp.json` for workspace)
- Copilot CLI extensions are reverse-engineered (SDK matured but not fully documented initially)
- Platform-specific: VS Code / Visual Studio / CLI only

---

## 4. Cursor

### MCP Config Format
- **Files:** `.cursor/mcp.json` (project), `~/.cursor/mcp.json` (global)
- **Format:** JSON with `mcpServers` top-level key
- **UI:** Settings → Tools & MCP → Add Server
- **Transports:** stdio, HTTP/SSE, Streamable HTTP
- **Config interpolation:** `${env:VAR}`, `${userHome}`, `${workspaceFolder}`, `${workspaceFolderBasename}`, `${pathSeparator}`
- **Virtual MCP Servers:** Gateway exposes scoped tool subsets via API

**Example:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```

### Custom Agents / Subagents
- **Files:** `.cursor/agents/*.mdc` (project) or `~/.cursor/agents/*.mdc` (global)
- **Format:** YAML frontmatter + Markdown body
- **Fields:** `name`, `description`, `model`, `readonly`, `is_background`
- **Built-in:** `general`, `explore` (scout), `best-of-n-runner` (parallel worktrees)
- **Cloud subagents:** Use team MCP config from cursor.com/agents
- **Isolation:** Git worktrees for background agents

### Custom Commands / Slash Commands
- **Files:** `.cursor/commands/*.md`
- **Built-in:** `/optimize`, `/pr`, `/review`, `/docs`, `/commit`, `/push-all`
- **Skills:** `.cursor/skills/` — reusable task knowledge
- **Rules:** `.cursor/rules/*.mdc` — persistent configuration with `globs` and `alwaysApply`

### Plugins / Hooks
- **Hooks:** `.cursor/hooks.json` — event-driven automation (format, security scan, pre-commit)
- **Checkpoints:** Session snapshots with rewind
- **Memory:** Persistent context across sessions

### Limitations
- Subagents cannot use local MCP servers in cloud mode (use team servers)
- MCPoison vulnerability (fixed in Cursor 1.3) — previously trusted server key names, not commands
- Identical tool names across servers cause unpredictable behavior
- No native plugin system (hooks + rules fill the gap)
- Token budget: each MCP server consumes context tokens

---

## 5. Windsurf / Cascade (Codeium)

### MCP Config Format
- **Files:** `~/.codeium/windsurf/mcp_config.json` (global only — no project-level)
- **Format:** JSON with `mcpServers` top-level key
- **UI:** MCP Marketplace in Cascade panel
- **Transports:** stdio, Streamable HTTP, SSE
- **Env interpolation:** `${env:VAR_NAME}` in command, args, env, serverUrl, url, headers
- **Admin controls:** Team whitelisting (regex), custom registries for enterprises

**Example:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

### Custom Agents / Subagents
- **Files:** `.windsurf/agents/*.md` (project), `~/.windsurf/agents/*.md` (user)
- **Format:** Markdown with YAML frontmatter
- **Cascade 2.0:** Agent Command Center, Spaces, Devin delegation
- **Subagent patterns:** 8-role teams (architect, implementer, reviewer, tester, security, docs, perf, shipper)

### Custom Commands / Slash Commands
- **Built-in:** `/mcp`, `/tools`, `/config`, Cascade-specific commands
- **Workflows:** `.windsurf/workflows/` — spec-driven (`plan-then-implement`, `speckit-specify`)
- **Status line:** `~/.cursor/cli-config.json` (shared with Cursor lineage)

### Plugins / Hooks
- **Hooks:** `.windsurf/hooks/` — secret scanner, Langfuse observability, auto-formatter, worktree seeder
- **Memories:** Persistent context
- **Checkpoints:** Session snapshots & rewind

### Limitations
- **Hard 100-tool limit** across all MCP servers (tools beyond 100 silently dropped)
- No project-level MCP config (global only)
- Standalone binary requires full restart after config changes
- `serverUrl` instead of `url` — incompatibility with Cursor/Claude Desktop configs
- No native plugin marketplace (MCP marketplace + CLI workaround only)

---

## 6. Cline / Kilo Code

### MCP Config Format
- **Files:** VS Code extension settings JSON (MCP Servers panel) or CLI config
- **Format:** JSON with `mcpServers` top-level key
- **CLI:** `cline mcp add <name> -- <command>`, `cline config mcp`
- **Transports:** stdio, Streamable HTTP, SSE (legacy)
- **UI:** MCP Servers icon → Configure tab → Configure MCP Servers button
- **Features:** `disabled` flag, `autoApprove` per-tool, per-tool permission checkboxes
- **Kilo Marketplace:** Community-contributed MCP configs and agent skills

**Example:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Custom Agents / Subagents
- **Kilo:** Agents (previously "Modes") — Code, Plan, Debug agents with configurable models
- **Custom subagents:** Defined by user
- **Subagent delegation:** Parallel execution via `SubagentRunner`, `use_subagents` tool
- **Focus Chain:** Tracks progress across nested sub-tasks
- **SDK:** `@cline/sdk` for programmatic agent creation with tools and hooks

### Custom Commands / Slash Commands
- **Kilo CLI:** Built-in slash commands from OpenCode server
- **OpenCode server:** Commands from `opencode.json` config, MCP prompts
- **User-defined:** Through `opencode.json` `command` config
- **VS Code:** `/help`, `/model`, `/compact`, `/sessions`, `/mcps`
- **`@` mentions:** File autocomplete in chat input

### Plugins / Hooks
- **Hooks:** `PreToolUse`, `PostToolUse` for validation via `ToolHookUtils`
- **SDK Plugins:** Register tools and lifecycle hooks programmatically
- **Rules:** `.clinerules` — project-specific rules auto-loaded
- **Checkpoints:** Session persistence with rewind

### Limitations
- Per-tool auto-approve checkboxes only appear when global MCP auto-approve is ON (UI bug, fix in PR)
- MCP `instructions` field (server-level) not fetched — feature gap (PRs in progress)
- Cline CLI subagents cannot be continued in VS Code (JetBrains only for now)
- No native slash command support in VS Code extension (TUI-only); feature request open
- SDK documentation still maturing

---

## 7. Gemini CLI (Google)

### MCP Config Format
- **Files:** `~/.gemini/settings.json` (user), `.gemini/settings.json` (project)
- **Format:** JSON with `mcpServers` top-level key
- **CLI:** `gemini mcp add <name> -s <scope> -t <transport>`
- **Transports:** stdio, SSE, HTTP (Streamable HTTP)
- **Features:** `includeTools`/`excludeTools` allow/deny lists, `trust` flag (bypass confirmations), OAuth 2.0, `--timeout`, per-server `headers`
- **Provider-specific:** Google Cloud MCP servers (BigQuery, GKE, Cloud Run, Maps)

**Example:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
      }
    }
  }
}
```

### Custom Agents / Subagents
- **Agent skills:** `.gemini/skills/*/SKILL.md` — specialized instructions, auto-activated
- **Extensions:** Bundle skills + MCP + custom commands + context files into `gemini-extension.json`
- **Gemini Code Assist:** Agent mode with MCP integration for IDEs (VS Code, IntelliJ)
- **Subagents (experimental):** Limited subagent support via Gemini CLI

### Custom Commands / Slash Commands
- **Files:** `~/.gemini/commands/*.toml` (user), `.gemini/commands/*.toml` (project)
- **Format:** TOML with `prompt` (required), `args` support via `{{args}}`, shell execution via `!{...}`
- **Namespace:** Subdirectories create namespaced commands (`git/fix.toml` → `/git:fix`)
- **MCP Prompts:** MCP server prompts automatically become slash commands (`/servername-promptname`)
- **Built-in:** `/mcp`, `/tools`, `/chat`, `/init`, `/config`

### Plugins / Hooks
- **Extensions:** `gemini-extension.json` manifest, bundles MCP servers + custom commands + context files + agent skills + settings
- **Install:** `npx @google-cloud/gcloud-mcp init --agent=gemini-cli`
- **Gemini.md:** Context file providing persistent instructions

### Limitations
- Skills system less mature than Claude Code
- Subagent system is experimental/limited compared to Claude Code or Codex
- No unified plugin marketplace (extensions distributed via npm)
- SSE transport deprecated in favor of Streamable HTTP
- Agent skills auto-discovery still evolving

---

## 8. Devin (Cognition)

### MCP Config Format
- **Files:** `.devin/config.json` (project), `.devin/config.local.json` (local override), `~/.config/devin/config.json` (user)
- **Format:** JSON with `mcpServers` top-level key (comment support)
- **CLI:** `devin mcp add <name> -- <command>`, `devin mcp enable|disable`, `devin mcp login`
- **Transports:** stdio, Streamable HTTP, SSE
- **Features:** `disabledTools` per-server, OAuth with pre-registered clients (`oauthClientId`), `bearer_token_env_var`, `headers`, per-tool permissions (`mcp__server__tool` pattern)
- **Import from other tools:** Reads config from Cursor (`read_config_from: { cursor: true }`), Windsurf, Claude Code

**Example:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token"
      }
    }
  }
}
```

### Custom Agents / Subagents
- **Files:** `.devin/agents/<name>/AGENT.md` — custom subagent profiles
- **Format:** YAML frontmatter + Markdown body
- **Fields:** `name`, `description`, `model`, `allowed-tools`, `permissions`, `max-nesting`
- **Built-in:** `subagent_explore` (read-only), `subagent_general` (full tool access)
- **Plugin agents:** `.devin-plugin/plugin.json` bundles skills + agents
- **Import:** Claude Code `.claude/agents/*.md` files auto-imported

### Custom Commands / Slash Commands
- **Skills:** `.devin/skills/<name>/SKILL.md` — reusable instructions invoked on demand
- **Built-in:** `/mcp`, `/permissions`, session management commands
- **Plugin skills:** `devin plugins install owner/repo`

### Plugins / Hooks
- **Hooks:** `.devin/hooks.v1.json` — Claude Code compatible format
- **Plugins:** `.devin-plugin/plugin.json` manifest, bundles skills + MCP + permissions
- **CLI:** `devin plugins install`, `devin plugins list`, `devin plugins update`, `devin plugins remove`
- **Plugin requirements:** Skills auto-installed from Git repos, supports required/optional/forbidden plugins
- **Enterprise:** Organization-level MCP server management, admin controls

### Limitations
- Custom subagents are experimental (format may change)
- Plugin system is beta and opt-in for enterprises
- Devin Local (desktop agent) has fewer features than Cascade
- No custom slash command system (uses skills instead)
- Project config limited to `permissions`, `mcpServers`, `read_config_from`, `hooks`

---

## 9. Hermes (Nous Research)

### MCP Config Format
- **File:** `~/.hermes/config.yaml`
- **Format:** YAML with `mcp_servers` key
- **CLI:** `hermes mcp add <name> --command <cmd> [--preset <name>]`
- **Transports:** stdio, HTTP (url + headers)
- **Features:** Per-server `tools.include`/`tools.exclude` filtering, `timeout`, `supports_parallel_tool_calls`, `instructions_timeout`, `disabled` flag
- **Hermes as MCP server:** `hermes mcp serve` — exposes messaging capabilities to other agents
- **Bidirectional:** Hermes can be MCP client AND MCP server simultaneously

**Example (YAML):**
```yaml
mcp_servers:
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "ghp_xxx"
    tools:
      include: ["search_repositories", "get_issue"]
```

### Custom Agents / Subagents
- **Delegation system:** `delegate_task` tool spawns isolated child agents
- **Configuration:** `config.yaml` delegation section — `model`, `provider`, `inherit_mcp_toolsets`, `max_iterations`, `child_timeout_seconds`, `max_concurrent_children`, `max_spawn_depth`
- **Tool isolation:** Per-child `toolsets` parameter (`["terminal", "file"]`, `["web"]`, `["file"]`)
- **Programmatic Tool Calling:** `execute_code` tool for zero-context-cost multi-step pipelines
- **Auto skill creation:** `/learn` command distills workflows into reusable skills
- **Orchestrator mode:** Lets child agents spawn their own workers

### Custom Commands / Slash Commands
- **Skills:** `SKILL.md` files become slash commands
- **MCP slash commands:** Recent versions allow MCPs to register custom slash commands
- **Built-in:** `/learn`, `/spawn`, `/help`
- **Cron scheduling:** `hermes cron create "8am"` — scheduled tasks

### Plugins / Hooks
- **Skills System:** Auto-curated, self-improving, FTS5 session search
- **Cron:** Built-in scheduler with platform delivery
- **Memory:** Persistent memory with Honcho user modeling
- **No plugin marketplace** — skills distributed as SKILL.md files

### Limitations
- No formal plugin system (skills + cron + MCP only)
- MCP inheritance is all-or-nothing per subagent (`inherit_mcp_toolsets: true`)
- Subagents run synchronously by default (parent waits)
- Not durable — parent interruption cancels children
- No standalone plugin packaging format

---

## 10. PI-agent

### MCP Config Format
- **Files:** `~/.pi/agent/mcp.json` (global override), `.pi/mcp.json` (project override), `~/.config/mcp/mcp.json` (shared global), `.mcp.json` (shared project)
- **Format:** JSON with servers array or `mcpServers` object
- **CLI:** `/mcp add`, `/mcp add-http`, `/mcp add-ws`
- **Transports:** stdio, SSE, Streamable HTTP, WebSocket
- **Features:** `directTools` (expose tools directly vs proxy), `lifecycle` (`lazy`/`eager`/`keep-alive`), `toolPrefix`, `autoAuth`, `excludeTools`, env interpolation (`${VAR}`)
- **Import from Claude Desktop:** `importClaudeDesktop: true` or `/mcp import`
- **MCP adapter:** `pi-mcp-adapter` adds OAuth, bearer, resource exposure

**Example:**
```json
{
  "settings": { "idleTimeout": 60 },
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@latest"],
      "env": { "TAVILY_API_KEY": "${TAVILY_API_KEY}" },
      "lifecycle": "lazy",
      "directTools": true
    }
  }
}
```

### Custom Agents / Subagents
- **Extension:** `pi-subagents` (installed via npm) — Claude Code-style subagents
- **Files:** `.pi/agents/*.md` (project), `~/.pi/agent/agents/*.md` (user)
- **Format:** YAML frontmatter + Markdown body
- **Fields:** `description`, `display_name`, `tools` (comma-separated built-ins), `extensions` (inherit MCP), `skills`, `model`, `max_turns`, `thinking`, `inherit_context`, `run_in_background`, `isolated`
- **MCP scope:** Subagents can request direct MCP tools with `mcp:server-name` syntax
- **Config:** `agentOverrides` for per-environment customization

### Custom Commands / Slash Commands
- **Built-in:** `/mcp`, `/mcp setup`, `/permission-system`, `/agentmemory-status`, `/reload`
- **Skills:** Extensions + prompt templates
- **Extensions:** TypeScript modules with access to tools, commands, keyboard shortcuts, events, TUI

### Plugins / Hooks
- **Extensions:** TypeScript modules published via npm
- **Skills:** SKILL.md-based capability packages
- **Pi packages:** Bundle extensions, skills, prompts, themes — distributed via npm or git
- **Settings:** `~/.pi/agent/settings.json` for global overrides

### Limitations
- No built-in subagents (must install `pi-subagents` extension)
- No built-in MCP (must install `pi-mcp-adapter` extension)
- MCP direct tools require cache population on first use
- Subagent MCP inheritance limited to `mcp:` frontmatter entries only
- Plugin ecosystem driven by community extensions, not a marketplace

---

## 11. Antigravity (Google)

### MCP Config Format
- **File:** `~/.gemini/antigravity/mcp_config.json`
- **Format:** JSON with `mcpServers` top-level key
- **UI:** MCP Store in Mission Control
- **API SDK:** `mcp_server` tool type with `type: "mcp_server"`, `name`, `url`, `headers`, `allowed_tools`
- **Transports:** Streamable HTTP (remote MCP servers), stdio
- **Limitations:** SSE not supported; server names must be lowercase alphanumeric

**Example (SDK):**
```json
{
  "tools": [{
    "type": "mcp_server",
    "name": "github",
    "url": "https://api.githubcopilot.com/mcp",
    "headers": { "Authorization": "Bearer $TOKEN" }
  }]
}
```

### Custom Agents / Subagents
- **Dynamic subagents:** `defineSubagent()` + `invokeSubagent()` API
- **Workspace modes:** `inherit` (shared), `branch` (isolated git branch), `share` (worktree)
- **Built-in subagents:** Browser subagent, terminal subagent
- **SDK:** Antigravity SDK for custom agent orchestration
- **CLI (`agy`):** `/agents` panel, parallel background workers
- **Mission Control:** Central command center for managing agents

### Custom Commands / Slash Commands
- **CLI commands:** `/mcp`, `/context`, `/rewind`, `/agents`
- **Shortcuts:** `Ctrl+J` (teleport to pending), `Ctrl+K` (fast approve)
- **Plugins:** Skills + rules + hooks + MCP bundled as deployable units

### Plugins / Hooks
- **Plugins:** `~/.gemini/antigravity-cli/plugins/<name>/` — staged plugins with skills, rules, hooks, MCP
- **Hooks:** JSON hooks for lifecycle events
- **Sandbox:** Native OS containment (sandbox-exec, nsjail, AppContainer)
- **Artifacts:** Reviewable output with verification tests

### Limitations
- Subagent API still evolving — custom subagents feature requested by community
- SSE transport not supported for MCP (Streamable HTTP only)
- MCP server names restricted to `^[a-z0-9_-]+$`
- CLI separate from IDE — feature parity gap
- Plugin system less documented than Claude Code or Codex

---

## 12. Kiro

### MCP Config Format
- **Files:** `~/.kiro/settings/mcp.json` (user), `.kiro/settings/mcp.json` (workspace), inline in agent JSON config
- **Format:** JSON with `mcpServers` top-level key
- **Fields:** `command`, `args`, `env`, `disabled`, `autoApprove`, `disabledTools`, `url`, `headers`, `oauth` (clientId, redirectUri, oauthScopes)
- **Loading priority:** 1) Agent config `mcpServers`, 2) Workspace `.kiro/settings/mcp.json`, 3) Global `~/.kiro/settings/mcp.json`
- **v3 Agent profiles:** Inline MCP servers in Markdown frontmatter (`mcpServers:` YAML key)

**Example:**
```json
{
  "mcpServers": {
    "local-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" },
      "disabled": false,
      "disabledTools": ["delete_repo"]
    }
  }
}
```

### Custom Agents / Subagents
- **Files:** `~/.kiro/agents/*.md` or `*.json` (user), `.kiro/agents/*.md` or `*.json` (workspace)
- **Format:** Markdown with YAML frontmatter (v3) or JSON config (v2)
- **Fields (v3):** `name`, `description`, `tools` (category tags: `read`, `write`, `shell`, `web`, `@builtin`, `@mcp`, `*`), `mcpServers`, `permissions`, `model`
- **Fields (v2 JSON):** `name`, `description`, `prompt`, `mcpServers`, `tools`, `toolAliases`, `allowedTools`, `toolsSettings` (incl. subagent access), `resources`, `hooks`, `includeMcpJson`, `model`
- **Subagent control:** `toolsSettings.subagent.availableAgents`, `trustedAgents` — glob patterns
- **Spawn:** Automatic by main agent, or explicit ("use the code-reviewer subagent")
- **Slash commands:** Subagents appear as `/agent-name` commands

### Custom Commands / Slash Commands
- **Subagents as commands:** Every custom agent automatically becomes a slash command
- **Built-in:** `/mcp`, `/tools`, `/agent`, `/spawn`, `/config`
- `@` **tool syntax:** `@mcp_server/tool_name` for specific tools

### Plugins / Hooks
- **Hooks:** In agent JSON config (`hooks` field) — pre/post action lifecycle
- **Steering files:** Project-level instructions
- **Specs:** Structured specification-driven development

### Limitations
- IDE does NOT support subagent-scoped MCP servers (CLI-only) — GitHub issue #7097
- Subagents spawned via `subagent` tool don't initialize MCP servers from agent config (bug #8667)
- `includeMcpJson` toggle needed — extra config step
- No standalone plugin marketplace
- PATH issues on macOS — Kiro doesn't inherit shell PATH for MCP servers

---

## 13. Swival

### MCP Config Format
- **Files:** `.swival/mcp.json` (project), `swival.toml` config `[mcp_servers.*]` tables
- **Format:** JSON (`mcpServers` key) or TOML (`[mcp_servers.<name>]`)
- **CLI flags:** `--no-mcp`, `--mcp-config FILE`
- **Transports:** stdio, SSE
- **TOML takes precedence** over JSON by server name; JSON-only servers merged in
- **Features:** `command`, `args`, `env`, `url`, `headers`, per-server tool namespacing (`mcp__server__tool`)
- **Output guard:** MCP outputs >20KB saved to `.swival/` for paginated reads; hard cap at 10MB

**Example (TOML):**
```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_TOKEN = "your-token" }
```

### Custom Agents / Subagents
- **`spawn_subagent` tool:** Background thread with isolated state
- **Inheritance:** Parent's full system prompt, MCP/A2A connections, secret encryption, LLM config
- **Limits:** No recursive subagents (tool removed), max 4 concurrent subagents, auto-enabled for large context windows
- **ACP:** `swival --acp` for Agent Client Protocol — editors (Zed, Neovim) can drive Swival

### Custom Commands / Slash Commands
- **Files:** `~/.config/swival/commands/` — executable scripts or text templates
- **Invocation:** `!name` in REPL (not `/`)
- **Priority:** Exact-name executable > stem-match executable > exact-name text > stem-match text
- **Args:** `$1`/`$@` for text templates, CLI args for executables
- **Community repo:** `swival-commands` on GitHub

### Plugins / Hooks
- **Skills:** `.swival/skills/*/SKILL.md` — progressive disclosure (compact catalog, on-demand load)
- **MetaSKILLs:** `SKILL.star` Starlark programs for dynamic workflows
- **ACP:** Agent Client Protocol — editor integration
- **A2A:** Agent-to-Agent protocol for remote agent communication
- **Review loop:** LLM-as-a-judge with JSON reports
- **No plugin marketplace** — community commands repo only

### Limitations
- No subagent MCP scoping (all inherit parent's MCP)
- Tool limit of 100 tools from MCP servers (similar to Windsurf)
- No native plugin system (skills + MetaSKILLs fill the gap)
- Small ecosystem (214 GitHub stars, 3 contributors)
- Limited model provider support compared to Claude Code/Codex

---

## 14. OpenClaw

### MCP Config Format
- **Files:** Platform-specific MCP config (Claude Desktop format supported)
- **Format:** JSON with `mcpServers` top-level key
- **Features:** 134+ MCP tools in production setups, bidirectional MCP (client + server)
- **`openclaw mcp serve`:** Expose OpenClaw as an MCP server
- **Code mode:** MCP tools grouped under `MCP` namespace, TypeScript declaration files via virtual `API` surface
- **ACP harness:** `openclaw acp` for external agent connections

### Custom Agents / Subagents
- **Agent runtimes:** `openclaw`, `codex`, `copilot`, `claude-cli` — runtime-switchable agent backends
- **ACP agents:** Delegates to Claude Code, Cursor, Copilot, Gemini CLI via ACP
- **Sub-agents:** Native OpenClaw sub-agent runtime or ACP-backed
- **Multi-agent routing:** Channel-aware agent dispatch across 20+ messaging platforms
- **Plugin harnesses:** Registered via extensions (Codex, Copilot plugins)

### Custom Commands / Slash Commands
- `**/codex ...` **controls:** Native Codex command surface
- `**/acp ...` **controls:** ACP orchestration
- Platform-specific commands per channel (Telegram, Discord, Slack, WhatsApp)
- Skills: Markdown-based skill system

### Plugins / Hooks
- **Active Memory plugin:** Context retrieval with FTS5
- **Task Brain:** Unified task management layer
- **Scheduling:** Cron jobs with platform delivery
- **200k+ GitHub stars** — largest open-source agent framework
- **Acqui-hired by OpenAI** (Feb 2026), continues as open source under foundation

### Limitations
- Primarily a chat/automation agent, not a coding IDE
- Code mode experimental — TypeScript execution via QuickJS
- No standalone MCP config file (uses Claude Desktop format)
- Less focused on code editing workflows (more general-purpose agent)
- Plugin API still stabilizing after OpenAI acquisition

---

## 15. CodeWhale

### MCP Config Format
- **File:** `~/.deepseek/mcp.json` (legacy DeepSeek lineage preserved)
- **Format:** JSON with `mcpServers` top-level key
- **CLI:** `/mcp` for configuration and inspection
- **Bidirectional:** MCP client (loads servers) + MCP server (`codewhale mcp`)
- **Tool namespacing:** `mcp__<server>__<tool>`
- **Sandbox integration:** Approval-gated MCP tool calls

**Example:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me"]
    },
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./data.db"]
    }
  }
}
```

### Custom Agents / Subagents
- **Sub-agent fanout:** Config-first, provider-specific concurrency caps
- **`[subagents]` config section:** Global defaults + per-provider profiles
- **`agent` command:** Spawn focused child processes (background, returns receipt + transcript)
- **Fleet:** Multi-worker runs and headless orchestration
- **WhaleFlow:** Declarative workflow authoring
- **Runtime API:** HTTP/SSE, ACP, editor/GUI contracts

### Custom Commands / Slash Commands
- **Built-in:** `/mode`, `/model`, `/models`, `/provider`, `/config`, `/statusline`, `/settings`, `/compact`, `/review`, `/memory`, `/mcp`
- **Plans:** Three operating modes — Plan (read-only), Agent (normal), YOLO (auto-approve)
- **Modes:** Cycle with Tab, switch with `/mode`

### Plugins / Hooks
- **No dedicated plugin system** — hooks + MCP fill the gap
- **Sandbox:** Landlock (Linux), Seatbelt (macOS), AppContainer (Windows)
- **Approval gates:** Mode + approval orthogonal axes (`suggest`, `auto`, `never`)
- **Snapshots:** Rollback-capable session checkpoints
- **Memory:** Optional persistent memory (`/memory`)

### Limitations
- No native plugin marketplace
- Limited subagent tool scoping (config-based)
- Smaller ecosystem (community-driven, ~94 contributors on GitHub)
- No custom slash command system (uses modes + built-in commands)
- Provider switching /model and /provider mid-session sometimes disjointed

---

## Cross-Platform Comparison Table

| Feature | Claude Code | Codex | Copilot | Cursor | Windsurf | Cline/Kilo | Gemini CLI | Devin | Hermes | PI-agent | Antigravity | Kiro | Swival | OpenClaw | CodeWhale |
|---------|-------------|-------|---------|--------|----------|------------|-------------|-------|--------|----------|-------------|------|--------|----------|-----------|
| **MCP config format** | `.mcp.json` | `config.toml` | `mcp.json` | `mcp.json` | `mcp_config.json` | extension JSON | `settings.json` | `config.json` | `config.yaml` | `mcp.json` | `mcp_config.json` | `mcp.json` | `mcp.json`/TOML | platform JSON | `mcp.json` |
| **MCP project scope** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **MCP user scope** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MCP OAuth** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ stdio | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Stdio transport** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HTTP transport** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Custom subagents** | ✅ | ✅ | SDK-based | ✅ | ✅ | ✅ | experimental | ✅ | ✅ | extension | ✅ | ✅ | limited | via ACP | ✅ |
| **Subagent format** | YAML+MD | TOML | SDK | YAML+MD | YAML+MD | SDK | extension | AGENT.md | YAML config | YAML+MD | SDK API | YAML+MD / JSON | tool call | ACP/plugin | config |
| **Subagent MCP scoping** | ✅ | ✅ | ✅ | limited | limited | ✅ | limited | ✅ | ✅ | ✅ | N/A | bugged | ❌ | ✅ | ❌ |
| **Slash commands** | `.claude/commands/` | deprecated | `@name` | `.cursor/commands/` | workflows | built-in only | `.toml` files | skills | skills | built-in | built-in | auto from agents | `!name` | platform cmds | built-in |
| **Command format** | Markdown | Markdown | extension | Markdown | — | — | TOML | — | — | — | — | — | scripts/text | — | — |
| **Hooks system** | ✅ 5 types | ✅ | SDK hooks | `.cursor/hooks.json` | ✅ | Pre/PostToolUse | ❌ | ✅ Claude compat | ❌ | ❌ | ✅ JSON hooks | ✅ per-agent | ❌ | ✅ plugins | ✅ |
| **Plugin system** | ✅ `plugin.json` | ✅ `plugin.json` | VS Code ext | ❌ | ❌ | SDK | `extension.json` | `plugin.json` | skills only | npm packages | staged dirs | ❌ | skills/MetaSKILL | ✅ plugins | ❌ |
| **Plugin marketplace** | ✅ Git/dir | ✅ Git/dir | VS Code | ❌ | MCP only | Kilo marketplace | ❌ npm | ✅ Git repos | ❌ | npm | ❌ | ❌ | community | ❌ | ❌ |
| **Tool limits** | context budget | none | none | token budget | **100 tools** | none | none | none | none | none | none | none | **100 tools** | none | none |
| **Maturity** | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ |

---

## Key Findings & Recommendations

### Recommendation #1: Use `.mcp.json` as the universal project MCP format
Claude Code, Cursor, Cline, Devin, Swival, and PI-agent all support `.mcp.json` with identical `{ "mcpServers": { ... } }` structure. This is the closest thing to a portable standard. Codex uses TOML, but `codex mcp add` can read JSON.

### Recommendation #2: For the richest subagent system → Claude Code or Codex
Both support YAML-frontmatter Markdown agent files with tool scoping, model overrides, MCP server isolation, hooks, and skills. Codex additionally supports TOML-based agents. Cursor and Windsurf are close behind.

### Recommendation #3: For plugin ecosystems → Codex or Claude Code
Both have `.codex-plugin/plugin.json` / plugin.json manifest formats with Git-backed marketplaces. Devin also has a plugin system but it's enterprise-opt-in.

### Recommendation #4: For hook/guard systems → Claude Code (5 hook types) or Devin
Claude Code's hook system is the most mature — supporting shell, HTTP, MCP tool, prompt, and agent-based hooks across the full lifecycle. Devin imports Claude Code hooks.

### Recommendation #5: Watch out for the 100-tool limit in Windsurf
Windsurf silently drops MCP tools beyond 100. Swival has a similar guard at 100 tools but spills to disk. Cursor, Claude Code, and Codex have no hard tool limits (only context budget).

### Confidence Statement
This analysis is based on official documentation from 15 platforms, supplemented by community guides, GitHub issues, and changelogs as of June 2026. Confidence is **high** (>90%) for Claude Code, Codex, GitHub Copilot, Cursor, Windsurf, Gemini CLI, and Devin. Confidence is **moderate** (~75%) for Cline/Kilo, Hermes, PI-agent, Antigravity, Kiro, Swival, OpenClaw, and CodeWhale where APIs are still evolving or documentation is less centralized.
