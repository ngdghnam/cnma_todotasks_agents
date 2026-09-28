# Pilot runtime boundary

The pilot uses a deterministic local gate in addition to agent instructions:

```text
prepare → agent work loop → finalize
```

`prepare` resolves live project state, hashes every prompt component, creates
an atomic work inventory and records a dirty working-tree snapshot. The
inventory source is the reconciled execution plan for DEV or functional
context for BA. It is the only producer of the initial execution artifacts.

Track-free routing is preferred. When one BA/DEV route is eligible, the runtime
selects it. When both are eligible it stops safely and requires `--track ba` or
`--track dev`; it never guesses. When neither is eligible it explains the live
boundary or unmet routing condition.

Use `prepare --dry-run` to inspect the resolved plan inventory and write scope
without creating an execution record.

`prepare` ends at `awaiting-human-dispatch`; it does **not** invoke an AI
session. A human starts a fresh session in any approved environment and gives
it the generated `dispatch.md`. That worker must record `acknowledge` and
`start` before modifying work. The execution package, not chat history or an
executor host, supplies the worker's project context.

The selected agent performs the work loop and may update only its execution
ledger/result/evidence plus permitted project files. It cannot certify the
run itself.

`finalize` captures the ending scope and rejects the execution unless all of
the following are true:

- all new artifacts use v1.3 contracts and reconcile to one execution ID;
- every resolved work item has one atomic ledger item;
- every DEV plan test obligation is present and verified for a completed result;
- prompt hashes are real and remain reproducible;
- changed files are within the resolved write scope and fully reported;
- event types and required observability events are valid;
- completed results have no pending work/tests/checks.

After a successful `finalize`, the execution is `awaiting-session-close`.
The normal project-control `end-session` work must update both
`progress-log.md` and `latest-session.md` with the execution ID, then
`close-session` verifies that evidence. An execution cannot return to an
existing Harness gate while closure is pending.

This runner does not invoke the model, prevent an already-running model from
writing a file, or apply lifecycle transitions. It deterministically enforces
the preparation, completion, and session-closure gates. The existing Harness
retains authority for lifecycle transitions.

During an active execution, `finalize` requires every recorded prompt component
to retain its hash. After an execution is closed, later project evolution does
not retroactively invalidate its evidence; `validate` reports that condition as
`CONTEXT-DRIFT` with the changed source references.

