import { useEffect, useRef, useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { useComputerStore } from '../../store/useComputerStore';
import { useStore } from '../../store/useStore';

// We dynamically import xterm to avoid SSR issues
let XTermModule: any = null;
let FitAddonModule: any = null;
let WebLinksAddonModule: any = null;

export function ComputerTerminal() {
  const {
    terminalSessions, activeTerminalId,
    addTerminalSession, removeTerminalSession, setActiveTerminalId,
    isConnected, computerUrl,
  } = useComputerStore();

  const { viewMode } = useStore();
  const isShellMode = viewMode === 'shell';

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load xterm dynamically
  useEffect(() => {
    const loadModules = async () => {
      try {
        const [xterm, fitAddon, webLinksAddon] = await Promise.all([
          import('xterm'),
          import('xterm-addon-fit'),
          import('xterm-addon-web-links'),
        ]);
        XTermModule = xterm;
        FitAddonModule = fitAddon;
        WebLinksAddonModule = webLinksAddon;
        setIsLoading(false);
      } catch {
        // xterm not installed — use fallback
        setIsLoading(false);
      }
    };
    loadModules();
  }, []);

  // Create a new terminal session
  const createSession = useCallback(() => {
    const id = `term-${Date.now()}`;
    const name = isShellMode ? 'Shell' : 'Terminal';
    addTerminalSession({ id, title: `${name} ${terminalSessions.length + 1}`, isConnected: false });
  }, [terminalSessions.length, addTerminalSession, isShellMode]);

  // Auto-create first session
  useEffect(() => {
    if (terminalSessions.length === 0 && !isLoading) {
      createSession();
    }
  }, [terminalSessions.length, isLoading, createSession]);

  // Initialize xterm for active session — works even without Docker (local fallback)
  useEffect(() => {
    if (isLoading || !activeTerminalId || !terminalContainerRef.current) return;
    // Removed isConnected gate — terminal works locally even without Docker

    const container = terminalContainerRef.current;
    container.innerHTML = '';

    // If xterm available, use it
    if (XTermModule) {
      const { Terminal } = XTermModule;
      const { FitAddon } = FitAddonModule;

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'bar',
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        theme: {
          background: '#1a1a1a', // Matching Manus terminal background
          foreground: '#e0e0e0',
          cursor: '#a78bfa',
          cursorAccent: '#1a1a1a',
          selectionBackground: 'rgba(167, 139, 250, 0.3)',
          black: '#1e1e1e',
          red: '#f87171',
          green: '#4ade80',
          yellow: '#fbbf24',
          blue: '#60a5fa',
          magenta: '#c084fc',
          cyan: '#22d3ee',
          white: '#e0e0e0',
          brightBlack: '#6b7280',
          brightRed: '#fca5a5',
          brightGreen: '#86efac',
          brightYellow: '#fde68a',
          brightBlue: '#93c5fd',
          brightMagenta: '#d8b4fe',
          brightCyan: '#67e8f9',
          brightWhite: '#f9fafb',
        },
        allowProposedApi: true,
        scrollback: 5000,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      try {
        const { WebLinksAddon } = WebLinksAddonModule;
        term.loadAddon(new WebLinksAddon());
      } catch {}

      term.open(container);
      setTimeout(() => {
        try {
          if (container.clientWidth > 0 && container.clientHeight > 0) {
            fitAddon.fit();
          }
        } catch {}
      }, 50);

      terminalInstanceRef.current = term;
      fitAddonRef.current = fitAddon;

      // Connect via WebSocket (Socket.IO)
      connectWebSocket(term, activeTerminalId, fitAddon);

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        try {
          if (container.clientWidth > 0 && container.clientHeight > 0) {
            fitAddon.fit();
          }
        } catch {}
      });
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        term.dispose();
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } else {
      // Fallback: simple textarea-based terminal
      container.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;background:#1a1a1a;padding:12px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#e0e0e0;">
          <div id="fallback-output" style="flex:1;overflow-y:auto;white-space:pre-wrap;word-break:break-all;"></div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
            <span style="color:#4ade80;">ubuntu@sandbox:~$</span>
            <input id="fallback-input" type="text" style="flex:1;background:transparent;border:none;color:#e0e0e0;outline:none;font-family:inherit;font-size:inherit;" />
          </div>
        </div>
      `;

      const output = container.querySelector('#fallback-output') as HTMLElement;
      const input = container.querySelector('#fallback-input') as HTMLInputElement;

      output.textContent = '';

      input?.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          const cmd = input.value.trim();
          output.textContent += `$ ${cmd}\n`;
          input.value = '';

          try {
            const res = await fetch(`${computerUrl || ''}/sandbox/shell`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                command: cmd,
                cwd: '/workspace',
              }),
            });
            if (res.ok) {
              const data = await res.json();
              output.textContent += (data.output || '(no output)') + '\n\n';
            } else {
              output.textContent += `[Error: Command failed (${res.status})]\n\n`;
            }
          } catch (err: any) {
            output.textContent += `[error] ${err.message}\n`;
            output.textContent += `[Docker not running?] Run: docker compose up computer\n\n`;
          }
          output.scrollTop = output.scrollHeight;
        }
      });

      input?.focus();
    }
  }, [activeTerminalId, isLoading, computerUrl]);

  const connectWebSocket = (term: any, sessionId: string, fitAddon: any) => {
    try {
      // Dynamic import socket.io-client
      import('socket.io-client').then(({ io }) => {
        const host = computerUrl || window.location.origin;
        const wsUrl = host.includes(':4000') 
          ? host.replace(':4000', ':4001')
          : host.includes(':3000') 
            ? host.replace(':3000', ':4001')
            : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:4001`;

        const socket = io(`${wsUrl}/terminal`, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('terminal:create', {
            sessionId,
            cols: term.cols,
            rows: term.rows,
          });
        });

        socket.on('terminal:created', () => {
          // Changed to match Kimi/Manus prompt exactly
          term.write('\x1b[35mubuntu@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
        });

        socket.on('terminal:output', (data: { sessionId: string; data: string }) => {
          if (data.sessionId === sessionId) {
            term.write(data.data);
          }
        });

        socket.on('terminal:exit', () => {
          term.write('\r\n\x1b[31m[Session ended]\x1b[0m\r\n');
        });

        socket.on('terminal:error', (data: { error: string }) => {
          term.write(`\r\n\x1b[31m[Error: ${data.error}]\x1b[0m\r\n`);
        });

        // Send input to terminal
        term.onData((data: string) => {
          socket.emit('terminal:input', { sessionId, input: data });
        });

        // Handle resize
        term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
          socket.emit('terminal:resize', { sessionId, cols, rows });
        });

        socket.on('disconnect', () => {
          term.write('\r\n\x1b[33m[Disconnected — reconnecting...]\x1b[0m\r\n');
        });

        let directModeInitialized = false;
        socket.on('connect_error', () => {
          if (directModeInitialized) return;
          directModeInitialized = true;
          
          try {
            socket.disconnect();
          } catch {}

          term.write('\x1b[33m[Terminal running in direct mode]\x1b[0m\r\n');
          term.write('\x1b[35mubuntu@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');

          let lineBuffer = '';
          term.onData((data: string) => {
            if (data === '\r') {
              term.write('\r\n');
              if (lineBuffer.trim()) {
                executeDirectCommand(term, lineBuffer.trim());
              } else {
                term.write('\x1b[35mubuntu@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
              }
              lineBuffer = '';
            } else if (data === '\x7f') {
              if (lineBuffer.length > 0) {
                lineBuffer = lineBuffer.slice(0, -1);
                term.write('\b \b');
              }
            } else if (data >= ' ') {
              lineBuffer += data;
              term.write(data);
            }
          });
        });
      }).catch(() => {
        term.write('\x1b[33m[Terminal running in local mode]\x1b[0m\r\n');
        term.write('\x1b[35mubuntu@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
      });
    } catch {
      term.write('\x1b[33m[Terminal in local mode]\x1b[0m\r\n');
    }
  };

  const executeDirectCommand = async (term: any, command: string) => {
    try {
      const res = await fetch(`${computerUrl || ''}/sandbox/shell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: command,
          cwd: '/workspace',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const outputText = data.output || '(no output)';
        const formattedOutput = outputText.replace(/\r?\n/g, '\r\n');
        term.write(formattedOutput + '\r\n');
      } else {
        term.write(`[Error: Command failed (${res.status})]\r\n`);
      }
    } catch (err: any) {
      term.write(`\x1b[31m[Error: ${err.message}]\x1b[0m\r\n`);
      term.write(`\x1b[33mDocker container may not be running. Run: docker compose up computer\x1b[0m\r\n`);
    }
    term.write('\x1b[35mubuntu@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1a1a1a]">
      {/* Terminal tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 bg-[#141414] px-2 py-1 shrink-0 h-8">
        {terminalSessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActiveTerminalId(session.id)}
            className={`group flex items-center gap-2 rounded-md px-3 py-1 text-[11px] font-medium cursor-pointer transition-all ${
              activeTerminalId === session.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span>
              {isShellMode
                ? session.title.replace('Terminal', 'Shell')
                : session.title.replace('Shell', 'Terminal')}
            </span>
            {terminalSessions.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeTerminalSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={createSession}
          className="flex items-center justify-center w-6 h-6 rounded-md text-gray-600 hover:text-white hover:bg-white/5 transition-all ml-1"
          title={isShellMode ? "New Shell" : "New Terminal"}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Terminal content */}
      <div ref={terminalContainerRef} className="flex-1 min-h-0 overflow-hidden bg-[#1a1a1a] p-2" />
    </div>
  );
}
