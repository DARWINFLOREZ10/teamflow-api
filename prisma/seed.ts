import { PrismaClient } from '@prisma/client';
import { Role } from '../src/types/enums';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const permissionKeys = [
  'projects.read',
  'projects.write',
  'tasks.read',
  'tasks.write',
  'members.manage',
  'permissions.manage'
];

const roleMatrix: Record<Role, string[]> = {
  ADMIN: [...permissionKeys],
  MANAGER: ['projects.read', 'projects.write', 'tasks.read', 'tasks.write'],
  USER: ['projects.read', 'tasks.read']
};

async function main() {
  await Promise.all(
    permissionKeys.map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key }
      })
    )
  );

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp'
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      name: 'Acme Admin',
      email: 'admin@acme.com',
      passwordHash: await bcrypt.hash('Admin123!', 10)
    }
  });

  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: admin.id, tenantId: tenant.id } },
    update: { role: Role.ADMIN },
    create: {
      userId: admin.id,
      tenantId: tenant.id,
      role: Role.ADMIN
    }
  });

  const permissions = await prisma.permission.findMany();
  await prisma.rolePermission.deleteMany({ where: { tenantId: tenant.id } });

  for (const role of Object.keys(roleMatrix) as Role[]) {
    for (const key of roleMatrix[role]) {
      const permission = permissions.find((perm: { id: string; key: string }) => perm.key === key);
      if (!permission) {
        continue;
      }
      await prisma.rolePermission.create({
        data: {
          tenantId: tenant.id,
          role,
          permissionId: permission.id
        }
      });
    }
  }

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
