'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'This is a simulated response.' }]);
    }, 1000);
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)} 
      className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all"
    >
      <MessageSquare size={24} />
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <h3 className="font-semibold text-sm text-zinc-100">Bud Assistant</h3>
        <button onClick={() => setIsOpen(false)}><X size={16} className="text-zinc-500" /></button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={cn("flex gap-2", m.role === 'user' ? 'flex-row-reverse' : '')}>
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", m.role === 'assistant' ? 'bg-indigo-900' : 'bg-zinc-700')}>
              {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={cn("p-2 rounded-lg text-xs max-w-[80%]", m.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800')}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-zinc-800 flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none text-zinc-100"
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="bg-indigo-600 p-2 rounded-lg text-white"><Send size={14} /></button>
      </div>
    </div>
  );
}