import React, { useState, useRef, useEffect } from 'react';
import { useApp, generateId } from '../AppContext';
import { Block, Page } from '../types';
import { SlashMenu } from './SlashMenu';
import { DatabaseBlock } from './DatabaseBlock';
import { ChartBlockAdvanced } from './ChartBlockAdvanced';
import { UniversalEmbed, getEmbedTypes } from './UniversalEmbed';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronRight, 
  ChevronDown,
  Terminal, 
  Square, 
  CheckSquare, 
  Info,
  HelpCircle,
  PlusCircle,
  Upload,
  Play,
  Volume2,
  FileText,
  Globe,
  Bookmark,
  Sparkles,
  Sigma,
  ExternalLink,
  Layers,
  MapPin,
  ListCollapse,
  PenTool,
  PlaySquare,
  Calendar,
  Activity,
  User,
  BarChart2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileSpreadsheet,
  Link,
  ChevronUp,
  BookOpen,
  RefreshCw,
  // New icons
  Database,
  Video,
  Paperclip,
  Map,
  Clock,
  Anchor,
  Compass,
  Smile,
  Palette,
  Search,
  Zap
} from 'lucide-react';

// Custom Brand SVGs
const YoutubeIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#ff0000" style={{ display: 'block', ...style }}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const GithubIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: 'block', ...style }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const SlackIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: 'block', ...style }}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zM6.304 15.165a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.824 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.824 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zM8.824 6.304a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.782a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.042zM18.958 8.824a2.528 2.528 0 0 1 2.522-2.52A2.528 2.528 0 0 1 24 8.824a2.528 2.528 0 0 1-2.52 2.52h-2.522V8.824zM17.696 8.824a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.782a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.042zM15.165 18.958a2.528 2.528 0 0 1 2.52 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.52v-2.522h2.52zM15.165 17.696a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.52-2.522h5.042a2.528 2.528 0 0 1 2.522 2.522v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.042z"/>
  </svg>
);

const TrelloIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#0079bf" style={{ display: 'block', ...style }}>
    <path d="M19.389 0H4.611C2.063 0 0 2.063 0 4.611v14.778C0 21.937 2.063 24 4.611 24h14.778C21.937 24 24 21.937 24 19.389V4.611C24 2.063 21.937 0 19.389 0zM10.15 15.42c0 1.09-.89 1.98-1.98 1.98H5.78a1.98 1.98 0 0 1-1.98-1.98V5.78c0-1.09.89-1.98 1.98-1.98h2.39c1.09 0 1.98.89 1.98 1.98v9.64zm10.07-5.78c0 1.09-.89 1.98-1.98 1.98h-2.39a1.98 1.98 0 0 1-1.98-1.98V5.78c0-1.09.89-1.98 1.98-1.98h2.39c1.09 0 1.98.89 1.98 1.98v3.86z"/>
  </svg>
);

// ---------------- NOTES CARD WITH VOICE TRANSCRIBER ----------------
const NotesBlock: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock, addBlock, customAlert } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const bgColor = block.properties?.bgColor || 'rgba(112, 83, 255, 0.05)';
  const textColor = block.properties?.textColor || 'var(--text-primary)';

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      customAlert("Web Speech API is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        updateBlock(pageId, block.id, { content: (block.content + ' ' + finalTranscript).trim() });
      }
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        padding: '20px', 
        borderRadius: 'var(--border-radius-lg)', 
        backgroundColor: bgColor, 
        color: textColor, 
        border: '1px solid var(--border-color)', 
        boxShadow: 'var(--shadow-sm)',
        margin: '12px 0',
        position: 'relative'
      }}
    >
      {/* Header controls for notes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={15} style={{ color: 'var(--accent-color)' }} />
          <span>Modern Notes Card</span>
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Voice to text trigger */}
          <button 
            className="cover-btn"
            onClick={isRecording ? stopRecording : startRecording}
            style={{ 
              padding: '4px 10px', 
              fontSize: '11px', 
              background: isRecording ? '#ef4444' : 'var(--accent-color)', 
              color: 'white',
              border: 'none',
              animation: isRecording ? 'pulse-anim 1.5s infinite' : 'none'
            }}
          >
            {isRecording ? '🛑 Recording...' : '🎙️ Speech-to-Text'}
          </button>
          
          {/* Color changer */}
          <select
            value={bgColor}
            onChange={(e) => updateBlock(pageId, block.id, { properties: { bgColor: e.target.value } })}
            style={{ fontSize: '11px', padding: '3px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <option value="rgba(112, 83, 255, 0.05)">Accent Purple</option>
            <option value="rgba(16, 185, 129, 0.05)">Pastel Green</option>
            <option value="rgba(245, 158, 11, 0.05)">Pastel Amber</option>
            <option value="rgba(239, 68, 68, 0.05)">Pastel Red</option>
            <option value="var(--bg-secondary)">Neutral Gray</option>
          </select>
        </div>
      </div>

      {/* Editable Content */}
      <div 
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => updateBlock(pageId, block.id, { content: e.currentTarget.innerText })}
        style={{ outline: 'none', minHeight: '60px', fontSize: '15px', lineHeight: '1.6', marginBottom: '12px' }}
        data-placeholder="Start typing your notes here..."
      >
        {block.content}
      </div>

      {/* Nested child blocks */}
      {block.children && block.children.length > 0 && (
        <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '14px', marginTop: '12px' }}>
          {block.children.map((child, idx) => (
            <BlockRenderer key={child.id} block={child} index={idx} pageId={pageId} />
          ))}
        </div>
      )}

      {/* Plus button to add nested blocks inside notes */}
      <button
        className="cover-btn"
        onClick={() => addBlock(pageId, 'text', block.id)}
        style={{ padding: '3px 8px', fontSize: '11px', marginTop: '8px' }}
      >
        + Add block inside notes
      </button>
    </div>
  );
};

