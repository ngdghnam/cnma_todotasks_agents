# Todo AI Agent — Business Requirements & Business Logic V1.0

## 1. Purpose

This document defines the finalized business requirements and business logic for the Todo AI Agent.

The system is designed to help a user turn a high-level Goal into an actionable Plan and Tasks, then continuously coordinate AI Agents as the Goal and execution state evolve.

The core product principle is:

> **The Goal is living business state. The system should continuously adapt ongoing work to the user's current Goal without unnecessarily restarting completed or unaffected work.**

This document is aligned with the finalized Database V3.0 baseline.

---

## 2. Product Objective

The Todo AI Agent allows a user to:

1. Define a Goal.
2. Automatically analyze the Goal.
3. Generate a Plan.
4. Break the Plan into executable Tasks.
5. Execute or coordinate Tasks through AI Agents.
6. Review Agent outputs before accepted results become authoritative.
7. Track completed, active, pending, blocked, and cancelled work.
8. Change the Goal or requirements while work is in progress.
9. Analyze the impact of Goal changes on existing work.
10. Preserve valid completed work whenever possible.
11. Continue execution based on the updated Goal.
12. Coordinate multiple independent Agent executions through controlled context handoffs.

The project is also intended to provide a practical environment for learning and controlling multi-Agent behavior, including context management, Agent spawning, review loops, stale-context detection, and orchestration.

---

## 3. Core Business Concepts

### 3.1 Goal

A Goal represents what the user currently wants to achieve.

Examples:

- Build a Todo AI Agent with SAP CAP.
- Learn backend system design.
- Prepare a release plan for a software product.

A Goal is **mutable**.

When the user's requirement changes, the existing Goal is updated. The system does not create a separate Goal version for every change.

The current Goal is the authoritative representation of the user's current intention.

Historical discussion about how the Goal changed remains available through Sessions and Messages.

---

### 3.2 Plan

A Plan describes how the system currently intends to achieve a Goal.

A Plan is also living business state.

The Plan may evolve when:

- the Goal changes;
- new requirements are introduced;
- Tasks fail or become blocked;
- Agent results reveal additional required work;
- existing work becomes unnecessary;
- the Orchestrator determines that additional work is required.

Changing the Goal does not automatically create an entirely new Plan.

The system should preserve valid work and modify only affected parts whenever possible.

---

### 3.3 Task

A Task is an executable unit of work within a Plan.

A Task may be:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `COMPLETED`
- `CANCELLED`

Completed Tasks should not be repeated merely because the Goal changes.

A Task may be cancelled when a Goal change or later decision makes the work obsolete or invalid.

New Tasks may be added to the existing Plan when additional work becomes necessary.

---

### 3.4 Session and Message

A Session represents a persistent user-to-system conversation related to a Goal.

Messages preserve the raw conversation history.

Conversation history may be used for:

- Goal refinement;
- understanding user changes;
- debugging;
- context reconstruction;
- explaining why business state changed.

Persisting a Message does not mean that every Message must be sent to every Agent.

---

### 3.5 Goal Context

GoalContext represents the system's **current condensed execution picture** for a Goal.

It answers:

> **Where are we now while achieving this Goal?**

It may contain:

- current phase;
- completed work;
- active work;
- pending work;
- blockers;
- accepted decisions;
- important constraints;
- next expected action.

GoalContext does not replace Goals, Plans, Tasks, Messages, or AgentRuns.

Those entities remain authoritative for their respective responsibilities.

GoalContext exists to make Agent coordination and context reconstruction explicit and efficient.

Each meaningful accepted state change increments the GoalContext revision.

Example:

```text
revision 17
    ↓
accepted Task result
    ↓
revision 18
```

---

### 3.6 Context Package

A ContextPackage is an immutable working-context snapshot prepared for one Agent execution.

It answers:

> **What did this specific Agent know when it started working?**

A ContextPackage may include:

- current Goal;
- current GoalContext;
- relevant Plan and Tasks;
- relevant accepted decisions;
- constraints;
- dependencies;
- selected conversation history;
- review feedback;
- specific assignment;
- expected output.

Different Agents may receive different ContextPackages even when working on the same Goal.

---

### 3.7 Agent Run

An AgentRun represents one execution of one configured Agent.

It records:

- which Agent executed;
- why it executed;
- which Goal it related to;
- which ContextPackage it received;
- its parent/root execution hierarchy;
- runtime status;
- input and output;
- token usage;
- timing;
- failures.

