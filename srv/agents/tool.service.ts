import cds from "@sap/cds";
import { AgentTools, ToolExecutions, Tools } from "#cds-models/cnma/todotasks/agents";
import { readGoal } from "./tools/read-goal.tool";
import { readPlan } from "./tools/read-plan.tool";
import { readArtifacts } from "./tools/read-artifacts.tool";
import { readPastWork } from "./tools/read-past-work.tool";
import { CONFIG_STATUS_ACTIVE } from "./constants/agent.constants";
import { TOOL_ERROR_CODE, ToolExecutionStatus } from "./constants/tool.constants";
import type { ToolCall, ToolDefinition } from "./types/provider.types";
import type { PermittedTool, ToolContext, ToolHandler } from "./types/tool.types";

/**
 *   Tools table      -> what exists
 *   AgentTools       -> what an Agent may use      (getPermittedTools)
 *   toolHandlers     -> which function implements it
 *   ToolExecutions   -> what actually happened      (executeToolCall)
 */

const { SELECT, INSERT, UPDATE } = cds.ql;
const LOG = cds.log("tools");

const toolHandlers: Record<string, ToolHandler> = {
  READ_GOAL: readGoal,
  READ_PLAN: readPlan,
  READ_ARTIFACTS: readArtifacts,
  READ_PAST_WORK: readPastWork,
};

export async function getPermittedTools(agentId: string): Promise<PermittedTool[]> {
  const links = await SELECT.from(AgentTools).columns("tool_ID").where({ agent_ID: agentId, enabled: true });
  if (!links.length) return [];
  const tools = await SELECT.from(Tools).where({ ID: { in: links.map((l) => l.tool_ID!) }, status: CONFIG_STATUS_ACTIVE });
  return tools.map((t) => ({
    id: t.ID!,
    code: t.code!,
    name: t.name!,
    description: t.description ?? "",
    handler: t.handler!,
    inputSchema: t.inputSchema ? (JSON.parse(t.inputSchema) as Record<string, unknown>) : { type: "object" },
  }));
}

export function toToolDefinitions(tools: PermittedTool[]): ToolDefinition[] {
  return tools.map((t) => ({ name: t.code, description: t.description, inputSchema: t.inputSchema }));
}

/**
 * Execute one model-requested tool call and return the text for the tool
 * message. Errors are returned to the model (it can recover), not thrown.
 */
export async function executeToolCall(
  call: ToolCall,
  permitted: PermittedTool[],
  ctx: ToolContext,
  sequence: number,
): Promise<string> {
  const tool = permitted.find((t) => t.code === call.name);
  if (!tool) {
    LOG.warn(`run ${ctx.runId} requested non-permitted tool ${call.name}`);
    return JSON.stringify({ error: `Tool ${call.name} is not permitted for this agent` });
  }

  const executionId = cds.utils.uuid();
  const startedAt = new Date();
  await INSERT.into(ToolExecutions).entries({
    ID: executionId,
    run_ID: ctx.runId,
    tool_ID: tool.id,
    callId: call.id,
    sequence,
    status: ToolExecutionStatus.RUNNING,
    input: JSON.stringify(call.arguments),
    startedAt: startedAt.toISOString(),
  });

  const finish = (fields: Record<string, unknown>) =>
    UPDATE.entity(ToolExecutions, executionId).set({
      ...fields,
      completedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt.getTime(),
    });

  try {
    const handler = toolHandlers[tool.handler];
    if (!handler) throw new Error(`No implementation registered for tool handler ${tool.handler}`);
    const output = JSON.stringify(await handler(call.arguments ?? {}, ctx));
    await finish({ status: ToolExecutionStatus.COMPLETED, output });
    return output;
  } catch (err) {
    const message = (err as Error).message;
    await finish({ status: ToolExecutionStatus.FAILED, errorCode: TOOL_ERROR_CODE, errorMessage: message });
    return JSON.stringify({ error: message });
  }
}
