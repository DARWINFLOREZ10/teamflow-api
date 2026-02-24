import { Request, Response } from 'express';
import { TaskStatus } from '../../types/enums';
import { z } from 'zod';
import { HttpError } from '../../middleware/error.middleware';
import * as tasksService from './tasks.service';

const createTaskSchema = z.object({
  projectId: z.string().min(5),
  title: z.string().min(2),
  description: z.string().optional(),
  assigneeId: z.string().optional()
});

const statusSchema = z.object({
  status: z.nativeEnum(TaskStatus)
});

export async function listTasksController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const projectId = String(req.query.projectId ?? '');
  if (!projectId) {
    throw new HttpError(400, 'projectId query param is required');
  }

  const tasks = await tasksService.listTasks(req.auth.tenantId, projectId);
  res.status(200).json(tasks);
}

export async function createTaskController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const payload = createTaskSchema.parse(req.body);
  const task = await tasksService.createTask({
    tenantId: req.auth.tenantId,
    projectId: payload.projectId,
    title: payload.title,
    description: payload.description,
    assigneeId: payload.assigneeId
  });

  if (!task) {
    throw new HttpError(404, 'Project not found');
  }

  res.status(201).json(task);
}

export async function updateTaskStatusController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const payload = statusSchema.parse(req.body);
  const taskId = String(req.params.taskId);
  const task = await tasksService.updateTaskStatus(req.auth.tenantId, taskId, payload.status);

  if (!task) {
    throw new HttpError(404, 'Task not found');
  }

  res.status(200).json(task);
}
