import { useState, useEffect } from 'react';
import { RefreshCw, MonitorPlay, AlertCircle, Wifi, WifiOff, ExternalLink } from 'lucide-react';

const getDesktopUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const targetHost = host === 'localhost' ? '127.0.0.1' : host;
    return `http://${targetHost}:6080/vnc.html?autoconnect=true&reconnect=true&resize=scale`;
  }
  return 'http://127.0.0.1:6080/vnc.html?autoconnect=true&reconnect=true&resize=scale';
};

const getDesktopHealthUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const targetHost = host === 'localhost' ? '127.0.0.1' : host;
    return `http://${targetHost}:5070/health`;
  }
  return 'http://127.0.0.1:5070/health';
};

export function DesktopWorkspace() {
  const [iframeKey, setIframeKey] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [apps, setApps] = useState<Record<string, boolean>>({});

  const checkDesktopHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(getDesktopHealthUrl(), {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      setIsAvailable(true);
      try {
        const data = await res.json();
        if (data.apps) setApps(data.apps);
      } catch {
        // Fallback in case response body is unparseable but server responded
      }
    } catch {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkDesktopHealth();
    const interval = setInterval(checkDesktopHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full bg-[#0d0d0d] animate-in fade-in duration-200 overflow-hidden">
      <div className="flex flex-1 flex-col min-w-0 h-full">
        {/* Status Bar */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/5 bg-[#161616] px-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MonitorPlay size={14} className="text-gray-500" />
            <span className="font-medium">Virtual Desktop</span>
            <span className="text-gray-600">•</span>
            <span className="font-mono text-gray-600">1280×800</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${isChecking ? 'bg-yellow-400 animate-pulse' : isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-[10px] font-medium text-gray-500">
                {isChecking ? 'Checking...' : isAvailable ? 'Connected' : 'Offline'}
              </span>
            </div>
            <button
              onClick={() => { setIframeKey(k => k + 1); checkDesktopHealth(); }}
              className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[10px] text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
              title="Reload Desktop"
            >
              <RefreshCw size={11} className={isChecking ? 'animate-spin' : ''} />
              Reload
            </button>
            <a
              href={getDesktopUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[10px] text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
              title="Open Virtual Desktop in New Tab"
            >
              <ExternalLink size={11} />
              Open in New Tab
            </a>
          </div>
        </div>

        {/* Desktop View */}
        <div className="relative flex-1 bg-[#0d0d0d]">
          {isAvailable ? (
            <iframe
              key={iframeKey}
              src={getDesktopUrl()}
              className="h-full w-full border-none"
              title="Virtual Desktop"
              allow="fullscreen"
              {...({ credentialless: "true" } as any)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              {isChecking ? (
                <>
                  <RefreshCw size={48} className="animate-spin mb-4 text-indigo-500 opacity-50" />
                  <h3 className="text-xl font-bold text-gray-200 mb-2">Connecting to Desktop...</h3>
                  <p className="max-w-md text-gray-400">Please wait while we connect to the virtual desktop environment.</p>
                </>
              ) : (
                <>
                  <AlertCircle size={48} className="mb-4 text-amber-400 opacity-50" />
                  <h3 className="text-xl font-bold text-gray-200 mb-2">Desktop Not Running</h3>
                  <p className="max-w-md text-gray-400 mb-6">
                    The virtual desktop container isn't reachable. Start it with Docker:
                  </p>
                  <div className="flex flex-col gap-2 items-center">
                    <code className="bg-black/60 px-4 py-2 rounded-lg text-sm text-emerald-400 font-mono border border-white/5">
                      docker compose up desktop
                    </code>
                    <p className="text-xs text-gray-500 mt-2">
                      This starts a full Ubuntu XFCE desktop with Firefox, VS Code, LibreOffice, and more.
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      The agent can control this desktop — clicking, typing, scrolling, opening apps, and taking screenshots.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
