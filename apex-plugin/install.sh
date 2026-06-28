#!/usr/bin/env bash
set -euo pipefail

# APEX v2 — Single-command install for all CLI coding agents
# Works everywhere: Claude Code, Cursor, OpenCode, Cline, Kilo,
# Copilot, Windsurf, Codex, Gemini CLI, Devin, Hermes, Pi, Antigravity
#
# Usage:
#   curl -fsSL https://apex.dev/install.sh | sh
#   curl -fsSL https://raw.githubusercontent.com/apex-team/apex/main/apex-plugin/install.sh | sh
#   npx @apex-team/apex
#   ./install.sh                  # local from repo
#   ./install.sh --global         # global install to ~/.apex/

SCRIPT_SOURCE="${BASH_SOURCE[0]}"
REPO_URL="https://github.com/apex-team/apex"
RAW_URL="https://raw.githubusercontent.com/apex-team/apex/main/apex-plugin"

# Detect if running from a local checkout or from curl pipe
if [ -f "$(dirname "$SCRIPT_SOURCE")/AGENTS.md" ]; then
  APEX_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  echo "  Using local checkout: $APEX_DIR"
else
  echo "  Downloading APEX from $REPO_URL..."
  TMP_DIR=$(mktemp -d)
  trap "rm -rf $TMP_DIR" EXIT
  if command -v git &>/dev/null; then
    git clone --depth 1 "$REPO_URL.git" "$TMP_DIR/apex" 2>/dev/null || {
      echo "  git clone failed, trying curl..."
      curl -fsSL "$RAW_URL/AGENTS.md" -o "$TMP_DIR/AGENTS.md" 2>/dev/null || { echo "  Cannot reach $REPO_URL. Check internet or use local ./install.sh"; exit 1; }
    fi
    if [ -d "$TMP_DIR/apex/apex-plugin" ]; then
      APEX_DIR="$TMP_DIR/apex/apex-plugin"
    else
      APEX_DIR="$TMP_DIR/apex"
    fi
  else
    curl -fsSL "$RAW_URL/AGENTS.md" -o "$TMP_DIR/AGENTS.md" 2>/dev/null || { echo "  Cannot reach $REPO_URL. Check internet or use local ./install.sh"; exit 1; }
    APEX_DIR="$TMP_DIR"
  fi
fi

DEST_DIR="${1:-$(pwd)}"
MODE="${2:-local}"
SUMMARY=()

green() { printf "\033[32m%s\033[0m\n" "$1"; }
dim() { printf "\033[2m%s\033[0m\n" "$1"; }

echo ""
echo "  APEX v2 — Senior Engineering Team"
echo "  ================================="
echo ""

# --- Universal AGENTS.md ---
cp "$APEX_DIR/AGENTS.md" "$DEST_DIR/AGENTS.md" 2>/dev/null || true
green "  ✓ AGENTS.md"
SUMMARY+=("✓ AGENTS.md")

# --- Claude Code ---
if command -v claude &>/dev/null; then
  if [ "$MODE" = "global" ]; then
    mkdir -p "$HOME/.claude/agents" "$HOME/.claude/skills"
    cp "$APEX_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md" 2>/dev/null || true
    [ -d "$APEX_DIR/.claude/agents" ] && cp "$APEX_DIR/.claude/agents/"*.md "$HOME/.claude/agents/" 2>/dev/null || true
    for skill in "$APEX_DIR/.claude/skills/"*/; do
      [ -d "$skill" ] && cp -r "$skill" "$HOME/.claude/skills/"
    done
    [ -f "$APEX_DIR/.claude/settings.json" ] && cp "$APEX_DIR/.claude/settings.json" "$HOME/.claude/settings.json" 2>/dev/null || true
    green "  ✓ Claude Code (global ~/.claude/)"
  else
    mkdir -p "$DEST_DIR/.claude/agents" "$DEST_DIR/.claude/skills"
    cp "$APEX_DIR/CLAUDE.md" "$DEST_DIR/CLAUDE.md" 2>/dev/null || true
    [ -d "$APEX_DIR/.claude/agents" ] && cp "$APEX_DIR/.claude/agents/"*.md "$DEST_DIR/.claude/agents/" 2>/dev/null || true
    for skill in "$APEX_DIR/.claude/skills/"*/; do
      [ -d "$skill" ] && cp -r "$skill" "$DEST_DIR/.claude/skills/"
    done
    [ -f "$APEX_DIR/.claude/settings.json" ] && cp "$APEX_DIR/.claude/settings.json" "$DEST_DIR/.claude/settings.json" 2>/dev/null || true
    green "  ✓ Claude Code (local)"
  fi
  SUMMARY+=("✓ Claude Code")
  if command -v claude &>/dev/null; then
    claude plugin add "$APEX_DIR" 2>/dev/null && green "  ✓ Claude Code: plugin registered" || true
  fi
else
  dim "  ~ Claude Code: not detected"
fi

# --- Cursor ---
if [ "$MODE" = "global" ]; then
  mkdir -p "$HOME/.cursor/rules"
  [ -f "$APEX_DIR/.cursorrules" ] && cp "$APEX_DIR/.cursorrules" "$HOME/.cursorrules" 2>/dev/null || true
  [ -d "$APEX_DIR/.cursor/rules" ] && cp "$APEX_DIR/.cursor/rules/"*.mdc "$HOME/.cursor/rules/" 2>/dev/null || true
  green "  ✓ Cursor (global)"
else
  mkdir -p "$DEST_DIR/.cursor/rules"
  [ -f "$APEX_DIR/.cursorrules" ] && cp "$APEX_DIR/.cursorrules" "$DEST_DIR/.cursorrules" 2>/dev/null || true
  [ -d "$APEX_DIR/.cursor/rules" ] && cp "$APEX_DIR/.cursor/rules/"*.mdc "$DEST_DIR/.cursor/rules/" 2>/dev/null || true
fi
SUMMARY+=("✓ Cursor")

# --- OpenCode ---
if [ "$MODE" = "global" ]; then
  OPENCODE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
  mkdir -p "$OPENCODE_DIR/plugins" "$OPENCODE_DIR/command"
  [ -f "$APEX_DIR/.opencode/plugins/apex.mjs" ] && cp "$APEX_DIR/.opencode/plugins/apex.mjs" "$OPENCODE_DIR/plugins/apex.mjs" 2>/dev/null || true
  [ -d "$APEX_DIR/.opencode/command" ] && cp "$APEX_DIR/.opencode/command/"*.md "$OPENCODE_DIR/command/" 2>/dev/null || true
  green "  ✓ OpenCode (global ~/.config/opencode/)"
else
  mkdir -p "$DEST_DIR/.opencode/plugins" "$DEST_DIR/.opencode/command"
  [ -f "$APEX_DIR/opencode.json" ] && cp "$APEX_DIR/opencode.json" "$DEST_DIR/opencode.json" 2>/dev/null || true
  [ -f "$APEX_DIR/.opencode/plugins/apex.mjs" ] && cp "$APEX_DIR/.opencode/plugins/apex.mjs" "$DEST_DIR/.opencode/plugins/apex.mjs" 2>/dev/null || true
  [ -d "$APEX_DIR/.opencode/command" ] && cp "$APEX_DIR/.opencode/command/"*.md "$DEST_DIR/.opencode/command/" 2>/dev/null || true
  green "  ✓ OpenCode (local)"
fi
SUMMARY+=("✓ OpenCode")

# --- Cline / Kilo ---
[ -f "$APEX_DIR/.clinerules" ] && cp "$APEX_DIR/.clinerules" "$DEST_DIR/.clinerules" 2>/dev/null || true
SUMMARY+=("✓ Cline/Kilo")

# --- GitHub Copilot ---
mkdir -p "$DEST_DIR/.github"
[ -f "$APEX_DIR/.github/copilot-instructions.md" ] && cp "$APEX_DIR/.github/copilot-instructions.md" "$DEST_DIR/.github/copilot-instructions.md" 2>/dev/null || true
SUMMARY+=("✓ GitHub Copilot")

# --- Windsurf ---
mkdir -p "$DEST_DIR/.windsurf"
[ -f "$APEX_DIR/.windsurf/rules.md" ] && cp "$APEX_DIR/.windsurf/rules.md" "$DEST_DIR/.windsurf/rules.md" 2>/dev/null || true
SUMMARY+=("✓ Windsurf")

# --- OfficeCLI ---
if command -v curl &>/dev/null; then
  echo "  Installing OfficeCLI..."
  curl -fsSL https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.sh | sh 2>/dev/null && green "  ✓ OfficeCLI installed" && SUMMARY+=("✓ OfficeCLI") || {
    dim "  ~ OfficeCLI: download failed (install manually from https://officecli.ai)"
    SUMMARY+=("~ OfficeCLI (manual)")
  }
else
  dim "  ~ OfficeCLI: curl not found"
  SUMMARY+=("~ OfficeCLI (curl missing)")
fi

# --- Mirage (TypeScript CLI) ---
if command -v npm &>/dev/null; then
  npm install -g @struktoai/mirage-cli 2>/dev/null && green "  ✓ Mirage CLI (TypeScript)" && SUMMARY+=("✓ Mirage TS") || {
    dim "  ~ Mirage TS: npm install failed"
    SUMMARY+=("~ Mirage TS (manual)")
  }
else
  dim "  ~ Mirage TS: npm not found"
  SUMMARY+=("~ Mirage TS (npm missing)")
fi

# --- Mirage (Python SDK) ---
if command -v uv &>/dev/null; then
  uv add mirage-ai -q 2>/dev/null && green "  ✓ Mirage Python SDK (uv)" && SUMMARY+=("✓ Mirage Py") || {
    dim "  ~ Mirage Py: uv add failed"
    SUMMARY+=("~ Mirage Py (manual)")
  }
elif command -v pip &>/dev/null; then
  pip install mirage-ai -q 2>/dev/null && green "  ✓ Mirage Python SDK" && SUMMARY+=("✓ Mirage Py") || {
    dim "  ~ Mirage Py: pip install failed"
    SUMMARY+=("~ Mirage Py (manual)")
  }
else
  dim "  ~ Mirage Py: Python/pip not found"
  SUMMARY+=("~ Mirage Py (Python missing)")
fi

# --- Global ~/.apex/ store ---
mkdir -p "$HOME/.apex"
cp -r "$APEX_DIR/"* "$HOME/.apex/" 2>/dev/null || true
green "  ✓ ~/.apex/ (full package cache)"
SUMMARY+=("✓ ~/.apex/")

echo ""
echo "  === Summary ==="
for item in "${SUMMARY[@]}"; do echo "  $item"; done

echo ""
echo "  === Quick Start ==="
echo "  @arch refactor this         → Max compresses code"
echo "  @ui build a login form      → Zara paints WCAG AA form"
echo "  @debug fix this error       → Kai 5-step debug"
echo "  @perf this is slow          → Rex profiles & optimizes"
echo "  @sec review auth code       → Vex OWASP scans"
echo "  @infra dockerize this       → Io outputs production config"
echo "  @nova any ideas             → Nova proposes novel angles"
echo "  @reed best caching          → Dr. Reed compares options"
echo "  @review check this code     → Rila blocks/suggests/praises"
echo "  @flex what's the MVP?       → Flex scores & cuts scope"
echo ""
echo "  === OfficeCLI (Office Documents) ==="
echo "  /docs create a report               Word document"
echo "  /excel build a spreadsheet          Excel sheet"
echo "  /ppt make a presentation            PowerPoint deck"
echo ""
echo "  === Mirage (Virtual File System) ==="
echo "  /mirage cp /s3/file.csv /data/      Copy across services"
echo ""
echo "  === Marketplaces ==="
echo "  Claude Code:       /plugin marketplace add apex-team/apex"
echo "  Codex CLI:         codex plugin marketplace add apex-team/apex"
echo "  Copilot CLI:       copilot plugin marketplace add apex-team/apex"
echo "  Gemini CLI:        gemini extensions install https://github.com/apex-team/apex"
echo "  OpenCode:          add '@apex-team/apex' to opencode.json plugins"
echo "  Devin CLI:         devin plugins install apex-team/apex"
echo "  Hermes Agent:      hermes plugins install apex-team/apex --enable"
echo "  Pi:                pi install git:github.com/apex-team/apex"
echo ""
echo "  === Extra Dependencies ==="
echo "  OfficeCLI:   officecli --version (single binary)"
echo "  Mirage CLI:  mirage --version (npm install -g @struktoai/mirage-cli)"
echo "  Mirage Py:   python -c 'import mirage' (pip install mirage-ai)"

echo ""
