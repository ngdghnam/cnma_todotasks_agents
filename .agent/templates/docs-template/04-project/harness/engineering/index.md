# Engineering Index

This folder holds **project-level invariants only** — documents whose
lifetime is longer than any single feature and that every future slice
inherits.

## Scope Rule

A document belongs in `docs/04-project/harness/engineering/` only if **every future slice
will inherit it**. Cross-feature domain rules (authorization, persistence,
integration, numbering, audit, ...) belong in `docs/04-project/harness/concepts/`, not here.
Feature-scoped contracts, acceptance criteria, and implementation notes
belong in the product spec or the active plan.

## Accepted

- `core-beliefs.md` — project-wide agent-first design beliefs.
- `coding-principles.md` — service-layer architecture, SOLID, and ACID.
- `implementation-workflow.md` — the nine-stage feature-slice lifecycle
  and its user approval gates. BA hat owns *intake* + *specify*;
  Developer hat owns *clarify* through *close*. Handoff at the
  Specify→Clarify gate; BA/Dev divider in the per-feature spec file
  enforces the boundary at the document level.
- `issue-workflow.md` — the three-stage issue (bug-fix) workflow
  (Developer hat).
- `sprint-workflow.md` — the four-stage sprint lifecycle (Planner hat).

## Proposed

- None.

## Deprecated

- None.
