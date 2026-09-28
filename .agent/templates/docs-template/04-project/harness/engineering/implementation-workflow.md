# Implementation Workflow

## Purpose

Every feature slice moves through a known, observable lifecycle so the
impact of the harness on coding quality is legible. Stage transitions
marked as user gates are **gates**, not checkpoints the agent decides to
pass on its own.

This workflow is **DEV-only**. It starts with a *published* product spec
produced by the [BA workflow](ba-workflow.md) and ends with code shipped
to `main`. BA work (Intake, Clarify, Draft, Review, Publish) lives in a
separate workflow and on a separate git branch — DEV never sees a spec
until BA publishes.

Concept-level design — technical rules that more than one feature
inherits — is authored separately as a **concept slice** (see
[../concepts/index.md](../concepts/index.md)) and is **consumed** by the
stages below, not produced by them. Business-level vocabulary lives in
**business concepts** authored via [ba-workflow.md](ba-workflow.md).

Regressions against a closed feature use the **issue workflow** in
[issue-workflow.md](issue-workflow.md), not this lifecycle. A bug fix is
never a feature slice: features discover unknown behavior; issues correct
known behavior.

## Prerequisite: Published Spec

Before any DEV stage opens, there must be a `Status: published` product
spec under `docs/04-project/slices/01-product-specs/<slice>.md`. If the
spec does not exist or is not published, DEV cannot start — route the
request through BA workflow Intake first.

## Lifecycle (Feature Slice, 7 DEV Stages)

All stages are owned by the **Developer hat**.

