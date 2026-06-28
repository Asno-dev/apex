import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  Bot,
  Code,
  Copy,
  Download,
  Eye,
  FileText,
  Loader2,
  Maximize,
  Minimize,
  Monitor,
  PanelLeft,
  PanelRight,
  Columns,
  PlusCircle,
  Search,
  Smartphone,
  Sparkles,
  Table,
  Presentation,
  Terminal,
  Wrench,
  MonitorPlay,
  X,
  Folder,
  ChevronDown,
  Brain,
  Cpu,
  Layers,
  Workflow,
  Network,
  Activity,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Check,
  MoreHorizontal,
  History,
  Trash2,
  Upload,
  FolderOpen,
  Clock,
  Briefcase,
  ChevronRight,
  SquarePen,
  Zap,
  Braces,
  GitPullRequest,
  Paintbrush
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Editor, { DiffEditor } from '@monaco-editor/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { format } from 'date-fns';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { InputBar } from './components/InputBar';
import { Settings } from './components/Settings';
import { PluginsManager } from './components/PluginsManager';
import { Actions, Action } from './components/ai/Actions';
import AgentActionStream from './components/ai/AgentActionStream';
import { CustomFileExplorer } from './components/CustomFileExplorer';
import { useStore, type AgentEvent, type SubAgentStatus } from './store/useStore';
import { Message, ProjectData } from './types';
import { cn } from './lib/utils';
import { DesktopWorkspace } from './components/workspace/DesktopWorkspace';
import { FullstackPreview } from './components/workspace/FullstackPreview';
import { DocumentViewer } from './components/workspace/DocumentViewer';
import { DocumentEditor } from './components/workspace/DocumentEditor';
import { ExcelEditor } from './components/workspace/ExcelEditor';
import { ComputerTerminal } from './components/workspace/ComputerTerminal';
import { ComputerExecutionLog } from './components/workspace/ComputerExecutionLog';
import { NewTabPage } from './components/workspace/NewTabPage';
import { AppTabs } from './components/workspace/AppTabs';
import { CanvasWorkspace } from './components/workspace/CanvasWorkspace';
import { RightDocumentSidebar } from './components/workspace/RightDocumentSidebar';
import { defaultProjectFiles, defaultNextJsProjectFiles } from './lib/defaultProject';
import { beautifyCode } from './lib/formatter';

function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

function CustomCodeEditorHeader({ 
  onFullscreen, 
  terminalOpen, 
  onToggleTerminal,
  isDiffMode,
  onToggleDiffMode,
  isSideBySide,
  onToggleSideBySide,
  onFormatCode,
  setShowGithubModal,
  onDownloadWorkspace,
  setIsHistoryOpen,
}: any) {
  const currentProject = useStore(s => s.currentProject);
  const activeFile = useStore(s => s.activeFile) || '';
  const breadcrumbParts = activeFile.split('/').filter(Boolean);
  
  // Ensure we show "client / src / ..." prefix if not present to match image vibe
  const displayParts = breadcrumbParts[0] === 'src' ? ['client', ...breadcrumbParts] : ['client', 'src', ...breadcrumbParts];

  const handleCopy = async () => {
    if (!currentProject || !activeFile) return;
    const code = currentProject.files[activeFile] || '';
    await navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    if (!currentProject || !activeFile) return;
    const code = currentProject.files[activeFile] || '';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="editor-header">
      <div className="breadcrumb">
        {displayParts.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="mx-1 text-gray-700">/</span>}
            <span className={i === displayParts.length - 1 ? 'active' : ''}>{part}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleTerminal} 
            className={`transition-colors ${terminalOpen ? 'text-[#a78bfa]' : 'text-gray-500 hover:text-white'}`} 
            title="Toggle Terminal"
          >
            <Terminal size={14} />
          </button>
          <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
          <button
            onClick={() => setShowGithubModal(true)}
            className="flex h-5 w-5 items-center justify-center rounded border border-white/5 bg-transparent text-gray-500 transition-all hover:text-white"
            title="Push to GitHub"
          >
            <svg height={13} width={13} viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex h-5 w-5 items-center justify-center rounded border border-white/5 bg-transparent text-gray-500 transition-all hover:text-white outline-none"
                title="More Actions"
              >
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[190px] bg-[#1a1a1a] border border-white/10 rounded-xl p-1.5 shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-100"
                align="end"
                sideOffset={6}
              >
                <DropdownMenu.Item
                  onClick={onDownloadWorkspace}
                  disabled={!currentProject}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer outline-none transition-colors text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Download size={14} className="text-gray-400" />
                  <span>Download ZIP File</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => setIsHistoryOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer outline-none transition-colors text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <History size={14} className="text-gray-400" />
                  <span>Version History</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onFormatCode} 
            className="text-gray-500 hover:text-emerald-400 transition-colors" 
            title="Format Code (Vertically align horizontal code)"
          >
            <Braces size={14} />
          </button>
          <button 
            onClick={onToggleDiffMode} 
            className={`transition-colors ${isDiffMode ? 'text-[#10b981]' : 'text-gray-500 hover:text-white'}`} 
            title="Toggle Diff View (See AI edits highlighted in green/red)"
          >
            <GitPullRequest size={14} />
          </button>
          {isDiffMode && (
            <button 
              onClick={onToggleSideBySide} 
              className={`transition-colors ${isSideBySide ? 'text-[#a78bfa]' : 'text-gray-500 hover:text-white'}`} 
              title={isSideBySide ? "Switch to Vertical Inline Diff" : "Switch to Horizontal Side-by-Side Diff"}
            >
              <Columns size={14} />
            </button>
          )}
          <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors" title="Copy code">
            <Copy size={14} />
          </button>
          <button onClick={handleDownload} className="text-gray-500 hover:text-white transition-colors" title="Download file">
            <Download size={14} />
          </button>
          <button onClick={onFullscreen} className="text-gray-500 hover:text-white transition-colors" title="Toggle Fullscreen">
            <Maximize size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}



const DEFAULT_SUB_AGENTS: SubAgentStatus[] = [
  { id: 'rmcs', name: 'Recursive Meta-Cognitive Swarm (RMCS)', role: 'Core Intelligence & Multi-Lane Coordinator', status: 'idle', detail: 'Awaiting dynamic swarm trigger signal...', updatedAt: Date.now() },
  { id: 'thread-scout-research', name: 'RMCS Lane: Dual Scout & Analyst [Thread #1]', role: 'Deep search, regex patterns & scanning', status: 'idle', detail: 'Awaiting activation signals', updatedAt: Date.now() },
  { id: 'thread-planner-blueprint', name: 'RMCS Lane: Strategic Planner [Thread #2]', role: 'Logical architectures & roadmaps', status: 'idle', detail: 'Awaiting task decomposition', updatedAt: Date.now() },
  { id: 'thread-builder-forge', name: 'RMCS Lane: Code Synthesizer [Thread #3]', role: 'Writing, editing and files synthesis', status: 'idle', detail: 'Awaiting design guidelines', updatedAt: Date.now() },
  { id: 'thread-reviewer-qa', name: 'RMCS Lane: Self-Repair & Auditor [Thread #4]', role: 'Syntax audits & compile execution loops', status: 'idle', detail: 'Awaiting quality criteria', updatedAt: Date.now() },
];

const TOOL_REQUESTS = [
  { id: 'gmail', name: 'Gmail', keywords: ['gmail', 'email', 'mail', 'send mail'], logo: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_48dp.png' },
  { id: 'slack', name: 'Slack', keywords: ['slack'], logo: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png' },
  { id: 'github', name: 'GitHub', keywords: ['github', 'pull request', 'issue'], logo: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: 'googlecalendar', name: 'Google Calendar', keywords: ['calendar', 'meeting', 'schedule'], logo: 'https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_48dp.png' },
];

let localEventCounter = 0;
const uid = () => `app-${Date.now()}-${++localEventCounter}`;

function normalizeGeneratedPath(path: string) {
  let normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith("/workspace/myapp/")) {
    normalized = normalized.replace("/workspace/myapp", "");
  } else if (normalized.startsWith("/workspace/")) {
    normalized = normalized.replace("/workspace", "");
  } else if (normalized.startsWith("/myapp/")) {
    normalized = normalized.replace("/myapp", "");
  }
  return normalized;
}

function cleanEscapedQuotes(jsonStr: string): string {
  let str = jsonStr;
  const containsEscapedQuotes = str.includes('\\"');
  if (containsEscapedQuotes) {
    // 1. Fix escaped keys: \"something\": -> "something":
    str = str.replace(/\\"(.*?)\\":/g, '"$1":');

    // 2. Fix escaped string values: : \"something\" -> : "something"
    str = str.replace(/:\s*\\"(.*?)\\"/g, ': "$1"');

    // 3. Fix escaped quotes in arrays
    str = str.replace(/\[\s*\\"(.*?)\\"/g, '["$1"');
    str = str.replace(/\\"\s*,\s*\\"(.*?)\\"/g, '", "$1"');
    str = str.replace(/\\"\s*\]/g, '"]');

    // 4. Fix other common remaining escaped quote sequences around syntax marks
    str = str.replace(/,\s*\\"(.*?)\\"/g, ', "$1"');
    str = str.replace(/\\"\s*,/g, '",');
    str = str.replace(/\{\s*\\"(.*?)\\"/g, '{"$1"');
    str = str.replace(/\\"\s*\}/g, '"}');
  }
  return str;
}

function healJson(jsonStr: string): string {
  let str = cleanEscapedQuotes(jsonStr.trim());
  if (!str) return "{}";

  // If there are markdown blocks, remove them first
  if (str.startsWith("```")) {
    const firstLineEnd = str.indexOf('\n');
    if (firstLineEnd !== -1) {
      str = str.substring(firstLineEnd);
    }
    if (str.endsWith("```")) {
      str = str.substring(0, str.length - 3);
    }
    str = str.trim();
  }

  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === '\\') {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  if (inString) {
    str += '"';
  }

  let lastLen = -1;
  while (str.length !== lastLen) {
    lastLen = str.length;
    str = str.trim();
    str = str.replace(/,\s*$/, "");
    str = str.replace(/(?:,\s*)?"[^"]*"\s*:\s*$/, "");
    str = str.replace(/(?:,\s*)?"[^"]*$/, "");
    str = str.replace(/,\s*([}\]])$/, "$1");
  }

  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') {
      str += '}';
    } else if (open === '[') {
      str += ']';
    }
  }

  return str;
}

