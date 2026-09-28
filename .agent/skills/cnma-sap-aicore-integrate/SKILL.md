---
name: cnma-sap-aicore-integrate
description: Consume the internal @cnma/sap-aicore-integrate package in a SAP CAP host app — the SAP AI Core / Generative AI Hub integration layer. Provides a provider-agnostic LLM transport (getLlmProvider().complete/completeWithTools/embed via Orchestration — no deployment IDs, everything routes by model name), built-in retry + concurrency semaphore, per-activity model resolution from an aiAgentConfig, host-registered activity + embedding-corpus registries (registerActivities, registerEmbeddingCorpora), runtime-selectable embedding model (configureEmbeddings), foundation-model discovery/classification, the AIModels registry entity, and three admin React components (AiModelManagementPage, AiModelSelection, AiAgentConfigJson). Use when the app calls an LLM, needs embeddings, or manages selectable AI models.
---

# @cnma/sap-aicore-integrate Skill

**Package:** `@cnma/sap-aicore-integrate` · **Verified against:** v3.0.0 source (`srv/`, `react/`, `db/`, `docs/`, `CHANGELOG.md`).

The **AI Core transport & model-registry layer** for CNMA CAP apps. It abstracts the SAP AI SDK Orchestration client behind a stable `LlmProvider` interface, routes models per "activity" from a JSON `aiAgentConfig`, does text embeddings by model name, discovers/classifies foundation models, and ships an `AIModels` registry entity + three admin React components. Namespace: **`cnma.aicore.integrate`**.

Since **3.0.0** the package holds **no deployment configuration at all** — every call (chat AND embeddings) routes through orchestration by **model name**. A model redeployed on AI Core no longer breaks the app.

## When to Use

- The app must call an LLM (chat / tool-calling / structured output) → `getLlmProvider().complete()` / `completeWithTools()`.
- Different tasks should use different models (extraction vs agent vs validation…) → `resolveActivityModel()` + an `aiAgentConfig`.
- You need text embeddings / vectors (HANA Vector Engine indexing) → `getLlmProvider().embed()` / `batchEmbed()` (the only embedding API since 3.0.0).
- The admin should pick the embedding model at runtime → `configureEmbeddings()` + the embedding-corpus registry.
- You want an admin page to sync + toggle available models → React `AiModelManagementPage`.
- You want a per-activity model picker inside a config form → React `AiModelSelection` (+ `AiAgentConfigJson` raw editor).

## 🚫 Scope Boundary (source-verified — do NOT expect these here)

This package is deliberately thin. It does **not** ship: streaming, a document-extraction processor, prompt builders, an agent/ReAct loop, HITL/approval, a chat-UI, a vector store, any emitted events, any activities, **or any embedding corpora** (both registries start empty; the host registers its own). Since 3.0.0 it also has **no image embeddings** and **no Gemini context caching** (see Reality Check). The actual processors live in the **host app** (e.g. `ai-agent-extraction`, `cnma-mdg-ai-assistant`). Build those with the [[ai-engineering]] skill; use this package only as the transport + registry underneath.

## ⚠️ Reality Check (source-verified)

