import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import {
  Braces,
  Calendar,
  Check,
  ChevronDown,
  Circle,
  Compass,
  FileCode,
  FileJson,
  Folder,
  Globe,
  Loader2,
  Mail,
  PencilLine,
  Search,
  Sparkles,
  Terminal,
  Copy,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { AgentEvent, RoadmapTodo, SubAgentStatus } from '../../store/useStore';

const Github = ({ size = 13, className = '' }: { size?: number; className?: string }) => (
  <svg
    height={size}
    width={size}
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/Collapsible';
import { CodeBlock } from './CodeBlock';
import { cn } from '../../lib/utils';
import { FileArtifactRow, WorkSessionHeader, FILE_ARTIFACT_TOOLS, isFolderPath, formatVerb, fileBasename, getIconUrl } from './FileArtifact';

interface AgentActionStreamProps {
  events: AgentEvent[];
  currentFiles?: Record<string, string>;
  onFileClick?: (filePath: string) => void;
}

type TimelineAction =
  | { kind: 'text'; event: AgentEvent; text: string }
  | { kind: 'tool'; event: AgentEvent; label: string; observation?: string }
  | { kind: 'file'; event: AgentEvent; label: string }
  | { kind: 'error'; event: AgentEvent; text: string };

interface TimelineStep {
  id: string;
  title: string;
  intro?: string;
  status: 'running' | 'done' | 'error';
  actions: TimelineAction[];
}

interface StructuredRun {
  hasRoadmap: boolean;
  title: string;
  roadmap: RoadmapTodo[];
  todoStatus: Map<string, 'pending' | 'running' | 'done' | 'error'>;
  thinkingText: string | null;
  thoughts: { summary: string; details: string } | null;
  codingDone: AgentEvent[];
  toolPairs: { called: AgentEvent; result?: AgentEvent }[];
  report: AgentEvent | null;
  startTime: number | null;
}

function isJsonLike(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function eventText(event: AgentEvent) {
  return event.observation || event.summary || event.label || '';
}

function getIconForLabel(label: string, toolName?: string) {
  const text = `${label} ${toolName || ''}`.toLowerCase();

  if (text.includes('gmail') || text.includes('mail')) return <Mail size={13} className="text-[#ea4335]" />;
  if (text.includes('github') || text.includes('repo') || text.includes('pull request')) return <Github size={13} className="text-white" />;
  if (text.includes('calendar') || text.includes('meeting')) return <Calendar size={13} className="text-[#4285f4]" />;
  if (text.includes('search') || text.includes('research') || text.includes('find')) return <Search size={13} className="text-gray-300" />;
  if (text.includes('browser') || text.includes('web') || text.includes('url') || text.includes('read')) return <Compass size={13} className="text-gray-300" />;
  if (text.includes('file') || text.includes('save') || text.includes('create') || text.includes('update') || text.includes('edit')) {
    return <PencilLine size={13} className="text-gray-300" />;
  }
  if (text.includes('http') || text.includes('fetch')) return <Globe size={13} className="text-gray-300" />;

  return <Terminal size={13} className="text-gray-300" />;
}

function extIcon(path: string) {
  const ext = (path.split('.').pop() || '').toLowerCase();
  const fileName = (path.split('/').pop() || '').toLowerCase();

  // Vite
  if (fileName.includes('vite.config')) {
    return (
      <div className="p-0.5">
        <svg width="14" height="14" viewBox="0 0 256 257">
          <defs>
            <linearGradient id="a" x1="1.95%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#41D1FF" />
              <stop offset="100%" stopColor="#BD34FE" />
            </linearGradient>
          </defs>
          <path fill="url(#a)" d="M255.15 37.36l-119.67 218.4a5.49 5.49 0 01-9.74 0L6.07 37.36a5.5 5.5 0 018.3-7.14l110.11 96.42a5.5 5.5 0 006.91 0L246.85 30.22a5.5 5.5 0 018.3 7.14z" />
          <path fill="#FFC517" d="M151.74 1.48a5.5 5.5 0 00-9.28 0L61.73 147.28a5.5 5.5 0 004.64 8.24h39.26l-17.7 44.24a5.5 5.5 0 008.97 6.13l108.38-129.5a5.5 5.5 0 00-4.23-9.05h-38.65l17.7-44.24a5.5 5.5 0 00-1.2-5.75l-27.16-25.86z" />
        </svg>
      </div>
    );
  }

  // React / JSX / TSX
  if (ext === 'tsx' || ext === 'jsx' || ext === 'tsx' || ext === 'jsx') {
    return (
      <div className="p-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="12" cy="12" r="2" />
          <path d="M12 7c3.12 0 5.8 1.48 7.37 3.75a13.9 13.9 0 0 1 0 2.5C17.8 15.52 15.12 17 12 17s-5.8-1.48-7.37-3.75a13.9 13.9 0 0 0 0-2.5C6.2 8.48 8.88 7 12 7Z" />
          <path d="M12 7c-1.35 0-2.53.5-3.4 1.3" transform="rotate(60 12 12)" />
          <path d="M12 17c1.35 0 2.53-.5 3.4-1.3" transform="rotate(60 12 12)" />
          <path d="M12 7c-1.35 0-2.53.5-3.4 1.3" transform="rotate(-60 12 12)" />
          <path d="M12 17c1.35 0 2.53-.5 3.4-1.3" transform="rotate(-60 12 12)" />
        </svg>
      </div>
    );
  }

  // TypeScript
  if (ext === 'ts') {
    return (
      <div className="p-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3178c6">
          <rect width="24" height="24" rx="3" fill="#3178c6" />
          <path d="M15.4 17.5h1.7v-7h-1.7V17.5zM12.5 17.5V11h5.4v1.5h-3.6v1.5h3v1.5h-3v2z" fill="white" />
        </svg>
      </div>
    );
  }

  // JavaScript
  if (ext === 'js') {
    return (
      <div className="p-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f7df1e">
          <rect width="24" height="24" rx="3" fill="#f7df1e" />
          <path d="M15.4 17.5h1.7v-7h-1.7V17.5zM12.5 17.5V11h5.4v1.5h-3.6v1.5h3v1.5h-3v2z" fill="black" />
        </svg>
      </div>
    );
  }

  // HTML
  if (ext === 'html') {
    return (
      <div className="p-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#e34f26">
          <path d="M1.5 0h21l-1.9 21.4L12 24l-8.6-2.6L1.5 0zm17.3 4.6H5.2l.3 3.3h10.4l-.4 4-2.8.8-2.8-.8-.2-1.9H6.4l.3 4.4L12 18.8l5.3-1.4.7-8.2-.1-4.6z"/>
        </svg>
      </div>
    );
  }

  // CSS
  if (ext === 'css') {
    return (
      <div className="p-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1572b6">
          <path d="M1.5 0h21l-1.9 21.4L12 24l-8.6-2.6L1.5 0zm17.3 4.6H5.2l.3 3.3h10.4l-.4 4-2.8.8-2.8-.8-.2-1.9H6.4l.3 4.4L12 18.8l5.3-1.4.7-8.2-.1-4.6z"/>
        </svg>
      </div>
    );
  }

  // JSON / Config
  if (ext === 'json' || fileName.includes('package')) {
    return (
      <div className="p-0.5">
        <FileJson size={14} className="shrink-0 text-emerald-400" />
      </div>
    );
  }

  return <div className="p-0.5"><FileCode size={14} className="shrink-0 text-gray-400" /></div>;
}

function buildStructuredRun(events: AgentEvent[]): StructuredRun {
  let title = '';
  const roadmap: RoadmapTodo[] = [];
  const todoStatus = new Map<string, 'pending' | 'running' | 'done' | 'error'>();
  let thinkingText: string | null = null;
  let thoughts: { summary: string; details: string } | null = null;
  const codingDone: AgentEvent[] = [];
  const toolPairs: { called: AgentEvent; result?: AgentEvent }[] = [];
  let report: AgentEvent | null = null;
  let startTime: number | null = null;

  for (const e of events) {
    if (e.type === 'run_title' && e.summary) title = e.summary;
    if (e.type === 'todo_roadmap' && e.todos?.length) {
      e.todos.forEach((t) => {
        roadmap.push(t);
        if (!todoStatus.has(t.id)) todoStatus.set(t.id, 'pending');
      });
    }
    if (e.type === 'todo_focus' && e.todoId) {
      const st = e.status === 'running' ? 'running' : e.status === 'error' ? 'error' : 'done';
      todoStatus.set(e.todoId, st);
    }
    if (e.type === 'thought_stream') {
      if (!startTime && e.createdAt) startTime = e.createdAt;
      if (e.phase === 'thinking') {
        const text = (e.text || '').trim();
        if (text && text !== 'Thinking…' && text !== 'Thinking...') {
          thinkingText = text;
        }
      }
      if (e.phase === 'thoughts') {
        thoughts = { summary: e.summary || '', details: e.details || '' };
        thinkingText = null;
      }
    }
    if (e.type === 'coding_action' && e.status === 'done') {
      codingDone.push(e);
    }
    if (e.type === 'file_created' || e.type === 'file_updated') {
      const path = e.path || e.file;
      let exists = false;
      for (let i = codingDone.length - 1; i >= 0; i--) {
        const ce = codingDone[i];
        if ((ce.path === path || ce.file === path) && ce.type === 'coding_action') {
           codingDone[i] = { ...ce, ...e, type: e.type, status: 'done' };
           exists = true;
           break;
        }
      }
      if (!exists) {
        codingDone.push(e);
      }
    }
    if (e.type === 'tool_called') {
      toolPairs.push({ called: e });
    }
    if (e.type === 'tool_result') {
      for (let k = toolPairs.length - 1; k >= 0; k--) {
        if (!toolPairs[k].result) {
          toolPairs[k].result = e;
          break;
        }
      }
    }
    if (e.type === 'reporting') report = e;
  }

  return {
    hasRoadmap: roadmap.length > 0,
    title,
    roadmap,
    todoStatus,
    thinkingText,
    thoughts,
    codingDone,
    toolPairs,
    report,
    startTime,
  };
}

const ThoughtDropdown = memo(({ 
  thinkingText, 
  thoughts, 
  isThinking, 
  startTime,
  className
}: { 
  thinkingText?: string | null; 
  thoughts?: { summary: string; details: string } | null;
  isThinking: boolean;
  startTime?: number | null;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const finishedTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isThinking) {
      finishedTimeRef.current = null;
      const start = startTime || Date.now();
      const interval = setInterval(() => {
        setElapsed(Math.round((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isThinking, startTime]);

  useEffect(() => {
    if (!isThinking && startTime) {
      if (!finishedTimeRef.current) {
        finishedTimeRef.current = Date.now();
      }
      const start = startTime;
      const end = finishedTimeRef.current;
      setElapsed(Math.max(1, Math.round((end - start) / 1000)));
    }
  }, [isThinking, startTime]);

  useEffect(() => {
    if (!isThinking) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isThinking]);

  if (isThinking) {
    return (
      <div className={cn("flex items-center gap-2.5 px-0.5 py-1 select-none animate-pulse", className)}>
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/30 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white/85"></span>
        </div>
        <span className="text-[13px] font-semibold text-white">
          Thinking...
        </span>
      </div>
    );
  }

  const contentText = `${thinkingText || ''} ${thoughts?.summary || ''} ${thoughts?.details || ''}`.toLowerCase();
  const isAgentUnderstanding = 
    contentText.includes("intent classification") || 
    contentText.includes("request analysis") || 
    contentText.includes("intent categorization") || 
    contentText.includes("expected outcomes") || 
    contentText.includes("task category:");

  if (isAgentUnderstanding) {
    return null;
  }

  if (!thinkingText && !thoughts) return null;

  return (
    <div className={cn("transition-all duration-300", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 py-1 text-left hover:opacity-80 transition-opacity group">
          <span className="text-[13px] text-white/90 font-semibold tracking-tight group-hover:text-white">
            {`Thought for ${elapsed}s`}
          </span>
          <ChevronDown size={14} className={cn("text-white/40 transition-transform group-hover:text-white/60", isOpen && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-4">
            {thinkingText && (
              <p className="text-[14px] leading-relaxed text-white/40 italic font-medium">{thinkingText}</p>
            )}
            {thoughts && (
              <div className="space-y-2">
                <p className="text-[13px] leading-relaxed text-white/30 font-normal">
                  {[thoughts.summary, thoughts.details].filter(Boolean).join(' ')}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});
ThoughtDropdown.displayName = 'ThoughtDropdown';

function buildTimeline(events: AgentEvent[]): TimelineStep[] {
  const steps: TimelineStep[] = [];
  let current: TimelineStep | null = null;

  events.forEach((event, index) => {
    if (
      event.type === 'run_title' ||
      event.type === 'todo_roadmap' ||
      event.type === 'todo_focus' ||
      event.type === 'thought_stream' ||
      event.type === 'coding_action'
    ) {
      return;
    }

    if (event.type === 'planning') {
      current = {
        id: event.id || `step-${index}`,
        title: event.summary || event.label || 'Thinking...',
        intro: event.observation,
        status: event.status === 'error' ? 'error' : event.status === 'running' ? 'running' : 'done',
        actions: [],
      };
      steps.push(current);
      return;
    }

    if (!current) {
      current = {
        id: `step-${event.id || index}`,
        title: 'Thinking...',
        status: event.status === 'running' ? 'running' : event.status === 'error' ? 'error' : 'done',
        actions: [],
      };
      steps.push(current);
    }

    if (event.status === 'running') current.status = 'running';
    if (event.status === 'error' || event.type === 'error') current.status = 'error';

    if (event.type === 'tool_result') {
      const previousTool = [...current.actions].reverse().find((action) => action.kind === 'tool') as TimelineAction | undefined;
      if (previousTool?.kind === 'tool') {
        previousTool.observation = event.observation || event.summary || previousTool.observation;
      } else {
        const text = eventText(event);
        if (text) current.actions.push({ kind: 'text', event, text });
      }
      return;
    }

    if (event.type === 'tool_called') {
      current.actions.push({
        kind: 'tool',
        event,
        label: event.summary || event.label || event.toolName || 'Run tool',
        observation: event.observation,
      });
      return;
    }

    if (event.type === 'file_created' || event.type === 'file_updated') {
      current.actions.push({
        kind: 'file',
        event,
        label: event.summary || event.label || `${event.type === 'file_created' ? 'Create' : 'Update'} ${event.file || 'file'}`,
      });
      return;
    }

    if (event.type === 'error') {
      current.actions.push({ kind: 'error', event, text: eventText(event) || 'The agent hit an error.' });
      return;
    }

    const text = eventText(event);
    if (text) current.actions.push({ kind: 'text', event, text });
  });

  if (steps.length > 1) {
    steps.forEach((step, index) => {
      if (index < steps.length - 1 && step.status === 'running') step.status = 'done';
    });
  }

  return steps;
}

const ToolChip = memo(({ action }: { action: Extract<TimelineAction, { kind: 'tool' }> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasDetails = Boolean(action.observation);
  const isTerminal = /terminal|shell|run_command|run command|sandbox.shell/i.test(action.label) || action.event.toolName === 'run_command' || action.event.toolName === 'sandbox.shell';
  const isSearch = /search|google|duckduckgo|web.search/i.test(action.label) || action.event.toolName === 'web.search';
  const isBrowser = /browser|navigate|browse|web.browse/i.test(action.label) || action.event.toolName === 'web.browse';
  
  let labelParts: React.ReactNode = action.label;
  if (isTerminal) {
    const raw = action.label.replace(/^Ran\s+/i, '');
    labelParts = (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded">Shell</span>
        <span className="font-mono text-white/60">{raw}</span>
      </div>
    );
  } else if (isSearch) {
    labelParts = (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">Search</span>
        <span className="text-white/60">{action.label}</span>
      </div>
    );
  }

  const obs = action.observation || '';
  const cleanedObservation = obs.replace(/Successfully finished \d+ parallel queries\.?/g, '').trim();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cleanedObservation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => hasDetails && setIsOpen((prev) => !prev)}
        className={cn(
          'group flex w-full items-center justify-between gap-2 rounded-xl py-2 px-3 text-left transition-all',
          isTerminal ? 'bg-transparent border border-white/5 hover:border-white/10 hover:bg-white/[0.02]' : 'hover:bg-white/[0.03]',
          !hasDetails && 'cursor-default'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {isTerminal ? <Terminal size={14} className="shrink-0 text-indigo-400" /> : isSearch ? <Search size={14} className="shrink-0 text-emerald-400" /> : isBrowser ? <Globe size={14} className="shrink-0 text-blue-400" /> : (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
              {getIconForLabel(action.label, action.event.toolName)}
            </div>
          )}
          <div className="flex-1 min-w-0 truncate">
            {labelParts}
          </div>
        </div>
        {hasDetails && (
          <div className={cn(
            "flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors",
            isOpen && "bg-white/10 text-white/80"
          )}>
            {isOpen ? 'HIDE' : 'VIEW'}
            <ChevronDown size={10} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
          </div>
        )}
      </button>

      {hasDetails && isOpen && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="group/log relative overflow-hidden rounded-xl border border-white/5 bg-transparent">
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <Terminal size={10} className="text-white/20" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 font-sans">Execution Log</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="opacity-0 group-hover/log:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded-md text-white/40 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase"
                title="Copy log output"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-emerald-400 text-[9px] font-mono lowercase">copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span className="text-[9px] font-mono lowercase">copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="custom-scrollbar max-h-[400px] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-gray-400 bg-transparent">
              {cleanedObservation ? (
                <div className="whitespace-pre-wrap selection:bg-indigo-500/30 selection:text-white">{cleanedObservation}</div>
              ) : (
                <div className="flex items-center gap-2 text-white/20 italic font-sans text-xs">
                  <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
                  No output available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
ToolChip.displayName = 'ToolChip';

const FileChip = memo(
  ({
    action,
    currentFiles,
    onFileClick,
  }: {
    action: Extract<TimelineAction, { kind: 'file' }>;
    currentFiles?: Record<string, string>;
    onFileClick?: (filePath: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const filePath = action.event.file || '';
    const language = filePath.split('.').pop() || 'text';
    const code = currentFiles?.[filePath] || 'File content unavailable.';

    return (
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/[0.055] px-3 py-1.5 text-left text-[13px] leading-none text-[#cfcfcf] transition-colors hover:bg-white/[0.09]"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06]">
            <FileCode size={13} className="text-gray-300" />
          </span>
          <span className="truncate">{action.label}</span>
          <ChevronDown size={14} className={cn('shrink-0 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="mt-2 max-w-[656px] overflow-hidden rounded-xl border border-white/[0.07] bg-[#202020] shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-3 py-2">
              <span className="truncate text-[11px] uppercase tracking-[0.16em] text-gray-500">{filePath || 'file'}</span>
              {filePath && onFileClick && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onFileClick(filePath);
                  }}
                  className="shrink-0 text-[11px] font-medium text-gray-300 hover:text-white"
                >
                  Open in editor
                </button>
              )}
            </div>
            <div className="custom-scrollbar max-h-72 overflow-auto">
              <CodeBlock
                code={code}
                language={language as any}
                className="rounded-none border-0 [&>div>div>pre]:bg-transparent [&>div>div>pre]:p-3"
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);
FileChip.displayName = 'FileChip';

const GroupedFilesArtifact = memo(({ 
  events, 
  onFileClick, 
  currentFiles 
}: { 
  events: AgentEvent[]; 
  onFileClick?: (filePath: string) => void; 
  currentFiles?: Record<string, string>;
}) => {
  if (!events.length) return null;

  // Deduplicate files by path
  const uniqueFilePaths = Array.from(new Set(events.map(e => e.path || e.file || '').filter(Boolean)));

  return (
    <div className="w-full my-3 animate-fade-in font-sans">
      <div className="text-[12px] text-white/40 font-medium mb-2.5 pl-1.5 uppercase tracking-wider">Created & Edited Files</div>
      <div className="flex flex-wrap gap-2 pl-1.5 items-center">
        {uniqueFilePaths.map((path) => {
          const matchingEvents = events.filter(e => (e.path || e.file) === path);
          const e = matchingEvents[matchingEvents.length - 1];
          if (!e) return null;

          let rawVerb = e.verb || 'Analyzed';
          if (e.type === 'file_created') rawVerb = 'Created';
          if (e.type === 'file_updated') rawVerb = 'Edited';
          
          const isRunning = e.status === 'running';
          const verb = formatVerb(rawVerb, isRunning);

          const folder = isFolderPath(path);
          const name = folder ? path.replace(/\\/g, '/').replace(/\/$/, '') : fileBasename(path);

          const isCreated = verb === 'Created';
          const isEdited = verb === 'Edited' || verb === 'Editing';

          return (
            <div 
              key={path} 
              onClick={() => onFileClick?.(path)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900 border border-white/5 rounded-lg text-[13px] text-white/[0.85] hover:text-white transition-all select-none cursor-pointer hover:border-white/10 active:scale-95",
                isCreated && "border-white/5 hover:bg-neutral-800/80",
                isEdited && "border-white/5 hover:bg-neutral-800/80"
              )}
            >
              <img 
                src={getIconUrl(name, folder, true)} 
                alt="" 
                className="w-4 h-4 shrink-0 object-contain" 
                onError={(e) => {
                  e.currentTarget.src = folder 
                    ? 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/folder.svg'
                    : 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/file.svg';
                }} 
              />
              <span className="font-semibold truncate max-w-[140px]" title={path}>
                {name}
              </span>
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider scale-90",
                isCreated ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
              )}>
                {isCreated ? "Created" : "Edited"}
              </span>
              {isEdited && (e.additions !== undefined || e.deletions !== undefined) && (
                <span className="font-mono text-[10px] opacity-75 flex gap-0.5 shrink-0 select-text">
                  <span className="text-emerald-500">+{e.additions || 0}</span>
                  <span className="text-red-500">-{e.deletions || 0}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
GroupedFilesArtifact.displayName = 'GroupedFilesArtifact';

const CheckpointItem = memo(({ 
  todo, 
  status, 
  isLast, 
  todoEvents, 
  todoStructured, 
  onFileClick,
  currentFiles
}: { 
  todo: RoadmapTodo; 
  status: string; 
  isLast: boolean; 
  todoEvents: AgentEvent[]; 
  todoStructured: StructuredRun; 
  onFileClick?: (filePath: string) => void; 
  currentFiles?: Record<string, string>;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const isRunning = status === 'running';
  const isDone = status === 'done';
  const isError = status === 'error';

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
            isDone ? "bg-white/20 text-white/80" : isRunning ? "bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.2)]" : "bg-white/10 text-white/40"
          )}>
            {isDone ? <Check size={12} /> : isRunning ? <Loader2 size={10} className="animate-spin" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
          </div>
          <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left group">
            <span className={cn(
              "text-[15px] font-bold leading-none tracking-tight transition-colors",
              isDone ? "text-white/60" : isRunning ? "text-white" : "text-white/40"
            )}>
              {todo.title}
            </span>
            <ChevronDown size={14} className={cn("text-white/20 transition-transform group-hover:text-white/40", isOpen && "rotate-180")} />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="ml-7 mt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <ThoughtDropdown 
            isThinking={isRunning && !todoStructured.thoughts}
            thinkingText={todoStructured.thinkingText}
            thoughts={todoStructured.thoughts}
            startTime={todoStructured.startTime || todoEvents[0]?.createdAt}
          />

          {todoStructured.toolPairs.length > 0 && (
            <div className="space-y-3">
              {todoStructured.toolPairs.filter(({called}) => called.toolName !== 'finish').map(({ called, result }, i) => (
                <div key={called.id || `tp-${i}`} className="space-y-3">
                  <ToolChip
                    action={{
                      kind: 'tool',
                      event: called,
                      label: called.summary || called.label || called.toolName || 'Action',
                      observation: result?.observation || result?.summary,
                    }}
                  />
                  {result?.summary && (
                    <p className="text-[14px] leading-relaxed text-white/40 font-normal ml-8">{result.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {todoStructured.codingDone.filter(e => {
            let rawVerb = e.verb || 'Analyzed';
            if (e.type === 'file_created') rawVerb = 'Created';
            if (e.type === 'file_updated') rawVerb = 'Edited';
            return rawVerb !== 'Analyzed';
          }).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1.5 pb-1">
              {todoStructured.codingDone.filter(e => {
                let rawVerb = e.verb || 'Analyzed';
                if (e.type === 'file_created') rawVerb = 'Created';
                if (e.type === 'file_updated') rawVerb = 'Edited';
                return rawVerb !== 'Analyzed';
              }).map((e) => {
                let rawVerb = e.verb || 'Analyzed';
                if (e.type === 'file_created') rawVerb = 'Created';
                if (e.type === 'file_updated') rawVerb = 'Edited';
                const isItemRunning = e.status === 'running' || isRunning;
                const verb = formatVerb(rawVerb, isItemRunning);

                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-[13px] text-white/90"
                  >
                    <span className="text-white/40 text-[11px] font-semibold tracking-tight uppercase shrink-0">{verb}</span>
                    <div className="flex items-center gap-1.5 min-w-0 max-w-[200px]">
                      {extIcon(e.path || '')}
                      <button
                        type="button"
                        onClick={() => e.path && onFileClick?.(e.path)}
                        className="truncate text-left font-semibold text-white/90 hover:text-white hover:underline transition-colors leading-none"
                      >
                        {fileBasename(e.path || '')}
                      </button>
                    </div>
                    {e.type !== 'file_created' && (e.additions !== undefined || e.deletions !== undefined) && (
                      <div className="flex items-center gap-1 font-mono text-[10px] shrink-0 opacity-60 ml-0.5 border-l border-white/10 pl-1.5">
                        <span className="text-emerald-500">+{e.additions || 0}</span>
                        <span className="text-red-500">-{e.deletions || 0}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <ExploreSection
            events={todoStructured.codingDone.filter(e => {
              let rawVerb = e.verb || 'Analyzed';
              if (e.type === 'file_created') rawVerb = 'Created';
              if (e.type === 'file_updated') rawVerb = 'Edited';
              return rawVerb === 'Analyzed';
            })}
            onFileClick={onFileClick}
            currentFiles={currentFiles}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});
CheckpointItem.displayName = 'CheckpointItem';

const TimelineStepView = memo(
  ({
    step,
    isLast,
    currentFiles,
    onFileClick,
  }: {
    step: TimelineStep;
    isLast: boolean;
    currentFiles?: Record<string, string>;
    onFileClick?: (filePath: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isRunning = step.status === 'running';
    const isError = step.status === 'error';

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-2">
        <div className="relative flex justify-center">
          <div
            className={cn(
              'relative z-10 mt-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border',
              isError && 'border-red-400/25 bg-red-500/15 text-red-300',
              isRunning && 'border-white/10 bg-white/[0.07] text-gray-300',
              !isError && !isRunning && 'border-white/10 bg-white/[0.08] text-gray-400',
            )}
          >
            {isRunning ? (
              <Loader2 size={10} className="animate-spin" />
            ) : isError ? (
              <Circle size={7} fill="currentColor" />
            ) : (
              <Check size={10} />
            )}
          </div>
          {!isLast && <div className="absolute bottom-[-14px] top-6 border-l border-dashed border-white/[0.12]" />}
        </div>

        <div className="min-w-0 pb-5">
          <CollapsibleTrigger className="group flex w-full items-start gap-2 text-left">
            <span className="min-w-0 flex-1 truncate text-[15px] leading-7 text-[#d8d8d8] group-hover:text-white">{step.title}</span>
            <ChevronDown size={14} className={cn('mt-1.5 shrink-0 text-gray-600 transition-transform', isOpen && 'rotate-180')} />
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-1">
            {step.intro && <p className="max-w-[680px] text-[15px] leading-7 text-[#c6c6c6]">{step.intro}</p>}

            {step.actions.map((action, index) => {
              if (action.kind === 'text') {
                return (
                  <p key={`${action.event.id}-${index}`} className="max-w-[680px] text-[15px] leading-7 text-[#c6c6c6]">
                    {action.text}
                  </p>
                );
              }

              if (action.kind === 'tool') {
                return <ToolChip key={`${action.event.id}-${index}`} action={action} />;
              }

              if (action.kind === 'file') {
                return (
                  <FileChip
                    key={`${action.event.id}-${index}`}
                    action={action}
                    currentFiles={currentFiles}
                    onFileClick={onFileClick}
                  />
                );
              }

              return (
                <div
                  key={`${action.event.id}-${index}`}
                  className="max-w-[680px] rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] leading-6 text-red-200"
                >
                  {action.text}
                </div>
              );
            })}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
);
TimelineStepView.displayName = 'TimelineStepView';

const AgentSwarmConsole = memo(({ subAgents }: { subAgents: SubAgentStatus[] }) => {
  if (!subAgents || subAgents.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 shadow-xl backdrop-blur-md mb-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          {/* Animated network pulse */}
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-emerald-400">Recursive Meta-Cognitive Swarm</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">{subAgents.length} Dynamic Lanes Active</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {subAgents.map((agent) => {
          let statusBg = 'bg-gray-500/5 border-white/5 text-gray-400';
          let statusIndicator = 'bg-gray-500';
          let isPulse = false;

          switch (agent.status) {
            case 'thinking':
              statusBg = 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300';
              statusIndicator = 'bg-indigo-400';
              isPulse = true;
              break;
            case 'working':
              statusBg = 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300';
              statusIndicator = 'bg-emerald-400';
              isPulse = true;
              break;
            case 'waiting':
              statusBg = 'bg-amber-500/5 border-amber-500/10 text-amber-300';
              statusIndicator = 'bg-amber-400';
              isPulse = true;
              break;
            case 'completed':
              statusBg = 'bg-cyan-500/5 border-cyan-500/10 text-cyan-300';
              statusIndicator = 'bg-cyan-400';
              break;
            case 'error':
              statusBg = 'bg-rose-500/5 border-rose-500/10 text-rose-300';
              statusIndicator = 'bg-rose-500';
              isPulse = true;
              break;
            default:
              break;
          }

          return (
            <div
              key={agent.id}
              className={cn(
                "relative overflow-hidden rounded-xl border p-2.5 transition-all duration-300 bg-white/[0.01]",
                statusBg
              )}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-xs font-bold text-gray-100 truncate">{agent.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[8px] uppercase tracking-wider font-bold opacity-80">{agent.status}</span>
                  <div className="relative flex h-1.5 w-1.5">
                    {isPulse && (
                      <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        agent.status === 'working' ? 'bg-emerald-400' :
                        agent.status === 'thinking' ? 'bg-indigo-400' :
                        agent.status === 'waiting' ? 'bg-amber-400' : 'bg-rose-400'
                      )}></span>
                    )}
                    <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", statusIndicator)}></span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-gray-400 font-semibold truncate leading-none mb-1.5">
                {agent.role}
              </div>

              <div className="text-[10px] text-gray-300 truncate font-normal pt-1.5 border-t border-white/5 opacity-90">
                {agent.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
AgentSwarmConsole.displayName = 'AgentSwarmConsole';

const ExploreSection = () => {
  return null;
};
ExploreSection.displayName = 'ExploreSection';

export const AgentActionStream = memo(({ events, currentFiles, onFileClick }: AgentActionStreamProps) => {
  const [openThoughts, setOpenThoughts] = useState<Record<string, boolean>>({});
  const liveSubAgents = useStore((state) => state.subAgents);

  if (!events.length) return null;

  // Filter and process events into a linear timeline
  const timelineEvents = events.filter(e => 
    e.type === 'thought_stream' || 
    e.type === 'tool_called' || 
    e.type === 'tool_result' || 
    e.type === 'coding_action' ||
    e.type === 'file_created' ||
    e.type === 'file_updated' ||
    e.type === 'error'
  );

  // Group tool_called and tool_result pairs
  const processedEvents: any[] = [];
  const toolResults = new Map<string, AgentEvent>();
  
  events.forEach(e => {
    if (e.type === 'tool_result') {
      // Find the most recent tool_called without a result
      for (let i = processedEvents.length - 1; i >= 0; i--) {
        if (processedEvents[i].type === 'tool_called' && !processedEvents[i].result) {
          processedEvents[i].result = e;
          break;
        }
      }
    } else if (e.type === 'thought_stream') {
      // Find the last displayed event in processedEvents
      let lastDisplayedIdx = -1;
      for (let i = processedEvents.length - 1; i >= 0; i--) {
        const itemType = processedEvents[i].type;
        if (
          itemType === 'thought_stream' ||
          itemType === 'tool_called' ||
          itemType === 'coding_action' ||
          itemType === 'error'
        ) {
          lastDisplayedIdx = i;
          break;
        }
      }

      if (lastDisplayedIdx !== -1 && processedEvents[lastDisplayedIdx].type === 'thought_stream') {
        const lastThought = processedEvents[lastDisplayedIdx];
        // Merge consecutive thought_stream events while keeping the original createdAt start time
        processedEvents[lastDisplayedIdx] = { ...e, createdAt: lastThought.createdAt };
      } else {
        processedEvents.push({ ...e });
      }
    } else if (e.type === 'coding_action' || e.type === 'file_created' || e.type === 'file_updated') {
      const path = e.path || e.file;
      let merged = false;
      if (path && e.verb !== 'Analyzed') {
        for (let i = processedEvents.length - 1; i >= 0; i--) {
          const prevE = processedEvents[i];
          if ((prevE.type === 'coding_action' || prevE.type === 'file_created' || prevE.type === 'file_updated') &&
              (prevE.path === path || prevE.file === path) &&
              prevE.verb !== 'Analyzed') {
            const isJustAfterDone = prevE.status === 'done' && prevE.type === 'coding_action' && 
                                    (e.type === 'file_created' || e.type === 'file_updated');
            if (prevE.status === 'running' || isJustAfterDone) {
              processedEvents[i] = { ...prevE, ...e, type: e.type, status: e.status || prevE.status };
              merged = true;
            }
            break;
          }
        }
      }
      if (!merged) {
        processedEvents.push({ ...e });
      }
    } else {
      processedEvents.push({ ...e });
    }
  });

  const sessionStats = useMemo(() => {
    const analyzed = events.filter(
      (e) => e.type === 'coding_action' && e.verb === 'Analyzed' && e.path,
    );
    return {
      files: analyzed.filter((e) => e.path && !isFolderPath(e.path!)).length,
      folders: analyzed.filter((e) => e.path && isFolderPath(e.path!)).length,
      start: events[0]?.createdAt,
    };
  }, [events]);

  const lastSubAgentsEvent = [...events].reverse().find(e => e.type === 'sub_agents_update');
  const subAgents = lastSubAgentsEvent 
    ? (lastSubAgentsEvent.subAgents as SubAgentStatus[]) 
    : (liveSubAgents && liveSubAgents.length > 0 ? liveSubAgents : []);

  const isGenerating = useStore((state) => state.isGenerating);
  const isThinkingStore = useStore((state) => state.isThinking);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = events[0]?.createdAt || Date.now();
    if (isGenerating) {
      const interval = setInterval(() => {
        setElapsed(Math.max(0, Math.round((Date.now() - start) / 1000)));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const end = events[events.length - 1]?.createdAt || Date.now();
      setElapsed(Math.max(0, Math.round((end - start) / 1000)));
    }
  }, [isGenerating, events]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const workedLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const budPhaseLabel = useStore((state) => state.budPhaseLabel);

  const visibleEvents = useMemo(() => {
    return processedEvents.filter(e => 
      e.type === 'thought_stream' || 
      e.type === 'tool_called' || 
      e.type === 'coding_action' ||
      e.type === 'file_created' ||
      e.type === 'file_updated' ||
      e.type === 'error'
    );
  }, [processedEvents]);

  const nonAnalyzedEvents = useMemo(() => {
    return visibleEvents.filter(e => {
      if (e.type === 'coding_action' || e.type === 'file_created' || e.type === 'file_updated') {
        let rawVerb = e.verb || 'Analyzed';
        if (e.type === 'file_created') rawVerb = 'Created';
        if (e.type === 'file_updated') rawVerb = 'Edited';
        return rawVerb !== 'Analyzed';
      }
      return true;
    });
  }, [visibleEvents]);

  const analyzedEvents = useMemo(() => {
    return visibleEvents.filter(e => {
      if (e.type === 'coding_action' || e.type === 'file_created' || e.type === 'file_updated') {
        let rawVerb = e.verb || 'Analyzed';
        if (e.type === 'file_created') rawVerb = 'Created';
        if (e.type === 'file_updated') rawVerb = 'Edited';
        return rawVerb === 'Analyzed';
      }
      return false;
    });
  }, [visibleEvents]);

  const intermediateEvents = nonAnalyzedEvents;

  const allMergedCodingEvents = useMemo(() => {
    return processedEvents.filter(e => e.type === 'coding_action' || e.type === 'file_created' || e.type === 'file_updated');
  }, [processedEvents]);

  const [intermediatesOpen, setIntermediatesOpen] = useState(isGenerating);

  useEffect(() => {
    if (isGenerating) {
      setIntermediatesOpen(true);
    }
  }, [isGenerating]);

  return (
    <div className="w-full animate-fade-in space-y-4 font-sans">
      {/* ── Intermediates Container (No Dropdown Label or Toggle) ── */}
      {intermediateEvents.length > 0 && (
        <div className="w-full">
          <div className="mt-1 space-y-3.5 pl-2 border-l border-white/10 ml-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {intermediateEvents.map((e, idx) => {
              if (e.type === 'thought_stream') {
                const isExplorationEvent = 
                  e.summary === "Request Analysis & Intent Classification" ||
                  e.summary === "Analyzed Workspace" || 
                  (e.details && e.details.includes("Exploration complete")) ||
                  (e.summary && e.summary.includes("Exploration complete"));
                if (isExplorationEvent) return null;

                if (e.phase === 'thinking' || e.phase === 'thoughts') {
                  const rawText = (e.text || '').trim();
                  const safeThinkingText =
                    rawText && rawText !== 'Thinking…' && rawText !== 'Thinking...' ? rawText : null;
                  
                  const isLatestVisible = idx === intermediateEvents.length - 1;
                  const activelyThinking = e.phase === 'thinking' && isLatestVisible && (isThinkingStore || isGenerating);

                  const isGenericSummary = 
                    !e.summary || 
                    e.summary.toLowerCase().includes('thinking') || 
                    e.summary.toLowerCase().includes('roadmap') || 
                    e.summary.toLowerCase().includes('run overview');

                  return (
                    <div key={e.id || idx} className="space-y-2 my-1 animate-fade-in pl-1">
                      <ThoughtDropdown 
                        isThinking={activelyThinking}
                        thinkingText={safeThinkingText}
                        thoughts={e.phase === 'thoughts' && e.details ? { summary: '', details: e.details } : null}
                        startTime={e.createdAt}
                      />
                      {!activelyThinking && !isGenericSummary && e.summary && (
                        <p className="text-[13px] leading-relaxed text-neutral-300 font-normal pl-3 border-l-2 border-white/10 my-2 select-text font-sans">
                          {e.summary}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }

              if (e.type === 'coding_action' || e.type === 'file_created' || e.type === 'file_updated') {
                let rawVerb = e.verb || 'Analyzed';
                if (e.type === 'file_created') rawVerb = 'Created';
                if (e.type === 'file_updated') rawVerb = 'Edited';
                const isItemRunning = e.status === 'running';
                const verb = formatVerb(rawVerb, isItemRunning);
                const path = e.path || e.file || '';
                if (!path) return null;

                return (
                  <div key={e.id || idx} className="flex items-center min-w-0 pl-1 py-1">
                    <FileArtifactRow
                      verb={verb}
                      path={path}
                      lineStart={e.lineStart}
                      lineEnd={e.lineEnd}
                      additions={e.additions}
                      deletions={e.deletions}
                      onFileClick={onFileClick}
                      currentFiles={currentFiles}
                    />
                  </div>
                );
              }

              if (e.type === 'tool_called') {
                if (e.toolName === 'finish') return null;
                if (e.toolName && FILE_ARTIFACT_TOOLS.has(e.toolName)) return null;
                return (
                  <div key={e.id || idx} className="space-y-3 pl-1">
                    <ToolChip
                      action={{
                        kind: 'tool',
                        event: e,
                        label: e.summary || e.label || e.toolName || 'Action',
                        observation: e.result?.observation || e.result?.summary,
                      }}
                    />
                    {e.result?.summary && (
                      <p className="text-[13px] leading-relaxed text-white/35 font-normal ml-8">{e.result.summary}</p>
                    )}
                  </div>
                );
              }

              if (e.type === 'error') {
                return (
                  <div key={e.id || idx} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400 pl-1">
                    {e.observation || e.summary || 'An error occurred during execution.'}
                  </div>
                );
              }

              return null;
            })}
            <ExploreSection
              events={analyzedEvents}
              onFileClick={onFileClick}
              currentFiles={currentFiles}
            />
          </div>
        </div>
      )}

      {/* ── File Artifacts Shown Outside at the end ── */}
    </div>
  );
});

AgentActionStream.displayName = 'AgentActionStream';

export default AgentActionStream;
