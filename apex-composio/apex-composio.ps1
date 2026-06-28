#!/usr/bin/env pwsh
# APEX Composio CLI — for use by APEX agents
# Usage:
#   .\apex-composio.ps1 setup         Start the Composio webapp
#   .\apex-composio.ps1 status        Show API key + connected tools summary
#   .\apex-composio.ps1 connected     List only connected tools (for agents)
#   .\apex-composio.ps1 tools         List all available composio tools
#   .\apex-composio.ps1 exec <tool> <args-json>  Execute a composio tool via API

param(
  [Parameter(Position=0)]
  [string]$Command = "",
  [Parameter(Position=1)]
  [string]$Arg1 = "",
  [Parameter(Position=2)]
  [string]$Arg2 = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ApexDir = Split-Path -Parent $ScriptDir
$ConfigFile = Join-Path $ApexDir ".composio-config.json"
$node = "C:\Program Files\nodejs\node.exe"
$npm = "C:\Program Files\nodejs\npm.cmd"

function EnsureNodeModules {
  if (-not (Test-Path (Join-Path $ScriptDir "node_modules"))) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Push-Location $ScriptDir
    & $npm install --ignore-scripts 2>&1 | Out-Null
    & $node (Join-Path $ScriptDir "node_modules\esbuild\install.js") 2>&1 | Out-Null
    Pop-Location
  }
}

function ReadConfig {
  if (Test-Path $ConfigFile) {
    try {
      return Get-Content $ConfigFile -Raw | ConvertFrom-Json
    } catch { return $null }
  }
  return $null
}

# Try to get live status from the running server API
function GetLiveStatus {
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3001/api/apex/connected-tools" -Method GET -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    $data = $resp.Content | ConvertFrom-Json
    return $data
  } catch { return $null }
}

function Cmd-Setup {
  EnsureNodeModules

  # Show connected tools before starting
  $cfg = ReadConfig
  if ($cfg -and $cfg.connectedTools -and $cfg.connectedTools.Count -gt 0) {
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║   APEX Composio Tool Connectors                      ║" -ForegroundColor Cyan
    Write-Host "  ║                                                     ║" -ForegroundColor Cyan
    Write-Host "  ║   Already connected: $($cfg.connectedTools -join ', ')           ║" -ForegroundColor Green
    Write-Host "  ║   Use @$($cfg.connectedTools[0]) in chat to invoke                ║" -ForegroundColor Cyan
    if ($cfg.connectedTools.Count -gt 1) {
      Write-Host "  ║   or @$($cfg.connectedTools[1]) etc.                               ║" -ForegroundColor Cyan
    }
    Write-Host "  ║                                                     ║" -ForegroundColor Cyan
    Write-Host "  ║   Starting webapp for managing connections...        ║" -ForegroundColor Cyan
    Write-Host "  ╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
  } else {
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║   APEX Composio Tool Connectors                          ║" -ForegroundColor Cyan
    Write-Host "  ║                                                         ║" -ForegroundColor Cyan
    Write-Host "  ║   Connect external tools (Gmail, Drive, GitHub, Slack,  ║" -ForegroundColor Cyan
    Write-Host "  ║   Notion, Jira, Discord, Stripe, and 1000+ more)        ║" -ForegroundColor Cyan
    Write-Host "  ║                                                         ║" -ForegroundColor Cyan
    Write-Host "  ║   After connecting, use @toolName (e.g. @gmail, @drive) ║" -ForegroundColor Cyan
    Write-Host "  ║   to invoke tools directly in chat.                     ║" -ForegroundColor Cyan
    Write-Host "  ╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
  }

  $env:PATH = "C:\Program Files\nodejs;$env:PATH"
  & $node (Join-Path $ScriptDir "node_modules\tsx\dist\cli.mjs") (Join-Path $ScriptDir "server.ts")
}

function Cmd-Status {
  $config = ReadConfig
  $live = GetLiveStatus
  Write-Host ""
  Write-Host "  APEX Composio Status" -ForegroundColor Cyan
  Write-Host "  ─────────────────────" -ForegroundColor Cyan

  $toName = @{
    "gmail" = "Gmail"; "github" = "GitHub"; "slack" = "Slack";
    "google-drive" = "Google Drive"; "google-calendar" = "Google Calendar";
    "google-sheets" = "Google Sheets"; "notion" = "Notion";
    "jira" = "Jira"; "linear" = "Linear"; "discord" = "Discord";
    "stripe" = "Stripe"; "outlook" = "Outlook"; "zoom" = "Zoom";
    "hubspot" = "HubSpot"; "figma" = "Figma"; "twitter" = "Twitter";
    "linkedin" = "LinkedIn"; "shopify" = "Shopify"; "zendesk" = "Zendesk";
    "twilio" = "Twilio"; "spotify" = "Spotify"; "dropbox" = "Dropbox";
    "telegram" = "Telegram"; "whatsapp" = "WhatsApp"
  }

  if ($live) {
    if ($live.hasApiKey) { Write-Host "  API Key: ✓ set" -ForegroundColor Green }
    else { Write-Host "  API Key: NOT SET" -ForegroundColor Red }
    if ($live.connectedTools -and $live.connectedTools.Count -gt 0) {
      Write-Host "  Connected Tools: $($live.connectedTools.Count)" -ForegroundColor Green
      foreach ($t in $live.connectedTools) {
        $n = $toName[$t]
        if ($n) { Write-Host "    @$t".PadRight(28) -ForegroundColor White -NoNewline; Write-Host "$n" -ForegroundColor Green }
        else { Write-Host "    @$t" -ForegroundColor White }
      }
      Write-Host ""
      Write-Host "  Type @<tool> in chat to invoke (e.g. @$($live.connectedTools[0]))" -ForegroundColor Cyan
    } else {
      Write-Host "  Connected Tools: none" -ForegroundColor Yellow
      Write-Host "  → Open http://localhost:3001 to connect tools" -ForegroundColor Cyan
    }
  } elseif ($config) {
    $key = $config.apiKey
    $tools = $config.connectedTools
    if ($key) { Write-Host "  API Key: $($key.Substring(0, [Math]::Min(12, $key.Length)))..." -ForegroundColor Green }
    else { Write-Host "  API Key: NOT SET" -ForegroundColor Red }
    if ($tools -and $tools.Count -gt 0) {
      Write-Host "  Connected Tools: $($tools.Count)" -ForegroundColor Green
      foreach ($t in $tools) {
        $n = $toName[$t]
        if ($n) { Write-Host "    @$t".PadRight(28) -ForegroundColor White -NoNewline; Write-Host "$n" -ForegroundColor Green }
        else { Write-Host "    @$t" -ForegroundColor White }
      }
      Write-Host ""
      Write-Host "  Type @<tool> in chat to invoke (e.g. @$($tools[0]))" -ForegroundColor Cyan
    } else {
      Write-Host "  Connected Tools: none" -ForegroundColor Yellow
    }
  } else {
    Write-Host "  No config found. Run '.\apex-composio.ps1 setup'" -ForegroundColor Yellow
  }
  Write-Host ""
}

