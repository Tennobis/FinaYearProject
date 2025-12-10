import { create } from 'zustand';
import type { editor } from 'monaco-editor';

export interface FileState {
  id: string;
  name: string;
  content: string;
  language: string;
  isModified: boolean;
  isSaved: boolean;
  lastSavedAt?: Date;
}

export interface EditorState {
  // Current file
  currentFileId: string | null;
  files: Map<string, FileState>;

  // Editor instance
  editor: editor.IStandaloneCodeEditor | null;
  monaco: typeof import('monaco-editor') | null;

  // Settings
  theme: 'light' | 'dark';
  fontSize: number;
  lineNumbers: boolean;
  minimap: boolean;
  wordWrap: boolean;
  formatOnSave: boolean;
  autoSave: boolean;
  tabSize: number;
  fontLigatures: boolean;

  // UI state
  isSettingsPanelOpen: boolean;
  errorMarkers: editor.IMarker[];

  // Actions
  setCurrentFile: (fileId: string) => void;
  addFile: (file: FileState) => void;
  updateFileContent: (fileId: string, content: string) => void;
  updateFileLanguage: (fileId: string, language: string) => void;
  deleteFile: (fileId: string) => void;
  getFile: (fileId: string) => FileState | undefined;
  getAllFiles: () => FileState[];

  // Editor actions
  setEditorState: (state: Partial<{ editor: editor.IStandaloneCodeEditor; monaco: typeof import('monaco-editor') }>) => void;
  getEditor: () => editor.IStandaloneCodeEditor | null;
  getMonaco: () => typeof import('monaco-editor') | null;

  // Settings actions
  updateSettings: (settings: Partial<Omit<EditorState, 'files' | 'editor' | 'monaco' | 'errorMarkers'>>) => void;
  setSetting: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;

  // UI actions
  setSettingsPanelOpen: (open: boolean) => void;
  setErrorMarkers: (markers: editor.IMarker[]) => void;

  // Utility
  markFileAsModified: (fileId: string) => void;
  markFileAsSaved: (fileId: string) => void;
}

const createEditorStore = () => {
  return create<EditorState>((set, get) => ({
    // Initial state
    currentFileId: null,
    files: new Map(),
    editor: null,
    monaco: null,
    theme: 'dark',
    fontSize: 14,
    lineNumbers: true,
    minimap: true,
    wordWrap: true,
    formatOnSave: true,
    autoSave: true,
    tabSize: 2,
    fontLigatures: true,
    isSettingsPanelOpen: false,
    errorMarkers: [],

    // File actions
    setCurrentFile: (fileId: string) => {
      set({ currentFileId: fileId });
    },

    addFile: (file: FileState) => {
      const files = new Map(get().files);
      files.set(file.id, file);
      set({ files });
    },

    updateFileContent: (fileId: string, content: string) => {
      const files = new Map(get().files);
      const file = files.get(fileId);
      if (file) {
        files.set(fileId, {
          ...file,
          content,
          isModified: true,
        });
        set({ files });
      }
    },

    updateFileLanguage: (fileId: string, language: string) => {
      const files = new Map(get().files);
      const file = files.get(fileId);
      if (file) {
        files.set(fileId, {
          ...file,
          language,
        });
        set({ files });
      }
    },

    deleteFile: (fileId: string) => {
      const files = new Map(get().files);
      files.delete(fileId);
      const state = get();
      if (state.currentFileId === fileId) {
        set({
          files,
          currentFileId: files.size > 0 ? files.keys().next().value : null,
        });
      } else {
        set({ files });
      }
    },

    getFile: (fileId: string) => {
      return get().files.get(fileId);
    },

    getAllFiles: () => {
      return Array.from(get().files.values());
    },

    // Editor actions
    setEditorState: (editorState) => {
      set({
        editor: editorState.editor || null,
        monaco: editorState.monaco || null,
      });
    },

    getEditor: () => {
      return get().editor;
    },

    getMonaco: () => {
      return get().monaco;
    },

    // Settings actions
    updateSettings: (settings) => {
      set(settings as any);
    },

    setSetting: <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
      set({ [key]: value } as any);
    },

    // UI actions
    setSettingsPanelOpen: (open: boolean) => {
      set({ isSettingsPanelOpen: open });
    },

    setErrorMarkers: (markers: editor.IMarker[]) => {
      set({ errorMarkers: markers });
    },

    // Utility
    markFileAsModified: (fileId: string) => {
      const files = new Map(get().files);
      const file = files.get(fileId);
      if (file) {
        files.set(fileId, {
          ...file,
          isModified: true,
        });
        set({ files });
      }
    },

    markFileAsSaved: (fileId: string) => {
      const files = new Map(get().files);
      const file = files.get(fileId);
      if (file) {
        files.set(fileId, {
          ...file,
          isModified: false,
          isSaved: true,
          lastSavedAt: new Date(),
        });
        set({ files });
      }
    },
  }));
};

export const useEditorStore = createEditorStore();
