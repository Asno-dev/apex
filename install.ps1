# APEX v2 — Universal Installer (PowerShell 7+)
# Installs full APEX configuration for ALL detected coding agents
param(
  [switch]$Global,
  [switch]$DryRun
)

$ErrorActionPreference = "Continue"
$APEX_DIR = $PSScriptRoot

Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        ⚡ APEX v2 — Universal Installer              ║" -ForegroundColor Cyan
Write-Host "║  10 agents · 3 MCP servers · 62+ tools · Composio  ║" -ForegroundColor Cyan
Write-Host "║  Mirage VFS · OfficeCLI · Full agent auto-config   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Detect agent type from environment
function Get-AgentType {
  $homeDir = $env:USERPROFILE
  $localAppData = "$env:LOCALAPPDATA"
  $detected = @()

  # Check npm global installs first (most reliable)
  try {
    $npmGlobals = (npm list -g --depth=0 2>$null) -join " "
    if ($npmGlobals -match "@anthropic-ai/claude-code") { $detected += "claude-code" }
    if ($npmGlobals -match "cursor") { $detected += "cursor" }
  } catch {}

  # Check for agent commands
  if (Get-Command "claude" -ErrorAction SilentlyContinue) { $detected += "claude-code" }
  if (Get-Command "cursor" -ErrorAction SilentlyContinue) { $detected += "cursor" }
  if (Get-Command "windsurf" -ErrorAction SilentlyContinue) { $detected += "windsurf" }
  if (Get-Command "codex" -ErrorAction SilentlyContinue) { $detected += "codex" }
  if (Get-Command "gemini" -ErrorAction SilentlyContinue) { $detected += "gemini" }
  if (Get-Command "gh" -ErrorAction SilentlyContinue) { $detected += "copilot" }
  if (Get-Command "devin" -ErrorAction SilentlyContinue) { $detected += "devin" }
  if (Get-Command "hermes" -ErrorAction SilentlyContinue) { $detected += "hermes" }
  if (Get-Command "pi" -ErrorAction SilentlyContinue) { $detected += "pi" }

  # Check user config directories (NOT adapters/ source)
  if (Test-Path "$homeDir/.claude") { $detected += "claude-code" }
  if (Test-Path "$homeDir/.cursor") { $detected += "cursor" }
  if (Test-Path "$homeDir/.codex") { $detected += "codex" }
  if (Test-Path "$homeDir/.gemini") { $detected += "gemini" }
  if (Test-Path "$homeDir/.devin") { $detected += "devin" }
  if (Test-Path "$homeDir/.hermes") { $detected += "hermes" }
  if (Test-Path "$homeDir/.kiro") { $detected += "kiro" }
  if (Test-Path "$homeDir/.pi") { $detected += "pi" }
  if (Test-Path "$homeDir/.antigravity") { $detected += "antigravity" }

  # Check project-local agent configs (only in project root, NOT adapters/)
  if (Test-Path "$APEX_DIR/.clinerules") { $detected += "cline" }
  if (Test-Path "$APEX_DIR/.github/copilot-instructions.md") { $detected += "copilot" }
  if (Test-Path "$homeDir/.windsurf") { $detected += "windsurf" }

  # Check for VS Code extensions
  $vscodeDir = "$homeDir/.vscode/extensions"
  if (Test-Path $vscodeDir) {
    if (Get-ChildItem "$vscodeDir/cline*" -Directory -ErrorAction SilentlyContinue) { $detected += "cline" }
    if (Get-ChildItem "$vscodeDir/github.copilot*" -Directory -ErrorAction SilentlyContinue) { $detected += "copilot" }
  }

  return $detected | Select-Object -Unique
}

