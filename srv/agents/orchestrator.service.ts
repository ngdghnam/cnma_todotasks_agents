import cds from "@sap/cds";
import { Artifacts, Goals, Plans, TaskDependencies, Tasks, type Task } from "#cds-models/cnma/todotasks";
import {
  cancelGoalRuns,
  failInterruptedRuns,
  finishOrchestratorRun,
  runAgent,
  startOrchestratorRun,
} from "./agent.service";
import {
  loadCurrentPlan,
  readGoalContext,
  syncGoalContext,
  updateContextSummary,
} from "./context.service";
import { appendMessage, getOrCreateSession } from "../services/session.service";
import { AgentCode } from "./constants/agent.constants";
import { DEFAULT_ORCHESTRATOR_SETTINGS } from "./constants/orchestrator.constants";
import { GoalStatus } from "../constants/goal.constants";
import { PlanStatus } from "../constants/plan.constants";
import { FINISHED_TASK_STATUSES, OPEN_TASK_STATUSES, TaskStatus } from "../constants/task.constants";
import type {
  ContextSummary,
  GoalAnalysis,
  PlanProposal,
  ReviewDecision,
  TaskResult,
} from "./types/agent.types";
import type { GoalContextPatch } from "./types/context.types";
import type {
  AcceptedPlan,
  ExecutionState,
  NextWork,
  OrchestratorSettings,
  PlanningOptions,
  ProposeOptions,
  ProposeResult,
  TodoAgentsEnv,
} from "./types/orchestrator.types";
import type { TaskRow } from "../types/task.types";

/**
 * Orchestrator: "What should happen next?"
 *
 *  Planning pipeline   Goal Analyzer -> Planner <-> Reviewer -> PROPOSED plan
 *                      (then the USER approves or requests changes)
 *  Execution loop      determineNextWork() -> spawn Workers (parallel when
 *                      independent) -> Reviewer -> accept -> sync -> repeat
 *
 * Every spawned run hangs under one Orchestrator root run (AgentRuns.rootRun).
 * The decision policy is plain code, so you can read exactly why work runs.
 */

const { SELECT, INSERT, UPDATE, DELETE } = cds.ql;
const LOG = cds.log("orchestrator");

/** Goals whose planning pipeline is running in this process (no duplicate spawns). */
const planningGoals = new Set<string>();

/** Goals currently executing in this process. */
const executions = new Map<string, ExecutionState>();

// ---------------------------------------------------------------------------
// Entry points (called by business services)
// ---------------------------------------------------------------------------

export function startPlanning(goalId: string, options: PlanningOptions): boolean {
  if (planningGoals.has(goalId) || executions.has(goalId)) return false;
  planningGoals.add(goalId);
  detached(() => runPlanning(goalId, options).finally(() => planningGoals.delete(goalId)));
  return true;
}

export function isPlanning(goalId: string): boolean {
  return planningGoals.has(goalId);
}

export function startExecution(goalId: string, reason: string): void {
  detached(async () => {
    await syncContext(goalId, reason, { phase: "EXECUTION", clearBlockers: true });
    await scheduleGoal(goalId);
  });
}

/** Stop everything for a goal: abort live runs, cancel unfinished tasks, close root runs. */
export function stopGoal(goalId: string): void {
  detached(() => stopGoalNow(goalId));
}

async function stopGoalNow(goalId: string): Promise<void> {
  const aborted = await cancelGoalRuns(goalId);
  const exec = executions.get(goalId);
  executions.delete(goalId);
  if (exec?.rootRunId) await finishOrchestratorRun(exec.rootRunId, "CANCELLED", "Goal cancelled by user");

  const plan = await loadCurrentPlan(goalId);
  if (plan) {
    await UPDATE.entity(Tasks)
      .where({ plan_ID: plan.ID, status: { in: OPEN_TASK_STATUSES } })
      .set({ status: TaskStatus.CANCELLED });
    await UPDATE.entity(Plans, plan.ID).set({ status: PlanStatus.CANCELLED });
  }
  await syncGoalContext(goalId, "Goal cancelled by user", { phase: "CANCELLED", nextAction: "NONE" });
  LOG.info(`goal ${goalId} stopped (${aborted} live run(s) aborted)`);
}

