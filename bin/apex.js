#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();
const APEX = path.join(CWD, 'apex');

function mkdir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function copy(s, d) { try { if (!fs.existsSync(s)) return; mkdir(path.dirname(d)); fs.copyFileSync(s, d); } catch {} }
function copyDir(s, d, skip = true) {
  try { if (!fs.existsSync(s)) return; mkdir(d);
    for (const e of fs.readdirSync(s, { withFileTypes: true })) {
      if (skip && e.name === 'node_modules') continue;
      const sp = path.join(s, e.name), dp = path.join(d, e.name);
      e.isDirectory() ? copyDir(sp, dp, skip) : copy(sp, dp);
    }
  } catch {}
}
function read(p) { try { return fs.readFileSync(p, 'utf-8'); } catch { return null; } }
function write(p, c) { mkdir(path.dirname(p)); fs.writeFileSync(p, c, 'utf-8'); }

function fixPaths(c) {
  if (!c) return c; let r = c;
  r = r.replace(/"src\/(hands|mirage|composio)-server\.mjs"/g, '"apex/src/$1-server.mjs"');
  r = r.replace(/args = \["src\/(hands|mirage|composio)-server\.mjs"\]/g, 'args = ["apex/src/$1-server.mjs"]');
  r = r.replace(/"command": "node src\/(hands|mirage|composio)-server\.mjs"/g, '"command": "node apex/src/$1-server.mjs"');
  r = r.replace(/command: \["node", "src\/(hands|mirage|composio)-server\.mjs"\]/g, 'command: ["node", "apex/src/$1-server.mjs"]');
  return r;
}
function copyFixed(s, d) { const c = read(s); if (c) write(d, fixPaths(c)); }

const AGENTS = [
  { id: 'claude-code', dir: '.claude', label: 'Claude Code', install: 'npx @asno-dev/apex claude-code' },
  { id: 'gemini', dir: '.gemini', label: 'Gemini CLI', install: 'npx @asno-dev/apex gemini' },
  { id: 'antigravity', dir: '', label: 'Antigravity', install: 'npx @asno-dev/apex antigravity' },
  { id: 'codex', dir: '.codex', label: 'Codex CLI', install: 'npx @asno-dev/apex codex' },
  { id: 'cursor', dir: '.cursor', label: 'Cursor', install: 'npx @asno-dev/apex cursor' },
  { id: 'opencode', dir: '.opencode', label: 'OpenCode', install: 'npx @asno-dev/apex opencode' },
  { id: 'cline', dir: '.cline', label: 'Cline / Kilo', install: 'npx @asno-dev/apex cline' },
  { id: 'kilocode', dir: '.kilo', label: 'KiloCode / Kiro', install: 'npx @asno-dev/apex kilocode' },
  { id: 'devin', dir: '', label: 'Devin CLI', install: 'npx @asno-dev/apex devin' },
  { id: 'hermes', dir: '', label: 'Hermes Agent', install: 'npx @asno-dev/apex hermes' },
  { id: 'pi', dir: '', label: 'Pi Agent Harness', install: 'npx @asno-dev/apex pi' },
  { id: 'openclaw', dir: '', label: 'OpenClaw', install: 'npx @asno-dev/apex openclaw' },
  { id: 'copilot', dir: '', label: 'GitHub Copilot CLI', install: 'npx @asno-dev/apex copilot' },
];

