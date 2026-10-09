# Todo AI Agent — Agent Architecture & Database Design V3.0

## 1. Purpose

This document defines the **final baseline architecture and database design** for the Todo AI Agent project built with SAP CAP.

V3.0 reflects the finalized product requirement: a user defines a Goal, the system automatically generates a Plan and Tasks, and execution continues over time. If the user changes the Goal or adds requirements, the system performs impact analysis and adapts existing work instead of creating a new Goal version or restarting the entire process.

The database is separated into five responsibilities:

1. **Business State** — `Users`, `Goals`, `Plans`, `Tasks`
2. **Conversation History** — `Sessions`, `Messages`
3. **Execution Context** — `GoalContexts`, `ContextPackages`
4. **Agent Configuration** — `Agents`, `Tools`, `AgentTools`, `ModelConfigurations`
5. **Agent Runtime & Audit** — `AgentRuns`, `ToolExecutions`

The core architectural principle is:

> **PostgreSQL owns durable application state and history. The LLM does not own application memory. Context sent to an LLM is constructed dynamically for each execution.**

---

## 2. Final Product Flow

```text
User defines Goal
      │
      ▼
Goal persisted
      │
      ▼
Goal Analysis
      │
      ▼
Generate Plan + Tasks
      │
      ▼
Execute / track work continuously
      │
      ├── Goal unchanged ──→ continue execution
      │
      └── Goal changed
              │
              ▼
         Impact Analysis
              │
              ├── UNAFFECTED   → continue existing work
              ├── EXTENSION    → add new work
              ├── MODIFICATION → adjust/revalidate affected work
              └── INVALIDATION → cancel obsolete work + replace it
              │
              ▼
       synchronize GoalContext
              │
              ▼
       Orchestrator chooses next work
```

A Goal is therefore a **living business object**, not an immutable versioned specification.

---

## 3. Business Domain Schema

```cds
namespace cnma.todotasks;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Users : cuid, managed {
    email    : String(255) not null @mandatory;
    username : String(255) not null @mandatory;
    status   : String(20) default 'ACTIVE';

    goals    : Association to many Goals
                   on goals.owner = $self;
}

/**
 * Current authoritative user Goal.
 *
 * Goal is mutable. When the user changes requirements,
 * the Goal is updated and the agent runtime performs impact analysis.
 */
entity Goals : cuid, managed {
    title            : String(255) not null;
    description      : LargeString;

    // DRAFT / ACTIVE / COMPLETED / CANCELLED
    status           : String(20) default 'DRAFT';

    // LOW / MEDIUM / HIGH / CRITICAL
    priority         : String(20) default 'MEDIUM';

    targetDate       : Date;
    autoGeneratePlan : Boolean default true;

    owner            : Association to Users not null;

    sessions         : Composition of many Sessions
                           on sessions.goal = $self;

    plans            : Composition of many Plans
                           on plans.goal = $self;

    context          : Composition of one GoalContexts
                           on context.goal = $self;
}

/**
 * User <-> Agent-system conversation.
 * This is an application session, not an LLM-provider session.
 */
entity Sessions : cuid, managed {
    goal        : Association to Goals not null;
    title       : String(255);

    // ACTIVE / CLOSED
    status      : String(20) default 'ACTIVE';

    // Condensed summary useful for future context reconstruction.
    summary     : LargeString;

    messages    : Composition of many Messages
                       on messages.session = $self;
}

/**
 * Persistent raw conversation history.
 * Persisting a message does not mean it is sent to every LLM call.
 */
entity Messages : cuid, managed {
    session     : Association to Sessions not null;

    // USER / ASSISTANT / SYSTEM
    role        : String(20) not null;

    content     : LargeString not null;
    sequence    : Integer not null;
}

/**
 * Living execution plan for a Goal.
 * Goal changes do not automatically create another Plan version.
 */
entity Plans : cuid, managed {
    title       : String(255) not null;
    summary     : LargeString;

    // DRAFT / ACTIVE / COMPLETED / CANCELLED
    status      : String(20) default 'DRAFT';

    goal        : Association to Goals not null;

    tasks       : Composition of many Tasks
                       on tasks.plan = $self;
}

/** Executable unit of work belonging to a Plan. */
entity Tasks : cuid, managed {
    title            : String(255) not null;
    description      : LargeString;

    // TODO / IN_PROGRESS / BLOCKED / COMPLETED / CANCELLED
    status           : String(20) default 'TODO';

    // LOW / MEDIUM / HIGH / CRITICAL
    priority         : String(20) default 'MEDIUM';

    sequence         : Integer not null;
    estimatedMinutes : Integer;

    startDate        : Date;
    dueDate          : Date;
    completedAt      : Timestamp;

    plan             : Association to Plans not null;
}

/**
 * Current condensed execution picture for one Goal.
 *
 * This is mutable current state, not historical business truth.
 * Detailed Plan, Task, Message and AgentRun data remain authoritative
 * in their own entities.
 *
 * revision increases whenever accepted execution state meaningfully changes.
 */
entity GoalContexts : cuid, managed {
    goal        : Association to Goals not null;
    revision    : Integer not null default 1;

    // Human/LLM-friendly current execution summary.
    summary     : LargeString;

    // Machine-readable current execution state.
    state       : LargeString not null;
}

/**
 * Immutable working-context snapshot assembled for one Agent execution.
 * It records exactly what that Agent knew when it started.
 */
entity ContextPackages : cuid, managed {
    goal            : Association to Goals not null;

    // GoalContext revision used when this package was assembled.
    contextRevision : Integer not null;

    // GOAL_ANALYSIS / PLAN_GENERATION / PLAN_UPDATE /
    // IMPACT_ANALYSIS / TASK_EXECUTION / REVIEW / ...
    purpose         : String(50) not null;

    // Exact assembled context supplied to the Agent.
    payload         : LargeString not null;

    estimatedTokens : Integer;
}
```

