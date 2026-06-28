/**
 * agents.ts — OpenCode-inspired Multi-Agent Registry (Cleaned)
 */

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  temperature: number;
  maxTokens: number;
  /** Whether this agent is visible in the UI */
  visible: boolean;
}

export const AGENT_REGISTRY: Record<string, AgentDefinition> = {};

/** Get an agent by ID */
export function getAgent(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY[id];
}

/** Get all visible agents (for UI display) */
export function getVisibleAgents(): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY).filter(a => a.visible);
}

/** Check if a tool is allowed for an agent */
export function isToolAllowed(agentId: string, toolName: string): boolean {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent) return false;
  return agent.tools.includes(toolName);
}

/** Select the best agent for a given task type */
export function selectAgent(taskType: 'code' | 'desktop' | 'research' | 'explore' | 'plan' | 'general'): AgentDefinition | undefined {
  const map: Record<string, string> = {
    code: 'build',
    desktop: 'desktop',
    research: 'scout',
    explore: 'explore',
    plan: 'plan',
    general: 'general',
  };
  return AGENT_REGISTRY[map[taskType]] || AGENT_REGISTRY.general;
}

/** Detect the task type from a user prompt */
export function detectTaskType(prompt: string): 'code' | 'desktop' | 'research' | 'explore' | 'plan' | 'general' {
  const lower = prompt.toLowerCase();
  
  // Desktop-related keywords
  if (/\b(desktop|firefox|browser|click|screenshot|open app|libreoffice|vscode|terminal|thunar|mouse|type on|scroll|gui)\b/i.test(lower)) {
    return 'desktop';
  }
  
  // Research keywords
  if (/\b(research|find out|look up|search for|documentation|api docs|how does .* work)\b/i.test(lower)) {
    return 'research';
  }
  
  // Explore keywords
  if (/\b(explore|analyze|inspect|understand|what files|project structure|show me the code)\b/i.test(lower)) {
    return 'explore';
  }
  
  // Plan keywords
  if (/\b(plan|design|architect|roadmap|strategy|break down|decompose)\b/i.test(lower)) {
    return 'plan';
  }
  
  // Code keywords (most requests)
  if (/\b(build|create|make|implement|add|fix|update|deploy|install|component|page|api|database|auth|landing|dashboard|app|website|fullstack|frontend|backend)\b/i.test(lower)) {
    return 'code';
  }
  
  return 'general';
}
