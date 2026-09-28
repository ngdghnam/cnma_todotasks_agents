# Runtime side-effect policy

Effective permissions are the intersection of the agent manifest,
project-owned runtime policy, project binding, live-state policy, and execution
context. A project binding may narrow but never broaden a manifest permission.

Classify filesystem writes before invocation:

- `project-source`: source, tests, approved configuration, and explicitly
  permitted project documentation;
- `generated`: build output, coverage, caches, generated metadata, and other
  reproducible validation side effects;
- `execution-memory`: only the current
  `.harness/executions/<execution-id>/**` workspace;
- `protected`: agent kit, frozen baselines, governed lifecycle/approval data,
  secrets, and every path outside the effective allow-list.

`read-only-project-with-validation` denies project-source mutation but may
allow declared generated writes and execution-memory writes. Generated output
must be separated from source changes during final scope review.

In `manual-audited` mode, the operator checks transcript/events and live diff
for violations. In `enforced` mode, the runtime must deny and emit
`permission.denied` before the write.

