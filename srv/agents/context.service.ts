import cds from "@sap/cds";
import {
  Artifacts,
  ContextPackages,
  GoalContexts,
  Goals,
  Messages,
  Plans,
  Sessions,
  TaskDependencies,
  Tasks,
  Users,
} from "#cds-models/cnma/todotasks";
import { estimateTokens } from "./utils/json";
import {
  CONVERSATION_LIMIT,
  MIN_TOKEN_LENGTH,
  NEXT_ACTION_BY_PHASE,
  OUTPUT_CONTRACTS,
  PAST_WORK_LIMIT,
  PAST_WORK_MAX_FILES,
  SECTION,
  STOPWORDS,
} from "./constants/context.constants";
import { GoalStatus } from "../constants/goal.constants";
import { PlanStatus } from "../constants/plan.constants";
import { TaskStatus } from "../constants/task.constants";
import type { AgentPurpose, GoalAnalysis, ReviewDecision } from "./types/agent.types";
import type {
  BuildContextInput,
  BuiltContext,
  ContextGoal,
  ContextOwner,
  ContextPackagePayload,
  ContextSection,
  ContextSyncResult,
  GoalContextPatch,
  GoalContextSnapshot,
  GoalContextState,
  GoalPhase,
  PastGoalMatch,
  RevisionCheck,
  SelectionData,
  TaskRef,
} from "./types/context.types";
import type { PlanWithTasks } from "../types/plan.types";
import type { TaskRow } from "../types/task.types";

/**
 * Context Manager: "What does this Agent need to know?"
 *
 *  1. syncGoalContext()      – after accepted changes, recompute the condensed
 *                              execution picture and bump the revision.
 *  2. buildContextPackage()  – select only the context a specific Agent run
 *                              needs and freeze it as an immutable package.
 *  3. checkContextRevision() – detect results produced from an outdated picture.
 *
 * It never decides what runs next (Orchestrator) or whether output is good (Reviewer).
 */

const { SELECT, INSERT, UPDATE } = cds.ql;
const LOG = cds.log("context");

// ---------------------------------------------------------------------------
// GoalContext
// ---------------------------------------------------------------------------

export async function ensureGoalContext(goalId: string): Promise<void> {
  const exists = await SELECT.one.from(GoalContexts).columns("ID").where({ goal_ID: goalId });
  if (exists) return;
  const state = computeState(undefined, [], { phase: "NEW" }, "Goal created");
  await INSERT.into(GoalContexts).entries({
    goal_ID: goalId,
    revision: 1,
    state: JSON.stringify(state),
    summary: renderSummary(state),
  });
}

export async function readGoalContext(
  goalId: string,
): Promise<GoalContextSnapshot> {
  const row = await SELECT.one.from(GoalContexts).where({ goal_ID: goalId });
  if (!row) throw new Error(`GoalContext for goal ${goalId} not found`);
  return {
    revision: row.revision ?? 1,
    summary: row.summary ?? "",
    state: JSON.parse(row.state ?? "{}") as GoalContextState,
  };
}

/**
 * Recompute the execution picture from authoritative Tasks + the accepted
 * patch, and increment the revision. Call only after ACCEPTED changes.
 */
export async function syncGoalContext(
  goalId: string,
  reason: string,
  patch: GoalContextPatch = {},
): Promise<ContextSyncResult> {
  return cds.tx(async () => {
    // Write first: takes the write lock, so concurrent syncs serialize instead of
    // failing (on SQLite a read-then-write tx hits SQLITE_BUSY_SNAPSHOT).
    await UPDATE.entity(GoalContexts).where({ goal_ID: goalId }).with({ revision: { "+=": 1 } });

    const previous = await readGoalContext(goalId);
    const plan = await loadCurrentPlan(goalId);
    const state = computeState(previous.state, plan?.tasks ?? [], patch, reason);
    await UPDATE.entity(GoalContexts)
      .where({ goal_ID: goalId })
      .set({ state: JSON.stringify(state), summary: renderSummary(state) });

    LOG.info(`goal ${goalId} context r${previous.revision} (${state.phase}): ${reason}`);
    return { revision: previous.revision, state };
  });
}

/** Store the Context Manager Agent's narrative, unless a newer revision already exists. */
export async function updateContextSummary(goalId: string, revision: number, summary: string): Promise<void> {
  await UPDATE.entity(GoalContexts).where({ goal_ID: goalId, revision }).set({ summary });
}

export async function checkContextRevision(goalId: string, revision: number): Promise<RevisionCheck> {
  const row = await SELECT.one.from(GoalContexts).columns("revision").where({ goal_ID: goalId });
  const current = row?.revision ?? revision;
  return { current, stale: current !== revision };
}

