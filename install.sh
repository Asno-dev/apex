#!/usr/bin/env bash
# APEX v2 — Universal Installer (Bash)
# Installs full APEX configuration for ALL detected coding agents
set -euo pipefail

APEX_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL="${1:-}"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GRAY='\033[0;90m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        ⚡ APEX v2 — Universal Installer              ║${NC}"
echo -e "${CYAN}║  10 agents · 3 MCP servers · 62+ tools · Composio  ║${NC}"
echo -e "${CYAN}║  Mirage VFS · OfficeCLI · Full agent auto-config   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

detect_agents() {
  local detected=()
  local HOME_DIR="$HOME"

  # Check installed commands (most reliable)
  command -v claude &>/dev/null && detected+=("claude-code") || true
  command -v cursor &>/dev/null && detected+=("cursor") || true
  command -v windsurf &>/dev/null && detected+=("windsurf") || true
  command -v codex &>/dev/null && detected+=("codex") || true
  command -v gemini &>/dev/null && detected+=("gemini") || true
  command -v gh &>/dev/null && detected+=("copilot") || true
  command -v devin &>/dev/null && detected+=("devin") || true
  command -v hermes &>/dev/null && detected+=("hermes") || true
  command -v pi &>/dev/null && detected+=("pi") || true

  # Check home config directories (NOT adapters/ source)
  [[ -d "$HOME_DIR/.claude" ]] && detected+=("claude-code") || true
  [[ -d "$HOME_DIR/.cursor" ]] && detected+=("cursor") || true
  [[ -d "$HOME_DIR/.codex" ]] && detected+=("codex") || true
  [[ -d "$HOME_DIR/.gemini" ]] && detected+=("gemini") || true
  [[ -d "$HOME_DIR/.devin" ]] && detected+=("devin") || true
  [[ -d "$HOME_DIR/.hermes" ]] && detected+=("hermes") || true
  [[ -d "$HOME_DIR/.kiro" ]] && detected+=("kiro") || true
  [[ -d "$HOME_DIR/.pi" ]] && detected+=("pi") || true
  [[ -d "$HOME_DIR/.windsurf" ]] && detected+=("windsurf") || true

  # Check project-local configs
  [[ -f "$APEX_DIR/.clinerules" ]] && detected+=("cline") || true
  [[ -f "$APEX_DIR/.github/copilot-instructions.md" ]] && detected+=("copilot") || true

  # Check npm global packages
  if command -v npm &>/dev/null; then
    local npm_list
    npm_list=$(npm list -g --depth=0 2>/dev/null || true)
    echo "$npm_list" | grep -q "@anthropic-ai/claude-code" && detected+=("claude-code") || true
    echo "$npm_list" | grep -q "cursor" && detected+=("cursor") || true
  fi

  printf '%s\n' "${detected[@]}" | sort -u
}

