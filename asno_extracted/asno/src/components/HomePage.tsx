import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import type { Block } from '../types';
import {
  Search, Plus, Type, Heading1, Heading2, Heading3, CheckSquare, List, ListOrdered,
  ChevronRight, Quote, Terminal, Image as ImageIcon, Table, Minus,
  FileText, Columns, RefreshCw, Video, Music, Paperclip, BookOpen,
  Globe, Bookmark, Sparkles, Sigma, ExternalLink, Layers, MapPin,
  PenTool, PlaySquare, Calendar, Activity, User,
  BarChart3, ThumbsUp, MessageSquare, FileSpreadsheet, Map, PieChart,
  Clock, Anchor, Compass, Volume2, Smile, Upload,
  Database, Layout, Zap, Star, Palette,
  Wrench, Book, Briefcase, X, BrainCircuit, Shield, Headphones
} from 'lucide-react';

interface HomeItem {
  id: string;
  type: 'page' | 'block' | 'tool' | 'template' | 'database';
  label: string;
  desc: string;
  icon: React.ReactNode;
  category: string;
  keywords: string;
  action: () => void;
}

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="#ff0000" style={{ display: 'block' }}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ display: 'block' }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ display: 'block' }}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zM6.304 15.165a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.824 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.824 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zM8.824 6.304a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.782a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.042zM18.958 8.824a2.528 2.528 0 0 1 2.522-2.52A2.528 2.528 0 0 1 24 8.824a2.528 2.528 0 0 1-2.52 2.52h-2.522V8.824zM17.696 8.824a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.782a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.042zM15.165 18.958a2.528 2.528 0 0 1 2.52 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.52v-2.522h2.52zM15.165 17.696a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.52-2.522h5.042a2.528 2.528 0 0 1 2.522 2.522v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.042z"/>
  </svg>
);

