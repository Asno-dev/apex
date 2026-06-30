#!/usr/bin/env node
// APEX v2 — Interactive Installer
// Usage: npx @asno-dev/apex
// Auto-detects agents, lets you pick, installs everything.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const APEX_DIR = path.resolve(__dirname, '..');
const HOME = process.env.HOME || process.env.USERPROFILE;
const CWD = process.cwd();

// ─── Colors ─────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', white: '\x1b[37m',
};
function log(color, msg) { process.stdout.write(`${color}${msg}${c.reset}\n`); }
function ok(msg) { log(c.green, `  ✓ ${msg}`); }
function warn(msg) { log(c.yellow, `  ⚠ ${msg}`); }
function err(msg) { log(c.red, `  ✗ ${msg}`); }

// ─── File Helpers ───────────────────────────────────────────
function mkdir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function copy(src, dest) {
  try {
    if (!fs.existsSync(src)) return false;
    mkdir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    return true;
  } catch { return false; }
}
function copyDir(src, dest) {
  try {
    if (!fs.existsSync(src)) return false;
    mkdir(dest);
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, e.name), d = path.join(dest, e.name);
      e.isDirectory() ? copyDir(s, d) : copy(s, d);
    }
    return true;
  } catch { return false; }
}
function hasCommand(cmd) {
  if (!cmd) return false;
  try {
    const check = process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`;
    execSync(check, { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch { return false; }
}
function dirExists(p) {
  try { return fs.existsSync(p) && fs.statSync(p).isDirectory(); } catch { return false; }
}
function fileExists(p) {
  try { return fs.existsSync(p) && fs.statSync(p).isFile(); } catch { return false; }
}

// ─── Agent Definitions ──────────────────────────────────────
// Each agent has: id, name, icon, detect (how to find it), install (what to copy)
const AGENTS = [
  {
    id: 'claude-code', name: 'Claude Code', icon: '🟣',
    detect: () => hasCommand('claude') || dirExists(path.join(HOME, '.claude')),
    install: (dest) => {
      const d = path.join(dest, '.claude');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/claude-code/plugin.json'), path.join(d, 'plugin.json'));
      copy(path.join(APEX_DIR, 'adapters/claude-code/hooks.json'), path.join(d, 'hooks.json'));
      mkdir(path.join(d, 'agents')); copyDir(path.join(APEX_DIR, 'adapters/claude-code/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'commands')); copyDir(path.join(APEX_DIR, 'adapters/claude-code/commands'), path.join(d, 'commands'));
      // Skills
      const skillsDir = path.join(APEX_DIR, 'skills');
      if (dirExists(skillsDir)) { mkdir(path.join(d, 'skills')); copyDir(skillsDir, path.join(d, 'skills')); }
      return '10 agents, 8 commands, 25 skills, 3 MCP servers';
    }
  },
  {
    id: 'cursor', name: 'Cursor', icon: '🔵',
    detect: () => hasCommand('cursor') || dirExists(path.join(HOME, '.cursor')),
    install: (dest) => {
      const d = path.join(dest, '.cursor');
      mkdir(d);
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(d, 'mcp.json'));
      mkdir(path.join(d, 'rules')); copy(path.join(APEX_DIR, 'adapters/cursor/rules/apex.mdc'), path.join(d, 'rules/apex.mdc'));
      mkdir(path.join(d, 'agents')); copyDir(path.join(APEX_DIR, 'adapters/cursor/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'commands')); copyDir(path.join(APEX_DIR, 'adapters/cursor/commands'), path.join(d, 'commands'));
      return '10 agents, 8 commands, MCP servers';
    }
  },
  {
    id: 'windsurf', name: 'Windsurf', icon: '🟠',
    detect: () => hasCommand('windsurf') || dirExists(path.join(HOME, '.windsurf')),
    install: (dest) => {
      const d = path.join(dest, '.windsurf');
      mkdir(d);
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(d, 'mcp.json'));
      mkdir(path.join(d, 'rules')); copy(path.join(APEX_DIR, 'adapters/windsurf/rules/apex.md'), path.join(d, 'rules/apex.md'));
      mkdir(path.join(d, 'agents')); copyDir(path.join(APEX_DIR, 'adapters/windsurf/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'workflows')); copyDir(path.join(APEX_DIR, 'adapters/windsurf/workflows'), path.join(d, 'workflows'));
      return '10 agents, 8 workflows, MCP servers';
    }
  },
  {
    id: 'cline', name: 'Cline / Kilo Code', icon: '🟢',
    detect: () => {
      if (dirExists(path.join(HOME, '.cline')) || dirExists(path.join(HOME, '.kilo'))) return true;
      // Check VS Code extensions
      const vscodeDir = path.join(HOME, '.vscode', 'extensions');
      if (dirExists(vscodeDir)) {
        try {
          const exts = fs.readdirSync(vscodeDir);
          if (exts.some(e => e.startsWith('cline'))) return true;
        } catch {}
      }
      return false;
    },
    install: (dest) => {
      copy(path.join(APEX_DIR, '.clinerules'), path.join(dest, '.clinerules'));
      return '.clinerules (project root)';
    }
  },
  {
    id: 'copilot', name: 'GitHub Copilot', icon: '⚪',
    detect: () => hasCommand('gh') || dirExists(path.join(HOME, '.github')),
    install: (dest) => {
      const d = path.join(dest, '.github');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/copilot/instructions.md'), path.join(d, 'copilot-instructions.md'));
      return '.github/copilot-instructions.md';
    }
  },
  {
    id: 'gemini', name: 'Gemini CLI', icon: '🔴',
    detect: () => hasCommand('gemini') || dirExists(path.join(HOME, '.gemini')),
    install: (dest) => {
      const d = path.join(dest, '.gemini');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/gemini/extension.json'), path.join(d, 'extension.json'));
      copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(d, 'AGENTS.md'));
      mkdir(path.join(d, 'agents')); copyDir(path.join(APEX_DIR, 'adapters/gemini/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'commands')); copyDir(path.join(APEX_DIR, 'adapters/gemini/commands'), path.join(d, 'commands'));
      return '10 agents, 8 commands, extension.json';
    }
  },
  {
    id: 'codex', name: 'Codex CLI', icon: '🟡',
    detect: () => hasCommand('codex') || dirExists(path.join(HOME, '.codex')),
    install: (dest) => {
      const d = path.join(dest, '.codex');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/codex/plugin.json'), path.join(d, 'plugin.json'));
      copy(path.join(APEX_DIR, 'adapters/codex/mcp.toml'), path.join(d, 'mcp.toml'));
      copy(path.join(APEX_DIR, 'adapters/codex/SKILLS.md'), path.join(d, 'SKILLS.md'));
      mkdir(path.join(d, 'agents')); copyDir(path.join(APEX_DIR, 'adapters/codex/agents'), path.join(d, 'agents'));
      return '10 agents, plugin.json, mcp.toml';
    }
  },
  {
    id: 'devin', name: 'Devin', icon: '🟤',
    detect: () => hasCommand('devin') || dirExists(path.join(HOME, '.devin')),
    install: (dest) => {
      const d = path.join(dest, '.devin');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/devin/plugin.yaml'), path.join(d, 'plugin.yaml'));
      copy(path.join(APEX_DIR, 'adapters/devin/mcp.json'), path.join(d, 'mcp.json'));
      mkdir(path.join(d, 'agents'));
      for (const a of ['arch','ui','debug','perf','sec','infra','nova','reed','review','flex']) {
        const ad = path.join(d, 'agents', a); mkdir(ad);
        const src = path.join(APEX_DIR, `adapters/devin/agents/${a}/AGENT.md`);
        if (fileExists(src)) copy(src, path.join(ad, 'AGENT.md'));
      }
      return '10 agents, plugin.yaml, mcp.json';
    }
  },
  {
    id: 'hermes', name: 'Hermes', icon: '🩷',
    detect: () => hasCommand('hermes') || dirExists(path.join(HOME, '.hermes')),
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/hermes/apex-features.yaml'), path.join(dest, 'hermes-apex.yaml'));
      const d = path.join(dest, '.hermes'); mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/hermes/plugin.yaml'), path.join(d, 'plugin.yaml'));
      return 'plugin.yaml, apex-features.yaml';
    }
  },
  {
    id: 'opencode', name: 'OpenCode', icon: '🔷',
    detect: () => hasCommand('opencode') || dirExists(path.join(HOME, '.opencode')),
    install: (dest) => {
      copy(path.join(APEX_DIR, 'opencode.json'), path.join(dest, 'opencode.json'));
      // Copy plugin file
      mkdir(path.join(dest, 'adapters', 'opencode'));
      copy(path.join(APEX_DIR, 'adapters/opencode/apex.mjs'), path.join(dest, 'adapters/opencode/apex.mjs'));
      return 'opencode.json, plugin, agents';
    }
  },
  {
    id: 'kiro', name: 'Kiro', icon: '⬛',
    detect: () => dirExists(path.join(HOME, '.kiro')),
    install: (dest) => {
      const d = path.join(dest, '.kiro', 'steering'); mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/kiro/apex.md'), path.join(d, 'apex.md'));
      return '.kiro/steering/apex.md';
    }
  },
  {
    id: 'pi', name: 'Pi Agent', icon: '🟪',
    detect: () => hasCommand('pi') || dirExists(path.join(HOME, '.pi')),
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/pi/extension.json'), path.join(dest, 'pi-extension.json'));
      copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(dest, 'AGENTS.md'));
      return 'extension.json, AGENTS.md';
    }
  },
  {
    id: 'antigravity', name: 'Antigravity', icon: '✳️',
    detect: () => hasCommand('agy') || dirExists(path.join(HOME, '.antigravity')),
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/antigravity/extension.json'), path.join(dest, 'antigravity-extension.json'));
      copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(dest, 'AGENTS.md'));
      return 'extension.json, AGENTS.md';
    }
  },
  {
    id: 'openclaw', name: 'OpenClaw', icon: '🦞',
    detect: () => hasCommand('clawhub'),
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/openclaw/package.json'), path.join(dest, 'openclaw-package.json'));
      copy(path.join(APEX_DIR, 'adapters/openclaw/apex.md'), path.join(dest, 'openclaw-apex.md'));
      return 'package.json, apex.md';
    }
  },
  {
    id: 'codewhale', name: 'CodeWhale', icon: '🐋',
    detect: () => false, // No known detection method
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/codewhale/AGENTS.md'), path.join(dest, 'AGENTS.md'));
      return 'AGENTS.md';
    }
  },
  {
    id: 'swival', name: 'Swival', icon: '🐎',
    detect: () => hasCommand('swival'),
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/swival/apex.md'), path.join(dest, 'swival-apex-skill.md'));
      const d = path.join(dest, '.swival'); mkdir(d);
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(d, 'mcp.json'));
      return 'apex.md, .swival/mcp.json';
    }
  },
];

// ─── Interactive Picker ─────────────────────────────────────
function picker(options, prompt, preSelected) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let selected = new Set(preSelected && preSelected.size > 0 ? [...preSelected] : options.map((_, i) => i));
    let cursor = 0, done = false;
    const wasRaw = stdin.isRaw;
    try { stdin.setRawMode(true); } catch {}
    stdin.resume(); stdin.setEncoding('utf8');

    function render() {
      const lines = ['', `  ${c.bold}${c.cyan}${prompt}${c.reset}`, `  ${c.dim}${'─'.repeat(52)}${c.reset}`];
      for (let i = 0; i < options.length; i++) {
        const o = options[i], isCur = i === cursor, isSel = selected.has(i);
        const box = isSel ? `${c.green}✓${c.reset}` : `${c.dim}○${c.reset}`;
        const arr = isCur ? `${c.cyan}→${c.reset}` : ' ';
        const hi = isCur ? c.bold : '';
        lines.push(`  ${arr} ${box} ${hi}${o.icon} ${o.name}${c.reset}${o.detected ? ` ${c.dim}(detected)${c.reset}` : ''}`);
      }
      lines.push(`  ${c.dim}${'─'.repeat(52)}${c.reset}`);
      lines.push(`  ${c.dim}↑↓ move  Space toggle  Enter confirm  a toggle all${c.reset}`, '');
      stdout.write('\x1B[2J\x1B[H' + lines.join('\n'));
      try { readline.cursorTo(stdout, 1, 4 + cursor); } catch {}
    }

    function onKey(_, key) {
      if (done) return;
      if (key.name === 'up' || key.name === 'k') { cursor = Math.max(0, cursor - 1); render(); }
      else if (key.name === 'down' || key.name === 'j') { cursor = Math.min(options.length - 1, cursor + 1); render(); }
      else if (key.name === 'space') { selected.has(cursor) ? selected.delete(cursor) : selected.add(cursor); render(); }
      else if (key.name === 'a') { selected.size === options.length ? selected.clear() : options.forEach((_, i) => selected.add(i)); render(); }
      else if (key.name === 'return' || key.name === 'enter') {
        done = true; stdin.removeListener('data', onKey);
        if (stdin.setRawMode) try { stdin.setRawMode(wasRaw === true); } catch {}
        stdout.write('\x1B[?25h');
        resolve([...selected].map(i => options[i]));
      }
      else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        done = true; stdin.removeListener('data', onKey);
        if (stdin.setRawMode) try { stdin.setRawMode(wasRaw === true); } catch {}
        stdout.write('\x1B[?25h'); resolve([]);
      }
    }
    stdin.on('data', onKey); render();
  });
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`  ${question} (Y/n): `, (a) => { rl.close(); resolve(a.trim().toLowerCase() !== 'n'); });
  });
}

// ─── Banner ─────────────────────────────────────────────────
function banner() {
  console.log('');
  log(c.cyan, '  ╔══════════════════════════════════════════════════════╗');
  log(c.cyan, '  ║');
  log(c.bold + c.white, '  ║   ⚡ APEX v2 — Interactive Installer');
  log(c.cyan, '  ║');
  log(c.dim, '  ║   10-agent senior engineering team');
  log(c.dim, '  ║   3 MCP servers · 62+ tools · 16 adapters');
  log(c.cyan, '  ║');
  log(c.cyan, '  ╚══════════════════════════════════════════════════════╝');
  console.log('');
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const nonInteractive = args.includes('--yes') || args.includes('-y');
  const installAll = args.includes('--all');

  banner();

  // Step 1: Detect installed agents
  log(c.cyan, '  🔍 Detecting installed agents...\n');
  const detected = [];
  for (const agent of AGENTS) {
    try { if (agent.detect()) detected.push(agent.id); } catch {}
  }
  const detectedIds = [...new Set(detected)];

  if (detectedIds.length === 0 && !installAll) {
    warn('No coding agents detected on this system.');
    log(c.dim, '  Install a coding agent first, then re-run this installer.');
    log(c.dim, '  Or use: npx @asno-dev/apex --all  (to install for all agents)');
    console.log('');
    process.exit(1);
  }

  if (detectedIds.length > 0) {
    log(c.green, `  Found ${detectedIds.length} agent(s): ${detectedIds.join(', ')}\n`);
  }

  // Step 2: Build options
  const options = AGENTS.map(a => ({ ...a, detected: detectedIds.includes(a.id) }));
  const preSelected = new Set(options.map((o, i) => o.detected ? i : -1).filter(i => i >= 0));

  let chosen;
  if (nonInteractive || installAll) {
    chosen = installAll ? options : options.filter(o => o.detected);
    log(c.cyan, `  📦 ${installAll ? 'Installing for all agents' : 'Installing for detected agents'}...\n`);
  } else {
    log(c.cyan, '  📦 Select agents to install APEX for:\n');
    chosen = await picker(options, 'Select agents (Space to toggle, Enter to confirm)', preSelected);
  }

  if (chosen.length === 0) { warn('Nothing selected. Exiting.'); process.exit(0); }

  // Step 3: Confirm
  if (!nonInteractive && !installAll) {
    console.log('');
    log(c.cyan, `  Will install APEX for: ${chosen.map(c => c.name).join(', ')}`);
    console.log('');
    const ok = await confirm('Proceed with installation?');
    if (!ok) { warn('Cancelled.'); process.exit(0); }
  }

  // Step 4: Install universal files
  console.log('');
  log(c.cyan, '  📁 Installing APEX files...\n');

  // AGENTS.md (universal — every agent reads this)
  copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(CWD, 'AGENTS.md'));
  ok('AGENTS.md (universal instructions)');

  // .mcp.json (MCP server config — used by Claude, Cursor, Windsurf, etc.)
  copy(path.join(APEX_DIR, '.mcp.json'), path.join(CWD, '.mcp.json'));
  ok('.mcp.json (3 MCP servers: hands, mirage, composio)');

  // Skills directory (Claude Code reads from .claude/skills/)
  const skillsSrc = path.join(APEX_DIR, 'skills');
  if (dirExists(skillsSrc)) {
    const skillsDst = path.join(CWD, '.claude', 'skills');
    mkdir(skillsDst); copyDir(skillsSrc, skillsDst);
    ok('skills/ (25 specialized skill files)');
  }

  // Step 5: Install per-agent configs
  console.log('');
  log(c.cyan, '  ⚙️  Configuring selected agents...\n');

  const summary = [];
  for (const agent of chosen) {
    try {
      const info = agent.install(CWD);
      ok(`${agent.name} — ${info}`);
      summary.push(agent.name);
    } catch (e) {
      err(`${agent.name} — ${e.message}`);
    }
  }

  // Step 6: Summary
  console.log('');
  log(c.cyan, '  ╔══════════════════════════════════════════════════╗');
  log(c.cyan, '  ║');
  log(c.bold + c.green, `  ║   ✓ APEX installed for ${summary.length} agent(s)!`);
  log(c.cyan, '  ║');
  log(c.cyan, '  ║   Configured:');
  for (const name of summary) log(c.white, `  ║     • ${name}`);
  log(c.cyan, '  ║');
  log(c.cyan, '  ║   Quick Start — talk to your agent:');
  log(c.white,  '  ║     @arch refactor this    → Max compresses code');
  log(c.white,  '  ║     @ui build a login form → Zara paints WCAG AA');
  log(c.white,  '  ║     @debug fix this error  → Kai 5-step debug');
  log(c.white,  '  ║     @perf this is slow     → Rex profiles & optimizes');
  log(c.white,  '  ║     @sec review auth code  → Vex OWASP scans');
  log(c.white,  '  ║     @infra dockerize this  → Io production config');
  log(c.white,  '  ║     @nova any ideas?       → Nova proposes novel angles');
  log(c.white,  '  ║     @reed best caching     → Dr. Reed compares options');
  log(c.white,  '  ║     @review check this     → Rila structured PR review');
  log(c.white,  '  ║     @flex what\'s the MVP?  → Flex scores & cuts scope');
  log(c.cyan, '  ║');
  log(c.cyan, '  ╚══════════════════════════════════════════════════╝');
  console.log('');
}

main().catch(e => { err(`Installation failed: ${e.message}`); process.exit(1); });