1. **Since 3.0.0 there are NO deployment IDs.** Destination properties `deploymentIdEmbedding`, `modelNameEmbedding`, `deploymentIdImageEmbedding`, `modelNameImageEmbedding`, `deploymentIdGemini`, `modelNameGemini` and all `AICORE_DEPLOYMENT_ID_*` env vars are **no longer read — delete them**. Embeddings go through `OrchestrationEmbeddingClient` by model name (`AICORE_MODEL_EMBEDDING`, default `text-embedding-3-small`).
2. **Removed in 3.0.0:** `aiCore.embedding()` / `aiCore.batchEmbeddings()` → use `getLlmProvider().embed()` / `.batchEmbed()`. `aiCore.imageEmbedding()` + `LlmProvider.embedImage()` (Titan needs the deployment-addressed Bedrock `/invoke` endpoint — hosts rebuild on `aiCore.getRequestContext()` if needed). `aiCore.getGeminiDeployment()`, `createGeminiContextCache()` / `completeWithGeminiCache()` (Gemini-native endpoint, no orchestration equivalent — use Anthropic `cache_control` prompt caching on Claude models for a discount).
3. **Embedding width is hard-asserted.** Every returned vector must be exactly `AICORE_EMBEDDING_DIM` (default 1536) wide or the call **throws** (a wrong-width vector would silently corrupt HANA similarity search). Changing the embedding model/dim invalidates every stored vector — the **host owns re-embedding** and must keep similarity search off until it completes.
4. **Since 2.0.0 the package ships NO default activities.** The registry starts **empty**; each host declares an `AiActivity[]` and calls `registerActivities(...)` at bootstrap — **on both bundles** (backend CAP `init()` AND frontend app entry; the registry is per-bundle). Same rule for embedding corpora via `registerEmbeddingCorpora(...)` (3.0.0). Until then the admin UI renders nothing and `embeddingDim(kind)` throws.
5. **Since 1.3.0 there is NO implicit `gemini-2.5-pro` fallback.** When `aiAgentConfig.models[activity]`, `aiAgentConfig.model`, and `AICORE_DEFAULT_MODEL` are all empty, LLM calls **throw `AI model not configured`**. `resolveActivityModel()` still returns the call-site `fallbackModel`/`undefined` without throwing.
6. **`getLlmProvider().complete()` is non-streaming** despite the DB's `streamingSupported` metadata field. Orchestration uses `chatCompletion` (single response). No streaming API exists.
7. **The host owns the service.** The package ships only the `AIModels` entity + backend functions. **You must define** the OData service projection plus the `syncModels()` action and `getAvailableModels(activity)` function that the React `AiModelApi` client calls — see recipes.
8. **Discovery field is `m.model`, not `m.modelId`.** `docs/05-integration-guide.md`'s sync example still uses `m.modelId` — that field doesn't exist on `DiscoveredModel`. Use `m.model`.
9. **All LLM calls are rate-limit-guarded (2.1.0+).** A shared semaphore caps concurrency (`AICORE_MAX_CONCURRENT`, default 3); 429/`RESOURCE_EXHAUSTED` retries with backoff+jitter in its own loop, timeouts/network/5xx retry `AICORE_RETRY_COUNT` (default 2) times. `Semaphore`, `llmSemaphore`, `withRetries` are exported from `/llm` for the host's own raw calls.
10. **No CSS / no i18n bundle ships.** React components rely on the host's Tailwind + `@cnma/react-ui` theme; translations fall back to built-in English unless the host supplies `react-i18next` keys.
11. **`dist/` is not committed** — subpaths resolve after `npm run build` / on the published tarball. A raw `file:` dep needs building first (only `db/schema` resolves unbuilt). `ProviderLogo` is **not** public.

## Config / Environment

Two credential modes (2.1.0+):

- **Destination mode (production):** BTP Destination (default name `AICORE`, override `AICORE_DESTINATION_NAME`) with `URL`, `tokenServiceURL`, `clientId`, `clientSecret`, and **`AI-Resource-Group`** (or `resourceGroup`) additional property — required, throws if missing. Needs the `destination` service bound (`cds watch --profile hybrid` locally). **No deployment properties anymore.**
- **Env mode (local dev, no binding):** when `VCAP_SERVICES` has no destination service, the adapter reads `AICORE_SERVICE_KEY` (AI Core service-key JSON, @sap-ai-sdk convention) **or** discrete `AICORE_AUTH_URL` / `AICORE_CLIENT_ID` / `AICORE_CLIENT_SECRET` / `AICORE_BASE_URL`, plus **`AICORE_RESOURCE_GROUP` (required)**. `AICORE_SERVICE_KEY` is synthesized from the discrete vars so `@sap-ai-sdk` clients authenticate too.

Key env vars: `AICORE_DEFAULT_MODEL` (**no default** — if unset AND `aiAgentConfig` has no model, LLM calls throw), `AICORE_MODEL_EMBEDDING` (`text-embedding-3-small`), `AICORE_EMBEDDING_DIM` (`1536`, hard-asserted — change only with a full re-embed), `AICORE_MAX_CONCURRENT` (3), `AICORE_RETRY_COUNT` (2), `AICORE_LLM_TIMEOUT_MS` (180000), `AICORE_EMBED_BATCH_SIZE` (200). Full list in [references/api.md](references/api.md).

