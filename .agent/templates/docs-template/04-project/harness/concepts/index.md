# Concepts Index

This folder holds **concept-level design** — durable, cross-feature domain
rules that multiple features consume. Concepts are *inputs* to feature
delivery, not outputs of it.

## Concepts Are Optional

A concept exists **only when a cross-feature rule is worth capturing**.
Feature-scoped behavior does not require a concept; it belongs in the
feature's product spec and active plan.

However, before any new feature begins:

- If the developer did **not** give concept context, the agent must ask
  at *intake* / *clarify* which concepts apply, and whether a missing
  one should be authored first. The agent must not invent the answer.
- If a concept **already exists** for the relevant rule, the developer
  must point at it. The feature slice records it under *Concepts
  Consulted* in its plan.
- If no concept is needed (the rule is feature-scoped), the plan
  records *Concepts consulted: none — feature-scoped*.

## Why Concepts Exist

A feature slice should never invent a cross-cutting rule on its own. If
two or more features will inherit the same rule (authorization model,
persistence shape, integration contract, numbering policy, audit
behavior, ...), the rule belongs in a concept document here, written
**before** the first feature that needs it.

This separates two kinds of design that used to be confused:

- **Concept-level design** — durable, cross-feature, lives here.
- **Slice-level design** — one feature's specific approach, lives in
  the active plan.

The per-slice workflow in
[../engineering/implementation-workflow.md](../engineering/implementation-workflow.md)
**consumes** concepts; it does not author them.

## Concept Slice Workflow (Inline Lifecycle)

A concept is created or amended by a dedicated lightweight slice. The
concept document **lives at its final path from day one** — there is no
active/published mirror folder. Progress is tracked **inline** on the
document via a *Slice Progress* section that is removed at *publish*.

Stages:

1. **Intake** — *why this concept now, which feature slice triggered it.*
   User approval to advance.
2. **Clarify** — *what the concept covers and does not cover; open
   questions surfaced to the user.* User approval to advance.
3. **Draft** — fill the document's *Rules* and *Vocabulary* sections.
4. **Peer review** — scan against the *Concept Sourcing Rule* below, the
   coding principles, and `CONSTRAINTS.md`. No code is written.
5. **Publish** — user approval. Set `Status: accepted`, remove the
   *Slice Progress* section, add the row to this index. Any in-flight
   feature slice that was paused waiting on this concept can now resume.

A concept slice does not implement code. Its sole output is the concept
document.

## Concept Document Sections

Every concept document under `docs/04-project/harness/concepts/` must include the sections
below. The intended reading order for a developer landing on a concept
is **Business Context → Actors and Roles → Principles → Use Cases →
Rules + Resolution Matrix → Anti-Patterns → Edge Cases**. The remaining
sections are metadata.

| Section | Purpose | Required? |
|---|---|---|
| Status | proposed, accepted, deprecated. | required |
| Slice Progress | stage + gate approvals; removed at publish. | transient |
| Business Context | why this concept exists in business terms; actors; problem solved. Plain language, no scope names. | required |
| Glossary | every term used in the doc, business and technical, defined here so the doc is self-contained. | required |
| Actors and Roles | named user categories or actors in business terms and what they represent operationally. | required |
| Scope | what is in and out of this concept. | required |
| Principles | the 3–7 guiding rules in plain language, before any scope-name detail. A developer reads this first. | required |
| Rules | detailed, normative, machine-checkable rules. Each rule is testable from the document alone. | required |
| Resolution Matrix | when a concept produces a (category × context × operation → outcome) decision, publish it as an explicit matrix. | optional |
| Use Cases / Scenarios | concrete walk-throughs of the rules with named example actors. Each scenario cites which rule it exercises. | required |
| Anti-Patterns | what features must **not** do, with reasoning. Pre-empts the failure modes the concept exists to prevent. | required |
| Edge Cases | boundary conditions the rules cover (and any the rules deliberately leave undefined). | required |
| Open Questions | known gaps; each gap names the kind of decision needed. | required (may be empty) |
| Consumers | features and other concepts depending on this one. Updated at each consumer's close. | required |
| Evidence Source | where every rule came from (user requirement, working-tree file, prior closed slice). | required |
| Change Log | date + one-line reason for each substantive change after publish. | required (starts empty) |

## Concept Sourcing Rule

Concepts are sourced from:

- confirmed user requirements,
- already-closed feature slices that produced evidence for the rule,
- files in the current working tree (e.g. security descriptors, the
  data model, the deployment descriptor).

Importing names, categories, status codes, enums, or rules from prior
systems or agent memory is a harness-quality defect (see
[../engineering/core-beliefs.md](../engineering/core-beliefs.md) —
*Harness Docs Are Sourced From This Tree Only*).

## How Feature Slices Use Concepts

During a feature slice:

- **Intake / Clarify** asks whether any concept applies. The developer
  confirms an existing concept, requests authoring of a new one, or
  declares *none — feature-scoped*.
- **Clarify** records the concepts the slice consumes. If a required
  concept is missing or ambiguous, the feature slice pauses and a
  concept slice runs first.
- **Plan** records the concept files in the *Concepts Consulted*
  section.
- **Self-review / verify** check that the implementation does not
  contradict any consumed concept.
- **Close** updates the *Consumers* list in each consumed concept.

## Active Concepts

| ID | Concept | Status | Doc | Triggered By |
|---|---|---|---|---|
| — | *none* | — | — | — |

## Rules

- One file per concept under `docs/04-project/harness/concepts/<concept-slug>.md`.
- The document **stays at that path across its whole lifecycle**.
  Progress is tracked inline via the *Slice Progress* section, not in a
  separate folder.
- This index is a table of contents only; the concept body lives in its
  own file.
- A row is added at *intake* with `Status: proposed (intake)` and
  updated at each gate; at publish the row reads `Status: accepted`.
- When a concept is retired, set `Status: deprecated`, move the file to
  `docs/04-project/harness/concepts/retired/`, and update the row here.
