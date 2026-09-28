# @cnma/sap-aicore-integrate — Full API Reference

Verified against **v3.0.0** TypeScript source (`dist/` not committed; published tarball ships `dist/` + `db/`). Has a `CHANGELOG.md` (read it for breaking changes); no seed CSV.

> **Breaking history:** **1.3.0** removed the implicit `gemini-2.5-pro` fallback (unresolved model → throw `AI model not configured`; `DEFAULT_MODEL` export removed) and introduced the activity registry. **2.0.0** removed ALL default activities (`AI_ACTIVITIES` gone from `/react/shared`, static `AGENT_ACTIVITIES` gone from `/llm` → live `getAgentActivities()`); hosts MUST `registerActivities()` at bootstrap on both bundles. **2.1.0** added retry+semaphore, env-credential fallback, image embeddings, Gemini context caching, `safetySettings`, `finishReason`. **3.0.0** removed ALL deployment IDs (embeddings now route by model name via `OrchestrationEmbeddingClient`), removed image embeddings + Gemini context caching again, added `configureEmbeddings()` and the embedding-corpus registry.

## Export map

| Import subpath | Exports |
|---|---|
| `@cnma/sap-aicore-integrate` | barrel — re-exports `types` + `llm` + `discovery` + `adapter` |
| `@cnma/sap-aicore-integrate/types` | all contracts (interfaces/types, no runtime code) |
| `@cnma/sap-aicore-integrate/llm` | provider, embeddings, model resolution, mapping, model-family helpers, resilience |
| `@cnma/sap-aicore-integrate/discovery` | foundation-model discovery + classification |
| `@cnma/sap-aicore-integrate/adapter` | `aiCore` singleton (auth, resource group, raw-call context) |
| `@cnma/sap-aicore-integrate/db/schema` | CDS `cnma.aicore.integrate` (`AIModels`) |
| `@cnma/sap-aicore-integrate/db/*` | raw db passthrough |
| `@cnma/sap-aicore-integrate/react` | 3 components + `createAiModelApi` + API types |
| `@cnma/sap-aicore-integrate/react/shared` | activity registry (`registerActivities`, …) + embedding-corpus registry (`registerEmbeddingCorpora`, …) + `MAX_ITERATIONS_KEY`, `modelSupportsThinking` |

- **dependency:** `@cnma/react-ui ^1.1.0` (only runtime dep).
- **required peer:** `@sap/cds >=8`.
- **optional peers:** `@sap-ai-sdk/orchestration ^2.12.0`, `@sap-ai-sdk/ai-api ^1.0.0`, `axios ^1`, `react`/`react-dom` (18||19), `react-i18next >=13`, `react-hook-form ^7`, `lucide-react >=0.400`, `sonner >=1`.
- The two AI SDKs are **ESM-only, loaded via runtime `await import()`** — a server that never calls `getLlmProvider()`/`discoverFoundationModels()` need not install them.

## Config / Env

**Destination mode:** BTP Destination (`AICORE` / `$AICORE_DESTINATION_NAME`) provides `URL`, `tokenServiceURL`, `clientId`, `clientSecret`, `AI-Resource-Group` **or** `resourceGroup` additional property (required — throws if missing). The `destination` service must be bound (reads `VCAP_SERVICES`). **No deployment properties since 3.0.0** — `deploymentIdEmbedding`, `modelNameEmbedding`, `deploymentIdImageEmbedding`, `modelNameImageEmbedding`, `deploymentIdGemini`, `modelNameGemini` are no longer read; delete them.

**Env-credential mode (2.1.0+, local dev):** when no destination service is bound, credentials come from `AICORE_SERVICE_KEY` (AI Core service-key JSON) or discrete `AICORE_AUTH_URL` / `AICORE_CLIENT_ID` / `AICORE_CLIENT_SECRET` / `AICORE_BASE_URL`, plus **`AICORE_RESOURCE_GROUP` (required — throws if missing)**. `AICORE_SERVICE_KEY` is synthesized from the discrete vars so `@sap-ai-sdk` clients self-authenticate. `aiCore.getSdkDestination()` returns `{destinationName}` in destination mode, `undefined` in env mode.

