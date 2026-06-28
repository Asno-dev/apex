import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../AppContext';
import type { Block, Page } from '../types';
import {
  Type, Heading1, Heading2, Heading3, CheckSquare, List, ListOrdered,
  ChevronRight, Quote, Terminal, Image as ImageIcon, Table, Minus,
  FileText, Columns, RefreshCw, Video, Music, Paperclip, BookOpen,
  Globe, Bookmark, Sparkles, Sigma, ExternalLink, Layers, MapPin,
  ListCollapse, PenTool, PlaySquare, Calendar, Activity, User,
  BarChart3, ThumbsUp, MessageSquare, FileSpreadsheet, Map, PieChart,
  Clock, Anchor, Compass, Volume2, Smile, Upload,
  Database, Layout, Zap, Star, Plus, Search, Palette,
  Briefcase, Wrench, Book, Sidebar, X, BrainCircuit, Shield, Headphones
} from 'lucide-react';

interface NewMenuItem {
  id: string;
  type: 'page' | 'block' | 'tool' | 'template' | 'database';
  label: string;
  desc: string;
  icon: React.ReactNode;
  category: string;
  keywords: string;
  action: () => void;
  previewType?: string;
}

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#ff0000" style={{ display: 'block' }}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zM6.304 15.165a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.824 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.824 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zM8.824 6.304a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.782a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.042zM18.958 8.824a2.528 2.528 0 0 1 2.522-2.52A2.528 2.528 0 0 1 24 8.824a2.528 2.528 0 0 1-2.52 2.52h-2.522V8.824zM17.696 8.824a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.782a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.042zM15.165 18.958a2.528 2.528 0 0 1 2.52 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.52v-2.522h2.52zM15.165 17.696a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.52-2.522h5.042a2.528 2.528 0 0 1 2.522 2.522v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.042z"/>
  </svg>
);

