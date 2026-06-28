import React, { memo, useState } from 'react';
import { FileCode, FileJson, Folder, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function fileBasename(filePath: string) {
  const p = filePath.replace(/\\/g, '/');
  return p.split('/').filter(Boolean).pop() || p || filePath;
}

export function isFolderPath(filePath: string) {
  const p = String(filePath || '').trim();
  return !p || p.endsWith('/') || (!p.includes('.') && !/\.[a-z0-9]+$/i.test(p));
}

export function formatVerb(verb: string, isRunning: boolean) {
  const v = verb.toLowerCase().trim();
  if (v.startsWith('creat')) return isRunning ? 'Creating' : 'Created';
  if (v.startsWith('edit')) return isRunning ? 'Editing' : 'Edited';
  if (v.startsWith('analyz')) return isRunning ? 'Analyzing' : 'Analyzed';
  if (v.startsWith('read')) return isRunning ? 'Reading' : 'Read';
  if (v.startsWith('explor')) return isRunning ? 'Exploring' : 'Explored';
  if (v.startsWith('verify') || v.startsWith('verifi')) return isRunning ? 'Verifying' : 'Verified';
  if (v.startsWith('search')) return isRunning ? 'Searching' : 'Searched';
  
  if (isRunning) {
    if (v.endsWith('e')) return verb.slice(0, -1) + 'ing';
    return verb + 'ing';
  } else {
    if (v.endsWith('e')) return verb + 'd';
    if (v.endsWith('y')) return verb.slice(0, -1) + 'ied';
    return verb + 'ed';
  }
}

export function getFolderChildren(folderPath: string, currentFiles: Record<string, string> = {}) {
  const normFolder = folderPath.replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '').toLowerCase();
  
  // Find ending segments that match the starting path of keys in currentFiles
  let matchedFolderKey = normFolder;
  const folderParts = normFolder.split('/');
  for (let i = 0; i < folderParts.length; i++) {
    const candidate = folderParts.slice(i).join('/');
    const hasAny = Object.keys(currentFiles).some(k => {
      const normK = k.replace(/\\/g, '/').replace(/^\//, '').toLowerCase();
      return normK.startsWith(candidate + '/');
    });
    if (hasAny) {
      matchedFolderKey = candidate;
      break;
    }
  }

  const childrenMap = new Map<string, { name: string; isFolder: boolean; fullPath: string }>();
  
  Object.keys(currentFiles).forEach(key => {
    const normKey = key.replace(/\\/g, '/').replace(/^\//, '');
    const normKeyLower = normKey.toLowerCase();
    
    const isIn = matchedFolderKey === '' || normKeyLower.startsWith(matchedFolderKey + '/');
    if (isIn) {
      const remaining = matchedFolderKey === '' ? normKey : normKey.slice(matchedFolderKey.length + 1);
      const parts = remaining.split('/');
      const childName = parts[0];
      if (!childName) return;
      
      const isFolder = parts.length > 1;
      
      let childFullPath = key;
      if (isFolder) {
        const fileKeyParts = key.split('/');
        const childIdx = fileKeyParts.indexOf(childName);
        if (childIdx !== -1) {
          childFullPath = fileKeyParts.slice(0, childIdx + 1).join('/');
        } else {
          childFullPath = folderPath === '' || folderPath === '/' 
            ? childName 
            : `${folderPath.replace(/\/$/, '')}/${childName}`;
        }
      }
      
      const cacheKey = childName.toLowerCase();
      if (!childrenMap.has(cacheKey)) {
        childrenMap.set(cacheKey, {
          name: childName,
          isFolder,
          fullPath: childFullPath
        });
      } else {
        if (isFolder) {
          const existing = childrenMap.get(cacheKey)!;
          existing.isFolder = true;
        }
      }
    }
  });
  
  return Array.from(childrenMap.values()).sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });
}

export const FILE_ARTIFACT_TOOLS = new Set([
  'code.update',
  'code.delete',
  'code.inspect',
  'code.analyze',
  'code.create',
  'code.edit',
  'code.explore',
  'sandbox.readFile',
  'sandbox.writeFile',
  'office.generate',
]);

