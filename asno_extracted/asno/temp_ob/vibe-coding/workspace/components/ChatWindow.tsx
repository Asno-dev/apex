import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Send, Bot, User, Trash2 } from 'lucide-react';

export default function ChatWindow() {
  const { messages, addMessage, clearChat } = useChatStore();
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!mounted) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addMessage({ role: 'user', content: input });
    setInput('');
    // Simulate AI response
    setTimeout(() => {
      addMessage({ role: 'assistant', content: 'I am a simulated response to: ' + input });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto border-x border-zinc-200 bg-white">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="font-bold text-lg">Bud Chat</h1>
        <button onClick={clearChat} className="p-2 hover:bg-zinc-100 rounded-full">
          <Trash2 className="w-4 h-4 text-zinc-500" />
        </button>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? 'flex-row-reverse' : '')}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", m.role === 'user' ? 'bg-blue-600' : 'bg-zinc-200')}>
              {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-zinc-600" />}
            </div>
            <div className={cn("max-w-[80%] p-3 rounded-2xl", m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-900')}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}