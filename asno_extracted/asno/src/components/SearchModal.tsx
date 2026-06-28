import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { Search, FileText, ChevronRight, X, Sidebar } from 'lucide-react';
import { Page } from '../types';

export const SearchModal: React.FC = () => {
  const {
    pages,
    setActivePageId,
    searchOpen,
    setSearchOpen
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [titleOnly, setTitleOnly] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Global Ctrl+K trigger
  useEffect(() => {
    const handleGlobalKbd = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', handleGlobalKbd);
    return () => window.removeEventListener('keydown', handleGlobalKbd);
  }, [searchOpen]);

  if (!searchOpen) return null;

  // Search indexing
  const getResults = () => {
    if (!query.trim()) {
      // Show recent / all pages by default
      return pages.filter(p => !p.isTrash).slice(0, 10).map(p => ({
        id: p.id,
        title: p.title || 'Untitled Page',
        icon: p.icon || '📄',
        snippet: 'Page document'
      }));
    }

    const lowQ = query.toLowerCase();
    const matches: { id: string; title: string; icon: string; snippet: string }[] = [];

    pages.forEach(p => {
      if (p.isTrash) return;

      // Match Title
      const titleMatch = p.title.toLowerCase().includes(lowQ);
      if (titleMatch) {
        matches.push({
          id: p.id,
          title: p.title || 'Untitled Page',
          icon: p.icon || '📄',
          snippet: 'Matches page title'
        });
        return;
      }

      // Skip block matching if Title Only is toggled
      if (titleOnly) return;

      // Match Blocks Content
      const matchingBlock = p.content.find(b => b.content.toLowerCase().includes(lowQ));
      if (matchingBlock) {
        const cleanSnippet = matchingBlock.content.replace(/<[^>]*>/g, '').substring(0, 60);
        matches.push({
          id: p.id,
          title: p.title || 'Untitled Page',
          icon: p.icon || '📄',
          snippet: `"${cleanSnippet}..."`
        });
      }
    });

    return matches;
  };

  const results = getResults();
  const hoveredPageId = results[selectedIndex]?.id;
  const hoveredPage = pages.find(p => p.id === hoveredPageId);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        setActivePageId(results[selectedIndex].id);
        setSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const renderPagePreview = (page: Page | undefined) => {
    if (!page) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-placeholder)', padding: '24px', height: '100%' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <span style={{ fontSize: '13px' }}>Select a page to preview</span>
        </div>
      );
    }

    const renderBlocksOutline = () => {
      if (page.isDatabase) {
        const rows = page.dbRows || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roadmap Items ({rows.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', background: 'var(--bg-primary)' }}>
              {rows.slice(0, 4).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{r.cells['prop-name'] || 'Untitled item'}</span>
                  <span style={{ opacity: 0.8, fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{r.cells['prop-status'] || 'No Status'}</span>
                </div>
              ))}
              {rows.length === 0 && <span style={{ fontStyle: 'italic', fontSize: '11px', color: 'var(--text-placeholder)' }}>No database entries</span>}
            </div>
          </div>
        );
      }

      const txtBlocks = page.content.filter(b => b.content.trim() !== '').slice(0, 4);
      if (txtBlocks.length === 0) {
        return <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-placeholder)', marginTop: '20px' }}>Empty document page</div>;
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content Outline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {txtBlocks.map(b => {
              const cleanText = b.content.replace(/<[^>]*>/g, '').substring(0, 90);
              if (b.type.startsWith('h')) {
                return <div key={b.id} style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{cleanText}</div>;
              }
              if (b.type === 'todo') {
                return (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <input type="checkbox" checked={!!b.properties?.checked} readOnly style={{ pointerEvents: 'none' }} />
                    <span style={{ textDecoration: b.properties?.checked ? 'line-through' : 'none', opacity: b.properties?.checked ? 0.6 : 1 }}>{cleanText}</span>
                  </div>
                );
              }
              return (
                <div key={b.id} style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {cleanText}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        {/* Cover view */}
        <div 
          style={{ 
            height: '100px', 
            background: page.cover 
              ? (page.cover.startsWith('linear-gradient') ? page.cover : `url("${page.cover}") center/cover no-repeat`)
              : 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
            position: 'relative'
          }}
        >
          <span 
            style={{ 
              position: 'absolute', 
              bottom: '-16px', 
              left: '16px', 
              fontSize: '28px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '12px', 
              padding: '4px 6px', 
              lineHeight: 1,
              border: '2px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {page.icon || '📄'}
          </span>
        </div>

        {/* Content body */}
        <div style={{ padding: '24px 16px 16px', flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px' }}>{page.title || 'Untitled'}</h3>
          
          {/* Metadata Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '8px 0', margin: '6px 0 10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-placeholder)' }}>Type</span>
              <span style={{ fontWeight: 600 }}>{page.isDatabase ? 'Database Page' : 'Document Page'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-placeholder)' }}>Created</span>
              <span style={{ fontWeight: 600 }}>{page.createdTime || 'June 18, 2026'}</span>
            </div>
            {page.tags && page.tags.length > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-placeholder)' }}>Tags</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {page.tags.map(t => (
                    <span key={t} style={{ background: 'var(--accent-light)', color: 'var(--accent-color)', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Block preview outlines */}
          <div style={{ flexGrow: 1 }}>
            {renderBlocksOutline()}
          </div>
          
          <button 
            className="cover-btn"
            onClick={() => {
              setActivePageId(page.id);
              setSearchOpen(false);
            }}
            style={{ width: '100%', padding: '8px', justifyContent: 'center', marginTop: '14px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Open Document ↗
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
      <div 
        className="modal-content search-modal-container" 
        onClick={(e) => e.stopPropagation()} 
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: previewCollapsed ? '580px' : '880px',
          maxWidth: '95vw',
          height: '500px',
          padding: 0,
          overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-2xl)'
        }}
      >
        {/* Left Search results list */}
        <div style={{ width: previewCollapsed ? '100%' : '56%', display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Top Search bar input */}
          <div className="search-input-wrapper" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <Search size={18} style={{ color: 'var(--text-placeholder)' }} />
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search or ask a question in AOT..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            />
            
            {/* Split screen preview toggle */}
            <button 
              onClick={() => setPreviewCollapsed(!previewCollapsed)} 
              style={{ border: 'none', background: 'transparent', padding: '6px', cursor: 'pointer', borderRadius: '6px', color: previewCollapsed ? 'var(--text-placeholder)' : 'var(--accent-color)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              title="Toggle preview side panel"
            >
              <Sidebar size={18} />
            </button>

            <button 
              className="hover-bg" 
              style={{ border: 'none', background: 'transparent', padding: '4px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }} 
              onClick={() => setSearchOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Filters List */}
          <div style={{ display: 'flex', gap: '8px', padding: '10px 18px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', backgroundColor: 'var(--bg-secondary)' }}>
            <button 
              onClick={() => { setTitleOnly(!titleOnly); setSelectedIndex(0); }}
              style={{ 
                fontSize: '11px', 
                padding: '3px 8px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                border: titleOnly ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                background: titleOnly ? 'var(--accent-light)' : 'var(--bg-primary)',
                color: titleOnly ? 'var(--accent-color)' : 'var(--text-muted)',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              Aa Title only
            </button>
            <button 
              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Created by ▾
            </button>
            <button 
              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              In ▾
            </button>
            <button 
              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              + Filter
            </button>
          </div>

          {/* Results scrolling list */}
          <div className="search-results-list" style={{ flexGrow: 1, padding: '8px', overflowY: 'auto' }}>
            {results.map((r, idx) => (
              <div
                key={`search-r-${r.id}-${idx}`}
                className={`search-result-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  setActivePageId(r.id);
                  setSearchOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.1s ease', background: idx === selectedIndex ? 'var(--accent-light)' : 'transparent' }}
              >
                <span style={{ fontSize: '18px', width: '22px', textAlign: 'center' }}>{r.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span className="search-result-title" style={{ color: idx === selectedIndex ? 'var(--accent-color)' : 'var(--text-primary)', fontWeight: 500 }}>{r.title}</span>
                  <span className="search-result-snippet" style={{ color: 'var(--text-placeholder)' }}>{r.snippet}</span>
                </div>
                <ChevronRight size={14} style={{ opacity: idx === selectedIndex ? 0.8 : 0.2, color: idx === selectedIndex ? 'var(--accent-color)' : 'var(--text-placeholder)' }} />
              </div>
            ))}
            {results.length === 0 && (
              <div className="search-result-empty" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-placeholder)', fontStyle: 'italic', fontSize: '13px' }}>
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>

        {/* Right Collapsible Page Preview Panel */}
        {!previewCollapsed && (
          <div className="search-right-preview" style={{ width: '44%', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', borderLeft: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', boxSizing: 'border-box' }}>
            {renderPagePreview(hoveredPage)}
          </div>
        )}
      </div>
    </div>
  );
};
