export interface Block {
  id: string;
  type: 
    | 'text' 
    | 'h1' 
    | 'h2' 
    | 'h3' 
    | 'h4'
    | 'todo' 
    | 'bullet' 
    | 'number' 
    | 'toggle' 
    | 'toggle-h1'
    | 'toggle-h2'
    | 'toggle-h3'
    | 'toggle-h4'
    | 'quote'
    | 'callout'
    | 'divider'
    | 'page'
    | 'column-list'
    | 'column'
    | 'synced-block'
    | 'code' 
    | 'image' 
    | 'video'
    | 'audio'
    | 'file'
    | 'pdf'
    | 'embed'
    | 'bookmark'
    | 'link-preview'
    | 'table' 
    | 'database'
    | 'equation'
    | 'link-to-page'
    | 'template-button'
    | 'breadcrumb'
    | 'toc'
    | 'shape'
    | 'button'
    | 'date'
    | 'uptime'
    | 'mention'
    | 'meta'
    | 'feedback'
    | 'form'
    | 'comment'
    | 'youtube'
    | 'google-drive'
    | 'figma'
    | 'github'
    | 'slack'
    | 'trello'
    | 'airtable'
    | 'loom'
    | 'google-maps'
    | 'dropbox'
    | 'onedrive'
    | 'notion'
    | 'chart'
    | 'chart-bar'
    | 'chart-line'
    | 'chart-pie'
    | 'chart-gauge'
    | 'chart-radar'
    | 'ai-block'
    | 'current-date'
    | 'anchor'
    | 'navigation'
    | 'table-row'
    | 'time'
    | 'person'
    | 'page-link'
    | 'emoji'
    | 'checkbox'
    | 'volume'
    // New embed types (60+)
    | 'twitter'
    | 'spotify'
    | 'soundcloud'
    | 'codepen'
    | 'codesandbox'
    | 'replit'
    | 'excalidraw'
    | 'miro'
    | 'canva'
    | 'typeform'
    | 'calendly'
    | 'google-sheets'
    | 'google-slides'
    | 'google-forms'
    | 'google-calendar'
    | 'whimsical'
    | 'lucidchart'
    | 'pitch'
    | 'prezi'
    | 'vimeo'
    | 'dailymotion'
    | 'twitch'
    | 'tiktok'
    | 'instagram'
    | 'pinterest'
    | 'linkedin'
    | 'reddit'
    | 'medium'
    | 'substack'
    | 'gist'
    | 'jsfiddle'
    | 'stackblitz'
    | 'observable'
    | 'desmos'
    | 'wolfram'
    | 'kaggle'
    | 'streamlit'
    | 'tableau'
    | 'power-bi'
    | 'mixpanel'
    | 'amplitude'
    | 'hotjar'
    | 'intercom'
    | 'zendesk'
    | 'hubspot'
    | 'asana'
    | 'monday'
    | 'clickup'
    | 'linear'
    | 'jira'
    | 'confluence'
    | 'basecamp'
    | 'todoist'
    | 'abstract'
    | 'invision'
    | 'sketch'
    | 'zeplin'
    | 'marvel'
    | 'framer'
    | 'webflow'
    | 'bubble'
    | 'retool'
    | 'notion-embed'
    | 'coda'
    | 'mermaid'
    | 'import'
    | 'notes';
  content: string;
  properties?: {
    checked?: boolean;
    language?: string;
    src?: string;
    caption?: string;
    open?: boolean;
    calloutIcon?: string;
    calloutColor?: string;
    databaseId?: string;
    tableData?: string[][]; // plain table: string[rows][cols]
    
    // Advanced/New Block properties
    pageId?: string;
    syncedBlockId?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    equationText?: string;
    templateBlocks?: Block[];
    shapeData?: string; // Drawing canvas base64 image data url
    buttonText?: string;
    buttonAction?: 'alert' | 'toast' | 'add-text' | 'count';
    buttonCount?: number;
    dateValue?: string;
    feedbackCount?: { up: number; down: number; selected?: 'up' | 'down' };
    formFields?: { id: string; label: string; type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'date' | 'url' }[];
    formSubmissions?: Record<string, string>[];
    comments?: { id: string; author: string; text: string; timestamp: number }[];
    
    // Chart Properties (expanded for 50+ types)
    chartType?: ChartType;
    chartData?: { label: string; value: number; color?: string }[];
    chartTitle?: string;
    chartColors?: string[];
    chartShowLegend?: boolean;
    chartShowGrid?: boolean;
    chartShowAnimation?: boolean;
    chartSecondaryData?: { label: string; value: number; color?: string }[];
    
    // AI Generation Properties
    aiPrompt?: string;
    aiGenerating?: boolean;
    
    // Custom Embed details
    slackAuthor?: string;
    slackAvatar?: string;
    slackTimestamp?: string;
    slackChannel?: string;
    trelloBoardName?: string;
    trelloLists?: { title: string; cards: string[] }[];
    githubStars?: number;
    githubForks?: number;
    githubOpenIssues?: number;
    githubDesc?: string;
    
    // Anchor & Navigation
    anchorName?: string;
    navLinks?: { title: string; url: string; isExternal: boolean; pageId?: string }[];
    
    // Inline badges
    personName?: string;
    personAvatar?: string;
    timeValue?: string;
    emojiValue?: string;
    volumeLevel?: number;

    // Text/Background colors
    textColor?: string;
    bgColor?: string;

    // Google Maps enhanced
    mapZoom?: number;
    mapType?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
    mapPins?: { address: string; label?: string }[];

    // Mermaid
    mermaidCode?: string;

    // Embed app name (for generic embeds)
    embedAppName?: string;
  };
  children?: Block[];
}

