export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  BLOCKED: "BLOCKED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

/** Statuses after which a Task never runs again by itself. */
export const FINISHED_TASK_STATUSES: readonly string[] = [TaskStatus.COMPLETED, TaskStatus.CANCELLED];

/** Statuses of Tasks that still have work left (cancelled when the goal is cancelled). */
export const OPEN_TASK_STATUSES: readonly string[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED];
