import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission.middleware';
import { tenantMiddleware } from '../../middleware/tenant.middleware';
import {
  assignPermissionController,
  getRolePermissionsController,
  revokePermissionController
} from './admin.controller';

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, tenantMiddleware, requirePermission('permissions.manage'));
adminRoutes.get('/permissions', getRolePermissionsController);
adminRoutes.post('/permissions', assignPermissionController);
adminRoutes.delete('/permissions', revokePermissionController);
