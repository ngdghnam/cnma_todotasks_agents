import cds from "@sap/cds";
import {
  AgentRuns,
  Agents,
  ModelConfigurations,
} from "#cds-models/cnma/todotasks/agents";
import { buildContextPackage } from "./context.service";
import { generate } from "./provider.service";
import {
  executeToolCall,
  getPermittedTools,
  toToolDefinitions,
} from "./tool.service";
import { parseJsonOutput } from "./utils/json";
import {
  AgentCode,
  CONFIG_STATUS_ACTIVE,
  DEFAULT_MAX_ITERATIONS,
  UNFINISHED_RUN_STATUSES,
} from "./constants/agent.constants";
import type {
  AgentRunResult,
  FinishRunInfo,
  LiveRun,
  LoadedAgent,
  OrchestrationPurpose,
  RunAgentInput,
  RunFailure,
  RunStatus,
  TriggerType,
} from "./types/agent.types";
import type { ChatMessage, TokenUsage } from "./types/provider.types";

/**
 * Generic Agent runtime. Every role (Goal Analyzer, Planner, Worker,
 * Reviewer, Context Manager) runs through runAgent(); behaviour differs only
 * by DB configuration (prompt, model, tools) and the ContextPackage.
 */

const LOG = cds.log("agents");

/** Runs executing in THIS process, so they can be cancelled (abort signal). */
const liveRuns = new Map<string, LiveRun>();

export async function runAgent<TOutput>(
  input: RunAgentInput,
): Promise<AgentRunResult<TOutput>> {
  const agent = await loadAgent(input.agentCode);
  const tools = await getPermittedTools(agent.ID);

  // 1. Context Manager freezes exactly what this run will know.
  const context = await buildContextPackage({
    goalId: input.goalId,
    agentCode: agent.code,
    systemPrompt: agent.systemPrompt,
    purpose: input.purpose,
    assignment: input.assignment,
    taskId: input.taskId,
    reviewFeedback: input.reviewFeedback,
    proposal: input.proposal,
    proposalRevision: input.proposalRevision,
  });

  // 2. Record the run before calling the model.
  const runId = cds.utils.uuid();
  const startedAt = Date.now();
  await INSERT.into(AgentRuns).entries({
    ID: runId,
    agent_ID: agent.ID,
    goal_ID: input.goalId,
    task_ID: input.taskId,
    session_ID: input.sessionId,
    contextPackage_ID: context.packageId,
    parentRun_ID: input.parentRunId,
    rootRun_ID: input.rootRunId ?? input.parentRunId,
    purpose: input.purpose,
    triggerType: input.triggerType ?? "AGENT",
    status: "RUNNING",
    input: input.assignment,
    startedAt: new Date(startedAt).toISOString(),
  });
  const controller = new AbortController();
  liveRuns.set(runId, { goalId: input.goalId, controller });
  LOG.info(
    `▶ ${agent.code} ${input.purpose} run ${runId} (context r${context.contextRevision})`,
  );

  // 3. The agentic loop: model -> tool calls -> model ... -> final answer.
  const messages: ChatMessage[] = [
    { role: "system", content: agent.systemPrompt },
    { role: "user", content: context.rendered },
  ];
  const usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };
  let content = "";
  let toolSequence = 0;

  try {
    for (let iteration = 1; iteration <= agent.maxIterations; iteration++) {
      if (controller.signal.aborted)
        throw runFailure("CANCELLED", "Run was cancelled");
      await UPDATE.entity(AgentRuns, runId).set({
        currentIteration: iteration,
      });

      const response = await generate(agent.provider, {
        model: agent.model,
        messages,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        tools: toToolDefinitions(tools),
        signal: controller.signal,
        metadata: { agentCode: agent.code, purpose: input.purpose },
      });
      usage.inputTokens += response.usage?.inputTokens ?? 0;
      usage.outputTokens += response.usage?.outputTokens ?? 0;

      if (!response.toolCalls?.length) {
        content = response.content;
        break;
      }

      messages.push({
        role: "assistant",
        content: response.content,
        toolCalls: response.toolCalls,
      });
      for (const call of response.toolCalls) {
        const result = await executeToolCall(
          call,
          tools,
          { goalId: input.goalId, runId, taskId: input.taskId },
          ++toolSequence,
        );
        messages.push({ role: "tool", toolCallId: call.id, content: result });
      }
    }

    if (!content)
      throw runFailure(
        "MAX_ITERATIONS",
        `No final answer within ${agent.maxIterations} iterations`,
      );
    const output = parseJsonOutput<TOutput>(content);
    if (output === undefined)
      throw runFailure("INVALID_OUTPUT", "Model output is not valid JSON");

    await finishRun(runId, "COMPLETED", { output: content, usage, startedAt });
    LOG.info(`✔ ${agent.code} run ${runId} completed`);
    return {
      runId,
      status: "COMPLETED",
      content,
      output,
      contextRevision: context.contextRevision,
      usage,
    };
  } catch (err) {
    const cancelled = controller.signal.aborted;
    const code = cancelled
      ? "CANCELLED"
      : isRunFailure(err)
        ? err.code
        : "RUNTIME_ERROR";
    const status: RunStatus = cancelled ? "CANCELLED" : "FAILED";
    const message = (err as Error).message;
    await finishRun(runId, status, {
      output: content,
      usage,
      startedAt,
      errorCode: code,
      errorMessage: message,
    });
    LOG.warn(`✖ ${agent.code} run ${runId} ${status}: ${message}`);
    return {
      runId,
      status,
      content,
      contextRevision: context.contextRevision,
      usage,
      error: message,
    };
  } finally {
    liveRuns.delete(runId);
  }
}