const installers = {
  // ── Plugin-based (full feature support) ──
  'claude-code': () => {
    const d = path.join(CWD, '.claude'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands')); mkdir(path.join(d, 'hooks'));
    copyFixed(path.join(ROOT, 'adapters/claude-code/plugin.json'), path.join(d, 'plugin.json'));
    copy(path.join(ROOT, 'adapters/claude-code/hooks.json'), path.join(d, 'hooks.json'));
    copyDir(path.join(ROOT, 'hooks'), path.join(d, 'hooks'));
    copyDir(path.join(ROOT, 'adapters/claude-code/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/claude-code/commands'), path.join(d, 'commands'));
    return true;
  },
  'gemini': () => {
    const d = path.join(CWD, '.gemini'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/gemini/extension.json'), path.join(d, 'extension.json'));
    copy(path.join(ROOT, 'AGENTS.md'), path.join(d, 'AGENTS.md'));
    copyDir(path.join(ROOT, 'adapters/gemini/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/gemini/commands'), path.join(d, 'commands'));
    return true;
  },
  'codex': () => {
    const d = path.join(CWD, '.codex'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'agents'));
    copyFixed(path.join(ROOT, 'adapters/codex/plugin.json'), path.join(d, 'plugin.json'));
    copyFixed(path.join(ROOT, 'adapters/codex/mcp.toml'), path.join(d, 'mcp.toml'));
    copy(path.join(ROOT, 'adapters/codex/SKILLS.md'), path.join(d, 'SKILLS.md'));
    copyDir(path.join(ROOT, 'adapters/codex/agents'), path.join(d, 'agents'));
    return true;
  },
  'opencode': () => {
    const agentsTarget = path.join(CWD, '.opencode/agents');
    if (fs.existsSync(agentsTarget)) fs.rmSync(agentsTarget, { recursive: true, force: true });
    copyFixed(path.join(ROOT, 'opencode.json'), path.join(CWD, 'opencode.json'));
    const plugin = path.join(ROOT, 'adapters/opencode/apex.mjs');
    if (fs.existsSync(plugin)) copy(plugin, path.join(CWD, 'adapters/opencode/apex.mjs'));
    const agentsDir = path.join(ROOT, '.opencode/agents');
    if (fs.existsSync(agentsDir)) copyDir(agentsDir, path.join(CWD, '.opencode/agents'));
    return true;
  },
  // ── Rule-based (MCP + rules) ──
  'cursor': () => {
    const d = path.join(CWD, '.cursor'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'rules')); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, '.mcp.json'), path.join(d, 'mcp.json'));
    copy(path.join(ROOT, 'adapters/cursor/rules/apex.mdc'), path.join(d, 'rules/apex.mdc'));
    copyDir(path.join(ROOT, 'adapters/cursor/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/cursor/commands'), path.join(d, 'commands'));
    return true;
  },
  'cline': () => {
    const d = path.join(CWD, '.cline'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'rules')); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/cline/mcp.json'), path.join(d, 'mcp.json'));
    copy(path.join(ROOT, 'adapters/cline/rules/apex.mdc'), path.join(d, 'rules/apex.mdc'));
    copyDir(path.join(ROOT, 'adapters/cline/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/cline/commands'), path.join(d, 'commands'));
    copy(path.join(ROOT, '.clinerules'), path.join(CWD, '.clinerules'));
    return true;
  },
  'antigravity': () => {
    const files = ['antigravity-extension.json'];
    files.forEach(f => { const p = path.join(CWD, f); if (fs.existsSync(p)) fs.rmSync(p); });
    const src = path.join(ROOT, 'adapters/antigravity/extension.json');
    if (fs.existsSync(src)) copyFixed(src, path.join(CWD, 'antigravity-extension.json'));
    copy(path.join(ROOT, 'AGENTS.md'), path.join(CWD, 'AGENTS.md'));
    return true;
  },
  'devin': () => {
    const d = path.join(CWD, '.devin'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/devin/plugin.json'), path.join(d, 'plugin.json'));
    copyDir(path.join(ROOT, 'adapters/devin/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/devin/commands'), path.join(d, 'commands'));
    return true;
  },
  'hermes': () => {
    const d = path.join(CWD, '.hermes'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/hermes/plugin.json'), path.join(d, 'plugin.json'));
    copyDir(path.join(ROOT, 'adapters/hermes/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/hermes/commands'), path.join(d, 'commands'));
    return true;
  },
  'pi': () => {
    const d = path.join(CWD, '.pi'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copy(path.join(ROOT, 'adapters/pi/package.json'), path.join(d, 'package.json'));
    copy(path.join(ROOT, 'adapters/pi/index.js'), path.join(d, 'index.js'));
    copyDir(path.join(ROOT, 'adapters/pi/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/pi/commands'), path.join(d, 'commands'));
    return true;
  },
  'openclaw': () => {
    const d = path.join(CWD, '.openclaw'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); mkdir(path.join(d, 'skills')); mkdir(path.join(d, 'commands'));
    copyDir(path.join(ROOT, 'adapters/openclaw/skills'), path.join(d, 'skills'));
    copyDir(path.join(ROOT, 'adapters/openclaw/commands'), path.join(d, 'commands'));
    return true;
  },
  'copilot': () => {
    const copilotDir = path.join(CWD, '.github');
    const copilotFile = path.join(copilotDir, 'copilot-instructions.md');
    if (fs.existsSync(copilotFile)) fs.rmSync(copilotFile);
    const d = path.join(CWD, '.copilot'); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    mkdir(copilotDir);
    copy(path.join(ROOT, 'adapters/copilot/copilot-instructions.md'), path.join(copilotDir, 'copilot-instructions.md'));
    mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/copilot/plugin.json'), path.join(d, 'plugin.json'));
    copyDir(path.join(ROOT, 'adapters/copilot/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/copilot/commands'), path.join(d, 'commands'));
    return true;
  },
  'kilocode': () => {
    const d = path.join(CWD, '.kilo');
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    mkdir(path.join(d, 'steering')); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/kilocode/mcp.json'), path.join(d, 'mcp.json'));
    copy(path.join(ROOT, 'adapters/kilocode/steering/apex.md'), path.join(d, 'steering/apex.md'));
    copyDir(path.join(ROOT, 'adapters/kilocode/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/kilocode/commands'), path.join(d, 'commands'));
    return true;
  },
};

// ── Shared files ──
function installShared() {
  mkdir(APEX);
  copy(path.join(ROOT, 'AGENTS.md'), path.join(APEX, 'AGENTS.md'));
  copyFixed(path.join(ROOT, '.mcp.json'), path.join(APEX, '.mcp.json'));
  copyDir(path.join(ROOT, 'skills'), path.join(APEX, 'skills'));
  copyDir(path.join(ROOT, 'src'), path.join(APEX, 'src'));
  copyDir(path.join(ROOT, 'adapters'), path.join(APEX, 'adapters'));
  copyDir(path.join(ROOT, 'agents'), path.join(APEX, 'agents'));
  copyDir(path.join(ROOT, 'commands'), path.join(APEX, 'commands'));
  copyDir(path.join(ROOT, '.opencode'), path.join(APEX, '.opencode'));
  copy(path.join(ROOT, '.clinerules'), path.join(APEX, '.clinerules'));
  copy(path.join(ROOT, 'opencode.json'), path.join(APEX, 'opencode.json'));
  if (fs.existsSync(path.join(ROOT, 'hooks'))) copyDir(path.join(ROOT, 'hooks'), path.join(APEX, 'hooks'));
  copyFixed(path.join(ROOT, '.mcp.json'), path.join(CWD, '.mcp.json'));
  copy(path.join(ROOT, 'AGENTS.md'), path.join(CWD, 'AGENTS.md'));
}

// ── CLI ──
const arg = process.argv[2];

function showHelp() {
  console.log('\n  APEX v2 — 10-Agent Senior Engineering Team\n');
  console.log('  Usage:\n');
  console.log('    npx @asno-dev/apex              Install shared APEX files (apex/ folder)');
  console.log('    npx @asno-dev/apex <agent>      Install APEX for a specific agent');
  console.log('    npx @asno-dev/apex list         Show supported agents\n');
  console.log('  Agents:\n');
  for (const a of AGENTS) {
    const label = a.label.padEnd(24);
    console.log(`    ${a.install}`);
  }
  console.log('\n  Or visit https://github.com/asno-dev/apex for per-agent install docs\n');
}

if (!arg || arg === 'help' || arg === '--help' || arg === '-h') {
  showHelp();
  process.exit(0);
}

if (arg === 'list') {
  console.log('\n  Supported agents:\n');
  for (const a of AGENTS) {
    console.log(`    ${a.label.padEnd(24)} ${a.id}`);
  }
  console.log();
  process.exit(0);
}

// Install shared files always
installShared();
console.log('  ✓ Shared APEX files → apex/');

// Install for specific agent
if (installers[arg]) {
  try {
    installers[arg]();
    console.log(`  ✓ APEX configured for ${arg}`);
    process.exit(0);
  } catch (e) {
    console.log(`  ✗ ${arg}: ${e.message}`);
    process.exit(1);
  }
}

// If no agent matched but arg was given, list options
console.log(`  ✗ Unknown agent: ${arg}`);
console.log('  Supported: ' + AGENTS.map(a => a.id).join(', '));
process.exit(1);
