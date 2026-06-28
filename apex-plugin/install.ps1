#Requires -Version 7.0
$ErrorActionPreference = 'Stop'
$ApexDir = Split-Path -Parent $PSCommandPath
$ProjectDir = Get-Location
$Summary = @()

function Write-Green($m) { Write-Host "  $m" -ForegroundColor Green }
function Write-Dim($m) { Write-Host "  $m" -ForegroundColor DarkGray }
function Has-Command($cmd) { Get-Command $cmd -ErrorAction SilentlyContinue }

Write-Host "`n  APEX v2 — Senior Engineering Team`n  ================================="

# --- Universal AGENTS.md ---
Copy-Item "$ApexDir\AGENTS.md" "$ProjectDir\AGENTS.md" -Force -ErrorAction SilentlyContinue
Write-Green "✓ AGENTS.md — universal config for all CLI agents"
$Summary += "✓ AGENTS.md"

# --- Claude Code ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.claude\agents", "$ProjectDir\.claude\skills", "$ProjectDir\.claude\sessions" -Force
Copy-Item "$ApexDir\CLAUDE.md" "$ProjectDir\CLAUDE.md" -Force -ErrorAction SilentlyContinue
Copy-Item "$ApexDir\.claude\agents\*.md" "$ProjectDir\.claude\agents\" -Force -ErrorAction SilentlyContinue
Get-ChildItem "$ApexDir\.claude\skills\*" -Directory -ErrorAction SilentlyContinue | ForEach-Object { Copy-Item $_.FullName "$ProjectDir\.claude\skills\" -Recurse -Force }
Copy-Item "$ApexDir\.claude\settings.json" "$ProjectDir\.claude\settings.json" -Force -ErrorAction SilentlyContinue
if (Test-Path "$ApexDir\docs") { Copy-Item "$ApexDir\docs" "$ProjectDir\" -Recurse -Force }
if (Has-Command claude) {
  Write-Green "✓ Claude Code: CLAUDE.md + .claude/ + docs/ installed"
  $Summary += "✓ Claude Code"
  $null = claude plugin add "$ApexDir" 2>$null
} else {
  Write-Dim "~ Claude Code: files written (tool not detected)"
  $Summary += "~ Claude Code (fallback)"
}

# --- Cursor ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.cursor\rules" -Force
Copy-Item "$ApexDir\.cursorrules" "$ProjectDir\.cursorrules" -Force -ErrorAction SilentlyContinue
Copy-Item "$ApexDir\.cursor\rules\*.mdc" "$ProjectDir\.cursor\rules\" -Force -ErrorAction SilentlyContinue
if (Has-Command cursor) {
  Write-Green "✓ Cursor: rules installed"
  $Summary += "✓ Cursor"
} else {
  Write-Dim "~ Cursor: .cursorrules + .cursor/rules/ written (tool not detected)"
  $Summary += "~ Cursor (fallback)"
}

# --- OpenCode ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.opencode\plugins", "$ProjectDir\.opencode\command" -Force
Copy-Item "$ApexDir\opencode.json" "$ProjectDir\opencode.json" -Force -ErrorAction SilentlyContinue
Copy-Item "$ApexDir\.opencode\plugins\apex.mjs" "$ProjectDir\.opencode\plugins\apex.mjs" -Force -ErrorAction SilentlyContinue
Copy-Item "$ApexDir\.opencode\command\*.md" "$ProjectDir\.opencode\command\" -Force -ErrorAction SilentlyContinue
if (Has-Command opencode) {
  Write-Green "✓ OpenCode: plugin installed"
  $Summary += "✓ OpenCode"
} else {
  Write-Dim "~ OpenCode: plugin files written (tool not detected)"
  $Summary += "~ OpenCode (fallback)"
}

# --- Cline / Kilo Code ---
Copy-Item "$ApexDir\.clinerules" "$ProjectDir\.clinerules" -Force -ErrorAction SilentlyContinue
Write-Green "✓ Cline/Kilo Code: .clinerules written"
$Summary += "✓ Cline/Kilo"

# --- GitHub Copilot ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.github" -Force
Copy-Item "$ApexDir\.github\copilot-instructions.md" "$ProjectDir\.github\copilot-instructions.md" -Force -ErrorAction SilentlyContinue
Write-Green "✓ GitHub Copilot: instructions written"
$Summary += "✓ GitHub Copilot"

# --- Windsurf ---
$null = New-Item -ItemType Directory -Path "$ProjectDir\.windsurf" -Force
Copy-Item "$ApexDir\.windsurf\rules.md" "$ProjectDir\.windsurf\rules.md" -Force -ErrorAction SilentlyContinue
Write-Green "✓ Windsurf: rules written"
$Summary += "✓ Windsurf"

# --- OfficeCLI ---
try {
  Write-Dim "~ Installing OfficeCLI..."
  $ocResult = powershell -Command "irm https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.ps1 | iex" 2>&1
  Write-Green "✓ OfficeCLI installed"
  $Summary += "✓ OfficeCLI"
} catch {
  Write-Dim "~ OfficeCLI: download failed (install manually from https://officecli.ai)"
  $Summary += "~ OfficeCLI (manual)"
}

# --- Mirage (TypeScript CLI) ---
if (Has-Command npm) {
  try {
    npm install -g @struktoai/mirage-cli --silent 2>$null
    Write-Green "✓ Mirage CLI (TypeScript)"
    $Summary += "✓ Mirage TS"
  } catch {
    Write-Dim "~ Mirage TS: npm install failed"
    $Summary += "~ Mirage TS (manual)"
  }
} else {
  Write-Dim "~ Mirage TS: npm not found (install Node.js 20+)"
  $Summary += "~ Mirage TS (npm missing)"
}

# --- Mirage (Python SDK) ---
if (Has-Command pip) {
  try {
    pip install mirage-ai -q 2>$null
    Write-Green "✓ Mirage Python SDK"
    $Summary += "✓ Mirage Py"
  } catch {
    Write-Dim "~ Mirage Py: pip install failed"
    $Summary += "~ Mirage Py (manual)"
  }
} elseif (Has-Command uv) {
  try {
    uv add mirage-ai -q 2>$null
    Write-Green "✓ Mirage Python SDK (uv)"
    $Summary += "✓ Mirage Py"
  } catch {
    Write-Dim "~ Mirage Py: uv add failed"
    $Summary += "~ Mirage Py (manual)"
  }
} else {
  Write-Dim "~ Mirage Py: Python/pip not found (Python 3.11+ required)"
  $Summary += "~ Mirage Py (Python missing)"
}

# --- Global ~/.apex/ store ---
$null = New-Item -ItemType Directory -Path "$HOME\.apex" -Force
Copy-Item "$ApexDir\AGENTS.md" "$HOME\.apex\AGENTS.md" -Force -ErrorAction SilentlyContinue
Copy-Item "$ApexDir\CLAUDE.md" "$HOME\.apex\CLAUDE.md" -Force -ErrorAction SilentlyContinue
Copy-Item "$ApexDir\.cursorrules" "$HOME\.apex\.cursorrules" -Force -ErrorAction SilentlyContinue
Write-Green "✓ Global configs stored in ~/.apex/"
$Summary += "✓ Global ~/.apex/"

Write-Host "`n  === Summary ==="
foreach ($item in $Summary) { Write-Host "  $item" }

Write-Host @"

  === OfficeCLI (Word, Excel, PowerPoint) ===
  /docs create a report               → OfficeCLI Word document
  /excel build a budget               → OfficeCLI Excel spreadsheet
  /ppt make a presentation            → OfficeCLI PowerPoint deck
  @docs / @excel / @ppt               → Alias shortcuts

  === Mirage (Unified Virtual File System) ===
  /mirage cp /s3/file.csv /data/      → Copy across backends
  /mirage grep error /slack/channels/  → Search across services

  Modes: /apex team | /apex select a,b | /apex off | /apex status
"@
