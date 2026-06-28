export type ArtifactKind = 'docx' | 'xlsx' | 'pptx' | 'html' | 'png';

export type ArtifactData = {
  id: string;
  name: string;
  kind: ArtifactKind;
  path: string;
  previewPath?: string;
  status: 'ready' | 'rendered' | 'missing_tool' | 'error';
  issues?: string[];
  createdAt: number;
  updatedAt: number;
};

export type AgentRunSummary = {
  summary: string;
  iterations: number;
  changedFiles: string[];
  artifacts: string[];
  nextSteps?: string[];
};

export type ProjectData = {
  id: string;
  projectType?: 'vite' | 'nextjs';
  files: Record<string, string>;
  dependencies: Record<string, string>;
  artifacts: Record<string, ArtifactData>;
  lastRun?: AgentRunSummary;
  timestamp: number;
  description?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  project?: ProjectData;
  agentEvents?: any[];
  files?: { name: string; type: string; url: string; data?: string; }[];
};
