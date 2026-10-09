# Todo AI Agent --- Backend Structure V1.0

## 1. Purpose

This document defines the backend structure baseline for the Todo AI
Agent built with SAP CAP and TypeScript.

The backend structure is intentionally designed to remain:

-   SAP CAP-native;
-   simple and easy to visualize;
-   primarily functional rather than object-oriented;
-   separated between Todo business logic and the AI Agent runtime;
-   free from unnecessary repository, controller, use-case, or Clean
    Architecture layers.

The goal is to keep the code structure simple while allowing the Agent
runtime itself to become sophisticated.

The only class expected at the current baseline is the SAP CAP
application service:

``` typescript
export class TODO_SERVICE extends cds.ApplicationService {
    async init() {
        // Register handlers
        await super.init();
    }
}
```

All other application logic should primarily be implemented using
functions and modules.

------------------------------------------------------------------------

## 2. Core Design Principles

### 2.1 Use SAP CAP as the application framework

Entities exposed through `todo-service.cds` already receive standard
CRUD operations from SAP CAP.

Therefore, the backend should not recreate generic CRUD controllers or
handlers unnecessarily.

For example, when an entity is exposed as:

``` cds
entity Tasks as projection on db.Tasks;
```

CAP already provides the normal CRUD endpoints.

Custom handlers should only be introduced when additional behavior is
required.

------------------------------------------------------------------------

### 2.2 Keep the architecture functional

The project does not aim to practice object-oriented architecture.

Avoid introducing classes such as:

``` text
GoalService
TaskService
AgentRunner
ContextManager
Orchestrator
OpenAIProvider
```

when plain exported functions are sufficient.

Prefer:

``` typescript
export async function runAgent(...) {}

export async function buildContextPackage(...) {}

export async function orchestrateGoal(...) {}
```

The SAP CAP `ApplicationService` remains the main framework-required
class.

------------------------------------------------------------------------

### 2.3 No repository layer by default

A dedicated repository layer is not required for the current project.

CAP already provides convenient database access through APIs such as:

``` typescript
SELECT
INSERT
UPDATE
DELETE
```

Creating wrappers such as:

``` typescript
class GoalRepository {
    async findById(...) {}
}
```

would currently add indirection without solving a concrete requirement.

A repository abstraction should only be introduced later if persistence
complexity creates a real need for it.

------------------------------------------------------------------------

### 2.4 Separate Todo business logic from Agent logic

The most important structural boundary is:

``` text
Todo Business
     │
     │ requests AI work when necessary
     ▼
Agent System
```

Todo concepts such as Goals, Plans, Tasks, and Sessions belong to the
normal application layer.

Agent concepts such as Agent execution, ContextPackages, GoalContext
synchronization, orchestration, Tools, Model Providers, AgentRuns, and
ToolExecutions belong inside `agents/`.

------------------------------------------------------------------------

## 3. Final Backend Structure

The current backend structure should follow this baseline:

``` text
srv/
│
├── todo-service.cds
├── todo-service.ts
│
├── handlers/
│   ├── goal.handler.ts
│   ├── plan.handler.ts
│   ├── task.handler.ts
│   └── session.handler.ts
│
├── services/
│   ├── goal.service.ts
│   ├── plan.service.ts
│   ├── task.service.ts
│   └── session.service.ts
│
├── agents/
│   ├── agent.service.ts
│   ├── context.service.ts
│   ├── orchestrator.service.ts
│   ├── provider.service.ts
│   ├── tool.service.ts
│   │
│   ├── providers/
│   │   ├── openai.provider.ts
│   │   ├── ai-core.provider.ts
│   │   └── mock.provider.ts
│   │
│   ├── tools/
│   │   ├── read-goal.tool.ts
│   │   ├── read-plan.tool.ts
│   │   ├── read-tasks.tool.ts
│   │   ├── update-plan.tool.ts
│   │   └── update-task.tool.ts
│   │
│   └── types/
│       ├── agent.types.ts
│       ├── context.types.ts
│       ├── provider.types.ts
│       └── tool.types.ts
│
├── types/
│   ├── goal.types.ts
│   ├── plan.types.ts
│   ├── task.types.ts
│   └── session.types.ts
│
└── utils/
```

