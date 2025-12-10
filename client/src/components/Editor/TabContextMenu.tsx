import React, { useEffect, useRef } from 'react';
import { Copy, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpenFile {
  id: string;
  name: string;
  path: string;
  isUnsaved: boolean;
}

interface TabContextMenuProps {
  x: number;
  y: number;
  fileId: string;
  onClose: () => void;
  onCloseTab: (fileId: string) => void;
  onCloseAll: () => void;
  openFiles: OpenFile[];
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
  x,
  y,
  fileId,
  onClose,
  onCloseTab,
  onCloseAll,
  openFiles,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const file = openFiles.find((f) => f.id === fileId);
  const otherTabs = openFiles.filter((f) => f.id !== fileId).length > 0;

  const handleCopyPath = () => {
    if (file) {
      navigator.clipboard.writeText(file.path);
      onClose();
    }
  };

  const handleCloseOthers = () => {
    openFiles.forEach((f) => {
      if (f.id !== fileId) {
        onCloseTab(f.id);
      }
    });
    onClose();
  };

  const handleRevealInExplorer = () => {
    // This would integrate with the file explorer
    console.log('Reveal in explorer:', file?.path);
    onClose();
  };

  // Position menu to stay within viewport
  let menuX = x;
  let menuY = y;

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuX = Math.max(0, x - rect.width);
      }
      if (rect.bottom > window.innerHeight) {
        menuY = Math.max(0, y - rect.height);
      }
    }
  });

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${menuX}px`,
        top: `${menuY}px`,
      }}
      className="z-50 min-w-[200px] rounded-md border border-slate-700 bg-slate-800 shadow-lg"
    >
      <div className="flex flex-col py-1">
        <button
          onClick={() => onCloseTab(fileId)}
          className={cn(
            'px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors text-left'
          )}
        >
          Close
        </button>

        {otherTabs && (
          <>
            <button
              onClick={handleCloseOthers}
              className={cn(
                'px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors text-left'
              )}
            >
              Close Others
            </button>
          </>
        )}

        <button
          onClick={onCloseAll}
          className={cn(
            'px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors text-left'
          )}
        >
          Close All
        </button>

        <div className="my-1 h-px bg-slate-700" />

        <button
          onClick={handleCopyPath}
          className={cn(
            'px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors text-left flex items-center gap-2'
          )}
        >
          <Copy className="w-4 h-4" />
          Copy File Path
        </button>

        <button
          onClick={handleRevealInExplorer}
          className={cn(
            'px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors text-left flex items-center gap-2'
          )}
        >
          <Folder className="w-4 h-4" />
          Reveal in Explorer
        </button>
      </div>
    </div>
  );
};

export default TabContextMenu;
