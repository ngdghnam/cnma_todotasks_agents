# Prompt assembly contract

`run-agent-state` is a routing key, not the complete instruction supplied to a
worker. The runtime compiles an execution package for one agent and one live state in this strict
precedence order:

1. system and safety rules;
2. project governance (`AGENTS.md`, role, gate, transition, quality rules);
3. selected agent instructions and manifest;
4. shared domain mindset and context contract;
5. skill(s) selected for the live mode;
6. least-context project execution package;
7. loop policy, atomic work-ledger policy, and state completion contract;
8. effective permissions and side-effect policy;
9. summary and evaluation policy;
10. structured output contract.

Higher layers cannot be weakened by lower layers. A conflict is recorded and
returns `BLOCKED`; the runtime does not silently choose a convenient source.

Before invocation, persist `prompt-manifest.json` with references and SHA-256
digests for every compiled component. Do not store secrets, credentials, raw
tokens, or private reasoning. The manifest must be sufficient to reproduce
which instructions and context versions were used.

The execution context contains project facts. Agent instructions and shared
skills contain only reusable behavior and domain knowledge.

For a `clean-replay`, previous execution artifacts may be supplied only as
evaluation input. They cannot count as work completion evidence, replace the
live repository inspection, or shrink the current work inventory.

