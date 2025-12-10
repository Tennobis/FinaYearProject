import { type Project } from '@/stores/projectStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { MoreVertical, Copy, Trash2, Edit, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TEMPLATE_ICONS } from './templateIcons';

interface ProjectCardProps {
  project: Project;
  onOpen?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onClone?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  onOpen,
  onEdit,
  onClone,
  onDelete,
}: ProjectCardProps) {
  const TemplateIcon = TEMPLATE_ICONS[project.template] || TEMPLATE_ICONS['react'];

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 to-purple-500/10 transition-opacity duration-200" />
        <TemplateIcon className="h-16 w-16 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate hover:text-blue-600 transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-slate-500 capitalize">{project.template}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onOpen?.(project)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone?.(project)}>
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(project.id)}
                className="text-red-600 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-3 min-h-[2.5rem]">
          {project.description || 'No description provided'}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {formatDistanceToNow(new Date(project.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}
