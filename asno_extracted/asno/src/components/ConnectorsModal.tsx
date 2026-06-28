import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import {
  X,
  Settings,
  Search,
  Check,
  ExternalLink,
  Shield,
  Info,
  Key,
  Layers,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Lock,
  Plus,
  ArrowRight
} from 'lucide-react';
import {
  getComposioTools,
  ComposioTool,
  getComposioApiKey,
  saveComposioApiKey,
  getComposioUserId,
  getConnectedTools,
  removeConnectedTool,
  isToolConnected,
  composioGetConnectedAccounts,
  addConnectedTool
} from '../lib/composioTools';
import { AppDetailsView } from './AppDetailsView';

export const ConnectorsModal: React.FC = () => {
  const {
    composioConnectorsOpen,
    setComposioConnectorsOpen,
    customConfirm,
    customAlert
  } = useApp();

  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(getComposioApiKey());
  const [selectedTool, setSelectedTool] = useState<ComposioTool | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [connectedCount, setConnectedCount] = useState(getConnectedTools().length);

  // If modal is closed, reset state
  useEffect(() => {
    if (!composioConnectorsOpen) {
      setSelectedTool(null);
      setSearchQuery('');
      setShowSettings(false);
    } else {
      // Sync with server if key exists
      syncConnectedAccounts();
    }
  }, [composioConnectorsOpen]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveComposioApiKey(apiKey.trim());
    customAlert('Composio API key saved successfully.', 'API Key Updated');
    setShowSettings(false);
    syncConnectedAccounts();
  };

  const syncConnectedAccounts = async () => {
    const savedKey = getComposioApiKey();
    if (!savedKey) return;

    setSyncing(true);
    setErrorMsg(null);
    try {
      const accounts = await composioGetConnectedAccounts(savedKey, getComposioUserId());
      // Clear all local connected tools first, then add the active ones from the API
      // To prevent caching mismatch
      const tools = getComposioTools();
      
      // Update local storage status
      // Get current local ones
      const localConnected = getConnectedTools();
      
      // Remove all local ones first if they aren't returned by API (optional, let's merge them)
      accounts.forEach(acc => {
        if (acc.status === 'active' || acc.status === 'INITIATED') {
          // Find matching slug
          const match = tools.find(t => t.slug === acc.toolSlug.toLowerCase());
          if (match) {
            addConnectedTool(match.slug);
          }
        }
      });
      setConnectedCount(getConnectedTools().length);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to sync connected accounts with Composio backend.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (slug: string) => {
    const confirmed = await customConfirm(
      `Are you sure you want to disconnect ${slug}? This will remove the connection from Asno.`,
      'Disconnect Tool'
    );
    if (confirmed) {
      removeConnectedTool(slug);
      setConnectedCount(getConnectedTools().length);
      syncConnectedAccounts(); // Trigger fresh sync
    }
  };

  if (!composioConnectorsOpen) return null;

  const tools = getComposioTools();
  const connectedSlugs = getConnectedTools();

  // Filter tools
  const filteredTools = tools.filter(tool => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query);

    if (activeTab === 'manage') {
      return matchesSearch && connectedSlugs.includes(tool.slug);
    }
    return matchesSearch;
  });

  const hasApiKey = !!getComposioApiKey().trim();

  return (
    <div className="modal-overlay" onClick={() => setComposioConnectorsOpen(false)}>
      <div
        className="modal-content composio-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '95vw',
          padding: 0,
          height: '620px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        {selectedTool ? (
          <AppDetailsView
            tool={selectedTool}
            onBack={() => {
              setSelectedTool(null);
              setConnectedCount(getConnectedTools().length);
            }}
            onClose={() => setComposioConnectorsOpen(false)}
          />
        ) : (
          <>
            {/* Modal Header */}
            <div className="composio-modal-header">
              <div className="header-left">
                <Layers size={18} className="composio-brand-color" />
                <h3 className="heading-font">Composio Tool Connectors</h3>
              </div>
              <div className="header-actions">
                <button
                  className={`icon-btn ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  title="Composio API Settings"
                >
                  <Settings size={18} />
                </button>
                <button className="icon-btn close-btn" onClick={() => setComposioConnectorsOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* API Key settings panel */}
            {showSettings && (
              <div className="api-key-panel animate-slide-down">
                <form onSubmit={handleSaveApiKey} className="api-key-form">
                  <div className="form-group">
                    <label>
                      <Key size={14} />
                      <span>Composio API Key</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your Composio API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="composio-input"
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="composio-btn primary">
                      Save Key
                    </button>
                    <button
                      type="button"
                      className="composio-btn secondary"
                      onClick={() => setShowSettings(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                <div className="api-key-help">
                  <Info size={14} />
                  <span>
                    Get your key from the{' '}
                    <a
                      href="https://app.composio.dev/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Composio Dashboard <ExternalLink size={10} />
                    </a>
                    . This single key manages all connected tools.
                  </span>
                </div>
              </div>
            )}

            {/* Main Body */}
            {!hasApiKey ? (
              /* Onboarding Guide */
              <div className="composio-onboarding-view">
                <div className="onboarding-card">
                  <div className="onboarding-illustration">
                    <div className="icon-circle">
                      <Lock size={32} />
                    </div>
                  </div>
                  <h2>Connect to Composio</h2>
                  <p>
                    Composio integrates Asno with hundreds of external tools like Gmail, GitHub, Slack, and Google Calendar.
                    To start, paste your Composio API key below.
                  </p>
                  <form onSubmit={handleSaveApiKey} className="onboarding-form">
                    <input
                      type="password"
                      placeholder="Paste your API key (e.g. comp_xxxx...)"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="composio-input"
                      required
                    />
                    <button type="submit" className="composio-btn primary large">
                      <span>Connect API Key</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                  <div className="onboarding-footer">
                    <span>Don't have an API key?</span>
                    <a href="https://app.composio.dev/" target="_blank" rel="noopener noreferrer">
                      Get one for free at composio.dev <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Browsing Mode */
              <>
                {/* Search and Tabs Bar */}
                <div className="composio-subheader">
                  <div className="tabs-container">
                    <button
                      className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
                      onClick={() => setActiveTab('add')}
                    >
                      Add Connectors
                    </button>
                    <button
                      className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                      onClick={() => setActiveTab('manage')}
                    >
                      Manage Connectors
                      {connectedCount > 0 && <span className="tab-badge">{connectedCount}</span>}
                    </button>
                  </div>
                  <div className="search-and-sync">
                    <div className="search-wrapper">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search integration tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="composio-search-input"
                      />
                      {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <button
                      className={`sync-btn ${syncing ? 'syncing' : ''}`}
                      onClick={syncConnectedAccounts}
                      title="Sync connected tools"
                      disabled={syncing}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="composio-alert error">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Grid Content */}
                <div className="composio-grid-container">
                  {filteredTools.length === 0 ? (
                    <div className="empty-state">
                      <HelpCircle size={40} />
                      <p>No tools found matching your criteria.</p>
                      {activeTab === 'manage' && (
                        <button
                          className="composio-btn primary sm"
                          onClick={() => setActiveTab('add')}
                          style={{ marginTop: '12px' }}
                        >
                          Browse all tools
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="composio-tools-grid">
                      {filteredTools.map(tool => {
                        const isConnected = connectedSlugs.includes(tool.slug);
                        return (
                          <div
                            key={tool.slug}
                            className={`tool-card ${isConnected ? 'connected' : ''}`}
                            onClick={() => setSelectedTool(tool)}
                          >
                            <div className="tool-card-header">
                              <div className="tool-logo-container">
                                <img
                                  src={tool.logo}
                                  alt={tool.name}
                                  className="tool-logo"
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = 'none';
                                    const fallback = img.parentElement?.querySelector('.tool-logo-fallback');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                                <div className="tool-logo-fallback hidden">
                                  <Layers size={20} />
                                </div>
                              </div>
                              {isConnected && (
                                <span className="connected-tag">
                                  <Check size={10} />
                                  <span>Connected</span>
                                </span>
                              )}
                            </div>
                            <h4 className="tool-name">{tool.name}</h4>
                            <p className="tool-desc">{tool.description}</p>
                            <div className="tool-card-footer" onClick={(e) => e.stopPropagation()}>
                              <span className="tool-category">{tool.category}</span>
                              {isConnected ? (
                                <button
                                  className="disconnect-action-btn"
                                  onClick={() => handleDisconnect(tool.slug)}
                                  title="Disconnect Integration"
                                >
                                  <Trash2 size={13} />
                                </button>
                              ) : (
                                <button
                                  className="connect-action-btn"
                                  onClick={() => setSelectedTool(tool)}
                                >
                                  <Plus size={12} />
                                  <span>Connect</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
