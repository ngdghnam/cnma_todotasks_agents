# CAP/BTP engineering mindset

Load this file for every pilot agent. It is deliberately project-aware: a
rule in an old kit is a reference, not a reason to overwrite the actual
repository, its approved documents, or a frozen baseline.

## Runtime grounding

- Determine CAP version, runtime language, database, UI stack, authentication,
  deployment model, installed libraries, destinations, and service bindings
  from the current project context. Never carry those facts from another
  project or infer them from this mindset.
- Follow the repository's established language and module patterns unless an
  approved design explicitly changes them.
- Treat dependency versions, external-service names, destinations, scopes,
  role collections, and deployment artifacts as project data supplied at
  invocation time.

## CAP-first rules

1. Model business data in CDS first. Keep persistence entities, service
   projections, read views, external-service models, and UI payloads
   distinct when the design distinguishes them.
2. Honour service boundaries and annotations. Do not turn a read-only view
   into a writable API merely to simplify a UI change.
3. Put business authorization and validation at the service/action/entity
   boundary. A hidden button, a frontend role check, or a client payload is
   never an authorization control.
4. Use a transaction for an aggregate write that must be atomic. Avoid N+1
   access patterns; inspect the existing CQN/handler conventions before
   introducing a new abstraction.
5. Prefer an explicit action/command when the approved design requires a
   state-changing workflow, multi-entity write, validation pipeline, or
   domain result. Keep handlers thin and reuse project helpers where they
   exist.
6. Treat status/value help as data and approved projections. Do not
   hardcode business status labels, master data, or authorization policy in
   a React component.

## BTP and integration rules

1. External calls must use the approved CAP remote-service/destination
   design. Never embed credentials, destination URLs, or tokens in source.
2. For an external dependency, make timeout, error mapping, observability,
   retry/idempotency, and fallback behaviour explicit when it is in scope.
   Do not silently substitute fake master data for a failed production call.
3. Distinguish a locally executable development configuration from Cloud
   Foundry/BTP deployment configuration. Do not add MTA, XSUAA, Workzone,
   HDI, or destination artifacts unless the target feature and project
   configuration require them.
4. Schema changes need an explicit compatibility and deployment assessment;
   never add destructive undeploy/migration behavior to solve a local test
   problem.

## React/UI rules

1. Inspect the project's approved component library exports and types before
   adding a local equivalent of a shared component. Reuse the existing
   application shape before introducing a new folder pattern.
2. Preserve the service/client boundary: React calls the documented CAP
   service/action; it does not own business rules or security enforcement.
3. Keep i18n, error visibility, loading, and accessibility in the changed
   user path. Avoid speculative state-management or styling frameworks.
4. When React/TypeScript changes, run the project-appropriate type check in
   addition to build/test validation. Use the actual project scripts and
   configuration rather than inventing a command.

## Evidence discipline

- Separate facts (with a repository/document reference), implementation
  decisions, assumptions, and open questions.
- A command only counts as evidence when its exact command, working
  directory, exit status, and relevant output are recorded.
- A build passing does not establish authorization, integration, or business
  acceptance. Test the relevant behavior or report it as a gap.
- On conflict, the frozen functional baseline and governed project rules win
  over this mindset file. Return `BLOCKED`; do not resolve a conflict by
  rewriting requirements or architecture.

