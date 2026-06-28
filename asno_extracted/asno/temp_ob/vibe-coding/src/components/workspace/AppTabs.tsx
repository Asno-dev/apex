import React from "react";
import { useStore } from "../../store/useStore";
import {
  Code,
  Eye,
  MonitorPlay,
  FileText,
  FileSpreadsheet,
  X,
  Plus,
  Terminal,
  SquareTerminal,
  AlignLeft,
  Paintbrush,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function AppTabs() {
  const { viewMode, setViewMode } = useStore();
  const [openTabs, setOpenTabs] = React.useState<string[]>(["code", "preview"]);
  const [searchTerm, setSearchTerm] = React.useState("");

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

  // Initialize view mode in open tabs if missing
  React.useEffect(() => {
    if (
      viewMode &&
      !openTabs.includes(viewMode) &&
      tabs.some((t) => t.id === viewMode)
    ) {
      setOpenTabs((prev) => [...prev, viewMode]);
    }
  }, [viewMode, openTabs]);

  const handleCreateTab = (id: string) => {
    if (!openTabs.includes(id)) {
      setOpenTabs([...openTabs, id]);
    }
    setViewMode(id as any);
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter((t) => t !== id);
    setOpenTabs(nextTabs);
    if (viewMode === id) {
      if (nextTabs.length > 0) {
        setViewMode(nextTabs[0] as any);
      } else {
        // Find default or do nothing
      }
    }
  };

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex items-center gap-2 h-10 w-full overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-[#141414] p-1 shadow-inner overflow-hidden flex-shrink-0">
          {openTabs.map((tabId) => {
            const tab = tabs.find((t) => t.id === tabId);
            if (!tab) return null;
            const isActive = viewMode === tabId;

            return (
              <div
                key={tabId}
                onClick={() => setViewMode(tabId as any)}
                className={`group flex items-center h-[26px] rounded-lg transition-all cursor-pointer select-none ${isActive ? "bg-[#2a2a2a] text-white shadow-sm px-2.5 gap-2" : "text-gray-500 hover:bg-[#2a2a2a] hover:text-white px-2.5 gap-1.5"}`}
              >
                <tab.icon
                  size={14}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                {isActive && (
                  <span className="text-[11px] uppercase font-mono tracking-wide">
                    {tab.label}
                  </span>
                )}
                {isActive && (
                  <button
                    onClick={(e) => handleCloseTab(e, tabId)}
                    className="ml-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 hover:bg-red-500/10 rounded overflow-hidden p-0.5 transition-all duration-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setViewMode("new_tab")}
            className={`flex items-center justify-center h-[26px] px-2 rounded-lg transition-all select-none outline-none ${viewMode === "new_tab" ? "bg-[#2a2a2a] text-white shadow-sm" : "text-gray-500 hover:bg-[#2a2a2a] hover:text-white"}`}
            title="New Tab"
          >
            <Plus
              size={14}
              className={viewMode === "new_tab" ? "opacity-100" : "opacity-80"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
