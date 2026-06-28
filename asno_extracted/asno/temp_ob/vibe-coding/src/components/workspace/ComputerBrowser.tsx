import { useState, useRef } from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { useComputerStore } from '../../store/useComputerStore';

const NOVNC_URL = 'http://localhost:6090/vnc.html?autoconnect=true&reconnect=true&resize=scale';

export function ComputerBrowser() {
  const { isConnected } = useComputerStore();
  const browserScreenshot = null;
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'vnc' | 'screenshot'>('vnc');
  const [iframeKey, setIframeKey] = useState(0);

  if (!isConnected) {
    return (
      <div className="flex h-full items-center justify-center text-center p-8">
        <div className="space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Globe size={22} className="text-gray-600" />
          </div>
          <div className="text-gray-500 text-sm">Browser Offline</div>
          <div className="text-gray-700 text-xs">Start Docker containers to use the browser</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#0c0c0c] px-3 py-2 shrink-0">
        <button onClick={() => setIframeKey(k => k + 1)} className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Refresh">
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <div className="flex-1 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
          <Globe size={12} className="text-gray-500 shrink-0" />
          <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Enter URL..." className="flex-1 bg-transparent text-xs text-gray-200 placeholder-gray-600 outline-none" />
        </div>
        <button onClick={() => setViewMode(viewMode === 'vnc' ? 'screenshot' : 'vnc')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'vnc' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
          {viewMode === 'vnc' ? 'LIVE' : 'STATIC'}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden bg-[#0d0d0d] relative">
        {viewMode === 'vnc' ? (
          <iframe key={iframeKey} src={NOVNC_URL} className="h-full w-full border-none" title="Sandbox Browser" allow="fullscreen" />
        ) : browserScreenshot ? (
          <div className="h-full overflow-auto p-4">
            <img src={`data:image/png;base64,${browserScreenshot}`} alt="Screenshot" className="max-w-full rounded-lg border border-white/10" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">Navigate to a URL to see content</div>
        )}
      </div>
    </div>
  );
}
