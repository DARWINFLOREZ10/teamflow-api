/**
 * Local enum mirrors of the Prisma schema enums.
 * Compatible with Prisma 6.x where enums are accessed via $Enums namespace.
 */
export const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