This is a baseline rather than a requirement to create every file
immediately.

Files and folders should be added when implementation actually requires
them.

------------------------------------------------------------------------

## 4. `todo-service.ts`

`todo-service.ts` is the composition point for the SAP CAP service.

Example:

``` typescript
import cds from "@sap/cds";

import goalHandler from "./handlers/goal.handler";
import planHandler from "./handlers/plan.handler";
import taskHandler from "./handlers/task.handler";
import sessionHandler from "./handlers/session.handler";

export class TODO_SERVICE extends cds.ApplicationService {
    async init() {
        await goalHandler(this);
        await planHandler(this);
        await taskHandler(this);
        await sessionHandler(this);

        await super.init();
    }
}
```

Its responsibility should remain small:

``` text
TODO_SERVICE
     │
     └── register CAP handlers
```

It should not contain:

-   Goal business logic;
-   Task execution logic;
-   prompt construction;
-   model-provider logic;
-   Agent execution;
-   orchestration;
-   context construction.

Those responsibilities belong in their respective modules.

------------------------------------------------------------------------

## 5. Handlers

The `handlers/` folder represents the SAP CAP boundary.

Example:

``` typescript
import cds from "@sap/cds";

export default async function taskHandler(srv: cds.Service) {
    // Register custom Task events/actions here.
}
```

Handlers may work with CAP concepts such as:

``` text
srv.before(...)
srv.on(...)
srv.after(...)

req.data
req.user
req.reject(...)
```

Their responsibility is to translate a CAP event/action into application
behavior.

Conceptually:

``` text
CAP Request / Event
        │
        ▼
     Handler
        │
        ▼
     Service
```

Handlers should remain thin.

### CRUD rule

Do not create handlers merely to reproduce CRUD behavior already
provided by CAP.

For example:

``` text
CREATE Task
READ Task
UPDATE Task
DELETE Task
```

do not need custom handlers unless additional business behavior is
required.

A handler becomes useful when something meaningful must happen, for
example:

``` text
Goal created
    ↓
start Agent workflow
```

or:

``` text
Goal updated
    ↓
perform Goal-change processing
```

or:

``` text
executeTask action
    ↓
start controlled Task execution
```

------------------------------------------------------------------------

## 6. Business Services

The top-level `services/` folder contains Todo application/business
logic.

``` text
services/
├── goal.service.ts
├── plan.service.ts
├── task.service.ts
└── session.service.ts
```

These services should use functional exports.

Example:

``` typescript
export async function handleGoalCreated(goalId: string) {
    // Business behavior
}

export async function handleGoalChanged(goalId: string) {
    // Business behavior
}
```

Task example:

``` typescript
export async function executeTask(taskId: string) {}

export async function completeTask(taskId: string) {}

export async function blockTask(
    taskId: string,
    reason: string
) {}

export async function cancelTask(taskId: string) {}
```

These services may directly use CAP database APIs where appropriate.

They should not need a repository abstraction by default.

------------------------------------------------------------------------

## 7. Business and Agent Boundary

The high-level dependency should be:

``` text
CAP
 │
 ▼
Handler
 │
 ▼
Business Service
 │
 ├──────────────► CAP Database
 │
 │
 └── needs AI ─► agents/
```

For example:

``` typescript
import { runAgent } from "../agents/agent.service";

export async function processNewGoal(goalId: string) {
    return runAgent({
        agentCode: "GOAL_ANALYZER",
        goalId,
        purpose: "GOAL_ANALYSIS"
    });
}
```

The Goal service may request Agent execution.

However, it should not need to understand:

-   OpenAI;
-   SAP AI Core;
-   provider SDKs;
-   ContextPackage construction details;
-   Tool execution internals;
-   token accounting;
-   AgentRun lifecycle internals.

Those belong inside `agents/`.

------------------------------------------------------------------------

## 8. The `agents/` Folder

Everything specific to the AI Agent system should be grouped under:

``` text
agents/
```

A useful decision rule is:

> If AI Agents were removed from the Todo application, would this code
> disappear?

If the answer is yes, it most likely belongs under `agents/`.

Examples:

