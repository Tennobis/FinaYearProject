/**
 * EditorIntegration.tsx
 *
 * Complete integration example of Monaco Editor with full configuration,
 * settings management, and file handling.
 *
 * Usage:
 * ```tsx
 * <EditorIntegration />
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { useEditorStore, type FileState } from '@/stores/editorStore';
import { MonacoEditor } from './MonacoEditor';
import { EditorSettingsPanel, type EditorSettings } from './EditorSettingsPanel';
import { EditorLanguageSelector } from './EditorLanguageSelector';

interface EditorIntegrationProps {
  initialFiles?: FileState[];
  onFileSave?: (fileId: string, content: string) => Promise<void>;
}

export const EditorIntegration = ({
  initialFiles = [],
  onFileSave,
}: EditorIntegrationProps) => {
  const {
    currentFileId,
    files,
    theme,
    fontSize,
    lineNumbers,
    minimap,
    wordWrap,
    formatOnSave,
    autoSave,
    tabSize,
    fontLigatures,
    setCurrentFile,
    addFile,
    updateFileContent,
    updateFileLanguage,
    getFile,
    updateSettings,
    markFileAsModified,
    markFileAsSaved,
  } = useEditorStore();

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Initialize files on mount
  const initializeFiles = useCallback(() => {
    if (initialFiles.length > 0) {
      initialFiles.forEach((file) => {
        addFile(file);
      });
      if (initialFiles[0]) {
        setCurrentFile(initialFiles[0].id);
      }
    }
  }, [initialFiles, addFile, setCurrentFile]);

  // Call on component mount
  useEffect(() => {
    if (files.size === 0 && initialFiles.length > 0) {
      initializeFiles();
    }
  }, []);

  const currentFile = currentFileId ? getFile(currentFileId) : null;

  const handleEditorChange = useCallback(
    (content: string) => {
      if (currentFileId) {
        updateFileContent(currentFileId, content);
        markFileAsModified(currentFileId);
      }
    },
    [currentFileId, updateFileContent, markFileAsModified]
  );

  const handleFileSave = useCallback(
    async (content: string) => {
      if (!currentFileId || !autoSave) return;

      setIsSaving(true);
      try {
        if (onFileSave) {
          await onFileSave(currentFileId, content);
        }
        markFileAsSaved(currentFileId);
        setLastSaveTime(new Date());
      } catch (error) {
        console.error('Failed to save file:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [currentFileId, autoSave, onFileSave, markFileAsSaved]
  );

  const handleLanguageChange = useCallback(
    (language: string) => {
      if (currentFileId) {
        updateFileLanguage(currentFileId, language);
      }
    },
    [currentFileId, updateFileLanguage]
  );

  const handleSettingsChange = useCallback(
    (settings: EditorSettings) => {
      updateSettings({
        theme: settings.theme,
        fontSize: settings.fontSize,
        lineNumbers: settings.lineNumbers,
        minimap: settings.minimap,
        wordWrap: settings.wordWrap,
        formatOnSave: settings.formatOnSave,
        autoSave: settings.autoSave,
        tabSize: settings.tabSize,
        fontLigatures: settings.fontLigatures,
      });
    },
    [updateSettings]
  );

  const handleFormat = useCallback(async () => {
    // Format the current file
    // This would trigger the format on save action in MonacoEditor
  }, []);

  const fileList = Array.from(files.values());

  if (!currentFile) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No file selected</h2>
          <p className="text-gray-400">Create or open a file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <EditorLanguageSelector
            value={currentFile.language}
            onChange={handleLanguageChange}
          />

          <div className="text-sm text-gray-400">
            {currentFile.name}
            {currentFile.isModified && <span className="ml-2 text-yellow-500">●</span>}
          </div>

          {isSaving && (
            <span className="text-xs text-blue-400 animate-pulse">Saving...</span>
          )}

          {lastSaveTime && !isSaving && (
            <span className="text-xs text-gray-500">
              Saved at {lastSaveTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        <EditorSettingsPanel
          settings={{
            theme,
            fontSize,
            lineNumbers,
            minimap,
            wordWrap,
            formatOnSave,
            autoSave,
            tabSize,
            fontLigatures,
          }}
          onSettingsChange={handleSettingsChange}
          onFormat={handleFormat}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          fileId={currentFile.id}
          content={currentFile.content}
          language={currentFile.language}
          theme={theme}
          onChange={handleEditorChange}
          onSave={handleFileSave}
          readOnly={false}
        />
      </div>

      {/* File tabs (optional) */}
      {fileList.length > 1 && (
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex gap-2 overflow-x-auto">
          {fileList.map((file) => (
            <button
              key={file.id}
              onClick={() => setCurrentFile(file.id)}
              className={`px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
                currentFileId === file.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {file.name}
              {file.isModified && <span className="ml-2 text-yellow-500">●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditorIntegration;
