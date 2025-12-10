import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import * as projectController from '../controllers/project.controller';

const router = Router();

// All project routes require authentication
router.use(authMiddleware);

/**
 * GET /api/projects
 * Get all user projects with pagination and filtering
 */
router.get('/', projectController.getAllProjects);

/**
 * GET /api/projects/:id
 * Get single project with all its files
 */
router.get('/:id', projectController.getProjectById);

/**
 * POST /api/projects
 * Create new project with template
 */
router.post('/', projectController.createProject);

/**
 * PUT /api/projects/:id
 * Update project metadata
 */
router.put('/:id', projectController.updateProject);

/**
 * DELETE /api/projects/:id
 * Delete project and all associated files
 */
router.delete('/:id', projectController.deleteProject);

/**
 * POST /api/projects/:id/clone
 * Clone project with all files
 */
router.post('/:id/clone', projectController.cloneProject);

export default router;
