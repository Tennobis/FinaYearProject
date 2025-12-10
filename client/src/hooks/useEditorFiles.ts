import { useState, useCallback } from 'react';

export interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isUnsaved: boolean;
  language: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const useEditorFiles = (initialFiles: EditorFile[] = []) => {
  const [openFiles, setOpenFiles] = useState<EditorFile[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string>(
    initialFiles.length > 0 ? initialFiles[0].id : ''
  );

  const openFile = useCallback((file: EditorFile) => {
    setOpenFiles((prev) => {
      const exists = prev.some((f) => f.id === file.id);
      if (exists) {
        setActiveFileId(file.id);
        return prev;
      }
      setActiveFileId(file.id);
      return [...prev, file];
    });
  }, []);

  const closeFile = useCallback((fileId: string) => {
    setOpenFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(filtered.length > 0 ? filtered[0].id : '');
      }
      return filtered;
    });
  }, [activeFileId]);

  const closeAllFiles = useCallback(() => {
    setOpenFiles([]);
    setActiveFileId('');
  }, []);

  const closeOtherFiles = useCallback((fileId: string) => {
    setOpenFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        setActiveFileId(file.id);
        return [file];
      }
      return prev;
    });
  }, []);

  const updateFile = useCallback((fileId: string, content: string) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, content, isUnsaved: true, modifiedAt: new Date() }
          : f
      )
    );
  }, []);

  const saveFile = useCallback((fileId: string) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, isUnsaved: false } : f
      )
    );
  }, []);

  const saveAllFiles = useCallback(() => {
    setOpenFiles((prev) => prev.map((f) => ({ ...f, isUnsaved: false })));
  }, []);

  const setActive = useCallback((fileId: string) => {
    if (openFiles.some((f) => f.id === fileId)) {
      setActiveFileId(fileId);
    }
  }, [openFiles]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, name: newName } : f
      )
    );
  }, []);

  const updatePath = useCallback((fileId: string, newPath: string) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, path: newPath } : f
      )
    );
  }, []);

  const getActiveFile = useCallback(() => {
    return openFiles.find((f) => f.id === activeFileId);
  }, [openFiles, activeFileId]);

  const hasUnsavedFiles = useCallback(() => {
    return openFiles.some((f) => f.isUnsaved);
  }, [openFiles]);

  return {
    openFiles,
    activeFileId,
    activeFile: getActiveFile(),
    openFile,
    closeFile,
    closeAllFiles,
    closeOtherFiles,
    updateFile,
    saveFile,
    saveAllFiles,
    setActive,
    renameFile,
    updatePath,
    hasUnsavedFiles,
  };
};