/**
 * After a restart nothing is running any more: fail orphaned runs, put
 * orphaned IN_PROGRESS tasks back to TODO and resume executing goals.
 */
export async function recoverAfterRestart(): Promise<void> {
  const failed = await failInterruptedRuns();
  const orphaned = await UPDATE.entity(Tasks).where({ status: TaskStatus.IN_PROGRESS }).set({ status: TaskStatus.TODO });
  const executing = await SELECT.from(Plans).columns("goal_ID").where({ status: PlanStatus.ACTIVE });
  if (failed || orphaned || executing.length) {
    LOG.info(`recovery: ${failed} run(s) failed, ${orphaned} task(s) reset, resuming ${executing.length} goal(s)`);
  }
  for (const { goal_ID } of executing) {
    detached(() => scheduleGoal(goal_ID!), cds.User.privileged);
  }
}

// ---------------------------------------------------------------------------
// Planning pipeline
// ---------------------------------------------------------------------------

async function runPlanning(goalId: string, options: PlanningOptions): Promise<void> {
  const rootRunId = await startOrchestratorRun(goalId, "PLANNING", options.trigger, "Analyze goal and propose a plan");
  const sessionId = await getOrCreateSession(goalId);

  try {
    // 1. Goal analysis (skipped when only revising the plan after user feedback)
    const { state } = await readGoalContext(goalId);
    if (options.reanalyze || !state.analysis) {
      const analysis = await runAgent<GoalAnalysis>({
        agentCode: AgentCode.GOAL_ANALYZER,
        purpose: "GOAL_ANALYSIS",
        goalId,
        sessionId,
        parentRunId: rootRunId,
        rootRunId,
        triggerType: options.trigger,
        assignment: "Analyze the goal. Fill gaps with the user's preferences and accepted past work.",
      });
      if (analysis.status !== "COMPLETED" || !analysis.output) {
        return await blockPlanning(goalId, rootRunId, `Goal analysis failed: ${analysis.error}`);
      }
      await syncContext(goalId, "Goal analysis accepted", { phase: "PLANNING", analysis: analysis.output }, rootRunId);
    } else {
      await syncContext(goalId, "Plan revision requested", { phase: "PLANNING" }, rootRunId);
    }

    // 2. Planner <-> Reviewer until ACCEPT or attempts are exhausted
    const result = await proposeWithReview<PlanProposal>({
      goalId,
      rootRunId,
      sessionId,
      purpose: "PLAN_GENERATION",
      agentCode: AgentCode.PLANNER,
      assignment:
        "Create the plan for this goal. If a current plan and user change requests exist, revise that plan to address them.",
      reviewAssignment:
        "Review this plan proposal: does it fully achieve the goal, follow the user's preferences, " +
        "use correct dependencies, and address all feedback in the conversation?",
      validate: validatePlanProposal,
    });
    if (!result.accepted) return await blockPlanning(goalId, rootRunId, result.reason);

    // 3. Accepted -> business state. Stored as DRAFT until the context is synced, so
    //    the user cannot approve (and start execution) while planning still writes.
    const plan = await acceptPlan(goalId, result.output);
    await syncContext(
      goalId,
      "Plan accepted by reviewer",
      { phase: "AWAITING_APPROVAL", clearBlockers: true },
      rootRunId,
    );
    await appendMessage(
      goalId,
      "ASSISTANT",
      `Plan "${plan.title}" with ${plan.taskCount} tasks is ready (reviewed in ${result.attempts} attempt(s)). ` +
        "Approve it to start execution, or request changes.",
    );
    await UPDATE.entity(Plans, plan.ID).set({ status: PlanStatus.PROPOSED });
    await finishOrchestratorRun(rootRunId, "COMPLETED", JSON.stringify({ planId: plan.ID, attempts: result.attempts }));
  } catch (err) {
    LOG.error(`planning failed for goal ${goalId}`, err);
    await blockPlanning(goalId, rootRunId, (err as Error).message);
  }
}

