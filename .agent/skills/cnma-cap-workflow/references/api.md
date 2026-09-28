# @cnma/cap-workflow — Full API Reference

Verified against **v1.7.5** source. CHANGELOG top = 1.7.0.

## Export map (strict — only these subpaths import)

| Subpath | Resolves to |
|---|---|
| `@cnma/cap-workflow/db/*` | raw `.cds` (e.g. `/db/workflow`, `/db/workflow-runtime`) |
| `@cnma/cap-workflow/srv` | `dist/srv/index.(d.ts/js)` |
| `@cnma/cap-workflow/srv/workflow-service(.cds)` | service def + compiled handler |
| `@cnma/cap-workflow/srv/workflow-admin-service(.cds)` | admin service def + handler |
| `@cnma/cap-workflow/react` | `dist/react/index.(d.ts/js)` |
| `@cnma/cap-workflow/react/i18n` | side-effect ns injector |
| `@cnma/cap-workflow/react/i18n/locales/{en,de,ja}.json` | raw locales |

- **dependencies:** `@dnd-kit/{core,sortable,utilities}`, `uuid`.
- **peers:** `@cnma/cap-identity >=1.0.25` (optional flag, but CDS-required), `@cnma/react-ui >=1.0.9`, `@monaco-editor/react`, `@sap/cds >=7` (optional), plus optional React/UI peers.

## CDS — template layer `namespace cnma.workflow` (db/workflow.cds)

Import: `using { cnma.workflow } from '@cnma/cap-workflow/db/workflow';`

- **WorkflowObjectType** (`cuid, managedWithUser`) — registry: `objectType String(50)! @assert.unique`, `displayName String(100)`, `orgKeyField String(100)` (e.g. `"header.companyCode"`), `isActive Bool=true`.
- **WorkflowDefinition** (`cuid, managedWithUser`): `objectType`, `orgKeyValue String(50)` (null=global), `triggerAction String(50)='submitForApproval'`, `workflowType String(100)!`, `description`, `responsibleType String(20)`, `responsibleId UUID`, `virtual responsibleName`, `rejectionMode RejectionMode='BACK_TO_RESPONSIBLE'`, `completionPolicy CompletionPolicy='RESPONSIBLE_ONLY' @assert.range`, `definitionVersion Int=1`, `conditionExpr LargeString`, `priority Int=0`, `autoCancelOnTerminalStatus Bool=true`, `isActive Bool=true`, `notificationSettings LargeString`, `enforceFourEyes Bool=true`, compositions `steps`, `stepDependencies`. Unique `[objectType, orgKeyValue, workflowType]`.
- **WorkflowStepDefinition** (`cuid, managedWithUser`): `definition`, `displayOrder Int!` (UI only), `stepName String(100)`, `stepDescription`, `approvalMode ApprovalMode='ALL'`, `approverSeqMode ApproverSeqMode='PARALLEL'`, `fieldSettings LargeString`, `conditionExpr`, composition `defaultApprovers`.
- **DefaultStepApprover** (`cuid, managedWithUser`): `step`, `principalType String(20)!`, `principalId UUID!`, `virtual principalName`, `approverOrder Int=0` (SEQUENTIAL only), `conditionExpr`.
- **StepDependency** (`cuid` only): `definition`, `predecessor`(→step), `successor`(→step). Pure DAG edge table.

**Enums:** `DecisionSource {MANUAL,AI_SUGGESTED,AUTO}`; `ApprovalMode {ANY_ONE,ALL}` (default ALL); `ApproverSeqMode {SEQUENTIAL,PARALLEL}`; `RejectionMode {BACK_TO_RESPONSIBLE,RESTART_STEP,NEW_RUN}`; `CompletionPolicy {RESPONSIBLE_ONLY,RESPONSIBLE_MEMBERS,ANY_AUTHORIZED,AUTO_COMPLETE}`.

## CDS — runtime layer `namespace cnma.workflow.runtime` (db/workflow-runtime.cds)

Import: `using { cnma.workflow.runtime } from '@cnma/cap-workflow/db/workflow-runtime';`

