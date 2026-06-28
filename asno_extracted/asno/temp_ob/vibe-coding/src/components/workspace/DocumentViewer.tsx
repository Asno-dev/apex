import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
// @ts-ignore
import mammoth from 'mammoth';
import { Download, File as FileIcon, FileText, Image as ImageIcon, FileSpreadsheet, Presentation } from 'lucide-react';
import { SlidePreview } from './SlidePreview';

interface DocumentViewerProps {
  url: string;
  onProceed?: (action: 'Approved' | 'Declined', feedback?: string) => void;
}

export function DocumentViewer({ url, onProceed }: DocumentViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [reviewStatus, setReviewStatus] = useState<'Review' | 'Approved' | 'Declined'>('Review');
  const [declineFeedback, setDeclineFeedback] = useState<string>('');
  const [recentDocs, setRecentDocs] = useState<{name: string, url: string, time: number}[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>(url);

  // Sync prop changes
  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  const filename = currentUrl.split('/').pop() || 'Document';
  const isPptx = currentUrl.endsWith('.pptx');

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (data && data.documents) {
          setRecentDocs(data.documents);
        }
      })
      .catch(console.error);
  }, [currentUrl]); // Refresh list when url changes

  useEffect(() => {
    async function loadFile() {
      setLoading(true);
      setError(null);
      setContent('');
      
      try {
        if (isPptx) {
          // SlidePreview handles it.
          setContent('');
        } else if (currentUrl.endsWith('.xlsx')) {
          const res = await fetch(currentUrl);
          if (!res.ok) throw new Error('Failed to load excel file');
          const arrayBuffer = await res.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(worksheet);
          setContent(html);
        } else if (currentUrl.endsWith('.docx')) {
          const res = await fetch(currentUrl);
          if (!res.ok) throw new Error('Failed to load word file');
          const arrayBuffer = await res.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setContent(result.value);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading document');
      } finally {
        setLoading(false);
      }
    }

    if (currentUrl) {
      loadFile();
    }
  }, [currentUrl, isPptx]);

  const getIcon = (name: string) => {
    if (name.endsWith('.pptx')) return <Presentation size={16} className="text-orange-500" />;
    if (name.endsWith('.xlsx')) return <FileSpreadsheet size={16} className="text-green-500" />;
    if (name.endsWith('.docx')) return <FileText size={16} className="text-blue-500" />;
    return <FileIcon size={16} className="text-gray-400" />;
  };

  const [loadingText, setLoadingText] = useState('Building Document...');
  
  useEffect(() => {
    if (!currentUrl) {
      const texts = [
        'Connecting to Office service...',
        'Drafting structure & layouts...',
        'Generating copy & sections...',
        'Sourcing rich media & images...',
        'Applying professional formatting...',
        'Finalizing presentation assets...',
        'Almost ready...'
      ];
      let i = 0;
      setLoadingText(texts[0]);
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUrl]);

  if (!currentUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-white flex-col space-y-6">
        <div className="flex space-x-3 items-center">
           <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
           <span className="font-mono text-sm tracking-widest text-blue-400 font-semibold uppercase">{loadingText}</span>
        </div>
        <p className="text-gray-500 text-xs italic">Please wait while the AI compiles your document live.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex bg-[#1e1e1e] overflow-hidden">
      <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-black/20 bg-[#252526] shrink-0">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <span className="text-gray-300 font-mono text-sm truncate max-w-xs">{filename}</span>
            
            {/* Vibe Planner Review Controls */}
            {(filename.toLowerCase().includes('plan') || currentUrl.toLowerCase().includes('plan')) && (
              <div id="planner-controls" className="flex items-center gap-2 shrink-0">
                <select 
                  value={reviewStatus} 
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="bg-[#2d2d2d] text-xs border border-[#444] rounded px-2 py-1 text-white font-medium cursor-pointer outline-none focus:border-blue-500 transition-all"
                >
                  <option value="Review">✏️ Review Required</option>
                  <option value="Approved">✅ Approved</option>
                  <option value="Declined">❌ Declined</option>
                </select>

                {reviewStatus === 'Declined' && (
                  <input
                    type="text"
                    value={declineFeedback}
                    onChange={(e) => setDeclineFeedback(e.target.value)}
                    placeholder="Provide revision details..."
                    className="bg-[#2d2d2d] text-xs border border-red-500/30 rounded px-2 py-1 text-white outline-none w-48 sm:w-64 focus:border-red-500/70 transition-all font-sans"
                  />
                )}

                <button 
                  onClick={() => {
                    if (reviewStatus === 'Approved') {
                      onProceed?.('Approved');
                    } else if (reviewStatus === 'Declined') {
                      onProceed?.('Declined', declineFeedback);
                    }
                  }}
                  disabled={reviewStatus === 'Review' || (reviewStatus === 'Declined' && !declineFeedback.trim())}
                  className={`text-xs font-bold px-3 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                    reviewStatus === 'Approved' 
                      ? "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:scale-102" 
                      : reviewStatus === 'Declined' && declineFeedback.trim()
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-[#2d2d2d] text-gray-500 border border-[#444] status-disabled cursor-not-allowed"
                  }`}
                >
                  {reviewStatus === 'Declined' ? 'Submit Feedback' : 'Proceed'}
                </button>
              </div>
            )}
          </div>
          <a 
            href={currentUrl} 
            download 
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0"
            title="Download Document"
          >
            <Download size={16} />
          </a>
        </div>
        
        <div className="flex-1 bg-white overflow-hidden relative rounded-br-md flex flex-col min-h-0 min-w-0">
          {loading ? (
             <div className="flex w-full h-full justify-center items-center text-gray-500 font-mono bg-[#1e1e1e]">
               Loading document...
             </div>
          ) : error ? (
             <div className="flex w-full h-full justify-center items-center text-red-500 font-mono bg-[#1e1e1e] p-8 text-center break-words">
               {error}
             </div>
          ) : isPptx ? (
             <SlidePreview jsonUrl={currentUrl.replace(/\.pptx$/i, '.preview.json')} />
          ) : (
             <div className="w-full h-full overflow-auto custom-scrollbar bg-gray-100 p-4 md:p-8">
               <div 
                 className={`prose max-w-none docx-xlsx-viewer bg-white shadow-xl mx-auto ${
                   currentUrl.endsWith('.xlsx') ? 'p-0 rounded-none w-full max-w-full' : 'p-10 md:p-16 max-w-4xl min-h-[1056px] w-[816px] rounded'
                 }`}
                 dangerouslySetInnerHTML={{ __html: content }} 
               />
             </div>
          )}
        </div>
      </div>

      <style>{`
        /* Custom visible scrollbars for easy scrolling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border: 3px solid #f1f1f1;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .custom-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }

        /* Excel Table Styles */
        .docx-xlsx-viewer table {
          border-collapse: collapse;
          width: 100%;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          color: #111827 !important;
        }
        .docx-xlsx-viewer table *, .docx-xlsx-viewer th *, .docx-xlsx-viewer td * {
          color: #111827 !important;
        }
        .docx-xlsx-viewer table, .docx-xlsx-viewer th, .docx-xlsx-viewer td {
          border: 1px solid #d1d5db;
        }
        .docx-xlsx-viewer th, .docx-xlsx-viewer td {
          padding: 6px 10px;
          text-align: left;
          min-width: 100px;
          color: #111827 !important;
        }
        .docx-xlsx-viewer tr:first-child td, .docx-xlsx-viewer th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        .docx-xlsx-viewer tr:nth-child(even) {
          background-color: #fafafa;
        }
        
        /* Word Document Styles */
        .docx-xlsx-viewer p {
          margin-top: 0;
          margin-bottom: 1em;
          line-height: 1.6;
          color: #1f2937;
        }
        .docx-xlsx-viewer h1, .docx-xlsx-viewer h2, .docx-xlsx-viewer h3 {
          color: #111827;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .docx-xlsx-viewer h1 { font-size: 2em; }
        .docx-xlsx-viewer h2 { font-size: 1.5em; }
        .docx-xlsx-viewer h3 { font-size: 1.25em; }
        .docx-xlsx-viewer ul, .docx-xlsx-viewer ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
}
