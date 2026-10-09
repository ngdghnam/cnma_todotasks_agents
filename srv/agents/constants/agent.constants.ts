import type { RunStatus } from "../types/agent.types";

/** Agents.code values seeded in db/data (the runtime looks agents up by code). */
export const AgentCode = {
  ORCHESTRATOR: "ORCHESTRATOR",
  CONTEXT_MANAGER: "CONTEXT_MANAGER",
  GOAL_ANALYZER: "GOAL_ANALYZER",
  PLANNER: "PLANNER",
  WORKER: "WORKER",
  REVIEWER: "REVIEWER",
} as const;

/** Status of usable configuration rows (Agents, ModelConfigurations, Tools). */
export const CONFIG_STATUS_ACTIVE = "ACTIVE";

/** Used when an Agent row has no maxIterations. */
export const DEFAULT_MAX_ITERATIONS = 10;

/** Runs that have not ended yet (cancelled on stop, failed after a restart). */
export const UNFINISHED_RUN_STATUSES: readonly RunStatus[] = ["QUEUED", "RUNNING", "WAITING"];