``` text
Agent execution                 → agents/
AgentRun lifecycle              → agents/
ContextPackage construction     → agents/
GoalContext synchronization     → agents/
stale-context detection         → agents/
Orchestrator                    → agents/
Tool execution                  → agents/
Model/provider invocation       → agents/
review Agent execution          → agents/
retry/spawn control             → agents/
```

Business concepts remain outside:

``` text
Goal business logic             → services/
Plan business logic             → services/
Task business logic             → services/
Session business logic          → services/
```

------------------------------------------------------------------------

## 9. `agent.service.ts`

`agent.service.ts` represents the central generic Agent execution
runtime.

The primary API can initially be as simple as:

``` typescript
export async function runAgent(
    input: RunAgentInput
): Promise<AgentRunResult> {
    // Agent runtime
}
```

Conceptually, `runAgent()` is responsible for coordinating:

``` text
runAgent()
   │
   ├── load Agent configuration
   │
   ├── load ModelConfiguration
   │
   ├── build ContextPackage
   │
   ├── create AgentRun
   │
   ├── resolve permitted Tools
   │
   ├── invoke provider/model
   │
   ├── process Tool calls
   │
   ├── persist ToolExecutions
   │
   ├── persist AgentRun result
   │
   └── return execution result
```

The exact responsibilities may later be split if this file becomes too
large.

Do not split it prematurely.

------------------------------------------------------------------------

## 10. Do Not Hard-Code One TypeScript Agent per Agent Role

The backend should not return to a structure such as:

``` text
planning.agent.ts
review.agent.ts
goal-analyzer.agent.ts
worker.agent.ts
```

where every Agent independently implements the same model-execution
runtime.

The database already defines configurable Agents through information
such as:

``` text
agentType
systemPrompt
modelConfig
temperature
maxTokens
maxIterations
AgentTools
```

Therefore the preferred architecture is:

``` text
                         runAgent()
                             │
             ┌───────────────┼───────────────┐
             │               │               │
          PLANNER         REVIEWER         WORKER
             │               │               │
             └───────────────┼───────────────┘
                             │
                    same generic runtime
```

Different Agent behavior comes primarily from:

-   Agent configuration;
-   system prompt;
-   ModelConfiguration;
-   permitted Tools;
-   ContextPackage;
-   execution purpose;
-   assignment.

The runtime itself remains generic.

------------------------------------------------------------------------

## 11. `context.service.ts`

Context management belongs under `agents/` because GoalContext and
ContextPackage exist primarily to support controlled Agent execution.

The service can initially expose functions such as:

``` typescript
export async function syncGoalContext(
    goalId: string
) {}

export async function buildContextPackage(
    input: BuildContextInput
) {}

export async function checkContextRevision(
    goalId: string,
    revision: number
) {}
```

### `syncGoalContext`

Synchronizes the current condensed execution picture after meaningful
accepted changes.

Examples include:

-   accepted Plan generation;
-   Task completion;
-   Task cancellation;
-   Task becoming blocked;
-   accepted Goal-change impact;
-   newly accepted Tasks;
-   accepted important decisions;
-   blocker resolution.

### `buildContextPackage`

Constructs the relevant immutable working context for one Agent
execution.

It may select:

``` text
Agent system prompt
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
Expected output
```

It should not automatically send all application history to every Agent.

### `checkContextRevision`

Supports stale-context detection.

Example:

``` text
Agent ContextPackage revision = 20
Current GoalContext revision  = 21

20 != 21

→ result is potentially stale
```

Stale does not automatically mean rejected; the result may require
revalidation.

------------------------------------------------------------------------

## 12. `orchestrator.service.ts`

The Orchestrator remains an Agent-runtime responsibility.

It answers:

> What should happen next?

It can remain functional:

``` typescript
export async function orchestrateGoal(
    goalId: string
) {}

export async function determineNextWork(
    goalId: string
) {}

export async function spawnAgent(
    input: SpawnAgentInput
) {}
```

Conceptually:

``` text
Current Goal
+
GoalContext
+
Plan / Tasks
+
running AgentRuns
+
dependencies
       │
       ▼
determineNextWork()
       │
       ▼
decision
```

Possible decisions may include:

``` text
run an Agent
wait
retry
continue existing work
spawn independent work
cancel obsolete work
revalidate stale work
complete Goal
```

