import React, { useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { SearchModal } from './components/SearchModal';
import { SettingsModal } from './components/SettingsModal';
import { ImportModal } from './components/ImportModal';
import { AutomationModal } from './components/AutomationModal';
import { ConnectorsModal } from './components/ConnectorsModal';
import { AISidebar } from './components/AISidebar';
import { FormatMenu } from './components/FormatMenu';
import { CustomDialog } from './components/CustomDialog';
import { NewMenu } from './components/NewMenu';
import CanvasFlow from './components/CanvasFlow';
import MeetingMind from './components/MeetingMind';
import UIForge from './components/UIForge';
import FocusShield from './components/FocusShield';
import { Pomelli } from './components/Pomelli';
import { Opal } from './components/Opal';
import { GoogleFlow } from './components/GoogleFlow';
import { ChartForge } from './components/ChartForge';
import { useApp } from './AppContext';
import { ChevronsRight, Edit } from 'lucide-react';

function App() {
  const { 
    settings, updateSettings, aiSidebarOpen, 
    canvasFlowOpen, setCanvasFlowOpen, 
    meetingMindOpen, setMeetingMindOpen, 
    uiForgeOpen, setUIForgeOpen, 
    focusShieldOpen, setFocusShieldOpen,
    pomelliOpen, opalOpen, googleFlowOpen, chartForgeOpen
  } = useApp() as any;
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`app-container ${settings.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {settings.sidebarCollapsed && (
        <>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setNewMenuOpen(true)}
            title="New — Pages, Blocks, Tools"
            style={{ left: '44px' }}
          >
            <Edit size={16} />
          </button>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => updateSettings({ sidebarCollapsed: false })}
            title="Open Sidebar"
          >
            <ChevronsRight size={16} />
          </button>
        </>
      )}

      {/* Left Collapsible & Resizable Sidebar */}
      <Sidebar />

      {/* Center Main Document Canvas / Tool Views */}
      <div className="main-content" ref={editorRef}>
        {pomelliOpen ? (
          <Pomelli />
        ) : opalOpen ? (
          <Opal />
        ) : googleFlowOpen ? (
          <GoogleFlow />
        ) : chartForgeOpen ? (
          <ChartForge />
        ) : canvasFlowOpen ? (
          <CanvasFlow />
        ) : focusShieldOpen ? (
          <FocusShield />
        ) : meetingMindOpen ? (
          <MeetingMind />
        ) : uiForgeOpen ? (
          <UIForge />
        ) : aiSidebarOpen ? (
          <AISidebar />
        ) : (
          <Editor />
        )}
      </div>

      {/* Search Palette Dialog (Ctrl+K) */}
      <SearchModal />

      {/* Theme and Settings Dialog */}
      <SettingsModal />

      {/* Import File Dialog */}
      <ImportModal />

      {/* Automations Modal */}
      <AutomationModal />

      {/* Composio Connectors Modal */}
      <ConnectorsModal />


      {/* Floating Text Highlighting Formatting Bar */}
      <FormatMenu editorRef={editorRef} />

      {/* Custom Alert/Confirm/Prompt dialog portal */}
      <CustomDialog />

      {/* New Menu (pages, blocks, tools, templates) */}
      {newMenuOpen && <NewMenu onClose={() => setNewMenuOpen(false)} />}
    </div>
  );
}

export default App;
