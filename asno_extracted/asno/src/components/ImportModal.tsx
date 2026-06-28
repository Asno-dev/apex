import React, { useState } from 'react';
import { useApp, generateId } from '../AppContext';
import { Page, Block, DatabaseRow, DatabaseProperty } from '../types';
import { X, Upload, FileText, Check } from 'lucide-react';

export const ImportModal: React.FC = () => {
  const { importOpen, setImportOpen, pages, setBlocks, addPage, updatePage, importWorkspace, customAlert } = useApp();
  const [inputText, setInputText] = useState('');
  const [importType, setImportType] = useState<'csv' | 'markdown' | 'html' | 'json'>('csv');
  const [successMsg, setSuccessMsg] = useState('');

  if (!importOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processImport(text, file.name);
    };

    if (file.name.endsWith('.json')) {
      setImportType('json');
    } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      setImportType('markdown');
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      setImportType('html');
    } else {
      setImportType('csv');
    }

    reader.readAsText(file);
  };

  const processImport = async (text: string, sourceName: string = 'Imported File') => {
    if (!text.trim()) return;

    try {
      if (importType === 'json') {
        const success = importWorkspace(text);
        if (success) {
          triggerSuccess('Workspace backup restored successfully!');
        } else {
          await customAlert('Invalid JSON workspace format', 'Import Failed');
        }
      } else if (importType === 'csv') {
        // Parse CSV
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length === 0) return;

        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
        const rowData = lines.slice(1).map(line => {
          // simple CSV split, not handling nested commas for simplicity
          return line.split(',').map(cell => cell.replace(/^["']|["']$/g, '').trim());
        });

        // 1. Create a database page
        const dbPageId = addPage(null, true);
        
        // 2. Set up Schema properties
        const properties: DatabaseProperty[] = headers.map((header, idx) => {
          const isTitle = idx === 0;
          return {
            id: isTitle ? 'prop-name' : `prop-${generateId()}`,
            name: header,
            type: 'text'
          };
        });

        // 3. Create Database Rows
        const dbRows: DatabaseRow[] = rowData.map(row => {
          const cells: Record<string, any> = {};
          properties.forEach((prop, idx) => {
            cells[prop.id] = row[idx] || '';
          });

          return {
            id: `row-${generateId()}`,
            cells,
            content: [{ id: generateId(), type: 'text', content: 'Sub notes...' }]
          };
        });

        // 4. Update the page
        updatePage(dbPageId, {
          title: sourceName.replace(/\.[^/.]+$/, "") || 'Imported CSV Database',
          dbSchema: { properties },
          dbRows,
          dbViews: [
            {
              id: `view-${generateId()}`,
              name: 'Table View',
              type: 'table',
              visibleProperties: properties.slice(1).map(p => p.id)
            }
          ]
        });

        triggerSuccess(`Database "${sourceName}" imported successfully with ${dbRows.length} items!`);
      } else if (importType === 'markdown') {
        // Parse Markdown
        const lines = text.split('\n');
        const blocks: Block[] = [];

        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;

          let block: Block = { id: generateId(), type: 'text', content: trimmed };

          if (trimmed.startsWith('# ')) {
            block = { id: generateId(), type: 'h1', content: trimmed.substring(2) };
          } else if (trimmed.startsWith('## ')) {
            block = { id: generateId(), type: 'h2', content: trimmed.substring(3) };
          } else if (trimmed.startsWith('### ')) {
            block = { id: generateId(), type: 'h3', content: trimmed.substring(4) };
          } else if (trimmed.startsWith('#### ')) {
            block = { id: generateId(), type: 'h4', content: trimmed.substring(5) };
          } else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('* [ ]')) {
            block = { id: generateId(), type: 'todo', content: trimmed.substring(5).trim(), properties: { checked: false } };
          } else if (trimmed.startsWith('- [x]') || trimmed.startsWith('* [x]')) {
            block = { id: generateId(), type: 'todo', content: trimmed.substring(5).trim(), properties: { checked: true } };
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            block = { id: generateId(), type: 'bullet', content: trimmed.substring(2) };
          } else if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)/);
            block = { id: generateId(), type: 'number', content: match ? match[2] : trimmed };
          } else if (trimmed.startsWith('> ')) {
            block = { id: generateId(), type: 'quote', content: trimmed.substring(2) };
          }

          blocks.push(block);
        });

        if (blocks.length === 0) {
          blocks.push({ id: generateId(), type: 'text', content: 'Empty import' });
        }

        const pageId = addPage(null);
        updatePage(pageId, {
          title: sourceName.replace(/\.[^/.]+$/, "") || 'Imported Markdown Page',
          content: blocks
        });

        triggerSuccess(`Page "${sourceName}" created successfully with ${blocks.length} blocks!`);
      } else if (importType === 'html') {
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const blocks: Block[] = [];

        const walkNode = (node: Node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            const content = el.innerText.trim();

            if (!content) return;

            if (tag === 'h1') {
              blocks.push({ id: generateId(), type: 'h1', content });
            } else if (tag === 'h2') {
              blocks.push({ id: generateId(), type: 'h2', content });
            } else if (tag === 'h3') {
              blocks.push({ id: generateId(), type: 'h3', content });
            } else if (tag === 'h4') {
              blocks.push({ id: generateId(), type: 'h4', content });
            } else if (tag === 'p') {
              blocks.push({ id: generateId(), type: 'text', content });
            } else if (tag === 'li') {
              blocks.push({ id: generateId(), type: 'bullet', content });
            } else if (tag === 'blockquote') {
              blocks.push({ id: generateId(), type: 'quote', content });
            } else if (tag === 'pre') {
              blocks.push({ id: generateId(), type: 'code', content, properties: { language: 'javascript' } });
            } else {
              // Read child nodes if tag is generic container
              Array.from(el.childNodes).forEach(walkNode);
            }
          }
        };

        Array.from(doc.body.childNodes).forEach(walkNode);

        if (blocks.length === 0) {
          blocks.push({ id: generateId(), type: 'text', content: doc.body.innerText.trim() || 'Empty HTML import' });
        }

        const pageId = addPage(null);
        updatePage(pageId, {
          title: sourceName.replace(/\.[^/.]+$/, "") || 'Imported HTML Page',
          content: blocks
        });

        triggerSuccess(`HTML Page "${sourceName}" created successfully with ${blocks.length} blocks!`);
      }
    } catch (err) {
      console.error(err);
      await customAlert('Failed to parse and import file content. Check file structure.', 'Import Error');
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setInputText('');
    setTimeout(() => {
      setSuccessMsg('');
      setImportOpen(false);
    }, 2500);
  };

  return (
    <div className="modal-overlay" onClick={() => setImportOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="heading-font" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} style={{ color: 'var(--accent-color)' }} />
            Import Document
          </h3>
          <button className="hover-bg" style={{ border: 'none', background: 'transparent', padding: '6px', cursor: 'pointer', borderRadius: '4px' }} onClick={() => setImportOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Check size={24} />
            </div>
            <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{successMsg}</p>
          </div>
        ) : (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['csv', 'markdown', 'html', 'json'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setImportType(type)}
                  className="cover-btn"
                  style={{
                    flexGrow: 1,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    fontWeight: 700,
                    justifyContent: 'center',
                    background: importType === type ? 'var(--accent-color)' : 'transparent',
                    color: importType === type ? '#fff' : 'inherit',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* File Drag Box */}
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-primary)',
                position: 'relative'
              }}
            >
              <input
                type="file"
                accept={importType === 'json' ? '.json' : importType === 'markdown' ? '.md,.txt' : importType === 'html' ? '.html,.htm' : '.csv'}
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <FileText size={36} style={{ color: 'var(--text-placeholder)', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, margin: '4px 0' }}>Drag & drop file here or click to browse</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Supports .{importType === 'json' ? 'json (workspace backup)' : importType === 'markdown' ? 'md, .txt' : importType === 'html' ? 'html' : 'csv'} files
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>OR PASTE TEXT CONTENT BELOW:</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Paste raw ${importType.toUpperCase()} contents here...`}
                style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'inherit',
                  padding: '10px',
                  fontSize: '13px',
                  fontFamily: importType === 'json' || importType === 'csv' ? 'var(--font-mono)' : 'inherit',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <button
              onClick={() => processImport(inputText, `manual_paste.${importType === 'markdown' ? 'md' : importType}`)}
              disabled={!inputText.trim()}
              className="cover-btn"
              style={{
                background: 'var(--accent-color)',
                color: '#fff',
                fontWeight: 700,
                justifyContent: 'center',
                padding: '8px',
                opacity: inputText.trim() ? 1 : 0.5,
                cursor: inputText.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Parse and Import Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
