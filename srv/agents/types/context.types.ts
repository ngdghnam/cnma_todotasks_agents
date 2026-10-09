import type { AgentPurpose, GoalAnalysis, ReviewDecision } from "./agent.types";

/**
 * Pipeline phase of a Goal, as seen by the Orchestrator.
 * Stored in GoalContext.state.phase.
 */
export type GoalPhase =
  | "NEW"
  | "ANALYSIS"
  | "PLANNING"
  | "AWAITING_APPROVAL"
  | "EXECUTION"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

export interface TaskRef {
  sequence: number;
  title: string;
}

/**
 * Machine-readable "where are we now" for a Goal (GoalContexts.state).
 *
 * completed / active / pending / blocked are always recomputed from Tasks
 * (Tasks stay authoritative). Everything else is accumulated from accepted
 * results only.
 */
export interface GoalContextState {
  phase: GoalPhase;
  analysis?: GoalAnalysis;
  completed: TaskRef[];
  active: TaskRef[];
  pending: TaskRef[];
  blocked: TaskRef[];
  acceptedDecisions: string[];
  blockers: string[];
  nextAction: string;
  /** Why the last revision was created. */
  lastChange: string;
}

/** Partial update applied on top of the recomputed state during a sync. */
export interface GoalContextPatch {
  phase?: GoalPhase;
  analysis?: GoalAnalysis;
  addDecisions?: string[];
  addBlockers?: string[];
  clearBlockers?: boolean;
  nextAction?: string;
}

export interface ContextSection {
  title: string;
  content: string;
}

/** Stored as ContextPackages.payload. Exactly what the Agent received. */
export interface ContextPackagePayload {
  agentCode: string;
  purpose: AgentPurpose;
  contextRevision: number;
  systemPrompt: string;
  sections: ContextSection[];
}

export interface BuildContextInput {
  goalId: string;
  agentCode: string;
  systemPrompt: string;
  purpose: AgentPurpose;
  assignment: string;
  taskId?: string;
  reviewFeedback?: ReviewDecision;
  proposal?: unknown;
  proposalRevision?: number;
}

export interface BuiltContext {
  packageId: string;
  contextRevision: number;
  payload: ContextPackagePayload;
  /** payload rendered as the user message sent to the model. */
  rendered: string;
}

export interface RevisionCheck {
  current: number;
  stale: boolean;
}

/** GoalContexts row as the runtime uses it (state parsed). */
export interface GoalContextSnapshot {
  revision: number;
  summary: string;
  state: GoalContextState;
}

/** Result of syncGoalContext: the new revision and the state stored with it. */
export interface ContextSyncResult {
  revision: number;
  state: GoalContextState;
}

/** The Goal fields the Context Manager selects from. */
export interface ContextGoal {
  ID?: string;
  title?: string;
  description?: string | null;
  priority?: string | null;
  owner_ID?: string;
}

/** The owner fields the Context Manager selects from. */
export interface ContextOwner {
  ID?: string;
  preferences?: string | null;
}

/** Everything loaded once per ContextPackage, shared by the section builders. */
export interface SelectionData {
  goal: ContextGoal;
  owner?: ContextOwner;
  ctx: GoalContextSnapshot;
}

/** A previously COMPLETED goal of the same owner, ranked by similarity. */
export interface PastGoalMatch {
  goalId: string;
  title: string;
  score: number;
}
