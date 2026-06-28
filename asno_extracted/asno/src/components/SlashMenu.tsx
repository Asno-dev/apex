import React, { useState, useEffect, useRef } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  CheckSquare, 
  List, 
  ListOrdered, 
  ChevronRight, 
  Quote, 
  Terminal, 
  Image as ImageIcon,
  Database,
  Table,
  Minus,
  FileText,
  Columns,
  RefreshCw,
  Video,
  Music,
  Paperclip,
  BookOpen,
  Globe,
  Bookmark,
  Sparkles,
  Sigma,
  ExternalLink,
  Layers,
  MapPin,
  ListCollapse,
  PenTool,
  PlaySquare,
  Calendar,
  Activity,
  User,
  BarChart3,
  ThumbsUp,
  MessageSquare,
  FileSpreadsheet,
  Map,
  PieChart,
  Clock,
  Anchor,
  Compass,
  Volume2,
  Smile,
  Upload
} from 'lucide-react';

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#ff0000" style={{ display: 'block' }}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zM6.304 15.165a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.824 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.824 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zM8.824 6.304a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.782a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.042zM18.958 8.824a2.528 2.528 0 0 1 2.522-2.52A2.528 2.528 0 0 1 24 8.824a2.528 2.528 0 0 1-2.52 2.52h-2.522V8.824zM17.696 8.824a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.782a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.042zM15.165 18.958a2.528 2.528 0 0 1 2.52 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.52v-2.522h2.52zM15.165 17.696a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.52-2.522h5.042a2.528 2.528 0 0 1 2.522 2.522v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.042z"/>
  </svg>
);

const TrelloIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#0079bf" style={{ display: 'block' }}>
    <path d="M19.389 0H4.611C2.063 0 0 2.063 0 4.611v14.778C0 21.937 2.063 24 4.611 24h14.778C21.937 24 24 21.937 24 19.389V4.611C24 2.063 21.937 0 19.389 0zM10.15 15.42c0 1.09-.89 1.98-1.98 1.98H5.78a1.98 1.98 0 0 1-1.98-1.98V5.78c0-1.09.89-1.98 1.98-1.98h2.39c1.09 0 1.98.89 1.98 1.98v9.64zm10.07-5.78c0 1.09-.89 1.98-1.98 1.98h-2.39a1.98 1.98 0 0 1-1.98-1.98V5.78c0-1.09.89-1.98 1.98-1.98h2.39c1.09 0 1.98.89 1.98 1.98v3.86z"/>
  </svg>
);

interface SlashMenuProps {
  onSelect: (type: any) => void;
  onClose: () => void;
}

