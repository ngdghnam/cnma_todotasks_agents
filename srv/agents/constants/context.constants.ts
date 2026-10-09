import type { AgentPurpose } from "../types/agent.types";
import type { GoalPhase } from "../types/context.types";

/** Section titles of a rendered ContextPackage (`## <title>` blocks). */
export const SECTION = {
  ASSIGNMENT: "Assignment",
  EXPECTED_OUTPUT: "Expected output",
  GOAL: "Goal",
  ANALYSIS: "Goal analysis",
  EXECUTION_CONTEXT: "Current execution context",
  PREFERENCES: "User preferences",
  PAST_WORK: "Past accepted work",
  CONVERSATION: "User conversation",
  CURRENT_PLAN: "Current plan",
  CURRENT_TASK: "Current task",
  DEPENDENCY_RESULTS: "Dependency results",
  EXISTING_FILES: "Existing files",
  REVIEW_FEEDBACK: "Review feedback (previous attempt was rejected)",
  PROPOSAL: "Proposal under review",
  STALENESS: "Staleness check",
  STATE: "Execution state",
} as const;

/** How many similar completed goals the Planner sees. */
export const PAST_WORK_LIMIT = 3;
/** Max file paths listed per past goal. */
export const PAST_WORK_MAX_FILES = 40;
/** Max most-recent conversation messages in a package. */
export const CONVERSATION_LIMIT = 20;

/** Words ignored by the past-goal similarity (too common to mean anything). */
export const STOPWORDS: ReadonlySet<string> = new Set([
  "the", "and", "for", "with", "generate", "build", "create", "make", "full", "me", "app",
]);
/** Shorter words are ignored by the similarity. */
export const MIN_TOKEN_LENGTH = 3;

/** GoalContext.state.nextAction when a sync does not set one explicitly. */
export const NEXT_ACTION_BY_PHASE: Readonly<Record<GoalPhase, string>> = {
  NEW: "ANALYZE_GOAL",
  ANALYSIS: "ANALYZE_GOAL",
  PLANNING: "GENERATE_PLAN",
  AWAITING_APPROVAL: "USER_REVIEWS_PLAN",
  EXECUTION: "EXECUTE_READY_TASKS",
  BLOCKED: "USER_RESOLVES_BLOCKER",
  DONE: "DOWNLOAD_ARTIFACTS",
  CANCELLED: "NONE",
};

/** JSON shape each purpose must answer with (rendered into "Expected output"). */
export const OUTPUT_CONTRACTS: Readonly<Record<AgentPurpose, unknown>> = {
  GOAL_ANALYSIS: {
    objective: "string",
    requirements: ["string"],
    constraints: ["string"],
    expectedOutcome: "string",
    assumptions: ["string"],
    ambiguities: ["string"],
  },
  PLAN_GENERATION: {
    title: "string",
    summary: "string",
    tasks: [
      {
        key: "short-unique-key",
        title: "string",
        description: "string",
        priority: "LOW|MEDIUM|HIGH|CRITICAL",
        estimatedMinutes: 30,
        dependsOn: ["key of another task"],
      },
    ],
  },
  TASK_EXECUTION: {
    summary: "what was done",
    files: [{ path: "relative/path.ext", content: "full file content" }],
    decisions: ["decision later tasks must respect"],
  },
  REVIEW: { decision: "ACCEPT|REJECT", feedback: "string or null", issues: ["string"] },
  CONTEXT_SYNC: { summary: "string" },
};
