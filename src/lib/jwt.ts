import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessPayload {
  sub: string;
  tenantId: string;
  role: string;
}

export interface RefreshPayload {
  sub: string;
  tenantId: string;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn']
  });
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn']
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshPayload;
}