const PreviewPanel: React.FC<{ item: NewMenuItem | null }> = ({ item }) => {
  const { pages } = useApp();

  if (!item) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-placeholder)', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
        <div>
          <Search size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <p>Hover or navigate to an item<br/>to see a preview</p>
        </div>
      </div>
    );
  }

  const type = item.type;
  const id = item.id;

  const getRealPage = (): Page | undefined => {
    if (type === 'page' && id.startsWith('page-')) {
      const pageId = id.replace('page-', '');
      return pages.find(p => p.id === pageId);
    }
    return undefined;
  };

  const realPage = getRealPage();

  const renderPreviewContent = () => {
    if (type === 'page') {
      if (realPage) {
        const txtBlocks = realPage.content.filter(b => b.content.trim() !== '').slice(0, 6);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {realPage.cover && (
              <div style={{
                height: '80px',
                background: realPage.cover.startsWith('linear-gradient') ? realPage.cover : `url("${realPage.cover}") center/cover no-repeat`,
                flexShrink: 0
              }} />
            )}
            <div style={{ padding: '16px', flexGrow: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{realPage.icon || '📄'}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{realPage.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {realPage.isDatabase ? 'Database Page' : 'Document Page'} · {realPage.createdTime || ''}
              </div>
              {realPage.isDatabase ? (
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Database Rows ({realPage.dbRows?.length || 0})
                  </div>
                  {(realPage.dbRows || []).slice(0, 4).map(r => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '1px dashed var(--border-color)', padding: '4px 0' }}>
                      <span style={{ fontWeight: 500 }}>{r.cells['prop-name'] || r.cells['b-title'] || 'Untitled'}</span>
                      <span style={{ opacity: 0.6, fontSize: '10px', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '4px' }}>{r.cells['prop-status'] || r.cells['b-status'] || ''}</span>
                    </div>
                  ))}
                  {(realPage.dbRows || []).length === 0 && <span style={{ fontStyle: 'italic', fontSize: '10px', color: 'var(--text-placeholder)' }}>No rows</span>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {txtBlocks.length > 0 ? txtBlocks.map(b => {
                    const cleanText = b.content.replace(/<[^>]*>/g, '').substring(0, 80);
                    if (b.type.startsWith('h')) return <div key={b.id} style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{cleanText}</div>;
                    if (b.type === 'todo') return (
                      <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ color: b.properties?.checked ? 'var(--accent-color)' : 'var(--border-color)' }}>{b.properties?.checked ? '☑' : '☐'}</span>
                        <span style={{ textDecoration: b.properties?.checked ? 'line-through' : 'none', opacity: b.properties?.checked ? 0.6 : 1 }}>{cleanText}</span>
                      </div>
                    );
                    return <div key={b.id} style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{cleanText}</div>;
                  }) : <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-placeholder)' }}>Empty page</div>}
                </div>
              )}
            </div>
          </div>
        );
      }
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{item.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
        </div>
      );
    }

    if (id === 'text') {
      return (
        <div style={{ padding: '20px', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)' }}>
          The quick brown fox jumps over the lazy dog. This is a simple text block for writing paragraphs, notes, and general content.
        </div>
      );
    }

    if (id === 'h1') {
      return <div style={{ padding: '20px', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.3' }}>Heading 1 Title</div>;
    }

    if (id === 'h2') {
      return <div style={{ padding: '20px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Heading 2 Title</div>;
    }

    if (id === 'h3') {
      return <div style={{ padding: '20px', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Heading 3 Title</div>;
    }

    if (id === 'h4') {
      return <div style={{ padding: '20px', fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>Heading 4 Title</div>;
    }

    if (id === 'todo') {
      return (
        <div style={{ padding: '20px' }}>
          {[true, false, false].map((checked, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: checked ? 'none' : '2px solid var(--border-color)', background: checked ? 'var(--accent-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {checked && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
              </div>
              <span style={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.5 : 1 }}>Task item {i + 1}</span>
            </div>
          ))}
        </div>
      );
    }

    if (id === 'bullet') {
      return (
        <div style={{ padding: '20px' }}>
          {['First bullet point', 'Second bullet point', 'Third bullet point'].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>●</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      );
    }

    if (id === 'number') {
      return (
        <div style={{ padding: '20px' }}>
          {['First step', 'Second step', 'Third step'].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', minWidth: '18px' }}>{i + 1}.</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      );
    }

    if (id.startsWith('toggle')) {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0', fontSize: '14px', fontWeight: id.includes('h1') ? 700 : id.includes('h2') ? 600 : 500, color: 'var(--text-primary)' }}>
            <ChevronRight size={14} style={{ transition: 'transform 0.2s' }} />
            <span>Click to expand</span>
          </div>
          <div style={{ paddingLeft: '20px', borderLeft: '2px solid var(--border-color)', marginLeft: '7px', marginTop: '4px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px 0' }}>Nested content appears here...</div>
          </div>
        </div>
      );
    }

    if (id === 'quote') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ borderLeft: '3px solid var(--accent-color)', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0' }}>
            <div style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              "The only way to do great work is to love what you do."
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>— Steve Jobs</div>
          </div>
        </div>
      );
    }

    if (id === 'callout') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Quick Tip</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>A callout helps you highlight important information.</div>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'divider') {
      return (
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
          <hr style={{ flexGrow: 1, border: 'none', borderTop: '2px dashed var(--border-color)' }} />
        </div>
      );
    }

    if (id === 'code') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: '#1e1e2e', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', background: '#181825' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
            </div>
            <pre style={{ padding: '12px', margin: 0, fontSize: '11px', lineHeight: '1.6', color: '#cdd6f4', fontFamily: 'monospace' }}>
{`function hello() {
  console.log("Hello, world!");
  return 42;
}`}
            </pre>
          </div>
        </div>
      );
    }

    if (id === 'image') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 'var(--border-radius-md)', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px' }}>
            🖼️
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>Image with caption</div>
        </div>
      );
    }

    if (id === 'video') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: '#111', borderRadius: 'var(--border-radius-md)', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', position: 'relative' }}>
            <Video size={24} style={{ opacity: 0.5 }} />
            <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '10px', opacity: 0.5 }}>▶ 0:00 / 3:45</div>
          </div>
        </div>
      );
    }

    if (id === 'audio') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Music size={20} style={{ color: 'var(--accent-color)' }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', position: 'relative' }}>
                <div style={{ width: '40%', height: '100%', background: 'var(--accent-color)', borderRadius: '2px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>0:00</span>
                <span>3:30</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'file' || id === 'pdf') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--accent-light)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', fontSize: '16px', flexShrink: 0 }}>
              {id === 'pdf' ? '📄' : '📎'}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{id === 'pdf' ? 'document.pdf' : 'attachment.zip'}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>2.4 MB • Click to download</div>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'table') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', fontSize: '11px' }}>
            {[['Name', 'Status', 'Priority'], ['Design', 'Done', 'High'], ['Dev', 'Active', 'Med']].map((row, ri) => (
              <div key={ri} style={{ display: 'flex', borderBottom: ri < 2 ? '1px solid var(--border-color)' : 'none', background: ri === 0 ? 'var(--bg-tertiary)' : 'transparent' }}>
                {row.map((cell, ci) => (
                  <div key={ci} style={{ flex: 1, padding: '6px 8px', borderRight: ci < 2 ? '1px solid var(--border-color)' : 'none', fontWeight: ri === 0 ? 600 : 400, color: 'var(--text-primary)' }}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (id === 'column-list') {
      return (
        <div style={{ padding: '20px', display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Column 1</div>
            <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', width: '70%' }} />
          </div>
          <div style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Column 2</div>
            <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', width: '50%' }} />
          </div>
        </div>
      );
    }

    if (id === 'embed' || id === 'bookmark' || id === 'link-preview') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
            <div style={{ height: '60px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
              🌐
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Website Title</div>
              <div style={{ fontSize: '10px', color: 'var(--accent-color)' }}>https://example.com</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Website description preview...</div>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'synced-block') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '2px dashed var(--accent-color)', borderRadius: 'var(--border-radius-md)', padding: '16px', textAlign: 'center', background: 'var(--accent-light)' }}>
            <RefreshCw size={20} style={{ color: 'var(--accent-color)', marginBottom: '6px' }} />
            <div style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 600 }}>Synced Block</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Edits sync across all instances</div>
          </div>
        </div>
      );
    }

    if (id === 'mermaid') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-placeholder)', marginBottom: '8px' }}>FLOWCHART</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <div style={{ padding: '6px 12px', background: '#6366f1', color: 'white', borderRadius: '4px', fontSize: '10px' }}>Start</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>→</div>
              <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '10px', border: '1px solid var(--border-color)' }}>Process</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>→</div>
              <div style={{ padding: '6px 12px', background: '#22c55e', color: 'white', borderRadius: '4px', fontSize: '10px' }}>End</div>
            </div>
          </div>
        </div>
      );
    }

    if (id.startsWith('db-')) {
      const dbName = id.replace('db-', '');
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', textTransform: 'capitalize' }}>
              <Database size={12} style={{ marginRight: '6px' }} />
              {dbName} View
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {['Name', 'Status', 'Date'].map(h => (
                  <div key={h} style={{ flex: 1, padding: '4px 6px', background: 'var(--bg-tertiary)', borderRadius: '3px', fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</div>
                ))}
              </div>
              {[1, 2].map(r => (
                <div key={r} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ flex: 1, height: '12px', background: 'var(--border-color)', borderRadius: '2px' }} />
                  <div style={{ flex: 1, height: '12px', background: 'rgba(99,102,241,0.15)', borderRadius: '2px' }} />
                  <div style={{ flex: 1, height: '12px', background: 'var(--border-color)', borderRadius: '2px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (id === 'youtube') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: '#111', borderRadius: 'var(--border-radius-md)', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '36px', height: '26px', background: '#ff0000', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid white', marginLeft: '2px' }} />
            </div>
          </div>
        </div>
      );
    }

    if (id === 'github') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <GithubIcon />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>user/repository</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Repository description here</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>★ 128</span>
              <span>⑂ 34</span>
              <span>◉ 5 issues</span>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'chart') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-placeholder)', marginBottom: '8px' }}>BAR CHART</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '50px' }}>
              {[60, 85, 40, 70, 95, 55].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 4 ? 'var(--accent-color)' : 'var(--border-color)', borderRadius: '3px 3px 0 0', minWidth: '14px' }} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (id === 'equation') {
      return (
        <div style={{ padding: '20px', fontSize: '18px', fontStyle: 'italic', textAlign: 'center', color: 'var(--text-primary)', fontFamily: 'serif' }}>
          E = mc²
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>LaTeX: E = mc^2</div>
        </div>
      );
    }

    if (id === 'feedback') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <ThumbsUp size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>12</span>
            <ThumbsUp size={18} style={{ color: 'var(--text-muted)', transform: 'scaleY(-1)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>3</span>
          </div>
        </div>
      );
    }

    if (id === 'form') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Feedback Form</div>
            <div style={{ height: '20px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '8px', border: '1px solid var(--border-color)' }} />
            <div style={{ height: '40px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <div style={{ marginTop: '8px', padding: '6px 14px', background: 'var(--accent-color)', color: 'white', borderRadius: '4px', fontSize: '11px', display: 'inline-block' }}>Submit</div>
          </div>
        </div>
      );
    }

    if (id === 'button') {
      return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '8px 20px', background: 'var(--accent-color)', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Click Me
          </div>
        </div>
      );
    }

    if (id === 'shape') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', height: '80px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-placeholder)', fontSize: '12px' }}>
            <PenTool size={20} style={{ marginRight: '8px' }} />
            Sketch canvas
          </div>
        </div>
      );
    }

    if (id === 'ai-block') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.08) 100%)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-color)', marginBottom: '6px' }} />
            <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', width: '80%', marginBottom: '4px' }} />
            <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', width: '60%', marginBottom: '4px' }} />
            <div style={{ height: '4px', background: 'var(--accent-color)', borderRadius: '2px', width: '40%', opacity: 0.5 }} />
            <div style={{ fontSize: '10px', color: 'var(--accent-color)', marginTop: '6px' }}>AI generating...</div>
          </div>
        </div>
      );
    }

    if (id === 'toc') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Table of Contents</div>
            {['Introduction', 'Background', 'Methodology', 'Results', 'Conclusion'].map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '11px', color: 'var(--accent-color)' }}>
                <div style={{ width: `${(i + 1) * 8 + 4}px`, height: '2px', background: 'var(--border-color)' }} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (id === 'breadcrumb') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Home</span>
            <ChevronRight size={10} />
            <span>Projects</span>
            <ChevronRight size={10} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Current Page</span>
          </div>
        </div>
      );
    }

    if (id === 'notes') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'rgba(236,72,153,0.06)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid rgba(236,72,153,0.15)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>📝 Notes</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to start voice transcription or type your notes...</div>
          </div>
        </div>
      );
    }

    if (id === 'navigation') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            {['Home', 'About', 'Blog', 'Contact'].map(n => (
              <div key={n} style={{ fontSize: '11px', fontWeight: 500, color: n === 'Home' ? 'var(--accent-color)' : 'var(--text-muted)', padding: '2px 0', borderBottom: n === 'Home' ? '2px solid var(--accent-color)' : 'none' }}>
                {n}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (id === 'slack') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <SlackIcon />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>#announcements</span>
              <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>10:24 AM</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>Sarah: Hey team, great work on the release! 🎉</div>
          </div>
        </div>
      );
    }

    if (id === 'trello') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['To Do', 2], ['In Progress', 1], ['Done', 3]].map(([title, count]) => (
              <div key={String(title)} style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{String(title)}</div>
                {Array.from({ length: Number(count) }).map((_, i) => (
                  <div key={i} style={{ height: '14px', background: 'var(--bg-secondary)', borderRadius: '3px', marginBottom: '4px', border: '1px solid var(--border-color)' }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (id === 'google-maps') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: '#e8f5e9', borderRadius: 'var(--border-radius-md)', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50', fontSize: '24px', position: 'relative' }}>
            🗺️
            <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '9px', color: '#666', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: '4px' }}>📍 Pin: San Francisco, CA</div>
          </div>
        </div>
      );
    }

    if (id === 'import') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '20px', textAlign: 'center', color: 'var(--text-placeholder)' }}>
            <Upload size={20} style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '11px' }}>Drop CSV, JSON, Markdown or HTML file</div>
          </div>
        </div>
      );
    }

    if (id === 'google-drive' || id === 'dropbox' || id === 'onedrive') {
      const names: Record<string, string> = { 'google-drive': 'Google Drive', dropbox: 'Dropbox', onedrive: 'OneDrive' };
      const colors: Record<string, string> = { 'google-drive': '#34a853', dropbox: '#0061fe', onedrive: '#0078d4' };
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: colors[id], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' }}>
              {id === 'google-drive' ? 'G' : id === 'dropbox' ? 'D' : 'O'}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{names[id]} File</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Link a document from {names[id]}</div>
            </div>
          </div>
        </div>
      );
    }


    if (id === 'meetingmind') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.08) 100%)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Headphones size={24} style={{ color: '#6366f1', marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>MeetingMind AI Meeting Notepad</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Silent audio capture + AI-enhanced notes, full transcripts and speaker diarization</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['🎙️ Silent Recording', '📝 AI Enhancement', '💬 Speaker Diarization', '🔍 Transcript Search', '🤖 Ask AI About Meetings'].map(f => (
                <span key={f} style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (id === 'uiforge') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(139,92,246,0.08) 100%)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid rgba(236,72,153,0.2)' }}>
            <PenTool size={24} style={{ color: '#ec4899', marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>UIForge — AI Design Studio</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Text-to-UI generation, Figma-like visual editor, component library, and code export</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['✨ Text-to-UI', '🖌️ Visual Editor', '📦 Component Library', '💻 Code Export', '🎨 Theme System'].map(f => (
                <span key={f} style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (id === 'focus-shield') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(239,68,68,0.08) 100%)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Shield size={24} style={{ color: '#6366f1', marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>FocusShield</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Block distractions, focus sessions, streaks & digital wellbeing analytics</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['🛡️ App/Website Blocking', '🧠 Focus Sessions', '📊 Analytics Dashboard', '🔥 Streak Tracking', '📅 Recurring Schedules'].map(f => (
                <span key={f} style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (id.startsWith('tool-')) {
      const toolNames: Record<string, string> = {
        'tool-case-converter': 'Case Converter',
        'tool-json': 'JSON Prettifier',
        'tool-color': 'Color Generator',
        'tool-sandbox': 'HTML Sandbox'
      };
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid var(--border-color)' }}>
            <Wrench size={18} style={{ color: 'var(--accent-color)', marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{toolNames[id] || item.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
          </div>
        </div>
      );
    }

    if (type === 'template') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid var(--border-color)' }}>
            <Book size={18} style={{ color: 'var(--accent-color)', marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.desc}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['📝', '✅', '💡'].map(e => (
                <span key={e} style={{ fontSize: '16px' }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (id === 'date' || id === 'current-date') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)' }}>
            <Calendar size={16} style={{ color: 'var(--accent-color)' }} />
            <span>June 24, 2026</span>
          </div>
        </div>
      );
    }

    if (id === 'uptime' || id === 'meta') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[['Words', 342], ['Chars', 2140], ['Reading', '1.5m']].map(([l, v]) => (
              <div key={String(l)} style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{String(v)}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{String(l)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (id === 'time') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-primary)', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)' }}>
            <Clock size={14} />
            <span>2:30 PM</span>
          </div>
        </div>
      );
    }

    if (id === 'person') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--accent-light)', borderRadius: '20px', fontSize: '13px', color: 'var(--accent-color)', fontWeight: 500 }}>
            👩‍💻 Sarah Jenkins
          </div>
        </div>
      );
    }

    if (id === 'page-link') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-primary)', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--accent-color)' }}>
            <ExternalLink size={12} />
            <span>→ Go to Welcome Page</span>
          </div>
        </div>
      );
    }

    if (id === 'emoji') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['🚀', '✨', '🔥', '💡', '🎯'].map(e => (
              <span key={e} style={{ fontSize: '22px', cursor: 'pointer', padding: '4px', borderRadius: '4px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>{e}</span>
            ))}
          </div>
        </div>
      );
    }

    if (id === 'checkbox') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-primary)', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: '2px solid var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--accent-color)', fontSize: '9px' }}>✓</span>
            </div>
            <span>Status: Done</span>
          </div>
        </div>
      );
    }

    if (id === 'volume') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <Volume2 size={18} style={{ color: 'var(--accent-color)' }} />
            <div style={{ flexGrow: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', position: 'relative' }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--accent-color)', borderRadius: '3px' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>60%</span>
          </div>
        </div>
      );
    }

    if (id === 'figma') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: '#1e1e2e', borderRadius: 'var(--border-radius-md)', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {['#f24e1e', '#ff7262', '#a259ff', '#1abcfe', '#0acf83'].map(c => (
              <div key={c} style={{ width: '20px', height: '20px', background: c, borderRadius: '4px' }} />
            ))}
          </div>
        </div>
      );
    }

    if (id === 'codepen' || id === 'spotify' || id === 'airtable' || id === 'loom' || id === 'notion-embed') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            {id === 'spotify' ? <Music size={24} style={{ color: '#1DB954', marginBottom: '6px' }} /> :
             id === 'codepen' ? <Terminal size={24} style={{ color: '#000', marginBottom: '6px' }} /> :
             id === 'airtable' ? <Database size={24} style={{ color: '#f82b60', marginBottom: '6px' }} /> :
             id === 'loom' ? <Video size={24} style={{ color: '#625df5', marginBottom: '6px' }} /> :
             <FileText size={24} style={{ color: 'var(--text-muted)', marginBottom: '6px' }} />}
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Click to embed</div>
          </div>
        </div>
      );
    }

    if (id === 'template-button') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '2px dashed var(--accent-color)', borderRadius: 'var(--border-radius-md)', padding: '16px', textAlign: 'center', background: 'var(--accent-light)' }}>
            <Layers size={20} style={{ color: 'var(--accent-color)', marginBottom: '6px' }} />
            <div style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 600 }}>+ Add New Checklist</div>
          </div>
        </div>
      );
    }

    if (id === 'anchor') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-placeholder)' }}>
            <Anchor size={14} />
            <span>#section-anchor</span>
          </div>
        </div>
      );
    }

    if (id === 'link-to-page') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--accent-color)' }}>
            <ExternalLink size={14} />
            <span>Open linked page</span>
          </div>
        </div>
      );
    }

    if (id === 'comment') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>U</div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>User</span>
              <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>2h ago</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Great work on this! 🎉</div>
          </div>
        </div>
      );
    }

    if (id === 'mention') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--accent-light)', borderRadius: '20px', fontSize: '12px', color: 'var(--accent-color)' }}>
            <User size={14} />
            <span>@username</span>
          </div>
        </div>
      );
    }

    if (type === 'database') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
              <Database size={12} style={{ marginRight: '6px' }} />
              {item.label}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {['Name', 'Status'].map(h => (
                  <div key={h} style={{ flex: 1, padding: '4px 6px', background: 'var(--bg-tertiary)', borderRadius: '3px', fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</div>
                ))}
              </div>
              {[1, 2].map(r => (
                <div key={r} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ flex: 1, height: '10px', background: 'var(--border-color)', borderRadius: '2px' }} />
                  <div style={{ flex: 1, height: '10px', background: 'rgba(99,102,241,0.15)', borderRadius: '2px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ponytail: database view previews
    if (id.startsWith('db-')) {
      const previews: Record<string, { icon: string; desc: string; color: string }> = {
        'db-table': { icon: '▦', desc: 'Rows and columns grid with sortable fields', color: '#6366f1' },
        'db-board': { icon: '⬜', desc: 'Drag-and-drop Kanban board view', color: '#f59e0b' },
        'db-calendar': { icon: '📅', desc: 'Monthly calendar with date-based cards', color: '#10b981' },
        'db-timeline': { icon: '📊', desc: 'Gantt-style timeline view', color: '#8b5cf6' },
        'db-gallery': { icon: '🖼️', desc: 'Visual card grid with cover images', color: '#ec4899' },
        'db-list': { icon: '📋', desc: 'Compact list with inline editing', color: '#06b6d4' },
        'db-dashboard': { icon: '📈', desc: 'KPI metrics and chart dashboard', color: '#f97316' },
        'db-map': { icon: '🗺️', desc: 'Geographic map with pin markers', color: '#22c55e' },
        'db-form': { icon: '📝', desc: 'Fillable form with field validation', color: '#a855f7' },
      };
      const p = previews[id] || { icon: '🗄️', desc: item.desc, color: '#6366f1' };
      return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
          <div style={{ fontSize: '48px', lineHeight: 1 }}>{p.icon}</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '200px' }}>{p.desc}</div>
          <div style={{ width: '80%', height: '3px', borderRadius: '2px', background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
        </div>
      );
    }

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', padding: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px 6px', fontSize: '10px', fontWeight: 800, color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
        Preview — {item.label}
      </div>
      <div style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
        {renderPreviewContent()}
      </div>
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-color)', fontSize: '10px', color: 'var(--text-placeholder)' }}>
        Click to add to your page
      </div>
    </div>
  );
};

export const NewMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    pages, activePageId, setActivePageId, addPage, addBlock,
    updateSettings, loadTemplate, activeWorkspaceId, setCanvasFlowOpen, setMeetingMindOpen, setUIForgeOpen, setFocusShieldOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<NewMenuItem | null>(null);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const workspacePages = pages.filter(p => !p.isTrash && (p.workspaceId === activeWorkspaceId || (!p.workspaceId && activeWorkspaceId === 'default')));

  const addBlockToPage = (type: Block['type']) => {
    if (activePageId) {
      addBlock(activePageId, type);
      onClose();
    } else {
      const newPageId = addPage(null);
      setTimeout(() => addBlock(newPageId, type), 50);
      onClose();
    }
  };

  const items: NewMenuItem[] = useMemo(() => [
    ...workspacePages.map(p => ({
      id: `page-${p.id}`, type: 'page' as const, label: p.title || 'Untitled', desc: p.isDatabase ? 'Database page' : 'Page',
      icon: <span style={{ fontSize: '16px' }}>{p.icon || '📄'}</span>, category: '📄 Pages',
      keywords: `${p.title} page ${p.isDatabase ? 'database' : ''}`,
      action: () => { setActivePageId(p.id); onClose(); }
    })),
    { id: 'new-page', type: 'page' as const, label: '+ New Blank Page', desc: 'Create a new empty page', icon: <Plus size={16} style={{ color: 'var(--accent-color)' }} />, category: '📄 Pages', keywords: 'new blank page create empty', action: () => { addPage(null); onClose(); } },
    { id: 'text', type: 'block' as const, label: 'Text', desc: 'Plain writing block', icon: <Type size={16} />, category: '✏️ Basic Blocks', keywords: 'text paragraph plain normal', action: () => addBlockToPage('text') },
    { id: 'h1', type: 'block' as const, label: 'Heading 1', desc: 'Large section header', icon: <Heading1 size={16} />, category: '✏️ Basic Blocks', keywords: 'heading h1 large title', action: () => addBlockToPage('h1') },
    { id: 'h2', type: 'block' as const, label: 'Heading 2', desc: 'Medium section header', icon: <Heading2 size={16} />, category: '✏️ Basic Blocks', keywords: 'heading h2 medium section', action: () => addBlockToPage('h2') },
    { id: 'h3', type: 'block' as const, label: 'Heading 3', desc: 'Small section header', icon: <Heading3 size={16} />, category: '✏️ Basic Blocks', keywords: 'heading h3 small sub', action: () => addBlockToPage('h3') },
    { id: 'h4', type: 'block' as const, label: 'Heading 4', desc: 'Extra-small section header', icon: <Heading3 size={16} style={{ opacity: 0.7 }} />, category: '✏️ Basic Blocks', keywords: 'heading h4 smallest', action: () => addBlockToPage('h4') },
    { id: 'todo', type: 'block' as const, label: 'To-do List', desc: 'Checkbox for tasks', icon: <CheckSquare size={16} />, category: '✏️ Basic Blocks', keywords: 'todo check checkbox list task', action: () => addBlockToPage('todo') },
    { id: 'bullet', type: 'block' as const, label: 'Bulleted List', desc: 'Simple bulleted list', icon: <List size={16} />, category: '✏️ Basic Blocks', keywords: 'bullet bulleted list unordered', action: () => addBlockToPage('bullet') },
    { id: 'number', type: 'block' as const, label: 'Numbered List', desc: 'Sequential list', icon: <ListOrdered size={16} />, category: '✏️ Basic Blocks', keywords: 'number numbered list ordered', action: () => addBlockToPage('number') },
    { id: 'toggle', type: 'block' as const, label: 'Toggle List', desc: 'Toggles nested blocks', icon: <ChevronRight size={16} />, category: '✏️ Basic Blocks', keywords: 'toggle list accordion collapse', action: () => addBlockToPage('toggle') },
    { id: 'toggle-h1', type: 'block' as const, label: 'Toggle Heading 1', desc: 'Large header with toggle', icon: <Heading1 size={16} style={{ color: 'var(--accent-color)' }} />, category: '✏️ Basic Blocks', keywords: 'toggle h1 accordion large heading', action: () => addBlockToPage('toggle-h1') },
    { id: 'toggle-h2', type: 'block' as const, label: 'Toggle Heading 2', desc: 'Medium header with toggle', icon: <Heading2 size={16} style={{ color: 'var(--accent-color)' }} />, category: '✏️ Basic Blocks', keywords: 'toggle h2 accordion medium heading', action: () => addBlockToPage('toggle-h2') },
    { id: 'toggle-h3', type: 'block' as const, label: 'Toggle Heading 3', desc: 'Small header with toggle', icon: <Heading3 size={16} style={{ color: 'var(--accent-color)' }} />, category: '✏️ Basic Blocks', keywords: 'toggle h3 accordion small heading', action: () => addBlockToPage('toggle-h3') },
    { id: 'quote', type: 'block' as const, label: 'Quote', desc: 'Capture a quote', icon: <Quote size={16} />, category: '✏️ Basic Blocks', keywords: 'quote blockquote citation', action: () => addBlockToPage('quote') },
    { id: 'callout', type: 'block' as const, label: 'Callout', desc: 'Make writing stand out', icon: <FileText size={16} style={{ color: 'var(--accent-color)' }} />, category: '✏️ Basic Blocks', keywords: 'callout info alert highlights', action: () => addBlockToPage('callout') },
    { id: 'divider', type: 'block' as const, label: 'Divider', desc: 'Horizontal separator line', icon: <Minus size={16} />, category: '✏️ Basic Blocks', keywords: 'divider line separator hr', action: () => addBlockToPage('divider') },
    { id: 'code', type: 'block' as const, label: 'Code Block', desc: 'Syntax highlighted code', icon: <Terminal size={16} />, category: '💻 Media & Code', keywords: 'code programming syntax terminal', action: () => addBlockToPage('code') },
    { id: 'mermaid', type: 'block' as const, label: 'Mermaid Diagram', desc: 'Flowchart, sequence, gantt diagrams', icon: <Activity size={16} style={{ color: '#ff3670' }} />, category: '💻 Media & Code', keywords: 'mermaid flowchart sequence diagram', action: () => addBlockToPage('mermaid') },
    { id: 'image', type: 'block' as const, label: 'Image', desc: 'Insert cover image or photo', icon: <ImageIcon size={16} />, category: '💻 Media & Code', keywords: 'image picture photo graphic upload', action: () => addBlockToPage('image') },
    { id: 'video', type: 'block' as const, label: 'Video Player', desc: 'Upload or embed MP4 videos', icon: <Video size={16} />, category: '💻 Media & Code', keywords: 'video player mp4 clip stream', action: () => addBlockToPage('video') },
    { id: 'audio', type: 'block' as const, label: 'Audio Player', desc: 'Upload or embed sound clips', icon: <Music size={16} />, category: '💻 Media & Code', keywords: 'audio music sound player pod', action: () => addBlockToPage('audio') },
    { id: 'file', type: 'block' as const, label: 'File Attachment', desc: 'Upload files and download cards', icon: <Paperclip size={16} />, category: '💻 Media & Code', keywords: 'file attachment download zip upload', action: () => addBlockToPage('file') },
    { id: 'pdf', type: 'block' as const, label: 'PDF Viewer', desc: 'Embed scrollable PDF document', icon: <BookOpen size={16} />, category: '💻 Media & Code', keywords: 'pdf viewer documentation embed', action: () => addBlockToPage('pdf') },
    { id: 'embed', type: 'block' as const, label: 'Web Embed', desc: 'Generic iframe web preview', icon: <Globe size={16} />, category: '💻 Media & Code', keywords: 'embed iframe web url widget', action: () => addBlockToPage('embed') },
    { id: 'bookmark', type: 'block' as const, label: 'Web Bookmark', desc: 'URL bookmark preview card', icon: <Bookmark size={16} />, category: '💻 Media & Code', keywords: 'bookmark url web link preview', action: () => addBlockToPage('bookmark') },
    { id: 'table', type: 'block' as const, label: 'Simple Table', desc: 'Simple plain data matrix', icon: <Table size={16} />, category: '💻 Media & Code', keywords: 'table simple grid', action: () => addBlockToPage('table') },
    { id: 'column-list', type: 'block' as const, label: '2 Columns Layout', desc: 'Multi-column container', icon: <Columns size={16} />, category: '📐 Layouts', keywords: 'column columns grid layout', action: () => addBlockToPage('column-list') },
    { id: 'synced-block', type: 'block' as const, label: 'Synced Block', desc: 'Sync blocks across pages', icon: <RefreshCw size={16} />, category: '📐 Layouts', keywords: 'sync synced block mirrors copy', action: () => addBlockToPage('synced-block') },
    { id: 'breadcrumb', type: 'block' as const, label: 'Breadcrumbs', desc: 'Path trail navigation links', icon: <MapPin size={16} />, category: '📐 Layouts', keywords: 'breadcrumb path route location', action: () => addBlockToPage('breadcrumb') },
    { id: 'toc', type: 'block' as const, label: 'Table of Contents', desc: 'Auto document heading outline', icon: <ListCollapse size={16} />, category: '📐 Layouts', keywords: 'toc contents table outline headings', action: () => addBlockToPage('toc') },
    { id: 'navigation', type: 'block' as const, label: 'Navigation Menu', desc: 'Navbar menu header', icon: <Compass size={16} />, category: '📐 Layouts', keywords: 'navigation menu navbar links', action: () => addBlockToPage('navigation') },
    { id: 'db-table', type: 'database' as const, label: 'Table View Database', desc: 'Create a database Table layout', icon: <Table size={16} />, category: '🗄️ Databases', keywords: 'database table grid fields', action: () => { addPage(null, true, 'table'); onClose(); } },
    { id: 'db-board', type: 'database' as const, label: 'Kanban Board Database', desc: 'Create a database Board status layout', icon: <Columns size={16} />, category: '🗄️ Databases', keywords: 'database board kanban status', action: () => { addPage(null, true, 'board'); onClose(); } },
    { id: 'db-calendar', type: 'database' as const, label: 'Calendar View Database', desc: 'Create a database Calendar view', icon: <Calendar size={16} />, category: '🗄️ Databases', keywords: 'database calendar date planner', action: () => { addPage(null, true, 'calendar'); onClose(); } },
    { id: 'db-timeline', type: 'database' as const, label: 'Timeline Database', desc: 'Create a database Gantt timeline', icon: <Calendar size={16} style={{ opacity: 0.8 }} />, category: '🗄️ Databases', keywords: 'database timeline gantt schedule', action: () => { addPage(null, true, 'timeline'); onClose(); } },
    { id: 'db-gallery', type: 'database' as const, label: 'Gallery Database', desc: 'Create a database Gallery grid', icon: <ImageIcon size={16} />, category: '🗄️ Databases', keywords: 'database gallery cover grid visual', action: () => { addPage(null, true, 'gallery'); onClose(); } },
    { id: 'db-list', type: 'database' as const, label: 'List View Database', desc: 'Create a database List layout', icon: <List size={16} />, category: '🗄️ Databases', keywords: 'database list row outline', action: () => { addPage(null, true, 'list'); onClose(); } },
    { id: 'db-feed', type: 'database' as const, label: 'Feed Database', desc: 'Create a database journal Feed log', icon: <Activity size={16} />, category: '🗄️ Databases', keywords: 'database feed journal timeline', action: () => { addPage(null, true, 'feed'); onClose(); } },
    { id: 'db-dashboard', type: 'database' as const, label: 'Dashboard Database', desc: 'Create a database Dashboard stats', icon: <BarChart3 size={16} />, category: '🗄️ Databases', keywords: 'database dashboard chart kpi stats', action: () => { addPage(null, true, 'dashboard'); onClose(); } },
    { id: 'db-map', type: 'database' as const, label: 'Map Database', desc: 'Create a database Map pins log', icon: <Map size={16} />, category: '🗄️ Databases', keywords: 'database map address pins location', action: () => { addPage(null, true, 'map'); onClose(); } },
    { id: 'db-form', type: 'database' as const, label: 'Form Database', desc: 'Create a database Form layout', icon: <FileSpreadsheet size={16} />, category: '🗄️ Databases', keywords: 'database form survey submission', action: () => { addPage(null, true, 'form'); onClose(); } },
    { id: 'youtube', type: 'block' as const, label: 'YouTube Video', desc: 'Embed YouTube player', icon: <YoutubeIcon />, category: '🔗 Integrations', keywords: 'youtube google video player', action: () => addBlockToPage('youtube') },
    { id: 'google-drive', type: 'block' as const, label: 'Google Drive', desc: 'Link documents & spreadsheets', icon: <FileSpreadsheet size={16} style={{ color: '#34a853' }} />, category: '🔗 Integrations', keywords: 'google drive sheet docs', action: () => addBlockToPage('google-drive') },
    { id: 'figma', type: 'block' as const, label: 'Figma Frame', desc: 'Embed figma design board', icon: <PenTool size={16} style={{ color: '#a259ff' }} />, category: '🔗 Integrations', keywords: 'figma UI design prototype', action: () => addBlockToPage('figma') },
    { id: 'github', type: 'block' as const, label: 'GitHub Repo', desc: 'Repository details card', icon: <GithubIcon />, category: '🔗 Integrations', keywords: 'github repo git code', action: () => addBlockToPage('github') },
    { id: 'slack', type: 'block' as const, label: 'Slack Message', desc: 'Slack message card', icon: <SlackIcon />, category: '🔗 Integrations', keywords: 'slack chat messaging team', action: () => addBlockToPage('slack') },
    { id: 'trello', type: 'block' as const, label: 'Trello Board', desc: 'Visual card task list widget', icon: <Layout size={16} style={{ color: '#0079bf' }} />, category: '🔗 Integrations', keywords: 'trello kanban board task', action: () => addBlockToPage('trello') },
    { id: 'loom', type: 'block' as const, label: 'Loom Video', desc: 'Play loom video embeds', icon: <Video size={16} style={{ color: '#625df5' }} />, category: '🔗 Integrations', keywords: 'loom video screen recording', action: () => addBlockToPage('loom') },
    { id: 'google-maps', type: 'block' as const, label: 'Google Map', desc: 'Embed map with pins & zoom', icon: <Map size={16} style={{ color: '#1a73e8' }} />, category: '🔗 Integrations', keywords: 'google map maps pin location', action: () => addBlockToPage('google-maps') },
    { id: 'spotify', type: 'block' as const, label: 'Spotify', desc: 'Embed track, album, or playlist', icon: <Music size={16} style={{ color: '#1DB954' }} />, category: '🔗 Integrations', keywords: 'spotify music podcast stream', action: () => addBlockToPage('spotify') },
    { id: 'codepen', type: 'block' as const, label: 'CodePen', desc: 'Embed live code pen', icon: <Terminal size={16} style={{ color: '#000' }} />, category: '🔗 Integrations', keywords: 'codepen HTML CSS sandbox', action: () => addBlockToPage('codepen') },
    { id: 'airtable', type: 'block' as const, label: 'Airtable Base', desc: 'Airtable spreadsheet view', icon: <Database size={16} style={{ color: '#f82b60' }} />, category: '🔗 Integrations', keywords: 'airtable database sheets', action: () => addBlockToPage('airtable') },
    { id: 'notion-embed', type: 'block' as const, label: 'Notion Embed', desc: 'Link pages recursively', icon: <FileText size={16} />, category: '🔗 Integrations', keywords: 'notion embed pages link', action: () => addBlockToPage('notion') },
    { id: 'dropbox', type: 'block' as const, label: 'Dropbox File', desc: 'Dropbox attachment card link', icon: <Paperclip size={16} style={{ color: '#0061fe' }} />, category: '🔗 Integrations', keywords: 'dropbox file folder cloud', action: () => addBlockToPage('dropbox') },
    { id: 'onedrive', type: 'block' as const, label: 'OneDrive File', desc: 'OneDrive document card', icon: <Paperclip size={16} style={{ color: '#0078d4' }} />, category: '🔗 Integrations', keywords: 'onedrive microsoft file cloud', action: () => addBlockToPage('onedrive') },
    { id: 'equation', type: 'block' as const, label: 'Equation Math', desc: 'LaTeX mathematical formulas', icon: <Sigma size={16} />, category: '⚡ Advanced', keywords: 'equation math latex formula', action: () => addBlockToPage('equation') },
    { id: 'chart', type: 'block' as const, label: 'Advanced Chart Builder', desc: '50+ chart types: bar, line, pie, gauge', icon: <PieChart size={16} style={{ color: 'var(--accent-color)' }} />, category: '⚡ Advanced', keywords: 'chart bar line pie gauge data', action: () => addBlockToPage('chart') },
    { id: 'chart-bar', type: 'block' as const, label: 'Bar Chart', desc: 'Render vertical or horizontal bars', icon: <BarChart3 size={16} style={{ color: '#5e81ac' }} />, category: '⚡ Advanced', keywords: 'chart bar vertical horizontal stats', action: () => addBlockToPage('chart-bar') },
    { id: 'chart-line', type: 'block' as const, label: 'Line Chart', desc: 'Render line, area, or sparkline charts', icon: <Activity size={16} style={{ color: '#a3be8c' }} />, category: '⚡ Advanced', keywords: 'chart line area sparkline stats trend', action: () => addBlockToPage('chart-line') },
    { id: 'chart-pie', type: 'block' as const, label: 'Pie Chart', desc: 'Render pie, doughnut, or donut-half charts', icon: <PieChart size={16} style={{ color: '#ebcb8b' }} />, category: '⚡ Advanced', keywords: 'chart pie doughnut donut circular stats', action: () => addBlockToPage('chart-pie') },
    { id: 'chart-gauge', type: 'block' as const, label: 'Gauge & Progress', desc: 'Render radial dials and progress rings', icon: <Clock size={16} style={{ color: '#bf616a' }} />, category: '⚡ Advanced', keywords: 'chart gauge progress ring dial metric', action: () => addBlockToPage('chart-gauge') },
    { id: 'chart-radar', type: 'block' as const, label: 'Radar Chart', desc: 'Render multi-variable spiderweb charts', icon: <Compass size={16} style={{ color: '#88c0d0' }} />, category: '⚡ Advanced', keywords: 'chart radar polar spider web statistical', action: () => addBlockToPage('chart-radar') },
    { id: 'ai-block', type: 'block' as const, label: 'AI Helper Draft', desc: 'Generate texts using simulated AI', icon: <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />, category: '⚡ Advanced', keywords: 'ai generating assistant writing', action: () => addBlockToPage('ai-block') },
    { id: 'notes', type: 'block' as const, label: 'Notes Card', desc: 'Notes card with Transcription', icon: <FileText size={16} style={{ color: '#ec4899' }} />, category: '⚡ Advanced', keywords: 'notes transcription voice memo', action: () => addBlockToPage('notes') },
    { id: 'import', type: 'block' as const, label: 'Import File Block', desc: 'Inline CSV, MD, JSON, HTML', icon: <Upload size={16} style={{ color: '#5e81ac' }} />, category: '⚡ Advanced', keywords: 'import csv json markdown html', action: () => addBlockToPage('import') },
    { id: 'shape', type: 'block' as const, label: 'Sketch Board', desc: 'Sketch drawing pad canvas', icon: <PenTool size={16} />, category: '⚡ Advanced', keywords: 'shape sketch draw canvas paint', action: () => addBlockToPage('shape') },
    { id: 'button', type: 'block' as const, label: 'Action Button', desc: 'Interactive button trigger', icon: <PlaySquare size={16} />, category: '⚡ Advanced', keywords: 'button action toast alert', action: () => addBlockToPage('button') },
    { id: 'template-button', type: 'block' as const, label: 'Template Button', desc: 'One-click blocks replicator', icon: <Layers size={16} />, category: '⚡ Advanced', keywords: 'template button replicate blocks', action: () => addBlockToPage('template-button') },
    { id: 'anchor', type: 'block' as const, label: 'Anchor Link', desc: 'Deep-link jump bookmark', icon: <Anchor size={16} />, category: '⚡ Advanced', keywords: 'anchor bookmark deeplink jump', action: () => addBlockToPage('anchor') },
    { id: 'link-to-page', type: 'block' as const, label: 'Link to Page', desc: 'Navigational button link', icon: <ExternalLink size={16} />, category: '⚡ Advanced', keywords: 'link page navigation button', action: () => addBlockToPage('link-to-page') },
    { id: 'date', type: 'block' as const, label: 'Date Picker', desc: 'Embed static or picker date', icon: <Calendar size={16} />, category: '🔄 Dynamic', keywords: 'date calendar picker schedule', action: () => addBlockToPage('date') },
    { id: 'uptime', type: 'block' as const, label: 'Uptime Tracker', desc: 'Count document open time', icon: <Activity size={16} />, category: '🔄 Dynamic', keywords: 'uptime tracker clock session', action: () => addBlockToPage('uptime') },
    { id: 'mention', type: 'block' as const, label: 'Mention User', desc: 'User inline badge', icon: <User size={16} />, category: '🔄 Dynamic', keywords: 'mention user badge contact', action: () => addBlockToPage('mention') },
    { id: 'meta', type: 'block' as const, label: 'Word Counter', desc: 'Reading speed stats', icon: <BarChart3 size={16} />, category: '🔄 Dynamic', keywords: 'meta counter word statistics', action: () => addBlockToPage('meta') },
    { id: 'feedback', type: 'block' as const, label: 'Thumbs Rating', desc: 'Up/down micro feedback block', icon: <ThumbsUp size={16} />, category: '🔄 Dynamic', keywords: 'feedback rating thumbs like', action: () => addBlockToPage('feedback') },
    { id: 'form', type: 'block' as const, label: 'Form Questionnaire', desc: 'Form builder & submissions', icon: <FileSpreadsheet size={16} />, category: '🔄 Dynamic', keywords: 'form survey questionnaire', action: () => addBlockToPage('form') },
    { id: 'comment', type: 'block' as const, label: 'Comment Thread', desc: 'Discussion timeline', icon: <MessageSquare size={16} />, category: '🔄 Dynamic', keywords: 'comment discussion chat reply', action: () => addBlockToPage('comment') },
    { id: 'current-date', type: 'block' as const, label: 'Current Date', desc: 'Show today date automatically', icon: <Calendar size={16} style={{ color: 'var(--accent-color)' }} />, category: '🔄 Dynamic', keywords: 'current date today', action: () => addBlockToPage('current-date') },
    { id: 'time', type: 'block' as const, label: 'Clock Time Badge', desc: 'Static time badge', icon: <Clock size={16} />, category: '🏷️ Badges', keywords: 'time badge clock hour minute', action: () => addBlockToPage('time') },
    { id: 'person', type: 'block' as const, label: 'Person Badge', desc: 'Mentions team member tag', icon: <User size={16} />, category: '🏷️ Badges', keywords: 'person mention badge team', action: () => addBlockToPage('person') },
    { id: 'page-link', type: 'block' as const, label: 'Page Reference Badge', desc: 'Shortcut link to page', icon: <ExternalLink size={16} />, category: '🏷️ Badges', keywords: 'page link badge reference', action: () => addBlockToPage('page-link') },
    { id: 'emoji', type: 'block' as const, label: 'Emoji Selection Badge', desc: 'Quick inline emoji tag', icon: <Smile size={16} />, category: '🏷️ Badges', keywords: 'emoji smile picker badge', action: () => addBlockToPage('emoji') },
    { id: 'checkbox', type: 'block' as const, label: 'Inline Checkbox', desc: 'Interactive check tag', icon: <CheckSquare size={16} />, category: '🏷️ Badges', keywords: 'checkbox status checked tag', action: () => addBlockToPage('checkbox') },
    { id: 'volume', type: 'block' as const, label: 'Volume Callout', desc: 'Callout box with slider', icon: <Volume2 size={16} style={{ color: 'var(--accent-color)' }} />, category: '🏷️ Badges', keywords: 'volume callout slider audio', action: () => addBlockToPage('volume') },
    { id: 'canvasflow-board', type: 'tool' as const, label: 'CanvasFlow Board', desc: 'Infinite collaborative whiteboard & innovation canvas', icon: <Layout size={16} style={{ color: '#6366f1' }} />, category: '🔧 Tools', keywords: 'canvasflow whiteboard infinite canvas board sticky', action: () => { setCanvasFlowOpen(true); onClose(); } },
    { id: 'meetingmind', type: 'tool' as const, label: 'MeetingMind AI', desc: 'Silent meeting recorder with AI note enhancement, transcripts & speaker diarization', icon: <Headphones size={16} style={{ color: '#6366f1' }} />, category: '🔧 Tools', keywords: 'meetingmind meeting recorder transcription notes ai speaker diarization', action: () => { setMeetingMindOpen(true); onClose(); } },
    { id: 'uiforge', type: 'tool' as const, label: 'UIForge Design', desc: 'AI UI/UX design studio — text-to-UI, Figma-like editor, code export', icon: <PenTool size={16} style={{ color: '#ec4899' }} />, category: '🔧 Tools', keywords: 'uiforge figma design ui ux prototype stitch ai generate', action: () => { setUIForgeOpen(true); onClose(); } },
    { id: 'focus-shield', type: 'tool' as const, label: 'FocusShield', desc: 'Block distractions, focus sessions, streaks & digital wellbeing', icon: <Shield size={16} style={{ color: '#6366f1' }} />, category: '🔧 Tools', keywords: 'focus shield blocker wellbeing productivity deep work', action: () => { setFocusShieldOpen(true); onClose(); } },
    { id: 'tool-case-converter', type: 'tool' as const, label: 'Case Converter', desc: 'Convert text casing (UPPER, lower, Title)', icon: <FileText size={16} />, category: '🔧 Tools', keywords: 'case converter uppercase lowercase', action: () => { updateSettings({ sidebarCollapsed: false }); onClose(); } },
    { id: 'tool-json', type: 'tool' as const, label: 'JSON Prettifier', desc: 'Validate, format, minify JSON', icon: <Terminal size={16} />, category: '🔧 Tools', keywords: 'json prettifier validator format', action: () => { updateSettings({ sidebarCollapsed: false }); onClose(); } },
    { id: 'tool-color', type: 'tool' as const, label: 'Color Generator', desc: 'Pick, preview HEX/RGB colors', icon: <Palette size={16} />, category: '🔧 Tools', keywords: 'color generator palette hex', action: () => { updateSettings({ sidebarCollapsed: false }); onClose(); } },
    { id: 'tool-sandbox', type: 'tool' as const, label: 'HTML Sandbox', desc: 'Live HTML preview sandbox', icon: <Globe size={16} />, category: '🔧 Tools', keywords: 'html sandbox preview code', action: () => { updateSettings({ sidebarCollapsed: false }); onClose(); } },
    { id: 'template-journal', type: 'template' as const, label: 'Daily Journal', desc: 'Morning quotes, gratitude lists, daily focus', icon: <Book size={16} style={{ color: '#f59e0b' }} />, category: '📋 Templates', keywords: 'journal daily diary morning', action: () => { loadTemplate('journal'); onClose(); } },
    { id: 'template-class', type: 'template' as const, label: 'Lecture Notes', desc: 'Class reminders, course syllabi, pseudocode', icon: <BookOpen size={16} style={{ color: '#3b82f6' }} />, category: '📋 Templates', keywords: 'lecture notes class study', action: () => { loadTemplate('class'); onClose(); } },
    { id: 'template-blank', type: 'template' as const, label: 'Blank Notebook', desc: 'Pristine empty canvas to capture thoughts', icon: <FileText size={16} />, category: '📋 Templates', keywords: 'blank empty notebook canvas', action: () => { loadTemplate('blank'); onClose(); } },
  ], [workspacePages, activePageId, activeWorkspaceId]);

  const filteredItems = items.filter(
    item => item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase()) ||
      item.keywords.toLowerCase().includes(search.toLowerCase())
  );

  const categoriesList: { category: string; list: NewMenuItem[] }[] = [];
  filteredItems.forEach(item => {
    let cat = categoriesList.find(c => c.category === item.category);
    if (!cat) { cat = { category: item.category, list: [] }; categoriesList.push(cat); }
    cat.list.push(item);
  });

  const flatList = categoriesList.flatMap(c => c.list);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => (prev + 1) % flatList.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => (prev - 1 + flatList.length) % flatList.length); }
      else if (e.key === 'Enter') { e.preventDefault(); if (flatList[selectedIndex]) flatList[selectedIndex].action(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleKeyDown); };
  }, [flatList, selectedIndex, onClose]);

  useEffect(() => {
    const el = menuRef.current?.querySelector('.new-menu-item.selected');
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  useEffect(() => {
    if (flatList[selectedIndex]) setHoveredItem(flatList[selectedIndex]);
  }, [selectedIndex]);

  let absIdx = -1;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.4)' }}>
      <div ref={menuRef} className="new-menu-panel glass" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: previewCollapsed ? '420px' : '720px', maxHeight: '620px', borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-lg)', display: 'flex', overflow: 'hidden', zIndex: 10000,
        backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ width: previewCollapsed ? '100%' : '380px', display: 'flex', flexDirection: 'column', borderRight: previewCollapsed ? 'none' : '1px solid var(--border-color)', flexShrink: 0, transition: 'width 0.25s' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input ref={inputRef} type="text" value={search} onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
              placeholder="Search pages, blocks, tools..."
              style={{ flexGrow: 1, padding: '6px 4px', border: 'none', borderRadius: '0', background: 'transparent', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
            <button
              onClick={() => setPreviewCollapsed(!previewCollapsed)}
              style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', borderRadius: '4px', color: previewCollapsed ? 'var(--text-placeholder)' : 'var(--accent-color)', display: 'flex', alignItems: 'center' }}
              title={previewCollapsed ? 'Show preview' : 'Hide preview'}
            >
              <Sidebar size={16} />
            </button>
            <button
              onClick={onClose}
              className="hover-bg"
              style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="new-menu-items-list" style={{ overflowY: 'auto', padding: '6px', flexGrow: 1 }}>
            {categoriesList.map(catGroup => (
              <div key={catGroup.category}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-placeholder)', padding: '8px 10px 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {catGroup.category}
                </div>
                {catGroup.list.map(item => {
                  absIdx++;
                  const isSelected = absIdx === selectedIndex;
                  const curIdx = absIdx;
                  return (
                    <div key={item.id} className={`new-menu-item ${isSelected ? 'selected' : ''}`}
                      onClick={item.action}
                      onMouseEnter={() => { setSelectedIndex(curIdx); setHoveredItem(item); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', transition: 'background-color 0.1s ease', backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent', borderLeft: isSelected ? '2px solid var(--accent-color)' : '2px solid transparent', borderTopLeftRadius: isSelected ? 0 : undefined, borderBottomLeftRadius: isSelected ? 0 : undefined }}>
                      <div style={{ width: '26px', height: '26px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {flatList.length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-placeholder)', fontStyle: 'italic' }}>
                No results for "{search}"
              </div>
            )}
          </div>
          <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border-color)', fontSize: '10px', color: 'var(--text-placeholder)', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-primary)' }}>
            <span><kbd style={kbdStyle}>↑↓</kbd> Navigate <kbd style={kbdStyle}>↵</kbd> Select</span>
            <span><kbd style={kbdStyle}>Esc</kbd> Close</span>
          </div>
        </div>
        {!previewCollapsed && (
          <div style={{ width: '340px', flexShrink: 0, borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <PreviewPanel item={flatList.find((_, i) => i === selectedIndex) || hoveredItem} />
          </div>
        )}
      </div>
    </div>
  );
};

const kbdStyle: React.CSSProperties = {
  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
  padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)'
};
