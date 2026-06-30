// APEX v2 — Main export
// Usage: require('@asno-dev/apex')

const fs = require('fs');
const path = require('path');

const APEX_DIR = __dirname;

module.exports = {
  version: '3.0.0',
  dir: APEX_DIR,
  skillsDir: path.join(APEX_DIR, 'skills'),
  hooksDir: path.join(APEX_DIR, 'hooks'),
  adaptersDir: path.join(APEX_DIR, 'adapters'),

  // Get all agent names
  agents: ['arch', 'ui', 'debug', 'perf', 'sec', 'infra', 'nova', 'reed', 'review', 'flex'],

  // Get skill content for an agent
  getSkill(agentName) {
    const skillPath = path.join(APEX_DIR, 'skills', `apex-${agentName}`, 'SKILL.md');
    try {
      const content = fs.readFileSync(skillPath, 'utf8');
      const match = content.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
      return match ? match[1].trim() : content.trim();
    } catch {
      return null;
    }
  },

  // Get main APEX skill
  getMainSkill() {
    const skillPath = path.join(APEX_DIR, 'skills', 'apex', 'SKILL.md');
    try {
      const content = fs.readFileSync(skillPath, 'utf8');
      const match = content.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
      return match ? match[1].trim() : content.trim();
    } catch {
      return null;
    }
  },

  // Get adapter content for a specific agent
  getAdapter(agentName) {
    const adapterDir = path.join(APEX_DIR, 'adapters', agentName);
    if (!fs.existsSync(adapterDir)) return null;
    const files = fs.readdirSync(adapterDir);
    const result = {};
    for (const file of files) {
      result[file] = fs.readFileSync(path.join(adapterDir, file), 'utf8');
    }
    return result;
  },

  // List all available adapters
  listAdapters() {
    const adapterDir = path.join(APEX_DIR, 'adapters');
    return fs.readdirSync(adapterDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  },

  // Get AGENTS.md content
  getAgentsMd() {
    try {
      return fs.readFileSync(path.join(APEX_DIR, 'AGENTS.md'), 'utf8');
    } catch {
      return null;
    }
  },
};
