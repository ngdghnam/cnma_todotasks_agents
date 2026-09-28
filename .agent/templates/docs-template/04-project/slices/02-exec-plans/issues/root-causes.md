# Root Cause Patterns

Aggregates closed issues by root-cause category so developers and agents
can spot patterns at a glance. This file is the **pattern view**; the
per-issue file is the source of truth. Read this at:

- **Cold-start** — required by `CLEAN_STATE_CHECKLIST.md` so every
  session starts aware of recent defect patterns.
- **Feature-slice *clarify*** — scan for categories likely to surface
  in the new slice's area.
- **Self-review** (feature and issue) — scan the matching category for
  repeat-pattern signals.
- **Close** of any workflow — if a category passes the pattern
  threshold (**≥3 entries against the same feature or module**), the
  closing slice proposes a Harness Delta (new self-review smell, new
  constraint, concept amendment, or coding-principles update).

The category vocabulary is closed and defined in
[../../../harness/engineering/issue-workflow.md](../../../harness/engineering/issue-workflow.md)
*Root-Cause Categories*. A category that does not fit becomes a Harness
Delta at close that proposes a new one — never invented inline.

Every row is one line and links to the closed issue file.

## logic

*none yet*

## null-handling

*none yet*

## contract-drift

*none yet*

## concept-violation

*none yet*

## residue

*none yet*

## env-config

*none yet*

## race

*none yet*

## dependency

*none yet*

## spec-gap

*none yet*

## test-gap

*none yet*
