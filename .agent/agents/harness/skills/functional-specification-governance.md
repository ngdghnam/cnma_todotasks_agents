# Functional specification governance

Work in `docs/04-delivery/functional-specs/active/**` only when the execution
context grants it. Keep a functional specification traceable to requirements
and user stories, with clear scope/exclusions, testable acceptance criteria,
open questions, and version-relevant decisions.

Frozen baselines and official BA→DEV handoffs are governed boundary artifacts.
Prepare their evidence but never create or overwrite them during agent work.
The existing `freeze-functional-baseline` and `create-track-handoff` commands,
followed by transition confirmation, own those side effects.

