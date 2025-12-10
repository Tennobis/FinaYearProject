/**
 * EditorDemo.tsx
 *
 * Complete demo showing all Monaco Editor features.
 * Use this as reference for your implementation.
 */

import { useState } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { EditorSettingsPanel, type EditorSettings } from './EditorSettingsPanel';
import { EditorLanguageSelector } from './EditorLanguageSelector';

const DEMO_FILES = {
  typescript: {
    name: 'example.ts',
    language: 'typescript',
    content: `// TypeScript Example with Full Type Support
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

const processUser = (user: User): string => {
  return \`\${user.name} (\${user.email})\`;
};

// Usage example
(async () => {
  try {
    const user = await fetchUser(1);
    console.log(processUser(user));
  } catch (error) {
    console.error('Error:', error);
  }
})();
`,
  },

  react: {
    name: 'App.tsx',
    language: 'tsx',
    content: `import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
}

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="border p-4 rounded">
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-gray-600">\${product.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
`,
  },

  css: {
    name: 'styles.css',
    language: 'css',
    content: `/* Modern CSS with Utilities */

:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --accent: #ec4899;
  --background: #0f172a;
  --foreground: #f1f5f9;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button--primary {
  background-color: var(--primary);
  color: white;
}

.button--primary:hover {
  background-color: #2563eb;
}

.card {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Responsive Grid */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .button {
    width: 100%;
  }
}
`,
  },

  json: {
    name: 'config.json',
    language: 'json',
    content: `{
  "name": "my-browser-ide",
  "version": "1.0.0",
  "description": "A modern browser-based IDE with Monaco Editor",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.5.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  },
  "keywords": [
    "browser-ide",
    "monaco-editor",
    "code-editor",
    "react"
  ]
}
`,
  },

  javascript: {
    name: 'utils.js',
    language: 'javascript',
    content: `// JavaScript Utilities

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Fetch promise
 */
export async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}
`,
  },
};

interface EditorDemoState {
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

export const EditorDemo = () => {
  const [activeTab, setActiveTab] = useState('typescript');
  const [settings, setSettings] = useState<EditorDemoState>({
    theme: 'dark',
    fontSize: 14,
    lineNumbers: true,
    minimap: true,
    wordWrap: true,
    formatOnSave: true,
    autoSave: true,
    tabSize: 2,
    fontLigatures: true,
  });

  const [savedContent, setSavedContent] = useState<string>('');

  const currentFile = DEMO_FILES[activeTab as keyof typeof DEMO_FILES];

  const handleSave = (content: string) => {
    setSavedContent(content);
    console.log('File saved:', { name: currentFile.name, content });
  };

  const handleSettingsChange = (newSettings: EditorSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold">Monaco Editor Demo</h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete VS Code editor integration for your browser IDE
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs and Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Object.entries(DEMO_FILES).map(([key, file]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <EditorLanguageSelector
              value={currentFile.language}
              onChange={() => {}}
            />
            <EditorSettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            fileId={activeTab}
            content={currentFile.content}
            language={currentFile.language}
            theme={settings.theme}
            onChange={() => {}}
            onSave={handleSave}
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 text-sm text-gray-400">
          <div className="flex items-center justify-between">
            <div>
              {currentFile.name} • {currentFile.language.toUpperCase()} •{' '}
              {settings.theme === 'dark' ? '🌙 Dark' : '☀️ Light'} • Font size: {settings.fontSize}px
            </div>
            {savedContent && (
              <div className="text-green-400">✓ Last saved: {new Date().toLocaleTimeString()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorDemo;
