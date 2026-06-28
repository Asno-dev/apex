import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp, generateId } from '../AppContext';
import {
  MousePointer, StickyNote, Square, Circle, Type, ArrowRight,
  Pencil, Image as ImageIcon, MessageSquareText, Grid3x3, Minus, Plus,
  ZoomIn, ZoomOut, Maximize, Trash2, Copy, Layers, X, Layout,
  ChevronRight, Download, Share2, Sparkles, Table, Hexagon,
  Undo2, Redo2, Lock, Unlock, Group, PanelRight, Timer as TimerIcon,
  CheckSquare, Vote, FileImage, Presentation, Eye, Sun, Moon,
  Highlighter, Eraser, Star, Heart, Smile, Frown, ThumbsUp,
  GripVertical, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  ExternalLink, Video, Music, Globe, BookOpen, Sigma,
  TextSelect, Link, Grid3x3 as Grid, Frame, BrainCircuit
} from 'lucide-react';

interface CanvasObject {
  id: string;
  type: 'sticky' | 'shape' | 'text' | 'connector' | 'drawing' | 'image' | 'comment' | 'frame' | 'table' | 'mindmap' | 'embed' | 'sticker' | 'ai-card' | 'vote-session' | 'timer';
  x: number; y: number; width: number; height: number; rotation: number; zIndex: number;
  fill: string; stroke: string; strokeWidth: number; opacity: number; locked: boolean;
  content: string; shapeType?: string; fontSize?: number; fontFamily?: string; color?: string;
  groupId?: string; imageUrl?: string; drawingData?: string;
  connectorType?: 'straight' | 'curved' | 'elbow';
  connectorStart?: { x: number; y: number }; connectorEnd?: { x: number; y: number };
  tableData?: { rows: number; cols: number; cells: Record<string, string> };
  embedUrl?: string; embedType?: 'url' | 'youtube' | 'figma' | 'maps';
  stickerType?: string; aiSourceRefs?: string[];
  voteOptions?: { label: string; count: number }[]; voteTotal?: number;
  timerDuration?: number; timerRemaining?: number; timerRunning?: boolean;
  richText?: string; bold?: boolean; italic?: boolean; underline?: boolean;
  tags?: string[]; authorId?: string;
  mindmapChildren?: CanvasObject[];
}

interface HistoryEntry { objects: CanvasObject[]; description: string }

const ALL_SHAPES: { id: string; name: string; category: string }[] = [
  { id: 'rect', name: 'Rectangle', category: 'Basic' },
  { id: 'rounded-rect', name: 'Rounded Rect', category: 'Basic' },
  { id: 'circle', name: 'Circle', category: 'Basic' },
  { id: 'ellipse', name: 'Ellipse', category: 'Basic' },
  { id: 'triangle', name: 'Triangle', category: 'Basic' },
  { id: 'diamond', name: 'Diamond', category: 'Basic' },
  { id: 'hexagon', name: 'Hexagon', category: 'Basic' },
  { id: 'pentagon', name: 'Pentagon', category: 'Basic' },
  { id: 'octagon', name: 'Octagon', category: 'Basic' },
  { id: 'star', name: 'Star', category: 'Stars' },
  { id: 'star-4', name: '4-Point Star', category: 'Stars' },
  { id: 'star-8', name: '8-Point Star', category: 'Stars' },
  { id: 'arrow-right', name: 'Right Arrow', category: 'Arrows' },
  { id: 'arrow-left', name: 'Left Arrow', category: 'Arrows' },
  { id: 'arrow-up', name: 'Up Arrow', category: 'Arrows' },
  { id: 'arrow-down', name: 'Down Arrow', category: 'Arrows' },
  { id: 'arrow-2way', name: 'Two-Way Arrow', category: 'Arrows' },
  { id: 'cloud', name: 'Cloud', category: 'Objects' },
  { id: 'callout', name: 'Callout', category: 'Objects' },
  { id: 'cylinder', name: 'Cylinder', category: 'Objects' },
  { id: 'document', name: 'Document', category: 'Objects' },
  { id: 'folder', name: 'Folder', category: 'Objects' },
  { id: 'database', name: 'Database', category: 'Objects' },
  { id: 'person', name: 'Person', category: 'Objects' },
  { id: 'flag', name: 'Flag', category: 'Objects' },
  { id: 'lightbulb', name: 'Lightbulb', category: 'Objects' },
  { id: 'heart', name: 'Heart', category: 'Objects' },
  { id: 'cross', name: 'Cross', category: 'Objects' },
  { id: 'check', name: 'Check Mark', category: 'Objects' },
  { id: 'x-mark', name: 'X Mark', category: 'Objects' },
  { id: 'arrow-curve', name: 'Curved Arrow', category: 'Arrows' },
  { id: 'bracket', name: 'Bracket', category: 'Objects' },
  { id: 'brace', name: 'Brace', category: 'Objects' },
  { id: 'circle-dot', name: 'Circle with Dot', category: 'Objects' },
  { id: 'pill', name: 'Pill', category: 'Basic' },
];

const STICKY_COLORS = ['#ffd666', '#ffa166', '#ff7a7a', '#ff85d4', '#9f7aff', '#66b5ff', '#5dd4a8', '#c0c4cc'];
const VOTE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];
const STICKERS = ['👍', '❤️', '🔥', '🎉', '💡', '⭐', '❓', '✅', '👏', '🚀', '💪', '🙏', '😂', '😍', '🤔', '🎯', '💯', '🔮'];

