import { loadCurrentPlan } from "../context.service";
import type { ToolHandler } from "../types/tool.types";

/** READ_PLAN: the goal's living plan with task statuses, dependencies and accepted results. */
export const readPlan: ToolHandler = async (_input, ctx) => {
  const plan = await loadCurrentPlan(ctx.goalId);
  if (!plan) return { plan: null };
  return {
    title: plan.title,
    summary: plan.summary,
    status: plan.status,
    tasks: plan.tasks.map(({ sequence, title, status, result, dependsOn }) => ({ sequence, title, status, result, dependsOn })),
  };
};
