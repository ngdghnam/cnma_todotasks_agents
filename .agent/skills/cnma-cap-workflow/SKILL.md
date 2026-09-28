---
name: cnma-cap-workflow
description: Consume the internal @cnma/cap-workflow package in a SAP CAP host app — a DAG-based, domain-agnostic multi-step approval engine. Covers the template/runtime CDS models, the WorkflowService actions (start/approve/reject/reassign/cancel/rerun/remind), the workflow.statusChanged event to sync host status, WorkflowEngine/ApprovalHandler/DAGValidator/PrincipalResolver backend classes, the React ProcessFlow/ApprovalPanel/WorkflowManager components, and AUTO_COMPLETE auto-posting. Use when any object needs configurable approval workflows.
---

# @cnma/cap-workflow Skill

**Package:** `@cnma/cap-workflow` · **Verified against:** v1.7.5 source (`dist/`, `db/`, `srv/`, `docs/`).

A reusable, **DAG-based** approval engine that works with **any** CDS entity via `referenceType + referenceId`. Two CDS namespaces: template layer `cnma.workflow` (5 entities) and runtime `cnma.workflow.runtime` (4 entities). Admins configure workflows/steps/approver-chains; the engine executes them transactionally.

## When to Use

- Any domain object needs multi-step, multi-approver sign-off (invoices, requests, POs…).
- Approval routing must be configurable per object type / org value (not hardcoded).
- You need parallel/sequential steps with dependencies (fan-out / fan-in) → DAG.
- Host status must react to workflow progress → subscribe to `workflow.statusChanged`.
- You want ready-made approval UI → `ProcessFlow` / `ApprovalPanel` / `WorkflowManager`.
- You want documents to auto-post to S/4 on final approval → `completionPolicy = 'AUTO_COMPLETE'` (see below).

## Core Concepts (must understand before wiring)

- **Template vs runtime**: admins define `WorkflowDefinition` → `WorkflowStepDefinition` → `DefaultStepApprover`, connected by `StepDependency` edges. At start, the engine instantiates `WorkflowInstance` → `StepInstance` → `ApprovalTask` + `WorkflowHistory`.
- **Execution order = the DAG** (`StepDependency`), NOT `displayOrder` (that is UI-only). No edges → falls back to sequential-by-`displayOrder`.
- **3 rejection modes** (`WorkflowDefinition.rejectionMode`): `BACK_TO_RESPONSIBLE` (default — cancel active steps, workflow→REJECTED, responsible re-submits), `RESTART_STEP` (only rejected step re-opens, workflow stays ACTIVE), `NEW_RUN` (close instance, `rerunWorkflow` starts a fresh run).
- **4-eyes** (`enforceFourEyes`, default true): submitter / any prior decider gets 403 on approve/reassign.
- **Transactional (T2/T7)**: engine never opens sub-transactions; approve/reject and the `statusChanged` handler all run on the caller's implicit CAP tx — atomic. Dual locking: optimistic `@odata.etag` on `modifiedAt` + pessimistic `forUpdate()` in `ApprovalHandler`.

## ⚠️ Reality Check (source-verified)

1. **`@cnma/cap-identity` is a hard requirement despite being an "optional" peer** — the CDS models `using` `@cnma/cap-identity/db/common` (`managedWithUser`) and its `ShadowUsers/ShadowGroups/GroupMembers`. A CDS-consuming host must provide `@cnma/cap-identity`.
2. **No seed data ships** — the host provides `db/data/cnma.workflow-WorkflowObjectType.csv`.
3. **Services have no `@impl`** — handlers auto-discover by CAP sibling convention; importing the `.cds` wires them.
4. **`workflow.statusChanged` is emitted programmatically** (via `srv.emit`), not declared as a CDS `event`. Subscribe with `.on(...)` after `cds.connect.to('WorkflowService')`.
5. **Always batch principal-name resolution** with `PrincipalResolver.resolveNames()` (max 2 queries) — never per-row `resolveName()` (7 virtual name fields across 5 entities → N+1 risk).
6. **Strict `exports` map** — only listed subpaths import; use the `./react` barrel (deep component paths are not exported).
7. Version skew: `package.json` = 1.7.5 but CHANGELOG top is 1.7.0.

## CDS Models

