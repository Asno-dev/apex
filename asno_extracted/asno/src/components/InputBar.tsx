import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowUp, 
  Plus, 
  Square, 
  Brain, 
  FileIcon, 
  X, 
  ChevronDown, 
  Check, 
  Copy, 
  Sparkles, 
  AlertCircle, 
  Download, 
  FileText, 
  FileSpreadsheet,
  Trash2,
  Sliders,
  Settings,
  ShieldCheck,
  Eye,
  Key,
  Mic,
  MicOff,
  Puzzle
} from 'lucide-react';
import { useApp } from '../AppContext';
import { getConnectedTools } from '../lib/composioTools';
import { ALL_MODELS, PROVIDER_LABELS, AIProvider, Model } from '../lib/aiClient';

export interface UploadedFile {
  name: string;
  type: string;
  url: string;
  data: string; // base64
}

interface InputBarProps {
  input: string;
  setInput: (val: string) => void;
  isGenerating: boolean;
  onSend: (files: UploadedFile[]) => void;
  onStop: () => void;
  
  model: string;
  setModel: (val: string) => void;
  provider: AIProvider;
  setProvider: (val: AIProvider) => void;

  planMode: boolean;
  setPlanMode: (val: boolean) => void;
  documentMode: boolean;
  setDocumentMode: (val: boolean) => void;
  excelMode: boolean;
  setExcelMode: (val: boolean) => void;

  currentError: string | null;
  setCurrentError: (val: string | null) => void;

  apiKeys: Record<AIProvider, string>;
  onOpenSettings: () => void;
  clearAiChat: () => void;
  hasHistory: boolean;
  activePageTitle?: string;

  isVoiceRecording?: boolean;
  onToggleVoiceRecording?: () => void;
}

