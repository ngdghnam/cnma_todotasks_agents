---
name: resolve-implementation-context
title: Resolve implementation context
kind: governance-procedure          # terse by design; teaches by constraint, not example
used_by: Atlas (cap-solution)
modes: [plan]                       # context-assembly pre-step within plan
invocation: runtime-composed        # prompt-assembly.md layer 5, referenced by manifest path
disable-model-invocation: true      # prompt component, NOT a Skill-tool skill
consumes:                           # injected fresh at runtime; never hard-coded in this file
  - AGENTS.md and the governance sources it names
  - live feature-implementations.yml record, frozen spec, BA-to-DEV handoff, EP, linked stories
  - current repository diff and impacted-code scope
produces:
  - a cited, least-context package validated against .agent/agents/harness/schemas/execution-context.schema.json
completion_contract: none           # context assembly, not a state completion (see note)
pairs_with: .agent/agents/harness/skills/cap-solution-alignment.md
boundary: >-
  Context assembly only. Never creates a state transition, implementation
  evidence, or a new requirement. Hands its package to cap-solution-alignment.
---

# Skill: resolve implementation context

## Purpose

Build the smallest auditable context package needed for one implementation
record without asking an agent to rediscover the whole project.

## Procedure

1. Read the session and governance sources required by `AGENTS.md`.
2. Read the live `feature-implementations.yml` record and confirm the target
   `IMPL-*`, Sprint, current DEV status, baseline version, and evidence refs.
3. Resolve its frozen functional spec, BA-to-DEV handoff, EP, linked stories,
   relevant requirements/design, and impacted-code scope.
4. Inspect the current diff before any code is changed. Preserve unrelated
   work; include it as an exclusion or blocker when it overlaps the target.
5. Assemble the context using the execution-context schema. Cite source
   paths/sections, declare open questions, and set an explicit allow-list.

> Note: in the human-gated pilot the deterministic `prepare` gate
> (`.agent/agents/harness/runtime/pilot-runtime.md`) is the producer that materializes
> `context.json`. This skill governs the reconciliation that package must
> satisfy — correct target, matching baseline, honest allow-list, cited
> sources — so the produced context is trustworthy, not the file write itself.

## Stop rules

Return `BLOCKED` if the target is absent, the frozen baseline/handoff does
not match the record, an entry condition is unmet, required sources conflict,
or the existing diff prevents safe scoped work.

## Output

The output is context assembly only. It must not create a state transition,
implementation evidence, or a new requirement.

## Citation example

Good — every relied-upon fact is locatable and version-pinned (illustrative):

```yaml
source_refs:
  - docs/04-delivery/functional-specs/baselines/<SPEC-ID>-v<version>.md §4.2 (behavior rules)
  - docs/04-delivery/track-handoffs/ba-to-dev/<HANDOFF-ID>.yml (accepted scope)
open_questions:
  - "The execution plan names destination '<DESTINATION>' but no binding is present in the repository — confirm before plan."
allow_list: [srv/<service>.*, app/<module>/services/<client>.ts]
```

Thin — rejected, because nothing can be audited or reproduced:

```text
"read the requirements and the plan; scope looks clear"
```

## References

- Context/memory contract: `.agent/agents/harness/shared/execution-context-contract.md`
- Context schema this package validates against: `.agent/agents/harness/schemas/execution-context.schema.json`
- Paired skill (runs next): `.agent/agents/harness/skills/cap-solution-alignment.md`
- Prepare gate that materializes the package: `.agent/agents/harness/runtime/pilot-runtime.md`



