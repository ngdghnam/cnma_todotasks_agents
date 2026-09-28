# Pilot evaluation policy

The pilot evaluates runtime adherence separately from code quality.

An execution automatically receives `fail` for runtime adherence when any of
the following occurs:

- `COMPLETED` or `COMPLETED_WITH_WARNINGS` while a required completion check,
  acceptance criterion, or atomic work item is pending, blocked, or
  unaccounted;
- a pause without an allowed, recorded stop basis and continuation handoff;
- a non-completed result/summary omits required termination, next-work, or
  governed follow-up information;
- a required operational event or prompt/progress artifact is absent.

The code-quality rubric may still report useful findings, but an adherence
failure prevents an overall `pass`. This makes a premature stop visible as a
runtime defect rather than a harmless warning.