| Env var | Default |
|---|---|
| `AICORE_DESTINATION_NAME` | `AICORE` |
| `AICORE_DEFAULT_MODEL` | **none** — unset + no `aiAgentConfig` model → throw `AI model not configured` |
| `AICORE_MODEL_EMBEDDING` | `text-embedding-3-small` (3.0.0 — replaces deployment IDs) |
| `AICORE_EMBEDDING_DIM` | `1536` — **hard-asserted on every vector**; change only with a full re-embed |
| `AICORE_MAX_CONCURRENT` | `3` — shared LLM semaphore width (2.1.0) |
| `AICORE_RETRY_COUNT` | `2` — timeout/network/5xx retries; 429 loop uses `max(this, 5)` (2.1.0) |
| `AICORE_LLM_TIMEOUT_MS` | `180000` |
| `AICORE_EMBED_TIMEOUT_MS` | `120000` |
| `AICORE_AUTH_TIMEOUT_MS` | `30000` |
| `AICORE_EMBED_BATCH_SIZE` | `200` |
| `AICORE_EMBED_BATCH_DELAY_MS` | `500` |
| `AICORE_TOKEN_REFRESH_SKEW_SEC` | `300` |

Removed in 3.0.0: `AICORE_DEPLOYMENT_ID_*`, `AICORE_EMBEDDING_API_VERSION`, `AICORE_IMAGE_EMBED_TIMEOUT_MS`, `AICORE_IMAGE_EMBEDDING_DIM`, `AICORE_CACHE_TIMEOUT_MS`.

Embeddings: `OrchestrationEmbeddingClient` routed by model name + resource group. Empty/whitespace texts never reach the API but keep their slot (`[]`); vectors are placed by the API-returned `index` (endpoint may reorder); requests chunked by `AICORE_EMBED_BATCH_SIZE` with `AICORE_EMBED_BATCH_DELAY_MS` between chunks; each vector's width asserted against the active dim.

## CDS entity `AIModels` (namespace `cnma.aicore.integrate`, `cuid, managed`)

```cds
using { cnma.aicore.integrate as aicore } from '@cnma/sap-aicore-integrate/db/schema';
```
| Field | Type | Notes |
|---|---|---|
| `modelId` | String(100) not null | `@unique` (e.g. `"gemini-2.5-pro"`) |
| `provider` | String(50) | `"Google"`/`"Anthropic"`/… |
| `displayName` | String(150) | |
| `active` | Boolean=true | inactive → hidden from dropdowns |
| `capabilities` | LargeString | JSON array |
| `suitableActivities` | LargeString | JSON array; **null = all activities** |
| `sortOrder` | Integer=100 | lower first |
| `deprecated` | Boolean=false | |
| `retirementDate` | String(30) | ISO |
| `version` | String(30) | |
| `contextWindow` | Integer | |
| `inputTokenCost`/`outputTokenCost` | Decimal(10,5) | Capacity Units |
| `streamingSupported` | Boolean=false | (metadata only — no streaming API) |
| `inputTypes` | LargeString | JSON e.g. `["text","image","pdf"]` |

Plus `ID`, `createdAt/By`, `modifiedAt/By` from `cuid`+`managed`.

## Backend — `/types`

