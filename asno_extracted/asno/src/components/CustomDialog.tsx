import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';

export const CustomDialog: React.FC = () => {
  const { dialog } = useApp();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialog.isOpen) {
      setInputValue(dialog.defaultValue || '');
      // Focus and select the text after the modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 80);
    }
  }, [dialog.isOpen, dialog.defaultValue]);

  const handleConfirm = () => {
    if (dialog.type === 'prompt') {
      dialog.resolve?.(inputValue);
    } else if (dialog.type === 'confirm') {
      dialog.resolve?.(true);
    } else {
      dialog.resolve?.(undefined);
    }
  };

  const handleCancel = () => {
    if (dialog.type === 'confirm') {
      dialog.resolve?.(false);
    } else {
      dialog.resolve?.(null);
    }
  };

  useEffect(() => {
    if (!dialog.isOpen) return;

    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Allow default behavior inside input if typing (controlled by local key handler)
        if (dialog.type !== 'prompt') {
          e.preventDefault();
          handleConfirm();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [dialog.isOpen, dialog.type, inputValue]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  if (!dialog.isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={handleCancel}
      style={{ 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'opacity 0.2s ease'
      }}
    >
      <div 
        className="modal-content glass" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '420px', 
          width: '90%', 
          borderRadius: 'var(--border-radius-lg)', 
          padding: '24px', 
          border: '1px solid var(--border-color)', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {dialog.title}
        </div>
        
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, wordBreak: 'break-word' }}>
          {dialog.message}
        </div>

        {dialog.type === 'prompt' && (
          <div style={{ marginTop: '4px' }}>
            <input 
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="search-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13px',
                transition: 'border-color 0.15s ease'
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
          {dialog.type !== 'alert' && (
            <button 
              className="cover-btn" 
              onClick={handleCancel}
              style={{ 
                padding: '6px 14px', 
                fontSize: '12px', 
                borderRadius: '6px', 
                background: 'transparent', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
          )}
          <button 
            className="cover-btn" 
            onClick={handleConfirm}
            style={{ 
              padding: '6px 16px', 
              fontSize: '12px', 
              borderRadius: '6px', 
              background: 'var(--accent-color)', 
              color: 'white', 
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
