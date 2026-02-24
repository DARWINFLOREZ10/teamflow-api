import { NextFunction, Request, Response } from 'express';
import { hasPermission } from '../lib/permissions';
import { HttpError } from './error.middleware';

export function requirePermission(permission: string) {
  return async function permissionMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
    if (!req.auth) {
      throw new HttpError(401, 'Unauthorized');
    }

    const allowed = await hasPermission(req.auth.tenantId, req.auth.role, permission);
    if (!allowed) {
      throw new HttpError(403, `Missing permission: ${permission}`);
    }

    next();
  };
}