function Install-ForAgent {
  param([string]$Agent)

  Write-Host "  → Configuring $Agent..." -ForegroundColor Yellow

  switch ($Agent) {
    "claude-code" {
      # MCP config already at .mcp.json (Claude Code reads it from project root)
      # Plugin config
      Copy-Item "$APEX_DIR/adapters/claude-code/plugin.json" "$APEX_DIR/.claude/plugin.json" -Force
      Copy-Item "$APEX_DIR/adapters/claude-code/hooks.json" "$APEX_DIR/.claude/hooks.json" -Force
      # Agents
      if (!(Test-Path "$APEX_DIR/.claude/agents")) { New-Item -ItemType Directory "$APEX_DIR/.claude/agents" -Force }
      Copy-Item "$APEX_DIR/adapters/claude-code/agents/*.md" "$APEX_DIR/.claude/agents/" -Force
      # Commands
      if (!(Test-Path "$APEX_DIR/.claude/commands")) { New-Item -ItemType Directory "$APEX_DIR/.claude/commands" -Force }
      Copy-Item "$APEX_DIR/adapters/claude-code/commands/*.md" "$APEX_DIR/.claude/commands/" -Force
      Write-Host "    ✓ Claude Code configured: 10 agents, 8 commands, 3 MCP servers" -ForegroundColor Green
    }

    "cursor" {
      if (!(Test-Path "$APEX_DIR/.cursor")) { New-Item -ItemType Directory "$APEX_DIR/.cursor" -Force }
      Copy-Item "$APEX_DIR/.mcp.json" "$APEX_DIR/.cursor/mcp.json" -Force
      if (!(Test-Path "$APEX_DIR/.cursor/rules")) { New-Item -ItemType Directory "$APEX_DIR/.cursor/rules" -Force }
      Copy-Item "$APEX_DIR/adapters/cursor/rules/apex.mdc" "$APEX_DIR/.cursor/rules/apex.mdc" -Force
      if (!(Test-Path "$APEX_DIR/.cursor/agents")) { New-Item -ItemType Directory "$APEX_DIR/.cursor/agents" -Force }
      Copy-Item "$APEX_DIR/adapters/cursor/agents/*.mdc" "$APEX_DIR/.cursor/agents/" -Force
      if (!(Test-Path "$APEX_DIR/.cursor/commands")) { New-Item -ItemType Directory "$APEX_DIR/.cursor/commands" -Force }
      Copy-Item "$APEX_DIR/adapters/cursor/commands/*.md" "$APEX_DIR/.cursor/commands/" -Force
      Write-Host "    ✓ Cursor configured: 10 agents, 8 commands, 3 MCP servers" -ForegroundColor Green
    }

    "codex" {
      if (!(Test-Path "$APEX_DIR/.codex")) { New-Item -ItemType Directory "$APEX_DIR/.codex" -Force }
      if (!(Test-Path "$APEX_DIR/.codex/agents")) { New-Item -ItemType Directory "$APEX_DIR/.codex/agents" -Force }
      Copy-Item "$APEX_DIR/adapters/codex/agents/*.toml" "$APEX_DIR/.codex/agents/" -Force
      Copy-Item "$APEX_DIR/adapters/codex/mcp.toml" "$APEX_DIR/.codex/mcp.toml" -Force
      Copy-Item "$APEX_DIR/adapters/codex/plugin.json" "$APEX_DIR/.codex/plugin.json" -Force
      Copy-Item "$APEX_DIR/adapters/codex/SKILLS.md" "$APEX_DIR/.codex/SKILLS.md" -Force
      Write-Host "    ✓ Codex configured: 10 agents, 3 MCP servers, skills" -ForegroundColor Green
    }

    "windsurf" {
      Copy-Item "$APEX_DIR/.mcp.json" "$APEX_DIR/.windsurf/mcp.json" -Force
      Copy-Item "$APEX_DIR/adapters/windsurf/rules/apex.md" "$APEX_DIR/.windsurf/rules/apex.md" -Force
      if (!(Test-Path "$APEX_DIR/.windsurf/agents")) { New-Item -ItemType Directory "$APEX_DIR/.windsurf/agents" -Force }
      Copy-Item "$APEX_DIR/adapters/windsurf/agents/*.md" "$APEX_DIR/.windsurf/agents/" -Force
      if (!(Test-Path "$APEX_DIR/.windsurf/workflows")) { New-Item -ItemType Directory "$APEX_DIR/.windsurf/workflows" -Force }
      Copy-Item "$APEX_DIR/adapters/windsurf/workflows/*.md" "$APEX_DIR/.windsurf/workflows/" -Force
      Write-Host "    ✓ Windsurf configured: 10 agents, 8 workflows, 3 MCP servers" -ForegroundColor Green
    }

    "cline" {
      Write-Host "    ✓ Cline configured (uses root .clinerules)" -ForegroundColor Green
    }

    "copilot" {
      if (!(Test-Path "$APEX_DIR/.github")) { New-Item -ItemType Directory "$APEX_DIR/.github" -Force }
      Copy-Item "$APEX_DIR/adapters/copilot/instructions.md" "$APEX_DIR/.github/copilot-instructions.md" -Force
      Write-Host "    ✓ GitHub Copilot configured: full APEX instructions" -ForegroundColor Green
    }

    "gemini" {
      if (!(Test-Path "$APEX_DIR/.gemini")) { New-Item -ItemType Directory "$APEX_DIR/.gemini" -Force }
      Copy-Item "$APEX_DIR/adapters/gemini/extension.json" "$APEX_DIR/.gemini/extension.json" -Force
      if (!(Test-Path "$APEX_DIR/.gemini/agents")) { New-Item -ItemType Directory "$APEX_DIR/.gemini/agents" -Force }
      Copy-Item "$APEX_DIR/adapters/gemini/agents/*.md" "$APEX_DIR/.gemini/agents/" -Force
      if (!(Test-Path "$APEX_DIR/.gemini/commands")) { New-Item -ItemType Directory "$APEX_DIR/.gemini/commands" -Force }
      Copy-Item "$APEX_DIR/adapters/gemini/commands/*.toml" "$APEX_DIR/.gemini/commands/" -Force
      Write-Host "    ✓ Gemini CLI configured: 10 agents, 8 commands, 3 MCP servers" -ForegroundColor Green
    }

    "devin" {
      if (!(Test-Path "$APEX_DIR/.devin")) { New-Item -ItemType Directory "$APEX_DIR/.devin" -Force }
      Copy-Item "$APEX_DIR/adapters/devin/mcp.json" "$APEX_DIR/.devin/mcp.json" -Force
      Copy-Item "$APEX_DIR/adapters/devin/plugin.yaml" "$APEX_DIR/.devin/plugin.yaml" -Force
      foreach ($agent in @("arch","ui","debug","perf","sec","infra","nova","reed","review","flex")) {
        $srcDir = "$APEX_DIR/adapters/devin/agents/$agent"
        $dstDir = "$APEX_DIR/.devin/agents/$agent"
        if (!(Test-Path $dstDir)) { New-Item -ItemType Directory $dstDir -Force }
        Copy-Item "$srcDir/AGENT.md" "$dstDir/AGENT.md" -Force
      }
      Write-Host "    ✓ Devin configured: 10 agents, 3 MCP servers" -ForegroundColor Green
    }

    "kiro" {
      if (!(Test-Path "$APEX_DIR/.kiro")) { New-Item -ItemType Directory "$APEX_DIR/.kiro" -Force }
      Copy-Item "$APEX_DIR/adapters/kiro/apex.md" "$APEX_DIR/.kiro/steering/apex.md" -Force
      Write-Host "    ✓ Kiro configured: full APEX instructions" -ForegroundColor Green
    }

    "swival" {
      Copy-Item "$APEX_DIR/adapters/swival/apex.md" "$APEX_DIR/swival-apex-skill.md" -Force
      if (!(Test-Path "$APEX_DIR/.swival")) { New-Item -ItemType Directory "$APEX_DIR/.swival" -Force }
      Copy-Item "$APEX_DIR/.mcp.json" "$APEX_DIR/.swival/mcp.json" -Force
      Write-Host "    ✓ Swival configured: skill + MCP" -ForegroundColor Green
    }

    "pi" {
      Copy-Item "$APEX_DIR/adapters/pi/extension.json" "$APEX_DIR/pi-extension.json" -Force
      Write-Host "    ✓ Pi Agent configured: extension + MCP" -ForegroundColor Green
    }

    "antigravity" {
      Copy-Item "$APEX_DIR/adapters/antigravity/extension.json" "$APEX_DIR/antigravity-extension.json" -Force
      Write-Host "    ✓ Antigravity configured: extension + MCP" -ForegroundColor Green
    }

    "openclaw" {
      Copy-Item "$APEX_DIR/adapters/openclaw/package.json" "$APEX_DIR/openclaw-package.json" -Force
      Write-Host "    ✓ OpenClaw configured: package + MCP" -ForegroundColor Green
    }

    "codewhale" {
      Copy-Item "$APEX_DIR/adapters/codewhale/AGENTS.md" "$APEX_DIR/AGENTS.md" -Force
      Write-Host "    ✓ CodeWhale configured: AGENTS.md + MCP" -ForegroundColor Green
    }

    "hermes" {
      Copy-Item "$APEX_DIR/adapters/hermes/apex-features.yaml" "$APEX_DIR/hermes-apex.yaml" -Force
      if (!(Test-Path "$APEX_DIR/.hermes")) { New-Item -ItemType Directory "$APEX_DIR/.hermes" -Force }
      Copy-Item "$APEX_DIR/adapters/hermes/plugin.yaml" "$APEX_DIR/.hermes/plugin.yaml" -Force
      Write-Host "    ✓ Hermes configured: plugin + features" -ForegroundColor Green
    }
  }
}

