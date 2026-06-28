'use client';

import React, { useState } from 'react';
import { FileChange, getFileIcon, getFileName } from '../lib/types';

interface FileArtifactProps {
  file: FileChange;
}

export default function FileArtifact({ file }: FileArtifactProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileName = getFileName(file.path);
  const icon = getFileIcon(fileName);

  const getActionBadge = () => {
    switch (file.action) {
      case 'created': return <span className="file-badge file-badge-created">NEW</span>;
      case 'edited': return <span className="file-badge file-badge-edited">EDIT</span>;
      case 'deleted': return <span className="file-badge file-badge-deleted">DEL</span>;
      case 'read': return <span className="file-badge file-badge-read">READ</span>;
      default: return null;
    }
  };

  return (
    <div className="file-artifact">
      <button
        onClick={() => file.content && setIsExpanded(!isExpanded)}
        className="file-artifact-header"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm flex-shrink-0">{icon}</span>
          <span className="text-[11px] font-semibold text-blue-400 truncate hover:underline">
            {fileName}
          </span>
          {getActionBadge()}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {file.additions > 0 && (
            <span className="text-[10px] font-bold text-emerald-400">+{file.additions}</span>
          )}
          {file.deletions > 0 && (
            <span className="text-[10px] font-bold text-red-400">-{file.deletions}</span>
          )}
          {file.content && (
            <svg
              className={`w-3 h-3 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {isExpanded && file.content && (
        <div className="file-artifact-code">
          <div className="file-artifact-path">
            <span className="text-[9px] text-white/25 font-mono">{file.path}</span>
          </div>
          <pre className="text-[11px] text-white/70 font-mono whitespace-pre-wrap break-all leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
            {file.content.length > 3000 ? file.content.slice(0, 3000) + '\n\n... (truncated)' : file.content}
          </pre>
        </div>
      )}
    </div>
  );
}