- **WorkflowInstance** (`cuid, managedWithUser`): `referenceId UUID!`, `referenceType String(100)!`, `definition`, `workflowType`, `workflowTypeSource DecisionSource='MANUAL'`, `runNumber Int=1`, `status WorkflowStatus='DRAFT'`, `frozenDefinitionVersion Int`, responsible fields, `startedAt/completedAt`, compositions `stepInstances`, `history`. **`modifiedAt @odata.etag`**.
- **StepInstance** (`cuid, managedWithUser`): `workflowInstance`, `stepDefinition`, denormalized step fields, `status StepStatus='PENDING'`, `activatedAt/completedAt`, composition `tasks`.
- **ApprovalTask** (`cuid, managedWithUser`): `stepInstance`, `assigneeType String(20)!`, `assigneeId UUID!`, `virtual assigneeName`, `taskOrder Int=0`, `status TaskStatus='PENDING'`, `decidedBy*`, `comment LargeString`, `assignmentSource DecisionSource='MANUAL'`. **`modifiedAt @odata.etag`**.
- **WorkflowHistory** (`cuid, managedWithUser`, `@sql.append:'PAGE LOADABLE'`): `workflowInstance`, `stepInstance`, `approvalTask`, `eventType String(50)!`, `performedById UUID`, `virtual performedByName`, `isSystemAction Bool=false`, `performedAt`, `stepName/previousValue/newValue`, `comment`, `metadata LargeString`.

**Runtime enums:** `WorkflowStatus {DRAFT,ACTIVE,COMPLETED,REJECTED,CANCELLED}`; `StepStatus {PENDING,ACTIVE,APPROVED,REJECTED,SKIPPED}`; `TaskStatus {PENDING,APPROVED,REJECTED,CANCELLED}`.

### Seed CSV (host provides)
`db/data/cnma.workflow-WorkflowObjectType.csv`, `;`-delimited:
```
ID;objectType;displayName;orgKeyField;isActive
<uuid>;INV;Invoice;header.companyCode;true
```

## Backend API — `@cnma/cap-workflow/srv`

```ts
import {
  WorkflowEngine, StepAdvancer, DAGValidator, ApprovalHandler, PrincipalResolver,
  WorkflowHistoryLogger, WorkflowNotifier, ConditionEvaluator, WorkflowResolver,
  CompletionPolicyChecker, WorkflowLifecycleHook,
  WorkflowEventType, CDS_ENTITIES, NOTIFICATION_EVENT_TYPES,
} from '@cnma/cap-workflow/srv';
```
Type-only: `IPrincipal, IDAGEdge, IDAGValidationResult, IEmailSender, IBatchEmailSender, IWorkflowStatusChangedPayload, WorkflowEventTypeValue, NotificationEventType`, etc.

### `WorkflowEngine` (static; runs in caller's tx)
- `createWorkflow(input: ICreateWorkflowInput): Promise<string>`
- `startWorkflow(workflowId): Promise<void>`
- `cancelWorkflow(workflowId, reason?): Promise<void>`
- `deleteForReference(referenceId, referenceType): Promise<number>` — leaf-first cascade
- `rerunWorkflow(workflowId, approverOverrides?): Promise<string>`
- `handleRejection(workflowId, rejectedStepId, comment?): Promise<{action: string; newWorkflowId?: string}>`
- `buildStatusChangedPayload(workflowId): Promise<IWorkflowStatusChangedPayload>`

```ts
ICreateWorkflowInput = { referenceId; referenceType; definitionId; responsibleType?; responsibleId?;
                         approverOverrides?: IApproverOverride[]; documentData?: Record<string,unknown>; createdById? }
IApproverOverride = { stepDefinitionId; approvers: {principalType; principalId; approverOrder?}[] }
```

### `ApprovalHandler` (static; forUpdate lock + etag)
- `approveTask({ taskId, comment?, userId }): Promise<IApprovalTask>`
- `rejectTask({ taskId, comment /* required */, userId }): Promise<IApprovalTask>`
- `reassignTask({ taskId, newAssigneeType, newAssigneeId, reason, userId }): Promise<IApprovalTask>`
- Enforces 4-eyes (403) when `enforceFourEyes = true`.

### `StepAdvancer` (static)
`getStepsNeedingApprovers(definitionId, documentData?)`, `tryAdvanceStep(stepInstanceId, workflowInstanceId)`, `tryAdvanceWorkflow(workflowInstanceId): Promise<'COMPLETED'|null>`, `activateStartSteps(workflowInstanceId)`, `activateStep(stepInstanceId, workflowInstanceId)`.

