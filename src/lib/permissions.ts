import { Role } from '../types/enums';
import { prisma } from '../config/prisma';
import { ensureRedisConnection, redis } from '../config/redis';

const PERMISSIONS_TTL_SECONDS = 120;

export async function getPermissionsForRole(tenantId: string, role: Role): Promise<string[]> {
  const key = `perm:${tenantId}:${role}`;
  await ensureRedisConnection();

  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as string[];
  }

  const rows = await prisma.rolePermission.findMany({
    where: { tenantId, role },
    include: { permission: true }
  });

  const permissions = rows.map((row: { permission: { key: string } }) => row.permission.key);
  await redis.set(key, JSON.stringify(permissions), 'EX', PERMISSIONS_TTL_SECONDS);
  return permissions;
}

export async function hasPermission(tenantId: string, role: Role, permission: string): Promise<boolean> {
  const permissions = await getPermissionsForRole(tenantId, role);
  return permissions.includes(permission);
}
