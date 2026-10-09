import cds from "@sap/cds";
import { Plans, Tasks } from "#cds-models/cnma/todotasks";
import { fail } from "../utils/errors";
import { startExecution } from "../agents/orchestrator.service";
import { PlanStatus } from "../constants/plan.constants";
import { TaskStatus } from "../constants/task.constants";

const { SELECT, UPDATE } = cds.ql;

/** BLOCKED -> TODO; returns the goal whose execution must resume. */
export async function retryTask(taskId: string): Promise<string> {
  const task = await SELECT.one.from(Tasks, taskId).columns("status", "plan_ID");
  if (!task) fail(404, "TASK_NOT_FOUND", `Task ${taskId} not found`);
  if (task.status !== TaskStatus.BLOCKED) fail(409, "TASK_NOT_BLOCKED", `Task is ${task.status}`);

  const plan = await SELECT.one.from(Plans, task.plan_ID!).columns("status", "goal_ID");
  if (plan?.status !== PlanStatus.ACTIVE) fail(409, "PLAN_NOT_ACTIVE", "Only tasks of an approved plan can be retried");

  await UPDATE.entity(Tasks, taskId).set({ status: TaskStatus.TODO });
  return plan.goal_ID!;
}

export function resumeExecution(goalId: string): void {
  startExecution(goalId, "Blocked task retried by user");
}
