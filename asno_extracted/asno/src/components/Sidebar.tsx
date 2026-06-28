import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Page } from '../types';
import { NewMenu } from './NewMenu';
import { 
  Search, 
  Settings, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Star, 
  Sparkles, 
  Trash2, 
  FileText, 
  Copy,
  FolderOpen,
  Layout, 
  ChevronsLeft,
  X,
  RefreshCw,
  BookOpen,
  Zap,
  Upload,
  Wrench,
  Terminal,
  Palette,
  Globe,
  Briefcase,
  PlusCircle,
  MessageSquarePlus,
  CheckSquare,
  Edit
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePageId,
    addPage,
    updatePage,
    deletePage,
    restorePage,
    permanentlyDeletePage,
    duplicatePage,
    settings,
    updateSettings,
    setSearchOpen,
    setSettingsOpen,
    aiSidebarOpen,
    setAiSidebarOpen,
    clearAiChat,
    loadTemplate,
    setImportOpen,
    setAutomationOpen,
    setCanvasFlowOpen,
    recentItems,
    addRecentItem,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    deleteWorkspace,
    customAlert
  } = useApp();

  const [trashOpen, setTrashOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'case-converter' | 'json-prettifier' | 'color-picker' | 'sandbox'>('case-converter');
  const [textInput, setTextInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonStatus, setJsonStatus] = useState('');
  const [selectedColor, setSelectedColor] = useState('#7053ff');
  const [sandboxCode, setSandboxCode] = useState('<h1>Hello Asno Sandbox</h1>\n<p>Edit this and see live changes below!</p>');
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceIcon, setNewWorkspaceIcon] = useState('💼');

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  // Resize handler
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    let newWidth = e.clientX;
    if (newWidth < 180) newWidth = 180;
    if (newWidth > 480) newWidth = 480;
    updateSettings({ sidebarWidth: newWidth });
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  // Toggle page collapse
  const toggleExpand = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const isInActiveWorkspace = (p: Page) => {
    return p.workspaceId === activeWorkspaceId || (!p.workspaceId && activeWorkspaceId === 'default');
  };

  // Build nested page tree
  const rootPages = pages.filter((p) => p.parentId === null && !p.isTrash && isInActiveWorkspace(p));
  const favoritePages = pages.filter((p) => p.isFavorite && !p.isTrash && isInActiveWorkspace(p));
  const trashPages = pages.filter((p) => p.isTrash && isInActiveWorkspace(p));

  // Render recursive page items
  const renderPageItem = (page: Page, depth: number = 0) => {
    const children = pages.filter((p) => p.parentId === page.id && !p.isTrash);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedPages[page.id];
    const isActive = activePageId === page.id;

    return (
      <div key={page.id} className="sidebar-page-node">
        <div 
          className={`sidebar-page-item ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          onClick={() => {
            setActivePageId(page.id);
            setAiSidebarOpen(false);
          }}
        >
          {/* Collapse toggle */}
          <button 
            className="sidebar-collapse-toggle" 
            onClick={(e) => toggleExpand(page.id, e)}
            style={{ opacity: hasChildren ? 1 : 0, pointerEvents: hasChildren ? 'auto' : 'none' }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Icon */}
          <span className="sidebar-page-icon">{page.icon || '📄'}</span>

          {/* Title */}
          <span className="sidebar-page-title">{page.title || 'Untitled'}</span>

          {/* Actions */}
          <div className="sidebar-page-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              className="sidebar-page-action-btn"
              title="Add a sub-page"
              onClick={() => {
                const subId = addPage(page.id);
                setExpandedPages(prev => ({ ...prev, [page.id]: true }));
              }}
            >
              <Plus size={14} />
            </button>
            <button 
              className="sidebar-page-action-btn"
              title="Duplicate"
              onClick={() => duplicatePage(page.id)}
            >
              <Copy size={14} />
            </button>
            <button 
              className="sidebar-page-action-btn delete"
              title="Move to Trash"
              onClick={() => deletePage(page.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Children list */}
        {hasChildren && isExpanded && (
          <div className="sidebar-page-children">
            {children.map((child) => renderPageItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div 
        ref={sidebarRef}
        className={`sidebar ${settings.sidebarCollapsed ? 'collapsed' : ''}`}
        style={{ width: settings.sidebarCollapsed ? 0 : `${settings.sidebarWidth}px` }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-user-section" style={{ flexGrow: 1, marginRight: '10px' }}>
            <select
              value={activeWorkspaceId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'create-new-ws') {
                  setIsCreatingWorkspace(true);
                } else {
                  setActiveWorkspaceId(val);
                }
              }}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name}
                </option>
              ))}
              <option value="create-new-ws">+ Create Workspace...</option>
            </select>
          </div>
          <button 
            className="sidebar-collapse-close-btn"
            onClick={() => setNewMenuOpen(true)}
            title="+ New — Pages, Blocks, Tools, Templates"
            style={{ flexShrink: 0, marginRight: '4px' }}
          >
            <Edit size={16} />
          </button>
          <button 
            className="sidebar-collapse-close-btn"
            onClick={() => updateSettings({ sidebarCollapsed: true })}
            style={{ flexShrink: 0 }}
          >
            <ChevronsLeft size={16} />
          </button>
        </div>

        {/* Action Panel Buttons */}
        <div className="sidebar-menu-actions">
          <button className="sidebar-menu-btn" onClick={() => setSearchOpen(true)}>
            <Search size={16} />
            <span>Search</span>
            <span className="sidebar-kbd">Ctrl+K</span>
          </button>
          <button className={`sidebar-menu-btn ${aiSidebarOpen ? 'active' : ''}`} onClick={() => {
            setAiSidebarOpen(!aiSidebarOpen);
            addRecentItem('asno-ai', 'Asno AI', '🤖', 'tool');
          }}>
            <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
            <span>Asno AI</span>
          </button>
          <button className="sidebar-menu-btn" onClick={() => {
            setToolsOpen(true);
            addRecentItem('tools-gallery', 'Tools Gallery', '🔧', 'tool');
          }}>
            <Wrench size={16} style={{ color: 'var(--accent-color)' }} />
            <span>Tools Gallery</span>
          </button>
          <button className="sidebar-menu-btn" onClick={() => {
            setTemplatesOpen(true);
            addRecentItem('templates', 'Templates', '📋', 'tool');
          }}>
            <BookOpen size={16} />
            <span>Templates</span>
          </button>
          <button className="sidebar-menu-btn" onClick={() => {
            setImportOpen(true);
            addRecentItem('import', 'Import File', '📥', 'tool');
          }}>
            <Upload size={16} />
            <span>Import File</span>
          </button>
          <button className="sidebar-menu-btn" onClick={() => {
            setAutomationOpen(true);
            addRecentItem('automations', 'Automations', '⚡', 'tool');
          }}>
            <Zap size={16} style={{ color: 'orange' }} />
            <span>Automations</span>
          </button>
        </div>

        <hr className="sidebar-divider" />

        {/* Recent Section — ponytail: last 10 items from localStorage */}
        {recentItems.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Recent</span>
            </div>
            <div className="sidebar-section-content">
              {recentItems.map(item => (
                <div
                  key={item.id}
                  className={`sidebar-page-item ${activePageId === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActivePageId(item.id);
                    setAiSidebarOpen(false);
                  }}
                >
                  <span className="sidebar-page-icon">{item.icon}</span>
                  <span className="sidebar-page-title">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favoritePages.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <Star size={12} style={{ fill: 'currentColor', marginRight: '6px' }} />
              <span>Favorites</span>
            </div>
            <div className="sidebar-section-content">
              {favoritePages.map((page) => (
                <div 
                  key={`fav-${page.id}`} 
                  className={`sidebar-page-item ${activePageId === page.id ? 'active' : ''}`}
                  onClick={() => {
                    setActivePageId(page.id);
                    setAiSidebarOpen(false);
                  }}
                >
                  <span className="sidebar-page-icon">{page.icon || '📄'}</span>
                  <span className="sidebar-page-title">{page.title || 'Untitled'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pages Section */}
        <div className="sidebar-section" style={{ flexGrow: 1, overflowY: 'auto' }}>
          <div className="sidebar-section-header">
            <span>Private Pages</span>
            <button 
              className="sidebar-add-page-btn" 
              title="Add a page"
              onClick={() => addPage(null)}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="sidebar-section-content">
            {rootPages.map((page) => renderPageItem(page, 0))}
            {rootPages.length === 0 && (
              <div className="sidebar-empty-state">No pages created yet.</div>
            )}
          </div>
        </div>

        {/* Trash & Settings Panel Toggle */}
        <div className="sidebar-section-trash" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', padding: '10px' }}>
          <button className="sidebar-menu-btn" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          <button className="sidebar-menu-btn trash" onClick={() => setTrashOpen(!trashOpen)}>
            <Trash2 size={16} />
            <span>Trash ({trashPages.length})</span>
          </button>
          
          {trashOpen && (
            <div className="sidebar-trash-dropdown glass">
              <div className="sidebar-trash-header">
                <span>Trash bin</span>
                <button onClick={() => setTrashOpen(false)}><X size={14} /></button>
              </div>
              <div className="sidebar-trash-body">
                {trashPages.map((page) => (
                  <div key={`trash-${page.id}`} className="sidebar-trash-item">
                    <span className="sidebar-trash-icon">{page.icon || '📄'}</span>
                    <span className="sidebar-trash-title" title={page.title}>{page.title || 'Untitled'}</span>
                    <div className="sidebar-trash-actions">
                      <button 
                        className="sidebar-trash-action-btn restore" 
                        title="Restore page"
                        onClick={() => restorePage(page.id)}
                      >
                        <RefreshCw size={12} />
                      </button>
                      <button 
                        className="sidebar-trash-action-btn delete" 
                        title="Delete permanently"
                        onClick={() => permanentlyDeletePage(page.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {trashPages.length === 0 && (
                  <div className="sidebar-trash-empty">Trash is empty</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resize Handle */}
        <div className="sidebar-resize-handle" onMouseDown={startResizing} />
      </div>

      {/* Templates Selector Dialog */}
      {templatesOpen && (
        <div className="modal-overlay" onClick={() => setTemplatesOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="heading-font" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} style={{ color: 'var(--accent-color)' }} />
                Template Gallery
              </h3>
              <button className="hover-bg" style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', borderRadius: '4px' }} onClick={() => setTemplatesOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Choose a pre-designed layout to jump-start your writing or task organization.
              </p>
              <div 
                className="template-card hover-bg"
                onClick={() => { loadTemplate('journal'); setTemplatesOpen(false); }}
              >
                <span className="template-card-icon">📔</span>
                <div>
                  <h4 style={{ fontWeight: 600 }}>Daily Journal</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Morning quotes, gratitude lists, daily focus, and evening reviews.</span>
                </div>
              </div>
              <div 
                className="template-card hover-bg"
                onClick={() => { loadTemplate('class'); setTemplatesOpen(false); }}
              >
                <span className="template-card-icon">🎓</span>
                <div>
                  <h4 style={{ fontWeight: 600 }}>Lecture Notes</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Class reminders, course syllabi, algorithms pseudocode blocks, toggles.</span>
                </div>
              </div>
              <div 
                className="template-card hover-bg"
                onClick={() => { loadTemplate('blank'); setTemplatesOpen(false); }}
              >
                <span className="template-card-icon">📄</span>
                <div>
                  <h4 style={{ fontWeight: 600 }}>Blank Notebook</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>A pristine, empty canvas to capture thoughts instantly.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Gallery Dialog */}
      {toolsOpen && (
        <div className="modal-overlay" onClick={() => setToolsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', width: '90vw', padding: 0, height: '550px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="heading-font" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Wrench size={20} style={{ color: 'var(--accent-color)' }} />
                Asno Tools Gallery
              </h3>
              <button className="hover-bg" style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', borderRadius: '4px' }} onClick={() => setToolsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Body with Left Sidebar Navigation */}
            <div className="modal-body" style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>
              {/* Left sidebar inside tools modal */}
              <div style={{ width: '220px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px' }}>
                <button
                  className={`sidebar-menu-btn ${activeTool === 'case-converter' ? 'active' : ''}`}
                  onClick={() => setActiveTool('case-converter')}
                  style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                >
                  <FileText size={16} />
                  <span>Case Converter</span>
                </button>
                <button
                  className={`sidebar-menu-btn ${activeTool === 'json-prettifier' ? 'active' : ''}`}
                  onClick={() => setActiveTool('json-prettifier')}
                  style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                >
                  <Terminal size={16} />
                  <span>JSON Prettifier</span>
                </button>
                <button
                  className={`sidebar-menu-btn ${activeTool === 'color-picker' ? 'active' : ''}`}
                  onClick={() => setActiveTool('color-picker')}
                  style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                >
                  <Palette size={16} />
                  <span>Color Generator</span>
                </button>
                <button
                  className={`sidebar-menu-btn ${activeTool === 'sandbox' ? 'active' : ''}`}
                  onClick={() => setActiveTool('sandbox')}
                  style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                >
                  <Globe size={16} />
                  <span>HTML Preview Box</span>
                </button>
              </div>

              {/* Right content display panel */}
              <div style={{ flexGrow: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-primary)' }}>
                {activeTool === 'case-converter' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>Text Case Converter</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quickly convert text casing (UPPERCASE, lowercase, Title Case, Sentence Case).</span>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste or type text to convert..."
                      style={{ flexGrow: 1, minHeight: '200px', width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontSize: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="cover-btn" onClick={() => setTextInput(textInput.toUpperCase())}>UPPERCASE</button>
                      <button className="cover-btn" onClick={() => setTextInput(textInput.toLowerCase())}>lowercase</button>
                      <button className="cover-btn" onClick={() => setTextInput(textInput.replace(/\b\w/g, c => c.toUpperCase()))}>Title Case</button>
                      <button className="cover-btn" onClick={() => setTextInput(textInput.charAt(0).toUpperCase() + textInput.slice(1).toLowerCase())}>Sentence Case</button>
                      <button 
                        className="cover-btn" 
                        style={{ marginLeft: 'auto', background: 'var(--accent-color)', color: '#fff', border: 'none' }}
                        onClick={() => {
                          navigator.clipboard.writeText(textInput);
                          customAlert('Converted text copied to clipboard!');
                        }}
                      >
                        Copy Result
                      </button>
                    </div>
                  </div>
                )}

                {activeTool === 'json-prettifier' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>JSON Prettifier & Validator</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Validate, beautify format, and minify JSON markup strings.</span>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='{"name":"Asno","nested":{"status":"active"}}'
                      style={{ flexGrow: 1, minHeight: '200px', width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        className="cover-btn"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(jsonInput);
                            setJsonInput(JSON.stringify(parsed, null, 2));
                            setJsonStatus('✅ Valid JSON structure!');
                          } catch (err: any) {
                            setJsonStatus('❌ Invalid JSON: ' + err.message);
                          }
                        }}
                      >
                        Format Prettify
                      </button>
                      <button 
                        className="cover-btn"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(jsonInput);
                            setJsonInput(JSON.stringify(parsed));
                            setJsonStatus('✅ Valid JSON structure!');
                          } catch (err: any) {
                            setJsonStatus('❌ Invalid JSON: ' + err.message);
                          }
                        }}
                      >
                        Minify JSON
                      </button>
                      <button 
                        className="cover-btn"
                        onClick={() => {
                          try {
                            JSON.parse(jsonInput);
                            setJsonStatus('✅ Valid JSON structure!');
                          } catch (err: any) {
                            setJsonStatus('❌ Invalid JSON: ' + err.message);
                          }
                        }}
                      >
                        Validate JSON
                      </button>
                      <span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '8px' }}>{jsonStatus}</span>
                      <button 
                        className="cover-btn" 
                        style={{ marginLeft: 'auto', background: 'var(--accent-color)', color: '#fff', border: 'none' }}
                        onClick={() => {
                          navigator.clipboard.writeText(jsonInput);
                          customAlert('JSON copied to clipboard!');
                        }}
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                )}

                {activeTool === 'color-picker' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>Pastel & Flat Color Generator</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choose color palettes and copy codes in HSL, RGB, and Hex codes.</span>
                    
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        value={selectedColor} 
                        onChange={(e) => setSelectedColor(e.target.value)} 
                        style={{ width: '64px', height: '64px', border: 'none', borderRadius: '12px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>Current Value: <strong style={{ color: selectedColor }}>{selectedColor.toUpperCase()}</strong></span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drag the picker color to live generate styles.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>HEX:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{selectedColor.toUpperCase()}</span>
                        <button className="cover-btn" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => { navigator.clipboard.writeText(selectedColor); customAlert('Hex color code copied!'); }}>Copy</button>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>RGB:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                          {(() => {
                            const hex = selectedColor.replace('#', '');
                            const r = parseInt(hex.substring(0, 2), 16);
                            const g = parseInt(hex.substring(2, 4), 16);
                            const b = parseInt(hex.substring(4, 6), 16);
                            return `rgb(${r}, ${g}, ${b})`;
                          })()}
                        </span>
                        <button className="cover-btn" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => {
                          const hex = selectedColor.replace('#', '');
                          const r = parseInt(hex.substring(0, 2), 16);
                          const g = parseInt(hex.substring(2, 4), 16);
                          const b = parseInt(hex.substring(4, 6), 16);
                          navigator.clipboard.writeText(`rgb(${r}, ${g}, ${b})`);
                          customAlert('RGB code copied!');
                        }}>Copy</button>
                      </div>
                    </div>

                    {/* Presets */}
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>PRESET ACCENTS:</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', marginTop: '8px' }}>
                        {['#5e81ac', '#7053ff', '#ff007f', '#10b981', '#ec4899', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e', '#10b981', '#84fab0', '#fa709a', '#a1c4fd'].map((c, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedColor(c)}
                            style={{ aspectRatio: '1', borderRadius: '50%', backgroundColor: c, border: selectedColor === c ? '3px solid var(--text-primary)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTool === 'sandbox' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>Live Sandbox Preview</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Render, debug, and run live interactive web components.</span>
                    <textarea
                      value={sandboxCode}
                      onChange={(e) => setSandboxCode(e.target.value)}
                      placeholder="Type HTML here..."
                      style={{ height: '140px', width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                    />
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '-6px' }}>SANDBOX OUTPUT RENDERER:</div>
                    <iframe 
                      srcDoc={sandboxCode} 
                      title="HTML Preview box sandbox output"
                      style={{ flexGrow: 1, minHeight: '160px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff' }} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Custom Workspace Creation Modal */}
      {isCreatingWorkspace && (
        <div className="modal-overlay" onClick={() => setIsCreatingWorkspace(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="heading-font" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} style={{ color: 'var(--accent-color)' }} />
                Create Workspace
              </h3>
              <button 
                className="hover-bg" 
                style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', borderRadius: '4px' }} 
                onClick={() => setIsCreatingWorkspace(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Workspace Name</label>
                <input 
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. Personal, Study, Work"
                  className="search-input"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Select Icon / Emoji</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text"
                    value={newWorkspaceIcon}
                    onChange={(e) => setNewWorkspaceIcon(e.target.value)}
                    className="search-input"
                    style={{
                      width: '45px',
                      padding: '8px',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '16px',
                      textAlign: 'center'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['💼', '🏠', '🚀', '🎯', '📚', '🧠', '🎨', '💻', '💡', '🌱'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewWorkspaceIcon(emoji)}
                        style={{
                          fontSize: '18px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        className="hover-bg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button"
                  className="cover-btn" 
                  onClick={() => setIsCreatingWorkspace(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="cover-btn" 
                  style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}
                  onClick={() => {
                    if (newWorkspaceName.trim()) {
                      addWorkspace(newWorkspaceName.trim(), newWorkspaceIcon);
                      setNewWorkspaceName('');
                      setNewWorkspaceIcon('💼');
                      setIsCreatingWorkspace(false);
                    }
                  }}
                  disabled={!newWorkspaceName.trim()}
                >
                  Create Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified + New Menu — search + vertical listing of all blocks, pages, tools, templates */}
      {newMenuOpen && <NewMenu onClose={() => setNewMenuOpen(false)} />}

      {/* Styled JSX/CSS just for sidebar specific components */}
      <style>{`
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
        }
        .sidebar-user-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar-avatar {
          width: 28px;
          height: 28px;
          border-radius: var(--border-radius-md);
          background-color: var(--accent-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }
        .sidebar-username {
          font-weight: 600;
          font-size: 14px;
        }
        .sidebar-collapse-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--border-radius-sm);
        }
        .sidebar-collapse-close-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .sidebar-menu-actions {
          padding: 0 10px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sidebar-menu-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
          text-align: left;
        }
        .sidebar-menu-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .sidebar-menu-btn.active {
          background-color: var(--accent-light);
          color: var(--text-primary);
        }
        .sidebar-kbd {
          margin-left: auto;
          font-size: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 2px 5px;
          border-radius: 4px;
          color: var(--text-muted);
        }
        .sidebar-divider {
          border: 0;
          height: 1px;
          background-color: var(--border-color);
          margin: 4px 16px 12px;
        }
        .sidebar-section {
          padding: 0 8px;
          margin-bottom: 20px;
        }
        .sidebar-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .sidebar-section-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sidebar-add-page-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: var(--border-radius-sm);
        }
        .sidebar-add-page-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .sidebar-page-node {
          display: flex;
          flex-direction: column;
        }
        .sidebar-page-item {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: background-color 0.15s ease;
          position: relative;
        }
        .sidebar-page-item:hover {
          background-color: var(--bg-tertiary);
        }
        .sidebar-page-item.active {
          background-color: var(--bg-tertiary);
          font-weight: 500;
          border-left: 2px solid var(--accent-color);
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        .sidebar-collapse-toggle {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: var(--border-radius-sm);
          margin-right: 4px;
        }
        .sidebar-collapse-toggle:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .sidebar-page-icon {
          margin-right: 8px;
          font-size: 15px;
          display: flex;
          align-items: center;
        }
        .sidebar-page-title {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-grow: 1;
        }
        .sidebar-page-actions {
          display: none;
          gap: 2px;
          position: absolute;
          right: 8px;
          background: linear-gradient(to right, transparent, var(--bg-tertiary) 25%);
          padding-left: 16px;
        }
        .sidebar-page-item:hover .sidebar-page-actions {
          display: flex;
        }
        .sidebar-page-action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: var(--border-radius-sm);
        }
        .sidebar-page-action-btn:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .sidebar-page-action-btn.delete:hover {
          color: var(--danger-color);
        }
        .sidebar-empty-state {
          padding: 8px 12px;
          font-size: 12px;
          color: var(--text-placeholder);
          font-style: italic;
        }
        .sidebar-section-trash {
          padding: 10px;
          border-top: 1px solid var(--border-color);
          position: relative;
        }
        .sidebar-menu-btn.trash {
          color: var(--text-muted);
        }
        .sidebar-menu-btn.trash:hover {
          color: var(--danger-color);
        }
        .sidebar-trash-dropdown {
          position: absolute;
          bottom: 44px;
          left: 10px;
          right: 10px;
          border-radius: var(--border-radius-lg);
          padding: 8px;
          max-height: 250px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          z-index: 50;
        }
        .sidebar-trash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 6px;
        }
        .sidebar-trash-header button {
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--text-muted);
        }
        .sidebar-trash-body {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sidebar-trash-item {
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: var(--border-radius-md);
          font-size: 13px;
        }
        .sidebar-trash-item:hover {
          background-color: var(--bg-tertiary);
        }
        .sidebar-trash-icon {
          margin-right: 6px;
        }
        .sidebar-trash-title {
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 8px;
        }
        .sidebar-trash-actions {
          display: flex;
          gap: 4px;
        }
        .sidebar-trash-action-btn {
          border: none;
          background: transparent;
          padding: 4px;
          cursor: pointer;
          border-radius: var(--border-radius-sm);
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .sidebar-trash-action-btn:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .sidebar-trash-action-btn.delete:hover {
          color: var(--danger-color);
        }
        .sidebar-trash-empty {
          padding: 12px;
          text-align: center;
          font-size: 12px;
          color: var(--text-placeholder);
          font-style: italic;
        }
        .template-card {
          display: flex;
          gap: 12px;
          padding: 10px;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          align-items: flex-start;
        }
        .template-card-icon {
          font-size: 20px;
          background-color: var(--bg-tertiary);
          width: 38px;
          height: 38px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
};
