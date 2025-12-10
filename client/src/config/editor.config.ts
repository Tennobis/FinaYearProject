import { editor } from 'monaco-editor';

export const DEFAULT_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: true },
  fontSize: 14,
  fontFamily: "'Fira Code', 'Courier New', monospace",
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'off',
  tabSize: 2,
  insertSpaces: true,
  formatOnPaste: true,
  automaticLayout: true,
  padding: { top: 16, bottom: 16 },
  smoothScrolling: true,
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: 'on',
  renderWhitespace: 'selection',
  bracketPairColorization: {
    enabled: true,
  },
  'bracketPairColorization.independentColorPoolPerBracketType': true,
};

export const LANGUAGE_EXTENSIONS: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  tsx: 'tsx',
  jsx: 'jsx',
  css: 'css',
  scss: 'scss',
  html: 'html',
  json: 'json',
  jsonc: 'jsonc',
  markdown: 'md',
  python: 'py',
  sql: 'sql',
  bash: 'sh',
  shell: 'sh',
  yaml: 'yaml',
  yml: 'yml',
  xml: 'xml',
  dockerfile: 'Dockerfile',
};

export const LANGUAGE_MAP: Record<string, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  tsx: 'typescript',
  jsx: 'javascript',
  css: 'css',
  scss: 'scss',
  html: 'html',
  json: 'json',
  jsonc: 'jsonc',
  markdown: 'markdown',
  python: 'python',
  sql: 'sql',
  bash: 'shell',
  shell: 'shell',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  dockerfile: 'dockerfile',
  ts: 'typescript',
  js: 'javascript',
  py: 'python',
  sh: 'shell',
};

export const FILE_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.js': 'javascript',
  '.tsx': 'typescript',
  '.jsx': 'javascript',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.json': 'json',
  '.jsonc': 'jsonc',
  '.md': 'markdown',
  '.py': 'python',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.Dockerfile': 'dockerfile',
  Dockerfile: 'dockerfile',
};

export const DEFAULT_EDITOR_SETTINGS = {
  formatOnSave: true,
  wordWrap: false,
  minimap: true,
  fontSize: 14,
  lineHeight: 1.5,
  tabSize: 2,
};

export interface EditorSettings {
  formatOnSave: boolean;
  wordWrap: boolean;
  minimap: boolean;
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  fontFamily?: string;
  theme?: 'vs-dark' | 'vs-light';
}

export const getEditorSettings = (): EditorSettings => {
  const saved = localStorage.getItem('editor-settings');
  if (saved) {
    try {
      return { ...DEFAULT_EDITOR_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_EDITOR_SETTINGS;
    }
  }
  return DEFAULT_EDITOR_SETTINGS;
};

export const saveEditorSettings = (settings: Partial<EditorSettings>) => {
  const current = getEditorSettings();
  localStorage.setItem('editor-settings', JSON.stringify({ ...current, ...settings }));
};

export const getLanguageFromFileName = (filename: string): string => {
  // Check full extension
  for (const [ext, lang] of Object.entries(FILE_LANGUAGE_MAP)) {
    if (filename.endsWith(ext)) {
      return lang;
    }
  }

  // Check by extension
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext && ext in LANGUAGE_MAP) {
    return LANGUAGE_MAP[ext];
  }

  return 'plaintext';
};
