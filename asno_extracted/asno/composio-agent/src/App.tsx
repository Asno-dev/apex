import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Wrench, AlertCircle, Loader2, Link as LinkIcon, X, Settings, Menu, MessageSquare } from 'lucide-react';
import { AI_PROVIDERS } from './providers';
import { loadProviderConfig, saveProviderConfig, ProviderConfig, loadActiveProviderId, saveActiveProviderId } from './config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCallsExecuted?: number;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI assistant connected to Composio. You can ask me to execute tasks. What would you like to do?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Layout state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Provider configs
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>(loadProviderConfig());
  const [activeProviderId, setActiveProviderId] = useState(loadActiveProviderId());

  useEffect(() => {
    saveActiveProviderId(activeProviderId);
  }, [activeProviderId]);



  // Connect Tool Modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [authConfigId, setAuthConfigId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableApps, setAvailableApps] = useState<{name: string, slug: string, logo?: string}[]>([]);
  const [searchApp, setSearchApp] = useState('');
  
  useEffect(() => {
    if (isConnectModalOpen && availableApps.length === 0) {
      fetch('/api/apps')
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          }
          throw new Error('Not a JSON response');
        })
        .then(data => {
          if (data.apps) setAvailableApps(data.apps);
        })
        .catch(err => console.error("Could not fetch apps", err));
    }
  }, [isConnectModalOpen]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [userId] = useState(() => {
    const stored = localStorage.getItem('composio_user_id');
    if (stored) return stored;
    const newId = 'user_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('composio_user_id', newId);
    return newId;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);



  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authConfigId.trim() || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, authConfigId: authConfigId.trim() }),
      });

      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`Integration issue: Received non-JSON response (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate connection');
      }

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(data.redirectUrl, 'ComposioConnect', `width=${width},height=${height},left=${left},top=${top}`);
      
      setIsConnectModalOpen(false);
      setIsConnecting(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const providerData = AI_PROVIDERS.find(p => p.id === activeProviderId);

      const activeConfig = configs[activeProviderId] || {
        apiKey: '',
        model: providerData?.models[0]?.id || 'gemini-2.5-flash',
        baseUrl: providerData?.defaultBaseUrl || '',
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userId,
          model: activeConfig.model,
          apiKey: activeConfig.apiKey,
          providerId: activeProviderId,
          baseUrl: activeConfig.baseUrl
        }),
      });

      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`Server encountered an error and returned non-JSON response (HTTP ${response.status}). Please check your API key quota or restart the applet.`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with the agent');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        toolCallsExecuted: data.toolCallsExecuted,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
    saveProviderConfig(configs);
    setIsSettingsOpen(false);
  };

  const handleConfigChange = (field: keyof ProviderConfig, value: string) => {
    setConfigs(prev => {
      const providerData = AI_PROVIDERS.find(p => p.id === activeProviderId);
      const current = prev[activeProviderId] || {
        id: activeProviderId,
        name: providerData?.name || '',
        type: providerData?.type || 'google',
        baseUrl: providerData?.defaultBaseUrl || '',
        apiKey: '',
        model: providerData?.models[0]?.id || ''
      };
      return {
        ...prev,
        [activeProviderId]: { ...current, [field]: value }
      };
    });
  };

  const providerDataForEditing = AI_PROVIDERS.find(p => p.id === activeProviderId);
  const editingConfig = configs[activeProviderId] || {
    id: activeProviderId,
    name: providerDataForEditing?.name || '',
    type: providerDataForEditing?.type || 'google',
    baseUrl: providerDataForEditing?.defaultBaseUrl || '',
    apiKey: '',
    model: providerDataForEditing?.models[0]?.id || ''
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} shrink-0`} >
        <div className="h-14 flex items-center px-4 border-b border-slate-200 w-64 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-medium">AI & Integrations</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 w-64">
           <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-2">Apps</div>
           
           <button
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium bg-indigo-50 text-indigo-700"
            >
              <MessageSquare className="w-4 h-4" />
              Chat Assistant
            </button>


           <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Integrations Config</div>
           <button
              onClick={() => setIsConnectModalOpen(true)}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Connect Tool (Generic)
            </button>
        </div>
        <div className="p-3 border-t border-slate-200 w-64 shrink-0">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings & Providers
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
           {/* Header */}
           <header className="h-14 border-b border-slate-200 px-4 flex items-center gap-3 shrink-0 bg-white">
             <button
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
             >
               <Menu className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-2 overflow-hidden flex-1">
               <select
                 value={activeProviderId}
                 onChange={(e) => setActiveProviderId(e.target.value)}
                 className="bg-transparent border border-slate-200 text-sm font-medium text-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[150px] truncate"
               >
                 {AI_PROVIDERS.map(p => (
                   <option key={p.id} value={p.id}>{p.name}</option>
                 ))}
               </select>

               <select
                 value={configs[activeProviderId]?.model || providerDataForEditing?.models[0]?.id || ''}
                 onChange={(e) => handleConfigChange('model', e.target.value)}
                 className="bg-slate-100 border border-slate-200 text-xs text-slate-600 font-mono rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px] truncate"
               >
                 {AI_PROVIDERS.find(p => p.id === activeProviderId)?.models.map(m => (
                   <option key={m.id} value={m.id}>{m.name}</option>
                 ))}
                 <option value="custom">Custom Model...</option>
               </select>
             </div>
           </header>

           {/* Messages Layout */}
           <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white">
             <div className="max-w-3xl mx-auto space-y-6">
               {error && (
                 <div className="bg-red-50 text-red-700 py-3 px-4 rounded-xl flex items-start gap-3 border border-red-100 mb-6">
                   <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                   <div>
                     <p className="font-medium text-sm">Error</p>
                     <p className="text-sm mt-1">{error}</p>
                     {error.includes("COMPOSIO_API_KEY") && (
                       <p className="text-sm border-t border-red-200 mt-2 pt-2">
                          Set your COMPOSIO_API_KEY in the backend.
                       </p>
                     )}
                     {error.includes("API key is missing") && (
                        <p className="text-sm border-t border-red-200 mt-2 pt-2">
                          Please click the Settings icon in the sidebar to configure the API key for {AI_PROVIDERS.find(p => p.id === activeProviderId)?.name}.
                        </p>
                     )}
                   </div>
                 </div>
               )}

               {messages.map((message) => (
                 <div
                   key={message.id}
                   className={`flex gap-4 ${
                     message.role === 'user' ? 'justify-end' : 'justify-start'
                   }`}
                 >
                   {message.role === 'assistant' && (
                     <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                       <Bot className="w-4 h-4" />
                     </div>
                   )}
                   
                   <div
                     className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 ${
                       message.role === 'user'
                         ? 'bg-slate-900 text-white rounded-br-none'
                         : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                     }`}
                   >
                     <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                       {message.content}
                     </div>
                     
                     {message.toolCallsExecuted ? (
                       <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[13px] text-slate-500 font-medium select-none">
                         <Wrench className="w-3.5 h-3.5" />
                         Executed {message.toolCallsExecuted} tool call{message.toolCallsExecuted > 1 ? 's' : ''}
                       </div>
                     ) : null}
                   </div>

                   {message.role === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                       <User className="w-4 h-4" />
                     </div>
                   )}
                 </div>
               ))}

               {isLoading && (
                 <div className="flex gap-4 justify-start">
                   <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                     <Loader2 className="w-4 h-4 animate-spin" />
                   </div>
                   <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center gap-2">
                     <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
             </div>
           </div>

           {/* Input Area */}
           <div className="p-4 shrink-0 bg-white">
             <form
               onSubmit={handleSubmit}
               className="max-w-3xl mx-auto relative flex items-end overflow-hidden flex-col bg-slate-50 border border-slate-300 rounded-2xl focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all shadow-sm"
             >
               <textarea
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSubmit(e);
                   }
                 }}
                 placeholder={`Send a message to ${AI_PROVIDERS.find(p => p.id === activeProviderId)?.name}...`}
                 className="w-full max-h-[200px] min-h-[60px] py-3.5 px-4 bg-transparent border-none resize-none focus:outline-none text-[15px] placeholder:text-slate-500"
                 rows={1}
               />
               <div className="flex justify-between items-center w-full px-3 pb-3 pt-1">
                  <div className="flex gap-2">
                     <button type="button" onClick={() => setIsConnectModalOpen(true)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors" title="Connect Tools">
                        <Wrench className="w-5 h-5" />
                     </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
             </form>
             <div className="max-w-3xl mx-auto mt-3 text-center">
               <p className="text-[12px] text-slate-500">
                 AI models can make mistakes. Consider verifying important information.
               </p>
             </div>
           </div>
         </div>

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-slate-900">Connect Integration</h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 shrink-0">
              <input
                type="text"
                placeholder="Search Composio apps (e.g. Gmail, Notion, Slack)..."
                value={searchApp}
                onChange={(e) => setSearchApp(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-sans text-sm transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              {availableApps.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                   <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                   <p className="text-sm font-medium">Loading supported apps...</p>
                 </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableApps
                    .filter(app => app.name.toLowerCase().includes(searchApp.toLowerCase()) || app.slug.toLowerCase().includes(searchApp.toLowerCase()))
                    .map(app => (
                      <button
                        key={app.slug}
                        onClick={() => {
                          setAuthConfigId(app.slug);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${authConfigId === app.slug ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/50' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                      >
                        {app.logo ? (
                          <img src={app.logo} alt={app.name} className="w-8 h-8 rounded shrink-0 object-contain bg-white" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-100 shrink-0 flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 truncate">{app.name}</h4>
                          <p className="text-xs text-slate-500 truncate">{app.slug}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl shrink-0">
               <button
                  onClick={handleConnect}
                  disabled={!authConfigId || isConnecting}
                  className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-slate-900/10"
                >
                  {isConnecting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                  ) : (
                    <><LinkIcon className="w-4 h-4" /> Connect {authConfigId ? availableApps.find(a => a.slug === authConfigId)?.name || authConfigId : 'App'} Account</>
                  )}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal - Provider Configuration */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Provider Form Editor */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 sticky top-0 bg-white/90 backdrop-blur">
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="font-semibold text-lg">{AI_PROVIDERS.find(p => p.id === activeProviderId)?.name} Configuration</span>
                </div>
                <div>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex-1">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Model Name</label>
                    <div className="flex flex-col gap-2">
                       {providerDataForEditing?.models && providerDataForEditing.models.length > 0 && (
                          <select 
                             value={providerDataForEditing.models.some((m: any) => m.id === editingConfig.model) ? editingConfig.model : 'custom'}
                             onChange={(e) => {
                                if (e.target.value !== 'custom') {
                                   handleConfigChange('model', e.target.value);
                                }
                             }}
                             className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 text-sm transition-all text-slate-700"
                          >
                             {providerDataForEditing.models.map((m: any) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                             ))}
                             <option value="custom">Custom Model</option>
                          </select>
                       )}
                       <input
                         type="text"
                         value={editingConfig.model}
                         placeholder="e.g. custom-model-id"
                         onChange={(e) => handleConfigChange('model', e.target.value)}
                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-mono text-sm transition-all"
                       />
                    </div>
                    <p className="mt-1.5 text-[13px] text-slate-500">The specific model identifier to target.</p>
                  </div>

                  {providerDataForEditing?.defaultBaseUrl !== undefined || providerDataForEditing?.needsBaseUrl ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Base URL</label>
                      <input
                        type="text"
                        value={editingConfig.baseUrl}
                        placeholder={providerDataForEditing?.defaultBaseUrl || "https://api.example.com/v1"}
                        onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-mono text-sm transition-all"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">API Key</label>
                    <input
                      type="password"
                      value={editingConfig.apiKey}
                      placeholder="Leave empty to use server default (if configured)"
                      onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-mono text-sm transition-all"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={handleSaveConfig}
                      className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 px-4 text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                    >
                       Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}



    </div>
  );
}
