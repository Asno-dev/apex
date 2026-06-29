#!/usr/bin/env bash
set -euo pipefail

# APEX v2 — Universal installer for all CLI coding agents
# Works with: Claude Code, Codex, Cursor, Cline, Kilo, Copilot, Windsurf,
# Gemini CLI, Devin, Hermes, Pi, Antigravity, OpenCode, OpenClaw, Kiro,
# CodeWhale, Swival
#
# Usage:
#   npx @asno-dev/apex              # from npm
#   curl -fsSL https://raw.githubusercontent.com/asno-dev/apex/main/install.sh | sh
#   ./install.sh                    # local from repo
#   ./install.sh --global           # global install to ~/.config/

REPO_URL="https://github.com/asno-dev/apex"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect local checkout vs curl pipe
if [ -f "$SCRIPT_DIR/AGENTS.md" ]; then
  APEX_DIR="$SCRIPT_DIR"
  echo "  Using local checkout: $APEX_DIR"
else
  echo "  Downloading APEX from $REPO_URL..."
  TMP_DIR=$(mktemp -d)
  trap "rm -rf $TMP_DIR" EXIT
  if command -v git &>/dev/null; then
    git clone --depth 1 "$REPO_URL.git" "$TMP_DIR/apex" 2>/dev/null || {
      echo "  git clone failed. Check internet connection."
      exit 1
    }
    APEX_DIR="$TMP_DIR/apex/apex-plugin"
  else
    echo "  git not found. Install git or use npx @asno-dev/apex"
    exit 1
  fi
fi

DEST_DIR="${1:-$(pwd)}"
MODE="${2:-local}"
SUMMARY=()

green() { printf "\033[32m  ✓ %s\033[0m\n" "$1"; }
dim() { printf "\033[2m  ~ %s\033[0m\n" "$1"; }
bold() { printf "\033[1m%s\033[0m\n" "$1"; }

bold "\n  APEX v2 — Senior Engineering Team"
bold "  =================================\n"

# --- Universal AGENTS.md ---
cp "$APEX_DIR/AGENTS.md" "$DEST_DIR/AGENTS.md" 2>/dev/null || true
green "AGENTS.md (universal)"
SUMMARY+=("✓ AGENTS.md")

# --- Claude Code ---
if command -v claude &>/dev/null; then
  if [ "$MODE" = "global" ]; then
    mkdir -p "$HOME/.claude/agents" "$HOME/.claude/skills"
    cp "$APEX_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md" 2>/dev/null || true
    [ -d "$APEX_DIR/.claude/agents" ] && cp "$APEX_DIR/.claude/agents/"*.md "$HOME/.claude/agents/" 2>/dev/null || true
    [ -d "$APEX_DIR/skills" ] && cp -r "$APEX_DIR/skills/"* "$HOME/.claude/skills/" 2>/dev/null || true
    green "Claude Code (global ~/.claude/)"
  else
    mkdir -p "$DEST_DIR/.claude/agents" "$DEST_DIR/.claude/skills"
    cp "$APEX_DIR/CLAUDE.md" "$DEST_DIR/CLAUDE.md" 2>/dev/null || true
    [ -d "$APEX_DIR/.claude/agents" ] && cp "$APEX_DIR/.claude/agents/"*.md "$DEST_DIR/.claude/agents/" 2>/dev/null || true
    [ -d "$APEX_DIR/skills" ] && cp -r "$APEX_DIR/skills/"* "$DEST_DIR/.claude/skills/" 2>/dev/null || true
    green "Claude Code (local)"
  fi
  SUMMARY+=("✓ Claude Code")
else
  dim "Claude Code: not detected"
fi

# --- Cursor ---
if [ "$MODE" = "global" ]; then
  mkdir -p "$HOME/.cursor/rules"
  [ -f "$APEX_DIR/.cursorrules" ] && cp "$APEX_DIR/.cursorrules" "$HOME/.cursorrules" 2>/dev/null || true
  [ -d "$APEX_DIR/.cursor/rules" ] && cp "$APEX_DIR/.cursor/rules/"*.mdc "$HOME/.cursor/rules/" 2>/dev/null || true
  green "Cursor (global)"
else
  mkdir -p "$DEST_DIR/.cursor/rules"
  [ -f "$APEX_DIR/.cursorrules" ] && cp "$APEX_DIR/.cursorrules" "$DEST_DIR/.cursorrules" 2>/dev/null || true
  [ -d "$APEX_DIR/.cursor/rules" ] && cp "$APEX_DIR/.cursor/rules/"*.mdc "$DEST_DIR/.cursor/rules/" 2>/dev/null || true
  green "Cursor (local)"
