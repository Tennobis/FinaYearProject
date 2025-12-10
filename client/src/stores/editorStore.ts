import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isUnsaved: boolean;
  language: string;
  createdAt: number;
  modifiedAt: number;
}

export interface EditorState {
  openFiles: EditorFile[];
  activeFileId: string;
  selectedFileInExplorer: string | null;
  panelSizes: { explorer: number; editor: number; preview: number };
  showExplorer: boolean;
  showPreview: boolean;
  editorSettings: {
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
    formatOnSave: boolean;
  };
}

export interface EditorActions {
  // File management
  openFile: (file: EditorFile) => void;
  closeFile: (fileId: string) => void;
  closeAllFiles: () => void;
  closeOtherFiles: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFile: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => void;
  saveAllFiles: () => void;
  renameFile: (fileId: string, newName: string) => void;

  // Panel management
  setPanelSizes: (sizes: { explorer: number; editor: number; preview: number }) => void;
  setShowExplorer: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;

  // Explorer
  setSelectedFileInExplorer: (fileId: string | null) => void;

  // Settings
  updateEditorSetting: (key: string, value: unknown) => void;
  resetEditorSettings: () => void;

  // Reset
  reset: () => void;
}

const defaultEditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  formatOnSave: true,
};

const defaultPanelSizes = { explorer: 20, editor: 60, preview: 20 };

export const useEditorStore = create<EditorState & EditorActions>()(
  persist(
    (set) => ({
      // Initial state
      openFiles: [],
      activeFileId: '',
      selectedFileInExplorer: null,
      panelSizes: defaultPanelSizes,
      showExplorer: true,
      showPreview: true,
      editorSettings: defaultEditorSettings,

      // File management
      openFile: (file: EditorFile) =>
        set((state) => {
          const exists = state.openFiles.find((f) => f.id === file.id);
          if (exists) {
            return { activeFileId: file.id };
          }
          return {
            openFiles: [...state.openFiles, file],
            activeFileId: file.id,
          };
        }),

      closeFile: (fileId: string) =>
        set((state) => {
          const filtered = state.openFiles.filter((f) => f.id !== fileId);
          return {
            openFiles: filtered,
            activeFileId:
              state.activeFileId === fileId
                ? filtered.length > 0
                  ? filtered[0].id
                  : ''
                : state.activeFileId,
          };
        }),

      closeAllFiles: () =>
        set({
          openFiles: [],
          activeFileId: '',
        }),

      closeOtherFiles: (fileId: string) =>
        set((state) => {
          const file = state.openFiles.find((f) => f.id === fileId);
          if (file) {
            return {
              openFiles: [file],
              activeFileId: file.id,
            };
          }
          return {};
        }),

      setActiveFile: (fileId: string) =>
        set((state) => {
          if (state.openFiles.some((f) => f.id === fileId)) {
            return { activeFileId: fileId };
          }
          return {};
        }),

      updateFile: (fileId: string, content: string) =>
        set((state) => ({
          openFiles: state.openFiles.map((f) =>
            f.id === fileId
              ? { ...f, content, isUnsaved: true, modifiedAt: Date.now() }
              : f
          ),
        })),

      saveFile: (fileId: string) =>
        set((state) => ({
          openFiles: state.openFiles.map((f) =>
            f.id === fileId ? { ...f, isUnsaved: false } : f
          ),
        })),

      saveAllFiles: () =>
        set((state) => ({
          openFiles: state.openFiles.map((f) => ({
            ...f,
            isUnsaved: false,
          })),
        })),

      renameFile: (fileId: string, newName: string) =>
        set((state) => ({
          openFiles: state.openFiles.map((f) =>
            f.id === fileId ? { ...f, name: newName } : f
          ),
        })),

      // Panel management
      setPanelSizes: (sizes) =>
        set({
          panelSizes: sizes,
        }),

      setShowExplorer: (show) =>
        set({
          showExplorer: show,
        }),

      setShowPreview: (show) =>
        set({
          showPreview: show,
        }),

      // Explorer
      setSelectedFileInExplorer: (fileId) =>
        set({
          selectedFileInExplorer: fileId,
        }),

      // Settings
      updateEditorSetting: (key, value) =>
        set((state) => ({
          editorSettings: {
            ...state.editorSettings,
            [key]: value,
          },
        })),

      resetEditorSettings: () =>
        set({
          editorSettings: defaultEditorSettings,
        }),

      // Reset
      reset: () =>
        set({
          openFiles: [],
          activeFileId: '',
          selectedFileInExplorer: null,
          panelSizes: defaultPanelSizes,
          showExplorer: true,
          showPreview: true,
          editorSettings: defaultEditorSettings,
        }),
    }),
    {
      name: 'editor-store',
      partialize: (state) => ({
        panelSizes: state.panelSizes,
        showExplorer: state.showExplorer,
        showPreview: state.showPreview,
        editorSettings: state.editorSettings,
      }),
    }
  )
);
