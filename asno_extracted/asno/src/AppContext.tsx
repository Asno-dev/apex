import React, { createContext, useContext, useState, useEffect } from 'react';
import { Page, Block, DatabaseProperty, DatabaseRow, DatabaseView, AppSettings, AIChatMessage, ThemeType, FontType, Automation, Workspace } from './types';
import { getPagesFromDB, savePagesToDB, getSettingsFromDB, saveSettingsToDB, getAutomationsFromDB, saveAutomationsToDB } from './db';

interface AppContextProps {
  pages: Page[];
  activePageId: string | null;
  setActivePageId: (id: string | null) => void;
  addPage: (parentId: string | null, isDatabase?: boolean, initialViewType?: DatabaseView['type'], preventActive?: boolean) => string;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  restorePage: (pageId: string) => void;
  permanentlyDeletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  
  // Workspace actions
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspace: (name: string, icon: string) => string;
  deleteWorkspace: (id: string) => void;
  
  // Block actions
  addBlock: (pageId: string, type?: Block['type'], parentBlockId?: string, index?: number) => string;
  updateBlock: (pageId: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  setBlocks: (pageId: string, blocks: Block[]) => void;
  
  // Database actions
  addDatabaseProperty: (pageId: string, name: string, type: DatabaseProperty['type']) => void;
  updateDatabaseProperty: (pageId: string, propertyId: string, updates: Partial<DatabaseProperty>) => void;
  deleteDatabaseProperty: (pageId: string, propertyId: string) => void;
  addDatabaseRow: (pageId: string, rowData?: Record<string, any>) => string;
  updateDatabaseRowCell: (pageId: string, rowId: string, propertyId: string, value: any) => void;
  deleteDatabaseRow: (pageId: string, rowId: string) => void;
  updateDatabaseRowContent: (pageId: string, rowId: string, blocks: Block[]) => void;
  addDatabaseView: (pageId: string, name: string, type: DatabaseView['type']) => void;
  updateDatabaseView: (pageId: string, viewId: string, updates: Partial<DatabaseView>) => void;
  deleteDatabaseView: (pageId: string, viewId: string) => void;

  // General state
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  composioConnectorsOpen: boolean;
  setComposioConnectorsOpen: (open: boolean) => void;
  aiSidebarOpen: boolean;
  setAiSidebarOpen: (open: boolean) => void;
  importOpen: boolean;
  setImportOpen: (open: boolean) => void;
  automationOpen: boolean;
  setAutomationOpen: (open: boolean) => void;
  canvasFlowOpen: boolean;
  setCanvasFlowOpen: (open: boolean) => void;
  meetingMindOpen: boolean;
  setMeetingMindOpen: (open: boolean) => void;
  uiForgeOpen: boolean;
  setUIForgeOpen: (open: boolean) => void;
  focusShieldOpen: boolean;
  setFocusShieldOpen: (open: boolean) => void;
  fullPageBlockId: string | null;
  setFullPageBlockId: (id: string | null) => void;
  recentItems: { id: string; label: string; icon: string; type: string }[];
  addRecentItem: (id: string, label: string, icon: string, type: string) => void;
  automations: Automation[];
  addAutomation: (automation: Omit<Automation, 'id'>) => void;
  deleteAutomation: (id: string) => void;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  aiMessages: AIChatMessage[];
  setAiMessages: React.Dispatch<React.SetStateAction<AIChatMessage[]>>;
  sendAiMessage: (prompt: string) => void;
  clearAiChat: () => void;
  loadTemplate: (templateKey: string) => void;
  importWorkspace: (jsonString: string) => boolean;
  exportWorkspace: () => string;
  resetWorkspace: () => void;
  dialog: {
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    defaultValue?: string;
    resolve?: (value: any) => void;
  };
  customAlert: (message: string, title?: string) => Promise<void>;
  customConfirm: (message: string, title?: string) => Promise<boolean>;
  customPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
  // General state
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const defaultSettings: AppSettings = {
  theme: 'nord-light',
  font: 'inter',
  sidebarWidth: 260,
  sidebarCollapsed: false,
};

// Unique ID utility
export const generateId = () => Math.random().toString(36).substring(2, 11);

// Emoji lists for random choice
const randomEmojis = ['📝', '🏠', '🚀', '🎯', '📚', '🧠', '💼', '💻', '💡', '🌱', '🗓️', '🏆', '🍿', '🌍', '⚡', '🎨', '🧩', '🏷️'];
const randomCovers = [
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #f12711 0%, #f5af19 100%)'
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [composioConnectorsOpen, setComposioConnectorsOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const [canvasFlowOpen, setCanvasFlowOpen] = useState(false);
  const [meetingMindOpen, setMeetingMindOpen] = useState(false);
  const [uiForgeOpen, setUIForgeOpen] = useState(false);
  const [focusShieldOpen, setFocusShieldOpen] = useState(false);
  const [fullPageBlockId, setFullPageBlockId] = useState<string | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  // ponytail: recent items stored in localStorage, max 10
  const [recentItems, setRecentItems] = useState<{ id: string; label: string; icon: string; type: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('asno_recent') || '[]'); } catch { return []; }
  });

  const addRecentItem = (id: string, label: string, icon: string, type: string) => {
    setRecentItems(prev => {
      const filtered = prev.filter(r => r.id !== id);
      const next = [{ id, label, icon, type }, ...filtered].slice(0, 10);
      localStorage.setItem('asno_recent', JSON.stringify(next));
      return next;
    });
  };

