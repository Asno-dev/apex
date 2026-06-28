import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Package, X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export function PackageManager() {
  const { currentProject, addDependency, removeDependency } = useStore();
  const [newPackage, setNewPackage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  if (!currentProject) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPackage.trim()) {
      addDependency(newPackage.trim());
      setNewPackage('');
    }
  };

  const dependencies = Object.entries(currentProject.dependencies || {});

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-[#161B22] text-gray-300 hover:text-white rounded-md text-sm font-medium transition-all border border-white/5 hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Manage NPM Packages"
        >
          <Package size={14} aria-hidden="true" /> Dependencies
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl border border-white/10 bg-[#161B22] p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Package size={18} className="text-indigo-400" />
              NPM Dependencies
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleAdd} className="flex items-center gap-2 mb-6">
            <input
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              placeholder="Package name (e.g. lodash, framer-motion)"
              className="flex-1 bg-[#0E1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!newPackage.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#161B22]"
            >
              <Plus size={16} /> Add
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {dependencies.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No dependencies added yet.</p>
            ) : (
              dependencies.map(([name, version]) => (
                <div key={name} className="flex items-center justify-between bg-[#0E1117] border border-white/5 p-3 rounded-lg group">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200">{name}</span>
                    <span className="text-xs text-gray-500">v{version}</span>
                  </div>
                  <button
                    onClick={() => removeDependency(name)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Remove ${name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
