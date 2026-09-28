# Harness Sync Checklist — prosourcing → template/workflow

> Purpose: sync improvements made in the live `cnma_prosourcing` harness back
> into the shared `.agent` template (`templates/project-harness/`) and the
> initialization workflows (`workflows/setup-project-harness.md`,
> `workflows/init-docs-with-harness-v2.md`).
>
> Baseline compared: template `HARNESS_VERSION 0.1.0` vs the live `.harness/`,
> root docs, and `docs/00-project-control/` of the prosourcing project.

## Theme of the drift

The project introduced a **governed object-lifecycle / transition-authority
model** (`transitions.yml` + role `may_advance` + PROPOSE/CONFIRM protocol) and
a **project-control sync + product-progress** capability. Neither the template
nor the two workflows reference any of it.

---

## A. New files to ADD to the template

- [x] `harness-template/transitions.yml.tmpl` — new (356 lines). Object
      lifecycle transitions + PROPOSE-TRANSITION/CONFIRM-TRANSITION evidence
      protocol. Generic, copy verbatim.
- [x] `schemas/feature-implementation.schema.yml` — new (111 lines). BA/DEV/
      Delivery three-track implementation record, 1:1 with an accepted feature.
- [x] `docs-template/00-project-control/logs/transition-log.md.tmpl` — new
      required log written by the transition protocol.
- [x] `docs-template/00-project-control/registers/product-progress.md.tmpl` —
      new register (Product Owner dashboard), referenced across `commands.yml`.

> Exclude from sync (runtime instance data, NOT template material):
> `00-project-control/archive/**`, `questions/resolved/OQ-NFR-*`.

## B. Modified `harness-template/*.tmpl` files

- [x] `roles.yml.tmpl` (44 → 90) — header doc block; `coordination:`
      (coordinator_role + rules); `coordinator: true` on PM; `may_advance:`
      per role; new roles **Product Owner** and **Solution Architect**.
- [x] `commands.yml.tmpl` (175 → 211) — new command **`sync-project-control`**;
      `product-progress.md` register in `end-session`/`update-quality-score`;
      transition-log handling in `compact-project-memory`; one-step maturity
      gate rules in `update-impacted-docs`; extra risks/decisions/questions
      read+update targets.
- [x] `workflows.yml.tmpl` (65 → 76) — on `documentation` workflow add
      `target_object_type: document` and `exit_conditions:` (maturity/signoff).
- [x] `quality.yml.tmpl` (80 → 87) — under `memory_management`:
      `max_transition_log_lines`, `rotate_transition_log_by`,
      `transition_log_archive_is_immutable`.
- [x] `documents.yml.tmpl` — add `signed_off:` field to the document-entry
      schema/example (template has `signoff_required` only). Do NOT sync the
      prosourcing-specific document entries.

## C. Root template (`root-template/`)

- [x] `AGENTS.md.tmpl` — add the transition/authority guidance section; project
      `AGENTS.md` now references `transitions.yml`, `feature-implementation`,
      and `may_advance`, none of which are in the template.

## D. Workflow docs (`.agent/workflows/`)

- [x] `setup-project-harness.md` — document setup of `transitions.yml`,
      `feature-implementation.schema.yml`, `transition-log.md`,
      `product-progress.md`, `sync-project-control`, and the role
      `may_advance`/coordinator model.
- [x] `init-docs-with-harness-v2.md` — scaffold the 4 new files (section A)
      during init.
- [x] `HARNESS_VERSION` — bump `0.1.0` → `0.2.0` (structural feature addition).

## E. Consistency cross-checks (after editing)

- [x] `transitions.yml` ↔ `roles.yml` (`may_advance` must match) ↔ `gates.yml`
      ↔ `schemas/*` ↔ `transition-log.md` — ship together.
- [x] `commands.yml` references
      `quality.memory_management.transition_log_archive_is_immutable` — verify
      `quality.yml` carries it.
- [x] Init workflow copies schemas from template `schemas/` into
      `.harness/schemas/` — confirm the new schema is included.

## Explicitly NOT changing (unchanged in project)

`gates.yml`, `project.yml`, `publishing.yml`, `harness-instance.yml`,
`document-fulfillment.yml` (structure), and the docs `.tmpl` scaffolding —
their line-for-line content matches the template aside from project data.