---

## 4. Agent Domain Schema

```cds
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

    // Application-side tool implementation.
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

    // Optional user-conversation context.
    session          : Association to todotasks.Sessions;

    // Exact working context supplied to this run.
    contextPackage   : Association to todotasks.ContextPackages;

    // Agent execution hierarchy.
    parentRun        : Association to AgentRuns;
    rootRun          : Association to AgentRuns;

    // GOAL_ANALYSIS / PLAN_GENERATION / PLAN_UPDATE /
    // IMPACT_ANALYSIS / TASK_EXECUTION / REVIEW / ...
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
 * LLM provider/model configuration.
 * API keys and secrets belong in environment/service credentials.
 */
entity ModelConfigurations : cuid, managed {
    code     : String(100) not null;
    name     : String(255) not null;

    // OPENAI / ANTHROPIC / GOOGLE / SAP_AI_CORE / ...
    provider : String(50) not null;
    model    : String(100) not null;

    status   : String(20) default 'ACTIVE';
}
```

---

## 5. Entity Responsibilities

| Area | Entities | Responsibility |
|---|---|---|
| Business State | `Users`, `Goals`, `Plans`, `Tasks` | Current authoritative application/business state |
| Conversation | `Sessions`, `Messages` | Persistent user-agent conversation history |
| Execution Context | `GoalContexts`, `ContextPackages` | Current condensed execution state and immutable per-run handoffs |
| Agent Configuration | `Agents`, `Tools`, `AgentTools`, `ModelConfigurations` | Agent behavior, models, capabilities and permissions |
| Agent Runtime | `AgentRuns`, `ToolExecutions` | What Agents and Tools actually executed |

The boundaries are intentional:

- `Goals` answer **what the user currently wants**.
- `Plans` and `Tasks` answer **what work currently exists and its progress**.
- `Sessions` and `Messages` answer **what was discussed**.
- `GoalContexts` answer **where execution currently stands**.
- `ContextPackages` answer **what a specific Agent knew when it started**.
- `AgentRuns` and `ToolExecutions` answer **what the AI system actually did**.

---

## 6. Goal Lifecycle and Goal Changes

### 6.1 No GoalVersions

