# PLANS.md

This file defines how execution plans are created, updated, completed, and
archived. Every plan walks the lifecycle in
`docs/04-project/harness/engineering/implementation-workflow.md`.

## When A Plan Is Required

Create an execution plan when work:

- spans more than one session
- changes more than one subsystem
- has non-trivial verification or rollout risk
- depends on open decisions that should be logged
- changes product behavior, security posture, deployment behavior, or
  architectural boundaries

Bug fixes against closed features use the separate **issue workflow** in
`docs/04-project/harness/engineering/issue-workflow.md` and open an issue plan under
`docs/04-project/slices/02-exec-plans/issues/active/`, not a feature plan. Small documentation changes may
use `PROGRESS.md` and `feature_list.json` only, but they still need
evidence.

## Plan Locations

- `docs/04-project/slices/02-exec-plans/features/active/`: feature plans currently driving work
- `docs/04-project/slices/02-exec-plans/features/completed/`: finished feature plans kept for future agent context
- `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md`: deferred code work and follow-ups
- `docs/04-project/slices/02-exec-plans/issues/active/` and `docs/04-project/slices/02-exec-plans/issues/closed/`: issue (bug-fix) plans — separate workflow per `docs/04-project/harness/engineering/issue-workflow.md`. Feature and issue plans live in different trees so the *one in-progress feature* invariant is unaffected by parallel issue work.

## Minimum Plan Sections

- **objective**
- **intake note** — why this slice now, in one paragraph
- **scope and out-of-scope**
- **clarified requirement** — link to the per-feature product spec under
  `docs/04-project/slices/01-product-specs/` and any confirmed user requirement captured in this
  session
- **concepts consulted** — list of `docs/04-project/harness/concepts/*.md` files this slice
  depends on, or *none — feature-scoped* with a one-line reason. Concepts
  are optional; the agent must ask at intake/clarify if the developer did
  not specify, and must not invent the answer. If any required concept
  is missing or ambiguous, the slice pauses and a concept slice runs
  first (see `docs/04-project/harness/concepts/index.md`).
- **implementation steps** — layer order per `ARCHITECTURE.md`; principles
  per `docs/04-project/harness/engineering/coding-principles.md` (§1 architecture, §2 SOLID,
  §3 ACID)
- **self-review checklist** — `CONSTRAINTS.md` scan + SOLID smell
  checklist + ACID smell checklist
- **implementation readiness detail** - implementation contract needed before
  plan-to-implement approval: files to create/change, module
  responsibilities, public APIs/types, input/output shapes, algorithms or
  decision tables, source-of-truth mappings, test cases, exclusions, and
  unresolved blockers. A summary-level plan is not approvable.
- **verification scope** — three layers, declared **before** the
  plan→implement gate so the user signs off on what will and will not be
  re-checked:
  - *Slice scope*: explicit file list (TypeScript files touched + their
    direct importers). Drives targeted `tsc --noEmit` and the Jest
    `--testPathPattern` to run during implement / self-review iterations.
  - *Module scope*: the CAP service or `srv/<module>/**` the slice lives
    in, plus that module's tests. Run before raising verify→close.
  - *Whole-codebase exemptions*: list every whole-codebase command
    (`npm run build`, full Jest, `npm run cds:build`) expected to be red
    on entry, each with the failing files and a link to the
    `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md` row that tracks the red.
    A whole-codebase red is allowed at close only if none of the listed
    files are in this slice's slice scope.
- **test plan** — automated commands and what each proves, written
  against the declared *slice scope* and *module scope*; whole-codebase
  runs are recorded only at close
- **verify plan** — runtime evidence (service request, UI interaction) and
  what each proves; **required when the slice declares a runtime surface**
  (HTTP/OData endpoint, UI flow, background job). For pure refactors,
  type-only changes, or doc/harness slices, record *no runtime surface*
  with a one-line reason instead
- **risks and blockers**
- **evaluator rubric** — four dimensions scored A/B/C/D at verify→close,
  each row citing concrete evidence (commands, files, runtime responses)
  from the slice. The user gate at verify→close consumes this rubric
  instead of free-text evidence. Default dimensions (override in the
  plan only with a recorded reason):
  - *Code correctness* — A: every declared test scope green; B: module
    scope green, slice scope green, whole-codebase exemptions hold; C:
    partial green with documented carry-over; D: red without an
    accepted exemption.
  - *Architecture compliance* — A: layer order per `ARCHITECTURE.md`
    and every consumed concept's rules clean; B: minor deviations
    recorded as Harness Deltas; C: obvious deviations not yet
    addressed; D: violates a `CONSTRAINTS.md` row.
  - *Test coverage* — A: main flow + boundary cases automated; B:
    main flow automated; C: skeleton only; D: no tests.
  - *Runtime evidence* — A: structured runtime evidence row recorded
    (see `feature_list.json#evidence` runtime shape) for every
    declared runtime surface; B: at least one runtime request/response
    captured; C: declared runtime surface but no runtime evidence; D:
    no runtime evidence and slice had a runtime surface. *N/A* if the
    plan declared *no runtime surface* with reason.
- **progress log** — including a row for each user approval gate crossed
  (intake→clarify, clarify→plan, plan→implement, verify→close). Each
  iteration that **replaces a previous approach** carries a one-line
  *Why this order* field naming what was tried first, why it was set
  aside, and what the new direction is, so the next session does not
  re-derive the path
- **open decisions**
- **harness deltas** — proposed promotions back into the durable harness
  at close (each delta cites slice evidence). Concept changes are not
  applied inline; they are recorded here and trigger a follow-up concept
  slice. Use *none* if there are no deltas.
- **retrospective** — one line written at close
- **closeout checklist** — every box in `CLEAN_STATE_CHECKLIST.md` green
  (including row 18 *Live trackers are trimmed on close*); evidence
  recorded in `feature_list.json`; plan moved to `completed/`;
  `PROGRESS.md` and `session-handoff.json` updated and trimmed

## Operating Rules

- Every feature plan walks through the eight-stage lifecycle in
  `docs/04-project/harness/engineering/implementation-workflow.md` (intake → clarify → plan →
  implement → self-review → test → verify → close). Concept work uses the
  separate concept-slice workflow in `docs/04-project/harness/concepts/index.md`. Bug fixes
  against closed features use the separate three-stage issue workflow in
  `docs/04-project/harness/engineering/issue-workflow.md` and do not open a feature plan.
  Compression of routine stages must be declared in the plan, not silent.
- The agent does not cross a user-gated stage transition without an
  approval recorded in the progress log.
- The agent does not request or cross plan-to-implement approval until the
  active plan is implementation-ready. The plan must let the user evaluate how
  the implementation will be built; otherwise the slice remains in `plan`.
- One active plan should have one clearly owned current stage.
- Exactly one `feature_list.json` entry is `in_progress` at a time; the
  active plan links to it.
- Update the plan as work progresses; do not treat it as static prose.
- If a decision changes implementation direction, record it in the plan's
  open-decisions list.
- Move finished plans to `completed/` so agents can still discover prior
  context.
- Link plan evidence to `feature_list.json` and flip the entry to
  `passing` only after the closeout checklist is satisfied **and** the
  verify→close user gate is approved.
