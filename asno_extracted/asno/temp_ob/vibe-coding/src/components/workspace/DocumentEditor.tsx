import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Save, FileText, ChevronDown, ChevronUp, Sparkles, Bold as BoldIcon, Italic as ItalicIcon, 
  Underline as UnderlineIcon, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2, Type, Palette, Highlighter, List, ListOrdered, Check, AlertTriangle, 
  Loader2, Maximize2, Minimize2, Search, HelpCircle, FileDown, Plus, MoreHorizontal
} from 'lucide-react';
// @ts-ignore
import mammoth from 'mammoth';
import { useStore } from '../../store/useStore';

interface DocumentEditorProps {
  url: string;
}

export function DocumentEditor({ url }: DocumentEditorProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Page Layout' | 'References' | 'Review' | 'View' | 'Word'>('Home');
  const [fontSize, setFontSize] = useState<string>('12');
  const [fontFamily, setFontFamily] = useState<string>('Aptos');
  const [currentUrl, setCurrentUrl] = useState<string>(url);
  const [wordCount, setWordCount] = useState<number>(0);
  const [pagesCount, setPagesCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRibbonRef = useRef<HTMLDivElement>(null);

  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('word_ribbon_collapsed') === 'true';
    }
    return false;
  });
  const [showDropdownRibbon, setShowDropdownRibbon] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('word_ribbon_collapsed', String(isRibbonCollapsed));
  }, [isRibbonCollapsed]);

  // Click outside dropdown ribbon to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isRibbonCollapsed &&
        showDropdownRibbon &&
        dropdownRibbonRef.current &&
        !dropdownRibbonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.ribbon-tab-btn')
      ) {
        setShowDropdownRibbon(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRibbonCollapsed, showDropdownRibbon]);

  // Ctrl+F1 keyboard shortcut to toggle ribbon collapse
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'F1') {
        event.preventDefault();
        setIsRibbonCollapsed(prev => {
          const next = !prev;
          setShowDropdownRibbon(false);
          return next;
        });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filename = currentUrl.split('/').pop() || 'Document.docx';

  // Format tracking state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  useEffect(() => {
    async function loadDocument() {
      if (!currentUrl) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(currentUrl);
        if (!res.ok) throw new Error('Failed to fetch docx file.');
        const arrayBuffer = await res.arrayBuffer();

        // Convert .docx to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        let htmlStr = result.value || '';
        
        if (!htmlStr.trim()) {
          htmlStr = `
            <h1 class="text-3xl font-bold mb-4 text-[#111] font-sans">AI Evaluation and Data Strategy Framework</h1>
            <p class="text-sm text-gray-500 mb-8 italic">A corporate framework for measuring AI performance, governing data assets, and scaling responsible AI operations.</p>
            <h2 class="text-xl font-bold mt-6 mb-2 text-[#2b7cd3]">Executive Summary</h2>
            <p>This framework defines the operating model required to evaluate, govern, deploy, and continuously improve AI systems in a production enterprise environment. It aligns model performance measurement with data quality controls, ethical safeguards, operational monitoring, and infrastructure scalability.</p>
            <p>The objective is to enable leadership to make disciplined investment decisions, reduce model risk, and ensure AI capabilities deliver measurable business value with defensible oversight.</p>
            <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-4 font-sans rounded-r">
              <strong class="text-emerald-800 block mb-1">Decision Highlight</strong>
              Prioritize a unified AI control framework in which model evaluation, data governance, bias oversight, and production monitoring are treated as interdependent capabilities rather than separate workstreams.
            </div>
            <h2 class="text-xl font-bold mt-6 mb-2 text-[#2b7cd3]">AI Model Evaluation Metrics</h2>
            <ul>
              <li><strong>Accuracy:</strong> Use as a baseline indicator of overall correctness, while validating that class distributions do not skew results.</li>
              <li><strong>F1-score:</strong> Mandated for imbalanced evaluation datasets where precision and recall must both be carefully optimized.</li>
              <li><strong>Latency:</strong> Measure sub-second response times for real-time inference workflows.</li>
            </ul>
          `;
        }
        setHtmlContent(htmlStr);
      } catch (err: any) {
        console.error('Error loading docx:', err);
        // Fallback default doc layout
        const defaultDoc = `
          <h1 class="text-3xl font-bold mb-4 text-[#111]">Untitled Workspace Document</h1>
          <p class="text-gray-500 mb-6 italic">Edit description here...</p>
          <p>Start writing your executive document here. You have access to full WPS Word editor controls like headings, alignments, list items, bold, highlights and colors.</p>
        `;
        setHtmlContent(defaultDoc);
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [currentUrl]);

  // Read word count and approximate pages on text change
  useEffect(() => {
    if (!htmlContent) return;
    
    // Clean text representation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.innerText || tempDiv.textContent || '';
    
    // Count words
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);
    
    // Approximate pages (1 page per ~350-400 words)
    const pages = Math.max(1, Math.ceil(words / 400));
    setPagesCount(pages);
  }, [htmlContent]);

  const checkActiveFormats = () => {
    if (typeof document === 'undefined') return;
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrike(document.queryCommandState('strikeThrough'));
      
      if (document.queryCommandState('justifyLeft')) setAlignment('left');
      else if (document.queryCommandState('justifyCenter')) setAlignment('center');
      else if (document.queryCommandState('justifyRight')) setAlignment('right');
      else if (document.queryCommandState('justifyFull')) setAlignment('justify');
    } catch (e) {
      // Ignore unsupported state readings
    }
  };

  // Text editor command utility
  const runCommand = (command: string, value: string = '') => {
    if (typeof document === 'undefined') return;
    try {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
    } catch (e) {
      console.error('Error running text command:', e);
    }
    
    // Trigger editor text refresh
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  const applyColor = (command: string, color: string) => {
    if (typeof document === 'undefined') return;
    try {
      editorRef.current?.focus();
      if (command === 'hiliteColor') {
        document.execCommand('hiliteColor', false, color);
        document.execCommand('backColor', false, color);
      } else {
        document.execCommand(command, false, color);
      }
    } catch (e) {
      console.error('Error running color command:', e);
    }
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  const updateAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    setAlignment(align);
    let cmd = 'justifyLeft';
    if (align === 'center') cmd = 'justifyCenter';
    if (align === 'right') cmd = 'justifyRight';
    if (align === 'justify') cmd = 'justifyFull';
    runCommand(cmd);
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    setFontFamily(font);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      editorRef.current?.focus();
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current?.focus();
    }
    
    setTimeout(() => {
      runCommand('fontName', font);
    }, 10);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    setFontSize(size);
    // document.execCommand size uses numbers 1-7
    let mappedSize = '3'; // default
    if (parseInt(size) <= 10) mappedSize = '1';
    else if (parseInt(size) <= 12) mappedSize = '2';
    else if (parseInt(size) <= 14) mappedSize = '3';
    else if (parseInt(size) <= 18) mappedSize = '4';
    else if (parseInt(size) <= 24) mappedSize = '5';
    else if (parseInt(size) <= 32) mappedSize = '6';
    else mappedSize = '7';

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      editorRef.current?.focus();
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current?.focus();
    }
    
    setTimeout(() => {
      runCommand('fontSize', mappedSize);
    }, 10);
  };

  const handleApplyHeading = (styleType: 'Normal' | 'Heading 1' | 'Heading 2') => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      editorRef.current?.focus();
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current?.focus();
    }
    
    setTimeout(() => {
      if (styleType === 'Normal') {
        runCommand('formatBlock', 'p');
      } else if (styleType === 'Heading 1') {
        runCommand('formatBlock', 'h1');
      } else if (styleType === 'Heading 2') {
        runCommand('formatBlock', 'h2');
      }
    }, 10);
  };

  const saveEditedFile = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    const updatedHtml = editorRef.current.innerHTML;
    
    try {
      // We will perform local server save
      const payload = {
        filename: filename,
        content: updatedHtml
      };
      
      const res = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Unsuccessful on saving file to storage');
      
      // Update local storage content check to trigger components refresh
      setHtmlContent(updatedHtml);
      
      // Let's notify store about workspace document update
      const curProject = useStore.getState().currentProject;
      if (curProject && curProject.files) {
        // Find if file exists in project tree and update it too
        const pathOption = `/output/${filename}`;
        const relativeOption = `output/${filename}`;
        if (curProject.files[pathOption] !== undefined) {
          useStore.getState().updateFileContent(pathOption, updatedHtml);
        } else if (curProject.files[relativeOption] !== undefined) {
          useStore.getState().updateFileContent(relativeOption, updatedHtml);
        }
      }
      
      alert(`Success: ${filename} saved successfully!`);
    } catch(err: any) {
      console.error(err);
      alert(`Failed to save report: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const triggerDownload = () => {
    if (!editorRef.current) return;
    const blob = new Blob([editorRef.current.innerHTML], { type: 'text/html;charset=utf-8' });
    const localUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = localUrl;
    a.download = filename.endsWith('.docx') ? filename.replace(/\.docx$/i, '.edited.html') : filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(localUrl);
  };

  const handleTabClick = (tab: 'Home' | 'Insert' | 'Page Layout' | 'References' | 'Review' | 'View' | 'Word') => {
    if (isRibbonCollapsed) {
      if (activeTab === tab) {
        setShowDropdownRibbon(prev => !prev);
      } else {
        setActiveTab(tab);
        setShowDropdownRibbon(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#eaeaea] overflow-hidden text-zinc-800 min-h-0">
      
      {/* 1. App Title & System Ribbon Header */}
      <div className="bg-[#185ABD] px-4 py-2 flex items-center justify-between text-white border-b border-[#124b9b] select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white shrink-0" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.5 13.5l-2.03-7.5-2.03 7.5H9.6L7.1 7.5h2.1l1.35 5.58 1.95-5.58h1.8l1.95 5.58L17.65 7.5h2.1l-2.5 9H15.5z"/>
          </svg>
          <span className="font-semibold text-xs tracking-wide uppercase font-mono truncate">{filename} — Microsoft Word Online</span>
          <span className="text-[10px] bg-sky-400/20 px-2 py-0.5 rounded text-sky-150 border border-sky-400/20 font-bold">Word Co-Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={saveEditedFile} 
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 hover:border-white/30 rounded text-xs font-semibold cursor-pointer transition-all shrink-0"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            <span>{saving ? 'Saving...' : 'Save File'}</span>
          </button>
          
          <button 
            onClick={triggerDownload} 
            className="flex items-center gap-1.5 px-3 py-1 bg-[#104a91] hover:bg-[#0b3870] border border-transparent rounded text-xs font-semibold cursor-pointer transition-all shrink-0 text-white"
            title="Download Report"
          >
            <Download size={12} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Wrapper to contain Tab Selector and Toolbar (which can float absolutely below the Selector when collapsed) */}
      <div className="relative flex flex-col shrink-0">
        
        {/* 2. Ribbon Tab Selector */}
        <div className="bg-white border-b border-gray-300 flex items-center px-4 shrink-0 select-none justify-between">
          <div className="flex gap-4">
            {(['Home', 'Insert', 'Page Layout', 'References', 'Review', 'View', 'Word'] as const).map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`ribbon-tab-btn py-2 px-1 text-[12px] font-medium transition-all relative border-b-2 outline-none cursor-pointer ${
                    isActive 
                      ? 'border-[#185ABD] text-[#185ABD] font-bold' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab === 'Word' ? (
                    <span className="flex items-center gap-1 text-[#185ABD] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 pointer-events-none">
                      <Sparkles size={11} className="fill-blue-400" />
                      Word
                    </span>
                  ) : tab}
                </button>
              );
            })}
          </div>

          {/* Ribbon Toggle Button */}
          <button
            onClick={() => {
              setIsRibbonCollapsed(!isRibbonCollapsed);
              setShowDropdownRibbon(false);
            }}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors cursor-pointer mr-1 flex items-center gap-1 self-center"
            title={isRibbonCollapsed ? "Expand Ribbon (Ctrl+F1)" : "Collapse Ribbon (Ctrl+F1)"}
          >
            {isRibbonCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>

        {/* 3. High Fidelity Formatting Toolbar (Ribbon Panel) */}
        {(!isRibbonCollapsed || showDropdownRibbon) && (
          <div 
            ref={isRibbonCollapsed ? dropdownRibbonRef : undefined}
            className={
              isRibbonCollapsed 
                ? "absolute left-0 right-0 top-full bg-gray-50 border-b border-gray-300 py-2 px-4 flex flex-wrap items-center gap-3 z-50 shadow-lg animate-in slide-in-from-top-1 duration-150 select-none"
                : "bg-gray-50 border-b border-gray-300 py-2 px-4 flex flex-wrap items-center gap-3 select-none"
            }
          >
        {activeTab === 'Home' && (
          <>
            {/* Undo / Redo */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('undo')} 
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors cursor-pointer" 
                title="Undo"
              >
                <Undo2 size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('redo')} 
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors cursor-pointer" 
                title="Redo"
              >
                <Redo2 size={13} />
              </button>
            </div>

            <div className="h-4 border-r border-gray-300" />

            {/* Font Family Choice */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-0.5 shadow-sm">
              <Type size={12} className="text-gray-400 mr-1.5" />
              <select
                value={fontFamily}
                onChange={handleFontFamilyChange}
                className="text-[12px] font-sans font-medium bg-transparent outline-none cursor-pointer text-zinc-700 min-w-[100px]"
              >
                <option value="Aptos">Aptos (Default)</option>
                <option value="Calibri">Calibri</option>
                <option value="Arial">Arial</option>
                <option value="Inter">Inter (Sans)</option>
                <option value="Georgia">Georgia (Serif)</option>
                <option value="JetBrains Mono">JetBrains (Mono)</option>
              </select>
            </div>

            {/* Font Size Choice */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-0.5 shadow-sm">
              <span className="text-[10px] text-gray-400 font-bold mr-1.5 font-mono">PT</span>
              <select
                value={fontSize}
                onChange={handleFontSizeChange}
                className="text-[12px] font-semibold bg-transparent outline-none cursor-pointer text-zinc-700 font-mono w-[48px]"
              >
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="20">20</option>
                <option value="24">24</option>
                <option value="32">32</option>
              </select>
            </div>

            <div className="h-4 border-r border-gray-300" />

            {/* Text Style: Bold, Italic, Underline, Strike */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('bold')} 
                className={`p-1 px-2 rounded font-bold transition-all cursor-pointer ${isBold ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Bold"
              >
                <BoldIcon size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('italic')} 
                className={`p-1 px-1.5 rounded italic transition-all cursor-pointer ${isItalic ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Italic"
              >
                <ItalicIcon size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('underline')} 
                className={`p-1 px-1.5 rounded underline transition-all cursor-pointer ${isUnderline ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Underline"
              >
                <UnderlineIcon size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('strikeThrough')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${isStrike ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Strikethrough"
              >
                <Strikethrough size={13} />
              </button>
            </div>

            {/* Highlighters & Background Palette */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm gap-0.5">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor('foreColor', '#d946ef')} 
                className="p-1 hover:bg-gray-100 rounded flex items-center gap-1 cursor-pointer" 
                title="Magenta Text Color"
              >
                <Palette size={13} className="text-purple-500" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor('hiliteColor', '#bef264')} 
                className="p-1 hover:bg-gray-100 rounded flex items-center gap-1 cursor-pointer" 
                title="Yellow Highlighter"
              >
                <Highlighter size={13} className="text-lime-500" />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('removeFormat')} 
                className="text-[10px] uppercase font-mono font-bold text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer" 
                title="Clear Formatting"
              >
                Clear
              </button>
            </div>

            <div className="h-4 border-r border-gray-300" />

            {/* Paragraph Alignment */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAlignment('left')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${alignment === 'left' ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Align Left"
              >
                <AlignLeft size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAlignment('center')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${alignment === 'center' ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Align Center"
              >
                <AlignCenter size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAlignment('right')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${alignment === 'right' ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Align Right"
              >
                <AlignRight size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAlignment('justify')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${alignment === 'justify' ? 'bg-[#185ABD]/10 text-[#185ABD]' : 'hover:bg-gray-100 text-gray-600'}`} 
                title="Justify"
              >
                <AlignJustify size={13} />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('insertUnorderedList')} 
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors cursor-pointer" 
                title="Bullet List"
              >
                <List size={13} />
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand('insertOrderedList')} 
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors cursor-pointer" 
                title="Numbered List"
              >
                <ListOrdered size={13} />
              </button>
            </div>

            <div className="h-4 border-r border-gray-300" />

            {/* Paragraph Presets */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-1 shadow-sm">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleApplyHeading('Normal')} 
                className="text-[11px] font-semibold border border-gray-150 px-2 py-1 rounded bg-white hover:bg-gray-50 active:bg-gray-100 select-none text-zinc-700 cursor-pointer"
              >
                Normal
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleApplyHeading('Heading 1')} 
                className="text-[11px] font-bold border border-gray-150 px-2 py-1 rounded bg-white hover:bg-gray-50 active:bg-gray-100 text-blue-800 select-none cursor-pointer"
              >
                H1
              </button>
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleApplyHeading('Heading 2')} 
                className="text-[11px] font-bold border border-gray-150 px-2 py-1 rounded bg-white hover:bg-gray-50 active:bg-gray-100 text-sky-800 select-none cursor-pointer"
              >
                H2
              </button>
            </div>
          </>
        )}

        {activeTab === 'Insert' && (
          <div className="flex items-center gap-2">
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand('insertHorizontalRule')} 
              className="text-[11px] font-semibold bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1 rounded-md text-gray-600 shadow-sm cursor-pointer"
            >
              Horizontal Line
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand('createLink', 'https://')} 
              className="text-[11px] font-semibold bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1 rounded-md text-gray-600 shadow-sm cursor-pointer"
            >
              Insert Link
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand('insertParagraph')} 
              className="text-[11px] font-semibold bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1 rounded-md text-gray-600 shadow-sm cursor-pointer"
            >
              Page Break
            </button>
          </div>
        )}

        {activeTab === 'Page Layout' && (
          <div className="flex items-center gap-3 select-none text-[12px] font-medium text-gray-500">
            <span>Margins: <strong className="text-gray-900 font-bold">Standard A4 (1 inch)</strong></span>
            <span className="h-3 w-px bg-gray-300" />
            <span>Orientation: <strong className="text-gray-900 font-bold">Portrait</strong></span>
            <span className="h-3 w-px bg-gray-300" />
            <span>Dimensions: <strong className="text-gray-900 font-bold">816px × 1056px</strong></span>
          </div>
        )}

        {activeTab === 'Word' && (
          <div className="flex items-center gap-2">
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const prompt = "Improve this report section, add professional corporate structure, clarify evaluations and summarize next steps with polished Word formatting.";
                useStore.getState().setInput(prompt);
                useStore.getState().setViewMode('preview');
              }}
              className="text-[11.5px] font-bold text-white px-3 py-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-md hover:scale-102 flex items-center gap-1 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles size={11} className="fill-white animate-pulse" />
              Enhance Document
            </button>
            <span className="text-[11px] text-gray-400 italic">This launches the agent sequence on selected text.</span>
          </div>
        )}

        {activeTab !== 'Home' && activeTab !== 'Insert' && activeTab !== 'Page Layout' && activeTab !== 'Word' && (
          <div className="text-[11px] text-gray-400 italic py-1">Formatting module active for {activeTab}.</div>
        )}
      </div>
      )}
      </div>

      {/* 4. Document Canvas Area (Centered White A4 Sheets with Gray Surroundings) */}
      <div className="flex-1 overflow-y-auto bg-[#eaeaea] py-8 px-4 flex flex-col items-center custom-scrollbar w-full relative min-h-0">
        
        {loading ? (
          <div className="flex w-full h-[350px] justify-center items-center text-gray-500 font-mono flex-col gap-3 shrink-0">
            <Loader2 size={24} className="animate-spin text-[#185ABD]" />
            <span className="text-xs">Parsing file content with Mammoth...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-5 max-w-lg mt-12 flex flex-col items-center shadow-xl gap-3 text-center shrink-0">
            <AlertTriangle className="text-red-500" size={36} />
            <span className="font-bold">Parsing Error</span>
            <span className="text-xs opacity-90 font-mono">{error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative select-text pb-16 w-full max-w-[816px] items-center shrink-0">
            
            {/* Multiple mock Sheets generated to give true Word-Document physical split */}
            {Array.from({ length: pagesCount }).map((_, pageIdx) => {
              const isFirst = pageIdx === 0;
              const isLast = pageIdx === pagesCount - 1;
              
              return (
                <div 
                  key={pageIdx}
                  className="w-full max-w-[816px] min-h-[1056px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-300 relative flex flex-col p-14 pb-20 justify-between font-sans shrink-0 rounded transition-all hover:shadow-[0_4px_32px_rgba(0,0,0,0.15)] bg-cover"
                >
                  {/* Page Top Header */}
                  <div className="border-b border-gray-150 pb-2 text-[11px] text-gray-400 font-mono tracking-wider flex items-center justify-between pointer-events-none select-none shrink-0 mb-4 uppercase">
                    <span>{filename.replace(/\.docx$/i, '')}</span>
                    <span className="text-[10px] text-gray-300 italic">Office Reports Draft</span>
                  </div>

                  {/* Primary Editable Sheet Body. ONLY the first block holds editable state to match content flow! */}
                  <div className="flex-1 flex flex-col relative w-full h-full text-zinc-800 leading-relaxed min-h-0 select-text font-serif">
                    {isFirst ? (
                      <div
                        id="rich-a4-editor-canvas"
                        ref={editorRef}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          setHtmlContent(e.currentTarget.innerHTML);
                        }}
                        onInput={(e) => {
                          setHtmlContent(e.currentTarget.innerHTML);
                          checkActiveFormats();
                        }}
                        onKeyUp={checkActiveFormats}
                        onMouseUp={checkActiveFormats}
                        onSelect={checkActiveFormats}
                        className="w-full h-full min-h-[850px] outline-none text-[15px] leading-[1.7] text-zinc-900 border-none select-text focus:border-none focus:ring-0 prose prose-slate max-w-none text-justify"
                        dangerouslySetInnerHTML={{ __html: htmlContent }} 
                      />
                    ) : (
                      // Subsequent page overflow mock layout (as content edits are in container 1)
                      <div className="text-gray-300 italic text-[13px] font-sans h-full flex flex-col justify-center items-center border border-dashed border-gray-200 rounded p-12 bg-gray-50/50 pointer-events-none select-none mt-4">
                        <FileText size={48} className="text-gray-200 mb-2" />
                        <span className="font-bold text-gray-400">Word Flow Page {pageIdx + 1}</span>
                        <p className="text-[11px] text-gray-400 text-center max-w-xs mt-1">This page represents document sizing overflow. Modify content on page 1, more details flow here automatically.</p>
                      </div>
                    )}
                  </div>

                  {/* Page Bottom Footer */}
                  <div className="border-t border-gray-150 pt-2.5 mt-4 text-[11px] text-gray-400 font-mono flex items-center justify-between pointer-events-none select-none shrink-0">
                    <span>Word Online Cloud System</span>
                    <span className="font-bold text-zinc-500">Page {pageIdx + 1} of {pagesCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Modern Bottom Word Office Status Bar */}
      <div className="bg-[#f0f0f0] border-t border-gray-300 h-9 px-4 flex items-center justify-between text-zinc-500 text-[11px] select-none font-sans shrink-0 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-zinc-600 font-semibold bg-gray-200 px-2.5 py-0.5 rounded leading-tight">
            Page {currentPage} / {pagesCount}
          </span>
          <span className="text-zinc-600"><strong className="text-zinc-800 font-bold">{wordCount}</strong> words</span>
          <span className="text-emerald-600 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
            AI Spell Check: Active
          </span>
          <span className="text-zinc-400 max-sm:hidden">Compatibility Mode: Enabled</span>
        </div>

        <div className="flex items-center gap-4 text-[10.5px]">
          <span className="max-sm:hidden">Layout: <strong className="text-zinc-700">Print Layout</strong></span>
          <div className="flex items-center gap-1.5">
            <span>100%</span>
            <div className="w-16 h-1 bg-gray-300 rounded overflow-hidden">
              <div className="w-1/2 h-full bg-[#185ABD]"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
