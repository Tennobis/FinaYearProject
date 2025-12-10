import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import {
    TEMPLATE_ICONS,
    TEMPLATE_NAMES,
    TEMPLATE_DESCRIPTIONS,
    TEMPLATES,
} from './templateIcons';
import { useProjectStore } from '@/stores/projectStore';
import { useNavigate } from 'react-router-dom';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
    open,
    onOpenChange,
}: CreateProjectModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        template: 'react' as string,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProject = useProjectStore((state) => state.createProject);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTemplateSelect = (template: string) => {
        setFormData((prev) => ({ ...prev, template }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title.trim()) {
            setError('Project name is required');
            return;
        }

        setLoading(true);

        try {
            const newProject = await createProject({
                title: formData.title,
                description: formData.description || null,
                template: formData.template,
            });

            // Reset form
            setFormData({ title: '', description: '', template: 'react' as string });
            onOpenChange(false);

            // Navigate to project editor
            navigate(`/editor/${newProject.id}`);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to create project'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] dark:bg-slate-900 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">Create New Project</DialogTitle>
                    <DialogDescription className="dark:text-slate-400">
                        Create a new project by selecting a template and providing project
                        details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Details */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title" className="dark:text-slate-200">Project Name *</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="My Awesome Project"
                                value={formData.title}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description" className="dark:text-slate-200">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="What is your project about?"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div>
                        <Label className="mb-3 block dark:text-slate-200">Select Template</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {TEMPLATES.map((template) => {
                                const Icon = TEMPLATE_ICONS[template] || TEMPLATE_ICONS['react'];
                                const isSelected = formData.template === template;

                                return (
                                    <Card
                                        key={template}
                                        className={`p-4 cursor-pointer transition-all dark:border-slate-700 ${isSelected
                                                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        onClick={() => handleTemplateSelect(template)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`rounded-lg p-2 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm dark:text-white">
                                                    {TEMPLATE_NAMES[template]}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {TEMPLATE_DESCRIPTIONS[template]}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="h-5 w-5 rounded-full bg-blue-500 mt-1" />
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
