import type { TaskRow } from "./task.types";
import type { PlanStatus as PlanStatusValues } from "../constants/plan.constants";

/** One of the PlanStatus values (see constants/plan.constants.ts). */
export type PlanStatus = (typeof PlanStatusValues)[keyof typeof PlanStatusValues];

/** The Goal's living plan with all its tasks. */
export interface PlanWithTasks {
  ID: string;
  title: string;
  summary?: string | null;
  status: string;
  tasks: TaskRow[];
}

/** A plan the user may approve or send back (status PROPOSED). */
export interface ProposedPlanRef {
  ID: string;
  goal_ID: string;
}
