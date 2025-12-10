import { useRef, useCallback, useEffect } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEditorStore } from '@/stores/editorStore';
import { EDITOR_CONFIG } from './editorConfig';

export interface MonacoEditorProps {
  fileId: string;
  content: string;
  language: string;
  theme?: 'light' | 'dark';
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const MonacoEditor = ({
  content,
  language,
  theme = 'dark',
  onChange,
  onSave,
  className = '',
}: MonacoEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor')>();
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const { setEditorState } = useEditorStore();

  const handleBeforeMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco;
    setupMonacoDefaults(monaco);
    registerCustomKeybindings();
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorState({
      editor,
      monaco,
    });

    // Focus editor
    editor.focus();

    // Setup keybindings
    setupKeybindings(editor, monaco);

    // Setup auto-save
    setupAutoSave(editor);

    // Setup decorations for errors
    setupErrorDecorations(editor);
  };

  const handleChange = useCallback(
    (value: string | undefined) => {
      const newContent = value || '';

      if (onChange) {
        onChange(newContent);
      }

      // Clear previous auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new auto-save timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (onSave) {
          onSave(newContent);
        }
      }, EDITOR_CONFIG.autoSaveDelay);
    },
    [onChange, onSave]
  );

  const setupKeybindings = (
    editor: editor.IStandaloneCodeEditor,
    monaco: typeof import('monaco-editor')
  ) => {
    // Ctrl+S for save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const content = editor.getValue();
      if (onSave) {
        onSave(content);
      }
    });

    // Ctrl+/ for toggle comment
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.trigger('keyboard', 'editor.action.commentLine', {});
    });

    // Ctrl+Space for AI suggestions (placeholder)
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space,
      () => {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
      }
    );

    // Ctrl+Alt+F for format
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => {
        editor.trigger('keyboard', 'editor.action.formatDocument', {});
      }
    );

    // Ctrl+Shift+L for multi-select
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL,
      () => {
        editor.trigger('keyboard', 'editor.action.selectHighlights', {});
      }
    );
  };

  const setupAutoSave = (editor: editor.IStandaloneCodeEditor) => {
    // Auto-save is handled by the onChange handler with a timeout
    editor.onDidChangeModelDecorations(() => {
      // Update error count or other metadata as needed
    });
  };

  const setupErrorDecorations = (editor: editor.IStandaloneCodeEditor) => {
    // Monitor model for diagnostics
    const model = editor.getModel();
    if (model) {
      monacoRef.current?.languages.onLanguage(language, () => {
        // Error decorations are managed by Monaco's built-in features
        // This is enhanced by the TypeScript worker for type checking
      });
    }
  };

  const setupMonacoDefaults = (monaco: typeof import('monaco-editor')) => {
    // Define custom themes if needed
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'keyword', foreground: '569CD6' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineNumbersBackground': '#1E1E1E',
      },
    });

    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'keyword', foreground: '0000FF' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
      },
    });

    // Configure TypeScript options
    const defaults = (monaco.languages.typescript as any).typescriptDefaults;
    defaults.setCompilerOptions({
      target: 7, // ES2020
      module: 99, // ESNext
      lib: ['ES2020', 'DOM'],
      jsx: 4, // React
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    });

    // Add type definitions for common globals
    defaults.addExtraLib(
      `declare const console: any;`,
      'ts:console.d.ts'
    );
  };

  const registerCustomKeybindings = () => {
    // Custom keybindings can be registered here if needed
    // Most are handled in setupKeybindings
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`editor-container ${className}`} style={{ height: '100%' }}>
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={handleChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        options={EDITOR_CONFIG.editorOptions}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            Loading editor...
          </div>
        }
      />
    </div>
  );
};

export default MonacoEditor;
