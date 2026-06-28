import { useState, useEffect } from 'react';
import { Save, FileCode, Check, Loader2 } from 'lucide-react';
import { useComputerStore } from '../../store/useComputerStore';

export function ComputerEditor() {
  const {
    isConnected, computerUrl,
    selectedFile, fileContent, setFileContent,
    isEditing, setEditing
  } = useComputerStore();

  const [localContent, setLocalContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalContent(fileContent || '');
  }, [fileContent]);

  const handleSave = async () => {
    if (!selectedFile || !isConnected) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${computerUrl}/fs/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile,
          content: localContent
        }),
      });

      if (res.ok) {
        setFileContent(localContent);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected) return null;

  if (!selectedFile) {
    return (
      <div className="flex h-full items-center justify-center text-center p-8 bg-[#0a0a0a]">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <FileCode size={24} className="text-gray-600" />
          </div>
          <div className="text-gray-500 text-sm font-medium">No File Selected</div>
          <div className="text-gray-700 text-xs max-w-xs">
            Select a file from the explorer to start editing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0e0e0e] shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode size={14} className="text-indigo-400 shrink-0" />
          <span className="text-[11px] font-mono text-gray-400 truncate">{selectedFile}</span>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold animate-in fade-in slide-in-from-right-2">
              <Check size={10} /> SAVED
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || localContent === fileContent}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-bold transition-all ${
              isSaving || localContent === fileContent
                ? 'opacity-50 cursor-not-allowed bg-white/5 text-gray-500'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/30'
            }`}
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            SAVE
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 relative overflow-hidden group">
        <textarea
          value={localContent}
          onChange={(e) => {
            setLocalContent(e.target.value);
            setEditing(true);
          }}
          spellCheck={false}
          className="w-full h-full bg-transparent p-6 text-[13px] font-mono text-gray-300 leading-relaxed outline-none resize-none custom-scrollbar"
          style={{
            tabSize: 2,
            MozTabSize: 2,
          }}
          placeholder="Start typing..."
        />
        
        {/* Line Numbers Simulation (Subtle) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-black/20 border-r border-white/5 pointer-events-none" />
      </div>
    </div>
  );
}
