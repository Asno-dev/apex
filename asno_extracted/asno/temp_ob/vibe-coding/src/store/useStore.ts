import { create } from 'zustand';
import { Message, ProjectData } from '../types';

export type AIProvider = 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'groq' 
  | 'xai' 
  | 'deepseek' 
  | 'mistral' 
  | 'cohere' 
  | 'together' 
  | 'perplexity' 
  | 'huggingface' 
  | 'ollama' 
  | 'lmstudio' 
  | 'openrouter' 
  | 'moonshot' 
  | 'hyperbolic' 
  | 'github' 
  | 'bedrock' 
  | 'openailike' 
  | 'aicredits';

export interface Model {
  id: string;
  name: string;
  provider: AIProvider;
  enabled: boolean;
}

/* ── Agent Event Types ── */
export type AgentEventType =
  | 'thinking'
  | 'planning'
  | 'acting'
  | 'observing'
  | 'repairing'
  | 'reporting'
  | 'complete'
  | 'error'
  | 'tool_called'
  | 'tool_result'
  | 'artifact_created'
  | 'artifact_updated'
  | 'file_created'
  | 'file_updated'
  | 'verified'
  | 'run_title'
  | 'todo_roadmap'
  | 'todo_focus'
  | 'thought_stream'
  | 'sub_agents_update'
  | 'coding_action';

export type CodingVerb =
  | 'Analyzing'
  | 'Analyzed'
  | 'Creating'
  | 'Created'
  | 'Editing'
  | 'Edited';

export interface RoadmapTodo {
  id: string;
  title: string;
}

export interface AgentEvent {
  id: string;
  type: AgentEventType;
  label: string;
  createdAt: number;
  status?: 'running' | 'done' | 'error' | 'blocked';
  summary?: string;
  toolName?: string;
  observation?: string;
  artifactId?: string;
  file?: string;
  content?: string;
  diff?: { added: number; removed: number };
  agentName?: string;
  startedAt?: number;
  completedAt?: number;
  reasoning?: {
    title: string;
    summary: string;
    startedAt?: number;
    completedAt?: number;
  };
  /** run_title */
  title?: string;
  /** todo_roadmap */
  todos?: RoadmapTodo[];
  /** todo_focus */
  todoId?: string;
  /** thought_stream */
  phase?: 'thinking' | 'thoughts';
  text?: string;
  details?: string;
  /** coding_action */
  verb?: CodingVerb | string;
  path?: string;
  additions?: number;
  deletions?: number;
  lineStart?: number;
  lineEnd?: number;
  /** reporting */
  nextSteps?: string[];
  whatChanged?: string[];
  /** sub_agents_update */
  subAgents?: SubAgentStatus[];
}

export interface SubAgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'thinking' | 'working' | 'completed' | 'error' | 'waiting';
  detail: string;
  updatedAt: number;
}

/* ── Tool Connection ── */
export interface ToolConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
}

/* ── Legacy Action Types (kept for compatibility) ── */
export type ActionType =
  | 'thinking' | 'thought'
  | 'analyzing' | 'analyzed'
  | 'exploring' | 'explored'
  | 'creating' | 'created'
  | 'editing' | 'edited'
  | 'running' | 'ran'
  | 'verifying' | 'verified'
  | 'planning' | 'planned'
  | 'idle';

export interface AgentAction {
  id: string;
  type: ActionType;
  label: string;
  content?: string;
  file?: string;
  duration?: number;
  startTime?: number;
  endTime?: number;
  diff?: {
    added: number;
    removed: number;
  };
  subSteps?: AgentAction[];
  agentName?: string;
}

interface AppState {
  messages: Message[];
  input: string;
  isGenerating: boolean;
  currentProject: ProjectData | null;
  versions: ProjectData[];
  projectType: 'vite' | 'nextjs';
  fullstackPreviewUrl: string;
  isDevServerRunning: boolean;
  viewMode: 'code' | 'preview' | 'artifacts' | 'desktop' | 'computer' | 'document' | 'excel' | 'terminal' | 'console' | 'shell' | 'canvas' | 'new_tab';
  currentError: string | null;

  /* Bud Agent */
  budStatus: 'idle' | 'planning' | 'executing' | 'observing' | 'iterating' | 'done' | 'error';
  budPhaseLabel: string;

