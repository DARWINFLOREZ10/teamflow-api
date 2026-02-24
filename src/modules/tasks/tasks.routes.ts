import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission.middleware';
import { tenantMiddleware } from '../../middleware/tenant.middleware';
import { createTaskController, listTasksController, updateTaskStatusController } from './tasks.controller';

export const tasksRoutes = Router();

tasksRoutes.use(authMiddleware, tenantMiddleware);
tasksRoutes.get('/', requirePermission('tasks.read'), listTasksController);
tasksRoutes.post('/', requirePermission('tasks.write'), createTaskController);
tasksRoutes.patch('/:taskId/status', requirePermission('tasks.write'), updateTaskStatusController);