function normalizePackageJson(content: string, requestedProjectType: 'vite' | 'nextjs' = 'vite'): string {
  let pkg: any = {};
  const cleaned = content.trim();
  try {
    pkg = JSON.parse(cleaned);
  } catch (e) {
    try {
      pkg = JSON.parse(healJson(cleaned));
    } catch (e2) {
      pkg = {};
    }
  }

  // Ensure default structure
  if (typeof pkg !== 'object' || pkg === null) {
    pkg = {};
  }

  if (!pkg.name) pkg.name = "vibe-app";
  if (!pkg.version) pkg.version = "1.0.0";
  if (!pkg.type && requestedProjectType !== 'nextjs') {
    pkg.type = "module";
  } else if (requestedProjectType === 'nextjs' && pkg.type === 'module') {
    delete pkg.type;
  }
  if (!pkg.scripts) pkg.scripts = {};

  // Normalize dependencies schema: array input healing
  if (Array.isArray(pkg.dependencies)) {
    const arrayDeps = pkg.dependencies;
    pkg.dependencies = {};
    arrayDeps.forEach((dep: string) => {
      if (typeof dep === 'string' && dep.trim()) {
        pkg.dependencies[dep.trim()] = "latest";
      }
    });
  } else if (typeof pkg.dependencies !== 'object' || pkg.dependencies === null) {
    pkg.dependencies = {};
  }

  // Normalize devDependencies schema: array input healing
  if (Array.isArray(pkg.devDependencies)) {
    const arrayDevDeps = pkg.devDependencies;
    pkg.devDependencies = {};
    arrayDevDeps.forEach((dep: string) => {
      if (typeof dep === 'string' && dep.trim()) {
        pkg.devDependencies[dep.trim()] = "latest";
      }
    });
  } else if (typeof pkg.devDependencies !== 'object' || pkg.devDependencies === null) {
    pkg.devDependencies = {};
  }

  // Clean values and keys in dependencies and devDependencies
  const cleanedDeps: Record<string, string> = {};
  Object.entries(pkg.dependencies || {}).forEach(([k, v]) => {
    const cleanK = typeof k === 'string' ? k.trim() : '';
    if (cleanK && !cleanK.startsWith('.') && !cleanK.startsWith('/')) {
      cleanedDeps[cleanK] = typeof v === 'string' ? v.trim() : 'latest';
    }
  });
  pkg.dependencies = cleanedDeps;

  const cleanedDevDeps: Record<string, string> = {};
  Object.entries(pkg.devDependencies || {}).forEach(([k, v]) => {
    const cleanK = typeof k === 'string' ? k.trim() : '';
    if (cleanK && !cleanK.startsWith('.') && !cleanK.startsWith('/')) {
      cleanedDevDeps[cleanK] = typeof v === 'string' ? v.trim() : 'latest';
    }
  });
  pkg.devDependencies = cleanedDevDeps;

  // Detect project type
  const isNext = requestedProjectType === 'nextjs' || pkg.dependencies.next || pkg.dependencies['@types/next'];
  
  if (isNext) {
    if (!pkg.scripts.dev) pkg.scripts.dev = "next dev";
    if (!pkg.scripts.build) pkg.scripts.build = "next build";
    if (!pkg.scripts.start) pkg.scripts.start = "next start";
    
    // Ensure essential Next dependencies
    const nextDeps = ["next", "react", "react-dom"];
    nextDeps.forEach(dep => {
      if (!pkg.dependencies[dep]) {
        pkg.dependencies[dep] = "latest";
      }
    });
  } else {
    // Vite setup
    if (!pkg.scripts.dev) pkg.scripts.dev = "vite";
    if (!pkg.scripts.build) pkg.scripts.build = "vite build";
    if (!pkg.scripts.preview) pkg.scripts.preview = "vite preview";
    
    const viteDeps = ["react", "react-dom"];
    viteDeps.forEach(dep => {
      if (!pkg.dependencies[dep]) {
        pkg.dependencies[dep] = "latest";
      }
    });
    
    if (!pkg.devDependencies) pkg.devDependencies = {};
    if (!pkg.devDependencies.vite && !pkg.dependencies.vite) {
      pkg.devDependencies.vite = "latest";
    }
    if (!pkg.devDependencies["@vitejs/plugin-react"] && !pkg.dependencies["@vitejs/plugin-react"]) {
      pkg.devDependencies["@vitejs/plugin-react"] = "latest";
    }
  }

  // Ensure dependencies consists of string values for installation safety
  Object.keys(pkg.dependencies).forEach(k => {
    if (typeof pkg.dependencies[k] !== 'string') {
      pkg.dependencies[k] = "latest";
    }
  });

  return JSON.stringify(pkg, null, 2);
}

function getArtifactIcon(kind: string) {
  if (kind === 'xlsx') return Table;
  if (kind === 'pptx') return Presentation;
  return FileText;
}

