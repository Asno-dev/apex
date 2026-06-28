import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { X, Palette, Type, ShieldAlert, Download, Upload, Briefcase, Trash2 } from 'lucide-react';
import { ThemeType, FontType } from '../types';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    settingsOpen,
    setSettingsOpen,
    exportWorkspace,
    importWorkspace,
    resetWorkspace,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    deleteWorkspace,
    customConfirm
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'appearance' | 'workspaces' | 'backup'>('appearance');

  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Workspaces local creation state
  const [newWsName, setNewWsName] = useState('');
  const [newWsIcon, setNewWsIcon] = useState('💼');

  if (!settingsOpen) return null;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportWorkspace());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `asno-workspace-backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess(false);

    if (!importText.trim()) {
      setImportError('Please paste backup JSON string.');
      return;
    }

    const success = importWorkspace(importText);
    if (success) {
      setImportSuccess(true);
      setImportText('');
      setTimeout(() => setSettingsOpen(false), 800);
    } else {
      setImportError('Invalid JSON format or corrupted schema.');
    }
  };

  const handleReset = async () => {
    const confirmed = await customConfirm('Are you absolutely sure you want to reset Asno? This wipes all nested pages and databases permanently.', 'Reset Workspace');
    if (confirmed) {
      resetWorkspace();
      setSettingsOpen(false);
    }
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    addWorkspace(newWsName.trim(), newWsIcon);
    setNewWsName('');
  };

  const themesList: { key: ThemeType; label: string; preview: string }[] = [
    { key: 'nord-light', label: 'Nord Light', preview: '#f8f9fa' },
    { key: 'obsidian-dark', label: 'Obsidian Dark', preview: '#0f1115' },
    { key: 'cyberpunk', label: 'Neon Cyberpunk', preview: '#0c0714' },
    { key: 'emerald-mint', label: 'Emerald Mint', preview: '#f4f9f6' },
    { key: 'sunset-rose', label: 'Sunset Rose', preview: '#fdf6f6' }
  ];

  const fontsList: { key: FontType; label: string; style: string }[] = [
    { key: 'inter', label: 'Inter Sans', style: 'sans-serif' },
    { key: 'outfit', label: 'Outfit Modern', style: 'sans-serif' },
    { key: 'serif', label: 'Playfair Serif', style: 'serif' },
    { key: 'mono', label: 'JetBrains Mono', style: 'monospace' }
  ];

  return (
    <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', width: '90vw', padding: 0, height: '520px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="heading-font" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Palette size={20} style={{ color: 'var(--accent-color)' }} />
            Workspace Settings
          </h3>
          <button className="hover-bg" style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', borderRadius: '4px' }} onClick={() => setSettingsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with Left Panel and Right Panel */}
        <div className="modal-body" style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>
          
          {/* Left Navigation Categories */}
          <div style={{ width: '220px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px' }}>
            <button
              className={`sidebar-menu-btn ${activeCategory === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveCategory('appearance')}
              style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
            >
              <Palette size={16} />
              <span>Appearance</span>
            </button>
            <button
              className={`sidebar-menu-btn ${activeCategory === 'workspaces' ? 'active' : ''}`}
              onClick={() => setActiveCategory('workspaces')}
              style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
            >
              <Briefcase size={16} />
              <span>Workspaces Manager</span>
            </button>
            <button
              className={`sidebar-menu-btn ${activeCategory === 'backup' ? 'active' : ''}`}
              onClick={() => setActiveCategory('backup')}
              style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
            >
              <Download size={16} />
              <span>Backup & Migration</span>
            </button>
          </div>

          {/* Right Content Panel */}
          <div style={{ flexGrow: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'var(--bg-primary)' }}>
            
            {activeCategory === 'appearance' && (
              <>
                {/* Themes Panel */}
                <div>
                  <span className="settings-section-title">
                    <Palette size={14} /> Theme Selector
                  </span>
                  <div className="themes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
                    {themesList.map((t) => (
                      <button
                        key={t.key}
                        className={`theme-selection-btn ${settings.theme === t.key ? 'active' : ''}`}
                        onClick={() => updateSettings({ theme: t.key })}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span className="theme-color-dot" style={{ backgroundColor: t.preview, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', border: '1px solid var(--border-color)' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Typography Panel */}
                <div>
                  <span className="settings-section-title">
                    <Type size={14} /> Editor Font Style
                  </span>
                  <div className="fonts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
                    {fontsList.map((f) => (
                      <button
                        key={f.key}
                        className={`font-selection-btn ${settings.font === f.key ? 'active' : ''}`}
                        onClick={() => updateSettings({ font: f.key })}
                        style={{ fontFamily: f.style, padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'workspaces' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span className="settings-section-title">
                  <Briefcase size={14} /> Workspaces Manager
                </span>

                {/* Create Workspace */}
                <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newWsIcon}
                    onChange={(e) => setNewWsIcon(e.target.value)}
                    placeholder="💼"
                    className="search-input"
                    style={{ width: '40px', textAlign: 'center', fontSize: '15px', padding: '6px' }}
                  />
                  <input
                    type="text"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    placeholder="Workspace Name (e.g. Work, Study)..."
                    className="search-input"
                    style={{ flexGrow: 1, padding: '6px 10px', fontSize: '13px' }}
                  />
                  <button type="submit" className="cover-btn" style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}>
                    + Create
                  </button>
                </form>

                {/* Workspaces Listing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>EXISTING WORKSPACES:</span>
                  {workspaces.map(w => {
                    const isActive = w.id === activeWorkspaceId;
                    return (
                      <div 
                        key={w.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '10px 14px', 
                          background: isActive ? 'var(--accent-light)' : 'var(--bg-secondary)', 
                          borderRadius: '8px', 
                          border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)' 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{w.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{w.name} {isActive && <small style={{ color: 'var(--accent-color)' }}>(Active)</small>}</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!isActive && (
                            <button 
                              className="cover-btn"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => setActiveWorkspaceId(w.id)}
                            >
                              Switch
                            </button>
                          )}
                          {w.id !== 'default' && (
                            <button 
                              className="cover-btn"
                              style={{ padding: '3px 8px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: 'none' }}
                              onClick={async () => {
                                const confirmed = await customConfirm(`Are you sure you want to delete "${w.name}"? This deletes all its pages permanently!`, 'Delete Workspace');
                                if (confirmed) {
                                  deleteWorkspace(w.id);
                                }
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory === 'backup' && (
              <>
                {/* Data Backup / Restore */}
                <div>
                  <span className="settings-section-title">
                    <Download size={14} /> Data Backup & Migration
                  </span>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button className="cover-btn" onClick={handleExport} style={{ flex: 1, justifyContent: 'center' }}>
                      <Download size={14} /> Export Backup File
                    </button>
                  </div>

                  <form onSubmit={handleImportSubmit} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Restore Backup (Paste backup JSON data):</span>
                    <textarea
                      className="block-code-textarea"
                      style={{ fontSize: '11px', minHeight: '80px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      placeholder='{"pages":[...], "settings":{...}}'
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                    {importError && <span style={{ fontSize: '12px', color: 'var(--danger-color)' }}>⚠️ {importError}</span>}
                    {importSuccess && <span style={{ fontSize: '12px', color: 'var(--success-color)' }}>✅ Import completed! Reloading...</span>}
                    <button type="submit" className="cover-btn" style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', alignSelf: 'flex-end' }}>
                      <Upload size={14} /> Import Backup
                    </button>
                  </form>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Reset App */}
                <div>
                  <span className="settings-section-title" style={{ color: 'var(--danger-color)' }}>
                    <ShieldAlert size={14} /> Danger Zone
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wipe cache database and load templates.</span>
                    <button 
                      className="cover-btn" 
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-color)', border: 'none' }}
                      onClick={handleReset}
                    >
                      Reset Asno Workspace
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      </div>

      <style>{`
        .settings-section-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};
