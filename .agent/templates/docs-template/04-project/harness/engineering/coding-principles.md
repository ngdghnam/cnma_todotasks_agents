# Coding Principles

Three non-negotiable principles for every TypeScript slice in the service
layer. Read this during **clarify**, **implement**, and **review** stages of
[implementation-workflow.md](implementation-workflow.md).

1. **Service-Layer Architecture** — where code lives.
2. **SOLID** — how units depend on each other.
3. **ACID** — how writes commit.

A diff that violates any of these is a review failure, not a style nit.

This file records **principles only**. It does not name classes, modules,
enums, or status codes. Those are decided per slice during *clarify* and
documented in the active plan, the matching product spec, and (where
appropriate) [ARCHITECTURE.md](../../../../ARCHITECTURE.md).

---

## 1. Service-Layer Architecture

The TypeScript service layer is split into six roles, in the layer order
defined by [ARCHITECTURE.md](../../../../ARCHITECTURE.md). One role per file; one
file per concrete unit.

| Layer | Owns | Must not |
|---|---|---|
| Domain types & enums | enums, value objects, DTOs, branded types | hold runtime state; import CAP runtime; depend on higher layers |
| Repositories | all CQN against the project's CDS namespaces; transaction-scoped reads and writes | call other repositories; build payloads for external systems; hold business rules |
| Integrations | external-system adapters (CAP destinations, SDK clients, HTTP, payload mapping) | call repositories directly; decide business outcomes |
| Services / Processors | orchestration, business rules, transaction shape, aggregate recomputation | issue CQN directly; talk to the CAP `req` object; perform HTTP |
| Handlers | CAP runtime adapter — request parsing, auth-context extraction, action routing, error mapping | hold business rules; hold CQN; hold knowledge of external systems |
| Service entrypoints | constructor-injection wiring; CAP `srv.on/before/after` registration | hold any logic beyond wiring |

### Structural Rules

- One write surface per CAP service, routed internally by an enum chosen during *clarify*.
- No service locators, no DI containers, no module-level singletons. Plain constructor injection.
- Entrypoints contain only wiring and CAP registration calls.
- Names (repositories, processors, services, handlers, integrations, enums) are chosen during the slice's *clarify* stage and recorded in the active plan. They are not pre-declared in this file.

---

## 2. SOLID

Applied to CAP / TypeScript.

### S — Single Responsibility

- One class per concern. A handler routes; a processor orchestrates; a repository persists; a mapper maps. Do not merge.
- One public class per file. Helpers stay private to the file.
- If a class needs more than one collaborator from the same layer, it is probably two classes.

### O — Open / Closed

- Extend via new enum values plus a new branch in a dispatch table, not by editing existing branches.
- Extend via new strategies or adapters, not by adding discriminator chains.
- Public method signatures of a stable class are append-only within a slice.

### L — Liskov Substitution

- An interface implementation must honor the interface contract — pre/postconditions, error categories, nullability.
- A test double must be a valid substitute. If a test must monkey-patch a singleton or reach past the interface, the design is wrong.

### I — Interface Segregation

- Prefer small role interfaces over fat ones.
- A consumer depends only on the methods it calls.
- A read-only consumer must not be able to invoke write methods just because they share a class.

### D — Dependency Inversion

- Higher layers depend on interfaces they themselves declare, not on concrete lower-layer classes.
- Processors and handlers receive collaborators via constructor parameters typed as interfaces. Concrete classes are wired only in the entrypoint.
- No CAP runtime imports inside processors or handlers — CQN is the repository's concern.

### SOLID Smell Checklist (review-time)

- A constructor takes more than five collaborators → SRP or ISP violation.
- A `switch` on a string discriminator appears in two places → enum + dispatch table missing.
- A test must monkey-patch a singleton to inject behavior → DIP violation.
- A handler imports `@sap/cds` for CQN → DIP violation; CQN belongs in a repository.
- A class name contains "Manager", "Helper", or "Util" without a concrete role → SRP smell.

---

## 3. ACID

CAP runs every inbound request in a transaction. The service layer must keep
that contract: multi-step writes must be atomic, preserve domain invariants,
not leak interim state, and commit durably or roll back cleanly.

### A — Atomicity

- All writes for one inbound action run inside the request's transaction.
- A processor either completes all its repository writes or throws. No partial commits.
- Side effects to external systems do not block the local commit; persist intent, commit, dispatch after commit.
- On error: throw to let CAP roll back. Do not swallow and continue.

### C — Consistency

- Domain invariants are enforced at the repository or view layer, not in handlers.
- Status values come from enums declared during *clarify*; no string-literal status codes anywhere else.
- Aggregate fields are recomputed from canonical views via set-based updates, not per-row loops.
- Cross-entity invariants are validated before writes, not via generic database constraint errors.

### I — Isolation

- Within one request, read your own writes through the same transaction context.
- No module-level state caching cross-request data. Per-request caches live on the request context.
- Idempotency for replayable inbound events is designed in at the *clarify* stage, not retrofitted.

### D — Durability

- Trust CAP commit semantics. External dispatch happens after commit (after-commit hook or an outbox), never inside the commit window.
- Allocations from external sequences run inside the domain transaction so they roll back with the slice.
- Background jobs log start, completion, and failure status so durability gaps are observable.

### ACID Smell Checklist (review-time)

- A processor opens its own transaction inside an already-active request context → Atomicity violation.
- A handler calls an external system, then a repository, then another external system → Atomicity / Durability violation (remote call inside the commit window).
- A `.catch(() => null)` around a write → Atomicity violation (silent partial commit).
- A status value appears as a string literal in a handler or processor → Consistency violation.
- Module-scoped state caches data across requests → Isolation violation.
- A replayable inbound event handler upserts without an idempotency key → Isolation / Durability violation.

---

## How This Doc Is Used

- **Clarify stage:** read all three sections; identify the layer the slice changes, the SOLID seams that already exist (if any), and the transaction shape required.
- **Implement stage:** keep the structural rules and smell checklists open.
- **Review stage:** run each smell checklist over the diff before approving. Promote any repeated violation into a lint rule or repository guard rather than re-explaining it in chat.

## Sourcing Rule

Examples, class names, enum values, and module topologies are added to plans
and product specs as slices produce them, **not** to this file. This file
holds principles. Importing implementation choices from prior systems or
agent memory is a harness-quality defect.

## Related

- [ARCHITECTURE.md](../../../../ARCHITECTURE.md) — layer model and dependency rules.
- [CONSTRAINTS.md](../../../../CONSTRAINTS.md) — forbidden patterns.
- [implementation-workflow.md](implementation-workflow.md) — slice lifecycle.
- [docs/04-project/harness/SECURITY.md](../SECURITY.md) — security posture.