// ---------------- MERMAID standalone diagram Renderer ----------------
const MermaidBlock: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const [layoutMode, setLayoutMode] = useState<'split' | 'edit' | 'preview'>('split');
  
  // Set default code if block.content is empty
  const defaultCode = 'graph TD\n  A[Start] --> B(Process)\n  B --> C{Decision}\n  C -->|One| D[Result 1]\n  C -->|Two| E[Result 2]';
  const initialCode = block.content || defaultCode;
  
  const [localCode, setLocalCode] = useState(initialCode);
  const renderRef = useRef<HTMLDivElement>(null);

  // Sync external changes if any (like duplicate page)
  useEffect(() => {
    if (block.content && block.content !== localCode) {
      setLocalCode(block.content);
    }
  }, [block.content]);

  // Debounced save to App State block.content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localCode !== block.content) {
        updateBlock(pageId, block.id, { content: localCode });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [localCode, block.content, pageId, block.id]);

  // Re-render diagram when localCode or layoutMode changes
  useEffect(() => {
    if (layoutMode === 'edit') return; // no preview to render

    const scriptId = 'mermaid-cdn-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const renderDiagram = async () => {
      if (!renderRef.current) return;
      
      const codeToRender = localCode || defaultCode;
      
      try {
        if ((window as any).mermaid) {
          const m = (window as any).mermaid;
          // Initialize neutral theme
          m.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
          
          const id = 'mermaid-standalone-' + block.id.replace(/[^a-zA-Z0-9]/g, '');
          
          // Clear previous renders to prevent collisions
          renderRef.current.innerHTML = `<div id="temp-${id}" style="display:none">${codeToRender}</div>`;
          
          const { svg } = await m.render(id, codeToRender);
          if (renderRef.current) {
            renderRef.current.innerHTML = svg;
          }
        }
      } catch (e) {
        console.error(e);
        // Clear error elements since mermaid render appends error structures on failure
        const badElement = document.getElementById(block.id);
        if (badElement) badElement.remove();
        
        if (renderRef.current) {
          renderRef.current.innerHTML = `<div style="color: var(--danger-color); font-size: 13px; font-weight: 500; padding: 12px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 6px;">⚠️ Mermaid Render Error: Please check your diagram syntax.</div>`;
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      script.onload = () => {
        try {
          (window as any).mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
        } catch (e) {}
        renderDiagram();
      };
      document.body.appendChild(script);
    } else {
      renderDiagram();
    }
  }, [localCode, layoutMode, block.id]);

  return (
    <div style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '16px', background: 'var(--bg-secondary)', margin: '14px 0' }} data-block-id={block.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={15} style={{ color: '#ff3670' }} />
          <span style={{ fontFamily: 'var(--font-title)' }}>Mermaid Diagram Block</span>
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            type="button"
            className={`cover-btn ${layoutMode === 'split' ? 'active' : ''}`} 
            style={{ fontSize: '11px', padding: '4px 8px', background: layoutMode === 'split' ? 'var(--accent-light)' : 'transparent', color: layoutMode === 'split' ? 'var(--accent-color)' : 'var(--text-muted)' }} 
            onClick={() => setLayoutMode('split')}
          >
            Split View
          </button>
          <button 
            type="button"
            className={`cover-btn ${layoutMode === 'edit' ? 'active' : ''}`} 
            style={{ fontSize: '11px', padding: '4px 8px', background: layoutMode === 'edit' ? 'var(--accent-light)' : 'transparent', color: layoutMode === 'edit' ? 'var(--accent-color)' : 'var(--text-muted)' }} 
            onClick={() => setLayoutMode('edit')}
          >
            Code Only
          </button>
          <button 
            type="button"
            className={`cover-btn ${layoutMode === 'preview' ? 'active' : ''}`} 
            style={{ fontSize: '11px', padding: '4px 8px', background: layoutMode === 'preview' ? 'var(--accent-light)' : 'transparent', color: layoutMode === 'preview' ? 'var(--accent-color)' : 'var(--text-muted)' }} 
            onClick={() => setLayoutMode('preview')}
          >
            Preview Only
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Editor Area */}
        {(layoutMode === 'split' || layoutMode === 'edit') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>DIAGRAM CODE:</span>
            <textarea
              value={localCode}
              onChange={(e) => setLocalCode(e.target.value)}
              className="block-code-textarea"
              style={{ minHeight: '130px', fontSize: '13px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              placeholder="graph TD&#10;  A[Start] --> B[Process]..."
            />
          </div>
        )}

        {/* Visual Preview Area */}
        {(layoutMode === 'split' || layoutMode === 'preview') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {layoutMode === 'split' && <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>LIVE PREVIEW:</span>}
            <div 
              ref={renderRef} 
              style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '8px', display: 'flex', justifyContent: 'center', border: '1px solid var(--border-color)', overflowX: 'auto', minHeight: '100px' }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- INLINE FILE IMPORT PARSER BLOCK ----------------
const ImportBlock: React.FC<{ block: Block; pageId: string; index: number }> = ({ block, pageId, index }) => {
  const { updateBlock, setBlocks, pages, customAlert } = useApp();
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState<'csv' | 'markdown' | 'html' | 'json'>('csv');

  const activePage = pages.find(p => p.id === pageId);

  const processImport = () => {
    if (!importText.trim() || !activePage) return;

    try {
      let blocksToInsert: Block[] = [];

      if (importType === 'csv') {
        const lines = importText.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length > 0) {
          const cells = lines.map(line => line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim()));
          blocksToInsert.push({
            id: generateId(),
            type: 'table',
            content: '',
            properties: { tableData: cells }
          });
        }
      } else if (importType === 'markdown') {
        const lines = importText.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;
          let newBlock: Block = { id: generateId(), type: 'text', content: trimmed };
          if (trimmed.startsWith('# ')) {
            newBlock = { id: generateId(), type: 'h1', content: trimmed.substring(2) };
          } else if (trimmed.startsWith('## ')) {
            newBlock = { id: generateId(), type: 'h2', content: trimmed.substring(3) };
          } else if (trimmed.startsWith('### ')) {
            newBlock = { id: generateId(), type: 'h3', content: trimmed.substring(4) };
          } else if (trimmed.startsWith('- [ ]')) {
            newBlock = { id: generateId(), type: 'todo', content: trimmed.substring(5).trim(), properties: { checked: false } };
          } else if (trimmed.startsWith('- [x]')) {
            newBlock = { id: generateId(), type: 'todo', content: trimmed.substring(5).trim(), properties: { checked: true } };
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            newBlock = { id: generateId(), type: 'bullet', content: trimmed.substring(2) };
          } else if (trimmed.startsWith('> ')) {
            newBlock = { id: generateId(), type: 'quote', content: trimmed.substring(2) };
          }
          blocksToInsert.push(newBlock);
        });
      } else if (importType === 'html') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(importText, 'text/html');
        Array.from(doc.body.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            const content = el.innerText.trim();
            if (!content) return;
            if (tag === 'h1') blocksToInsert.push({ id: generateId(), type: 'h1', content });
            else if (tag === 'h2') blocksToInsert.push({ id: generateId(), type: 'h2', content });
            else if (tag === 'p') blocksToInsert.push({ id: generateId(), type: 'text', content });
            else if (tag === 'li') blocksToInsert.push({ id: generateId(), type: 'bullet', content });
          }
        });
      } else if (importType === 'json') {
        try {
          const parsed = JSON.parse(importText);
          if (Array.isArray(parsed)) {
            blocksToInsert = parsed.map(b => ({ ...b, id: generateId() }));
          } else {
            customAlert('JSON import must be a flat array of Block objects.');
          }
        } catch (e) {}
      }

      if (blocksToInsert.length > 0) {
        const newBlocks = [...activePage.content];
        newBlocks.splice(index, 1, ...blocksToInsert);
        setBlocks(pageId, newBlocks);
      }
    } catch (err) {
      customAlert('Failed to parse text. Please double check structure.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '16px', background: 'var(--bg-secondary)', margin: '14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Upload size={15} style={{ color: 'var(--accent-color)' }} />
          <span>Inline Import File Block</span>
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['csv', 'markdown', 'html', 'json'] as const).map(t => (
            <button key={t} className={`cover-btn ${importType === t ? 'active' : ''}`} onClick={() => setImportType(t)} style={{ padding: '3px 8px', fontSize: '10px', textTransform: 'uppercase' }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="file" onChange={handleFileUpload} style={{ fontSize: '12px' }} />
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={`Paste your raw ${importType.toUpperCase()} content here...`}
          className="block-code-textarea"
          style={{ minHeight: '120px', fontSize: '13px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
        />
        <button 
          onClick={processImport} 
          className="cover-btn" 
          disabled={!importText.trim()}
          style={{ alignSelf: 'flex-end', background: 'var(--accent-color)', color: 'white', border: 'none', opacity: importText.trim() ? 1 : 0.5 }}
        >
          Parse & Insert blocks inline
        </button>
      </div>
    </div>
  );
};

interface BlockRendererProps {
  block: Block;
  index: number;
  pageId: string;
}

// ---------------- WHITEBOARD SKETCH PAD COMPONENT ----------------
const SketchBoard: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [brushColor, setBrushColor] = useState('#ff007f');
  const [brushSize, setBrushSize] = useState(4);

  const colors = ['#ff007f', '#00f2fe', '#00ff66', '#ffff00', '#ffffff', '#202430'];

  useEffect(() => {
    if (canvasRef.current && block.properties?.shapeData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = block.properties.shapeData;
      }
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;
    isDrawing.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      updateBlock(pageId, block.id, { properties: { shapeData: dataUrl } });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      updateBlock(pageId, block.id, { properties: { shapeData: '' } });
    }
  };

  return (
    <div style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '12px', background: 'var(--bg-secondary)', margin: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PenTool size={14} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Sketch Board Whiteboard</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {colors.map(c => (
            <button 
              key={c} 
              style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: c, border: brushColor === c ? '2px solid var(--text-primary)' : '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
              onClick={() => setBrushColor(c)}
            />
          ))}
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={brushSize} 
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ width: '60px', cursor: 'pointer' }}
          />
          <button className="cover-btn" onClick={clearCanvas} style={{ padding: '3px 8px', fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: 'red' }}>Clear</button>
        </div>
      </div>
      <canvas 
        ref={canvasRef}
        width={700}
        height={250}
        style={{ width: '100%', height: '250px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', cursor: 'crosshair', display: 'block', border: '1px solid var(--border-color)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

// ---------------- MATHEMATICAL EQUATION RENDERING ----------------
const MathEquation: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const elRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [eqText, setEqText] = useState(block.properties?.equationText || '');

  useEffect(() => {
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);
    }
    
    const loadScript = () => {
      if ((window as any).katex) {
        renderEq();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
        script.onload = renderEq;
        document.body.appendChild(script);
      }
    };

    const renderEq = () => {
      if (elRef.current && (window as any).katex) {
        try {
          (window as any).katex.render(block.properties?.equationText || 'E = mc^2', elRef.current, {
            throwOnError: false,
            displayMode: true
          });
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadScript();
  }, [block.properties?.equationText]);

  const handleSave = () => {
    updateBlock(pageId, block.id, { properties: { equationText: eqText } });
    setEditing(false);
  };

  return (
    <div style={{ width: '100%', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', margin: '8px 0' }}>
      {editing ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="search-input" 
            value={eqText}
            onChange={(e) => setEqText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            style={{ flexGrow: 1, padding: '6px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}
            placeholder="Type LaTeX formula, e.g. E = mc^2"
          />
          <button className="cover-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <div ref={elRef} style={{ minHeight: '30px' }} />
          <div style={{ fontSize: '9px', color: 'var(--text-placeholder)', textAlign: 'right', marginTop: '4px' }}>Click to edit LaTeX math formula</div>
        </div>
      )}
    </div>
  );
};

// ---------------- SLACK MESSAGE COMPONENT ----------------
const SlackEmbed: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock, customPrompt } = useApp();
  const author = block.properties?.slackAuthor || 'Alex Rivera';
  const avatar = block.properties?.slackAvatar || '💬';
  const timestamp = block.properties?.slackTimestamp || '10:24 AM';
  const channel = block.properties?.slackChannel || 'marketing';
  const content = block.content || 'Great job on the new layout design! Looking forward to reviewing the metrics next week.';

  const [isEditing, setIsEditing] = useState(false);
  const [reactions, setReactions] = useState<{ emoji: string; count: number }[]>([
    { emoji: '🚀', count: 4 },
    { emoji: '🎉', count: 7 },
    { emoji: '👍', count: 12 }
  ]);

  return (
    <div style={{ width: '100%', margin: '14px 0' }}>
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div style={{ padding: '8px 16px', background: '#4a154b', color: '#fff', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlackIcon size={14} />
            <span>Slack Archives: #{channel}</span>
          </div>
          <button 
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Save Post' : 'Edit Post'}
          </button>
        </div>
        
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
            {avatar}
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{author}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{timestamp}</span>
            </div>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input 
                  type="text" 
                  value={author} 
                  onChange={(e) => updateBlock(pageId, block.id, { properties: { slackAuthor: e.target.value } })}
                  className="search-input" 
                  style={{ padding: '3px 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  placeholder="Sender name"
                />
                <input 
                  type="text" 
                  value={channel} 
                  onChange={(e) => updateBlock(pageId, block.id, { properties: { slackChannel: e.target.value } })}
                  className="search-input" 
                  style={{ padding: '3px 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  placeholder="Slack channel"
                />
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(pageId, block.id, { content: e.target.value })}
                  className="block-code-textarea"
                  style={{ minHeight: '60px', padding: '6px', fontSize: '13px' }}
                />
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: content }} />
            )}
            
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              {reactions.map((r, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    const updated = [...reactions];
                    updated[i].count += 1;
                    setReactions(updated);
                  }}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', display: 'flex', gap: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <span>{r.emoji}</span>
                  <span style={{ fontWeight: 600 }}>{r.count}</span>
                </button>
              ))}
              <button 
                onClick={async () => {
                  const emo = await customPrompt('Enter reaction emoji:');
                  if (emo) setReactions([...reactions, { emoji: emo, count: 1 }]);
                }}
                style={{ background: 'transparent', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
              >
                + Add Reaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------- TRELLO BOARD COMPONENT ----------------
const TrelloEmbed: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock, customPrompt } = useApp();
  const boardName = block.properties?.trelloBoardName || 'Trello Project Board';
  const lists = block.properties?.trelloLists || [
    { title: 'To Do', cards: ['Design UI Layout', 'Fix Sidebar collapse bug'] },
    { title: 'Doing', cards: ['Refactor state actions'] }
  ];

  return (
    <div style={{ width: '100%', margin: '14px 0' }}>
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', background: 'var(--bg-secondary)', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrelloIcon size={16} />
            <input 
              type="text" 
              value={boardName} 
              onChange={(e) => updateBlock(pageId, block.id, { properties: { trelloBoardName: e.target.value } })}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontWeight: 700, fontSize: '13px' }}
              placeholder="Trello Board Name"
            />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trello Embed</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
          {lists.map((list, lIdx) => (
            <div key={lIdx} style={{ flex: '1', minWidth: '160px', background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, paddingBottom: '6px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{list.title}</span>
                <button 
                  onClick={async () => {
                    const card = await customPrompt('Enter card title:');
                    if (card) {
                      const newLists = [...lists];
                      newLists[lIdx].cards = [...newLists[lIdx].cards, card];
                      updateBlock(pageId, block.id, { properties: { trelloLists: newLists } });
                    }
                  }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px' }}
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {list.cards.map((card, cIdx) => (
                  <div key={cIdx} style={{ background: 'var(--bg-secondary)', padding: '6px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                    {card}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button 
            className="cover-btn"
            onClick={async () => {
              const title = await customPrompt('Enter list title:');
              if (title) {
                updateBlock(pageId, block.id, { properties: { trelloLists: [...lists, { title, cards: [] }] } });
              }
            }}
            style={{ alignSelf: 'flex-start', minWidth: '120px', padding: '6px', fontSize: '11px', justifyContent: 'center' }}
          >
            + Add List
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------- SVG CHART COMPONENT ----------------
const ChartBlock: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const cType = block.properties?.chartType || 'bar';
  const data = block.properties?.chartData || [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 190 },
    { label: 'Wed', value: 300 }
  ];

  const [newDataLabel, setNewDataLabel] = useState('');
  const [newDataValue, setNewDataValue] = useState('');

  const maxVal = Math.max(...data.map(d => d.value), 1) * 1.1;

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDataLabel || !newDataValue) return;
    const updatedData = [...data, { label: newDataLabel, value: Number(newDataValue) }];
    updateBlock(pageId, block.id, { properties: { chartData: updatedData } });
    setNewDataLabel('');
    setNewDataValue('');
  };

  const handleRemovePoint = (idx: number) => {
    const updatedData = data.filter((_, i) => i !== idx);
    updateBlock(pageId, block.id, { properties: { chartData: updatedData } });
  };

  const renderChartSVG = () => {
    const width = 500;
    const height = 220;
    const padding = 30;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    if (cType === 'pie') {
      let total = data.reduce((acc, curr) => acc + curr.value, 0);
      if (total === 0) total = 1;
      let currentAngle = 0;
      const colors = ['#5e81ac', '#a3be8c', '#ebcb8b', '#bf616a', '#88c0d0', '#b48ead'];

      return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <g transform={`translate(${width / 2}, ${height / 2})`}>
            {data.map((item, idx) => {
              const angle = (item.value / total) * 360;
              const radStart = (currentAngle - 90) * Math.PI / 180;
              const radEnd = (currentAngle + angle - 90) * Math.PI / 180;
              
              const x1 = Math.cos(radStart) * 80;
              const y1 = Math.sin(radStart) * 80;
              const x2 = Math.cos(radEnd) * 80;
              const y2 = Math.sin(radEnd) * 80;

              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = `M 0 0 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              const midRad = (currentAngle + angle / 2 - 90) * Math.PI / 180;
              const lx = Math.cos(midRad) * 110;
              const ly = Math.sin(midRad) * 110;

              currentAngle += angle;
              const color = colors[idx % colors.length];

              return (
                <g key={idx}>
                  <path d={pathData} fill={color} stroke="var(--bg-secondary)" strokeWidth="2" />
                  <text x={lx} y={ly} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="600">
                    {item.label} ({item.value})
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      );
    }

    if (cType === 'line') {
      const pointsCount = data.length;
      const dx = pointsCount > 1 ? chartW / (pointsCount - 1) : chartW;
      const pointsPath = data.map((d, i) => {
        const x = padding + i * dx;
        const y = height - padding - (d.value / maxVal) * chartH;
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeDasharray="4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border-color)" strokeDasharray="4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--text-muted)" strokeWidth="1.5" />

          {data.length > 0 && (
            <polyline
              fill="none"
              stroke="var(--accent-color)"
              strokeWidth="3"
              points={pointsPath}
            />
          )}

          {data.map((d, i) => {
            const x = padding + i * dx;
            const y = height - padding - (d.value / maxVal) * chartH;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="var(--accent-color)" stroke="var(--bg-primary)" strokeWidth="2" />
                <text x={x} y={y - 10} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="600">{d.value}</text>
                <text x={x} y={height - padding + 15} textAnchor="middle" fill="var(--text-muted)" fontSize="10">{d.label}</text>
              </g>
            );
          })}
        </svg>
      );
    }

    // Bar Chart
    const barW = chartW / Math.max(data.length, 1) - 10;
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeDasharray="4" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border-color)" strokeDasharray="4" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--text-muted)" strokeWidth="1.5" />

        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartH;
          const x = padding + i * (chartW / data.length) + 5;
          const y = height - padding - barH;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={Math.max(barW, 10)}
                height={barH}
                fill="url(#chart-grad)"
                rx="3"
              />
              <text x={x + barW / 2} y={y - 8} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="600">
                {d.value}
              </text>
              <text x={x + barW / 2} y={height - padding + 15} textAnchor="middle" fill="var(--text-muted)" fontSize="10">
                {d.label}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-color)" />
            <stop offset="100%" stopColor="var(--info-color)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '16px', background: 'var(--bg-secondary)', margin: '14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart2 size={15} style={{ color: 'var(--accent-color)' }} />
          <span>Interactive Chart Widget</span>
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['bar', 'line', 'pie'].map((t) => (
            <button 
              key={t}
              className={`cover-btn ${cType === t ? 'active' : ''}`}
              onClick={() => updateBlock(pageId, block.id, { properties: { chartType: t as any } })}
              style={{ padding: '3px 8px', fontSize: '11px', textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--border-radius-md)', display: 'flex', justifyContent: 'center', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
        {data.length === 0 ? (
          <div style={{ padding: '40px', color: 'var(--text-placeholder)', fontStyle: 'italic', fontSize: '13px' }}>No chart data. Add items below to render chart.</div>
        ) : renderChartSVG()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {data.map((d, idx) => (
            <div key={idx} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong>{d.label}:</strong>
              <span>{d.value}</span>
              <button 
                onClick={() => handleRemovePoint(idx)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'red', fontWeight: 700, padding: 0 }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleAddPoint} style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            value={newDataLabel} 
            onChange={e => setNewDataLabel(e.target.value)} 
            placeholder="Label (e.g. Fri)" 
            className="search-input" 
            style={{ flexGrow: 1, padding: '4px 8px', fontSize: '12px' }}
          />
          <input 
            type="number" 
            value={newDataValue} 
            onChange={e => setNewDataValue(e.target.value)} 
            placeholder="Value (e.g. 240)" 
            className="search-input" 
            style={{ width: '100px', padding: '4px 8px', fontSize: '12px' }}
          />
          <button type="submit" className="cover-btn" style={{ padding: '4px 12px', fontSize: '12px' }}>+ Add Point</button>
        </form>
      </div>
    </div>
  );
};

// ---------------- AI BLOCK COMPONENT ----------------
const AiBlock: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const promptText = block.properties?.aiPrompt || '';
  const isGenerating = !!block.properties?.aiGenerating;
  
  const handleAiGenerate = async () => {
    if (!promptText.trim()) return;
    updateBlock(pageId, block.id, { properties: { aiGenerating: true } });
    
    setTimeout(() => {
      const simulatedText = `**Simulated AI Content Draft:**\n\nHere is a structured draft based on your prompt: *"#${promptText}"*\n\nIn Notion, AI blocks speed up workflows by drafting text, editing tone, translating languages, or outlining agendas instantly. \n\n*   **Action Item 1**: Outline project deliverables.\n*   **Action Item 2**: Sync database columns with layout configurations.\n*   **Action Item 3**: Review block metadata and statistics in sidebar analytics.`;
      updateBlock(pageId, block.id, { content: simulatedText, properties: { aiGenerating: false } });
    }, 1200);
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        margin: '14px 0', 
        padding: '16px', 
        borderRadius: 'var(--border-radius-lg)', 
        border: '1px solid #7053ff',
        background: 'linear-gradient(135deg, rgba(112,83,255,0.03) 0%, rgba(0,242,254,0.02) 100%)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7053ff', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
        <Sparkles size={14} className={isGenerating ? 'pulse' : ''} />
        <span>Draft with Asno AI</span>
      </div>

      <textarea
        value={promptText}
        onChange={(e) => updateBlock(pageId, block.id, { properties: { aiPrompt: e.target.value } })}
        placeholder="Ask AI to write a summary, list tasks, brainstorm, expand on page details..."
        className="block-code-textarea"
        style={{ minHeight: '60px', padding: '8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-primary)', marginBottom: '8px' }}
        disabled={isGenerating}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-placeholder)' }}>
          {isGenerating ? 'AI is thinking & typing...' : 'Press button to generate'}
        </span>
        <button 
          onClick={handleAiGenerate}
          className="cover-btn"
          style={{ background: '#7053ff', color: 'white', fontWeight: 600 }}
          disabled={isGenerating}
        >
          <Sparkles size={12} />
          <span>{isGenerating ? 'Generating...' : 'Generate draft'}</span>
        </button>
      </div>

      {block.content && (
        <div 
          style={{ 
            marginTop: '14px', 
            paddingTop: '12px', 
            borderTop: '1px dashed var(--border-color)', 
            fontSize: '14px', 
            lineHeight: 1.5,
            color: 'var(--text-primary)'
          }}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      )}
    </div>
  );
};

// ---------------- NAVIGATION WIDGET COMPONENT ----------------
const NavigationBlock: React.FC<{ block: Block; pageId: string }> = ({ block, pageId }) => {
  const { updateBlock, setActivePageId } = useApp();
  const navLinks = block.properties?.navLinks || [];
  const [navTitle, setNavTitle] = useState('');
  const [navUrl, setNavUrl] = useState('');

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navTitle) return;
    const isExt = navUrl.startsWith('http://') || navUrl.startsWith('https://');
    const newLink = { title: navTitle, url: navUrl || '#', isExternal: isExt, pageId: isExt ? undefined : navUrl };
    updateBlock(pageId, block.id, { properties: { navLinks: [...navLinks, newLink] } });
    setNavTitle('');
    setNavUrl('');
  };

  const handleRemoveLink = (idx: number) => {
    const filtered = navLinks.filter((_, i) => i !== idx);
    updateBlock(pageId, block.id, { properties: { navLinks: filtered } });
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        padding: '10px 16px', 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--border-radius-md)',
        margin: '10px 0'
      }}
    >
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', borderBottom: navLinks.length ? '1px solid var(--border-color)' : 'none', paddingBottom: navLinks.length ? '8px' : '0', marginBottom: navLinks.length ? '10px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
          <Compass size={13} />
          <span>NAV MENU</span>
        </div>
        {navLinks.map((link, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span 
              onClick={() => {
                if (link.isExternal) {
                  window.open(link.url, '_blank');
                } else if (link.pageId) {
                  setActivePageId(link.pageId);
                } else {
                  const anchorEl = document.getElementById(link.url.replace('#', ''));
                  anchorEl?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {link.title}
            </span>
            <button 
              onClick={() => handleRemoveLink(i)} 
              style={{ background: 'transparent', border: 'none', color: 'red', fontSize: '10px', cursor: 'pointer', padding: 0 }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddLink} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        <input 
          type="text" 
          value={navTitle} 
          onChange={e => setNavTitle(e.target.value)} 
          placeholder="Menu Link text (e.g. Overview)" 
          className="search-input" 
          style={{ flexGrow: 1, padding: '3px 8px', fontSize: '12px' }}
        />
        <input 
          type="text" 
          value={navUrl} 
          onChange={e => setNavUrl(e.target.value)} 
          placeholder="URL or Page ID / #anchor" 
          className="search-input" 
          style={{ width: '180px', padding: '3px 8px', fontSize: '12px' }}
        />
        <button type="submit" className="cover-btn" style={{ padding: '3px 10px', fontSize: '12px' }}>+ Link</button>
      </form>
    </div>
  );
};

// ---------------- GOOGLE MAPS BLOCK COMPONENT ----------------
interface GoogleMapsBlockProps {
  block: Block;
  pageId: string;
}

const GoogleMapsBlock: React.FC<GoogleMapsBlockProps> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const address = block.properties?.src || '';
  const mapZoom = block.properties?.mapZoom || 14;
  const mapType = block.properties?.mapType || 'roadmap';
  const mapPins = block.properties?.mapPins || [];
  const allPins = address ? [address, ...mapPins.map(p => p.address)] : mapPins.map(p => p.address);
  const embedQuery = allPins.length > 0 ? allPins[0] : address;
  const embedUrl = embedQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=${mapType === 'satellite' ? 'k' : mapType === 'terrain' ? 'p' : mapType === 'hybrid' ? 'h' : ''}&z=${mapZoom}&ie=UTF8&iwloc=&output=embed` : '';
  const [newPin, setNewPin] = useState('');

  return (
    <div style={{ width: '100%', margin: '14px 0' }}>
      {embedUrl ? (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <iframe src={embedUrl} style={{ width: '100%', height: '400px', border: 'none' }} title="Google Map" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: '#1a73e8' }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{address}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { mapZoom: Math.min(mapZoom + 2, 20) } })} style={{ padding: '2px 6px', fontSize: '11px', fontWeight: 700 }}>+</button>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>z{mapZoom}</span>
                <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { mapZoom: Math.max(mapZoom - 2, 2) } })} style={{ padding: '2px 6px', fontSize: '11px', fontWeight: 700 }}>−</button>
                <select value={mapType} onChange={e => updateBlock(pageId, block.id, { properties: { mapType: e.target.value as any } })} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 4px', fontSize: '10px', color: 'inherit', outline: 'none' }}>
                  <option value="roadmap">Roadmap</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '' } })} style={{ padding: '2px 6px', fontSize: '10px', color: 'var(--danger-color)' }}>Change</button>
              </div>
            </div>
            {mapPins.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {mapPins.map((pin, i) => (
                  <span key={i} style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    📍 {pin.label || pin.address}
                    <button onClick={() => { const updated = mapPins.filter((_, j) => j !== i); updateBlock(pageId, block.id, { properties: { mapPins: updated } }); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'red', fontWeight: 700, padding: 0, fontSize: '11px' }}>&times;</button>
                  </span>
                ))}
              </div>
            )}
            <form onSubmit={e => { e.preventDefault(); if (newPin.trim()) { updateBlock(pageId, block.id, { properties: { mapPins: [...mapPins, { address: newPin, label: newPin }] } }); setNewPin(''); } }} style={{ display: 'flex', gap: '4px' }}>
              <input type="text" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="Add another pin address..." style={{ flexGrow: 1, padding: '3px 8px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'inherit', outline: 'none' }} />
              <button type="submit" className="cover-btn" style={{ padding: '3px 8px', fontSize: '10px' }}>📍 Pin</button>
            </form>
          </div>
        </div>
      ) : (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            updateBlock(pageId, block.id, { properties: { src: (e.currentTarget.elements.namedItem('gmapaddress') as HTMLInputElement).value } });
          }} 
          className="glass" 
          style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}
        >
          <Map size={16} style={{ color: '#1a73e8', alignSelf: 'center' }} />
          <input 
            name="gmapaddress"
            type="text" 
            placeholder="Enter address, city, or place (e.g. Empire State Building, New York)..." 
            className="search-input"
            style={{ border: '1px solid var(--border-color)', padding: '8px 12px', fontSize: '13px', flexGrow: 1 }}
          />
          <button type="submit" className="cover-btn" style={{ background: '#1a73e8', color: '#fff', fontWeight: 600 }}>📍 Pin Map</button>
        </form>
      )}
    </div>
  );
};

// ---------------- CODE BLOCK COMPONENT ----------------
interface CodeBlockProps {
  block: Block;
  pageId: string;
}

const CodeBlockComponent: React.FC<CodeBlockProps> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const lang = block.type === 'mermaid' ? 'mermaid' : (block.properties?.language || 'javascript');
  const isMermaid = lang === 'mermaid';
  const mermaidRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isMermaid && mermaidRef.current && block.content.trim()) {
      const renderMermaid = async () => {
        if (!(window as any).mermaid) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
          script.onload = () => {
            (window as any).mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
            doRender();
          };
          document.body.appendChild(script);
        } else {
          doRender();
        }
        async function doRender() {
          try {
            if (mermaidRef.current) {
              const id = 'mermaid-' + block.id.replace(/[^a-zA-Z0-9]/g, '');
              const { svg } = await (window as any).mermaid.render(id, block.content);
              if (mermaidRef.current) mermaidRef.current.innerHTML = svg;
            }
          } catch (err) {
            if (mermaidRef.current) mermaidRef.current.innerHTML = '<div style="color: var(--danger-color); font-size:12px;">⚠️ Mermaid syntax error. Check your diagram code.</div>';
          }
        }
      };
      renderMermaid();
    }
  }, [block.content, isMermaid]);

  return (
    <div className="block-code-wrapper" data-block-id={block.id}>
      <div className="block-code-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={14} />
          <select 
            style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
            value={lang}
            onChange={(e) => {
              if (block.type === 'mermaid' && e.target.value !== 'mermaid') {
                updateBlock(pageId, block.id, { type: 'code', properties: { language: e.target.value } });
              } else if (e.target.value === 'mermaid' && block.type !== 'mermaid') {
                updateBlock(pageId, block.id, { type: 'mermaid', properties: { language: 'mermaid' } });
              } else {
                updateBlock(pageId, block.id, { properties: { language: e.target.value } });
              }
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="json">JSON</option>
            <option value="bash">Bash</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="yaml">YAML</option>
            <option value="markdown">Markdown</option>
            <option value="mermaid">🧜 Mermaid Diagram</option>
          </select>
        </div>
        <button 
          className="block-code-copy-btn hover-bg"
          onClick={() => {
            navigator.clipboard.writeText(block.content);
          }}
        >
          Copy Code
        </button>
      </div>
      {isMermaid && block.content.trim() && (
        <div ref={mermaidRef} style={{ padding: '16px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', minHeight: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }} />
      )}
      <textarea
        className="block-code-textarea"
        value={block.content}
        onChange={(e) => updateBlock(pageId, block.id, { content: e.target.value })}
        placeholder={isMermaid ? 'graph TD\n  A[Start] --> B[Process]\n  B --> C{Decision}\n  C -->|Yes| D[End]\n  C -->|No| B' : '// Type your code here...'}
      />
    </div>
  );
};

// ---------------- MAIN BLOCK RENDERER COMPONENT ----------------
export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, index, pageId }) => {
  const {
    pages,
    activePageId,
    setActivePageId,
    updateBlock,
    deleteBlock,
    addBlock,
    addPage,
    setAutomationOpen,
    customAlert,
    customConfirm,
    customPrompt
  } = useApp();

  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [blockColorPickerOpen, setBlockColorPickerOpen] = useState(false);
  
  const colorsList = [
    { name: 'Default', value: 'inherit', bg: 'transparent' },
    { name: 'Red', value: '#e06c75', bg: '#ffebe9' },
    { name: 'Green', value: '#98c379', bg: '#e6ffed' },
    { name: 'Blue', value: '#61afef', bg: '#e6fffc' },
    { name: 'Yellow', value: '#d19a66', bg: '#fff5b8' },
    { name: 'Purple', value: '#c678dd', bg: '#fbeeff' }
  ];

  const blockStyle: React.CSSProperties = {
    color: block.properties?.textColor || 'inherit',
    backgroundColor: block.properties?.bgColor || 'transparent',
    padding: block.properties?.bgColor && block.properties?.bgColor !== 'transparent' ? '6px 10px' : undefined,
    borderRadius: block.properties?.bgColor && block.properties?.bgColor !== 'transparent' ? 'var(--border-radius-sm)' : undefined,
  };
  
  // Media states
  const [imageUrl, setImageUrl] = useState(block.properties?.src || '');
  const [videoUrl, setVideoUrl] = useState(block.properties?.src || '');
  const [audioUrl, setAudioUrl] = useState(block.properties?.src || '');
  const [fileUrl, setFileUrl] = useState(block.properties?.src || '');
  const [pdfUrl, setPdfUrl] = useState(block.properties?.src || '');
  const [embedUrl, setEmbedUrl] = useState(block.properties?.src || '');
  
  // Bookmark details states
  const [bookmarkUrl, setBookmarkUrl] = useState(block.properties?.src || '');
  const [bookmarkTitle, setBookmarkTitle] = useState(block.properties?.caption || 'Thomas Frank - Blocks Guide');
  const [bookmarkDesc, setBookmarkDesc] = useState(block.properties?.fileName || 'Comprehensive walkthrough of all content blocks.');
  const [bookmarkEdit, setBookmarkEdit] = useState(false);

  // Form block submission states
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});
  const [viewSubmissionsMode, setViewSubmissionsMode] = useState(false);

  // Comments local thread state
  const [newCommentAuthor, setNewCommentAuthor] = useState('User');
  const [newCommentText, setNewCommentText] = useState('');

  // Uptime session clock
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  const blockRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLDivElement>(null);

  // Load content
  useEffect(() => {
    if (blockRef.current && blockRef.current.innerHTML !== block.content) {
      if (document.activeElement !== blockRef.current) {
        blockRef.current.innerHTML = block.content;
      }
    }
  }, [block.content]);

  // Uptime ticker
  useEffect(() => {
    let interval: any = null;
    if (block.type === 'uptime') {
      interval = setInterval(() => {
        setUptimeSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [block.type]);

  const handleBlur = () => {
    if (blockRef.current) {
      updateBlock(pageId, block.id, { content: blockRef.current.innerHTML });
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    
    // Markdown Shortcuts
    if (text.startsWith('# ')) {
      e.currentTarget.innerText = text.slice(2);
      updateBlock(pageId, block.id, { type: 'h1', content: text.slice(2) });
      setSlashMenuOpen(false);
    } else if (text.startsWith('## ')) {
      e.currentTarget.innerText = text.slice(3);
      updateBlock(pageId, block.id, { type: 'h2', content: text.slice(3) });
      setSlashMenuOpen(false);
    } else if (text.startsWith('### ')) {
      e.currentTarget.innerText = text.slice(4);
      updateBlock(pageId, block.id, { type: 'h3', content: text.slice(4) });
      setSlashMenuOpen(false);
    } else if (text.startsWith('[] ') || text.startsWith('[ ] ')) {
      const sliceIdx = text.startsWith('[] ') ? 3 : 4;
      e.currentTarget.innerText = text.slice(sliceIdx);
      updateBlock(pageId, block.id, { type: 'todo', content: text.slice(sliceIdx), properties: { checked: false } });
      setSlashMenuOpen(false);
    } else if (text.startsWith('- ') || text.startsWith('* ')) {
      e.currentTarget.innerText = text.slice(2);
      updateBlock(pageId, block.id, { type: 'bullet', content: text.slice(2) });
      setSlashMenuOpen(false);
    } else if (text.startsWith('1. ')) {
      e.currentTarget.innerText = text.slice(3);
      updateBlock(pageId, block.id, { type: 'number', content: text.slice(3) });
      setSlashMenuOpen(false);
    } else if (text.startsWith('> ')) {
      e.currentTarget.innerText = text.slice(2);
      updateBlock(pageId, block.id, { type: 'quote', content: text.slice(2) });
      setSlashMenuOpen(false);
    } else if (text.startsWith('---')) {
      e.currentTarget.innerText = '';
      updateBlock(pageId, block.id, { type: 'divider', content: '' });
      setSlashMenuOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    if (e.key === '/') {
      setSlashMenuOpen(true);
    }

    if (e.key === 'Backspace' && (target.innerText.trim() === '' || target.innerHTML === '<br>')) {
      e.preventDefault();
      deleteBlock(pageId, block.id);
      
      const activePage = pages.find(p => p.id === pageId);
      if (activePage) {
        const idx = activePage.content.findIndex(b => b.id === block.id);
        if (idx > 0) {
          const prevBlock = activePage.content[idx - 1];
          setTimeout(() => {
            const prevEl = document.querySelector(`[data-block-id="${prevBlock.id}"]`) as HTMLElement;
            if (prevEl) {
              prevEl.focus();
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(prevEl);
              range.collapse(false);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }, 10);
        }
      }
    }

    if (e.key === 'Enter' && !slashMenuOpen) {
      e.preventDefault();
      const activePage = pages.find(p => p.id === pageId);
      if (activePage) {
        const idx = activePage.content.findIndex(b => b.id === block.id);
        const nextType = (block.type === 'bullet' || block.type === 'number' || block.type === 'todo') ? block.type : 'text';
        
        // If parent block is nested, append inside the parent
        const newBlockId = addBlock(pageId, nextType, undefined, idx + 1);
        setTimeout(() => {
          const newEl = document.querySelector(`[data-block-id="${newBlockId}"]`) as HTMLElement;
          newEl?.focus();
        }, 30);
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const activePage = pages.find(p => p.id === pageId);
      if (activePage) {
        const idx = activePage.content.findIndex(b => b.id === block.id);
        if (idx > 0) {
          const prevBlock = activePage.content[idx - 1];
          const prevEl = document.querySelector(`[data-block-id="${prevBlock.id}"]`) as HTMLElement;
          prevEl?.focus();
        }
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const activePage = pages.find(p => p.id === pageId);
      if (activePage) {
        const idx = activePage.content.findIndex(b => b.id === block.id);
        if (idx < activePage.content.length - 1) {
          const nextBlock = activePage.content[idx + 1];
          const nextEl = document.querySelector(`[data-block-id="${nextBlock.id}"]`) as HTMLElement;
          nextEl?.focus();
        }
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (block.type !== 'text') {
          updateBlock(pageId, block.id, { type: 'text' });
        }
      } else {
        if (block.type === 'text') {
          updateBlock(pageId, block.id, { type: 'bullet' });
        } else if (block.type === 'bullet') {
          updateBlock(pageId, block.id, { type: 'number' });
        }
      }
    }
  };

  const handleSelectSlashCommand = (type: Block['type']) => {
    if (blockRef.current) {
      const text = blockRef.current.innerText;
      if (text.endsWith('/')) {
        blockRef.current.innerText = text.slice(0, -1);
      }
    }

    let customProperties = undefined;
    let finalBlockType = type;

    if (type === 'database') {
      const subDbId = addPage(pageId, true, undefined, true);
      customProperties = { databaseId: subDbId };
    } else if (type.startsWith('database-')) {
      const viewType = type.replace('database-', '') as any;
      const subDbId = addPage(pageId, true, viewType, true);
      customProperties = { databaseId: subDbId };
      finalBlockType = 'database';
    } else if (type === 'page') {
      const subPageId = addPage(pageId, false);
      customProperties = { pageId: subPageId };
    }

    updateBlock(pageId, block.id, { 
      type: finalBlockType, 
      content: finalBlockType === 'database' || finalBlockType === 'page' ? '' : (blockRef.current?.innerHTML || ''), 
      properties: customProperties 
    });
    
    setSlashMenuOpen(false);
    
    setTimeout(() => {
      const updatedEl = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
      updatedEl?.focus();
    }, 50);
  };

  const duplicateBlock = () => {
    const activePage = pages.find(p => p.id === pageId);
    if (!activePage) return;
    const idx = activePage.content.findIndex(b => b.id === block.id);
    addBlock(pageId, block.type, undefined, idx + 1);
    setBlockMenuOpen(false);
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'h1': return 'Heading 1';
      case 'h2': return 'Heading 2';
      case 'h3': return 'Heading 3';
      case 'h4': return 'Heading 4';
      case 'toggle-h1': return 'Toggle Heading 1';
      case 'toggle-h2': return 'Toggle Heading 2';
      case 'toggle-h3': return 'Toggle Heading 3';
      case 'toggle-h4': return 'Toggle Heading 4';
      case 'quote': return 'Quote';
      case 'callout': return 'Callout message';
      default: return "Type '/' for commands...";
    }
  };

  // ---------------- TABLE MATRIX ACTIONS ----------------
  const handleTableCellBlur = (rowIdx: number, colIdx: number, val: string) => {
    const currentData = block.properties?.tableData ? [...block.properties.tableData.map(r => [...r])] : [['', ''], ['', '']];
    currentData[rowIdx][colIdx] = val;
    updateBlock(pageId, block.id, { properties: { tableData: currentData } });
  };

  const addTableRow = () => {
    const currentData = block.properties?.tableData ? [...block.properties.tableData.map(r => [...r])] : [['', ''], ['', '']];
    const cols = currentData[0]?.length || 2;
    currentData.push(new Array(cols).fill(''));
    updateBlock(pageId, block.id, { properties: { tableData: currentData } });
  };

  const addTableCol = () => {
    const currentData = block.properties?.tableData ? [...block.properties.tableData.map(r => [...r])] : [['', ''], ['', '']];
    currentData.forEach(row => row.push(''));
    updateBlock(pageId, block.id, { properties: { tableData: currentData } });
  };

  // ---------------- MEDIA ENVELOPE HANDLERS ----------------
  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'video' | 'audio' | 'file' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateBlock(pageId, block.id, {
        properties: {
          src: dataUrl,
          caption: file.name,
          fileName: file.name,
          fileSize: (Math.round(file.size / 1024)) + ' KB',
          fileType: file.type
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const saveMediaUrl = (e: React.FormEvent, urlVal: string) => {
    e.preventDefault();
    updateBlock(pageId, block.id, { 
      properties: { 
        src: urlVal, 
        caption: 'External Web Media', 
        fileName: 'attachment-link', 
        fileSize: 'External Link' 
      } 
    });
  };

  // ---------------- TEMPLATE BUTTON TRIGGER ----------------
  const triggerTemplateInsert = () => {
    const activePage = pages.find(p => p.id === pageId);
    if (!activePage) return;
    const idx = activePage.content.findIndex(b => b.id === block.id);
    const templateItems = block.properties?.templateBlocks || [{ id: generateId(), type: 'todo', content: 'New checklist item' }];
    
    templateItems.forEach((item, tIdx) => {
      const copyId = generateId();
      addBlock(pageId, item.type, undefined, idx + 1 + tIdx);
      setTimeout(() => {
        updateBlock(pageId, copyId, { content: item.content, properties: item.properties });
      }, 50);
    });
  };

  // ---------------- BREADCRUMBS PATHS ----------------
  const getBreadcrumbsList = () => {
    const crumbs: Page[] = [];
    const activePage = pages.find(p => p.id === pageId);
    let current: Page | undefined = activePage;
    while (current) {
      crumbs.unshift(current);
      if (current.parentId) {
        current = pages.find((p) => p.id === current!.parentId);
      } else {
        current = undefined;
      }
    }
    return crumbs;
  };

  // ---------------- TABLE OF CONTENTS LIST ----------------
  const getPageHeadingsOutline = () => {
    const headings: { id: string; text: string; level: number }[] = [];
    const scan = (blocks: Block[]) => {
      blocks.forEach(b => {
        const headingTypes = ['h1', 'h2', 'h3', 'h4', 'toggle-h1', 'toggle-h2', 'toggle-h3', 'toggle-h4'];
        if (headingTypes.includes(b.type)) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = b.content;
          const levelName = b.type.includes('h1') ? 1 : b.type.includes('h2') ? 2 : b.type.includes('h3') ? 3 : 4;
          headings.push({ id: b.id, text: tempDiv.innerText || b.content || 'Heading', level: levelName });
        }
        if (b.children) scan(b.children);
      });
    };
    const activePage = pages.find(p => p.id === pageId);
    if (activePage) scan(activePage.content);
    return headings;
  };

  // ---------------- FORM SUBMISSION HANDLER ----------------
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subs = block.properties?.formSubmissions || [];
    updateBlock(pageId, block.id, {
      properties: {
        formSubmissions: [...subs, { ...formResponses, timestamp: new Date().toLocaleString() }]
      }
    });
    setFormResponses({});
    customAlert('Form response submitted successfully! 📄');
  };

  // ---------------- COMMENTS TIMELINE ACTION ----------------
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const thread = block.properties?.comments || [];
    const newComment = {
      id: generateId(),
      author: newCommentAuthor,
      text: newCommentText,
      timestamp: Date.now()
    };
    updateBlock(pageId, block.id, {
      properties: {
        comments: [...thread, newComment]
      }
    });
    setNewCommentText('');
  };

  // ---------------- SYNCED SOURCE LOOKUP ----------------
  const findSyncedSourceNode = (sId: string): Block | null => {
    let source: Block | null = null;
    pages.forEach(p => {
      const checkNode = (blocks: Block[]) => {
        blocks.forEach(b => {
          if (b.id === sId) {
            source = b;
          }
          if (b.children) checkNode(b.children);
        });
      };
      checkNode(p.content);
      p.dbRows?.forEach(r => checkNode(r.content));
    });
    return source;
  };

  const renderBlockContent = () => {
    // Check if this block type is a universal embed
    const embedTypes = getEmbedTypes();
    if (embedTypes.includes(block.type)) {
      return <UniversalEmbed block={block} pageId={pageId} />;
    }

    switch (block.type) {
      // 1. HEADINGS AND TEXTS
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
        const hClass = block.type === 'h1' ? 'block-h1' : block.type === 'h2' ? 'block-h2' : block.type === 'h3' ? 'block-h3' : 'block-h4';
        return (
          <div
            ref={blockRef}
            data-block-id={block.id}
            contentEditable
            className={`block-editor-content ${hClass}`}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            data-placeholder={getPlaceholder()}
            style={blockStyle}
          />
        );
      
      // 2. TOGGLE HEADINGS (DYNAMIC NESTING)
      case 'toggle-h1':
      case 'toggle-h2':
      case 'toggle-h3':
      case 'toggle-h4':
        const thClass = block.type === 'toggle-h1' ? 'block-h1' : block.type === 'toggle-h2' ? 'block-h2' : block.type === 'toggle-h3' ? 'block-h3' : 'block-h4';
        return (
          <div style={{ width: '100%', margin: '6px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                className="sidebar-collapse-toggle"
                onClick={() => updateBlock(pageId, block.id, { properties: { open: !block.properties?.open } })}
                style={{ height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={18} className={`block-toggle-arrow ${block.properties?.open ? 'open' : ''}`} />
              </button>
              <div
                ref={blockRef}
                data-block-id={block.id}
                contentEditable
                className={`block-editor-content ${thClass}`}
                style={{ flexGrow: 1, margin: 0, minHeight: '30px' }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                data-placeholder={getPlaceholder()}
              />
            </div>
            {block.properties?.open && (
              <div style={{ paddingLeft: '28px', borderLeft: '2px dashed var(--border-color)', marginLeft: '16px', marginTop: '6px' }}>
                {block.children && block.children.length > 0 ? (
                  block.children.map((child, cIdx) => (
                    <BlockRenderer key={child.id} block={child} index={cIdx} pageId={pageId} />
                  ))
                ) : (
                  <button 
                    onClick={() => addBlock(pageId, 'text', block.id)} 
                    className="cover-btn"
                    style={{ fontSize: '11px', padding: '3px 8px', marginTop: '4px' }}
                  >
                    + Add block inside toggle heading
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'todo':
        return (
          <div className="block-todo-container">
            <button 
              className={`block-todo-checkbox ${block.properties?.checked ? 'checked' : ''}`}
              onClick={() => updateBlock(pageId, block.id, { properties: { checked: !block.properties?.checked } })}
            >
              {block.properties?.checked && <CheckSquare size={14} style={{ strokeWidth: 3 }} />}
            </button>
            <div
              ref={blockRef}
              data-block-id={block.id}
              contentEditable
              className={`block-editor-content block-todo-text ${block.properties?.checked ? 'checked' : ''}`}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              data-placeholder={getPlaceholder()}
              style={blockStyle}
            />
          </div>
        );

      case 'bullet':
        return (
          <div className="block-bullet-item">
            <div className="block-bullet-dot" />
            <div
              ref={blockRef}
              data-block-id={block.id}
              contentEditable
              className="block-editor-content"
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              data-placeholder={getPlaceholder()}
              style={blockStyle}
            />
          </div>
        );

      case 'number':
        return (
          <div className="block-number-item">
            <span className="block-number-prefix">{index + 1}.</span>
            <div
              ref={blockRef}
              data-block-id={block.id}
              contentEditable
              className="block-editor-content"
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              data-placeholder={getPlaceholder()}
              style={blockStyle}
            />
          </div>
        );

      case 'toggle':
        return (
          <div style={{ width: '100%' }}>
            <div className="block-toggle-summary">
              <button 
                className="sidebar-collapse-toggle"
                onClick={() => updateBlock(pageId, block.id, { properties: { open: !block.properties?.open } })}
              >
                <ChevronRight size={14} className={`block-toggle-arrow ${block.properties?.open ? 'open' : ''}`} />
              </button>
              <div
                ref={blockRef}
                data-block-id={block.id}
                contentEditable
                className="block-editor-content"
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                data-placeholder="Toggle list summary..."
                style={blockStyle}
              />
            </div>
            {block.properties?.open && (
              <div className="block-toggle-nested" style={{ paddingLeft: '28px', borderLeft: '2px dashed var(--border-color)', marginLeft: '14px', marginTop: '6px' }}>
                {block.children && block.children.length > 0 ? (
                  block.children.map((child, cIdx) => (
                    <BlockRenderer key={child.id} block={child} index={cIdx} pageId={pageId} />
                  ))
                ) : (
                  <button 
                    onClick={() => addBlock(pageId, 'text', block.id)} 
                    className="cover-btn"
                    style={{ fontSize: '11px', padding: '3px 8px', marginTop: '4px' }}
                  >
                    + Add block inside toggle
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'quote':
        return (
          <div className="block-quote" style={{ width: '100%' }}>
            <div
              ref={blockRef}
              data-block-id={block.id}
              contentEditable
              className="block-editor-content"
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              data-placeholder={getPlaceholder()}
              style={blockStyle}
            />
          </div>
        );

      case 'callout':
        const calloutColor = block.properties?.calloutColor || 'info';
        return (
          <div className={`block-callout ${calloutColor}`}>
            <span style={{ fontSize: '20px' }}>{block.properties?.calloutIcon || '💡'}</span>
            <div
              ref={blockRef}
              data-block-id={block.id}
              contentEditable
              className="block-editor-content"
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              data-placeholder={getPlaceholder()}
            />
          </div>
        );

      case 'divider':
        return (
          <div style={{ width: '100%', padding: '10px 0' }} data-block-id={block.id}>
            <hr style={{ border: 'none', borderTop: '2px solid var(--border-color)', width: '100%' }} />
          </div>
        );

      case 'page':
        const targetPageId = block.properties?.pageId;
        const targetPage = pages.find(p => p.id === targetPageId);
        
        return (
          <div style={{ width: '100%', margin: '8px 0' }} data-block-id={block.id}>
            {targetPage ? (
              <div 
                className="glass hover-bg" 
                style={{ padding: '12px 18px', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                onClick={() => setActivePageId(targetPage.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{targetPage.icon || '📄'}</span>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{targetPage.title || 'Untitled Page'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <span>Nested Child Page</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            ) : (
              <div className="glass" style={{ padding: '14px', borderRadius: 'var(--border-radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span>Sub-page placeholder. Connecting to document flow...</span>
              </div>
            )}
          </div>
        );

      // 3. LAYOUTS
      case 'column-list':
        return (
          <div className="block-column-list" style={{ display: 'flex', gap: '16px', width: '100%', margin: '12px 0', overflowX: 'auto' }}>
            {block.children && block.children.length > 0 ? (
              block.children.map((childCol, idx) => (
                <BlockRenderer key={childCol.id} block={childCol} index={idx} pageId={pageId} />
              ))
            ) : (
              <div style={{ flexGrow: 1, display: 'flex', gap: '8px' }}>
                <button onClick={() => addBlock(pageId, 'column', block.id)} className="cover-btn">+ Add Column 1</button>
                <button onClick={() => addBlock(pageId, 'column', block.id)} className="cover-btn">+ Add Column 2</button>
              </div>
            )}
          </div>
        );

      case 'column':
        return (
          <div className="block-column" style={{ flex: 1, minWidth: '150px', padding: '10px', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius-md)', background: 'rgba(0,0,0,0.01)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-placeholder)', textTransform: 'uppercase', marginBottom: '6px' }}>Column Block</div>
            {block.children && block.children.length > 0 ? (
              block.children.map((childBlock, idx) => (
                <BlockRenderer key={childBlock.id} block={childBlock} index={idx} pageId={pageId} />
              ))
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-placeholder)', fontStyle: 'italic' }}>Column is empty</span>
            )}
            <button 
              onClick={() => addBlock(pageId, 'text', block.id)}
              className="cover-btn"
              style={{ fontSize: '10px', padding: '3px 8px', marginTop: '6px', width: '100%' }}
            >
              + Add block inside column
            </button>
          </div>
        );

      case 'synced-block':
        const sSourceId = block.properties?.syncedBlockId || block.id;
        const sourceNode = findSyncedSourceNode(sSourceId) || block;
        const isSelfSource = sourceNode.id === block.id;

        return (
          <div 
            style={{ 
              width: '100%', 
              margin: '12px 0', 
              padding: '16px', 
              border: '2px dashed var(--warning-color)', 
              borderRadius: 'var(--border-radius-md)',
              position: 'relative',
              backgroundColor: 'rgba(235,203,139,0.03)'
            }}
          >
            <div 
              style={{ 
                position: 'absolute', 
                top: '-10px', 
                right: '10px', 
                background: 'var(--warning-color)', 
                color: 'var(--bg-primary)', 
                fontSize: '9px', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={10} className="spin" />
              <span>Synced Block ({isSelfSource ? 'Source' : 'Copy'})</span>
            </div>
            
            <div style={{ marginTop: '4px' }}>
              {sourceNode.children && sourceNode.children.length > 0 ? (
                sourceNode.children.map((child, idx) => (
                  <BlockRenderer key={child.id} block={child} index={idx} pageId={pageId} />
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-placeholder)', fontStyle: 'italic' }}>Synced container empty. Add blocks below:</span>
              )}
            </div>
            
            <button 
              onClick={() => addBlock(pageId, 'text', sourceNode.id)}
              className="cover-btn"
              style={{ fontSize: '11px', padding: '3px 8px', marginTop: '8px' }}
            >
              + Append block to Synced Container
            </button>
          </div>
        );

      // 4. CODE BLOCK (with Mermaid support)
      case 'code':
        return <CodeBlockComponent block={block} pageId={pageId} />;

      // 5. RICH MEDIA BLOCKS (UPLOAD + PREVIEW PLAYERS)
      case 'image':
      case 'video':
      case 'audio':
      case 'file':
      case 'pdf':
        const src = block.properties?.src;
        const name = block.properties?.fileName || 'media-attachment';
        const size = block.properties?.fileSize || 'Unknown size';
        
        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {src ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
                {block.type === 'image' && (
                  <img src={src} alt={name} style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block' }} />
                )}
                {block.type === 'video' && (
                  <video src={src} controls style={{ width: '100%', maxHeight: '420px', display: 'block', outline: 'none' }} />
                )}
                {block.type === 'audio' && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Volume2 size={24} style={{ color: 'var(--accent-color)' }} />
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{name}</span>
                    </div>
                    <audio src={src} controls style={{ width: '100%', outline: 'none' }} />
                  </div>
                )}
                {block.type === 'file' && (
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={28} style={{ color: 'var(--accent-color)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{size}</span>
                      </div>
                    </div>
                    <a href={src} download={name} className="cover-btn" style={{ textDecoration: 'none', background: 'var(--accent-color)', color: 'white' }}>
                      Download Attachment
                    </a>
                  </div>
                )}
                {block.type === 'pdf' && (
                  <div style={{ width: '100%' }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', background: 'var(--bg-tertiary)' }}>
                      <span style={{ fontWeight: 600 }}>PDF Viewer: {name}</span>
                      <a href={src} download={name} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Download</a>
                    </div>
                    <iframe src={src} style={{ width: '100%', height: '500px', border: 'none' }} title="PDF embed renderer" />
                  </div>
                )}
                <button 
                  className="cover-btn"
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', zIndex: 10 }}
                  onClick={() => updateBlock(pageId, block.id, { properties: { src: '', fileName: '', fileSize: '' } })}
                >
                  Change file / link
                </button>
              </div>
            ) : (
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--border-color)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Upload local {block.type} or Paste url
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Local file upload */}
                  <label className="cover-btn" style={{ cursor: 'pointer', width: 'fit-content', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Upload size={14} />
                    <span>Upload from computer</span>
                    <input 
                      type="file" 
                      accept={block.type === 'image' ? 'image/*' : block.type === 'video' ? 'video/*' : block.type === 'audio' ? 'audio/*' : block.type === 'pdf' ? 'application/pdf' : '*/*'}
                      style={{ display: 'none' }} 
                      onChange={(e) => handleLocalUpload(e, block.type as any)}
                    />
                  </label>
                  
                  <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-placeholder)', alignItems: 'center' }}>
                    <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
                    <span>OR EMBED EMBEDDED URL</span>
                    <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
                  </div>

                  <form 
                    onSubmit={(e) => {
                      const inputMap: Record<string, string> = {
                        image: imageUrl, video: videoUrl, audio: audioUrl, file: fileUrl, pdf: pdfUrl
                      };
                      saveMediaUrl(e, inputMap[block.type]);
                    }} 
                    style={{ display: 'flex', gap: '8px' }}
                  >
                    <input 
                      type="text" 
                      placeholder={`Paste standard web link URL for ${block.type}...`} 
                      className="search-input"
                      style={{ border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--border-radius-md)', fontSize: '13px', flexGrow: 1 }}
                      value={
                        block.type === 'image' ? imageUrl : 
                        block.type === 'video' ? videoUrl : 
                        block.type === 'audio' ? audioUrl : 
                        block.type === 'file' ? fileUrl : pdfUrl
                      }
                      onChange={(e) => {
                        const setterMap: Record<string, any> = {
                          image: setImageUrl, video: setVideoUrl, audio: setAudioUrl, file: setFileUrl, pdf: setPdfUrl
                        };
                        setterMap[block.type](e.target.value);
                      }}
                    />
                    <button type="submit" className="cover-btn">Link</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'embed':
        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {block.properties?.src ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', background: 'var(--bg-secondary)', fontSize: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Web Frame Embed</span>
                  <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '' } })} style={{ padding: '2px 8px', fontSize: '10px' }}>Remove</button>
                </div>
                <iframe src={block.properties.src} style={{ width: '100%', height: '450px', border: 'none', background: '#fff' }} title="External Web Iframe Embed" />
              </div>
            ) : (
              <form onSubmit={(e) => saveMediaUrl(e, embedUrl)} className="glass" style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}>
                <Globe size={16} style={{ color: 'var(--accent-color)', alignSelf: 'center' }} />
                <input 
                  type="text" 
                  placeholder="Paste URL address to embed (YouTube, Google Maps, Figma etc)..." 
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                />
                <button type="submit" className="cover-btn">Embed</button>
              </form>
            )}
          </div>
        );

      case 'bookmark':
      case 'link-preview':
        const bUrl = block.properties?.src;
        return (
          <div style={{ width: '100%', margin: '12px 0' }} data-block-id={block.id}>
            {bUrl ? (
              <div 
                className="glass hover-bg"
                style={{ 
                  borderRadius: 'var(--border-radius-lg)', 
                  border: '1px solid var(--border-color)', 
                  display: 'flex', 
                  overflow: 'hidden', 
                  minHeight: '110px', 
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => window.open(bUrl, '_blank')}
              >
                <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {block.properties?.caption || 'Web Bookmark Link'}
                    </h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, maxHeight: '34px', overflow: 'hidden' }}>
                      {block.properties?.fileName || 'Open and preview external bookmarks.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-color)' }}>
                    <Bookmark size={12} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>{bUrl}</span>
                  </div>
                </div>
                
                {/* Visual Default Gradient Thumbnail representation */}
                <div style={{ width: '150px', background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--bg-tertiary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={32} style={{ color: 'white', opacity: 0.7 }} />
                </div>

                <div 
                  style={{ position: 'absolute', bottom: '6px', right: '6px', display: 'flex', gap: '4px' }} 
                  onClick={e => e.stopPropagation()}
                >
                  <button className="cover-btn" onClick={() => setBookmarkEdit(!bookmarkEdit)} style={{ padding: '2px 6px', fontSize: '9px' }}>Edit metadata</button>
                  <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '', caption: '', fileName: '' } })} style={{ padding: '2px 6px', fontSize: '9px', background: 'rgba(255,0,0,0.1)', color: 'red' }}>Remove</button>
                </div>

                {bookmarkEdit && (
                  <div className="glass" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '10px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Customize Title" 
                      value={bookmarkTitle} 
                      onChange={e => setBookmarkTitle(e.target.value)} 
                      className="search-input" 
                      style={{ padding: '3px 8px', fontSize: '12px' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Customize Description" 
                      value={bookmarkDesc} 
                      onChange={e => setBookmarkDesc(e.target.value)} 
                      className="search-input" 
                      style={{ padding: '3px 8px', fontSize: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="cover-btn" onClick={() => {
                        updateBlock(pageId, block.id, { properties: { caption: bookmarkTitle, fileName: bookmarkDesc } });
                        setBookmarkEdit(false);
                      }}>Apply Settings</button>
                      <button className="cover-btn" onClick={() => setBookmarkEdit(false)}>Close</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBlock(pageId, block.id, { properties: { src: bookmarkUrl, caption: bookmarkTitle, fileName: bookmarkDesc } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}
              >
                <Bookmark size={16} style={{ color: 'var(--accent-color)', alignSelf: 'center' }} />
                <input 
                  type="text" 
                  placeholder="Paste URL address to create a Bookmark card..." 
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                  value={bookmarkUrl}
                  onChange={(e) => setBookmarkUrl(e.target.value)}
                />
                <button type="submit" className="cover-btn">Bookmark</button>
              </form>
            )}
          </div>
        );

      // 6. SIMPLE TABLE MATRIX
      case 'table':
        const tableData = block.properties?.tableData || [['', ''], ['', '']];
        return (
          <div style={{ width: '100%', overflowX: 'auto' }} data-block-id={block.id}>
            <table className="block-table">
              <tbody>
                {tableData.map((row, rIdx) => (
                  <tr key={`row-${rIdx}`}>
                    {row.map((cell, cIdx) => (
                      <td 
                        key={`cell-${rIdx}-${cIdx}`}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleTableCellBlur(rIdx, cIdx, e.currentTarget.innerText)}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button onClick={addTableRow} className="cover-btn" style={{ padding: '4px 8px', fontSize: '11px' }}>
                <PlusCircle size={12} /> Add Row
              </button>
              <button onClick={addTableCol} className="cover-btn" style={{ padding: '4px 8px', fontSize: '11px' }}>
                <PlusCircle size={12} /> Add Column
              </button>
            </div>
          </div>
        );

      case 'database':
        return <DatabaseBlock pageId={pageId} blockId={block.id} />;

      // 7. SPECIAL BLOCKS (MATH, Whiteboard drawing canvas shape)
      case 'equation':
        return <MathEquation block={block} pageId={pageId} />;

      case 'shape':
        return <SketchBoard block={block} pageId={pageId} />;

      case 'link-to-page':
        const selectedPageId = block.properties?.pageId;
        const pageTarget = pages.find(p => p.id === selectedPageId);
        
        return (
          <div style={{ width: '100%', padding: '6px 0' }} data-block-id={block.id}>
            {pageTarget ? (
              <button 
                className="cover-btn" 
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}
                onClick={() => setActivePageId(pageTarget.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{pageTarget.icon || '📄'}</span>
                  <span style={{ fontWeight: 600 }}>Link to: {pageTarget.title}</span>
                </span>
                <ExternalLink size={12} />
              </button>
            ) : (
              <div className="glass" style={{ padding: '10px', borderRadius: 'var(--border-radius-sm)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Link to Page:</span>
                <select 
                  onChange={(e) => updateBlock(pageId, block.id, { properties: { pageId: e.target.value } })}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', fontSize: '12px' }}
                >
                  <option value="">-- Choose page --</option>
                  {pages.filter(p => p.id !== pageId).map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );

      case 'template-button':
        const tempText = block.properties?.buttonText || 'Add New checklist';
        return (
          <div 
            style={{ 
              width: '100%', 
              padding: '14px', 
              border: '1px dashed var(--accent-color)', 
              borderRadius: 'var(--border-radius-md)', 
              margin: '8px 0',
              backgroundColor: 'rgba(94,129,172,0.02)'
            }}
            data-block-id={block.id}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <Layers size={13} />
                <span>Template Multiplicator</span>
              </div>
              <input 
                type="text" 
                value={tempText} 
                onChange={(e) => updateBlock(pageId, block.id, { properties: { buttonText: e.target.value } })}
                className="search-input" 
                style={{ width: '150px', padding: '2px 6px', fontSize: '11px' }}
                placeholder="Button text..."
              />
            </div>
            
            <button 
              onClick={triggerTemplateInsert} 
              className="cover-btn"
              style={{ width: '100%', padding: '8px', background: 'var(--accent-color)', color: 'white', fontWeight: 600 }}
            >
              + {tempText}
            </button>
          </div>
        );

      case 'breadcrumb':
        const crumbs = getBreadcrumbsList();
        return (
          <div 
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--border-radius-sm)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              margin: '6px 0',
              flexWrap: 'wrap'
            }}
            data-block-id={block.id}
          >
            <MapPin size={12} style={{ color: 'var(--text-placeholder)' }} />
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <span 
                  style={{ fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => setActivePageId(crumb.id)}
                  className="breadcrumb-item"
                >
                  {crumb.icon && <span style={{ marginRight: '4px' }}>{crumb.icon}</span>}
                  {crumb.title}
                </span>
                {idx < crumbs.length - 1 && <span style={{ color: 'var(--text-placeholder)', fontSize: '11px' }}>/</span>}
              </React.Fragment>
            ))}
          </div>
        );

      case 'toc':
        const outline = getPageHeadingsOutline();
        return (
          <div 
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius-lg)',
              margin: '10px 0'
            }}
            data-block-id={block.id}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <ListCollapse size={14} style={{ color: 'var(--accent-color)' }} />
              <h5 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Table of Contents</h5>
              <span style={{ fontSize: '10px', color: 'var(--text-placeholder)', marginLeft: 'auto' }}>{outline.length} headings</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {outline.map((h, idx) => (
                <div 
                  key={h.id} 
                  style={{ 
                    cursor: 'pointer', 
                    color: 'var(--accent-color)', 
                    fontSize: h.level === 1 ? '14px' : h.level === 2 ? '13px' : '12px', 
                    fontWeight: h.level === 1 ? 700 : h.level === 2 ? 600 : 500,
                    padding: '4px 6px',
                    paddingLeft: `${(h.level - 1) * 20 + 6}px`,
                    borderRadius: '4px',
                    transition: 'background 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }} 
                  onClick={() => {
                    const activePage = pages.find(p => p.id === pageId);
                    if (activePage) {
                      const findPathToBlock = (blocks: Block[], targetId: string, currentPath: Block[] = []): Block[] | null => {
                        for (const b of blocks) {
                          if (b.id === targetId) {
                            return currentPath;
                          }
                          if (b.children && b.children.length > 0) {
                            const res = findPathToBlock(b.children, targetId, [...currentPath, b]);
                            if (res) return res;
                          }
                        }
                        return null;
                      };
                      const path = findPathToBlock(activePage.content, h.id);
                      if (path && path.length > 0) {
                        path.forEach(parent => {
                          if (parent.type.startsWith('toggle') && !parent.properties?.open) {
                            updateBlock(pageId, parent.id, { properties: { open: true } });
                          }
                        });
                      }
                    }

                    setTimeout(() => {
                      const el = document.querySelector(`[data-block-id="${h.id}"]`) as HTMLElement;
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Flash highlight effect
                        el.style.transition = 'background-color 0.3s';
                        el.style.backgroundColor = 'var(--accent-light, rgba(94,129,172,0.15))';
                        setTimeout(() => {
                          el.style.backgroundColor = '';
                        }, 1500);
                        el.focus();
                      }
                    }, 100);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: 'var(--text-placeholder)', fontSize: '10px', minWidth: '14px' }}>{h.level === 1 ? '■' : h.level === 2 ? '◆' : h.level === 3 ? '●' : '○'}</span>
                  <span>{h.text}</span>
                </div>
              ))}
              {outline.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📑</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-placeholder)' }}>Add Heading blocks (H1, H2, H3, H4) to auto-generate a table of contents.</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'button':
        const btnCount = block.properties?.buttonCount || 0;
        const bText = block.properties?.buttonText || 'Click Action';
        const bAction = block.properties?.buttonAction || 'alert';

        return (
          <div 
            style={{ width: '100%', padding: '6px 0', display: 'flex', gap: '8px', alignItems: 'center' }} 
            data-block-id={block.id}
          >
            <button 
              className="cover-btn"
              style={{ background: 'var(--accent-color)', color: 'white', fontWeight: 600, padding: '8px 16px' }}
              onClick={() => {
                if (bAction === 'alert') {
                  customAlert(`Action Triggered: ${bText} clicked!`);
                } else if (bAction === 'count') {
                  updateBlock(pageId, block.id, { properties: { buttonCount: btnCount + 1 } });
                } else if (bAction === 'add-text') {
                  addBlock(pageId, 'text', undefined, index + 1);
                }
              }}
            >
              <PlaySquare size={14} style={{ marginRight: '6px' }} />
              {bText} {bAction === 'count' && `(${btnCount})`}
            </button>

            <select
              value={bAction}
              onChange={(e) => updateBlock(pageId, block.id, { properties: { buttonAction: e.target.value as any } })}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', fontSize: '11px' }}
            >
              <option value="alert">Trigger Alert popup</option>
              <option value="count">Count Click metrics</option>
              <option value="add-text">Insert Text block below</option>
            </select>
          </div>
        );

      // 8. DYNAMIC BLOCKS
      case 'date':
        const dVal = block.properties?.dateValue || new Date().toISOString().split('T')[0];
        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', margin: '4px 0' }}
            data-block-id={block.id}
          >
            <Calendar size={13} style={{ color: 'var(--accent-color)' }} />
            <input 
              type="date" 
              value={dVal}
              onChange={(e) => updateBlock(pageId, block.id, { properties: { dateValue: e.target.value } })}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            />
          </div>
        );

      case 'uptime':
        const formatUptime = (total: number) => {
          const h = Math.floor(total / 3600).toString().padStart(2, '0');
          const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
          const s = (total % 60).toString().padStart(2, '0');
          return `${h}:${m}:${s}`;
        };

        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid var(--success-color)', borderRadius: 'var(--border-radius-md)', margin: '4px 0' }}
            data-block-id={block.id}
          >
            <Activity size={13} className="pulse" style={{ color: 'var(--success-color)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Active Session Clock:</span>
            <code style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatUptime(uptimeSeconds)}</code>
          </div>
        );

      case 'mention':
        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', background: 'var(--accent-light)', border: '1px solid var(--accent-color)', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0' }}
            data-block-id={block.id}
          >
            <User size={12} />
            <div
              ref={blockRef}
              data-block-id={block.id}
              contentEditable
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{ outline: 'none', border: 'none', background: 'transparent' }}
              data-placeholder="Mention name..."
            />
          </div>
        );

      case 'meta':
        const pageText = pages.find(p => p.id === pageId)?.content.map(b => b.content).join(' ') || '';
        const charCount = pageText.length;
        const wordCount = pageText.split(/\s+/).filter(Boolean).length;
        const readTime = Math.ceil(wordCount / 200);

        return (
          <div 
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius-lg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              textAlign: 'center',
              margin: '10px 0'
            }}
            data-block-id={block.id}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: 800 }}>{wordCount}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Words count</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '18px', fontWeight: 800 }}>{charCount}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Characters</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: 800 }}>{readTime} min</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Reading time</span>
            </div>
          </div>
        );

      case 'feedback':
        const fCount = block.properties?.feedbackCount || { up: 0, down: 0 };
        return (
          <div 
            style={{ 
              width: '100%', 
              padding: '12px 18px', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--border-radius-md)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              margin: '6px 0'
            }}
            data-block-id={block.id}
          >
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Was this workspace layout helpful?</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`cover-btn ${fCount.selected === 'up' ? 'active' : ''}`}
                style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', background: fCount.selected === 'up' ? 'rgba(0,255,0,0.1)' : 'transparent' }}
                onClick={() => {
                  const currentSelected = fCount.selected === 'up' ? undefined : 'up';
                  const upVal = fCount.up + (currentSelected === 'up' ? 1 : -1);
                  const downVal = fCount.down + (fCount.selected === 'down' ? -1 : 0);
                  updateBlock(pageId, block.id, { properties: { feedbackCount: { up: upVal, down: downVal, selected: currentSelected } } });
                }}
              >
                <ThumbsUp size={13} />
                <span>{fCount.up}</span>
              </button>
              <button 
                className={`cover-btn ${fCount.selected === 'down' ? 'active' : ''}`}
                style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', background: fCount.selected === 'down' ? 'rgba(255,0,0,0.1)' : 'transparent' }}
                onClick={() => {
                  const currentSelected = fCount.selected === 'down' ? undefined : 'down';
                  const downVal = fCount.down + (currentSelected === 'down' ? 1 : -1);
                  const upVal = fCount.up + (fCount.selected === 'up' ? -1 : 0);
                  updateBlock(pageId, block.id, { properties: { feedbackCount: { up: upVal, down: downVal, selected: currentSelected } } });
                }}
              >
                <ThumbsDown size={13} />
                <span>{fCount.down}</span>
              </button>
            </div>
          </div>
        );

      case 'form':
        const formFields = block.properties?.formFields || [{ id: 'feedback', label: 'Comments', type: 'text' }];
        const subsList = block.properties?.formSubmissions || [];

        return (
          <div 
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius-lg)',
              margin: '12px 0'
            }}
            data-block-id={block.id}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Form Questionnaire ({subsList.length})</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className={`cover-btn ${!viewSubmissionsMode ? 'active' : ''}`} style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => setViewSubmissionsMode(false)}>Form View</button>
                <button className={`cover-btn ${viewSubmissionsMode ? 'active' : ''}`} style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => setViewSubmissionsMode(true)}>Submissions Dashboard</button>
              </div>
            </div>

            {!viewSubmissionsMode ? (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formFields.map(field => (
                  <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>{field.label}:</label>
                    <input 
                      type={field.type}
                      className="search-input"
                      required
                      style={{ padding: '6px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}
                      value={formResponses[field.id] || ''}
                      onChange={(e) => setFormResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                    />
                  </div>
                ))}
                <button type="submit" className="cover-btn" style={{ background: 'var(--accent-color)', color: 'white', fontWeight: 600, alignSelf: 'flex-start', marginTop: '6px' }}>Submit Response</button>
              </form>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="block-table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                      <th style={{ padding: '6px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--border-color)', textAlign: 'left' }}>Time</th>
                      {formFields.map(f => (
                        <th key={`th-${f.id}`} style={{ padding: '6px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--border-color)', textAlign: 'left' }}>{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subsList.map((sub, sIdx) => (
                      <tr key={`sub-${sIdx}`}>
                        <td style={{ padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)' }}>{sub.timestamp || 'N/A'}</td>
                        {formFields.map(f => (
                          <td key={`sub-cell-${f.id}`} style={{ padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)' }}>{sub[f.id] || ''}</td>
                        ))}
                      </tr>
                    ))}
                    {subsList.length === 0 && (
                      <tr>
                        <td colSpan={formFields.length + 1} style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-placeholder)', padding: '12px' }}>No submissions yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {subsList.length > 0 && (
                  <button 
                    onClick={() => updateBlock(pageId, block.id, { properties: { formSubmissions: [] } })}
                    className="cover-btn" 
                    style={{ marginTop: '10px', fontSize: '11px', padding: '3px 8px', color: 'red', background: 'rgba(255,0,0,0.05)' }}
                  >
                    Clear all submissions
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'comment':
        const comments = block.properties?.comments || [];
        return (
          <div 
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius-lg)',
              margin: '12px 0'
            }}
            data-block-id={block.id}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <MessageSquare size={14} style={{ color: 'var(--accent-color)' }} />
              <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Discussion Comments Thread ({comments.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', maxHeight: '250px', overflowY: 'auto' }}>
              {comments.map((c, cIdx) => (
                <div key={c.id || cIdx} style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent-color)' }}>{c.author}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{new Date(c.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ fontSize: '13px', margin: 0 }}>{c.text}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <span style={{ fontStyle: 'italic', fontSize: '12px', color: 'var(--text-placeholder)', textAlign: 'center', display: 'block', padding: '8px 0' }}>No comments posted yet.</span>
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  className="search-input"
                  style={{ width: '80px', padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}
                  placeholder="Name"
                />
                <input 
                  type="text" 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="search-input"
                  style={{ flexGrow: 1, padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}
                  placeholder="Write a comment..."
                />
              </div>
              <button type="submit" className="cover-btn" style={{ background: 'var(--accent-color)', color: 'white', alignSelf: 'flex-end', fontSize: '12px', padding: '4px 12px' }}>Post Comment</button>
            </form>
          </div>
        );

      case 'youtube': {
        const url = block.properties?.src || '';
        const embedId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.includes('youtu.be/') ? url.split('youtu.be/')[1].split('?')[0] : '';
        const embedUrl = embedId ? `https://www.youtube.com/embed/${embedId}` : '';

        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {embedUrl ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', background: '#000' }}>
                <iframe src={embedUrl} style={{ width: '100%', height: '420px', border: 'none' }} allowFullScreen title="YouTube embed" />
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>YouTube Video Embed</span>
                  <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '' } })} style={{ padding: '2px 6px', fontSize: '10px' }}>Change Video</button>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBlock(pageId, block.id, { properties: { src: (e.currentTarget.elements.namedItem('yturl') as HTMLInputElement).value } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}
              >
                <YoutubeIcon size={16} style={{ alignSelf: 'center' }} />
                <input 
                  name="yturl"
                  type="text" 
                  placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)..." 
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                  defaultValue={url}
                />
                <button type="submit" className="cover-btn">Link</button>
              </form>
            )}
          </div>
        );
      }

      case 'google-drive': {
        const src = block.properties?.src || '';
        const docName = block.properties?.fileName || 'Project Proposal Document';
        const docCaption = block.properties?.caption || 'Google Doc';

        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {src ? (
              <div 
                className="glass hover-bg"
                style={{ borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', cursor: 'pointer' }}
                onClick={() => window.open(src, '_blank')}
              >
                <div style={{ width: '38px', height: '38px', backgroundColor: '#e6f4ea', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#137333' }}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{docName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{docCaption} • Google Drive File</span>
                </div>
                <button 
                  className="cover-btn"
                  style={{ position: 'absolute', right: '12px', top: '16px', padding: '3px 8px', fontSize: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlock(pageId, block.id, { properties: { src: '' } });
                  }}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const u = (form.elements.namedItem('gdurl') as HTMLInputElement).value;
                  const n = (form.elements.namedItem('gdname') as HTMLInputElement).value || 'Shared Google Doc';
                  updateBlock(pageId, block.id, { properties: { src: u, fileName: n } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', color: '#34a853' }}>
                  <FileSpreadsheet size={14} />
                  <span>Google Drive Attachment</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    name="gdname"
                    type="text" 
                    placeholder="Document Title (e.g. Sales Report Q2)" 
                    className="search-input"
                    style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', width: '40%' }}
                  />
                  <input 
                    name="gdurl"
                    type="text" 
                    placeholder="Paste Google Drive sharing link address..." 
                    className="search-input"
                    style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                  />
                  <button type="submit" className="cover-btn">Attach</button>
                </div>
              </form>
            )}
          </div>
        );
      }

      case 'figma': {
        const src = block.properties?.src || '';
        const isEmbed = src.includes('figma.com/embed');
        const embedUrl = isEmbed ? src : src ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(src)}` : '';

        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {embedUrl ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                <iframe src={embedUrl} style={{ width: '100%', height: '450px', border: 'none', background: 'var(--bg-secondary)' }} allowFullScreen title="Figma design board" />
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Figma Frame Live Embed</span>
                  <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '' } })} style={{ padding: '2px 6px', fontSize: '10px' }}>Remove Board</button>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBlock(pageId, block.id, { properties: { src: (e.currentTarget.elements.namedItem('figmaurl') as HTMLInputElement).value } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}
              >
                <PenTool size={16} style={{ color: '#a259ff', alignSelf: 'center' }} />
                <input 
                  name="figmaurl"
                  type="text" 
                  placeholder="Paste Figma File or Prototype URL link (e.g. https://figma.com/file/...)..." 
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                />
                <button type="submit" className="cover-btn">Embed Figma</button>
              </form>
            )}
          </div>
        );
      }

      case 'github': {
        const repoUrl = block.properties?.src || '';
        const repoName = repoUrl ? repoUrl.replace('https://github.com/', '') : 'facebook/react';
        const stars = block.properties?.githubStars || 224000;
        const forks = block.properties?.githubForks || 45000;
        const issues = block.properties?.githubOpenIssues || 1200;
        const desc = block.properties?.githubDesc || 'A declarative, efficient, and flexible JavaScript library for building user interfaces.';

        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {repoUrl ? (
              <div 
                className="glass hover-bg"
                style={{ 
                  borderRadius: 'var(--border-radius-lg)', 
                  border: '1px solid var(--border-color)', 
                  padding: '18px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => window.open(repoUrl, '_blank')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GithubIcon size={24} />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{repoName}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>⭐ {stars.toLocaleString()} stars</span>
                  <span>🍴 {forks.toLocaleString()} forks</span>
                  <span>❗ {issues.toLocaleString()} open issues</span>
                </div>
                
                <button 
                  className="cover-btn" 
                  style={{ position: 'absolute', top: '14px', right: '14px', padding: '2px 8px', fontSize: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlock(pageId, block.id, { properties: { src: '' } });
                  }}
                >
                  Change Repo
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const url = (e.currentTarget.elements.namedItem('ghurl') as HTMLInputElement).value;
                  const randStars = Math.floor(Math.random() * 5000) + 120;
                  const randForks = Math.floor(randStars / 4);
                  const randIssues = Math.floor(Math.random() * 80) + 5;
                  updateBlock(pageId, block.id, { 
                    properties: { 
                      src: url,
                      githubStars: randStars,
                      githubForks: randForks,
                      githubOpenIssues: randIssues,
                      githubDesc: 'Simulated repository description fetched from GitHub GraphQL API gateway portal.'
                    } 
                  });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}
              >
                <GithubIcon size={16} style={{ alignSelf: 'center' }} />
                <input 
                  name="ghurl"
                  type="text" 
                  placeholder="Paste GitHub Repository URL (e.g. https://github.com/owner/repo)..." 
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                />
                <button type="submit" className="cover-btn">Link Repo</button>
              </form>
            )}
          </div>
        );
      }

      case 'slack':
        return <SlackEmbed block={block} pageId={pageId} />;

      case 'trello':
        return <TrelloEmbed block={block} pageId={pageId} />;

      case 'airtable': {
        const src = block.properties?.src || '';
        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {src ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                <iframe src={src} style={{ width: '100%', height: '420px', border: 'none', background: 'transparent' }} allowFullScreen title="Airtable Base Embed" />
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Airtable Live Spread Sheet</span>
                  <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '' } })} style={{ padding: '2px 6px', fontSize: '10px' }}>Remove Embed</button>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBlock(pageId, block.id, { properties: { src: (e.currentTarget.elements.namedItem('aturl') as HTMLInputElement).value } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}
              >
                <Database size={16} style={{ color: '#f82b60', alignSelf: 'center' }} />
                <input 
                  name="aturl"
                  type="text" 
                  placeholder="Paste Airtable shared base view URL link..." 
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                />
                <button type="submit" className="cover-btn">Link Airtable</button>
              </form>
            )}
          </div>
        );
      }

      case 'loom': {
        const url = block.properties?.src || '';
        const embedId = url.includes('/share/') ? url.split('/share/')[1].split('?')[0] : url.includes('loom.com/embed/') ? url.split('loom.com/embed/')[1].split('?')[0] : url.split('/').pop();
        const embedUrl = embedId ? `https://www.loom.com/embed/${embedId}` : '';

        return (
          <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
            {embedUrl ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                <iframe src={embedUrl} style={{ width: '100%', height: '360px', border: 'none' }} allowFullScreen title="Loom embed" />
                <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Loom Video Walkthrough Embed</span>
                  <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '' } })} style={{ padding: '2px 6px', fontSize: '10px' }}>Remove Loom</button>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBlock(pageId, block.id, { properties: { src: (e.currentTarget.elements.namedItem('loomurl') as HTMLInputElement).value } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}
              >
                <Video size={16} style={{ color: '#625df5', alignSelf: 'center' }} />
                <input 
                  name="loomurl"
                  type="text" 
                  placeholder="Paste Loom Video share URL link (e.g. https://www.loom.com/share/...)..." 
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '13px', flexGrow: 1 }}
                />
                <button type="submit" className="cover-btn">Embed Loom</button>
              </form>
            )}
          </div>
        );
      }

      case 'google-maps':
        return <GoogleMapsBlock block={block} pageId={pageId} />;

      case 'dropbox': {
        const src = block.properties?.src || '';
        const name = block.properties?.fileName || 'asset_backup.zip';
        const size = block.properties?.fileSize || '245 MB';

        return (
          <div style={{ width: '100%', margin: '12px 0' }} data-block-id={block.id}>
            {src ? (
              <div 
                className="glass hover-bg"
                style={{ 
                  borderRadius: 'var(--border-radius-lg)', 
                  border: '1px solid var(--border-color)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 20px', 
                  justifyContent: 'space-between', 
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => window.open(src, '_blank')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', backgroundColor: '#e6f0ff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0061fe' }}>
                    <Paperclip size={20} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{name}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{size} • Dropbox File</span>
                  </div>
                </div>
                <button 
                  className="cover-btn"
                  style={{ padding: '3px 8px', fontSize: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlock(pageId, block.id, { properties: { src: '' } });
                  }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const u = (form.elements.namedItem('dburl') as HTMLInputElement).value;
                  const n = (form.elements.namedItem('dbname') as HTMLInputElement).value || 'design_draft.sketch';
                  updateBlock(pageId, block.id, { properties: { src: u, fileName: n, fileSize: '14.5 MB' } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0061fe' }}>Dropbox Embed Card</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input name="dbname" placeholder="Filename (e.g. presentation.pdf)" className="search-input" style={{ width: '35%', fontSize: '13px' }} />
                  <input name="dburl" placeholder="Paste Dropbox shared file link..." className="search-input" style={{ flexGrow: 1, fontSize: '13px' }} />
                  <button type="submit" className="cover-btn">Attach</button>
                </div>
              </form>
            )}
          </div>
        );
      }

      case 'onedrive': {
        const src = block.properties?.src || '';
        const name = block.properties?.fileName || 'annual_budget.xlsx';
        const size = block.properties?.fileSize || '2.8 MB';

        return (
          <div style={{ width: '100%', margin: '12px 0' }} data-block-id={block.id}>
            {src ? (
              <div 
                className="glass hover-bg"
                style={{ 
                  borderRadius: 'var(--border-radius-lg)', 
                  border: '1px solid var(--border-color)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '16px 20px', 
                  justifyContent: 'space-between', 
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => window.open(src, '_blank')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', backgroundColor: '#e6f2fc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0078d4' }}>
                    <Paperclip size={20} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{name}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{size} • OneDrive Document</span>
                  </div>
                </div>
                <button 
                  className="cover-btn"
                  style={{ padding: '3px 8px', fontSize: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlock(pageId, block.id, { properties: { src: '' } });
                  }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const u = (form.elements.namedItem('odurl') as HTMLInputElement).value;
                  const n = (form.elements.namedItem('odname') as HTMLInputElement).value || 'budget_forecast.xlsx';
                  updateBlock(pageId, block.id, { properties: { src: u, fileName: n, fileSize: '1.4 MB' } });
                }} 
                className="glass" 
                style={{ padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0078d4' }}>OneDrive Embed Card</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input name="odname" placeholder="Filename (e.g. spreadsheet.xlsx)" className="search-input" style={{ width: '35%', fontSize: '13px' }} />
                  <input name="odurl" placeholder="Paste Microsoft OneDrive sharing URL..." className="search-input" style={{ flexGrow: 1, fontSize: '13px' }} />
                  <button type="submit" className="cover-btn">Attach</button>
                </div>
              </form>
            )}
          </div>
        );
      }

      case 'notion': {
        const selectId = block.properties?.pageId || '';
        const targetPage = pages.find(p => p.id === selectId);

        return (
          <div style={{ width: '100%', margin: '10px 0' }} data-block-id={block.id}>
            {targetPage ? (
              <div 
                className="glass hover-bg"
                style={{ padding: '14px', borderRadius: 'var(--border-radius-md)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                onClick={() => setActivePageId(targetPage.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{targetPage.icon || '📑'}</span>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{targetPage.title}</h5>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Workspace Notion Document</span>
                  </div>
                </div>
                <button 
                  className="cover-btn" 
                  style={{ padding: '2px 8px', fontSize: '9px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlock(pageId, block.id, { properties: { pageId: '' } });
                  }}
                >
                  Unlink
                </button>
              </div>
            ) : (
              <div className="glass" style={{ padding: '12px', borderRadius: 'var(--border-radius-sm)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notion Embed Link:</span>
                <select 
                  onChange={(e) => updateBlock(pageId, block.id, { properties: { pageId: e.target.value } })}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', fontSize: '12px' }}
                >
                  <option value="">-- Link workspace page --</option>
                  {pages.filter(p => p.id !== pageId).map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      }

      case 'chart':
      case 'chart-bar':
      case 'chart-line':
      case 'chart-pie':
      case 'chart-gauge':
      case 'chart-radar':
        return <ChartBlockAdvanced block={block} pageId={pageId} />;

      case 'ai-block':
        return <AiBlock block={block} pageId={pageId} />;

      case 'notes':
        return <NotesBlock block={block} pageId={pageId} />;

      case 'mermaid':
        return <MermaidBlock block={block} pageId={pageId} />;

      case 'import':
        return <ImportBlock block={block} pageId={pageId} index={index} />;

      case 'current-date': {
        const val = block.properties?.dateValue || new Date().toLocaleString();
        
        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', margin: '4px 0', fontSize: '13px' }}
            data-block-id={block.id}
          >
            <Calendar size={13} style={{ color: 'var(--accent-color)' }} />
            <span style={{ fontWeight: 600 }}>Current Date:</span>
            <span>{val}</span>
            <button 
              className="cover-btn"
              style={{ padding: '2px 4px', fontSize: '9px', marginLeft: '6px' }}
              onClick={() => updateBlock(pageId, block.id, { properties: { dateValue: new Date().toLocaleString() } })}
            >
              Refresh
            </button>
          </div>
        );
      }

      case 'anchor': {
        const aName = block.properties?.anchorName || 'section-1';
        return (
          <div 
            id={aName}
            style={{ 
              width: '100%', 
              margin: '8px 0', 
              padding: '6px 10px', 
              background: 'rgba(94,129,172,0.04)', 
              borderLeft: '3px solid var(--text-placeholder)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--border-radius-sm)'
            }} 
            data-block-id={block.id}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Anchor size={12} />
              <span>Anchor Target: <strong>#{aName}</strong></span>
            </div>
            <input 
              type="text" 
              value={aName} 
              onChange={(e) => updateBlock(pageId, block.id, { properties: { anchorName: e.target.value } })}
              className="search-input" 
              style={{ width: '120px', padding: '2px 6px', fontSize: '11px', border: '1px solid var(--border-color)' }}
              placeholder="anchor-name"
            />
          </div>
        );
      }

      case 'navigation':
        return <NavigationBlock block={block} pageId={pageId} />;

      case 'table-row': {
        const rowData = block.properties?.tableData?.[0] || ['Cell A', 'Cell B'];
        
        const handleCellEdit = (idx: number, val: string) => {
          const updated = [...rowData];
          updated[idx] = val;
          updateBlock(pageId, block.id, { properties: { tableData: [updated] } });
        };

        const addCell = () => {
          updateBlock(pageId, block.id, { properties: { tableData: [[...rowData, 'New Cell']] } });
        };

        const removeCell = (idx: number) => {
          const updated = rowData.filter((_, i) => i !== idx);
          updateBlock(pageId, block.id, { properties: { tableData: [updated] } });
        };

        return (
          <div style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', margin: '6px 0' }} data-block-id={block.id}>
            <div style={{ display: 'flex', flexGrow: 1, border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              {rowData.map((cell, idx) => (
                <div 
                  key={idx}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleCellEdit(idx, e.currentTarget.innerText)}
                  style={{ flex: 1, padding: '6px 12px', minHeight: '30px', outline: 'none', borderRight: idx < rowData.length - 1 ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-primary)' }}
                >
                  {cell}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="cover-btn" onClick={addCell} style={{ padding: '2px 6px', fontSize: '10px' }}>+</button>
              {rowData.length > 1 && <button className="cover-btn" onClick={() => removeCell(rowData.length - 1)} style={{ padding: '2px 6px', fontSize: '10px', color: 'red' }}>-</button>}
            </div>
          </div>
        );
      }

      case 'time': {
        const tVal = block.properties?.timeValue || '12:00';
        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', margin: '4px 0' }}
            data-block-id={block.id}
          >
            <Clock size={12} style={{ color: 'var(--accent-color)' }} />
            <input 
              type="time" 
              value={tVal}
              onChange={(e) => updateBlock(pageId, block.id, { properties: { timeValue: e.target.value } })}
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer' }}
            />
          </div>
        );
      }

      case 'person': {
        const name = block.properties?.personName || 'Sarah Jenkins';
        const av = block.properties?.personAvatar || '👩‍💻';

        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--accent-light)', border: '1px solid var(--accent-color)', borderRadius: '14px', margin: '4px 0' }}
            data-block-id={block.id}
            onClick={async () => {
              const newName = await customPrompt('Enter person name:', name);
              if (newName) updateBlock(pageId, block.id, { properties: { personName: newName } });
            }}
          >
            <span style={{ fontSize: '13px' }}>{av}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>{name}</span>
          </div>
        );
      }

      case 'page-link': {
        const selectId = block.properties?.pageId || '';
        const targetPage = pages.find(p => p.id === selectId);

        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', margin: '4px 0' }}
            data-block-id={block.id}
          >
            {targetPage ? (
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={() => setActivePageId(targetPage.id)}
              >
                <span>{targetPage.icon || '📄'}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-color)', textDecoration: 'underline' }}>{targetPage.title}</span>
                <button 
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlock(pageId, block.id, { properties: { pageId: '' } });
                  }}
                >
                  &times;
                </button>
              </div>
            ) : (
              <select 
                onChange={(e) => updateBlock(pageId, block.id, { properties: { pageId: e.target.value } })}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '11px', color: 'var(--text-muted)' }}
              >
                <option value="">Link Page Badge</option>
                {pages.filter(p => p.id !== pageId).map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}
          </div>
        );
      }

      case 'emoji': {
        const eVal = block.properties?.emojiValue || '🚀';
        const emojisList = ['🚀', '💡', '🎯', '🎉', '🔥', '✨', '💻', '🎨', '📝', '📚', '🐻', '🍕', '🚗', '🌍'];

        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', margin: '4px 0' }}
            data-block-id={block.id}
            onClick={() => {
              const currentIdx = emojisList.indexOf(eVal);
              const nextIdx = (currentIdx + 1) % emojisList.length;
              updateBlock(pageId, block.id, { properties: { emojiValue: emojisList[nextIdx] } });
            }}
          >
            <button 
              style={{ fontSize: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
            >
              {eVal}
            </button>
          </div>
        );
      }

      case 'checkbox': {
        const checked = !!block.properties?.checked;
        return (
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', margin: '4px 0' }}
            data-block-id={block.id}
          >
            <input 
              type="checkbox" 
              checked={checked} 
              onChange={(e) => updateBlock(pageId, block.id, { properties: { checked: e.target.checked } })}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status Tag</span>
          </div>
        );
      }

      case 'volume': {
        const vLvl = block.properties?.volumeLevel ?? 50;
        return (
          <div className="block-callout info" data-block-id={block.id}>
            <Volume2 size={20} style={{ color: 'var(--info-color)' }} />
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Speaker System Output:</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={vLvl} 
                onChange={(e) => updateBlock(pageId, block.id, { properties: { volumeLevel: Number(e.target.value) } })}
                style={{ cursor: 'pointer', flexGrow: 1 }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{vLvl}%</span>
            </div>
          </div>
        );
      }

      default:
        return (
          <div
            ref={blockRef}
            data-block-id={block.id}
            contentEditable
            className="block-editor-content"
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            data-placeholder={getPlaceholder()}
            style={blockStyle}
          />
        );
    }
  };

  return (
    <div className="block-row-container" style={{ position: 'relative' }}>
      <div 
        ref={menuBtnRef}
        className="block-actions-trigger"
        onClick={() => setBlockMenuOpen(!blockMenuOpen)}
      >
        <Plus size={14} onClick={(e) => { e.stopPropagation(); addBlock(pageId, 'text', undefined, index + 1); }} />
        <GripVertical size={14} />
      </div>

      {/* Modern top-hover controls toolbar */}
      <div className="block-hover-top-bar" style={{ 
        display: 'none', 
        position: 'absolute', 
        top: '-16px', 
        right: '12px', 
        zIndex: 10, 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--border-radius-md)', 
        padding: '3px 8px', 
        gap: '6px', 
        alignItems: 'center', 
        boxShadow: 'var(--shadow-md)' 
      }}>
        {/* Search */}
        <button 
          title="Search / Filter block content"
          onClick={async () => {
            const query = await customPrompt('Enter text to filter/search in this block:');
            if (query && !block.content.toLowerCase().includes(query.toLowerCase())) {
              customAlert(`Term "${query}" not found in this block.`);
            } else if (query) {
              customAlert(`Found matching content in this block!`);
            }
          }}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
        >
          <Search size={12} />
        </button>

        {/* Sort */}
        <button 
          title="Sort content alphabetically"
          onClick={() => {
            if (block.type === 'table' && block.properties?.tableData) {
              const data = [...block.properties.tableData];
              data.sort((a, b) => (a[0] || '').localeCompare(b[0] || ''));
              updateBlock(pageId, block.id, { properties: { tableData: data } });
            }
            customAlert('Alphabetical sort applied!');
          }}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
        >
          <RefreshCw size={12} style={{ transform: 'rotate(90deg)' }} />
        </button>

        {/* Automation (Zap) */}
        <button 
          title="Automate this block"
          onClick={() => setAutomationOpen(true)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'orange', display: 'flex', alignItems: 'center' }}
        >
          <Zap size={12} fill="orange" />
        </button>

        {/* 3 Dots Menu Trigger */}
        <button 
          title="Block options"
          onClick={() => setBlockMenuOpen(true)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '10px' }}
        >
          &bull;&bull;&bull;
        </button>
      </div>

      {blockMenuOpen && (
        <div 
          className="block-context-menu glass"
          style={{ 
            position: 'absolute', 
            top: '28px', 
            left: '-10px',
            zIndex: 100,
            width: '180px',
            padding: '6px',
            borderRadius: 'var(--border-radius-md)'
          }}
        >
          <button className="block-menu-item hover-bg" onClick={duplicateBlock}>
            <Copy size={13} />
            Duplicate
          </button>
          <button className="block-menu-item hover-bg delete" onClick={() => { deleteBlock(pageId, block.id); setBlockMenuOpen(false); }}>
            <Trash2 size={13} />
            Delete
          </button>
          
          <button className="block-menu-item hover-bg" onClick={() => setBlockColorPickerOpen(!blockColorPickerOpen)}>
            <Palette size={13} />
            Block Color
          </button>

          {blockColorPickerOpen && (
            <div style={{ padding: '6px 4px', borderTop: '1px solid var(--border-color)', marginTop: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Text Color</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {colorsList.map(c => (
                  <button 
                    key={`fg-${c.name}`} 
                    onClick={() => {
                      updateBlock(pageId, block.id, { properties: { textColor: c.value } });
                      setBlockMenuOpen(false);
                      setBlockColorPickerOpen(false);
                    }}
                    style={{ fontSize: '9px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '3px', color: c.value, cursor: 'pointer', fontWeight: 600 }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Background</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {colorsList.map(c => (
                  <button 
                    key={`bg-${c.name}`} 
                    onClick={() => {
                      updateBlock(pageId, block.id, { properties: { bgColor: c.bg } });
                      setBlockMenuOpen(false);
                      setBlockColorPickerOpen(false);
                    }}
                    style={{ fontSize: '9px', padding: '2px', background: c.bg || 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '3px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {renderBlockContent()}

      {slashMenuOpen && (
        <SlashMenu 
          onSelect={handleSelectSlashCommand}
          onClose={() => setSlashMenuOpen(false)}
        />
      )}

      <style>{`
        .block-row-container:hover .block-hover-top-bar {
          display: flex !important;
        }
        .block-context-menu {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
        }
        .block-menu-item {
          width: 100%;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--text-primary);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          text-align: left;
        }
        .block-menu-item:hover {
          background-color: var(--bg-tertiary);
        }
        .block-menu-item.delete:hover {
          color: var(--danger-color);
        }
        .block-todo-checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse {
          animation: pulse-anim 2s infinite;
        }
        @keyframes pulse-anim {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .spin {
          animation: spin-anim 3s linear infinite;
        }
        @keyframes spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
