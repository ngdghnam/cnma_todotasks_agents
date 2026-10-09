export const ToolExecutionStatus = {
  REQUESTED: "REQUESTED",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

/** errorCode stored when a tool implementation throws. */
export const TOOL_ERROR_CODE = "TOOL_ERROR";

/** How many similar past goals READ_PAST_WORK returns for a query. */
export const PAST_WORK_SEARCH_LIMIT = 5;