1. **Clarify**
   - Read the published BA spec (read-only from here on; BA owns the
     file).
   - Produce the technical interpretation in a plan draft under
     `docs/04-project/slices/02-exec-plans/features/active/<slice>.md`.
   - **Concepts Consulted.** List the `docs/04-project/harness/concepts/*.md`
     files this slice depends on. Concepts are **optional**: if the rule
     is purely feature-scoped, record *none — feature-scoped* and explain
     why. If a required technical concept is missing or ambiguous,
     **pause this slice** and run a concept slice first (see *Pause And
     Resume*).
   - **Layer Hints.** Identify the layer order per `ARCHITECTURE.md`
     (controllers / services / repositories) and the surfaces involved.
   - **Baseline check (v2).** List the product-level folders this slice
     will produce a Product Delta against (`01-product/`, `02-business/`,
     `03-technical/`, `05-releases/`). For each target, read
     `docs/PRODUCT_BASELINE.md` and record its status. If any target is
     `not_started`, `seeded`, or `partial-with-target-area-empty`, this
     slice runs **fly-blind** against that folder. A
     *Baseline-pending Acknowledgment* (see Plan stage below) is required;
     each Product Delta against that target will carry the
     `proposed-against-no-baseline` flag at close.
   - **Spec gaps.** If the BA spec is ambiguous or missing detail needed
     to plan, **do not guess and do not edit the spec**. Create a
     spec-gap file under
     `docs/04-project/slices/02-exec-plans/spec-gaps/<slice>-NN.md`
     (template in that directory's README), commit it, and pause this
     stage. BA picks it up via `ba-workflow.intake`. Resume *Clarify*
     when BA publishes the updated spec.
   - **Gate to Plan: user approval that the technical interpretation
     matches the published spec and the consumed concepts are correct.**

2. **Plan**
   - Open a plan with the sections required by
     `docs/04-project/harness/PLANS.md`.
   - Link the plan to the matching `feature_list.json` entry and flip
     that entry to `in_progress` (exactly one in-progress entry per
     assignee).
   - Add implementation-readiness detail: concrete files to create or
     change, module responsibilities, public APIs / types, input / output
     shapes, algorithms or decision tables, source mappings, test cases,
     exclusions, and unresolved blockers.
   - **Declare verification scope** (per `docs/04-project/harness/PLANS.md`
     *verification scope*): the *slice scope* file list, the *module
     scope*, and any *whole-codebase exemptions* the slice will inherit
     (each linked to a `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md`
     row). The slice scope is what `tsc --noEmit` and Jest
     `--testPathPattern` run against during implement and self-review;
     whole-codebase commands run only at close.
   - **Baseline-pending Acknowledgment (v2).** For every Product Delta
     target flagged fly-blind at *Clarify*, the plan includes a section:

     ```markdown
     ## Baseline-pending Acknowledgment

     This slice produces Product Delta against the following targets that
     are not yet baselined in `docs/PRODUCT_BASELINE.md`:

     - `<folder>/<area>` (current status: `<status>`)

     User approval to proceed fly-blind on {{date}}. Product Deltas
     against these targets will carry the `proposed-against-no-baseline`
     flag at close. A reconciliation appointment is implied: when the
     baseline lands, these deltas should be re-checked against it.
     ```

     The user's Plan → Implement approval explicitly covers this
     acknowledgment. A plan that lists fly-blind targets without the
     acknowledgment section is not approvable.
   - **Gate to Implement: user approval on an implementation-ready plan
     and declared verification scope.** A summary-level plan, or a plan
     with no declared scope, is not approvable.

3. **Implement**
   - Follow the directional layer model in `ARCHITECTURE.md`, the
     principles in
     `docs/04-project/harness/engineering/coding-principles.md`, and the
     rules of every concept listed in *Concepts Consulted*.
   - Keep `npm run cds:build` green at every commit.
   - Agent-internal: no gate.

4. **Self-Review**
   - Scan the diff against `CONSTRAINTS.md`, the SOLID / ACID smell
     checklists in
     `docs/04-project/harness/engineering/coding-principles.md`, every
     consumed concept's *Rules* section, and the matching categories in
     `docs/04-project/slices/02-exec-plans/issues/root-causes.md` for
     repeat-pattern signals on this feature or its modules.
   - **Scope discipline.** Run `git diff` against the plan's declared
     *slice scope*. Every changed code file must be in the slice scope
     or be a doc / tracker update (see `CLEAN_STATE_CHECKLIST.md` row
     16). If a code file outside the slice scope was touched, either
     revert it or re-declare the slice scope in the plan and re-raise
     the plan→implement approval; do not silently widen.
   - Each hit is a defect to fix before tests run, not a comment to file.
   - Agent-internal: no gate.

5. **Test**
   - Automated coverage: unit for pure logic and repositories,
     integration for service handlers, contract for external surfaces.
   - Run Jest scoped to the plan's *slice scope* during iteration; widen
     to *module scope* before raising verify→close. Whole-codebase Jest
     runs only at close.
   - This stage **does not fix bugs**. If a test fails, pause back to
     *Implement*; record the failure in the plan. (Same senior-dev
     discipline as *Verify*: the role is to test, not to patch.)
   - Record the exact commands (including the scope flag used) and
     outcomes in the plan and in the `feature_list.json` evidence array.
   - Agent-internal: no gate.

6. **Verify**
   - Runtime evidence on the real system: service request → response for
     backend slices; browser interaction for UI slices.
   - Distinct from automated test — test proves the code, verify proves
     the behavior.
   - **No code edits.** If verification reveals a bug, pause back to
     *Implement*.
   - Record the evidence in the plan **and** append a runtime-shape
     entry to `feature_list.json#evidence` per the *runtime shape*
     defined in `feature_list.json#rules`. If the plan declared *no
     runtime surface*, skip the runtime-shape entry and note it in the
     plan.
   - Fill in the plan's **evaluator rubric** (the four dimensions in
     `docs/04-project/harness/PLANS.md`), citing the test commands and
     runtime evidence as the scoring basis. The rubric — not free-text
     evidence — is what the verify→close user gate consumes.
   - Agent-internal: no gate.

