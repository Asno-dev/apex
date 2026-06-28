import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileCode, 
  FilePlus,
  FolderPlus,
  Upload,
  Search,
  RotateCw,
  X,
  Check,
  Loader2,
  Lock,
  Unlock,
  MoreVertical
} from 'lucide-react';
import JSZip from 'jszip';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children: FileNode[];
}

function buildFileTree(files: string[]): FileNode {
  const root: FileNode = { name: 'root', path: '/', type: 'folder', children: [] };
  
  files.forEach(path => {
    const parts = path.split('/').filter(Boolean);
    let current = root;
    let currentPath = '';
    
    parts.forEach((part, i) => {
      currentPath += `/${part}`;
      const isFile = i === parts.length - 1;
      
      let child = current.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: []
        };
        current.children.push(child);
      }
      current = child;
    });
  });
  
  return root;
}

function sortNodes(nodes: FileNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  nodes.forEach(node => {
     if (node.children) sortNodes(node.children);
  });
}

function getIconUrl(name: string, isFolder = false, expanded = false) {
  const cdn = 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons';
  
  if (isFolder) {
    if (name === 'src') return expanded ? `${cdn}/folder-src-open.svg` : `${cdn}/folder-src.svg`;
    if (name === 'components') return expanded ? `${cdn}/folder-components-open.svg` : `${cdn}/folder-components.svg`;
    if (name === 'public') return expanded ? `${cdn}/folder-public-open.svg` : `${cdn}/folder-public.svg`;
    if (name === 'utils' || name === 'lib') return expanded ? `${cdn}/folder-utils-open.svg` : `${cdn}/folder-utils.svg`;
    if (name === 'app') return expanded ? `${cdn}/folder-open.svg` : `${cdn}/folder.svg`;
    if (name === 'prisma') return expanded ? `${cdn}/folder-prisma-open.svg` : `${cdn}/folder-prisma.svg`;
    if (name === 'api') return expanded ? `${cdn}/folder-api-open.svg` : `${cdn}/folder-api.svg`;
    return expanded ? `${cdn}/folder-open.svg` : `${cdn}/folder.svg`;
  }

  const ext = name.split('.').pop()?.toLowerCase();
  
  // Exact matches
  if (name === 'package.json') return `${cdn}/nodejs.svg`;
  if (name === 'vite.config.ts' || name === 'vite.config.js') return `${cdn}/vite.svg`;
  if (name === 'tailwind.config.js' || name === 'tailwind.config.ts') return `${cdn}/tailwindcss.svg`;
  if (name === 'tsconfig.json' || name === 'tsconfig.node.json') return `${cdn}/tsconfig.svg`;
  if (name === 'index.html') return `${cdn}/html.svg`;
  if (name === 'next.config.ts' || name === 'next.config.js') return `${cdn}/next.svg`;
  if (name === 'layout.tsx' || name === 'layout.jsx' || name === 'page.tsx' || name === 'page.jsx') return `${cdn}/react_ts.svg`;
  if (name === 'schema.prisma') return `${cdn}/prisma.svg`;
  if (name === '.env' || name === '.env.example' || name === '.env.local') return `${cdn}/tune.svg`;
  
  // Extensions
  switch (ext) {
    case 'tsx': return `${cdn}/react_ts.svg`;
    case 'jsx': return `${cdn}/react.svg`;
    case 'ts': return `${cdn}/typescript.svg`;
    case 'js': return `${cdn}/javascript.svg`;
    case 'html': return `${cdn}/html.svg`;
    case 'css': return `${cdn}/css.svg`;
    case 'json': return `${cdn}/json.svg`;
    case 'md': return `${cdn}/markdown.svg`;
    case 'svg': return `${cdn}/svg.svg`;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'ico':
      return `${cdn}/image.svg`;
    default: return `${cdn}/file.svg`;
  }
}

interface ContextMenuProps {
  menu: {
    path: string;
    name: string;
    type: 'file' | 'folder';
    x: number;
    y: number;
  };
  onClose: () => void;
  onAction: (action: string, path: string) => void;
}

