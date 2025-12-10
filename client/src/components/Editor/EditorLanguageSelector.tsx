import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { EDITOR_CONFIG } from './editorConfig';

interface EditorLanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  className?: string;
}

const LANGUAGE_ICONS: Record<string, string> = {
  typescript: 'TS',
  javascript: 'JS',
  jsx: 'JSX',
  tsx: 'TSX',
  css: 'CSS',
  scss: 'SCSS',
  less: 'LESS',
  html: 'HTML',
  json: 'JSON',
  xml: 'XML',
  markdown: 'MD',
  python: 'PY',
  java: 'JAVA',
  csharp: 'C#',
  cpp: 'C++',
  sql: 'SQL',
  bash: 'BASH',
  yaml: 'YAML',
  graphql: 'GQL',
};

export const EditorLanguageSelector = ({
  value,
  onChange,
  className = '',
}: EditorLanguageSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-32 ${className}`}>
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {EDITOR_CONFIG.supportedLanguages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">
                {LANGUAGE_ICONS[lang] || lang.toUpperCase()}
              </span>
              <span className="capitalize">{lang}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EditorLanguageSelector;
