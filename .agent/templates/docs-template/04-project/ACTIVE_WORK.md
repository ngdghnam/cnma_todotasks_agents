# Active Work

Parallel-work coordination board. **One row per active slice**, each with an
assignee. Updated when a slice's stage transitions, when a slice opens, and
when a slice closes.

This file is the **only** shared coordination point for parallel developers.
Read at session start (per `AGENTS.md` step 1a) so you do not write into
another developer's plan or claim a slice ID that is already in use.

## Active Slices

| Slice | Type | Assignee | Stage | Last Touched |
|---|---|---|---|---|
| — | *none* | — | — | — |

Slice types: `feature` (per `docs/04-project/harness/engineering/implementation-workflow.md`),
`concept` (per `docs/04-project/harness/concepts/index.md`), `issue` (per
`docs/04-project/harness/engineering/issue-workflow.md`), `harness` (durable-doc edits not tied
to a code slice).

## Rules

- A row is added when a slice opens (intake/triage) and removed when it
  closes/publishes. A closed slice is not listed here — its history lives
  in its own closed plan and in `feature_list.json#fix_history` /
  `docs/04-project/slices/02-exec-plans/features/completed/` / `docs/04-project/harness/concepts/index.md` *Active Concepts*.
- Exactly one row per `(Slice ID)`. The same ID cannot appear twice.
- The `feature_list.json` invariant becomes **one `in_progress` row per
  assignee**, not one globally.
- Every cell is one line (see
  [harness/engineering/core-beliefs.md](harness/engineering/core-beliefs.md) — *Index
  Files Are Tables Of Links*).
- ID reservations: to claim a new `feature-NNN` / `issue-NNN` /
  `concept-<slug>` ID, add a row here **before** opening the plan. First
  to add wins; no two slices may share an ID.
- Coordination on overlapping module areas (two slices touching the same
  file) is a human conversation, not a harness check. Visibility comes
  from scanning this board at session start.
