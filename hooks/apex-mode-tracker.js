// APEX v2 — Mode tracker hook
// Tracks active mode and selected agents for the session
const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(APEX_DIR, '.apex-active');
const SELECT_FILE = path.join(APEX_DIR, '.apex-selected');

const mode = (() => {
  try { return fs.readFileSync(STATE_FILE, 'utf8').trim() || 'team'; }
  catch { return 'team'; }
})();

const selected = (() => {
  try { return fs.readFileSync(SELECT_FILE, 'utf8').trim().split(',').map(s => s.trim()).filter(Boolean); }
  catch { return []; }
})();

// Export mode info for other hooks
process.env.APEX_MODE = mode;
process.env.APEX_SELECTED = selected.join(',');

// Lightweight output for mode changes
if (process.argv.includes('--verbose')) {
  const status = `APEX mode: ${mode}${selected.length > 0 ? ` [${selected.join(', ')}]` : ''}`;
  console.log(status);
}