const HomePage: React.FC = () => {
  const {
    pages, setActivePageId, addPage, addBlock, loadTemplate, activeWorkspaceId,
    setSettingsOpen, setImportOpen, setAutomationOpen, setCanvasFlowOpen, setMeetingMindOpen, setUIForgeOpen, setFocusShieldOpen, setComposioConnectorsOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const workspacePages = pages.filter(p => !p.isTrash && (p.workspaceId === activeWorkspaceId || (!p.workspaceId && activeWorkspaceId === 'default')));

  const addBlockToPage = (type: Block['type']) => {
    const newPageId = addPage(null);
    setTimeout(() => addBlock(newPageId, type), 50);
  };

  const items: HomeItem[] = useMemo(() => [
    ...workspacePages.map(p => ({
      id: `page-${p.id}`, type: 'page' as const, label: p.title || 'Untitled', desc: p.isDatabase ? 'Database page' : 'Page',
      icon: <span style={{ fontSize: '16px' }}>{p.icon || '📄'}</span>, category: '📄 Pages',
      keywords: `${p.title} page ${p.isDatabase ? 'database' : ''}`,
      action: () => setActivePageId(p.id)
    })),
    { id: 'new-page', type: 'page' as const, label: '+ New Blank Page', desc: 'Create a new empty page', icon: <Plus size={14} style={{ color: 'var(--accent-color)' }} />, category: '📄 Pages', keywords: 'new blank page create empty', action: () => addPage(null) },
    { id: 'text', type: 'block' as const, label: 'Text', desc: 'Plain writing block', icon: <Type size={14} />, category: '✏️ Basic Blocks', keywords: 'text paragraph plain normal', action: () => addBlockToPage('text') },
    { id: 'h1', type: 'block' as const, label: 'Heading 1', desc: 'Large section header', icon: <Heading1 size={14} />, category: '✏️ Basic Blocks', keywords: 'heading h1 large title', action: () => addBlockToPage('h1') },
    { id: 'h2', type: 'block' as const, label: 'Heading 2', desc: 'Medium section header', icon: <Heading2 size={14} />, category: '✏️ Basic Blocks', keywords: 'heading h2 medium section', action: () => addBlockToPage('h2') },
    { id: 'h3', type: 'block' as const, label: 'Heading 3', desc: 'Small section header', icon: <Heading3 size={14} />, category: '✏️ Basic Blocks', keywords: 'heading h3 small sub', action: () => addBlockToPage('h3') },
    { id: 'todo', type: 'block' as const, label: 'To-do List', desc: 'Checkbox for tasks', icon: <CheckSquare size={14} />, category: '✏️ Basic Blocks', keywords: 'todo check checkbox list task', action: () => addBlockToPage('todo') },
    { id: 'bullet', type: 'block' as const, label: 'Bulleted List', desc: 'Simple bulleted list', icon: <List size={14} />, category: '✏️ Basic Blocks', keywords: 'bullet bulleted list unordered', action: () => addBlockToPage('bullet') },
    { id: 'number', type: 'block' as const, label: 'Numbered List', desc: 'Sequential list', icon: <ListOrdered size={14} />, category: '✏️ Basic Blocks', keywords: 'number numbered list ordered', action: () => addBlockToPage('number') },
    { id: 'toggle', type: 'block' as const, label: 'Toggle List', desc: 'Toggles nested blocks', icon: <ChevronRight size={14} />, category: '✏️ Basic Blocks', keywords: 'toggle list accordion collapse', action: () => addBlockToPage('toggle') },
    { id: 'quote', type: 'block' as const, label: 'Quote', desc: 'Capture a quote', icon: <Quote size={14} />, category: '✏️ Basic Blocks', keywords: 'quote blockquote citation', action: () => addBlockToPage('quote') },
    { id: 'callout', type: 'block' as const, label: 'Callout', desc: 'Make writing stand out', icon: <FileText size={14} style={{ color: 'var(--accent-color)' }} />, category: '✏️ Basic Blocks', keywords: 'callout info alert highlights', action: () => addBlockToPage('callout') },
    { id: 'divider', type: 'block' as const, label: 'Divider', desc: 'Horizontal separator line', icon: <Minus size={14} />, category: '✏️ Basic Blocks', keywords: 'divider line separator hr', action: () => addBlockToPage('divider') },
    { id: 'code', type: 'block' as const, label: 'Code Block', desc: 'Syntax highlighted code', icon: <Terminal size={14} />, category: '💻 Media & Code', keywords: 'code programming syntax terminal', action: () => addBlockToPage('code') },
    { id: 'image', type: 'block' as const, label: 'Image', desc: 'Insert cover image or photo', icon: <ImageIcon size={14} />, category: '💻 Media & Code', keywords: 'image picture photo graphic upload', action: () => addBlockToPage('image') },
    { id: 'video', type: 'block' as const, label: 'Video Player', desc: 'Upload or embed MP4 videos', icon: <Video size={14} />, category: '💻 Media & Code', keywords: 'video player mp4 clip stream', action: () => addBlockToPage('video') },
    { id: 'audio', type: 'block' as const, label: 'Audio Player', desc: 'Upload or embed sound clips', icon: <Music size={14} />, category: '💻 Media & Code', keywords: 'audio music sound player pod', action: () => addBlockToPage('audio') },
    { id: 'file', type: 'block' as const, label: 'File Attachment', desc: 'Upload files and download cards', icon: <Paperclip size={14} />, category: '💻 Media & Code', keywords: 'file attachment download zip upload', action: () => addBlockToPage('file') },
    { id: 'embed', type: 'block' as const, label: 'Web Embed', desc: 'Generic iframe web preview', icon: <Globe size={14} />, category: '💻 Media & Code', keywords: 'embed iframe web url widget', action: () => addBlockToPage('embed') },
    { id: 'bookmark', type: 'block' as const, label: 'Web Bookmark', desc: 'URL bookmark preview card', icon: <Bookmark size={14} />, category: '💻 Media & Code', keywords: 'bookmark url web link preview', action: () => addBlockToPage('bookmark') },
    { id: 'table', type: 'block' as const, label: 'Simple Table', desc: 'Simple plain data matrix', icon: <Table size={14} />, category: '💻 Media & Code', keywords: 'table simple grid', action: () => addBlockToPage('table') },
    { id: 'column-list', type: 'block' as const, label: '2 Columns Layout', desc: 'Multi-column container', icon: <Columns size={14} />, category: '📐 Layouts', keywords: 'column columns grid layout', action: () => addBlockToPage('column-list') },
    { id: 'synced-block', type: 'block' as const, label: 'Synced Block', desc: 'Sync blocks across pages', icon: <RefreshCw size={14} />, category: '📐 Layouts', keywords: 'sync synced block mirrors copy', action: () => addBlockToPage('synced-block') },
    { id: 'db-table', type: 'database' as const, label: 'Table View Database', desc: 'Create a database Table layout', icon: <Table size={14} />, category: '🗄️ Databases', keywords: 'database table grid fields', action: () => addPage(null, true, 'table') },
    { id: 'db-board', type: 'database' as const, label: 'Kanban Board Database', desc: 'Create a database Board status layout', icon: <Columns size={14} />, category: '🗄️ Databases', keywords: 'database board kanban status', action: () => addPage(null, true, 'board') },
    { id: 'db-calendar', type: 'database' as const, label: 'Calendar View Database', desc: 'Create a database Calendar view', icon: <Calendar size={14} />, category: '🗄️ Databases', keywords: 'database calendar date planner', action: () => addPage(null, true, 'calendar') },
    { id: 'youtube', type: 'block' as const, label: 'YouTube Video', desc: 'Embed YouTube player', icon: <YoutubeIcon />, category: '🔗 Integrations', keywords: 'youtube google video player', action: () => addBlockToPage('youtube') },
    { id: 'figma', type: 'block' as const, label: 'Figma Frame', desc: 'Embed figma design board', icon: <PenTool size={14} style={{ color: '#a259ff' }} />, category: '🔗 Integrations', keywords: 'figma UI design prototype', action: () => addBlockToPage('figma') },
    { id: 'github', type: 'block' as const, label: 'GitHub Repo', desc: 'Repository details card', icon: <GithubIcon />, category: '🔗 Integrations', keywords: 'github repo git code', action: () => addBlockToPage('github') },
    { id: 'slack', type: 'block' as const, label: 'Slack Message', desc: 'Slack message card', icon: <SlackIcon />, category: '🔗 Integrations', keywords: 'slack chat messaging team', action: () => addBlockToPage('slack') },
    { id: 'google-maps', type: 'block' as const, label: 'Google Map', desc: 'Embed map with pins & zoom', icon: <Map size={14} style={{ color: '#1a73e8' }} />, category: '🔗 Integrations', keywords: 'google map maps pin location', action: () => addBlockToPage('google-maps') },
    { id: 'chart', type: 'block' as const, label: 'Advanced Chart Builder', desc: '50+ chart types: bar, line, pie, gauge', icon: <PieChart size={14} style={{ color: 'var(--accent-color)' }} />, category: '⚡ Advanced', keywords: 'chart bar line pie gauge data', action: () => addBlockToPage('chart') },
    { id: 'chart-bar', type: 'block' as const, label: 'Bar Chart', desc: 'Render vertical or horizontal bars', icon: <BarChart3 size={14} style={{ color: '#5e81ac' }} />, category: '⚡ Advanced', keywords: 'chart bar vertical horizontal stats', action: () => addBlockToPage('chart-bar') },
    { id: 'chart-line', type: 'block' as const, label: 'Line Chart', desc: 'Render line, area, or sparkline charts', icon: <Activity size={14} style={{ color: '#a3be8c' }} />, category: '⚡ Advanced', keywords: 'chart line area sparkline stats trend', action: () => addBlockToPage('chart-line') },
    { id: 'chart-pie', type: 'block' as const, label: 'Pie Chart', desc: 'Render pie, doughnut, or donut-half charts', icon: <PieChart size={14} style={{ color: '#ebcb8b' }} />, category: '⚡ Advanced', keywords: 'chart pie doughnut donut circular stats', action: () => addBlockToPage('chart-pie') },
    { id: 'chart-gauge', type: 'block' as const, label: 'Gauge & Progress', desc: 'Render radial dials and progress rings', icon: <Clock size={14} style={{ color: '#bf616a' }} />, category: '⚡ Advanced', keywords: 'chart gauge progress ring dial metric', action: () => addBlockToPage('chart-gauge') },
    { id: 'chart-radar', type: 'block' as const, label: 'Radar Chart', desc: 'Render multi-variable spiderweb charts', icon: <Compass size={14} style={{ color: '#88c0d0' }} />, category: '⚡ Advanced', keywords: 'chart radar polar spider web statistical', action: () => addBlockToPage('chart-radar') },
    { id: 'ai-block', type: 'block' as const, label: 'AI Helper Draft', desc: 'Generate texts using simulated AI', icon: <Sparkles size={14} style={{ color: 'var(--accent-color)' }} />, category: '⚡ Advanced', keywords: 'ai generating assistant writing', action: () => addBlockToPage('ai-block') },
    { id: 'equation', type: 'block' as const, label: 'Equation Math', desc: 'LaTeX mathematical formulas', icon: <Sigma size={14} />, category: '⚡ Advanced', keywords: 'equation math latex formula', action: () => addBlockToPage('equation') },
    { id: 'date', type: 'block' as const, label: 'Date Picker', desc: 'Embed static or picker date', icon: <Calendar size={14} />, category: '🔄 Dynamic', keywords: 'date calendar picker schedule', action: () => addBlockToPage('date') },
    { id: 'feedback', type: 'block' as const, label: 'Thumbs Rating', desc: 'Up/down micro feedback block', icon: <ThumbsUp size={14} />, category: '🔄 Dynamic', keywords: 'feedback rating thumbs like', action: () => addBlockToPage('feedback') },
    { id: 'form', type: 'block' as const, label: 'Form Questionnaire', desc: 'Form builder & submissions', icon: <FileSpreadsheet size={14} />, category: '🔄 Dynamic', keywords: 'form survey questionnaire', action: () => addBlockToPage('form') },
    { id: 'comment', type: 'block' as const, label: 'Comment Thread', desc: 'Discussion timeline', icon: <MessageSquare size={14} />, category: '🔄 Dynamic', keywords: 'comment discussion chat reply', action: () => addBlockToPage('comment') },
    { id: 'time', type: 'block' as const, label: 'Clock Time Badge', desc: 'Static time badge', icon: <Clock size={14} />, category: '🏷️ Badges', keywords: 'time badge clock hour minute', action: () => addBlockToPage('time') },
    { id: 'person', type: 'block' as const, label: 'Person Badge', desc: 'Mentions team member tag', icon: <User size={14} />, category: '🏷️ Badges', keywords: 'person mention badge team', action: () => addBlockToPage('person') },
    { id: 'page-link', type: 'block' as const, label: 'Page Reference Badge', desc: 'Shortcut link to page', icon: <ExternalLink size={14} />, category: '🏷️ Badges', keywords: 'page link badge reference', action: () => addBlockToPage('page-link') },
    { id: 'emoji', type: 'block' as const, label: 'Emoji Selection Badge', desc: 'Quick inline emoji tag', icon: <Smile size={14} />, category: '🏷️ Badges', keywords: 'emoji smile picker badge', action: () => addBlockToPage('emoji') },
    { id: 'template-journal', type: 'template' as const, label: 'Daily Journal', desc: 'Morning quotes, gratitude lists, daily focus', icon: <Book size={14} style={{ color: '#f59e0b' }} />, category: '📋 Templates', keywords: 'journal daily diary morning', action: () => { loadTemplate('journal'); } },
    { id: 'template-class', type: 'template' as const, label: 'Lecture Notes', desc: 'Class reminders, course syllabi, pseudocode', icon: <BookOpen size={14} style={{ color: '#3b82f6' }} />, category: '📋 Templates', keywords: 'lecture notes class study', action: () => { loadTemplate('class'); } },
    { id: 'template-blank', type: 'template' as const, label: 'Blank Notebook', desc: 'Pristine empty canvas to capture thoughts', icon: <FileText size={14} />, category: '📋 Templates', keywords: 'blank empty notebook canvas', action: () => { loadTemplate('blank'); } },
    { id: 'canvasflow-board', type: 'tool' as const, label: 'CanvasFlow Board', desc: 'Infinite collaborative whiteboard & innovation canvas', icon: <Layout size={14} style={{ color: '#6366f1' }} />, category: '🔧 Tools', keywords: 'canvasflow whiteboard infinite canvas board sticky', action: () => { setCanvasFlowOpen(true); } },
    { id: 'meetingmind', type: 'tool' as const, label: 'MeetingMind AI', desc: 'Silent meeting recorder with AI note enhancement & transcripts', icon: <Headphones size={14} style={{ color: '#6366f1' }} />, category: '🔧 Tools', keywords: 'meetingmind meeting recorder transcription notes ai speaker diarization', action: () => { setMeetingMindOpen(true); } },
    { id: 'uiforge', type: 'tool' as const, label: 'UIForge Design Studio', desc: 'AI UI/UX design tool — text-to-UI, Figma-like editor & code export', icon: <PenTool size={14} style={{ color: '#ec4899' }} />, category: '🔧 Tools', keywords: 'uiforge figma design ui ux prototype stitch ai generate', action: () => { setUIForgeOpen(true); } },
    { id: 'focus-shield', type: 'tool' as const, label: 'FocusShield', desc: 'Block distractions, focus sessions, streaks & digital wellbeing', icon: <Shield size={14} style={{ color: '#6366f1' }} />, category: '🔧 Tools', keywords: 'focus shield blocker wellbeing productivity deep work', action: () => { setFocusShieldOpen(true); } },
    { id: 'tool-case-converter', type: 'tool' as const, label: 'Case Converter', desc: 'Convert text casing (UPPER, lower, Title)', icon: <FileText size={14} />, category: '🔧 Tools', keywords: 'case converter uppercase lowercase', action: () => { setSettingsOpen(true); } },
    { id: 'tool-json', type: 'tool' as const, label: 'JSON Prettifier', desc: 'Validate, format, minify JSON', icon: <Terminal size={14} />, category: '🔧 Tools', keywords: 'json prettifier validator format', action: () => { setSettingsOpen(true); } },
    { id: 'tool-color', type: 'tool' as const, label: 'Color Generator', desc: 'Pick, preview HEX/RGB colors', icon: <Smile size={14} />, category: '🔧 Tools', keywords: 'color generator palette hex', action: () => { setSettingsOpen(true); } },
    { id: 'tool-sandbox', type: 'tool' as const, label: 'HTML Sandbox', desc: 'Live HTML preview sandbox', icon: <Globe size={14} />, category: '🔧 Tools', keywords: 'html sandbox preview code', action: () => { setSettingsOpen(true); } },
    { id: 'composio', type: 'tool' as const, label: 'Composio Connectors', desc: 'Connect 200+ tools: Gmail, Slack, GitHub, Excel, Notion & more', icon: <Layers size={14} style={{ color: 'var(--accent-color)' }} />, category: '🔧 Tools', keywords: 'composio connect tools api integrations', action: () => { setComposioConnectorsOpen(true); } },
  ], [workspacePages, activeWorkspaceId]);

  const filteredItems = items.filter(
    item => item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase()) ||
      item.keywords.toLowerCase().includes(search.toLowerCase())
  );

  const categoriesList: { category: string; list: HomeItem[] }[] = [];
  filteredItems.forEach(item => {
    let cat = categoriesList.find(c => c.category === item.category);
    if (!cat) { cat = { category: item.category, list: [] }; categoriesList.push(cat); }
    cat.list.push(item);
  });

  const categoryOrder = [
    '🔧 Tools', '📄 Pages', '✏️ Basic Blocks', '🗄️ Databases', '📋 Templates',
    '💻 Media & Code', '📐 Layouts', '🔗 Integrations', '⚡ Advanced', '🔄 Dynamic', '🏷️ Badges'
  ];
  const displayedCategories = (selectedCategory
    ? categoriesList.filter(c => c.category === selectedCategory)
    : categoriesList
  ).sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category);
    const bi = categoryOrder.indexOf(b.category);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <div className="main-content" style={{ overflowY: 'auto' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 className="heading-font" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Asno Launchpad
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Search pages, blocks, databases, tools, and templates to get started
          </p>
        </div>

        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedCategory(null); }}
            placeholder="Search pages, blocks, tools, templates..."
            style={{
              width: '100%', padding: '14px 14px 14px 44px',
              border: '2px solid var(--border-color)', borderRadius: '12px',
              background: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontSize: '16px', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => addPage(null)}
            style={quickBtnStyle}>
            <Plus size={14} /> New Page
          </button>
          <button onClick={() => addPage(null, true, 'table')}
            style={quickBtnStyle}>
            <Database size={14} /> New Database
          </button>
          <button onClick={() => loadTemplate('journal')}
            style={quickBtnStyle}>
            <Book size={14} /> Templates
          </button>
          <button onClick={() => setSettingsOpen(true)}
            style={quickBtnStyle}>
            <Wrench size={14} /> Tools
          </button>
          <button onClick={() => setImportOpen(true)}
            style={quickBtnStyle}>
            <Upload size={14} /> Import
          </button>
        </div>

        {categoriesList.length > 1 && !search && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {categoriesList.map(c => (
              <button key={c.category} onClick={() => setSelectedCategory(selectedCategory === c.category ? null : c.category)}
                style={{
                  fontSize: '11px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
                  border: selectedCategory === c.category ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  background: selectedCategory === c.category ? 'var(--accent-light)' : 'var(--bg-primary)',
                  color: selectedCategory === c.category ? 'var(--accent-color)' : 'var(--text-muted)',
                  fontWeight: 600, transition: 'all 0.15s ease'
                }}>
                {c.category}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {displayedCategories.map(catGroup => (
            <div key={catGroup.category}>
              <div style={{
                fontSize: '11px', fontWeight: 800, color: 'var(--text-placeholder)',
                padding: '12px 4px 6px', textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border-color)', marginBottom: '4px'
              }}>
                {catGroup.category}
              </div>
              {catGroup.list.map(item => (
                <div key={item.id} onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                    transition: 'background-color 0.1s ease'
                  }}
                  className="hover-bg"
                >
                  <div style={{
                    width: '28px', height: '28px', backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '6px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {flatListLength(filteredItems) === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-placeholder)', fontStyle: 'italic' }}>
              No results for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const flatListLength = (items: HomeItem[]) => items.length;

const quickBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
  border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
  color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
  transition: 'all 0.15s ease'
};

export default HomePage;
