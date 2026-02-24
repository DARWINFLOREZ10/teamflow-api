import { Role } from './enums';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        tenantId: string;
        role: Role;
      };
    }
  }
}

export {};
