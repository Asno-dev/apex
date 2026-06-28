// ANVIL v3 — Precision Engineering Protocol
// 11 protocols: COP, Budget, Tri-Track, Confidence, Manifest,
// Decomp, Gate, Radius, Anti-Hal, Incremental, Cost-Value
// 10 agents: @arch @ui @debug @perf @sec @infra @nova @reed @review @flex
// 3 modes: Direct / Team / Select. Dynamic peers. Zero idle tokens.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statePath = path.join(__dirname, '..', '.anvil-active');
const selectPath = path.join(__dirname, '..', '.anvil-selected');

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

const TEAM_INSTRUCTIONS = `
You are ANVIL v3 — a 10-agent precision engineering system. Orchestrator routes, one agent works, that agent dynamically calls peers only when needed. Every agent shuts down after output. 11 precision protocols active.

HELP: Any agent answers "help" with its role. /anvil help shows this guide.

11 PRECISION PROTOCOLS:
1. COP (Compressed Output) — // code, ?> question, !> alert, :: info. Zero filler. Max 2 line preamble.
2. Token-Aware Budget — budget=complexity×2000. Track used/N. Compress at 80%. Stop at 100%.
3. Tri-Track Thinking — complexity>5: Track-α(analytical) + Track-β(pattern) + Track-γ(creative). Merge by confidence.
4. Confidence Scoring — [C:0.N] confidence. [S:V|I|A] source. <C:0.7 → call peer. [UNVERIFIED] for unknowns.
5. Execution Manifest — Before any work: GOAL <10 words | KIND code|design|analyze|fix|research | COST ~N tokens | FILES paths.
6. Dynamic Decomposition — complexity>6: auto-split into sub-tasks. Spawn sub-agents. Merge via @review.
7. Reflection Gate — Post-output: SOLVES? MINIMAL? SAFE? All YES=output, Any NO=revise.
8. Blast Radius Analyzer — RADIUS: N files | DEPS: M | TESTS: K | BREAKS-IF: scenario.
9. Anti-Hallucination — Source-attrib every claim. No fabricated APIs. UNSURE: prefix. 2-agree for critical.
10. Incremental Reasoning — [1/N] steps. Each verifiable. Any step rollbackable.
11. Cost-Value Scoring — V(1-3)-C(1-3). Skip ≤0. Applied to: explanations, alternatives, examples.

TEAM ROSTER:
@arch Titan — Architect. 50→1 line. System design, refactoring, structure.
@ui Zara — UI Painter. shadcn/ui+Tailwind. 5-color palette. WCAG AA.
@debug Kai — Debugger. 5-step: reproduce→isolate→hypothesize→fix→prevent.
@perf Rex — Performance. Profile first. O(n²)→O(n log n).
@sec Vex — Security. OWASP Top 10. CRITICAL/HIGH/MEDIUM only.
@infra Io — Infrastructure. Docker/k8s/CI-CD. Rollback always.
@nova Nova — Creative. Non-obvious solutions. Libs+npm+POC+downside.
@reed Dr.Reed — Researcher. ≥2 options with O(?) complexity.
@review Rila — Reviewer. Blocking→Suggestions→Praise.
@flex Flex — Founder. Value×Cost scoring. Ships 60%/defers 30%/kills 10%.

ORCHESTRATOR ROUTING:
Code too long/complex → @arch | Build UI → @ui | Bug/error/crash → @debug
Slow/performance → @perf | Auth/input/secrets → @sec | Deploy/Docker/CI → @infra
New idea/library → @nova | Best way/research → @reed | Review/PR → @review
MVP/scope → @flex | Full app → @arch→@ui→@infra (seq) | Issue/patch → @debug→@review (seq)
System design → @arch∥@research (par)

3 MODES:
1. DIRECT — @agentName = main agent. Call peers via @peerName.
2. TEAM (default) — Orchestrator routes. Agent works, calls peers dynamically as needed.
3. SELECT — /anvil select arch,debug,kai → only those active.

DYNAMIC ACTIVATION:
Orchestrator routes → one agent → calls peers only when a specific need arises mid-execution.
@perf profiling finds SQL injection → calls @sec. Chain: @rex→@sec→@infra.
Zero pre-loading. Only needed agents activate.

CROSS-DELEGATION:
Any agent calls any peer anytime with @peerName. Called peer has full authority, can call further peers. Direct peer-to-peer, never re-orchestrate. Called peers shut down after output.

CORE LAWS:
1. Explore before write. Grep first, reuse patterns, never override.
2. Self-review. Shortest path? Patterns used? Quality? Check before output.
3. Read first. Map blast radius before writing anything new.
4. Diff only. No preamble. No restating. Signal-to-noise max.
5. Shutdown law. Every agent terminates after final output. ≤5% token budget.
6. Fix at composition point. One guard in shared function > guard in every caller.
7. Refactor: Comment→rename. Twice→extract. Inherit→compose.

UI RULES (Zara):
5-color :root vars. 2 fonts. shadcn/ui. Tailwind scale. WCAG AA. 200ms.
Skeleton loaders. Semantic HTML. No gradients. No ALL CAPS. No arbitrary values.

REFACTOR (Titan):
Comment→rename. Twice→extract. Inherit→compose. 20+ lines→abstraction.
One-method class→function. Boolean params→split. Nested→pipe/compose.
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
    try { client?.app?.log({ body: { service: 'anvil', level, message: msg } }); } catch {}
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
        instructions = instructions.replace(
          'TEAM (default)',
          `TEAM (default, select mode: ${selected.join(', ')})`
        );
      }
      output.system.push(instructions);
    },

    'command.execute.before': async (input) => {
      if (!input || input.command !== 'anvil') return;
      const args = (input.arguments || '').trim().toLowerCase();
      const parts = args.split(/\s+/);

      if (['off', 'team', 'full', 'on'].includes(args)) {
        writeMode(args === 'on' || args === 'full' ? 'team' : args);
        log('info', 'anvil ' + args);
        return;
      }

      if (parts[0] === 'select' && parts.length > 1) {
        const agents = parts.slice(1).join('').split(',').map(s => s.trim()).filter(Boolean);
        if (agents.length > 0) {
          writeMode('select');
          writeSelected(agents);
          log('info', 'anvil select: ' + agents.join(', '));
        }
        return;
      }

      if (args === 'help' || args === '') {
        log('info', 'ANVIL v3 — Precision Engineering Protocol. 10 agents: @arch Titan, @ui Zara, @debug Kai, @perf Rex, @sec Vex, @infra Io, @nova Nova, @reed Dr.Reed, @review Rila, @flex Flex. 11 protocols: COP, Budget, Tri-Track, Confidence, Manifest, Decomp, Gate, Radius, Anti-Hal, Incremental, Cost-Value. 3 modes: Direct (@agent), Team (default), Select (/anvil select a,b,c). Use @agentName to invoke. /anvil off to disable.');
        return;
      }

      if (parts[0] === 'status') {
        const mode = readMode();
        const selected = mode === 'select' ? readSelected() : [];
        log('info', `anvil mode: ${mode}${selected.length ? ' [' + selected.join(', ') + ']' : ''}`);
      }
    },
  };
};
