import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  File, 
  Download, 
  Search, 
  RotateCw, 
  X,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface DocumentItem {
  name: string;
  url: string;
  time: number;
}

interface RightDocumentSidebarProps {
  onClose: () => void;
}

export const RightDocumentSidebar: React.FC<RightDocumentSidebarProps> = ({ onClose }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data && data.documents) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error('Failed to fetch documents in sidebar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Refresh list of documents every 8 seconds in the background
    const interval = setInterval(fetchDocuments, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDoc = (doc: DocumentItem) => {
    useStore.getState().setRequestedDocumentUrl(doc.url);
    if (doc.name.toLowerCase().endsWith('.xlsx')) {
      useStore.getState().setViewMode('excel');
    } else {
      useStore.getState().setViewMode('document');
    }
  };

  const handleDownloadFile = (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocIcon = (filename: string) => {
    const nameLower = filename.toLowerCase();
    if (nameLower.endsWith('.xlsx')) {
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/3/df/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" 
          alt="Excel" 
          className="w-5 h-5 shrink-0 object-contain"
        />
      );
    } else if (nameLower.endsWith('.docx')) {
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" 
          alt="Word" 
          className="w-5 h-5 shrink-0 object-contain"
        />
      );
    } else if (nameLower.endsWith('.pptx')) {
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg" 
          alt="PowerPoint" 
          className="w-5 h-5 shrink-0 object-contain"
        />
      );
    }
    return <File size={20} className="text-gray-400 shrink-0" />;
  };

  const formatTime = (time: number) => {
    if (!time) return '';
    try {
      const diff = Date.now() - time;
      if (diff < 60000) return 'Just now';
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="w-80 border-l border-white/10 bg-[#1e1e1e] h-full flex flex-col shrink-0 overflow-hidden text-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Document Library</h3>
          <span className="text-[10px] font-bold bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={fetchDocuments}
            className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Refresh document library"
          >
            <RotateCw size={13} className={cn(loading && "animate-spin")} />
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-white/5 bg-[#1a1a1a]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-[#1a1a1a]">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc, idx) => (
            <div
              key={doc.url || idx}
              onClick={() => handleOpenDoc(doc)}
              className="group flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all duration-200 cursor-pointer text-left relative overflow-hidden"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="p-2 bg-white/[0.03] rounded-lg group-hover:bg-white/10 transition-colors border border-white/5 flex items-center justify-center shrink-0">
                  {getDocIcon(doc.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors truncate mt-0.5 leading-snug pr-2" title={doc.name}>
                    {doc.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium font-sans mt-1">
                    {formatTime(doc.time) || 'Recently generated'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={(e) => handleDownloadFile(e, doc)}
                  className="p-1.5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 shrink-0 bg-white/5 border border-white/5"
                  title="Download File"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3">
              <FileText size={20} className="text-gray-600" />
            </div>
            <p className="text-xs font-bold text-gray-400">
              {searchQuery ? 'No documents matched' : 'No documents found'}
            </p>
            <p className="text-[11px] text-gray-600 mt-1 max-w-[200px] leading-relaxed">
              {searchQuery ? 'Try refinement of your search terms.' : 'Reports and spreadsheets generated by agents will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
