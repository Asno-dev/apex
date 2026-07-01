const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APEX_DIR = path.resolve(__dirname, '..', '..');
const SRC_DIR = path.join(APEX_DIR, 'apex', 'src');

const COMMANDS = {
  'apex-docs': { file: null, desc: 'Word documents via OfficeCLI' },
  'apex-excel': { file: null, desc: 'Excel spreadsheets via OfficeCLI' },
  'apex-ppt': { file: null, desc: 'PowerPoint via OfficeCLI' },
  'apex-composio-setup': { file: 'composio-setup.mjs', desc: 'Connect tools' },
  'apex-composio-status': { file: 'composio-status.mjs', desc: 'Show connected tools' },
  'apex-composio-sync': { file: 'composio-status.mjs', desc: 'Force sync' },
  'apex-mirage': { file: null, desc: 'Virtual filesystem' },
};

const command = process.argv[2] || process.env.COMMAND || '';
const name = command.trim().split(/\s+/)[0];
const args = command.trim().slice(name.length).trim();

const cmd = COMMANDS[name];
if (!cmd) { process.exit(0); }

if (cmd.file && fs.existsSync(path.join(SRC_DIR, cmd.file))) {
  try {
    const fullArgs = [path.join(SRC_DIR, cmd.file)];
    if (name === 'apex-composio-sync') fullArgs.push('--sync');
    if (args) fullArgs.push(args);
    execSync(`node "${fullArgs.join('" "')}"`, { stdio: 'inherit', timeout: 30000 });
  } catch {}
}
