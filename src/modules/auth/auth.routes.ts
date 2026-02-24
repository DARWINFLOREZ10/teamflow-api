import { Router } from 'express';
import {
  loginController,
  logoutController,
  refreshController,
  registerTenantController
} from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register-tenant', registerTenantController);
authRoutes.post('/login', loginController);
authRoutes.post('/refresh', refreshController);
authRoutes.post('/logout', logoutController);
