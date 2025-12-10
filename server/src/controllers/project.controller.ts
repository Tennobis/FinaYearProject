import { Response } from 'express';
import { Templates } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateTemplateFiles } from '../utils/templates';
import prisma from '../config/prisma';

interface PaginationQuery {
  page?: string;
  limit?: string;
  template?: string;
  search?: string;
}

/**
 * GET /api/projects
 * Get all user projects with pagination and filtering
 */
export const getAllProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const query = req.query as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const template = query.template as Templates | undefined;
    const search = query.search || '';

    // Build where clause for filtering
    const where: any = {
      userId: req.userId,
    };

    if (template) {
      where.template = template;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.playground.count({ where });

    // Fetch projects with pagination
    const projects = await prisma.playground.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        template: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.status(200).json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/projects/:id
 * Get single project with all its files
 */
export const getProjectById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const project = await prisma.playground.findUnique({
      where: { id },
      include: {
        templateFiles: true,
        Starmark: {
          where: { userId: req.userId },
        },
      },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Check if user owns the project
    if (project.userId !== req.userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.status(200).json({
      ...project,
      isStarred: project.Starmark.length > 0,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/projects
 * Create new project with template
 */
export const createProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, description, template } = req.body;

    if (!title || !template) {
      res.status(400).json({ message: 'Title and template are required' });
      return;
    }

    // Validate template
    const validTemplates = Object.values(Templates);
    if (!validTemplates.includes(template)) {
      res.status(400).json({ message: `Invalid template. Must be one of: ${validTemplates.join(', ')}` });
      return;
    }

    // Generate default files for the template
    const templateFiles = generateTemplateFiles(template);

    // Create project with template files
    const project = await prisma.playground.create({
      data: {
        title,
        description: description || null,
        template,
        userId: req.userId,
        templateFiles: {
          create: {
            content: templateFiles,
          },
        },
      },
      include: {
        templateFiles: true,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PUT /api/projects/:id
 * Update project metadata
 */
export const updateProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, template } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await prisma.playground.findUnique({
      where: { id },
    });

    if (!existingProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (existingProject.userId !== req.userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    // Validate template if provided
    if (template) {
      const validTemplates = Object.values(Templates);
      if (!validTemplates.includes(template)) {
        res.status(400).json({ message: `Invalid template. Must be one of: ${validTemplates.join(', ')}` });
        return;
      }
    }

    // Update project
    const updatedProject = await prisma.playground.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(template && { template }),
      },
      include: {
        templateFiles: true,
      },
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * DELETE /api/projects/:id
 * Delete project and all associated files
 */
export const deleteProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Check if project exists and belongs to user
    const project = await prisma.playground.findUnique({
      where: { id },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.userId !== req.userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    // Delete project (cascade delete will handle files and starmarks)
    await prisma.playground.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/projects/:id/clone
 * Clone project with all files
 */
export const cloneProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title } = req.body;

    // Check if original project exists
    const originalProject = await prisma.playground.findUnique({
      where: { id },
      include: {
        templateFiles: true,
      },
    });

    if (!originalProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Get original files content
    const originalFiles = originalProject.templateFiles[0];

    // Create cloned project
    const clonedProject = await prisma.playground.create({
      data: {
        title: title || `${originalProject.title} (Clone)`,
        description: originalProject.description,
        template: originalProject.template,
        userId: req.userId,
        templateFiles: {
          create: {
            content: originalFiles?.content || {},
          },
        },
      },
      include: {
        templateFiles: true,
      },
    });

    res.status(201).json(clonedProject);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
