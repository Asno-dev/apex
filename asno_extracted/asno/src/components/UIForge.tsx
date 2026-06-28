import React, { useState, useRef, useCallback } from 'react';
import { generateId } from '../AppContext';
import { callAiAPI } from '../lib/aiClient';
import {
  Sparkles, Layers, Monitor, Smartphone, Tablet, X, Plus, Minus,
  ChevronRight, ChevronDown, Eye, EyeOff, Code, Download, Share2,
  RefreshCw, Sliders, Type, Square, Circle, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Palette, Grid, Maximize2, Move, MousePointer, Pen, Layout,
  Sidebar, PanelRight, Settings, Zap, Star, Copy, Trash2,
  ToggleLeft, ToggleRight, List, BarChart2, ArrowRight, Send,
  Globe, Wand2, PenTool, Frame, Columns, Cpu, Database, Layers2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UIComponent {
  id: string;
  type: 'text' | 'button' | 'input' | 'card' | 'image' | 'nav' | 'hero' | 'badge' | 'divider' | 'chart' | 'table' | 'avatar';
  label: string;
  x: number; y: number; width: number; height: number;
  props: {
    text?: string;
    placeholder?: string;
    variant?: string;
    color?: string;
    bg?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
    opacity?: number;
    shadow?: boolean;
    icon?: string;
    src?: string;
  };
}

interface Screen {
  id: string;
  name: string;
  components: UIComponent[];
  bg: string;
}

interface ChatMsg {
  role: 'user' | 'ai';
  text: string;
}

// ─── Preset palettes ──────────────────────────────────────────────────────────
const PALETTES: Record<string, { primary: string; secondary: string; bg: string; surface: string; text: string }> = {
  'Indigo Dark': { primary: '#6366f1', secondary: '#ec4899', bg: '#0f0f1a', surface: '#1a1a2e', text: '#e2e8f0' },
  'Ocean Breeze': { primary: '#0ea5e9', secondary: '#06b6d4', bg: '#f0f9ff', surface: '#ffffff', text: '#0f172a' },
  'Forest': { primary: '#10b981', secondary: '#34d399', bg: '#f0fdf4', surface: '#ffffff', text: '#064e3b' },
  'Sunset': { primary: '#f59e0b', secondary: '#ef4444', bg: '#fffbeb', surface: '#ffffff', text: '#451a03' },
  'Monochrome': { primary: '#334155', secondary: '#64748b', bg: '#f8fafc', surface: '#ffffff', text: '#0f172a' },
  'Neon Dark': { primary: '#a855f7', secondary: '#22d3ee', bg: '#09090b', surface: '#18181b', text: '#fafafa' },
};

// ─── Template screens ─────────────────────────────────────────────────────────
const STARTER_SCREENS: Record<string, UIComponent[]> = {
  'Dashboard': [
    { id: 'c1', type: 'nav', label: 'Navigation Bar', x: 0, y: 0, width: 360, height: 52, props: { bg: '#6366f1', text: 'Dashboard', color: 'white' } },
    { id: 'c2', type: 'card', label: 'Metric Card', x: 12, y: 68, width: 100, height: 64, props: { bg: '#f0f4ff', text: 'Revenue\n$48,290', borderRadius: 10 } },
    { id: 'c3', type: 'card', label: 'Metric Card', x: 124, y: 68, width: 100, height: 64, props: { bg: '#f0fff4', text: 'Users\n12,847', borderRadius: 10 } },
    { id: 'c4', type: 'card', label: 'Metric Card', x: 236, y: 68, width: 112, height: 64, props: { bg: '#fff0f6', text: 'Churn\n2.3%', borderRadius: 10 } },
    { id: 'c5', type: 'chart', label: 'Chart', x: 12, y: 145, width: 336, height: 160, props: { bg: '#f8fafc', text: 'Monthly Revenue', borderRadius: 10 } },
    { id: 'c6', type: 'table', label: 'Recent Activity', x: 12, y: 315, width: 336, height: 120, props: { bg: '#f8fafc', text: 'Recent Orders', borderRadius: 10 } },
  ],
  'Mobile Banking': [
    { id: 'b1', type: 'nav', label: 'Header', x: 0, y: 0, width: 360, height: 60, props: { bg: '#1e293b', text: 'My Bank', color: 'white' } },
    { id: 'b2', type: 'card', label: 'Balance Card', x: 16, y: 76, width: 328, height: 110, props: { bg: 'linear-gradient(135deg,#6366f1,#ec4899)', text: 'Balance\n$12,450.00', color: 'white', borderRadius: 16, shadow: true } },
    { id: 'b3', type: 'button', label: 'Send', x: 16, y: 202, width: 76, height: 64, props: { bg: '#f0f4ff', text: '↑\nSend', borderRadius: 12 } },
    { id: 'b4', type: 'button', label: 'Receive', x: 104, y: 202, width: 76, height: 64, props: { bg: '#f0fff4', text: '↓\nReceive', borderRadius: 12 } },
    { id: 'b5', type: 'button', label: 'Pay', x: 192, y: 202, width: 76, height: 64, props: { bg: '#fff0f6', text: '💳\nPay', borderRadius: 12 } },
    { id: 'b6', type: 'button', label: 'Top Up', x: 280, y: 202, width: 76, height: 64, props: { bg: '#fffbeb', text: '+\nTop Up', borderRadius: 12 } },
    { id: 'b7', type: 'text', label: 'Section', x: 16, y: 282, width: 200, height: 24, props: { text: 'Recent Transactions', fontWeight: 'bold', fontSize: 14 } },
    { id: 'b8', type: 'card', label: 'Tx 1', x: 16, y: 310, width: 328, height: 48, props: { bg: '#f8fafc', text: 'Netflix  –$15.99', borderRadius: 8 } },
    { id: 'b9', type: 'card', label: 'Tx 2', x: 16, y: 366, width: 328, height: 48, props: { bg: '#f8fafc', text: 'Salary  +$5,200', borderRadius: 8 } },
    { id: 'b10', type: 'card', label: 'Tx 3', x: 16, y: 422, width: 328, height: 48, props: { bg: '#f8fafc', text: 'Amazon  –$67.40', borderRadius: 8 } },
  ],
  'Landing Page': [
    { id: 'l1', type: 'nav', label: 'Navbar', x: 0, y: 0, width: 360, height: 52, props: { bg: 'white', text: 'Logo', color: '#0f172a' } },
    { id: 'l2', type: 'hero', label: 'Hero Section', x: 0, y: 52, width: 360, height: 200, props: { bg: 'linear-gradient(135deg,#6366f1,#ec4899)', text: 'Build Faster\nShip Smarter', color: 'white', borderRadius: 0 } },
    { id: 'l3', type: 'button', label: 'CTA Button', x: 90, y: 268, width: 180, height: 40, props: { bg: '#6366f1', text: 'Get Started Free →', color: 'white', borderRadius: 20 } },
    { id: 'l4', type: 'text', label: 'Features Title', x: 16, y: 330, width: 328, height: 24, props: { text: 'Why teams choose us', fontWeight: 'bold', fontSize: 16 } },
    { id: 'l5', type: 'card', label: 'Feature 1', x: 12, y: 364, width: 104, height: 90, props: { bg: '#f0f4ff', text: '⚡ Fast', borderRadius: 10 } },
    { id: 'l6', type: 'card', label: 'Feature 2', x: 128, y: 364, width: 104, height: 90, props: { bg: '#f0fff4', text: '🔒 Secure', borderRadius: 10 } },
    { id: 'l7', type: 'card', label: 'Feature 3', x: 244, y: 364, width: 104, height: 90, props: { bg: '#fff0f6', text: '🤖 AI-first', borderRadius: 10 } },
  ],
};

// ─── Component renderer ───────────────────────────────────────────────────────
const ComponentBlock: React.FC<{
  comp: UIComponent;
  selected: boolean;
  palette: typeof PALETTES['Indigo Dark'];
  onClick: () => void;
}> = ({ comp, selected, palette, onClick }) => {
  const { type, x, y, width, height, props } = comp;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: x, top: y, width, height,
    boxSizing: 'border-box',
    cursor: 'pointer',
    outline: selected ? `2px solid ${palette.primary}` : 'none',
    outlineOffset: selected ? '2px' : '0',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'outline 0.1s',
    userSelect: 'none',
  };

  const bg = props.bg || palette.surface;
  const textColor = props.color || palette.text;

  const contentStyle: React.CSSProperties = {
    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '6px',
    borderRadius: props.borderRadius ?? 8,
    background: bg,
    color: textColor,
    fontSize: props.fontSize ?? 12,
    fontWeight: (props.fontWeight as any) ?? 'normal',
    boxShadow: props.shadow ? '0 4px 20px rgba(0,0,0,0.15)' : undefined,
    flexDirection: 'column' as const,
    gap: '2px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const lines = (props.text || '').split('\n');

  const inner = () => {
    if (type === 'nav') return (
      <div style={{ ...contentStyle, flexDirection: 'row', justifyContent: 'space-between', padding: '0 16px', borderRadius: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{lines[0]}</span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', opacity: 0.7 }}>
          <span>Home</span><span>About</span><span>Pricing</span>
        </div>
      </div>
    );
    if (type === 'hero') return (
      <div style={{ ...contentStyle, justifyContent: 'center', textAlign: 'center', borderRadius: 0 }}>
        {lines.map((l, i) => <div key={i} style={{ fontWeight: i === 0 ? 800 : 400, fontSize: i === 0 ? 22 : 14, lineHeight: 1.3 }}>{l}</div>)}
      </div>
    );
    if (type === 'chart') return (
      <div style={{ ...contentStyle, padding: '10px 12px', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, alignSelf: 'flex-start', color: palette.text, opacity: 0.7 }}>{lines[0]}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '70%', paddingBottom: '4px' }}>
          {[45, 72, 58, 88, 65, 92, 78].map((h, i) => (
            <div key={i} style={{ flex: 1, background: palette.primary, borderRadius: '3px 3px 0 0', height: `${h}%`, opacity: 0.8 + (i % 2) * 0.2 }} />
          ))}
        </div>
      </div>
    );
    if (type === 'table') return (
      <div style={{ ...contentStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '8px 10px', gap: '4px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: '4px' }}>{lines[0]}</div>
        {['Order #001 · $42.00 · Done', 'Order #002 · $78.50 · Pending', 'Order #003 · $12.30 · Done'].map((row, i) => (
          <div key={i} style={{ fontSize: 10, opacity: 0.7, padding: '2px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', width: '100%' }}>{row}</div>
        ))}
      </div>
    );
    if (type === 'avatar') return (
      <div style={{ ...contentStyle, borderRadius: '50%', width: Math.min(width, height), height: Math.min(width, height) }}>
        <span style={{ fontSize: height * 0.4 }}>👤</span>
      </div>
    );
    if (type === 'badge') return (
      <div style={{ ...contentStyle, padding: '2px 10px', height: 'auto', alignSelf: 'flex-start' }}>
        <span style={{ fontSize: 11, fontWeight: 600 }}>{lines[0] || 'Badge'}</span>
      </div>
    );
    if (type === 'divider') return (
      <div style={{ width: '100%', height: 1, background: 'rgba(0,0,0,0.12)', alignSelf: 'center' }} />
    );
    if (type === 'input') return (
      <div style={{ ...contentStyle, justifyContent: 'flex-start', padding: '0 10px', border: `1px solid rgba(0,0,0,0.12)` }}>
        <span style={{ opacity: 0.4, fontSize: 12 }}>{props.placeholder || 'Enter text…'}</span>
      </div>
    );
    if (type === 'image') return (
      <div style={{ ...contentStyle, background: `linear-gradient(135deg, ${palette.primary}22, ${palette.secondary}22)` }}>
        <ImageIcon size={24} style={{ opacity: 0.3, color: palette.primary }} />
      </div>
    );
    // Default: text / button / card / badge
    return (
      <div style={contentStyle}>
        {lines.map((l, i) => <span key={i} style={{ textAlign: 'center', lineHeight: 1.4 }}>{l}</span>)}
      </div>
    );
  };

  return (
    <div style={baseStyle} onClick={e => { e.stopPropagation(); onClick(); }}>
      {inner()}
      {selected && (
        <>
          {/* Selection handles */}
          {[[-4,-4],['calc(100% - 4px)',-4],[-4,'calc(100% - 4px)'],['calc(100% - 4px)','calc(100% - 4px)']].map(([l,t], i) => (
            <div key={i} style={{ position: 'absolute', left: l as any, top: t as any, width: 8, height: 8, background: 'white', border: `2px solid ${palette.primary}`, borderRadius: '2px', zIndex: 10 }} />
          ))}
        </>
      )}
    </div>
  );
};

// ─── Main UIForge component ───────────────────────────────────────────────────
const UIForge: React.FC = () => {
  const [activePaletteName, setActivePaletteName] = useState('Indigo Dark');
  const palette = PALETTES[activePaletteName];

  const [screens, setScreens] = useState<Screen[]>([
    { id: 'scr1', name: 'Dashboard', components: STARTER_SCREENS['Dashboard'], bg: '#f8fafc' },
  ]);
  const [activeScreenId, setActiveScreenId] = useState('scr1');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [activePanel, setActivePanel] = useState<'layers' | 'props' | 'code' | 'ai'>('ai');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: 'ai', text: "Hi! Describe what you want to build and I'll generate the UI. Try: *a mobile banking dashboard with balance and transactions*" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'preview' | 'code'>('editor');
  const [variations, setVariations] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeScreen = screens.find(s => s.id === activeScreenId) || screens[0];
  const selectedComp = activeScreen?.components.find(c => c.id === selectedId);

  const deviceDimensions = {
    mobile: { width: 360, height: 640, label: 'Mobile 360×640' },
    tablet: { width: 768, height: 600, label: 'Tablet 768×600' },
    desktop: { width: 1024, height: 600, label: 'Desktop 1024×600' },
  };
  const device = deviceDimensions[deviceFrame];

  // ── AI generation ─────────────────────────────────────────────────────────
  const generateUI = async () => {
    if (!prompt.trim() || isGenerating) return;
    const q = prompt.trim();
    setPrompt('');
    setChatMsgs(prev => [...prev, { role: 'user', text: q }]);
    setIsGenerating(true);

    try {
      const systemPrompt = `You are Google Stitch, an AI-native UI design agent.
Based on the user's description, generate a responsive screen layout consisting of a JSON list of UI components.
All components fit inside a mobile dimensions of 360 width and 640 height.
The types of components you can generate are:
- 'text', 'button', 'input', 'card', 'image', 'nav', 'hero', 'badge', 'divider', 'chart', 'table', 'avatar'

Each component must have:
- type: string
- label: descriptive name
- x, y, width, height: numeric placement coordinates
- props: object containing styling values (text, placeholder, color, bg, fontSize, fontWeight, borderRadius, shadow, etc.)

Respond ONLY with a valid JSON block of components. Example:
[
  { "id": "c1", "type": "nav", "label": "Header", "x": 0, "y": 0, "width": 360, "height": 52, "props": { "bg": "#6366f1", "text": "Brand", "color": "white" } }
]`;

      const reply = await callAiAPI(
        q,
        [],
        'gemini',
        'gemini-1.5-flash',
        localStorage.getItem('ai_studio_key_gemini') || 'temporary',
        systemPrompt
      );

      const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const newScreen: Screen = {
        id: generateId(),
        name: q.length > 20 ? q.substring(0, 18) + '...' : q,
        components: parsed.map((c: any) => ({
          ...c,
          id: c.id || generateId(),
          props: c.props || {}
        })),
        bg: '#f8fafc',
      };

      setScreens(prev => [...prev, newScreen]);
      setActiveScreenId(newScreen.id);
      setSelectedId(null);
      setChatMsgs(prev => [...prev, { role: 'ai', text: `✨ Generated custom screen UI for "${q}". Select components to adjust styles or edit text.` }]);
      setVariations(prev => [...prev, q]);
    } catch (e: any) {
      console.warn("Fallback to template after error:", e);
      const lower = q.toLowerCase();
      let templateKey = 'Dashboard';
      let screenName = 'Generated Screen';
      let replyMsg = '';

      if (lower.includes('bank') || lower.includes('wallet') || lower.includes('payment') || lower.includes('finance')) {
        templateKey = 'Mobile Banking';
        screenName = 'Banking App';
        replyMsg = "✨ [Fallback Template] Generated a **mobile banking dashboard** with account balance card, quick actions, and recent transaction list.";
      } else {
        templateKey = 'Dashboard';
        screenName = 'Analytics Dashboard';
        replyMsg = "✨ [Fallback Template] Generated an **analytics dashboard** with metric cards, a bar chart, and a recent activity table.";
      }

      const newScreen: Screen = {
        id: generateId(),
        name: screenName,
        components: STARTER_SCREENS[templateKey].map(c => ({ ...c, id: generateId(), props: { ...c.props } })),
        bg: '#f8fafc',
      };

      setScreens(prev => [...prev, newScreen]);
      setActiveScreenId(newScreen.id);
      setSelectedId(null);
      setChatMsgs(prev => [...prev, { role: 'ai', text: replyMsg }]);
      setVariations(prev => [...prev, templateKey]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // ── Add component ─────────────────────────────────────────────────────────
  const addComponent = (type: UIComponent['type']) => {
    const defaults: Record<string, Partial<UIComponent['props']> & { width: number; height: number }> = {
      text: { text: 'Text block', fontSize: 14, width: 180, height: 30 },
      button: { text: 'Button', bg: palette.primary, color: 'white', borderRadius: 8, width: 120, height: 40 },
      input: { placeholder: 'Enter text…', bg: 'white', borderRadius: 8, width: 200, height: 40 },
      card: { text: 'Card', bg: palette.surface, borderRadius: 12, shadow: true, width: 180, height: 100 },
      image: { bg: '#e2e8f0', borderRadius: 8, width: 180, height: 120 },
      badge: { text: 'New', bg: palette.primary, color: 'white', borderRadius: 20, width: 60, height: 24 },
      divider: { bg: '#e2e8f0', width: 300, height: 1 },
      avatar: { bg: '#e2e8f0', width: 40, height: 40, borderRadius: 999 },
      nav: { text: 'App', bg: palette.primary, color: 'white', width: device.width, height: 52 },
      hero: { text: 'Hero Title\nSubtitle text here', bg: `linear-gradient(135deg,${palette.primary},${palette.secondary})`, color: 'white', width: device.width, height: 180 },
      chart: { text: 'Chart', bg: palette.surface, borderRadius: 10, width: 280, height: 160 },
      table: { text: 'Table', bg: palette.surface, borderRadius: 10, width: 280, height: 120 },
    };
    const d = defaults[type] || { width: 100, height: 60 };
    const newComp: UIComponent = {
      id: generateId(), type, label: type.charAt(0).toUpperCase() + type.slice(1),
      x: 20, y: 20, width: d.width, height: d.height, props: d,
    };
    setScreens(prev => prev.map(s => s.id === activeScreenId ? { ...s, components: [...s.components, newComp] } : s));
    setSelectedId(newComp.id);
  };

  // ── Update selected prop ──────────────────────────────────────────────────
  const updateProp = (key: keyof UIComponent['props'], value: any) => {
    if (!selectedId) return;
    setScreens(prev => prev.map(s => s.id === activeScreenId ? {
      ...s,
      components: s.components.map(c => c.id === selectedId ? { ...c, props: { ...c.props, [key]: value } } : c)
    } : s));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setScreens(prev => prev.map(s => s.id === activeScreenId ? { ...s, components: s.components.filter(c => c.id !== selectedId) } : s));
    setSelectedId(null);
  };

  // ── Code export ───────────────────────────────────────────────────────────
  const generateCode = () => {
    const comps = activeScreen?.components || [];
    return `// Generated by UIForge ✨
import React from 'react';

export default function ${activeScreen?.name.replace(/\s/g, '') || 'Screen'}() {
  return (
    <div style={{ position: 'relative', width: ${device.width}, height: ${device.height} }}>
${comps.map(c => `      {/* ${c.label} */}
      <div style={{
        position: 'absolute', left: ${c.x}, top: ${c.y},
        width: ${c.width}, height: ${c.height},
        background: '${c.props.bg || '#fff'}',
        borderRadius: ${c.props.borderRadius ?? 0},
        color: '${c.props.color || '#000'}',
        fontSize: ${c.props.fontSize ?? 12},
        fontWeight: '${c.props.fontWeight || 'normal'}',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: ${c.props.shadow ? "'0 4px 20px rgba(0,0,0,0.15)'" : "'none'"},
        boxSizing: 'border-box',
      }}>
        ${c.props.text ? c.props.text.split('\n').join('\\n') : ''}
      </div>`).join('\n')}
    </div>
  );
}`;
  };

  // ── Side panels ───────────────────────────────────────────────────────────
  const LayersPanel = () => (
    <div style={{ padding: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layers</div>
      {(activeScreen?.components || []).map((comp, i) => (
        <div key={comp.id} onClick={() => setSelectedId(comp.id)} style={{
          display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
          background: selectedId === comp.id ? 'rgba(99,102,241,0.1)' : 'transparent', marginBottom: '2px',
        }}>
          <span style={{ fontSize: '12px' }}>{
            comp.type === 'button' ? '🔲' : comp.type === 'card' ? '📦' : comp.type === 'text' ? '📝' :
            comp.type === 'image' ? '🖼️' : comp.type === 'nav' ? '🗂️' : comp.type === 'chart' ? '📊' : '▫️'
          }</span>
          <span style={{ fontSize: '12px', color: 'var(--text-primary)', flex: 1 }}>{comp.label}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{comp.type}</span>
        </div>
      ))}
      {/* Add component section */}
      <div style={{ marginTop: '14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Component</div>
      {(['text', 'button', 'input', 'card', 'image', 'badge', 'divider', 'nav', 'hero', 'chart', 'table', 'avatar'] as const).map(type => (
        <button key={type} onClick={() => addComponent(type)} style={{
          width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer',
          borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '2px', transition: 'all 0.1s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
          <Plus size={11} /> {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );

  const PropsPanel = () => {
    if (!selectedComp) return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        <MousePointer size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
        <div>Select a component to edit its properties</div>
      </div>
    );
    return (
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedComp.label}</span>
          <button onClick={deleteSelected} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}><Trash2 size={13} /></button>
        </div>
        {/* Text */}
        {selectedComp.props.text !== undefined && (
          <div>
            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TEXT</label>
            <textarea value={selectedComp.props.text} onChange={e => updateProp('text', e.target.value)}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', resize: 'vertical', minHeight: '52px', boxSizing: 'border-box' }} />
          </div>
        )}
        {/* Background */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>BACKGROUND</label>
          <input value={selectedComp.props.bg || ''} onChange={e => updateProp('bg', e.target.value)}
            style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {/* Color */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TEXT COLOR</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input type="color" value={selectedComp.props.color || '#000000'} onChange={e => updateProp('color', e.target.value)}
              style={{ width: '32px', height: '30px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', padding: '1px' }} />
            <input value={selectedComp.props.color || ''} onChange={e => updateProp('color', e.target.value)}
              style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }} />
          </div>
        </div>
        {/* Border radius */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>BORDER RADIUS: {selectedComp.props.borderRadius ?? 8}px</label>
          <input type="range" min="0" max="40" value={selectedComp.props.borderRadius ?? 8} onChange={e => updateProp('borderRadius', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>
        {/* Font size */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>FONT SIZE: {selectedComp.props.fontSize ?? 12}px</label>
          <input type="range" min="8" max="32" value={selectedComp.props.fontSize ?? 12} onChange={e => updateProp('fontSize', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>
        {/* Shadow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>SHADOW</label>
          <button onClick={() => updateProp('shadow', !selectedComp.props.shadow)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: selectedComp.props.shadow ? '#6366f1' : 'var(--text-muted)' }}>
            {selectedComp.props.shadow ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
        {/* Palette buttons */}
        <div>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>QUICK COLORS</label>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {[palette.primary, palette.secondary, '#10b981', '#f59e0b', '#ef4444', '#ffffff', '#000000', '#e2e8f0'].map(c => (
              <button key={c} onClick={() => updateProp('bg', c)}
                style={{ width: 20, height: 20, borderRadius: '4px', background: c, border: '1px solid var(--border-color)', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AIPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chatMsgs.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '90%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` : 'var(--bg-secondary)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              fontSize: '12px', lineHeight: '1.5',
              border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: palette.primary, animation: `uf-pulse 1.2s ${i * 0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {/* Suggestions */}
      <div style={{ padding: '8px 12px 4px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {['Dark mode', 'Add sidebar', 'Mobile banking', 'SaaS landing'].map(s => (
          <button key={s} onClick={() => { setPrompt(s); }}
            style={{ padding: '3px 10px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {s}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 12px', display: 'flex', gap: '6px', flexShrink: 0 }}>
        <input value={prompt} onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generateUI()}
          placeholder="Describe a UI to generate…"
          style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }} />
        <button onClick={generateUI} disabled={!prompt.trim() || isGenerating}
          style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: palette.primary, color: 'white', display: 'flex', alignItems: 'center', opacity: (!prompt.trim() || isGenerating) ? 0.5 : 1 }}>
          <Wand2 size={13} />
        </button>
      </div>
    </div>
  );

  // ── Canvas ────────────────────────────────────────────────────────────────
  const Canvas = () => (
    <div style={{
      flex: 1, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflow: 'auto', padding: '24px', position: 'relative'
    }}>
      <div style={{
        position: 'relative',
        width: device.width * zoom, height: device.height * zoom,
        background: activeScreen?.bg || '#f8fafc',
        borderRadius: deviceFrame === 'mobile' ? '24px' : '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        flexShrink: 0,
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
      }}
        onClick={() => setSelectedId(null)}
      >
        {/* Grid overlay */}
        {showGrid && activeView === 'editor' && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: `linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }} />
        )}
        {/* Components */}
        {(activeScreen?.components || []).map(comp => (
          <ComponentBlock
            key={comp.id} comp={comp} selected={selectedId === comp.id}
            palette={palette} onClick={() => setSelectedId(comp.id)}
          />
        ))}
        {/* Empty state */}
        {(activeScreen?.components || []).length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '8px' }}>
            <Wand2 size={32} style={{ opacity: 0.2 }} />
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Describe a UI in the AI panel</div>
            <div style={{ fontSize: '11px' }}>or add components from Layers →</div>
          </div>
        )}
      </div>
    </div>
  );

  const CodePanel = () => (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#0f0f1a' }}>
      <pre style={{ margin: 0, fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
        {generateCode()}
      </pre>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-primary)', overflow: 'hidden', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes uf-pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .uf-icon-btn { background: none; border: 1px solid var(--border-color); cursor: pointer; padding: 5px 9px; border-radius: 6px; font-size: 11px; display: flex; align-items: center; gap: 4px; color: var(--text-muted); transition: all 0.15s; }
        .uf-icon-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
        .uf-icon-btn.active { background: var(--bg-secondary); color: var(--accent-color, #6366f1); border-color: var(--accent-color, #6366f1); }
      `}</style>

      {/* ── Left sidebar (layers / props / AI) ──────────────────────────── */}
      <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
            <div style={{ width: 26, height: 26, borderRadius: '7px', background: `linear-gradient(135deg, ${PALETTES['Indigo Dark'].primary}, ${PALETTES['Indigo Dark'].secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PenTool size={13} color="white" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>UIForge</span>
          </div>
          {/* Panel tabs */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {(['ai', 'layers', 'props'] as const).map(p => (
              <button key={p} onClick={() => setActivePanel(p)}
                className={`uf-icon-btn ${activePanel === p ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', padding: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {p === 'ai' ? '✨' : p === 'layers' ? '☰' : '⚙'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflow: activePanel === 'ai' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
          {activePanel === 'layers' && <LayersPanel />}
          {activePanel === 'props' && <PropsPanel />}
          {activePanel === 'ai' && <AIPanel />}
        </div>
      </div>

      {/* ── Main canvas area ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top toolbar */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Screens */}
          <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: 0, overflow: 'auto' }}>
            {screens.map(scr => (
              <button key={scr.id} onClick={() => setActiveScreenId(scr.id)} style={{
                padding: '4px 10px', borderRadius: '6px', border: `1px solid ${scr.id === activeScreenId ? '#6366f1' : 'var(--border-color)'}`,
                background: scr.id === activeScreenId ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                color: scr.id === activeScreenId ? '#6366f1' : 'var(--text-muted)',
                fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
              }}>{scr.name}</button>
            ))}
            <button onClick={() => {
              const s: Screen = { id: generateId(), name: `Screen ${screens.length + 1}`, components: [], bg: '#f8fafc' };
              setScreens(prev => [...prev, s]); setActiveScreenId(s.id);
            }} className="uf-icon-btn" style={{ flexShrink: 0 }}><Plus size={11} /></button>
          </div>

          {/* View switcher */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {(['editor', 'preview', 'code'] as const).map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`uf-icon-btn ${activeView === v ? 'active' : ''}`}>
                {v === 'editor' && <><MousePointer size={11} />Edit</>}
                {v === 'preview' && <><Eye size={11} />Preview</>}
                {v === 'code' && <><Code size={11} />Code</>}
              </button>
            ))}
          </div>

          {/* Device */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {(['mobile', 'tablet', 'desktop'] as const).map(d => (
              <button key={d} onClick={() => setDeviceFrame(d)}
                className={`uf-icon-btn ${deviceFrame === d ? 'active' : ''}`} style={{ padding: '5px' }}>
                {d === 'mobile' ? <Smartphone size={13} /> : d === 'tablet' ? <Tablet size={13} /> : <Monitor size={13} />}
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="uf-icon-btn" style={{ padding: '5px 7px' }}><Minus size={11} /></button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '36px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="uf-icon-btn" style={{ padding: '5px 7px' }}><Plus size={11} /></button>
          </div>

          {/* Grid toggle */}
          <button onClick={() => setShowGrid(g => !g)} className={`uf-icon-btn ${showGrid ? 'active' : ''}`}><Grid size={11} /></button>

          {/* Palette picker */}
          <select value={activePaletteName} onChange={e => setActivePaletteName(e.target.value)}
            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px', cursor: 'pointer', outline: 'none' }}>
            {Object.keys(PALETTES).map(p => <option key={p}>{p}</option>)}
          </select>

          {/* Export */}
          <button className="uf-icon-btn"><Download size={11} />Export</button>
          <button className="uf-icon-btn"><Share2 size={11} />Share</button>
        </div>

        {/* Canvas / Code view */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {activeView === 'code' ? <CodePanel /> : <Canvas />}
        </div>

        {/* Status bar */}
        <div style={{ padding: '4px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
          <span>📐 {device.label}</span>
          <span>🧩 {activeScreen?.components.length || 0} components</span>
          {selectedComp && <span>Selected: {selectedComp.label} @ ({selectedComp.x},{selectedComp.y})</span>}
          <span style={{ marginLeft: 'auto' }}>UIForge v1.0 — AI UI Design Studio</span>
        </div>
      </div>
    </div>
  );
};

export default UIForge;
