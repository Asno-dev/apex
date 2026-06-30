// APEX v2 — Universal activation hook
// Reads composio config and outputs team context for any coding agent
const fs = require('fs');
const path = require('path');

const APEX_DIR = path.resolve(__dirname, '..');
const COMPOSIO_CONFIG = path.join(APEX_DIR, '.composio-config.json');

let composioSection = '';
try {
  if (fs.existsSync(COMPOSIO_CONFIG)) {
    const cfg = JSON.parse(fs.readFileSync(COMPOSIO_CONFIG, 'utf-8'));
    const tools = cfg.connectedTools || cfg.connections?.map(c => c.tool) || [];
    if (tools.length > 0) {
      composioSection = `\n## Connected Composio Tools\n${tools.map(t => `- @${t}`).join('\n')}\nUse @toolName to invoke (e.g. @gmail, @github).`;
    }
  }
} catch (e) {
  // Composio not configured — skip
}

const teamContext = `
# APEX v2 — 10-Agent Senior Engineering Team

## Team
[Arch] @arch Max — Architect
[UI] @ui Zara — UI/UX Designer
[Dbg] @debug Kai — Debugger
[Perf] @perf Rex — Performance Engineer
[Sec] @sec Vex — Security Engineer
[Inf] @infra Io — Infrastructure Engineer
[Nov] @nova Nova — Creative
[Res] @reed Dr. Reed — Researcher
[Rev] @review Rila — Reviewer
[Fnd] @flex Flex — Founder

## 3 Modes
1. Direct @agent = main. Call @peerName.
2. Team (default) Route→work→call peers dynamically.
3. Select /apex select a,b → only those active.

## Commands
/docs — Word docs | /excel — Excel | /ppt — PowerPoint
/composio-setup — Connect tools | /composio-status — Check status
/mirage <cmd> — Virtual filesystem
/apex team|select|off|status — Mode control

## Task States
🧠=Thinking 🔍=Exploring ⚡=Working 🔧=Fixing ✅=Verifying ✨=Complete
${composioSection}
`;

console.log(teamContext.trim());
