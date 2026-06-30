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
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgCyan: '\x1b[46m',
};

function log(color, msg) { process.stdout.write(`${color}${msg}${c.reset}\n`); }
function ok(msg) { log(c.green, `  ✓ ${msg}`); }
function skip(msg) { log(c.dim, `  ~ ${msg}`); }
function warn(msg) { log(c.yellow, `  ⚠ ${msg}`); }
function err(msg) { log(c.red, `  ✗ ${msg}`); }

// ─── Agent Definitions ──────────────────────────────────────
const AGENTS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: '🟣',
    detect: { cmd: 'claude', dir: path.join(HOME, '.claude') },
    install: (dest) => {
      const d = path.join(dest, '.claude');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/claude-code/plugin.json'), path.join(d, 'plugin.json'));
      copy(path.join(APEX_DIR, 'adapters/claude-code/hooks.json'), path.join(d, 'hooks.json'));
      mkdir(path.join(d, 'agents'));
      copyDir(path.join(APEX_DIR, 'adapters/claude-code/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'commands'));
      copyDir(path.join(APEX_DIR, 'adapters/claude-code/commands'), path.join(d, 'commands'));
      return '10 agents, 8 commands, MCP servers';
    }
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '🔵',
    detect: { cmd: 'cursor', dir: path.join(HOME, '.cursor') },
    install: (dest) => {
      const d = path.join(dest, '.cursor');
      mkdir(d);
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(d, 'mcp.json'));
      mkdir(path.join(d, 'rules'));
      copy(path.join(APEX_DIR, 'adapters/cursor/rules/apex.mdc'), path.join(d, 'rules/apex.mdc'));
      mkdir(path.join(d, 'agents'));
      copyDir(path.join(APEX_DIR, 'adapters/cursor/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'commands'));
      copyDir(path.join(APEX_DIR, 'adapters/cursor/commands'), path.join(d, 'commands'));
      return '10 agents, 8 commands, MCP servers';
    }
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '🟠',
    detect: { cmd: 'windsurf', dir: path.join(HOME, '.windsurf') },
    install: (dest) => {
      const d = path.join(dest, '.windsurf');
      mkdir(d);
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(d, 'mcp.json'));
      mkdir(path.join(d, 'rules'));
      mkdir(path.join(d, 'agents'));
      copyDir(path.join(APEX_DIR, 'adapters/windsurf/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'workflows'));
      copyDir(path.join(APEX_DIR, 'adapters/windsurf/workflows'), path.join(d, 'workflows'));
      return '10 agents, 8 workflows, MCP servers';
    }
  },
  {
    id: 'cline',
    name: 'Cline / Kilo',
    icon: '🟢',
    detect: { cmd: null, dir: null, file: '.clinerules' },
    install: (dest) => {
      copy(path.join(APEX_DIR, '.clinerules'), path.join(dest, '.clinerules'));
      return 'full APEX rules';
    }
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: '⚪',
    detect: { cmd: 'gh', dir: path.join(HOME, '.github') },
    install: (dest) => {
      const d = path.join(dest, '.github');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/copilot/instructions.md'), path.join(d, 'copilot-instructions.md'));
      return 'full APEX instructions';
    }
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    icon: '🔴',
    detect: { cmd: 'gemini', dir: path.join(HOME, '.gemini') },
    install: (dest) => {
      const d = path.join(dest, '.gemini');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/gemini/extension.json'), path.join(d, 'extension.json'));
      mkdir(path.join(d, 'agents'));
      copyDir(path.join(APEX_DIR, 'adapters/gemini/agents'), path.join(d, 'agents'));
      mkdir(path.join(d, 'commands'));
      copyDir(path.join(APEX_DIR, 'adapters/gemini/commands'), path.join(d, 'commands'));
      return '10 agents, 8 commands';
    }
  },
  {
    id: 'codex',
    name: 'Codex',
    icon: '🟡',
    detect: { cmd: 'codex', dir: path.join(HOME, '.codex') },
    install: (dest) => {
      const d = path.join(dest, '.codex');
      mkdir(d);
      mkdir(path.join(d, 'agents'));
      copyDir(path.join(APEX_DIR, 'adapters/codex/agents'), path.join(d, 'agents'));
      copy(path.join(APEX_DIR, 'adapters/codex/mcp.toml'), path.join(d, 'mcp.toml'));
      copy(path.join(APEX_DIR, 'adapters/codex/plugin.json'), path.join(d, 'plugin.json'));
      copy(path.join(APEX_DIR, 'adapters/codex/SKILLS.md'), path.join(d, 'SKILLS.md'));
      return '10 agents, MCP, skills';
    }
  },
  {
    id: 'devin',
    name: 'Devin',
    icon: '🟤',
    detect: { cmd: 'devin', dir: path.join(HOME, '.devin') },
    install: (dest) => {
      const d = path.join(dest, '.devin');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/devin/mcp.json'), path.join(d, 'mcp.json'));
      copy(path.join(APEX_DIR, 'adapters/devin/plugin.yaml'), path.join(d, 'plugin.yaml'));
      mkdir(path.join(d, 'agents'));
      for (const a of ['arch','ui','debug','perf','sec','infra','nova','reed','review','flex']) {
        const ad = path.join(d, 'agents', a);
        mkdir(ad);
        const src = path.join(APEX_DIR, `adapters/devin/agents/${a}/AGENT.md`);
        if (fs.existsSync(src)) copy(src, path.join(ad, 'AGENT.md'));
      }
      return '10 agents, MCP servers';
    }
  },
  {
    id: 'hermes',
    name: 'Hermes',
    icon: '🩷',
    detect: { cmd: 'hermes', dir: path.join(HOME, '.hermes') },
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/hermes/apex-features.yaml'), path.join(dest, 'hermes-apex.yaml'));
      const d = path.join(dest, '.hermes');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/hermes/plugin.yaml'), path.join(d, 'plugin.yaml'));
      return 'plugin + features';
    }
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    icon: '🔷',
    detect: { cmd: 'opencode', dir: path.join(HOME, '.opencode') },
    install: (dest) => {
      copy(path.join(APEX_DIR, 'opencode.json'), path.join(dest, 'opencode.json'));
      return 'full config + agents';
    }
  },
  {
    id: 'kiro',
    name: 'Kiro',
    icon: '⬛',
    detect: { cmd: null, dir: path.join(HOME, '.kiro') },
    install: (dest) => {
      const d = path.join(dest, '.kiro', 'steering');
      mkdir(d);
      copy(path.join(APEX_DIR, 'adapters/kiro/apex.md'), path.join(d, 'apex.md'));
      return 'full APEX steering';
    }
  },
  {
    id: 'pi',
    name: 'Pi Agent',
    icon: '🟪',
    detect: { cmd: 'pi', dir: path.join(HOME, '.pi') },
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/pi/extension.json'), path.join(dest, 'pi-extension.json'));
      return 'extension + MCP';
    }
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    icon: '✳️',
    detect: { cmd: 'agy', dir: path.join(HOME, '.antigravity') },
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/antigravity/extension.json'), path.join(dest, 'antigravity-extension.json'));
      return 'extension + MCP';
    }
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    icon: '🦞',
    detect: { cmd: 'clawhub', dir: null },
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/openclaw/package.json'), path.join(dest, 'openclaw-package.json'));
      return 'package + MCP';
    }
  },
  {
    id: 'codewhale',
    name: 'CodeWhale',
    icon: '🐋',
    detect: { cmd: null, dir: null },
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/codewhale/AGENTS.md'), path.join(dest, 'AGENTS.md'));
      return 'AGENTS.md';
    }
  },
  {
    id: 'swival',
    name: 'Swival',
    icon: '🐎',
    detect: { cmd: 'swival', dir: null },
    install: (dest) => {
      copy(path.join(APEX_DIR, 'adapters/swival/apex.md'), path.join(dest, 'swival-apex-skill.md'));
      const d = path.join(dest, '.swival');
      mkdir(d);
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(d, 'mcp.json'));
      return 'skill + MCP';
    }
  },
];