interface SlashItem {
  type: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  category: string;
  keywords: string;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: SlashItem[] = [
    // 1. Basic & Text
    { type: 'text', label: 'Text', desc: 'Plain writing block', icon: <Type size={16} />, category: 'Basic Blocks', keywords: 'text paragraph plain normal' },
    { type: 'h1', label: 'Heading 1', desc: 'Large section header', icon: <Heading1 size={16} />, category: 'Basic Blocks', keywords: 'heading h1 large title headings' },
    { type: 'h2', label: 'Heading 2', desc: 'Medium section header', icon: <Heading2 size={16} />, category: 'Basic Blocks', keywords: 'heading h2 medium section headings' },
    { type: 'h3', label: 'Heading 3', desc: 'Small section header', icon: <Heading3 size={16} />, category: 'Basic Blocks', keywords: 'heading h3 small sub headings' },
    { type: 'h4', label: 'Heading 4', desc: 'Extra-small section header', icon: <Heading3 size={16} style={{ opacity: 0.7 }} />, category: 'Basic Blocks', keywords: 'heading h4 smallest headings' },
    { type: 'todo', label: 'To-do list', desc: 'Checkbox for tasks', icon: <CheckSquare size={16} />, category: 'Basic Blocks', keywords: 'todo check checkbox list task todoist' },
    { type: 'bullet', label: 'Bulleted list', desc: 'Simple bulleted list', icon: <List size={16} />, category: 'Basic Blocks', keywords: 'bullet bulleted list unordered' },
    { type: 'number', label: 'Numbered list', desc: 'Sequential list', icon: <ListOrdered size={16} />, category: 'Basic Blocks', keywords: 'number numbered list ordered sequential' },
    { type: 'toggle', label: 'Toggle list', desc: 'Toggles nested blocks', icon: <ChevronRight size={16} />, category: 'Basic Blocks', keywords: 'toggle list details accordion collapse' },
    { type: 'toggle-h1', label: 'Toggle Heading 1', desc: 'Large header with toggle', icon: <Heading1 size={16} style={{ color: 'var(--accent-color)' }} />, category: 'Basic Blocks', keywords: 'toggle h1 accordion large heading' },
    { type: 'toggle-h2', label: 'Toggle Heading 2', desc: 'Medium header with toggle', icon: <Heading2 size={16} style={{ color: 'var(--accent-color)' }} />, category: 'Basic Blocks', keywords: 'toggle h2 accordion medium heading' },
    { type: 'toggle-h3', label: 'Toggle Heading 3', desc: 'Small header with toggle', icon: <Heading3 size={16} style={{ color: 'var(--accent-color)' }} />, category: 'Basic Blocks', keywords: 'toggle h3 accordion small heading' },
    { type: 'toggle-h4', label: 'Toggle Heading 4', desc: 'Smallest header with toggle', icon: <Heading3 size={16} style={{ color: 'var(--accent-color)', opacity: 0.7 }} />, category: 'Basic Blocks', keywords: 'toggle h4 accordion smallest heading' },
    { type: 'quote', label: 'Quote', desc: 'Capture a quote', icon: <Quote size={16} />, category: 'Basic Blocks', keywords: 'quote blockquote citation block' },
    { type: 'callout', label: 'Callout', desc: 'Make writing stand out', icon: <Type size={16} style={{ color: 'var(--accent-color)' }} />, category: 'Basic Blocks', keywords: 'callout info alert highlights key note' },
    { type: 'volume', label: 'Volume Callout', desc: 'Callout box with slider', icon: <Volume2 size={16} style={{ color: 'var(--accent-color)' }} />, category: 'Basic Blocks', keywords: 'volume callout slider speaker audio sound' },
    { type: 'divider', label: 'Divider', desc: 'Horizontal separator line', icon: <Minus size={16} />, category: 'Basic Blocks', keywords: 'divider line separator hr minus dash' },
    { type: 'page', label: 'Child Page', desc: 'Embed a sub-page block', icon: <FileText size={16} />, category: 'Basic Blocks', keywords: 'page child document subpage folder nested' },
    { type: 'table-row', label: 'Table Row', desc: 'Add standalone row', icon: <Table size={16} style={{ opacity: 0.7 }} />, category: 'Basic Blocks', keywords: 'table row cell grids' },

    // 2. Layouts
    { type: 'column-list', label: '2 Columns Layout', desc: 'Multi-column container', icon: <Columns size={16} />, category: 'Layouts & Structures', keywords: 'column columns grid layout list side side-by-side' },
    { type: 'synced-block', label: 'Synced Block', desc: 'Sync blocks across pages', icon: <RefreshCw size={16} />, category: 'Layouts & Structures', keywords: 'sync synced block clone mirrors copies link' },

    // 3. Databases
    { type: 'database-table', label: 'Table View', desc: 'Create a database Table layout', icon: <Table size={16} />, category: 'Database Views', keywords: 'database table grid cells fields metadata' },
    { type: 'database-board', label: 'Kanban Board', desc: 'Create a database Board status layout', icon: <Columns size={16} />, category: 'Database Views', keywords: 'database board kanban status group cards workflow' },
    { type: 'database-calendar', label: 'Calendar View', desc: 'Create a database Calendar month view', icon: <Calendar size={16} />, category: 'Database Views', keywords: 'database calendar date scheduling monthly deadline planner' },
    { type: 'database-timeline', label: 'Timeline View', desc: 'Create a database Gantt timeline', icon: <Calendar size={16} style={{ opacity: 0.8 }} />, category: 'Database Views', keywords: 'database timeline gantt schedule date range project' },
    { type: 'database-dashboard', label: 'Dashboard Stats', desc: 'Create a database Dashboard overview', icon: <BarChart3 size={16} />, category: 'Database Views', keywords: 'database dashboard chart graphs kpi stats summary report' },
    { type: 'database-map', label: 'Map Portal', desc: 'Create a database Map pins location log', icon: <Map size={16} />, category: 'Database Views', keywords: 'database map address coordinates pin navigation place' },
    { type: 'database-gallery', label: 'Gallery Grid', desc: 'Create a database Gallery cover card grid', icon: <ImageIcon size={16} />, category: 'Database Views', keywords: 'database gallery cover cards photos grid visual portfolio' },
    { type: 'database-list', label: 'List View', desc: 'Create a database row List layout', icon: <List size={16} />, category: 'Database Views', keywords: 'database list row outline details simple lines description' },
    { type: 'database-feed', label: 'Timeline Feed', desc: 'Create a database journal Feed log', icon: <Activity size={16} />, category: 'Database Views', keywords: 'database feed journal timeline updates log diary' },

    // 4. Media & General Embeds
    { type: 'code', label: 'Code block', desc: 'Syntax highlighted code', icon: <Terminal size={16} />, category: 'Media & Code', keywords: 'code coding block programming syntax terminal js html css script' },
    { type: 'mermaid', label: 'Mermaid Diagram', desc: 'Flowchart, sequence, gantt diagrams', icon: <Activity size={16} style={{ color: '#ff3670' }} />, category: 'Media & Code', keywords: 'mermaid flowchart sequence diagram gantt graph visual charts' },
    { type: 'image', label: 'Image', desc: 'Insert cover image or photo', icon: <ImageIcon size={16} />, category: 'Media & Code', keywords: 'image picture cover photo graphic upload' },
    { type: 'video', label: 'Video Player', desc: 'Upload or embed MP4 videos', icon: <Video size={16} />, category: 'Media & Code', keywords: 'video player mp4 clip show stream' },
    { type: 'audio', label: 'Audio player', desc: 'Upload or embed sound clips', icon: <Music size={16} />, category: 'Media & Code', keywords: 'audio music sound song player pod' },
    { type: 'file', label: 'File Attachment', desc: 'Upload files and download cards', icon: <Paperclip size={16} />, category: 'Media & Code', keywords: 'file pdf attachment download zip upload' },
    { type: 'pdf', label: 'PDF Viewer', desc: 'Embed scrollable PDF document', icon: <BookOpen size={16} />, category: 'Media & Code', keywords: 'pdf book view viewer documentation embed' },
    { type: 'embed', label: 'Web Embed', desc: 'Generic iframe web preview', icon: <Globe size={16} />, category: 'Media & Code', keywords: 'embed iframe web page website url link widget' },
    { type: 'bookmark', label: 'Web Bookmark', desc: 'URL bookmark preview card', icon: <Bookmark size={16} />, category: 'Media & Code', keywords: 'bookmark url web link preview' },
    { type: 'link-preview', label: 'Link Preview', desc: 'Live card link preview', icon: <Sparkles size={16} />, category: 'Media & Code', keywords: 'link preview card card-preview' },
    { type: 'table', label: 'Simple Table', desc: 'Simple plain data matrix', icon: <Table size={16} />, category: 'Media & Code', keywords: 'table simple grid layout' },
    
    // 5. App Embeds
    { type: 'youtube', label: 'YouTube Video', desc: 'Embed YouTube player', icon: <YoutubeIcon />, category: 'Integrations & Embeds', keywords: 'youtube google video player stream watch play' },
    { type: 'google-drive', label: 'Google Drive', desc: 'Link documents & spreadsheets', icon: <FileSpreadsheet size={16} style={{ color: '#34a853' }} />, category: 'Integrations & Embeds', keywords: 'google drive sheet docs slides file' },
    { type: 'figma', label: 'Figma Frame', desc: 'Embed figma design board', icon: <PenTool size={16} style={{ color: '#a259ff' }} />, category: 'Integrations & Embeds', keywords: 'figma UI design frame prototypes boards mockup' },
    { type: 'github', label: 'GitHub Repo', desc: 'Sleek repository details card', icon: <GithubIcon />, category: 'Integrations & Embeds', keywords: 'github repo git repositories commits code development' },
    { type: 'slack', label: 'Slack Message', desc: 'Slack message card', icon: <SlackIcon />, category: 'Integrations & Embeds', keywords: 'slack chat messaging communications team channel post' },
    { type: 'trello', label: 'Trello Board', desc: 'Visual card task list widget', icon: <TrelloIcon />, category: 'Integrations & Embeds', keywords: 'trello kanban board task projects card lists' },
    { type: 'airtable', label: 'Airtable Base', desc: 'Airtable spreadsheet view', icon: <Database size={16} style={{ color: '#f82b60' }} />, category: 'Integrations & Embeds', keywords: 'airtable database grid sheets spread' },
    { type: 'loom', label: 'Loom Video', desc: 'Play loom video embeds', icon: <Video size={16} style={{ color: '#625df5' }} />, category: 'Integrations & Embeds', keywords: 'loom video screen recording walkthrough tutorial' },
    { type: 'google-maps', label: 'Google Map', desc: 'Embed map with pins & zoom', icon: <Map size={16} style={{ color: '#1a73e8' }} />, category: 'Integrations & Embeds', keywords: 'google map maps pin address city location roadmap navigation' },
    { type: 'dropbox', label: 'Dropbox file', desc: 'Dropbox attachment card link', icon: <Paperclip size={16} style={{ color: '#0061fe' }} />, category: 'Integrations & Embeds', keywords: 'dropbox file folder upload cloud link' },
    { type: 'onedrive', label: 'OneDrive file', desc: 'OneDrive document card', icon: <Paperclip size={16} style={{ color: '#0078d4' }} />, category: 'Integrations & Embeds', keywords: 'onedrive microsoft files cloud link word Excel' },
    { type: 'notion', label: 'Notion Embed', desc: 'Link other pages recursively', icon: <FileText size={16} />, category: 'Integrations & Embeds', keywords: 'notion embed pages linking blocks clone document' },
    { type: 'spotify', label: 'Spotify', desc: 'Embed track, album, or playlist', icon: <Music size={16} style={{ color: '#1DB954' }} />, category: 'Integrations & Embeds', keywords: 'spotify music podcast stream audio player play lists' },
    { type: 'codepen', label: 'CodePen', desc: 'Embed live code pen', icon: <Terminal size={16} style={{ color: '#000' }} />, category: 'Integrations & Embeds', keywords: 'codepen HTML JS CSS edit development sand box' },

    // 6. Advanced Special & Dynamics
    { type: 'equation', label: 'Equation Math', desc: 'LaTeX mathematical formulas', icon: <Sigma size={16} />, category: 'Special Blocks', keywords: 'equation math latex sigma calculation formula science' },
    { type: 'link-to-page', label: 'Link to page', desc: 'Navigational button link', icon: <ExternalLink size={16} />, category: 'Special Blocks', keywords: 'link page navigation button external badge shortcut' },
    { type: 'template-button', label: 'Template Button', desc: 'One-click blocks replicator', icon: <Layers size={16} />, category: 'Special Blocks', keywords: 'template button replicate add block generator configurations' },
    { type: 'breadcrumb', label: 'Breadcrumbs', desc: 'Path trail navigation links', icon: <MapPin size={16} />, category: 'Special Blocks', keywords: 'breadcrumb trace path route location header' },
    { type: 'toc', label: 'Table of Contents', desc: 'Auto document heading outline', icon: <ListCollapse size={16} />, category: 'Special Blocks', keywords: 'toc contents table outline headings lists document index' },
    { type: 'shape', label: 'Sketch Board', desc: 'Sketch drawing pad canvas', icon: <PenTool size={16} />, category: 'Special Blocks', keywords: 'shape sketch drawing board draw canvas signature paint whiteboard' },
    { type: 'button', label: 'Action Button', desc: 'Interactive button trigger', icon: <PlaySquare size={16} />, category: 'Special Blocks', keywords: 'button action toast alert trigger count clicker' },
    { type: 'chart', label: 'Advanced Chart Builder', desc: '50+ chart types: bar, line, pie, gauge, etc.', icon: <PieChart size={16} style={{ color: 'var(--accent-color)' }} />, category: 'Special Blocks', keywords: 'chart charts advanced bar line pie gauge data visualize analytics donut' },
    { type: 'chart-bar', label: 'Bar Chart', desc: 'Render vertical or horizontal bars', icon: <BarChart3 size={16} style={{ color: '#5e81ac' }} />, category: 'Special Blocks', keywords: 'chart bar vertical horizontal stats' },
    { type: 'chart-line', label: 'Line Chart', desc: 'Render line, area, or sparkline charts', icon: <Activity size={16} style={{ color: '#a3be8c' }} />, category: 'Special Blocks', keywords: 'chart line area sparkline stats trend' },
    { type: 'chart-pie', label: 'Pie Chart', desc: 'Render pie, doughnut, or donut-half charts', icon: <PieChart size={16} style={{ color: '#ebcb8b' }} />, category: 'Special Blocks', keywords: 'chart pie doughnut donut circular stats' },
    { type: 'chart-gauge', label: 'Gauge & Progress', desc: 'Render radial dials and progress rings', icon: <Clock size={16} style={{ color: '#bf616a' }} />, category: 'Special Blocks', keywords: 'chart gauge progress ring dial metric' },
    { type: 'chart-radar', label: 'Radar Chart', desc: 'Render multi-variable spiderweb charts', icon: <Compass size={16} style={{ color: '#88c0d0' }} />, category: 'Special Blocks', keywords: 'chart radar polar spider web statistical' },
    { type: 'ai-block', label: 'AI Helper Draft', desc: 'Generate texts using simulated AI', icon: <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />, category: 'Special Blocks', keywords: 'ai generating assistant drafts writing content help smart' },
    { type: 'notes', label: 'Notes Card', desc: 'Premium notes card with Speech Transcription', icon: <FileText size={16} style={{ color: '#ec4899' }} />, category: 'Special Blocks', keywords: 'notes card transcription voice memo speak memo board' },
    { type: 'import', label: 'Import File Block', desc: 'Inline CSV, MD, JSON, HTML parser', icon: <Upload size={16} style={{ color: '#5e81ac' }} />, category: 'Special Blocks', keywords: 'import file csv markdown json HTML parse text upload' },
    { type: 'anchor', label: 'Anchor Link Target', desc: 'Deep-link jump bookmark marker', icon: <Anchor size={16} />, category: 'Special Blocks', keywords: 'anchor bookmark deep link jump scroll target' },
    { type: 'navigation', label: 'Navigation Menu', desc: 'Sleek navbar menu header', icon: <Compass size={16} />, category: 'Special Blocks', keywords: 'navigation menu navbar header links list compass' },

    // 7. Dynamic & Badges
    { type: 'date', label: 'Date picker', desc: 'Embed static or picker date', icon: <Calendar size={16} />, category: 'Dynamic Blocks', keywords: 'date calendar picker schedule deadline select' },
    { type: 'uptime', label: 'Uptime tracker', desc: 'Count document open time session', icon: <Activity size={16} />, category: 'Dynamic Blocks', keywords: 'uptime tracker count clock stopwatch session timer' },
    { type: 'mention', label: 'Mention User/Date', desc: 'Sleek user inline badge', icon: <User size={16} />, category: 'Dynamic Blocks', keywords: 'mention user badge contact calendar' },
    { type: 'meta', label: 'Word Counter / Metadata', desc: 'Reading speed stats', icon: <BarChart3 size={16} />, category: 'Dynamic Blocks', keywords: 'meta counter word speed characters statistics metadata' },
    { type: 'feedback', label: 'Thumbs Rating', desc: 'Up/down micro feedback block', icon: <ThumbsUp size={16} />, category: 'Dynamic Blocks', keywords: 'feedback rating thumbs up down like dislike comments' },
    { type: 'form', label: 'Form Questionnaire', desc: 'Form builder & submissions dashboard', icon: <FileSpreadsheet size={16} />, category: 'Dynamic Blocks', keywords: 'form survey questionnaire submission fields response spreadsheet' },
    { type: 'comment', label: 'Comment Thread', desc: 'Sleek discussion timeline', icon: <MessageSquare size={16} />, category: 'Dynamic Blocks', keywords: 'comment discussion threads chat timeline reply review feedback' },

    // 8. Inline Badges
    { type: 'time', label: 'Clock Time badge', desc: 'Static time badge', icon: <Clock size={16} />, category: 'Inline Badges', keywords: 'time badge clock inline select static hour minute' },
    { type: 'person', label: 'Person mention badge', desc: 'Mentions team member tag', icon: <User size={16} />, category: 'Inline Badges', keywords: 'person mention badge employee team contact user avatar' },
    { type: 'page-link', label: 'Page reference badge', desc: 'Shortcut link to page', icon: <ExternalLink size={16} />, category: 'Inline Badges', keywords: 'page link badge reference cross shortcut' },
    { type: 'emoji', label: 'Emoji selection badge', desc: 'Quick inline emoji tag', icon: <Smile size={16} />, category: 'Inline Badges', keywords: 'emoji smile picker badge inline tags' },
    { type: 'checkbox', label: 'Inline checkbox status', desc: 'Interactive check tag', icon: <CheckSquare size={16} />, category: 'Inline Badges', keywords: 'checkbox status checked tags select inline check' }
  ];

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase()) ||
      item.keywords.toLowerCase().includes(search.toLowerCase())
  );

  // Group items by category to display dividers and category subheaders
  const categoriesList: { category: string; list: SlashItem[] }[] = [];
  filteredItems.forEach(item => {
    let cat = categoriesList.find(c => c.category === item.category);
    if (!cat) {
      cat = { category: item.category, list: [] };
      categoriesList.push(cat);
    }
    cat.list.push(item);
  });

  // Flat array representing order of rendering, for keyboard index alignment
  const flatFilteredList = categoriesList.flatMap(c => c.list);

  useEffect(() => {
    // Focus search input on open
    setTimeout(() => inputRef.current?.focus(), 50);

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatFilteredList.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatFilteredList.length) % flatFilteredList.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatFilteredList[selectedIndex]) {
          onSelect(flatFilteredList[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [flatFilteredList, selectedIndex, onClose, onSelect]);

  useEffect(() => {
    const activeEl = menuRef.current?.querySelector('.slash-menu-item.selected');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Track absolute index inside categorised maps
  let absoluteIdx = -1;

  return (
    <div 
      ref={menuRef}
      className="slash-menu-panel glass"
    >
      <div className="slash-menu-search-header-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
          className="slash-menu-search-input"
          placeholder="Type to filter blocks (e.g. headings, maps)..."
        />
      </div>
      
      <div className="slash-menu-items-list">
        {categoriesList.map((catGroup, gIdx) => (
          <div key={`cat-${catGroup.category}-${gIdx}`} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="slash-menu-category-subheader">
              {catGroup.category}
            </div>
            
            {catGroup.list.map((item) => {
              absoluteIdx++;
              const isSelected = absoluteIdx === selectedIndex;
              const currentIdx = absoluteIdx;
              
              return (
                <div 
                  key={item.type}
                  className={`slash-menu-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelect(item.type)}
                  onMouseEnter={() => setSelectedIndex(currentIdx)}
                >
                  <div className="slash-menu-item-icon">{item.icon}</div>
                  <div className="slash-menu-item-meta">
                    <span className="slash-menu-item-label">{item.label}</span>
                    <span className="slash-menu-item-desc">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {flatFilteredList.length === 0 && (
          <div className="slash-menu-empty">No commands match "{search}"</div>
        )}
      </div>

      <style>{`
        .slash-menu-panel {
          position: absolute;
          top: 100%;
          left: 24px;
          width: 320px;
          max-height: 360px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
        }
        .slash-menu-search-header-input-wrapper {
          padding: 8px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-primary);
        }
        .slash-menu-search-input {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
        }
        .slash-menu-search-input:focus {
          border-color: var(--accent-color);
        }
        .slash-menu-category-subheader {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-placeholder);
          padding: 10px 10px 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .slash-menu-items-list {
          overflow-y: auto;
          padding: 4px;
        }
        .slash-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: background-color 0.1s ease;
        }
        .slash-menu-item:hover, .slash-menu-item.selected {
          background-color: var(--bg-tertiary);
        }
        .slash-menu-item.selected {
          border-left: 2px solid var(--accent-color);
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        .slash-menu-item-icon {
          width: 30px;
          height: 30px;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .slash-menu-item.selected .slash-menu-item-icon {
          color: var(--accent-color);
          background-color: var(--bg-primary);
        }
        .slash-menu-item-meta {
          display: flex;
          flex-direction: column;
        }
        .slash-menu-item-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .slash-menu-item-desc {
          font-size: 11px;
          color: var(--text-muted);
        }
        .slash-menu-empty {
          padding: 24px 12px;
          text-align: center;
          font-size: 13px;
          color: var(--text-placeholder);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
