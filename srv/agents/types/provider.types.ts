/**
 * Provider-neutral model contract. Every provider in agents/providers/
 * translates this to/from its vendor SDK, so the runtime never sees vendor types.
 */

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ToolCall {
  id: string;
  /** Tool code, e.g. READ_ARTIFACTS. */
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Set on assistant messages that requested tools. */
  toolCalls?: ToolCall[];
  /** Set on tool messages: which call this result answers. */
  toolCallId?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  /** JSON schema of the tool input. */
  inputSchema: Record<string, unknown>;
}

export interface GenerateRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  /** Aborted when the Orchestrator cancels the run. */
  signal?: AbortSignal;
  /** Runtime hints (not sent to real models; used by the mock provider). */
  metadata?: { agentCode: string; purpose: string };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface GenerateResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
}

export type GenerateFn = (request: GenerateRequest) => Promise<GenerateResponse>;
