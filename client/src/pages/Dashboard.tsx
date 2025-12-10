import { useEffect, useState } from 'react';
import {
  useProjectStore,
  type Project,
} from '@/stores/projectStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { ProjectSkeleton } from '@/components/dashboard/ProjectSkeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { TEMPLATES } from '@/components/dashboard/templateIcons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Plus, Grid3x3, List, Moon, Sun, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const cloneProject = useProjectStore((state) => state.cloneProject);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTemplate =
      selectedTemplate === 'all' || project.template === selectedTemplate;
    return matchesSearch && matchesTemplate;
  });

  const handleDeleteProject = async (projectId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleCloneProject = async (project: Project) => {
    const cloneName = prompt(
      'Enter name for cloned project:',
      `${project.name} (Copy)`
    );
    if (cloneName && cloneName.trim()) {
      try {
        await cloneProject(project.id, cloneName);
      } catch (error) {
        console.error('Failed to clone project:', error);
      }
    }
  };

  const handleEditProject = (project: Project) => {
    navigate(`/editor/${project.id}`);
  };

  const handleOpenProject = (project: Project) => {
    navigate(`/editor/${project.id}`);
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  ProjectHub
                </h1>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsDark(!isDark)}
                  variant="ghost"
                  size="sm"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/auth/login')}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Project</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="w-full sm:flex-1">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-full sm:w-[180px] dark:bg-slate-800 dark:text-white dark:border-slate-700">
                    <SelectValue placeholder="Filter by template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Templates</SelectItem>
                    {TEMPLATES.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template.charAt(0).toUpperCase() + template.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="px-3"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="px-3"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid/List */}
          {loading ? (
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectSkeleton key={i} />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            projects.length === 0 ? (
              <EmptyState onCreateProject={() => setCreateModalOpen(true)} />
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">
                  No projects match your filters
                </p>
              </div>
            )
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpenProject}
                  onEdit={handleEditProject}
                  onClone={handleCloneProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </main>

        {/* Create Project Modal */}
        <CreateProjectModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </div>
    </div>
  );
}
