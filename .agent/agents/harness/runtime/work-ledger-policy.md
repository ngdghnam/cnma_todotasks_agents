# Atomic work-ledger policy

Before the first mutating iteration, the runtime converts the supplied plan
into an atomic work inventory. Each ledger item represents exactly one
implementable plan item or one explicitly declared no-change verification.

The runtime must not group ranges such as `BE-1..4` or `FE-1..7` into a
single completion item. It may record a `parent_id` only for reporting; each
child remains independently accountable.

Every source work item must be one of:

- `pending`, `in-progress`, `completed`, `excluded`, or `blocked`;
- accompanied by a source reference and completion/exclusion evidence;
- included in the final inventory-completeness check.

`No change` is an explicit work item: verify the existing behavior, attach
evidence, and mark it `completed`. It is never reported as pending work.

The agent selects the next incomplete item in dependency order. It cannot end
an invocation merely because one convenient technical slice is complete.

The runtime computes `work_item_inventory_complete` by reconciling the source
plan inventory with the ledger. Any unaccounted source item prevents
`COMPLETED` and `COMPLETED_WITH_WARNINGS`.