  previewDevice: 'full' | 'mobile';
  isFullscreen: boolean;

  provider: AIProvider;
  apiKeys: Record<AIProvider, string>;
  model: string;
  enabledModels: string[];
  isSettingsOpen: boolean;
  isSidebarOpen: boolean;
  isWorkspaceOpen: boolean;

  /* Agent Events (new) */
  agentEvents: AgentEvent[];
  subAgents: SubAgentStatus[];
  toolConnections: Record<string, ToolConnection>;

  /* Agent Actions (legacy) */
  agentActions: AgentAction[];
  isThinking: boolean;
  thinkingStartTime: number | null;

  connectedPlugins: Record<string, boolean>;
  pluginConfigs: Record<string, Record<string, string>>;
  setPluginConfig: (plugin: string, key: string, value: string) => void;

  /* ── Setters ── */
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setInput: (input: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentProject: (project: ProjectData | null) => void;
  addVersion: (project: ProjectData) => void;
  revertToVersion: (versionId: string) => void;
  setProjectType: (type: 'vite' | 'nextjs') => void;
  setFullstackPreviewUrl: (url: string) => void;
  setDevServerRunning: (running: boolean) => void;
  setViewMode: (mode: 'code' | 'preview' | 'artifacts' | 'desktop' | 'computer' | 'document' | 'excel' | 'terminal' | 'console' | 'shell' | 'canvas' | 'new_tab') => void;
  setCurrentError: (error: string | null) => void;

  /* Bud Agent */
  setBudStatus: (status: 'idle' | 'planning' | 'executing' | 'observing' | 'iterating' | 'done' | 'error') => void;
  setBudPhaseLabel: (label: string) => void;

  requestedFileToOpen: string | null;
  setRequestedFileToOpen: (file: string | null) => void;

  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  addFile: (path: string, content?: string) => void;
  deleteFile: (path: string) => void;

  requestedDocumentUrl: string | null;
  setRequestedDocumentUrl: (url: string | null) => void;

  setPreviewDevice: (device: 'full' | 'mobile') => void;
  setIsFullscreen: (full: boolean) => void;

  setProvider: (provider: AIProvider) => void;
  setApiKey: (provider: AIProvider, key: string) => void;
  setModel: (model: string) => void;
  toggleModel: (modelId: string) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setWorkspaceOpen: (isOpen: boolean) => void;

  /* Locking System */
  lockedFiles: Record<string, boolean>;
  toggleFileLock: (path: string) => void;

  /* Agent Events */
  addAgentEvent: (event: Omit<AgentEvent, 'createdAt'> & { createdAt?: number }) => void;
  clearAgentEvents: () => void;

  /* Sub Agents */
  setSubAgents: (updater: SubAgentStatus[] | ((prev: SubAgentStatus[]) => SubAgentStatus[])) => void;

  /* Legacy actions */
  setAgentActions: (updater: AgentAction[] | ((prev: AgentAction[]) => AgentAction[])) => void;
  addAgentAction: (action: AgentAction) => void;
  updateAgentAction: (id: string, updates: Partial<AgentAction>) => void;
  clearAgentActions: () => void;
  setThinking: (isThinking: boolean) => void;

  togglePlugin: (pluginId: string) => void;

  addDependency: (packageName: string, version?: string) => void;
  removeDependency: (packageName: string) => void;

  isBrowserEnabled: boolean;
  setBrowserEnabled: (enabled: boolean) => void;

  planMode: boolean;
  setPlanMode: (planMode: boolean) => void;

  documentMode: boolean;
  setDocumentMode: (documentMode: boolean) => void;

  excelMode: boolean;
  setExcelMode: (excelMode: boolean) => void;

  pluginsOpen: boolean;
  pluginsDefaultTab: 'skills' | 'providers';
  setPluginsOpen: (isOpen: boolean) => void;
  setPluginsDefaultTab: (tab: 'skills' | 'providers') => void;
}

const DEFAULT_MODELS = [
  'gemini-testing-model',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet-latest',
  'deepseek-chat',
  'deepseek-reasoner',
];

export const useStore = create<AppState>((set) => ({
  messages: [],
  input: '',
  isGenerating: false,
  currentProject: null,
  versions: [],
  projectType: 'nextjs',
  fullstackPreviewUrl: 'http://localhost:3002',
  isDevServerRunning: false,
  viewMode: 'preview',
  currentError: null,
  requestedFileToOpen: null,
  activeFile: null,
  requestedDocumentUrl: null,

  /* Bud Agent */
  budStatus: 'idle',
  budPhaseLabel: '',

  previewDevice: 'full',
  isFullscreen: false,

  provider: (['gemini', 'openai', 'anthropic', 'groq', 'xai', 'deepseek', 'mistral', 'cohere', 'together', 'perplexity', 'huggingface', 'ollama', 'lmstudio', 'openrouter', 'moonshot', 'hyperbolic', 'github', 'bedrock', 'openailike', 'aicredits'].includes(localStorage.getItem('ai_studio_provider') || '') ? localStorage.getItem('ai_studio_provider') : 'gemini') as AIProvider,
  apiKeys: {
    gemini: localStorage.getItem('ai_studio_key_gemini') || 'temporary',
    openai: localStorage.getItem('ai_studio_key_openai') || '',
    anthropic: localStorage.getItem('ai_studio_key_anthropic') || '',
    groq: localStorage.getItem('ai_studio_key_groq') || '',
    xai: localStorage.getItem('ai_studio_key_xai') || '',
    deepseek: localStorage.getItem('ai_studio_key_deepseek') || '',
    mistral: localStorage.getItem('ai_studio_key_mistral') || '',
    cohere: localStorage.getItem('ai_studio_key_cohere') || '',
    together: localStorage.getItem('ai_studio_key_together') || '',
    perplexity: localStorage.getItem('ai_studio_key_perplexity') || '',
    huggingface: localStorage.getItem('ai_studio_key_huggingface') || '',
    ollama: localStorage.getItem('ai_studio_key_ollama') || '',
    lmstudio: localStorage.getItem('ai_studio_key_lmstudio') || '',
    openrouter: localStorage.getItem('ai_studio_key_openrouter') || '',
    moonshot: localStorage.getItem('ai_studio_key_moonshot') || '',
    hyperbolic: localStorage.getItem('ai_studio_key_hyperbolic') || '',
    github: localStorage.getItem('ai_studio_key_github') || '',
    bedrock: localStorage.getItem('ai_studio_key_bedrock') || '',
    openailike: localStorage.getItem('ai_studio_key_openailike') || '',
    aicredits: localStorage.getItem('ai_studio_key_aicredits') || '',
  },
  model: localStorage.getItem('ai_studio_model') || 'gemini-testing-model',
  enabledModels: JSON.parse(localStorage.getItem('ai_studio_enabled_models') || 'null') || DEFAULT_MODELS,
  isSettingsOpen: false,
  isSidebarOpen: true,
  isWorkspaceOpen: true,
  lockedFiles: {},

  toggleFileLock: (path) => set((state) => ({
    lockedFiles: {
      ...state.lockedFiles,
      [path]: !state.lockedFiles[path]
    }
  })),

  /* Agent Events */
  agentEvents: [],
  subAgents: [],
  toolConnections: {},

  /* Legacy */
  agentActions: [],
  isThinking: false,
  thinkingStartTime: null,

  connectedPlugins: JSON.parse(localStorage.getItem('ai_studio_connected_plugins') || '{"github":true,"gmail":true,"googlecalendar":true}'),
  pluginConfigs: JSON.parse(localStorage.getItem('ai_studio_plugin_configs') || '{}'),

  setPluginConfig: (plugin, key, value) => {
    set((state) => {
      const nextConfigs = {
        ...state.pluginConfigs,
        [plugin]: {
          ...(state.pluginConfigs[plugin] || {}),
          [key]: value
        }
      };
      localStorage.setItem('ai_studio_plugin_configs', JSON.stringify(nextConfigs));
      return { pluginConfigs: nextConfigs };
    });
  },

  isBrowserEnabled: false,
  setBrowserEnabled: (isBrowserEnabled) => set({ isBrowserEnabled }),

  planMode: localStorage.getItem('ai_studio_plan_mode') === 'true',
  setPlanMode: (planMode) => {
    localStorage.setItem('ai_studio_plan_mode', String(planMode));
    set({ planMode });
  },

  documentMode: localStorage.getItem('ai_studio_document_mode') === 'true',
  setDocumentMode: (documentMode) => {
    localStorage.setItem('ai_studio_document_mode', String(documentMode));
    set({ documentMode });
  },

  excelMode: localStorage.getItem('ai_studio_excel_mode') === 'true',
  setExcelMode: (excelMode) => {
    localStorage.setItem('ai_studio_excel_mode', String(excelMode));
    set({ excelMode });
  },

  pluginsOpen: false,
  pluginsDefaultTab: 'skills',
  setPluginsOpen: (pluginsOpen) => set({ pluginsOpen }),
  setPluginsDefaultTab: (pluginsDefaultTab) => set({ pluginsDefaultTab }),

  setMessages: (updater) => set((state) => ({
    messages: typeof updater === 'function' ? updater(state.messages) : updater
  })),
  setInput: (input) => set({ input }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentProject: (project) => set((state) => {
    let nextActiveFile = state.activeFile;
    if (project && project.files) {
      const keys = Object.keys(project.files);
      if (!state.activeFile || !project.files[state.activeFile]) {
        const preferred = ['/src/App.tsx', '/App.tsx', '/src/App.js', '/App.js', '/src/main.tsx', '/index.html', '/index.tsx'];
        const found = preferred.find(p => project.files[p]);
        nextActiveFile = found || keys[0] || null;
      }
    } else {
      nextActiveFile = null;
    }
    return { currentProject: project, activeFile: nextActiveFile };
  }),
  addVersion: (project) => set((state) => ({
    versions: [...state.versions, project]
  })),
  revertToVersion: (versionId) => set((state) => {
    const version = state.versions.find(v => v.id === versionId);
    if (!version) return state;
    let nextActiveFile = state.activeFile;
    if (version.files) {
      const keys = Object.keys(version.files);
      if (!state.activeFile || !version.files[state.activeFile]) {
        const preferred = ['/src/App.tsx', '/App.tsx', '/src/App.js', '/App.js', '/src/main.tsx', '/index.html', '/index.tsx'];
        const found = preferred.find(p => version.files[p]);
        nextActiveFile = found || keys[0] || null;
      }
    }
    return { currentProject: version, projectType: version.projectType || 'vite', activeFile: nextActiveFile };
  }),
  setProjectType: (projectType) => set({ projectType }),
  setFullstackPreviewUrl: (fullstackPreviewUrl) => set({ fullstackPreviewUrl }),
  setDevServerRunning: (isDevServerRunning) => set({ isDevServerRunning }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentError: (currentError) => set({ currentError }),

  /* Bud Agent */
  setBudStatus: (budStatus) => set({ budStatus }),
  setBudPhaseLabel: (budPhaseLabel) => set({ budPhaseLabel }),

  setPreviewDevice: (previewDevice) => set({ previewDevice }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),

  setProvider: (provider) => {
    localStorage.setItem('ai_studio_provider', provider);
    set({ provider });
  },
  setApiKey: (provider, key) => {
    localStorage.setItem(`ai_studio_key_${provider}`, key);
    set((state) => ({
      apiKeys: { ...state.apiKeys, [provider]: key }
    }));
  },
  setModel: (model) => {
    localStorage.setItem('ai_studio_model', model);
    set({ model });
  },
  toggleModel: (modelId) => set((state) => {
    const next = state.enabledModels.includes(modelId)
      ? state.enabledModels.filter(id => id !== modelId)
      : [...state.enabledModels, modelId];
    localStorage.setItem('ai_studio_enabled_models', JSON.stringify(next));
    return { enabledModels: next };
  }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setWorkspaceOpen: (isWorkspaceOpen) => set({ isWorkspaceOpen }),

  /* Agent Events */
  addAgentEvent: (event) => set((state) => ({
    agentEvents: [...state.agentEvents, { ...event, createdAt: event.createdAt ?? Date.now() }]
  })),
  clearAgentEvents: () => set({ agentEvents: [] }),

  /* Sub Agents */
  setSubAgents: (updater) => set((state) => ({
    subAgents: typeof updater === 'function' ? updater(state.subAgents) : updater
  })),

  /* Legacy */
  setAgentActions: (updater) => set((state) => ({
    agentActions: typeof updater === 'function' ? (updater as any)(state.agentActions) : updater
  })),
  addAgentAction: (action) => set((state) => ({
    agentActions: [...state.agentActions, { ...action, startTime: action.startTime || Date.now() }]
  })),
  updateAgentAction: (id, updates) => set((state) => ({
    agentActions: state.agentActions.map(a => a.id === id ? { ...a, ...updates } : a)
  })),
  clearAgentActions: () => set({ agentActions: [] }),
  setThinking: (isThinking) => set((state) => ({
    isThinking,
    thinkingStartTime: isThinking ? Date.now() : state.thinkingStartTime
  })),

  togglePlugin: (pluginId: string) => set((state) => {
    const next = { ...state.connectedPlugins, [pluginId]: !state.connectedPlugins[pluginId] };
    localStorage.setItem('ai_studio_connected_plugins', JSON.stringify(next));
    
    const toolConns = { ...state.toolConnections };
    const isToggledOn = next[pluginId];
    
    if (isToggledOn) {
      toolConns[pluginId] = { id: pluginId, name: pluginId, status: 'connected' };
    } else {
      toolConns[pluginId] = { id: pluginId, name: pluginId, status: 'disconnected' };
    }
    return { connectedPlugins: next, toolConnections: toolConns };
  }),

  addDependency: (packageName, version = 'latest') => set((state) => {
    if (!state.currentProject) return state;
    const newProj = {
      ...state.currentProject,
      artifacts: state.currentProject.artifacts || {},
      dependencies: {
        ...state.currentProject.dependencies,
        [packageName]: version
      }
    };
    return {
      currentProject: newProj,
      versions: [...state.versions, newProj]
    };
  }),

  removeDependency: (packageName) => set((state) => {
    if (!state.currentProject) return state;
    const newDeps = { ...state.currentProject.dependencies };
    delete newDeps[packageName];
    const newProj = {
      ...state.currentProject,
      artifacts: state.currentProject.artifacts || {},
      dependencies: newDeps
    };
    return {
      currentProject: newProj,
      versions: [...state.versions, newProj]
    };
  }),

  setRequestedFileToOpen: (requestedFileToOpen) => set({ requestedFileToOpen }),
  setActiveFile: (activeFile) => set({ activeFile }),
  updateFileContent: (path, content) => set((state) => {
    if (!state.currentProject) return {};
    if (state.lockedFiles && state.lockedFiles[path]) {
      console.warn(`File locking system blocked editing of locked file: ${path}`);
      return {};
    }
    const updatedFiles = {
      ...state.currentProject.files,
      [path]: content
    };
    return {
      currentProject: {
        ...state.currentProject,
        files: updatedFiles,
        artifacts: state.currentProject.artifacts || {}
      }
    };
  }),
  addFile: (path, content = '') => set((state) => {
    if (!state.currentProject) return {};
    if (state.lockedFiles && state.lockedFiles[path]) {
      console.warn(`File locking system blocked overwriting of locked file: ${path}`);
      return {};
    }
    const updatedFiles = {
      ...state.currentProject.files,
      [path]: content
    };
    return {
      currentProject: {
        ...state.currentProject,
        files: updatedFiles,
        artifacts: state.currentProject.artifacts || {}
      },
      activeFile: path
    };
  }),
  deleteFile: (path) => set((state) => {
    if (!state.currentProject) return {};
    if (state.lockedFiles && state.lockedFiles[path]) {
      console.warn(`File locking system blocked deletion of locked file: ${path}`);
      return {};
    }
    const updatedFiles = { ...state.currentProject.files };
    delete updatedFiles[path];
    
    let nextActiveFile = state.activeFile;
    if (state.activeFile === path) {
      const keys = Object.keys(updatedFiles);
      const preferred = ['/src/App.tsx', '/App.tsx', '/src/App.js', '/App.js', '/src/main.tsx', '/index.html', '/index.tsx'];
      const found = preferred.find(p => updatedFiles[p]);
      nextActiveFile = found || keys[0] || null;
    }
    
    return {
      currentProject: {
        ...state.currentProject,
        files: updatedFiles,
        artifacts: state.currentProject.artifacts || {}
      },
      activeFile: nextActiveFile
    };
  }),
  setRequestedDocumentUrl: (requestedDocumentUrl) => set({ requestedDocumentUrl }),
}));