async function blockPlanning(goalId: string, rootRunId: string, reason: string): Promise<void> {
  if (await isGoalCancelled(goalId)) return finishOrchestratorRun(rootRunId, "CANCELLED", "Goal cancelled");
  await syncGoalContext(goalId, "Planning blocked", { phase: "BLOCKED", addBlockers: [reason] });
  await appendMessage(goalId, "ASSISTANT", `Planning stopped: ${reason}. Use "generatePlan" to try again.`);
  await finishOrchestratorRun(rootRunId, "FAILED", reason);
}

/** Persist an ACCEPTED plan proposal: tasks + dependencies (plan stays DRAFT). */
async function acceptPlan(goalId: string, proposal: PlanProposal): Promise<AcceptedPlan> {
  // Read outside the tx (planning is exclusive per goal); the tx starts with a write.
  const current = await loadCurrentPlan(goalId);
  if (current && current.status !== PlanStatus.DRAFT && current.status !== PlanStatus.PROPOSED) {
    throw new Error(`Plan ${current.ID} is ${current.status}; replanning executing work needs impact analysis`);
  }

  return cds.tx(async () => {
    let planId = current?.ID;
    if (planId) {
      // Living plan: nothing has executed yet, so its tasks are replaced by the revision.
      await UPDATE.entity(Plans, planId).set({ title: proposal.title, summary: proposal.summary, status: PlanStatus.DRAFT });
      const oldTaskIds = current!.tasks.map((t) => t.ID);
      if (oldTaskIds.length) {
        await DELETE.from(TaskDependencies).where({ task_ID: { in: oldTaskIds } });
        await DELETE.from(Tasks).where({ ID: { in: oldTaskIds } });
      }
    } else {
      planId = cds.utils.uuid();
      await INSERT.into(Plans).entries({
        ID: planId,
        goal_ID: goalId,
        title: proposal.title,
        summary: proposal.summary,
        status: PlanStatus.DRAFT,
      });
    }

    const idByKey = new Map(proposal.tasks.map((t) => [t.key, cds.utils.uuid()]));
    await INSERT.into(Tasks).entries(
      proposal.tasks.map((t, i) => ({
        ID: idByKey.get(t.key),
        plan_ID: planId,
        title: t.title,
        description: t.description,
        priority: t.priority ?? "MEDIUM",
        estimatedMinutes: t.estimatedMinutes,
        sequence: i + 1,
        status: TaskStatus.TODO,
      })),
    );
    const dependencies = proposal.tasks.flatMap((t) =>
      (t.dependsOn ?? []).map((dep) => ({ task_ID: idByKey.get(t.key), dependsOn_ID: idByKey.get(dep) })),
    );
    if (dependencies.length) await INSERT.into(TaskDependencies).entries(dependencies);

    return { ID: planId, title: proposal.title, taskCount: proposal.tasks.length };
  });
}

// ---------------------------------------------------------------------------
// Execution loop
// ---------------------------------------------------------------------------

/**
 * Pure scheduling policy. Given the plan's tasks, decide what happens next.
 *  - a TODO task is ready when every dependency is COMPLETED (or CANCELLED)
 *  - at most maxParallel tasks are IN_PROGRESS at once
 *  - nothing open -> COMPLETE; nothing runnable and nothing running -> BLOCKED
 */
export function determineNextWork(tasks: TaskRow[], maxParallel: number): NextWork {
  const byId = new Map(tasks.map((t) => [t.ID, t]));
  const done = (id: string) => FINISHED_TASK_STATUSES.includes(byId.get(id)?.status ?? "");

  const open = tasks.filter((t) => !FINISHED_TASK_STATUSES.includes(t.status));
  if (!open.length) return { type: "COMPLETE" };

  const running = open.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  const ready = open
    .filter((t) => t.status === TaskStatus.TODO && t.dependsOnIds.every(done))
    .sort((a, b) => a.sequence - b.sequence);
  const slots = maxParallel - running.length;

  if (ready.length && slots > 0) return { type: "SPAWN", tasks: ready.slice(0, slots) };
  if (running.length) return { type: "WAIT", reason: `${running.length} task(s) running` };

  const blocked = open.filter((t) => t.status === TaskStatus.BLOCKED);
  return {
    type: "BLOCKED",
    reason: blocked.length
      ? `Blocked: ${blocked.map((t) => `#${t.sequence} ${t.title}`).join(", ")}`
      : "Remaining tasks have unsatisfiable dependencies",
  };
}

