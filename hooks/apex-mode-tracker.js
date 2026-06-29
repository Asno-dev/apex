#!/usr/bin/env node
// APEX v2 — Mode tracker hook
// Tracks /apex mode changes (team/direct/select/off)

const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const STATE_DIR = path.join(APEX_DIR, 'adapters');
const STATE_PATH = path.join(STATE_DIR, '.apex-active');
const SELECT_PATH = path.join(STATE_DIR, '.apex-selected');

function ensureDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function readMode() {
  try { return fs.readFileSync(STATE_PATH, 'utf8').trim() || 'team'; }
  catch { return 'team'; }
}

function writeMode(mode) {
  ensureDir();
  fs.writeFileSync(STATE_PATH, mode);
}

function readSelected() {
  try {
    return fs.readFileSync(SELECT_PATH, 'utf8').trim().split(',').map(s => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function writeSelected(agents) {
  ensureDir();
  fs.writeFileSync(SELECT_PATH, agents.join(','));
}

// Parse command from input
const input = process.env.APEX_INPUT || process.argv[2] || '';
const args = input.trim().toLowerCase().split(/\s+/);
let response = null;

if (['off', 'team', 'full', 'on'].includes(args[0])) {
  const mode = args[0] === 'on' || args[0] === 'full' ? 'team' : args[0];
  writeMode(mode);
  response = { action: 'mode-change', mode };
} else if (args[0] === 'select' && args.length > 1) {
  const agents = args.slice(1).join('').split(',').map(s => s.trim()).filter(Boolean);
  if (agents.length > 0) {
    writeMode('select');
    writeSelected(agents);
    response = { action: 'select', agents };
  }
} else if (args[0] === 'status' || args[0] === 'help' || args[0] === '') {
  const mode = readMode();
  const selected = mode === 'select' ? readSelected() : [];
  response = { action: 'status', mode, selected };
}

if (response) {
  process.stdout.write(JSON.stringify(response));
}

module.exports = { readMode, writeMode, readSelected, writeSelected };