## CDS Entity

```cds
using { cnma.aicore.integrate as aicore } from '@cnma/sap-aicore-integrate/db/schema';
```
`aicore.AIModels` (`cuid, managed`): the selectable-model registry — `modelId` (unique), `provider`, `displayName`, `active`, `capabilities` (JSON), `suitableActivities` (JSON, **null = all**), cost/context/lifecycle metadata. Full fields in [references/api.md](references/api.md). The package ships **only the entity** — no seed CSV.

## Backend Recipes

### Register activities at bootstrap (MANDATORY since 2.0.0)
```ts
// srv/lib/agent/ActivityDefinitions.ts — ONE shared AiActivity[] for both bundles
import type { AiActivity } from '@cnma/sap-aicore-integrate/react/shared';
export const APP_ACTIVITIES: AiActivity[] = [
  { key: 'extraction', label: 'Extraction', description: 'Document field extraction',
    requiredCapabilities: ['vision'], budgetKey: 'extractionThinkingBudget' },
  { key: 'agent', label: 'Agent', description: 'ReAct tool loop',
    requiredCapabilities: ['toolCalling'], budgetKey: 'agentThinkingBudget' },
];

// srv/<service>.ts — backend bundle, in init() before serving
import { registerActivities } from '@cnma/sap-aicore-integrate/react/shared';
import { APP_ACTIVITIES } from './lib/agent/ActivityDefinitions';
registerActivities(APP_ACTIVITIES);

// app entry (main.tsx) — frontend bundle, before the model-settings UI renders
registerActivities(APP_ACTIVITIES);
```
Merge-by-key (re-registration wins). Backend resolver takes each activity's `budgetKey` from the registry; the admin UI renders exactly what's registered. Live key list: `getAgentActivities()` from `/llm`.

### Call an LLM (per-activity model)
```ts
import { getLlmProvider, resolveActivityModel } from '@cnma/sap-aicore-integrate/llm';
import type { CanonicalMessage } from '@cnma/sap-aicore-integrate/types';

const model = resolveActivityModel(objectType.aiAgentConfig, 'extraction'); // models[activity] → model → fallbackModel?/undefined
const messages: CanonicalMessage[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Extract the invoice total.' },
];
const res = await getLlmProvider().complete(messages, { model, temperature: 0.2, thinkingBudget: 4096 });
// res.content, res.usage?.totalTokens, res.finishReason ('length'/'MAX_TOKENS' → truncation guard)
```
Reasoning models (o1/o3/o4, gpt-5) auto-drop `temperature` and use `max_completion_tokens`/`reasoning_effort`; thinking params are only sent to models that support them. Structured output: pass `responseSchema` in the config. Gemini-only: `safetySettings` (ignored for other families). Tools: `completeWithTools(messages, tools, config)`. Calls run behind the shared semaphore + retry automatically. **If no model resolves anywhere (config + `AICORE_DEFAULT_MODEL` empty) the call throws `AI model not configured`** — configure one before rollout.

### Embeddings (for HANA Vector Engine)
```ts
const vectors = await getLlmProvider().batchEmbed(texts, 200); // number[][] — empty texts keep their slot as []
const v = await getLlmProvider().embed(text);                  // number[]
```
Routed by model name via `OrchestrationEmbeddingClient` — no deployment config. Each vector's width is asserted against the configured dim (throws on mismatch). `aiCore.embedding()` / `aiCore.batchEmbeddings()` **no longer exist** (3.0.0).

