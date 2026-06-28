'use client';

import React from 'react';
import { TodoItem as TodoItemType } from '../lib/types';
import ThinkingIndicator from './ThinkingIndicator';
import ActionLabel from './ActionLabel';
import FileArtifact from './FileArtifact';

interface TodoItemProps {
  todo: TodoItemType;
  index: number;
  onToggle: (id: string) => void;
}

export default function TodoItem({ todo, index, onToggle }: TodoItemProps) {
  const getStatusIcon = () => {
    switch (todo.status) {
      case 'completed':
        return (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'thinking':
        return (
          <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          </div>
        );
      case 'in-progress':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 todo-spinner">
            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default: // pending
        return (
          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (todo.status) {
      case 'completed': return 'border-emerald-500/10 bg-emerald-500/[0.02]';
      case 'thinking': return 'border-purple-500/15 bg-purple-500/[0.03]';
      case 'in-progress': return 'border-blue-500/15 bg-blue-500/[0.03]';
      case 'error': return 'border-red-500/15 bg-red-500/[0.03]';
      default: return 'border-white/5 bg-white/[0.01]';
    }
  };

  return (
    <div className={`todo-item ${getStatusColor()}`}>
      {/* To-Do Header (clickable to expand/collapse) */}
      <button
        onClick={() => onToggle(todo.id)}
        className="todo-header"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {getStatusIcon()}
          <span className="text-[11px] font-bold text-white/50 flex-shrink-0">
            {index + 1}.
          </span>
          <span className={`text-xs font-semibold truncate ${
            todo.status === 'completed' ? 'text-white/50' : 'text-white/90'
          }`}>
            {todo.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {todo.status === 'in-progress' && (
            <span className="text-[9px] font-bold text-blue-400/70 uppercase tracking-widest">
              Running
            </span>
          )}
          <svg
            className={`w-3.5 h-3.5 text-white/20 transition-transform duration-300 ${
              todo.isExpanded ? 'rotate-180' : ''
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {todo.isExpanded && (
        <div className="todo-content">
          {/* Thinking/Thoughts */}
          <ThinkingIndicator
            isThinking={todo.status === 'thinking'}
            thoughts={todo.thoughts}
          />

          {/* Action Steps */}
          {todo.actions.map((action) => (
            <div key={action.id} className="todo-action-item">
              <ActionLabel
                tool={action.tool}
                label={action.label}
                status={action.status}
              />
              {/* File artifact if present */}
              {action.file && (
                <FileArtifact file={action.file} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