/** Serialize scheduling per goal so two completions never spawn the same work twice. */
function scheduleGoal(goalId: string): Promise<void> {
  const exec = executions.get(goalId) ?? { queue: Promise.resolve() };
  executions.set(goalId, exec);
  exec.queue = exec.queue
    .then(() => scheduleOnce(goalId, exec))
    .catch((err) => LOG.error(`scheduling failed for goal ${goalId}`, err));
  return exec.queue;
}

async function scheduleOnce(goalId: string, exec: ExecutionState): Promise<void> {
  const goal = await SELECT.one.from(Goals, goalId).columns("status");
  const plan = await loadCurrentPlan(goalId);
  if (goal?.status !== GoalStatus.ACTIVE || plan?.status !== PlanStatus.ACTIVE) {
    executions.delete(goalId);
    return;
  }
  exec.rootRunId ??= await startOrchestratorRun(goalId, "EXECUTION", "SYSTEM", `Execute plan ${plan.title}`);

  const next = determineNextWork(plan.tasks, settings().maxParallelTasks);
  LOG.info(`goal ${goalId} next work: ${next.type}${"reason" in next ? ` (${next.reason})` : ""}`);

  switch (next.type) {
    case "SPAWN": {
      const claimed: TaskRow[] = [];
      for (const task of next.tasks) {
        // Conditional claim: only one scheduler can move TODO -> IN_PROGRESS.
        const updated = await UPDATE.entity(Tasks)
          .where({ ID: task.ID, status: TaskStatus.TODO })
          .set({ status: TaskStatus.IN_PROGRESS, startDate: new Date().toISOString().slice(0, 10) as Task["startDate"] });
        if (Number(updated) === 1) claimed.push(task);
      }
      if (!claimed.length) return;
      await syncContext(goalId, `Started ${claimed.map((t) => `#${t.sequence}`).join(", ")}`, {}, exec.rootRunId);
      for (const task of claimed) {
        // Not awaited: tasks run in parallel; each completion triggers the next decision.
        void runTask(goalId, task, exec.rootRunId).finally(() => scheduleGoal(goalId));
      }
      return;
    }
    case "WAIT":
      return;
    case "COMPLETE":
      await UPDATE.entity(Plans, plan.ID).set({ status: PlanStatus.COMPLETED });
      await UPDATE.entity(Goals, goalId).set({ status: GoalStatus.COMPLETED });
      await syncContext(goalId, "All tasks completed", { phase: "DONE" }, exec.rootRunId);
      await appendMessage(goalId, "ASSISTANT", "All tasks are completed. Download the result with downloadArtifacts().");
      await finishOrchestratorRun(exec.rootRunId, "COMPLETED", "Plan completed");
      executions.delete(goalId);
      return;
    case "BLOCKED":
      await syncContext(goalId, "Execution blocked", { phase: "BLOCKED", addBlockers: [next.reason] }, exec.rootRunId);
      await appendMessage(goalId, "ASSISTANT", `Execution is blocked. ${next.reason}. Retry the task(s) to continue.`);
      await finishOrchestratorRun(exec.rootRunId, "FAILED", next.reason);
      executions.delete(goalId);
      return;
  }
}

async function runTask(goalId: string, task: TaskRow, rootRunId: string): Promise<void> {
  const label = `#${task.sequence} "${task.title}"`;
  try {
    const result = await proposeWithReview<TaskResult>({
      goalId,
      rootRunId,
      taskId: task.ID,
      purpose: "TASK_EXECUTION",
      agentCode: AgentCode.WORKER,
      assignment: `Execute task ${label}. Produce the complete files for this task only.`,
      reviewAssignment:
        `Review the result of task ${label}: are the files complete, correct, consistent with existing files ` +
        "and dependency results, and do they follow the user's preferences?",
      validate: validateTaskResult,
    });

    if (result.accepted) {
      await acceptTaskResult(goalId, task.ID, result.output, result.runId);
      await syncContext(goalId, `Task ${label} completed`, { addDecisions: result.output.decisions ?? [] }, rootRunId);
    } else if (!(await isGoalCancelled(goalId))) {
      await UPDATE.entity(Tasks).where({ ID: task.ID, status: TaskStatus.IN_PROGRESS }).set({ status: TaskStatus.BLOCKED });
      await syncContext(goalId, `Task ${label} blocked`, { addBlockers: [`${label}: ${result.reason}`] }, rootRunId);
    }
  } catch (err) {
    LOG.error(`task ${task.ID} crashed`, err);
    await UPDATE.entity(Tasks).where({ ID: task.ID, status: TaskStatus.IN_PROGRESS }).set({ status: TaskStatus.BLOCKED });
  }
}

/** Persist an ACCEPTED task result: files become Artifacts, task becomes COMPLETED. */
async function acceptTaskResult(goalId: string, taskId: string, result: TaskResult, runId: string): Promise<void> {
  await cds.tx(async () => {
    // Write first (see syncGoalContext): then the Artifact lookups below are safe.
    await UPDATE.entity(Tasks, taskId).set({
      status: TaskStatus.COMPLETED,
      result: result.summary,
      completedAt: new Date().toISOString(),
    });
    for (const file of result.files) {
      const existing = await SELECT.one.from(Artifacts).columns("ID").where({ goal_ID: goalId, path: file.path });
      if (existing) {
        await UPDATE.entity(Artifacts, existing.ID!).set({ content: file.content, task_ID: taskId, run: runId });
      } else {
        await INSERT.into(Artifacts).entries({ goal_ID: goalId, task_ID: taskId, path: file.path, content: file.content, run: runId });
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Shared control patterns
// ---------------------------------------------------------------------------

/**
 * Worker -> (validate) -> Reviewer. On REJECT the feedback goes into the next
 * attempt's ContextPackage. Bounded by maxReviewAttempts: never loops forever.
 */
async function proposeWithReview<T>(opts: ProposeOptions<T>): Promise<ProposeResult<T>> {
  const { maxReviewAttempts } = settings();
  let feedback: ReviewDecision | undefined;

  for (let attempt = 1; attempt <= maxReviewAttempts; attempt++) {
    if (await isGoalCancelled(opts.goalId)) return { accepted: false, reason: "Goal cancelled" };

    const work = await runAgent<T>({
      agentCode: opts.agentCode,
      purpose: opts.purpose,
      goalId: opts.goalId,
      taskId: opts.taskId,
      sessionId: opts.sessionId,
      parentRunId: opts.rootRunId,
      rootRunId: opts.rootRunId,
      triggerType: attempt > 1 ? "RETRY" : "AGENT",
      assignment: opts.assignment,
      reviewFeedback: feedback,
    });
    if (work.status === "CANCELLED") return { accepted: false, reason: "Cancelled" };
    if (work.status !== "COMPLETED" || work.output === undefined) {
      feedback = { decision: "REJECT", feedback: `Previous attempt failed: ${work.error}`, issues: [] };
      continue;
    }

    const issues = opts.validate?.(work.output) ?? [];
    if (issues.length) {
      LOG.info(`attempt ${attempt}: proposal failed validation (${issues.length} issue(s))`);
      feedback = { decision: "REJECT", feedback: "The proposal failed structural validation.", issues };
      continue;
    }

    // The Reviewer gets a fresh package: if other work was accepted meanwhile,
    // the staleness section tells it to re-check against the current context.
    const review = await runAgent<ReviewDecision>({
      agentCode: AgentCode.REVIEWER,
      purpose: "REVIEW",
      goalId: opts.goalId,
      taskId: opts.taskId,
      parentRunId: work.runId,
      rootRunId: opts.rootRunId,
      assignment: opts.reviewAssignment,
      proposal: work.output,
      proposalRevision: work.contextRevision,
    });
    if (review.status === "CANCELLED") return { accepted: false, reason: "Cancelled" };
    if (review.status !== "COMPLETED" || !review.output) {
      feedback = { decision: "REJECT", feedback: `Review could not be completed: ${review.error}`, issues: [] };
      continue;
    }

    if (review.output.decision === "ACCEPT") {
      return { accepted: true, output: work.output, runId: work.runId, attempts: attempt };
    }
    LOG.info(`attempt ${attempt}: reviewer rejected: ${review.output.feedback}`);
    feedback = review.output;
  }

  return {
    accepted: false,
    reason: `Not accepted after ${maxReviewAttempts} attempt(s). Last feedback: ${feedback?.feedback ?? "-"}`,
  };
}

/**
 * Context Manager step after an accepted change: deterministic state sync
 * (revision N -> N+1), then the CONTEXT_MANAGER agent narrates the picture
 * for the next spawned agent.
 */
async function syncContext(goalId: string, reason: string, patch: GoalContextPatch, rootRunId?: string): Promise<void> {
  await syncGoalContext(goalId, reason, patch);
  const narration = await runAgent<ContextSummary>({
    agentCode: AgentCode.CONTEXT_MANAGER,
    purpose: "CONTEXT_SYNC",
    goalId,
    parentRunId: rootRunId,
    rootRunId,
    triggerType: "SYSTEM",
    assignment: `Summarize the current execution state (${reason}).`,
  });
  if (narration.status === "COMPLETED" && narration.output?.summary) {
    await updateContextSummary(goalId, narration.contextRevision, narration.output.summary);
  }
}

function validatePlanProposal(plan: PlanProposal): string[] {
  const issues: string[] = [];
  if (!plan.title?.trim()) issues.push("Plan title is missing.");
  if (!Array.isArray(plan.tasks) || !plan.tasks.length) return [...issues, "Plan has no tasks."];

  const keys = new Set<string>();
  for (const t of plan.tasks) {
    if (!t.key || !t.title) issues.push("Every task needs a key and a title.");
    if (keys.has(t.key)) issues.push(`Duplicate task key "${t.key}".`);
    keys.add(t.key);
  }
  for (const t of plan.tasks) {
    for (const dep of t.dependsOn ?? []) {
      if (!keys.has(dep)) issues.push(`Task "${t.key}" depends on unknown key "${dep}".`);
      if (dep === t.key) issues.push(`Task "${t.key}" depends on itself.`);
    }
  }
  if (hasCycle(plan)) issues.push("Task dependencies contain a cycle.");
  return issues;
}

function hasCycle(plan: PlanProposal): boolean {
  const deps = new Map(plan.tasks.map((t) => [t.key, t.dependsOn ?? []]));
  const state = new Map<string, "visiting" | "done">();
  const visit = (key: string): boolean => {
    if (state.get(key) === "done") return false;
    if (state.get(key) === "visiting") return true;
    state.set(key, "visiting");
    const cyclic = (deps.get(key) ?? []).some(visit);
    state.set(key, "done");
    return cyclic;
  };
  return plan.tasks.some((t) => visit(t.key));
}

function validateTaskResult(result: TaskResult): string[] {
  if (!Array.isArray(result.files) || !result.files.length) return ["The result contains no files."];
  return result.files.flatMap((f) => {
    if (typeof f.path !== "string" || typeof f.content !== "string") return ["Every file needs a path and content."];
    if (f.path.startsWith("/") || f.path.split(/[\\/]/).includes("..")) return [`Path "${f.path}" must be relative.`];
    return [];
  });
}

function settings(): OrchestratorSettings {
  const configured = (cds.env as unknown as TodoAgentsEnv).todoAgents ?? {};
  return { ...DEFAULT_ORCHESTRATOR_SETTINGS, ...configured };
}

async function isGoalCancelled(goalId: string): Promise<boolean> {
  const goal = await SELECT.one.from(Goals, goalId).columns("status");
  return goal?.status === GoalStatus.CANCELLED;
}

/**
 * Run background work outside the HTTP request's transaction: every
 * statement / cds.tx() commits on its own so progress is visible immediately.
 */
function detached(fn: () => Promise<void>, user: cds.User = cds.context?.user ?? cds.User.privileged): void {
  setImmediate(() => {
    // Runtime accepts plain context props (no tx); cds-types only models full EventContexts.
    cds.context = { user } as unknown as cds.EventContext;
    fn().catch((err) => LOG.error("background work failed", err));
  });
}