AgentRuns provide execution history and auditability.

---

## 4. Agent Responsibility Model

The system separates Agent responsibilities intentionally.

### 4.1 Orchestrator

Fundamental question:

> **What should happen next?**

The Orchestrator coordinates execution.

Responsibilities include:

- deciding which work should run;
- deciding whether independent work can run in parallel;
- deciding whether affected running work should continue, wait, be revalidated, or be cancelled;
- spawning appropriate Agent executions;
- coordinating retries and follow-up work;
- respecting execution limits and dependencies.

The Orchestrator does not own durable business state.

---

### 4.2 Context Manager

Fundamental question:

> **What does this Agent need to know?**

Responsibilities include:

1. Synchronizing the current GoalContext after meaningful accepted changes.
2. Building a ContextPackage for a specific Agent execution.

The Context Manager should ensure that newly spawned Agents understand:

- the current Goal;
- what has already been completed;
- what is currently active;
- what remains unfinished;
- accepted decisions;
- relevant constraints;
- what they specifically need to do next.

The Context Manager is not responsible for deciding whether an Agent's output is acceptable.

It also does not decide which Agent should execute next. That belongs to the Orchestrator.

---

### 4.3 Worker Agent

Fundamental question:

> **How do I perform this assigned work?**

A Worker performs a specific assignment.

Examples:

- analyze a Goal;
- generate a Plan;
- execute a Task;
- perform research;
- modify affected work.

Worker output is considered a proposal until it passes the required acceptance/review process.

---

### 4.4 Review Agent

Fundamental question:

> **Is this result acceptable against the current requirements and context?**

A Reviewer evaluates Worker or Planner output.

The review judgment is separate from Agent execution status.

For example:

```text
AgentRun.status = COMPLETED
Review decision = REJECT
```

This means the Reviewer executed successfully but determined that the proposed result was unacceptable.

A rejected proposal must not become authoritative accepted state.

---

### 4.5 Goal / Impact Analysis Agent

When the Goal changes, an analysis capability determines what the change means for existing work.

It should identify:

- unaffected work;
- newly required work;
- work requiring modification;
- work invalidated by the change;
- running work that may become stale;
- dependencies affected by the change.

The result feeds the Context Manager and Orchestrator.

---

## 5. Initial Goal Flow

The default business flow starts when the user defines a Goal.

```text
User defines Goal
        │
        ▼
Persist Goal
        │
        ▼
Analyze Goal
        │
        ▼
Generate Plan
        │
        ▼
Generate Tasks
        │
        ▼
Review generated result when required
        │
        ▼
Accept Plan / Tasks
        │
        ▼
Synchronize GoalContext
        │
        ▼
Orchestrator selects next work
```

The system is designed to generate the actionable Plan and Tasks automatically rather than requiring the user to manually approve every intermediate Goal interpretation.

The user may still communicate changes through conversation at any point.

---

## 6. Standard Agent Execution Flow

For controlled work, the reusable execution pattern is:

```text
Orchestrator
     │
     ▼
Context Manager
     │
     │ build ContextPackage
     ▼
Worker / Planner
     │
     │ proposal
     ▼
Review Agent
   ┌─┴─────────────┐
   │               │
REJECT           ACCEPT
   │               │
   ▼               ▼
feedback        persist accepted
   │            business result
   ▼               │
retry              ▼
Worker       Context Manager
                   │
                   ▼
           update GoalContext
                   │
                   ▼
              Orchestrator
```

A proposal must not automatically become accepted business truth merely because an Agent produced it.

---

## 7. Goal Change Business Logic

A user may update the Goal at any time.

Example:

```text
Original Goal:
Build a Todo AI Agent with SAP CAP.

Updated Goal:
Build a Todo AI Agent with SAP CAP and support
multiple Agents with independent review.
```

A Goal change does **not** automatically mean:

- restart the entire Plan;
- cancel every running Agent;
- recreate completed Tasks;
- discard previous accepted work.

Instead, the system performs impact analysis.

---

## 8. Goal Change Impact Classification

Existing work should be classified according to the effect of the Goal change.

### 8.1 Unaffected

The existing work remains valid.

Example:

```text
Running Task:
Design database schema

Goal change:
Add dark mode to the UI
```

The database work may continue normally.

Business action:

```text
KEEP / CONTINUE
```

---

### 8.2 Extension

The previous work remains valid, but additional work is required.

Example:

```text
Current Goal:
Generate Tasks from a Goal

New requirement:
Add a Review Agent
```

