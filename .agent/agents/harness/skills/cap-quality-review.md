---
name: cap-quality-review
title: CAP quality review
kind: governance-procedure          # terse by design; teaches by constraint, not example
used_by: Verity (cap-quality)
modes: [verify]
invocation: runtime-composed        # prompt-assembly.md layer 5, referenced by manifest path
disable-model-invocation: true      # prompt component, NOT a Skill-tool skill
consumes:                           # injected fresh at runtime; never hard-coded in this file
  - execution context (live diff, effective scope, implementation result, review ledger)
  - baseline acceptance criteria and the project validation commands
produces:
  - classified findings (blocking / warning / note) with location, evidence, risk, action
  - agent result -> .agent/agents/harness/schemas/agent-result.schema.json
completion_contract:
  verify: .agent/agents/harness/contracts/states/verify-completion.yml
boundary: >-
  Independent read-only review. Does not edit source, self-approve an
  implementation, call Forge directly, or apply a Harness transition. COMPLETED
  means no blocking technical finding remains, not feature acceptance.
---

# Skill: CAP quality review

## Purpose

Perform a concise independent review of one CAP/BTP implementation using live
diffs and command evidence. This keeps the useful four-eyes principle without
requiring a large scorecard or a separate handoff for each review lens.

## Procedure

1. Verify the actual changed files match the implementation result and
   execution allow-list.
2. Trace each changed behavior to a frozen-baseline requirement and test.
3. Review CAP modeling, service/action semantics, transaction boundaries,
   authorization, validation, error handling, and integration behavior where
   touched.
4. For React changes, inspect type and prop contracts, use of existing
   `@cnma/react-ui` components, i18n/accessibility, and the actual typecheck
   result. Do not assume a Vite build typechecks.
5. Re-run or independently inspect proportionate evidence. Report exact
   command failures and untested failure modes.
6. Classify findings:
   - `blocking`: unsafe, out of scope, violates a baseline, or lacks required
     evidence;
   - `warning`: material follow-up the gate may explicitly accept;
   - `note`: non-blocking observation.

## Output

Return concise finding objects with location, evidence, risk, and required
next action. Do not modify the code under review.

## Done when

Terminate `COMPLETED` only when every check in `verify-completion.yml` is
evidenced and no blocking finding remains open: VERIFY-SCOPE, VERIFY-TRACE,
VERIFY-CAP, VERIFY-EVIDENCE, VERIFY-FINDINGS. An unreviewed required surface
cannot be treated as implicitly passing. A blocking finding returns work to the
Harness; it is never resolved by editing the code yourself.

## Finding example

Good — actionable, maps to the result `findings[]` shape (illustrative):

```yaml
severity: blocking
location: srv/rfq-service.js:118 (onCreate handler)
description: Quantity is validated in the React form but not in the service action.
evidence: POST with { qty: -5 } persisted; see evidence/neg-qty.txt
next_action: Enforce qty > 0 at the action boundary and add a negative-path test.
```

Thin — rejected, because it is not locatable, evidenced, or actionable:

```text
"validation looks a bit weak, might want to check it"
```

## References

- Domain rules: `.agent/agents/harness/shared/cap-btp-mindset.md`
- Memory/result contract: `.agent/agents/harness/shared/execution-context-contract.md`
- Result shape (see `findings[]`): `.agent/agents/harness/schemas/agent-result.schema.json`
- Completion checks: `.agent/agents/harness/contracts/states/verify-completion.yml`
- Quality bar this skill is scored against: `.agent/agents/harness/evals/verity.eval.yml`

