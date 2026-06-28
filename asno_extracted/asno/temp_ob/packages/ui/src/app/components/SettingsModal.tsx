'use client';

import React, { useState, useEffect } from 'react';
import { ApiKeyConfig } from '../lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiKeyConfig;
  onSave: (config: ApiKeyConfig) => void;
}

const PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', models: ['gemini-2.0-flash', 'gemini-2.5-pro-preview-06-05', 'gemini-2.5-flash-preview-05-20'], keyLabel: 'Gemini API Key' },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-mini'], keyLabel: 'OpenAI API Key' },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'], keyLabel: 'Anthropic API Key' },
  { id: 'openrouter', name: 'OpenRouter', models: ['anthropic/claude-sonnet-4-20250514', 'google/gemini-2.0-flash-exp', 'openai/gpt-4o'], keyLabel: 'OpenRouter API Key' },
  { id: 'aicredits', name: 'AI Credits', models: ['gpt-4o', 'claude-sonnet-4-20250514', 'gemini-2.0-flash'], keyLabel: 'AI Credits API Key' },
  { id: 'github', name: 'GitHub Models', models: ['gpt-4o', 'gpt-4o-mini'], keyLabel: 'GitHub Token' },
];

export default function SettingsModal({ isOpen, onClose, config, onSave }: SettingsModalProps) {
  const [provider, setProvider] = useState(config.provider || 'gemini');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [model, setModel] = useState(config.model || '');

  const selectedProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  useEffect(() => {
    if (!model || !selectedProvider.models.includes(model)) {
      setModel(selectedProvider.models[0]);
    }
  }, [provider]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('bud-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProvider(parsed.provider || 'gemini');
        setApiKey(parsed.apiKey || '');
        setModel(parsed.model || '');
      } catch {}
    }
  }, []);

  const handleSave = () => {
    const newConfig = { provider, apiKey, model };
    localStorage.setItem('bud-config', JSON.stringify(newConfig));
    onSave(newConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white/90">Settings</h2>
            <p className="text-[10px] text-white/30 mt-1">Configure your AI provider for Bud</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider Select */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                    provider === p.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">
              {selectedProvider.keyLabel}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={`Enter your ${selectedProvider.keyLabel}...`}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500/50 transition-all text-xs font-mono text-white/80 placeholder:text-white/15"
            />
          </div>

          {/* Model Select */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Model</label>
            <div className="space-y-1.5">
              {selectedProvider.models.map(m => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-mono transition-all ${
                    model === m
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-white/[0.02] text-white/40 border border-white/5 hover:bg-white/5'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
