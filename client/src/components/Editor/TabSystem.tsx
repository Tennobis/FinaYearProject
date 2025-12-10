import { useState, useRef } from 'react';
import { X, MoreHorizontal, ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import TabContextMenu from './TabContextMenu';

interface OpenFile {
  id: string;
  name: string;
  path: string;
  isUnsaved: boolean;
  language: string;
}

interface TabSystemProps {
  openFiles: OpenFile[];
  activeFileId: string;
  onTabClick: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCloseAll: () => void;
}

const TabSystem: React.FC<TabSystemProps> = ({
  openFiles,
  activeFileId,
  onTabClick,
  onCloseTab,
  onCloseAll,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileId: string;
  } | null>(null);

  const MAX_VISIBLE_TABS = 10;
  const visibleTabs = openFiles.slice(0, MAX_VISIBLE_TABS);
  const overflowTabs = openFiles.slice(MAX_VISIBLE_TABS);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight =
    tabContainerRef.current &&
    tabContainerRef.current.scrollWidth >
      tabContainerRef.current.clientWidth + scrollPosition;

  const scroll = (direction: 'left' | 'right') => {
    if (!tabContainerRef.current) return;

    const scrollAmount = 200;
    const newPosition =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    tabContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (tabContainerRef.current) {
      setScrollPosition(tabContainerRef.current.scrollLeft);
    }
  };

  const getFileIcon = (language: string) => {
    const iconMap: Record<string, string> = {
      typescript: '{}',
      javascript: '{}',
      tsx: '{}',
      jsx: '{}',
      css: '≡',
      html: '◆',
      json: '[]',
      markdown: '#',
      python: '🐍',
    };
    return iconMap[language] || '📄';
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="flex items-center h-11 gap-1 px-1">
        {/* Scroll Left Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="h-7 w-7 p-0 hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Tabs Container */}
        <div
          ref={tabContainerRef}
          onScroll={handleScroll}
          className="flex-1 flex gap-1 overflow-x-auto overflow-y-hidden scroll-smooth"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {visibleTabs.map((file) => (
            <div
              key={file.id}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  fileId: file.id,
                });
              }}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 h-9 whitespace-nowrap border-b-2 cursor-pointer transition-colors text-sm font-medium',
                activeFileId === file.id
                  ? 'border-blue-500 bg-slate-800 text-slate-50'
                  : 'border-transparent bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              )}
              onClick={() => onTabClick(file.id)}
            >
              <span className="text-xs">{getFileIcon(file.language)}</span>
              <span className="flex-1 truncate">{file.name}</span>
              {file.isUnsaved && (
                <Dot className="w-2 h-2 fill-yellow-500 text-yellow-500 flex-shrink-0" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Scroll Right Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="h-7 w-7 p-0 hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Overflow Menu */}
        {overflowTabs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-slate-800"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              {overflowTabs.map((file) => (
                <DropdownMenuItem
                  key={file.id}
                  onClick={() => onTabClick(file.id)}
                  className={cn(
                    'text-slate-200 focus:bg-slate-700 focus:text-slate-50 cursor-pointer',
                    activeFileId === file.id && 'bg-slate-700'
                  )}
                >
                  <span className="mr-2">{getFileIcon(file.language)}</span>
                  {file.name}
                  {file.isUnsaved && (
                    <Dot className="w-2 h-2 fill-yellow-500 text-yellow-500 ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          fileId={contextMenu.fileId}
          onClose={() => setContextMenu(null)}
          onCloseTab={onCloseTab}
          onCloseAll={onCloseAll}
          openFiles={openFiles}
        />
      )}
    </div>
  );
};

export default TabSystem;
