# CONSTRAINTS.md

Forbidden patterns and boundary rules. Structural counterpart to
[docs/04-project/harness/SECURITY.md](docs/04-project/harness/SECURITY.md): security says *what posture must hold*;
constraints say *which code path must enforce it*.

This file records only what is grounded in the current working tree and in
[ARCHITECTURE.md](ARCHITECTURE.md). It must not import rules from prior
implementations, agent memory, or unsourced residue. New rules are added
only after a slice produces evidence that justifies them.

## How To Use

- Read during the **clarify** and **review** stages of [docs/04-project/harness/engineering/implementation-workflow.md](docs/04-project/harness/engineering/implementation-workflow.md).
- A constraint violation is a review failure, not a style nit.
- An exception requires a documented entry in the active plan's open-decisions list **and** a row in [docs/04-project/slices/02-exec-plans/tech-debt-tracker.md](docs/04-project/slices/02-exec-plans/tech-debt-tracker.md).

## Structural Constraints

These rules follow directly from the layer model in
[ARCHITECTURE.md](ARCHITECTURE.md). Until that file's layer model is
filled at the first slice's *clarify* stage, this section is
intentionally empty — a guess here biases every downstream slice.

### Layer Direction

Define once `ARCHITECTURE.md` records the layer model. The order is
one-way: a higher layer may not be referenced from a lower layer.

### Forbidden Patterns

| # | Pattern | Source slice |
|---|---|---|
| — | *none yet — grows from closed slices* | — |

> Forbidden patterns are added by closing slices as a Harness Delta,
> citing the evidence that justified the rule. Do not seed entries here.

## Sourcing Rule

Every entry in this file must either:

- restate a rule already recorded in [ARCHITECTURE.md](ARCHITECTURE.md), or
- be added by a closed slice that produced concrete evidence for the rule.

A rule imported from prior systems or agent memory is a harness-quality defect
and must be removed.

## Related

- [ARCHITECTURE.md](ARCHITECTURE.md) — canonical layer model and dependency rules.
- [docs/04-project/harness/engineering/coding-principles.md](docs/04-project/harness/engineering/coding-principles.md) — architecture / SOLID / ACID principles.
- [docs/04-project/harness/SECURITY.md](docs/04-project/harness/SECURITY.md) — security posture.
- [docs/04-project/harness/engineering/implementation-workflow.md](docs/04-project/harness/engineering/implementation-workflow.md) — when to read this file.
- [CLEAN_STATE_CHECKLIST.md](CLEAN_STATE_CHECKLIST.md) — close-stage gate.
