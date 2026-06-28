import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../AppContext';
import { BlockRenderer } from './BlockRenderer';
import { X, Calendar, CheckSquare, Hash, Link, Mail, Type, Maximize2, Phone, Plus, Trash2, Check } from 'lucide-react';
import { DatabaseProperty } from '../types';

interface ModalPeekProps {
  dbPageId: string;
  rowId: string;
  onClose: () => void;
}

export const ModalPeek: React.FC<ModalPeekProps> = ({ dbPageId, rowId, onClose }) => {
  const {
    pages,
    updateDatabaseRowCell,
    addBlock,
    updateDatabaseProperty
  } = useApp();

  const dbPage = pages.find((p) => p.id === dbPageId);
  const row = dbPage?.dbRows?.find((r) => r.id === rowId);

  // Popover State
  const [activePopover, setActivePopover] = useState<string | null>(null); // propertyId
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);

  if (!dbPage || !row) return null;

  const schema = dbPage.dbSchema || { properties: [] };
  const blocks = row.content || [];

  const titleProp = schema.properties[0];
  const titleVal = row.cells[titleProp?.id] || '';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (titleProp) {
      updateDatabaseRowCell(dbPage.id, row.id, titleProp.id, e.target.value);
    }
  };

  const getPropIcon = (type: string) => {
    switch (type) {
      case 'checkbox': return <CheckSquare size={13} style={{ color: 'var(--accent-color)' }} />;
      case 'number': return <Hash size={13} style={{ color: 'var(--text-placeholder)' }} />;
      case 'date': return <Calendar size={13} style={{ color: 'var(--warning-color)' }} />;
      case 'url': return <Link size={13} style={{ color: 'var(--info-color)' }} />;
      case 'email': return <Mail size={13} style={{ color: 'var(--success-color)' }} />;
      default: return <Type size={13} style={{ color: 'var(--text-placeholder)' }} />;
    }
  };

  const handleAddTagOption = (prop: DatabaseProperty, tagText: string) => {
    if (!tagText.trim()) return;
    const currentOptions = prop.options || [];
    const colorHex = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const newOption = {
      id: `opt-${Math.random().toString(36).substring(2, 9)}`,
      name: tagText,
      color: colorHex
    };
    updateDatabaseProperty(dbPage.id, prop.id, {
      options: [...currentOptions, newOption]
    });
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content peek-modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          background: 'var(--bg-primary)', 
          border: '1px solid var(--border-color)', 
          boxShadow: 'var(--shadow-lg)', 
          borderRadius: '12px',
          maxWidth: '820px',
          width: '90%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        
        {/* Header Actions */}
        <div className="modal-header peek-header" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', padding: '12px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Maximize2 size={13} />
            <span style={{ fontSize: '12px', fontWeight: 500 }}>Inside database: {dbPage.title}</span>
          </div>
          <button className="peek-close-btn hover-bg" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="peek-modal-body" style={{ padding: '32px 48px', overflowY: 'auto', flexGrow: 1 }}>
          {/* Title Input - Borderless */}
          <input 
            type="text" 
            className="peek-title-input"
            value={titleVal}
            onChange={handleTitleChange}
            placeholder="Untitled Item"
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'var(--font-title)' }}
          />

          {/* Properties Panel */}
          <div className="peek-properties-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {schema.properties.slice(1).map((prop) => {
              const val = row.cells[prop.id];
              const isSelect = prop.type === 'select' || prop.type === 'status';
              const isMulti = prop.type === 'multi-select';

              return (
                <div key={prop.id} className="peek-property-row" style={{ display: 'flex', alignItems: 'center', minHeight: '32px', position: 'relative' }}>
                  <div className="peek-property-label" style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', flexShrink: 0 }}>
                    {getPropIcon(prop.type)}
                    <span>{prop.name}</span>
                  </div>

                  <div className="peek-property-value" style={{ flexGrow: 1, position: 'relative' }}>
                    {/* Render fields as borderless values */}
                    {prop.type === 'checkbox' ? (
                      <input 
                        type="checkbox" 
                        checked={!!val} 
                        onChange={(e) => updateDatabaseRowCell(dbPage.id, row.id, prop.id, e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : isSelect ? (
                      <div>
                        <div 
                          onClick={() => { setActivePopover(activePopover === prop.id ? null : prop.id); setTagSearchQuery(''); }}
                          style={{
                            display: 'inline-flex',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: prop.options?.find(o => o.id === val)?.color || 'var(--bg-tertiary)',
                            color: val ? '#000' : 'var(--text-placeholder)',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          {prop.options?.find(o => o.id === val)?.name || 'Empty'}
                        </div>

                        {activePopover === prop.id && (
                          <>
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setActivePopover(null)} />
                            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, width: '220px', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', boxShadow: 'var(--shadow-lg)' }}>
                              <input 
                                type="text"
                                placeholder="Search or create option..."
                                value={tagSearchQuery}
                                onChange={e => setTagSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '6px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && tagSearchQuery.trim()) {
                                    handleAddTagOption(prop, tagSearchQuery);
                                    setTagSearchQuery('');
                                  }
                                }}
                              />
                              <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                                {prop.options?.filter(o => o.name.toLowerCase().includes(tagSearchQuery.toLowerCase())).map(o => (
                                  <button
                                    key={o.id}
                                    onClick={() => {
                                      updateDatabaseRowCell(dbPage.id, row.id, prop.id, o.id);
                                      setActivePopover(null);
                                    }}
                                    style={{ border: 'none', background: val === o.id ? 'var(--accent-light)' : 'transparent', width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '12px', textAlign: 'left' }}
                                  >
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: o.color }} />
                                    <span>{o.name}</span>
                                    {val === o.id && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--accent-color)' }} />}
                                  </button>
                                ))}
                              </div>
                              {tagSearchQuery.trim() && (
                                <button 
                                  onClick={() => {
                                    handleAddTagOption(prop, tagSearchQuery);
                                    setTagSearchQuery('');
                                  }}
                                  style={{ border: 'none', background: 'transparent', width: '100%', color: 'var(--accent-color)', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}
                                >
                                  + Create "{tagSearchQuery}"
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ) : isMulti ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                        {(Array.isArray(val) ? val : []).map(v => {
                          const opt = prop.options?.find(o => o.id === v);
                          return (
                            <span key={v} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: opt?.color || 'var(--bg-tertiary)', color: '#000', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              {opt?.name || v}
                              <button
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '10px', fontWeight: 700, padding: 0, color: '#666' }}
                                onClick={() => {
                                  const updated = (Array.isArray(val) ? val : []).filter(item => item !== v);
                                  updateDatabaseRowCell(dbPage.id, row.id, prop.id, updated);
                                }}
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })}
                        <button
                          onClick={() => { setActivePopover(activePopover === prop.id ? null : prop.id); setTagSearchQuery(''); }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '11px', color: 'var(--text-placeholder)', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}
                        >
                          + Add
                        </button>

                        {activePopover === prop.id && (
                          <>
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setActivePopover(null)} />
                            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, width: '220px', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', boxShadow: 'var(--shadow-lg)' }}>
                              <input 
                                type="text"
                                placeholder="Search or create tag..."
                                value={tagSearchQuery}
                                onChange={e => setTagSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '6px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && tagSearchQuery.trim()) {
                                    handleAddTagOption(prop, tagSearchQuery);
                                    setTagSearchQuery('');
                                  }
                                }}
                              />
                              <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                                {prop.options?.filter(o => o.name.toLowerCase().includes(tagSearchQuery.toLowerCase())).map(o => {
                                  const currentTags = Array.isArray(val) ? val : [];
                                  const isChecked = currentTags.includes(o.id);
                                  return (
                                    <button
                                      key={o.id}
                                      onClick={() => {
                                        const nextTags = isChecked ? currentTags.filter(t => t !== o.id) : [...currentTags, o.id];
                                        updateDatabaseRowCell(dbPage.id, row.id, prop.id, nextTags);
                                      }}
                                      style={{ border: 'none', background: isChecked ? 'var(--accent-light)' : 'transparent', width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '12px', textAlign: 'left' }}
                                    >
                                      <input type="checkbox" checked={isChecked} readOnly style={{ cursor: 'pointer' }} />
                                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: o.color }} />
                                      <span>{o.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {tagSearchQuery.trim() && (
                                <button 
                                  onClick={() => {
                                    handleAddTagOption(prop, tagSearchQuery);
                                    setTagSearchQuery('');
                                  }}
                                  style={{ border: 'none', background: 'transparent', width: '100%', color: 'var(--accent-color)', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}
                                >
                                  + Create tag "{tagSearchQuery}"
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ) : prop.type === 'date' ? (
                      <div>
                        <div 
                          onClick={() => setActivePopover(activePopover === prop.id ? null : prop.id)}
                          style={{ cursor: 'pointer', fontSize: '13px', color: val ? 'var(--text-primary)' : 'var(--text-placeholder)', padding: '4px 0' }}
                        >
                          {val || 'Empty Date'}
                        </div>

                        {activePopover === prop.id && (
                          <>
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setActivePopover(null)} />
                            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', boxShadow: 'var(--shadow-lg)' }}>
                              <input 
                                type="date"
                                value={val || ''}
                                onChange={e => {
                                  updateDatabaseRowCell(dbPage.id, row.id, prop.id, e.target.value);
                                  setActivePopover(null);
                                }}
                                style={{ border: '1px solid var(--border-color)', padding: '6px', fontSize: '12px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <input 
                        type={prop.type === 'number' ? 'number' : 'text'}
                        value={val || ''}
                        className="peek-input-cell"
                        placeholder="Empty"
                        onChange={(e) => updateDatabaseRowCell(dbPage.id, row.id, prop.id, e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-primary)', fontSize: '13px', padding: '4px 0' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Row Color */}
            <div className="peek-property-row" style={{ display: 'flex', alignItems: 'center', minHeight: '32px', position: 'relative' }}>
              <div className="peek-property-label" style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <span>🎨 Card Color</span>
              </div>
              <div className="peek-property-value" style={{ flexGrow: 1, position: 'relative' }}>
                <div 
                  onClick={() => setColorPopoverOpen(!colorPopoverOpen)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: row.cells['row-color'] || 'var(--bg-tertiary)',
                    color: row.cells['row-color'] ? '#000' : 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: row.cells['row-color'] || 'transparent',
                    border: '1px solid rgba(0,0,0,0.15)',
                    display: 'inline-block'
                  }} />
                  <span style={{ marginLeft: '4px' }}>{row.cells['row-color'] ? 'Custom Card Color' : 'Default (Translucent)'}</span>
                </div>

                {colorPopoverOpen && (
                  <>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setColorPopoverOpen(false)} />
                    <div className="glass" style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      zIndex: 999, 
                      width: '240px', 
                      padding: '10px', 
                      background: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      marginTop: '4px', 
                      boxShadow: 'var(--shadow-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-placeholder)', textTransform: 'uppercase' }}>Select Palette Color</div>
                      
                      {/* Presets Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {[
                          { value: '', label: 'Default', bg: 'var(--bg-tertiary)' },
                          { value: '#ffb3ba', label: 'Red', bg: '#ffb3ba' },
                          { value: '#ffdfba', label: 'Orange', bg: '#ffdfba' },
                          { value: '#ffffba', label: 'Yellow', bg: '#ffffba' },
                          { value: '#baffc9', label: 'Green', bg: '#baffc9' },
                          { value: '#bae1ff', label: 'Blue', bg: '#bae1ff' },
                          { value: '#e8b4fd', label: 'Purple', bg: '#e8b4fd' },
                          { value: '#ffc6ff', label: 'Pink', bg: '#ffc6ff' },
                          { value: '#caffbf', label: 'Mint', bg: '#caffbf' },
                          { value: '#9bf6ff', label: 'Sky', bg: '#9bf6ff' },
                          { value: '#a0c4ff', label: 'Indigo', bg: '#a0c4ff' },
                          { value: '#ffadad', label: 'Coral', bg: '#ffadad' },
                        ].map(c => (
                          <button
                            key={c.value}
                            onClick={() => {
                              updateDatabaseRowCell(dbPage.id, row.id, 'row-color', c.value);
                              setColorPopoverOpen(false);
                            }}
                            title={c.label}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: c.bg,
                              border: row.cells['row-color'] === c.value ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {row.cells['row-color'] === c.value && <Check size={12} style={{ color: c.value ? '#000' : 'var(--text-primary)' }} />}
                          </button>
                        ))}
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                      {/* Custom Color Input */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>Hex / Picker:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="text"
                            value={row.cells['row-color'] || '#ffffff'}
                            onChange={e => updateDatabaseRowCell(dbPage.id, row.id, 'row-color', e.target.value)}
                            style={{ 
                              width: '65px', 
                              padding: '2px 4px', 
                              fontSize: '10px', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              textAlign: 'center',
                              outline: 'none'
                            }}
                          />
                          <label style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '4px', 
                            border: '1px solid var(--border-color)', 
                            background: row.cells['row-color'] || '#ffffff', 
                            cursor: 'pointer',
                            display: 'block',
                            position: 'relative'
                          }}>
                            <input 
                              type="color" 
                              value={row.cells['row-color'] || '#ffffff'}
                              onChange={e => updateDatabaseRowCell(dbPage.id, row.id, 'row-color', e.target.value)}
                              style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

          {/* Sub Blocks Area */}
          <div className="peek-document-canvas">
            <h4 className="heading-font" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Notes / Sub-Blocks
            </h4>
            
            <div className="peek-blocks-list" style={{ display: 'flex', flexDirection: 'column' }}>
              {blocks.map((block, idx) => (
                <BlockRenderer 
                  key={block.id}
                  block={block}
                  index={idx}
                  pageId={row.id}
                />
              ))}

              <div 
                className="editor-bottom-focus-area"
                style={{ minHeight: '80px', cursor: 'text' }}
                onClick={() => {
                  if (blocks.length === 0 || blocks[blocks.length - 1].content !== '') {
                    addBlock(row.id, 'text');
                  } else {
                    const lastId = blocks[blocks.length - 1].id;
                    const blockEl = document.querySelector(`[data-block-id="${lastId}"]`) as HTMLElement;
                    blockEl?.focus();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
