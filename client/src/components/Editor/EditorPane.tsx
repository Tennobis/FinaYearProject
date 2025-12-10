import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileText } from 'lucide-react';

interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}

interface EditorPaneProps {
  activeFile: OpenFile | undefined;
  onContentChange?: (content: string) => void;
}

const LANGUAGE_MAP: Record<string, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  tsx: 'typescript',
  jsx: 'javascript',
  css: 'css',
  html: 'html',
  json: 'json',
  markdown: 'markdown',
  python: 'python',
  sql: 'sql',
  bash: 'bash',
  shell: 'shell',
  yaml: 'yaml',
  xml: 'xml',
};

const EditorPane: React.FC<EditorPaneProps> = ({ activeFile, onContentChange }) => {
  const [lineCount, setLineCount] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange?.(value);
      setLineCount(value.split('\n').length);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 text-slate-400">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No file selected</p>
        <p className="text-sm mt-2">Open a file from the explorer to get started</p>
      </div>
    );
  }

  const monacoLanguage = LANGUAGE_MAP[activeFile.language] || 'plaintext';

  return (
    <div className="flex flex-col h-full w-full bg-slate-950">
      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={activeFile.content}
          onChange={handleChange}
          theme="vs-dark"
          options={{
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
          }}
          onMount={(editor) => {
            const lineCount = editor.getModel()?.getLineCount() || 0;
            setLineCount(lineCount);

            editor.onDidChangeCursorPosition((e) => {
              setCursorPosition({
                line: e.position.lineNumber,
                col: e.position.column,
              });
            });
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="border-t border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            Line {cursorPosition.line} Col {cursorPosition.col}
          </span>
          <span>
            {lineCount} lines {activeFile.content.length} characters
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="uppercase tracking-wider font-medium text-slate-300">
            {activeFile.language}
          </span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
};

export default EditorPane;