### Runtime-selectable embedding model + corpus registry (3.0.0)
```ts
import { configureEmbeddings, getEmbeddingSettings } from '@cnma/sap-aicore-integrate/llm';
import { registerEmbeddingCorpora, embeddingDim } from '@cnma/sap-aicore-integrate/react/shared';

// Bootstrap (both bundles, like activities): declare the app's vector corpora
registerEmbeddingCorpora([
  { kind: 'documents', label: 'Documents', description: 'Similarity search over document chunks',
    dim: 1536, schemaColumns: 'Documents.embedding cds.Vector(1536)',
    defaultModel: 'text-embedding-3-small', modelEnvVar: 'AICORE_MODEL_EMBEDDING' },
]);

// Host stores the admin's model choice in its OWN DB, pushes it in at bootstrap + on change:
configureEmbeddings({ model: savedModel, dim: 1536 });
getEmbeddingSettings(); // { model, dim } currently in force
```
⚠️ Changing the model invalidates every stored vector (two models ≠ one vector space) — the host owns re-embedding and must disable similarity search until done. `dim` is fixed by the CDS schema (`cds.Vector(n)`), NOT admin-configurable.

### Discover + classify foundation models (backs `syncModels`)
```ts
import { discoverFoundationModels, classifyModel } from '@cnma/sap-aicore-integrate/discovery';
const models = await discoverFoundationModels({ force: true });   // 5-min cache unless force
for (const m of models) {
  const c = classifyModel(m.model);   // ⚠️ m.model, NOT m.modelId
  // upsert into AIModels: { modelId: m.model, provider: c.provider, displayName: c.displayName, sortOrder: c.sortOrder }
}
```

### Host-owned service (the package does NOT ship this)
```cds
service AdminService @(path:'/admin') @(requires:'admin') {
  entity AIModels as projection on aicore.AIModels;
  action   syncModels()                         returns String;  // JSON SyncModelsResult
  function getAvailableModels(activity: String)  returns String;  // JSON AvailableModel[]
}
```
Wire the two handlers using `discoverFoundationModels`/`classifyModel` (see [references/api.md](references/api.md) for a full handler). The React client calls exactly these endpoints.

### Testing seam
```ts
import { setLlmProvider } from '@cnma/sap-aicore-integrate/llm';
setLlmProvider(mockProvider);   // inject a mock; setLlmProvider(null) resets to Orchestration
```

## React Recipes

```tsx
import { AiModelManagementPage, AiModelSelection, AiAgentConfigJson, createAiModelApi }
  from '@cnma/sap-aicore-integrate/react';
import { FormProvider, useForm } from 'react-hook-form';

const api = createAiModelApi('/admin', () => ({ Authorization: `Bearer ${token}` }));

// Admin registry: sync-from-AI-Core, active toggles, capability/lifecycle badges, suitable-activities editor
<AiModelManagementPage api={api} />

// Per-activity picker — MUST be inside a react-hook-form FormProvider; reads/writes the single
// 'aiAgentConfig' JSON string field (model, models.{activity}, <budgetKey>s, maxIterations).
// Renders ONLY the activities registered via registerActivities() in THIS bundle.
// AiAgentConfigJson (3.0.0) is the raw-JSON escape hatch for the SAME field — render it below
// the picker inside the same FormProvider and both stay in sync automatically.
function Editor({ config }) {
  const form = useForm({ defaultValues: { aiAgentConfig: config.aiAgentConfig ?? '{}' } });
  return (
    <FormProvider {...form}>
      <AiModelSelection api={api} />
      <AiAgentConfigJson rows={6} />
    </FormProvider>
  );
}
```
`createAiModelApi(basePath, getAuthHeaders?)` targets the host's `/AIModels`, `/syncModels`, `/getAvailableModels(activity=...)`. Peers the host app must have: `react-hook-form`, `react-i18next`, `lucide-react`, `sonner`.

## Deep API reference

Every export, all `types` contracts, LLM/embedding/discovery/adapter signatures, both registries (`registerActivities` + `registerEmbeddingCorpora`), resilience exports, config/env table, React props + `AiModelApi`, and the full gotcha list: **[references/api.md](references/api.md)**.

## Standards Alignment

- ✅ `ai-engineering` skill: this is the transport beneath your agentic/extraction processors — keep business logic in the host (`srv/lib/processors/`), per layered-architecture rule.
- ✅ `simplicity-manifesto.md` "BTP Native" test: uses SAP AI SDK Orchestration + AI Core, not a bespoke OpenAI client.
- ✅ `security-basics.md`: creds via bound destination + env, never hardcoded; admin service `@requires:'admin'`.
