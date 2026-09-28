# BA Workflow

## Purpose

The BA hat owns the front half of a feature lifecycle: turning a business
request into a published product spec (and optional companion **business
concept**) that DEV can implement against. BA work happens on a **separate
git branch** so DEV is not blocked by half-baked specs.

This workflow handles two slice types:

| Type | Output | When |
|---|---|---|
| `ba-feature` | Product spec under `docs/04-project/slices/01-product-specs/<slice>.md`, optionally with a companion business concept | New user-visible behavior |
| `business-concept` | Business concept under `docs/04-project/harness/concepts/business/<slug>.md` | Cross-feature business term, process, or rule that needs a shared definition |

Both types use the same 5 stages; the deliverables differ.

> **Business concept vs technical concept.** A *business concept* (this
> workflow) defines a term, process, or rule in **business language** —
> what "release", "supplier", or "active order" means to the business.
> A *technical concept* (see [../concepts/index.md](../concepts/index.md))
> defines cross-feature **technical rules** — status matrices, data
> visibility, normalization. The two complement each other: a technical
> concept may consume a business concept's vocabulary, but BA never
> writes technical concepts and Architect never writes business ones.

## Branch Model

BA opens a slice on a branch named `ba/<slice-id>` cut from `main`. All
five BA stages happen on that branch. Mid-stage commits are allowed (and
encouraged for backup); pushing the BA branch to `origin/ba/<slice-id>`
is also allowed at every stage for off-machine backup. The harness
blocks pushes to `main` and `git merge` at every stage except *Publish*.
*Publish* is the only stage that may merge to `main`.

This isolation guarantees: while BA is iterating, DEV branches off `main`
and never sees the in-progress spec. DEV reads a spec only after BA has
published.

## Lifecycle (5 Stages)

1. **Intake** *(BA hat)*
   - Triage the request: in scope now, matches a product priority, or
     defer/refuse with reason.
   - Choose the slice type (`ba-feature` or `business-concept`).
   - Create the stub:
     - `ba-feature`: `docs/04-project/slices/01-product-specs/<slice>.md` with
       Intake note + empty Acceptance/Context sections.
     - `business-concept`: `docs/04-project/harness/concepts/business/<slug>.md`
       with Intake note + empty Definition/Rules sections.
   - Add a row to `feature_list.json` (ba-feature) or the business-concept
     index (business-concept), and to `docs/04-project/ACTIVE_WORK.md`.
   - **Spec-gap re-entry.** If a DEV-raised spec-gap under
     `docs/04-project/slices/02-exec-plans/spec-gaps/<slice>-NN.md` triggered
     this slice, the Intake note cites the gap file and the resolution is
     planned across the remaining stages.
   - **Gate to Clarify: user approval to proceed** (or kill the slice cheaply).

2. **Clarify** *(BA hat)*
   - Interview stakeholders. Pin business vocabulary used in any companion
     business concept.
   - Surface and resolve business open questions. Do not guess.
   - Append a Clarify section to the spec / concept with findings and any
     open questions explicitly deferred.
   - **Gate to Draft: user approval that clarify questions are resolved or
     bounded.**

3. **Draft** *(BA hat)*
   - Write the spec body (Acceptance Criteria, Scope, Non-Goals, Context)
     in business language — no HTTP status codes, payload shapes, modules,
     or persistence rules. Those are DEV's territory below the spec divider.
   - For `business-concept` slices: write Definition, Rules, Examples,
     Glossary.
   - If the slice produces both a spec **and** a companion business
     concept, link them.
   - Agent-internal: no gate.

4. **Review** *(BA hat)*
   - Internal BA review. If a second BA is available, peer-review; otherwise
     self-review against a checklist (terminology consistent, all clarify
     questions resolved, acceptance criteria are observable).
   - Append a Review section.
   - **Product Foundation slice check (v2.2).** If this slice's target is
     `docs/01-product/`, verify both:
     1. `docs/01-product/product-roadmap.md` is populated with Vision text
        **and** ≥1 real row in the Feature Catalog table (each row must
        carry the `Target Release` column, using **semver** values such as
        `v0.1-mvp`).
     2. The first release plan exists at
        `docs/04-project/releases/v0.1-<slug>.md`, derived from Feature
        Catalog rows whose `Wave` is `Foundation`. Sections 1–4 of the
        release file must be filled (Release Goal, Why, Scope, Ship
        criteria). Sections 5–6 stay empty until the first slice closes.
     An empty roadmap or missing `v0.1` plan blocks the Publish gate
     because cold-start row 20 will mark INVALID STATE once
     `PRODUCT_BASELINE.md` flips 01-product to `complete`.
   - **Gate to Publish: user approval that the spec / concept is ready to
     hand off.**