V3.0 intentionally removes `GoalVersions`.

A Goal is mutable because the product requirement is continuous execution rather than formal requirements versioning. When a user changes a Goal, the application updates the Goal and triggers impact analysis.

Historical information is still available through:

- `Messages` — what the user said and changed.
- `AgentRuns` — what Agents did in response.
- `ContextPackages` — exactly what context each Agent received.
- `Plans` / `Tasks` — current retained work and completion state.

### 6.2 Impact Analysis

A Goal change must not automatically invalidate all existing work.

```text
Goal changed
    │
    ▼
Impact Analysis
    │
    ├── UNAFFECTED
    │      Existing work continues.
    │
    ├── EXTENSION
    │      Existing work remains valid and new work is added.
    │
    ├── MODIFICATION
    │      Affected work is adjusted or revalidated.
    │
    └── INVALIDATION
           Obsolete work is cancelled and replacement work is created.
```

Completed work should remain completed unless the new requirement explicitly makes its result invalid.

### 6.3 Running Agent when Goal Changes

If an Agent is already executing when a Goal changes:

- **Unaffected work** continues normally.
- **Extension** normally allows the existing Agent to continue while new independent work may be spawned.
- **Modification** may allow the old execution to finish, but its result must be revalidated against the current context.
- **Invalidation** may cancel the obsolete AgentRun and create replacement work.

The runtime should not apply a universal “always cancel” or “always wait” policy.

---

## 7. Context Manager and Context Contract

### 7.1 Core Definition

The **Context Manager** is a configured Agent role, not a database entity.

Its responsibility is continuity:

> **Give each newly spawned Agent the current picture it needs to understand the Goal, accepted progress, unfinished work, important decisions, blockers, and its specific assignment.**

The Context Manager does **not** decide what work should happen next and does **not** review quality.

### 7.2 Context Concepts

```text
Goal
 │
 │ What does the user currently want?
 ▼
GoalContext
 │
 │ Where are we now while achieving it?
 ▼
ContextPackage
 │
 │ What does THIS Agent need to know?
 ▼
AgentRun
```

### 7.3 GoalContext

There is conceptually one current `GoalContext` per Goal.

Example state:

```json
{
  "phase": "EXECUTION",
  "completed": ["DATABASE_DESIGN", "LLM_CONNECTION"],
  "active": ["PLANNER_IMPLEMENTATION"],
  "pending": ["TASK_EXECUTOR", "REVIEW_AGENT"],
  "acceptedDecisions": ["Use SAP CAP", "Use PostgreSQL"],
  "blockers": [],
  "nextAction": "CONTINUE_PLANNER"
}
```

`GoalContext` is a condensed coordination state. It must not become a duplicate of complete Plans, Tasks, Messages or AgentRuns.

### 7.4 GoalContext Revision

`revision` is retained even though Goal versioning is removed.

It is an **agent-runtime concurrency mechanism**, not business versioning.

```text
GoalContext revision 20
        │
        ├── Agent A starts from R20
        └── Agent B starts from R20

Agent A accepted
        │
        ▼
GoalContext revision 21

Agent B returns with ContextPackage.contextRevision = 20
        │
        ▼
20 != 21 → potentially stale result → revalidate
```

The same `GoalContext` row may be updated while its revision increases.

### 7.5 ContextPackage

A `ContextPackage` is immutable and records the exact handoff to one Agent execution.

A package may contain:

```text
Agent System Prompt
+
Current Goal
+
Current GoalContext
+
Relevant Plan / Tasks
+
Relevant accepted decisions
+
Relevant conversation/history
+
Specific assignment
+
Expected output contract
```

Different Agents should receive different amounts of context. A Task Executor does not automatically need the entire Goal conversation.

### 7.6 Context Manager Operations

The Context Manager has two major operations:

1. **Synchronize accepted state** after meaningful business/execution changes.
2. **Build working context** when a new Agent execution is spawned.

Rejected Agent proposals must not become accepted truth in `GoalContext`.

---

## 8. Agent Responsibility Model