export function InputBar({
  input,
  setInput,
  isGenerating,
  onSend,
  onStop,
  model,
  setModel,
  provider,
  setProvider,
  planMode,
  setPlanMode,
  documentMode,
  setDocumentMode,
  excelMode,
  setExcelMode,
  currentError,
  setCurrentError,
  apiKeys,
  onOpenSettings,
  clearAiChat,
  hasHistory,
  activePageTitle,
  isVoiceRecording = false,
  onToggleVoiceRecording
}: InputBarProps) {
  const { setComposioConnectorsOpen } = useApp();
  const connectedCount = getConnectedTools().length;

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  // Custom Dropdowns State
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);



  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActionsMenuOpen(false);
        setModelMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    let foundFile = false;
    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          foundFile = true;
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const result: UploadedFile = {
              name: `screenshot-${Date.now().toString().slice(-4)}.png`,
              type: file.type,
              url: URL.createObjectURL(file),
              data: (event.target?.result as string).split(',')[1] || '',
            };
            setFiles(prev => [...prev, result]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
    
    if (foundFile) return;

    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.length > 2000) {
      e.preventDefault();
      const fileName = `pasted-text-${Date.now().toString().slice(-4)}.txt`;
      const base64Data = btoa(unescape(encodeURIComponent(pastedText)));
      const blob = new Blob([pastedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const newFile: UploadedFile = {
        name: fileName,
        type: 'text/plain',
        url: url,
        data: base64Data
      };
      
      setFiles(prev => [...prev, newFile]);
    }
  };

  const handleCopyError = () => {
    if (!currentError) return;
    navigator.clipboard.writeText(currentError);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFixError = () => {
    if (!currentError) return;
    setInput(`I encountered this error in the editor. Please fix it:\n\n${currentError}`);
    setCurrentError(null);
    textareaRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(file => {
      const reader = new FileReader();
      return new Promise<UploadedFile>((resolve) => {
        reader.onload = (event) => {
          resolve({
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
            data: (event.target?.result as string).split(',')[1] || '',
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newFiles).then(results => {
      setFiles(prev => [...prev, ...results]);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (isGenerating) return;
    onSend(files);
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedModelObj = ALL_MODELS.find(m => m.id === model);
  const currentModelName = selectedModelObj?.name || model || 'Select Model';

  return (
    <div ref={containerRef} className="custom-input-bar-root-wrapper">
      <div className={`custom-input-bar-container ${planMode ? 'plan-border' : ''}`}>
        
        {/* currentError Fixer Banner */}
        {currentError && (
          <div className="custom-bar-banner error-banner">
            <div className="error-banner-left">
              <AlertCircle size={13} className="text-red-500" />
              <span className="error-label">Error:</span>
              <span className="error-message">{currentError}</span>
            </div>
            <div className="error-banner-right">
              <button onClick={handleCopyError} className="error-action-btn">
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handleFixError} className="error-action-btn fix-ai-btn">
                <Sparkles size={11} />
                <span>Fix with AI</span>
              </button>
              <button onClick={() => setCurrentError(null)} className="error-action-close">
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Mini Preview list */}
        {files.length > 0 && (
          <div className="custom-bar-mini-preview-grid">
            {files.map((file, i) => (
              <div 
                key={`${file.name}-${i}`}
                onClick={() => setPreviewFile(file)}
                className="custom-mini-preview-card"
              >
                {file.type.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="mini-preview-img" />
                ) : (
                  <div className="mini-preview-doc-placeholder">
                    <FileIcon size={20} className="text-gray-400" />
                  </div>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="mini-preview-remove-btn"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Textarea Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={isGenerating ? "AI is typing..." : "Ask Asno AI to write, structure, or improve..."}
          className="custom-bar-textarea"
          disabled={isGenerating}
          rows={Math.min(input.split('\n').length, 6)}
        />

        {/* Bottom Toolbar Control Bar */}
        <div className="custom-bar-toolbar">
          <div className="toolbar-left-controls">
            
            {/* Direct File Input Trigger */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="toolbar-circular-btn"
              title="Upload files/images"
            >
              <Plus size={16} />
            </button>

            {/* Composio Tools Trigger */}
            <button 
              type="button"
              onClick={() => setComposioConnectorsOpen(true)}
              className="toolbar-circular-btn composio-tools-btn"
              title="Composio Tool Connectors"
              style={{ position: 'relative' }}
            >
              <Puzzle size={16} />
              {connectedCount > 0 && (
                <span className="composio-badge">
                  {connectedCount}
                </span>
              )}
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              multiple 
            />



            {/* Model Selection Dropdown Trigger */}
            <div className="custom-dropdown-menu-wrapper">
              <button 
                type="button"
                onClick={() => setModelMenuOpen(!modelMenuOpen)}
                className="toolbar-text-selector-btn"
              >
                <span>{currentModelName}</span>
                <ChevronDown size={12} className="selector-chevron" />
              </button>

              {modelMenuOpen && (
                <div className="custom-menu-dropdown-content align-left scrollable-dropdown">
                  <div className="dropdown-section-header">Select AI Model</div>
                  <div className="dropdown-scroll-container">
                    {Object.entries(PROVIDER_LABELS).map(([provKey, provLabel]) => {
                      const providerModels = ALL_MODELS.filter(m => m.provider === provKey);
                      if (providerModels.length === 0) return null;

                      return (
                        <div key={provKey} className="dropdown-model-group">
                          <div className="dropdown-group-label">{provLabel}</div>
                          {providerModels.map(m => {
                            const isSelected = model === m.id;
                            const isKeyConfigured = !!apiKeys[m.provider as AIProvider];

                            return (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setModel(m.id);
                                  setProvider(m.provider);
                                  setModelMenuOpen(false);
                                }}
                                className={`dropdown-sub-item ${isSelected ? 'selected' : ''}`}
                              >
                                <div className="sub-item-label-container">
                                  {isSelected && <Check size={12} className="check-icon" />}
                                  <span className="model-id-label">{m.name}</span>
                                </div>
                                {!isKeyConfigured && m.provider !== 'gemini' && (
                                  <span className="key-missing-badge">No Key</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <div className="dropdown-divider" />
                  <button 
                    onClick={() => {
                      onOpenSettings();
                      setModelMenuOpen(false);
                    }}
                    className="dropdown-menu-item manage-keys-item"
                  >
                    <Settings size={13} className="text-gray-500" />
                    <span className="font-semibold text-xs text-gray-700">Configure API Keys...</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="toolbar-right-controls">
            {/* Voice Recording / Mic button */}
            {onToggleVoiceRecording && (
              <button 
                type="button"
                onClick={onToggleVoiceRecording}
                className={`toolbar-icon-shortcut-btn ${isVoiceRecording ? 'voice-recording-active' : ''}`}
                title={isVoiceRecording ? "Stop voice typing" : "Start voice typing"}
              >
                {isVoiceRecording ? <MicOff size={16} className="text-red-500 animate-pulse" /> : <Mic size={16} />}
              </button>
            )}

            {/* Send / Stop Generate Action Button */}
            <button
              onClick={isGenerating ? onStop : handleSend}
              disabled={!isGenerating && !input.trim() && files.length === 0}
              className={`toolbar-send-btn ${
                isGenerating 
                  ? 'generating-stop' 
                  : (input.trim() || files.length > 0) ? 'ready-to-send' : 'disabled'
              }`}
            >
              {isGenerating ? (
                <Square size={12} fill="currentColor" />
              ) : (
                <ArrowUp size={16} strokeWidth={2.5} style={{ transform: 'rotate(90deg)' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* File Attachment Fullscreen Preview Modal */}
      {previewFile && (
        <div 
          className="fixed-attachment-preview-backdrop"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="attachment-preview-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-modal-header">
              <div className="preview-modal-header-left">
                <FileIcon size={16} className="text-blue-500" />
                <div className="preview-meta-labels">
                  <h4>{previewFile.name}</h4>
                  <span>{previewFile.type || 'unknown type'}</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="preview-close-button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="preview-modal-body">
              {previewFile.type.startsWith('image/') ? (
                <div className="preview-image-container">
                  <img src={previewFile.url} alt={previewFile.name} />
                </div>
              ) : (
                <div className="preview-text-block">
                  {(() => {
                    try {
                      return decodeURIComponent(escape(atob(previewFile.data)));
                    } catch {
                      try {
                        return atob(previewFile.data);
                      } catch {
                        return "[Binary content - cannot display text preview]";
                      }
                    }
                  })()}
                </div>
              )}
            </div>

            <div className="preview-modal-footer">
              <a 
                href={previewFile.url} 
                download={previewFile.name}
                className="preview-download-link"
              >
                <Download size={13} />
                <span>Download</span>
              </a>
              <button 
                onClick={() => setPreviewFile(null)}
                className="preview-modal-dismiss-btn"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Bar CSS styles - Beautiful White Theme */}
      <style>{`
        .custom-input-bar-root-wrapper {
          width: 100%;
          font-family: var(--font-sans);
          position: relative;
        }

        .custom-input-bar-container {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02);
          border-radius: 24px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.2s ease-in-out;
        }

        .custom-input-bar-container:focus-within {
          border-color: var(--accent-color, #7053ff);
          box-shadow: 0 6px 24px rgba(112, 83, 255, 0.08), 0 2px 6px rgba(112, 83, 255, 0.04);
        }

        .custom-input-bar-container.plan-border {
          border-color: rgba(99, 102, 241, 0.4);
        }
        .custom-input-bar-container.plan-border:focus-within {
          border-color: rgba(99, 102, 241, 0.8);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.1);
        }

        /* Mode & Error banners */
        .custom-bar-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
          margin-bottom: 8px;
          animation: barSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .plan-banner {
          background: rgba(99, 102, 241, 0.06);
          color: #4f46e5;
        }
        .document-banner {
          background: rgba(59, 130, 246, 0.06);
          color: #2563eb;
        }
        .excel-banner {
          background: rgba(16, 185, 129, 0.06);
          color: #059669;
        }
        .error-banner {
          background: rgba(239, 68, 68, 0.06);
          color: #b91c1c;
          justify-content: space-between;
        }

        .banner-icon-spinner {
          animation: bannerSpin 2s infinite linear;
        }

        .error-banner-left {
          display: flex;
          align-items: center;
          gap: 6px;
          min-w-0;
          flex-grow: 1;
        }

        .error-label {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 9px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .error-message {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: var(--font-mono);
          font-size: 10px;
        }

        .error-banner-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .error-action-btn {
          border: none;
          background: rgba(0,0,0,0.05);
          color: #b91c1c;
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .error-action-btn:hover {
          background: rgba(0,0,0,0.1);
        }

        .fix-ai-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #b91c1c;
          color: #ffffff;
        }
        .fix-ai-btn:hover {
          background: #991b1b;
        }

        .error-action-close {
          border: none;
          background: transparent;
          color: #b91c1c;
          cursor: pointer;
          opacity: 0.6;
          display: flex;
          align-items: center;
        }
        .error-action-close:hover {
          opacity: 1;
        }

        /* Mini Preview Grid */
        .custom-bar-mini-preview-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 6px 8px;
          margin-bottom: 4px;
        }

        .custom-mini-preview-card {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .custom-mini-preview-card:hover {
          transform: scale(1.02);
        }

        .mini-preview-img {
          width: 100%;
          height: 100%;
          border-radius: 7px;
          object-fit: cover;
        }

        .mini-preview-doc-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #9ca3af;
        }

        .mini-preview-remove-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          z-index: 10;
        }
        .mini-preview-remove-btn:hover {
          background: rgba(239, 68, 68, 0.9);
        }

        /* Textarea styling */
        .custom-bar-textarea {
          width: 100%;
          min-height: 48px;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: #1f2937;
          font-size: 14px;
          font-family: inherit;
          padding: 8px 12px;
          line-height: 1.5;
        }
        .custom-bar-textarea::placeholder {
          color: #9ca3af;
        }
        .custom-bar-textarea:disabled {
          opacity: 0.6;
        }

        /* Toolbar Actions row */
        .custom-bar-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px 4px;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          margin-top: 4px;
        }

        .toolbar-left-controls, .toolbar-right-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toolbar-circular-btn {
          border: none;
          background: transparent;
          color: #4b5563;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .toolbar-circular-btn:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #1f2937;
        }

        .toolbar-icon-shortcut-btn {
          border: none;
          background: transparent;
          color: #4b5563;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .toolbar-icon-shortcut-btn:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #1f2937;
        }
        .toolbar-icon-shortcut-btn.voice-recording-active {
          background: #fef2f2;
          color: #ef4444;
        }
        .toolbar-icon-shortcut-btn.voice-recording-active:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .toolbar-text-selector-btn {
          border: none;
          background: transparent;
          color: #4b5563;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .toolbar-text-selector-btn:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #1f2937;
        }

        .selector-chevron {
          color: #9ca3af;
        }

        .toolbar-send-btn {
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toolbar-send-btn.ready-to-send {
          background: #0084ff;
          color: #ffffff;
        }
        .toolbar-send-btn.ready-to-send:hover {
          background: #0073e6;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 132, 255, 0.3);
        }

        .toolbar-send-btn.generating-stop {
          background: #fee2e2;
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.1);
        }
        .toolbar-send-btn.generating-stop:hover {
          background: #fecaca;
          transform: scale(1.05);
        }

        .toolbar-send-btn.disabled {
          background: #f3f4f6;
          color: #d1d5db;
          cursor: not-allowed;
        }

        /* Custom dropdown overlays */
        .custom-dropdown-menu-wrapper {
          position: relative;
        }

        .custom-menu-dropdown-content {
          position: absolute;
          bottom: calc(100% + 8px);
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.05);
          padding: 6px;
          z-index: 100;
          min-width: 230px;
          animation: dropdownOpen 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .custom-menu-dropdown-content.align-left {
          left: 0;
        }
        .custom-menu-dropdown-content.align-right {
          right: 0;
        }

        .custom-menu-dropdown-content.scrollable-dropdown {
          min-width: 250px;
          max-height: 380px;
          display: flex;
          flex-direction: column;
        }

        .dropdown-scroll-container {
          overflow-y: auto;
          flex-grow: 1;
          padding-right: 4px;
        }
        .dropdown-scroll-container::-webkit-scrollbar {
          width: 4px;
        }
        .dropdown-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 2px;
        }

        .dropdown-section-header {
          font-size: 10px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 6px 10px 4px;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.04);
          margin: 4px 0;
        }

        .dropdown-menu-item {
          border: none;
          background: transparent;
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .dropdown-menu-item:hover {
          background: #f3f4f6;
        }

        .dropdown-menu-item .menu-item-text-wrapper {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex-grow: 1;
        }

        .dropdown-menu-item .title {
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
        }
        .dropdown-menu-item .desc {
          font-size: 9px;
          color: #9ca3af;
          margin-top: 1px;
          font-family: var(--font-sans);
        }

        .dropdown-menu-item.danger-item {
          color: #dc2626;
        }
        .dropdown-menu-item.danger-item:hover {
          background: #fef2f2;
        }
        .dropdown-menu-item.danger-item .title {
          color: #dc2626;
        }

        .manage-keys-item {
          justify-content: center;
          align-items: center;
          padding: 6px;
        }

        /* Menu Switch widget */
        .menu-switch {
          width: 24px;
          height: 12px;
          border-radius: 6px;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .menu-switch.on {
          background: var(--accent-color, #7053ff);
        }
        .menu-switch.off {
          background: #e5e7eb;
        }
        .menu-switch::after {
          content: '';
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 1px;
          transition: transform 0.2s;
        }
        .menu-switch.on::after {
          transform: translatex(12px);
        }

        /* Model grouping and listing inside dropdown */
        .dropdown-model-group {
          padding: 4px 0;
        }

        .dropdown-group-label {
          font-size: 9px;
          font-weight: 700;
          color: #9ca3af;
          padding: 4px 10px;
          background: #f9fafb;
          border-radius: 4px;
          margin: 2px 6px;
        }

        .dropdown-sub-item {
          border: none;
          background: transparent;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px;
          font-size: 11px;
          font-family: var(--font-mono);
          cursor: pointer;
          text-align: left;
          color: #4b5563;
          transition: all 0.15s;
        }
        .dropdown-sub-item:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        .dropdown-sub-item.selected {
          background: rgba(112, 83, 255, 0.05);
          color: var(--accent-color, #7053ff);
          font-weight: 600;
        }

        .sub-item-label-container {
          display: flex;
          align-items: center;
          gap: 6px;
          min-w-0;
        }

        .check-icon {
          flex-shrink: 0;
        }

        .model-id-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .key-missing-badge {
          font-size: 8px;
          font-weight: 700;
          color: #d97706;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 4px;
          padding: 1px 4px;
          text-transform: uppercase;
          flex-shrink: 0;
          font-family: var(--font-sans);
        }

        /* Fullscreen attachment preview modal */
        .fixed-attachment-preview-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: barFadeIn 0.22s ease-out;
        }

        .attachment-preview-modal-box {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 16px;
          width: 100%;
          max-width: 700px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          animation: modalZoomIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .preview-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: #f9fafb;
        }

        .preview-modal-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-w-0;
        }

        .preview-meta-labels {
          display: flex;
          flex-direction: column;
          min-w-0;
        }
        .preview-meta-labels h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preview-meta-labels span {
          font-size: 9px;
          color: #9ca3af;
          text-transform: uppercase;
          font-family: var(--font-mono);
          margin-top: 1px;
        }

        .preview-close-button {
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
        }
        .preview-close-button:hover {
          background: rgba(0,0,0,0.06);
          color: #1f2937;
        }

        .preview-modal-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f3f4f6;
          min-height: 250px;
        }

        .preview-image-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          max-height: 55vh;
        }
        .preview-image-container img {
          max-width: 100%;
          max-height: 50vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .preview-text-block {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 8px;
          padding: 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.6;
          color: #374151;
          white-space: pre-wrap;
          max-height: 50vh;
          overflow-y: auto;
        }

        .preview-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 12px 18px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          background: #f9fafb;
        }

        .preview-download-link {
          background: var(--accent-color, #7053ff);
          color: #ffffff;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s;
        }
        .preview-download-link:hover {
          background: #5c43d8;
        }

        .preview-modal-dismiss-btn {
          background: #ffffff;
          color: #4b5563;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .preview-modal-dismiss-btn:hover {
          background: #f9fafb;
        }

        /* Animations */
        @keyframes dropdownOpen {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes barSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes barFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalZoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bannerSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }


      `}</style>
    </div>
  );
}