```ts
interface AIMessage { role: 'user'|'assistant'|'system'|'model'; content: string | AIMessagePart[]; }
interface AIMessagePart { type:'text'|'image_url'; text?: string; image_url?: { url: string }; }
interface AIConfig { temperature?; max_tokens?; model?; thinkingBudget?; responseMimeType?;
  responseSchema?: Record<string,unknown>; preferFast?; timeoutMs?;
  safetySettings?: Array<{category:string; threshold:string}>; }   // Gemini-only, ignored elsewhere (2.1.0)
interface AIResponse { content: string; usage?: { promptTokens?; completionTokens?; totalTokens? };
  finishReason?: string; }                                          // 'stop'|'length'|'MAX_TOKENS'… (2.1.0)
interface AIToolResponse { content?; functionCalls?: {id?;name;args}[]; usage?; finishReason?: string; }
type CanonicalRole = 'system'|'user'|'assistant'|'tool';
interface CanonicalMessage { role: CanonicalRole; content?: string | ContentPart[];
  toolCalls?: ToolCall[]; toolCallId?: string; name?: string; }
type ContentPart = {type:'text';text} | {type:'image';mimeType;dataBase64};
interface ToolCall { id; name; args: Record<string,unknown>; }
interface ToolSchema { name; description; parameters: Record<string,unknown>; }
interface LlmCapabilities { toolCalling; vision; thinking; promptCaching: 'implicit'|'explicit'|false; }
interface ModelProfile { model; capabilities: LlmCapabilities; modelParams?; }
interface LlmProvider {
  readonly name: string;
  complete(messages: CanonicalMessage[], config?: AIConfig): Promise<AIResponse>;
  completeWithTools(messages: CanonicalMessage[], tools: ToolSchema[], config?: AIConfig): Promise<AIToolResponse>;
  embed(text: string): Promise<number[]>;
  batchEmbed(texts: string[], batchSize?: number): Promise<number[][]>;
}
// NOTE: optional embedImage() was added in 2.1.0 and REMOVED in 3.0.0.
```

## Backend — `/llm`

```ts
function getLlmProvider(): LlmProvider;                        // lazy singleton (OrchestrationProvider)
function setLlmProvider(provider: LlmProvider | null): void;  // inject/reset (tests)
class OrchestrationProvider implements LlmProvider { name = 'orchestration'; /* complete/completeWithTools/embed/batchEmbed */ }

function resolveModelProfile(aiAgentConfig, activity: AgentActivity): ModelProfile;
  // models[activity] → model → env AICORE_DEFAULT_MODEL → THROWS 'AI model not configured' (since 1.3.0)
  // budgetKey looked up from the registered activity (getActivity(activity)?.budgetKey);
  // unregistered activity → no thinking budget folded in
function resolveActivityModel(aiAgentConfig, activity, fallbackModel?): string | undefined;  // models[activity]→model→fallbackModel/undefined (never throws)
function inferCapabilities(model: string): LlmCapabilities;

function getAgentActivities(): string[];   // LIVE registered activity keys
type AgentActivity = string;               // any registered key
interface AiAgentConfigShape { model?; models?: Record<string,string>; [budgetKey]: unknown; }

// embeddings (3.0.0 — OrchestrationEmbedding.ts)
function embedTexts(texts: string[], batchSize?): Promise<number[][]>;  // what embed/batchEmbed delegate to
function configureEmbeddings(opts: { model?: string; dim?: number }): void;
  // runtime override of AICORE_MODEL_EMBEDDING/AICORE_EMBEDDING_DIM — hosts with an admin-selectable
  // model call this at bootstrap + on every change. Changing the model invalidates ALL stored vectors.
function getEmbeddingSettings(): { model: string; dim: number };        // currently in force

// resilience (2.1.0 — Resilience.ts)
class Semaphore { constructor(max: number); acquire(); release(); run<T>(fn): Promise<T>; }
const llmSemaphore: Semaphore;             // shared limiter (AICORE_MAX_CONCURRENT) for all completions + embeddings
function withRetries<T>(fn: () => Promise<T>, label: string): Promise<T>;
  // 429/RESOURCE_EXHAUSTED: own loop, max(AICORE_RETRY_COUNT,5), exp backoff + jitter (doesn't consume general budget)
  // timeout/network/5xx: AICORE_RETRY_COUNT retries, exp backoff. Non-retryable → throws immediately.

// mapping
function aiToCanonical(messages: AIMessage[]): CanonicalMessage[];
function canonicalToHarmonized(messages): HarmonizedMessage[];
function toHarmonizedTools(tools: ToolSchema[]): HarmonizedTool[];

// model-family classification
function identifyModel(modelId): ModelIdentity;  // {normalized,family,major?,minor?,isOSeries,isEmbedding}
function isReasoningClass(id): boolean; function supportsThinking(id): boolean;
function supportsVision(id): boolean;   function supportsToolCalling(id): boolean;
type ModelFamily = 'gemini'|'claude'|'gpt'|'nova'|'unknown';
```

**Removed from `/llm` in 3.0.0:** `createGeminiContextCache()`, `completeWithGeminiCache()` (Gemini `cachedContents` is deployment-native; use Anthropic `cache_control` prompt caching on Claude models instead).

