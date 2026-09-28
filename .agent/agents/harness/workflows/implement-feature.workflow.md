# Workflow: implement-feature

## Purpose

Route one live feature-implementation DEV state to exactly one bound agent.
The workflow never stores or duplicates project objects and never collapses
the governed DEV lifecycle into an internal agent state machine.

## Input

- Required: `impl_id`.
- Optional: `track` only to resolve an explicit BA/DEV ambiguity. The normal
  track-free invocation is preferred and the runtime selects the sole eligible
  route from live project state.
- Optional: `run_intent` (`fresh` or `clean-replay`) only when it
  matches the live DEV state and execution-history policy.

The runtime resolves feature, Sprint, EP, frozen baseline, handoff, linked
requirements/design, code scope, and test sources from the project Harness.

## Routing

1. Read `AGENTS.md` and live state.
2. Evaluate BA and DEV eligibility. Select exactly one eligible route; no route
   and multiple routes are both safe stop outcomes.
3. Load `.harness/agent-bindings.yml` and `.harness/orchestration-contract.yml`;
   confirm the live DEV state has a policy entry (a declared no-agent boundary or
   a missing policy stops routing with a clear diagnostic, not a bare error).
4. Resolve the target record from the project source of truth.
5. Select the binding for its live DEV status.
5. Validate the selected manifest against
   `.agent/agents/harness/schemas/agent-manifest.schema.json`.
6. Select the state completion contract and human-gated dispatch contract.
7. Run the project-owned `prepare` gate. It assembles and validates the
   execution context, prompt manifest, scope snapshot, and atomic progress
   ledger; the agent may not replace those artifacts.
8. Create the real execution record at `awaiting-human-dispatch`; this proves
   routing was prepared but does not prove any agent has run.
9. A human opens a fresh AI session, gives it the generated `dispatch.md`, and
   the selected agent records acknowledgement and work start from the
   project-owned execution package.
10. Run the evidence-driven loop until every atomic item and completion check
   passes, or an allowed stop condition occurs. A partial technical slice is
   not an allowed completion condition.
11. Run the project-owned `finalize` gate. This accepts the agent result but
   moves the execution to `awaiting-session-close`, not back to a lifecycle
   gate.
12. Complete the existing project-control `end-session` work: update both the
   progress log and latest session handoff with the exact execution ID.
13. Run `close-session`. Only a closed execution may return control to the
   existing Harness gate/transition process.

| Live DEV state | Agent | Execution purpose |
| --- | --- | --- |
| `not-started` | none | Await governed planning entry |
| `plan` | Atlas (`cap-solution`) | Prepare or align the implementation plan |
| `implement` | Forge (`cap-implementation`) | Implement scoped code and tests |
| `self-review` | Forge (`cap-implementation`) | Perform developer self-review |
| `unit-test` | Forge (`cap-implementation`) | Execute and record technical tests |
| `verify` | Verity (`cap-quality`) | Independently verify implementation and evidence |
| `ready-for-delivery` | none | Existing DEV-to-Delivery handoff process |

The table above is a human-readable summary. The authoritative routing is
`.harness/agent-bindings.yml`, and the authoritative "what happens after a
result" policy is `.harness/orchestration-contract.yml`. For each live DEV state
and result status, that contract declares the allowed action — propose the
referenced `transitions.yml` move, or retain the state with a continuation. The
runner enforces this mechanically and records a runtime-derived
`eligible_transition` for a completed result; it never applies a transition.
Only `.harness/transitions.yml`, role authority, evidence gates, and an explicit
human CONFIRM-TRANSITION may change state.

## Runtime artifacts

For a real invocation, create:

```text
.harness/executions/<execution-id>/
├── execution.json
├── events.jsonl
├── context.json
├── prompt-manifest.json
├── progress.json
├── result.json
├── evaluation.json
├── evidence/
└── summary.md
```

All structured artifacts and each JSONL event must
validate against the corresponding schema under `.agent/agents/harness/schemas/`.

`execution.json` is authoritative for routing status. A completed agent
result first becomes `awaiting-session-close`; only verified project-control
closure makes the execution `closed`.

```text
awaiting-human-dispatch → acknowledged → running → awaiting-session-close → closed
```

The state names refer to the execution only. They never change the governed
feature lifecycle.

## Failure and retry

- Retry one transient tool/runtime failure only when the manifest permits it.
- Stop `BLOCKED` when the progress signature is unchanged for the manifest's
  maximum no-progress iterations; do not loop indefinitely.
- Stop `FAILED` at the hard iteration limit and preserve the ledger/evidence.
- `PAUSED` is permitted only for a recorded user-approved checkpoint or
  runtime-maintenance stop and requires a continuation handoff. It is never
  a synonym for incomplete work.
- Route an in-scope implementation defect back through the Harness state and
  owner; agents do not invoke one another.
- Baseline mismatch, permission conflict, undefined external contract,
  architecture conflict, or ambiguous scope is `BLOCKED`, not retryable.
- Simulations are read-only and create no execution directory or evidence.

