# Todo AI Agent (SAP CAP)

Turn a goal ("Generate a full-stack todo with SAP CAP and React") into a reviewed
plan, let you approve it, execute the tasks with agents, and download the result
as a zip. Built to learn the agentic loop: context management, spawning,
review/retry, stale-context detection and process control.

Design baselines live in `docs/`.

## Run

```bash
npm install
npm run deploy:sqlite   # (re)creates db.sqlite from db/ — wipes existing data
npm run watch           # cds-tsx watch, http://localhost:4004
```

Mocked auth: use user `alice` (no password). `alice` is seeded with coding
preferences in `db/data/cnma.todotasks-Users.csv`.

The seeded model configuration uses the deterministic **MOCK** provider
(`srv/agents/providers/mock.provider.ts`). To use a real model, add a provider
in `srv/agents/providers/`, register it in `srv/agents/provider.service.ts`
and point `ModelConfigurations.provider` at it.

## Flow (OData, `/todo-service`)

| Step | Call |
|---|---|
| Create goal → analysis + plan + review start automatically | `POST /Goals { "title": "..." }` |
| Watch progress | `GET /Plans?$filter=goal_ID eq <id>&$expand=tasks`, `GET /GoalContexts`, `GET /AgentRuns` |
| Approve the PROPOSED plan → tasks execute | `POST /Plans(<id>)/approve` |
| …or ask for changes → Planner revises | `POST /Plans(<id>)/requestChanges { "feedback": "..." }` |
| Retry a BLOCKED task | `POST /Tasks(<id>)/retry` |
| Stop all agent work | `POST /Goals(<id>)/cancel` |
| Download accepted files | `GET /Goals(<id>)/downloadArtifacts()` |

Settings (`package.json` → `cds.todoAgents`): `maxReviewAttempts`, `maxParallelTasks`.

## Where things are

```
srv/handlers/   thin CAP boundary (actions, after-commit triggers)
srv/services/   business logic: goals, plans, tasks, conversation
srv/agents/
  orchestrator.service.ts   what happens next (planning pipeline, scheduler, cancel, recovery)
  context.service.ts        Context Manager: GoalContext sync, ContextPackage selection, past work
  agent.service.ts          generic runAgent() loop: model -> tools -> model, run audit, abort
  tool.service.ts + tools/  permitted, audited read-only tools
  provider.service.ts       model provider resolution
```
