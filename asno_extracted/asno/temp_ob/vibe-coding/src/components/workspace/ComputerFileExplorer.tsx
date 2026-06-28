import { useState, useEffect, useCallback } from 'react';
import { File, Folder, FolderOpen, ChevronRight, ChevronDown, RefreshCw, Search, Download } from 'lucide-react';
import { useComputerStore, type FileNode } from '../../store/useComputerStore';

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const colors: Record<string, string> = {
    ts: 'text-blue-400', tsx: 'text-blue-400', js: 'text-yellow-400', jsx: 'text-yellow-400',
    py: 'text-green-400', json: 'text-yellow-300', md: 'text-gray-400', css: 'text-pink-400',
    html: 'text-orange-400', sh: 'text-emerald-400', yml: 'text-red-400', yaml: 'text-red-400',
    sql: 'text-cyan-400', env: 'text-gray-500', txt: 'text-gray-400',
  };
  return colors[ext] || 'text-gray-500';
}

function TreeItem({ node, depth, onSelect, selectedFile }: {
  node: FileNode; depth: number; onSelect: (path: string) => void; selectedFile: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  const isDir = node.type === 'directory';
  const isSelected = selectedFile === node.path;

  return (
    <div>
      <button
        onClick={() => { if (isDir) setIsExpanded(!isExpanded); else onSelect(node.path); }}
        className={`flex items-center gap-1.5 w-full text-left px-2 py-1 text-[12px] rounded-md transition-all hover:bg-white/5 ${isSelected ? 'bg-indigo-500/10 text-indigo-300' : 'text-gray-400'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isDir ? (
          <>
            {isExpanded ? <ChevronDown size={12} className="shrink-0 text-gray-600" /> : <ChevronRight size={12} className="shrink-0 text-gray-600" />}
            {isExpanded ? <FolderOpen size={13} className="shrink-0 text-amber-400" /> : <Folder size={13} className="shrink-0 text-amber-400/60" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <File size={13} className={`shrink-0 ${getFileIcon(node.name)}`} />
          </>
        )}
        <span className="truncate">{node.name}</span>
        {!isDir && node.size !== undefined && (
          <span className="ml-auto text-[10px] text-gray-700 shrink-0">{node.size < 1024 ? `${node.size}B` : `${(node.size / 1024).toFixed(1)}K`}</span>
        )}
      </button>
      {isDir && isExpanded && node.children?.map(child => (
        <TreeItem key={child.path} node={child} depth={depth + 1} onSelect={onSelect} selectedFile={selectedFile} />
      ))}
    </div>
  );
}

export function ComputerFileExplorer() {
  const { isConnected, computerUrl, fileTree, setFileTree, selectedFile, setSelectedFile, setFileContent } = useComputerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTree = useCallback(async () => {
    if (!isConnected) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`${computerUrl}/fs/tree?depth=5`);
      const data = await res.json();
      if (Array.isArray(data)) setFileTree(data);
    } catch {}
    setIsRefreshing(false);
  }, [isConnected, computerUrl, setFileTree]);

  useEffect(() => { refreshTree(); }, [refreshTree]);

  const handleSelectFile = async (filePath: string) => {
    setSelectedFile(filePath);
    try {
      const res = await fetch(`${computerUrl}/fs/read?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setFileContent(data.content || data.error || 'Empty file');
    } catch { setFileContent('Failed to read file'); }
  };

  if (!isConnected) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 shrink-0 bg-[#0e0e0e]">
        <div className="flex-1 flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1">
          <Search size={11} className="text-gray-600" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search files..." 
            className="flex-1 bg-transparent text-[11px] text-gray-300 placeholder-gray-600 outline-none" 
          />
        </div>
        <button onClick={refreshTree} className="p-1 text-gray-600 hover:text-white transition-colors" title="Refresh">
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <div className="px-3 py-1 text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Workspace</div>
        {fileTree.length === 0 ? (
          <div className="px-4 py-4 text-[11px] text-gray-700 italic">Empty</div>
        ) : (
          fileTree.map(node => (
            <TreeItem 
              key={node.path} 
              node={node} 
              depth={0} 
              onSelect={handleSelectFile} 
              selectedFile={selectedFile} 
            />
          ))
        )}
      </div>
    </div>
  );
}
