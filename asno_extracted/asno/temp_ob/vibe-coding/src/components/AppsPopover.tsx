import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Settings2, Plus, LayoutGrid } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TOOL_DESCRIPTIONS, TOOL_LOGOS } from './PluginsManager';

const ALLOWED_APPS = [
  'gmail', 'googledocs', 'googlecalendar', 'googlesheets', 'googlemeet', 'googlemaps', 'googlephotos', 'drive', 'googleslides',
  'excel', 'sharepoint',
  'github',
  'telegram', 'discord',
  'notion'
];

const POPULAR_APPS = ['github', 'gmail', 'googlecalendar', 'notion', 'googledocs', 'googlesheets'];
const RECENT_APPS = ['gmail', 'github', 'googlecalendar', 'notion'];

const APP_NAMES: Record<string, string> = {
  gmail: 'Gmail',
  googledocs: 'Google Docs',
  googlecalendar: 'Google Calendar',
  googlesheets: 'Google Sheets',
  googlemeet: 'Google Meet',
  googlemaps: 'Google Maps',
  googlephotos: 'Google Photos',
  drive: 'Google Drive',
  googleslides: 'Google Slides',
  excel: 'Microsoft Excel',
  sharepoint: 'Microsoft SharePoint',
  github: 'GitHub',
  telegram: 'Telegram',
  discord: 'Discord',
  notion: 'Notion',
};

function getName(id: string) {
  return APP_NAMES[id] || id;
}

function AppLogo({ id, name }: { id: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const src = failed
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(id.replace(/^google/, 'google.') + '.com')}&sz=64`
    : TOOL_LOGOS[id];

  return (
    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/5">
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-5 w-5 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <LayoutGrid size={16} className="text-gray-400" />
      )}
    </div>
  );
}

export function AppsPopover({ children, onManage, onAdd }: { children: React.ReactNode, onManage?: () => void, onAdd?: () => void }) {
  const { connectedPlugins, togglePlugin } = useStore();
  const [open, setOpen] = useState(false);

  const connectedIds = ALLOWED_APPS.filter(id => !!connectedPlugins[id]);

  const closeAndRun = (callback?: () => void) => {
    setOpen(false);
    callback?.();
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className="z-[155] w-[320px] rounded-2xl border border-white/10 bg-[#1a1a1a] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200" 
          sideOffset={8} 
          align="start"
        >
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => closeAndRun(onManage)}
              className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium"
            >
              <Settings2 size={16} className="text-gray-400" />
              <span>Manage connectors</span>
            </button>

              <div className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium cursor-pointer" onClick={() => closeAndRun(onAdd)}>
                <div className="flex items-center gap-3">
                  <Plus size={16} className="text-gray-400" />
                  <span>Add connectors</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-full">
                  <div className="flex -space-x-1">
                    {POPULAR_APPS.slice(0, 3).map((id) => (
                      <div key={id} className="w-4 h-4 rounded-full border border-[#1a1a1a] bg-white/10 overflow-hidden flex items-center justify-center">
                         {TOOL_LOGOS[id] ? (
                            <img src={TOOL_LOGOS[id]} alt={getName(id)} className="h-full w-full object-contain" />
                         ) : (
                            <LayoutGrid size={8} className="text-gray-400" />
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            <div className="h-px bg-white/5 my-1 mx-2" />

            <div className="max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {connectedIds.length > 0 ? (
                <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">Connected tools</div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No connectors added yet.
                </div>
              )}
              {connectedIds.map((id) => {
                const name = getName(id);
                const isConnected = !!connectedPlugins[id];
                return (
                <React.Fragment key={id}>
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <AppLogo id={id} name={name} />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-200 truncate">{name}</span>
                      </div>
                      <span className="max-w-[170px] truncate text-[11px] text-gray-600">{TOOL_DESCRIPTIONS[id] || 'Connect this app.'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isConnected}
                    onClick={() => togglePlugin(id)}
                    className={`flex h-5 w-9 flex-shrink-0 items-center rounded-full p-0.5 transition-colors ${isConnected ? 'bg-emerald-500' : 'bg-white/15'}`}
                  >
                    <span className={`h-4 w-4 rounded-full bg-white transition-transform ${isConnected ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                </React.Fragment>
              )})}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
