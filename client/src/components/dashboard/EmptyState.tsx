import { Button } from '@/components/ui/Button';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-lg bg-slate-100 p-6 mb-4">
        <FolderOpen className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No projects yet
      </h3>
      <p className="text-slate-600 text-center mb-6 max-w-sm">
        Get started by creating your first project. Choose from our templates
        to quickly bootstrap your development.
      </p>
      <Button onClick={onCreateProject} size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Create First Project
      </Button>
    </div>
  );
}
