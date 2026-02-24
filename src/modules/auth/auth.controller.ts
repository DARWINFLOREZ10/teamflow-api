import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  tenantName: z.string().min(2),
  tenantSlug: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantId: z.string().optional()
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

export async function registerTenantController(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const result = await authService.registerTenant(input);
  res.status(201).json(result);
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.status(200).json(result);
}

export async function refreshController(req: Request, res: Response): Promise<void> {
  const input = refreshSchema.parse(req.body);
  const result = await authService.refresh(input.refreshToken);
  res.status(200).json(result);
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  const input = refreshSchema.parse(req.body);
  await authService.logout(input.refreshToken);
  res.status(200).json({ message: 'Logged out' });
}
