/**
 * Editor Component Demo & Examples
 * 
 * This file demonstrates various ways to use and integrate the editor components.
 */

import React from 'react';
import { EditorLayout } from '@/components/Editor';
import { useEditorStore } from '@/stores/editorStore';

/**
 * Basic EditorLayout Demo
 * Minimal setup - uses default state
 */
export const BasicEditorDemo: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <EditorLayout />
    </div>
  );
};

/**
 * EditorLayout with Pre-loaded Files
 * Loads files from store on mount
 */
export const EditorWithFilesDemo: React.FC = () => {
  const { openFile } = useEditorStore();

  React.useEffect(() => {
    // Pre-load some files
    const files = [
      {
        id: 'file-1',
        name: 'index.ts',
        path: '/src/index.ts',
        content: `export const hello = () => {
  console.log('Hello, World!');
};
`,
        isUnsaved: false,
        language: 'typescript',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: 'file-2',
        name: 'styles.css',
        path: '/src/styles.css',
        content: `.container {
  display: flex;
  gap: 1rem;
  padding: 2rem;
}
`,
        isUnsaved: false,
        language: 'css',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: 'file-3',
        name: 'config.json',
        path: '/config.json',
        content: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample project"
}
`,
        isUnsaved: false,
        language: 'json',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
    ];

    files.forEach((file) => openFile(file));
  }, [openFile]);

  return (
    <div className="w-full h-screen">
      <EditorLayout />
    </div>
  );
};

/**
 * EditorLayout with Custom Controls
 * Shows how to manage editor state from outside
 */
export const EditorWithControlsDemo: React.FC = () => {
  const store = useEditorStore();
  const [fontSize, setFontSize] = React.useState(store.editorSettings.fontSize);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    store.updateEditorSetting('fontSize', size);
  };

  const handleSaveAll = () => {
    store.saveAllFiles();
    console.log('All files saved');
  };

  const handleResetLayout = () => {
    store.reset();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950">
      {/* Custom Header with Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-sm font-semibold text-slate-50">Editor Controls</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Font Size:</label>
            <input
              type="range"
              min="10"
              max="20"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-slate-300 w-8">{fontSize}px</span>
          </div>
          <button
            onClick={handleSaveAll}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Save All
          </button>
          <button
            onClick={handleResetLayout}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <EditorLayout />
      </div>
    </div>
  );
};

/**
 * Standalone File Editor Hook Usage
 * Shows how to manage files programmatically
 */
export const EditorStoreExample: React.FC = () => {
  const {
    openFiles,
    activeFileId,
  } = useEditorStore();

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  // openFiles is used in JSX below via the map function

  return (
    <div className="p-4 bg-slate-950 text-slate-50 font-mono text-sm">
      <h2 className="text-lg font-bold mb-4">Editor Store State</h2>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Open Files: ({openFiles.length})</h3>
        <div className="space-y-1 text-xs">
          {openFiles.map((file) => (
            <div
              key={file.id}
              className={`p-2 rounded ${
                file.id === activeFileId
                  ? 'bg-blue-900 text-blue-50'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {file.name} {file.isUnsaved && '●'}
            </div>
          ))}
        </div>
      </div>

      {activeFile && (
        <div className="mb-4 p-3 bg-slate-800 rounded">
          <h3 className="font-semibold mb-2">Active File:</h3>
          <div className="text-xs space-y-1">
            <p>Name: {activeFile.name}</p>
            <p>Path: {activeFile.path}</p>
            <p>Language: {activeFile.language}</p>
            <p>Unsaved: {activeFile.isUnsaved ? 'Yes' : 'No'}</p>
            <p>Content Length: {activeFile.content.length} chars</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Create and Edit a File
 */
export const EditorActionExample: React.FC = () => {
  const { openFile, updateFile, saveFile, openFiles } = useEditorStore();

  const handleCreateFile = () => {
    openFile({
      id: `file-${Date.now()}`,
      name: 'new-file.ts',
      path: '/src/new-file.ts',
      content: '// New file\n',
      isUnsaved: false,
      language: 'typescript',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  };

  const handleEditLatestFile = () => {
    if (openFiles.length > 0) {
      const latestFile = openFiles[openFiles.length - 1];
      updateFile(latestFile.id, latestFile.content + '// Updated\n');
    }
  };

  const handleSaveLatestFile = () => {
    if (openFiles.length > 0) {
      const latestFile = openFiles[openFiles.length - 1];
      saveFile(latestFile.id);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold text-slate-50">File Actions Example</h2>

      <div className="flex gap-2">
        <button
          onClick={handleCreateFile}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
        >
          Create New File
        </button>

        <button
          onClick={handleEditLatestFile}
          disabled={openFiles.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
        >
          Edit Latest File
        </button>

        <button
          onClick={handleSaveLatestFile}
          disabled={openFiles.length === 0}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
        >
          Save Latest File
        </button>
      </div>

      <div className="text-sm text-slate-400">
        {openFiles.length > 0 ? (
          <p>Latest file: {openFiles[openFiles.length - 1].name}</p>
        ) : (
          <p>No files open. Click "Create New File" to start.</p>
        )}
      </div>
    </div>
  );
};

/**
 * Integration with Next.js / External Router
 * Shows how to manage editor state across app
 */
export const EditorIntegrationExample: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const { activeFileId, openFile } = useEditorStore();
  const [loading, setLoading] = React.useState(true);

  // Simulate loading project files
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Load files for project
      openFile({
        id: `${projectId}-main`,
        name: 'main.ts',
        path: `/projects/${projectId}/main.ts`,
        content: `// Project ${projectId} main file\n`,
        isUnsaved: false,
        language: 'typescript',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      });

      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [projectId, openFile]);

  if (loading) {
    return <div className="p-4 text-slate-400">Loading project files...</div>;
  }

  return (
    <div className="w-full h-screen">
      {activeFileId ? (
        <EditorLayout />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
          No files to edit
        </div>
      )}
    </div>
  );
};

export default BasicEditorDemo;
