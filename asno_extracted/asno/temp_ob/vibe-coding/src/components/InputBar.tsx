import React, { useRef, useState } from 'react';
import { ArrowUp, Plus, Square, Brain, FileIcon, X, LayoutGrid, MoreHorizontal, ChevronDown, Check, Globe, Copy, Sparkles, AlertCircle, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PluginsManager, TOOL_LOGOS } from './PluginsManager';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ALL_MODELS } from '../lib/constants';

const APP_KEYWORDS: Record<string, string> = {
  gmail: 'gmail', github: 'github', slack: 'slack', notion: 'notion', calendar: 'googlecalendar',
  docs: 'googledocs', sheets: 'googlesheets', linear: 'linear', discord: 'discord',
  spotify: 'spotify', youtube: 'youtube', whatsapp: 'whatsapp', zoom: 'zoom',
  figma: 'figma', canva: 'canva', salesforce: 'salesforce', hubspot: 'hubspot',
  trello: 'trello', asana: 'asana', clickup: 'clickup', stripe: 'stripe',
  reddit: 'reddit', linkedin: 'linkedin'
};

const getDisplayName = (id: string) => {
  const map: Record<string, string> = {
    gmail: 'Gmail', github: 'GitHub', slack: 'Slack', notion: 'Notion',
    googlecalendar: 'Google Calendar', googledocs: 'Google Docs',
    googlesheets: 'Google Sheets', linear: 'Linear', discord: 'Discord',
    spotify: 'Spotify', youtube: 'YouTube', whatsapp: 'WhatsApp',
    zoom: 'Zoom', figma: 'Figma', canva: 'Canva', salesforce: 'Salesforce',
    hubspot: 'HubSpot', trello: 'Trello', asana: 'Asana', clickup: 'ClickUp',
    stripe: 'Stripe', reddit: 'Reddit', linkedin: 'LinkedIn'
  };
  return map[id] || id;
};

interface UploadedFile {
  name: string;
  type: string;
  url: string;
  data: string;
}

interface InputBarProps {
  onSend: (overrideInput?: string, files?: UploadedFile[]) => void;
  className?: string;
}

