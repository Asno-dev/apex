#!/usr/bin/env node
// APEX v2 — CLI installer
// Usage: npx @asno-dev/apex
// Detects installed agents and installs APEX for each one

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APEX_DIR = path.resolve(__dirname, '..');
const HOME = process.env.HOME || process.env.USERPROFILE;

const AGENTS = [
  { name: 'Claude Code', check: 'claude', configDir: '.claude', files: ['CLAUDE.md', '.claude/agents/', '.claude/skills/'] },
  { name: 'Cursor', check: 'cursor', configDir: '.cursor', files: ['.cursorrules', '.cursor/rules/'] },
  { name: 'OpenCode', check: 'opencode', configDir: '.opencode', files: ['opencode.json', '.opencode/plugins/', '.opencode/command/'] },
  { name: 'Cline/Kilo', check: null, files: ['.clinerules'] },
  { name: 'GitHub Copilot', check: null, files: ['.github/copilot-instructions.md'] },
  { name: 'Windsurf', check: null, files: ['.windsurf/rules.md'] },
  { name: 'Gemini CLI', check: 'gemini', files: ['gemini-extension.json', 'AGENTS.md'] },
  { name: 'Codex', check: 'codex', files: ['AGENTS.md'] },
  { name: 'Devin', check: 'devin', files: ['AGENTS.md'] },
  { name: 'Hermes', check: 'hermes', files: ['AGENTS.md'] },
  { name: 'Pi', check: 'pi', files: ['AGENTS.md'] },
  { name: 'Antigravity', check: 'agy', files: ['AGENTS.md'] },
  { name: 'Kiro', check: null, files: ['.kiro/steering/'] },
  { name: 'OpenClaw', check: 'clawhub', files: ['AGENTS.md'] },
  { name: 'CodeWhale', check: null, files: ['AGENTS.md'] },
  { name: 'Swival', check: 'swival', files: ['AGENTS.md'] },
];

function green(msg) { console.log(`\x1b[32m  ✓ ${msg}\x1b[0m`); }
function dim(msg) { console.log(`\x1b[2m  ~ ${msg}\x1b[0m`); }
function bold(msg) { console.log(`\x1b[1m${msg}\x1b[0m`); }

function hasCommand(cmd) {
  try { execSync(`which ${cmd}`, { stdio: 'ignore' }); return true; }
  catch { return false; }
}

function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    return true;
  } catch { return false; }
}

function copyDir(src, dest) {
  try {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    return true;
  } catch { return false; }
}

function installAgent(agent, destDir) {
  let installed = 0;
  for (const file of agent.files) {
    const src = path.join(APEX_DIR, file);
    const dest = path.join(destDir, file);
    if (fs.existsSync(src)) {
      if (file.endsWith('/')) {
        if (copyDir(src, dest)) installed++;
      } else {
        if (copyFile(src, dest)) installed++;
      }
    }
  }
  return installed > 0;
}

// Main
bold('\n  APEX v2 — Senior Engineering Team');
bold('  =================================\n');

const destDir = process.argv[2] || process.cwd();
const summary = [];

// Always install AGENTS.md
copyFile(path.join(APEX_DIR, 'AGENTS.md'), path.join(destDir, 'AGENTS.md'));
green('AGENTS.md (universal)');
summary.push('✓ AGENTS.md');

// Install for each detected agent
for (const agent of AGENTS) {
  if (agent.check && !hasCommand(agent.check)) {
    dim(`${agent.name}: not detected`);
    continue;
  }
  if (installAgent(agent, destDir)) {
    green(agent.name);
    summary.push(`✓ ${agent.name}`);
  } else {
    dim(`${agent.name}: files not found`);
  }
}

// Copy skills directory
const skillsDir = path.join(APEX_DIR, 'skills');
const destSkillsDir = path.join(destDir, '.claude', 'skills');
if (fs.existsSync(skillsDir)) {
  copyDir(skillsDir, destSkillsDir);
  green('Skills directory');
  summary.push('✓ Skills');
}

// Summary
bold('\n  === Summary ===');
summary.forEach(s => console.log(`  ${s}`));

bold('\n  === Quick Start ===');
console.log('  @arch refactor this         → Max compresses code');
console.log('  @ui build a login form      → Zara paints WCAG AA form');
console.log('  @debug fix this error       → Kai 5-step debug');
console.log('  @perf this is slow          → Rex profiles & optimizes');
console.log('  @sec review auth code       → Vex OWASP scans');
console.log('  @infra dockerize this       → Io outputs production config');
console.log('  @nova any ideas             → Nova proposes novel angles');
console.log('  @reed best caching          → Dr. Reed compares options');
console.log('  @review check this code     → Rila blocks/suggests/praises');
console.log('  @flex what\'s the MVP?       → Flex scores & cuts scope');
console.log('');

bold('  === Marketplace Installs ===');
console.log('  Claude Code:  /plugin marketplace add asno-dev/apex');
console.log('  Codex:        codex plugin marketplace add asno-dev/apex');
console.log('  Gemini CLI:   gemini extensions install https://github.com/asno-dev/apex');
console.log('  OpenCode:     add "@asno-dev/apex" to opencode.json plugins');
console.log('');
