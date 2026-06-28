/**
 * skills.ts — OpenCode-inspired Skills / AGENTS.md System
 * 
 * Allows loading project-specific instructions from AGENTS.md files
 * in the workspace. These act as custom rules for the agent when
 * working on a specific project.
 */

export interface SkillDefinition {
  name: string;
  source: string; // File path where it was loaded from
  content: string;
  loadedAt: number;
}

/** Files that are checked for project-specific agent instructions */
const INSTRUCTION_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'COPILOT.md',
  '.github/AGENTS.md',
  '.cursor/rules',
  'INSTRUCTIONS.md',
  'AI_RULES.md',
];

/**
 * Load project instructions from the workspace.
 * Checks for AGENTS.md, CLAUDE.md, etc. and returns their contents
 * as additional system prompt context.
 */
export async function loadProjectInstructions(
  computerUrl: string,
  workspacePath: string = '/workspace'
): Promise<SkillDefinition[]> {
  const skills: SkillDefinition[] = [];

  for (const file of INSTRUCTION_FILES) {
    try {
      const fullPath = `${workspacePath}/${file}`;
      const res = await fetch(
        `${computerUrl}/fs/read?path=${encodeURIComponent(fullPath)}`,
        { signal: AbortSignal.timeout(5_000) }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.content && typeof data.content === 'string' && data.content.trim()) {
          skills.push({
            name: file,
            source: fullPath,
            content: data.content.trim(),
            loadedAt: Date.now(),
          });
          console.log(`[Skills] Loaded project instructions from ${file}`);
        }
      }
    } catch {
      // File doesn't exist or sandbox isn't running — skip silently
    }
  }

  return skills;
}

/**
 * Format loaded skills into a prompt section that can be injected
 * into the agent's system prompt.
 */
export function formatSkillsForPrompt(skills: SkillDefinition[]): string {
  if (skills.length === 0) return '';

  const sections = skills.map(skill => {
    return `## Project Instructions (from ${skill.name})\n\n${skill.content}`;
  });

  return `\n\n# PROJECT-SPECIFIC INSTRUCTIONS\n\nThe following instructions were found in the workspace and MUST be followed:\n\n${sections.join('\n\n---\n\n')}`;
}

/**
 * Context compaction — summarize old conversation history to free
 * up context window space for longer autonomous runs.
 * 
 * Inspired by OpenCode's compaction agent.
 */
export function compactConversationHistory(
  observations: string[],
  maxLength: number = 20000
): { compacted: string; originalCount: number; keptCount: number } {
  const totalLength = observations.join('\n').length;
  
  if (totalLength <= maxLength) {
    return {
      compacted: observations.join('\n'),
      originalCount: observations.length,
      keptCount: observations.length,
    };
  }

  // Keep the first 2 and last 5 observations in full
  const keepFirst = 2;
  const keepLast = 5;
  
  if (observations.length <= keepFirst + keepLast) {
    // Not enough to compact, just truncate
    return {
      compacted: observations.join('\n').slice(0, maxLength),
      originalCount: observations.length,
      keptCount: observations.length,
    };
  }

  const firstObs = observations.slice(0, keepFirst);
  const lastObs = observations.slice(-keepLast);
  const middleObs = observations.slice(keepFirst, -keepLast);

  // Summarize middle observations
  const middleSummary = middleObs.map((obs, idx) => {
    // Truncate each middle observation to ~100 chars
    const truncated = obs.length > 120 ? obs.slice(0, 120) + '...' : obs;
    return `[${keepFirst + idx + 1}] ${truncated}`;
  }).join('\n');

  const compacted = [
    ...firstObs,
    `\n--- COMPACTED (${middleObs.length} observations summarized) ---\n${middleSummary}\n--- END COMPACTED ---\n`,
    ...lastObs,
  ].join('\n');

  return {
    compacted: compacted.slice(0, maxLength),
    originalCount: observations.length,
    keptCount: keepFirst + keepLast,
  };
}

/**
 * Detect if the context is getting too large and needs compaction.
 */
export function needsCompaction(contextText: string, maxContextChars: number = 80000): boolean {
  return contextText.length > maxContextChars * 0.7; // Compact at 70% of max
}
