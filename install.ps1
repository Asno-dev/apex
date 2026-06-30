#Requires -Version 7.0
$ErrorActionPreference = 'Stop'
$ApexDir = Split-Path -Parent $PSCommandPath
$ProjectDir = Get-Location
$Summary = @()

function Write-Green($m) { Write-Host "  ✓ $m" -ForegroundColor Green }
function Write-Dim($m) { Write-Host "  ~ $m" -ForegroundColor DarkGray }
function Write-Bold($m) { Write-Host $m -ForegroundColor White }
function Has-Command($cmd) { Get-Command $cmd -ErrorAction SilentlyContinue }

Write-Bold "`n  APEX v2 — Senior Engineering Team"
Write-Bold "  =================================`n"

# --- Universal AGENTS.md ---
Copy-Item "$ApexDir\AGENTS.md" "$ProjectDir\AGENTS.md" -Force -ErrorAction SilentlyContinue
Write-Green "AGENTS.md (universal)"
$Summary += "✓ AGENTS.md"

# --- Claude Code ---
if (Has-Command claude) {
  $null = New-Item -ItemType Directory -Path "$ProjectDir\.claude\skills" -Force
  Copy-Item "$ApexDir\CLAUDE.md" "$ProjectDir\CLAUDE.md" -Force -ErrorAction SilentlyContinue
  if (Test-Path "$ApexDir\skills") { Copy-Item "$ApexDir\skills\*" "$ProjectDir\.claude\skills\" -Recurse -Force }
  Write-Green "Claude Code"
  $Summary += "✓ Claude Code"
} else {
  Write-Dim "Claude Code: not detected"
}

# --- Cursor ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.cursor\rules" -Force
Copy-Item "$ApexDir\.cursorrules" "$ProjectDir\.cursorrules" -Force -ErrorAction SilentlyContinue
Copy-Item "$ApexDir\.cursor\rules\*.mdc" "$ProjectDir\.cursor\rules\" -Force -ErrorAction SilentlyContinue
Write-Green "Cursor"
$Summary += "✓ Cursor"

# --- OpenCode ---
if (Has-Command opencode) {
  $null = New-Item -ItemType Directory -Path "$ProjectDir\.opencode\plugins" -Force
  Copy-Item "$ApexDir\opencode.json" "$ProjectDir\opencode.json" -Force -ErrorAction SilentlyContinue
  Copy-Item "$ApexDir\adapters\opencode\apex.mjs" "$ProjectDir\.opencode\plugins\apex.mjs" -Force -ErrorAction SilentlyContinue
  Write-Green "OpenCode"
  $Summary += "✓ OpenCode"
} else {
  Write-Dim "OpenCode: not detected"
}

# --- Cline / Kilo Code ---
Copy-Item "$ApexDir\.clinerules" "$ProjectDir\.clinerules" -Force -ErrorAction SilentlyContinue
Write-Green "Cline/Kilo"
$Summary += "✓ Cline/Kilo"

# --- GitHub Copilot ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.github" -Force
Copy-Item "$ApexDir\.github\copilot-instructions.md" "$ProjectDir\.github\copilot-instructions.md" -Force -ErrorAction SilentlyContinue
Write-Green "GitHub Copilot"
$Summary += "✓ GitHub Copilot"

# --- Windsurf ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.windsurf" -Force
Copy-Item "$ApexDir\.windsurf\rules.md" "$ProjectDir\.windsurf\rules.md" -Force -ErrorAction SilentlyContinue
Write-Green "Windsurf"
$Summary += "✓ Windsurf"

# --- Gemini CLI ---
if (Has-Command gemini) {
  Copy-Item "$ApexDir\gemini-extension.json" "$ProjectDir\gemini-extension.json" -Force -ErrorAction SilentlyContinue
  Write-Green "Gemini CLI"
  $Summary += "✓ Gemini CLI"
} else {
  Write-Dim "Gemini CLI: not detected"
}

# --- Skills ---
if (Test-Path "$ApexDir\skills") {
  $null = New-Item -ItemType Directory -Path "$ProjectDir\.claude\skills" -Force
  Copy-Item "$ApexDir\skills\*" "$ProjectDir\.claude\skills\" -Recurse -Force
  Write-Green "Skills (24 skills)"
  $Summary += "✓ Skills"
}

# --- Summary ---
Write-Bold "`n  === Summary ==="
foreach ($item in $Summary) { Write-Host "  $item" }

Write-Bold "`n  === Quick Start ==="
Write-Host @"
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
"@

Write-Bold "  === Marketplace Installs ==="
Write-Host @"
  Claude Code:  /plugin marketplace add asno-dev/apex
  Codex:        codex plugin marketplace add asno-dev/apex
  Gemini CLI:   gemini extensions install https://github.com/asno-dev/apex
  OpenCode:     add "@asno-dev/apex" to opencode.json plugins
"@