Existing Tasks remain valid, while new Tasks may be created for:

- Review Agent;
- review workflow;
- integration.

Business action:

```text
KEEP existing work
+
ADD new work
```

---

### 8.3 Modification

The existing work is partially valid but must be adjusted.

Example:

```text
Running work:
Implement Planner

New requirement:
Every Planner result must support independent review.
```

The existing Planner implementation may still be useful, but its output or integration may require modification.

Business action may be:

```text
ALLOW current work to finish
        ↓
REVALIDATE against current GoalContext
        ↓
ACCEPT or CREATE adjustment work
```

---

### 8.4 Invalidation

The Goal change makes previous or running work no longer valid.

Example:

```text
Running Task:
Implement custom JWT authentication

New requirement:
Authentication must use SAP IAS instead.
```

Continuing the old work would waste resources.

Business action:

```text
CANCEL obsolete work
        ↓
CREATE replacement work
        ↓
SPAWN appropriate Agent
```

---

## 9. Running Work During Goal Changes

When a Goal changes while Agents are already running, the system must not use one universal policy.

The Orchestrator should choose behavior according to impact.

### Unaffected running work

Continue execution.

### Extension

Continue existing work and create additional independent work when appropriate.

### Modification

Allow useful work to finish when practical, then revalidate the result against the latest context before accepting it.

### Invalidation

Cancel obsolete work when possible and create replacement work.

The principle is:

> **Do not waste valid work, but do not accept work that is no longer valid against the current Goal.**

---

## 10. Context Revision and Stale-Agent Detection

GoalContext revision protects the system when multiple Agents execute concurrently.

Example:

```text
Current GoalContext = revision 20

          ├── Agent A starts with R20
          └── Agent B starts with R20
```

Agent A finishes first and its result is accepted:

```text
R20
 ↓
accepted result
 ↓
R21
```

Agent B later returns with a result produced from R20.

The runtime can detect:

```text
Agent B ContextPackage.contextRevision = 20
Current GoalContext.revision           = 21

20 != 21
```

Agent B's result is therefore potentially stale.

Stale does **not** automatically mean rejected.

The result should be evaluated against the current state.

Possible outcomes:

```text
Still valid
    ↓
accept

Needs adjustment
    ↓
create/retry modification work

No longer valid
    ↓
reject/cancel
```

---

## 11. Parallel Agent Execution

Multiple Agents may execute concurrently when their work is independent.

Example:

```text
                    Orchestrator
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
           Agent A               Agent B
          Task 003              Task 004
              │                     │
              ▼                     ▼
          Review A              Review B
```

Parallel execution must respect:

- Task dependencies;
- current Goal;
- current GoalContext revision;
- Agent permissions;
- maximum execution/spawn limits;
- conflicts between work items.

The Orchestrator controls whether work is safe to parallelize.

---

## 12. Accepted State Rule

The system distinguishes between:

```text
PROPOSED STATE
```

and:

```text
ACCEPTED STATE
```

Agent output is proposed state until accepted according to the relevant workflow.

Only accepted meaningful changes may update:

- Plan;
- Tasks;
- GoalContext;
- other authoritative business state.

Rejected proposals remain available through AgentRun history for debugging and audit but must not be represented as accepted truth.

---

## 13. Task Lifecycle

Default Task lifecycle:

```text
TODO
 │
 ▼
IN_PROGRESS
 │
 ├──────────────► BLOCKED
 │                  │
 │                  └────► IN_PROGRESS
 │
 ├──────────────► CANCELLED
 │
 ▼
COMPLETED
```

### TODO

Task exists but execution has not started.

### IN_PROGRESS

An Agent or other executor is actively working on the Task.

### BLOCKED

The Task cannot currently proceed because a dependency, decision, resource, or prerequisite is missing.

### COMPLETED

The Task's accepted result has been completed.

Completed work should normally be preserved across Goal changes unless the new Goal explicitly invalidates its result.

### CANCELLED

The Task is intentionally stopped or made obsolete.

Typical reasons include:

- Goal change;
- changed architecture;
- duplicate work;
- invalidated requirement;
- no longer required.

---

## 14. Plan Evolution

A Plan is not recreated merely because the Goal changes.

Example:

```text
Before:

Plan
├── T1 Database          COMPLETED
├── T2 LLM Integration   COMPLETED
├── T3 Planner           IN_PROGRESS
└── T4 Executor          TODO
```

User adds multi-Agent review.

After impact analysis:

```text
Plan
├── T1 Database          COMPLETED
├── T2 LLM Integration   COMPLETED
├── T3 Planner           IN_PROGRESS / REVALIDATE
├── T4 Executor          TODO
├── T5 Review Agent      TODO       ← NEW
└── T6 Review Workflow   TODO       ← NEW
```

The Plan therefore evolves continuously while preserving useful work.

---

## 15. Context Synchronization Rule

GoalContext should be synchronized after meaningful accepted state changes.

Examples:

- Plan generated and accepted;
- Task completed;
- Task cancelled;
- Task becomes blocked;
- Goal change impact analysis accepted;
- new Tasks introduced;
- important decision accepted;
- blocker resolved.

Not every low-level event requires a new context revision.

For example, logging a Tool call does not necessarily require GoalContext revision increment.

The revision represents a meaningful change to the execution picture.

---

## 16. Context Construction Rule

An Agent should receive only the context relevant to its assignment.

The system should not automatically send:

- every historical Message;
- every previous AgentRun;
- every Task;
- every Tool execution;
- all stored data.

Example Planner context:

```text
System Prompt
+
Current Goal
+
Current GoalContext
+
Current Plan when applicable
+
Relevant constraints / decisions
+
Relevant Goal conversation
+
Specific planning assignment
+
Expected output
```

Example Task Worker context:

```text
System Prompt
+
Goal summary
+
Current Task
+
Dependencies
+
Relevant decisions
+
Constraints
+
Review feedback when retrying
+
Expected output
```

This keeps Agent context controlled and reduces unnecessary token usage.

---

## 17. Memory Principle

The system does not treat raw conversation history as Agent memory.

The working principle is:

> **Memory is controlled context selection from durable business state, conversation history, accepted decisions, and execution state.**

The database owns durable state.

The LLM receives temporary working context for a specific execution.

---

## 18. Retry and Review Logic

When a Reviewer rejects a result:

```text
Worker
  │
  ▼
Proposal
  │
  ▼
Reviewer
  │
REJECT
  │
  ▼
Feedback
  │
  ▼
ContextPackage for retry
  │
  ▼
Worker retry
```

The retry should include relevant review feedback.

Retries must respect configured limits such as `maxIterations`.

If the retry limit is reached, the execution should stop or escalate rather than loop indefinitely.

---

## 19. Agent Spawning Rules

An Agent may create or request downstream work through the controlled runtime.

Agent spawning must be bounded.

The runtime should consider:

- Agent role;
- permitted Tools;
- current Goal;
- current GoalContext;
- Task dependencies;
- current execution hierarchy;
- maximum iterations;
- configured execution/spawn limits;
- duplicate work already active or completed.

The system must avoid repeatedly spawning Agents for work that has already been completed or is already running.

---

## 20. Agent Execution Hierarchy

AgentRuns support parent/root relationships.

Example:

```text
Orchestrator Run #100
│
├── Goal Analysis Run #101
│
├── Planner Run #102
│    └── Research Run #103
│
└── Reviewer Run #104
```

For Run #103:

```text
parentRun = #102
rootRun   = #100
```

This hierarchy supports delegation while preserving traceability.

---

## 21. Tool Control

Agents do not automatically have access to every application capability.

Tools are explicitly assigned to Agents.

Example:

```text
Goal Analyzer
├── READ_GOAL
├── READ_HISTORY
└── ANALYZE_GOAL_CHANGE

Planner
├── READ_GOAL
├── READ_PLAN
├── READ_TASKS
└── UPDATE_PLAN

Context Manager
├── READ_GOAL
├── READ_PLAN
├── READ_TASKS
├── READ_RELEVANT_HISTORY
├── READ_GOAL_CONTEXT
└── UPDATE_GOAL_CONTEXT

Reviewer
├── READ_GOAL
├── READ_CONTEXT
└── REVIEW_RESULT
```

Tool permissions form part of the Agent control boundary.

---

## 22. Business State vs Execution State vs History

The system intentionally separates different types of information.

### Current Business State

```text
Goals
Plans
Tasks
```

Answers:

> What is currently true about the user's Goal and planned work?

### Current Execution Picture

```text
GoalContexts
```

Answers:

> Where are we now?

### Conversation History

```text
Sessions
Messages
```

Answers:

> What did the user and system discuss?

### Agent Working Snapshot

```text
ContextPackages
```

Answers:

> What did this Agent know when it started?

### Runtime / Audit History

```text
AgentRuns
ToolExecutions
```

Answers:

> What did the Agent system actually do?

---

## 23. End-to-End Business Flow

The complete conceptual flow is:

```text
USER
 │
 │ defines / changes Goal
 ▼
GOAL
 │
 ▼
Goal / Impact Analysis
 │
 ▼
PLAN + TASKS
 │
 ▼
Context Manager
 │
 │ synchronize current picture
 ▼
GOAL CONTEXT
 │
 ▼
ORCHESTRATOR
 │
 │ decide next work
 ▼
Context Manager
 │
 │ build Agent-specific context
 ▼
CONTEXT PACKAGE
 │
 ▼
WORKER / PLANNER
 │
 │ proposal
 ▼
REVIEWER
 │
 ├── REJECT
 │      │
 │      └── feedback → retry
 │
 └── ACCEPT
        │
        ▼
Persist accepted state
        │
        ▼
Context Manager
        │
        ▼
GoalContext revision N → N+1
        │
        ▼
Orchestrator
        │
        └── continue until Goal is completed,
            cancelled, blocked, or waiting
```

---

## 24. Goal Completion

A Goal may be considered completed when:

- all required work has been completed;
- no required active/pending Tasks remain;
- accepted outputs satisfy the current Goal;
- the Orchestrator determines that no further work is necessary.

Goal completion should be based on the **current Goal**, not on an outdated context snapshot.

---

## 25. Core Business Rules

The finalized rules are:

1. A Goal represents the user's **current intention** and is mutable.
2. Goal changes do not create `GoalVersions`.
3. A Plan is living state and may evolve over time.
4. Goal changes trigger **impact analysis**, not automatic full replanning.
5. Valid completed work should be preserved whenever possible.
6. Running work may continue, be revalidated, or be cancelled depending on impact.
7. `GoalContext` represents the current condensed execution picture.
8. `GoalContext.revision` is used for concurrency and stale-context detection.
9. `ContextPackage` is immutable and records exactly what one Agent received.
10. Agent output is a proposal until accepted by the relevant control/review flow.
11. Rejected output must not become authoritative state.
12. The Context Manager manages continuity and context, not orchestration or review.
13. The Orchestrator decides what should happen next.
14. Workers perform specific assigned work.
15. Reviewers determine whether proposed results are acceptable.
16. Agents receive only relevant context, not the entire database/history.
17. Agent spawning and retries must be bounded.
18. The runtime must avoid duplicating completed or already-running work.
19. Multiple Agents may run concurrently when work is independent.
20. Stale results must be revalidated against current state before acceptance.
21. Durable application state belongs to the database, not to the LLM.
22. Conversation history, current business state, execution context, and runtime audit history remain separate concerns.

---

## 26. Intentionally Deferred Requirements

The following are not required as first-class business concepts in the current baseline:

- Goal version history;
- Plan version history;
- dedicated Memory entity;
- Vector Memory;
- Embeddings;
- Knowledge Base;
- Prompt History;
- provider-specific LLM Sessions;
- dedicated Review entity;
- autonomous unlimited Agent spawning.

These concepts may be introduced later only when a concrete requirement justifies them.

---

## 27. Final Business Architecture

```text
                     USER
                      │
                      ▼
                     GOAL
              mutable current intent
                      │
              ┌───────┴────────┐
              ▼                ▼
            PLAN           CONVERSATION
              │                │
              ▼                ▼
            TASKS           MESSAGES
              │
              │
              ▼
       CURRENT BUSINESS STATE
              │
              ▼
        CONTEXT MANAGER
              │
              ▼
         GOAL CONTEXT
         revision = N
              │
              ▼
         ORCHESTRATOR
              │
              ▼
        CONTEXT MANAGER
              │
              ▼
       CONTEXT PACKAGE
              │
              ▼
           WORKER
              │
              ▼
           REVIEWER
         ┌────┴────┐
         ▼         ▼
      REJECT     ACCEPT
         │         │
       retry       ▼
             accepted state
                   │
                   ▼
             Context Manager
                   │
                   ▼
            revision N + 1
```

---

## 28. Baseline Status

This document represents the current finalized business-requirement and business-logic baseline for the Todo AI Agent.

Future requirements should be evaluated against this baseline before introducing additional business concepts, database entities, or Agent responsibilities.

A new concept should be introduced only when an existing responsibility cannot represent the requirement cleanly.

**Version:** 1.0  
**Status:** Final Baseline  
**Aligned Database:** Todo AI Agent — Agent Architecture & Database Design V3.0