7. **Close**
   - Run the end-of-session gate in `CLEAN_STATE_CHECKLIST.md`,
     including whole-codebase `npm run cds:build`, `npm test`, and
     `npm run build`. Any red whole-codebase command is allowed only if
     listed in the plan's *whole-codebase exemptions*, none of the
     failing files appear in the slice scope, and each exemption traces
     to a `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md` row.
   - Move the plan from
     `docs/04-project/slices/02-exec-plans/features/active/` to
     `docs/04-project/slices/02-exec-plans/features/completed/`.
   - Flip the `feature_list.json` entry to `passing` with linked
     evidence.
   - **Trim the live trackers** (per `CLEAN_STATE_CHECKLIST.md` row 18).
     The full evidence trail belongs in the completed plan, not in
     `feature_list.json` or `session-handoff.json`.
   - Update the *Consumers* list of each consumed concept.
   - **Harness Deltas.** Propose promotions back into the durable harness
     (a new constraint, a new architectural fact, a new principle smell,
     **or a needed change to a concept**). Each delta must cite concrete
     evidence from this slice. Concept changes are not applied inline —
     they trigger a follow-up concept slice. Spec changes are not
     applied inline either — they trigger a follow-up BA slice.
   - **Product Deltas (v2).** Propose updates to the product-level
     surfaces (`01-product/`, `02-business/`, `03-technical/`,
     `05-releases/`). Each delta is one row:

     ```markdown
     | Target | Change | Type | Owner hat | Applied at | Flag |
     |---|---|---|---|---|---|
     | 03-technical/reference/api-reference.md | Add POST /enroll | Add | Dev | this close | — |
     | 01-product/user-manual/enroll-course.md | Add "How to enroll" | Add | BA | this close | proposed-against-no-baseline |
     | 05-releases/versions/vN.md | Note feature shipped | Add | Planner | sprint close | release-eligible |
     ```

     - **Type** is one of: `Refine`, `Add`, `Promote`, `Deprecate`.
     - **Applied at** is `this close` (apply now) or `sprint close`
       (defer to Planner's sprint-close batch).
     - **Flag** carries `proposed-against-no-baseline` if the target was
       flagged fly-blind at *Clarify*; carries `release-eligible` if
       the delta should appear in the next release notes.
     - Each delta is **written fresh** for its target audience — not
       copy-pasted from the spec or plan. See
       `harness/engineering/core-beliefs.md` *Audience Separation Is Sacred*.

     A slice that consumed any product folder during Clarify **must**
     produce at least one Product Delta against that folder, or record a
     one-line rationale why no delta is needed (e.g. "consumed for
     reference, no user-visible change").
   - **Product wiki rebuild.** If any Product Delta in this slice targets
     `docs/01-product/` or `docs/05-releases/`, run
     `.agent/workflows/build-product-wiki.md` and confirm
     `dist/wiki/index.html` renders before requesting close approval.
     Skip with explicit one-line note if the delta is purely structural
     (e.g. a renamed file with no content change).
   - **Retrospective.** One line: what would have saved time if known at
     clarify.
   - Update `docs/04-project/harness/QUALITY_SCORE.md` and `PROGRESS.md`;
     record deferred work in
     `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md`.
   - **Gate to flip the slice `passing`: user approval on evidence,
     Harness Deltas, and Product Deltas.**

## Approval Gates Summary (Feature Slice, DEV side)

| From | To | Approval |
|---|---|---|
| (prereq) | Clarify | BA published spec on `main` |
| Clarify | Plan | User: technical interpretation matches spec + consumed concepts are correct |
| Plan | Implement | User: implementation-ready plan + declared verification scope |
| Implement → Self-Review → Test → Verify | — | Agent-internal |
| Verify | Close | User: filled evaluator rubric + Harness Deltas + Product Deltas |

An agent must not cross a user gate without an explicit approval recorded
in the active plan's progress log. Inferred approval is a harness defect.
For the plan-to-implement gate, approval is meaningful only when the
active plan describes how the implementation will be built in enough
detail for the user to evaluate it.

## Concept Slices (Separate)

A **technical concept slice** is a lightweight workflow whose only output
is a document in `docs/04-project/harness/concepts/`. Its stages are
*intake → clarify → draft → peer-review → publish*. See
[../concepts/index.md](../concepts/index.md). A concept slice does not
implement code and does not flip a feature-list entry.

A feature slice that needs a technical concept which does not yet exist
**pauses at Clarify**, runs the concept slice, then resumes.

A **business concept** lives in BA workflow under
`docs/04-project/harness/concepts/business/`. DEV consumes business
concepts as vocabulary references in the plan; DEV does not edit them.

## Pause And Resume (cross-cutting)

The pause-and-resume rule applies to every upstream gap a downstream
stage may surface:

- *Clarify* finds a missing / ambiguous **technical concept** → pause →
  Architect runs a concept slice → resume at *Clarify*.
- *Clarify* finds the **published spec is ambiguous or contradicts
  itself** → pause → DEV creates a spec-gap file under
  `docs/04-project/slices/02-exec-plans/spec-gaps/` and commits it → BA
  picks up via [`ba-workflow.intake`](ba-workflow.md) → BA publishes
  updated spec → resume at *Clarify*. **DEV never edits the spec
  directly** — that file is BA-owned post-publish and is in the
  `forbidden_actions.edit_paths` of every DEV stage contract.
- *Plan* or *Implement* finds the **sprint commitment** is infeasible →
  pause → Planner re-scopes the commit list (per
  [sprint-workflow.md](sprint-workflow.md)) → resume at the same stage.

A pause never resets the slice's stage. The slice records the pause and
the eventual resume as two lines in its progress log naming the upstream
slice that was opened. Silent context-switches are a harness defect.

## Compression Rules

- Routine slices may compress *Clarify* to a short list when the spec
  is unambiguous and there are no concept consultations.
- Compression must be **declared** in the plan, not silent.
- *Self-Review*, *Test*, and *Verify* cannot be compressed away — at
  minimum the plan records the command run and the observation.

## Harness Sourcing

Every stage sources from the current working tree, the active plan,
consumed concepts, the published spec, and confirmed user requirements
only. Importing names, patterns, status codes, modules, enums, or rules
from prior systems, residue imports in `srv/*.ts`, or agent memory is a
harness-quality defect (see
[core-beliefs.md](core-beliefs.md) — *Harness Docs Are Sourced From This
Tree Only*).

The harness grows only via approved Harness Deltas at *Close*. Technical
concept docs grow only via approved concept slices. Specs grow only via
approved BA slices.

## Definition Of Done (per DEV feature slice)

A DEV slice is done only when:

- A published BA spec exists on `main` and was the input to *Clarify*,
- clarify, plan, implement, self-review, test, verify, and close
  artifacts all exist and reference each other,
- every user gate has a recorded approval in the plan,
- every consumed concept is listed and its rules were checked,
- plan-to-implement approval was based on implementation-readiness
  detail,
- `npm run cds:build`, `npm test`, and `npm run build` are green
  whole-codebase, **or** the failing files are listed in the plan's
  *whole-codebase exemptions*, none of those files are in the slice
  scope, and each exemption traces to a tech-debt row,
- the slice's `git diff` stays inside the declared slice scope (code
  files outside the scope are either reverted or covered by a
  re-declaration with a fresh user-approval line),
- automated test and runtime verify each produced at least one piece of
  evidence,
- `feature_list.json` carries the evidence and the entry is `passing`,
- Harness Deltas are applied (as feature-list / docs updates),
  redirected to a follow-up concept slice or BA slice, or explicitly
  declared as *none*.

## Related

- [`ba-workflow.md`](ba-workflow.md) — BA produces the published spec
  consumed here
- `AGENTS.md` — routing, working contract, definition of done
- `ARCHITECTURE.md` — what exists in the tree, layer model, hard
  dependency rules
- `CONSTRAINTS.md` — forbidden patterns + sourcing rule
- [`coding-principles.md`](coding-principles.md) — service-layer
  architecture, SOLID, ACID
- [`../concepts/index.md`](../concepts/index.md) — technical concept
  slice workflow and active concepts
- [`issue-workflow.md`](issue-workflow.md) — three-stage issue (bug-fix)
  workflow
- [`sprint-workflow.md`](sprint-workflow.md) — four-stage sprint workflow
  (Planner hat)
- `docs/04-project/slices/02-exec-plans/issues/root-causes.md` — defect
  patterns; read at clarify and self-review
- [`../PLANS.md`](../PLANS.md) — plan structure and operating rules
- `CLEAN_STATE_CHECKLIST.md` — cold-start and end-of-session gates
- [`../stages/implementation-workflow/`](../stages/implementation-workflow/) —
  machine-readable stage contracts enforced by
  `scripts/harness-pretool.mjs`
- [`../../slices/02-exec-plans/spec-gaps/README.md`](../../slices/02-exec-plans/spec-gaps/README.md) — DEV → BA hand-back template
