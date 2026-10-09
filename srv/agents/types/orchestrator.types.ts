import type { AgentCode, AgentPurpose, TriggerType } from "./agent.types";
import type { TaskRow } from "../../types/task.types";

/** package.json -> cds.todoAgents */
export interface OrchestratorSettings {
  maxReviewAttempts: number;
  maxParallelTasks: number;
}

/** Shape of the custom section in cds.env. */
export interface TodoAgentsEnv {
  todoAgents?: Partial<OrchestratorSettings>;
}

export interface PlanningOptions {
  /** Run the Goal Analyzer again (false when only revising after user feedback). */
  reanalyze: boolean;
  trigger: TriggerType;
}

/** A goal executing in this process. `queue` serializes scheduling decisions. */
export interface ExecutionState {
  rootRunId?: string;
  queue: Promise<void>;
}

/** The Orchestrator's decision for a goal's plan. */
export type NextWork =
  | { type: "SPAWN"; tasks: TaskRow[] }
  | { type: "WAIT"; reason: string }
  | { type: "COMPLETE" }
  | { type: "BLOCKED"; reason: string };

export interface ProposeOptions<T> {
  goalId: string;
  rootRunId: string;
  sessionId?: string;
  taskId?: string;
  purpose: AgentPurpose;
  agentCode: AgentCode;
  assignment: string;
  reviewAssignment: string;
  /** Deterministic structural checks; failures count as a rejection without calling the Reviewer. */
  validate?: (output: T) => string[];
}

export type ProposeResult<T> =
  | { accepted: true; output: T; runId: string; attempts: number }
  | { accepted: false; reason: string };

/** A plan proposal persisted as business state. */
export interface AcceptedPlan {
  ID: string;
  title: string;
  taskCount: number;
}
