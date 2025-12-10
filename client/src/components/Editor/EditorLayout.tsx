import React, { useState, useEffect, useCallback } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Terminal,
  FileText,
} from 'lucide-react';
import TabSystem from './TabSystem';
import EditorActionsBar from './EditorActionsBar';
import FileExplorer from './FileExplorer';
import EditorPane from './EditorPane';

export interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isUnsaved: boolean;
  language: string;
}

interface PanelSizes {
  explorer: number;
  editor: number;
  preview: number;
}

const STORAGE_KEY = 'editor-layout-sizes';
const DEFAULT_SIZES: PanelSizes = {
  explorer: 20,
  editor: 60,
  preview: 20,
};

const EditorLayout: React.FC = () => {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([
    {
      id: '1',
      name: 'ProjectCard.tsx',
      path: '/client/src/components/dashboard/ProjectCard.tsx',
      content: `import React from 'react';\nimport { format } from 'date-fns';\n\ninterface ProjectCardProps {\n  name: string;\n  date: Date;\n}\n\nexport const ProjectCard: React.FC<ProjectCardProps> = ({ name, date }) => {\n  return (\n    <div className="card">\n      <h3>{name}</h3>\n      <p>{format(date, 'MMM dd, yyyy')}</p>\n    </div>\n  );\n};\n`,
      isUnsaved: false,
      language: 'typescript',
    },
  ]);

  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [panelSizes, setPanelSizes] = useState<PanelSizes>(DEFAULT_SIZES);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  // Load panel sizes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPanelSizes(JSON.parse(saved));
      } catch {
        setPanelSizes(DEFAULT_SIZES);
      }
    }
  }, []);

  // Save panel sizes to localStorage
  const handlePanelResize = useCallback((sizes: number[]) => {
    const newSizes: PanelSizes = {
      explorer: sizes[0],
      editor: sizes[1],
      preview: sizes[2],
    };
    setPanelSizes(newSizes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSizes));
  }, []);

  const closeFile = useCallback((fileId: string) => {
    setOpenFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = openFiles.filter((f) => f.id !== fileId);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : '');
    }
  }, [activeFileId, openFiles]);

  const closeAllFiles = useCallback(() => {
    setOpenFiles([]);
    setActiveFileId('');
  }, []);

  const updateFile = useCallback((fileId: string, content: string) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, content, isUnsaved: true } : f
      )
    );
  }, []);

  const saveFile = useCallback((fileId: string) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isUnsaved: false } : f))
    );
  }, []);

  const saveAllFiles = useCallback(() => {
    setOpenFiles((prev) => prev.map((f) => ({ ...f, isUnsaved: false })));
  }, []);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd+S: Save
      if (isMeta && e.key === 's') {
        e.preventDefault();
        if (activeFile) saveFile(activeFile.id);
      }

      // Ctrl/Cmd+Shift+S: Save All
      if (isMeta && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        saveAllFiles();
      }

      // Ctrl/Cmd+W: Close Tab
      if (isMeta && e.key === 'w') {
        e.preventDefault();
        if (activeFile) closeFile(activeFile.id);
      }

      // Ctrl/Cmd+K, Ctrl/Cmd+W: Close All
      if (isMeta && e.key === 'k') {
        const nextHandler = (nextE: KeyboardEvent) => {
          if ((nextE.ctrlKey || nextE.metaKey) && nextE.key === 'w') {
            nextE.preventDefault();
            closeAllFiles();
            document.removeEventListener('keydown', nextHandler);
          } else {
            document.removeEventListener('keydown', nextHandler);
          }
        };
        document.addEventListener('keydown', nextHandler);
        setTimeout(() => {
          document.removeEventListener('keydown', nextHandler);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, saveFile, saveAllFiles, closeFile, closeAllFiles]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <EditorActionsBar
          activeFile={activeFile}
          onSave={() => activeFile && saveFile(activeFile.id)}
          onSaveAll={saveAllFiles}
          onCloseAll={closeAllFiles}
          hasUnsavedFiles={openFiles.some((f) => f.isUnsaved)}
        />
      </div>

      {/* Tabs */}
      <TabSystem
        openFiles={openFiles}
        activeFileId={activeFileId}
        onTabClick={setActiveFileId}
        onCloseTab={closeFile}
        onCloseAll={closeAllFiles}
      />

      {/* Main Content Area */}
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handlePanelResize}
        className="flex-1"
      >
        {/* File Explorer Panel */}
        {showExplorer && (
          <>
            <ResizablePanel
              defaultSize={panelSizes.explorer}
              minSize={15}
              maxSize={40}
              className="border-r border-slate-800"
            >
              <FileExplorer
                onFileSelect={(file) => {
                  // Add file to open files if not already open
                  if (!openFiles.find((f) => f.id === file.id)) {
                    setOpenFiles((prev) => [...prev, file]);
                  }
                  setActiveFileId(file.id);
                }}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* Editor Panel */}
        <ResizablePanel
          defaultSize={panelSizes.editor}
          minSize={40}
          className="border-r border-slate-800"
        >
          <EditorPane
            activeFile={activeFile}
            onContentChange={
              activeFile ? (content) => updateFile(activeFile.id, content) : undefined
            }
          />
        </ResizablePanel>

        {/* Preview/Terminal Panel */}
        {showPreview && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={panelSizes.preview} minSize={15}>
              <div className="flex flex-col h-full bg-slate-950">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Terminal className="w-4 h-4" />
                    Preview & Terminal
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-auto text-slate-400 text-sm font-mono">
                  <div className="text-slate-500">Terminal output appears here</div>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Panel Toggle Buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExplorer(!showExplorer)}
          title={showExplorer ? 'Hide Explorer' : 'Show Explorer'}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          <FileText className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? 'Hide Preview' : 'Show Preview'}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700"
        >
          <Terminal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EditorLayout;