// ─── File Helpers ───────────────────────────────────────────
function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

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
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      if (entry.isDirectory()) copyDir(s, d);
      else copy(s, d);
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
  } catch { return false;
  }
}

function dirExists(p) {
  try { return fs.existsSync(p) && fs.statSync(p).isDirectory(); }
  catch { return false; }
}

// ─── Detection ──────────────────────────────────────────────
function detectAgents() {
  const detected = [];
  for (const agent of AGENTS) {
    let found = false;
    if (agent.detect.cmd && hasCommand(agent.detect.cmd)) found = true;
    if (agent.detect.dir && dirExists(agent.detect.dir)) found = true;
    if (agent.detect.file) {
      const filePath = path.isAbsolute(agent.detect.file)
        ? agent.detect.file
        : path.join(CWD, agent.detect.file);
      if (fs.existsSync(filePath)) found = true;
    }
    if (found) detected.push(agent.id);
  }
  return [...new Set(detected)];
}

// ─── Interactive Picker ─────────────────────────────────────
function picker(options, prompt, preSelected = null) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    // Pre-select detected agents, or all if none detected
    let selected;
    if (preSelected && preSelected.size > 0) {
      selected = new Set([...preSelected]);
    } else {
      selected = new Set(options.map((_, i) => i));
    }
    let cursor = 0;
    let done = false;

    const wasRaw = stdin.isRaw;
    try { stdin.setRawMode(true); } catch {}
    stdin.resume();
    stdin.setEncoding('utf8');

    function render() {
      const lines = [];
      lines.push('');
      lines.push(`  ${c.bold}${c.cyan}${prompt}${c.reset}`);
      lines.push(`  ${c.dim}${'─'.repeat(50)}${c.reset}`);

      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const isCursor = i === cursor;
        const isChecked = selected.has(i);

        const checkbox = isChecked ? `${c.green}✓${c.reset}` : `${c.dim}○${c.reset}`;
        const arrow = isCursor ? `${c.cyan}→${c.reset}` : ' ';
        const highlight = isCursor ? `${c.bold}` : '';
        const icon = opt.icon || '';

        lines.push(`  ${arrow} ${checkbox} ${highlight}${icon} ${opt.name}${c.reset}${opt.detected ? ` ${c.dim}(detected)${c.reset}` : ''}`);
      }

      lines.push(`  ${c.dim}${'─'.repeat(50)}${c.reset}`);
      lines.push(`  ${c.dim}↑↓ navigate  Space toggle  Enter confirm  a toggle all${c.reset}`);
      lines.push('');

      // Clear and redraw
      stdout.write('\x1B[2J\x1B[H');
      stdout.write(lines.join('\n'));

      // Position cursor
      const row = 4 + cursor;
      try { readline.cursorTo(stdout, 1, row); } catch {}
    }

    function onKey(str, key) {
      if (done) return;

      if (key.name === 'up' || key.name === 'k') {
        cursor = Math.max(0, cursor - 1);
        render();
      } else if (key.name === 'down' || key.name === 'j') {
        cursor = Math.min(options.length - 1, cursor + 1);
        render();
      } else if (key.name === 'space') {
        if (selected.has(cursor)) selected.delete(cursor);
        else selected.add(cursor);
        render();
      } else if (key.name === 'a') {
        if (selected.size === options.length) selected.clear();
        else options.forEach((_, i) => selected.add(i));
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        done = true;
        stdin.removeListener('data', onKey);
        if (stdin.setRawMode) try { stdin.setRawMode(wasRaw === true); } catch {}
        stdout.write('\x1B[?25h');
        resolve([...selected].map(i => options[i]));
      } else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        done = true;
        stdin.removeListener('data', onKey);
        if (stdin.setRawMode) try { stdin.setRawMode(wasRaw === true); } catch {}
        stdout.write('\x1B[?25h');
        resolve([]);
      }
    }

    stdin.on('data', onKey);
    render();
  });
}

