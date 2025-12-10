import type { editor } from 'monaco-editor';

export const EDITOR_CONFIG = {
  autoSaveDelay: 2000, // 2 seconds

  editorOptions: {
    // Layout options
    minimap: {
      enabled: true,
      side: 'right' as const,
      size: 'proportional' as const,
    },
    lineNumbers: 'on' as const,
    glyphMargin: true,
    folding: true,
    foldingHighlight: true,
    foldingImportsByDefault: false,

    // Editor appearance
    fontSize: 14,
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontLigatures: true,
    lineHeight: 1.6,
    letterSpacing: 0,
    padding: {
      top: 16,
      bottom: 16,
    },

    // Text wrapping
    wordWrap: 'on' as const,
    wordWrapColumn: 120,
    wrappingIndent: 'indent' as const,

    // Indentation
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,
    trimAutoWhitespace: true,

    // Whitespace rendering
    renderWhitespace: 'selection' as const,
    renderControlCharacters: false,

    // Cursor
    cursorBlinking: 'blink' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    cursorStyle: 'line' as const,
    cursorWidth: 2,

    // Scrolling
    scrollBeyondLastLine: true,
    scrollBeyondLastColumn: 5,
    smoothScrolling: true,

    // Suggest & IntelliSense
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on' as const,
    snippetSuggestions: 'inline' as const,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    } as any,
    quickSuggestionsDelay: 100,

    // Code actions
    codeActionsOnSave: {
      'source.fixAll': 'explicit',
      'source.fixAll.eslint': 'explicit',
    },

    // Formatting
    formatOnPaste: true,
    formatOnType: true,

    // Bracket matching
    matchBrackets: 'always' as const,
    bracketPairColorization: {
      enabled: true,
      independentColorPoolPerBracketType: true,
    } as any,

    // Semantics
    semanticHighlighting: {
      enabled: true,
    } as any,

    // Guides
    guides: {
      indentation: true,
      bracketPairs: true,
      bracketPairsHorizontal: true,
      highlightActiveBracketPair: true,
      highlightInactiveBracketPairs: 'faded',
    } as any,

    // Other features
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    autoClosingComments: 'always' as const,
    surroundingPairs: true,
    autoIndent: 'full' as const,
    autoSurround: 'languageDefined' as const,

    // Error/warning display
    showUnused: true,
    showDeprecated: true,
    inlayHints: {
      enabled: true,
      fontSize: 12,
      padding: true,
    } as any,

    // Performance
    renderLineHighlight: 'all' as const,
    hideCursorInOverviewRuler: false,

    // Accessibility
    screenReaderAnnounceInlineSuggestion: true,
  } as editor.IStandaloneEditorConstructionOptions,

  // Language-specific configurations
  languageConfigs: {
    typescript: {
      tabSize: 2,
      insertSpaces: true,
      formatOnSave: true,
    },
    javascript: {
      tabSize: 2,
      insertSpaces: true,
      formatOnSave: true,
    },
    jsx: {
      tabSize: 2,
      insertSpaces: true,
      formatOnSave: true,
    },
    tsx: {
      tabSize: 2,
      insertSpaces: true,
      formatOnSave: true,
    },
    css: {
      tabSize: 2,
      insertSpaces: true,
      formatOnSave: true,
    },
    html: {
      tabSize: 2,
      insertSpaces: true,
      formatOnSave: true,
    },
    json: {
      tabSize: 2,
      insertSpaces: true,
      formatOnSave: true,
    },
  },

  // Supported languages for syntax highlighting
  supportedLanguages: [
    'typescript',
    'javascript',
    'jsx',
    'tsx',
    'css',
    'scss',
    'less',
    'html',
    'json',
    'xml',
    'markdown',
    'python',
    'java',
    'csharp',
    'cpp',
    'sql',
    'bash',
    'yaml',
    'graphql',
  ],

  // Keybindings
  keybindings: {
    save: 'Ctrl+S',
    aiSuggestions: 'Ctrl+Space',
    toggleComment: 'Ctrl+/',
    formatDocument: 'Ctrl+Alt+F',
    multiSelect: 'Ctrl+Shift+L',
  },
};

// Type for editor configuration
export type EditorOptions = typeof EDITOR_CONFIG.editorOptions;
