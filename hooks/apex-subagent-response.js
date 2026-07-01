const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(APEX_DIR, '.apex-active');

const mode = (() => {
  try { return fs.readFileSync(STATE_FILE, 'utf8').trim() || 'team'; }
  catch { return 'team'; }
})();

process.env.APEX_MODE = mode;
