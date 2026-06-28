import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { 
  Brain, ChevronDown, Zap, Monitor, Terminal, Globe, 
  FolderOpen, Search, Plug, Check, Sparkles, ArrowRight,
  Code, Layout, Database, Palette, MousePointer, Keyboard,
  ScrollText, AppWindow, FileCode, GitBranch, Package,
  Bug, Cpu, Cloud, Workflow, RefreshCw
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { ALL_MODELS } from '../lib/constants';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const BUD_CAPABILITIES = [
  {
    id: 'webdev',
    icon: Code,
    label: 'Web Development',
    color: 'from-emerald-500 to-cyan-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    knowledge: [
      'React 18/19 — hooks, context, suspense, server components',
      'Vite — HMR, config, plugins, optimized builds',
      'Next.js 14/15 — App Router, Server Actions, API routes, middleware, ISR/SSR/SSG',
      'TypeScript — strict typing, generics, utility types, module resolution',
      'Tailwind CSS — utility-first, custom themes, animations, responsive design',
      'Prisma ORM — schema design, migrations, relations, queries',
      'Zustand / Redux — state management patterns, selectors, middleware',
      'React Router — nested routes, loaders, dynamic segments, guards',
      'Framer Motion — animations, gestures, layout transitions',
      'Component architecture — atomic design, composition patterns, render optimization',
    ],
  },
  {
    id: 'desktop',
    icon: Monitor,
    label: 'Desktop Control',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    knowledge: [
      'Mouse control — precise coordinate clicking, dragging, double-click, right-click',
      'Keyboard input — typing text, key combos (Ctrl+C, Alt+Tab), special keys',
      'Screen reading — screenshot analysis, OCR, element identification',
      'Scrolling — directional scroll, page navigation, infinite scroll handling',
      'App launching — Firefox, Chrome, VS Code, Terminal, LibreOffice, file managers',
      'Window management — resize, move, minimize, maximize, switch between windows',
      'Desktop navigation — taskbar, start menu, system tray, file dialogs',
      'Form filling — text fields, dropdowns, checkboxes, radio buttons, date pickers',
      'Multi-step workflows — login flows, form submissions, file uploads',
      'Error recovery — detect frozen apps, handle popups, dismiss dialogs',
    ],
  },
  {
    id: 'computer',
    icon: Terminal,
    label: 'Computer Sandbox',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    knowledge: [
      'Shell/Bash — pipes, redirects, grep, sed, awk, process management, cron',
      'Python 3 — numpy, pandas, matplotlib, requests, bs4, pillow, playwright, flask, fastapi',
      'Node.js — express, fs, path, child_process, npm scripts, package management',
      'Git — clone, branch, commit, push, merge, rebase, conflict resolution, stash',
      'Docker — containers, images, volumes, networking, compose, multi-stage builds',
      'File system — read, write, create, delete, move, permissions, symlinks, archives',
      'Package managers — npm, pip, apt-get, installation, version pinning, lockfiles',
      'Web scraping — Playwright browser automation, headless Chrome, page parsing',
      'HTTP requests — fetch, curl, headers, auth, form data, file uploads, WebSockets',
      'Process management — background tasks, signals, resource monitoring, debugging',
    ],
  },

  {
    id: 'filesystem',
    icon: FolderOpen,
    label: 'File Operations',
    color: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500/20',
    knowledge: [
      'Create project structures — scaffolding, boilerplates, directory trees',
      'Read & analyze code — parse imports, find dependencies, detect patterns',
      'Write production code — clean, typed, documented, tested, optimized',
      'Multi-file editing — coordinated changes across components, configs, tests',
      'Archive management — zip, tar.gz, extract, compress, download bundles',
      'Config files — .env, tsconfig, eslint, prettier, vite.config, next.config',
      'Code generation — templates, snippets, migrations, seed data, tests',
      'Dependency management — install, update, audit, resolve conflicts',
      'Build systems — webpack, vite, turbopack, esbuild, rollup, SWC',
      'Workspace management — monorepos, workspaces, shared packages',
    ],
  },
  {
    id: 'search',
    icon: Search,
    label: 'Web Intelligence',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    knowledge: [
      'Web browsing — navigate, read, extract content, follow links, handle SPAs',
      'Screenshot analysis — visual inspection, layout verification, responsive testing',
      'API exploration — REST endpoints, GraphQL, WebSocket, documentation parsing',
      'Data extraction — scraping, parsing HTML/JSON/XML, structured data collection',
      'Documentation lookup — MDN, npm, PyPI, GitHub, Stack Overflow, official docs',
      'Research — multi-source aggregation, fact verification, synthesis, summarization',
      'HTTP debugging — headers, cookies, CORS, status codes, redirects, caching',
      'Performance testing — load time, bundle size, lighthouse scores, core web vitals',
      'SEO analysis — meta tags, structured data, sitemap, robots.txt, OpenGraph',
      'Accessibility testing — ARIA, contrast, keyboard nav, screen reader compatibility',
    ],
  },
];

const AGENT_MODES = [
  { id: 'scout', label: 'Scout', icon: Search, color: 'text-amber-400', description: 'Exploring project structure' },
  { id: 'plan', label: 'Plan', icon: Workflow, color: 'text-indigo-400', description: 'Architecting solution' },
  { id: 'build', label: 'Build', icon: Zap, color: 'text-emerald-400', description: 'Executing code changes' },
];

