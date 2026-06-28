import React, { useState } from 'react';
import { useApp, generateId } from '../AppContext';
import {
  BrainCircuit, MessageSquare, FileText, Lightbulb, Sparkles,
  Plus, X, Send, Trash2, Download, Globe, BookOpen, Quote,
  Search, ChevronRight, FolderOpen, ExternalLink, Copy, Check,
  Share2, List, Grid, PanelRight, Settings, Users
} from 'lucide-react';

interface Source {
  id: string;
  title: string;
  type: 'text' | 'url' | 'youtube' | 'pdf';
  content: string;
  date: string;
  tags: string[];
}

interface Idea {
  id: string;
  title: string;
  content: string;
  sourceRefs: string[];
  date: string;
  color: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { sourceId: string; text: string }[];
}

interface Room {
  id: string;
  name: string;
  description: string;
  icon: string;
  sources: Source[];
  ideas: Idea[];
  messages: ChatMessage[];
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];
const ROOM_ICONS = ['🧠', '💡', '📚', '🔬', '🎯', '🌐', '⚡', '🎨', '📊', '🤖'];

const BrainRoom: React.FC = () => {
  const { customAlert } = useApp();

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'room-1',
      name: 'Research Lab',
      description: 'General research and knowledge gathering',
      icon: '🧠',
      sources: [],
      ideas: [],
      messages: [
        { id: 'msg-0', role: 'assistant', content: 'Welcome to BrainRoom! Add sources to your space, then chat with AI about them. I can summarize, synthesize, and generate insights from your knowledge base.' }
      ]
    }
  ]);
  const [activeRoomId, setActiveRoomId] = useState('room-1');
  const [activeTab, setActiveTab] = useState<'chat' | 'sources' | 'ideas' | 'synthesis'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [sourceType, setSourceType] = useState<'text' | 'url'>('text');
  const [sourceTags, setSourceTags] = useState('');
  const [ideaInput, setIdeaInput] = useState('');
  const [synthesisResult, setSynthesisResult] = useState('');
  const [synthesisSources, setSynthesisSources] = useState<string[]>([]);
  const [showSynthesis, setShowSynthesis] = useState(false);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  const addRoom = () => {
    if (!newRoomName.trim()) return;
    const id = `room-${generateId()}`;
    setRooms(prev => [...prev, {
      id, name: newRoomName.trim(), description: 'New knowledge space',
      icon: ROOM_ICONS[Math.floor(Math.random() * ROOM_ICONS.length)],
      sources: [], ideas: [], messages: [
        { id: `msg-${generateId()}`, role: 'assistant', content: `Welcome to **${newRoomName.trim()}**! Add sources to begin your research.` }
      ]
    }]);
    setActiveRoomId(id);
    setNewRoomName('');
    setShowNewRoom(false);
  };

  const deleteRoom = (id: string) => {
    if (rooms.length <= 1) return;
    setRooms(prev => prev.filter(r => r.id !== id));
    if (activeRoomId === id) setActiveRoomId(rooms[0].id === id ? rooms[1]?.id || rooms[0].id : activeRoomId);
  };

  const addSource = () => {
    if (!sourceTitle.trim() || !sourceContent.trim()) return;
    const id = `src-${generateId()}`;
    const newSource: Source = {
      id, title: sourceTitle.trim(), type: sourceType,
      content: sourceContent.trim(),
      date: new Date().toLocaleDateString(),
      tags: sourceTags.split(',').map(t => t.trim()).filter(Boolean)
    };
    setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, sources: [...r.sources, newSource] } : r));
    setSourceTitle(''); setSourceContent(''); setSourceTags(''); setShowAddSource(false);
  };

  const deleteSource = (sourceId: string) => {
    setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, sources: r.sources.filter(s => s.id !== sourceId) } : r));
  };

  const addIdea = () => {
    if (!ideaInput.trim()) return;
    const id = `idea-${generateId()}`;
    const relatedSources = activeRoom.sources.filter(s =>
      ideaInput.toLowerCase().includes(s.title.toLowerCase()) ||
      s.content.toLowerCase().includes(ideaInput.toLowerCase())
    );
    const newIdea: Idea = {
      id, title: ideaInput.split('\n')[0].substring(0, 60),
      content: ideaInput.trim(),
      sourceRefs: relatedSources.map(s => s.title),
      date: new Date().toLocaleDateString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, ideas: [...r.ideas, newIdea] } : r));
    setIdeaInput('');
  };

  const deleteIdea = (ideaId: string) => {
    setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, ideas: r.ideas.filter(i => i.id !== ideaId) } : r));
  };

  const sendMessage = () => {
    if (!chatInput.trim() || isGenerating) return;
    const userMsg: ChatMessage = { id: `msg-${generateId()}`, role: 'user', content: chatInput.trim() };
    setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, messages: [...r.messages, userMsg] } : r));
    setChatInput('');
    setIsGenerating(true);

    setTimeout(() => {
      const room = rooms.find(r => r.id === activeRoomId);
      const sourcesText = room?.sources.map(s => `[${s.title}]: ${s.content.substring(0, 300)}`).join('\n\n') || '';
      const hasSources = room && room.sources.length > 0;
      const lowInput = userMsg.content.toLowerCase();

      let reply = '';
      let citations: { sourceId: string; text: string }[] = [];

      if (lowInput.includes('summarize') && hasSources) {
        reply = `## Summary of Knowledge Base\n\nBased on your ${room!.sources.length} sources, here is a synthesized overview:\n\n`;
        room!.sources.forEach((s, i) => {
          reply += `**${i + 1}. ${s.title}** — ${s.content.substring(0, 150)}...\n\n`;
          citations.push({ sourceId: s.id, text: s.title });
        });
        reply += `\n**Key Insights:**\n- Multiple perspectives analyzed across ${room!.sources.length} sources\n- Cross-reference reveals consistent patterns in the core themes\n- Further research recommended for deeper validation`;
      } else if (lowInput.includes('synthesize') || lowInput.includes('synthesis')) {
        if (hasSources) {
          reply = `## Synthesis Report\n\n### Cross-Source Analysis\n\nAfter analyzing all ${room!.sources.length} sources in "${room!.name}":\n\n**Common Themes:**\n- Core concepts are well-established across multiple sources\n- Several sources provide complementary perspectives\n- Minor contradictions exist in specific details\n\n**Unique Insights:**\n`;
          room!.sources.slice(0, 3).forEach(s => {
            reply += `- From "${s.title}": ${s.content.substring(0, 100)}...\n`;
            citations.push({ sourceId: s.id, text: s.title });
          });
        } else {
          reply = 'Please add some sources first so I can synthesize information across them.';
        }
      } else if (hasSources) {
        const relevant = room!.sources.filter(s =>
          s.content.toLowerCase().includes(lowInput) || s.title.toLowerCase().includes(lowInput)
        );
        if (relevant.length > 0) {
          reply = `Based on the sources in your knowledge base:\n\n`;
          relevant.forEach(s => {
            reply += `> **${s.title}**: ${s.content.substring(0, 200)}...\n\n`;
            citations.push({ sourceId: s.id, text: s.title });
          });
          reply += `\nThis information comes from your curated sources. Would you like me to elaborate on any specific aspect?`;
        } else {
          reply = `I searched through your ${room!.sources.length} sources but didn't find a direct match for "${userMsg.content}". Here's what I can do:\n\n1. **Summarize** all sources\n2. **Synthesize** across sources\n3. Help you add **new sources** on this topic\n\nWhat would you like?`;
        }
      } else {
        reply = `Welcome to **${room?.name || 'BrainRoom'}**! I'm your AI research assistant.\n\nTo get started:\n1. **Add sources** — Paste text, URLs, or notes\n2. **Ask questions** — I'll answer based on your sources\n3. **Generate ideas** — Create insight boards\n4. **Synthesize** — Combine multiple sources\n\nTry saying "summarize" or "synthesize" after adding sources!`;
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${generateId()}`,
        role: 'assistant',
        content: reply,
        citations: citations.length > 0 ? citations : undefined
      };
      setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, messages: [...r.messages, assistantMsg] } : r));
      setIsGenerating(false);
    }, 800);
  };

  const runSynthesis = () => {
    if (activeRoom.sources.length < 2) {
      customAlert('Need at least 2 sources to synthesize.');
      return;
    }
    setShowSynthesis(true);
    setIsGenerating(true);
    setTimeout(() => {
      const chosen = activeRoom.sources.slice(0, Math.min(4, activeRoom.sources.length));
      const names = chosen.map(s => s.title);
      setSynthesisSources(names);
      setSynthesisResult(`# Multi-Source Synthesis Report

## Sources Analyzed
${names.map((n, i) => `${i + 1}. **${n}**`).join('\n')}

## Executive Summary
After cross-referencing ${names.length} sources, several key patterns emerge. The sources provide complementary perspectives on the topic, with strong agreement on fundamental concepts while offering diverse viewpoints on specific implementations.

## Key Findings

### 1. Core Agreement Across Sources
All sources converge on the foundational principles, suggesting these are well-established in the field.

### 2. Complementary Perspectives
Each source brings unique depth to specific aspects, creating a more complete picture when combined.

### 3. Notable Divergences
Minor differences in emphasis and framing exist, reflecting different analytical lenses rather than contradictions.

## Recommendations
- Use these sources as a starting point for deeper investigation
- Cross-reference findings with primary research
- Consider the publication context of each source

*Generated by BrainRoom AI Synthesis Engine*`);
      setIsGenerating(false);
    }, 1200);
  };

  const exportRoom = () => {
    let md = `# ${activeRoom.name}\n\n${activeRoom.description}\n\n`;
    md += `---\n\n## Sources (${activeRoom.sources.length})\n\n`;
    activeRoom.sources.forEach(s => {
      md += `### ${s.title} (${s.type})\n${s.content}\n\n_Tags: ${s.tags.join(', ') || 'none'}_\n\n`;
    });
    md += `---\n\n## Ideas (${activeRoom.ideas.length})\n\n`;
    activeRoom.ideas.forEach(i => {
      md += `### ${i.title}\n${i.content}\n\n_Sources: ${i.sourceRefs.join(', ') || 'none'}_\n\n`;
    });
    md += `---\n\n## Chat History\n\n`;
    activeRoom.messages.forEach(m => {
      md += `**${m.role === 'user' ? 'You' : 'AI'}**: ${m.content}\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${activeRoom.name.replace(/\s+/g, '_')}_export.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const sidebarWidth = 220;

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      {/* Room Sidebar */}
      <div style={{ width: sidebarWidth, background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BrainCircuit size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>BrainRoom</span>
          </div>
          <button onClick={exportRoom} title="Export room" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <Download size={14} />
          </button>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '6px' }}>
          {rooms.map(room => (
            <div key={room.id} onClick={() => setActiveRoomId(room.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                borderRadius: '8px', cursor: 'pointer', marginBottom: '2px',
                background: room.id === activeRoomId ? 'var(--bg-tertiary)' : 'transparent',
                borderLeft: room.id === activeRoomId ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.1s'
              }} className={room.id !== activeRoomId ? 'hover-bg' : ''}>
              <span style={{ fontSize: '18px' }}>{room.icon}</span>
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{room.sources.length} sources</div>
              </div>
              {rooms.length > 1 && (
                <button onClick={e => { e.stopPropagation(); deleteRoom(room.id); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', opacity: 0.5 }}>
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '6px', borderTop: '1px solid var(--border-color)' }}>
          {showNewRoom ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                placeholder="Room name..." autoFocus
                style={{ padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px', outline: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter') addRoom(); if (e.key === 'Escape') setShowNewRoom(false); }} />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={addRoom} style={{ flexGrow: 1, padding: '4px', border: 'none', borderRadius: '4px', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>Add</button>
                <button onClick={() => setShowNewRoom(false)} style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '10px' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewRoom(true)}
              style={{ width: '100%', padding: '7px', border: '1px dashed var(--border-color)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}
              className="hover-bg">
              <Plus size={14} /> New Room
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{activeRoom.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{activeRoom.name}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-placeholder)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '10px' }}>{activeRoom.sources.length} sources · {activeRoom.ideas.length} ideas</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={exportRoom} className="cover-btn" style={{ padding: '4px 10px', fontSize: '11px' }}><Download size={12} /> Export</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', padding: '4px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', flexShrink: 0 }}>
          {[
            { id: 'chat' as const, label: '💬 Chat', icon: <MessageSquare size={14} /> },
            { id: 'sources' as const, label: '📚 Sources', icon: <FileText size={14} /> },
            { id: 'ideas' as const, label: '💡 Ideas', icon: <Lightbulb size={14} /> },
            { id: 'synthesis' as const, label: '🔬 Synthesis', icon: <Sparkles size={14} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '6px',
                border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                background: activeTab === tab.id ? 'var(--accent-light)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeRoom.messages.map(msg => (
                  <div key={msg.id} style={{
                    maxWidth: '80%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? '#6366f1' : 'var(--bg-primary)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    borderRadius: '12px', padding: '10px 14px',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-color)', fontSize: '10px', color: 'var(--text-placeholder)' }}>
                        <Quote size={10} style={{ display: 'inline', marginRight: '4px' }} />
                        Sources: {msg.citations.map((c, i) => (
                          <span key={i} style={{ background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '4px', marginRight: '4px', fontWeight: 600, color: 'var(--accent-color)' }}>{c.text}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isGenerating && (
                  <div style={{ alignSelf: 'flex-start', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: 'var(--text-placeholder)' }}>
                    <span className="thinking-dots">Thinking</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)', display: 'flex', gap: '8px' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder={activeRoom.sources.length > 0 ? 'Ask about your sources...' : 'Type a message...'}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  style={{ flexGrow: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                <button onClick={sendMessage} disabled={isGenerating || !chatInput.trim()}
                  style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', background: '#6366f1', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isGenerating || !chatInput.trim() ? 0.5 : 1 }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* SOURCES TAB */}
          {activeTab === 'sources' && (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Sources ({activeRoom.sources.length})</div>
                <button onClick={() => setShowAddSource(!showAddSource)} className="cover-btn" style={{ padding: '5px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={12} /> Add Source
                </button>
              </div>
              {showAddSource && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setSourceType('text')} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 600, background: sourceType === 'text' ? 'var(--accent-light)' : 'transparent', color: sourceType === 'text' ? 'var(--accent-color)' : 'var(--text-muted)' }}>📝 Text</button>
                    <button onClick={() => setSourceType('url')} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 600, background: sourceType === 'url' ? 'var(--accent-light)' : 'transparent', color: sourceType === 'url' ? 'var(--accent-color)' : 'var(--text-muted)' }}>🌐 URL</button>
                  </div>
                  <input value={sourceTitle} onChange={e => setSourceTitle(e.target.value)} placeholder="Source title..." style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }} />
                  <textarea value={sourceContent} onChange={e => setSourceContent(e.target.value)} placeholder={sourceType === 'url' ? 'Paste URL...' : 'Paste or type content...'} rows={4} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', resize: 'vertical' }} />
                  <input value={sourceTags} onChange={e => setSourceTags(e.target.value)} placeholder="Tags (comma-separated)..." style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }} />
                  <button onClick={addSource} disabled={!sourceTitle.trim() || !sourceContent.trim()}
                    style={{ alignSelf: 'flex-end', padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600, opacity: sourceTitle.trim() && sourceContent.trim() ? 1 : 0.5 }}>
                    Add Source
                  </button>
                </div>
              )}
              <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeRoom.sources.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-placeholder)', fontSize: '13px' }}>
                    <BookOpen size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                    <p>No sources yet. Add text, URLs, or notes to build your knowledge base.</p>
                  </div>
                ) : activeRoom.sources.map(src => (
                  <div key={src.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{src.type === 'url' ? '🌐' : src.type === 'youtube' ? '📺' : '📄'}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{src.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{src.type} · {src.date}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteSource(src.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}><Trash2 size={12} /></button>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5, maxHeight: '60px', overflow: 'hidden' }}>{src.content}</div>
                    {src.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {src.tags.map(t => <span key={t} style={{ fontSize: '9px', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-placeholder)' }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IDEAS TAB */}
          {activeTab === 'ideas' && (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Idea Board ({activeRoom.ideas.length})</div>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', gap: '6px' }}>
                <textarea value={ideaInput} onChange={e => setIdeaInput(e.target.value)}
                  placeholder="Capture an insight, idea, or AI-generated thought..."
                  rows={2}
                  style={{ flexGrow: 1, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', resize: 'vertical' }} />
                <button onClick={addIdea} disabled={!ideaInput.trim()}
                  style={{ alignSelf: 'flex-end', padding: '8px 14px', border: 'none', borderRadius: '8px', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600, opacity: ideaInput.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
              <div style={{ flexGrow: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {activeRoom.ideas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-placeholder)', fontSize: '13px', gridColumn: '1 / -1' }}>
                    <Lightbulb size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                    <p>No ideas yet. Add insights from your research or chat with AI to generate ideas.</p>
                  </div>
                ) : activeRoom.ideas.map(idea => (
                  <div key={idea.id} style={{ background: 'var(--bg-primary)', border: `1px solid ${idea.color}30`, borderRadius: '10px', padding: '12px', borderLeft: `4px solid ${idea.color}`, boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{idea.title}</div>
                      <button onClick={() => deleteIdea(idea.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}><X size={12} /></button>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{idea.content}</div>
                    {idea.sourceRefs.length > 0 && (
                      <div style={{ fontSize: '9px', color: 'var(--text-placeholder)', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                        From: {idea.sourceRefs.join(', ')}
                      </div>
                    )}
                    <div style={{ fontSize: '9px', color: 'var(--text-placeholder)', marginTop: '2px' }}>{idea.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SYNTHESIS TAB */}
          {activeTab === 'synthesis' && (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Multi-Source Synthesis</div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                Combine multiple sources into a comprehensive synthesis report. Select sources to include, then generate.
              </p>
              <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeRoom.sources.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-placeholder)', fontSize: '12px' }}>
                    Add at least 2 sources to generate a synthesis.
                  </div>
                ) : (
                  activeRoom.sources.map(src => (
                    <label key={src.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', color: 'var(--text-primary)' }}>
                      <input type="checkbox" checked={synthesisSources.includes(src.title)} onChange={() => {
                        setSynthesisSources(prev => prev.includes(src.title) ? prev.filter(s => s !== src.title) : [...prev, src.title]);
                      }} style={{ accentColor: '#6366f1' }} />
                      {src.title}
                    </label>
                  ))
                )}
              </div>
              <button onClick={runSynthesis} disabled={synthesisSources.length < 2 || isGenerating}
                style={{ alignSelf: 'flex-start', padding: '8px 20px', border: 'none', borderRadius: '8px', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', opacity: synthesisSources.length < 2 || isGenerating ? 0.5 : 1 }}>
                <Sparkles size={14} /> {isGenerating ? 'Generating...' : 'Generate Synthesis'}
              </button>
              {synthesisResult && (
                <div style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                  {synthesisResult}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .thinking-dots::after { content: ''; animation: dots 1.5s steps(4, end) infinite; }
        @keyframes dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } 100% { content: ''; } }
        .cover-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 11px; font-weight: 500; transition: all 0.15s ease; line-height: 1; }
        .cover-btn:hover { background: var(--bg-tertiary); }
        .hover-bg:hover { background: var(--bg-tertiary) !important; }
        * { scrollbar-width: thin; }
      `}</style>
    </div>
  );
};

export default BrainRoom;
