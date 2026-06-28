'use client';

import React, { useState } from 'react';

interface ThinkingIndicatorProps {
  isThinking: boolean;
  thoughts: { id: string; content: string; timestamp: number }[];
}

export default function ThinkingIndicator({ isThinking, thoughts }: ThinkingIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (thoughts.length === 0 && !isThinking) return null;

  return (
    <div className="thinking-container">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="thinking-toggle"
      >
        <div className="flex items-center gap-2">
          {isThinking && (
            <div className="thinking-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-xs font-semibold text-purple-400/80">Thoughts</span>
          {!isThinking && thoughts.length > 0 && (
            <span className="text-[10px] text-white/30 ml-1">({thoughts.length})</span>
          )}
        </div>
        <svg
          className={`w-3 h-3 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && thoughts.length > 0 && (
        <div className="thinking-content">
          {thoughts.map((thought) => (
            <p key={thought.id} className="text-[11px] text-white/50 leading-relaxed">
              {thought.content}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
