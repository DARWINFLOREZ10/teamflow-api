import { NextFunction, Request, Response } from 'express';
import { Role } from '../types/enums';
import { verifyAccessToken } from '../lib/jwt';
import { HttpError } from './error.middleware';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing bearer token');
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role as Role
    };
    next();
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}
