import { NextFunction, Request, Response } from 'express';
import { HttpError } from './error.middleware';

export function tenantMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const headerTenant = req.header('x-tenant-id');
  if (headerTenant && headerTenant !== req.auth.tenantId) {
    throw new HttpError(403, 'Tenant mismatch');
  }

  next();
}
