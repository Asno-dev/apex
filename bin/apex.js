#!/usr/bin/env node
// APEX v2 — Interactive Installer
// Usage: npx @asno-dev/apex
// Shows all 16 agents, interactive picker, installs to apex/ folder.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const APEX_DIR = path.resolve(__dirname, '..');
const HOME = process.env.HOME || process.env.USERPROFILE;
const CWD = process.cwd();

// ─── Helpers ────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', white: '\x1b[37m',
};
function log(color, msg) { process.stdout.write(`${color}${msg}${c.reset}\n`); }
function ok(msg) { log(c.green, `  ✓ ${msg}`); }
function warn(msg) { log(c.yellow, `  ⚠ ${msg}`); }
function err(msg) { log(c.red, `  ✗ ${msg}`); }

function mkdir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function copy(src, dest) {
  try { if (!fs.existsSync(src)) return false; mkdir(path.dirname(dest)); fs.copyFileSync(src, dest); return true; }
  catch { return false; }
}
function copyDir(src, dest) {
  try {
    if (!fs.existsSync(src)) return false; mkdir(dest);
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, e.name), d = path.join(dest, e.name);
      e.isDirectory() ? copyDir(s, d) : copy(s, d);
    }
    return true;
  } catch { return false; }
}
function hasCommand(cmd) {
  if (!cmd) return false;
  try { execSync(process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`, { stdio: 'ignore', timeout: 5000 }); return true; }
  catch { return false; }
}
function dirExists(p) { try { return fs.existsSync(p) && fs.statSync(p).isDirectory(); } catch { return false; } }

// ─── All 16 Agents ─────────────────────────────────────────
const AGENTS = [
  { id: 'claude-code', name: 'Claude Code', icon: '🟣',
    detect: () => hasCommand('claude') || dirExists(path.join(HOME, '.claude')),
    install: (dest) => {
      mkdir(path.join(dest, '.claude', 'agents'));
      mkdir(path.join(dest, '.claude', 'commands'));
      copy(path.join(APEX_DIR, 'adapters/claude-code/plugin.json'), path.join(dest, '.claude/plugin.json'));
      copy(path.join(APEX_DIR, 'adapters/claude-code/hooks.json'), path.join(dest, '.claude/hooks.json'));
      copyDir(path.join(APEX_DIR, 'adapters/claude-code/agents'), path.join(dest, '.claude/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/claude-code/commands'), path.join(dest, '.claude/commands'));
      return '.claude/ (plugin, agents, commands)';
    }
  },
  { id: 'cursor', name: 'Cursor', icon: '🔵',
    detect: () => hasCommand('cursor') || dirExists(path.join(HOME, '.cursor')),
    install: (dest) => {
      mkdir(path.join(dest, '.cursor', 'rules'));
      mkdir(path.join(dest, '.cursor', 'agents'));
      mkdir(path.join(dest, '.cursor', 'commands'));
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(dest, '.cursor/mcp.json'));
      copy(path.join(APEX_DIR, 'adapters/cursor/rules/apex.mdc'), path.join(dest, '.cursor/rules/apex.mdc'));
      copyDir(path.join(APEX_DIR, 'adapters/cursor/agents'), path.join(dest, '.cursor/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/cursor/commands'), path.join(dest, '.cursor/commands'));
      return '.cursor/ (mcp, rules, agents, commands)';
    }
  },
  { id: 'windsurf', name: 'Windsurf', icon: '🟠',
    detect: () => hasCommand('windsurf') || dirExists(path.join(HOME, '.windsurf')),
    install: (dest) => {
      mkdir(path.join(dest, '.windsurf', 'rules'));
      mkdir(path.join(dest, '.windsurf', 'agents'));
      mkdir(path.join(dest, '.windsurf', 'workflows'));
      copy(path.join(APEX_DIR, '.mcp.json'), path.join(dest, '.windsurf/mcp.json'));
      copy(path.join(APEX_DIR, 'adapters/windsurf/rules/apex.md'), path.join(dest, '.windsurf/rules/apex.md'));
      copyDir(path.join(APEX_DIR, 'adapters/windsurf/agents'), path.join(dest, '.windsurf/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/windsurf/workflows'), path.join(dest, '.windsurf/workflows'));
      return '.windsurf/ (mcp, rules, agents, workflows)';
    }
  },
  { id: 'cline', name: 'Cline / Kilo Code', icon: '🟢',
    detect: () => dirExists(path.join(HOME, '.cline')) || dirExists(path.join(HOME, '.kilo')),
    install: (dest) => { copy(path.join(APEX_DIR, '.clinerules'), path.join(dest, '.clinerules')); return '.clinerules'; }
  },
  { id: 'copilot', name: 'GitHub Copilot', icon: '⚪',
    detect: () => hasCommand('gh') || dirExists(path.join(HOME, '.github')),
    install: (dest) => { mkdir(path.join(dest, '.github')); copy(path.join(APEX_DIR, 'adapters/copilot/instructions.md'), path.join(dest, '.github/copilot-instructions.md')); return '.github/copilot-instructions.md'; }
  },
  { id: 'gemini', name: 'Gemini CLI', icon: '🔴',
    detect: () => hasCommand('gemini') || dirExists(path.join(HOME, '.gemini')),
    install: (dest) => {
      mkdir(path.join(dest, '.gemini', 'agents'));
      mkdir(path.join(dest, '.gemini', 'commands'));
      copy(path.join(APEX_DIR, 'adapters/gemini/extension.json'), path.join(dest, '.gemini/extension.json'));
      copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(dest, '.gemini/AGENTS.md'));
      copyDir(path.join(APEX_DIR, 'adapters/gemini/agents'), path.join(dest, '.gemini/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/gemini/commands'), path.join(dest, '.gemini/commands'));
      return '.gemini/ (extension, agents, commands)';
    }
  },
  { id: 'codex', name: 'Codex CLI', icon: '🟡',
    detect: () => hasCommand('codex') || dirExists(path.join(HOME, '.codex')),
    install: (dest) => {
      mkdir(path.join(dest, '.codex', 'agents'));
      copy(path.join(APEX_DIR, 'adapters/codex/plugin.json'), path.join(dest, '.codex/plugin.json'));
      copy(path.join(APEX_DIR, 'adapters/codex/mcp.toml'), path.join(dest, '.codex/mcp.toml'));
      copy(path.join(APEX_DIR, 'adapters/codex/SKILLS.md'), path.join(dest, '.codex/SKILLS.md'));
      copyDir(path.join(APEX_DIR, 'adapters/codex/agents'), path.join(dest, '.codex/agents'));
      return '.codex/ (plugin, agents, mcp.toml)';
    }
  },
  { id: 'devin', name: 'Devin', icon: '🟤',
    detect: () => hasCommand('devin') || dirExists(path.join(HOME, '.devin')),
    install: (dest) => {
      mkdir(path.join(dest, '.devin', 'agents'));
      copy(path.join(APEX_DIR, 'adapters/devin/plugin.yaml'), path.join(dest, '.devin/plugin.yaml'));
      copy(path.join(APEX_DIR, 'adapters/devin/mcp.json'), path.join(dest, '.devin/mcp.json'));
      for (const a of ['arch','ui','debug','perf','sec','infra','nova','reed','review','flex']) {
        mkdir(path.join(dest, '.devin/agents', a));
        const src = path.join(APEX_DIR, `adapters/devin/agents/${a}/AGENT.md`);
        if (fs.existsSync(src)) copy(src, path.join(dest, `.devin/agents/${a}/AGENT.md`));
      }
      return '.devin/ (plugin, agents, mcp)';
    }
  },
  { id: 'hermes', name: 'Hermes', icon: '🩷',
    detect: () => hasCommand('hermes') || dirExists(path.join(HOME, '.hermes')),
    install: (dest) => {
      mkdir(path.join(dest, '.hermes'));
      copy(path.join(APEX_DIR, 'adapters/hermes/plugin.yaml'), path.join(dest, '.hermes/plugin.yaml'));
      copy(path.join(APEX_DIR, 'adapters/hermes/apex-features.yaml'), path.join(dest, 'hermes-apex.yaml'));
      return '.hermes/ + hermes-apex.yaml';
    }
  },
  { id: 'opencode', name: 'OpenCode', icon: '🔷',
    detect: () => hasCommand('opencode') || dirExists(path.join(HOME, '.opencode')),
    install: (dest) => {
      mkdir(path.join(dest, 'adapters/opencode'));
      copy(path.join(APEX_DIR, 'opencode.json'), path.join(dest, 'opencode.json'));
      copy(path.join(APEX_DIR, 'adapters/opencode/apex.mjs'), path.join(dest, 'adapters/opencode/apex.mjs'));
      return 'opencode.json + adapters/opencode/apex.mjs';
    }
  },
  { id: 'kiro', name: 'Kiro', icon: '⬛',
    detect: () => dirExists(path.join(HOME, '.kiro')),
    install: (dest) => { mkdir(path.join(dest, '.kiro/steering')); copy(path.join(APEX_DIR, 'adapters/kiro/apex.md'), path.join(dest, '.kiro/steering/apex.md')); return '.kiro/steering/apex.md'; }
  },
  { id: 'pi', name: 'Pi Agent', icon: '🟪',
    detect: () => hasCommand('pi') || dirExists(path.join(HOME, '.pi')),
    install: (dest) => { copy(path.join(APEX_DIR, 'adapters/pi/extension.json'), path.join(dest, 'pi-extension.json')); copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(dest, 'AGENTS.md')); return 'pi-extension.json + AGENTS.md'; }
  },
  { id: 'antigravity', name: 'Antigravity', icon: '✳️',
    detect: () => hasCommand('agy') || dirExists(path.join(HOME, '.antigravity')),
    install: (dest) => { copy(path.join(APEX_DIR, 'adapters/antigravity/extension.json'), path.join(dest, 'antigravity-extension.json')); copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(dest, 'AGENTS.md')); return 'antigravity-extension.json + AGENTS.md'; }
  },
  { id: 'openclaw', name: 'OpenClaw', icon: '🦞',
    detect: () => hasCommand('clawhub'),
    install: (dest) => { copy(path.join(APEX_DIR, 'adapters/openclaw/package.json'), path.join(dest, 'openclaw-package.json')); copy(path.join(APEX_DIR, 'adapters/openclaw/apex.md'), path.join(dest, 'openclaw-apex.md')); return 'openclaw-package.json + apex.md'; }
  },
  { id: 'codewhale', name: 'CodeWhale', icon: '🐋',
    detect: () => false,
    install: (dest) => { copy(path.join(APEX_DIR, 'adapters/codewhale/AGENTS.md'), path.join(dest, 'AGENTS.md')); return 'AGENTS.md'; }
  },
  { id: 'swival', name: 'Swival', icon: '🐎',
    detect: () => hasCommand('swival'),
    install: (dest) => { mkdir(path.join(dest, '.swival')); copy(path.join(APEX_DIR, 'adapters/swival/apex.md'), path.join(dest, 'swival-apex-skill.md')); copy(path.join(APEX_DIR, '.mcp.json'), path.join(dest, '.swival/mcp.json')); return 'swival-apex-skill.md + .swival/mcp.json'; }
  },
];

// ─── Interactive Picker (arrow keys + space toggle) ─────────
function picker(options, promptText, preSelected) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let selected = new Set(preSelected && preSelected.size > 0 ? [...preSelected] : []);
    let cursor = 0, done = false;
    const wasRaw = stdin.isRaw;
    try { stdin.setRawMode(true); } catch {}
    stdin.resume(); stdin.setEncoding('utf8');

    function render() {
      const lines = [];
      lines.push('');
      lines.push(`  ${c.bold}${c.cyan}${promptText}${c.reset}`);
      lines.push(`  ${c.dim}${'─'.repeat(56)}${c.reset}`);
      for (let i = 0; i < options.length; i++) {
        const o = options[i];
        const isCur = i === cursor;
        const isSel = selected.has(i);
        const box = isSel ? `${c.green}✓${c.reset}` : `${c.dim}○${c.reset}`;
        const arr = isCur ? `${c.cyan}→${c.reset}` : ' ';
        const hi = isCur ? c.bold : '';
        const tag = o.detected ? ` ${c.green}${c.bold}(installed)${c.reset}` : '';
        lines.push(`  ${arr} ${box} ${hi}${o.icon} ${o.name}${c.reset}${tag}`);
      }
      lines.push(`  ${c.dim}${'─'.repeat(56)}${c.reset}`);
      lines.push(`  ${c.dim}↑↓ move  Space select  Enter confirm  a toggle all${c.reset}`);
      lines.push('');
      stdout.write('\x1B[2J\x1B[H' + lines.join('\n'));
      try { readline.cursorTo(stdout, 1, 4 + cursor); } catch {}
    }

    function onKey(str, key) {
      if (done || !key) return;
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
    stdin.on('data', onKey);
    render();
  });
}

function confirm(q) {
  return new Promise((r) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`  ${q} (Y/n): `, (a) => { rl.close(); r(a.trim().toLowerCase() !== 'n'); });
  });
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const yesMode = args.includes('--yes') || args.includes('-y');

  // Banner
  console.log('');
  log(c.bold + c.white, '  APEX v2 — Senior Engineering Team');
  log(c.dim, '  =================================\n');

  // Step 1: Detect
  log(c.cyan, '  Detecting installed agents...\n');
  const detectedIds = [];
  for (const agent of AGENTS) {
    try { if (agent.detect()) detectedIds.push(agent.id); } catch {}
  }

  if (detectedIds.length > 0) {
    log(c.green, `  Found: ${detectedIds.join(', ')}\n`);
  } else {
    warn('  No coding agents detected. You can still install manually.\n');
  }

  // Step 2: Build options (ALL 16 agents, mark detected ones)
  const options = AGENTS.map(a => ({ ...a, detected: detectedIds.includes(a.id) }));

  // Pre-select detected agents
  const preSelected = new Set(options.map((o, i) => o.detected ? i : -1).filter(i => i >= 0));

  let chosen;
  if (yesMode) {
    chosen = options.filter(o => o.detected);
    if (chosen.length === 0) { warn('No agents detected. Use interactive mode to choose.'); process.exit(1); }
    log(c.dim, `  Auto-selecting detected agents...\n`);
  } else {
    chosen = await picker(options, 'Select agents to install (Space to toggle, Enter to confirm):', preSelected);
  }

  if (chosen.length === 0) { warn('Nothing selected. Exiting.'); process.exit(0); }

  // Step 3: Confirm
  if (!yesMode) {
    console.log('');
    log(c.cyan, `  Install APEX for: ${chosen.map(c => c.name).join(', ')}`);
    console.log('');
    const ok = await confirm('Proceed?');
    if (!ok) { warn('Cancelled.'); process.exit(0); }
  }

  // Step 4: Create apex/ folder and install
  console.log('');
  const apexDir = path.join(CWD, 'apex');
  mkdir(apexDir);
  log(c.cyan, '  Installing APEX files...\n');

  // Copy AGENTS.md and .mcp.json into apex/
  copy(path.join(APEX_DIR, 'AGENTS.md'), path.join(apexDir, 'AGENTS.md'));
  ok('apex/AGENTS.md');

  copy(path.join(APEX_DIR, '.mcp.json'), path.join(apexDir, '.mcp.json'));
  ok('apex/.mcp.json');

  // Copy skills/ into apex/skills/
  const skillsSrc = path.join(APEX_DIR, 'skills');
  if (dirExists(skillsSrc)) {
    copyDir(skillsSrc, path.join(apexDir, 'skills'));
    ok('apex/skills/ (25 skills)');
  }

  // Step 5: Install each chosen agent
  console.log('');
  log(c.cyan, '  Configuring agents...\n');

  const summary = [];
  for (const agent of chosen) {
    try {
      const info = agent.install(apexDir);
      ok(`${agent.name} — ${info}`);
      summary.push(agent.name);
    } catch (e) {
      err(`${agent.name} — ${e.message}`);
    }
  }

  // Step 6: Summary
  console.log('');
  log(c.bold + c.green, '  === Installation Complete ===');
  console.log('');
  log(c.white, `  Installed for ${summary.length} agent(s): ${summary.join(', ')}`);
  log(c.white, `  Files location: ${apexDir}/`);
  console.log('');
  log(c.dim, '  Quick Start — talk to your coding agent:');
  log(c.white, '    @arch refactor this    → Max compresses code');
  log(c.white, '    @ui build a login form → Zara paints WCAG AA');
  log(c.white, '    @debug fix this error  → Kai 5-step debug');
  log(c.white, '    @perf this is slow     → Rex profiles & optimizes');
  log(c.white, '    @sec review auth code  → Vex OWASP scans');
  log(c.white, '    @infra dockerize this  → Io production config');
  log(c.white, '    @nova any ideas?       → Nova proposes novel angles');
  log(c.white, '    @reed best caching     → Dr. Reed compares options');
  log(c.white, '    @review check this     → Rila structured PR review');
  log(c.white, '    @flex what\'s the MVP?  → Flex scores & cuts scope');
  console.log('');
}

main().catch(e => { err(`Failed: ${e.message}`); process.exit(1); });
