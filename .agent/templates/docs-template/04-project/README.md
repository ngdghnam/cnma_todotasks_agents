# 04-project/

Project-level documentation for {{PROJECT_NAME}}. This folder is the
**internal harness** for the current development cycle (release / sprint
window / mid-sized project). Audience: dev team + AI agent.

For the **product-level** doc surfaces (audience-facing, long-lived) see
the sibling folders `01-product/`, `02-business/`, `03-technical/`,
`05-releases/`. See `docs/README.md` for the 5-tier layout overview.

This folder is organized in **four altitudes** so a reader can move from
"where is the project heading" down to "what's being implemented right
now" in clear steps.

## Altitude Map

| # | Altitude | Folder / File | What lives here |
|---|---|---|---|
| 1 | Release (semver) | `releases/` | Forward-looking release plans. One file per version (`v0.1-mvp.md`, `v1.0-ga.md`). |
| 2 | Groomed candidates | `backlog.md` | Slice ideas not yet committed to a sprint. |
| 3 | Sprint window (2 weeks) | `sprints/` | One folder per sprint: commitments, retro, carried-over. |
| 4 | Slice (the unit of work) | `slices/` | Per-slice product specs, exec plans, reliability journeys, quality history. |

Two cross-cutting folders sit beside the altitudes:

| Folder | Purpose |
|---|---|
| `harness/` | Durable scaffolding — workflows, principles, concepts, system-of-record docs that every slice consumes but no slice owns. Grows only via approved Harness Deltas at close. |
| `decisions/` | Architecture Decision Records (ADRs). One file per accepted decision. |

And one live coordination file at root:

| File | Purpose |
|---|---|
| `ACTIVE_WORK.md` | Live board of slices currently in flight (one row per assignee). |

## Relationship with Product layer

A feature slice's close stage proposes **two** kinds of delta:

| Delta | Routes to | Owner |
|---|---|---|
| Harness Delta (existing) | `04-project/harness/*`, `ARCHITECTURE.md`, `CONSTRAINTS.md` | Dev hat |
| Product Delta (v2 new) | `01-product/`, `02-business/`, `03-technical/`, `05-releases/` | depends on target |

See `harness/engineering/implementation-workflow.md` *Close stage*.

## How To Read

1. **New to the project?** Start at `releases/` for the current `in-flight` release plan (semver), then `sprints/` for the current sprint commitments.
2. **About to start work?** Read `ACTIVE_WORK.md` to see what's in flight, then the per-slice product spec under `slices/01-product-specs/`.
3. **Need a workflow procedure?** Open `harness/engineering/` — pick the workflow doc matching your role.
4. **Need a cross-feature rule?** Open `harness/concepts/`.

## Empty Folders

`releases/`, `sprints/`, `decisions/`, and `backlog.md` are seams declared
ahead of first use. Each carries its own `README.md` describing what
content goes there and the trigger for adding it. **Do not fabricate
content** in these folders — they fill in when the activity happens, not
before.

Bootstrap auto-creates `sprints/sprint-000-product-foundation/` as a
mandatory (greenfield) / warm-up (brownfield) sprint that fills the
product-level baselines.

## Related Top-Level Files

- `AGENTS.md` (repo root) — routing, working contract, definition of done.
- `ARCHITECTURE.md` (repo root) — system map, layer model, hard dependency rules (agent-facing).
- `CONSTRAINTS.md` (repo root) — forbidden patterns + sourcing rule.
- `CLEAN_STATE_CHECKLIST.md` (repo root) — cold-start and end-of-session gate.
- `PROGRESS.md` (repo root) — current verified state + last 3 session records.
- `docs/PRODUCT_BASELINE.md` — predefine status of 01/02/03/05.