The architecture separates four fundamental responsibilities:

| Role | Fundamental Question |
|---|---|
| **Orchestrator** | What should happen next? |
| **Context Manager** | What does this Agent need to know? |
| **Worker Agent** | How do I perform this specific job? |
| **Review Agent** | Is the produced result acceptable? |

Additional specialized roles such as `GOAL_ANALYZER`, `PLANNER`, or impact-analysis workers are represented through `Agents.agentType` and their configured prompts/tools.

The Context Manager must not become a universal supervisor that plans, executes, reviews and orchestrates.

---

## 9. Standard Agent Execution and Review Loop

```text
Orchestrator
     │ chooses work
     ▼
Context Manager
     │ builds ContextPackage
     ▼
Worker / Planner
     │ produces proposal
     ▼
Review Agent
   ┌─┴─────────────┐
   │               │
 REJECT          ACCEPT
   │               │
   ▼               ▼
retry / fix    persist accepted state
   │               │
   │               ▼
   │         Context Manager
   │         updates GoalContext
   │               │
   └───────────────┴──→ Orchestrator chooses next work
```

A successful Reviewer execution can itself return `REJECT`. Therefore execution status and review judgment are separate concepts:

```text
AgentRun.status = COMPLETED
AgentRun.output = {
  "decision": "REJECT",
  "feedback": "...",
  "issues": []
}
```

No dedicated `Reviews` entity is required. A Reviewer is an `Agents` record and its execution is an `AgentRun`.

---

## 10. Multi-Agent Execution and Stale Context

`parentRun` and `rootRun` represent Agent execution hierarchies.

```text
Orchestrator Run #100
│
├── Goal Analysis Run #101
├── Planner Run #102
│    └── Research Run #103
└── Reviewer Run #104
```

For Run `#103`:

```text
parentRun = #102
rootRun   = #100
```

Parallel Agents may work from the same context revision. When one accepted result changes the execution state, later results produced from the older revision are not automatically rejected; they are marked as potentially stale and revalidated where necessary.

---

## 11. Tool Control

Tools are explicitly assigned to Agents through `AgentTools`.

Example:

```text
Goal Analyzer
├── READ_GOAL
├── READ_HISTORY
└── UPDATE_GOAL

Planner
├── READ_GOAL
├── READ_PLAN
├── READ_TASKS
└── UPDATE_PLAN

Context Manager
├── READ_GOAL
├── READ_PLAN
├── READ_TASKS
├── READ_CONTEXT
├── UPDATE_CONTEXT
└── BUILD_CONTEXT_PACKAGE

Reviewer
├── READ_GOAL
├── READ_CONTEXT
└── REVIEW_RESULT
```

An Agent should not automatically have access to every system capability.

---

## 12. Memory Principle

> **Memory is controlled context selection from persisted conversation history, current business state, accepted execution state and relevant runtime history. It is not simply the chat history.**

The database owns durable state. The LLM receives temporary working context for one execution.

The following concepts are intentionally **not** first-class database entities in V3.0:

```text
Memory
AgentMemory
VectorMemory
Embeddings
Knowledge
PromptHistory
LLMSessions
GoalVersions
PlanVersions
Reviews
```

They should only be introduced later if a concrete requirement cannot be represented cleanly by the current model.

---

## 13. PostgreSQL, SAP BTP and S/4HANA

The Todo Agent can use PostgreSQL as its application persistence while running on SAP BTP.

S/4HANA remains an external/core ERP system, not the persistence layer for the Todo Agent.

```text
                     SAP BTP
┌─────────────────────────────────────────┐
│                                         │
│          SAP CAP Todo Agent             │
│                   │                     │
│        ┌──────────┴──────────┐          │
│        ▼                     ▼          │
│   PostgreSQL              Agents        │
│                              │          │
│                              ▼          │
│                             LLM         │
│                                         │
└────────────────────┬────────────────────┘
                     │ API / Destination
                     ▼
                  S/4HANA
```

### Data Ownership

