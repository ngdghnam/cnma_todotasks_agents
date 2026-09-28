# Core Beliefs

## Product Docs Predate Projects (v2)

Product-level surfaces (`01-product/`, `02-business/`, `03-technical/`,
`05-releases/`) exist as **inputs** to projects, not just outputs. A
project consumes the predefined baseline as context, then proposes
deltas back at slice close.

This means:

- A greenfield product runs **Sprint 0** to predefine the baseline before
  any feature slice opens. Sprint 0 is bootstrap-default.
- A brownfield product uses Sprint 0 as **warm-up**: AI agent reads the
  pasted baseline so it has context before the first slice runs.
- A slice may legitimately consume an empty baseline (fly-blind), but
  only with an explicit *Baseline-pending Acknowledgment* in its plan
  and a `proposed-against-no-baseline` flag on each downstream Product
  Delta.
- The status of each baseline lives in `docs/PRODUCT_BASELINE.md`. Stale
  rows there cause downstream slices to consume stale assumptions.

## Audience Separation Is Sacred (v2)

The five doc folders (`01-product/` through `05-releases/`) are
**audience-separated**. The same feature is described differently in
each, because the readers are different:

| Folder | Reader | Tone |
|---|---|---|
| 01-product | End user | Task-focused; "how do I…" |
| 02-business | BA / Product Owner | Process / data / role |
| 03-technical | Developer | Architecture / contract / API |
| 04-project | AI agent + dev team | Working state, current slice |
| 05-releases | All | What shipped, when |

A Product Delta is **written fresh** for its target audience, not
copy-pasted from the slice's product spec or plan. Copying breaks
audience separation and degrades each doc's value to its reader.

This belief is what tells the slice author: do not move `feature-NNN.md`
from `04-project/slices/01-product-specs/` into `02-business/`. Instead,
write a new section in `02-business/data-dictionary.md` for the
business-relevant fields, and a new entry in `01-product/user-manual/`
for the end-user-relevant flow.

## Agent-First Repository Memory

Agents should route through stable, repo-local docs before implementation:
`AGENTS.md`, `ARCHITECTURE.md`, `docs/04-project/harness/QUALITY_SCORE.md`, `docs/04-project/harness/PLANS.md`,
the relevant product spec, and the active execution plan.

## Backend/Frontend Boundary Discipline

The backend owns business rules through services, repositories, processors,
and integration adapters. The frontend (if any) should present and validate
workflows without duplicating backend authority.

## Lifecycle Discipline

Every feature slice walks through intake → specify → clarify → plan →
implement → self-review → test → verify → close as defined in
`implementation-workflow.md`. **BA hat** owns intake and specify;
**Developer hat** owns clarify through close. Stage transitions marked as
user gates require explicit approval recorded in the active plan; skipping
a stage or crossing a gate on inferred approval is the most common way
agent output silently drifts. The harness exists to make each stage and
each gate observable.

## Concepts Before Features

Cross-feature domain rules (authorization, persistence, integration,
numbering, audit, ...) are authored as **concepts** in `docs/04-project/harness/concepts/`
**before** the first feature that consumes them. Feature slices consume
concepts; they do not invent them. A feature slice that needs a
non-existent or ambiguous concept pauses at *clarify* and runs a concept
slice first. This keeps cross-cutting decisions in one place per concept
instead of fragmenting across feature files.

## Index Files Are Tables Of Links

Harness index files (`docs/04-project/slices/01-product-specs/index.md`,
`docs/04-project/harness/concepts/index.md`, `docs/04-project/harness/QUALITY_SCORE.md`, `docs/04-project/harness/RELIABILITY.md`,
`docs/04-project/slices/02-exec-plans/features/completed/index.md`, ...) are tables of links. Every cell is
one line. If a row needs more detail (per-feature behavior, per-domain
history, per-layer commentary), the detail belongs in a linked per-X file —
never inside the index cell. A cell that exceeds one line is a harness defect
and is caught by `CLEAN_STATE_CHECKLIST.md`.

