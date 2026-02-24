import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission.middleware';
import { tenantMiddleware } from '../../middleware/tenant.middleware';
import {
  createProjectController,
  deleteProjectController,
  listProjectsController
} from './projects.controller';

export const projectsRoutes = Router();

projectsRoutes.use(authMiddleware, tenantMiddleware);
projectsRoutes.get('/', requirePermission('projects.read'), listProjectsController);
projectsRoutes.post('/', requirePermission('projects.write'), createProjectController);
projectsRoutes.delete('/:projectId', requirePermission('projects.write'), deleteProjectController);