# Main
$detectedAgents = Get-AgentType

if ($detectedAgents.Count -eq 0) {
  Write-Host "  No coding agents detected on this system." -ForegroundColor Yellow
  Write-Host "  Install an agent first, then run this installer again." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  Supported agents: claude-code, codex, cursor, windsurf, cline," -ForegroundColor Gray
  Write-Host "  copilot, gemini-cli, devin, hermes, kiro, swival, openclaw," -ForegroundColor Gray
  Write-Host "  pi-agent, antigravity, codewhale" -ForegroundColor Gray
  exit 1
}

Write-Host "  Detected agents: $($detectedAgents -join ', ')" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
  Write-Host "  [DRY RUN] Would install for:" -ForegroundColor Cyan
  foreach ($agent in $detectedAgents) {
    Write-Host "    - $agent" -ForegroundColor Cyan
  }
  Write-Host "  [DRY RUN] No files changed." -ForegroundColor Cyan
  exit 0
}

# Universal MCP config is already in place
Write-Host "  Using universal MCP config: .mcp.json" -ForegroundColor Gray

# Install for each detected agent
foreach ($agent in $detectedAgents) {
  Install-ForAgent -Agent $agent
}

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║  ✓ APEX v2 installed for $($detectedAgents.Count) agent(s)!         ║" -ForegroundColor Cyan
Write-Host "  ║                                               ║" -ForegroundColor Cyan
Write-Host "  ║  Use @agentName to invoke any specialist:     ║" -ForegroundColor Cyan
Write-Host "  ║  @arch  @ui  @debug  @perf  @sec  @infra      ║" -ForegroundColor Cyan
Write-Host "  ║  @nova  @reed  @review  @flex                 ║" -ForegroundColor Cyan
Write-Host "  ║                                               ║" -ForegroundColor Cyan
Write-Host "  ║  apex-docs  apex-excel  apex-ppt — OfficeCLI      ║" -ForegroundColor Cyan
Write-Host "  ║  apex-composio-setup    — Connect 1000+ tools    ║" -ForegroundColor Cyan
Write-Host "  ║  apex-mirage <cmd>      — VFS across 50+ backends║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
