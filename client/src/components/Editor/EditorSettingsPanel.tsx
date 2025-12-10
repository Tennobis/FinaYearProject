import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/DropdownMenu';
import {
  Settings,
  Moon,
  Sun,
  Type,
  Code2,
  Zap,
} from 'lucide-react';

export interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  lineNumbers: boolean;
  minimap: boolean;
  wordWrap: boolean;
  formatOnSave: boolean;
  autoSave: boolean;
  tabSize: number;
  fontLigatures: boolean;
}

interface EditorSettingsPanelProps {
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  onFormat?: () => void;
}

export const EditorSettingsPanel = ({
  settings,
  onSettingsChange,
  onFormat,
}: EditorSettingsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    onSettingsChange({ ...settings, theme });
  };

  const handleFontSizeChange = (size: number) => {
    onSettingsChange({ ...settings, fontSize: size });
  };

  const handleTabSizeChange = (size: number) => {
    onSettingsChange({ ...settings, tabSize: size });
  };

  const toggleSetting = (key: keyof EditorSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="editor-settings">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Editor Settings"
        >
          <Settings size={20} />
        </button>

        <DropdownMenuContent align="end" className="w-56">
          {/* Theme Section */}
          <DropdownMenuLabel className="flex items-center gap-2">
            {settings.theme === 'dark' ? (
              <Moon size={16} />
            ) : (
              <Sun size={16} />
            )}
            Theme
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => handleThemeChange('dark')}
            className={settings.theme === 'dark' ? 'bg-blue-500/20' : ''}
          >
            <Moon size={16} className="mr-2" />
            Dark
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleThemeChange('light')}
            className={settings.theme === 'light' ? 'bg-blue-500/20' : ''}
          >
            <Sun size={16} className="mr-2" />
            Light
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Font Size */}
          <DropdownMenuLabel className="flex items-center gap-2">
            <Type size={16} />
            Font Size
          </DropdownMenuLabel>

          {[12, 14, 16, 18, 20].map((size) => (
            <DropdownMenuItem
              key={size}
              onClick={() => handleFontSizeChange(size)}
              className={settings.fontSize === size ? 'bg-blue-500/20' : ''}
            >
              {size}px
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Tab Size */}
          <DropdownMenuLabel>Tab Size</DropdownMenuLabel>

          {[2, 4, 8].map((size) => (
            <DropdownMenuItem
              key={size}
              onClick={() => handleTabSizeChange(size)}
              className={settings.tabSize === size ? 'bg-blue-500/20' : ''}
            >
              {size} spaces
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Boolean Toggles */}
          <DropdownMenuLabel className="flex items-center gap-2">
            <Code2 size={16} />
            Display Options
          </DropdownMenuLabel>

          <DropdownMenuCheckboxItem
            checked={settings.lineNumbers}
            onCheckedChange={() => toggleSetting('lineNumbers')}
          >
            Line Numbers
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={settings.minimap}
            onCheckedChange={() => toggleSetting('minimap')}
          >
            Minimap
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={settings.wordWrap}
            onCheckedChange={() => toggleSetting('wordWrap')}
          >
            Word Wrap
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={settings.fontLigatures}
            onCheckedChange={() => toggleSetting('fontLigatures')}
          >
            Font Ligatures
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {/* Editor Behavior */}
          <DropdownMenuLabel className="flex items-center gap-2">
            <Zap size={16} />
            Editor Behavior
          </DropdownMenuLabel>

          <DropdownMenuCheckboxItem
            checked={settings.formatOnSave}
            onCheckedChange={() => toggleSetting('formatOnSave')}
          >
            Format on Save
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={settings.autoSave}
            onCheckedChange={() => toggleSetting('autoSave')}
          >
            Auto-Save
          </DropdownMenuCheckboxItem>

          {onFormat && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onFormat}>
                <Code2 size={16} className="mr-2" />
                Format Document
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EditorSettingsPanel;
