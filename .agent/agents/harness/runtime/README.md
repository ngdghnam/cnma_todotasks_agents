# Agent runtime contract

The runtime is the control boundary between project Harness state and a
reusable agent package. During the pilot it operates in `manual-audited`
mode: the operating session follows the contracts and the evaluation grades
adherence. `enforced` may be claimed only after executable denial,
sandboxing, measurement, and event behavior exist and are tested.

## Invocation algorithm

1. Accept a governed target such as an `impl_id`.
2. Read live state and project binding; reject caller-supplied state that
   disagrees.
3. Load and validate the selected agent manifest.
4. Resolve a least-context execution package and effective read/write/tool
   permissions.
5. Compile and persist `prompt-manifest.json`; create `progress.json` from
   an atomic work inventory, acceptance criteria, validations, and the
   selected completion contract.
6. Persist `execution.json` with status `awaiting-human-dispatch` and generate
   a project-owned `dispatch.md`. This is a routing checkpoint, not evidence
   that an agent has started.
7. A human opens a fresh AI session in any environment and gives it the
   project-owned dispatch brief. The worker records `human.dispatch-confirmed`
   and `agent.started`; neither workflow routing nor agent identity depends on
   a host product or model.
8. Execute the evidence-driven loop: select the next atomic incomplete work
   item, act, validate, update the ledger, and evaluate convergence after
   every iteration.
9. Emit tool/artifact/validation/progress events without recording private
   reasoning.
10. Validate the completion predicate and `result.json`, then finalize the
   execution and evaluate it against the reusable rubric.
11. Complete the project-control `end-session` work and close the execution.
   Only then return its recommendation to the existing Harness gate.

## Enforcement rules

- Project binding may narrow but never broaden a manifest permission.
- In `manual-audited` mode, a runtime write outside the effective allow-list
  is treated as a contract violation and recorded; executable denial is not
  implied.
- A manifest/state mismatch is denied before invocation.
- One target cannot have two concurrent mutating executions.
- A prepared execution is not running. Work is accepted only after the
  human-gated acknowledgement and matching agent-start event exist.
- Execution memory is isolated by execution ID. It is not agent memory.
- Only accepted Harness artifacts become project memory.
- The agent cannot make `COMPLETED` true by assertion; the runtime/operator
  must verify every required completion check against `progress.json`.
- A partial scope is never `COMPLETED_WITH_WARNINGS`. The loop continues, or
  a permitted pause records a continuation handoff.
- Finalization is not session closure. A finalized execution remains pending
  until the required project-control records cite its execution ID and
  `close-session` succeeds.

## Observability

The human-readable `summary.md` answers:

- which named agent and stable ID ran;
- why that agent was selected;
- which manifest version and skills were loaded;
- which inputs and effective permissions were supplied;
- which tools, files, and validation commands were used;
- what result, findings, blockers, and recommendation were returned.

Events capture operational facts only, never chain-of-thought.