export function getIconUrl(name: string, isFolder = false, expanded = false) {
  const cdn = 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons';
  
  if (isFolder) {
    if (name === 'src') return expanded ? `${cdn}/folder-src-open.svg` : `${cdn}/folder-src.svg`;
    if (name === 'components') return expanded ? `${cdn}/folder-components-open.svg` : `${cdn}/folder-components.svg`;
    if (name === 'public') return expanded ? `${cdn}/folder-public-open.svg` : `${cdn}/folder-public.svg`;
    if (name === 'utils' || name === 'lib') return expanded ? `${cdn}/folder-utils-open.svg` : `${cdn}/folder-utils.svg`;
    if (name === 'app') return expanded ? `${cdn}/folder-app-open.svg` : `${cdn}/folder-app.svg`;
    if (name === 'prisma') return expanded ? `${cdn}/folder-prisma-open.svg` : `${cdn}/folder-prisma.svg`;
    if (name === 'api') return expanded ? `${cdn}/folder-api-open.svg` : `${cdn}/folder-api.svg`;
    return expanded ? `${cdn}/folder-open.svg` : `${cdn}/folder.svg`;
  }

  const ext = name.split('.').pop()?.toLowerCase();
  
  if (name === 'package.json') return `${cdn}/nodejs.svg`;
  if (name === 'vite.config.ts' || name === 'vite.config.js') return `${cdn}/vite.svg`;
  if (name === 'tailwind.config.js' || name === 'tailwind.config.ts') return `${cdn}/tailwindcss.svg`;
  if (name === 'tsconfig.json' || name === 'tsconfig.node.json') return `${cdn}/tsconfig.svg`;
  if (name === 'index.html') return `${cdn}/html.svg`;
  if (name === 'next.config.ts' || name === 'next.config.js') return `${cdn}/next.svg`;
  if (name === 'layout.tsx' || name === 'layout.jsx' || name === 'page.tsx' || name === 'page.jsx') return `${cdn}/react_ts.svg`;
  if (name === 'schema.prisma') return `${cdn}/prisma.svg`;
  if (name === '.env' || name === '.env.example' || name === '.env.local') return `${cdn}/tune.svg`;
  
  switch (ext) {
    case 'tsx': return `${cdn}/react_ts.svg`;
    case 'jsx': return `${cdn}/react.svg`;
    case 'ts': return `${cdn}/typescript.svg`;
    case 'js': return `${cdn}/javascript.svg`;
    case 'docx': return `https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg`;
    case 'pptx': return `https://upload.wikimedia.org/wikipedia/commons/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg`;
    case 'xlsx': return `https://upload.wikimedia.org/wikipedia/commons/3/df/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg`;
    case 'pdf': return `${cdn}/pdf.svg`;
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

export const FileArtifactRow = memo(
  ({
    verb,
    path,
    lineStart,
    lineEnd,
    additions,
    deletions,
    onFileClick,
    currentFiles,
  }: {
    verb: string;
    path: string;
    lineStart?: number;
    lineEnd?: number;
    additions?: number;
    deletions?: number;
    onFileClick?: (filePath: string) => void;
    currentFiles?: Record<string, string>;
  }) => {
    const folder = isFolderPath(path);
    const name = folder ? path.replace(/\\/g, '/').replace(/\/$/, '') : fileBasename(path);
    const showDiff =
      (additions !== undefined || deletions !== undefined) &&
      (verb === 'Edited' || verb === 'Editing');
    const showLines =
      !showDiff &&
      lineStart !== undefined &&
      lineEnd !== undefined;

    const [isOpen, setIsOpen] = useState(true);
    const children = folder && currentFiles ? getFolderChildren(path, currentFiles) : [];

    return (
      <div className="flex flex-col min-w-0 w-full animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="flex items-center gap-2 text-[14px] min-w-0">
          <span className={cn(
            "font-medium min-w-[70px] shrink-0 text-[13px] flex items-center gap-1.5",
            verb.endsWith('ing') ? "text-indigo-400 font-semibold" : "text-white/50"
          )}>
            {verb.endsWith('ing') && (
              <Loader2 size={11} className="animate-spin text-indigo-400 shrink-0" />
            )}
            {verb}
          </span>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img 
              src={getIconUrl(name, folder, isOpen)} 
              alt="" 
              className="w-4 h-4 shrink-0 object-contain" 
              onError={(e) => {
                e.currentTarget.src = folder 
                  ? 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/folder.svg'
                  : 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/file.svg';
              }} 
            />
            {folder ? (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-left font-semibold text-white/90 transition-colors hover:text-white"
              >
                <span>{name}</span>
                <ChevronDown size={14} className={cn("text-white/35 transition-transform", isOpen && "rotate-180")} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (path.startsWith('/office-outputs/') || /\.(docx|xlsx|pptx)$/i.test(path)) {
                    onFileClick?.(path);
                  } else if (path) {
                    onFileClick?.(path);
                  }
                }}
                title={path}
                className={cn(
                  'truncate text-left font-semibold text-white/90 transition-colors',
                  (onFileClick || path.startsWith('/office-outputs/')) && 'hover:text-white hover:underline',
                )}
              >
                {name}
              </button>
            )}
          </div>
          {showLines && (
            <span className="font-mono text-[12px] text-white/35 shrink-0">
              L{lineStart}-{lineEnd}
            </span>
          )}
          {showDiff && (
            <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
              <span className="text-emerald-500">+{additions || 0}</span>
              <span className="text-red-500">-{deletions || 0}</span>
            </div>
          )}
        </div>

        {folder && isOpen && children.length > 0 && (
          <div className="pl-6 mt-1.5 space-y-1.5 border-l border-white/5 ml-[74px]">
            {children.map((child) => (
              <div 
                key={child.fullPath} 
                className="flex items-center gap-2 text-[13px] text-white/75 hover:text-white transition-colors py-0.5"
              >
                <img 
                  src={getIconUrl(child.name, child.isFolder, false)} 
                  alt="" 
                  className="w-3.5 h-3.5 shrink-0 object-contain opacity-85" 
                  onError={(e) => {
                    e.currentTarget.src = child.isFolder 
                      ? 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/folder.svg'
                      : 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/file.svg';
                  }} 
                />
                {child.isFolder ? (
                  <span className="font-medium truncate opacity-70">{child.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onFileClick?.(child.fullPath)}
                    className="truncate hover:underline text-left font-medium"
                  >
                    {child.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
FileArtifactRow.displayName = 'FileArtifactRow';

export function WorkSessionHeader({
  fileCount,
  folderCount,
  startTime,
}: {
  fileCount: number;
  folderCount: number;
  startTime?: number;
}) {
  if (fileCount === 0 && folderCount === 0) return null;
  const elapsedSec = Math.max(0, Math.round(((startTime ? Date.now() - startTime : 0)) / 1000));
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const workedLabel = mins > 0 ? `${mins}m` : `${secs}s`;

  return (
    <div className="space-y-1 pb-2 border-b border-white/5 mb-4">
      <p className="text-[13px] text-white/50">Worked for {workedLabel}</p>
      <p className="text-[13px] text-white/40">
        Explored {fileCount} file{fileCount === 1 ? '' : 's'}, {folderCount} folder
        {folderCount === 1 ? '' : 's'}
      </p>
    </div>
  );
}
