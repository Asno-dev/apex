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

// ── Shared files ──
console.log('\n  APEX v2 — Installing...\n');
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
console.log('  ✓ Shared APEX files → apex/');

// ── Agent installers ──
const install = {
  'claude-code': () => {
    const d = path.join(CWD, '.claude'); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands')); mkdir(path.join(d, 'hooks'));
    copyFixed(path.join(ROOT, 'adapters/claude-code/plugin.json'), path.join(d, 'plugin.json'));
    copy(path.join(ROOT, 'adapters/claude-code/hooks.json'), path.join(d, 'hooks.json'));
    copyDir(path.join(ROOT, 'hooks'), path.join(d, 'hooks'));
    copyDir(path.join(ROOT, 'adapters/claude-code/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/claude-code/commands'), path.join(d, 'commands'));
    return '.claude/ (plugin, agents, commands, hooks, MCP)';
  },
  'gemini': () => {
    const d = path.join(CWD, '.gemini'); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/gemini/extension.json'), path.join(d, 'extension.json'));
    copy(path.join(ROOT, 'AGENTS.md'), path.join(d, 'AGENTS.md'));
    copyDir(path.join(ROOT, 'adapters/gemini/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/gemini/commands'), path.join(d, 'commands'));
    return '.gemini/ (extension, agents, commands, MCP)';
  },
  'codex': () => {
    const d = path.join(CWD, '.codex'); mkdir(path.join(d, 'agents'));
    copyFixed(path.join(ROOT, 'adapters/codex/plugin.json'), path.join(d, 'plugin.json'));
    copyFixed(path.join(ROOT, 'adapters/codex/mcp.toml'), path.join(d, 'mcp.toml'));
    copy(path.join(ROOT, 'adapters/codex/SKILLS.md'), path.join(d, 'SKILLS.md'));
    copyDir(path.join(ROOT, 'adapters/codex/agents'), path.join(d, 'agents'));
    return '.codex/ (plugin, agents, MCP, skills)';
  },
  'opencode': () => {
    mkdir(path.join(CWD, 'adapters/opencode'));
    copyFixed(path.join(ROOT, 'opencode.json'), path.join(CWD, 'opencode.json'));
    const plugin = path.join(ROOT, 'adapters/opencode/apex.mjs');
    if (fs.existsSync(plugin)) copy(plugin, path.join(CWD, 'adapters/opencode/apex.mjs'));
    const agentsDir = path.join(ROOT, '.opencode/agents');
    if (fs.existsSync(agentsDir)) copyDir(agentsDir, path.join(CWD, '.opencode/agents'));
    return 'opencode.json + adapters/opencode/apex.mjs + .opencode/agents/';
  },
  'antigravity': () => {
    const src = path.join(ROOT, 'adapters/antigravity/extension.json');
    if (fs.existsSync(src)) copyFixed(src, path.join(CWD, 'antigravity-extension.json'));
    copy(path.join(ROOT, 'AGENTS.md'), path.join(CWD, 'AGENTS.md'));
    return 'antigravity-extension.json + AGENTS.md';
  },
  'cursor': () => {
    const d = path.join(CWD, '.cursor'); mkdir(path.join(d, 'rules')); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, '.mcp.json'), path.join(d, 'mcp.json'));
    copy(path.join(ROOT, 'adapters/cursor/rules/apex.mdc'), path.join(d, 'rules/apex.mdc'));
    copyDir(path.join(ROOT, 'adapters/cursor/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/cursor/commands'), path.join(d, 'commands'));
    return '.cursor/ (MCP, rules, agents, commands)';
  },
  'cline': () => {
    const d = path.join(CWD, '.cline'); mkdir(path.join(d, 'rules')); mkdir(path.join(d, 'agents')); mkdir(path.join(d, 'commands'));
    copyFixed(path.join(ROOT, 'adapters/cline/mcp.json'), path.join(d, 'mcp.json'));
    copy(path.join(ROOT, 'adapters/cline/rules/apex.mdc'), path.join(d, 'rules/apex.mdc'));
    copyDir(path.join(ROOT, 'adapters/cline/agents'), path.join(d, 'agents'));
    copyDir(path.join(ROOT, 'adapters/cline/commands'), path.join(d, 'commands'));
    copy(path.join(ROOT, '.clinerules'), path.join(CWD, '.clinerules'));
    return '.cline/ (MCP, rules, agents, commands) + .clinerules';
  },
};

// ── Detection ──
function has(cmd) { try { require('child_process').execSync(process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`, { stdio: 'ignore', timeout: 3000 }); return true; } catch { return false; } }
function dir(p) { try { return fs.existsSync(p) && fs.statSync(p).isDirectory(); } catch { return false; } }
const HOME = process.env.HOME || process.env.USERPROFILE;

const agents = [
  { id: 'claude-code', name: 'Claude Code', detect: () => has('claude') || dir(path.join(HOME, '.claude')) },
  { id: 'cursor', name: 'Cursor', detect: () => has('cursor') || dir(path.join(HOME, '.cursor')) },
  { id: 'cline', name: 'Cline / Kilo', detect: () => dir(path.join(HOME, '.cline')) || dir(path.join(HOME, '.kilo')) },
  { id: 'gemini', name: 'Gemini CLI', detect: () => has('gemini') || dir(path.join(HOME, '.gemini')) },
  { id: 'codex', name: 'Codex CLI', detect: () => has('codex') || dir(path.join(HOME, '.codex')) },
  { id: 'opencode', name: 'OpenCode', detect: () => has('opencode') || dir(path.join(HOME, '.opencode')) },
  { id: 'antigravity', name: 'Antigravity', detect: () => has('agy') || dir(path.join(HOME, '.antigravity')) },
];

const detected = agents.filter(a => { try { return a.detect(); } catch { return false; } });
if (detected.length === 0) {
  console.log('  ✗ No supported coding agents detected.');
  console.log('  Install one of: Claude Code, Cursor, Cline/Kilo, Gemini CLI, Codex CLI, OpenCode, Antigravity\n');
  process.exit(1);
}

console.log(`  Detected: ${detected.map(a => a.name).join(', ')}\n`);

for (const agent of detected) {
  try {
    const info = install[agent.id]();
    console.log(`  ✓ ${agent.name} — ${info}`);
  } catch (e) {
    console.log(`  ✗ ${agent.name} — ${e.message}`);
  }
}

console.log(`\n  Done. APEX files: ${APEX}/\n`);
console.log('  @arch refactor  |  @ui design  |  @debug fix  |  @perf optimize');
console.log('  @sec audit     |  @infra deploy |  @nova ideate |  @reed research');
console.log('  @review check  |  @flex scope\n');
