# Issues Index

This folder tracks **regressions** against closed features. The workflow is
defined in [../../../harness/engineering/issue-workflow.md](../../../harness/engineering/issue-workflow.md)
and is **separate from** the feature-slice lifecycle.

This file is a **table of contents** — every cell is one line. Per-issue
detail lives in `active/issue-NNN-<slug>.md` (in flight) or
`closed/issue-NNN-<slug>.md` (resolved). Patterns across issues live in
[root-causes.md](root-causes.md). See
[../../../harness/engineering/core-beliefs.md](../../../harness/engineering/core-beliefs.md) — *Index
Files Are Tables Of Links*.

## Active Issues

| ID | Symptom (one line) | Owning Feature | Stage | Doc |
|---|---|---|---|---|
| — | *none* | — | — | — |

## Closed Issues

| ID | Symptom (one line) | Owning Feature | Category | Closed | Doc |
|---|---|---|---|---|---|
| — | *none* | — | — | — | — |

## Rules

- One file per issue under `docs/04-project/slices/02-exec-plans/issues/active/issue-NNN-<slug>.md`; moved
  to `docs/04-project/slices/02-exec-plans/issues/closed/` at the Fix → Close gate.
- ID space is `issue-NNN`, independent from `feature-NNN`.
- Closing an issue updates four places in lock-step (any one out of sync
  is a harness defect):
  1. The issue file moves to `closed/`.
  2. A row is appended to *Closed Issues* above.
  3. A row is appended under the matching category in
     [root-causes.md](root-causes.md).
  4. A one-line entry is appended to
     `feature_list.json#fix_history[]` on the owning feature row.
- An issue without a reproducible signal becomes a *monitor* row in
  `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md`, not a row here.
- An issue with no owning feature closes without code and is re-routed
  to a feature slice or a concept slice (see issue-workflow.md
  *Feature Identification*).
