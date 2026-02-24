import { prisma } from '../../config/prisma';
import { ensureRedisConnection, invalidateByPrefix, redis } from '../../config/redis';

const PROJECT_LIST_TTL_SECONDS = 90;

export async function listProjects(tenantId: string) {
  const cacheKey = `tenant:${tenantId}:projects:list`;
  await ensureRedisConnection();

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const projects = await prisma.project.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });

  await redis.set(cacheKey, JSON.stringify(projects), 'EX', PROJECT_LIST_TTL_SECONDS);
  return projects;
}

export async function createProject(input: {
  tenantId: string;
  name: string;
  description?: string;
  createdById: string;
}) {
  const project = await prisma.project.create({
    data: input
  });

  await invalidateByPrefix(`tenant:${input.tenantId}:projects:`);
  return project;
}

export async function deleteProject(tenantId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
  if (!project) {
    return null;
  }

  await prisma.project.delete({ where: { id: projectId } });
  await invalidateByPrefix(`tenant:${tenantId}:projects:`);
  await invalidateByPrefix(`tenant:${tenantId}:tasks:`);
  return project;
}
