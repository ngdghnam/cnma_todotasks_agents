# Todo AI Agent — Realtime Communication V1.0

## 1. Purpose

This document defines how clients communicate with the Todo AI Agent while
Agent work is running in the background.

The Agent runtime is **continuous**: one user action (for example creating a
Goal) starts work that keeps running long after the HTTP response was sent —
Goal analysis, planning, review loops, parallel Task execution and context
synchronization.

The user must be able to **see that process while it happens**, not only its
final result.

This document is aligned with:

- Todo AI Agent — Business Requirements & Business Logic V1.0
- Todo AI Agent — Agent Architecture & Database Design V3.0
- Todo AI Agent — Backend Structure V1.0

---

## 2. Two Directions of Communication

Communication is separated into two directions with different needs.

```text
            COMMANDS (client -> server)
   ┌──────────────────────────────────────────┐
   │ create Goal, approve Plan, request        │
   │ changes, retry Task, cancel Goal, ...     │
   │                                           │
   │ happen once, on a user action             │
   └──────────────────────────────────────────┘

            PROGRESS (server -> client)
   ┌──────────────────────────────────────────┐
   │ run started, review rejected, Task        │
   │ completed, context revision changed, ...  │
   │                                           │
   │ happen many times, on their own,          │
   │ while Agents work in the background       │
   └──────────────────────────────────────────┘
```

The principle is:

> **Commands and progress are separate concerns. Each direction uses the transport that fits it.**

---

## 3. Transport Options

| Transport | Direction | How it works | Fits |
|---|---|---|---|
| **REST** | client → server | One request, one response | Commands |
| **Polling (REST)** | server → client (pulled) | Client repeatedly asks for current state | Simple checks, testing |
| **SSE (Server-Sent Events)** | server → client (pushed) | One long-lived HTTP response; the server writes events into it | Watching a running process |
| **WebSocket** | both directions | One persistent connection; both sides send at any time | Interactive, two-way, realtime collaboration |

---

## 4. Baseline Decision (Current)

```text
Commands  ── REST (OData actions on TODO_SERVICE) ──►  server
Progress  ◄── SSE (one event stream per Goal) ──────  server
Testing   ── REST polling of Goals / Plans / AgentRuns / GoalContexts
```

### 4.1 Commands stay REST

All commands already exist as OData actions:

```text
POST   /Goals
POST   /Goals(<id>)/generatePlan
POST   /Goals(<id>)/cancel
POST   /Plans(<id>)/approve
POST   /Plans(<id>)/requestChanges
POST   /Tasks(<id>)/retry
GET    /Goals(<id>)/downloadArtifacts()
```

They are short, stateless and naturally request/response.

### 4.2 Progress uses SSE

In the current baseline the client only **listens** while Agents work.
It never needs to send messages through the live channel, because every
user intervention is already a REST command.

A one-way server → client stream is therefore sufficient, and SSE provides
exactly that over plain HTTP:

- no extra protocol or connection state machine;
- automatic reconnect built into browsers (`EventSource`);
- works with the existing CAP server and authentication;
- easy to inspect with `curl -N` or a browser.

### 4.3 Polling remains valid

Polling the existing entities requires no new code and is the expected way
to test with Postman before the event stream exists.

---

## 5. Future Direction: WebSocket

The Goal is a living product that will continue to evolve. WebSocket is
**planned**, but only introduced when a concrete requirement needs two-way,
low-latency communication on the same channel.

### 5.1 When WebSocket becomes necessary

WebSocket should be introduced when one or more of these requirements appears:

1. **Conversational Agents** — the user chats with an Agent while it runs
   (questions, clarifications, streaming answers token by token).
2. **Human-in-the-loop during a run** — an Agent pauses (`AgentRuns.status = WAITING`)
   and asks the user a question; the user answers in the same live channel.
3. **Live steering** — the user adjusts work while it executes
   (e.g. "skip this task", "use library X instead") without a separate request cycle.
4. **Multi-user collaboration** — several users watch and act on the same Goal
   at the same time and must see each other's actions immediately.
5. **High-frequency bidirectional traffic** — where opening a REST request per
   message becomes the bottleneck.

Until one of these exists, WebSocket adds connection management, reconnect
handling and scaling concerns without solving a concrete problem.

### 5.2 How WebSocket fits without a rewrite

The key design rule that makes the migration cheap:

> **The Agent runtime publishes events to an internal event stream. It never writes to a transport directly.**

```text
                    Agent runtime
     (orchestrator / agent / context services)
                         │
                         │ publish(event)
                         ▼
               Internal event stream
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
     SSE adapter (now)       WebSocket adapter (future)
            │                         │
            ▼                         ▼
     server -> client           server <-> client
```

- The **event model** (which events exist and their payload) is defined once
  and shared by every transport.
