import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Automation, Block, Page } from '../types';
import { X, PlaySquare, Plus, Trash2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export const AutomationModal: React.FC = () => {
  const {
    pages,
    automations,
    addAutomation,
    deleteAutomation,
    updateAutomation,
    automationOpen,
    setAutomationOpen
  } = useApp();

  const [ruleName, setRuleName] = useState('');
  
  // Trigger config states
  const [triggerType, setTriggerType] = useState<Automation['trigger']['type']>('block-change');
  const [sourcePageId, setSourcePageId] = useState('');
  const [sourceBlockId, setSourceBlockId] = useState('');
  const [sourceBlockType, setSourceBlockType] = useState<Block['type']>('text');

  // Action config states
  const [actionType, setActionType] = useState<Automation['action']['type']>('notify');
  const [targetPageId, setTargetPageId] = useState('');
  const [targetBlockId, setTargetBlockId] = useState('');
  const [targetBlockType, setTargetBlockType] = useState<Block['type']>('text');
  const [notifyMessage, setNotifyMessage] = useState('Data synced successfully!');

  if (!automationOpen) return null;

  // Flatten all blocks in a page to let user select source/target blocks easily
  const getAllBlocksInPage = (pageId: string): { id: string; type: string; snippet: string }[] => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return [];

    const list: { id: string; type: string; snippet: string }[] = [];
    const traverse = (blocks: Block[]) => {
      blocks.forEach(b => {
        const text = b.content.replace(/<[^>]*>/g, '').substring(0, 30) || `${b.type} block`;
        list.push({ id: b.id, type: b.type, snippet: `[${b.type.toUpperCase()}] ${text}` });
        if (b.children) traverse(b.children);
      });
    };
    traverse(page.content);
    page.dbRows?.forEach(r => traverse(r.content));
    return list;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    addAutomation({
      name: ruleName,
      enabled: true,
      trigger: {
        type: triggerType,
        sourcePageId: sourcePageId || undefined,
        sourceBlockId: sourceBlockId || undefined,
        sourceBlockType: sourceBlockType || undefined
      },
      action: {
        type: actionType,
        targetPageId: targetPageId || undefined,
        targetBlockId: targetBlockId || undefined,
        targetBlockType: targetBlockType || undefined,
        config: actionType === 'notify' ? { message: notifyMessage } : undefined
      }
    });

    // Reset inputs
    setRuleName('');
    setNotifyMessage('Data synced successfully!');
    setSourcePageId('');
    setSourceBlockId('');
    setTargetPageId('');
    setTargetBlockId('');
  };

  const sourceBlocksList = sourcePageId ? getAllBlocksInPage(sourcePageId) : [];
  const targetBlocksList = targetPageId ? getAllBlocksInPage(targetPageId) : [];

  return (
    <div className="modal-overlay" onClick={() => setAutomationOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <h3 className="heading-font" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-color)' }} />
            Automations & Workflow Sync
          </h3>
          <button className="hover-bg" style={{ border: 'none', background: 'transparent', padding: '6px', cursor: 'pointer', borderRadius: '4px' }} onClick={() => setAutomationOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', overflowY: 'auto', flexGrow: 1, paddingRight: '4px' }}>
          
          {/* Rules Builder Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderRight: '1px solid var(--border-color)', paddingRight: '20px' }}>
            <h4 className="heading-font" style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Create Sync Rule</h4>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>RULE NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Sync Survey to Chart, Add task alert"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  required
                  className="search-input"
                  style={{ border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: 'var(--border-radius-sm)', fontSize: '13px' }}
                />
              </div>

              {/* TRIGGER SECTOR */}
              <div style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-color)' }}>WHEN (TRIGGER)</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Trigger Event</label>
                    <select
                      value={triggerType}
                      onChange={e => setTriggerType(e.target.value as any)}
                      style={{ padding: '4px', fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="block-change">Text/Block Edited</option>
                      <option value="row-add">Database Row Added</option>
                      <option value="form-submit">Form Submitted</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>On Page</label>
                    <select
                      value={sourcePageId}
                      onChange={e => setSourcePageId(e.target.value)}
                      style={{ padding: '4px', fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="">-- Any Page --</option>
                      {pages.map(p => (
                        <option key={`src-p-${p.id}`} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {triggerType === 'block-change' && sourcePageId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Specific Block</label>
                    <select
                      value={sourceBlockId}
                      onChange={e => setSourceBlockId(e.target.value)}
                      style={{ padding: '4px', fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="">-- Any Block --</option>
                      {sourceBlocksList.map(b => (
                        <option key={`src-b-${b.id}`} value={b.id}>{b.snippet}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ACTION SECTOR */}
              <div style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-color)' }}>THEN (ACTION)</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Action Type</label>
                    <select
                      value={actionType}
                      onChange={e => setActionType(e.target.value as any)}
                      style={{ padding: '4px', fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="notify">Alert Notification</option>
                      <option value="sync-to-chart">Sync data to Chart</option>
                      <option value="add-db-row">Add Database Row</option>
                      <option value="add-block">Add block to Page</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target Page</label>
                    <select
                      value={targetPageId}
                      onChange={e => setTargetPageId(e.target.value)}
                      style={{ padding: '4px', fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="">-- Current Page --</option>
                      {pages.map(p => (
                        <option key={`tgt-p-${p.id}`} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {actionType === 'notify' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Notification Message</label>
                    <input
                      type="text"
                      value={notifyMessage}
                      onChange={e => setNotifyMessage(e.target.value)}
                      className="search-input"
                      style={{ border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                )}

                {actionType === 'sync-to-chart' && targetPageId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target Chart Block</label>
                    <select
                      value={targetBlockId}
                      onChange={e => setTargetBlockId(e.target.value)}
                      style={{ padding: '4px', fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="">-- Select Chart Block --</option>
                      {targetBlocksList.filter(b => b.type === 'chart').map(b => (
                        <option key={`tgt-b-${b.id}`} value={b.id}>{b.snippet}</option>
                      ))}
                    </select>
                  </div>
                )}

                {actionType === 'add-block' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Block Type</label>
                    <select
                      value={targetBlockType}
                      onChange={e => setTargetBlockType(e.target.value as any)}
                      style={{ padding: '4px', fontSize: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      <option value="text">Paragraph Text</option>
                      <option value="todo">To-do Checkbox</option>
                      <option value="h2">Section Header H2</option>
                      <option value="quote">Callout Quote</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="cover-btn"
                style={{
                  background: 'var(--accent-color)',
                  color: '#fff',
                  fontWeight: 700,
                  justifyContent: 'center',
                  padding: '8px',
                  marginTop: '6px'
                }}
              >
                <Plus size={14} /> Add Automation
              </button>
            </form>
          </div>

          {/* Active Rules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 className="heading-font" style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Active Rules ({automations.length})</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
              {automations.map(auto => (
                <div
                  key={auto.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--border-color)',
                    background: auto.enabled ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: auto.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {auto.name}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                        onClick={() => updateAutomation(auto.id, { enabled: !auto.enabled })}
                      >
                        {auto.enabled ? (
                          <ToggleRight size={18} style={{ color: 'var(--accent-color)' }} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>
                      <button
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger-color)', padding: '2px' }}
                        onClick={() => deleteAutomation(auto.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    <div><strong>Trigger:</strong> {auto.trigger.type}</div>
                    <div><strong>Action:</strong> {auto.action.type}</div>
                  </div>
                </div>
              ))}

              {automations.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-placeholder)', fontStyle: 'italic', padding: '30px' }}>
                  No automation rules configured.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