// ---------------------------------------------------------------------------
// Orchestrator root runs (deterministic, no model call) + run control
// ---------------------------------------------------------------------------

/** Root of an AgentRun hierarchy, so every spawned run is traceable to one orchestration. */
export async function startOrchestratorRun(
  goalId: string,
  purpose: OrchestrationPurpose,
  triggerType: TriggerType,
  input: string,
): Promise<string> {
  const agent = await loadAgent(AgentCode.ORCHESTRATOR);
  const runId = cds.utils.uuid();
  await INSERT.into(AgentRuns).entries({
    ID: runId,
    agent_ID: agent.ID,
    goal_ID: goalId,
    purpose,
    triggerType,
    status: "RUNNING",
    input,
    startedAt: new Date().toISOString(),
  });
  return runId;
}

export async function finishOrchestratorRun(
  runId: string,
  status: RunStatus,
  output: string,
): Promise<void> {
  const run = await SELECT.one
    .from(AgentRuns, runId)
    .columns("startedAt", "status");
  if (!run || run.status !== "RUNNING") return;
  await finishRun(runId, status, {
    output,
    startedAt: run.startedAt ? new Date(run.startedAt).getTime() : Date.now(),
  });
}

/** Abort every live run of a goal and mark its unfinished runs CANCELLED. */
export async function cancelGoalRuns(goalId: string): Promise<number> {
  let aborted = 0;
  for (const [runId, live] of liveRuns) {
    if (live.goalId !== goalId) continue;
    live.controller.abort();
    aborted++;
    LOG.info(`cancel requested for run ${runId}`);
  }
  await UPDATE.entity(AgentRuns)
    .where({ goal_ID: goalId, status: { in: UNFINISHED_RUN_STATUSES } })
    .set({
      status: "CANCELLED",
      completedAt: new Date().toISOString(),
      errorCode: "CANCELLED",
    });
  return aborted;
}

/** On startup: runs that were RUNNING when the process died can never finish. */
export async function failInterruptedRuns(): Promise<number> {
  const count = await UPDATE.entity(AgentRuns)
    .where({ status: { in: UNFINISHED_RUN_STATUSES } })
    .set({
      status: "FAILED",
      errorCode: "INTERRUPTED",
      errorMessage: "Server stopped while the run was active",
      completedAt: new Date().toISOString(),
    });
  return Number(count);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runFailure(code: string, message: string): RunFailure {
  return Object.assign(new Error(message), { code });
}

function isRunFailure(err: unknown): err is RunFailure {
  return err instanceof Error && typeof (err as RunFailure).code === "string";
}

async function loadAgent(code: string): Promise<LoadedAgent> {
  const agent = await SELECT.one
    .from(Agents)
    .where({ code, status: CONFIG_STATUS_ACTIVE });
  if (!agent) throw new Error(`No ACTIVE agent with code ${code}`);
  const model = await SELECT.one.from(
    ModelConfigurations,
    agent.modelConfig_ID!,
  );
  if (!model || model.status !== CONFIG_STATUS_ACTIVE)
    throw new Error(`Agent ${code} has no ACTIVE model configuration`);
  return {
    ID: agent.ID!,
    code: agent.code!,
    systemPrompt: agent.systemPrompt!,
    temperature:
      agent.temperature != null ? Number(agent.temperature) : undefined,
    maxTokens: agent.maxTokens ?? undefined,
    maxIterations: agent.maxIterations ?? DEFAULT_MAX_ITERATIONS,
    provider: model.provider!,
    model: model.model!,
  };
}

async function finishRun(
  runId: string,
  status: RunStatus,
  info: FinishRunInfo,
): Promise<void> {
  const usage = info.usage ?? { inputTokens: 0, outputTokens: 0 };
  await UPDATE.entity(AgentRuns, runId).set({
    status,
    output: info.output,
    completedAt: new Date().toISOString(),
    latencyMs: Date.now() - info.startedAt,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.inputTokens + usage.outputTokens,
    errorCode: info.errorCode,
    errorMessage: info.errorMessage,
  });
}
