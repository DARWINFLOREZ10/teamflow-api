import bcrypt from 'bcryptjs';
import { Role } from '../../types/enums';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { sha256 } from '../../lib/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { addDuration } from '../../lib/time';
import { HttpError } from '../../middleware/error.middleware';
import { ensureRedisConnection, redis } from '../../config/redis';

interface MemberRecord {
  id: string;
  userId: string;
  tenantId: string;
  role: Role;
  createdAt: Date;
}

interface UserWithMembership {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  memberships: MemberRecord[];
}

const roleMatrix: Record<Role, string[]> = {
  ADMIN: ['projects.read', 'projects.write', 'tasks.read', 'tasks.write', 'members.manage', 'permissions.manage'],
  MANAGER: ['projects.read', 'projects.write', 'tasks.read', 'tasks.write'],
  USER: ['projects.read', 'tasks.read']
};

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function pickMembership(user: UserWithMembership, tenantId?: string): MemberRecord {
  if (!user.memberships.length) {
    throw new HttpError(403, 'User has no tenant membership');
  }

  if (tenantId) {
    const membership = user.memberships.find((item: MemberRecord) => item.tenantId === tenantId);
    if (!membership) {
      throw new HttpError(403, 'Tenant access denied');
    }
    return membership;
  }

  return user.memberships[0];
}

async function buildTokens(userId: string, tenantId: string, role: Role): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: userId, tenantId, role });
  const refreshToken = signRefreshToken({ sub: userId, tenantId });

  const tokenHash = sha256(refreshToken);
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      tenantId,
      expiresAt: addDuration(new Date(), env.jwtRefreshExpiresIn)
    }
  });

  await ensureRedisConnection();
  await redis.set(`session:${tokenHash}`, JSON.stringify({ userId, tenantId }), 'EX', 60 * 60 * 24 * 7);

  return { accessToken, refreshToken };
}

async function cloneDefaultPermissionsToTenant(tenantId: string): Promise<void> {
  const permissions = await prisma.permission.findMany();

  for (const role of Object.keys(roleMatrix) as Role[]) {
    for (const key of roleMatrix[role]) {
      const permission = permissions.find((perm: { id: string; key: string }) => perm.key === key);
      if (!permission) {
        continue;
      }
      await prisma.rolePermission.create({
        data: {
          tenantId,
          role,
          permissionId: permission.id
        }
      });
    }
  }
}

export async function registerTenant(input: {
  name: string;
  email: string;
  password: string;
  tenantName: string;
  tenantSlug: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'Email already exists');
  }

  const slugExists = await prisma.tenant.findUnique({ where: { slug: input.tenantSlug } });
  if (slugExists) {
    throw new HttpError(409, 'Tenant slug already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const tenant = await prisma.tenant.create({
    data: {
      name: input.tenantName,
      slug: input.tenantSlug
    }
  });

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword
    }
  });

  const membership = await prisma.membership.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: Role.ADMIN
    }
  });

  await cloneDefaultPermissionsToTenant(tenant.id);

  const tokens = await buildTokens(user.id, tenant.id, membership.role);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    tenant,
    role: membership.role,
    ...tokens
  };
}

export async function login(input: { email: string; password: string; tenantId?: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { memberships: true }
  });

  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!validPassword) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const membership = pickMembership(user, input.tenantId);
  const tokens = await buildTokens(user.id, membership.tenantId, membership.role);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    tenantId: membership.tenantId,
    role: membership.role,
    memberships: user.memberships,
    ...tokens
  };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }

  const tokenHash = sha256(refreshToken);

  await ensureRedisConnection();
  const session = await redis.get(`session:${tokenHash}`);
  if (!session) {
    throw new HttpError(401, 'Refresh session expired');
  }

  const dbToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!dbToken || dbToken.revokedAt || dbToken.expiresAt < new Date()) {
    throw new HttpError(401, 'Refresh token is not valid');
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_tenantId: {
        userId: payload.sub,
        tenantId: payload.tenantId
      }
    }
  });

  if (!membership) {
    throw new HttpError(403, 'Membership not found');
  }

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() }
  });
  await redis.del(`session:${tokenHash}`);

  return buildTokens(payload.sub, payload.tenantId, membership.role);
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = sha256(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  await ensureRedisConnection();
  await redis.del(`session:${tokenHash}`);
}
