import type { TokenUsage } from "./provider.types";
import type { AgentCode as AgentCodeValues } from "../constants/agent.constants";

/** One of the AgentCode values (see agents/constants/agent.constants.ts). */
export type AgentCode = (typeof AgentCodeValues)[keyof typeof AgentCodeValues];

/** Why an Agent runs. Drives which context the Context Manager selects. */
export type AgentPurpose =
  | "GOAL_ANALYSIS"
  | "PLAN_GENERATION"
  | "TASK_EXECUTION"
  | "REVIEW"
  | "CONTEXT_SYNC";

/** Purposes of deterministic Orchestrator root runs (no model call). */
export type OrchestrationPurpose = "PLANNING" | "EXECUTION";

export type TriggerType = "USER" | "AGENT" | "SYSTEM" | "RETRY";

export type RunStatus =
  | "QUEUED"
  | "RUNNING"
  | "WAITING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface RunAgentInput {
  agentCode: AgentCode;
  goalId: string;
  purpose: AgentPurpose;
  /** The specific job for this run, in plain language. */
  assignment: string;

  taskId?: string;
  sessionId?: string;
  parentRunId?: string;
  rootRunId?: string;
  triggerType?: TriggerType;

  /** Reviewer feedback from the previous rejected attempt (retry context). */
  reviewFeedback?: ReviewDecision;
  /** Proposal under review (REVIEW purpose only). */
  proposal?: unknown;
  /** Context revision the proposal was produced from (REVIEW purpose only). */
  proposalRevision?: number;
}

export interface AgentRunResult<TOutput = unknown> {
  runId: string;
  status: RunStatus;
  /** Raw final model text. */
  content: string;
  /** Parsed JSON output, when the model returned valid JSON. */
  output?: TOutput;
  /** GoalContext revision the run's ContextPackage was built from. */
  contextRevision: number;
  usage: TokenUsage;
  error?: string;
}

// ---------------------------------------------------------------------------
// Output contracts (what each purpose must return as JSON)
// ---------------------------------------------------------------------------

export interface GoalAnalysis {
  objective: string;
  requirements: string[];
  constraints: string[];
  expectedOutcome: string;
  assumptions: string[];
  ambiguities: string[];
}

export interface ProposedTask {
  /** Stable key inside one proposal, referenced by dependsOn. */
  key: string;
  title: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  estimatedMinutes?: number;
  dependsOn?: string[];
}

export interface PlanProposal {
  title: string;
  summary: string;
  tasks: ProposedTask[];
}

export interface ProposedFile {
  path: string;
  content: string;
}

export interface TaskResult {
  summary: string;
  files: ProposedFile[];
  /** Decisions worth remembering for later tasks (become acceptedDecisions). */
  decisions?: string[];
}

export interface ReviewDecision {
  decision: "ACCEPT" | "REJECT";
  feedback: string | null;
  issues: string[];
}

export interface ContextSummary {
  summary: string;
}

// ---------------------------------------------------------------------------
// Runtime internals
// ---------------------------------------------------------------------------

/** An Agent row joined with its ModelConfiguration, ready to run. */
export interface LoadedAgent {
  ID: string;
  code: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  maxIterations: number;
  provider: string;
  model: string;
}

/** A run executing in this process, cancellable through its controller. */
export interface LiveRun {
  goalId: string;
  controller: AbortController;
}

/** What is written to AgentRuns when a run ends. */
export interface FinishRunInfo {
  output?: string;
  usage?: TokenUsage;
  startedAt: number;
  errorCode?: string;
  errorMessage?: string;
}

/** An error that ends a run with a specific AgentRuns.errorCode. */
export type RunFailure = Error & { code: string };