- Adding WebSocket means adding one **adapter** that forwards the same events,
  plus handling the new **client → server messages**.
- Client → server WebSocket messages must enter the system through the **same
  business services** as the REST commands (`services/`), so business rules
  stay in one place.
- REST commands remain available; WebSocket does not replace them.

### 5.3 SAP CAP options

When WebSocket is introduced, the preferred evaluation order is:

1. A CAP community WebSocket plugin (e.g. `@cap-js-community/websocket`),
   so WebSocket events are declared in CDS and authenticated like the service.
2. A custom WebSocket server attached to the CAP HTTP server
   (only if the plugin cannot satisfy a concrete requirement).

The choice is made when the requirement appears, not in advance.

### 5.4 Concerns to design at that time

- Authentication and authorization of the socket (same user as REST).
- Subscription scope: a client only receives events of Goals it may access.
- Reconnect and missed events (replay from a last known event / context revision).
- Horizontal scaling: multiple server instances need a shared event channel.
- Back-pressure for streamed model output.

---

## 6. Event Stream

The event stream is the shared foundation for SSE now and WebSocket later.

### 6.1 What an event is

An event is a short message saying **"something just happened"**, emitted at
the moment it happens.

```text
Database state   = where things are now      (Task #3 is COMPLETED)
Event            = the change that got there (Task #3 IN_PROGRESS -> COMPLETED,
                                               context r11 -> r12)
```

State shows the result; the ordered events show **how** the result was
reached — the agentic loop itself.

### 6.2 Granularity

Events are **fine-grained**: every Agent run, tool call, review decision,
context revision and task transition is an event, not only business
milestones. The backend publishes everything; the UI decides how to present
it (timeline, tree, filters).

### 6.3 Envelope

Every event has the same outer structure; only `data` differs per type.

```json
{
  "id": "e7f1…",
  "seq": 42,
  "type": "review.decided",
  "at": "2026-10-06T10:15:03.120Z",

  "goalId": "c937…",
  "contextRevision": 5,

  "runId": "a12b…",
  "parentRunId": "9f3c…",
  "rootRunId": "77de…",
  "taskId": "41aa…",

  "data": { "decision": "REJECT", "feedback": "…", "attempt": 1 }
}
```

| Field | Purpose |
|---|---|
| `id` | Unique event identity (de-duplication) |
| `seq` | Per-Goal, gap-free, increasing order; replay bookmark |
| `type` | `<area>.<action>`, e.g. `run.started`, `task.completed` |
| `at` | Time of occurrence |
| `goalId` | Stream the event belongs to |
| `contextRevision` | GoalContext revision at that moment |
| `runId` / `parentRunId` / `rootRunId` | Agent hierarchy, so the UI can render a tree |
| `taskId` | Groups events of parallel tasks |
| `data` | Type-specific payload |

**Rule — events are self-describing:** `data` carries enough to display the
event (agent code, task title, feedback, …) without another API call.

### 6.4 Persistence: `GoalEvents`

Events are stored, so a UI opened late can show the complete history.

New entity `GoalEvents` in `db/agents.cds` (runtime & audit area, next to
`AgentRuns` / `ToolExecutions`), one row per event, mirroring the envelope.

Justification: no existing entity can answer *"what happened, in what
order?"* — `AgentRuns` have no intermediate moments and `GoalContexts` keep
only the latest picture.

- **Append-only:** rows are inserted, never updated or deleted.
- **Ordering guarantee:** unique constraint on `(goal, seq)`.
- Placed in `agents.cds` so the dependency stays one-way
  (`agents.cds` → `schema.cds`).

### 6.5 Store first, then push

```text
something happens
      │
      ▼
1. INSERT GoalEvents  (seq = 42)
      │
      ▼
2. push event 42 to live listeners (SSE / WebSocket)
```

Because every live event is stored first, the database is always complete.
A client therefore connects without gaps:

```text
UI opens
  ├─ 1. load history          -> events 1 … 41
  └─ 2. open live stream "after 41" -> 42, 43, 44 … live
```

### 6.6 To be defined

- Event catalog: every event type and its `data`.
- How `seq` is assigned safely when parallel workers emit at the same time.
- Live stream endpoint (SSE) and its replay parameter.

---

## 7. Decisions Summary

1. Commands use REST (existing OData actions).
2. Progress is pushed with SSE, one stream per Goal.
3. Polling the existing entities remains valid for testing.
4. WebSocket is the planned future transport, introduced only when a two-way
   requirement (Section 5.1) becomes concrete.
5. The runtime publishes to an internal event stream and never depends on a
   specific transport.
6. Client → server live messages, when they exist, go through the same
   business services as REST commands.

---

## 8. Document Status

**Version:** 1.0  
**Status:** Draft — transport, envelope and persistence decided; event catalog to be defined  
**Aligned Database:** Todo AI Agent — Agent Architecture & Database Design V3.0
