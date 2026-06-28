import { create } from 'zustand';

export interface ActionBlock {
  id: string;
  type: 'terminal' | 'editor' | 'search' | 'status' | 'file_op';
  label: string; // e.g. 'Execute Terminal | Build the React application'
  content: any; // Context-dependent content
  timestamp: number;
}

export interface TerminalSession {
  id: string;
  title: string;
  isConnected: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
  children?: FileNode[];
  isExpanded?: boolean;
}

export interface ExecutionStep {
  id: string;
  type: 'thinking' | 'planning' | 'tool_start' | 'tool_result' | 'error' | 'done';
  tool?: string;
  label?: string;
  message?: string;
  input?: string;
  output?: string;
  screenshot?: string;
  success?: boolean;
  iteration?: number;
  timestamp: number;
}

export interface ProcessInfo {
  pid: number;
  user: string;
  cpu: string;
  mem: string;
  command: string;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  memoryPercent: number;
  loadAverage: number[];
  diskUsage?: { total: string; used: string; available: string; percent: string };
}

interface ComputerState {
  // Connection
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
  computerUrl: string;
  setComputerUrl: (url: string) => void;

  // Terminal
  terminalSessions: TerminalSession[];
  activeTerminalId: string | null;
  addTerminalSession: (session: TerminalSession) => void;
  removeTerminalSession: (id: string) => void;
  setActiveTerminalId: (id: string | null) => void;

  // Unified Action Block Feed
  actionBlocks: ActionBlock[];
  addActionBlock: (block: Omit<ActionBlock, 'timestamp'>) => void;
  clearActionBlocks: () => void;
  currentAgentActivity: string;
  setCurrentAgentActivity: (activity: string) => void;

  // Files
  fileTree: FileNode[];
  setFileTree: (tree: FileNode[]) => void;
  selectedFile: string | null;
  setSelectedFile: (path: string | null) => void;
  fileContent: string | null;
  setFileContent: (content: string | null) => void;

  // Execution
  isExecuting: boolean;
  setExecuting: (executing: boolean) => void;
  executionSteps: ExecutionStep[];
  addExecutionStep: (step: Omit<ExecutionStep, 'timestamp'>) => void;
  clearExecutionSteps: () => void;
  taskInput: string;
  setTaskInput: (input: string) => void;

  // Processes
  processes: ProcessInfo[];
  setProcesses: (processes: ProcessInfo[]) => void;
  systemInfo: SystemInfo | null;
  setSystemInfo: (info: SystemInfo | null) => void;

  // Layout
  showExecutionPanel: boolean;
  setShowExecutionPanel: (show: boolean) => void;
  terminalHeight: number;
  setTerminalHeight: (height: number) => void;
  
  // Editor Sync
  isEditing: boolean;
  setEditing: (editing: boolean) => void;
}

