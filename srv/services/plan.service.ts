import cds from "@sap/cds";
import { Goals, Plans } from "#cds-models/cnma/todotasks";
import { fail } from "../utils/errors";
import { startExecution, startPlanning } from "../agents/orchestrator.service";
import { appendMessage } from "./session.service";
import { GoalStatus } from "../constants/goal.constants";
import { PlanStatus } from "../constants/plan.constants";
import type { ProposedPlanRef } from "../types/plan.types";

const { SELECT, UPDATE } = cds.ql;

async function loadProposedPlan(planId: string): Promise<ProposedPlanRef> {
  const plan = await SELECT.one.from(Plans, planId).columns("ID", "status", "goal_ID");
  if (!plan) fail(404, "PLAN_NOT_FOUND", `Plan ${planId} not found`);
  if (plan.status !== PlanStatus.PROPOSED) {
    fail(409, "PLAN_NOT_PROPOSED", `Only a PROPOSED plan can be reviewed (current status: ${plan.status})`);
  }
  return { ID: plan.ID!, goal_ID: plan.goal_ID! };
}

/** Human approval gate: the user accepts the reviewed plan. Returns the goal to execute. */
export async function approvePlan(planId: string): Promise<string> {
  const plan = await loadProposedPlan(planId);
  await UPDATE.entity(Plans, planId).set({ status: PlanStatus.ACTIVE });
  await UPDATE.entity(Goals, plan.goal_ID).set({ status: GoalStatus.ACTIVE });
  await appendMessage(plan.goal_ID, "USER", "Plan approved.");
  return plan.goal_ID;
}

/** Called after the approval transaction committed. */
export function startApprovedPlan(goalId: string): void {
  startExecution(goalId, "Plan approved by user");
}

/** Human feedback: persisted as conversation, then the Planner revises the plan. */
export async function requestPlanChanges(planId: string, feedback: string): Promise<string> {
  if (!feedback?.trim()) fail(400, "FEEDBACK_REQUIRED", "Describe the changes you want");
  const plan = await loadProposedPlan(planId);
  await UPDATE.entity(Plans, planId).set({ status: PlanStatus.DRAFT });
  await appendMessage(plan.goal_ID, "USER", `Plan change request: ${feedback.trim()}`);
  return plan.goal_ID;
}

export function startPlanRevision(goalId: string): void {
  startPlanning(goalId, { reanalyze: false, trigger: "USER" });
}