  // ponytail: track page opens for recent sidebar section
  useEffect(() => {
    if (activePageId) {
      const page = pages.find(p => p.id === activePageId);
      if (page) addRecentItem(activePageId, page.title || 'Untitled', page.icon || '📄', page.isDatabase ? 'database' : 'page');
    }
  }, [activePageId, pages]);

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    defaultValue?: string;
    resolve?: (value: any) => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    defaultValue: '',
  });

  const customAlert = (message: string, title: string = 'Alert') => {
    return new Promise<void>((resolve) => {
      setDialog({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolve: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve();
        }
      });
    });
  };

  const customConfirm = (message: string, title: string = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve: (val: boolean) => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(val);
        }
      });
    });
  };

  const customPrompt = (message: string, defaultValue: string = '', title: string = 'Prompt') => {
    return new Promise<string | null>((resolve) => {
      setDialog({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        defaultValue,
        resolve: (val: string | null) => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(val);
        }
      });
    });
  };

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'default', name: 'Personal Workspace', icon: '💼' }
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('default');

  // Load initial state from IndexedDB
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const dbPages = await getPagesFromDB();
        const dbSettings = await getSettingsFromDB();
        const dbAutomations = await getAutomationsFromDB();
        const storedActivePage = localStorage.getItem('asno_active_page');

        const storedWorkspaces = localStorage.getItem('asno_workspaces');
        const storedActiveWorkspace = localStorage.getItem('asno_active_workspace');
        if (storedWorkspaces) {
          try {
            setWorkspaces(JSON.parse(storedWorkspaces));
          } catch (e) {}
        }
        if (storedActiveWorkspace) {
          setActiveWorkspaceId(storedActiveWorkspace);
        }

        if (dbPages && dbPages.length > 0) {
          setPages(dbPages);
          setActivePageId(null);
        } else {
          loadDefaultWorkspace();
        }

        if (dbSettings) {
          setSettings(dbSettings);
        }
        
        if (dbAutomations) {
          setAutomations(dbAutomations);
        }
      } catch (e) {
        console.error("Failed to load state from IndexedDB, trying localStorage fallback", e);
        // Fallback to localStorage
        const storedPages = localStorage.getItem('asno_pages');
        const storedSettings = localStorage.getItem('asno_settings');
        const storedActivePage = localStorage.getItem('asno_active_page');

        const storedWorkspaces = localStorage.getItem('asno_workspaces');
        const storedActiveWorkspace = localStorage.getItem('asno_active_workspace');
        if (storedWorkspaces) {
          try {
            setWorkspaces(JSON.parse(storedWorkspaces));
          } catch (e) {}
        }
        if (storedActiveWorkspace) {
          setActiveWorkspaceId(storedActiveWorkspace);
        }

        if (storedPages) {
          try {
            const parsed = JSON.parse(storedPages);
            setPages(parsed);
            setActivePageId(null);
          } catch (err) {
            loadDefaultWorkspace();
          }
        } else {
          loadDefaultWorkspace();
        }

        if (storedSettings) {
          try { setSettings(JSON.parse(storedSettings)); } catch (err) {}
        }
      }
    };
    loadInitialState();
  }, []);

  // Save changes to IndexedDB
  useEffect(() => {
    if (pages.length > 0) {
      savePagesToDB(pages).catch(e => console.error("Failed to save pages to IndexedDB", e));
      localStorage.setItem('asno_pages', JSON.stringify(pages)); // Sync secondary fallback
    }
  }, [pages]);

  useEffect(() => {
    saveSettingsToDB(settings).catch(e => console.error("Failed to save settings to IndexedDB", e));
    localStorage.setItem('asno_settings', JSON.stringify(settings)); // Sync secondary fallback
  }, [settings]);

  useEffect(() => {
    saveAutomationsToDB(automations).catch(e => console.error("Failed to save automations to IndexedDB", e));
  }, [automations]);

  useEffect(() => {
    if (activePageId) {
      localStorage.setItem('asno_active_page', activePageId);
    }
  }, [activePageId]);

  useEffect(() => {
    localStorage.setItem('asno_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('asno_active_workspace', activeWorkspaceId);
  }, [activeWorkspaceId]);

  // Set theme class on body element
  useEffect(() => {
    // Remove current theme classes
    document.body.className = '';
    // Add new theme class
    document.body.classList.add(`theme-${settings.theme}`);
    document.body.classList.add(`font-${settings.font}`);
  }, [settings.theme, settings.font]);

  const loadDefaultWorkspace = () => {
    const introId = generateId();
    const todoDbId = generateId();
    const booksDbId = generateId();

    const welcomePage: Page = {
      id: introId,
      title: 'Welcome to Asno! 🚀',
      icon: '🚀',
      cover: randomCovers[0],
      parentId: null,
      isFavorite: true,
      isTrash: false,
      content: [
        {
          id: generateId(),
          type: 'h1',
          content: 'Asno: The Ultimate Workspace',
        },
        {
          id: generateId(),
          type: 'text',
          content: 'Welcome! **Asno** is a clean, hyper-responsive Notion clone built with native Web technologies. It features nested document hierarchies, live database layouts, slash-command block creation, markdown shortcuts, custom templates, and a smart AI draft helper.',
        },
        {
          id: generateId(),
          type: 'callout',
          content: '💡 **Quick Tip:** Type `/` on any blank line to access the block menu, or start a line with `# ` for a header, `- ` for bullet list, or `[] ` for a checkbox!',
          properties: {
            calloutIcon: '💡',
            calloutColor: 'info'
          }
        },
        {
          id: generateId(),
          type: 'h2',
          content: 'Nested Workspace Hierarchy',
        },
        {
          id: generateId(),
          type: 'text',
          content: 'You can create unlimited pages inside other pages. Check out the pre-built sub-pages in the sidebar, or create a new page by hovering over the workspace headers in the sidebar and clicking the **+** button.',
        },
        {
          id: generateId(),
          type: 'h2',
          content: 'Advanced Database Views',
        },
        {
          id: generateId(),
          type: 'text',
          content: 'Inline databases allow you to organize items with metadata, sort and filter, and view them in multiple visual formats. Here are two template databases pre-loaded for you:',
        },
        {
          id: generateId(),
          type: 'todo',
          content: 'Review the Project Roadmap board (in sidebar) 🎯',
          properties: { checked: true }
        },
        {
          id: generateId(),
          type: 'todo',
          content: 'Check out the Reading List table (in sidebar) 📚',
          properties: { checked: false }
        },
        {
          id: generateId(),
          type: 'quote',
          content: '“The best way to predict the future is to create it.” — Peter Drucker',
        }
      ]
    };

    // Database 1: Project Roadmap (Kanban Board)
    const taskDbPage: Page = {
      id: todoDbId,
      title: 'Project Roadmap 🎯',
      icon: '🎯',
      cover: randomCovers[3],
      parentId: null,
      isFavorite: false,
      isTrash: false,
      content: [],
      isDatabase: true,
      dbSchema: {
        properties: [
          { id: 'prop-title', name: 'Task Name', type: 'text' },
          { 
            id: 'prop-status', 
            name: 'Status', 
            type: 'select',
            options: [
              { id: 'opt-todo', name: 'To Do', color: '#ffb3ba' },
              { id: 'opt-inprogress', name: 'In Progress', color: '#ffdfba' },
              { id: 'opt-review', name: 'Under Review', color: '#baffc9' },
              { id: 'opt-done', name: 'Completed', color: '#bae1ff' }
            ]
          },
          {
            id: 'prop-priority',
            name: 'Priority',
            type: 'select',
            options: [
              { id: 'opt-low', name: 'Low', color: '#e8e8e8' },
              { id: 'opt-med', name: 'Medium', color: '#dbe9ff' },
              { id: 'opt-high', name: 'High', color: '#ffe4db' }
            ]
          },
          { id: 'prop-due', name: 'Due Date', type: 'date' }
        ]
      },
      dbViews: [
        {
          id: 'view-board',
          name: 'Kanban Board',
          type: 'board',
          groupByPropertyId: 'prop-status',
          visibleProperties: ['prop-priority', 'prop-due']
        },
        {
          id: 'view-table',
          name: 'All Tasks Table',
          type: 'table',
          visibleProperties: ['prop-status', 'prop-priority', 'prop-due']
        }
      ],
      dbRows: [
        {
          id: 'row-1',
          cells: {
            'prop-title': 'Draft design proposals for Asno logo',
            'prop-status': 'opt-done',
            'prop-priority': 'opt-high',
            'prop-due': '2026-06-18'
          },
          content: [
            { id: generateId(), type: 'text', content: 'Create a logo that combines a sleek minimalist letter A with a gravity-defying vector ring.' }
          ]
        },
        {
          id: 'row-2',
          cells: {
            'prop-title': 'Implement CSS glassmorphism theme sets',
            'prop-status': 'opt-inprogress',
            'prop-priority': 'opt-med',
            'prop-due': '2026-06-20'
          },
          content: [
            { id: generateId(), type: 'text', content: 'Themes: Nord Light, Obsidian Dark, Cyberpunk, Emerald Mint, Sunset Rose. Make sure shadows look soft and backdrops have blur filters.' }
          ]
        },
        {
          id: 'row-3',
          cells: {
            'prop-title': 'Conduct QA audits on block layouts',
            'prop-status': 'opt-todo',
            'prop-priority': 'opt-low',
            'prop-due': '2026-06-25'
          },
          content: []
        }
      ]
    };

    // Database 2: Reading List (Table database)
    const booksDbPage: Page = {
      id: booksDbId,
      title: 'Reading List 📚',
      icon: '📚',
      cover: randomCovers[7],
      parentId: null,
      isFavorite: false,
      isTrash: false,
      content: [],
      isDatabase: true,
      dbSchema: {
        properties: [
          { id: 'b-title', name: 'Book Title', type: 'text' },
          { id: 'b-author', name: 'Author', type: 'text' },
          { 
            id: 'b-status', 
            name: 'Status', 
            type: 'select',
            options: [
              { id: 'bs-unread', name: 'To Read', color: '#e8e8e8' },
              { id: 'bs-reading', name: 'Reading', color: '#ffeaa7' },
              { id: 'bs-read', name: 'Finished', color: '#55efc4' }
            ]
          },
          { id: 'b-score', name: 'Rating (1-5)', type: 'number' },
          { id: 'b-url', name: 'Purchase URL', type: 'url' }
        ]
      },
      dbViews: [
        {
          id: 'v-table-books',
          name: 'Book Shelf',
          type: 'table',
          visibleProperties: ['b-author', 'b-status', 'b-score', 'b-url']
        },
        {
          id: 'v-board-books',
          name: 'Reading Status Board',
          type: 'board',
          groupByPropertyId: 'b-status',
          visibleProperties: ['b-author', 'b-score']
        }
      ],
      dbRows: [
        {
          id: 'brow-1',
          cells: {
            'b-title': 'Atomic Habits',
            'b-author': 'James Clear',
            'b-status': 'bs-reading',
            'b-score': 5,
            'b-url': 'https://amazon.com'
          },
          content: [
            { id: generateId(), type: 'text', content: 'Key takeaway: System over goals. A tiny 1% improvement every day compound to massive transformations.' }
          ]
        },
        {
          id: 'brow-2',
          cells: {
            'b-title': 'Dune',
            'b-author': 'Frank Herbert',
            'b-status': 'bs-unread',
            'b-score': null,
            'b-url': 'https://amazon.com'
          },
          content: []
        },
        {
          id: 'brow-3',
          cells: {
            'b-title': 'Sapiens: A Brief History of Humankind',
            'b-author': 'Yuval Noah Harari',
            'b-status': 'bs-read',
            'b-score': 4,
            'b-url': 'https://amazon.com'
          },
          content: [
            { id: generateId(), type: 'text', content: 'Explores how cognitive, agricultural, and scientific revolutions shaped human societies.' }
          ]
        }
      ]
    };

    const initialPages = [welcomePage, taskDbPage, booksDbPage];
    setPages(initialPages);
    setActivePageId(null);
    localStorage.setItem('asno_pages', JSON.stringify(initialPages));
  };

  // ---------------- Page Management ----------------
  const addPage = (parentId: string | null, isDatabase?: boolean, initialViewType?: DatabaseView['type'], preventActive?: boolean) => {
    const newId = generateId();
    const newPage: Page = {
      id: newId,
      title: isDatabase ? 'Untitled Database' : 'Untitled Page',
      icon: randomEmojis[Math.floor(Math.random() * randomEmojis.length)],
      cover: randomCovers[Math.floor(Math.random() * randomCovers.length)],
      parentId,
      isFavorite: false,
      isTrash: false,
      content: [],
      isDatabase,
      workspaceId: activeWorkspaceId,
      createdTime: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      tags: [],
      comments: [],
      customProperties: {},
      ...(isDatabase && {
        dbSchema: {
          properties: [
            { id: 'prop-name', name: 'Name', type: 'text' },
            { 
              id: 'prop-status', 
              name: 'Status', 
              type: 'select',
              options: [
                { id: 'opt-notstarted', name: 'Not Started', color: '#e8e8e8' },
                { id: 'opt-inprogress', name: 'In Progress', color: '#ffe4db' },
                { id: 'opt-completed', name: 'Completed', color: '#d4fc79' }
              ]
            }
          ]
        },
        dbViews: (() => {
          const defaultViews = [
            { id: 'view-table-1', name: 'Table View', type: 'table' as const, visibleProperties: ['prop-status'] },
            { id: 'view-board-1', name: 'Board View', type: 'board' as const, groupByPropertyId: 'prop-status', visibleProperties: [] },
            { id: 'view-calendar-1', name: 'Calendar View', type: 'calendar' as const, visibleProperties: [] },
            { id: 'view-timeline-1', name: 'Timeline View', type: 'timeline' as const, visibleProperties: [] },
            { id: 'view-dashboard-1', name: 'Dashboard Stats', type: 'dashboard' as const, visibleProperties: [] },
            { id: 'view-map-1', name: 'Map Portal', type: 'map' as const, visibleProperties: [] },
            { id: 'view-gallery-1', name: 'Gallery Grid', type: 'gallery' as const, visibleProperties: [] },
            { id: 'view-list-1', name: 'List View', type: 'list' as const, visibleProperties: [] },
            { id: 'view-feed-1', name: 'Timeline Feed', type: 'feed' as const, visibleProperties: [] },
            { id: 'view-form-1', name: 'Form View', type: 'form' as const, visibleProperties: [] }
          ];
          if (initialViewType) {
            const index = defaultViews.findIndex(v => v.type === initialViewType);
            if (index > -1) {
              const [selected] = defaultViews.splice(index, 1);
              return [selected, ...defaultViews];
            }
          }
          return defaultViews;
        })(),
        dbRows: [
          { id: 'row-default-1', cells: { 'prop-name': 'Sample Item 1', 'prop-status': 'opt-notstarted' }, content: [] },
          { id: 'row-default-2', cells: { 'prop-name': 'Sample Item 2', 'prop-status': 'opt-inprogress' }, content: [] }
        ]
      })
    };

    setPages((prev) => [...prev, newPage]);
    if (!preventActive) {
      setActivePageId(newId);
    }
    return newId;
  };

  const updatePage = (pageId: string, updates: Partial<Page>) => {
    setPages((prev) =>
      prev.map((page) => (page.id === pageId ? { ...page, ...updates } : page))
    );
  };

  // Delete page handles recursively marking children as trash
  const deletePage = (pageId: string) => {
    setPages((prev) => {
      const idsToTrash = new Set<string>([pageId]);
      
      // Multi-pass to find all nested descendants
      let searchMore = true;
      while (searchMore) {
        let sizeBefore = idsToTrash.size;
        prev.forEach(p => {
          if (p.parentId && idsToTrash.has(p.parentId)) {
            idsToTrash.add(p.id);
          }
        });
        if (idsToTrash.size === sizeBefore) searchMore = false;
      }

      const updated = prev.map((page) =>
        idsToTrash.has(page.id) ? { ...page, isTrash: true, isFavorite: false } : page
      );

      // Select new active page if the current active is deleted
      if (activePageId && idsToTrash.has(activePageId)) {
        const remaining = updated.filter(p => !p.isTrash);
        if (remaining.length > 0) {
          // Try to find a sibling or parent, or fallback
          const target = prev.find(p => p.id === pageId);
          const parentSibling = target?.parentId ? remaining.find(p => p.parentId === target.parentId) : null;
          setActivePageId(parentSibling?.id || remaining[0].id);
        } else {
          setActivePageId(null);
        }
      }

      return updated;
    });
  };

  const restorePage = (pageId: string) => {
    setPages((prev) => {
      // Find the page path up to root to restore all parent anchors if they are trashed
      const idsToRestore = new Set<string>([pageId]);
      let current = prev.find(p => p.id === pageId);
      
      while (current && current.parentId) {
        const pId = current.parentId;
        const parent = prev.find(p => p.id === pId);
        if (parent?.isTrash) {
          idsToRestore.add(parent.id);
        }
        current = parent;
      }

      return prev.map((page) =>
        idsToRestore.has(page.id) ? { ...page, isTrash: false } : page
      );
    });
    setActivePageId(pageId);
  };

  const permanentlyDeletePage = (pageId: string) => {
    setPages((prev) => {
      const idsToDelete = new Set<string>([pageId]);
      
      // Mark child pages
      let searchMore = true;
      while (searchMore) {
        let sizeBefore = idsToDelete.size;
        prev.forEach(p => {
          if (p.parentId && idsToDelete.has(p.parentId)) {
            idsToDelete.add(p.id);
          }
        });
        if (idsToDelete.size === sizeBefore) searchMore = false;
      }

      return prev.filter(p => !idsToDelete.has(p.id));
    });
  };

  const duplicatePage = (pageId: string) => {
    const pageToDup = pages.find(p => p.id === pageId);
    if (!pageToDup) return;

    const dupId = generateId();
    const duplicated: Page = {
      ...pageToDup,
      id: dupId,
      title: `${pageToDup.title} (Copy)`,
      isFavorite: false,
      // Duplicate block contents
      content: pageToDup.content.map(b => ({ ...b, id: generateId() })),
      // Duplicate database rows if db
      dbRows: pageToDup.dbRows?.map(r => ({ ...r, id: generateId(), content: r.content.map(b => ({ ...b, id: generateId() })) }))
    };

    setPages(prev => [...prev, duplicated]);
    setActivePageId(dupId);
  };

  // ---------------- Block Management ----------------
  const addBlock = (pageId: string, type: Block['type'] = 'text', parentBlockId?: string, index?: number) => {
    const newBlockId = generateId();
    
    const getInitialProperties = (blockType: Block['type']) => {
      switch (blockType) {
        case 'todo': return { checked: false };
        case 'toggle':
        case 'toggle-h1':
        case 'toggle-h2':
        case 'toggle-h3': return { open: false };
        case 'callout': return { calloutIcon: '💡', calloutColor: 'info' };
        case 'code': return { language: 'javascript' };
        case 'image':
        case 'video':
        case 'audio':
        case 'file':
        case 'pdf': return { src: '', caption: '', fileName: 'attachment', fileSize: '0 KB' };
        case 'embed': return { src: '', caption: 'Website Embed' };
        case 'bookmark':
        case 'link-preview': return { src: '', caption: 'Bookmark Link' };
        case 'table': return { tableData: [['', ''], ['', '']] };
        case 'synced-block': return { syncedBlockId: newBlockId };
        case 'button': return { buttonText: 'Click me', buttonAction: 'alert' as const, buttonCount: 0 };
        case 'date': return { dateValue: new Date().toISOString().split('T')[0] };
        case 'feedback': return { feedbackCount: { up: 0, down: 0 } };
        case 'form': return { formFields: [{ id: 'feedback', label: 'Comments', type: 'text' as const }], formSubmissions: [] };
        case 'comment': return { comments: [] };
        case 'template-button': return { buttonText: 'Add New Checklist', templateBlocks: [{ id: generateId(), type: 'todo' as const, content: 'New checklist item' }] };
        case 'equation': return { equationText: 'E = mc^2' };
        case 'youtube': return { src: '', caption: 'YouTube Video' };
        case 'google-drive': return { src: '', caption: 'Google Drive File', fileName: 'Untitled Document' };
        case 'figma': return { src: '', caption: 'Figma Project' };
        case 'github': return { src: '', caption: 'GitHub Repository', githubStars: 0, githubForks: 0, githubOpenIssues: 0, githubDesc: '' };
        case 'slack': return { slackAuthor: 'Sarah Jenkins', slackAvatar: '👩‍💻', slackTimestamp: '10:24 AM', slackChannel: 'announcements' };
        case 'trello': return { trelloBoardName: 'Project Board', trelloLists: [{ title: 'To Do', cards: ['Design UI Layout', 'Fix Sidebar collapse bug'] }, { title: 'In Progress', cards: ['Refactor state actions'] }, { title: 'Done', cards: ['Launch beta app'] }] };
        case 'airtable': return { src: '', caption: 'Airtable Embed' };
        case 'loom': return { src: '', caption: 'Loom Video' };
        case 'google-maps': return { src: '', caption: 'Google Maps Embed' };
        case 'dropbox': return { src: '', caption: 'Dropbox Attachment', fileName: 'design_specs.pdf', fileSize: '8.4 MB' };
        case 'onedrive': return { src: '', caption: 'OneDrive Attachment', fileName: 'sales_forecast.xlsx', fileSize: '1.2 MB' };
        case 'notion': return { pageId: '' };
        case 'chart': return { chartType: 'bar' as const, chartData: [{ label: 'Mon', value: 120 }, { label: 'Tue', value: 190 }, { label: 'Wed', value: 300 }, { label: 'Thu', value: 500 }, { label: 'Fri', value: 200 }] };
        case 'chart-bar': return { chartType: 'bar' as const, chartData: [{ label: 'Mon', value: 120 }, { label: 'Tue', value: 190 }, { label: 'Wed', value: 300 }, { label: 'Thu', value: 500 }, { label: 'Fri', value: 200 }] };
        case 'chart-line': return { chartType: 'line' as const, chartData: [{ label: 'Mon', value: 120 }, { label: 'Tue', value: 190 }, { label: 'Wed', value: 300 }, { label: 'Thu', value: 500 }, { label: 'Fri', value: 200 }] };
        case 'chart-pie': return { chartType: 'pie' as const, chartData: [{ label: 'Product A', value: 40 }, { label: 'Product B', value: 35 }, { label: 'Product C', value: 25 }] };
        case 'chart-gauge': return { chartType: 'gauge' as const, chartData: [{ label: 'Value', value: 75 }] };
        case 'chart-radar': return { chartType: 'radar' as const, chartData: [{ label: 'Speed', value: 85 }, { label: 'Power', value: 70 }, { label: 'Stamina', value: 90 }, { label: 'Agility', value: 75 }, { label: 'Focus', value: 95 }] };
        case 'ai-block': return { aiPrompt: '', aiGenerating: false };
        case 'current-date': return { dateValue: new Date().toLocaleDateString() };
        case 'anchor': return { anchorName: 'section-anchor' };
        case 'navigation': return { navLinks: [] };
        case 'table-row': return { tableData: [['Cell A', 'Cell B']] };
        case 'time': return { timeValue: '12:00' };
        case 'person': return { personName: 'Sarah Jenkins', personAvatar: '👩‍💻' };
        case 'page-link': return { pageId: '' };
        case 'emoji': return { emojiValue: '🚀' };
        case 'checkbox': return { checked: false };
        case 'volume': return { volumeLevel: 50 };
        case 'import': return { fileType: 'csv', src: '', caption: '' };
        case 'notes': return { bgColor: 'rgba(112,83,255,0.05)', textColor: 'var(--text-primary)' };
        default: return undefined;
      }
    };

    const newBlock: Block = {
      id: newBlockId,
      type,
      content: '',
      properties: getInitialProperties(type),
    };

    setPages((prev) =>
      prev.map((page) => {
        // Normal page matches pageId
        if (page.id === pageId) {
          let newContent = [...page.content];
          if (parentBlockId) {
            const insertNested = (blocks: Block[]): Block[] => {
              return blocks.map(b => {
                const isTarget = b.id === parentBlockId || (b.type === 'synced-block' && b.properties?.syncedBlockId === parentBlockId) || (b.type === 'synced-block' && b.id === parentBlockId);
                if (isTarget) {
                  const kids = b.children ? [...b.children] : [];
                  if (index !== undefined) {
                    kids.splice(index, 0, newBlock);
                  } else {
                    kids.push(newBlock);
                  }
                  return { ...b, children: kids };
                } else if (b.children) {
                  return { ...b, children: insertNested(b.children) };
                }
                return b;
              });
            };
            newContent = insertNested(newContent);
          } else {
            if (index !== undefined) {
              newContent.splice(index, 0, newBlock);
            } else {
              newContent.push(newBlock);
            }
          }
          return { ...page, content: newContent };
        }

        // Database row matches pageId (rowId)
        if (page.dbRows && page.dbRows.some(r => r.id === pageId)) {
          const updatedRows = page.dbRows.map(row => {
            if (row.id !== pageId) return row;
            let newContent = [...row.content];
            if (parentBlockId) {
              const insertNested = (blocks: Block[]): Block[] => {
                return blocks.map(b => {
                  const isTarget = b.id === parentBlockId || (b.type === 'synced-block' && b.properties?.syncedBlockId === parentBlockId) || (b.type === 'synced-block' && b.id === parentBlockId);
                  if (isTarget) {
                    const kids = b.children ? [...b.children] : [];
                    if (index !== undefined) {
                      kids.splice(index, 0, newBlock);
                    } else {
                      kids.push(newBlock);
                    }
                    return { ...b, children: kids };
                  } else if (b.children) {
                    return { ...b, children: insertNested(b.children) };
                  }
                  return b;
                });
              };
              newContent = insertNested(newContent);
            } else {
              if (index !== undefined) {
                newContent.splice(index, 0, newBlock);
              } else {
                newContent.push(newBlock);
              }
            }
            return { ...row, content: newContent };
          });
          return { ...page, dbRows: updatedRows };
        }

        return page;
      })
    );

    return newBlockId;
  };

  const updateBlock = (pageId: string, blockId: string, updates: Partial<Block>) => {
    // Check if the block has a synced relation in current pages state
    let syncedId: string | undefined = undefined;
    pages.forEach(p => {
      const checkNode = (blocks: Block[]) => {
        blocks.forEach(b => {
          if (b.id === blockId) {
            syncedId = b.properties?.syncedBlockId;
          }
          if (b.children) checkNode(b.children);
        });
      };
      checkNode(p.content);
      p.dbRows?.forEach(r => checkNode(r.content));
    });

    // Run block and form automations
    let blockType: Block['type'] | undefined;
    pages.forEach(p => {
      const checkNode = (blocks: Block[]) => {
        blocks.forEach(b => {
          if (b.id === blockId) blockType = b.type;
          if (b.children) checkNode(b.children);
        });
      };
      if (p.id === pageId) checkNode(p.content);
      p.dbRows?.forEach(r => { if (r.id === pageId) checkNode(r.content); });
    });

    if (blockType && updates.content !== undefined) {
      setTimeout(() => runAutomations('block-change', pageId, blockId, blockType, updates.content), 0);
    }
    if (updates.properties?.formSubmissions) {
      const subs = updates.properties.formSubmissions;
      const lastSub = subs[subs.length - 1];
      setTimeout(() => runAutomations('form-submit', pageId, blockId, 'form', lastSub), 0);
    }

    setPages((prev) =>
      prev.map((page) => {
        const recursiveUpdate = (blocks: Block[]): Block[] => {
          return blocks.map((b) => {
            const isMatch = b.id === blockId || (syncedId && (b.id === syncedId || b.properties?.syncedBlockId === syncedId));
            if (isMatch) {
              const updatedProperties = { ...b.properties, ...updates.properties };
              return { 
                ...b, 
                ...updates, 
                properties: Object.keys(updatedProperties).length ? updatedProperties : undefined 
              };
            } else if (b.children) {
              return { ...b, children: recursiveUpdate(b.children) };
            }
            return b;
          });
        };

        const updatedContent = recursiveUpdate(page.content);
        const updatedRows = page.dbRows?.map(row => {
          return { ...row, content: recursiveUpdate(row.content) };
        });

        return { 
          ...page, 
          content: updatedContent, 
          ...(page.dbRows && { dbRows: updatedRows }) 
        };
      })
    );
  };

  const deleteBlock = (pageId: string, blockId: string) => {
    setPages((prev) =>
      prev.map((page) => {
        // Normal page matches pageId
        if (page.id === pageId) {
          const recursiveDelete = (blocks: Block[]): Block[] => {
            const filtered = blocks.filter(b => b.id !== blockId);
            return filtered.map(b => {
              if (b.children) {
                return { ...b, children: recursiveDelete(b.children) };
              }
              return b;
            });
          };
          let nextContent = recursiveDelete(page.content);
          if (nextContent.length === 0) {
            nextContent = [{ id: generateId(), type: 'text', content: '' }];
          }
          return { ...page, content: nextContent };
        }

        // Database row matches pageId (rowId)
        if (page.dbRows && page.dbRows.some(r => r.id === pageId)) {
          const recursiveDelete = (blocks: Block[]): Block[] => {
            const filtered = blocks.filter(b => b.id !== blockId);
            return filtered.map(b => {
              if (b.children) {
                return { ...b, children: recursiveDelete(b.children) };
              }
              return b;
            });
          };
          const updatedRows = page.dbRows.map(row => {
            if (row.id !== pageId) return row;
            let nextContent = recursiveDelete(row.content);
            if (nextContent.length === 0) {
              nextContent = [{ id: generateId(), type: 'text', content: '' }];
            }
            return { ...row, content: nextContent };
          });
          return { ...page, dbRows: updatedRows };
        }

        return page;
      })
    );
  };

  const setBlocks = (pageId: string, blocks: Block[]) => {
    setPages((prev) =>
      prev.map((page) => (page.id === pageId ? { ...page, content: blocks } : page))
    );
  };

  // ---------------- Database Schema & Property Settings ----------------
  const addDatabaseProperty = (pageId: string, name: string, type: DatabaseProperty['type']) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbSchema) return page;
        const newPropId = `prop-${generateId()}`;
        const newProperty: DatabaseProperty = {
          id: newPropId,
          name,
          type,
          options: type === 'select' || type === 'multi-select' ? [] : undefined
        };
        const nextSchema = {
          properties: [...page.dbSchema.properties, newProperty]
        };
        // Add default cell value to rows
        const nextRows = page.dbRows?.map(r => ({
          ...r,
          cells: {
            ...r.cells,
            [newPropId]: type === 'checkbox' ? false : type === 'multi-select' ? [] : null
          }
        })) || [];

        return { ...page, dbSchema: nextSchema, dbRows: nextRows };
      })
    );
  };

  const updateDatabaseProperty = (pageId: string, propertyId: string, updates: Partial<DatabaseProperty>) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbSchema) return page;
        const nextSchema = {
          properties: page.dbSchema.properties.map((p) =>
            p.id === propertyId ? { ...p, ...updates } : p
          )
        };
        return { ...page, dbSchema: nextSchema };
      })
    );
  };

  const deleteDatabaseProperty = (pageId: string, propertyId: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbSchema) return page;
        const nextSchema = {
          properties: page.dbSchema.properties.filter(p => p.id !== propertyId)
        };
        // Clean cell property from rows
        const nextRows = page.dbRows?.map(r => {
          const nextCells = { ...r.cells };
          delete nextCells[propertyId];
          return { ...r, cells: nextCells };
        }) || [];

        // Remove from dbViews filters/sorts/groupBys
        const nextViews = page.dbViews?.map(v => ({
          ...v,
          groupByPropertyId: v.groupByPropertyId === propertyId ? undefined : v.groupByPropertyId,
          filterPropertyId: v.filterPropertyId === propertyId ? undefined : v.filterPropertyId,
          sortPropertyId: v.sortPropertyId === propertyId ? undefined : v.sortPropertyId,
          visibleProperties: v.visibleProperties?.filter(vp => vp !== propertyId)
        })) || [];

        return { ...page, dbSchema: nextSchema, dbRows: nextRows, dbViews: nextViews };
      })
    );
  };

  // ---------------- Database Row Management ----------------
  const addDatabaseRow = (pageId: string, rowData?: Record<string, any>) => {
    const newRowId = `row-${generateId()}`;
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbSchema) return page;
        const initialCells: Record<string, any> = {};
        page.dbSchema.properties.forEach((p) => {
          if (rowData && rowData[p.id] !== undefined) {
            initialCells[p.id] = rowData[p.id];
          } else {
            initialCells[p.id] = p.type === 'checkbox' ? false : p.type === 'multi-select' ? [] : null;
          }
        });

        const newRow: DatabaseRow = {
          id: newRowId,
          cells: initialCells,
          content: [{ id: generateId(), type: 'text', content: '' }]
        };

        return { ...page, dbRows: [...(page.dbRows || []), newRow] };
      })
    );
    setTimeout(() => runAutomations('row-add', pageId, undefined, undefined, rowData), 0);
    return newRowId;
  };

  const updateDatabaseRowCell = (pageId: string, rowId: string, propertyId: string, value: any) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbRows) return page;
        return {
          ...page,
          dbRows: page.dbRows.map((r) =>
            r.id === rowId ? { ...r, cells: { ...r.cells, [propertyId]: value } } : r
          )
        };
      })
    );
  };

  const deleteDatabaseRow = (pageId: string, rowId: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbRows) return page;
        return { ...page, dbRows: page.dbRows.filter(r => r.id !== rowId) };
      })
    );
  };

  const updateDatabaseRowContent = (pageId: string, rowId: string, blocks: Block[]) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbRows) return page;
        return {
          ...page,
          dbRows: page.dbRows.map((r) =>
            r.id === rowId ? { ...r, content: blocks } : r
          )
        };
      })
    );
  };

  // ---------------- Database Views ----------------
  const addDatabaseView = (pageId: string, name: string, type: DatabaseView['type']) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const newView: DatabaseView = {
          id: `view-${generateId()}`,
          name,
          type,
          visibleProperties: page.dbSchema?.properties.map(p => p.id) || []
        };
        return { ...page, dbViews: [...(page.dbViews || []), newView] };
      })
    );
  };

  const updateDatabaseView = (pageId: string, viewId: string, updates: Partial<DatabaseView>) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbViews) return page;
        return {
          ...page,
          dbViews: page.dbViews.map((v) =>
            v.id === viewId ? { ...v, ...updates } : v
          )
        };
      })
    );
  };

  const deleteDatabaseView = (pageId: string, viewId: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId || !page.dbViews) return page;
        return { ...page, dbViews: page.dbViews.filter(v => v.id !== viewId) };
      })
    );
  };

  // ---------------- Settings & UI States ----------------
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // ---------------- Mock AI Sidebar Integration ----------------
  const sendAiMessage = (prompt: string) => {
    const userMsg: AIChatMessage = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };
    
    setAiMessages(prev => [...prev, userMsg]);

    // Simulate AI response based on keywords and page context
    setTimeout(() => {
      const activePage = pages.find(p => p.id === activePageId);
      const docTitle = activePage ? activePage.title : 'Untitled Page';
      const pageText = activePage?.content.map(b => b.content).join(' ') || '';

      let reply = '';
      const lowPrompt = prompt.toLowerCase();

      if (lowPrompt.includes('summarize') || lowPrompt.includes('summary')) {
        reply = `### Summary of "${docTitle}":\n\nThis workspace document covers **${docTitle}**. Based on my analysis, the main objectives include maintaining a structured hierarchy and managing live items. Here are key bullet points:\n- Core components focus on flexible, responsive page blocks.\n- Inline database configurations cover views like Tables and Kanban Boards.\n- The workflow allows full interactive customization of properties.`;
      } else if (lowPrompt.includes('action item') || lowPrompt.includes('todo') || lowPrompt.includes('to-do')) {
        reply = `### Suggested Action Items:\n\nBased on your content in **${docTitle}**, I've extracted the following tasks:\n1. [ ] **Implement CSS transitions** to refine the sidebar animations.\n2. [ ] **Verify database sorting** works across both Table and Calendar views.\n3. [ ] **Add detailed documentation** describing the slash commands '/' syntax.`;
      } else if (lowPrompt.includes('translate')) {
        reply = `### Translated Content (French):\n\nVoici la traduction du titre et du début de page:\n**Titre :** ${docTitle.replace(/[^a-zA-Z0-9\s]/g, '')}\n**Contenu :** ${pageText.substring(0, 150) || 'Aucun contenu texte détecté.'}...`;
      } else if (lowPrompt.includes('improve') || lowPrompt.includes('grammar') || lowPrompt.includes('spell')) {
        reply = `### Improved Draft:\n\nI reviewed your spelling, sentence flow, and clarity. Here is a polished draft:\n\n*"Welcome to Asno, your ultimate workspace. Asno is a responsive, local-first Notion clone built with React and Vanilla CSS. It facilitates infinite document nesting, markdown editing shortcuts, and drag-and-drop Kanban layouts."*`;
      } else {
        reply = `Hello! I'm your **Asno AI Helper** 🧠.\n\nI have read the page "${docTitle}" (word count: ${pageText.split(' ').filter(Boolean).length}). How can I assist you in writing or editing?\n\nTry asking me to:\n- **"Summarize this page"**\n- **"Generate action items"**\n- **"Improve my grammar"**\n- **"Translate this page"**`;
      }

      setAiMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now()
      }]);
    }, 1000);
  };

  const clearAiChat = () => setAiMessages([]);

  // ---------------- Load Templates ----------------
  const loadTemplate = (templateKey: string) => {
    const templateId = generateId();
    let templatePage: Page;

    if (templateKey === 'journal') {
      templatePage = {
        id: templateId,
        title: 'Daily Journal 📔',
        icon: '📔',
        cover: randomCovers[5],
        parentId: null,
        isFavorite: false,
        isTrash: false,
        content: [
          { id: generateId(), type: 'h1', content: 'Today\'s Entry' },
          { id: generateId(), type: 'callout', content: '✨ **Morning Quote:** "Write it on your heart that every day is the best day in the year." — Ralph Waldo Emerson', properties: { calloutIcon: '✨', calloutColor: 'warning' } },
          { id: generateId(), type: 'h2', content: '🌞 Morning Reflection' },
          { id: generateId(), type: 'todo', content: '3 Things I\'m grateful for today' },
          { id: generateId(), type: 'bullet', content: 'A warm cup of coffee in the morning' },
          { id: generateId(), type: 'bullet', content: 'The quiet hour before work begins' },
          { id: generateId(), type: 'bullet', content: 'Clean code that runs on the first try!' },
          { id: generateId(), type: 'h2', content: '🎯 Daily Focus' },
          { id: generateId(), type: 'number', content: 'Draft the project proposal slides' },
          { id: generateId(), type: 'number', content: 'Exercise for at least 30 minutes' },
          { id: generateId(), type: 'number', content: 'Read 15 pages of my current book' },
          { id: generateId(), type: 'h2', content: '🌙 Evening Review' },
          { id: generateId(), type: 'text', content: 'Write down a few highlights of how the day went here...' }
        ]
      };
    } else if (templateKey === 'class') {
      templatePage = {
        id: templateId,
        title: 'Lecture Notes 🎓',
        icon: '🎓',
        cover: randomCovers[8],
        parentId: null,
        isFavorite: false,
        isTrash: false,
        content: [
          { id: generateId(), type: 'h1', content: 'Introduction to Algorithms' },
          { id: generateId(), type: 'callout', content: '📝 **Exam Date:** July 12th. Covers chapters 1 through 6 in the textbook.', properties: { calloutIcon: '📝', calloutColor: 'info' } },
          { id: generateId(), type: 'h2', content: 'Topics Covered' },
          { id: generateId(), type: 'bullet', content: 'Time Complexity and Big-O Notation' },
          { id: generateId(), type: 'bullet', content: 'Divide and Conquer paradigm (Merge Sort vs Quick Sort)' },
          { id: generateId(), type: 'h2', content: 'Quick Pseudocode' },
          { 
            id: generateId(), 
            type: 'code', 
            content: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}',
            properties: { language: 'javascript' }
          },
          { id: generateId(), type: 'h2', content: 'Key Terms' },
          { id: generateId(), type: 'toggle', content: 'What is the master theorem?', properties: { open: false } },
          { id: generateId(), type: 'text', content: 'A formulaic method to solve recurrence relations of the form T(n) = aT(n/b) + f(n).' }
        ]
      };
    } else {
      // Fallback Default
      templatePage = {
        id: templateId,
        title: 'Blank Notebook 📄',
        icon: '📄',
        cover: randomCovers[2],
        parentId: null,
        isFavorite: false,
        isTrash: false,
        content: [{ id: generateId(), type: 'text', content: 'Start typing here...' }]
      };
    }

    setPages(prev => [...prev, templatePage]);
    setActivePageId(templateId);
  };

  // ---------------- Export & Import Settings ----------------
  const exportWorkspace = () => {
    return JSON.stringify({ pages, settings });
  };

  const importWorkspace = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.pages)) {
        setPages(parsed.pages);
        if (parsed.settings) setSettings({ ...defaultSettings, ...parsed.settings });
        
        // Select active page
        const firstValid = parsed.pages.find((p: Page) => !p.isTrash);
        if (firstValid) setActivePageId(firstValid.id);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // ---------------- Automation Actions ----------------
  const addAutomation = (automation: Omit<Automation, 'id'>) => {
    const newAuto: Automation = {
      ...automation,
      id: generateId()
    };
    setAutomations((prev) => [...prev, newAuto]);
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAutomation = (id: string, updates: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const runAutomations = (
    triggerType: Automation['trigger']['type'],
    sourcePageId: string,
    sourceBlockId?: string,
    sourceBlockType?: Block['type'],
    extraData?: any
  ) => {
    automations.forEach((auto) => {
      if (!auto.enabled) return;
      
      const t = auto.trigger;
      if (t.type !== triggerType) return;
      if (t.sourcePageId && t.sourcePageId !== sourcePageId) return;
      if (t.sourceBlockId && t.sourceBlockId !== sourceBlockId) return;
      if (t.sourceBlockType && t.sourceBlockType !== sourceBlockType) return;

      const a = auto.action;
      const targetPageId = a.targetPageId || sourcePageId;
      
      if (a.type === 'sync-to-chart' && a.targetBlockId) {
        setPages(prev => prev.map(p => {
          const updateChart = (blocks: Block[]): Block[] => {
            return blocks.map(b => {
              if (b.id === a.targetBlockId && b.type === 'chart') {
                return {
                  ...b,
                  properties: {
                    ...b.properties,
                    chartData: Array.isArray(extraData) ? extraData : b.properties?.chartData
                  }
                };
              }
              if (b.children) {
                return { ...b, children: updateChart(b.children) };
              }
              return b;
            });
          };
          
          return {
            ...p,
            content: updateChart(p.content),
            dbRows: p.dbRows?.map(r => ({
              ...r,
              content: updateChart(r.content)
            }))
          };
        }));
      } else if (a.type === 'add-db-row') {
        addDatabaseRow(targetPageId, extraData || {});
      } else if (a.type === 'add-block') {
        addBlock(targetPageId, a.targetBlockType || 'text');
      } else if (a.type === 'update-block' && a.targetBlockId) {
        updateBlock(targetPageId, a.targetBlockId, { content: String(extraData || '') });
      } else if (a.type === 'notify') {
        const msg = a.config?.message || 'Automation triggered!';
        customAlert(`🤖 Automation: ${msg}`);
      }
    });
  };

  const addWorkspace = (name: string, icon: string) => {
    const id = generateId();
    setWorkspaces(prev => [...prev, { id, name, icon }]);
    setActiveWorkspaceId(id);
    return id;
  };

  const deleteWorkspace = (id: string) => {
    if (id === 'default') {
      customAlert("Cannot delete the default workspace!");
      return;
    }
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId('default');
    }
    // Delete all pages associated with this workspace
    setPages(prev => prev.filter(p => p.workspaceId !== id));
  };

  const resetWorkspace = () => {
    localStorage.removeItem('asno_pages');
    localStorage.removeItem('asno_settings');
    localStorage.removeItem('asno_active_page');
    localStorage.removeItem('asno_workspaces');
    localStorage.removeItem('asno_active_workspace');
    loadDefaultWorkspace();
    setSettings(defaultSettings);
    setWorkspaces([{ id: 'default', name: 'Personal Workspace', icon: '💼' }]);
    setActiveWorkspaceId('default');
    setAiMessages([]);
    setAutomations([]);
  };

  return (
    <AppContext.Provider
      value={{
        pages,
        activePageId,
        setActivePageId,
        addPage,
        updatePage,
        deletePage,
        restorePage,
        permanentlyDeletePage,
        duplicatePage,
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        addWorkspace,
        deleteWorkspace,
        addBlock,
        updateBlock,
        deleteBlock,
        setBlocks,
        addDatabaseProperty,
        updateDatabaseProperty,
        deleteDatabaseProperty,
        addDatabaseRow,
        updateDatabaseRowCell,
        deleteDatabaseRow,
        updateDatabaseRowContent,
        addDatabaseView,
        updateDatabaseView,
        deleteDatabaseView,
        settings,
        updateSettings,
        searchOpen,
        setSearchOpen,
        settingsOpen,
        setSettingsOpen,
        composioConnectorsOpen,
        setComposioConnectorsOpen,
        aiSidebarOpen,
        setAiSidebarOpen,
        importOpen,
        setImportOpen,
        automationOpen,
        setAutomationOpen,
        canvasFlowOpen,
        setCanvasFlowOpen,
        meetingMindOpen,
        setMeetingMindOpen,
        uiForgeOpen,
        setUIForgeOpen,
        focusShieldOpen,
        setFocusShieldOpen,
        fullPageBlockId,
        setFullPageBlockId,
        recentItems,
        addRecentItem,
        automations,
        addAutomation,
        deleteAutomation,
        updateAutomation,
        aiMessages,
        setAiMessages,
        sendAiMessage,
        clearAiChat,
        loadTemplate,
        importWorkspace,
        exportWorkspace,
        resetWorkspace,
        dialog,
        customAlert,
        customConfirm,
        customPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
