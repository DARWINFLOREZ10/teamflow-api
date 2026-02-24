import { TaskStatus } from '../../types/enums';
import { prisma } from '../../config/prisma';
import { ensureRedisConnection, invalidateByPrefix, redis } from '../../config/redis';

const TASK_LIST_TTL_SECONDS = 60;

export async function listTasks(tenantId: string, projectId: string) {
  const cacheKey = `tenant:${tenantId}:tasks:${projectId}`;
  await ensureRedisConnection();

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const tasks = await prisma.task.findMany({
    where: { tenantId, projectId },
    orderBy: { createdAt: 'desc' }
  });

  await redis.set(cacheKey, JSON.stringify(tasks), 'EX', TASK_LIST_TTL_SECONDS);
  return tasks;
}

export async function createTask(input: {
  tenantId: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
}) {
  const project = await prisma.project.findFirst({ where: { id: input.projectId, tenantId: input.tenantId } });
  if (!project) {
    return null;
  }

  const task = await prisma.task.create({
    data: {
      tenantId: input.tenantId,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      assigneeId: input.assigneeId
    }
  });

  await invalidateByPrefix(`tenant:${input.tenantId}:tasks:${input.projectId}`);
  return task;
}

export async function updateTaskStatus(tenantId: string, taskId: string, status: TaskStatus) {
  const task = await prisma.task.findFirst({ where: { id: taskId, tenantId } });
  if (!task) {
    return null;
  }

  const updatedTask = await prisma.task.update({ where: { id: taskId }, data: { status } });
  await invalidateByPrefix(`tenant:${tenantId}:tasks:${task.projectId}`);
  return updatedTask;
}
