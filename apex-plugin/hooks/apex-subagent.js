#!/usr/bin/env node
// APEX v2 — Subagent injection hook
// Injects APEX agent context into subagents when they start

const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(APEX_DIR, 'skills');

function getAgentSkill(agentName) {
  const skillPath = path.join(SKILLS_DIR, `apex-${agentName}`, 'SKILL.md');
  try {
    const skill = fs.readFileSync(skillPath, 'utf8');
    const match = skill.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
    return match ? match[1].trim() : skill.trim();
  } catch {
    return null;
  }
}

// Extract agent name from environment or args
const agentName = process.env.APEX_AGENT || process.argv[2];
if (agentName) {
  const instructions = getAgentSkill(agentName);
  if (instructions) {
    process.stdout.write(JSON.stringify({
      type: 'subagent-injection',
      agent: agentName,
      content: instructions
    }));
  }
}

module.exports = { getAgentSkill };
