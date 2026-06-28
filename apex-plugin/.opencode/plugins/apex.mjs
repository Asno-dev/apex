// APEX v2 — OpenCode plugin. Orchestrator + 10 specialists. 3 modes.
// Dynamic peer activation. Zero idle tokens.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APEX_DIR = path.resolve(__dirname, '..', '..', '..');
const COMPOSIO_CONFIG = path.join(APEX_DIR, '.composio-config.json');

const statePath = path.join(__dirname, '..', '.apex-active');
const selectPath = path.join(__dirname, '..', '.apex-selected');

function readMode() {
  try { return fs.readFileSync(statePath, 'utf8').trim() || 'team'; }
  catch { return 'team'; }
}
function writeMode(m) { fs.mkdirSync(path.dirname(statePath), { recursive: true }); fs.writeFileSync(statePath, m); }

function readSelected() {
  try { return fs.readFileSync(selectPath, 'utf8').trim().split(',').map(s => s.trim()).filter(Boolean); }
  catch { return []; }
}
function writeSelected(agents) { fs.mkdirSync(path.dirname(selectPath), { recursive: true }); fs.writeFileSync(selectPath, agents.join(',')); }

// ── Task State Icons (dynamic per phase) ─────────────────────────
const STATE = {
  think: { icon: '\u{1F9E0}', label: 'Thinking' },
  explore: { icon: '\u{1F50D}', label: 'Exploring' },
  work: { icon: '\u{26A1}', label: 'Working' },
  fix: { icon: '\u{1F527}', label: 'Fixing' },
  verify: { icon: '\u{2705}', label: 'Verifying' },
  done: { icon: '\u{2728}', label: 'Complete' },
};

const AGENTS = {
  arch:  { badge: '[Arch]', name: 'Max',     role: 'Architect',       peerOrder: ['sec','perf','infra','reed'] },
  ui:    { badge: '[UI]',   name: 'Zara',    role: 'UI Painter',       peerOrder: ['arch','perf','infra'] },
  debug: { badge: '[Dbg]',  name: 'Kai',     role: 'Debugger',         peerOrder: ['sec','perf','arch'] },
  perf:  { badge: '[Perf]', name: 'Rex',     role: 'Performance',      peerOrder: ['sec','arch','infra','ui'] },
  sec:   { badge: '[Sec]',  name: 'Vex',     role: 'Security',         peerOrder: ['arch','infra','perf','review'] },
  infra: { badge: '[Inf]',  name: 'Io',      role: 'Infrastructure',   peerOrder: ['sec','arch','perf','nova'] },
  nova:  { badge: '[Nov]',  name: 'Nova',    role: 'Creative',         peerOrder: ['reed','arch','perf','sec'] },
  reed:  { badge: '[Res]',  name: 'Dr.Reed', role: 'Researcher',       peerOrder: ['arch','perf','nova'] },
  review:{ badge: '[Rev]',  name: 'Rila',    role: 'Reviewer',         peerOrder: ['sec','perf','arch','ui'] },
  flex:  { badge: '[Fnd]',  name: 'Flex',    role: 'Founder',          peerOrder: ['arch','infra','perf','sec'] },
};

const aLine = (tag) => {
  const a = AGENTS[tag];
  return `${a.badge} @${tag} ${a.name} — ${a.role}.`;
};

