import { Role } from '../../types/enums';
import { prisma } from '../../config/prisma';
import { invalidateByPrefix } from '../../config/redis';

export async function getRolePermissions(tenantId: string) {
  const rows = await prisma.rolePermission.findMany({
    where: { tenantId },
    include: { permission: true },
    orderBy: { role: 'asc' }
  });

  return rows.map((row: { id: string; role: string; permission: { key: string } }) => ({
    id: row.id,
    role: row.role,
    permission: row.permission.key
  }));
}

export async function assignPermissionToRole(tenantId: string, role: Role, permissionKey: string) {
  const permission = await prisma.permission.findUnique({ where: { key: permissionKey } });
  if (!permission) {
    return null;
  }

  const rolePermission = await prisma.rolePermission.upsert({
    where: {
      tenantId_role_permissionId: {
        tenantId,
        role,
        permissionId: permission.id
      }
    },
    update: {},
    create: {
      tenantId,
      role,
      permissionId: permission.id
    }
  });

  await invalidateByPrefix(`perm:${tenantId}:${role}`);
  return rolePermission;
}

export async function revokePermissionFromRole(tenantId: string, role: Role, permissionKey: string) {
  const permission = await prisma.permission.findUnique({ where: { key: permissionKey } });
  if (!permission) {
    return null;
  }

  const deleted = await prisma.rolePermission.deleteMany({
    where: {
      tenantId,
      role,
      permissionId: permission.id
    }
  });

  await invalidateByPrefix(`perm:${tenantId}:${role}`);
  return deleted.count;
}