const CanvasFlow: React.FC = () => {
  const { customAlert, customPrompt } = useApp();

  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [activeTool, setActiveTool] = useState('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [canvasTitle, setCanvasTitle] = useState('Untitled Board');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [nextZ, setNextZ] = useState(1);
  const [draggingObject, setDraggingObject] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingObject, setEditingObject] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const [isFreeDrawing, setIsFreeDrawing] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [activeShapeType, setActiveShapeType] = useState('rect');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationFrame, setPresentationFrame] = useState(0);
  const [laserPointer, setLaserPointer] = useState<{ x: number; y: number } | null>(null);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [pages, setPages] = useState<{ name: string; objects: CanvasObject[] }[]>([
    { name: 'Board 1', objects: [] }
  ]);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [timerState, setTimerState] = useState<{ running: boolean; remaining: number; total: number } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [showShapeCategory, setShowShapeCategory] = useState('Basic');
  const [connectorType, setConnectorType] = useState<'straight' | 'curved' | 'elbow'>('straight');
  const [richTextMode, setRichTextMode] = useState(false);
  const [showVotePanel, setShowVotePanel] = useState(false);
  const [voteItems, setVoteItems] = useState<string[]>(['Option 1', 'Option 2']);
  const [showFramePanel, setShowFramePanel] = useState(false);
  const [showWebEmbed, setShowWebEmbed] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addPanelSearch, setAddPanelSearch] = useState('');
  const [showAddCategory, setShowAddCategory] = useState<string>('All');

  // Connector linking state
  const [connectorSource, setConnectorSource] = useState<{ id: string; x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const laserTimeoutRef = useRef<number | null>(null);

  const saveHistory = useCallback((desc: string) => {
    setUndoStack(prev => [...prev.slice(-49), { objects: JSON.parse(JSON.stringify(objects)), description: desc }]);
    setRedoStack([]);
  }, [objects]);

  const undo = () => {
    if (undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { objects: JSON.parse(JSON.stringify(objects)), description: 'undo' }]);
    setObjects(entry.objects);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { objects: JSON.parse(JSON.stringify(objects)), description: 'redo' }]);
    setObjects(entry.objects);
    setRedoStack(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedIds.length > 0 && !e.ctrlKey && !e.metaKey) { deleteSelected(); } }
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 's' || e.key === 'S') setActiveTool('sticky');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'd' || e.key === 'D') setActiveTool('draw');
      if (e.key === 'l' || e.key === 'L') setActiveTool('connector');
      if (e.key === 'i' || e.key === 'I') setActiveTool('image');
      if (e.key === 'c' || e.key === 'C') setActiveTool('comment');
      if (e.key === 'h' || e.key === 'H') setActiveTool('shape');
      if (e.key === 'f' || e.key === 'F') setActiveTool('frame');
      if (e.key === 'p' || e.key === 'P') setPresentationMode(!presentationMode);
      if (e.key === 'Escape') { setEditingObject(null); setActiveTool('select'); setShowShapeMenu(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIds, undoStack, redoStack, presentationMode]);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left - panX) / zoom, y: (clientY - rect.top - panY) / zoom };
  }, [panX, panY, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(10, zoom * delta));
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setPanX(prev => (e.clientX - rect.left) - ((e.clientX - rect.left - prev) * (newZoom / zoom)));
        setPanY(prev => (e.clientY - rect.top) - ((e.clientY - rect.top - prev) * (newZoom / zoom)));
      }
      setZoom(newZoom);
    } else {
      setPanX(prev => prev - e.deltaX);
      setPanY(prev => prev - e.deltaY);
    }
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true); setPanStart({ x: e.clientX - panX, y: e.clientY - panY }); return;
    }
    if (isLaserActive) { setLaserPointer({ x: e.clientX, y: e.clientY }); return; }
    if (activeTool === 'draw') {
      setIsFreeDrawing(true);
      setDrawingPath([getCanvasCoords(e.clientX, e.clientY)]);
      return;
    }
    const pos = getCanvasCoords(e.clientX, e.clientY);
    const clickedObj = [...objects].reverse().find(o =>
      pos.x >= o.x && pos.x <= o.x + o.width && pos.y >= o.y && pos.y <= o.y + o.height
    );
    if (activeTool === 'select') {
      if (clickedObj && !clickedObj.locked) {
        setSelectedIds(prev => e.shiftKey
          ? (prev.includes(clickedObj.id) ? prev.filter(id => id !== clickedObj.id) : [...prev, clickedObj.id])
          : [clickedObj.id]
        );
        setDraggingObject(clickedObj.id);
        setDragOffset({ x: pos.x - clickedObj.x, y: pos.y - clickedObj.y });
      } else if (!clickedObj) {
        setSelectedIds([]);
      }
    } else if (activeTool === 'connector') {
      if (clickedObj) {
        if (!connectorSource) {
          setConnectorSource({ id: clickedObj.id, x: clickedObj.x + clickedObj.width / 2, y: clickedObj.y + clickedObj.height / 2 });
        } else if (connectorSource.id !== clickedObj.id) {
          addObject({
            id: generateId(), type: 'connector', x: connectorSource.x, y: connectorSource.y,
            width: Math.abs(clickedObj.x + clickedObj.width / 2 - connectorSource.x),
            height: Math.abs(clickedObj.y + clickedObj.height / 2 - connectorSource.y),
            rotation: 0, zIndex: nextZ, fill: 'transparent', stroke: '#6366f1', strokeWidth: 2,
            opacity: 1, locked: false, content: '',
            connectorType, connectorStart: { x: connectorSource.x, y: connectorSource.y },
            connectorEnd: { x: clickedObj.x + clickedObj.width / 2, y: clickedObj.y + clickedObj.height / 2 }
          });
          setNextZ(z => z + 1); setConnectorSource(null); setActiveTool('select');
          saveHistory('Create connector');
        } else {
          setConnectorSource(null);
        }
      } else {
        setConnectorSource(null);
        createConnector(pos.x, pos.y);
      }
    } else if (activeTool === 'sticky') createSticky(pos.x, pos.y);
    else if (activeTool === 'shape') createShape(pos.x, pos.y);
    else if (activeTool === 'text') createText(pos.x, pos.y);
    else if (activeTool === 'comment') createComment(pos.x, pos.y);
    else if (activeTool === 'table') createTable(pos.x, pos.y);
    else if (activeTool === 'sticker') { addObject({ id: generateId(), type: 'sticker', x: pos.x, y: pos.y, width: 40, height: 40, rotation: 0, zIndex: nextZ, fill: 'transparent', stroke: 'transparent', strokeWidth: 0, opacity: 1, locked: false, content: '👍', stickerType: '👍', fontSize: 24 }); setNextZ(z => z + 1); setActiveTool('select'); }
    else if (activeTool === 'vote') createVote(pos.x, pos.y);
    else if (activeTool === 'timer') createTimerObject(pos.x, pos.y);
    else if (activeTool === 'embed' && embedUrl) createEmbed(pos.x, pos.y);
    else if (activeTool === 'ai-card') { setShowAIPanel(true); setActiveTool('select'); }
    else if (activeTool === 'frame') createFrame(pos.x, pos.y);
  }, [activeTool, objects, zoom, panX, panY, getCanvasCoords, nextZ, selectedIds, isLaserActive, embedUrl]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setPanX(e.clientX - panStart.x); setPanY(e.clientY - panStart.y); return; }
    if (isFreeDrawing) { setDrawingPath(prev => [...prev, getCanvasCoords(e.clientX, e.clientY)]); return; }
    if (isLaserActive) { setLaserPointer({ x: e.clientX, y: e.clientY }); if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current); laserTimeoutRef.current = window.setTimeout(() => setLaserPointer(null), 2000); return; }
    if (draggingObject) {
      const pos = getCanvasCoords(e.clientX, e.clientY);
      setObjects(prev => prev.map(o => o.id === draggingObject ? { ...o, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y } : o));
    }
  }, [isPanning, panStart, isFreeDrawing, draggingObject, dragOffset, getCanvasCoords, isLaserActive]);

  const handleMouseUp = useCallback(() => {
    if (isFreeDrawing && drawingPath.length > 2) {
      const bounds = getPathBounds(drawingPath);
      const canvasEl = document.createElement('canvas');
      canvasEl.width = 400; canvasEl.height = 300;
      const ctx = canvasEl.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        drawingPath.forEach((p, i) => {
          const x = p.x - bounds.minX + 20; const y = p.y - bounds.minY + 20;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        addObject({ id: generateId(), type: 'drawing', x: bounds.minX - 20, y: bounds.minY - 20, width: Math.max(bounds.maxX - bounds.minX + 40, 50), height: Math.max(bounds.maxY - bounds.minY + 40, 50), rotation: 0, zIndex: nextZ, fill: 'transparent', stroke: '#6366f1', strokeWidth: 2, opacity: 1, locked: false, content: '', drawingData: canvasEl.toDataURL() });
        setNextZ(z => z + 1);
      }
    }
    if (draggingObject) saveHistory('Move object');
    setIsPanning(false); setIsFreeDrawing(false); setDraggingObject(null); setDrawingPath([]);
  }, [isFreeDrawing, drawingPath, draggingObject, nextZ]);

  const addObject = (obj: CanvasObject) => {
    setObjects(prev => [...prev, obj]);
  };

  const getPathBounds = (path: { x: number; y: number }[]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    path.forEach(p => { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y; });
    return { minX, maxX, minY, maxY };
  };

  const createSticky = (x: number, y: number) => {
    const id = generateId();
    const color = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
    addObject({ id, type: 'sticky', x, y, width: 160, height: 140, rotation: Math.random() * 4 - 2, zIndex: nextZ, fill: color, stroke: 'transparent', strokeWidth: 0, content: '', opacity: 1, locked: false, fontSize: 14, color: '#1a1a2e' });
    setNextZ(z => z + 1);
    setEditingObject(id);
    setEditText('');
    setActiveTool('select');
    saveHistory('Create sticky');
  };

  const createShape = (x: number, y: number) => {
    const shapeType = activeShapeType;
    const fill = '#d9e2f0'; const w = shapeType === 'circle' ? 120 : shapeType === 'diamond' ? 140 : shapeType === 'pill' ? 160 : 140;
    const h = shapeType === 'circle' ? 120 : shapeType === 'hexagon' || shapeType === 'pentagon' || shapeType === 'octagon' ? 120 : 100;
    addObject({ id: generateId(), type: 'shape', x, y, width: w, height: h, rotation: 0, zIndex: nextZ, fill, stroke: 'var(--border-color)', strokeWidth: 2, content: shapeType, shapeType, opacity: 1, locked: false, fontSize: 12, color: 'var(--text-primary)' });
    setNextZ(z => z + 1);
    setActiveTool('select');
    saveHistory('Create shape');
  };

  const createText = (x: number, y: number) => {
    const id = generateId();
    addObject({ id, type: 'text', x, y, width: 200, height: 40, rotation: 0, zIndex: nextZ, fill: 'transparent', stroke: 'transparent', strokeWidth: 0, content: 'Double-click to edit', opacity: 1, locked: false, fontSize: 16, color: 'var(--text-primary)' });
    setNextZ(z => z + 1);
    setEditingObject(id);
    setEditText('Double-click to edit');
    setActiveTool('select');
    saveHistory('Create text');
  };

  const createComment = (x: number, y: number) => {
    addObject({ id: generateId(), type: 'comment', x, y, width: 260, height: 80, rotation: 0, zIndex: nextZ, fill: 'var(--bg-primary)', stroke: 'var(--border-color)', strokeWidth: 1, content: 'Add comment...', opacity: 1, locked: false, tags: ['You'] });
    setNextZ(z => z + 1);
    setActiveTool('select');
    saveHistory('Create comment');
  };

  const createTable = (x: number, y: number) => {
    addObject({ id: generateId(), type: 'table', x, y, width: 280, height: 180, rotation: 0, zIndex: nextZ, fill: 'var(--bg-primary)', stroke: 'var(--border-color)', strokeWidth: 1, content: 'Table', opacity: 1, locked: false, tableData: { rows: 4, cols: 3, cells: { '0,0': 'Name', '0,1': 'Status', '0,2': 'Assigned' } } });
    setNextZ(z => z + 1);
    setActiveTool('select');
    saveHistory('Create table');
  };

  const createVote = (x: number, y: number) => {
    addObject({ id: generateId(), type: 'vote-session', x, y, width: 220, height: 160, rotation: 0, zIndex: nextZ, fill: 'var(--bg-primary)', stroke: 'var(--border-color)', strokeWidth: 1, content: 'Vote Session', opacity: 1, locked: false, voteOptions: [{ label: 'Option A', count: 0 }, { label: 'Option B', count: 0 }], voteTotal: 0, fontSize: 13 });
    setNextZ(z => z + 1);
    setActiveTool('select');
    saveHistory('Create vote');
  };

  const createTimerObject = (x: number, y: number) => {
    addObject({ id: generateId(), type: 'timer', x, y, width: 200, height: 80, rotation: 0, zIndex: nextZ, fill: 'var(--bg-primary)', stroke: 'var(--border-color)', strokeWidth: 1, content: '5:00', opacity: 1, locked: false, timerDuration: 300, timerRemaining: 300, timerRunning: false, fontSize: 24 });
    setNextZ(z => z + 1);
    setActiveTool('select');
    saveHistory('Create timer');
  };

  const createFrame = (x: number, y: number) => {
    addObject({ id: generateId(), type: 'frame', x, y, width: 400, height: 300, rotation: 0, zIndex: nextZ, fill: '#6366f1', stroke: '#6366f1', strokeWidth: 2, content: 'Frame', opacity: 0.15, locked: false });
    setNextZ(z => z + 1);
    setActiveTool('select');
    saveHistory('Create frame');
  };

  const createConnector = (x: number, y: number) => {
    addObject({ id: generateId(), type: 'connector', x, y, width: 200, height: 0, rotation: 0, zIndex: nextZ, fill: 'transparent', stroke: '#6366f1', strokeWidth: 2, opacity: 1, locked: false, content: '', connectorType, connectorStart: { x, y }, connectorEnd: { x: x + 200, y } });
    setNextZ(z => z + 1);
    setActiveTool('select');
    saveHistory('Create connector');
  };

  const createEmbed = (x: number, y: number) => {
    const url = embedUrl;
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    const isFigma = url.includes('figma.com');
    addObject({ id: generateId(), type: 'embed', x, y, width: 320, height: 240, rotation: 0, zIndex: nextZ, fill: 'var(--bg-primary)', stroke: 'var(--border-color)', strokeWidth: 1, content: url, opacity: 1, locked: false, embedUrl: url, embedType: isYoutube ? 'youtube' : isFigma ? 'figma' : 'url' });
    setNextZ(z => z + 1);
    setEmbedUrl(''); setShowWebEmbed(false); setActiveTool('select');
    saveHistory('Create embed');
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    saveHistory('Delete objects');
    setObjects(prev => prev.filter(o => !selectedIds.includes(o.id)));
    setSelectedIds([]);
  };

  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    saveHistory('Duplicate objects');
    const newObjs = objects.filter(o => selectedIds.includes(o.id)).map(o => ({ ...o, id: generateId(), x: o.x + 30, y: o.y + 30, zIndex: nextZ + Math.random() }));
    setObjects(prev => [...prev, ...newObjs]);
    setNextZ(z => z + Math.floor(Math.random() * 100));
  };

  const bringToFront = () => {
    setObjects(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, zIndex: nextZ } : o));
    setNextZ(z => z + 1);
    saveHistory('Bring to front');
  };

  const toggleLock = () => {
    setObjects(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, locked: !o.locked } : o));
  };

  const groupSelected = () => {
    if (selectedIds.length < 2) return;
    const groupId = generateId();
    setObjects(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, groupId } : o));
    setSelectedIds([]);
    saveHistory('Group objects');
  };

  const ungroupSelected = () => {
    const groupIds = new Set(objects.filter(o => selectedIds.includes(o.id) && o.groupId).map(o => o.groupId));
    setObjects(prev => prev.map(o => groupIds.has(o.groupId) ? { ...o, groupId: undefined } : o));
    saveHistory('Ungroup objects');
  };

  const renderShapeSVG = (obj: CanvasObject) => {
    const w = obj.width, h = obj.height, sw = obj.strokeWidth || 2, fill = obj.fill || 'transparent', stroke = obj.stroke || 'var(--border-color)';
    const st = obj.shapeType || 'rect';

    if (st === 'rect') return <rect x={sw} y={sw} width={w - sw * 2} height={h - sw * 2} rx={2} fill={fill} stroke={stroke} strokeWidth={sw} />;
    if (st === 'rounded-rect') return <rect x={sw} y={sw} width={w - sw * 2} height={h - sw * 2} rx={12} fill={fill} stroke={stroke} strokeWidth={sw} />;
    if (st === 'circle') return <ellipse cx={w / 2} cy={h / 2} rx={Math.min(w, h) / 2 - sw} ry={Math.min(w, h) / 2 - sw} fill={fill} stroke={stroke} strokeWidth={sw} />;
    if (st === 'ellipse') return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - sw} ry={h / 2 - sw} fill={fill} stroke={stroke} strokeWidth={sw} />;
    if (st === 'pill') return <rect x={sw} y={sw} width={w - sw * 2} height={h - sw * 2} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={sw} />;
    if (st === 'triangle') {
      const pts = `${w / 2},${sw} ${w - sw},${h - sw} ${sw},${h - sw}`;
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
    }
    if (st === 'diamond') {
      const pts = `${w / 2},${sw} ${w - sw},${h / 2} ${w / 2},${h - sw} ${sw},${h / 2}`;
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
    }
    if (st === 'hexagon' || st === 'pentagon' || st === 'octagon') {
      const sides = st === 'hexagon' ? 6 : st === 'pentagon' ? 5 : 8;
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - sw;
      const pts = Array.from({ length: sides }, (_, i) => {
        const angle = (2 * Math.PI / sides) * i - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    }
    if (st === 'star' || st === 'star-4' || st === 'star-8') {
      const points = st === 'star-4' ? 4 : st === 'star-8' ? 8 : 5;
      const cx = w / 2, cy = h / 2, outerR = Math.min(w, h) / 2 - sw, innerR = outerR * 0.4;
      const pts = Array.from({ length: points * 2 }, (_, i) => {
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    }
    const arrowPaths: Record<string, string> = {
      'arrow-right': `M ${sw} ${h / 2} L ${w - sw * 3} ${h / 2} M ${w - sw * 4} ${h * 0.2} L ${w - sw} ${h / 2} L ${w - sw * 4} ${h * 0.8}`,
      'arrow-left': `M ${w - sw} ${h / 2} L ${sw * 3} ${h / 2} M ${sw * 4} ${h * 0.2} L ${sw} ${h / 2} L ${sw * 4} ${h * 0.8}`,
      'arrow-up': `M ${w / 2} ${h - sw} L ${w / 2} ${sw * 3} M ${w * 0.2} ${sw * 4} L ${w / 2} ${sw} L ${w * 0.8} ${sw * 4}`,
      'arrow-down': `M ${w / 2} ${sw} L ${w / 2} ${h - sw * 3} M ${w * 0.2} ${h - sw * 4} L ${w / 2} ${h - sw} L ${w * 0.8} ${h - sw * 4}`,
      'arrow-2way': `M ${sw} ${h / 2} L ${w - sw} ${h / 2} M ${sw * 4} ${h * 0.2} L ${sw} ${h / 2} L ${sw * 4} ${h * 0.8} M ${w - sw * 4} ${h * 0.2} L ${w - sw} ${h / 2} L ${w - sw * 4} ${h * 0.8}`,
      'arrow-curve': `M ${sw} ${h - sw} C ${w * 0.3} ${h * 0.3}, ${w * 0.7} ${h * 0.3}, ${w - sw} ${h / 2} M ${w - sw * 4} ${h * 0.3} L ${w - sw} ${h / 2} L ${w - sw * 4} ${h * 0.7}`,
    };
    if (arrowPaths[st]) {
      return <path d={arrowPaths[st]} fill="none" stroke={fill || stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />;
    }
    const specialPaths: Record<string, React.ReactNode> = {
      'cloud': <g><circle cx={w * 0.3} cy={h * 0.5} r={Math.min(w, h) * 0.25} fill={fill} stroke={stroke} strokeWidth={sw} /><circle cx={w * 0.5} cy={h * 0.35} r={Math.min(w, h) * 0.3} fill={fill} stroke={stroke} strokeWidth={sw} /><circle cx={w * 0.7} cy={h * 0.4} r={Math.min(w, h) * 0.22} fill={fill} stroke={stroke} strokeWidth={sw} /><circle cx={w * 0.65} cy={h * 0.6} r={Math.min(w, h) * 0.2} fill={fill} stroke={stroke} strokeWidth={sw} /><circle cx={w * 0.4} cy={h * 0.65} r={Math.min(w, h) * 0.22} fill={fill} stroke={stroke} strokeWidth={sw} /></g>,
      'callout': <g><rect x={sw} y={sw} width={w - sw * 2} height={h * 0.78} rx={8} fill={fill} stroke={stroke} strokeWidth={sw} /><polygon points={`${w * 0.12},${h * 0.78} ${w * 0.22},${h * 0.78} ${w * 0.08},${h - sw}`} fill={fill} stroke={stroke} strokeWidth={sw} /></g>,
      'cylinder': <g><ellipse cx={w / 2} cy={8} rx={w / 2 - sw} ry={8} fill={fill} stroke={stroke} strokeWidth={sw} /><rect x={sw} y={8} width={w - sw * 2} height={h - 20} fill={fill} /><ellipse cx={w / 2} cy={h - 12} rx={w / 2 - sw} ry={8} fill={fill} stroke={stroke} strokeWidth={sw} /><line x1={sw} y1={8} x2={sw} y2={h - 12} stroke={stroke} strokeWidth={sw} /><line x1={w - sw} y1={8} x2={w - sw} y2={h - 12} stroke={stroke} strokeWidth={sw} /></g>,
      'document': <g><path d={`M ${sw * 2} ${sw} L ${w - sw} ${sw} L ${w - sw} ${h - sw} L ${sw * 2} ${h - sw} Z`} fill={fill} stroke={stroke} strokeWidth={sw} /><line x1={w * 0.3} y1={h * 0.3} x2={w * 0.8} y2={h * 0.3} stroke={stroke || 'var(--text-muted)'} strokeWidth={1.5} strokeDasharray="3 3" /><line x1={w * 0.3} y1={h * 0.45} x2={w * 0.8} y2={h * 0.45} stroke={stroke || 'var(--text-muted)'} strokeWidth={1.5} strokeDasharray="3 3" /><line x1={w * 0.3} y1={h * 0.6} x2={w * 0.8} y2={h * 0.6} stroke={stroke || 'var(--text-muted)'} strokeWidth={1.5} strokeDasharray="3 3" /></g>,
      'folder': <g><path d={`M ${sw} ${h * 0.3} L ${sw} ${h - sw} L ${w - sw} ${h - sw} L ${w - sw} ${h * 0.3} Z`} fill={fill} stroke={stroke} strokeWidth={sw} /><path d={`M ${sw} ${h * 0.3} L ${w * 0.35} ${h * 0.3} L ${w * 0.45} ${h * 0.15} L ${w - sw} ${h * 0.15} L ${w - sw} ${h * 0.3}`} fill={fill} stroke={stroke} strokeWidth={sw} /></g>,
      'database': <g><ellipse cx={w / 2} cy={h * 0.2} rx={w / 2 - sw} ry={h * 0.12} fill={fill} stroke={stroke} strokeWidth={sw} /><rect x={sw} y={h * 0.2} width={w - sw * 2} height={h * 0.6} fill={fill} /><line x1={sw} y1={h * 0.2} x2={sw} y2={h * 0.8} stroke={stroke} strokeWidth={sw} /><line x1={w - sw} y1={h * 0.2} x2={w - sw} y2={h * 0.8} stroke={stroke} strokeWidth={sw} /><ellipse cx={w / 2} cy={h * 0.8} rx={w / 2 - sw} ry={h * 0.12} fill={fill} stroke={stroke} strokeWidth={sw} /><line x1={w * 0.3} y1={h * 0.2} x2={w * 0.3} y2={h * 0.8} stroke={stroke} strokeWidth={sw} /></g>,
      'person': <g><circle cx={w / 2} cy={h * 0.25} r={h * 0.15} fill={fill} stroke={stroke} strokeWidth={sw} /><ellipse cx={w / 2} cy={h * 0.7} rx={w * 0.35} ry={h * 0.3} fill={fill} stroke={stroke} strokeWidth={sw} /></g>,
      'flag': <g><line x1={sw * 2} y1={sw} x2={sw * 2} y2={h - sw} stroke={stroke} strokeWidth={2} /><path d={`M ${sw * 2} ${sw} L ${w - sw} ${h * 0.3} L ${sw * 2} ${h * 0.55} Z`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" /></g>,
      'lightbulb': <g><ellipse cx={w / 2} cy={h * 0.4} rx={w * 0.3} ry={h * 0.28} fill={fill} stroke={stroke} strokeWidth={sw} /><rect x={w / 2 - w * 0.06} y={h * 0.65} width={w * 0.12} height={h * 0.12} rx={2} fill={fill} stroke={stroke} strokeWidth={sw} /><line x1={w / 2 - w * 0.1} y1={h * 0.82} x2={w / 2 + w * 0.1} y2={h * 0.82} stroke={stroke} strokeWidth={1.5} /></g>,
      'heart': <path d={`M ${w / 2} ${h * 0.25} C ${w * 0.1} ${h * -0.05}, ${w * -0.05} ${h * 0.45}, ${w / 2} ${h * 0.85} C ${w * 1.05} ${h * 0.45}, ${w * 0.9} ${h * -0.05}, ${w / 2} ${h * 0.25} Z`} fill={fill} stroke={stroke} strokeWidth={sw} />,
      'cross': <g><rect x={w * 0.35} y={sw} width={w * 0.3} height={h - sw * 2} rx={3} fill={fill} stroke={stroke} strokeWidth={sw} /><rect x={sw} y={h * 0.35} width={w - sw * 2} height={h * 0.3} rx={3} fill={fill} stroke={stroke} strokeWidth={sw} /></g>,
      'check': <polyline points={`${w * 0.15},${h * 0.5} ${w * 0.4},${h * 0.75} ${w * 0.85},${h * 0.25}`} fill="none" stroke={fill || stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />,
      'x-mark': <g><line x1={w * 0.2} y1={h * 0.2} x2={w * 0.8} y2={h * 0.8} stroke={fill || stroke} strokeWidth={3} strokeLinecap="round" /><line x1={w * 0.8} y1={h * 0.2} x2={w * 0.2} y2={h * 0.8} stroke={fill || stroke} strokeWidth={3} strokeLinecap="round" /></g>,
      'bracket': <g><path d={`M ${w * 0.15} ${sw} L ${sw} ${sw} L ${sw} ${h - sw} L ${w * 0.15} ${h - sw}`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><path d={`M ${w * 0.85} ${sw} L ${w - sw} ${sw} L ${w - sw} ${h - sw} L ${w * 0.85} ${h - sw}`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></g>,
      'brace': <g><path d={`M ${w * 0.2} ${sw} Q ${sw} ${h * 0.3}, ${sw} ${h / 2} Q ${sw} ${h * 0.7}, ${w * 0.2} ${h - sw}`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" /><path d={`M ${w * 0.8} ${sw} Q ${w - sw} ${h * 0.3}, ${w - sw} ${h / 2} Q ${w - sw} ${h * 0.7}, ${w * 0.8} ${h - sw}`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" /></g>,
      'circle-dot': <g><circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2 - sw} fill="none" stroke={stroke} strokeWidth={sw} /><circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.12} fill={fill || stroke} /></g>,
    };
    if (specialPaths[st]) return specialPaths[st];
    return <rect x={sw} y={sw} width={w - sw * 2} height={h - sw * 2} rx={6} fill={fill} stroke={stroke} strokeWidth={sw} />;
  };

  const renderConnector = (obj: CanvasObject) => {
    const { x, y, width, height, connectorStart, connectorEnd, connectorType: cType } = obj;
    const sx = connectorStart?.x ?? x;
    const sy = connectorStart?.y ?? y + height / 2;
    const ex = connectorEnd?.x ?? x + width;
    const ey = connectorEnd?.y ?? y + height / 2;
    const dx = ex - sx, dy = ey - sy;
    let pathD = '';
    if (cType === 'curved') {
      pathD = `M ${sx} ${sy} C ${sx + dx * 0.4} ${sy}, ${ex - dx * 0.4} ${ey}, ${ex} ${ey}`;
    } else if (cType === 'elbow') {
      const midX = (sx + ex) / 2;
      pathD = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ey} L ${ex} ${ey}`;
    } else {
      pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    return (
      <div key={obj.id} style={{ position: 'absolute', left: Math.min(sx, ex) - 20, top: Math.min(sy, ey) - 20, width: Math.abs(dx) + 40, height: Math.abs(dy) + 40, pointerEvents: 'none', zIndex: obj.zIndex }}>
        <svg width={Math.abs(dx) + 40} height={Math.abs(dy) + 40} style={{ overflow: 'visible' }}>
          <path d={pathD} fill="none" stroke={obj.stroke || 'var(--accent-color)'} strokeWidth={obj.strokeWidth || 2} strokeLinecap="round" />
          {obj.content && (
            <text x={Math.abs(dx) / 2} y={-10} textAnchor="middle" fill="var(--text-muted)" fontSize={11} fontWeight={500}>
              {obj.content}
            </text>
          )}
          <polygon points={`${ex},${ey} ${ex - 8},${ey - 5} ${ex - 8},${ey + 5}`} fill={obj.stroke || 'var(--accent-color)'} />
        </svg>
      </div>
    );
  };

  const renderTable = (obj: CanvasObject) => {
    const td = obj.tableData;
    if (!td) return null;
    const colW = obj.width / td.cols;
    const rowH = obj.height / td.rows;
    const cells = [];
    for (let r = 0; r < td.rows; r++) {
      for (let c = 0; c < td.cols; c++) {
        const key = `${r},${c}`;
        const val = td.cells[key] || '';
        const isHeader = r === 0;
        cells.push(
          <div key={key} style={{
            position: 'absolute', left: c * colW, top: r * rowH, width: colW, height: rowH,
            borderRight: c < td.cols - 1 ? '1px solid var(--border-color)' : 'none',
            borderBottom: r < td.rows - 1 ? '1px solid var(--border-color)' : 'none',
            display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: '11px', fontWeight: isHeader ? 700 : 400,
            background: isHeader ? 'var(--bg-tertiary)' : 'transparent', color: 'var(--text-primary)',
            overflow: 'hidden', boxSizing: 'border-box', cursor: 'text',
          }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newCells = { ...td.cells, [key]: e.currentTarget.innerText };
              setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, tableData: { ...td, cells: newCells } } : o));
            }}
          >
            {val}
          </div>
        );
      }
    }
    return (
      <div key={obj.id} style={{ position: 'absolute', left: obj.x, top: obj.y, width: obj.width, height: obj.height, border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', background: obj.fill, zIndex: obj.zIndex, opacity: obj.opacity }}>
        {cells}
      </div>
    );
  };

  const renderObject = (obj: CanvasObject) => {
    const isSelected = selectedIds.includes(obj.id);
    const isEditing = editingObject === obj.id;
    const baseS: React.CSSProperties = { position: 'absolute', left: obj.x, top: obj.y, width: obj.width, height: obj.height, transform: `rotate(${obj.rotation}deg)`, zIndex: obj.zIndex, opacity: obj.opacity, cursor: activeTool === 'select' && !obj.locked ? 'move' : 'default', userSelect: 'none' };

    if (obj.type === 'connector') return renderConnector(obj);
    if (obj.type === 'table') return renderTable(obj);

    if (obj.type === 'sticky') {
      return (
        <div key={obj.id} style={{ ...baseS, background: obj.fill, borderRadius: '4px', boxShadow: 'var(--shadow-md), 2px 2px 0 rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', border: isSelected ? '2px solid #6366f1' : 'none', overflow: 'hidden', width: obj.width, height: obj.height }}>
          {isEditing ? (
            <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus
              onBlur={() => { setObjects(prev => prev.map(o => o.id === editingObject ? { ...o, content: editText } : o)); setEditingObject(null); saveHistory('Edit sticky'); }}
              style={{ flexGrow: 1, width: '100%', padding: '10px', background: 'transparent', border: 'none', color: obj.color || '#1a1a2e', fontSize: `${obj.fontSize || 14}px`, outline: 'none', resize: 'none' }} placeholder="Type..." />
          ) : (
            <div onDoubleClick={() => { setEditingObject(obj.id); setEditText(obj.content); }}
              style={{ flexGrow: 1, padding: '10px', fontSize: `${obj.fontSize || 14}px`, color: obj.color || '#1a1a2e', overflow: 'hidden', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
              {obj.content || <span style={{ opacity: 0.4 }}>Double-click</span>}
            </div>
          )}
          <div style={{ display: 'flex', gap: '2px', padding: '4px 6px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            {STICKY_COLORS.slice(0, 6).map(c => (
              <div key={c} onClick={() => setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, fill: c } : o))}
                style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, cursor: 'pointer', border: c === obj.fill ? '2px solid #6366f1' : '1px solid rgba(0,0,0,0.1)' }} />
            ))}
          </div>
        </div>
      );
    }

    if (obj.type === 'shape') {
      return (
        <div key={obj.id} style={{ ...baseS, pointerEvents: 'auto' }}>
          <svg width={obj.width} height={obj.height} style={{ display: 'block' }}>{renderShapeSVG(obj)}</svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${obj.fontSize || 12}px`, color: obj.color || 'var(--text-primary)', fontWeight: 500, pointerEvents: 'none', padding: '8px', textAlign: 'center', overflow: 'hidden' }}>
            {obj.content !== obj.shapeType ? obj.content : ''}
          </div>
          {isSelected && <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#6366f1', border: '2px solid white' }} />}
        </div>
      );
    }

    if (obj.type === 'text') {
      return (
        <div key={obj.id} style={{ ...baseS, width: obj.width, height: obj.height }}>
          {isEditing ? (
            <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus
              onBlur={() => { setObjects(prev => prev.map(o => o.id === editingObject ? { ...o, content: editText, width: Math.max(o.width, 60), height: Math.max(o.height, 30) } : o)); setEditingObject(null); saveHistory('Edit text'); }}
              onKeyDown={e => { if (e.key === 'Escape') { setEditingObject(null); } }}
              style={{ width: '100%', height: '100%', padding: '6px 10px', background: 'transparent', border: '1px solid #6366f1', borderRadius: '4px', color: obj.color || 'var(--text-primary)', fontSize: `${obj.fontSize || 16}px`, outline: 'none', resize: 'both', whiteSpace: 'pre-wrap', lineHeight: 1.4, fontFamily: obj.fontFamily || 'inherit' }} />
          ) : (
            <div onDoubleClick={() => { setEditingObject(obj.id); setEditText(obj.content); }}
              style={{ padding: '6px 10px', fontSize: `${obj.fontSize || 16}px`, color: obj.color || 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.4, border: isSelected ? '1px solid #6366f1' : '1px solid transparent', borderRadius: '4px', minHeight: obj.height, minWidth: obj.width, fontWeight: obj.bold ? 700 : 400, fontStyle: obj.italic ? 'italic' : 'normal', textDecoration: obj.underline ? 'underline' : 'none' }}>
              {obj.content}
            </div>
          )}
        </div>
      );
    }

    if (obj.type === 'drawing') {
      return (<div key={obj.id} style={{ ...baseS, border: isSelected ? '2px solid #6366f1' : 'none', borderRadius: '4px', overflow: 'hidden' }}>
        {obj.drawingData && <img src={obj.drawingData} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />}
      </div>);
    }

    if (obj.type === 'image') {
      return (<div key={obj.id} style={{ ...baseS, border: isSelected ? '2px solid #6366f1' : '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
        {obj.imageUrl ? <img src={obj.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px', gap: '6px' }}>
            <ImageIcon size={20} /> Drop image
          </div>}
      </div>);
    }

    if (obj.type === 'comment') {
      return (
        <div key={obj.id} style={{ ...baseS, background: obj.fill, border: `1px solid ${isSelected ? '#6366f1' : 'var(--border-color)'}`, borderRadius: '10px', boxShadow: 'var(--shadow-md)', padding: '10px', display: 'flex', flexDirection: 'column', minWidth: '260px', minHeight: '70px', cursor: 'default' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquareText size={12} /> {obj.tags?.[0] || 'Comment'}</span>
          </div>
          <div contentEditable suppressContentEditableWarning
            onBlur={e => setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, content: e.currentTarget.innerText } : o))}
            style={{ fontSize: '12px', color: 'var(--text-primary)', outline: 'none', whiteSpace: 'pre-wrap', flexGrow: 1 }}
          >{obj.content}</div>
        </div>
      );
    }

    if (obj.type === 'frame') {
      return (
        <div key={obj.id} style={{ position: 'absolute', left: obj.x, top: obj.y, width: obj.width, height: obj.height, border: `2px dashed ${obj.fill || '#6366f1'}`, borderRadius: '8px', background: `${obj.fill}08`, zIndex: obj.zIndex }} data-frame>
          <div style={{ position: 'absolute', top: '-10px', left: '12px', background: obj.fill || '#6366f1', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '4px' }}>{obj.content || 'Frame'}</div>
        </div>
      );
    }

    if (obj.type === 'embed') {
      let embedContent: React.ReactNode = null;
      if (obj.embedType === 'youtube') {
        const vid = obj.embedUrl?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
        embedContent = vid ? <iframe src={`https://www.youtube.com/embed/${vid}`} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }} allowFullScreen /> : <div style={{ padding: 20, color: 'var(--text-muted)' }}>Invalid YouTube URL</div>;
      } else if (obj.embedType === 'figma') {
        embedContent = <iframe src={obj.embedUrl?.replace('figma.com/file', 'figma.com/embed')} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px', background: '#fff' }} />;
      } else {
        embedContent = <iframe src={obj.embedUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }} sandbox="allow-scripts" />;
      }
      return (<div key={obj.id} style={{ ...baseS, border: isSelected ? '2px solid #6366f1' : '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: obj.fill }}>
        {embedContent}
      </div>);
    }

    if (obj.type === 'sticker') {
      return (<div key={obj.id} style={{ ...baseS, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${obj.fontSize || 24}px`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))', pointerEvents: 'auto', cursor: 'pointer' }}>
        {obj.stickerType || obj.content || '👍'}
      </div>);
    }

    if (obj.type === 'vote-session') {
      const opts = obj.voteOptions || [];
      return (
        <div key={obj.id} style={{ ...baseS, background: obj.fill, border: `1px solid ${isSelected ? '#6366f1' : 'var(--border-color)'}`, borderRadius: '10px', boxShadow: 'var(--shadow-md)', padding: '12px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{obj.content || 'Vote'}</div>
          {opts.map((opt, i) => {
            const total = obj.voteTotal || 1;
            const pct = total > 0 ? (opt.count / total) * 100 : 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ flexGrow: 1, height: '24px', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                  onClick={() => setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, voteOptions: o.voteOptions?.map((v, vi) => vi === i ? { ...v, count: v.count + 1 } : v), voteTotal: (o.voteTotal || 0) + 1 } : o))}>
                  <div style={{ height: '100%', width: `${pct}%`, background: VOTE_COLORS[i % VOTE_COLORS.length], borderRadius: '4px', transition: 'width 0.3s' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '11px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {opt.label} <span style={{ marginLeft: 'auto', opacity: 0.6 }}>{opt.count} votes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (obj.type === 'timer') {
      const mins = Math.floor((obj.timerRemaining || 0) / 60);
      const secs = (obj.timerRemaining || 0) % 60;
      return (
        <div key={obj.id} style={{ ...baseS, background: obj.fill, border: `1px solid ${isSelected ? '#6366f1' : 'var(--border-color)'}`, borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'default' }}>
          <span style={{ fontSize: `${obj.fontSize || 22}px`, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{mins}:{secs.toString().padStart(2, '0')}</span>
          <button onClick={() => setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, timerRunning: !o.timerRunning, timerRemaining: o.timerRemaining || o.timerDuration || 300 } : o))}
            style={{ border: 'none', background: 'var(--accent-color)', color: 'white', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
            {obj.timerRunning ? '⏸' : '▶'}
          </button>
          <button onClick={() => setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, timerRunning: false, timerRemaining: o.timerDuration || 300 } : o))}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '11px' }}>↺</button>
        </div>
      );
    }

    if (obj.type === 'ai-card') {
      return (
        <div key={obj.id} style={{ ...baseS, background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))', border: `1px solid ${isSelected ? '#6366f1' : 'rgba(99,102,241,0.2)'}`, borderRadius: '10px', padding: '12px', boxShadow: 'var(--shadow-md)', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Sparkles size={12} /> AI GENERATED
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{obj.content}</div>
          {obj.aiSourceRefs && obj.aiSourceRefs.length > 0 && (
            <div style={{ fontSize: '9px', color: 'var(--text-placeholder)', borderTop: '1px solid var(--border-color)', paddingTop: '4px', marginTop: '4px' }}>
              Sources: {obj.aiSourceRefs.join(', ')}
            </div>
          )}
        </div>
      );
    }

    if (obj.type === 'mindmap') {
      return (
        <div key={obj.id} style={{ ...baseS, background: obj.fill || 'transparent', border: isSelected ? '1px solid #6366f1' : 'none', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: `${obj.fontSize || 13}px`, fontWeight: 600, color: obj.color || 'var(--text-primary)', minWidth: 60, minHeight: 30 }}
          onDoubleClick={() => { setEditingObject(obj.id); setEditText(obj.content); }}>
          {isEditing ? (
            <input value={editText} onChange={e => setEditText(e.target.value)} autoFocus
              onBlur={() => { setObjects(prev => prev.map(o => o.id === editingObject ? { ...o, content: editText } : o)); setEditingObject(null); }}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }} />
          ) : obj.content || 'Mind Map Node'}
        </div>
      );
    }

    return null;
  };

  const renderFreehandPreview = () => {
    if (!isFreeDrawing || drawingPath.length < 2) return null;
    const bounds = getPathBounds(drawingPath);
    return (
      <svg style={{ position: 'absolute', left: bounds.minX - 20, top: bounds.minY - 20, width: bounds.maxX - bounds.minX + 40, height: bounds.maxY - bounds.minY + 40, pointerEvents: 'none', zIndex: 99999 }}>
        <polyline points={drawingPath.map(p => `${p.x - bounds.minX + 20},${p.y - bounds.minY + 20}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const zoomToFit = () => {
    if (objects.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    objects.forEach(o => { if (o.x < minX) minX = o.x; if (o.y < minY) minY = o.y; if (o.x + o.width > maxX) maxX = o.x + o.width; if (o.y + o.height > maxY) maxY = o.y + o.height; });
    const cw = containerRef.current?.clientWidth || 800, ch = containerRef.current?.clientHeight || 600;
    const nz = Math.min(cw / (maxX - minX + 100), ch / (maxY - minY + 100), 1.5);
    setZoom(Math.max(0.2, nz));
    setPanX((cw - (maxX - minX + 100) * nz) / 2 - minX * nz + 50);
    setPanY((ch - (maxY - minY + 100) * nz) / 2 - minY * nz + 50);
  };

  const generateAICard = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      const responses = [
        'Here is a structured summary of the key points based on your request. The main findings indicate several important trends that should be monitored closely.',
        '**Analysis Results:**\n• Revenue grew 23% YoY\n• Customer acquisition cost decreased 15%\n• Net promoter score improved to 72\n• Top growth channels: organic, referral, paid',
        '**Action Items:**\n1. Finalize Q3 roadmap by Friday\n2. Review design mockups for the new dashboard\n3. Schedule user testing sessions\n4. Update documentation for API v2',
        '**Ideas Brainstorm:**\n• AI-powered recommendation engine\n• Real-time collaboration features\n• Mobile-first redesign\n• Integration with popular tools\n• Gamification for user engagement',
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addObject({ id: generateId(), type: 'ai-card', x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, width: 240, height: 120, rotation: 0, zIndex: nextZ, fill: 'transparent', stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1, content: `${aiPrompt}\n\n${response}`, opacity: 1, locked: false, fontSize: 12, aiSourceRefs: ['AI Generated'] });
      setNextZ(z => z + 1);
      setAiGenerating(false);
      setAiPrompt('');
      saveHistory('AI generate card');
    }, 1000);
  };

  const templates = [
    { name: 'Brainstorming', icon: '💡', items: ['Idea 1', 'Idea 2', 'Idea 3', 'Idea 4'] },
    { name: 'Sprint Planning', icon: '🎯', items: ['Goals', 'Tasks', 'Deadlines', 'Review'] },
    { name: 'Retrospective', icon: '🔄', items: ['Start', 'Stop', 'Continue', 'Actions'] },
    { name: 'SWOT Analysis', icon: '📊', items: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'] },
    { name: 'User Journey', icon: '🗺️', items: ['Discovery', 'Consider', 'Purchase', 'Retain'] },
    { name: 'OKR Planning', icon: '🎯', items: ['Objective 1', 'KR 1.1', 'KR 1.2', 'KR 1.3'] },
    { name: 'Kanban Board', icon: '📋', items: ['Backlog', 'To Do', 'In Progress', 'Done'] },
  ];

  const loadTemplate = (template: typeof templates[0]) => {
    const newObjs: CanvasObject[] = [];
    template.items.forEach((item, i) => {
      newObjs.push({ id: generateId(), type: 'sticky', x: 100 + i * 200, y: 150, width: 160, height: 100, rotation: Math.random() * 2 - 1, zIndex: nextZ + i, fill: STICKY_COLORS[i % STICKY_COLORS.length], stroke: 'transparent', strokeWidth: 0, content: item, opacity: 1, locked: false, fontSize: 14, color: '#1a1a2e' });
    });
    setObjects(prev => [...prev, ...newObjs]);
    setNextZ(z => z + template.items.length);
    setShowTemplates(false);
    saveHistory('Load template');
  };

  const renderMinimap = () => {
    if (!showMinimap || objects.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    objects.forEach(o => { if (o.x < minX) minX = o.x; if (o.y < minY) minY = o.y; if (o.x + o.width > maxX) maxX = o.x + o.width; if (o.y + o.height > maxY) maxY = o.y + o.height; });
    const scale = Math.min(140 / (maxX - minX + 40), 90 / (maxY - minY + 40), 1);
    return (
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 100, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px', boxShadow: 'var(--shadow-lg)' }}>
        <svg width={140} height={90} style={{ background: 'var(--bg-secondary)', borderRadius: '4px' }}>
          {objects.map(o => (
            <rect key={o.id} x={(o.x - minX + 20) * scale} y={(o.y - minY + 20) * scale} width={Math.max(o.width * scale, 2)} height={Math.max(o.height * scale, 2)}
              fill={o.type === 'sticky' ? o.fill : o.type === 'frame' ? `${o.fill}40` : 'var(--text-muted)'} rx={1} opacity={0.6} />
          ))}
        </svg>
      </div>
    );
  };

  const exportBoard = (format: 'png' | 'pdf') => {
    if (format === 'png') {
      const el = containerRef.current;
      if (!el) return;
      customAlert('Export feature: Board content would be rendered to PNG/PDF. In production, this uses html2canvas or Puppeteer.');
    }
    setShowExport(false);
  };

  useEffect(() => {
    if (!timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setObjects(prev => prev.map(o => {
          if (o.type === 'timer' && o.timerRunning && (o.timerRemaining || 0) > 0) {
            return { ...o, timerRemaining: (o.timerRemaining || 0) - 1 };
          }
          return o;
        }));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const frameObjects = objects.filter(o => o.type === 'frame');

  const renderPresentationOverlay = () => {
    if (!presentationMode) return null;
    const frames = frameObjects;
    const currentFrame = frames[presentationFrame];
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'var(--bg-primary)', overflow: 'hidden' }}>
        {currentFrame ? (
          <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', transform: `scale(${Math.min(window.innerWidth / currentFrame.width, window.innerHeight / currentFrame.height)})`, transformOrigin: '0 0', left: currentFrame.x * -1, top: currentFrame.y * -1 }}>
              {objects.filter(o => o.zIndex <= currentFrame.zIndex).map(renderObject)}
            </div>
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '12px', color: 'white' }}>
              <button onClick={() => setPresentationFrame(Math.max(0, presentationFrame - 1))} style={{ border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }} disabled={presentationFrame === 0}>← Prev</button>
              <span style={{ fontSize: '13px' }}>Frame {presentationFrame + 1} of {frames.length}</span>
              <button onClick={() => setPresentationFrame(Math.min(frames.length - 1, presentationFrame + 1))} style={{ border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }} disabled={presentationFrame === frames.length - 1}>Next →</button>
              <button onClick={() => setPresentationMode(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', borderRadius: '6px', padding: '4px 12px', marginLeft: '16px', fontSize: '12px' }}>Exit</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>No frames to present</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Create Frame objects on the canvas to use presentation mode.</p>
            <button onClick={() => setPresentationMode(false)} className="cover-btn">Exit</button>
          </div>
        )}
      </div>
    );
  };

  const toolbarItems = [
    { id: 'select', icon: <MousePointer size={18} />, title: 'Select (V)' },
    { id: 'sticky', icon: <StickyNote size={18} />, title: 'Sticky Note (S)' },
    { id: 'text', icon: <Type size={18} />, title: 'Text (T)' },
    { id: 'shape', icon: <Square size={18} />, title: 'Shape (H)' },
    { id: 'connector', icon: <ArrowRight size={18} />, title: 'Connector (L)' },
    { id: 'draw', icon: <Pencil size={18} />, title: 'Freehand (D)' },
    { id: 'image', icon: <ImageIcon size={18} />, title: 'Image (I)' },
    { id: 'comment', icon: <MessageSquareText size={18} />, title: 'Comment (C)' },
    { id: 'table', icon: <Table size={18} />, title: 'Table' },
    { id: 'sticker', icon: <Smile size={18} />, title: 'Sticker' },
    { id: 'vote', icon: <Vote size={18} />, title: 'Vote' },
    { id: 'timer', icon: <TimerIcon size={18} />, title: 'Timer' },
    { id: 'embed', icon: <Globe size={18} />, title: 'Web Embed' },
    { id: 'ai-card', icon: <Sparkles size={18} />, title: 'AI Card' },
  ];

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input value={canvasTitle} onChange={e => setCanvasTitle(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700, outline: 'none', width: '180px' }} />
          <div style={{ display: 'flex', gap: '3px', borderLeft: '1px solid var(--border-color)', paddingLeft: '8px' }}>
            <button onClick={undo} className="cover-btn" style={{ padding: '4px 6px' }} title="Undo"><Undo2 size={13} /></button>
            <button onClick={redo} className="cover-btn" style={{ padding: '4px 6px' }} title="Redo"><Redo2 size={13} /></button>
          </div>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '8px' }}>
              <button className="cover-btn" onClick={duplicateSelected} title="Duplicate" style={{ padding: '4px 6px' }}><Copy size={13} /></button>
              <button className="cover-btn" onClick={bringToFront} title="Bring to front" style={{ padding: '4px 6px' }}><Layers size={13} /></button>
              <button className="cover-btn" onClick={toggleLock} title="Lock/Unlock" style={{ padding: '4px 6px' }}><Lock size={13} /></button>
              {objects.filter(o => selectedIds.includes(o.id)).some(o => o.groupId) ? (
                <button className="cover-btn" onClick={ungroupSelected} title="Ungroup" style={{ padding: '4px 6px' }}><Group size={13} /></button>
              ) : selectedIds.length > 1 && (
                <button className="cover-btn" onClick={groupSelected} title="Group" style={{ padding: '4px 6px' }}><Group size={13} /></button>
              )}
              <button className="cover-btn" onClick={deleteSelected} title="Delete" style={{ padding: '4px 6px', color: 'var(--danger-color)' }}><Trash2 size={13} /></button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button className="cover-btn" onClick={() => setShowTemplates(!showTemplates)} style={{ padding: '4px 8px', fontSize: '11px' }}>📋 Templates</button>
          <button className="cover-btn" onClick={() => setShowWebEmbed(!showWebEmbed)} style={{ padding: '4px 8px' }} title="Web Embed"><Globe size={13} /></button>
          <button className="cover-btn" onClick={() => setShowAIPanel(!showAIPanel)} style={{ padding: '4px 8px', color: showAIPanel ? '#6366f1' : undefined }} title="AI Panel"><Sparkles size={13} /></button>
          <div style={{ display: 'flex', gap: '2px', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
            <button className="cover-btn" onClick={() => setZoom(Math.max(0.1, zoom / 1.25))} style={{ padding: '2px 5px', border: 'none' }}><ZoomOut size={12} /></button>
            <span style={{ fontSize: '10px', fontWeight: 600, minWidth: '32px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button className="cover-btn" onClick={() => setZoom(Math.min(10, zoom * 1.25))} style={{ padding: '2px 5px', border: 'none' }}><ZoomIn size={12} /></button>
          </div>
          <button className="cover-btn" onClick={zoomToFit} style={{ padding: '4px 6px' }} title="Fit"><Maximize size={12} /></button>
          <button className="cover-btn" onClick={() => setShowMinimap(!showMinimap)} style={{ padding: '4px 6px', color: showMinimap ? '#6366f1' : undefined }}><Grid3x3 size={12} /></button>
          <button className="cover-btn" onClick={() => setShowComments(!showComments)} style={{ padding: '4px 6px', color: showComments ? '#6366f1' : undefined }}><MessageSquareText size={12} /></button>
          <button className="cover-btn" onClick={() => setPresentationMode(true)} style={{ padding: '4px 6px' }} title="Present"><Presentation size={12} /></button>
          <button className="cover-btn" onClick={() => setIsLaserActive(!isLaserActive)} style={{ padding: '4px 6px', color: isLaserActive ? '#ef4444' : undefined }} title="Laser Pointer">{isLaserActive ? '🔴' : '🔦'}</button>
          <button className="cover-btn" onClick={() => setShowExport(!showExport)} style={{ padding: '4px 6px' }} title="Export"><Download size={12} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Toolbar */}
        <div style={{ width: '44px', background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 3px', gap: '1px', flexShrink: 0 }}>
          {toolbarItems.map(tool => (
            <button key={tool.id} onClick={() => { if (tool.id === 'shape') setShowShapeMenu(!showShapeMenu); else if (tool.id === 'embed') setShowWebEmbed(true); else { setActiveTool(tool.id); setShowShapeMenu(false); } }}
              title={tool.title}
              style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '7px', cursor: 'pointer', border: 'none', background: activeTool === tool.id ? 'var(--accent-light)' : 'transparent', color: activeTool === tool.id ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '11px', transition: 'all 0.15s' }}
              className={activeTool !== tool.id ? 'hover-bg' : ''}>
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Shape Submenu */}
        {showShapeMenu && (
          <div style={{ position: 'absolute', left: '48px', top: '120px', zIndex: 200, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px', boxShadow: 'var(--shadow-lg)', width: '200px', maxHeight: '360px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
              {['Basic', 'Stars', 'Arrows', 'Objects'].map(cat => (
                <button key={cat} onClick={() => setShowShapeCategory(cat)}
                  style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: showShapeCategory === cat ? 'var(--accent-light)' : 'transparent', color: showShapeCategory === cat ? 'var(--accent-color)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {ALL_SHAPES.filter(s => s.category === showShapeCategory).map(s => (
                <button key={s.id} onClick={() => { setActiveShapeType(s.id); setActiveTool('shape'); setShowShapeMenu(false); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 4px', borderRadius: '6px', cursor: 'pointer', border: activeShapeType === s.id ? '1px solid var(--accent-color)' : '1px solid transparent', background: 'transparent', color: 'var(--text-primary)', fontSize: '9px' }} className="hover-bg">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    {s.id === 'rect' && <rect x="3" y="5" width="18" height="14" rx="1" fill="var(--text-muted)" />}
                    {s.id === 'rounded-rect' && <rect x="3" y="5" width="18" height="14" rx="4" fill="var(--text-muted)" />}
                    {s.id === 'circle' && <circle cx="12" cy="12" r="9" fill="var(--text-muted)" />}
                    {s.id === 'ellipse' && <ellipse cx="12" cy="12" rx="10" ry="7" fill="var(--text-muted)" />}
                    {s.id === 'triangle' && <polygon points="12,3 21,19 3,19" fill="var(--text-muted)" />}
                    {s.id === 'diamond' && <polygon points="12,3 21,12 12,21 3,12" fill="var(--text-muted)" />}
                    {s.id === 'hexagon' && <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="var(--text-muted)" />}
                    {s.id === 'pentagon' && <polygon points="12,2 21,9 17,20 7,20 3,9" fill="var(--text-muted)" />}
                    {s.id === 'octagon' && <polygon points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7" fill="var(--text-muted)" />}
                    {s.id === 'star' && <polygon points="12,2 14.5,8.5 21,9 16,14 17.5,21 12,17 6.5,21 8,14 3,9 9.5,8.5" fill="var(--text-muted)" />}
                    {s.id === 'pill' && <rect x="4" y="6" width="16" height="12" rx="6" fill="var(--text-muted)" />}
                    {(s.id === 'cloud' || s.id === 'callout' || s.id === 'cylinder' || s.id === 'document' || s.id === 'folder' || s.id === 'database' || s.id === 'person' || s.id === 'flag' || s.id === 'lightbulb' || s.id === 'heart' || s.id === 'bracket' || s.id === 'brace' || s.id === 'circle-dot' || s.id === 'cross' || s.id === 'check' || s.id === 'x-mark') && <rect x="3" y="5" width="18" height="14" rx="3" fill="var(--text-muted)" opacity="0.5" />}
                    {(s.id === 'arrow-right' || s.id === 'arrow-left' || s.id === 'arrow-up' || s.id === 'arrow-down' || s.id === 'arrow-2way' || s.id === 'arrow-curve') && <rect x="3" y="9" width="18" height="6" rx="1" fill="var(--text-muted)" opacity="0.5" />}
                  </svg>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Web Embed Panel */}
        {showWebEmbed && (
          <div style={{ position: 'absolute', left: '48px', top: '8px', zIndex: 200, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', boxShadow: 'var(--shadow-lg)', width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Web Embed</span>
              <button onClick={() => setShowWebEmbed(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
            <input value={embedUrl} onChange={e => setEmbedUrl(e.target.value)}
              placeholder="Paste URL (YouTube, Figma, etc.)"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', marginBottom: '6px' }} />
            <button onClick={() => { setActiveTool('embed'); setShowWebEmbed(false); }}
              disabled={!embedUrl.trim()}
              style={{ width: '100%', padding: '6px', borderRadius: '6px', border: 'none', background: 'var(--accent-color)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '12px', opacity: embedUrl.trim() ? 1 : 0.5 }}>
              Click on canvas to embed
            </button>
          </div>
        )}

        {/* Templates Panel */}
        {showTemplates && (
          <div style={{ position: 'absolute', left: '48px', top: '8px', zIndex: 200, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', boxShadow: 'var(--shadow-lg)', width: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Templates</span>
              <button onClick={() => setShowTemplates(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
            {templates.map(t => (
              <div key={t.name} onClick={() => loadTemplate(t)} className="hover-bg" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                <span>{t.icon}</span><span>{t.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* AI Panel */}
        {showAIPanel && (
          <div style={{ position: 'absolute', left: '48px', top: '8px', zIndex: 200, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', boxShadow: 'var(--shadow-lg)', width: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={14} color="#6366f1" /> AI Studio</span>
              <button onClick={() => setShowAIPanel(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
            <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              placeholder="Describe what to generate, summarize, or remix..."
              style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', resize: 'vertical', marginBottom: '6px' }} />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={generateAICard} disabled={aiGenerating || !aiPrompt.trim()}
                style={{ flexGrow: 1, padding: '6px', borderRadius: '6px', border: 'none', background: 'var(--accent-color)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '11px', opacity: aiGenerating || !aiPrompt.trim() ? 0.5 : 1 }}>
                {aiGenerating ? '✨ Generating...' : 'Generate Card'}
              </button>
              <button onClick={() => {
                if (selectedIds.length > 0) {
                  const selectedText = objects.filter(o => selectedIds.includes(o.id)).map(o => o.content).join('\n');
                  setAiPrompt(`Summarize this:\n${selectedText}`);
                }
              }} disabled={selectedIds.length === 0}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)', opacity: selectedIds.length === 0 ? 0.5 : 1 }}>
                Summarize
              </button>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-placeholder)', marginTop: '6px' }}>
              Select objects and click Summarize to remix content
            </div>
          </div>
        )}

        {/* Export Panel */}
        {showExport && (
          <div style={{ position: 'absolute', right: '60px', top: '8px', zIndex: 200, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px', boxShadow: 'var(--shadow-lg)', width: '140px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>Export Board</div>
            <button onClick={() => exportBoard('png')} className="hover-bg" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)' }}><FileImage size={14} /> PNG Image</button>
            <button onClick={() => exportBoard('pdf')} className="hover-bg" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)' }}><Download size={14} /> PDF Document</button>
          </div>
        )}

        {/* Add Panel (slim sidebar) */}
        {showAddPanel && (
          <div style={{ position: 'absolute', left: '4px', top: '44px', zIndex: 200, width: '220px', maxHeight: '70vh', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', borderBottom: '1px solid var(--border-color)' }}>
              <Plus size={12} style={{ color: 'var(--accent-color)' }} />
              <input value={addPanelSearch} onChange={e => setAddPanelSearch(e.target.value)}
                placeholder="Search items..."
                style={{ flexGrow: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '11px', outline: 'none', padding: '2px 0' }} />
              <button onClick={() => setShowAddPanel(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}><X size={12} /></button>
            </div>
            <div style={{ display: 'flex', gap: '2px', padding: '4px 6px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              {['All', 'Shapes', 'Blocks', 'Tools', 'Widgets'].map(cat => (
                <button key={cat} onClick={() => setShowAddCategory(cat)}
                  style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: showAddCategory === cat ? 'var(--accent-light)' : 'transparent', color: showAddCategory === cat ? 'var(--accent-color)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '4px' }}>
              {[
                { cat: 'Shapes', items: ALL_SHAPES.map(s => ({ label: s.name, icon: '◇', action: () => { setActiveShapeType(s.id); setActiveTool('shape'); setShowAddPanel(false); } })) },
                { cat: 'Blocks', items: [
                  { label: 'Sticky Note', icon: '🗒️', action: () => { setActiveTool('sticky'); setShowAddPanel(false); } },
                  { label: 'Text', icon: '📝', action: () => { setActiveTool('text'); setShowAddPanel(false); } },
                  { label: 'Comment', icon: '💬', action: () => { setActiveTool('comment'); setShowAddPanel(false); } },
                  { label: 'Table', icon: '📊', action: () => { setActiveTool('table'); setShowAddPanel(false); } },
                  { label: 'Image', icon: '🖼️', action: () => { setActiveTool('image'); setShowAddPanel(false); } },
                ]},
                { cat: 'Tools', items: [
                  { label: 'Connector', icon: '➡️', action: () => { setActiveTool('connector'); setShowAddPanel(false); } },
                  { label: 'Freehand Draw', icon: '✏️', action: () => { setActiveTool('draw'); setShowAddPanel(false); } },
                  { label: 'Web Embed', icon: '🌐', action: () => { setShowWebEmbed(true); setShowAddPanel(false); } },
                  { label: 'Sticker', icon: '😊', action: () => { setActiveTool('sticker'); setShowAddPanel(false); } },
                ]},
                { cat: 'Widgets', items: [
                  { label: 'Vote Session', icon: '🗳️', action: () => { setActiveTool('vote'); setShowAddPanel(false); } },
                  { label: 'Timer', icon: '⏱️', action: () => { setActiveTool('timer'); setShowAddPanel(false); } },
                  { label: 'AI Card', icon: '✨', action: () => { setShowAIPanel(true); setShowAddPanel(false); } },
                  { label: 'Frame', icon: '🖼️', action: () => { setActiveTool('frame'); setShowAddPanel(false); } },
                ]},
              ].filter(g => showAddCategory === 'All' || g.cat === showAddCategory).map(group => (
                <div key={group.cat}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-placeholder)', padding: '6px 6px 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.cat}</div>
                  {group.items.filter(i => i.label.toLowerCase().includes(addPanelSearch.toLowerCase())).map(item => (
                    <div key={item.label} onClick={item.action} className="hover-bg"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-primary)' }}>
                      <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div ref={containerRef} style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}
          onContextMenu={e => { e.preventDefault(); }}>
          {/* + button at top-left of canvas */}
          <button onClick={() => { setShowAddPanel(!showAddPanel); setConnectorSource(null); }}
            title="Add to canvas"
            style={{ position: 'absolute', left: '8px', top: '8px', zIndex: 100, width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: showAddPanel ? 'var(--accent-light)' : 'var(--bg-primary)', color: showAddPanel ? 'var(--accent-color)' : 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', transition: 'all 0.15s' }}
            className={!showAddPanel ? 'hover-bg' : ''}>
            <Plus size={18} />
          </button>
          {/* Connector source indicator */}
          {connectorSource && (
            <div style={{ position: 'absolute', left: '48px', top: '10px', zIndex: 100, fontSize: '10px', color: '#6366f1', background: 'var(--bg-primary)', border: '1px solid #6366f1', borderRadius: '6px', padding: '2px 8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowRight size={10} /> Click target object
              <button onClick={() => setConnectorSource(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6366f1', padding: '0 2px', fontSize: '10px' }}>✕</button>
            </div>
          )}
          <div ref={canvasRef} onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            style={{ width: '100%', height: '100%', cursor: isPanning ? 'grabbing' : isLaserActive ? 'crosshair' : activeTool === 'select' ? 'default' : 'crosshair', overflow: 'hidden',
              backgroundImage: 'radial-gradient(circle, var(--border-color) 1px, transparent 1px)',
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`, backgroundPosition: `${panX}px ${panY}px`,
            }}>
            <div style={{ position: 'absolute', transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0', width: 0, height: 0 }}>
              {objects.map(renderObject)}
              {renderFreehandPreview()}
            </div>
          </div>
          {renderMinimap()}
          {/* Laser pointer */}
          {laserPointer && (
            <div style={{ position: 'absolute', left: laserPointer.x - 5, top: laserPointer.y - 5, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.3)', pointerEvents: 'none', zIndex: 99998, transition: 'all 0.05s' }} />
          )}
          {/* Comments Panel */}
          {showComments && (
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '260px', background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>💬 Comments</span>
                <button onClick={() => setShowComments(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
              </div>
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px' }}>
                {objects.filter(o => o.type === 'comment').length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--text-placeholder)', fontStyle: 'italic' }}>
                    No comments. Use Comment tool (C) to add.
                  </div>
                ) : objects.filter(o => o.type === 'comment').map(c => (
                  <div key={c.id} style={{ padding: '8px', marginBottom: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', color: 'var(--accent-color)' }}>{c.tags?.[0] || 'Comment'}</div>
                    <div style={{ color: 'var(--text-muted)', wordBreak: 'break-word' }}>{c.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Presentation Overlay */}
      {renderPresentationOverlay()}

      <style>{`
        .cover-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 11px; font-weight: 500; transition: all 0.15s ease; line-height: 1; }
        .cover-btn:hover { background: var(--bg-tertiary); }
        .hover-bg:hover { background: var(--bg-tertiary) !important; }
        * { scrollbar-width: thin; }
      `}</style>
    </div>
  );
};

export default CanvasFlow;
