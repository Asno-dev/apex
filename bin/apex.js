#!/usr/bin/env node
// APEX v2 — Interactive Installer
// Usage: npx @asno-dev/apex
// Shows all 16 agents, interactive picker, installs to project root.
// All MCP server paths are fixed: src/ → apex/src/ in config files

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const APEX_DIR = path.resolve(__dirname, '..');
const HOME = process.env.HOME || process.env.USERPROFILE;
const CWD = process.cwd();
const APEX = path.join(CWD, 'apex');

// ─── Terminal Colors ────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', white: '\x1b[37m',
};
function log(color, msg) { process.stdout.write(`${color}${msg}${c.reset}\n`); }
function ok(msg) { log(c.green, `  ✓ ${msg}`); }
function warn(msg) { log(c.yellow, `  ⚠ ${msg}`); }
function info(msg) { log(c.dim, `  ${msg}`); }
function err(msg) { log(c.red, `  ✗ ${msg}`); }

function mkdir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function copy(src, dest) {
  try { if (!fs.existsSync(src)) return false; mkdir(path.dirname(dest)); fs.copyFileSync(src, dest); return true; }
  catch { return false; }
}
function copyDir(src, dest, skipNodeModules = true) {
  try {
    if (!fs.existsSync(src)) return false; mkdir(dest);
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
      if (skipNodeModules && e.name === 'node_modules') continue;
      const s = path.join(src, e.name), d = path.join(dest, e.name);
      e.isDirectory() ? copyDir(s, d, skipNodeModules) : copy(s, d);
    }
    return true;
  } catch { return false; }
}

function readFile(p) { try { return fs.readFileSync(p, 'utf-8'); } catch { return null; } }
function writeFile(p, content) { mkdir(path.dirname(p)); fs.writeFileSync(p, content, 'utf-8'); }