fi
SUMMARY+=("✓ Cursor")

# --- OpenCode ---
if [ "$MODE" = "global" ]; then
  OPENCODE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
  mkdir -p "$OPENCODE_DIR/plugins" "$OPENCODE_DIR/command"
  [ -f "$APEX_DIR/adapters/opencode/apex.mjs" ] && cp "$APEX_DIR/adapters/opencode/apex.mjs" "$OPENCODE_DIR/plugins/apex.mjs" 2>/dev/null || true
  [ -d "$APEX_DIR/.opencode/command" ] && cp "$APEX_DIR/.opencode/command/"*.md "$OPENCODE_DIR/command/" 2>/dev/null || true
  green "OpenCode (global ~/.config/opencode/)"
else
  mkdir -p "$DEST_DIR/.opencode/plugins" "$DEST_DIR/.opencode/command"
  [ -f "$APEX_DIR/opencode.json" ] && cp "$APEX_DIR/opencode.json" "$DEST_DIR/opencode.json" 2>/dev/null || true
  [ -f "$APEX_DIR/adapters/opencode/apex.mjs" ] && cp "$APEX_DIR/adapters/opencode/apex.mjs" "$DEST_DIR/.opencode/plugins/apex.mjs" 2>/dev/null || true
  [ -d "$APEX_DIR/.opencode/command" ] && cp "$APEX_DIR/.opencode/command/"*.md "$DEST_DIR/.opencode/command/" 2>/dev/null || true
  green "OpenCode (local)"
fi
SUMMARY+=("✓ OpenCode")

# --- Cline / Kilo ---
[ -f "$APEX_DIR/.clinerules" ] && cp "$APEX_DIR/.clinerules" "$DEST_DIR/.clinerules" 2>/dev/null || true
green "Cline/Kilo"
SUMMARY+=("✓ Cline/Kilo")

# --- GitHub Copilot ---
mkdir -p "$DEST_DIR/.github"
[ -f "$APEX_DIR/.github/copilot-instructions.md" ] && cp "$APEX_DIR/.github/copilot-instructions.md" "$DEST_DIR/.github/copilot-instructions.md" 2>/dev/null || true
green "GitHub Copilot"
SUMMARY+=("✓ GitHub Copilot")

# --- Windsurf ---
mkdir -p "$DEST_DIR/.windsurf"
[ -f "$APEX_DIR/.windsurf/rules.md" ] && cp "$APEX_DIR/.windsurf/rules.md" "$DEST_DIR/.windsurf/rules.md" 2>/dev/null || true
green "Windsurf"
SUMMARY+=("✓ Windsurf")

# --- Gemini CLI ---
if command -v gemini &>/dev/null; then
  [ -f "$APEX_DIR/gemini-extension.json" ] && cp "$APEX_DIR/gemini-extension.json" "$DEST_DIR/gemini-extension.json" 2>/dev/null || true
  green "Gemini CLI"
  SUMMARY+=("✓ Gemini CLI")
else
  dim "Gemini CLI: not detected"
fi

# --- Skills ---
if [ -d "$APEX_DIR/skills" ]; then
  mkdir -p "$DEST_DIR/.claude/skills"
  cp -r "$APEX_DIR/skills/"* "$DEST_DIR/.claude/skills/" 2>/dev/null || true
  green "Skills (24 skills)"
  SUMMARY+=("✓ Skills")
fi

# --- Global ~/.apex/ store ---
if [ "$MODE" = "global" ]; then
  mkdir -p "$HOME/.apex"
  cp -r "$APEX_DIR/"* "$HOME/.apex/" 2>/dev/null || true
  green "~/.apex/ (full package cache)"
  SUMMARY+=("✓ ~/.apex/")
fi

echo ""
bold "  === Summary ==="
for item in "${SUMMARY[@]}"; do echo "  $item"; done

bold "\n  === Quick Start ==="
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
bold "  === Marketplace Installs ==="
echo "  Claude Code:  /plugin marketplace add asno-dev/apex"
echo "  Codex:        codex plugin marketplace add asno-dev/apex"
echo "  Gemini CLI:   gemini extensions install https://github.com/asno-dev/apex"
echo "  OpenCode:     add \"@asno-dev/apex\" to opencode.json plugins"
echo ""