install_for_agent() {
  local agent="$1"
  echo -e "${YELLOW}  → Configuring $agent...${NC}"

  case "$agent" in
    claude-code)
      cp "$APEX_DIR/adapters/claude-code/plugin.json" "$APEX_DIR/.claude/plugin.json" 2>/dev/null || true
      cp "$APEX_DIR/adapters/claude-code/hooks.json" "$APEX_DIR/.claude/hooks.json" 2>/dev/null || true
      mkdir -p "$APEX_DIR/.claude/agents" "$APEX_DIR/.claude/commands"
      cp "$APEX_DIR/adapters/claude-code/agents/"*.md "$APEX_DIR/.claude/agents/" 2>/dev/null || true
      cp "$APEX_DIR/adapters/claude-code/commands/"*.md "$APEX_DIR/.claude/commands/" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Claude Code: 10 agents, 8 commands, 3 MCP servers${NC}"
      ;;

    cursor)
      mkdir -p "$APEX_DIR/.cursor" "$APEX_DIR/.cursor/rules"
      cp "$APEX_DIR/.mcp.json" "$APEX_DIR/.cursor/mcp.json" 2>/dev/null || true
      cp "$APEX_DIR/adapters/cursor/rules/apex.mdc" "$APEX_DIR/.cursor/rules/apex.mdc" 2>/dev/null || true
      mkdir -p "$APEX_DIR/.cursor/agents" "$APEX_DIR/.cursor/commands"
      cp "$APEX_DIR/adapters/cursor/agents/"*.mdc "$APEX_DIR/.cursor/agents/" 2>/dev/null || true
      cp "$APEX_DIR/adapters/cursor/commands/"*.md "$APEX_DIR/.cursor/commands/" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Cursor: 10 agents, 8 commands, 3 MCP servers${NC}"
      ;;

    codex)
      mkdir -p "$APEX_DIR/.codex/agents"
      cp "$APEX_DIR/adapters/codex/agents/"*.toml "$APEX_DIR/.codex/agents/" 2>/dev/null || true
      cp "$APEX_DIR/adapters/codex/mcp.toml" "$APEX_DIR/.codex/mcp.toml" 2>/dev/null || true
      cp "$APEX_DIR/adapters/codex/plugin.json" "$APEX_DIR/.codex/plugin.json" 2>/dev/null || true
      cp "$APEX_DIR/adapters/codex/SKILLS.md" "$APEX_DIR/.codex/SKILLS.md" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Codex: 10 agents, 3 MCP servers, skills${NC}"
      ;;

    windsurf)
      cp "$APEX_DIR/.mcp.json" "$APEX_DIR/.windsurf/mcp.json" 2>/dev/null || true
      cp "$APEX_DIR/adapters/windsurf/rules/apex.md" "$APEX_DIR/.windsurf/rules/apex.md" 2>/dev/null || true
      mkdir -p "$APEX_DIR/.windsurf/agents" "$APEX_DIR/.windsurf/workflows"
      cp "$APEX_DIR/adapters/windsurf/agents/"*.md "$APEX_DIR/.windsurf/agents/" 2>/dev/null || true
      cp "$APEX_DIR/adapters/windsurf/workflows/"*.md "$APEX_DIR/.windsurf/workflows/" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Windsurf: 10 agents, 8 workflows, 3 MCP servers${NC}"
      ;;

    cline)
      echo -e "    ${GREEN}✓ Cline: uses root .clinerules${NC}"
      ;;

    copilot)
      mkdir -p "$APEX_DIR/.github"
      cp "$APEX_DIR/adapters/copilot/instructions.md" "$APEX_DIR/.github/copilot-instructions.md" 2>/dev/null || true
      echo -e "    ${GREEN}✓ GitHub Copilot: full APEX instructions${NC}"
      ;;

    gemini)
      mkdir -p "$APEX_DIR/.gemini/agents" "$APEX_DIR/.gemini/commands"
      cp "$APEX_DIR/adapters/gemini/extension.json" "$APEX_DIR/.gemini/extension.json" 2>/dev/null || true
      cp "$APEX_DIR/adapters/gemini/agents/"*.md "$APEX_DIR/.gemini/agents/" 2>/dev/null || true
      cp "$APEX_DIR/adapters/gemini/commands/"*.toml "$APEX_DIR/.gemini/commands/" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Gemini CLI: 10 agents, 8 commands, 3 MCP servers${NC}"
      ;;

    devin)
      mkdir -p "$APEX_DIR/.devin"
      cp "$APEX_DIR/adapters/devin/mcp.json" "$APEX_DIR/.devin/mcp.json" 2>/dev/null || true
      cp "$APEX_DIR/adapters/devin/plugin.yaml" "$APEX_DIR/.devin/plugin.yaml" 2>/dev/null || true
      for agent in arch ui debug perf sec infra nova reed review flex; do
        mkdir -p "$APEX_DIR/.devin/agents/$agent"
        cp "$APEX_DIR/adapters/devin/agents/$agent/AGENT.md" "$APEX_DIR/.devin/agents/$agent/AGENT.md" 2>/dev/null || true
      done
      echo -e "    ${GREEN}✓ Devin: 10 agents, 3 MCP servers${NC}"
      ;;

    hermes)
      mkdir -p "$APEX_DIR/.hermes"
      cp "$APEX_DIR/adapters/hermes/apex-features.yaml" "$APEX_DIR/hermes-apex.yaml" 2>/dev/null || true
      cp "$APEX_DIR/adapters/hermes/plugin.yaml" "$APEX_DIR/.hermes/plugin.yaml" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Hermes: plugin + features${NC}"
      ;;

    kiro)
      mkdir -p "$APEX_DIR/.kiro/steering"
      cp "$APEX_DIR/adapters/kiro/apex.md" "$APEX_DIR/.kiro/steering/apex.md" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Kiro: full APEX instructions${NC}"
      ;;

    swival)
      mkdir -p "$APEX_DIR/.swival"
      cp "$APEX_DIR/adapters/swival/apex.md" "$APEX_DIR/swival-apex-skill.md" 2>/dev/null || true
      cp "$APEX_DIR/.mcp.json" "$APEX_DIR/.swival/mcp.json" 2>/dev/null || true
      echo -e "    ${GREEN}✓ Swival: skill + MCP${NC}"
      ;;
  esac
}

# Main
echo -e "  Detecting installed coding agents..."
mapfile -t detected_agents < <(detect_agents)

if [ ${#detected_agents[@]} -eq 0 ]; then
  echo -e "  ${YELLOW}No coding agents detected on this system.${NC}"
  echo -e "  ${YELLOW}Install an agent first, then run this installer again.${NC}"
  echo ""
  echo -e "  ${GRAY}Supported: claude-code, codex, cursor, windsurf, cline,${NC}"
  echo -e "  ${GRAY}copilot, gemini-cli, devin, hermes, kiro, swival${NC}"
  exit 1
fi

echo -e "  ${GREEN}Detected: ${detected_agents[*]}${NC}"
echo ""

# Universal MCP config already in place at .mcp.json

# Install for each
for agent in "${detected_agents[@]}"; do
  install_for_agent "$agent"
done

echo ""
echo -e "${CYAN}  ╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}  ║  ✓ APEX v2 installed for ${#detected_agents[@]} agent(s)!         ║${NC}"
echo -e "${CYAN}  ║                                               ║${NC}"
echo -e "${CYAN}  ║  Use @agentName to invoke any specialist:     ║${NC}"
echo -e "${CYAN}  ║  @arch  @ui  @debug  @perf  @sec  @infra      ║${NC}"
echo -e "${CYAN}  ║  @nova  @reed  @review  @flex                 ║${NC}"
echo -e "${CYAN}  ║                                               ║${NC}"
echo -e "${CYAN}  ║  apex-docs  apex-excel  apex-ppt — OfficeCLI      ║${NC}"
echo -e "${CYAN}  ║  apex-composio-setup    — Connect 1000+ tools    ║${NC}"
echo -e "${CYAN}  ║  apex-mirage <cmd>      — VFS across 50+ backends║${NC}"
echo -e "${CYAN}  ╚══════════════════════════════════════════════════╝${NC}"
