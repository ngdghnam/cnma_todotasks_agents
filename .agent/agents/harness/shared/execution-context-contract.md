# Execution context and memory contract

The Harness, not an agent, owns memory and state. Every agent receives a
fresh execution context validated against
`schemas/execution-context.schema.json`.

## Context assembly order

The orchestrator resolves only the material needed for the target:

1. `AGENTS.md`, `CLEAN_STATE_CHECKLIST.md`, current state, and active task.
2. `.harness/roles.yml`, `gates.yml`, `quality.yml`, `transitions.yml`, and
   the relevant existing workflow/schema.
3. The live `feature-implementations.yml` record, frozen functional
   baseline, BA-to-DEV handoff, and EP.
4. Requirement/design documents referenced by those artifacts.
5. A focused repository scope, current diff, and previous accepted execution
   output if one exists.

The context must include the source path and, where practical, a line/section
reference for every requirement or decision the agent relies on. It must not
be a copy of an old conversation.

The runtime also selects a state completion contract and creates
`progress.json`. Work items and acceptance criteria come from the project
context; loop rules and completion semantics come from reusable agent
contracts. A command string alone is never the worker's execution package.

## Three memory layers

| Layer | Location | Authority |
| --- | --- | --- |
| Project memory | `docs/`, source code, `.harness/` | Source of truth |
| Workflow memory | `.harness/executions/<id>/context.json`, results, evidence | Temporary, auditable execution record |
| Agent working memory | `.harness/executions/<id>/working-notes/<agent>.md` | Ephemeral and non-authoritative |

An unverified working note cannot become project truth. Promotion is:

```text
working note -> structured agent result -> existing gate/evidence check
-> approved project artifact or governed transition
```

## Permissions

The context carries the effective read/write allow-lists. A role agent may
write only within that list. No agent may write `.agent/`, a frozen baseline,
or lifecycle fields without the existing project process and explicit user
confirmation.

## Results and handoffs

Each invocation produces `result.json` conforming to
`schemas/agent-result.schema.json`. Agents do not create private agent-to-agent
handoffs. The Harness validates the result and supplies accepted outputs to a
later invocation when its governed state is reached. Runtime results cannot
replace an official track-boundary or session handoff.

## Mandatory session closure

Before reporting work complete, every worker must run the project-owned
`end-session` contract in `.harness/commands.yml`. This is required even when
no lifecycle transition occurred. The worker must update the progress log and
latest-session handoff, then reconcile all project-control views affected by
the session's task, sprint, branch, feature, next-action, question, decision,
risk, or document-maturity changes. A lifecycle transition additionally
requires the existing transition-log protocol; it does not replace end-session.

`COMPLETED` is valid only when the operating runtime verifies all required
completion checks in `progress.json`. Repeated no-progress iterations,
permission expansion, or missing governed inputs terminate according to the
manifest loop policy; agents do not continue indefinitely.

Allowed result statuses are:

- `COMPLETED` — all required outputs and evidence are present.
- `COMPLETED_WITH_WARNINGS` — gate decides whether warnings are acceptable.
- `BLOCKED` — a missing/ambiguous/conflicting source needs human resolution.
- `FAILED` — a tool or unexpected execution failure; retry only when safe.

