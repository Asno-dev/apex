'use client';

import React from 'react';
import { BudMessage } from '../lib/types';
import TodoItem from './TodoItem';

interface BudResponseProps {
  message: BudMessage;
  onToggleTodo: (messageId: string, todoId: string) => void;
}

export default function BudResponse({ message, onToggleTodo }: BudResponseProps) {
  if (message.type === 'user') {
    return (
      <div className="user-message">
        <div className="user-message-bubble">
          <p className="text-sm text-white/90 leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const completedCount = message.todos?.filter(t => t.status === 'completed').length || 0;
  const totalCount = message.todos?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bud-response">
      {/* Bud Avatar + Title */}
      <div className="bud-response-header">
        <div className="flex items-center gap-3">
          <div className="bud-avatar">
            <span className="text-sm font-black">B</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/90">Bud</span>
              {message.isStreaming && (
                <span className="streaming-badge">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest">Live</span>
                </span>
              )}
            </div>
            {message.titleSummary && (
              <p className="text-[11px] text-white/40 mt-0.5 truncate max-w-[500px]">
                {message.titleSummary}
              </p>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/30 font-mono">
              {completedCount}/{totalCount}
            </span>
            <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* To-Do List */}
      {message.todos && message.todos.length > 0 && (
        <div className="bud-todos">
          {message.todos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              index={index}
              onToggle={(todoId) => onToggleTodo(message.id, todoId)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {message.summary && !message.isStreaming && (
        <div className="bud-summary">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Summary</span>
          </div>
          <p className="text-[12px] text-white/60 leading-relaxed whitespace-pre-wrap">
            {message.summary}
          </p>
        </div>
      )}
    </div>
  );
}
