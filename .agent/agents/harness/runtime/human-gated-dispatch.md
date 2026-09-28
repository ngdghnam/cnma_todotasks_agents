# Human-gated dispatch contract

## Purpose

This pilot deliberately separates workflow routing from the environment in
which an AI session happens. The Harness resolves the required agent from live
project state. A human then opens any suitable AI session and routes the
prepared package to that agent.

Neither a provider name, model name, IDE, API, nor chat-session identifier is
part of workflow state, agent identity, project memory, or a completion gate.

## Protocol

1. The Harness resolves eligible BA and DEV routes from live project state. If
   exactly one route is eligible, it selects that stable agent ID automatically.
   If no route is eligible it reports the governing boundary; if multiple routes
   are eligible it stops and asks the human to choose a track. It then creates
   an execution package with status `awaiting-human-dispatch`.
2. The human starts a fresh session and supplies the generated `dispatch.md`.
3. The worker reads the project-owned context, verifies its stable agent ID,
   then runs `acknowledge` and `start`.
4. The worker follows its loop, records evidence, and submits a result.
5. The runtime finalizes only an acknowledged, started execution, then marks
   it `awaiting-session-close`.
6. The worker completes the normal project-control `end-session` work and
   runs `close-session`; both the progress log and latest-session handoff must
   cite the execution ID before the result can return to a project gate.
   Existing project gates retain lifecycle authority.

## Boundaries

- A human routing decision is not approval of technical content or a lifecycle
  transition.
- `awaiting-human-dispatch` means no agent work is evidenced yet.
- A session may be replaced at any time. The replacement reads the same
  execution package and continues only from persisted project artifacts.
- Observing an external host or model is out of scope for this pilot and must
  never affect agent selection, permissions, completion, or transitions.
- `--track ba|dev` is an ambiguity resolver, not normal user knowledge. A
  track-free `run-agent-state <IMPL-ID>` is the preferred entry point.

