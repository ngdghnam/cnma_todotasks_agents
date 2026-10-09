/** What a Tool implementation knows about the run that invoked it. */
export interface ToolContext {
  goalId: string;
  runId: string;
  taskId?: string;
}

export type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolContext,
) => Promise<unknown>;

/** A Tool the Agent of the current run is permitted to call. */
export interface PermittedTool {
  id: string;
  code: string;
  name: string;
  description: string;
  handler: string;
  inputSchema: Record<string, unknown>;
}

/** READ_ARTIFACTS input (matches Tools.inputSchema). No paths = list all paths. */
export interface ReadArtifactsInput {
  paths: string[];
}

/** READ_PAST_WORK input (matches Tools.inputSchema). */
export interface ReadPastWorkInput {
  query?: string;
  goalId?: string;
  path?: string;
}
