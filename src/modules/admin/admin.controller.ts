import { Role } from '../../types/enums';
import { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/error.middleware';
import * as adminService from './admin.service';

const permissionSchema = z.object({
  role: z.nativeEnum(Role),
  permission: z.string().min(3)
});

export async function getRolePermissionsController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const result = await adminService.getRolePermissions(req.auth.tenantId);
  res.status(200).json(result);
}

export async function assignPermissionController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const input = permissionSchema.parse(req.body);
  const result = await adminService.assignPermissionToRole(req.auth.tenantId, input.role, input.permission);
  if (!result) {
    throw new HttpError(404, 'Permission not found');
  }

  res.status(201).json({ message: 'Permission assigned' });
}

export async function revokePermissionController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const input = permissionSchema.parse(req.body);
  const count = await adminService.revokePermissionFromRole(req.auth.tenantId, input.role, input.permission);
  if (count === null) {
    throw new HttpError(404, 'Permission not found');
  }

  res.status(200).json({ message: count ? 'Permission revoked' : 'Nothing to revoke' });
}
