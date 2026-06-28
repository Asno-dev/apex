import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Database, X, Check, Key } from 'lucide-react';
import { useStore } from '../store/useStore';

export function SupabaseManager() {
  const { currentProject, setMessages } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');

  if (!currentProject) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && anonKey.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: `Please integrate Supabase into this project using URL: ${url} and Key: ${anonKey}. Set up the client and basic auth context.`,
        }
      ]);
      setIsOpen(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-[#161B22] text-green-400 hover:text-green-300 rounded-md text-sm font-medium transition-all border border-green-500/10 hover:border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Setup Supabase"
        >
          <Database size={14} aria-hidden="true" /> Supabase
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl border border-white/10 bg-[#161B22] p-6 shadow-2xl duration-200">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Database size={18} className="text-green-400" />
              Connect Supabase
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Project URL</label>
              <div className="relative">
                <Database size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-[#0E1117] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Anon Public Key</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                  className="w-full bg-[#0E1117] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!url.trim() || !anonKey.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#161B22]"
            >
              <Check size={16} /> Auto-Configure via AI
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              This will automatically prompt the AI to install <code>@supabase/supabase-js</code> and configure your client using these credentials safely.
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
