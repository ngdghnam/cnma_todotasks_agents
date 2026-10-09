import type { OrchestratorSettings } from "../types/orchestrator.types";

/** Used for any setting missing from package.json -> cds.todoAgents. */
export const DEFAULT_ORCHESTRATOR_SETTINGS: Readonly<OrchestratorSettings> = {
  maxReviewAttempts: 3,
  maxParallelTasks: 2,
};
