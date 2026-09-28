# Backlog

**Altitude 2 — groomed candidate slices.**

Holds slice ideas that are clear enough to commit to a sprint, but not yet
scheduled. Items here have passed an initial planner-hat sanity check
(scope is bounded, no obvious blockers) but have not been clarified or
specced.

## First Landing Place Rule

`backlog.md` is the **single authoritative parking lot** for slice IDs
that do not yet have an Intake note. Per
`harness/engineering/core-beliefs.md` — *Forward-Reference Is Fiction* —
a slice ID may appear elsewhere in the harness (releases, sprints,
decisions, concept Consumers list) **only if** one of:

1. It currently has a row here, or
2. It already has an Intake note in `slices/01-product-specs/<slice>.md`
   (it has moved past backlog), or
3. It has a completed exec plan under
   `slices/02-exec-plans/features/completed/`.

If a slice name appears anywhere else without satisfying one of those,
the cold-start gate flags it as fiction and the fix is either to add
the row here or delete the forward-reference.

## When an item lands here

- Planner hat translates a release's *Scope* (from
  `releases/v<X.Y>-<slug>.md` Section 3) into concrete slice candidates
  → adds a row here.
- A retrospective surfaces a follow-up that isn't an issue → planner hat
  drops it here.
- A close-stage Harness Delta proposes a follow-up slice → planner hat
  drops it here (the delta itself lives in the closed plan, not here).
- A user requests a new feature in conversation → planner hat captures
  it as a backlog row before any sprint commitment.

## When an item leaves

- Sprint commitments pull the item into `sprints/<sprint-id>/commitments.md`
  **and remove the row from here** in the same commit. A slice ID does
  not live in both places simultaneously.
- The item is rejected → delete the row with a one-line reason in the
  commit message.

## Row Discipline

- One row per slice candidate. The row is **one line per cell** (see
  *Index Files Are Tables Of Links* in
  `harness/engineering/core-beliefs.md`).
- *Rough scope* is one sentence in business language. No technical
  detail, no module names, no API shapes. Those belong in Specify, not
  in backlog.
- *Source* names the trigger (e.g. "release v0.1-mvp scope", "product-roadmap
  promotion", "feature-002 close Harness Delta", "user request 2026-06-10").
  Every row has a source; rows without a traceable source are themselves
  fiction.

## Format

| Slice ID candidate | Title | Rough scope | Source | Earliest sprint |
|---|---|---|---|---|

## Status

| Slice ID candidate | Title | Rough scope | Source | Earliest sprint |
|---|---|---|---|---|
| — | *none* | — | — | — |
