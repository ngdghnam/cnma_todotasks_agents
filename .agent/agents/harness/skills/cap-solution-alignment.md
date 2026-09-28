---
name: cap-solution-alignment
title: CAP solution alignment
kind: governance-procedure          # terse by design; teaches by constraint, not example
used_by: Atlas (cap-solution)
modes: [plan]
invocation: runtime-composed        # prompt-assembly.md layer 5, referenced by manifest path
disable-model-invocation: true      # prompt component, NOT a Skill-tool skill
consumes:                           # injected fresh at runtime; never hard-coded in this file
  - the resolved context package (see resolve-implementation-context)
  - frozen baseline, governed handoff, EP, current repository source and diff
produces:
  - impacted paths, behavior mapping, data/API/security + integration impact
  - implementation sequence, minimal allow-list, required validation, risks, blockers
  - agent result -> .agent/agents/harness/schemas/agent-result.schema.json
completion_contract:
  plan: .agent/agents/harness/contracts/states/plan-completion.yml
pairs_with: .agent/agents/harness/skills/resolve-implementation-context.md
boundary: >-
  Verifies an already-assembled context is implementable without widening scope.
  Assembling that context is resolve-implementation-context's job; this skill
  does not gather sources, edit code, or apply a transition.
---

# Skill: CAP solution alignment

## Purpose

Check that a planned CAP/BTP change can be implemented against the frozen
baseline and current repository without widening scope.

## Relationship to `resolve-implementation-context`

Both skills load in Atlas's `plan` mode and are complementary, not redundant:

| | resolve-implementation-context | cap-solution-alignment (this) |
| --- | --- | --- |
| Question | *"What is the smallest auditable context for this record?"* | *"Can this context be built as planned without widening scope?"* |
| Motion | Gather + cite sources | Map + verify + sequence |
| Output | Context package (execution-context schema) | Impact map, sequence, allow-list, validation |

Run resolution first; alignment consumes its output. If the context is
incomplete or conflicting, return `BLOCKED` rather than inventing the gap.

## Checks

1. Map each accepted behavior to the appropriate CDS model, service
projection/action, handler/domain helper, UI service/client, and tests.
2. Classify every touched data object as persistence, read view, service
projection, external model, or UI payload. Flag an invalid read/write path.
3. Identify changes to API/action signatures, authorization, integration,
configuration, schema/deployment compatibility, and downstream EPs.
4. Confirm the execution plan's file targets and validation list still match
the repository. Record drift as a deviation or `BLOCKED`, never silently
rewrite the baseline.
5. Produce an implementation sequence with a minimal file allow-list and
explicit evidence expectations.

## Output fields

`impacted_paths`, `behavior_mapping`, `data_api_security_impact`,
`integration_impact`, `risks`, `required_validation`, `source_refs`, and
`blockers`.

## Done when

Terminate `COMPLETED` only when every check in `plan-completion.yml` is
evidenced: PLAN-CONTEXT, PLAN-SCOPE, PLAN-WORK, PLAN-VALIDATION, PLAN-CONFLICT.
Do not infer completion from a polished plan narrative.

## Mapping example

Good — one behavior traced to concrete, buildable targets (illustrative):

```yaml
behavior: "A user submits a scoped business item"
cds: srv/<service>.cds (action submitItem)
handler: srv/<service>.js:onSubmitItem
authorization: '@requires: <role>' on the action, enforced server-side
ui: app/<module>/services/<client>.ts
tests: [positive submit, unauthorized role, invalid input]
source_ref: baseline v<version> §4.2 / <EXEC-PLAN-ID> WBS-3
```

Thin — rejected, because it is not implementable or traceable:

```text
"add submit support to the service and wire up the UI"
```

## References

- Domain rules: `.agent/agents/harness/shared/cap-btp-mindset.md`
- Context contract: `.agent/agents/harness/shared/execution-context-contract.md`
- Paired skill: `.agent/agents/harness/skills/resolve-implementation-context.md`
- Completion checks: `.agent/agents/harness/contracts/states/plan-completion.yml`
- Quality bar this skill is scored against: `.agent/agents/harness/evals/atlas.eval.yml`