The Orchestrator decides what should happen.

It does not need to implement provider/model execution itself.

That belongs to `agent.service.ts`.

------------------------------------------------------------------------

## 13. Review Agent

A dedicated `review.service.ts` is not required at the initial baseline.

A Reviewer is simply another configured Agent.

For example:

``` typescript
const review = await runAgent({
    agentCode: "PLAN_REVIEWER",
    goalId,
    purpose: "REVIEW",
    assignment: "Review the generated Plan and Tasks"
});
```

Its output may contain:

``` json
{
    "decision": "ACCEPT",
    "feedback": null,
    "issues": []
}
```

or:

``` json
{
    "decision": "REJECT",
    "feedback": "Task dependencies are incomplete.",
    "issues": [
        "Missing dependency between Task 2 and Task 3."
    ]
}
```

Agent execution status and review judgment remain separate concepts.

For example:

``` text
AgentRun.status = COMPLETED
Review decision = REJECT
```

This means the Reviewer successfully executed but rejected the proposed
result.

If review orchestration later becomes sufficiently complex, a dedicated
module can then be introduced.

------------------------------------------------------------------------

## 14. Providers

Providers belong under the Agent system:

``` text
agents/
└── providers/
```

The provider layer should remain generic.

It should hide vendor-specific SDK details from the Agent runtime.

Examples:

``` text
OpenAI
SAP AI Core
Anthropic
Google
Azure OpenAI
local model
mock model
```

The Agent runtime should operate against a common request/response
structure.

Example:

``` typescript
export interface GenerateRequest {
    model: string;
    messages: Message[];
    temperature?: number;
    maxTokens?: number;
    tools?: ToolDefinition[];
}

export interface GenerateResponse {
    content: string;
    toolCalls?: ToolCall[];
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}
```

A provider can simply export a function:

``` typescript
export async function generate(
    request: GenerateRequest
): Promise<GenerateResponse> {
    // Provider-specific implementation
}
```

No provider class is required.

------------------------------------------------------------------------

## 15. `provider.service.ts`

`provider.service.ts` resolves the configured provider and delegates
execution.

Conceptually:

``` text
ModelConfiguration
       │
       │ provider = SAP_AI_CORE
       │ model = ...
       ▼
provider.service.ts
       │
       ▼
ai-core.provider.ts
       │
       ▼
SAP AI Core
```

A simple implementation can initially use a switch:

``` typescript
import * as openAIProvider from "./providers/openai.provider";
import * as aiCoreProvider from "./providers/ai-core.provider";

export async function generate(
    provider: string,
    request: GenerateRequest
) {
    switch (provider) {
        case "OPENAI":
            return openAIProvider.generate(request);

        case "SAP_AI_CORE":
            return aiCoreProvider.generate(request);

        default:
            throw new Error(
                `Unsupported provider: ${provider}`
            );
    }
}
```

There is no need for a `ModelFactory` class.

The function already provides the required provider-resolution behavior.

------------------------------------------------------------------------

## 16. Model Configuration vs Provider

These concepts must remain distinct.

``` text
ModelConfiguration
       │
       ├── provider
       ├── model
       └── status
       │
       ▼
provider.service.ts
       │
       ▼
Provider implementation
```

For example:

``` text
ModelConfiguration
------------------
provider = SAP_AI_CORE
model    = gpt-...
```

The Agent references a `ModelConfiguration`.

The provider service then resolves the implementation required to
execute that configuration.

This means business services and Agent orchestration do not need to know
vendor SDK details.

------------------------------------------------------------------------

## 17. Tools

Agent Tools should also live under `agents/`.

``` text
agents/
├── tool.service.ts
└── tools/
    ├── read-goal.tool.ts
    ├── read-plan.tool.ts
    ├── read-tasks.tool.ts
    ├── update-plan.tool.ts
    └── update-task.tool.ts
```

Individual Tool files should remain functional.

Example:

``` typescript
export async function readGoal(input: ReadGoalInput) {
    // Read Goal through CAP/database
}
```

`tool.service.ts` can resolve Tool codes to implementations.

Example:

