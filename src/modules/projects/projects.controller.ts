import { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/error.middleware';
import * as projectsService from './projects.service';

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

export async function listProjectsController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const projects = await projectsService.listProjects(req.auth.tenantId);
  res.status(200).json(projects);
}

export async function createProjectController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const payload = createSchema.parse(req.body);
  const project = await projectsService.createProject({
    tenantId: req.auth.tenantId,
    createdById: req.auth.userId,
    name: payload.name,
    description: payload.description
  });

  res.status(201).json(project);
}

export async function deleteProjectController(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const projectId = String(req.params.projectId);
  const project = await projectsService.deleteProject(req.auth.tenantId, projectId);
  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  res.status(200).json({ message: 'Project deleted' });
}
