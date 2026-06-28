import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code,
  Palette
} from 'lucide-react';

interface FormatMenuProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export const FormatMenu: React.FC<FormatMenuProps> = ({ editorRef }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: 'Default', value: 'inherit', bg: 'transparent' },
    { name: 'Red', value: '#e06c75', bg: '#ffebe9' },
    { name: 'Green', value: '#98c379', bg: '#e6ffed' },
    { name: 'Blue', value: '#61afef', bg: '#e6fffc' },
    { name: 'Yellow', value: '#d19a66', bg: '#fff5b8' },
    { name: 'Purple', value: '#c678dd', bg: '#fbeeff' }
  ];

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setVisible(false);
      setColorPickerOpen(false);
      return;
    }

    const range = selection.getRangeAt(0);
    // Check if selection is within our editor element
    if (editorRef.current && !editorRef.current.contains(range.commonAncestorContainer)) {
      setVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setVisible(false);
      return;
    }

    // Position above selection
    setPosition({
      top: rect.top - 50 + window.scrollY,
      left: rect.left + rect.width / 2 - (menuRef.current?.offsetWidth || 150) / 2 + window.scrollX
    });
    setVisible(true);
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const applyFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    // Refresh selection trigger
    handleSelectionChange();
  };

  const applyColor = (colorValue: string, isBackground: boolean = false) => {
    applyFormat(isBackground ? 'backColor' : 'foreColor', colorValue);
    setColorPickerOpen(false);
  };

  if (!visible) return null;

  return (
    <div 
      ref={menuRef}
      className="format-menu-bar glass"
      style={{ 
        position: 'absolute', 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 500,
        gap: '2px'
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing editor focus on click
    >
      <button className="format-btn hover-bg" onClick={() => applyFormat('bold')} title="Bold">
        <Bold size={14} />
      </button>
      <button className="format-btn hover-bg" onClick={() => applyFormat('italic')} title="Italic">
        <Italic size={14} />
      </button>
      <button className="format-btn hover-bg" onClick={() => applyFormat('underline')} title="Underline">
        <Underline size={14} />
      </button>
      <button className="format-btn hover-bg" onClick={() => applyFormat('strikeThrough')} title="Strikethrough">
        <Strikethrough size={14} />
      </button>
      <button className="format-btn hover-bg" onClick={() => applyFormat('formatBlock', '<code>')} title="Inline Code">
        <Code size={14} />
      </button>
      
      <div style={{ position: 'relative' }}>
        <button className="format-btn hover-bg" onClick={() => setColorPickerOpen(!colorPickerOpen)} title="Colors">
          <Palette size={14} />
        </button>

        {colorPickerOpen && (
          <div className="format-color-picker glass" onMouseDown={(e) => e.preventDefault()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span className="color-section-title">Text Color</span>
                <div className="color-swatches-grid">
                  {colors.map((c) => (
                    <button 
                      key={`fg-${c.name}`} 
                      className="color-swatch-btn hover-bg"
                      style={{ color: c.value }}
                      onClick={() => applyColor(c.value, false)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
              <div>
                <span className="color-section-title">Highlight Color</span>
                <div className="color-swatches-grid">
                  {colors.map((c) => (
                    <button 
                      key={`bg-${c.name}`} 
                      className="color-swatch-btn hover-bg"
                      style={{ backgroundColor: c.bg, color: 'var(--text-primary)' }}
                      onClick={() => applyColor(c.bg, true)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .format-menu-bar {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
        }
        .format-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          width: 26px;
          height: 26px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .format-btn:hover {
          color: var(--text-primary);
        }
        .format-color-picker {
          position: absolute;
          top: 32px;
          left: 0;
          width: 170px;
          padding: 8px;
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          z-index: 510;
        }
        .color-section-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }
        .color-swatches-grid {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .color-swatch-btn {
          border: none;
          background: transparent;
          padding: 4px 6px;
          border-radius: var(--border-radius-sm);
          text-align: left;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