const FileContextMenu: React.FC<ContextMenuProps> = ({ menu, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: `${menu.x}px`,
    top: `${menu.y}px`,
    zIndex: 9999,
  });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = menu.x;
      let top = menu.y;

      if (left + rect.width > viewportWidth) {
        left = viewportWidth - rect.width - 8;
      }
      if (top + rect.height > viewportHeight) {
        top = top - rect.height - 12;
      }

      setAdjustedStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9999,
      });
    }
  }, [menu]);

  const items = [
    { label: 'Show in editor', action: 'show' },
    { label: 'Rename', action: 'rename' },
    { label: 'Move', action: 'move' },
    { label: 'Delete', action: 'delete', danger: true },
    { label: 'Copy path', action: 'copy' },
    { label: 'Download', action: 'download' },
  ];

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className="w-44 bg-[#141416] border border-white/10 rounded-lg shadow-2xl py-1 px-1 flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item) => (
        <button
          key={item.action}
          onClick={() => {
            onAction(item.action, menu.path);
            onClose();
          }}
          className={cn(
            "w-full text-left px-2.5 py-1.5 text-[12px] rounded-md transition-all cursor-pointer font-medium",
            item.danger 
              ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" 
              : "text-zinc-300 hover:bg-white/5 hover:text-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

const FileTreeNode: React.FC<{
  node: FileNode;
  level: number;
  activePath: string;
  onSelect: (path: string) => void;
  defaultExpanded?: boolean;
  onShowMenu: (e: React.MouseEvent, node: FileNode) => void;
}> = ({ node, level, activePath, onSelect, defaultExpanded = false, onShowMenu }) => {
  const [expanded, setExpanded] = useState(defaultExpanded || level < 2);
  const isActive = activePath === node.path;
  
  const lockedFiles = useStore(s => s.lockedFiles);
  const toggleFileLock = useStore(s => s.toggleFileLock);
  const isLocked = lockedFiles ? lockedFiles[node.path] : false;

  if (node.type === 'file') {
    return (
      <div 
        className={`group flex w-full items-center justify-between py-1 px-2 text-[13px] hover:bg-white/5 transition-colors ${
          isActive ? 'bg-white/10 text-white font-medium' : 'text-gray-400'
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <button
          onClick={() => onSelect(node.path)}
          className="flex flex-1 items-center gap-2 text-left min-w-0"
        >
          <img src={getIconUrl(node.name, false)} alt="" className="w-4 h-4 object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/file.svg')} />
          <span className="truncate text-zinc-300 group-hover:text-white transition-colors">{node.name}</span>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {toggleFileLock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFileLock(node.path);
              }}
              className={`opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded text-gray-500 hover:text-white ${isLocked ? 'opacity-100 text-amber-500 hover:text-amber-400' : ''}`}
              title={isLocked ? "File is Locked. Click to unlock" : "Lock file to prevent AI modifications"}
            >
              {isLocked ? <Lock size={11} className="text-amber-500" /> : <Unlock size={11} />}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowMenu(e, node);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
            title="Options"
          >
            <MoreVertical size={13} />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="group flex w-full items-center justify-between py-0.5 hover:bg-white/5 transition-colors">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-1.5 py-1 px-2 text-[13px] text-gray-300 text-left min-w-0"
          style={{ paddingLeft: `${level * 12 + 4}px` }}
        >
          <span className="text-gray-500">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <img src={getIconUrl(node.name, true, expanded)} alt="" className="w-4 h-4 object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/folder.svg')} />
          <span className="truncate group-hover:text-white transition-colors">{node.name}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowMenu(e, node);
          }}
          className="opacity-0 group-hover:opacity-100 mr-2 p-0.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
          title="Options"
        >
          <MoreVertical size={13} />
        </button>
      </div>
      
      {expanded && (
        <div>
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              activePath={activePath}
              onShowMenu={onShowMenu}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CustomFileExplorer: React.FC = () => {
  const currentProject = useStore(s => s.currentProject);
  const activeFile = useStore(s => s.activeFile) || '';
  const setActiveFile = useStore(s => s.setActiveFile);
  const addFile = useStore(s => s.addFile);
  const deleteFile = useStore(s => s.deleteFile);
  
  const files = currentProject?.files || {};
  

  
  // Custom sidebar controls states
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [newPathInput, setNewPathInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [contextMenu, setContextMenu] = useState<{
    path: string;
    name: string;
    type: 'file' | 'folder';
    x: number;
    y: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleShowMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      path: node.path,
      name: node.name,
      type: node.type,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMenuAction = (action: string, path: string) => {
    switch (action) {
      case 'show':
        setActiveFile(path);
        break;
      case 'rename':
        {
          const newName = window.prompt(`Rename ${path} to:`);
          if (newName) {
              const fileData = files[path] as any;
              const content = typeof fileData === 'string' ? fileData : fileData?.code;
              const newPath = path.substring(0, path.lastIndexOf('/')) + (path.includes('/') ? '/' : '') + newName;
              if (content !== undefined) {
                  deleteFile(path);
                  addFile(newPath, typeof content === 'string' ? content : (content as any).content);
                  setActiveFile(newPath);
              }
          }
        }
        break;
      case 'move':
        {
          const newPath = window.prompt(`Move ${path} to (full path):`);
          if (newPath) {
              const fileData = files[path] as any;
              const content = typeof fileData === 'string' ? fileData : fileData?.code;
              if (content !== undefined) {
                  deleteFile(path);
                  addFile(newPath, typeof content === 'string' ? content : (content as any).content);
                  setActiveFile(newPath);
              }
          }
        }
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${path}?`)) {
            deleteFile(path);
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(path);
        break;
      case 'download':
        {
            const fileData = files[path] as any;
            const fileContent = typeof fileData === 'string' ? fileData : fileData?.code;
            if (fileContent !== undefined) {
                const blob = new Blob([typeof fileContent === 'string' ? fileContent : (fileContent as any).content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = path.split('/').pop() || 'file';
                a.click();
                URL.revokeObjectURL(url);
            }
        }
        break;
    }
  };

  // Auto-focus input when visible
  useEffect(() => {
    if (creatingType || isSearching) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [creatingType, isSearching]);

  const fileTree = useMemo(() => {
    const filePaths = Object.keys(files).filter(path => !path.startsWith('/node_modules') && !path.startsWith('/dist') && !path.startsWith('/package-lock.json'));
    const tree = buildFileTree(filePaths);
    sortNodes(tree.children);
    return tree;
  }, [files]);

  // Unified File Creator handles confirmations (nested files/folders)
  const handleConfirmCreate = () => {
    if (!newPathInput.trim()) return;
    let rawPath = newPathInput.trim();
    // Prepend leading slash if missing
    if (!rawPath.startsWith('/')) {
      rawPath = `/${rawPath}`;
    }

    if (creatingType === 'file') {
      addFile(rawPath, '');
      setActiveFile(rawPath);
    } else if (creatingType === 'folder') {
      const placeholderFile = rawPath.endsWith('/') 
        ? `${rawPath}.gitkeep` 
        : `${rawPath}/.gitkeep`;
      addFile(placeholderFile, '');
    }

    setNewPathInput('');
    setCreatingType(null);
  };

  // ZIP Unzipping / File Imports Logic
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = event.target.files;
    if (!filesList) return;

    setIsRefreshing(true);
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.name.endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(file);
          const zipFiles = Object.keys(zip.files).filter(p => !zip.files[p].dir);
          
          // Determine if there is a common root directory inside the ZIP entries
          let commonPrefix = '';
          if (zipFiles.length > 0) {
            const firstPath = zipFiles[0];
            const firstSlashIndex = firstPath.indexOf('/');
            if (firstSlashIndex !== -1) {
              const possiblePrefix = firstPath.substring(0, firstSlashIndex + 1);
              const allHavePrefix = zipFiles.every(p => p.startsWith(possiblePrefix));
              if (allHavePrefix) {
                commonPrefix = possiblePrefix;
              }
            }
          }
          
          for (const relativePath of zipFiles) {
            const zipEntry = zip.files[relativePath];
            const cleanRelativePath = commonPrefix ? relativePath.substring(commonPrefix.length) : relativePath;
            const content = await zipEntry.async('string');
            const formattedPath = cleanRelativePath.startsWith('/') ? cleanRelativePath : `/${cleanRelativePath}`;
            addFile(formattedPath, content);
          }
        } catch (err) {
          console.error('[Importer] ZIP Exception:', err);
        }
      } else {
        // Individual standard uploads or direct nested structures
        try {
          const text = await file.text();
          let path = file.webkitRelativePath ? file.webkitRelativePath : file.name;
          
          // Flatten first folder layer if loaded inside webkitRelativePath
          if (file.webkitRelativePath && path.includes('/')) {
            const parts = path.split('/');
            parts.shift();
            path = parts.join('/');
          }
          
          const formattedPath = path.startsWith('/') ? path : `/${path}`;
          addFile(formattedPath, text);
        } catch (err) {
          console.error('[Importer] File Read Failure:', err);
        }
      }
    }
    
    // Auto-select files list and clear uploads queue
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Fuzzy flat file Search filtering (both names and codes contents!)
  const matchingFiles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    
    return Object.entries(files)
      .filter(([path]) => !path.startsWith('/node_modules') && !path.startsWith('/dist') && !path.startsWith('/package-lock.json'))
      .map(([path, code]) => {
        const name = path.split('/').pop() || '';
        const matchInName = name.toLowerCase().includes(query);
        const matchInPath = path.toLowerCase().includes(query);
        
        let previewLine = '';
        if (!matchInName && !matchInPath && typeof code === 'string') {
          const lines = code.split('\n');
          const matchLineIdx = lines.findIndex(line => line.toLowerCase().includes(query));
          if (matchLineIdx !== -1) {
            previewLine = lines[matchLineIdx].trim();
          }
        }
        
        const isMatch = matchInName || matchInPath || previewLine !== '';
        return { path, name, isMatch, previewLine };
      })
      .filter(item => item.isMatch);
  }, [files, searchQuery]);

  return (
    <div className="flex h-full w-[230px] flex-col bg-[#0a0a0a] border-r border-white/5 shrink-0 overflow-hidden font-sans select-none animate-fade-in">
      {/* VS Code styled actions header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-[#0a0a0a] shrink-0">
        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Workspace</span>
        <div className="flex items-center gap-1.5 text-gray-400">
          <button 
            onClick={() => { setCreatingType(creatingType === 'file' ? null : 'file'); setIsSearching(false); }} 
            title="New File" 
            className={`p-1 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer ${creatingType === 'file' ? 'text-white bg-white/5' : ''}`}
          >
            <FilePlus size={14} />
          </button>
          <button 
            onClick={() => { setCreatingType(creatingType === 'folder' ? null : 'folder'); setIsSearching(false); }} 
            title="New Folder" 
            className={`p-1 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer ${creatingType === 'folder' ? 'text-white bg-white/5' : ''}`}
          >
            <FolderPlus size={14} />
          </button>
          
          <label title="Import Files / ZIP" className="p-1 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer">
            <Upload size={14} />
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              accept=".zip,.*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
          
          <button 
            onClick={() => { setIsSearching(!isSearching); setCreatingType(null); setSearchQuery(''); }} 
            title="Search Files" 
            className={`p-1 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer ${isSearching ? 'text-white bg-white/5' : ''}`}
          >
            <Search size={14} />
          </button>
          
          <button 
            onClick={handleRefresh} 
            title="Refresh File Explorer" 
            className="p-1 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
          >
            <RotateCw size={14} className={isRefreshing ? 'animate-spin text-white' : ''} />
          </button>
        </div>
      </div>

      {/* Creation Inputs Panel */}
      {creatingType && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] border-b border-white/5 shrink-0">
          <input
            ref={inputRef}
            type="text"
            placeholder={creatingType === 'file' ? "e.g., src/utils.ts" : "e.g., src/components"}
            value={newPathInput}
            onChange={(e) => setNewPathInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmCreate();
              if (e.key === 'Escape') setCreatingType(null);
            }}
            className="flex-1 bg-transparent text-[12px] text-white focus:outline-none placeholder-gray-600 font-mono min-w-0"
          />
          <button onClick={handleConfirmCreate} className="p-0.5 hover:text-emerald-400 text-gray-500 shrink-0 cursor-pointer">
            <Check size={12} />
          </button>
          <button onClick={() => setCreatingType(null)} className="p-0.5 hover:text-red-400 text-gray-500 shrink-0 cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Search Input Panel */}
      {isSearching && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] border-b border-white/5 shrink-0">
          <Search size={12} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search filenames / code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[12px] text-white focus:outline-none placeholder-gray-600 font-mono min-w-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-0.5 hover:text-white text-gray-500 shrink-0 cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Scrollable File Items / Search results container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pt-2 pb-6">
        {isSearching && searchQuery.trim() !== '' ? (
          /* Search view flat filtered file lists */
          <div className="flex flex-col gap-1 px-2.5">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2 mb-1">
              Search Results ({matchingFiles.length})
            </div>
            {matchingFiles.map(file => (
              <button
                key={file.path}
                onClick={() => setActiveFile(file.path)}
                className={`flex flex-col items-start text-left w-full p-2 rounded-lg hover:bg-white/5 border border-transparent transition-all cursor-pointer ${
                  activeFile === file.path ? 'bg-white/10 border-white/5 text-white' : 'text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2 text-[12.5px] truncate w-full font-medium">
                  <img src={getIconUrl(file.name, false)} alt="" className="w-3.5 h-3.5 object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/file.svg')} />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono pl-5 truncate w-full mt-0.5">
                  {file.path}
                </div>
                {file.previewLine && (
                  <div className="text-[10px] text-[#818cf8] bg-[#818cf8]/5 px-2 py-0.5 rounded border border-[#818cf8]/10 font-mono pl-2 ml-5 mt-1.5 truncate max-w-full w-full">
                    {file.previewLine}
                  </div>
                )}
              </button>
            ))}
            {matchingFiles.length === 0 && (
              <div className="text-[12px] text-gray-600 italic text-center py-6">
                No matching codes found
              </div>
            )}
          </div>
        ) : (
          /* Standalone scrollable explorer file tree view hierarchy */
          <>
            {fileTree.children.map(node => (
              <FileTreeNode
                key={node.path}
                node={node}
                level={0}
                activePath={activeFile}
                onSelect={(path) => setActiveFile(path)}
                defaultExpanded={true}
                onShowMenu={handleShowMenu}
              />
            ))}
            {fileTree.children.length === 0 && (
              <div className="flex items-center justify-center p-8 text-center">
                <Loader2 size={16} className="animate-spin text-gray-500 mr-2" />
                <span className="text-[12px] text-gray-500">Loading files...</span>
              </div>
            )}


          </>
        )}
      </div>

      {contextMenu && (
        <FileContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onAction={handleMenuAction}
        />
      )}
    </div>
  );
};
