# Runtime-owned loop ledger v3

This protocol applies to new `orchestrated-v3` executions only.

The agent does not write canonical loop state directly. Canonical artifacts such
as `progress.json`, `loop-state.json`, and `loop-ledger.jsonl` are owned by the
runtime. The agent writes proposed iteration candidates and evidence, then asks
the runtime to commit or reject them.

## Required loop commands

Start an attempt:

```bash
node .harness/scripts/agent-runtime.mjs begin-iteration --execution <EXEC-ID>
```

Commit a candidate:

```bash
node .harness/scripts/agent-runtime.mjs record-iteration --execution <EXEC-ID> --candidate .harness/executions/<EXEC-ID>/iteration-candidates/<file>.json
```

Recover an interrupted attempt:

```bash
node .harness/scripts/agent-runtime.mjs resume-iteration --execution <EXEC-ID> --confirmed-by <human-or-session-id>
node .harness/scripts/agent-runtime.mjs abandon-iteration --execution <EXEC-ID> --reason "<reason>" --confirmed-by <human-or-session-id>
```

`resume-iteration` and `abandon-iteration` are governed recovery actions. If an
execution has an open attempt, a new execution for the same target is expected to
be blocked until the open attempt is resumed or abandoned.

## Agent write scope

The agent may write:

- `.harness/executions/<EXEC-ID>/iteration-candidates/**`
- `.harness/executions/<EXEC-ID>/evidence/**`
- `.harness/executions/<EXEC-ID>/result.json`
- `.harness/executions/<EXEC-ID>/evaluation.json`
- project files explicitly allowed by `context.json`

The agent must not write:

- `.harness/executions/<EXEC-ID>/progress.json`
- `.harness/executions/<EXEC-ID>/loop-state.json`
- `.harness/executions/<EXEC-ID>/loop-ledger.jsonl`
- `.harness/executions/<EXEC-ID>/events.jsonl`

Direct writes to canonical runtime artifacts are detected at runtime validation.
This is detection, not an operating-system sandbox.

## Candidate requirements

Every committed iteration candidate must:

- use `.agent/agents/harness/schemas/iteration-candidate.schema.json`;
- match the current open `attempt_id`;
- cite evidence that exists;
- update at least one tracked work item, acceptance criterion, test obligation,
  completion check, validation, finding, blocker, or warning;
- avoid status regression.

Read-only agents such as Verity can record a valid iteration through validation
evidence and findings. A source change is not required for meaningful progress.

## Completion

`finalize` rejects an `orchestrated-v3` execution with zero committed
iterations. The worker must commit at least one candidate before writing
`result.json` and `evaluation.json`.

The ledger tail is the source of truth for canonical progress integrity:
`loop-ledger.jsonl` records the expected `progress_after_sha256`, and each record
chains to the previous record by `previous_ledger_sha256`.

This protocol cannot prove temporal honesty. A worker with filesystem access can
still do work first and backfill plausible candidates. V3 makes canonical state
ownership, evidence requirements, and tamper detection explicit; it does not
claim to be a trusted execution environment.

