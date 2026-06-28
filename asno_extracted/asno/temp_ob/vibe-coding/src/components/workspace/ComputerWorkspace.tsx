import { useEffect, useCallback, useRef } from 'react';
import { Monitor, Code, Terminal, Search, Globe, ChevronDown, CheckCircle, XCircle, FileText, Zap, MonitorPlay } from 'lucide-react';
import { useComputerStore, ActionBlock } from '../../store/useComputerStore';
import { ComputerTerminal } from './ComputerTerminal';

interface ComputerWorkspaceProps {
  apiKey: string;
  provider: string;
  model: string;
}

export function ComputerWorkspace({ apiKey, provider, model }: ComputerWorkspaceProps) {
  const {
    isConnected, setConnected,
    computerUrl,
    actionBlocks,
    currentAgentActivity,
    terminalHeight, setTerminalHeight
  } = useComputerStore();

  const feedRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ isDragging: boolean; startY: number; startHeight: number }>({ isDragging: false, startY: 0, startHeight: 0 });

  // Auto-scroll to bottom of feed when new blocks arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [actionBlocks.length]);

  // Health check — uses /sandbox/health which always returns ok (Docker or local mode)
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${computerUrl || ''}/sandbox/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setConnected(true);
        return true;
      }
    } catch {}
    // Even if the health check fails, set connected=true so terminal initializes
    // (it uses the local fallback in server.ts)
    setConnected(true);
    return false;
  }, [computerUrl, setConnected]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragRef.current = { isDragging: true, startY: e.clientY, startHeight: terminalHeight };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const deltaY = dragRef.current.startY - e.clientY;
    const newHeight = Math.max(100, Math.min(800, dragRef.current.startHeight + deltaY));
    setTerminalHeight(newHeight);
  };

  const handleDragEnd = () => {
    dragRef.current.isDragging = false;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  const renderActionBlock = (block: ActionBlock) => {
    switch (block.type) {
      case 'terminal':
        return (
          <div key={block.id} className="computer-action-block">
            <div className="computer-action-label">
              <div className="computer-action-label-icon">
                <Terminal size={12} className="text-gray-400" />
              </div>
              {block.label}
            </div>
            <div className="computer-card">
              <div className="computer-editor-header relative flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-400">Terminal</span>
                <button className="absolute right-3 text-gray-500 hover:text-white transition-colors" title="Copy output">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </div>
              <div className="computer-terminal-output p-4 font-mono text-[13px] leading-relaxed">
                <span className="text-fuchsia-400">ubuntu@sandbox</span><span className="text-white">:</span><span className="text-blue-400">~</span><span className="text-white">$ </span>
                {block.content.command}
                {'\n'}
                {block.content.exitCode !== undefined && (
                  <span className={block.content.exitCode === 0 ? 'text-green-400' : 'text-red-400'}>
                    {'\n'}
                  </span>
                )}
                <span className="text-gray-300">{block.content.output}</span>
              </div>
            </div>
          </div>
        );

      case 'editor':
        return (
          <div key={block.id} className="computer-action-block">
            <div className="computer-action-label">
              <div className="computer-action-label-icon">
                <Code size={12} className="text-gray-400" />
              </div>
              {block.label}
            </div>
            <div className="computer-card">
              <div className="computer-editor-header flex items-center justify-center">
                <span className="text-sm font-mono text-gray-400">{block.content.path?.split('/').pop() || 'file'}</span>
              </div>
              <div className="computer-editor-content p-4 font-mono text-[13px] leading-relaxed text-gray-300">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {block.content.code?.split('\n').slice(0, 30).map((line: string, i: number) => (
                    <div key={i} className="min-h-[20px]">
                       <span dangerouslySetInnerHTML={{ __html: highlightCode(line) }} />
                    </div>
                  ))}
                  {(block.content.code?.split('\n').length || 0) > 30 && (
                    <div className="text-gray-500 italic mt-2">... ({block.content.code?.split('\n').length - 30} more lines)</div>
                  )}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div key={block.id} className="computer-action-block">
            <div className="computer-action-label">
              <div className="computer-action-label-icon">
                <Search size={12} className="text-gray-400" />
              </div>
              {block.label}
            </div>
            <div className="computer-card">
              <div className="computer-search-header flex items-center justify-center text-sm font-semibold text-gray-400 py-2 border-b border-white/5">Search</div>
              {block.content.results?.map((res: any, idx: number) => (
                <div key={idx} className="computer-search-result">
                  <div className="computer-search-icon">
                    <Globe size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-gray-200">{res.title || block.content.query}</div>
                    <div className="text-[12px] text-gray-500 mt-1">{res.description}</div>
                  </div>
                </div>
              ))}
              {(!block.content.results || block.content.results.length === 0) && (
                <div className="p-4 text-sm text-gray-500">Searching...</div>
              )}
            </div>
          </div>
        );

      case 'status':
        return (
          <div key={block.id} className="computer-status-block">
            <Zap size={14} className="text-indigo-400 animate-pulse" />
            <span>{block.content}</span>
          </div>
        );

      default:
        return null;
    }
  };

  // Very basic syntax highlighting for demo purposes
  const highlightCode = (line: string) => {
      let hl = line
          .replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/(import|export|from|const|let|var|function|return|if|else|await|async|class)/g, '<span class="text-purple-400">$1</span>')
          .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-green-400">$1</span>')
          .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
          .replace(/(@import|@custom-variant|@theme)/g, '<span class="text-fuchsia-400">$1</span>');
      return hl;
  }


  return (
    <div className="flex h-full w-full flex-col bg-[#111111] animate-in fade-in duration-300 overflow-hidden font-sans">
      


      {/* Action Feed */}
      <div ref={feedRef} className="computer-action-feed">
         {actionBlocks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
                <MonitorPlay size={48} className="text-gray-600" />
                <p>Awaiting agent instructions...</p>
            </div>
         ) : (
            actionBlocks.map(renderActionBlock)
         )}
      </div>

    </div>
  );
}
