import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { authRoutes } from './modules/auth/auth.routes';
import { projectsRoutes } from './modules/projects/projects.routes';
import { tasksRoutes } from './modules/tasks/tasks.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { errorMiddleware } from './middleware/error.middleware';

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorMiddleware);