5. **Publish** *(BA hat)*
   - Mark the spec / concept `Status: published` with date.
   - Flip the `feature_list.json` entry to `spec-published`
     (ba-feature) or update the business-concept index (business-concept).
   - If this slice resolves any spec-gap files, mark each
     `Status: resolved` and link to the spec section that resolved it.
   - **Merge `ba/<slice-id>` to `main`** (PR or fast-forward).
   - Remove the BA row from `docs/04-project/ACTIVE_WORK.md`.
   - DEV is now free to pick up the spec via `implementation-workflow.clarify`.

## Approval Gates Summary

| From | To | Approval |
|---|---|---|
| Intake | Clarify | User: proceed (or kill the slice) |
| Clarify | Draft | User: clarify questions resolved or bounded |
| Draft | Review | Agent-internal |
| Review | Publish | User: spec / concept ready to hand off |
| Publish | — | (slice closes when merged to main) |

An agent must not cross a user gate without an explicit approval recorded
in the spec or concept progress log. Inferred approval is a harness defect.

## DEV ↔ BA Hand-Back: Spec-Gap

DEV at `implementation-workflow.clarify` may find a published spec has a
gap. The hand-back artifact is a **spec-gap file** under
`docs/04-project/slices/02-exec-plans/spec-gaps/<slice>-NN.md`
(template in that directory's README).

Flow:

1. DEV creates and commits the spec-gap file on the DEV branch.
2. BA picks it up via **Intake** of a new ba-workflow run on the same
   slice (cut a fresh `ba/<slice-id>-gap-NN` branch, or re-open the
   original branch).
3. BA runs Clarify → Draft → Review → Publish, updating the spec and
   marking the spec-gap `resolved` at Publish.
4. DEV pulls `main`, resumes `implementation-workflow.clarify` with the
   updated spec.

The spec-gap is a lightweight DEV→BA message, not a full issue slice.
If a spec gap actually reflects a regression against shipped behavior,
open an issue (see [issue-workflow.md](issue-workflow.md)) instead.

## Compression Rules

- Routine slices may compress *Intake* to one line in the spec stub.
- Routine slices may compress *Clarify* to a short bullet list when the
  business requirement is self-evident and no stakeholders need to be
  asked.
- Compression must be **declared** in the spec, not silent.
- *Draft*, *Review*, and *Publish* cannot be compressed away — each
  produces a section in the spec.

## Definition Of Done (per BA slice)

A BA slice is done only when:

- Spec / concept exists with all required sections
  (Intake, Clarify, Draft body, Review, Publish marker)
- All user gates have a recorded approval
- For `ba-feature`: spec has filled Acceptance + Context, and
  `feature_list.json` status is `spec-published`
- For `business-concept`: concept has filled Definition + Rules,
  and the business-concept index lists it as `published`
- Any spec-gap files this slice was opened to resolve are
  `Status: resolved`
- The `ba/<slice-id>` branch is merged to `main`
- `docs/04-project/ACTIVE_WORK.md` no longer lists this slice

## Related

- [`implementation-workflow.md`](implementation-workflow.md) — DEV
  consumes published specs from here
- [`../concepts/index.md`](../concepts/index.md) — technical concepts
  (Architect-owned, complements business concepts)
- [`issue-workflow.md`](issue-workflow.md) — regressions against shipped
  behavior; not the same as spec-gaps
- [`../stages/ba-workflow/`](../stages/ba-workflow/) — machine-readable
  stage contracts enforced by `scripts/harness-pretool.mjs`
- [`../../slices/02-exec-plans/spec-gaps/README.md`](../../slices/02-exec-plans/spec-gaps/README.md) — spec-gap template