export const useComputerStore = create<ComputerState>((set) => ({
  // Connection
  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),
  computerUrl: '', // Relative to current origin (proxied via server.ts)
  setComputerUrl: (computerUrl) => set({ computerUrl }),

  // Terminal
  terminalSessions: [],
  activeTerminalId: null,
  addTerminalSession: (session) =>
    set((s) => ({
      terminalSessions: [...s.terminalSessions, session],
      activeTerminalId: session.id,
    })),
  removeTerminalSession: (id) =>
    set((s) => ({
      terminalSessions: s.terminalSessions.filter((t) => t.id !== id),
      activeTerminalId: s.activeTerminalId === id
        ? s.terminalSessions.find((t) => t.id !== id)?.id || null
        : s.activeTerminalId,
    })),
  setActiveTerminalId: (activeTerminalId) => set({ activeTerminalId }),

  // Unified Action Block Feed
  actionBlocks: [],
  addActionBlock: (block) => set((s) => ({
    actionBlocks: [...s.actionBlocks, { ...block, timestamp: Date.now() }]
  })),
  clearActionBlocks: () => set({ actionBlocks: [] }),
  currentAgentActivity: 'Idle',
  setCurrentAgentActivity: (currentAgentActivity) => set({ currentAgentActivity }),

  // Files
  fileTree: [],
  setFileTree: (fileTree) => set({ fileTree }),
  selectedFile: null,
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  fileContent: null,
  setFileContent: (fileContent) => set({ fileContent }),

  // Execution
  isExecuting: false,
  setExecuting: (isExecuting) => set({ isExecuting }),
  executionSteps: [],
  addExecutionStep: (step) =>
    set((s) => {
      // Create corresponding action blocks for certain execution steps
      const newActionBlocks = [...s.actionBlocks];
      
      if (step.type === 'tool_start') {
        let blockType: ActionBlock['type'] = 'terminal';
        let content: any = step.input;
        let label = `Execute ${step.tool}`;

        if (step.tool === 'file_write') {
            blockType = 'editor';
            label = `Manus is using Editor │ Reading file ${step.input?.substring(0, 50)}...`;
            // Attempt to extract path and content from input string
            try {
              const inputObj = JSON.parse(step.input || '{}');
              content = { path: inputObj.path, code: inputObj.content, original: '' };
              if (inputObj.path) label = `Manus is using Editor │ Reading file ${inputObj.path}`;
            } catch {
              content = { path: 'unknown', code: step.input, original: '' };
            }
        } else if (step.tool?.includes('browser_navigate')) {
           blockType = 'search';
           label = `Manus is using Search │ Searching ${step.input}`;
           content = { query: step.input, results: [] };
        } else if (step.tool?.includes('http_fetch')) {
           blockType = 'search';
           label = `Manus is using Search │ Fetching ${step.input}`;
           content = { query: step.input, results: [] };
        } else if (step.tool === 'shell_exec') {
           blockType = 'terminal';
           // Extract first few words of the command for a cleaner label
           const cmdStr = step.input?.split('\n')[0] || step.input || "";
           label = `Execute Terminal │ ${cmdStr.substring(0, 40)}${cmdStr.length > 40 ? '...' : ''}`;
           content = { command: step.input, output: 'Running...', exitCode: undefined };
        }

        newActionBlocks.push({
            id: `block-${step.id}`,
            type: blockType,
            label,
            content,
            timestamp: Date.now()
        });
      } else if (step.type === 'tool_result') {
          // Update the last block of the same tool type if it exists
          // This is a simplified matching, assuming sequential execution
          const lastBlockIndex = newActionBlocks.length - 1;
          if (lastBlockIndex >= 0) {
              const lastBlock = newActionBlocks[lastBlockIndex];
              if (lastBlock.type === 'terminal') {
                  lastBlock.content = { ...lastBlock.content, output: step.output, exitCode: step.success ? 0 : 1 };
              } else if (lastBlock.type === 'search') {
                  lastBlock.content = { ...lastBlock.content, results: [{ title: 'Result', description: step.output?.substring(0,200) + '...'}] };
              }
          }
      } else if (step.type === 'thinking' || step.type === 'planning') {
          newActionBlocks.push({
              id: `block-${step.id}`,
              type: 'status',
              label: `Agent is ${step.type}...`,
              content: step.message,
              timestamp: Date.now()
          })
      }

      return {
        executionSteps: [...s.executionSteps, { ...step, timestamp: Date.now() }],
        actionBlocks: newActionBlocks
      };
    }),
  clearExecutionSteps: () => set({ executionSteps: [], actionBlocks: [] }),
  taskInput: '',
  setTaskInput: (taskInput) => set({ taskInput }),

  // Processes
  processes: [],
  setProcesses: (processes) => set({ processes }),
  systemInfo: null,
  setSystemInfo: (systemInfo) => set({ systemInfo }),

  // Layout
  showExecutionPanel: false,
  setShowExecutionPanel: (showExecutionPanel) => set({ showExecutionPanel }),
  terminalHeight: 250,
  setTerminalHeight: (terminalHeight) => set({ terminalHeight }),

  // Editor Sync
  isEditing: false,
  setEditing: (isEditing) => set({ isEditing }),
}));
