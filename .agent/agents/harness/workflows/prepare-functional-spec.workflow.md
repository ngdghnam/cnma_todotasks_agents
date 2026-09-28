# Workflow: prepare-functional-spec

## Purpose

Route one live feature-implementation BA state to Clarity (`cap-business-analysis`).
The workflow resolves project truth at runtime; it never embeds feature details
inside the agent definition and never changes lifecycle state automatically.

## Routing

`run-agent-state <IMPL-ID>` performs safe route selection. If BA is the only
eligible active route, it selects this workflow automatically. If BA and DEV
are both eligible, the runtime stops and asks the human to choose a track.

| Live BA state | Agent | Purpose |
| --- | --- | --- |
| `not-started` | none | Await governed BA intake entry |
| `intake` | Clarity | Capture functional intake and material questions |
| `clarify` | Clarity | Resolve or govern functional clarifications |
| `draft` | Clarity | Produce a reviewable active functional specification |
| `reviewed` | Clarity | Reconcile review evidence and prepare baseline/handoff inputs |
| `ready-for-build` | none | Await governed DEV planning entry |
| `rework` | Clarity | Bound approved rework before returning to clarification |

## Boundary rules

The runtime supplies current requirements, stories, decisions, active
functional specification, BA state, and project permissions. Clarity may edit
only allowed active-spec material. Frozen baselines, official BA→DEV handoffs,
and lifecycle transitions remain protected, human-governed operations.

The execution follows the same human dispatch, runtime-owned loop ledger,
finalize, end-session, and close-session protocol as `implement-feature`.
Only a closed execution may support a transition proposal; the runtime only
references the appropriate transition ID and never applies it.

