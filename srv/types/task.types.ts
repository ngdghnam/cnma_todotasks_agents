import type { TaskStatus as TaskStatusValues } from "../constants/task.constants";

/** One of the TaskStatus values (see constants/task.constants.ts). */
export type TaskStatus = (typeof TaskStatusValues)[keyof typeof TaskStatusValues];

/** A Task as read for planning / scheduling, with its dependencies resolved. */
export interface TaskRow {
  ID: string;
  sequence: number;
  title: string;
  description?: string | null;
  status: string;
  result?: string | null;
  /** Sequences of the Tasks this one depends on. */
  dependsOn: number[];
  dependsOnIds: string[];
}