**Activity → thinking-budget config key:** no built-in mapping — the budget key is whatever `budgetKey` the host set on the registered `AiActivity`; applied only if the routed model supports thinking (graceful degradation), skipped for unregistered activities.

**Reasoning-param handling (automatic):** o1/o3/o4 + gpt-5 non-chat → drop `temperature`, use `max_completion_tokens`/`reasoning_effort`. Gemini 2.5 → `thinking_config.thinking_budget`; Gemini 3 → `thinking_level`; Claude → `thinking_budget`. `safetySettings` folded into `model_params.safety_settings` for Gemini family only. Never sent to unsupported models. Embeddings are intentionally **not** activity-routable (org-wide, corpus-bound).

## Backend — `/discovery`

```ts
interface DiscoveredModel { model: string; provider?; capabilities?: string[]; deprecated?; retirementDate?;
  version?; isLatest?; contextWindow?; inputTokenCost?; outputTokenCost?; streamingSupported?; inputTypes?: string[]; }
function discoverFoundationModels(opts?: { force?: boolean }): Promise<DiscoveredModel[]>;  // 5-min cache

interface ModelCapabilities { reasoning; toolCalling; vision; fast; embedding; }
interface ModelClassification { displayName; provider; capabilities: ModelCapabilities; sortOrder; }
function classifyModel(modelId: string): ModelClassification;
function inferProvider(modelId): string;         // Anthropic|Amazon|Meta|Mistral|OpenAI|Google|Unknown
function generateDisplayName(modelId): string;   // 'anthropic--claude-4-sonnet' → 'Claude 4 Sonnet'
function inferCatalogCapabilities(modelId): ModelCapabilities;
```
⚠️ `DiscoveredModel` has **`model`**, not `modelId` (`docs/05-integration-guide.md`'s example is still buggy in 3.0.0).

## Backend — `/adapter`

```ts
import { aiCore } from '@cnma/sap-aicore-integrate/adapter';   // singleton of internal AICoreAdapter
aiCore.getResourceGroup(): Promise<string>;
aiCore.getToken(): Promise<string>;
aiCore.getSdkDestination(): Promise<{ destinationName: string } | undefined>;  // undefined in env-credential mode (2.1.0)
aiCore.getRequestContext(): Promise<{ baseUrl: string; token: string; resourceGroup: string }>;
  // building block for raw AI-Core-native calls the harmonized API doesn't cover
  // (e.g. hosts reimplementing image embeddings resolve the deployment themselves via DeploymentApi)
aiCore.resetState(): void;
```
**Removed in 3.0.0:** `embedding()`, `batchEmbeddings()` (→ `getLlmProvider().embed/batchEmbed`), `imageEmbedding()`, `getGeminiDeployment()`. No events anywhere in the package. No streaming.

## React — `/react`

```tsx
interface AiModelManagementPageProps { api: AiModelApi; }
function AiModelManagementPage(props): JSX.Element;   // registry: sync button, search, grid/table toggle
                                                       // (localStorage 'aiModels.viewMode'), Active switch, badges,
                                                       // suitable-activities editor, sonner toasts
interface AiModelSelectionProps { api: AiModelApi; }
function AiModelSelection(props): JSX.Element;          // per-activity picker; MUST be inside react-hook-form <FormProvider>;
                                                       // reads/writes single 'aiAgentConfig' JSON field via useFormContext()
interface AiAgentConfigJsonProps { label?; tooltip?; rows?; disabled?; }   // (3.0.0)
function AiAgentConfigJson(props): JSX.Element;         // raw JSON editor for the SAME 'aiAgentConfig' field —
                                                       // render below AiModelSelection in the same FormProvider for
                                                       // two-way sync; validates JSON-object shape (blank = valid)
```

```ts
interface AiModelApi {
  getAIModels(): Promise<AIModelRecord[]>;
  updateAIModel(id: string, data: Partial<AIModelRecord>): Promise<void>;
  syncModels(): Promise<SyncModelsResult>;
  getAvailableModels(activity?: string): Promise<AvailableModel[]>;
}
function createAiModelApi(basePath: string, getAuthHeaders?: () => Record<string,string>): AiModelApi;
// endpoints: GET /AIModels?$orderby=provider asc,modelId asc · PATCH /AIModels('{id}') · POST /syncModels
//            GET /getAvailableModels(activity='...')  (unwraps CAP {value}; JSON.parses string result)

interface SyncModelsResult { synced: number; new: number; updated: number; total: number; error?: string; }
interface AvailableModel { model: string; provider?; displayName?; capabilities?: ModelCapabilities; suitableActivities?: string[] | null; }
interface AIModelRecord { ID; modelId; provider?; displayName?; active: boolean; capabilities?: string;
  suitableActivities?: string | null; sortOrder?; deprecated?; retirementDate?; version?; contextWindow?;
  inputTokenCost?; outputTokenCost?; streamingSupported?; inputTypes?: string; createdAt?; modifiedAt?; }
interface ModelCapabilities { reasoning?; toolCalling?; vision?; fast?; embedding?; }
```
No CSS / no i18n bundle ships — host provides Tailwind + `@cnma/react-ui` theme + optional `react-i18next` keys. `ProviderLogo` is **not** exported.

## Shared — `/react/shared` (both registries; browser-safe, no server/DOM imports)

```ts
// ── Activity registry (2.0.0) ──
interface AiActivity { key; label; description; requiredCapabilities?: string[]; budgetKey?: string; }
function registerActivities(defs: AiActivity[]): void;   // merge by key — re-registration wins
function getActivities(): AiActivity[];                  // all registered
function getActivity(key: string): AiActivity | undefined;
const MAX_ITERATIONS_KEY = 'maxIterations';              // aiAgentConfig key for agent-loop max iterations (global)
function modelSupportsThinking(modelId: string): boolean;  // browser-safe mirror of srv supportsThinking (KEEP IN SYNC);
                                                           // true for empty/unknown ids so the UI stays neutral

// ── Embedding-corpus registry (3.0.0) — sibling of the activity registry ──
interface EmbeddingCorpus {
  kind: string;            // stable key (host config, re-embed API, admin-UI row key)
  label: string; description: string;
  dim: number;             // fixed by the host's cds.Vector(n) schema — NOT admin-configurable
  schemaColumns?: string;  // where the width is declared (quoted in errors/docs)
  defaultModel: string;    // used when the tenant never saved a choice
  modelEnvVar?: string;    // env var overriding defaultModel pre-save
  dimEnvVar?: string;      // read only to WARN that it is ignored
}
function registerEmbeddingCorpora(defs: readonly EmbeddingCorpus[]): void;  // merge by kind; insertion order = UI order
function getEmbeddingCorpora(): EmbeddingCorpus[];
function getEmbeddingCorpus(kind: string): EmbeddingCorpus | undefined;
function getEmbeddingKinds(): string[];
function embeddingDim(kind: string): number;    // THROWS on unregistered kind (silent 0 would write wrong-width vectors)
function clearEmbeddingCorpora(): void;         // tests / re-bootstrap
```
Both registries start **EMPTY** and are **PER-BUNDLE** (server and browser each hold their own Map) — register on BOTH sides at bootstrap. `requiredCapabilities` is informational (admin-UI help text) — actual filtering is server-side via the model's `suitableActivities`. Corpora are NOT activities: an activity picks a per-object *chat* model; an embedding model is org-wide and immutable for a corpus's life (one corpus = one vector space).

## Host wiring summary

1. Define the app's `AiActivity[]` (and `EmbeddingCorpus[]` if it stores vectors) once in a shared module and register both at bootstrap — backend (CAP service `init()`) **and** frontend (app entry).
2. `using ... from '@cnma/sap-aicore-integrate/db/schema'`; `cds deploy`.
3. Define host `AdminService` projecting `AIModels` + `syncModels()` action + `getAvailableModels(activity)` function (`@requires:'admin'`).
4. Handlers: `syncModels` → `discoverFoundationModels({force:true})` + `classifyModel(m.model)` upsert; `getAvailableModels` → filter active + `suitableActivities`.
5. LLM calls: `resolveActivityModel(config, activity)` + `getLlmProvider().complete(messages, {model})` — and guarantee a model resolves (config or `AICORE_DEFAULT_MODEL`) or the call throws.
6. If the admin picks the embedding model: store it in the host DB, `configureEmbeddings({model, dim})` at bootstrap + on change, own the re-embed workflow.
7. Prod: bind `destination` service; create `AICORE` destination with `AI-Resource-Group` (no deployment properties). Local: `cds watch --profile hybrid`, or env-credential mode (`AICORE_SERVICE_KEY` + `AICORE_RESOURCE_GROUP`) with no binding at all.
8. React: `createAiModelApi('/admin', authHeaders)` → `AiModelManagementPage` / `AiModelSelection` (+ optional `AiAgentConfigJson`) — pickers inside `<FormProvider>`; components render only registered activities.

## Full sync handler (corrected — uses `m.model`)

```ts
import { discoverFoundationModels, classifyModel } from '@cnma/sap-aicore-integrate/discovery';
export default (srv) => {
  srv.on('syncModels', async () => {
    const models = await discoverFoundationModels({ force: true });
    let synced = 0, added = 0;
    for (const m of models) {
      const c = classifyModel(m.model);
      const existing = await SELECT.one.from('AIModels').where({ modelId: m.model });
      if (existing) await UPDATE('AIModels').where({ modelId: m.model })
        .with({ provider: c.provider, displayName: c.displayName, capabilities: JSON.stringify(m.capabilities ?? []) });
      else { await INSERT.into('AIModels').entries({ modelId: m.model, provider: c.provider,
        displayName: c.displayName, capabilities: JSON.stringify(m.capabilities ?? []), active: true, sortOrder: c.sortOrder }); added++; }
      synced++;
    }
    return JSON.stringify({ synced, new: added, updated: synced - added, total: models.length });
  });
};
```

## Gotchas (consolidated)

- **No deployment IDs (3.0.0)** — all `deploymentId*`/`modelName*` destination properties and `AICORE_DEPLOYMENT_ID_*` env vars are dead config; delete them. Everything routes by model name.
- **Removed APIs (3.0.0)** — `aiCore.embedding/batchEmbeddings/imageEmbedding/getGeminiDeployment`, `LlmProvider.embedImage`, `createGeminiContextCache`/`completeWithGeminiCache`. Migration: `getLlmProvider().embed/batchEmbed`; image embeddings + Gemini caching are host-owned on top of `aiCore.getRequestContext()`.
- **Embedding dim is hard-asserted** — a model producing a different width than `AICORE_EMBEDDING_DIM`/`configureEmbeddings` throws on every call. Model change ⇒ full re-embed (host-owned), similarity search off until done.
- **Two empty per-bundle registries** — forget `registerActivities()` and the model picker renders nothing / no thinking budgets apply; forget `registerEmbeddingCorpora()` and `embeddingDim(kind)` throws. Register BOTH on BOTH bundles.
- **No implicit model fallback (1.3.0)** — unresolved model throws `AI model not configured`; set `AICORE_DEFAULT_MODEL` or configure `aiAgentConfig` before rollout.
- Non-streaming (`chatCompletion` only) despite `streamingSupported` metadata.
- Host owns the service + `syncModels`/`getAvailableModels`; package ships only the entity.
- `DiscoveredModel.model`, not `modelId` (docs/05 example is still buggy).
- Retry/semaphore is automatic on all completions + embeddings; reuse `llmSemaphore`/`withRetries` for host raw calls instead of rolling your own.
- `finishReason` is the truncation guard (`'length'`/`'MAX_TOKENS'`) — check it after extraction-style calls.
- No CSS/i18n bundle; components need host Tailwind + `@cnma/react-ui`. `ProviderLogo` not public.
- Trust `package.json` peer ranges over `docs/02-dependencies.md`.
- `dist/` uncommitted — build (`npm run build`) before consuming via `file:` dep.
- `SyncModelsResult.updated` must be computed by the host handler.
- `modelSupportsThinking` (shared) mirrors srv `supportsThinking` — keep in sync when model families evolve.
- No streaming, extraction, prompt-builder, agent loop, HITL, chat-UI, vector store, or events — all host-owned.
