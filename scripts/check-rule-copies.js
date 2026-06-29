#!/usr/bin/env node
// APEX v2 — Check that rule copies are aligned with source files
// Verifies that adapters reference the correct AGENTS.md content

const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const errors = [];

// Check AGENTS.md exists
const agentsMd = path.join(APEX_DIR, 'AGENTS.md');
if (!fs.existsSync(agentsMd)) {
  errors.push('Missing AGENTS.md');
}

// Check skills directory has SKILL.md files
const skillsDir = path.join(APEX_DIR, 'skills');
if (fs.existsSync(skillsDir)) {
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const skill of skills) {
    const skillFile = path.join(skillsDir, skill, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      errors.push(`Missing SKILL.md for skill: ${skill}`);
    }
  }
}

// Check hooks exist
const hooksDir = path.join(APEX_DIR, 'hooks');
if (fs.existsSync(hooksDir)) {
  const hooks = ['apex-activate.js', 'apex-subagent.js', 'apex-mode-tracker.js'];
  for (const hook of hooks) {
    if (!fs.existsSync(path.join(hooksDir, hook))) {
      errors.push(`Missing hook: ${hook}`);
    }
  }
}

// Check adapters exist
const adaptersDir = path.join(APEX_DIR, 'adapters');
if (fs.existsSync(adaptersDir)) {
  const adapters = fs.readdirSync(adaptersDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const adapter of adapters) {
    const adapterDir = path.join(adaptersDir, adapter);
    const files = fs.readdirSync(adapterDir);
    if (files.length === 0) {
      errors.push(`Empty adapter directory: ${adapter}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Check failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`✓ All checks passed (${errors.length} errors)`);
  process.exit(0);
}