| Data | Owner |
|---|---|
| Goals / Plans / Tasks | Todo Agent |
| Sessions / Messages | Todo Agent |
| GoalContexts / ContextPackages | Todo Agent |
| Agent configuration | Todo Agent |
| Agent execution history | Todo Agent |
| Business Partners | S/4HANA |
| Products / Materials | S/4HANA |
| Purchase / Sales Orders | S/4HANA |

SAP data should be accessed through controlled tools/integration services rather than duplicated into the Todo database.

---

## 14. Data Growth and Performance

`Messages`, `ContextPackages`, `AgentRuns`, and `ToolExecutions` may grow significantly.

The application should:

- Query conversation history with pagination.
- Index foreign keys and common status/lookup fields.
- Use `GoalContext` for efficient current execution reconstruction.
- Use session summaries for older conversation context.
- Retrieve only relevant messages when building a `ContextPackage`.
- Avoid sending complete historical conversations to every model invocation.

At larger scale, old raw payloads may be archived to cheaper object/log storage while relational metadata is retained.

---

## 15. Final Relationship Overview

```text
                              USER
                               │
                               ▼
                             Users
                               │
                               ▼
                              Goals
                    (mutable source of truth)
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
       Sessions              Plans             GoalContexts
          │                    │                revision=N
          ▼                    ▼                    │
       Messages              Tasks                  │
                                                    ▼
                                              Context Manager
                                                    │
                                                    ▼
                                             ContextPackages
                                               (immutable)
                                                    │
                                                    ▼
                                                AgentRuns
                                              /     │      \
                                             /      │       \
                                      parentRun   rootRun   ToolExecutions
                                                               │
                                                               ▼
                                                              Tools


                    AGENT CONFIGURATION
                    ===================

                           Agents
                          /      \
                         ▼        ▼
                  AgentTools   ModelConfigurations
                       │
                       ▼
                      Tools
```

---

## 16. Final Design Decisions

1. **`GoalVersions` is removed.** `Goals` is the mutable authoritative representation of what the user currently wants.
2. **`Plans` is living state.** Goal changes do not automatically create Plan versions.
3. **Tasks preserve progress.** Completed/unaffected work is retained; invalidated work can be cancelled; new work can be added.
4. **Goal changes trigger impact analysis**, classified as `UNAFFECTED`, `EXTENSION`, `MODIFICATION`, or `INVALIDATION`.
5. **The Context Manager synchronizes accepted execution state but does not orchestrate or review.**
6. **The Orchestrator decides what happens next**, including whether work should continue, wait, be cancelled, or new work should be spawned.
7. **The Review Agent independently accepts/rejects proposed results.** No separate `Reviews` entity is required.
8. **`GoalContext` is mutable current execution state** and conceptually one exists per Goal.
9. **`GoalContext.revision` remains** for concurrency and stale-result detection. It is not Goal versioning.
10. **`ContextPackage` is immutable** and stores the exact working context supplied to a specific Agent execution.
11. **Parallel Agent results are revalidated when necessary** if their `contextRevision` is older than the current GoalContext revision.
12. **Conversation history is not Agent memory by itself.** Runtime context is selected and assembled explicitly.
13. **Agent, model, tool permissions, runtime execution and business state remain separate concerns.**
14. **New entities require concrete justification.** Common AI-agent concepts are not added merely because other frameworks contain them.

---

## 17. Final Baseline Entities

### Business

- `Users`
- `Goals`
- `Plans`
- `Tasks`

### Conversation

- `Sessions`
- `Messages`

### Execution Context

- `GoalContexts`
- `ContextPackages`

### Agent Configuration

- `Agents`
- `Tools`
- `AgentTools`
- `ModelConfigurations`

### Agent Runtime

- `AgentRuns`
- `ToolExecutions`

**Total: 14 entities**

---

## 18. Database Status

This schema is the **final baseline database design** for the first implementation of the Todo AI Agent.

From this point onward, implementation should proceed against this model. Database changes should only be introduced when a concrete runtime or business requirement cannot be represented correctly with the existing entities.

**Version:** 3.0  
**Status:** Final Baseline / Ready for Implementation
