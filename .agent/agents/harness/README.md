# Harness agents

This package contains reusable, model-neutral worker definitions for the
workflow-first Harness. It contains no project state, Sprint, feature,
implementation, execution, baseline, handoff, or session data.

Projects keep truth in `docs/`, source code, and `.harness/`. The project
binding chooses a named agent for the live state; the human-gated runtime
assembles fresh context and records the work.

## Agents

| Display name | Stable ID | Role |
| --- | --- | --- |
| Clarity | `cap-business-analysis` | Functional analysis |
| Atlas | `cap-solution` | CAP/BTP solution planning |
| Forge | `cap-implementation` | Scoped implementation |
| Verity | `cap-quality` | Independent verification |

Stable IDs are used in bindings and audit records. Display names are only
human-facing and may change without breaking a project route.
