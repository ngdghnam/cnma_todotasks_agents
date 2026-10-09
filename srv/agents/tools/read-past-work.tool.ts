import cds from "@sap/cds";
import { Artifacts, Goals } from "#cds-models/cnma/todotasks";
import { findSimilarPastGoals, listArtifactPaths, loadCurrentPlan } from "../context.service";
import { PAST_WORK_SEARCH_LIMIT } from "../constants/tool.constants";
import { GoalStatus } from "../../constants/goal.constants";
import type { ReadPastWorkInput, ToolHandler } from "../types/tool.types";

const { SELECT } = cds.ql;

/**
 * READ_PAST_WORK: the owner's previously COMPLETED goals.
 *  - { query }          -> most similar past goals
 *  - { goalId }         -> that goal's plan and file tree
 *  - { goalId, path }   -> content of one past file (to copy structure / style)
 * Only goals of the same owner are visible.
 */
export const readPastWork: ToolHandler = async (raw, ctx) => {
  const input = toReadPastWorkInput(raw);
  const current = await SELECT.one.from(Goals, ctx.goalId).columns("owner_ID", "title", "description");
  if (!current?.owner_ID) return { goals: [] };

  if (!input.goalId) {
    const query = input.query ?? `${current.title} ${current.description ?? ""}`;
    return { goals: await findSimilarPastGoals(current.owner_ID, ctx.goalId, query, PAST_WORK_SEARCH_LIMIT) };
  }

  const past = await SELECT.one.from(Goals, input.goalId).columns("owner_ID", "status", "title");
  if (!past || past.owner_ID !== current.owner_ID || past.status !== GoalStatus.COMPLETED) {
    throw new Error(`Goal ${input.goalId} is not a completed goal of this owner`);
  }

  if (input.path) {
    const file = await SELECT.one
      .from(Artifacts)
      .columns("path", "content")
      .where({ goal_ID: input.goalId, path: input.path });
    return file ?? { error: `No file ${input.path} in goal ${input.goalId}` };
  }

  const plan = await loadCurrentPlan(input.goalId);
  return {
    title: past.title,
    plan: plan && { title: plan.title, tasks: plan.tasks.map((t) => `${t.sequence}. ${t.title}`) },
    files: await listArtifactPaths(input.goalId),
  };
};

/** Model-supplied input is untrusted: keep only well-typed fields. */
function toReadPastWorkInput(raw: Record<string, unknown>): ReadPastWorkInput {
  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);
  return { query: text(raw.query), goalId: text(raw.goalId), path: text(raw.path) };
}
