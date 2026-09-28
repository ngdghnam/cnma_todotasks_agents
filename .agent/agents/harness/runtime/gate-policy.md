# Agent result and carry-forward policy

An agent result ends one invocation; it never applies project lifecycle state.

| Result | Runtime treatment |
| --- | --- |
| `COMPLETED` | Validate completion ledger and make evidence available to the existing Harness gate. |
| `COMPLETED_WITH_WARNINGS` | Stop at warning disposition; do not advance automatically. |
| `PAUSED` | Preserve the atomic ledger and continuation handoff; resume only with the recorded preconditions or explicit user direction. |
| `BLOCKED` | Preserve evidence and request the governed decision/input that is missing. |
| `FAILED` | Retry only a permitted transient failure; otherwise preserve failure evidence and stop. |

Warnings affecting accepted behavior, required tests, security, baseline,
architecture, data compatibility, or a required gate are blocking. Other
warnings require an owner, rationale, and follow-up reference before the
Harness may accept them.

`COMPLETED_WITH_WARNINGS` is valid only after every atomic work item and
required completion check passes. Incomplete approved work is not a warning.

Verity's `COMPLETED` result is independent QA evidence. It is carried forward
to the Developer-owned `verify -> ready-for-delivery` proposal process. Verity
does not make that proposal or confirmation. The existing Harness role,
evidence, checklist, and confirmation rules remain authoritative.

