namespace cnma.todotasks.agents;

using {cnma.todotasks as todotasks} from './schema';

using {
    cuid,
    managed
} from '@sap/cds/common';

/** Logical Agent definition. Agent != LLM model. */
entity Agents : cuid, managed {
    code          : String(100) not null;
    name          : String(255) not null;
    description   : LargeString;

    // ORCHESTRATOR / CONTEXT_MANAGER / GOAL_ANALYZER /
    // PLANNER / WORKER / REVIEWER / ...
    agentType     : String(30);

    systemPrompt  : LargeString not null;
    modelConfig   : Association to ModelConfigurations not null;

    temperature   : Decimal(3, 2) default 0.2;
    maxTokens     : Integer;

    // Upper bound of model calls (tool-call loop) inside ONE AgentRun.
    maxIterations : Integer default 10;

    status        : String(20) default 'ACTIVE';

    tools         : Composition of many AgentTools
                        on tools.agent = $self;
}

/** Capability that an Agent may invoke. */
entity Tools : cuid, managed {
    code         : String(100) not null;
    name         : String(255) not null;
    description  : LargeString;

    // Application-side tool implementation (key in tool.service registry).
    handler      : String(255) not null;

    inputSchema  : LargeString;
    outputSchema : LargeString;

    status       : String(20) default 'ACTIVE';
}

/** Explicit Agent <-> Tool permission mapping. */
entity AgentTools : cuid, managed {
    agent   : Association to Agents not null;
    tool    : Association to Tools not null;
    enabled : Boolean default true;
}

/** One execution instance of one Agent. */
entity AgentRuns : cuid, managed {
    agent            : Association to Agents not null;

    // Business scope.
    goal             : Association to todotasks.Goals;
    task             : Association to todotasks.Tasks;

    // Optional user-conversation context.
    session          : Association to todotasks.Sessions;

    // Exact working context supplied to this run.
    contextPackage   : Association to todotasks.ContextPackages;

    // Agent execution hierarchy.
    parentRun        : Association to AgentRuns;
    rootRun          : Association to AgentRuns;

    // GOAL_ANALYSIS / PLAN_GENERATION / TASK_EXECUTION / REVIEW /
    // CONTEXT_SYNC / PLANNING / EXECUTION (orchestrator root runs)
    purpose          : String(50);

    // USER / AGENT / SYSTEM / RETRY
    triggerType      : String(30);

    // QUEUED / RUNNING / WAITING / COMPLETED / FAILED / CANCELLED
    status           : String(30) default 'QUEUED';

    currentIteration : Integer default 0;

    // Runtime input/output for audit and debugging.
    // This is not permanent Agent memory.
    input            : LargeString;
    output           : LargeString;

    startedAt        : Timestamp;
    completedAt      : Timestamp;

    inputTokens      : Integer default 0;
    outputTokens     : Integer default 0;
    totalTokens      : Integer default 0;
    latencyMs        : Integer;

    errorCode        : String(100);
    errorMessage     : LargeString;

    toolExecutions   : Composition of many ToolExecutions
                           on toolExecutions.run = $self;
}

/** Audit of one Tool invocation performed during an AgentRun. */
entity ToolExecutions : cuid, managed {
    run          : Association to AgentRuns not null;
    tool         : Association to Tools not null;

    callId       : String(255);
    sequence     : Integer;

    // REQUESTED / RUNNING / COMPLETED / FAILED
    status       : String(30) default 'REQUESTED';

    input        : LargeString;
    output       : LargeString;

    startedAt    : Timestamp;
    completedAt  : Timestamp;
    latencyMs    : Integer;

    errorCode    : String(100);
    errorMessage : LargeString;
}

/**
 * Append-only history of what happened while working on a Goal, in order.
 * Rows are inserted, never updated or deleted.
 *
 * Every event is stored first, then pushed to live listeners (SSE now,
 * WebSocket later). A client loads history, then continues live from the
 * last `seq` it has, so it never misses an event.
 */
@assert.unique: {goalSeq: [
    goal,
    seq
]}
entity GoalEvents : cuid {
    goal            : Association to todotasks.Goals not null;

    // 1, 2, 3 … per Goal, gap-free: the order and the replay bookmark.
    seq             : Integer not null;

    // <area>.<action>, e.g. run.started, review.decided, context.synced
    type            : String(50) not null;
    at              : Timestamp not null;

    // GoalContext revision the system had when this happened.
    contextRevision : Integer;

    // Agent hierarchy, so the UI can draw a tree instead of a flat list.
    run             : Association to AgentRuns;
    parentRun       : Association to AgentRuns;
    rootRun         : Association to AgentRuns;

    task            : Association to todotasks.Tasks;

    // Self-describing payload (JSON): enough to display without another call.
    data            : LargeString;
}

/**
 * LLM provider/model configuration.
 * API keys and secrets belong in environment/service credentials.
 */
entity ModelConfigurations : cuid, managed {
    code     : String(100) not null;
    name     : String(255) not null;

    // MOCK / OPENAI / ANTHROPIC / GOOGLE / SAP_AI_CORE / ...
    provider : String(50) not null;
    model    : String(100) not null;

    status   : String(20) default 'ACTIVE';
}
