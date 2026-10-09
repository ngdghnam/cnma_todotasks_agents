import cds from "@sap/cds";
import { Goals, Users } from "#cds-models/cnma/todotasks";
import { readGoalContext } from "../context.service";
import type { ToolHandler } from "../types/tool.types";

const { SELECT } = cds.ql;

/** READ_GOAL: the current goal, its accepted analysis and the owner's preferences. */
export const readGoal: ToolHandler = async (_input, ctx) => {
  const goal = await SELECT.one.from(Goals, ctx.goalId).columns("title", "description", "status", "priority", "owner_ID");
  if (!goal) throw new Error(`Goal ${ctx.goalId} not found`);
  const owner = goal.owner_ID ? await SELECT.one.from(Users, goal.owner_ID).columns("preferences") : undefined;
  const { state } = await readGoalContext(ctx.goalId);
  return {
    title: goal.title,
    description: goal.description,
    status: goal.status,
    priority: goal.priority,
    analysis: state.analysis ?? null,
    preferences: owner?.preferences ?? null,
  };
};
