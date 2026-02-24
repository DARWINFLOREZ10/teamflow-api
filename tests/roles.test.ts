import { NextFunction, Request, Response } from 'express';
import { requirePermission } from '../src/middleware/requirePermission.middleware';

jest.mock('../src/lib/permissions', () => ({
  hasPermission: jest.fn()
}));

import { hasPermission } from '../src/lib/permissions';

describe('Role permission middleware', () => {
  it('allows request when permission exists', async () => {
    (hasPermission as jest.Mock).mockResolvedValue(true);

    const middleware = requirePermission('projects.read');
    const req = {
      auth: { userId: 'u1', tenantId: 't1', role: 'ADMIN' }
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('throws when permission is missing', async () => {
    (hasPermission as jest.Mock).mockResolvedValue(false);

    const middleware = requirePermission('projects.write');
    const req = {
      auth: { userId: 'u1', tenantId: 't1', role: 'USER' }
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await expect(middleware(req, res, next)).rejects.toThrow('Missing permission: projects.write');
  });
});