## Append-Only History Files Are Not Indexed In Full

Append-only logs (benchmark snapshots, simplification log, change logs that
grow per event) live in their own history file (e.g.
`docs/04-project/slices/04-quality/history.md`). The index shows only the latest few rows and a
link to the full history. The index never absorbs the full log.

## Evidence Over Inspection

No feature is accepted from code inspection alone. Use commands, service
requests, UI runtime checks, or other concrete evidence and record it in the
plan or feature tracker.

## Forward-Reference Is Fiction (scoped — v2.1)

This rule is **scoped to the project layer**. Different layers have
different relationships to the future:

- **Project-layer docs** (`04-project/releases/*`, `04-project/sprints/*`, `04-project/decisions/*`, `04-project/harness/concepts/* Consumers`) describe what's **happening or has happened** in the current development cycle. Forward-references here are fiction — they pre-name slices that haven't earned their existence yet.
- **Product-layer docs** (`01-product/product-roadmap.md`, release plans, vision docs) describe what the **product intends to become**. Forward-references here are **legitimate** — declaring future features is their job. They must, however, carry a *Status* column (`planned` / `in-backlog` / `in-flight` / `shipped` / `deprecated`) so the agent never confuses intent with completion.

In the **project layer**, a slice ID, concept name, ADR number, or rule
may appear **only after** one of three conditions holds:

1. **It exists as a real artifact in the working tree** (a closed exec
   plan, a published concept doc, an accepted ADR file, a passing
   `feature_list.json` entry), or
2. **It is a candidate in `backlog.md`** — the single permitted
   "not-yet-real" parking lot, where every row is one line of rough
   scope and no other project-layer doc forward-references it, or
3. **It is the slice currently being worked on**, with at least an
   Intake note in its product spec stub.

In the **product layer**, a slice ID may appear as a `planned` row in
`01-product/product-roadmap.md` **without** a backlog row or spec stub —
the roadmap is itself the source of authority for "this product needs
this feature". Promotion `planned → in-backlog` is the moment the
project layer takes ownership.

Any other appearance — a "Planned" slice listed in `releases/`, a sprint
commitment pulling a name not in the backlog, an ADR cited by a concept
that does not exist, a concept's Consumers row pointing at a slice with
no spec — is **fiction**. The harness rejects fiction because agents
cannot distinguish a real rule from an aspirational one: both render as
the same markdown. Fiction once accepted becomes the next agent's
ground truth.

Mechanical consequences:

- `releases/v<X.Y>-<slug>.md` may name slices **only** in its *Shipped Slices*
  table, where each row links to a completed exec plan. Section 3 *Scope*
  may describe business outcomes derived from `01-product/product-roadmap.md`
  rows whose `Target Release` matches this version, but must not name slice
  IDs that do not yet exist.
- `sprints/<sprint>/commitments.md` may commit a slice ID **only if**
  that ID currently appears as a row in `backlog.md` (and is removed
  from backlog on commit) or already has a product spec stub from a
  prior sprint's carry-over.
- `decisions/<adr>.md` is created **only when** a real decision was
  made inside a closed slice; the ADR cites that slice as its *Decided
  during* source.
- A concept's *Consumers* row may name a slice **only after** that slice
  has been closed against this concept (the row is added at the
  consumer's *close* stage, not at *intake*).

Detection: any harness doc that names a slice ID failing all three
conditions above is a harness defect and is caught at cold-start
(`CLEAN_STATE_CHECKLIST.md`). The fix is to delete the forward-reference
or move the slice into `backlog.md`, not to back-fill a spec for it.

## Harness Docs Are Sourced From This Tree Only

Harness documents (`ARCHITECTURE.md`, `CONSTRAINTS.md`, coding principles,
product specs, plans, and trackers) are populated from the current working
tree and from confirmed user requirements only.

Importing names, patterns, status codes, modules, enums, or rules from prior
systems, residue imports in `srv/*.ts`, or agent memory is a harness-quality
defect. When detected, the offending content is stripped and the rule is
re-derived from a closed slice or removed entirely.