// Compact high-signal instructions — 60% fewer chars than v1
const TEAM_INSTRUCTIONS = `
APEX v2 — 10-agent engineering team. Route→work→peer→shutdown.

TEAM:
${aLine('arch')}
${aLine('ui')}
${aLine('debug')}
${aLine('perf')}
${aLine('sec')}
${aLine('infra')}
${aLine('nova')}
${aLine('reed')}
${aLine('review')}
${aLine('flex')}

TASK STATES — show ONE icon at a time based on current action:
${STATE.think.icon}=Thinking  ${STATE.explore.icon}=Exploring  ${STATE.work.icon}=Working
${STATE.fix.icon}=Fixing  ${STATE.verify.icon}=Verifying  ${STATE.done.icon}=Complete

FORMAT: {icon} {badge} {one-liner action} then output. When done: ${STATE.done.icon} {badge} Shutdown.

ROUTING:
code/refactor→@arch  ui/component→@ui  bug/error→@debug  slow/perf→@perf
auth/sec→@sec  deploy/CI→@infra  creative→@nova  research→@reed
review/PR→@review  scope/MVP→@flex  full-app→arch→ui→infra  patch→debug→review
tools/send/email/drive/github→@composio  @toolName→auto-routes-to-composio

MODES:
1. DIRECT @agent = main. Call @peerName.
2. TEAM (default) Route→work→call peers dynamically.
3. SELECT /apex select a,b → only those.

LAWS:
1. Read→grep→fix at composition point.
2. Diff output only. No preambles.
3. Self-review: shortest path? patterns used? edge cases?
4. Shutdown after output. No idle turns.
5. Comment→rename. Twice→extract. Inherit→compose.
6. ≤5% token budget.

PEERS: Any agent calls @peer anytime. Peer has full authority, can call further peers. Direct P2P, never re-orchestrate. Peer shuts down after output, control returns.

UI (Zara): 5-color :root vars. 2 fonts. shadcn/ui. Tailwind scale. WCAG AA. 200ms. Semantic HTML.
REFACTOR (Max): Comment→rename. Twice→extract. Inherit→compose. 20+→abstraction. Boolean→split. Nested→pipe.
`.trim();

export function parseCommandFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const description = match[1].match(/description:\s*(.+)/)?.[1]?.trim();
  return { description, template: match[2].trim() };
}

export default async ({ client } = {}) => {
  const log = (level, msg) => {
    try { client?.app?.log({ body: { service: 'apex', level, message: msg } }); } catch {}
  };

  const skillsDir = path.resolve(__dirname, '../../.claude/skills');

  return {
    config: async (config) => {
      if (!config.command) config.command = {};
      const cmdDir = path.join(__dirname, '..', 'command');
      try {
        for (const file of fs.readdirSync(cmdDir).filter(f => f.endsWith('.md'))) {
          const name = path.basename(file, '.md');
          const parsed = parseCommandFile(path.join(cmdDir, file));
          if (parsed) config.command[name] = parsed;
        }
      } catch {}

      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    'experimental.chat.system.transform': async (_input, output) => {
      const mode = readMode();
      if (mode === 'off') return;
      const selected = mode === 'select' ? readSelected() : [];
      let instructions = TEAM_INSTRUCTIONS;
      if (mode === 'select') {
        instructions = instructions.replace('TEAM (default)', `TEAM (select: ${selected.join(',')})`);
      }

      let composioSection = ''
      try {
        if (fs.existsSync(COMPOSIO_CONFIG)) {
          const cfg = JSON.parse(fs.readFileSync(COMPOSIO_CONFIG, 'utf-8'))
          const tools = cfg.connectedTools || []
          if (tools.length > 0) {
            const mentions = tools.map(s => `@${s}`).join(', ')
            composioSection = `\nCONNECTED TOOLS: ${mentions}\nUse @composio or @toolName to invoke.`
          }
        }
      } catch {}

      if (composioSection) instructions += composioSection
      output.system.push(instructions);
    },

    'command.execute.before': async (input, output) => {
      if (!input || input.command !== 'apex') return;
      const args = (input.arguments || '').trim().toLowerCase();
      const parts = args.split(/\s+/);
      let handled = false;

      if (['off', 'team', 'full', 'on'].includes(args)) {
        writeMode(args === 'on' || args === 'full' ? 'team' : args);
        log('info', 'apex ' + args);
        handled = true;
      } else if (parts[0] === 'select' && parts.length > 1) {
        const agents = parts.slice(1).join('').split(',').map(s => s.trim()).filter(Boolean);
        if (agents.length > 0) {
          writeMode('select');
          writeSelected(agents);
          log('info', 'apex select: ' + agents.join(', '));
        }
        handled = true;
      } else if (args === 'help' || args === '') {
        log('info', 'APEX v2 \u2014 10 agents: @arch Max, @ui Zara, @debug Kai, @perf Rex, @sec Vex, @infra Io, @nova Nova, @reed Dr.Reed, @review Rila, @flex Flex. Modes: Direct (@agent), Team (dynamic peers), Select (/apex select a,b). /apex off.');
        handled = true;
      } else if (parts[0] === 'status') {
        const mode = readMode();
        const selected = mode === 'select' ? readSelected() : [];
        log('info', `apex mode: ${mode}${selected.length ? ' [' + selected.join(', ') + ']' : ''}`);
        handled = true;
      }

      if (handled && output) output.cancelled = true;
    },
  };
};
