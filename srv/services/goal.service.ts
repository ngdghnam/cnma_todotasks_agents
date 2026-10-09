import { Readable } from "node:stream";
import cds from "@sap/cds";
import JSZip from "jszip";
import { Artifacts, Goals, Plans, Users } from "#cds-models/cnma/todotasks";
import { fail } from "../utils/errors";
import { ensureGoalContext, loadCurrentPlan } from "../agents/context.service";
import { isPlanning, startPlanning, stopGoal } from "../agents/orchestrator.service";
import { appendMessage, getOrCreateSession } from "./session.service";
import { AUTO_USER_EMAIL_DOMAIN, GoalStatus } from "../constants/goal.constants";
import { PlanStatus } from "../constants/plan.constants";
import type { ArtifactsDownload } from "../types/goal.types";

const { SELECT, INSERT, UPDATE } = cds.ql;

/** The Users row for the authenticated user; created on first use. */
export async function resolveOwner(username: string): Promise<string> {
  const user = await SELECT.one.from(Users).columns("ID").where({ username });
  if (user) return user.ID!;
  const ID = cds.utils.uuid();
  await INSERT.into(Users).entries({ ID, username, email: `${username}@${AUTO_USER_EMAIL_DOMAIN}` });
  return ID;
}

/** Goal persisted: give it a GoalContext (r1), a conversation and its first message. */
export async function initializeGoal(goalId: string): Promise<void> {
  const goal = await SELECT.one.from(Goals, goalId).columns("title", "description");
  await ensureGoalContext(goalId);
  await getOrCreateSession(goalId);
  await appendMessage(goalId, "USER", [goal?.title, goal?.description].filter(Boolean).join("\n"));
}

/** (Re)generate the plan. Allowed until the user approved it. Start it after commit. */
export async function prepareReplanning(goalId: string): Promise<void> {
  const goal = await SELECT.one.from(Goals, goalId).columns("status");
  if (!goal) fail(404, "GOAL_NOT_FOUND", `Goal ${goalId} not found`);
  if (goal.status === GoalStatus.CANCELLED || goal.status === GoalStatus.COMPLETED) {
    fail(409, "GOAL_CLOSED", `Goal is ${goal.status}`);
  }
  if (isPlanning(goalId)) fail(409, "PLANNING_RUNNING", "Planning is already running for this goal");

  const plan = await loadCurrentPlan(goalId);
  if (plan?.status === PlanStatus.ACTIVE) {
    fail(409, "PLAN_EXECUTING", "The plan is executing. Goal-change impact analysis is not implemented yet");
  }
  if (plan) await UPDATE.entity(Plans, plan.ID).set({ status: PlanStatus.DRAFT });
}

/** Background agents must see committed data, so start them after the request committed. */
export function startPlanningAfterCommit(goalId: string): void {
  startPlanning(goalId, { reanalyze: true, trigger: "USER" });
}

/** Marks the goal CANCELLED; returns false when it already was. */
export async function cancelGoal(goalId: string): Promise<boolean> {
  const goal = await SELECT.one.from(Goals, goalId).columns("status");
  if (!goal) fail(404, "GOAL_NOT_FOUND", `Goal ${goalId} not found`);
  if (goal.status === GoalStatus.CANCELLED) return false;
  await UPDATE.entity(Goals, goalId).set({ status: GoalStatus.CANCELLED });
  await appendMessage(goalId, "SYSTEM", "Goal cancelled by user.");
  return true;
}

/** Running agents check the committed goal status, so stop them after commit. */
export function stopAgentsAfterCommit(goalId: string): void {
  stopGoal(goalId);
}

/** All accepted Artifacts of a goal as one zip, streamed by the OData function. */
export async function buildArtifactsZip(goalId: string): Promise<ArtifactsDownload> {
  const goal = await SELECT.one.from(Goals, goalId).columns("title");
  if (!goal) fail(404, "GOAL_NOT_FOUND", `Goal ${goalId} not found`);
  const files = await SELECT.from(Artifacts).columns("path", "content").where({ goal_ID: goalId });
  if (!files.length) fail(404, "NO_ARTIFACTS", "This goal has no accepted files yet");

  const zip = new JSZip();
  for (const file of files) zip.file(file.path!, file.content ?? "");
  const stream = zip.generateNodeStream({ type: "nodebuffer", streamFiles: true, compression: "DEFLATE" });

  const name = (goal.title ?? "goal").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  return {
    // JSZip returns a polyfilled stream; wrap() adapts it to a native Readable.
    value: new Readable().wrap(stream),
    mimetype: "application/zip",
    filename: `${name || "goal"}.zip`,
  };
}
