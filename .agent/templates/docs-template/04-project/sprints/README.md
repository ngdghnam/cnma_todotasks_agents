# sprints/

**Altitude 3 — 2-week sprint windows.**

One folder per sprint, named `sprint-NNN-<theme>/`. Each sprint folder
holds the planner hat's working documents for that window.

## When to add a sprint folder

A sprint folder is created the day the planner hat opens the sprint —
not before. The folder is created by following
`harness/engineering/sprint-workflow.md` (the planner workflow doc).

## Per-sprint contents

| File | Purpose | When written |
|---|---|---|
| `commitments.md` | Slices committed for this sprint (with IDs and links to product specs / exec plans) | Sprint open |
| `standups.md` | Optional light-weight progress notes | During sprint (optional) |
| `retro.md` | One-page retrospective | Sprint close |
| `shipped.md` | Links to closed slices delivered this sprint | Sprint close |
| `carried-over.md` | Slices not closed this sprint, with their current stage | Sprint close (only if any) |

## Cross-references

- Each `commitments.md` links to the per-slice product spec under
  `slices/01-product-specs/`.
- Each `shipped.md` links to the closed exec plan under
  `slices/02-exec-plans/features/completed/`.
- `carried-over.md` becomes the first entry in the next sprint's
  `commitments.md`.

## Status

Open sprint: [sprint-001-foundation/commitments.md](sprint-001-foundation/commitments.md) at Plan stage.
