// APEX v2 — Subagent context hook
// Injects agent-specific context into subagent sessions
const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(APEX_DIR, 'agents');

// Get agent name from env or args
const agentName = process.env.APEX_AGENT || process.argv[2] || '';

if (agentName && fs.existsSync(path.join(AGENTS_DIR, `${agentName}.md`))) {
  const content = fs.readFileSync(path.join(AGENTS_DIR, `${agentName}.md`), 'utf-8');
  // Strip YAML frontmatter
  const match = content.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
  const instructions = match ? match[1].trim() : content.trim();
  console.log(instructions);
} else {
  // Print agent not found message
  console.log(`APEX agent context requested but not loaded.`);
}
