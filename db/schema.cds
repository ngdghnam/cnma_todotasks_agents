namespace cnma.todotasks;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Users : cuid, managed {
    email       : String(255) not null @mandatory;
    username    : String(255) not null @mandatory;
    status      : String(20) default 'ACTIVE';

    // Free-text conventions the user wants every generated result to follow:
    // project structure, coding style, preferred libraries, ...
    // Selected by the Context Manager into Planner / Worker / Reviewer context.
    preferences : LargeString;

    goals       : Association to many Goals
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

    artifacts        : Composition of many Artifacts
                           on artifacts.goal = $self;
}

/**
 * User <-> Agent-system conversation.
 * This is an application session, not an LLM-provider session.
 */
entity Sessions : cuid, managed {
    goal     : Association to Goals not null;
    title    : String(255);

    // ACTIVE / CLOSED
    status   : String(20) default 'ACTIVE';

    // Condensed summary useful for future context reconstruction.
    summary  : LargeString;

    messages : Composition of many Messages
                   on messages.session = $self;
}

/**
 * Persistent raw conversation history.
 * Persisting a message does not mean it is sent to every LLM call.
 */
entity Messages : cuid, managed {
    session  : Association to Sessions not null;

    // USER / ASSISTANT / SYSTEM
    role     : String(20) not null;

    content  : LargeString not null;
    sequence : Integer not null;
}

/**
 * Living execution plan for a Goal.
 * Goal changes do not automatically create another Plan version.
 */
entity Plans : cuid, managed {
    title   : String(255) not null;
    summary : LargeString;

    // DRAFT             - being generated / revised by the Planner
    // PROPOSED          - accepted by the Reviewer, waiting for user approval
    // ACTIVE            - approved by the user, Tasks are executing
    // COMPLETED / CANCELLED
    status  : String(20) default 'DRAFT';

    goal    : Association to Goals not null;

    tasks   : Composition of many Tasks
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

    // Accepted result summary (set only after review ACCEPT).
    result           : LargeString;

    plan             : Association to Plans not null;

    dependencies     : Composition of many TaskDependencies
                           on dependencies.task = $self;
}

/**
 * "task" cannot start before "dependsOn" is COMPLETED.
 * Lets the Orchestrator decide which Tasks may run in parallel.
 */
entity TaskDependencies : cuid {
    task      : Association to Tasks not null;
    dependsOn : Association to Tasks not null;
}

/**
 * Accepted file produced by a Worker for a Goal (one row per path; later
 * accepted Tasks may overwrite a path). Proposed-but-rejected files only live
 * in AgentRuns.output and never land here.
 */
entity Artifacts : cuid, managed {
    goal    : Association to Goals not null;
    task    : Association to Tasks;

    path    : String(500) not null;
    content : LargeString not null;

    // AgentRun whose accepted output produced this version of the file.
    run     : UUID;
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
    goal     : Association to Goals not null;
    revision : Integer not null default 1;

    // Human/LLM-friendly current execution summary.
    summary  : LargeString;

    // Machine-readable current execution state (JSON, see GoalContextState).
    state    : LargeString not null;
}

/**
 * Immutable working-context snapshot assembled for one Agent execution.
 * It records exactly what that Agent knew when it started.
 */
entity ContextPackages : cuid, managed {
    goal            : Association to Goals not null;

    // GoalContext revision used when this package was assembled.
    contextRevision : Integer not null;

    // GOAL_ANALYSIS / PLAN_GENERATION / TASK_EXECUTION / REVIEW / CONTEXT_SYNC
    purpose         : String(50) not null;

    // Exact assembled context supplied to the Agent (JSON).
    payload         : LargeString not null;

    estimatedTokens : Integer;
}
