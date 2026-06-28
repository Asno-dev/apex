// ── Agent Response Types ──────────────────────────────────────────────────────

export type TodoStatus = 'pending' | 'thinking' | 'in-progress' | 'completed' | 'error';
export type ActionStatus = 'active' | 'completed' | 'error';

export interface ThoughtBlock {
  id: string;
  content: string;
  timestamp: number;
}

export interface FileChange {
  path: string;
  action: 'created' | 'edited' | 'read' | 'deleted';
  additions: number;
  deletions: number;
  content?: string;
  language?: string;
}

export interface ActionStep {
  id: string;
  tool: string;
  label: string;
  status: ActionStatus;
  input?: string;
  output?: string;
  file?: FileChange;
  timestamp: number;
}

export interface TodoItem {
  id: string;
  title: string;
  status: TodoStatus;
  thoughts: ThoughtBlock[];
  actions: ActionStep[];
  isExpanded: boolean;
}

export interface BudMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  // Agent-specific fields
  titleSummary?: string;
  todos?: TodoItem[];
  summary?: string;
  isStreaming?: boolean;
  iteration?: number;
  maxIterations?: number;
}

export interface ApiKeyConfig {
  provider: string;
  apiKey: string;
  model: string;
}

// ── SSE Event Types from Backend ─────────────────────────────────────────────

export interface SSEEvent {
  type: 'thinking' | 'planning' | 'tool_start' | 'tool_result' | 'done' | 'error';
  message?: string;
  tool?: string;
  label?: string;
  input?: string;
  output?: string;
  screenshot?: string;
  success?: boolean;
  iteration?: number;
  maxIterations?: number;
}

// ── File Extension → Language Map ────────────────────────────────────────────

export const EXT_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'tsx', '.js': 'javascript', '.jsx': 'jsx',
  '.py': 'python', '.css': 'css', '.html': 'html', '.json': 'json',
  '.md': 'markdown', '.yaml': 'yaml', '.yml': 'yaml', '.sh': 'bash',
  '.sql': 'sql', '.xml': 'xml', '.toml': 'toml', '.env': 'env',
  '.txt': 'text', '.rs': 'rust', '.go': 'go', '.java': 'java',
  '.cpp': 'cpp', '.c': 'c', '.rb': 'ruby', '.php': 'php',
};

// ── File Extension → Icon Emoji Map ─────────────────────────────────────────

export const EXT_ICON_MAP: Record<string, string> = {
  '.ts': '🟦', '.tsx': '⚛️', '.js': '🟨', '.jsx': '⚛️',
  '.py': '🐍', '.css': '🎨', '.html': '🌐', '.json': '📋',
  '.md': '📝', '.yaml': '⚙️', '.yml': '⚙️', '.sh': '🖥️',
  '.sql': '🗄️', '.xml': '📄', '.toml': '⚙️', '.env': '🔐',
  '.png': '🖼️', '.jpg': '🖼️', '.svg': '🎯', '.gif': '🖼️',
  '.lock': '🔒', '.gitignore': '👁️',
};

export function getFileIcon(filename: string): string {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return EXT_ICON_MAP[ext] || '📄';
}

export function getLanguage(filename: string): string {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return EXT_LANGUAGE_MAP[ext] || 'text';
}

export function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}