### `DAGValidator` (pure, no DB — Kahn's algorithm)
- `validate(edges: IDAGEdge[], stepIds: string[]): IDAGValidationResult` → `{ isValid, errors[], topologicalOrder[], startSteps[], endSteps[] }`
- `wouldCreateCycle(existingEdges, newEdge, stepIds): boolean`
- `getExecutionOrder(edges, steps: {ID, displayOrder}[]): string[]`

### `PrincipalResolver` (static; batch, max 2 queries; request-scoped cache)
`resolveNames(IPrincipal[]): Promise<Map<id,name>>` **(use this, not per-row)**, `resolveName(type,id)`, `resolveUUID(userId)`, `expandMembers(groupId)`, `isMember(userId,groupId)`, `validatePrincipalType(type)`, `getEnabledTypes()`, `getUserGroups(userId)`, `resolveUserScope(userId): {shadowUserId, groupIds, allIds}`, `isResponsiblePerson(userId, responsibleType, responsibleId)`, `populateVirtualNames(results, mappings[])`.

### Event — `workflow.statusChanged` (synchronous, in-tx; emitted via `srv.emit`)
```ts
IWorkflowStatusChangedPayload = {
  referenceId; referenceType; workflowId; status /* WorkflowStatus */;
  workflowType?; currentStepName?: string|null; currentApprovers?: string|null;
}
```

### Constants
- `WorkflowEventType` — history event names: `CREATED, STARTED, CANCELLED, COMPLETED, REJECTED, RERUN, STEP_ACTIVATED, STEP_COMPLETED, STEP_REJECTED, STEP_RESET, TASK_APPROVED, TASK_REJECTED, TASK_REASSIGNED, TASK_ACTIVATED, TASK_CANCELLED`.
- `CDS_ENTITIES` — FQ entity names (e.g. `WorkflowInstance: "cnma.workflow.runtime.WorkflowInstance"`).

## OData services

### `WorkflowService` (`@requires:'authenticated-user'`, `@path:'/workflow'`)
Read-only projections: `WorkflowInstances, StepInstances, ApprovalTasks, WorkflowHistories, WorkflowObjectTypes, AvailableDefinitions`.

| Action | Params → returns |
|---|---|
| `startWorkflow` | `(referenceId!, referenceType!, definitionId!, responsibleType?, responsibleId?, approverOverrides?:LargeString, documentData?:LargeString)` → `{workflowId, status}` |
| `approveStep` | `(taskId!, comment?)` → `{taskId, status}` |
| `rejectStep` | `(taskId!, comment!)` → `{taskId, status}` |
| `reassignApprover` | `(taskId!, newAssigneeType!, newAssigneeId!, reason!)` → `{taskId, status}` |
| `cancelWorkflow` | `(workflowId!, reason?)` → `{workflowId, status}` |
| `rerunWorkflow` | `(workflowId!, approverOverrides?:LargeString)` → `{newWorkflowId, status}` |
| `remindApprovers` | `(workflowId!)` → `{reminded:Integer}` |

Functions: `getProcessFlow(workflowId!)`, `getAvailableWorkflows(objectType!, orgKeyValue?)`, `getStepsNeedingApprovers(definitionId!)`, `getActiveStepFieldSettings(workflowId!)` → `{isCurrentApprover, isResponsiblePerson, stepName, pendingTaskCount, fieldSettings}`.

### `WorkflowAdminService` (`@requires:'admin'`, `@path:'/workflow-admin'`)
Full-CRUD (deep insert) on template entities. Action `sendTestEmail(eventType!, recipientEmail!, notificationSettings:LargeString)`.

Both service CDS files have **no `@impl`** — handlers auto-discovered by sibling convention.

## React API — `@cnma/cap-workflow/react`

Barrel also re-exports `{ Button, buttonVariants, Badge, badgeVariants, cn }` from `@cnma/react-ui`.

### `WorkflowHttpClient` (host implements)
```ts
{ get:<T=any>(url)=>Promise<T>; post:<T=any>(url,data?)=>Promise<T>;
  patch:<T=any>(url,data?)=>Promise<T>; delete:<T=any>(url)=>Promise<T>; }
```