``` typescript
import { readGoal } from "./tools/read-goal.tool";
import { readPlan } from "./tools/read-plan.tool";
import { readTasks } from "./tools/read-tasks.tool";

const toolHandlers = {
    READ_GOAL: readGoal,
    READ_PLAN: readPlan,
    READ_TASKS: readTasks
};

export async function executeTool(
    code: string,
    input: unknown
) {
    const handler = toolHandlers[code];

    if (!handler) {
        throw new Error(`Unknown tool: ${code}`);
    }

    return handler(input);
}
```

The complete relationship is:

``` text
Tools table
    │
    ▼
AgentTools
permission mapping
    │
    ▼
tool.service.ts
runtime resolution
    │
    ▼
*.tool.ts
implementation
    │
    ▼
ToolExecutions
audit history
```

`AgentTools` determines what an Agent is permitted to use.

The Tool service determines which application function implements that
Tool.

`ToolExecutions` records what actually happened.

------------------------------------------------------------------------

## 18. Types

Types should also follow the business/Agent boundary.

### Business types

``` text
types/
├── goal.types.ts
├── plan.types.ts
├── task.types.ts
└── session.types.ts
```

These describe Todo application concepts.

### Agent types

``` text
agents/types/
├── agent.types.ts
├── context.types.ts
├── provider.types.ts
└── tool.types.ts
```

These describe Agent-runtime concepts.

For example:

``` typescript
export interface RunAgentInput {
    agentCode: string;
    goalId: string;
    purpose: AgentPurpose;

    assignment?: string;

    sessionId?: string;
    parentRunId?: string;
    rootRunId?: string;
}
```

This keeps Agent-specific contracts inside the Agent boundary.

------------------------------------------------------------------------

## 19. Agent Prompts

Do not create hard-coded prompt files for every configured Agent by
default.

For example, avoid immediately introducing:

``` text
planner.prompt.ts
reviewer.prompt.ts
goal-analyzer.prompt.ts
worker.prompt.ts
```

The `Agents` database entity already stores the Agent's `systemPrompt`.

Having both:

``` text
Agents.systemPrompt
```

and:

``` text
planner.prompt.ts
```

would create two potential sources of truth.

The database should remain the authoritative Agent configuration.

Code may still construct runtime context and assignment instructions
dynamically.

------------------------------------------------------------------------

## 20. Dependency Direction

The intended dependency direction is:

``` text
                 todo-service.ts
                        │
                        ▼
                    handlers/
                        │
                        ▼
                    services/
                    /       \
                   /         \
                  ▼           ▼
              CAP / DB      agents/
                               │
                  ┌────────────┼─────────────┐
                  ▼            ▼             ▼
             context      orchestrator     agent
                                            │
                                  ┌─────────┴─────────┐
                                  ▼                   ▼
                              providers             tools
```

A concrete execution may look like:

``` text
User creates Goal
       │
       ▼
SAP CAP CRUD
       │
       ▼
goal.handler.ts
       │
       ▼
goal.service.ts
       │
       ▼
agents/orchestrator.service.ts
       │
       ▼
agents/agent.service.ts
       │
       ├── context.service.ts
       │
       ├── provider.service.ts
       │       │
       │       ▼
       │   providers/*
       │
       └── tool.service.ts
               │
               ▼
           tools/*
```

------------------------------------------------------------------------

## 21. Initial Implementation Should Be Smaller Than the Final Tree

The complete structure describes where code belongs as the project
grows.

It does not mean every file should be created immediately.

An early implementation may be only:

``` text
srv/
├── todo-service.cds
├── todo-service.ts
│
├── handlers/
│   ├── goal.handler.ts
│   └── task.handler.ts
│
├── services/
│   ├── goal.service.ts
│   └── task.service.ts
│
├── agents/
│   ├── agent.service.ts
│   ├── context.service.ts
│   ├── orchestrator.service.ts
│   ├── provider.service.ts
│   │
│   ├── providers/
│   │   └── ai-core.provider.ts
│   │
│   └── types/
│       ├── agent.types.ts
│       ├── context.types.ts
│       └── provider.types.ts
│
└── types/
    ├── goal.types.ts
    └── task.types.ts
```

Tools should be added when the first Agent actually needs Tool calling.

