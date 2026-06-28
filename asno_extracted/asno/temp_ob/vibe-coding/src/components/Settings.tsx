import React from 'react';
import { Blocks, Settings as SettingsIcon, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Settings: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen } = useStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-purple-400">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <p className="text-sm text-gray-500">AI providers moved to Plugins.</p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
            <Blocks className="h-4 w-4 text-purple-400" />
            Connect AI providers from Plugins
          </div>
          <p className="text-sm leading-relaxed text-gray-500">
            Open the Plugins panel and choose the AI Providers tab next to Skills to add API keys and set your default model provider.
          </p>
        </div>
      </div>
    </div>
  );
};
