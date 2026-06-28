import React, { useState } from "react";
import { useStore } from "../../store/useStore";
import {
  Code,
  Eye,
  MonitorPlay,
  FileText,
  FileSpreadsheet,
  Terminal,
  AlignLeft,
  SquareTerminal,
  Paintbrush,
  Search,
} from "lucide-react";

export function NewTabPage() {
  const { setViewMode } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    {
      id: "code",
      label: "Code",
      icon: Code,
      desc: "Write and edit source code",
    },
    { id: "preview", label: "Preview", icon: Eye, desc: "Preview your App" },
    {
      id: "desktop",
      label: "Desktop",
      icon: MonitorPlay,
      desc: "VNC Desktop Workspace",
    },
    {
      id: "document",
      label: "Document",
      icon: FileText,
      desc: "Document Viewer",
    },
    {
      id: "excel",
      label: "Excel",
      icon: FileSpreadsheet,
      desc: "Excel Spreadsheet Editor",
    },
    {
      id: "terminal",
      label: "Terminal",
      icon: Terminal,
      desc: "Full view terminal",
    },
    {
      id: "console",
      label: "Console",
      icon: AlignLeft,
      desc: "Full view app console logs",
    },
    {
      id: "shell",
      label: "Shell",
      icon: SquareTerminal,
      desc: "Fully working shell",
    },
  ];

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 w-full bg-[#1e1e1e] flex flex-col items-center p-8 pt-16 overflow-y-auto min-h-0">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="w-[100px] h-[100px] mb-8 bg-[#2a2a2a] rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
          <img
            src="/bud-logo.svg"
            alt="Bud Logo"
            className="w-[60px] h-[60px]"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>

        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight font-sans">
          What do you want to open?
        </h1>

        <div className="relative w-full max-w-2xl mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 border-white/10 rounded-2xl bg-[#252526] hover:bg-[#2a2a2b] transition-colors focus:ring-2 focus:ring-indigo-500/50 outline-none sm:text-base text-gray-200 placeholder-gray-500 shadow-xl"
            placeholder="Search for tools & files..."
            value={searchTerm}
            autoFocus
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full max-w-2xl flex flex-col">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Your App
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setViewMode(t.id as any)}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#252526] border border-white/5 hover:bg-[#2a2a2b] hover:border-white/10 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-black/50 text-gray-400 group-hover:text-white transition-colors">
                  {t.icon ? <t.icon size={20} /> : <Paintbrush size={20} />}
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                    {t.label}
                  </span>
                  <span className="text-gray-500 text-xs mt-0.5">{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