export function InputBar({ onSend, className = '' }: InputBarProps) {
  const { 
    input, setInput, 
    isGenerating, 
    setIsGenerating, 
    connectedPlugins,
    model,
    setModel,
    provider,
    setProvider,
    enabledModels,
    pluginsOpen,
    setPluginsOpen,
    pluginsDefaultTab,
    setPluginsDefaultTab,
    isBrowserEnabled,
    setBrowserEnabled,
    currentError,
    setCurrentError,
    planMode,
    setPlanMode,
    documentMode,
    setDocumentMode,
    excelMode,
    setExcelMode
  } = useStore();

  const displayedModels = ALL_MODELS.filter(m => enabledModels.includes(m.id));
  const currentModelObj = ALL_MODELS.find(m => m.id === model);
  const currentModelName = currentModelObj?.name || model || 'Select Model';
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

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
    const errStr = typeof currentError === 'string' ? currentError : (currentError as any)?.message || String(currentError);
    navigator.clipboard.writeText(errStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFixError = () => {
    if (!currentError) return;
    const errStr = typeof currentError === 'string' ? currentError : (currentError as any)?.message || String(currentError);
    onSend(`I encountered this error in the preview. Please fix it:\n\n${errStr}`);
  };

  const handleIgnoreError = () => {
    setCurrentError(null);
  };

  const getPluginLogo = (pluginId: string) => {
    if (TOOL_LOGOS[pluginId]) return TOOL_LOGOS[pluginId];
    return `https://www.google.com/s2/favicons?domain=${pluginId}.com&sz=64`;
  };

  const words = input.toLowerCase().split(/\W+/);
  const detectedToolId = Object.entries(APP_KEYWORDS).find(([word]) => words.includes(word))?.[1];
  const showConnectPrompt = detectedToolId && !connectedPlugins[detectedToolId];

  const visiblePlugins = Object.keys(connectedPlugins).filter(p => connectedPlugins[p]);
  
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
    onSend(undefined, files);
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`relative w-full bg-[#2a2a2a]/95 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-1 ${planMode ? 'focus-within:ring-indigo-500/50' : 'focus-within:ring-white/15'} transition-all ${className}`}>
      <div className="flex flex-col">
        {planMode && (
          <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 text-[11px] font-medium text-indigo-300 border-b border-indigo-500/15">
            <Brain size={14} className="text-indigo-400 animate-pulse shrink-0" />
            <span><strong className="text-indigo-200">Plan Mode Enabled:</strong> Bud will strictly design/analyze a detailed plan to solve your request, with no files created or modified.</span>
          </div>
        )}
        {documentMode && (
          <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 text-[11px] font-medium text-blue-300 border-b border-blue-500/15">
            <FileText size={14} className="text-blue-400 animate-pulse shrink-0" />
            <span><strong className="text-blue-200">Document Mode Enabled:</strong> Agent will focus on generating professional multi-page Word documents with corporate formatting.</span>
          </div>
        )}
        {excelMode && (
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 text-[11px] font-medium text-emerald-300 border-b border-emerald-500/15">
            <FileSpreadsheet size={14} className="text-emerald-400 animate-pulse shrink-0" />
            <span><strong className="text-emerald-200">Excel Mode Enabled:</strong> Agent will focus on generating comprehensive spreadsheets with formulas, data analysis, and styled cells.</span>
          </div>
        )}
        {currentError && (
          <div className="flex items-center justify-between bg-red-950/80 px-4 py-2.5 text-xs font-medium text-red-200 border-b border-red-500/20 gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span className="font-bold text-red-400 uppercase tracking-wider text-[10px] shrink-0">Build Error:</span>
              <span className="font-mono text-[11px] text-red-200/80 truncate">
                {typeof currentError === 'string' ? currentError : (currentError as any)?.message || String(currentError)}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyError}
                className="flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 px-2 py-1 text-xs text-red-300 hover:text-white transition-colors"
                title="Copy full error to clipboard"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              
              <button
                type="button"
                onClick={handleFixError}
                disabled={isGenerating}
                className="flex items-center gap-1 rounded bg-red-500 hover:bg-red-400 px-2.5 py-1 text-xs font-bold text-white transition-colors disabled:opacity-50"
                title="Send error to builder to fix automatically"
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>Fix with AI</span>
              </button>
              
              <button
                type="button"
                onClick={handleIgnoreError}
                className="text-red-300/60 hover:text-white px-1.5 py-1 text-xs transition-colors"
                title="Ignore error and view preview"
              >
                Ignore
              </button>
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 pb-0">
            {files.map((file, i) => (
              <div 
                key={`${file.name}-${i}`} 
                onClick={() => setPreviewFile(file)}
                className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#161B22] cursor-pointer hover:border-white/20 transition-all"
              >
                {file.type.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                ) : (
                  <FileIcon size={24} className="text-gray-400" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute -right-1 -top-1 rounded-full bg-gray-800 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask anything"
          className={`w-full max-h-64 min-h-[60px] bg-transparent text-base text-gray-100 ${planMode ? 'placeholder-indigo-300/40' : 'placeholder-gray-400/60'} p-5 pb-2 resize-none focus:outline-none custom-scrollbar`}
          rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 8) : 1}
        />
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*,.pdf,.txt,.json,.csv,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
            
            <div className="flex items-center gap-2">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className={`flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-all outline-none hover:text-white ${planMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                    title="Actions & Settings"
                  >
                    <Plus size={14} className={planMode ? "rotate-45 transition-transform" : "transition-transform"} />
                  </button>
                </DropdownMenu.Trigger>
                
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="min-w-[220px] bg-[#1a1a1a] border border-white/10 rounded-xl p-1.5 shadow-2xl z-[155] mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
                    sideOffset={8}
                    align="start"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Actions
                    </div>
                    
                    <DropdownMenu.Item
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg cursor-pointer outline-none text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Plus size={14} className="text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs">Upload Files</span>
                        <span className="text-[10px] text-gray-400">Add documents or images</span>
                      </div>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={(e) => {
                        e.preventDefault(); // Keep menu open during toggle
                        setPlanMode(!planMode);
                      }}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none text-white/80 hover:bg-white/5 hover:text-white transition-colors mt-0.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Brain size={14} className={planMode ? "text-indigo-400 animate-pulse shrink-0" : "text-gray-400 shrink-0"} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">Plan Mode</span>
                          <span className="text-[10px] text-gray-400">Only design/analyze plan</span>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative shrink-0 ${planMode ? 'bg-indigo-600' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${planMode ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={(e) => {
                        e.preventDefault();
                        setDocumentMode(!documentMode);
                      }}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none text-white/80 hover:bg-white/5 hover:text-white transition-colors mt-0.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={14} className={documentMode ? "text-blue-400 animate-pulse shrink-0" : "text-gray-400 shrink-0"} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">Document Mode</span>
                          <span className="text-[10px] text-gray-400">Agent focuses on Word docs</span>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative shrink-0 ${documentMode ? 'bg-blue-600' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${documentMode ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={(e) => {
                        e.preventDefault();
                        setExcelMode(!excelMode);
                      }}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none text-white/80 hover:bg-white/5 hover:text-white transition-colors mt-0.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet size={14} className={excelMode ? "text-emerald-400 animate-pulse shrink-0" : "text-gray-400 shrink-0"} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">Excel Mode</span>
                          <span className="text-[10px] text-gray-400">Agent focuses on spreadsheets</span>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative shrink-0 ${excelMode ? 'bg-emerald-600' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${excelMode ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>




            </div>
            
            {/* Direct Model Selection */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1.5 px-2 py-1 transition-all outline-none text-gray-400 hover:text-gray-200">
                  <span className="text-[13px] font-medium">
                    {currentModelName}
                  </span>
                  <ChevronDown size={14} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[200px] bg-[#1a1a1a] border border-white/10 rounded-xl p-1.5 shadow-2xl z-[155] animate-in fade-in zoom-in-95 duration-100 mb-2"
                  sideOffset={8}
                >
                  <div className="px-2 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Select Model
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
                          ? 'bg-indigo-500/20 text-white border border-indigo-500/20' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {model === m.id && <Check size={14} className="text-indigo-400" />}
                        <span>{m.name}</span>
                      </div>
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="h-px bg-white/10 my-1.5" />
                  <DropdownMenu.Item
                    onClick={() => {
                      setPluginsDefaultTab('providers');
                      setPluginsOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer outline-none transition-colors text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <Plus size={14} />
                    <span>Add Model</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => isGenerating ? setIsGenerating(false) : handleSend()}
              disabled={!isGenerating && !input.trim() && files.length === 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isGenerating 
                  ? 'bg-transparent text-white/50 hover:text-white' 
                  : input.trim() || files.length > 0 ? 'bg-white text-black hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-700 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <Square size={14} fill="currentColor" />
              ) : (
                <ArrowUp size={16} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>
      </div>

      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="bg-[#1c1c1e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121214]">
              <div className="flex items-center gap-2.5 min-w-0">
                {previewFile.type?.startsWith('image/') ? (
                  <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-white/5">
                    <img src={previewFile.url} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <FileText size={16} className="text-gray-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{previewFile.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono uppercase leading-none mt-0.5">{previewFile.type || 'unknown type'}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#161618] custom-scrollbar min-h-0">
              {previewFile.type?.startsWith('image/') ? (
                <div className="flex items-center justify-center h-full max-h-[60vh] select-none">
                  <img 
                    src={previewFile.url} 
                    alt={previewFile.name} 
                    className="max-w-full max-h-[55vh] object-contain rounded-lg border border-white/10 shadow-lg" 
                  />
                </div>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0e0e10] p-4 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap select-text max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {(() => {
                    if (!previewFile.data) return "No content available.";
                    try {
                      // Decode Base64 safely
                      return decodeURIComponent(escape(atob(previewFile.data)));
                    } catch (e) {
                      try {
                        return atob(previewFile.data);
                      } catch (err) {
                        return "Unable to show binary content.";
                      }
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#121214] flex justify-end gap-3 shrink-0">
              <a 
                href={previewFile.url} 
                download={previewFile.name}
                className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold transition-all hover:bg-gray-200"
              >
                <Download size={14} />
                <span>Download File</span>
              </a>
              <button 
                onClick={() => setPreviewFile(null)}
                className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 px-4 py-2 text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
