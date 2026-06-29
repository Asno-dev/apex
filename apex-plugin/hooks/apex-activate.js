#!/usr/bin/env node
// APEX v2 — Session activation hook
// Injects APEX team instructions into system prompt on session start

const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const STATE_DIR = path.join(APEX_DIR, 'adapters');
const STATE_PATH = path.join(STATE_DIR, '.apex-active');
const SKILL_PATH = path.join(APEX_DIR, 'skills', 'apex', 'SKILL.md');

function readMode() {
  try { return fs.readFileSync(STATE_PATH, 'utf8').trim() || 'team'; }
  catch { return 'team'; }
}

function getInstructions() {
  try {
    const skill = fs.readFileSync(SKILL_PATH, 'utf8');
    // Strip YAML frontmatter
    const match = skill.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
    return match ? match[1].trim() : skill.trim();
  } catch {
    return null;
  }
}

// Run on import (hook pattern)
const mode = readMode();
if (mode !== 'off') {
  const instructions = getInstructions();
  if (instructions) {
    // Output for the hook system to consume
    if (process.env.APEX_HOOK_OUTPUT) {
      fs.writeFileSync(process.env.APEX_HOOK_OUTPUT, JSON.stringify({
        type: 'system-injection',
        content: instructions,
        mode
      }));
    }
    process.stdout.write(JSON.stringify({ injected: true, mode }));
  }
}

module.exports = { readMode, getInstructions };