const LOOP_PHASES = [
  { id: 'planning', label: 'Plan', icon: Workflow, description: 'Break down goals into actionable subtasks' },
  { id: 'executing', label: 'Execute', icon: Zap, description: 'Carry out actions using tools and capabilities' },
  { id: 'observing', label: 'Observe', icon: Search, description: 'Evaluate outcomes and detect issues' },
  { id: 'iterating', label: 'Iterate', icon: RefreshCw, description: 'Refine approach based on observations' },
];

interface BudAgentPanelProps {
  children: React.ReactNode;
}

export function BudAgentPanel({ children }: BudAgentPanelProps) {
  const { 
    model, setModel, provider, setProvider, enabledModels, 
    budStatus, budPhaseLabel,
    isGenerating
  } = useStore();
  const [open, setOpen] = useState(false);
  const [expandedCapability, setExpandedCapability] = useState<string | null>(null);

  const displayedModels = ALL_MODELS.filter(m => enabledModels.includes(m.id));

  const currentModelObj = displayedModels.find(m => m.id === model);
  const currentModelName = currentModelObj?.name || model;

  const getPhaseIndex = () => {
    switch (budStatus) {
      case 'planning': return 0;
      case 'executing': return 1;
      case 'observing': return 2;
      case 'iterating': return 3;
      default: return -1;
    }
  };

  const activePhaseIndex = getPhaseIndex();

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[400px] max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 duration-200"
          sideOffset={12}
          align="start"
        >
          <div className="flex flex-col">
            {/* Header — Bud Identity */}
            <div className="p-5 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Brain size={26} className="text-white" />
                    </div>
                    {isGenerating && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#111111] flex items-center justify-center">
                        <Sparkles size={10} className="text-white animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white leading-none">Bud [RMCS]</h3>
                    <p className="text-xs font-medium text-white/40 mt-1 uppercase tracking-widest">Recursive Meta-Cognitive Swarm v3.0</p>
                  </div>
                </div>
                
                {isGenerating && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider",
                    budStatus === 'planning' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                    budStatus === 'executing' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    budStatus === 'observing' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    "bg-white/5 border-white/10 text-white/40"
                  )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", 
                      budStatus === 'planning' ? "bg-indigo-400 animate-pulse" :
                      budStatus === 'executing' ? "bg-emerald-400 animate-pulse" :
                      budStatus === 'observing' ? "bg-amber-400 animate-pulse" :
                      "bg-white/40"
                    )} />
                    {budStatus.toUpperCase()} MODE
                  </div>
                )}
              </div>
            </div>

            {/* Autonomous Loop Indicator */}
            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5">Agent Loop</div>
              <div className="flex items-center gap-1">
                {LOOP_PHASES.map((phase, i) => {
                  const isActive = activePhaseIndex === i;
                  const isDone = activePhaseIndex > i;
                  const PhaseIcon = phase.icon;
                  return (
                    <React.Fragment key={phase.id}>
                      <div 
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          isActive 
                            ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30' 
                            : isDone
                              ? 'bg-white/5 text-white/40'
                              : 'text-white/15'
                        }`}
                        title={phase.description}
                      >
                        <PhaseIcon size={10} className={isActive ? 'animate-pulse' : ''} />
                        {phase.label}
                      </div>
                      {i < LOOP_PHASES.length - 1 && (
                        <ArrowRight size={8} className={`flex-shrink-0 ${isDone || isActive ? 'text-emerald-500/40' : 'text-white/10'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Connected Model */}
            <div className="px-5 py-3 border-b border-white/5">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Connected Brain</div>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <Cpu size={14} className="text-cyan-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-gray-200">{currentModelName}</div>
                        <div className="text-[10px] text-gray-600">Powering Bud's intelligence</div>
                      </div>
                    </div>
                    <ChevronDown size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="min-w-[260px] bg-[#1a1a1a] border border-white/10 rounded-xl p-1.5 shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-100"
                    sideOffset={4}
                  >
                    <div className="px-2 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Connect a Model to Bud
                    </div>
                    {displayedModels.map(m => (
                      <DropdownMenu.Item
                        key={`${m.provider}-${m.id}`}
                        onClick={() => {
                          setModel(m.id);
                          setProvider(m.provider as any);
                        }}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none transition-colors ${
                          model === m.id 
                            ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/20' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {model === m.id && <Check size={14} className="text-emerald-400" />}
                          <span>{m.name}</span>
                        </div>
                        {model === m.id && (
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
                        )}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            {/* Capabilities */}
            <div className="px-5 py-3 max-h-[340px] overflow-y-auto custom-scrollbar">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2.5">Capabilities & Deep Knowledge</div>
              <div className="space-y-1.5">
                {BUD_CAPABILITIES.map((cap) => {
                  const Icon = cap.icon;
                  const isExpanded = expandedCapability === cap.id;
                  return (
                    <div key={cap.id} className="rounded-xl border border-white/5 overflow-hidden transition-all">
                      <button
                        onClick={() => setExpandedCapability(isExpanded ? null : cap.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-white/[0.03] ${
                          isExpanded ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${cap.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={14} className={cap.textColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-200">{cap.label}</div>
                          <div className="text-[10px] text-gray-600 truncate">
                            {cap.knowledge.length} areas of deep expertise
                          </div>
                        </div>
                        <ChevronDown 
                          size={12} 
                          className={`text-gray-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 space-y-1 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
                          {cap.knowledge.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 py-0.5">
                              <div className={`w-1 h-1 rounded-full ${cap.bgColor} mt-1.5 flex-shrink-0`} />
                              <span className="text-[11px] text-gray-400 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Fully Autonomous • Self-Correcting
                  </span>
                </div>
                <div className="text-[10px] font-mono text-gray-700">v2.0</div>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