// ─── Confirm ────────────────────────────────────────────────
function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`  ${question} (Y/n): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() !== 'n');
    });
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

  banner();

  // Step 1: Detect installed agents
  log(c.cyan, '  🔍 Detecting installed agents...\n');
  const detectedIds = detectAgents();

  if (detectedIds.length === 0) {
    warn('No coding agents detected.');
    log(c.dim, '  Install an agent first, then run this installer again.');
    log(c.dim, '  Supported: Claude Code, Cursor, Windsurf, Cline, Copilot,');
    log(c.dim, '  Gemini CLI, Codex, Devin, Hermes, OpenCode, Kiro, Pi,');
    log(c.dim, '  Antigravity, OpenClaw, CodeWhale, Swival');
    console.log('');
    process.exit(1);
  }

  log(c.green, `  Found ${detectedIds.length} agent(s): ${detectedIds.join(', ')}\n`);

  // Step 2: Build options with detected status
  const options = AGENTS.map(a => ({
    ...a,
    detected: detectedIds.includes(a.id),
  }));

  // Pre-select detected agents
  const preSelected = new Set(options.map((o, i) => o.detected ? i : -1).filter(i => i >= 0));

  let chosen;
  if (nonInteractive) {
    // Non-interactive: install for all detected agents
    chosen = options.filter(o => o.detected);
    log(c.cyan, `  📦 Non-interactive mode: installing for detected agents\n`);
  } else {
    // Step 3: Interactive picker
    log(c.cyan, '  📦 Select agents to install APEX for:\n');
    chosen = await picker(options, 'Select agents (Space to toggle, Enter to confirm)', preSelected);
  }

  if (chosen.length === 0) {
    warn('Nothing selected. Exiting.');
    process.exit(0);
  }

  // Step 4: Confirm (skip in non-interactive mode)
  if (!nonInteractive) {
    console.log('');
    log(c.cyan, `  Will install APEX for: ${chosen.map(c => c.name).join(', ')}`);
    console.log('');
    const ok = await confirm('Proceed with installation?');
    if (!ok) {
      warn('Cancelled.');
      process.exit(0);
    }
  }

  // Step 5: Install universal files
  console.log('');
  log(c.cyan, '  📁 Installing APEX files...\n');

  // AGENTS.md (universal)
  copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(CWD, 'AGENTS.md'));
  ok('AGENTS.md (universal)');

  // .mcp.json (MCP server config)
  copy(path.join(APEX_DIR, '.mcp.json'), path.join(CWD, '.mcp.json'));
  ok('.mcp.json (3 MCP servers)');

  // Skills directory
  const skillsSrc = path.join(APEX_DIR, 'skills');
  const skillsDst = path.join(CWD, '.claude', 'skills');
  if (dirExists(skillsSrc)) {
    copyDir(skillsSrc, skillsDst);
    ok('Skills directory (25 skills)');
  }

  // Step 6: Install per-agent
  console.log('');
  log(c.cyan, '  ⚙️  Configuring agents...\n');

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

  // Step 7: Summary
  console.log('');
  log(c.cyan, '  ╔══════════════════════════════════════════════════╗');
  log(c.cyan, '  ║');
  log(c.bold + c.green, `  ║   ✓ APEX installed for ${summary.length} agent(s)!`);
  log(c.cyan, '  ║');
  log(c.cyan, '  ║   Agents configured:');
  for (const name of summary) {
    log(c.white, `  ║     • ${name}`);
  }
  log(c.cyan, '  ║');
  log(c.cyan, '  ║   Quick Start:');
  log(c.white,  '  ║     @arch refactor this    → Max compresses code');
  log(c.white,  '  ║     @ui build a login form → Zara paints WCAG AA');
  log(c.white,  '  ║     @debug fix this error  → Kai 5-step debug');
  log(c.white,  '  ║     @perf this is slow     → Rex profiles & optimizes');
  log(c.white,  '  ║     @sec review auth code  → Vex OWASP scans');
  log(c.white,  '  ║     @infra dockerize this  → Io production config');
  log(c.cyan, '  ║');
  log(c.cyan, '  ║   Marketplace:');
  log(c.dim,   '  ║     Claude: /plugin marketplace add asno-dev/apex');
  log(c.dim,   '  ║     Codex:  codex plugin marketplace add asno-dev/apex');
  log(c.dim,   '  ║     Gemini: gemini extensions install https://github.com/asno-dev/apex');
  log(c.cyan, '  ║');
  log(c.cyan, '  ╚══════════════════════════════════════════════════╝');
  console.log('');
}

main().catch(e => {
  err(`Installation failed: ${e.message}`);
  process.exit(1);
});
