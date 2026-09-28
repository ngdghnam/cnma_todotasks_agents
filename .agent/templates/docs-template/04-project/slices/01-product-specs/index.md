# Product Specs Index

This index is the **table of contents only**. One row per feature. The full
spec for each feature lives in its own file in this folder.

## Active Specs

| ID | Feature | Status | Spec | Owner |
|---|---|---|---|---|
| — | *none* | — | — | — |

## Rules

- One spec file per feature under `docs/04-project/slices/01-product-specs/<feature-slug>.md`.
  This index never holds the spec body.
- A row is added to this index during the slice's *specify* stage
  (see [docs/04-project/harness/engineering/implementation-workflow.md](../../harness/engineering/implementation-workflow.md)).
- Every spec file uses the BA/Dev template below. **The divider is
  mandatory.** BA never edits below the divider; Developer never rewrites
  above it.
- A spec is created from a clarified business requirement, not from prior
  systems or assumption.
- If implementation diverges from the spec, update one of them in the same
  session. Spec drift on the BA section pauses the slice back to *Specify*;
  drift on the Dev section pauses back to *Clarify*.
- A feature cannot be marked `passing` in `feature_list.json` without a
  corresponding spec file that has **both sections** filled.
- When a feature is retired, move its spec file to
  `docs/04-project/slices/01-product-specs/retired/` and update the row here.

## Per-Feature Spec Template

Every `feature-NNN-<slug>.md` follows this shape. The horizontal rule
between the BA and Dev sections is the contract divider.

```markdown
# Feature NNN — <Title>

## Business Concept *(BA section — above the divider)*
Who is affected, what problem this slice solves, why now.

## Business Requirement
The user-visible behavior in domain language. No HTTP status codes,
payload shapes, modules, table names, or persistence rules.

## Acceptance Criteria
Observable outcomes the requesting user could verify themselves.

## Context
Related processes, upstream/downstream actors, business constraints.

---

## Concepts Consulted *(Dev section — below the divider)*
List of `docs/04-project/harness/concepts/*.md` files this slice inherits, or
*none — feature-scoped* with a one-line reason.

## Layer Hints
Layer order per `ARCHITECTURE.md` and the surfaces involved.

## Technical Open Questions
Ambiguities in the BA section that need business clarification before
planning. If non-empty at the Clarify→Plan gate, the slice pauses to
*Specify*.
```

Routine slices may compress sections within their own half (e.g. a
one-line *Context*), but no section above or below the divider may be
deleted outright. The divider itself is never removed.