// Find a source file with fallback paths. Returns the first that exists.
function resolveSource(...candidates) {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// ─── Path Fixing ────────────────────────────────────────────
// All MCP server paths in config files must be fixed from
//   src/...  →  apex/src/...
// because configs go to project root but servers live in apex/src/
function fixMcpPaths(content) {
  if (!content) return content;
  let r = content;
  // 1. JSON / YAML quoted string paths (handles arrays and values)
  r = r.replace(/"src\/hands-server\.mjs"/g, '"apex/src/hands-server.mjs"');
  r = r.replace(/"src\/mirage-server\.mjs"/g, '"apex/src/mirage-server.mjs"');
  r = r.replace(/"src\/composio-server\.mjs"/g, '"apex/src/composio-server.mjs"');
  // 2. TOML args format
  r = r.replace(/args = \["src\/hands-server\.mjs"\]/g, 'args = ["apex/src/hands-server.mjs"]');
  r = r.replace(/args = \["src\/mirage-server\.mjs"\]/g, 'args = ["apex/src/mirage-server.mjs"]');
  r = r.replace(/args = \["src\/composio-server\.mjs"\]/g, 'args = ["apex/src/composio-server.mjs"]');
  // 3. Gemini-style string commands: "command": "node src/..."
  r = r.replace(/"command": "node src\/hands-server\.mjs"/g, '"command": "node apex/src/hands-server.mjs"');
  r = r.replace(/"command": "node src\/mirage-server\.mjs"/g, '"command": "node apex/src/mirage-server.mjs"');
  r = r.replace(/"command": "node src\/composio-server\.mjs"/g, '"command": "node apex/src/composio-server.mjs"');
  // 4. YAML command arrays: command: ["node", "src/..."]
  r = r.replace(/command: \["node", "src\/hands-server\.mjs"\]/g, 'command: ["node", "apex/src/hands-server.mjs"]');
  r = r.replace(/command: \["node", "src\/mirage-server\.mjs"\]/g, 'command: ["node", "apex/src/mirage-server.mjs"]');
  r = r.replace(/command: \["node", "src\/composio-server\.mjs"\]/g, 'command: ["node", "apex/src/composio-server.mjs"]');
  // 5. Hermes YAML hyphen-prefixed commands: - command: ["node", "src/..."]
  r = r.replace(/- command: \["node", "src\/hands-server\.mjs"\]/g, '- command: ["node", "apex/src/hands-server.mjs"]');
  r = r.replace(/- command: \["node", "src\/mirage-server\.mjs"\]/g, '- command: ["node", "apex/src/mirage-server.mjs"]');
  r = r.replace(/- command: \["node", "src\/composio-server\.mjs"\]/g, '- command: ["node", "apex/src/composio-server.mjs"]');
  return r;
}

// Copy a single file with path fixing applied
function copyFixed(src, dest) {
  const content = readFile(src);
  if (!content) return false;
  writeFile(dest, fixMcpPaths(content));
  return true;
}

// Copy a directory tree, fixing paths in every file
function copyDirFixed(src, dest) {
  try {
    if (!fs.existsSync(src)) return false; mkdir(dest);
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, e.name), d = path.join(dest, e.name);
      e.isDirectory() ? copyDir(s, d) : copyFixed(s, d);
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

// Resolve the best source for a shared file (check root first, then adapters)
function resolveSharedFile(name) {
  const rootPath = path.join(APEX_DIR, name);
  if (fs.existsSync(rootPath)) return rootPath;
  // If .mcp.json doesn't exist at root, use devin template
  if (name === '.mcp.json') {
    const fallback = path.join(APEX_DIR, 'adapters/devin/mcp.json');
    if (fs.existsSync(fallback)) return fallback;
  }
  // If AGENTS.md doesn't exist at root, use codewhale template
  if (name === 'AGENTS.md') {
    const fallback = path.join(APEX_DIR, 'adapters/codewhale/AGENTS.md');
    if (fs.existsSync(fallback)) return fallback;
  }
  return rootPath; // return original, will be handled by caller
}

// ─── All 16 Agents ─────────────────────────────────────────
// install(root) copies configs to project root with MCP paths fixed
const AGENTS = [
  { id: 'claude-code', name: 'Claude Code', icon: '🟣',
    detect: () => hasCommand('claude') || dirExists(path.join(HOME, '.claude')),
    install: (root) => {
      mkdir(path.join(root, '.claude', 'agents'));
      mkdir(path.join(root, '.claude', 'commands'));
      copyFixed(path.join(APEX_DIR, 'adapters/claude-code/plugin.json'), path.join(root, '.claude/plugin.json'));
      copy(path.join(APEX_DIR, 'adapters/claude-code/hooks.json'), path.join(root, '.claude/hooks.json'));
      copyDir(path.join(APEX_DIR, 'adapters/claude-code/agents'), path.join(root, '.claude/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/claude-code/commands'), path.join(root, '.claude/commands'));
      return '.claude/ (plugin, agents, commands)';
    }
  },
  { id: 'cursor', name: 'Cursor', icon: '🔵',
    detect: () => hasCommand('cursor') || dirExists(path.join(HOME, '.cursor')),
    install: (root) => {
      mkdir(path.join(root, '.cursor', 'rules'));
      mkdir(path.join(root, '.cursor', 'agents'));
      mkdir(path.join(root, '.cursor', 'commands'));
      copyFixed(resolveSharedFile('.mcp.json'), path.join(root, '.cursor/mcp.json'));
      copy(path.join(APEX_DIR, 'adapters/cursor/rules/apex.mdc'), path.join(root, '.cursor/rules/apex.mdc'));
      copyDir(path.join(APEX_DIR, 'adapters/cursor/agents'), path.join(root, '.cursor/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/cursor/commands'), path.join(root, '.cursor/commands'));
      return '.cursor/ (mcp, rules, agents, commands)';
    }
  },
  { id: 'windsurf', name: 'Windsurf', icon: '🟠',
    detect: () => hasCommand('windsurf') || dirExists(path.join(HOME, '.windsurf')),
    install: (root) => {
      mkdir(path.join(root, '.windsurf', 'rules'));
      mkdir(path.join(root, '.windsurf', 'agents'));
      mkdir(path.join(root, '.windsurf', 'workflows'));
      copyFixed(resolveSharedFile('.mcp.json'), path.join(root, '.windsurf/mcp.json'));
      copy(path.join(APEX_DIR, 'adapters/windsurf/rules/apex.md'), path.join(root, '.windsurf/rules/apex.md'));
      copyDir(path.join(APEX_DIR, 'adapters/windsurf/agents'), path.join(root, '.windsurf/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/windsurf/workflows'), path.join(root, '.windsurf/workflows'));
      return '.windsurf/ (mcp, rules, agents, workflows)';
    }
  },
  { id: 'cline', name: 'Cline / Kilo Code', icon: '🟢',
    detect: () => dirExists(path.join(HOME, '.cline')) || dirExists(path.join(HOME, '.kilo')),
    install: (root) => { copy(path.join(APEX_DIR, '.clinerules'), path.join(root, '.clinerules')); return '.clinerules'; }
  },
  { id: 'copilot', name: 'GitHub Copilot', icon: '⚪',
    detect: () => hasCommand('gh') || dirExists(path.join(HOME, '.github')),
    install: (root) => { mkdir(path.join(root, '.github')); copy(path.join(APEX_DIR, 'adapters/copilot/instructions.md'), path.join(root, '.github/copilot-instructions.md')); return '.github/copilot-instructions.md'; }
  },
  { id: 'gemini', name: 'Gemini CLI', icon: '🔴',
    detect: () => hasCommand('gemini') || dirExists(path.join(HOME, '.gemini')),
    install: (root) => {
      mkdir(path.join(root, '.gemini', 'agents'));
      mkdir(path.join(root, '.gemini', 'commands'));
      copyFixed(path.join(APEX_DIR, 'adapters/gemini/extension.json'), path.join(root, '.gemini/extension.json'));
      copy(resolveSharedFile('AGENTS.md'), path.join(root, '.gemini/AGENTS.md'));
      copyDir(path.join(APEX_DIR, 'adapters/gemini/agents'), path.join(root, '.gemini/agents'));
      copyDir(path.join(APEX_DIR, 'adapters/gemini/commands'), path.join(root, '.gemini/commands'));
      return '.gemini/ (extension, agents, commands)';
    }
  },
  { id: 'codex', name: 'Codex CLI', icon: '🟡',
    detect: () => hasCommand('codex') || dirExists(path.join(HOME, '.codex')),
    install: (root) => {
      mkdir(path.join(root, '.codex', 'agents'));
      copyFixed(path.join(APEX_DIR, 'adapters/codex/plugin.json'), path.join(root, '.codex/plugin.json'));
      copyFixed(path.join(APEX_DIR, 'adapters/codex/mcp.toml'), path.join(root, '.codex/mcp.toml'));
      copy(path.join(APEX_DIR, 'adapters/codex/SKILLS.md'), path.join(root, '.codex/SKILLS.md'));
      copyDir(path.join(APEX_DIR, 'adapters/codex/agents'), path.join(root, '.codex/agents'));
      return '.codex/ (plugin, agents, mcp.toml)';
    }
  },
  { id: 'devin', name: 'Devin', icon: '🟤',
    detect: () => hasCommand('devin') || dirExists(path.join(HOME, '.devin')),
    install: (root) => {
      mkdir(path.join(root, '.devin', 'agents'));
      copyFixed(path.join(APEX_DIR, 'adapters/devin/plugin.yaml'), path.join(root, '.devin/plugin.yaml'));
      copyFixed(path.join(APEX_DIR, 'adapters/devin/mcp.json'), path.join(root, '.devin/mcp.json'));
      for (const a of ['arch','ui','debug','perf','sec','infra','nova','reed','review','flex']) {
        mkdir(path.join(root, '.devin/agents', a));
        const src = path.join(APEX_DIR, `adapters/devin/agents/${a}/AGENT.md`);
        if (fs.existsSync(src)) copy(src, path.join(root, `.devin/agents/${a}/AGENT.md`));
      }
      return '.devin/ (plugin, agents, mcp)';
    }
  },
  { id: 'hermes', name: 'Hermes', icon: '🩷',
    detect: () => hasCommand('hermes') || dirExists(path.join(HOME, '.hermes')),
    install: (root) => {
      mkdir(path.join(root, '.hermes'));
      copy(path.join(APEX_DIR, 'adapters/hermes/plugin.yaml'), path.join(root, '.hermes/plugin.yaml'));
      copyFixed(path.join(APEX_DIR, 'adapters/hermes/apex-features.yaml'), path.join(root, 'hermes-apex.yaml'));
      return '.hermes/ + hermes-apex.yaml';
    }
  },
  { id: 'opencode', name: 'OpenCode', icon: '🔷',
    detect: () => hasCommand('opencode') || dirExists(path.join(HOME, '.opencode')),
    install: (root) => {
      mkdir(path.join(root, 'adapters/opencode'));
      // Copy opencode.json (with MCP paths fixed)
      copyFixed(path.join(APEX_DIR, 'opencode.json'), path.join(root, 'opencode.json'));
      // Copy the OpenCode plugin file if it exists
      const pluginSrc = path.join(APEX_DIR, 'adapters/opencode/apex.mjs');
      if (fs.existsSync(pluginSrc)) {
        copy(pluginSrc, path.join(root, 'adapters/opencode/apex.mjs'));
      } else {
        warn('adapters/opencode/apex.mjs not found — OpenCode agents will still work but plugin features limited');
      }
      // Copy .opencode/agents/ from the APEX install dir
      if (dirExists(path.join(APEX_DIR, '.opencode/agents'))) {
        copyDir(path.join(APEX_DIR, '.opencode/agents'), path.join(root, '.opencode/agents'));
      }
      return 'opencode.json + adapters/opencode/apex.mjs + .opencode/agents/';
    }
  },
  { id: 'kiro', name: 'Kiro', icon: '⬛',
    detect: () => dirExists(path.join(HOME, '.kiro')),
    install: (root) => { mkdir(path.join(root, '.kiro/steering')); copy(path.join(APEX_DIR, 'adapters/kiro/apex.md'), path.join(root, '.kiro/steering/apex.md')); return '.kiro/steering/apex.md'; }
  },
  { id: 'pi', name: 'Pi Agent', icon: '🟪',
    detect: () => hasCommand('pi') || dirExists(path.join(HOME, '.pi')),
    install: (root) => {
      copyFixed(path.join(APEX_DIR, 'adapters/pi/extension.json'), path.join(root, 'pi-extension.json'));
      copy(resolveSharedFile('AGENTS.md'), path.join(root, 'AGENTS.md'));
      return 'pi-extension.json + AGENTS.md';
    }
  },
  { id: 'antigravity', name: 'Antigravity', icon: '✳️',
    detect: () => hasCommand('agy') || dirExists(path.join(HOME, '.antigravity')),
    install: (root) => {
      copyFixed(path.join(APEX_DIR, 'adapters/antigravity/extension.json'), path.join(root, 'antigravity-extension.json'));
      copy(resolveSharedFile('AGENTS.md'), path.join(root, 'AGENTS.md'));
      return 'antigravity-extension.json + AGENTS.md';
    }
  },
  { id: 'openclaw', name: 'OpenClaw', icon: '🦞',
    detect: () => hasCommand('clawhub'),
    install: (root) => {
      copy(path.join(APEX_DIR, 'adapters/openclaw/package.json'), path.join(root, 'openclaw-package.json'));
      copy(path.join(APEX_DIR, 'adapters/openclaw/apex.md'), path.join(root, 'openclaw-apex.md'));
      return 'openclaw-package.json + apex.md';
    }
  },
  { id: 'codewhale', name: 'CodeWhale', icon: '🐋',
    detect: () => false,
    install: (root) => {
      copy(resolveSharedFile('AGENTS.md'), path.join(root, 'AGENTS.md'));
      return 'AGENTS.md';
    }
  },
  { id: 'swival', name: 'Swival', icon: '🐎',
    detect: () => hasCommand('swival'),
    install: (root) => {
      mkdir(path.join(root, '.swival'));
      copy(path.join(APEX_DIR, 'adapters/swival/apex.md'), path.join(root, 'swival-apex-skill.md'));
      copyFixed(resolveSharedFile('.mcp.json'), path.join(root, '.swival/mcp.json'));
      return 'swival-apex-skill.md + .swival/mcp.json';
    }
  },
];

// ─── Interactive Picker (arrow keys + space toggle) ─────────
function picker(options, promptText) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    const selected = new Set();
    let cursor = 0, done = false;
    const wasRaw = stdin.isRaw;
    try { stdin.setRawMode(true); } catch {}
    stdin.resume(); stdin.setEncoding('utf8');
    readline.emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);

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
        const tag = o.detected ? ` ${c.green}${c.bold}(detected)${c.reset}` : '';
        lines.push(`  ${arr} ${box} ${hi}${o.icon} ${o.name}${c.reset}${tag}`);
      }
      lines.push(`  ${c.dim}${'─'.repeat(56)}${c.reset}`);
      lines.push(`  ${c.dim}↑↓ move  Space select  Enter confirm  a toggle all${c.reset}`);
      lines.push('');

      stdout.write('\x1B[2J\x1B[H');
      stdout.write(lines.join('\n') + '\n');
      stdout.write(`\x1B[${4 + cursor};1H`);
    }

    function cleanup() {
      done = true;
      stdin.removeListener('keypress', onKey);
      if (stdin.setRawMode) try { stdin.setRawMode(wasRaw === true); } catch {}
      stdout.write('\x1B[?25h');
    }

    function onKey(str, key) {
      if (done || !key) return;
      if (key.name === 'up' || key.name === 'k') { cursor = Math.max(0, cursor - 1); render(); }
      else if (key.name === 'down' || key.name === 'j') { cursor = Math.min(options.length - 1, cursor + 1); render(); }
      else if (key.name === 'space') {
        if (selected.has(cursor)) selected.delete(cursor);
        else selected.add(cursor);
        render();
      }
      else if (key.name === 'a') {
        if (selected.size === options.length) selected.clear();
        else for (let i = 0; i < options.length; i++) selected.add(i);
        render();
      }
      else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        resolve([...selected].map(i => options[i]));
      }
      else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        cleanup();
        resolve([]);
      }
    }
    stdin.on('keypress', onKey);
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

  console.log('');
  log(c.bold + c.white, '  APEX v2 — Senior Engineering Team');
  log(c.dim, '  =================================\n');

  // Step 1: Detect installed agents
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

  // Step 2: Build options — ALL agents displayed, NONE pre-selected
  const options = AGENTS.map(a => ({ ...a, detected: detectedIds.includes(a.id) }));

  let chosen;
  if (yesMode) {
    chosen = options.filter(o => o.detected);
    if (chosen.length === 0) { warn('No agents detected. Use interactive mode to choose.'); process.exit(1); }
    log(c.dim, `  Auto-selecting detected agents...\n`);
  } else {
    chosen = await picker(options, 'Select agents to install (Space to toggle, Enter to confirm):');
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

  // Step 4: Create apex/ directory with ALL shared APEX source files
  console.log('');
  log(c.cyan, '  Installing APEX shared files...\n');
  mkdir(APEX);

  // Copy AGENTS.md and .mcp.json into apex/ (with path fixing for .mcp.json)
  const agSrc = resolveSharedFile('AGENTS.md');
  if (agSrc && fs.existsSync(agSrc)) {
    copy(agSrc, path.join(APEX, 'AGENTS.md'));
    ok('apex/AGENTS.md');
  } else {
    warn('AGENTS.md not found — skipping');
  }

  const mcpSrc = resolveSharedFile('.mcp.json');
  if (mcpSrc && fs.existsSync(mcpSrc)) {
    copyFixed(mcpSrc, path.join(APEX, '.mcp.json'));
    ok('apex/.mcp.json');
  } else {
    warn('.mcp.json not found — MCP servers will not be configured');
  }

  if (dirExists(path.join(APEX_DIR, 'skills'))) {
    copyDir(path.join(APEX_DIR, 'skills'), path.join(APEX, 'skills'));
    ok('apex/skills/ (skills)');
  }

  if (dirExists(path.join(APEX_DIR, 'src'))) {
    copyDir(path.join(APEX_DIR, 'src'), path.join(APEX, 'src'));
    ok('apex/src/ (MCP servers & tools)');
  }

  if (dirExists(path.join(APEX_DIR, 'adapters'))) {
    copyDir(path.join(APEX_DIR, 'adapters'), path.join(APEX, 'adapters'));
    ok('apex/adapters/');
  }

  if (dirExists(path.join(APEX_DIR, 'agents'))) {
    copyDir(path.join(APEX_DIR, 'agents'), path.join(APEX, 'agents'));
    ok('apex/agents/ (10 agent definitions)');
  }

  if (dirExists(path.join(APEX_DIR, 'commands'))) {
    copyDir(path.join(APEX_DIR, 'commands'), path.join(APEX, 'commands'));
    ok('apex/commands/');
  }

  if (dirExists(path.join(APEX_DIR, '.opencode'))) {
    copyDir(path.join(APEX_DIR, '.opencode'), path.join(APEX, '.opencode'));
    ok('apex/.opencode/');
  }

  // Also copy .clinerules and root configs
  copy(path.join(APEX_DIR, '.clinerules'), path.join(APEX, '.clinerules'));
  ok('apex/.clinerules');

  copy(path.join(APEX_DIR, 'opencode.json'), path.join(APEX, 'opencode.json'));
  ok('apex/opencode.json');

  // Copy hooks/ directory
  if (dirExists(path.join(APEX_DIR, 'hooks'))) {
    copyDir(path.join(APEX_DIR, 'hooks'), path.join(APEX, 'hooks'));
    ok('apex/hooks/');
  }

  // Step 5: Install .mcp.json and AGENTS.md at project root (for agents that read from CWD)
  if (mcpSrc && fs.existsSync(mcpSrc)) {
    copyFixed(mcpSrc, path.join(CWD, '.mcp.json'));
    ok('.mcp.json (project root, paths fixed)');
  }
  if (agSrc && fs.existsSync(agSrc)) {
    copy(agSrc, path.join(CWD, 'AGENTS.md'));
    ok('AGENTS.md (project root)');
  }

  // Step 6: Install each chosen agent — configs go to PROJECT ROOT with paths fixed
  console.log('');
  log(c.cyan, '  Configuring agents...\n');

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
  log(c.bold + c.green, '  === Installation Complete ===');
  console.log('');
  log(c.white, `  Installed for ${summary.length} agent(s): ${summary.join(', ')}`);
  log(c.white, `  APEX files: ${APEX}/`);
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
