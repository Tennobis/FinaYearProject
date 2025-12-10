import React from 'react';
import {
  Save,
  SaveAll,
  X,
  Settings,
  Wand2,
  Play,
  FileX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';

interface OpenFile {
  id: string;
  name: string;
  isUnsaved: boolean;
}

interface EditorActionsBarProps {
  activeFile: OpenFile | undefined;
  onSave: () => void;
  onSaveAll: () => void;
  onCloseAll: () => void;
  hasUnsavedFiles: boolean;
}

const EditorActionsBar: React.FC<EditorActionsBarProps> = ({
  activeFile,
  onSave,
  onSaveAll,
  onCloseAll,
  hasUnsavedFiles,
}) => {
  const [formatOnSave, setFormatOnSave] = React.useState(true);
  const [wordWrap, setWordWrap] = React.useState(true);
  const [minimap, setMinimap] = React.useState(true);

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4 bg-slate-900 border-b border-slate-800">
      {/* Left Section - File Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={!activeFile?.isUnsaved}
          title="Save (Ctrl+S)"
          className={cn(
            'gap-2',
            activeFile?.isUnsaved
              ? 'text-slate-50 hover:bg-slate-800'
              : 'text-slate-500 cursor-not-allowed'
          )}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveAll}
          disabled={!hasUnsavedFiles}
          title="Save All (Ctrl+K Ctrl+S)"
          className={cn(
            'gap-2',
            hasUnsavedFiles
              ? 'text-slate-50 hover:bg-slate-800'
              : 'text-slate-500 cursor-not-allowed'
          )}
        >
          <SaveAll className="w-4 h-4" />
          Save All
        </Button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          disabled={!activeFile}
          title="Close (Ctrl+W)"
          className={cn(
            'gap-2',
            activeFile
              ? 'text-slate-50 hover:bg-slate-800'
              : 'text-slate-500 cursor-not-allowed'
          )}
        >
          <X className="w-4 h-4" />
          Close
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCloseAll}
          title="Close All"
          className="gap-2 text-slate-50 hover:bg-slate-800"
        >
          <FileX className="w-4 h-4" />
          Close All
        </Button>
      </div>

      {/* Right Section - Editor Actions & Settings */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!activeFile}
          title="Format Document (Alt+Shift+F)"
          className={cn(
            'gap-2',
            activeFile
              ? 'text-slate-50 hover:bg-slate-800'
              : 'text-slate-500 cursor-not-allowed'
          )}
        >
          <Wand2 className="w-4 h-4" />
          Format
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={!activeFile}
          title="Run/Build"
          className={cn(
            'gap-2',
            activeFile
              ? 'text-green-400 hover:bg-slate-800 hover:text-green-300'
              : 'text-slate-500 cursor-not-allowed'
          )}
        >
          <Play className="w-4 h-4" />
          Run
        </Button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title="Editor Settings"
              className="gap-2 text-slate-50 hover:bg-slate-800"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-800 border-slate-700 w-56"
          >
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Editor Options
            </div>

            <DropdownMenuCheckboxItem
              checked={formatOnSave}
              onCheckedChange={setFormatOnSave}
              className="text-slate-200 focus:bg-slate-700 focus:text-slate-50"
            >
              Format on Save
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={wordWrap}
              onCheckedChange={setWordWrap}
              className="text-slate-200 focus:bg-slate-700 focus:text-slate-50"
            >
              Word Wrap
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={minimap}
              onCheckedChange={setMinimap}
              className="text-slate-200 focus:bg-slate-700 focus:text-slate-50"
            >
              Minimap
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-slate-50 cursor-pointer">
              Theme
            </DropdownMenuItem>

            <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-slate-50 cursor-pointer">
              Font Size
            </DropdownMenuItem>

            <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-slate-50 cursor-pointer">
              Keybindings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-slate-50 cursor-pointer">
              Reset Layout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default EditorActionsBar;