Additional handlers should be added when custom CAP behavior exists.

Additional provider implementations should be added when they are
actually supported.

------------------------------------------------------------------------

## 22. What We Intentionally Do Not Introduce

The current backend baseline intentionally avoids:

``` text
controllers/
repositories/
use-cases/
application/
infrastructure/
domain/
interfaces/
factories/
DTO layers for every operation
dependency injection containers
base service classes
base repository classes
one class per Agent
one TypeScript implementation per Agent role
```

This is not because those patterns are inherently incorrect.

They are omitted because they do not currently solve a concrete problem
in this project.

The architecture should grow in response to actual complexity rather
than anticipated complexity.

------------------------------------------------------------------------

## 23. When to Split a Service

Flat structure does not mean files should grow indefinitely.

Start simple:

``` text
agents/
├── agent.service.ts
├── context.service.ts
└── orchestrator.service.ts
```

If one service later becomes too large, split it based on demonstrated
responsibilities.

For example, if `context.service.ts` eventually becomes difficult to
maintain:

``` text
agents/
├── context.service.ts
└── context/
    ├── context.builder.ts
    └── context.sync.ts
```

But do not create this structure before it is needed.

The rule is:

> Start flat. Split when complexity appears.

------------------------------------------------------------------------

## 24. Architectural Responsibility Summary

  -----------------------------------------------------------------------
  Area                                Responsibility
  ----------------------------------- -----------------------------------
  `todo-service.cds`                  Expose CAP service entities/actions

  `todo-service.ts`                   Initialize the CAP service and
                                      register handlers

  `handlers/`                         Handle custom CAP events/actions

  `services/`                         Todo business logic

  `types/`                            Todo business TypeScript contracts

  `agents/agent.service.ts`           Generic Agent execution runtime

  `agents/context.service.ts`         GoalContext and ContextPackage
                                      operations

  `agents/orchestrator.service.ts`    Decide what Agent work happens next

  `agents/provider.service.ts`        Resolve and invoke model providers

  `agents/providers/`                 Provider-specific integrations

  `agents/tool.service.ts`            Resolve and execute Agent Tools

  `agents/tools/`                     Tool implementations

  `agents/types/`                     Agent-runtime TypeScript contracts

  `utils/`                            Truly generic utility functions
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 25. Final Architectural Principle

The backend should optimize for:

> **Complex Agent behavior with a simple code structure.**

The project is not intended to demonstrate maximum architectural
layering.

It is intended to learn and implement:

-   Agent execution;
-   Agent configuration;
-   context construction;
-   context synchronization;
-   orchestration;
-   Tool calling;
-   review;
-   retry;
-   controlled Agent spawning;
-   stale-context handling;
-   multi-Agent coordination.

Therefore, the code structure should remain understandable enough that
these Agent behaviors are visible rather than hidden behind unnecessary
abstractions.

The final guiding rules are:

1.  Use SAP CAP CRUD instead of rebuilding CRUD layers.
2.  Keep CAP handlers thin.
3.  Put Todo business logic in `services/`.
4.  Put all Agent-specific runtime logic under `agents/`.
5.  Prefer functions and modules over classes.
6.  Keep `TODO_SERVICE` as the primary framework-level class.
7.  Do not add repositories without a concrete persistence requirement.
8.  Keep providers generic and hidden behind `provider.service.ts`.
9.  Treat Agents as database-configured behavior executed through one
    generic runtime.
10. Do not create one TypeScript Agent implementation per Agent role.
11. Keep Agent prompts primarily in Agent configuration rather than
    duplicated source files.
12. Start with a flat structure.
13. Split modules only when real complexity justifies it.
14. Keep business state and Agent runtime conceptually separate even
    when they interact.
15. Prefer understandable execution flow over architectural ceremony.

------------------------------------------------------------------------

## 26. Baseline Status

This document represents the current backend-structure baseline for the
Todo AI Agent.

It is aligned with:

-   Todo AI Agent --- Agent Architecture & Database Design V3.0
-   Todo AI Agent --- Business Requirements & Business Logic V1.0

Future structural changes should be introduced only when implementation
demonstrates a concrete need.

**Version:** 1.0\
**Status:** Backend Structure Baseline / Ready for Implementation
