# Sprint Workflow

## Purpose

Every sprint moves through a known, observable lifecycle so the planner
hat has the same scaffolding the developer hat has in
`implementation-workflow.md`. Stage transitions marked as user gates are
**gates**, not checkpoints the agent decides to pass on its own.

This workflow describes the **planner hat's** work. A sprint is a
2-week window inside which one or more slices run their own lifecycle
per `implementation-workflow.md` (feature), `issue-workflow.md` (bug),
or `concepts/index.md` (concept slice).

## Lifecycle (Sprint)

Four stages.

1. **Plan**
   - Pick the next sprint's theme from the current `in-flight` release file under `docs/04-project/releases/v<X.Y>-<slug>.md` (Section 3 *Scope*).
   - Pull slice candidates from `docs/04-project/backlog.md` and any carried-over
     entries in the previous sprint's `carried-over.md`.
   - Draft `docs/04-project/sprints/sprint-NNN-<theme>/commitments.md`: slice IDs,
     short scope per slice, link to product spec (or *spec-to-be-clarified*
     marker), expected closure date.
   - **Gate to commit: user approval on the commitment list.**

2. **Commit**
   - Open the sprint folder under `docs/04-project/sprints/`.
   - For each committed slice without a product spec, queue the BA hat
     to write one under `docs/04-project/slices/01-product-specs/` before the dev
     hat picks it up.
   - For each committed slice with an unresolved concept dependency,
     queue a concept slice (per `docs/04-project/harness/concepts/index.md`) to
     run before the dev slice opens.
   - Update `docs/04-project/ACTIVE_WORK.md` so the in-flight rows reflect the new
     sprint window.
   - Agent-internal: no gate.

3. **Run**
   - Slices execute their own workflows (intake → close per
     `implementation-workflow.md`, etc.). The planner hat does not
     touch slice internals.
   - Optional `standups.md` notes for visible progress.
   - Mid-sprint pauses: if a downstream role surfaces an upstream gap
     (BA spec contradiction, missing concept, infeasible commitment),
     the planner hat **pauses-and-resumes** the sprint — see the
     cross-cutting *Pause And Resume* rule at the bottom of this doc.
   - Agent-internal: no gate.

4. **Close**
   - Write `docs/04-project/sprints/sprint-NNN-<theme>/shipped.md` linking each
     closed slice's exec plan under
     `docs/04-project/slices/02-exec-plans/features/completed/`.
   - Write `docs/04-project/sprints/sprint-NNN-<theme>/carried-over.md` for any
     slice not closed this sprint, naming the **current stage** of each
     (carried slices resume at their stage in the next sprint; they do
     not reset).
   - Write `docs/04-project/sprints/sprint-NNN-<theme>/retro.md`: one page — what
     worked, what hurt, what changes for sprint N+1.
   - Update the current `in-flight` release file under
     `docs/04-project/releases/v<X.Y>-<slug>.md`:
     - Append closed slices to Section 5 *Shipped slices*.
     - Append a Progress log entry naming closed and carried-over slices.
   - **Release transition check.** If the closed slices satisfied the release's
     Section 4 *Ship criteria*, prompt the Planner to open the next release
     (`vNEXT.md` with Sections 1–4) **before** the next sprint's Plan stage.
     Do not auto-flip release status to `shipped` without user gate.
   - **Product wiki rebuild.** If any closed slice carried a Product Delta
     into `docs/01-product/` or `docs/05-releases/`, OR if a release flipped
     to `shipped` this sprint, run `.agent/workflows/build-product-wiki.md`
     and confirm `dist/wiki/index.html` renders before close approval.
   - **Gate to close: user approval on the retro and carried-over
     list.**

## Approval Gates Summary (Sprint)

| From | To | Approval |
|---|---|---|
| Plan | Commit | User on the commitment list |
| Commit → Run → (mid-sprint pauses) | — | Agent-internal |
| Run | Close | User on the retro and carried-over list |

## Sequential Role Order Inside A Sprint

For solo-1-AI work, the roles inside a sprint run sequentially — only
one hat is on at any moment:

```
Planner (plan + commit)
   ↓
Architect (concept slice, only if a slice depends on a missing/ambiguous concept)
   ↓
BA (product specs for committed slices — runs inside the Clarify stage of implementation-workflow.md)
   ↓
Developer (slice lifecycle per implementation-workflow.md or issue-workflow.md)
   ↓
Planner (close + retro)
```

No two hats are on at once. No parallel-work conflict.

## Pause And Resume

A downstream role that discovers an upstream gap **pauses its own stage
and re-triggers the upstream role**, then resumes at the same stage —
never restarts.

Examples:
- Dev at *Clarify* finds a missing concept → pauses → architect runs a
  concept slice → dev resumes at *Clarify* with the new concept
  consumed. (Already wired in `implementation-workflow.md`.)
- Dev at *Clarify* finds a spec contradiction → pauses → BA hat
  re-opens the spec → dev resumes at *Clarify*.
- Planner at *Run* finds the sprint commitment is infeasible → pauses
  → re-scopes the commitment list (records the change in
  `commitments.md` with a one-line *why*) → resumes *Run*.

Every pause/resume gets a line in the active doc's progress log naming
what was paused, what upstream slice was opened, and when the resume
happened. Silent context-switches are a harness defect.

## Compression Rules

- A sprint with only one committed slice may compress *plan* and
  *commit* into a single commitments file, but the user gate still
  applies to the merged document.
- *Run* and *close* cannot be compressed.

## Carry-Over Rule

A slice not closed by sprint end **resumes at its current stage** in
the next sprint. It does not re-enter at intake. The planner hat names
each carried slice and its stage in the next sprint's
`commitments.md`. The slice's progress log records the sprint boundary
crossed.

## Definition Of Done (per sprint)

A sprint is done only when:

- `commitments.md`, `shipped.md`, `retro.md`, and (if any)
  `carried-over.md` exist in the sprint folder,
- every committed slice is either in `shipped.md` (closed) or in
  `carried-over.md` (with stage named),
- the current `in-flight` release file under
  `docs/04-project/releases/v<X.Y>-<slug>.md` has its *Shipped slices*
  section and *Progress log* updated,
- `docs/04-project/ACTIVE_WORK.md` reflects the post-close state,
- both user gates (plan→commit, run→close) have approval lines.

## Related

- `AGENTS.md` — routing, working contract.
- `docs/04-project/harness/engineering/implementation-workflow.md` — feature-slice
  lifecycle the dev hat runs inside a sprint.
- `docs/04-project/harness/engineering/issue-workflow.md` — three-stage issue
  workflow.
- `docs/04-project/harness/concepts/index.md` — concept-slice workflow.
- `docs/04-project/harness/PLANS.md` — plan structure and operating rules for
  exec plans inside a slice.
- `docs/04-project/releases/` — semver release plans feeding sprint plan (replaces deprecated `roadmap/`).
- `docs/04-project/backlog.md` — groomed candidates pulled into sprint commit.
- `docs/04-project/sprints/` — sprint folders this workflow produces.
