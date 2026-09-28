# Execution summary contract

Every execution summary must be human-operable without opening JSON files.
It must contain:

1. target, named agent, live state, run intent, and enforcement mode;
2. outcome and exact termination reason;
3. completion-contract result and pending/failed check IDs;
4. atomic work items completed, blocked, excluded, and remaining;
5. validation commands and factual outcomes;
6. changed source, generated output, and execution-memory paths separately;
7. blockers/warnings with evidence and owner;
8. for every non-completed execution, why it stopped, the next atomic item,
   prerequisites, intended files/tests, and exact resume command;
9. for a completed verification, the governed carry-forward action.

`COMPLETED_WITH_WARNINGS` may not list remaining approved implementation work.
If remaining work exists, the summary must say `PAUSED` and include the
continuation handoff, or the runtime must continue the loop. A `BLOCKED` or
`FAILED` summary must instead state the factual stop reason and the governed
action that will make a later run safe.

