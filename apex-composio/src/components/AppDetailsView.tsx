import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ExternalLink,
  Shield,
  FileText,
  HeadphonesIcon,
  Globe,
  Tag,
  Zap,
  Code2,
  Link as LinkIcon,
  Check,
  Loader2,
  Info,
  Save,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  ComposioTool,
  getComposioApiKey,
  getComposioUserId,
  getToolConfigId,
  saveToolConfigId,
  composioInitiateConnection,
  composioCheckConnectionStatus,
  isToolConnected,
  addConnectedTool,
  removeConnectedTool,
  getConnectedTools,
  saveConnectionId,
  removeConnectionId,
  getToolActions,
} from '../lib/composioTools';

interface AppDetailsViewProps {
  tool: ComposioTool;
  onBack: () => void;
  onClose: () => void;
}

export const AppDetailsView: React.FC<AppDetailsViewProps> = ({ tool, onBack, onClose }) => {
  const [configId, setConfigId] = useState(getToolConfigId(tool.slug));
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connected, setConnected] = useState(isToolConnected(tool.slug));
  const [configSaved, setConfigSaved] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const handleSaveConfig = () => {
    saveToolConfigId(tool.slug, configId);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const startPolling = (connectionId: string) => {
    saveConnectionId(tool.slug, connectionId);
    setPollingStatus('Waiting for OAuth authorization...');

    const apiKey = getComposioApiKey();
    let attempts = 0;
    const maxAttempts = 30;

    pollRef.current = window.setInterval(async () => {
      attempts++;
      try {
        const status = await composioCheckConnectionStatus(apiKey, connectionId);
        if (status === 'ACTIVE' || status === 'connected' || status === 'SUCCESS') {
          if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          addConnectedTool(tool.slug);
          setConnected(true);
          setPollingStatus(null);
          removeConnectionId(tool.slug);
        } else if (status === 'FAILED' || status === 'failure' || status === 'ERROR') {
          if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          setConnectError('OAuth authorization failed or was denied.');
          setPollingStatus(null);
          removeConnectionId(tool.slug);
        } else {
          setPollingStatus(`Waiting for authorization (${attempts}s)...`);
        }
      } catch {
        // Polling error, keep trying
      }

      if (attempts >= maxAttempts) {
        if (pollRef.current !== null) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setPollingStatus(null);
        setConnectError('Connection timed out. Please try again and complete OAuth in the popup.');
        removeConnectionId(tool.slug);
      }
    }, 3000);
  };

  const handleDisconnect = () => {
    const confirmed = window.confirm(`Disconnect ${tool.name}?`);
    if (confirmed) {
      removeConnectedTool(tool.slug);
      setConnected(false);
      fetch('/api/apex/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedTools: getConnectedTools() }),
      }).catch(() => {});
    }
  };



  const handleConnect = async () => {
    const apiKey = getComposioApiKey();
    if (!apiKey) {
      setConnectError('Please set your Composio API key first (click the settings icon).');
      return;
    }

    const authId = configId.trim() || tool.slug;
    setIsConnecting(true);
    setConnectError(null);
    setPollingStatus(null);

    try {
      const result = await composioInitiateConnection(apiKey, getComposioUserId(), authId, tool.slug);

      if (result.redirectUrl) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          result.redirectUrl,
          'ComposioConnect',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );

        if (!popup || popup.closed) {
          setConnectError(
            'Popup was blocked. Please allow popups for this site, or open the link manually in a new tab.'
          );
          setPollingStatus(null);
          setIsConnecting(false);
          return;
        }

        if (result.connectionId) {
          startPolling(result.connectionId);
        } else {
          addConnectedTool(tool.slug);
          setConnected(true);
        }
      } else {
        addConnectedTool(tool.slug);
        setConnected(true);
      }
      fetch('/api/apex/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedTools: getConnectedTools() }),
      }).catch(() => {});
    } catch (err: any) {
      setConnectError(err.message || 'Failed to connect. Check your API key and config ID.');
      setPollingStatus(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const actions = getToolActions(tool.slug);

  return (
    <div className="composio-app-details">
      <div className="app-details-header">
        <button className="app-details-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Apps</span>
        </button>
        <button className="app-details-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="app-details-body">
        <div className="app-details-hero">
          <div className="app-details-logo-container">
            <img
              src={tool.logo}
              alt={tool.name}
              className="app-details-logo"
              crossOrigin="anonymous"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const fallback = img.parentElement?.querySelector('.app-details-logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="app-details-logo-fallback hidden">
              <Zap size={32} />
            </div>
          </div>
          <h2 className="app-details-name">{tool.name}</h2>
          <p className="app-details-description">{tool.description}</p>

          <div className="app-details-config-section">
            <label className="app-details-config-label">
              <LinkIcon size={13} />
              <span>Tool Config ID <span className="config-optional">(from your Composio dashboard)</span></span>
            </label>
            <div className="app-details-config-input-row">
              <input
                type="text"
                placeholder={`e.g. ${tool.slug}_config_xxxx or integration ID`}
                value={configId}
                onChange={(e) => setConfigId(e.target.value)}
                className="app-details-config-input"
              />
              <button
                className="app-details-config-save-btn"
                onClick={handleSaveConfig}
                title="Save config ID"
              >
                {configSaved ? <Check size={14} /> : <Save size={14} />}
              </button>
            </div>
          </div>

          {connected ? (
            <button
              className="app-details-disconnect-btn"
              onClick={handleDisconnect}
            >
              <Trash2 size={16} />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              className="app-details-connect-btn"
              onClick={handleConnect}
              disabled={isConnecting || pollingStatus !== null}
            >
              {isConnecting ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <LinkIcon size={16} />
                  <span>Connect</span>
                </>
              )}
            </button>
          )}

          {pollingStatus && (
            <div className="app-details-info polling">
              <Loader2 size={14} className="spinning" />
              <span>{pollingStatus}</span>
            </div>
          )}

          {connectError && (
            <div className="app-details-error">
              <AlertCircle size={14} />
              <span>{connectError}</span>
            </div>
          )}
        </div>

        <div className="app-details-section">
          <h3 className="app-details-section-title">
            <Zap size={15} />
            <span>Capabilities</span>
          </h3>
          <div className="app-details-capabilities">
            {tool.capabilities.map((cap, i) => (
              <span key={i} className="capability-chip">{cap}</span>
            ))}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="app-details-section">
            <h3 className="app-details-section-title">
              <Code2 size={15} />
              <span>Actions ({actions.length})</span>
            </h3>
            <div className="app-details-actions">
              {actions.map((action, i) => (
                <code key={i} className="action-slug">{action}</code>
              ))}
            </div>
          </div>
        )}

        <div className="app-details-section">
          <h3 className="app-details-section-title">
            <Info size={15} />
            <span>Information</span>
          </h3>
          <div className="app-details-info-table">
            <div className="info-row">
              <span className="info-label"><Tag size={13} /> Category</span>
              <span className="info-value">{tool.category}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Code2 size={13} /> Developer</span>
              <span className="info-value">{tool.developer}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Globe size={13} /> Website</span>
              <a href={tool.website} target="_blank" rel="noopener noreferrer" className="info-link">
                {tool.website.replace('https://', '')}
                <ExternalLink size={11} />
              </a>
            </div>
            <div className="info-row">
              <span className="info-label"><Tag size={13} /> Version</span>
              <span className="info-value">{tool.version}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Shield size={13} /> Privacy Policy</span>
              <a href={tool.privacyPolicy} target="_blank" rel="noopener noreferrer" className="info-link">
                View Privacy Policy
                <ExternalLink size={11} />
              </a>
            </div>
            <div className="info-row">
              <span className="info-label"><FileText size={13} /> Terms of Service</span>
              <a href={tool.termsOfService} target="_blank" rel="noopener noreferrer" className="info-link">
                View Terms
                <ExternalLink size={11} />
              </a>
            </div>
            <div className="info-row">
              <span className="info-label"><HeadphonesIcon size={13} /> Customer Support</span>
              <a href={tool.supportUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                Get Support
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