### Runtime components
- **ProcessFlow** — `{ httpClient!, workflowId!, baseUrl?, principalTypes?, onSearchPrincipals?(type,query), onResolvePrincipal?(type,id), onActionComplete?(), onBeforeApprove?(taskId)=>bool|Promise<bool> /* false blocks */, canUserActOnTask?(task)=>bool, className? }`.
- **ApprovalPanel** — `{ httpClient!, taskId!, baseUrl?, onComplete?(action:'APPROVED'|'REJECTED'|'REASSIGNED'), onError?(msg), principalTypes?, onSearchPrincipals?, className? }`.
- **WorkflowTimeline** — `{ httpClient!, workflowId!, referenceId?, referenceType? /* both → cross-run history */, baseUrl?, maxItems?, className? }`.
- **WorkflowStatusBadge** — localized status badge.

### Admin components
- **WorkflowManager** — `{ httpClient!, adminBaseUrl?, runtimeBaseUrl?, principalTypes?, onSearchPrincipals?, onResolvePrincipal?, onResolveFieldList?(objectType)=>Promise<{name,label?}[]>, onError?, onSuccess?, className? }`.
- Also: `DefinitionsTab, StepEditor, ObjectTypesTab, PrincipalPicker, DependencyEditor, FieldSettingsEditor, NotificationSettingsEditor`.

### Service clients
`WorkflowRuntimeService`, `WorkflowAdminService` (wrap a `WorkflowHttpClient`).

### i18n
`import '@cnma/cap-workflow/react/i18n'` — side-effect; injects `workflow` ns into shared i18next (no `.init()`). Components use `useTranslation('workflow')`. Locales en/de/ja. Also exported: `NOTIFICATION_EVENT_TYPES, NOTIFICATION_EVENT_META, TEMPLATE_PLACEHOLDERS, INFO_FIELD_OPTIONS`. `NotificationEventType = 'TASK_ASSIGNED'|'TASK_APPROVED'|'TASK_REJECTED'|'TASK_REASSIGNED'|'TASK_REMINDER'|'WORKFLOW_COMPLETED'|'WORKFLOW_REJECTED'`.

## Auto-posting (docs/autoPostingByClaude.md, autoPostingByAnti.md)

- Opt-in = `WorkflowDefinition.completionPolicy = 'AUTO_COMPLETE'` (reuses enum; no new field).
- Package role (shipped in 1.7.x): CompletionPolicy dropdown exposes the 4 real enum values (was phantom `ALL_STEPS_APPROVED`/`LAST_STEP_APPROVED`); default `RESPONSIBLE_ONLY`; `@assert.range` on the field; en/de/ja i18n. Migration SQL:
  ```sql
  UPDATE cnma_workflow_WorkflowDefinition SET completionPolicy='RESPONSIBLE_ONLY'
  WHERE completionPolicy IN ('ALL_STEPS_APPROVED','LAST_STEP_APPROVED');
  ```
- Host trigger (Part B, not in package): in `WorkflowStatusSyncHandler`, on `status==='COMPLETED'` + def `completionPolicy==='AUTO_COMPLETE'` → `await cds.queued(taskSvc).emit(PipelineEvent.AUTO_POST, {documentId, objectType, triggeredBy})`. `cds.queued` (outboxed) → delivered post-commit, crash-safe. Consumer runs the existing posting engine (idempotent, re-guarded).
- Error notification: generic email Action with `autoTrigger:'onPostingError'` (+ `displayArea:[]` headless), fired once on HARD failures only (`catch` or `result==='Error'`), not on `ConfirmWarnings`/async `'Posting'`. Tokens `{{postingError}}/{{objectType}}/{{fileName}}`.
- These are plans; only the enum fix + `@assert.range` are shipped in v1.7.5.

## Gotchas (consolidated)

- `@cnma/cap-identity` is CDS-required despite "optional" peer flag.
- No seed data ships; services have no `@impl`; strict exports map (use `./react` barrel).
- `workflow.statusChanged` is programmatic (`srv.emit`), not a declared CDS event.
- Execution order = DAG (`StepDependency`), not `displayOrder`.
- Always `PrincipalResolver.resolveNames()` (batch) for the 7 virtual name fields — never per-row.
- 3 rejection modes; `enforceFourEyes` default true (403 for submitter/prior decider).
- Engine runs on caller's tx (no sub-transactions) — approve + status-sync are atomic.
- Optimistic `@odata.etag` + pessimistic `forUpdate()` locking.
- Version skew 1.7.5 vs CHANGELOG 1.7.0.