export type ChartType = 
  | 'bar' | 'horizontal-bar' | 'stacked-bar' | 'grouped-bar'
  | 'line' | 'area' | 'stepped-line' | 'multi-line'
  | 'pie' | 'doughnut' | 'polar-area'
  | 'radar' | 'scatter' | 'bubble'
  | 'mixed-bar-line'
  | 'number-card'
  | 'gauge'
  | 'funnel'
  | 'waterfall'
  | 'treemap'
  | 'progress-bar'
  | 'progress-ring'
  | 'sparkline'
  | 'histogram'
  | 'comparison-bar'
  | 'radial-bar'
  | 'stacked-area'
  | 'multi-axis'
  | 'floating-bar'
  | 'lollipop'
  | 'pyramid'
  | 'nightingale'
  | 'slope'
  | 'bullet'
  | 'icon-grid'
  | 'dot-plot'
  | 'box-plot'
  | 'violin'
  | 'heatmap-grid'
  | 'waffle'
  | 'pictograph'
  | 'donut-half'
  | 'stacked-100'
  | 'diverging-bar'
  | 'bump'
  | 'stream'
  | 'sankey'
  | 'chord'
  | 'sunburst'
  | 'icicle'
  | 'parallel'
  | 'calendar-heat'
  | 'timeline-chart';

export interface DatabasePropertyOption {
  id: string;
  name: string;
  color: string;
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'checkbox' | 'url' | 'email' | 'status' | 'phone';
  options?: DatabasePropertyOption[];
}

export interface DatabaseSchema {
  properties: DatabaseProperty[];
}

export interface DatabaseView {
  id: string;
  name: string;
  type: 'table' | 'board' | 'calendar' | 'gallery' | 'list' | 'feed' | 'timeline' | 'dashboard' | 'map' | 'form';
  visibleProperties?: string[];
  filterPropertyId?: string;
  filterValue?: string;
  sortPropertyId?: string;
  sortDirection?: 'asc' | 'desc';
  groupByPropertyId?: string; // For Kanban board grouping (must be of type 'select')
}

export interface DatabaseRow {
  id: string;
  cells: Record<string, any>; // cell values indexed by propertyId
  content: Block[]; // A row has its own block contents (like a full page!)
}

export interface Page {
  id: string;
  title: string;
  icon?: string; // Emoji character
  cover?: string; // CSS color gradient or URL
  parentId: string | null;
  isFavorite: boolean;
  isTrash: boolean;
  content: Block[];
  isDatabase?: boolean;
  dbSchema?: DatabaseSchema;
  dbViews?: DatabaseView[];
  dbRows?: DatabaseRow[];
  workspaceId?: string;
  createdTime?: string;
  tags?: string[];
  comments?: { id: string; author: string; text: string; timestamp: number }[];
  customProperties?: Record<string, string>;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
}

export type ThemeType = 'nord-light' | 'obsidian-dark' | 'cyberpunk' | 'emerald-mint' | 'sunset-rose';
export type FontType = 'inter' | 'outfit' | 'serif' | 'mono';

export interface AppSettings {
  theme: ThemeType;
  font: FontType;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  reasoning?: string;
  toolCallsExecuted?: number;
}

// Automation System Types
export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'block-change' | 'row-add' | 'form-submit' | 'page-create' | 'schedule';
    sourcePageId?: string;
    sourceBlockId?: string;
    sourceBlockType?: Block['type'];
  };
  action: {
    type: 'sync-to-chart' | 'add-db-row' | 'add-block' | 'update-block' | 'notify';
    targetPageId?: string;
    targetBlockId?: string;
    targetBlockType?: Block['type'];
    config?: Record<string, any>;
  };
}