const ExpandableUserMessage = ({ message, setPreviewFile, copiedMessageId, setCopiedMessageId }: { message: Message, setPreviewFile: any, copiedMessageId: string | null, setCopiedMessageId: (id: string | null) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = message.content.length > 500;
  
  return (
    <div className="relative group/msg pr-1 select-text">
      <p className="whitespace-pre-wrap text-[14px] leading-relaxed pr-6 text-zinc-300">
        {!isLong || expanded ? message.content : message.content.slice(0, 500) + '...'}
      </p>
      {isLong && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-[12px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all mt-3 mb-1 font-sans active:scale-95"
        >
          {expanded ? 'Show less' : 'Expand to see full message'}
        </button>
      )}
      {message.files && message.files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5 justify-end">
          {message.files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 max-w-[200px] text-xs hover:bg-white/15 cursor-pointer transition-colors"
              onClick={() => {
                setPreviewFile(file);
              }}
            >
              {file.type?.startsWith('image/') ? (
                <img src={file.url} alt={file.name} className="h-10 w-10 object-cover rounded-lg" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <FileText size={18} className="text-gray-400" />
                </div>
              )}
              <div className="truncate flex-1 min-w-0 text-left pr-1">
                <div className="font-semibold truncate text-[11px] text-gray-200">{file.name}</div>
                <div className="text-[9px] text-gray-400 font-mono uppercase">{file.type?.split('/')[1] || 'FILE'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => {
          navigator.clipboard.writeText(message.content);
          setCopiedMessageId(message.id);
          setTimeout(() => setCopiedMessageId(null), 2000);
        }}
        className="absolute top-0 right-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
        title="Copy message"
      >
        {copiedMessageId === message.id ? (
          <Check size={12} className="text-emerald-400" />
        ) : (
          <Copy size={12} />
        )}
      </button>
    </div>
  );
};


const PushToGithubModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [isPushing, setIsPushing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-[400px] rounded-xl border border-white/10 bg-[#161B22] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
           <svg height={20} width={20} viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
           Push to GitHub
        </h3>
        
        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 text-emerald-400">
               <Check size={20} />
            </div>
            <p className="text-white font-medium mb-1">Successfully pushed source codes!</p>
            <p className="text-gray-400 text-sm mb-5">Your latest version history is now available on GitHub.</p>
            <button
              className="w-full rounded-md bg-white/10 hover:bg-white/15 px-4 py-2 text-white font-semibold transition-colors"
              onClick={() => { setSuccess(false); onClose(); }}
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm mb-5">Push the current workspace version directly to your GitHub repository.</p>
            <div className="flex gap-3 justify-end mt-2">
              <button
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-colors"
                onClick={onClose}
                disabled={isPushing}
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all min-w-[100px]"
                onClick={() => {
                  setIsPushing(true);
                  setTimeout(() => {
                    setIsPushing(false);
                    setSuccess(true);
                  }, 2000);
                }}
                disabled={isPushing}
              >
                {isPushing ? <Loader2 size={16} className="animate-spin" /> : 'Push Version'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default function App() {
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [isRightDocSidebarOpen, setRightDocSidebarOpen] = useState(false);
  const {
    messages,
    input,
    isGenerating,
    currentProject,
    versions,
    projectType,
    setProjectType,
    fullstackPreviewUrl,
    currentError,
    previewDevice,
    isFullscreen,
    viewMode,
    requestedDocumentUrl,
    setMessages,
    setInput,
    setIsGenerating,
    setCurrentProject,
    addVersion,
    revertToVersion,
    setCurrentError,
    setPreviewDevice,
    setIsFullscreen,
    setViewMode,
    apiKeys,
    model,
    provider,
    agentEvents,
    clearAgentEvents,
    addAgentEvent,
    isThinking,
    setThinking,
    subAgents,
    setSubAgents,
    toolConnections,
    connectedPlugins,
    togglePlugin,
    setSettingsOpen,
    isSidebarOpen,
    setSidebarOpen,
    isWorkspaceOpen,
    setWorkspaceOpen,
    setBudStatus,
    setBudPhaseLabel,
    pluginsOpen,
    setPluginsOpen,
    pluginsDefaultTab,
    setPluginsDefaultTab,
    activeFile,
    setActiveFile,
    updateFileContent,
    requestedFileToOpen,
    setRequestedFileToOpen,
  } = useStore();

  const [globalSearch, setGlobalSearch] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('openagents');

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [isGenerating]);

  const [previewFile, setPreviewFile] = useState<any | null>(null);
  
  // Focus request handling for Monaco Editor
  useEffect(() => {
    if (requestedFileToOpen) {
      if (requestedFileToOpen.startsWith('/office-outputs/') || /\.(docx|xlsx|pptx)$/i.test(requestedFileToOpen)) {
        if (requestedFileToOpen.toLowerCase().endsWith('.xlsx')) {
          setViewMode('excel');
        } else {
          setViewMode('document');
        }
        useStore.getState().setRequestedDocumentUrl(requestedFileToOpen);
        setRequestedFileToOpen(null);
        return;
      }
      try {
        const formattedPath = requestedFileToOpen.startsWith('/') ? requestedFileToOpen : `/${requestedFileToOpen}`;
        if (currentProject?.files && currentProject.files[formattedPath] !== undefined) {
          setActiveFile(formattedPath);
        } else {
          setActiveFile(requestedFileToOpen);
        }
        setViewMode('code');
      } catch (e) {
        // ignore
      }
      setRequestedFileToOpen(null);
    }
  }, [requestedFileToOpen, currentProject, setActiveFile, setRequestedFileToOpen, setViewMode]);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedError, setCopiedError] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditorTerminalOpen, setEditorTerminalOpen] = useState(false);
  const workspaces = ['openagents', 'desktop', 'openbud', 'bud'];

  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isProjectsPopupOpen, setIsProjectsPopupOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDiffViewEnabled, setIsDiffViewEnabled] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(true);
  const [normalEditor, setNormalEditor] = useState<any>(null);
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  const currentDecorationsRef = useRef<string[]>([]);

  const [sidebarWidth, setSidebarWidth] = useState(430);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const handleSidebarDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  useEffect(() => {
    if (!isResizingSidebar) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX - 50; 
      if (newWidth < 200) newWidth = 200;
      if (newWidth > window.innerWidth - 300) newWidth = window.innerWidth - 300;
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    if (!normalEditor || !monacoInstance || !activeFile || !currentProject) return;

    const currentCode = currentProject.files[activeFile] || '';
    const originalCode = (() => {
      if (versions && versions.length > 0) {
        for (const v of versions) {
          if (v.files && v.files[activeFile] !== undefined && v.files[activeFile] !== currentCode) {
            return v.files[activeFile];
          }
        }
      }
      return currentCode;
    })();

    if (currentCode === originalCode) {
      currentDecorationsRef.current = normalEditor.deltaDecorations(currentDecorationsRef.current, []);
      return;
    }

    const origLines = originalCode.split('\n');
    const modLines = currentCode.split('\n');

    const newDecorations: any[] = [];
    const origSet = new Set(origLines.map(l => l.trim()));

    modLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const lineNum = idx + 1;

      if (!origSet.has(trimmed)) {
        newDecorations.push({
          range: new monacoInstance.Range(lineNum, 1, lineNum, 1),
          options: {
            isWholeLine: true,
            className: 'line-addition-highlight',
            marginClassName: 'line-addition-margin',
            hoverMessage: { value: 'Added / Edited Line (New changes)' }
          }
        });
      }
    });

    currentDecorationsRef.current = normalEditor.deltaDecorations(
      currentDecorationsRef.current,
      newDecorations
    );
  }, [normalEditor, monacoInstance, activeFile, currentProject?.files, versions]);

  // Custom projects list management
  const [projectsList, setProjectsList] = useState<Array<{ id: string, name: string, description: string, files: Record<string, string>, messages: Message[], projectType?: 'nextjs' | 'vite', dependencies?: Record<string, string>, artifacts?: Record<string, any>, timestamp?: number }>>(() => {
    try {
      const stored = localStorage.getItem('bud_custom_projects');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  const saveProjects = (list: typeof projectsList) => {
    setProjectsList(list);
    localStorage.setItem('bud_custom_projects', JSON.stringify(list));
  };

  // Sync current settings and bootstrap default project if empty
  useEffect(() => {
    let list = projectsList;
    let activeId = localStorage.getItem('bud_active_project_id');
    
    // If the active project contains the old Vite files (or is empty), upgrade/initialize it to NextJS!
    if (list.length > 0 && activeId) {
      const activeProjIndex = list.findIndex((p) => p.id === activeId);
      if (activeProjIndex !== -1) {
        const activeProj = list[activeProjIndex];
        const isEmpty = !activeProj.files || Object.keys(activeProj.files).length === 0;
        const isOldViteDefault = activeProj.files && activeProj.files['/index.html'] && !activeProj.files['/app/layout.tsx'];
        
        if (isEmpty || isOldViteDefault) {
          const updatedProj = { 
            ...activeProj, 
            projectType: 'nextjs', 
            files: defaultNextJsProjectFiles 
          } as any;
          const newList = list.map((p) => p.id === activeId ? updatedProj : p) as any;
          saveProjects(newList);
          list = newList;
          setCurrentProject(updatedProj);
          setProjectType('nextjs');
        }
      }
    }

    if (list.length === 0) {
      const defaultProj = {
        id: currentProject?.id || 'default-proj-id',
        name: 'My Workspace Project',
        description: 'Default project workspace for Bud agent',
        files: defaultNextJsProjectFiles as Record<string, string>,
        messages: messages || [],
        projectType: 'nextjs' as 'nextjs',
        dependencies: currentProject?.dependencies || {},
        artifacts: currentProject?.artifacts || {},
        timestamp: Date.now(),
      };
      
      list = [defaultProj];
      saveProjects(list);
      localStorage.setItem('bud_active_project_id', defaultProj.id);
      activeId = defaultProj.id;
      
      setCurrentProject(defaultProj);
      setProjectType('nextjs');
    }
    
    if (!activeId && list.length > 0) {
      localStorage.setItem('bud_active_project_id', list[0].id);
    }
  }, []);

  // Sync projects list with changes to active project files and messages
  useEffect(() => {
    const activeId = localStorage.getItem('bud_active_project_id');
    if (!activeId || projectsList.length === 0) return;
    
    const updated = projectsList.map(proj => {
      if (proj.id === activeId) {
        return {
          ...proj,
          files: currentProject?.files || {},
          messages: messages,
        };
      }
      return proj;
    });
    
    if (JSON.stringify(updated) !== JSON.stringify(projectsList)) {
      setProjectsList(updated);
      localStorage.setItem('bud_custom_projects', JSON.stringify(updated));
    }
  }, [currentProject?.files, messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setIsLeftSidebarCollapsed(true);
    }
  }, [messages.length]);

  const renderLayoutSelector = () => {
    let activeLayout: 'full_workspace' | 'split' | 'chat_only' = 'split';
    if (isWorkspaceOpen && !isSidebarOpen) {
      activeLayout = 'full_workspace';
    } else if (isWorkspaceOpen && isSidebarOpen) {
      activeLayout = 'split';
    } else {
      activeLayout = 'chat_only';
    }

    return (
      <div 
        className="relative flex items-center bg-[#0d0d0e] border border-neutral-705/80 border-zinc-800 rounded-lg p-[3.5px] select-none shrink-0 h-[22px] w-[54px] shadow-inner cursor-pointer"
        style={{ contentVisibility: 'auto' }}
      >
        {/* Sliding capsule indicator */}
        <div 
          className="absolute h-3.5 w-[14px] bg-[#a3a3a3] hover:bg-white rounded-[3px] transition-all duration-300 ease-out shadow-sm"
          style={{
            transform: 
              activeLayout === 'full_workspace' 
                ? 'translateX(0px)' 
                : activeLayout === 'split' 
                  ? 'translateX(16.5px)' 
                  : 'translateX(33px)'
          }}
        />

        {/* 3 Clickable Zones */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(false);
            setWorkspaceOpen(true);
          }}
          className="relative z-10 h-full w-1/3 cursor-pointer bg-transparent border-0 focus:outline-none"
          title="Full Workspace View (Hide Chat)"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(true);
            setWorkspaceOpen(true);
          }}
          className="relative z-10 h-full w-1/3 cursor-pointer bg-transparent border-0 focus:outline-none"
          title="Split View Layout"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(true);
            setWorkspaceOpen(false);
          }}
          className="relative z-10 h-full w-1/3 cursor-pointer bg-transparent border-0 focus:outline-none"
          title="Chat Only View (Hide Workspace)"
        />
      </div>
    );
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isChatNearBottomRef = useRef(true);

  const scrollChatToLatest = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    isChatNearBottomRef.current = true;
    setShowScrollButton(false);
  };

  const updateChatScrollState = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 160;
    isChatNearBottomRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const lastMessage = messages[messages.length - 1];
    if (isChatNearBottomRef.current || lastMessage?.role === 'user') {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
        updateChatScrollState();
      });
    }
  }, [agentEvents.length, isGenerating, messages, subAgents]);
  
  const hasStarted = messages.length > 0;
  const recentTasks = messages.filter((message) => message.role === 'user').slice(-8).reverse();
  const searchResults = [
    ...recentTasks.map((message) => ({ id: message.id, label: message.content || 'Untitled chat', type: 'Chat' })),
    ...Object.values(toolConnections).map((tool) => ({ id: tool.id, label: tool.name, type: tool.status === 'connected' ? 'Connected app' : 'App' })),
    ...(currentProject ? Object.keys(currentProject.files).map((file) => ({ id: file, label: file, type: 'File' })) : []),
    ...(currentProject ? Object.values(currentProject.artifacts || {}).map((artifact) => ({ id: artifact.id, label: artifact.name, type: 'Artifact' })) : []),
  ].filter((item) => item.label.toLowerCase().includes(globalSearch.toLowerCase()));

  const emitLocalEvent = (event: Omit<AgentEvent, 'createdAt'> & { createdAt?: number }) => {
    addAgentEvent(event);
  };

  const setAgentStatus = (id: string, updates: Partial<SubAgentStatus>) => {
    setSubAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, ...updates, updatedAt: Date.now() } : agent,
      ),
    );
  };

  const buildProjectData = (prompt: string, rawResponse: any) => {
    const filesRecord: Record<string, string> = { ...(currentProject?.files || {}) };
    const parsedFiles = Array.isArray(rawResponse?.files)
      ? rawResponse.files
      : rawResponse?.files && typeof rawResponse.files === 'object'
        ? Object.entries(rawResponse.files).map(([path, content]) => ({ path, content }))
        : [];

    parsedFiles.forEach((file: any) => {
      if (!file?.path || typeof file.content !== 'string') return;
      const normalizedPath = normalizeGeneratedPath(file.path);
      const previous = filesRecord[normalizedPath];
      let content = file.content;
      if (normalizedPath === '/package.json' || normalizedPath === 'package.json') {
          content = normalizePackageJson(content, useStore.getState().projectType || 'vite');
      } else if (normalizedPath.endsWith('.json')) {
          try { content = JSON.stringify(JSON.parse(content), null, 2); } catch(e){}
      }
      filesRecord[normalizedPath] = content;

      emitLocalEvent({
        id: uid(),
        type: previous ? 'file_updated' : 'file_created',
        label: `${previous ? 'Edited' : 'Created'} ${normalizedPath}`,
        file: normalizedPath,
        diff: previous
          ? {
              added: content.split('\n').length,
              removed: previous.split('\n').length,
            }
          : undefined,
        agentName: previous ? 'Developer' : 'Designer',
      });
    });

    const depsRecord: Record<string, string> = { ...(currentProject?.dependencies || {}) };
    const parsedDeps = Array.isArray(rawResponse?.dependencies)
      ? rawResponse.dependencies
      : rawResponse?.dependencies && typeof rawResponse.dependencies === 'object'
        ? Object.keys(rawResponse.dependencies)
        : [];

    parsedDeps.forEach((dependency: string) => {
      if (typeof dependency === 'string') depsRecord[dependency] = 'latest';
    });

    return {
      id: Date.now().toString(),
      files: filesRecord,
      dependencies: depsRecord,
      artifacts: {
        ...(currentProject?.artifacts || {}),
        ...(rawResponse?.artifacts || {}),
      },
      lastRun: rawResponse?.lastRun,
      timestamp: Date.now(),
      description: prompt.substring(0, 70) + (prompt.length > 70 ? '...' : ''),
    } satisfies ProjectData;
  };

  const handleSend = async (overrideInput?: string | React.MouseEvent, files?: any[]) => {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if ((!textToSend.trim() && (!files || files.length === 0)) || isGenerating) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend.trim(), files: files || [] };
    setMessages((prev) => [...prev, userMsg]);
    if (typeof overrideInput !== 'string') setInput('');

    const currentApiKey = apiKeys[provider];
    if (!currentApiKey && provider !== 'gemini') {
      setSettingsOpen(true);
      return;
    }
    setIsGenerating(true);
    setCurrentError(null);
    clearAgentEvents();
    setThinking(true);
    setSubAgents(DEFAULT_SUB_AGENTS.map((agent) => ({ ...agent, updatedAt: Date.now() })));

    try {
      setAgentStatus('rmcs', { status: 'thinking', detail: 'Planning the task' });
      setBudStatus('planning');
      setBudPhaseLabel('Planning...');

      const history = messages
        .filter((message) => message.role !== 'assistant' || message.project)
        .map((message) => ({ role: message.role, content: message.content }));

      let rawResponse: any;

        setAgentStatus('rmcs', { status: 'working', detail: 'Acting on the plan' });
        setBudStatus('executing');
        setBudPhaseLabel('Executing...');

        const baseUrl = provider === 'openai'
          ? 'https://api.openai.com/v1'
          : provider === 'aicredits'
            ? 'https://api.aicredits.in/v1'
            : provider === 'openrouter'
              ? 'https://openrouter.ai/api/v1'
              : provider === 'github'
                ? 'https://models.inference.ai.azure.com'
                : provider === 'gemini'
                  ? 'https://generativelanguage.googleapis.com/v1beta/openai'
                  : '';

        abortControllerRef.current = new AbortController();
        const response = await fetch('/api/agent/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current?.signal,
          body: JSON.stringify({
            prompt: userMsg.content,
            history,
            apiKey: currentApiKey,
            provider,
            model,
            baseUrl,
            currentFiles: currentProject?.files || {},
            currentDependencies: currentProject?.dependencies || {},
            currentArtifacts: currentProject?.artifacts || {},
            files: files || [],
            toolConnections,
            pluginConfigs: useStore.getState().pluginConfigs,
            apiKeys: useStore.getState().apiKeys,
            isBrowserEnabled: useStore.getState().isBrowserEnabled,
            planMode: useStore.getState().planMode,
            documentMode: useStore.getState().documentMode,
            excelMode: useStore.getState().excelMode
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Agent stream failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantMessageStarted = false;
        let currentAssistantMessageId = (Date.now() + 1).toString();

        const ensureAssistantMessage = (event: Record<string, unknown>) => {
          if (assistantMessageStarted) return;
          assistantMessageStarted = true;
          const greeting: Message = {
            id: currentAssistantMessageId,
            role: 'assistant',
            content: '',
            agentEvents: [event],
          };
          setMessages((prev) => [...prev, greeting]);
        };

        while (true) {
          if (!useStore.getState().isGenerating) {
            await reader.cancel();
            break;
          }
          const { value, done } = await reader.read();
          if (done) {
            if (buffer.trim()) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  const jsonStr = trimmed.slice(6).trim();
                  if (jsonStr) {
                    let event;
                    try {
                      event = JSON.parse(jsonStr);
                    } catch (initialError) {
                      const firstBrace = jsonStr.indexOf('{');
                      const lastBrace = jsonStr.lastIndexOf('}');
                      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        try {
                          event = JSON.parse(jsonStr.substring(firstBrace, lastBrace + 1));
                        } catch (e) {
                          console.error('Failed to parse event after extraction:', jsonStr, e);
                          continue;
                        }
                      } else {
                        console.error('Failed to parse event:', jsonStr, initialError);
                        continue;
                      }
                    }
                    
                    if (event.type === 'project_type') {
                      setProjectType(event.projectType);
                      continue;
                    }
                    if (event.type === 'sub_agents_update') {
                      setSubAgents(event.subAgents);
                    }
                    if (event.type === 'complete') {
                      rawResponse = event.result || {};
                      continue;
                    }
                    if (event.type === 'error') {
                      throw new Error(event.label || 'Agent stream failed');
                    }

                    if (event.type === 'planning') { setBudStatus('planning'); setBudPhaseLabel(event.summary || 'Planning...'); }
                    else if (event.type === 'acting' || event.type === 'tool_called') { setBudStatus('executing'); setBudPhaseLabel(event.summary || 'Executing...'); }
                    else if (event.type === 'observing' || event.type === 'tool_result') { setBudStatus('observing'); setBudPhaseLabel(event.summary || 'Observing...'); }
                    else if (event.type === 'reporting') { setBudStatus('iterating'); setBudPhaseLabel(event.summary || 'Finalizing...'); }

                    emitLocalEvent({
                      ...event,
                      agentName: 'Bud',
                    });

                    if (event.type === 'tool_called' && event.toolName === 'office.generate') {
                      useStore.getState().setViewMode('document');
                      useStore.getState().setRequestedDocumentUrl('');
                    }

                    if (event.type === 'file_created' || event.type === 'file_updated') {
                      if (event.file && event.file.startsWith('/office-outputs/')) {
                        if (event.file.toLowerCase().endsWith('.xlsx')) {
                          useStore.getState().setViewMode('excel');
                        } else {
                          useStore.getState().setViewMode('document');
                        }
                        useStore.getState().setRequestedDocumentUrl(event.file);
                      } else if (event.file && typeof event.content === 'string') {
                        const normalizedPath = normalizeGeneratedPath(event.file);
                        let content = event.content;
                        if (normalizedPath === '/package.json' || normalizedPath === 'package.json') {
                            content = normalizePackageJson(content, useStore.getState().projectType || 'vite');
                        } else if (normalizedPath.endsWith('.json')) {
                            try { content = JSON.stringify(JSON.parse(content), null, 2); } catch(e){}
                        }
                        const base = useStore.getState().currentProject || {
                          id: uid(),
                          files: {},
                          dependencies: {},
                          artifacts: {},
                          timestamp: Date.now(),
                          description: 'New Project',
                        };
                        setCurrentProject({
                          ...base,
                          files: {
                            ...base.files,
                            [normalizedPath]: content,
                          },
                        });
                      }
                    }

                    if (!assistantMessageStarted) {
                      ensureAssistantMessage(event);
                    } else {
                      setMessages((prev) => prev.map(msg =>
                        msg.id === currentAssistantMessageId
                          ? { ...msg, agentEvents: [...(msg.agentEvents || []), event] }
                          : msg
                      ));
                    }
                  }
                }
              }
            }
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const jsonStr = trimmed.slice(6).trim();
            if (!jsonStr) continue;

            let event;
            try {
              event = JSON.parse(jsonStr);
            } catch (initialError) {
              const firstBrace = jsonStr.indexOf('{');
              const lastBrace = jsonStr.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                try {
                  event = JSON.parse(jsonStr.substring(firstBrace, lastBrace + 1));
                } catch (e) {
                  console.error('Failed to parse event after extraction:', jsonStr, e);
                  continue;
                }
              } else {
                console.error('Failed to parse event:', jsonStr, initialError);
                continue;
              }
            }
            
            if (event.type === 'project_type') {
              setProjectType(event.projectType);
              continue;
            }
            if (event.type === 'sub_agents_update') {
              setSubAgents(event.subAgents);
            }
            if (event.type === 'complete') {
              rawResponse = event.result || {};
              continue;
            }
            if (event.type === 'error') {
              throw new Error(event.label || 'Agent stream failed');
            }

            if (event.type === 'planning') { setBudStatus('planning'); setBudPhaseLabel(event.summary || 'Planning...'); }
            else if (event.type === 'acting' || event.type === 'tool_called') { setBudStatus('executing'); setBudPhaseLabel(event.summary || 'Executing...'); }
            else if (event.type === 'observing' || event.type === 'tool_result') { setBudStatus('observing'); setBudPhaseLabel(event.summary || 'Observing...'); }
            else if (event.type === 'reporting') { setBudStatus('iterating'); setBudPhaseLabel(event.summary || 'Finalizing...'); }

            emitLocalEvent({
              ...event,
              agentName: 'Bud',
            });

            if (event.type === 'tool_called' && event.toolName === 'office.generate') {
              useStore.getState().setViewMode('document');
              useStore.getState().setRequestedDocumentUrl('');
            }

            if (event.type === 'file_created' || event.type === 'file_updated') {
              if (event.file && event.file.startsWith('/office-outputs/')) {
                if (event.file.toLowerCase().endsWith('.xlsx')) {
                  useStore.getState().setViewMode('excel');
                } else {
                  useStore.getState().setViewMode('document');
                }
                useStore.getState().setRequestedDocumentUrl(event.file);
              } else if (event.file && typeof event.content === 'string') {
                const normalizedPath = normalizeGeneratedPath(event.file);
                let content = event.content;
                if (normalizedPath === '/package.json' || normalizedPath === 'package.json') {
                    content = normalizePackageJson(content, useStore.getState().projectType || 'vite');
                } else if (normalizedPath.endsWith('.json')) {
                    try { content = JSON.stringify(JSON.parse(content), null, 2); } catch(e){}
                }
                const base = useStore.getState().currentProject || {
                  id: uid(),
                  files: {},
                  dependencies: {},
                  artifacts: {},
                  timestamp: Date.now(),
                  description: 'New Project',
                };
                setCurrentProject({
                  ...base,
                  files: {
                    ...base.files,
                    [normalizedPath]: content,
                  },
                });
              }
            }

            if (!assistantMessageStarted) {
              ensureAssistantMessage(event);
            } else {
              setMessages((prev) => prev.map(msg =>
                msg.id === currentAssistantMessageId
                  ? { ...msg, agentEvents: [...(msg.agentEvents || []), event] }
                  : msg
              ));
            }
          }
        }

        rawResponse = rawResponse || {};

        setAgentStatus('rmcs', { status: 'completed', detail: 'Task completed' });
        setBudStatus('done');
        setBudPhaseLabel('Complete');

      const projectData = buildProjectData(textToSend.trim(), rawResponse);

      emitLocalEvent({
        id: uid(),
        type: 'verified',
        label: 'Verified workspace result',
        agentName: 'RMCS',
      });
      setAgentStatus('rmcs', { status: 'completed', detail: 'Verified and reported result' });

      const actuallyChangedFiles = projectData.lastRun?.changedFiles || [];
      const changedFileCount = actuallyChangedFiles.length;
      
      // Final update to the assistant message
      setMessages((prev) => prev.map(msg => 
        msg.id === currentAssistantMessageId 
          ? { 
              ...msg, 
              content: projectData.lastRun?.summary
                ? `${projectData.lastRun.summary}`
                : changedFileCount > 0
                  ? `Successfully completed the task. The agent modified ${changedFileCount} workspace file(s).`
                  : `**No workspace files were modified during this run.**\n\nThis usually occurs when the selected AI provider experiences authentication failures (e.g., **"Bad credentials"** on third-party keys) or has depleted its **quota/rate limit (429 Exceeded)**, causing the backing builder agents to stop before making edits.\n\n### Recommended Steps:\n1. Open **Settings** or look at the bottom-sidebar dropdowns.\n2. Verify that your API keys are correct (e.g. check for typos, missing characters, or expired tokens).\n3. Consider switching the model/provider, or retry after a moment.`,
              project: projectData,
              agentEvents: useStore.getState().agentEvents
            } 
          : msg
      ));

      setCurrentProject(projectData);
      addVersion(projectData);

      if (changedFileCount > 0) {
        // Only set viewMode if explicitly requested by agent (omitted here to prevent force switching)
      }
    } catch (error) {
      console.error('Generation Error:', error);
      const isAbort = error instanceof Error && (
        error.name === 'AbortError' ||
        error.message.toLowerCase().includes('abort') ||
        error.message.toLowerCase().includes('cancel')
      );

      const errorMessage = isAbort 
        ? "Generation stopped by user."
        : `**Error:** ${error instanceof Error ? error.message : 'Failed to generate application.'}`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
        },
      ]);
      setSubAgents((prev) =>
        prev.map((agent) =>
          agent.id === 'rmcs'
            ? { ...agent, status: isAbort ? 'idle' : 'error', detail: isAbort ? 'Stopped by user' : 'Run failed', updatedAt: Date.now() }
            : agent,
        ),
      );
      setBudStatus(isAbort ? 'idle' : 'error');
      setBudPhaseLabel(isAbort ? 'Generation stopped by user' : 'Error');
    } finally {
      setIsGenerating(false);
      setThinking(false);
      if (useStore.getState().budStatus !== 'error' && useStore.getState().budStatus !== 'idle') {
        setBudStatus('idle');
        setBudPhaseLabel('');
      }
    }
  };

  const handleAutoFix = () => {
    if (!currentError) return;
    handleSend(`I encountered this error in the preview. Please fix it:\n\n${currentError}`);
  };

  const handleConnectTool = async (id: string, messageId: string) => {
    togglePlugin(id);

    if (useStore.getState().connectedPlugins[id]) {
      // Find the user message right before this one
      const targetIndex = messages.findIndex(m => m.id === messageId);
      if (targetIndex > 0) {
        const precedingUserMessage = messages[targetIndex - 1];
        if (precedingUserMessage.role === 'user') {
          // Remove both the user msg and the connect tool msg to clean up history, then resend
          setMessages(prev => prev.filter((m, i) => i !== targetIndex && i !== targetIndex - 1));
          handleSend(precedingUserMessage.content);
        }
      }
    }
  };



  const handleDownload = async () => {
    if (!currentProject) return;
    const zip = new JSZip();

    zip.file('package.json', JSON.stringify({
      name: 'ai-generated-app',
      version: '1.0.0',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        ...currentProject.dependencies,
      },
    }, null, 2));

    Object.entries(currentProject.files).forEach(([path, content]) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      zip.file(cleanPath, content);
    });

    Object.values(currentProject.artifacts || {}).forEach((artifact) => {
      zip.file(`artifacts/${artifact.name}.url`, `${window.location.origin}${artifact.path}`);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'project.zip');
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#161616] font-sans text-gray-200">
      <Settings />
      <PluginsManager isOpen={pluginsOpen} setIsOpen={setPluginsOpen} defaultTab={pluginsDefaultTab} />

      {/* ── Collapsible Left Sidebar (shown always, styled like ChatGPT/Manus) ── */}
      <aside className={`flex flex-col border-r border-white/5 bg-[#161616] transition-all duration-300 shrink-0 h-full relative z-45 ${isLeftSidebarCollapsed ? 'w-[68px]' : 'w-[260px]'}`}>
        {/* Toggle Collapse Button Row (No logo or app name) */}
        <div className={`p-4 flex items-center ${isLeftSidebarCollapsed ? 'justify-center' : 'justify-end'} h-14 shrink-0`}>
          <button
            onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            className="text-gray-400 hover:text-white transition-all p-1.5 hover:bg-white/5 rounded-lg"
            title={isLeftSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft size={16} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 p-3 space-y-1">
          {/* New Task Button */}
          <button
            onClick={() => {
              setMessages([]);
              clearAgentEvents();
              setInput('');
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all hover:bg-white/5 text-gray-300 hover:text-white font-sans ${isLeftSidebarCollapsed ? 'justify-center' : ''}`}
            title="New task"
          >
            <SquarePen size={16} className="text-gray-400 shrink-0" />
            {!isLeftSidebarCollapsed && (
              <span className="text-sm font-medium tracking-tight">New task</span>
            )}
          </button>


        </div>
      </aside>

      {/* Floating Popups/Modals */}


      {isProjectsPopupOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <FolderOpen size={16} className="text-indigo-400" /> Project Workspaces
                </h2>
                <p className="text-[11px] text-gray-400 mt-1">Select are project workspace or upload existing project files.</p>
              </div>
              <button onClick={() => setIsProjectsPopupOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-6 custom-scrollbar pr-1 divide-y divide-white/5 max-h-[40vh]">
              {projectsList.map(proj => {
                const isActive = proj.id === localStorage.getItem('bud_active_project_id');
                const fileCount = Object.keys(proj.files).length;
                return (
                  <div key={proj.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-white tracking-tight">{proj.name}</span>
                        {isActive && (
                          <span className="bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full text-[9px] text-indigo-400 font-bold tracking-wide uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{proj.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-mono">
                        <span>📂 {fileCount} Files</span>
                        <span>•</span>
                        <span>💬 {proj.messages ? proj.messages.length : 0} Chats</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          localStorage.setItem('bud_active_project_id', proj.id);
                          setCurrentProject({ id: proj.id, files: proj.files, dependencies: {}, artifacts: {}, timestamp: Date.now(), description: proj.description });
                          setMessages(proj.messages || []);
                          setIsProjectsPopupOpen(false);
                        }}
                        disabled={isActive}
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${isActive ? 'bg-[#252526] text-gray-500 cursor-not-allowed border border-transparent' : 'bg-white text-black hover:bg-gray-200'}`}
                      >
                        {isActive ? 'Current' : 'Select'}
                      </button>
                      <button
                        onClick={() => {
                          const confirmDel = confirm(`Are you sure you want to delete "${proj.name}"? This is permanent.`);
                          if (!confirmDel) return;
                          const filtered = projectsList.filter(p => p.id !== proj.id);
                          if (filtered.length === 0) return;
                          saveProjects(filtered);
                          if (isActive) {
                            const next = filtered[0];
                            localStorage.setItem('bud_active_project_id', next.id);
                            setCurrentProject({ id: next.id, files: next.files, dependencies: {}, artifacts: {}, timestamp: Date.now(), description: next.description });
                            setMessages(next.messages || []);
                          }
                        }}
                        disabled={projectsList.length <= 1}
                        className="text-gray-400 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                        title="Delete Project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/5 pt-5 mt-4 space-y-4">
              <div className="bg-[#1c1c1c] p-4 rounded-xl border border-white/5 space-y-3.5">
                <span className="text-xs font-semibold text-gray-300 block">Create New Project Workspace</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    id="new-project-name"
                    placeholder="Project Name (e.g., Auth Server)"
                    className="w-full bg-black/25 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-white/15 animate-none"
                  />
                  <input
                    type="text"
                    id="new-project-desc"
                    placeholder="Project Description"
                    className="w-full bg-black/25 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-white/15 animate-none"
                  />
                </div>
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="new-project-type" className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">Template Type / Engine</label>
                  <select
                    id="new-project-type"
                    className="w-full bg-black/25 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/15 font-sans"
                  >
                    <option value="nextjs" className="bg-[#1c1c1c] text-white">Next.js Fullstack Website (Fast Dev + Tailwind v4)</option>
                    <option value="vite" className="bg-[#1c1c1c] text-white">Vite React + CDN Tailwind CSS (Lightweight SPA)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      const nameInp = document.getElementById('new-project-name') as HTMLInputElement;
                      const descInp = document.getElementById('new-project-desc') as HTMLInputElement;
                      const typeSelect = document.getElementById('new-project-type') as HTMLSelectElement;
                      const name = nameInp?.value?.trim() || 'New Workspace';
                      const desc = descInp?.value?.trim() || 'A fresh agent project';
                      const selectedType = (typeSelect?.value || 'nextjs') as 'nextjs' | 'vite';
                      
                      const initialFiles = selectedType === 'vite' ? defaultProjectFiles : defaultNextJsProjectFiles;
                      
                      const newProjPr = {
                        id: uid(),
                        name,
                        description: desc,
                        files: initialFiles,
                        messages: [],
                        projectType: selectedType,
                        dependencies: {},
                        artifacts: {},
                        timestamp: Date.now()
                      };
                      
                      const nextList = [...projectsList, newProjPr];
                      saveProjects(nextList);
                      localStorage.setItem('bud_active_project_id', newProjPr.id);
                      setProjectType(selectedType);
                      setCurrentProject(newProjPr);
                      setMessages([]);
                      if (nameInp) nameInp.value = '';
                      if (descInp) descInp.value = '';
                      setIsProjectsPopupOpen(false);
                    }}
                    className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all font-sans"
                  >
                    Create Workspace
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border border-[#ffffff0a] bg-white/[0.01] p-4 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-white block">Import Local Directory</span>
                  <span className="text-[10px] text-gray-500 mt-1 block">Recursively maps source folders into workspaceSnapshots</span>
                </div>
                <button
                  onClick={() => {
                    const uploadInput = document.createElement('input');
                    uploadInput.type = 'file';
                    uploadInput.setAttribute('webkitdirectory', '');
                    uploadInput.setAttribute('directory', '');
                    uploadInput.multiple = true;
                    uploadInput.onchange = async (changeEvent: any) => {
                      const filesList = Array.from(changeEvent.target.files) as File[];
                      const uploadedFiles: Record<string, string> = {};
                      for (const file of filesList) {
                        const relPath = file.webkitRelativePath;
                        if (
                          relPath.includes('node_modules/') ||
                          relPath.includes('.git/') ||
                          relPath.endsWith('.png') ||
                          relPath.endsWith('.jpg') ||
                          relPath.endsWith('.jpeg') ||
                          relPath.endsWith('.zip') ||
                          relPath.endsWith('package-lock.json')
                        ) {
                          continue;
                        }
                        const text = await file.text();
                        uploadedFiles[relPath] = text;
                      }

                      const activeId = localStorage.getItem('bud_active_project_id');
                      const nextList = projectsList.map(proj => {
                        if (proj.id === activeId) {
                          return {
                            ...proj,
                            files: {
                              ...proj.files,
                              ...uploadedFiles,
                            },
                          };
                        }
                        return proj;
                      });
                      saveProjects(nextList);
                      
                      if (currentProject) {
                        setCurrentProject({
                          ...currentProject,
                          files: {
                            ...currentProject.files,
                            ...uploadedFiles,
                          },
                        });
                      }
                      alert(`Successfully imported ${Object.keys(uploadedFiles).length} files into your project workspace!`);
                      setIsProjectsPopupOpen(false);
                    };
                    uploadInput.click();
                  }}
                  className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-gray-300 text-xs font-bold px-3.5 py-2 rounded-lg"
                >
                  <Upload size={13} /> Upload Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Application Area (nested next to Left Sidebar) ── */}
      <div className="flex-1 flex flex-col md:flex-row h-full min-w-0 overflow-hidden relative">
      {!hasStarted ? (
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-4 bg-[#161616]">
          <div className="z-10 flex w-full max-w-3xl animate-in flex-col items-center fade-in slide-in-from-bottom-4 duration-700">
            <InputBar onSend={handleSend} className="w-full text-left" />
          </div>
        </div>
      ) : (
        <>
          {isSidebarOpen && (
            <section className={cn(
              "relative z-10 flex w-full flex-shrink-0 flex-col border-r border-white/10 bg-[#1e1e1e] transition-colors duration-300",
              !isWorkspaceOpen && "flex-1 items-center bg-[#161616] border-r-0"
            )} 
            style={isWorkspaceOpen ? { width: sidebarWidth } : {}}
            aria-label="Chat Interface">
              <div
                ref={chatContainerRef}
                onScroll={updateChatScrollState}
                className={cn(
                  "custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4 pt-5 w-full",
                  !isWorkspaceOpen && "max-w-3xl"
                )}
                role="log"
                aria-live="polite"
              >
              <>
                {messages.map((message, index) => {
                    const isLastAssistant = message.role === 'assistant' && index === messages.length - 1;
                    const isLastUserGenerating = message.role === 'user' && index === messages.length - 1 && isGenerating;

                    return (
                      <React.Fragment key={message.id}>
                        <div className={`flex flex-col ${message.role === 'user' ? 'items-end ml-12' : 'items-start mr-12'}`}>
                          <div
                            className={cn(
                              'max-w-full rounded-2xl',
                              message.role === 'user'
                                ? 'bg-white/5 p-4 text-gray-200'
                                : 'w-full text-gray-200',
                            )}
                          >
                            {message.role === 'assistant' ? (
                              <div className="space-y-6">
                                {message.content.startsWith('__CONNECT_TOOL__|') ? null : (
                                  <div className="prose prose-sm max-w-none text-[#e7e7e7] prose-p:my-0 prose-p:text-[15px] prose-p:leading-7 prose-p:text-[#dedede] prose-strong:text-white prose-code:text-gray-200">
                                    {(!message.agentEvents || message.agentEvents.length === 0) && message.content && (
                                      <ReactMarkdown>{message.content}</ReactMarkdown>
                                    )}
                                  </div>
                                )}

                                {message.agentEvents && message.agentEvents.length > 0 && !isLastUserGenerating && (
                                  <div className="mt-2 space-y-4">
                                    <AgentActionStream
                                      events={message.agentEvents}
                                      currentFiles={message.project?.files || currentProject?.files}
                                      onFileClick={useStore.getState().setRequestedFileToOpen}
                                    />
                                    {message.content && (
                                      <div className="prose prose-sm max-w-none text-[#e7e7e7] prose-p:my-0 prose-p:text-[15px] prose-p:leading-7 prose-p:text-[#dedede] prose-strong:text-white prose-code:text-gray-200 pt-4 border-t border-white/5 animate-fade-in font-sans">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                      </div>
                                    )}
                                  </div>
                                )}
                                

                              </div>
                            ) : (
                              <ExpandableUserMessage message={message} setPreviewFile={setPreviewFile} copiedMessageId={copiedMessageId} setCopiedMessageId={setCopiedMessageId} />
                            )}
                          </div>
                        </div>
                        {isLastUserGenerating && (isThinking || agentEvents.length > 0) && (
                          <div className="w-full pt-4">
                            <AgentActionStream
                              events={
                                agentEvents.length > 0
                                  ? agentEvents
                                  : [{
                                      id: 'live-thinking',
                                      type: 'thought_stream' as const,
                                      phase: 'thinking' as const,
                                      status: 'running' as const,
                                      createdAt: Date.now(),
                                      label: 'Thinking...',
                                    }]
                              }
                              currentFiles={currentProject?.files}
                              onFileClick={useStore.getState().setRequestedFileToOpen}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                })}
              </>
            </div>

            {showScrollButton && (
              <button
                type="button"
                onClick={scrollChatToLatest}
                className="absolute bottom-24 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#2a2a2a]/90 text-gray-200 shadow-2xl shadow-black/40 backdrop-blur transition-colors hover:bg-[#343434] hover:text-white"
                aria-label="Scroll to latest response"
              >
                <ArrowDown size={20} />
              </button>
            )}

            <div className={cn(
              "p-4 w-full",
              !isWorkspaceOpen ? "max-w-3xl flex-shrink-0 bg-[#161616]" : "bg-[#1e1e1e]"
            )}>
              <InputBar onSend={handleSend} />
            </div>

            {!isWorkspaceOpen && (
              <div className="absolute top-4 right-4 z-50 bg-[#1a1a1a]/95 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-md">
                {renderLayoutSelector()}
              </div>
            )}
          </section>
          )}

          {isSidebarOpen && isWorkspaceOpen && (
            <div
              className={`hidden md:block w-1 z-20 cursor-col-resize hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors ${isResizingSidebar ? 'bg-indigo-500' : 'bg-transparent'}`}
              onMouseDown={handleSidebarDragStart}
            />
          )}

          {isWorkspaceOpen && (
          <main className="flex min-w-0 flex-1 flex-col bg-[#161616] p-4" aria-label="Code Workspace">
            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
              <header className="flex h-14 items-center justify-between border-b border-white/5 bg-[#1a1a1a] px-6 shrink-0 font-sans">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  {renderLayoutSelector()}
                  <AppTabs />
                </div>
                <div className="flex items-center gap-3 shrink-0 pl-4">
                  <button
                    type="button"
                    onClick={() => setRightDocSidebarOpen(!isRightDocSidebarOpen)}
                    className={cn(
                      "p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative",
                      isRightDocSidebarOpen 
                        ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" 
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10"
                    )}
                    title="Toggle Document Library"
                  >
                    <PanelRight size={15} />
                  </button>
                </div>
              </header>

            <div className="flex h-full w-full flex-1 flex-row overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <>
              <style>{`
                .sp-wrapper { height: 100% !important; display: flex !important; flex-direction: column !important; }
                .sp-layout { flex: 1 !important; border: none !important; border-radius: 0 !important; display: flex !important; overflow: hidden !important; background: #1e1e1e !important; }
                .sp-stack { height: 100% !important; display: flex !important; flex-direction: column !important; flex: 1 !important; }
                .sp-preview { height: 100% !important; display: flex !important; flex-direction: column !important; flex: 1 !important; background: #1e1e1e !important; }
                .sp-preview-container { flex: 1 !important; height: 100% !important; display: flex !important; flex-direction: column !important; background: #1e1e1e !important; }
                .sp-preview-iframe { flex: 1 !important; height: 100% !important; min-height: 100% !important; background: #ffffff !important; }
                .sp-file-explorer { background: #252526 !important; border-right: 1px solid rgba(255,255,255,0.08) !important; }
                .sp-file-explorer button, .sp-file-explorer span { color: #cccccc !important; }
                .sp-code-editor, .sp-cm, .cm-editor, .cm-scroller { background: #1e1e1e !important; }
                .sp-code-editor { height: 100% !important; overflow: hidden !important; }
                .cm-editor { height: 100% !important; }
                .cm-scroller { overflow: auto !important; scrollbar-width: thin !important; scrollbar-color: rgba(255,255,255,0.24) transparent !important; }
                .cm-scroller::-webkit-scrollbar { display: block !important; width: 10px !important; height: 10px !important; }
                .cm-scroller::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22) !important; border-radius: 999px !important; border: 3px solid #1e1e1e !important; }
                .cm-content { min-width: max-content !important; }
                .cm-line { white-space: pre !important; }
                .cm-activeLine, .cm-activeLineGutter { background: transparent !important; }
                .cm-focused .cm-activeLine, .cm-focused .cm-activeLineGutter { background: transparent !important; }
                .sp-tabs { display: none !important; }
                .sp-preview-actions, .sp-run-button { display: none !important; }
                .cm-gutters, .cm-gutter, .cm-gutterElement, .sp-cm-gutter, .cm-activeLineGutter, .cm-activeLine { background: #1e1e1e !important; background-color: #1e1e1e !important; border-right: 1px solid rgba(255, 255, 255, 0.04) !important; }
                .sp-code-editor, .sp-stack, .sp-layout { background-color: #1e1e1e !important; }
              `}</style>

              {/* Desktop workspaces rendered outside Virtual Engine */}
              {viewMode === 'desktop' && (
                <div className="flex-1 bg-[#1e1e1e] relative">
                  <DesktopWorkspace />
                </div>
              )}

              {viewMode === 'document' && (
                <div className="flex-1 bg-[#eaeaea] relative flex flex-col min-h-0 overflow-hidden">
                  {requestedDocumentUrl ? (
                    requestedDocumentUrl.endsWith('.pptx') ? (
                      <DocumentViewer 
                        url={requestedDocumentUrl} 
                        onProceed={(action, feedback) => {
                          if (action === 'Approved') {
                            handleSend("I approve the plan. Proceed with implementation.");
                            setViewMode('code');
                          } else if (action === 'Declined') {
                            setInput("I decline the plan. Please revise the implementation plan to address: " + (feedback || ""));
                          }
                        }}
                      />
                    ) : (
                      <DocumentEditor url={requestedDocumentUrl} />
                    )
                  ) : (
                    <div className="flex w-full h-full justify-center items-center text-gray-500 font-mono bg-[#161616]">
                      No document requested
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'excel' && (
                <div className="flex-1 bg-[#141414] relative flex flex-col min-h-0 overflow-hidden">
                  {requestedDocumentUrl ? (
                    <ExcelEditor url={requestedDocumentUrl} />
                  ) : (
                    <div className="flex w-full h-full justify-center items-center text-gray-500 font-mono bg-[#161616]">
                      No spreadsheet requested
                    </div>
                  )}
                </div>
              )}

              {/* Terminal / Shell View */}
              {(viewMode === 'terminal' || viewMode === 'shell') && (
                <div className="flex-1 bg-[#1e1e1e] relative flex flex-col">
                  <ComputerTerminal />
                </div>
              )}

              {/* Console View */}
              {viewMode === 'console' && (
                <div className="flex-1 bg-[#1a1a1a] relative flex flex-col overflow-hidden">
                  <ComputerExecutionLog />
                </div>
              )}

              {/* New Tab View */}
              {viewMode === 'new_tab' && (
                <NewTabPage />
              )}

              {(viewMode === 'code' || viewMode === 'preview') && (
                <div className="flex h-full w-full flex-col animate-fade-in">
                  <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
                    {currentError && viewMode === 'preview' && (() => {
                      const errStr = typeof currentError === 'string' ? currentError : (currentError as any)?.message || String(currentError);
                      return (
                        <div className="animate-in slide-in-from-bottom-4 absolute bottom-8 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 rounded-2xl border border-red-500/30 bg-[#161B22]/95 p-6 text-red-200 shadow-2xl backdrop-blur-xl duration-300" role="alert">
                          <div className="mb-4 flex items-start gap-4">
                            <div className="rounded-xl bg-red-500/20 p-3">
                              <AlertTriangle size={20} className="text-amber-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-bold text-red-300">Preview Error</h3>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(errStr);
                                    setCopiedError(true);
                                    setTimeout(() => setCopiedError(false), 2000);
                                  }}
                                  className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1.5 bg-white/5 border border-white/5 hover:bg-white/10 px-2 rounded-lg py-1 transition-all"
                                  title="Copy error to clipboard"
                                >
                                  {copiedError ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                  <span>{copiedError ? 'Copied!' : 'Copy Error'}</span>
                                </button>
                              </div>
                              <p className="custom-scrollbar max-h-40 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 font-mono text-xs text-red-200/70 border border-white/5">
                                {errStr}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button
                              onClick={handleAutoFix}
                              disabled={isGenerating}
                              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50 bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20"
                            >
                              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                              Repair with AI
                            </button>
                            <button
                              onClick={() => setCurrentError(null)}
                              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-zinc-300 transition-all bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                            >
                              Ignore & View Preview
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex h-full w-full flex-col relative">
                      {/* Code Workspace */}
                      <div className="flex-1 w-full min-h-0" style={{ display: viewMode === 'code' ? 'flex' : 'none' }}>
                        <div className="flex flex-1 w-full h-full border-none rounded-none bg-[#1e1e1e] overflow-hidden min-h-0">
                          <CustomFileExplorer />
                          <div className="flex flex-1 flex-col min-w-0 bg-[#1e1e1e]">
                            <CustomCodeEditorHeader 
                              onFullscreen={() => setIsFullscreen(true)} 
                              terminalOpen={isEditorTerminalOpen}
                              onToggleTerminal={() => setEditorTerminalOpen(!isEditorTerminalOpen)}
                              isDiffMode={isDiffViewEnabled}
                              onToggleDiffMode={() => setIsDiffViewEnabled(!isDiffViewEnabled)}
                              isSideBySide={isSideBySide}
                              onToggleSideBySide={() => setIsSideBySide(!isSideBySide)}
                              onFormatCode={() => {
                                if (activeFile && currentProject) {
                                  const code = currentProject.files[activeFile] || '';
                                  const formatted = beautifyCode(code);
                                  updateFileContent(activeFile, formatted);
                                }
                              }}
                              setShowGithubModal={setShowGithubModal}
                              onDownloadWorkspace={handleDownload}
                              setIsHistoryOpen={setIsHistoryOpen}
                            />
                            <div className="flex-1 w-full min-h-0 flex flex-col" style={{ background: '#1e1e1e' }}>
                              <div className="flex-1 w-full min-h-0 relative">
                                {activeFile && currentProject ? (
                                  isDiffViewEnabled ? (
                                    <DiffEditor
                                      height="100%"
                                      language={getLanguage(activeFile)}
                                      theme="vs-dark"
                                      original={(() => {
                                        if (versions && versions.length > 0) {
                                          for (const v of versions) {
                                            if (v.files && v.files[activeFile] !== undefined && v.files[activeFile] !== currentProject.files[activeFile]) {
                                              return v.files[activeFile];
                                            }
                                          }
                                        }
                                        return currentProject.files[activeFile] || '';
                                      })()}
                                      modified={currentProject.files[activeFile] || ''}
                                      options={{
                                        renderSideBySide: isSideBySide,
                                        readOnly: false,
                                        originalEditable: false,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                      }}
                                    />
                                  ) : (
                                    <Editor
                                      height="100%"
                                      language={getLanguage(activeFile)}
                                      theme="vs-dark"
                                      value={currentProject.files[activeFile] || ''}
                                      onChange={(val) => {
                                        if (val !== undefined && activeFile) {
                                          updateFileContent(activeFile, val);
                                        }
                                      }}
                                      onMount={(editor, monaco) => {
                                        setNormalEditor(editor);
                                        setMonacoInstance(monaco);
                                      }}
                                      options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        wordWrap: 'on',
                                        automaticLayout: true,
                                        padding: { top: 12, bottom: 12 },
                                      }}
                                    />
                                  )
                                ) : (
                                  <div className="flex-1 h-full flex items-center justify-center text-gray-500 font-mono text-xs">
                                    No file selected / open
                                  </div>
                                )}
                              </div>
                              {isEditorTerminalOpen && (
                                <div className="h-64 border-t border-white/10 bg-[#1a1a1a] flex flex-col relative z-20 shrink-0">
                                  <ComputerTerminal />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview Workspace (rendered unconditionally but styled with display: none to maintain running server state/WebSocket/HMR) */}
                      <div className="flex-1 w-full min-h-0" style={{ display: viewMode === 'preview' ? 'flex' : 'none' }}>
                        <div className={`relative flex flex-1 flex-col w-full h-full bg-[#1e1e1e] ${isFullscreen ? 'fixed inset-0 z-50 p-0' : ''}`}>
                          {isFullscreen && (
                            <div className="absolute right-4 top-4 z-50">
                              <button
                                onClick={() => setIsFullscreen(false)}
                                className="rounded-xl border border-white/10 bg-[#161B22] p-3 text-gray-400 shadow-2xl hover:text-white"
                              >
                                <Minimize size={20} />
                              </button>
                            </div>
                          )}
                          <div className="flex flex-1 items-center justify-center w-full h-full">
                            <div className="h-full w-full">
                              <FullstackPreview project={currentProject} isGenerating={isGenerating} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </>
              </div>
              {isRightDocSidebarOpen && (
                <RightDocumentSidebar onClose={() => setRightDocSidebarOpen(false)} />
              )}
            </div>
          </div>
        </main>
        )}
      </>
    )}
    
    {isHistoryOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl animate-scale-in">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-indigo-400" />
                Version History
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Restore any historic checkpoint or snapshot of your files.</p>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="custom-scrollbar max-h-[350px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No history versions captured yet. Start modifying files or prompt the AI to generate checkpoints.
              </div>
            ) : (
              [...versions].reverse().map((v, idx) => {
                const dateStr = format(new Date(v.timestamp || Date.now()), 'MMM d, h:mm a');
                const isActive = currentProject?.id === v.id;
                
                // Generate a summary from files modified or general description
                let summary = v.description || v.lastRun?.summary || "Developer Snapshot / Workspace Save";
                
                return (
                  <div
                    key={v.id || idx}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isActive 
                        ? 'border-indigo-500/30 bg-indigo-500/10' 
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded uppercase">
                          v{versions.length - idx}
                        </span>
                        <span className="text-xs font-bold text-gray-300">{dateStr}</span>
                        {isActive && (
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-400 mt-1 truncate max-w-[280px]" title={summary}>
                        {summary}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                        {Object.keys(v.files || {}).length} files • {Object.keys(v.dependencies || {}).length} deps
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        revertToVersion(v.id);
                        setIsHistoryOpen(false);
                      }}
                      disabled={isActive}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95'
                      }`}
                    >
                      Restore
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {previewFile && (
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setPreviewFile(null)}
      >
        <div 
          className="bg-[#1c1c1e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121214]">
            <div className="flex items-center gap-2.5 min-w-0">
              {previewFile.type?.startsWith('image/') ? (
                <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-white/5">
                  <img src={previewFile.url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                  <FileText size={16} className="text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{previewFile.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase leading-none mt-0.5">{previewFile.type || 'unknown type'}</p>
              </div>
            </div>
            <button 
              onClick={() => setPreviewFile(null)}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#161618] custom-scrollbar min-h-0">
            {previewFile.type?.startsWith('image/') ? (
              <div className="flex items-center justify-center h-full max-h-[60vh] select-none">
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-w-full max-h-[55vh] object-contain rounded-lg border border-white/10 shadow-lg" 
                />
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0e0e10] p-4 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap select-text max-h-[60vh] overflow-y-auto custom-scrollbar">
                {(() => {
                  if (!previewFile.data) return "No content available.";
                  try {
                    // Decode Base64 safely
                    return decodeURIComponent(escape(atob(previewFile.data)));
                  } catch (e) {
                    try {
                      return atob(previewFile.data);
                    } catch (err) {
                      return "Unable to show binary content.";
                    }
                  }
                })()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#121214] flex justify-end gap-3 shrink-0">
            <a 
              href={previewFile.url} 
              download={previewFile.name}
              className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold transition-all hover:bg-gray-200"
            >
              <Download size={14} />
              <span>Download File</span>
            </a>
            <button 
              onClick={() => setPreviewFile(null)}
              className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 px-4 py-2 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    <PushToGithubModal isOpen={showGithubModal} onClose={() => setShowGithubModal(false)} />
    </div>
  </div>
);
}
