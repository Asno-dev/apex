'use client';

import React from 'react';
import { ActionStatus } from '../lib/types';

interface ActionLabelProps {
  tool: string;
  label: string;
  status: ActionStatus;
}

const TOOL_VERBS: Record<string, [string, string]> = {
  shell_exec:        ['Running', 'Executed'],
  python_exec:       ['Executing Python', 'Executed Python'],
  node_exec:         ['Running Node.js', 'Ran Node.js'],
  file_write:        ['Creating', 'Created'],
  file_read:         ['Reading', 'Read'],
  file_list:         ['Exploring', 'Explored'],
  http_fetch:        ['Fetching', 'Fetched'],
  browser_navigate:  ['Navigating', 'Navigated'],
  browser_screenshot:['Capturing', 'Captured'],
  package_install:   ['Installing', 'Installed'],
  git_clone:         ['Cloning', 'Cloned'],
  process_list:      ['Scanning', 'Scanned'],
  archive_create:    ['Archiving', 'Archived'],
  env_set:           ['Setting', 'Set'],
  desktop_screenshot:['Capturing desktop', 'Captured desktop'],
  desktop_click:     ['Clicking', 'Clicked'],
  desktop_type:      ['Typing', 'Typed'],
  desktop_scroll:    ['Scrolling', 'Scrolled'],
  desktop_open_app:  ['Opening app', 'Opened app'],
  desktop_drag:      ['Dragging', 'Dragged'],
  code_analyze:      ['Analyzing', 'Analyzed'],
  code_explore:      ['Exploring', 'Explored'],
  code_search:       ['Searching', 'Searched'],
  error:             ['Error', 'Error'],
};

export default function ActionLabel({ tool, label, status }: ActionLabelProps) {
  const verbs = TOOL_VERBS[tool] || ['Processing', 'Processed'];
  const displayVerb = status === 'active' ? verbs[0] : verbs[1];

  const getIcon = () => {
    if (status === 'error') return '❌';
    if (status === 'active') return '⚡';
    return '✓';
  };

  const getColor = () => {
    if (status === 'error') return 'text-red-400';
    if (status === 'active') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="action-label-container">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-xs ${status === 'active' ? 'animate-pulse' : ''}`}>
          {getIcon()}
        </span>
        <span className={`text-[11px] font-semibold ${getColor()} truncate`}>
          {status === 'completed' ? displayVerb : displayVerb}
        </span>
        <span className="text-[10px] text-white/30 truncate flex-1 min-w-0">
          {label}
        </span>
      </div>
      {status === 'active' && (
        <div className="action-progress-bar">
          <div className="action-progress-fill" />
        </div>
      )}
    </div>
  );
}
