import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Search,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

interface FileExplorerProps {
  onFileSelect: (file: {
    id: string;
    name: string;
    path: string;
    content: string;
    language: string;
    isUnsaved: boolean;
  }) => void;
}

const MOCK_TREE: FileNode[] = [
  {
    id: '1',
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'components',
        path: '/src/components',
        type: 'folder',
        children: [
          {
            id: '3',
            name: 'dashboard',
            path: '/src/components/dashboard',
            type: 'folder',
            children: [
              {
                id: '4',
                name: 'ProjectCard.tsx',
                path: '/src/components/dashboard/ProjectCard.tsx',
                type: 'file',
                language: 'typescript',
              },
              {
                id: '5',
                name: 'Dashboard.tsx',
                path: '/src/components/dashboard/Dashboard.tsx',
                type: 'file',
                language: 'typescript',
              },
            ],
          },
          {
            id: '6',
            name: 'common',
            path: '/src/components/common',
            type: 'folder',
            children: [
              {
                id: '7',
                name: 'Button.tsx',
                path: '/src/components/common/Button.tsx',
                type: 'file',
                language: 'typescript',
              },
            ],
          },
        ],
      },
      {
        id: '8',
        name: 'App.tsx',
        path: '/src/App.tsx',
        type: 'file',
        language: 'typescript',
      },
      {
        id: '9',
        name: 'index.tsx',
        path: '/src/index.tsx',
        type: 'file',
        language: 'typescript',
      },
    ],
  },
  {
    id: '10',
    name: 'public',
    path: '/public',
    type: 'folder',
    children: [
      {
        id: '11',
        name: 'index.html',
        path: '/public/index.html',
        type: 'file',
        language: 'html',
      },
    ],
  },
  {
    id: '12',
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
  },
];

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(['1', '2', '3'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const getFileIcon = (type: 'file' | 'folder', name: string, expanded: boolean) => {
    if (type === 'folder') {
      return expanded ? (
        <FolderOpen className="w-4 h-4 text-yellow-500" />
      ) : (
        <Folder className="w-4 h-4 text-yellow-600" />
      );
    }

    const extension = name.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, React.ReactNode> = {
      tsx: <FileText className="w-4 h-4 text-blue-400" />,
      ts: <FileText className="w-4 h-4 text-blue-400" />,
      jsx: <FileText className="w-4 h-4 text-yellow-400" />,
      js: <FileText className="w-4 h-4 text-yellow-400" />,
      json: <FileText className="w-4 h-4 text-yellow-300" />,
      html: <FileText className="w-4 h-4 text-red-400" />,
      css: <FileText className="w-4 h-4 text-blue-300" />,
      md: <FileText className="w-4 h-4 text-slate-400" />,
    };

    return iconMap[extension || ''] || <FileText className="w-4 h-4 text-slate-400" />;
  };

  const renderNode = (node: FileNode, level: number): React.ReactNode => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.type === 'folder' && node.children && node.children.length > 0;

    const handleClick = () => {
      if (node.type === 'file') {
        onFileSelect({
          id: node.id,
          name: node.name,
          path: node.path,
          content: '',
          language: node.language || 'plaintext',
          isUnsaved: false,
        });
      } else {
        toggleExpanded(node.id);
      }
    };

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded cursor-pointer group text-sm',
            'text-slate-300 hover:text-slate-50'
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={handleClick}
        >
          {node.type === 'folder' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(node.id)}
              className="h-5 w-5 p-0 hover:bg-slate-700"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}

          {!hasChildren && node.type === 'folder' && <div className="w-5" />}

          {getFileIcon(node.type, node.name, isExpanded)}

          <span className="flex-1 truncate">{node.name}</span>

          {node.type === 'file' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-800 border-slate-700"
              >
                <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-slate-50">
                  Copy Path
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-slate-50">
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 focus:text-slate-50">
                  Rename
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-300 flex-1">Explorer</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-800"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-slate-600"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        <div className="py-2">
          {MOCK_TREE.map((node) => renderNode(node, 0))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 px-3 py-2 text-xs text-slate-500">
        <div>Files: 8</div>
        <div>Folders: 4</div>
      </div>
    </div>
  );
};

export default FileExplorer;