```cds
// srv/workflow.cds in the host — pulls in both db models + auto-wires handlers
using from '@cnma/cap-workflow/srv/workflow-admin-service';
using from '@cnma/cap-workflow/srv/workflow-service';
```
Entities, enums, and every field: **[references/api.md](references/api.md)**. Key enums: `WorkflowStatus {DRAFT,ACTIVE,COMPLETED,REJECTED,CANCELLED}`, `RejectionMode`, `CompletionPolicy {RESPONSIBLE_ONLY,RESPONSIBLE_MEMBERS,ANY_AUTHORIZED,AUTO_COMPLETE}`.

## Host Wiring

### 1. Seed object types — `db/data/cnma.workflow-WorkflowObjectType.csv`
```csv
ID;objectType;displayName;orgKeyField;isActive
11111111-1111-1111-1111-111111111111;INV;Invoice;header.companyCode;true
```

### 2. Sync host status from the workflow — `srv/server.ts`
```ts
cds.on('served', async () => {
  const wf = await cds.connect.to('WorkflowService');
  wf.on('workflow.statusChanged', async (msg) => {
    const { referenceId, status, currentStepName } = msg.data; // IWorkflowStatusChangedPayload
    await UPDATE('MyEntity').set({ workflowStatus: status }).where({ ID: referenceId });
  });
});
```
Synchronous + in-tx — the UPDATE commits atomically with the approval.

### 3. Cascade delete — from host `MyEntity` beforeDelete
```ts
import { WorkflowEngine } from '@cnma/cap-workflow/srv';
await WorkflowEngine.deleteForReference(req.data.ID, 'MyEntity'); // leaf-first cascade
```

### 4. React
```tsx
import { ProcessFlow, ApprovalPanel, WorkflowManager } from '@cnma/cap-workflow/react';
import '@cnma/cap-workflow/react/i18n';  // side-effect: registers 'workflow' i18next ns (no .init())

<ProcessFlow httpClient={httpClient} workflowId={id}
  onBeforeApprove={async (taskId) => validateFields(taskId)}  // return false to block
  onActionComplete={refetch} />
<ApprovalPanel httpClient={httpClient} taskId={taskId} onComplete={(action) => refetch()} />
<WorkflowManager httpClient={httpClient} adminBaseUrl="/workflow-admin" runtimeBaseUrl="/workflow" />
```
`httpClient` implements `WorkflowHttpClient` (`get/post/patch/delete`).

## OData Actions (WorkflowService `@path:'/workflow'`, `authenticated-user`)

`startWorkflow`, `approveStep`, `rejectStep` (comment required), `reassignApprover`, `cancelWorkflow`, `rerunWorkflow`, `remindApprovers` — plus functions `getProcessFlow`, `getAvailableWorkflows`, `getStepsNeedingApprovers`, `getActiveStepFieldSettings`. Admin CRUD under `WorkflowAdminService` `@path:'/workflow-admin'` (`admin`). Signatures in [references/api.md](references/api.md).

You can also drive the engine directly (in host handlers) via `WorkflowEngine` / `ApprovalHandler` static classes rather than the OData actions — see the reference.

## Auto-posting (AUTO_COMPLETE)

Opt-in per definition: set `WorkflowDefinition.completionPolicy = 'AUTO_COMPLETE'` in the Admin UI (reuses the existing enum — **no new CDS field**). On final approval, your host `WorkflowStatusSyncHandler` checks the `statusChanged` payload for `status === 'COMPLETED'` + `completionPolicy === 'AUTO_COMPLETE'` and **outbox-emits** an auto-post event with `cds.queued()` (not `cds.spawn()` — survives restart, delivered post-commit). This spans the package (config) + the host `ai-agent-extraction` app (execution). Design details and the migration SQL for the old phantom enum values live in the package's `docs/autoPostingByClaude.md` / `docs/autoPostingByAnti.md`. As of v1.7.5 only the `completionPolicy` enum fix + `@assert.range` are shipped — the trigger/handler is host code.
> Aligns with the team's existing [[auto-posting-feature]] and `cap-workflow 1.7.0` publish work.

## Deep API reference

All 9 entities + enums, every backend class/method, all OData actions & functions, the `statusChanged` payload, React component props, i18n, and the full gotcha list: **[references/api.md](references/api.md)**.

## Standards Alignment

- ✅ `coding-standards.md` async rule: auto-post uses `cds.queued()` (outboxed), never `cds.spawn()`.
- ✅ `security-basics.md`: `@requires` on services; 4-eyes enforcement; RBAC via principal types.
- ✅ Performance (`Lead CAP Architect` priority): `PrincipalResolver` batch prevents N+1 on virtual name fields.
