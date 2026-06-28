"use client";

import React, { useState, useEffect, useRef } from 'react';
import { BudMessage, ApiKeyConfig } from './lib/types';
import { executeTask } from './lib/budClient';
import BudResponse from './components/BudResponse';
import SettingsModal from './components/SettingsModal';

export default function Home() {
  const [messages, setMessages] = useState<BudMessage[]>([]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<ApiKeyConfig>({ provider: 'gemini', apiKey: '', model: 'gemini-2.0-flash' });
  const [showDesktop, setShowDesktop] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [desktopUrl, setDesktopUrl] = useState(process.env.NEXT_PUBLIC_DESKTOP_URL || "http://127.0.0.1:6080/vnc.html?autoconnect=true");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_DESKTOP_URL && typeof window !== 'undefined') {
      const host = window.location.hostname;
      const targetHost = host === 'localhost' ? '127.0.0.1' : host;
      setDesktopUrl(`http://${targetHost}:6080/vnc.html?autoconnect=true`);
    }
  }, []);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bud-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleTodo = (messageId: string, todoId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId || !msg.todos) return msg;
      return {
        ...msg,
        todos: msg.todos.map(todo =>
          todo.id === todoId ? { ...todo, isExpanded: !todo.isExpanded } : todo
        ),
      };
    }));
  };

  const handleExecute = async () => {
    if (!input.trim() || isExecuting) return;

    // Check for API key
    if (!config.apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage: BudMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsExecuting(true);

    let assistantMessageId = '';

    await executeTask(
      userMessage.content,
      config.apiKey,
      config.provider,
      config.model,
      (updatedMessage) => {
        assistantMessageId = updatedMessage.id;
        setMessages(prev => {
          const existing = prev.findIndex(m => m.id === updatedMessage.id);
          if (existing >= 0) {
            const newMessages = [...prev];
            newMessages[existing] = updatedMessage;
            return newMessages;
          }
          return [...prev, updatedMessage];
        });
      },
      (error) => {
        const errorMessage: BudMessage = {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: '',
          timestamp: Date.now(),
          titleSummary: 'Error occurred',
          todos: [{
            id: 'error-todo',
            title: 'Connection Error',
            status: 'error',
            thoughts: [],
            actions: [{
              id: 'err-action',
              tool: 'error',
              label: error,
              status: 'error',
              timestamp: Date.now(),
            }],
            isExpanded: true,
          }],
          summary: `Failed: ${error}\n\nMake sure:\n1. Docker containers are running (docker-compose up)\n2. Computer service is healthy (http://localhost:4000/health)\n3. Your API key is valid`,
        };
        setMessages(prev => [...prev, errorMessage]);
      },
    );

    setIsExecuting(false);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <main className="flex h-screen w-full bg-[#050505] text-white/90 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <div className="w-[280px] border-r border-white/5 flex flex-col bg-black/20 backdrop-blur-3xl flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bud-avatar-large">
              <span className="text-sm font-black">B</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Bud Agent</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Ready</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            <button
              onClick={() => setShowDesktop(false)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!showDesktop ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              Chat
            </button>
            <button
              onClick={() => setShowDesktop(true)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showDesktop ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Desktop
            </button>
          </nav>
        </div>

        {/* Recent Tasks */}
        <div className="mt-auto p-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Recent Tasks</h3>
            {messages.length > 0 && (
              <button onClick={clearChat} className="text-[10px] text-white/20 hover:text-white/40 transition-colors">
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1">
            {messages.filter(m => m.type === 'user').slice(-5).reverse().map(msg => (
              <div key={msg.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                <p className="text-[11px] font-semibold mb-1 group-hover:text-blue-400 transition-colors truncate">{msg.content}</p>
                <span className="text-[9px] text-white/25">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[10px] text-white/15">No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-xl">B</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Bud Agent</p>
              <p className="text-[10px] text-white/40 truncate">{config.provider} / {config.model?.split('/').pop()}</p>
            </div>
            <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-black/10 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-xs font-semibold text-white/60">
              {showDesktop ? 'Virtual Desktop' : 'Bud Chat'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!config.apiKey && (
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all"
              >
                Set API Key →
              </button>
            )}
          </div>
        </header>

        {/* Desktop View */}
        {showDesktop && (
          <div className="flex-1 overflow-hidden">
            <iframe
              src={desktopUrl}
              className="w-full h-full border-none"
              title="Virtual Desktop"
              {...({ credentialless: "true" } as any)}
            />
          </div>
        )}

        {/* Chat View */}
        {!showDesktop && (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
              {/* Welcome screen */}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="bud-avatar-hero mx-auto mb-6">
                      <span className="text-2xl font-black">B</span>
                    </div>
                    <h2 className="text-lg font-bold text-white/80 mb-2">Hey, I&apos;m Bud</h2>
                    <p className="text-sm text-white/30 mb-8 leading-relaxed">
                      Your autonomous AI agent. I can build websites, control the desktop, run code, browse the web, and much more.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Build a React portfolio website',
                        'Open Firefox and search for news',
                        'Create a Python data analysis script',
                        'Build a Next.js blog with Tailwind',
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all text-left group"
                        >
                          <p className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">{suggestion}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map(msg => (
                <BudResponse
                  key={msg.id}
                  message={msg}
                  onToggleTodo={handleToggleTodo}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="px-8 pb-6 pt-2 z-20 flex-shrink-0">
              <div className="w-full glass rounded-2xl flex items-center px-5 gap-4 shadow-2xl group focus-within:border-blue-500/30 transition-all border-white/5 hover:border-white/10">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isExecuting ? 'bg-blue-500/20' : 'bg-white/5 group-focus-within:bg-blue-500/10'}`}>
                  {isExecuting ? (
                    <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                  placeholder={isExecuting ? 'Bud is working...' : 'Ask Bud to build, code, or do anything...'}
                  disabled={isExecuting}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/15 text-sm font-medium py-4 disabled:opacity-50"
                />
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !input.trim()}
                  className="px-6 py-2.5 bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/30 rounded-xl font-bold transition-all transform active:scale-95 text-[10px] uppercase tracking-[0.15em] flex-shrink-0"
                >
                  {isExecuting ? 'Working...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={setConfig}
      />
    </main>
  );
}
