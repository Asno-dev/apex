import React, { useState, useRef, useEffect } from 'react';
import { useApp, generateId } from '../AppContext';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  X, 
  ChevronsRight,
  Paperclip, 
  Mic, 
  MicOff, 
  StopCircle, 
  FileText, 
  ListTodo, 
  Languages, 
  PenTool, 
  FileUp, 
  AlertCircle,
  HelpCircle,
  Plus,
  Sliders,
  Gift,
  ArrowUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { InputBar, UploadedFile } from './InputBar';
import { callAiAPI, PROVIDER_LABELS, AIProvider } from '../lib/aiClient';

const formatMarkdown = (text: string) => {
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Bold: **text**
  escaped = escaped.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  
  // Italic: *text* or _text_
  escaped = escaped.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
  
  // Inline code: `code`
  escaped = escaped.replace(/`(.*?)`/g, '<code style="background: rgba(255, 255, 255, 0.08); padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #10b981;">$1</code>');
  
  return { __html: escaped };
};

export const AISidebar: React.FC = () => {
  const {
    pages,
    activePageId,
    aiSidebarOpen,
    setAiSidebarOpen,
    aiMessages,
    setAiMessages,
    clearAiChat,
    customAlert
  } = useApp();

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(true);
  
  // Settings & Keys Configurations States
  const [showKeysConfig, setShowKeysConfig] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const [provider, setProvider] = useState<AIProvider>(() => {
    return (localStorage.getItem('ai_studio_provider') as AIProvider) || 'gemini';
  });
  const [model, setModel] = useState<string>(() => {
    return localStorage.getItem('ai_studio_model') || 'gemini-3.5-flash';
  });
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>(() => {
    const keys: Partial<Record<AIProvider, string>> = {};
    const providers: AIProvider[] = ['gemini', 'openai', 'anthropic', 'groq', 'xai', 'deepseek', 'mistral', 'cohere', 'together', 'perplexity', 'huggingface', 'ollama', 'lmstudio', 'openrouter', 'moonshot', 'hyperbolic', 'github', 'bedrock', 'openailike', 'aicredits'];
    providers.forEach(p => {
      keys[p] = localStorage.getItem(`ai_studio_key_${p}`) || (p === 'gemini' ? 'temporary' : '');
    });
    return keys as Record<AIProvider, string>;
  });

  const [planMode, setPlanMode] = useState<boolean>(() => {
    return localStorage.getItem('ai_studio_plan_mode') === 'true';
  });
  const [documentMode, setDocumentMode] = useState<boolean>(() => {
    return localStorage.getItem('ai_studio_document_mode') === 'true';
  });
  const [excelMode, setExcelMode] = useState<boolean>(() => {
    return localStorage.getItem('ai_studio_excel_mode') === 'true';
  });
  const [currentError, setCurrentError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const activePage = pages.find(p => p.id === activePageId);

  useEffect(() => {
    if (aiSidebarOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiSidebarOpen]);

  // Clean up recording and timers on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleProviderChange = (p: AIProvider) => {
    localStorage.setItem('ai_studio_provider', p);
    setProvider(p);
  };

  const handleModelChange = (m: string) => {
    localStorage.setItem('ai_studio_model', m);
    setModel(m);
  };

  const updateApiKey = (p: AIProvider, val: string) => {
    localStorage.setItem(`ai_studio_key_${p}`, val);
    setApiKeys(prev => ({ ...prev, [p]: val }));
  };

  const toggleKeyVisibility = (p: string) => {
    setVisibleKeys(prev => ({ ...prev, [p]: !prev[p] }));
  };

  // Handles starting or stopping the Web Speech API transcription
  const toggleVoiceRecording = async () => {
    if (isVoiceRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        await customAlert("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.", "Speech Support Error");
        return;
      }
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        
        rec.onstart = () => {
          setIsVoiceRecording(true);
        };
        
        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          if (resultText) {
            setInput(prev => prev + (prev ? ' ' : '') + resultText);
          }
        };
        
        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event);
          setIsVoiceRecording(false);
        };
        
        rec.onend = () => {
          setIsVoiceRecording(false);
        };
        
        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsVoiceRecording(false);
      }
    }
  };

  // Stops response generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // Append cancellation notification
    const stopMsg: any = {
      id: generateId(),
      role: 'assistant',
      content: '⚠️ _Response generation stopped by user._',
      timestamp: Date.now()
    };
    setAiMessages(prev => [...prev, stopMsg]);
  };

  // Handles sending the message and executing the real API request
  const handleSendPrompt = async (files: UploadedFile[], overrideInput?: string) => {
    const promptText = overrideInput !== undefined ? overrideInput : input;
    if (!promptText.trim() && files.length === 0) return;
    if (isGenerating) return;

    if (overrideInput === undefined) {
      setInput(''); // Clear input
    }
    setIsGenerating(true);
    setCurrentError(null);

    // Create user message content representation
    let userMsgContent = promptText;
    if (files.length > 0) {
      userMsgContent += '\n' + files.map(f => `[Uploaded Attachment: ${f.name}]`).join('\n');
    }

    // Append User message to the thread
    const userMsg: any = {
      id: generateId(),
      role: 'user',
      content: userMsgContent,
      timestamp: Date.now()
    };
    setAiMessages(prev => [...prev, userMsg]);

    // Prepare active document context
    let activePageContext = '';
    if (activePage) {
      activePageContext = `Title: "${activePage.title}"\nContent Blocks:\n`;
      activePageContext += activePage.content.map(b => `- [${b.type}] ${b.content}`).join('\n');
    }

    // Map chat history for the API payload
    const history = aiMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Create abort controller for request cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const activeKey = apiKeys[provider];

      // Block if non-gemini provider lacks a key config
      if (provider !== 'gemini' && (!activeKey || activeKey.trim() === '')) {
        throw new Error(`API Key for provider ${PROVIDER_LABELS[provider]} is missing. Please open parameter options (sliders) to enter your API key.`);
      }

      // Execute standard client-side AI chat completion call
      const replyText = await callAiAPI(
        promptText,
        history,
        provider,
        model,
        activeKey,
        activePageContext,
        files.map(f => ({ name: f.name, type: f.type, data: f.data }))
      );

      // Append real response
      const assistantMsg: any = {
        id: generateId(),
        role: 'assistant',
        content: replyText,
        timestamp: Date.now()
      };
      setAiMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Handled in handleStopGeneration
        return;
      }
      console.error(err);
      setCurrentError(err.message || String(err));
      
      // Append detailed error message as assistant response bubble
      setAiMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: `❌ **API Connection Error (${PROVIDER_LABELS[provider]}):**\n\n${err.message || String(err)}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    handleSendPrompt([], presetPrompt);
  };

  if (!aiSidebarOpen) return null;

  const isEmpty = aiMessages.length === 0;

  const renderKeysConfigModal = () => {
    return (
      <div className="ai-keys-config-overlay" onClick={() => setShowKeysConfig(false)}>
        <div className="ai-keys-config-box" onClick={e => e.stopPropagation()}>
          <div className="config-header">
            <div>
              <h3>AI Provider API Keys</h3>
              <p>Configure API keys for 19+ AI model providers. Keys are stored safely in localStorage.</p>
            </div>
            <button onClick={() => setShowKeysConfig(false)} className="close-config-btn">
              <X size={18} />
            </button>
          </div>
          
          <div className="config-body custom-scrollbar">
            {Object.entries(PROVIDER_LABELS).map(([provKey, provLabel]) => {
              const p = provKey as AIProvider;
              const isGemini = p === 'gemini';
              return (
                <div key={p} className="provider-key-row">
                  <div className="provider-info">
                    <span className="provider-name">{provLabel}</span>
                    {isGemini && <span className="provider-badge-free">Free system key fallback</span>}
                  </div>
                  <div className="provider-input-wrapper">
                    <input
                      type={visibleKeys[p] ? 'text' : 'password'}
                      value={apiKeys[p] === 'temporary' ? '' : apiKeys[p]}
                      onChange={e => updateApiKey(p, e.target.value)}
                      placeholder={isGemini ? 'Enter Gemini API key (or leave blank to use system free tier)' : `Enter ${provLabel} API Key...`}
                      className="provider-key-input"
                    />
                    <button 
                      type="button" 
                      onClick={() => toggleKeyVisibility(p)}
                      className="visible-toggle-btn"
                    >
                      {visibleKeys[p] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="config-footer">
            <button onClick={() => setShowKeysConfig(false)} className="save-config-btn">
              Close / Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ai-overlay-container">
      {/* Background radial gradient bubbles */}
      <div className="ai-bg-gradient-orb orb-1" />
      <div className="ai-bg-gradient-orb orb-2" />

      {/* Floating Collapse Button */}
      <button 
        className="ai-overlay-close-btn" 
        onClick={() => setAiSidebarOpen(false)}
        title="Collapse AI and return to workspace"
      >
        <ChevronsRight size={20} />
      </button>

      {/* Centered Chat Layout Column */}
      <div className={`ai-overlay-content ${isEmpty ? 'empty' : ''}`}>
        
        {/* Messages / Greetings Area */}
        <div className="ai-overlay-body">
          {isEmpty ? (
            <div className="ai-greetings-screen">
              <div className="ai-cowboy-avatar">
                <svg viewBox="0 0 100 100" width="96" height="96">
                  {/* Circle base with white background and black stroke */}
                  <circle cx="50" cy="53" r="34" fill="#ffffff" stroke="var(--text-primary)" strokeWidth="2.5" />
                  {/* Glasses */}
                  <path d="M 38 53 C 38 48, 48 48, 48 53 C 48 58, 38 58, 38 53 Z" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
                  <path d="M 52 53 C 52 48, 62 48, 62 53 C 62 58, 52 58, 52 53 Z" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
                  <line x1="48" y1="53" x2="52" y2="53" stroke="var(--text-primary)" strokeWidth="2" />
                  {/* Eyebrows */}
                  <path d="M 35 44 Q 43 42 48 46" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 65 44 Q 57 42 52 46" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
                  {/* Nose / mustache */}
                  <path d="M 50 53 L 50 63 Q 48 67 44 65 Q 48 63 50 63" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 42 70 Q 50 74 58 70" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Cowboy Hat */}
                  {/* Hat crown */}
                  <path d="M 32 30 C 32 12, 68 12, 68 30 Z" fill="#ffffff" stroke="var(--text-primary)" strokeWidth="2.5" />
                  {/* Hat indent */}
                  <path d="M 44 20 Q 50 26 56 20" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
                  {/* Hat Brim */}
                  <path d="M 16 34 Q 50 24 84 34 C 88 35, 84 39, 80 39 Q 50 31 20 39 C 16 39, 12 35, 16 34 Z" fill="#ffffff" stroke="var(--text-primary)" strokeWidth="2.5" />
                </svg>
              </div>
              <h1 className="ai-greetings-title heading-font">
                What can I wrangle up for ya?
              </h1>
              
              {/* Central Input Box */}
              <InputBar
                input={input}
                setInput={setInput}
                isGenerating={isGenerating}
                onSend={handleSendPrompt}
                onStop={handleStopGeneration}
                model={model}
                setModel={handleModelChange}
                provider={provider}
                setProvider={handleProviderChange}
                planMode={planMode}
                setPlanMode={setPlanMode}
                documentMode={documentMode}
                setDocumentMode={setDocumentMode}
                excelMode={excelMode}
                setExcelMode={setExcelMode}
                currentError={currentError}
                setCurrentError={setCurrentError}
                apiKeys={apiKeys}
                onOpenSettings={() => setShowKeysConfig(true)}
                clearAiChat={clearAiChat}
                hasHistory={aiMessages.length > 0}
                activePageTitle={activePage ? activePage.title : undefined}
                isVoiceRecording={isVoiceRecording}
                onToggleVoiceRecording={toggleVoiceRecording}
              />

              {/* Get started cards */}
              {showGetStarted && (
                <div className="ai-get-started-section">
                  <div className="ai-get-started-header">
                    <span>Get started</span>
                    <button type="button" className="ai-get-started-close" onClick={() => setShowGetStarted(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="ai-get-started-grid">
                    <div className="ai-get-started-card" onClick={() => handlePresetClick("What's new in Notion AI")}>
                      <div className="card-icon-wrapper"><Gift size={16} /></div>
                      <div className="card-text">What's new in Notion AI</div>
                    </div>
                    <div className="ai-get-started-card" onClick={() => handlePresetClick("Write meeting agenda")}>
                      <div className="card-icon-wrapper"><FileText size={16} /></div>
                      <div className="card-text">Write meeting agenda</div>
                    </div>
                    <div className="ai-get-started-card" onClick={() => handlePresetClick("Analyze PDFs or images")}>
                      <div className="card-icon-wrapper"><FileUp size={16} /></div>
                      <div className="card-text">Analyze PDFs or images</div>
                    </div>
                    <div className="ai-get-started-card" onClick={() => handlePresetClick("Create a task tracker")}>
                      <div className="card-icon-wrapper"><ListTodo size={16} /></div>
                      <div className="card-text">Create a task tracker</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ai-chat-thread-container">
              {aiMessages.map((msg) => (
                <div key={msg.id} className={`ai-chat-row ${msg.role === 'user' ? 'row-user' : 'row-assistant'}`}>
                  <div className="ai-chat-bubble-wrapper">
                    <div className="ai-chat-bubble-meta">
                      {msg.role === 'user' ? 'You' : 'Asno AI'} &bull; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="ai-chat-bubble-content">
                      {msg.content.split('\n\n').map((para, pIdx) => {
                        if (para.startsWith('### ')) {
                          return <h4 key={pIdx} className="heading-font ai-bubble-h3" dangerouslySetInnerHTML={formatMarkdown(para.replace('### ', ''))} />;
                        }
                        if (para.startsWith('- ') || para.startsWith('* ')) {
                          return (
                            <ul key={pIdx} className="ai-bubble-ul">
                              {para.split('\n').map((li, lIdx) => (
                                <li key={lIdx} className="ai-bubble-li" dangerouslySetInnerHTML={formatMarkdown(li.replace(/^[\s-*]+/, ''))} />
                              ))}
                            </ul>
                          );
                        }
                        if (para.startsWith('> ')) {
                          return (
                            <blockquote key={pIdx} className="ai-bubble-quote" dangerouslySetInnerHTML={formatMarkdown(para.replace('> ', ''))} />
                          );
                        }
                        return <p key={pIdx} className="ai-bubble-p" dangerouslySetInnerHTML={formatMarkdown(para)} />;
                      })}
                    </div>
                    {msg.role === 'assistant' && (
                      <details className="ai-reasoning-details">
                        <summary>Reasoning & actions</summary>
                        <div>
                          {msg.reasoning || 'Prepared a structured response from the available document and chat context.'}
                          {typeof msg.toolCallsExecuted === 'number' && (
                            <span className="ai-tool-count">Tool calls: {msg.toolCallsExecuted}</span>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Spinner indicator when generating */}
              {isGenerating && (
                <div className="ai-chat-row row-assistant generation-pulsing">
                  <div className="ai-chat-bubble-wrapper">
                    <div className="ai-chat-bubble-content loading-dots-bubble">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Box (Only show when thread is active) */}
        {!isEmpty && (
          <div style={{ marginTop: 'auto', padding: '10px 0 0 0' }}>
            <InputBar
              input={input}
              setInput={setInput}
              isGenerating={isGenerating}
              onSend={handleSendPrompt}
              onStop={handleStopGeneration}
              model={model}
              setModel={handleModelChange}
              provider={provider}
              setProvider={handleProviderChange}
              planMode={planMode}
              setPlanMode={setPlanMode}
              documentMode={documentMode}
              setDocumentMode={setDocumentMode}
              excelMode={excelMode}
              setExcelMode={setExcelMode}
              currentError={currentError}
              setCurrentError={setCurrentError}
              apiKeys={apiKeys}
              onOpenSettings={() => setShowKeysConfig(true)}
              clearAiChat={clearAiChat}
              hasHistory={aiMessages.length > 0}
              activePageTitle={activePage ? activePage.title : undefined}
              isVoiceRecording={isVoiceRecording}
              onToggleVoiceRecording={toggleVoiceRecording}
            />
          </div>
        )}

      </div>

      {showKeysConfig && renderKeysConfigModal()}

      {/* Styled components inside the overlay */}
      <style>{`
        .ai-overlay-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 30%, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          color: var(--text-primary);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          font-family: var(--font-sans);
          overflow: hidden;
          z-index: 5;
        }

        /* Subtle glowing background background */
        .ai-bg-gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          z-index: 1;
          pointer-events: none;
          opacity: 0.15;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          top: 10%;
          left: 15%;
          background: rgba(99, 102, 241, 0.3);
        }
        .orb-2 {
          width: 450px;
          height: 450px;
          bottom: 15%;
          right: 15%;
          background: rgba(139, 92, 246, 0.25);
        }

        /* Float collapse button */
        .ai-overlay-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-overlay-close-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          transform: translateX(2px);
        }

        .ai-overlay-content {
          width: 100%;
          max-width: 800px;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 5;
          padding: 60px 20px 40px;
          box-sizing: border-box;
        }
        .ai-overlay-content.empty {
          justify-content: center;
        }

        .ai-overlay-body {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 8px;
          display: flex;
          flex-direction: column;
          scrollbar-width: thin;
          width: 100%;
        }
        .ai-overlay-content.empty .ai-overlay-body {
          flex-grow: 0;
          overflow-y: visible;
        }
        .ai-overlay-body::-webkit-scrollbar {
          width: 6px;
        }
        .ai-overlay-body::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        /* Greetings screen */
        .ai-greetings-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px 0;
          width: 100%;
          animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ai-cowboy-avatar {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 16px;
        }
        .ai-greetings-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 24px;
          letter-spacing: -0.5px;
          color: var(--text-primary);
        }

        /* Responsive suggestions grid */
        .ai-get-started-section {
          margin-top: 36px;
          width: 100%;
          text-align: left;
        }
        .ai-get-started-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .ai-get-started-close {
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 4px;
        }
        .ai-get-started-close:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
        .ai-get-started-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
        }
        .ai-get-started-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 100px;
        }
        .ai-get-started-card:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .card-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--accent-color);
        }
        .card-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          text-align: left;
        }

        @media (max-width: 768px) {
          .ai-get-started-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .ai-get-started-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Chat thread rows */
        .ai-chat-thread-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding: 20px 0;
          box-sizing: border-box;
          width: 100%;
        }
        .ai-chat-row {
          display: flex;
          justify-content: center;
          width: 100%;
          animation: fadeInUp 0.3s ease-out;
        }
        .ai-chat-bubble-wrapper {
          width: 100%;
          max-width: 720px;
          display: flex;
          flex-direction: column;
        }
        .row-user .ai-chat-bubble-wrapper {
          align-items: flex-end;
          text-align: right;
        }
        .row-assistant .ai-chat-bubble-wrapper {
          align-items: flex-start;
          text-align: left;
        }
        .ai-chat-bubble-meta {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 6px;
          font-weight: 500;
        }
        .ai-chat-bubble-content {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.7;
          width: 100%;
        }

        /* Bubble formatting classes */
        .ai-bubble-h3 {
          font-size: 15px;
          font-weight: 700;
          margin: 12px 0 6px 0;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-bubble-h3:first-of-type {
          margin-top: 0;
        }
        .ai-bubble-p {
          margin: 0 0 10px 0;
        }
        .ai-bubble-p:last-child {
          margin-bottom: 0;
        }
        .ai-bubble-ul {
          padding-left: 20px;
          margin: 8px 0 12px 0;
        }
        .ai-bubble-li {
          margin-bottom: 6px;
          list-style-type: disc;
        }
        .ai-bubble-quote {
          border-left: 3px solid var(--accent-color);
          padding-left: 14px;
          margin: 12px 0;
          font-style: italic;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          padding: 8px 12px;
          border-radius: 0 8px 8px 0;
        }

        .ai-reasoning-details {
          margin-top: 10px;
          color: var(--text-muted);
          font-size: 12px;
          border-top: 1px solid var(--border-color);
          padding-top: 8px;
          width: 100%;
        }
        .ai-reasoning-details summary {
          cursor: pointer;
          font-weight: 700;
          list-style: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ai-reasoning-details summary::-webkit-details-marker {
          display: none;
        }
        .ai-reasoning-details summary::before {
          content: ">";
          font-family: var(--font-mono);
          font-size: 11px;
          transition: transform 0.15s ease;
        }
        .ai-reasoning-details[open] summary::before {
          transform: rotate(90deg);
        }
        .ai-reasoning-details div {
          margin-top: 6px;
          line-height: 1.5;
        }
        .ai-tool-count {
          display: block;
          margin-top: 4px;
          font-family: var(--font-mono);
        }

        /* Dots generation animation */
        .loading-dots-bubble {
          display: flex;
          gap: 4px;
          padding: 12px 18px;
        }
        .loading-dots-bubble .dot {
          width: 6px;
          height: 6px;
          background: var(--accent-color);
          border-radius: 50%;
          animation: dot-bounce 1.4s infinite ease-in-out both;
        }
        .loading-dots-bubble .dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots-bubble .dot:nth-child(2) { animation-delay: -0.16s; }

        /* API keys configuration modal overlay styling */
        .ai-keys-config-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: barFadeIn 0.2s ease-out;
        }

        .ai-keys-config-box {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          height: 80vh;
          max-height: 520px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #1f2937;
          font-family: var(--font-sans);
          animation: modalZoomIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .config-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: #f9fafb;
          flex-shrink: 0;
        }
        .config-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }
        .config-header p {
          margin: 3px 0 0 0;
          font-size: 10px;
          color: #9ca3af;
        }

        .close-config-btn {
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
        }
        .close-config-btn:hover {
          background: rgba(0,0,0,0.06);
          color: #111827;
        }

        .config-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .provider-key-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }

        .provider-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .provider-name {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
        }
        .provider-badge-free {
          font-size: 8px;
          font-weight: 600;
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 6px;
          padding: 1px 6px;
        }

        .provider-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .provider-key-input {
          width: 100%;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 8px;
          padding: 7px 32px 7px 10px;
          font-size: 10px;
          font-family: var(--font-mono);
          outline: none;
          color: #374151;
          transition: border-color 0.15s;
        }
        .provider-key-input:focus {
          border-color: var(--accent-color, #7053ff);
        }

        .visible-toggle-btn {
          position: absolute;
          right: 6px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .visible-toggle-btn:hover {
          color: #374151;
        }

        .config-footer {
          padding: 12px 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          background: #f9fafb;
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .save-config-btn {
          border: none;
          background: #111827;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          border-radius: 8px;
          padding: 7px 16px;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .save-config-btn:hover {
          background: #1f2937;
          transform: translateY(-1px);
        }

        /* Pulsar animation */
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes pulse-mic {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-anim {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