function Cmd-Connected {
  $live = GetLiveStatus
  $tools = @()
  if ($live -and $live.connectedTools) { $tools = $live.connectedTools }
  else {
    $config = ReadConfig
    if ($config -and $config.connectedTools) { $tools = $config.connectedTools }
  }
  if ($tools.Count -gt 0) {
    Write-Host "CONNECTED:$($tools -join ',')"
  } else {
    Write-Host "CONNECTED:"
  }
}

function Cmd-Tools {
  $tsFile = Join-Path $ScriptDir "src\lib\composioTools.ts"
  if (Test-Path $tsFile) {
    Write-Host ""
    Write-Host "  Available Composio Tools" -ForegroundColor Cyan
    Write-Host "  ────────────────────────" -ForegroundColor Cyan
    $content = Get-Content $tsFile -Raw
    $matches = [regex]::Matches($content, "slug:\s+'([^']+)'[\s\S]*?name:\s+'([^']+)'[\s\S]*?description:\s+'([^']+)'")
    foreach ($m in $matches) {
      $slug = $m.Groups[1].Value
      $name = $m.Groups[2].Value
      Write-Host "  @$slug".PadRight(30) -ForegroundColor White -NoNewline
      Write-Host "$name" -ForegroundColor Green
    }
    Write-Host ""
  } else {
    Write-Host "  Tool registry not found." -ForegroundColor Red
  }
}

function Cmd-Exec {
  $tool = $Arg1
  $argsJson = $Arg2
  if (-not $tool) {
    Write-Host "Usage: .\apex-composio.ps1 exec <tool> <args-json>"
    Write-Host "  tool       Tool slug (e.g. gmail, github)"
    Write-Host "  args-json  JSON string of arguments"
    Write-Host ""
    Write-Host "Example:"
    Write-Host "  .\apex-composio.ps1 exec gmail '{\"action\":\"send_email\",\"args\":{\"to\":\"test@test.com\",\"subject\":\"Hello\",\"body\":\"World\"}}'"
    return
  }

  $config = ReadConfig
  $apiKey = $config.apiKey
  $userId = $config.userId
  if (-not $apiKey) { Write-Host "Error: API key not set. Run setup first." -ForegroundColor Red; return }

  # Parse args - accept JSON string or build from remaining params
  $payload = @{ user_id = $userId }
  if ($argsJson) {
    try {
      $parsed = $argsJson | ConvertFrom-Json
      $payload.arguments = $parsed
    } catch {
      Write-Host "Error: Invalid JSON: $_" -ForegroundColor Red
      return
    }
  }

  try {
    $bodyJson = $payload | ConvertTo-Json -Compress
    $encodedSlug = [System.Uri]::EscapeDataString($tool)
    $url = "https://backend.composio.dev/api/v3.1/tools/execute/$encodedSlug"

    $headers = @{
      'Content-Type' = 'application/json'
      'x-api-key' = $apiKey
    }

    $response = Invoke-WebRequest -Uri $url -Method POST -Headers $headers -Body $bodyJson -UseBasicParsing -TimeoutSec 30
    $result = $response.Content | ConvertFrom-Json
    Write-Host ($result | ConvertTo-Json -Depth 10)
  } catch {
    Write-Host "Error: $_" -ForegroundColor Red
  }
}

switch ($Command.ToLower()) {
  "setup" { Cmd-Setup }
  "status" { Cmd-Status }
  "connected" { Cmd-Connected }
  "tools" { Cmd-Tools }
  "exec" { Cmd-Exec }
  default {
    Write-Host "APEX Composio Tool Connectors"
    Write-Host "Usage: .\apex-composio.ps1 <command> [args]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  setup         Start the Composio webapp (http://localhost:3001)"
    Write-Host "  status        Show API key + connected tools summary"
    Write-Host "  connected     List only connected tools (machine-readable)"
    Write-Host "  tools         List all available composio tools"
    Write-Host "  exec <tool> <json>  Execute a tool via Composio API"
  }
}
