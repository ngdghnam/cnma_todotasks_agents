---
name: cap-implementation
title: CAP implementation
kind: governance-procedure          # terse by design; teaches by constraint, not example
used_by: Forge (cap-implementation)
modes: [implement, self-review, unit-test]
invocation: runtime-composed        # prompt-assembly.md layer 5, referenced by manifest path
disable-model-invocation: true      # prompt component, NOT a Skill-tool skill
consumes:                           # injected fresh at runtime; never hard-coded in this file
  - execution context (write allow-list, atomic work ledger, baseline/handoff/EP refs, current diff)
  - project validation commands and established CAP/BTP + React patterns
produces:
  - scoped code and focused tests
  - implementation notes (real decisions, deviations, failures, evidence)
  - agent result -> .agent/agents/harness/schemas/agent-result.schema.json
completion_contract:
  implement: .agent/agents/harness/contracts/states/implement-completion.yml
  self-review: .agent/agents/harness/contracts/states/self-review-completion.yml
  unit-test: .agent/agents/harness/contracts/states/unit-test-completion.yml
boundary: >-
  Executes an already-approved, scoped plan. Does not redefine requirements or
  architecture, certify business acceptance, or apply a Harness transition.
---

# Skill: CAP implementation

## Purpose

Implement one approved CAP/BTP slice with tests and factual technical
evidence. Project facts (commands, patterns, file targets) come from the
runtime execution context, never from this file.

## CAP technical guidance

When the implementation touches CAP CDS models, service definitions,
annotations, handlers, runtime behavior, remote services, value help, or CAP
validation commands, load and follow the project-local `cap-developer` skill:

`C:\Users\ThinkPad\proconarum\cnma_prosourcing\.agents\skills\cap-developer\SKILL.md`

Use its runtime-specific references only when relevant:

- Node.js: `.agent/agents/harness/skills/cap-developer/references/nodejs.md`
- Java: `.agent/agents/harness/skills/cap-developer/references/java.md`

Authority order:

1. Harness execution context, frozen baseline, BA->DEV handoff, active EP,
   allow-list, and completion contract control project scope and evidence.
2. `cap-developer` controls CAP technical idioms and current CAP best
   practices.
3. If scope/evidence constraints and CAP technical guidance appear to
   conflict, stop, record the conflict in implementation notes, and return a
   blocker instead of silently choosing one.

Do not copy CAP reference guidance into this file. `cap-developer` is the
vendor-supported technical source and should be consumed by reference to avoid
drift.

## Procedure

1. Re-read the frozen baseline, execution plan, governed prior output, current
   diff, and source files targeted by the allow-list.
2. Select the next incomplete item from the execution ledger and make the
   smallest coherent change. For a model/API change, preserve the
   designed separation between persistence entities, read views, service
   projections, and explicit actions.
3. Add or update focused tests before relying on a broad suite. Test failure
   and authorization paths when the slice changes them.
4. Validate the changed layer using commands declared by the current project
   and execution plan. Use only commands applicable to the changed scope and
   record their exact working directory, exit status, and relevant output.
5. Attach evidence and update the progress signature after every iteration.
   If the signature does not change, increment the no-progress counter.
6. Compare `git diff` with the allow-list. Update the required live
   implementation notes with real decisions/deviations/evidence, evaluate the
   state completion contract, then emit the structured result.

## CAP/BTP guardrails

- Enforce authorization in service/action code; UI is not the enforcement
  point.
- Use the approved project command/action model for state-changing behavior.
- Do not replace remote-value-help behavior with invented local production
  data. Respect the EP's temporary/local versus external boundary.
- Keep external calls configurable and fail visibly with the designed error
  mapping.
- Do not add a generic repository/service framework merely because a reusable
  kit contains one. Follow the current project's approved patterns first.

## Done when (per mode)

Terminate `COMPLETED` only when the active mode's completion contract is fully
evidenced — never from a polished narrative alone:

- `implement` — IMPL-WORK, IMPL-AC, IMPL-TESTS, IMPL-VALIDATION, IMPL-SCOPE,
  IMPL-NOTES, IMPL-BLOCKERS.
- `self-review` — REVIEW-DIFF, REVIEW-FINDINGS, REVIEW-QUALITY, REVIEW-EVIDENCE.
- `unit-test` — TEST-SCOPE, TEST-EXECUTION, TEST-RESULT, TEST-TRACE.

A no-progress signature repeated past the manifest limit is `BLOCKED`; a failed
or missing required test is a blocker, not a warning.

## Evidence example

Good — reproducible, recorded in the result `validation[]` (illustrative):

```yaml
command: npm test -w app/<module> -- <focused-test-selector>
working_directory: app/<module>
outcome: passed
evidence_path: .harness/executions/<id>/evidence/rfq-tests.txt
```

Thin — rejected, because it is not reproducible and proves nothing:

```text
"ran the tests and they pass"
```

## References

- CAP technical base: `.agent/agents/harness/skills/cap-developer/SKILL.md`
- Domain rules: `.agent/agents/harness/shared/cap-btp-mindset.md`
- Memory/result contract: `.agent/agents/harness/shared/execution-context-contract.md`
- Result shape: `.agent/agents/harness/schemas/agent-result.schema.json`
- Completion checks: `.agent/agents/harness/contracts/states/{implement,self-review,unit-test}-completion.yml`
- Quality bar this skill is scored against: `.agent/agents/harness/evals/forge.eval.yml`