function computeState(
  previous: GoalContextState | undefined,
  tasks: TaskRow[],
  patch: GoalContextPatch,
  reason: string,
): GoalContextState {
  const refs = (status: string): TaskRef[] =>
    tasks.filter((t) => t.status === status).map((t) => ({ sequence: t.sequence, title: t.title }));
  const phase: GoalPhase = patch.phase ?? previous?.phase ?? "NEW";

  return {
    phase,
    analysis: patch.analysis ?? previous?.analysis,
    completed: refs(TaskStatus.COMPLETED),
    active: refs(TaskStatus.IN_PROGRESS),
    pending: refs(TaskStatus.TODO),
    blocked: refs(TaskStatus.BLOCKED),
    acceptedDecisions: unique([...(previous?.acceptedDecisions ?? []), ...(patch.addDecisions ?? [])]),
    blockers: patch.clearBlockers
      ? [...(patch.addBlockers ?? [])]
      : unique([...(previous?.blockers ?? []), ...(patch.addBlockers ?? [])]),
    nextAction: patch.nextAction ?? NEXT_ACTION_BY_PHASE[phase],
    lastChange: reason,
  };
}

/** Deterministic summary; the Context Manager Agent may replace it with a narrative. */
function renderSummary(state: GoalContextState): string {
  const list = (refs: TaskRef[]) => (refs.length ? refs.map((r) => `#${r.sequence} ${r.title}`).join(", ") : "none");
  return [
    `Phase: ${state.phase}. Next: ${state.nextAction}.`,
    `Completed: ${list(state.completed)}. Active: ${list(state.active)}. Pending: ${list(state.pending)}. Blocked: ${list(state.blocked)}.`,
    state.blockers.length ? `Blockers: ${state.blockers.join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// ---------------------------------------------------------------------------
// ContextPackage
// ---------------------------------------------------------------------------

export async function buildContextPackage(input: BuildContextInput): Promise<BuiltContext> {
  const ctx = await readGoalContext(input.goalId);
  const goal = await SELECT.one.from(Goals, input.goalId);
  if (!goal) throw new Error(`Goal ${input.goalId} not found`);
  const owner = (goal.owner_ID && (await SELECT.one.from(Users, goal.owner_ID))) || undefined;

  const sections = await selectSections(input, { goal, owner, ctx });
  const payload: ContextPackagePayload = {
    agentCode: input.agentCode,
    purpose: input.purpose,
    contextRevision: ctx.revision,
    systemPrompt: input.systemPrompt,
    sections,
  };
  const rendered = renderSections(sections);

  const packageId = cds.utils.uuid();
  await INSERT.into(ContextPackages).entries({
    ID: packageId,
    goal_ID: input.goalId,
    contextRevision: ctx.revision,
    purpose: input.purpose,
    payload: JSON.stringify(payload),
    estimatedTokens: estimateTokens(input.systemPrompt + rendered),
  });

  return { packageId, contextRevision: ctx.revision, payload, rendered };
}

/** The core selection policy: which context each purpose gets. */
async function selectSections(input: BuildContextInput, data: SelectionData): Promise<ContextSection[]> {
  const { goal, owner, ctx } = data;
  const goalId = input.goalId;
  const s: (ContextSection | undefined)[] = [{ title: SECTION.ASSIGNMENT, content: input.assignment }];

  switch (input.purpose) {
    case "GOAL_ANALYSIS":
      s.push(
        goalSection(goal),
        preferencesSection(owner),
        await pastWorkSection(owner?.ID, goalId, goal),
        await conversationSection(goalId),
      );
      break;

    case "PLAN_GENERATION":
      s.push(
        goalSection(goal),
        analysisSection(ctx.state.analysis),
        executionSection(ctx),
        preferencesSection(owner),
        await pastWorkSection(owner?.ID, goalId, goal),
        await conversationSection(goalId),
        await currentPlanSection(goalId),
        feedbackSection(input.reviewFeedback),
      );
      break;

    case "TASK_EXECUTION":
      s.push(
        goalSection(goal),
        analysisSection(ctx.state.analysis),
        executionSection(ctx),
        preferencesSection(owner),
        await currentTaskSection(input.taskId),
        await dependencySection(input.taskId),
        await existingFilesSection(goalId),
        feedbackSection(input.reviewFeedback),
      );
      break;

    case "REVIEW":
      s.push(
        goalSection(goal),
        analysisSection(ctx.state.analysis),
        executionSection(ctx),
        preferencesSection(owner),
        input.taskId ? await currentTaskSection(input.taskId) : undefined,
        { title: SECTION.PROPOSAL, content: JSON.stringify(input.proposal, null, 2) },
        stalenessSection(input.proposalRevision, ctx),
      );
      break;

    case "CONTEXT_SYNC":
      s.push({ title: SECTION.STATE, content: JSON.stringify({ ...ctx.state, analysis: undefined }, null, 2) });
      break;
  }

  s.push({ title: SECTION.EXPECTED_OUTPUT, content: expectedOutput(input.purpose) });
  return s.filter((x): x is ContextSection => Boolean(x));
}

function renderSections(sections: ContextSection[]): string {
  return sections.map((x) => `## ${x.title}\n${x.content}`).join("\n\n");
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function goalSection(goal: ContextGoal): ContextSection {
  return {
    title: SECTION.GOAL,
    content: [`Title: ${goal.title}`, `Description: ${goal.description ?? ""}`, `Priority: ${goal.priority}`].join("\n"),
  };
}

function analysisSection(analysis?: GoalAnalysis): ContextSection | undefined {
  return analysis && { title: SECTION.ANALYSIS, content: JSON.stringify(analysis, null, 2) };
}

function executionSection(ctx: GoalContextSnapshot): ContextSection {
  const { analysis: _omit, ...state } = ctx.state;
  return {
    title: SECTION.EXECUTION_CONTEXT,
    content: `Revision: ${ctx.revision}\nSummary: ${ctx.summary}\nState: ${JSON.stringify(state)}`,
  };
}

function preferencesSection(owner?: ContextOwner): ContextSection {
  return {
    title: SECTION.PREFERENCES,
    content: owner?.preferences?.trim() || "No explicit preferences recorded.",
  };
}

function feedbackSection(feedback?: ReviewDecision): ContextSection | undefined {
  return (
    feedback && {
      title: SECTION.REVIEW_FEEDBACK,
      content: [feedback.feedback ?? "", ...feedback.issues.map((i) => `- ${i}`)].join("\n"),
    }
  );
}

function stalenessSection(proposalRevision: number | undefined, ctx: GoalContextSnapshot): ContextSection | undefined {
  if (proposalRevision === undefined || proposalRevision === ctx.revision) return undefined;
  return {
    title: SECTION.STALENESS,
    content:
      `The proposal was produced from context revision ${proposalRevision}; the current revision is ${ctx.revision} ` +
      `(latest change: ${ctx.state.lastChange}). Re-check the proposal against the CURRENT context and existing files.`,
  };
}

/** "Learn from the past": the owner's most similar COMPLETED goals, their plan and file tree. */
async function pastWorkSection(
  ownerId: string | undefined,
  goalId: string,
  goal: ContextGoal,
): Promise<ContextSection> {
  const similar = ownerId
    ? await findSimilarPastGoals(ownerId, goalId, `${goal.title} ${goal.description ?? ""}`, PAST_WORK_LIMIT)
    : [];
  if (!similar.length) return { title: SECTION.PAST_WORK, content: "No completed goals yet." };

  const blocks = await Promise.all(
    similar.map(async (past) => {
      const plan = await loadCurrentPlan(past.goalId);
      const paths = await listArtifactPaths(past.goalId);
      return [
        `### ${past.title} (goalId ${past.goalId}, similarity ${past.score.toFixed(2)})`,
        `Plan: ${plan?.title ?? "-"}`,
        `Tasks: ${(plan?.tasks ?? []).map((t) => `${t.sequence}. ${t.title}`).join(" | ")}`,
        `Files:\n${paths.slice(0, PAST_WORK_MAX_FILES).map((p) => `- ${p}`).join("\n")}`,
      ].join("\n");
    }),
  );
  return { title: SECTION.PAST_WORK, content: blocks.join("\n\n") };
}

async function conversationSection(goalId: string): Promise<ContextSection | undefined> {
  const sessions = await SELECT.from(Sessions).columns("ID").where({ goal_ID: goalId });
  if (!sessions.length) return undefined;
  const messages = await SELECT.from(Messages)
    .columns("role", "content", "sequence")
    .where({ session_ID: { in: sessions.map((x) => x.ID!) } })
    .orderBy("createdAt desc", "sequence desc")
    .limit(CONVERSATION_LIMIT);
  if (!messages.length) return undefined;
  return {
    title: SECTION.CONVERSATION,
    content: messages.reverse().map((m) => `[${m.role}] ${m.content}`).join("\n"),
  };
}

async function currentPlanSection(goalId: string): Promise<ContextSection | undefined> {
  const plan = await loadCurrentPlan(goalId);
  if (!plan) return undefined;
  const lines = plan.tasks.map(
    (t) =>
      `${t.sequence}. [${t.status}] ${t.title}` +
      (t.dependsOn.length ? ` (after ${t.dependsOn.join(", ")})` : "") +
      (t.result ? ` — result: ${t.result}` : ""),
  );
  return { title: SECTION.CURRENT_PLAN, content: `${plan.title} [${plan.status}]\n${plan.summary ?? ""}\n${lines.join("\n")}` };
}

async function currentTaskSection(taskId?: string): Promise<ContextSection | undefined> {
  if (!taskId) return undefined;
  const task = await SELECT.one.from(Tasks, taskId);
  if (!task) return undefined;
  return {
    title: SECTION.CURRENT_TASK,
    content: [
      `Title: ${task.title}`,
      `Description: ${task.description ?? ""}`,
      `Sequence: ${task.sequence}`,
      `Priority: ${task.priority}`,
    ].join("\n"),
  };
}

async function dependencySection(taskId?: string): Promise<ContextSection> {
  const deps = taskId
    ? await SELECT.from(TaskDependencies).columns("dependsOn_ID").where({ task_ID: taskId })
    : [];
  if (!deps.length) return { title: SECTION.DEPENDENCY_RESULTS, content: "None" };

  const ids = deps.map((d) => d.dependsOn_ID!);
  const tasks = await SELECT.from(Tasks).columns("ID", "sequence", "title", "result").where({ ID: { in: ids } });
  const files = await SELECT.from(Artifacts).columns("path", "task_ID").where({ task_ID: { in: ids } });
  const content = tasks
    .sort((a, b) => a.sequence! - b.sequence!)
    .map((t) => {
      const paths = files.filter((f) => f.task_ID === t.ID).map((f) => `  - ${f.path}`);
      return `${t.sequence}. ${t.title}\n  Result: ${t.result ?? "-"}\n  Files:\n${paths.join("\n")}`;
    })
    .join("\n");
  return { title: SECTION.DEPENDENCY_RESULTS, content };
}

async function existingFilesSection(goalId: string): Promise<ContextSection> {
  const paths = await listArtifactPaths(goalId);
  return { title: SECTION.EXISTING_FILES, content: paths.length ? paths.map((p) => `- ${p}`).join("\n") : "None yet." };
}

function expectedOutput(purpose: AgentPurpose): string {
  return `Respond with JSON only, in this shape:\n${JSON.stringify(OUTPUT_CONTRACTS[purpose], null, 2)}`;
}

// ---------------------------------------------------------------------------
// Business-state reads shared by the Context Manager, Tools and Orchestrator
// ---------------------------------------------------------------------------

/** The Goal's living plan: the newest plan that is not CANCELLED. */
export async function loadCurrentPlan(goalId: string): Promise<PlanWithTasks | undefined> {
  const plan = await SELECT.one
    .from(Plans)
    .where({ goal_ID: goalId, status: { "!=": PlanStatus.CANCELLED } })
    .orderBy("createdAt desc");
  if (!plan) return undefined;

  const tasks = await SELECT.from(Tasks).where({ plan_ID: plan.ID }).orderBy("sequence");
  const deps = tasks.length
    ? await SELECT.from(TaskDependencies).where({ task_ID: { in: tasks.map((t) => t.ID!) } })
    : [];
  const seqOf = new Map(tasks.map((t) => [t.ID!, t.sequence!]));

  return {
    ID: plan.ID!,
    title: plan.title!,
    summary: plan.summary,
    status: plan.status!,
    tasks: tasks.map((t) => {
      const mine = deps.filter((d) => d.task_ID === t.ID).map((d) => d.dependsOn_ID!);
      return {
        ID: t.ID!,
        sequence: t.sequence!,
        title: t.title!,
        description: t.description,
        status: t.status!,
        result: t.result,
        dependsOnIds: mine,
        dependsOn: mine.map((id) => seqOf.get(id)!).filter((x) => x !== undefined),
      };
    }),
  };
}

export async function listArtifactPaths(goalId: string): Promise<string[]> {
  const rows = await SELECT.from(Artifacts).columns("path").where({ goal_ID: goalId }).orderBy("path");
  return rows.map((r) => r.path!);
}

/**
 * Keyword (Jaccard) similarity over the owner's COMPLETED goals.
 * Deliberately simple: no embeddings until a concrete need appears (Database V3 §12).
 */
export async function findSimilarPastGoals(
  ownerId: string,
  excludeGoalId: string,
  text: string,
  limit: number,
): Promise<PastGoalMatch[]> {
  const goals = await SELECT.from(Goals)
    .columns("ID", "title", "description")
    .where({ owner_ID: ownerId, status: GoalStatus.COMPLETED, ID: { "!=": excludeGoalId } });
  const query = tokens(text);
  return goals
    .map((g) => ({ goalId: g.ID!, title: g.title!, score: jaccard(query, tokens(`${g.title} ${g.description ?? ""}`)) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
