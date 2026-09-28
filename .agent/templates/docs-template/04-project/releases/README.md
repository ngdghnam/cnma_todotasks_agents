# releases/

**Forward-looking release plans (semver).** Replaces the deprecated `roadmap/` altitude.

One file per version: `vMAJOR.MINOR-<slug>.md` (e.g. `v0.1-mvp.md`, `v1.0-ga.md`).

## When to add a file

A release file is created the day Planner opens the release — typically:

- At the end of Sprint 0 (first release `v0.1-<slug>` seeded from product-roadmap **Foundation** wave).
- When the current `in-flight` release meets its ship criteria → Planner opens the next release **before** the next sprint commits.

## Required sections (in order)

A release file contains only these sections:

1. **Release Goal** — one sentence, business language: what user value this release unlocks.
2. **Why this release** — one paragraph: context, dependency from previous release, prerequisite work satisfied.
3. **Scope** — bulleted list of business outcomes. **Derive from `01-product/product-roadmap.md` rows where `Target Release` matches this version.** No slice IDs (Forward-Reference Is Fiction).
4. **Ship criteria** — one paragraph: concrete evidence required to mark this release `shipped`.
5. **Shipped slices** — back-pointer table. One row per closed slice delivered in this release. Empty until the first slice closes. Each row links to its completed exec plan under `slices/02-exec-plans/features/completed/`.
6. **Progress log** — append-only `Date | Note` table.

Optional metadata block at the top:

```
Status: planning | in-flight | shipped | superseded
Target date: <best estimate, NOT a commitment>
Depends on: <previous release version, e.g. v0.1-mvp>
```

## Lifecycle

```
planning → in-flight → shipped
```

| From → To | Trigger | Owner | Output |
|---|---|---|---|
| (none) → planning | Sprint close where ship criteria of current `in-flight` release met | Planner | Create `vNEXT.md` with sections 1–4 |
| planning → in-flight | User approves Goal + Scope; first sprint commits a slice targeting this release | Planner | Metadata flip |
| in-flight → shipped | All ship criteria pass + release notes published into `docs/05-releases/` | Planner + user gate | Metadata flip; file becomes read-only history |

## Mapping with `01-product/product-roadmap.md`

`product-roadmap.md` Feature Catalog has a `Target Release` column. Section 3 (Scope) of each release file is **derived from** rows matching that version. When a feature is assigned to a release:

- `product-roadmap.md` row status flips `planned → in-backlog`.
- The feature also lands in `04-project/backlog.md`.

## Relation with `docs/05-releases/`

- `04-project/releases/vX.Y-*.md` = **plan** (forward-looking, written before ship).
- `docs/05-releases/vX.Y-notes.md` = **release notes** (post-hoc, user-facing changelog).

Same version, different audience and timing. Release notes are written by Planner at the `in-flight → shipped` transition, in end-user language (Product Delta). **Not auto-generated** — author them deliberately.

## Slice rollover

If a sprint closes while the current release window still has slices `in-flight`:

- List them in the closing release's Progress log as "Carried over → vNEXT".
- List them in the opening release's Progress log as "Inherited from vPREV".
- The slice itself does not move; its scope simply spans both releases' progress logs.

## Content discipline

- **No slice IDs in section 3 (Scope).** Candidates live in `backlog.md`.
- **No "Planned" / "Candidate" tables here.** Sprint commitments live in `sprints/<sprint-id>/commitments.md`.
- **Shipped Slices is back-pointer only.** A row appears only after the slice's exec plan exists under `features/completed/`. Broken links are a harness defect.
- **Edit triggers:** release open (sections 1–4), sprint close that closes a slice (section 5), Planner progress note (section 6). Any other edit is a harness defect.

## Status

Open release: *(set during Sprint 0 — first release `v0.1-<slug>` derived from Foundation wave).*
