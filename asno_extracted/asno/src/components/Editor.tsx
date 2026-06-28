import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { BlockRenderer } from './BlockRenderer';
import { Block, Page } from '../types';
import HomePage from './HomePage';
import { 
  Star, 
  Share2, 
  Menu, 
  Smile, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2, 
  Link,
  ChevronRight,
  Database,
  Palette,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';

export const Editor: React.FC = () => {
  const {
    pages,
    activePageId,
    updatePage,
    addBlock,
    settings,
    updateSettings,
    fullPageBlockId,
    setFullPageBlockId,
    customAlert,
    customPrompt
  } = useApp();

  const activePage = pages.find((p) => p.id === activePageId);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor main content scroll position for breadcrumbs navbar transparency
  useEffect(() => {
    const mainEl = document.querySelector('.main-content');
    const handleScroll = () => {
      if (mainEl) {
        setIsScrolled(mainEl.scrollTop > 10);
      }
    };
    
    // Reset state on page switch
    setIsScrolled(false);
    
    mainEl?.addEventListener('scroll', handleScroll);
    return () => mainEl?.removeEventListener('scroll', handleScroll);
  }, [activePageId]);

  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title on page switch if it's untitled
  useEffect(() => {
    if (activePage && activePage.title === 'Untitled Page' && titleRef.current) {
      titleRef.current.select();
    }
  }, [activePageId]);

  // Handle Full Page Block Mode
  let fullPageBlock: Block | undefined;
  if (fullPageBlockId) {
    pages.forEach(p => {
      const findBlock = (blocks: Block[]) => {
        blocks.forEach(b => {
          if (b.id === fullPageBlockId) fullPageBlock = b;
          if (b.children) findBlock(b.children);
        });
      };
      findBlock(p.content);
      p.dbRows?.forEach(r => findBlock(r.content));
    });
  }

  if (fullPageBlockId && fullPageBlock && activePage) {
    return (
      <div className="main-content" style={{ padding: '24px 54px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <button 
            className="cover-btn" 
            onClick={() => setFullPageBlockId(null)}
            style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Back to page
          </button>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Fullscreen Block Mode</span>
        </div>
        <div className="editor-container full-width">
          <BlockRenderer block={fullPageBlock} index={0} pageId={activePage.id} />
        </div>
      </div>
    );
  }

  if (!activePage) {
    return <HomePage />;
  }

  // Cover presets
  const coverPresets = [
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&q=80'
  ];

  // Emojis preset
  const emojiGroups = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗',
    '🚀', '🎯', '💡', '🔥', '✨', '⚡', '🧠', '💼', '💻', '🎨', '📝', '📚', '🎒', '🌱', '🌍', '🏠', '🔑', '⏰',
    '🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦅', '🦆', '🦖', '🐳', '🐬',
    '🍎', '🍒', '🍕', '🍔', '🍟', '🍦', '🍩', '🍪', '🍫', '🍿', '☕', '🍺', '🍷', '🥤', '⚽', '🏀', '🎮', '🚗'
  ];

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    const crumbs: Page[] = [];
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

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus first block, if page has content
      if (activePage.content.length > 0) {
        const firstBlockEl = document.querySelector(`[data-block-id="${activePage.content[0].id}"]`) as HTMLElement;
        firstBlockEl?.focus();
      } else {
        // Create first block
        addBlock(activePage.id, 'text');
      }
    }
  };

  const copyShareLink = () => {
    const dummyUrl = `${window.location.origin}/page/${activePage.id}`;
    navigator.clipboard.writeText(dummyUrl);
    customAlert('Mock share link copied to clipboard! 🔗');
    setShareOpen(false);
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="editor-view">
      {/* Breadcrumbs Nav */}
      <div className={`breadcrumbs-nav ${activePage.cover ? 'has-cover' : ''} ${isScrolled ? 'scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <span className="breadcrumb-item" onClick={() => updatePage(crumb.id, {})}>
                  {crumb.icon && <span style={{ marginRight: '4px' }}>{crumb.icon}</span>}
                  {crumb.title || 'Untitled'}
                </span>
                {idx < crumbs.length - 1 && <ChevronRight size={12} style={{ color: 'var(--text-placeholder)' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className={`editor-nav-btn ${activePage.isFavorite ? 'favorite' : ''}`}
            onClick={() => updatePage(activePage.id, { isFavorite: !activePage.isFavorite })}
            title="Pin to Favorites"
          >
            <Star size={16} style={{ fill: activePage.isFavorite ? 'var(--warning-color)' : 'none', color: activePage.isFavorite ? 'var(--warning-color)' : 'inherit' }} />
          </button>
          
          <button 
            className="editor-nav-btn"
            onClick={() => setShareOpen(!shareOpen)}
            title="Share page"
          >
            <Share2 size={16} />
          </button>
          
          {shareOpen && (
            <div className="share-dropdown-panel glass">
              <h4>Share this workspace</h4>
              <p>Publish or export access to this block page.</p>
              <button className="share-copy-btn hover-bg" onClick={copyShareLink}>
                <Link size={14} />
                <span>Copy invite link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page Cover */}
      {activePage.cover ? (
        <div 
          className="page-cover-wrapper" 
          style={{ 
            background: activePage.cover.startsWith('linear-gradient') 
              ? activePage.cover 
              : `url("${activePage.cover}") center/cover no-repeat`
          }}
        >
          <div className="page-cover-overlay">
            <button className="cover-btn" onClick={() => setCoverPickerOpen(!coverPickerOpen)}>
              <ImageIcon size={13} />
              Change Cover
            </button>
            <button 
              className="cover-btn" 
              style={{ marginLeft: '8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white' }}
              onClick={() => updatePage(activePage.id, { cover: undefined })}
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>

          {coverPickerOpen && (
            <div className="cover-picker-dropdown glass" onClick={(e) => e.stopPropagation()}>
              <div className="cover-picker-header">
                <span>Select a cover background</span>
                <button className="close-x" onClick={() => setCoverPickerOpen(false)}>&times;</button>
              </div>
              <div className="cover-picker-grid">
                {coverPresets.map((preset, idx) => (
                  <div 
                    key={`cover-p-${idx}`} 
                    className="cover-preset-thumb"
                    style={{ 
                      background: preset.startsWith('linear-gradient') 
                        ? preset 
                        : `url("${preset}") center/cover no-repeat`
                    }}
                    onClick={() => {
                      updatePage(activePage.id, { cover: preset });
                      setCoverPickerOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="editor-cover-placeholder" style={{ height: '48px' }} />
      )}

      {/* Editor Main Container */}
      <div className={`editor-container ${activePage.isDatabase ? 'full-width' : ''} ${activePage.cover ? 'has-cover' : 'no-cover'}`}>
        
        {/* Persistent Layout Actions Row (Notion-style inline actions row above title) */}
        <div className="page-header-actions-bar" style={{ display: 'flex', gap: '8px', marginBottom: '8px', opacity: 0.8 }}>
          {!activePage.icon && (
            <button 
              className="editor-add-header-action" 
              onClick={() => updatePage(activePage.id, { icon: emojiGroups[Math.floor(Math.random() * emojiGroups.length)] })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-placeholder)' }}
            >
              <Smile size={14} />
              Add icon
            </button>
          )}
          {!activePage.cover && (
            <button 
              className="editor-add-header-action" 
              onClick={() => updatePage(activePage.id, { cover: coverPresets[0] })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-placeholder)' }}
            >
              <ImageIcon size={14} />
              Add cover
            </button>
          )}
          <button 
            className="editor-add-header-action" 
            onClick={() => {
              updateSettings({ font: settings.font === 'inter' ? 'serif' : settings.font === 'serif' ? 'mono' : 'inter' });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-placeholder)' }}
          >
            <Palette size={14} />
            Customize layout
          </button>
        </div>

        {/* Page Icon (Emoji) */}
        {activePage.icon && (
          <div className="page-icon-wrapper">
            <span className="page-icon-emoji" onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}>
              {activePage.icon}
            </span>
            {emojiPickerOpen && (
              <div className="emoji-picker-dropdown glass" onClick={(e) => e.stopPropagation()}>
                <div className="emoji-picker-header">
                  <span>Pick page icon</span>
                  <button className="close-x" onClick={() => setEmojiPickerOpen(false)}>&times;</button>
                </div>
                <div className="emoji-picker-grid">
                  {emojiGroups.map((emoji) => (
                    <button 
                      key={`emoji-${emoji}`} 
                      className="emoji-picker-btn hover-bg"
                      onClick={() => {
                        updatePage(activePage.id, { icon: emoji });
                        setEmojiPickerOpen(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button 
                    className="emoji-picker-btn remove hover-bg"
                    style={{ gridColumn: 'span 6', fontSize: '12px' }}
                    onClick={() => {
                      updatePage(activePage.id, { icon: undefined });
                      setEmojiPickerOpen(false);
                    }}
                  >
                    Remove Icon
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={titleRef}
          type="text"
          className="page-title-input"
          value={activePage.title}
          onChange={(e) => updatePage(activePage.id, { title: e.target.value })}
          placeholder="Untitled Page"
          onKeyDown={handleTitleKeyDown}
        />

        {/* Page properties table (Date, Tags, etc.) */}
        {!activePage.isDatabase && (
          <div className="page-properties-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', margin: '16px 0 24px', maxWidth: '450px' }}>
            
            {/* Created Date Property */}
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', minHeight: '28px' }}>
              <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-placeholder)' }}>
                <Calendar size={14} />
                <span>Date</span>
              </div>
              <div style={{ flexGrow: 1, color: 'var(--text-primary)', fontWeight: 500 }}>
                {activePage.createdTime || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* Tags Property */}
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', minHeight: '28px' }}>
              <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-placeholder)' }}>
                <FileText size={14} />
                <span>Tags</span>
              </div>
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {activePage.tags && activePage.tags.length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {activePage.tags.map(t => (
                      <span key={t} style={{ background: 'var(--accent-light)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--accent-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {t}
                        <button onClick={() => {
                          const filtered = activePage.tags?.filter(x => x !== t) || [];
                          updatePage(activePage.id, { tags: filtered });
                        }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', alignItems: 'center', fontSize: '12px' }}>&times;</button>
                      </span>
                    ))}
                    <button onClick={async () => {
                      const t = await customPrompt('Enter a new tag name:');
                      if (t) {
                        const existing = activePage.tags || [];
                        updatePage(activePage.id, { tags: [...existing, t] });
                      }
                    }} style={{ background: 'transparent', border: '1px dashed var(--border-color)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>+ Add</button>
                  </div>
                ) : (
                  <span 
                    onClick={async () => {
                      const t = await customPrompt('Enter tags separated by commas:');
                      if (t) {
                        const parsed = t.split(',').map(x => x.trim()).filter(Boolean);
                        updatePage(activePage.id, { tags: parsed });
                      }
                    }} 
                    style={{ color: 'var(--text-placeholder)', fontStyle: 'italic', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Empty
                  </span>
                )}
              </div>
            </div>

            {/* Custom Properties rendered dynamically */}
            {activePage.customProperties && Object.entries(activePage.customProperties).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', minHeight: '28px' }}>
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-placeholder)', textTransform: 'capitalize' }}>
                  <FileText size={14} />
                  <span>{key}</span>
                </div>
                <input 
                  type="text" 
                  value={val}
                  onChange={(e) => {
                    const custom = { ...(activePage.customProperties || {}), [key]: e.target.value };
                    updatePage(activePage.id, { customProperties: custom });
                  }}
                  style={{ flexGrow: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px dashed transparent' }}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--border-color)'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                  placeholder="Empty"
                />
                <button onClick={() => {
                  const custom = { ...(activePage.customProperties || {}) };
                  delete custom[key];
                  updatePage(activePage.id, { customProperties: custom });
                }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger-color)', opacity: 0.3 }} className="hover-opacity-100">&times;</button>
              </div>
            ))}

            {/* Add Custom Property Trigger Button */}
            <button 
              onClick={async () => {
                const key = await customPrompt('Enter new property label (e.g. Author, Project):');
                if (key) {
                  const custom = { ...(activePage.customProperties || {}), [key.toLowerCase()]: '' };
                  updatePage(activePage.id, { customProperties: custom });
                }
              }}
              style={{ 
                alignSelf: 'flex-start',
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-placeholder)', 
                fontSize: '12px', 
                cursor: 'pointer',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              + Add a property
            </button>
          </div>
        )}

        {/* Page comments thread (Moved below properties, before content blocks) */}
        {!activePage.isDatabase && (
          <div 
            className="page-comments-section"
            style={{ 
              padding: '4px 0 16px 0',
              borderBottom: '1px solid var(--border-color)', 
              width: '100%',
              maxWidth: '450px',
              boxSizing: 'border-box',
              marginBottom: '20px'
            }}
          >
            {/* Existing Comments list */}
            {activePage.comments && activePage.comments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {activePage.comments.map(c => {
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-color)', whiteSpace: 'nowrap' }}>{c.author}:</span>
                      <span style={{ flexGrow: 1, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{c.text}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-placeholder)', whiteSpace: 'nowrap' }}>
                        {new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => {
                          const filtered = activePage.comments?.filter(x => x.id !== c.id) || [];
                          updatePage(activePage.id, { comments: filtered });
                        }} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger-color)', opacity: 0.3, padding: '0 4px', fontSize: '12px' }}
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add comment form - borderless line comment */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = (form.elements.namedItem('commentInput') as HTMLInputElement);
                const txt = input.value;
                if (!txt.trim()) return;
                const existing = activePage.comments || [];
                const newComment = {
                  id: Math.random().toString(),
                  author: 'User',
                  text: txt,
                  timestamp: Date.now()
                };
                updatePage(activePage.id, { comments: [...existing, newComment] });
                input.value = '';
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}
            >
              <span style={{ color: 'var(--text-placeholder)', flexShrink: 0 }}>💬</span>
              <input
                name="commentInput"
                type="text"
                placeholder="Add a comment..."
                style={{ 
                  flexGrow: 1, 
                  border: 'none', 
                  background: 'transparent', 
                  color: 'var(--text-primary)', 
                  outline: 'none',
                  fontSize: '13px', 
                  fontFamily: 'inherit'
                }}
              />
            </form>
          </div>
        )}

        {/* Nested Blocks List */}
        <div className="editor-blocks-list">
          {activePage.content.map((block, idx) => (
            <BlockRenderer 
              key={block.id}
              block={block}
              index={idx}
              pageId={activePage.id}
            />
          ))}
          
          {/* Bottom Click Area to add text block if list is empty or clicked below */}
          <div 
            className="editor-bottom-focus-area"
            onClick={() => {
              if (activePage.content.length === 0 || activePage.content[activePage.content.length - 1].content !== '') {
                addBlock(activePage.id, 'text');
              } else {
                // Focus last block
                const lastId = activePage.content[activePage.content.length - 1].id;
                const blockEl = document.querySelector(`[data-block-id="${lastId}"]`) as HTMLElement;
                blockEl?.focus();
              }
            }}
          />
        </div>

      </div>

      <style>{`
        .editor-nav-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .editor-nav-btn:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .share-dropdown-panel {
          position: absolute;
          top: 54px;
          right: 24px;
          width: 250px;
          padding: 14px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 50;
        }
        .share-dropdown-panel h4 {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .share-dropdown-panel p {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .share-copy-btn {
          width: 100%;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
        }
        .editor-cover-placeholder {
          height: 48px;
          position: relative;
        }
        .editor-cover-actions {
          position: absolute;
          left: 54px;
          bottom: -20px;
          display: flex;
          gap: 12px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .editor-cover-placeholder:hover .editor-cover-actions,
        .page-icon-wrapper:hover ~ .editor-cover-placeholder .editor-cover-actions,
        .editor-container:hover .editor-cover-actions {
          opacity: 1;
        }
        .editor-add-header-action {
          background: transparent;
          border: none;
          color: var(--text-placeholder);
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: var(--border-radius-sm);
        }
        .editor-add-header-action:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .cover-picker-dropdown {
          position: absolute;
          top: 70px;
          right: 54px;
          width: 300px;
          padding: 12px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 60;
        }
        .cover-picker-header, .emoji-picker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 10px;
        }
        .close-x {
          background: transparent;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: var(--text-muted);
        }
        .cover-picker-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .cover-preset-thumb {
          aspect-ratio: 1.8;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          background-size: cover;
          background-position: center;
          border: 1px solid var(--border-color);
          transition: transform 0.15s ease;
        }
        .cover-preset-thumb:hover {
          transform: scale(1.05);
        }
        .emoji-picker-dropdown {
          position: absolute;
          top: 84px;
          left: 0;
          width: 280px;
          padding: 12px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 60;
        }
        .emoji-picker-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
        }
        .emoji-picker-btn {
          font-size: 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 6px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .emoji-picker-btn.remove {
          border: 1px solid var(--border-color);
          font-weight: 500;
        }
        .editor-blocks-list {
          display: flex;
          flex-direction: column;
        }
        .editor-bottom-focus-area {
          flex-grow: 1;
          min-height: 120px;
          cursor: text;
        }
      `}</style>
    </div>
  );
};
