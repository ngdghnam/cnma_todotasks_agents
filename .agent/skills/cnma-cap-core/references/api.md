# @cnma/cap-core — Full API Reference

Verified against **v1.0.0** source. `dist/` is a build artifact (not committed); all subpaths resolve to `./dist/...` after `npm run build` / on the published package.

## Export map

| Import subpath | Exports |
|---|---|
| `@cnma/cap-core` | root barrel — re-exports all modules below |
| `@cnma/cap-core/core` | `CommonService`, `DBHandler`, `ActionResponse` |
| `@cnma/cap-core/text` | `CnmaTextBundle`, `getText`, `registerI18nMiddleware` |
| `@cnma/cap-core/destination` | `DestinationService` |
| `@cnma/cap-core/logger` | `logger` (default), `log`, `getLogger` |
| `@cnma/cap-core/response` | `ApiResponse`, `ServiceResponse`, `ValidationResponse` |
| `@cnma/cap-core/enum` | `HTTP_STATUS`, `HTTP_STATUS_2XX` |
| `@cnma/cap-core/interfaces` | type-only: `IApiResponse`, `IServiceResponse`, `IValidationResponse`, `ICommonService`, `Managed`, `IBulkUpdateData`, `IDestinationService` |
| `@cnma/cap-core/middleware` | `BTPServiceLogging`, type `ServiceCallLog` |
| `@cnma/cap-core/react` / `/react/shared` | `useBackendText` (⚠️ stub) |
| `@cnma/cap-core/db/*` | only `db/index.cds` exists — **defines nothing** |

## Dependencies

- **dependency:** `@cnma/react-ui@^1.0.16`
- **peerDependency (required):** `@sap/cds >=8.0.0`
- **optional peers (declared only in `peerDependenciesMeta`, npm won't warn):** `@sap/textbundle`, `@sap-cloud-sdk/http-client`, `@sap-cloud-sdk/connectivity`, `winston`, `react`, `react-dom`. Install whatever module you actually use.

## `@cnma/cap-core/core`

### `class CommonService implements ICommonService`
Base class to extend in handlers.
- `getMessage(textKey: string, params?: string[]): string` — reads `cds.context.i18n.getMessage`; returns the key itself if i18n missing (**never throws**).
- `buildServiceResponse<T>(statusCode: number, message: string, data?: T): IServiceResponse<T>`
- `buildValidationResponse<T>(valid: boolean, message: string): IValidationResponse<T>`
- `setCreateManaged(data: any, owner: string): void` — sets createdAt/By + modifiedAt/By (ISO strings).
- `setUpdateManaged(data: any, owner: string): void` — sets modifiedAt/By.

### `class DBHandler extends CommonService`
Generic CRUD; runs on `cds.tx(cds.context)`, commits/rolls back internally.
- `getData(queryCondition: any, entity: any, options?: { limit?: number; skip?: number }): Promise<ServiceResponse<any>>` — pass `'*'` to skip `.where()`.
- `batchCreateEntries(entries: any[], entity: any): Promise<ServiceResponse<any>>`

### `class ActionResponse` (static builders for OData action returns)
- `static ok<T>(message: string, data?: T): { success: true; message: string; data?: T }`
- `static error(message: string): { success: false; message: string }`

## `@cnma/cap-core/response`

- `class ApiResponse<T>` — `constructor(success, message, data?)`; fields `{ success, message, data }`.
- `class ServiceResponse<T>` — `constructor(statusCode, message, data?)`; `success` derived from `HTTP_STATUS_2XX`; `.toApiResponse(): IApiResponse<T>`.
- `class ValidationResponse<T>` — `constructor(valid, message)`; fields `{ valid, message }`; `.toApiResponse()` (data always null).

## `@cnma/cap-core/enum`

- `enum HTTP_STATUS` — OK=200, CREATED=201, ACCEPTED=202, NO_CONTENT=204, BAD_REQUEST=400, UNAUTHORIZED=401, FORBIDDEN=403, NOT_FOUND=404, CONFLICT=409, UNPROCESSABLE_ENTITY=422, TOO_MANY_REQUESTS=429, INTERNAL_SERVER_ERROR=500, BAD_GATEWAY=502, SERVICE_UNAVAILABLE=503, GATEWAY_TIMEOUT=504.
- `HTTP_STATUS_2XX = [OK, CREATED, ACCEPTED, NO_CONTENT]`.

## `@cnma/cap-core/text`

### `class CnmaTextBundle` (wraps `@sap/textbundle`; cached per `locale::path`)
- `static forLocale(locale: string, bundlePath: string): CnmaTextBundle`
- `static clearCache(): void`
- `getMessage(...)` — 6 overloads: `(key)`, `(key, string[])`, `(key, Record<string,string>)`, and the same three with a leading `namespace` (produces key `"<namespace>.<key>"`). Falls back to returning the key on failure.
- `getLocale(): string`

### `function getText(): CnmaTextBundle`
Returns the request-scoped bundle from `cds.context.i18n`. **Throws** `"[CnmaTextBundle] i18n not initialized..."` if the middleware was not registered.

### `function registerI18nMiddleware(bundlePath: string): void`
`bundlePath` = the `.properties` base path **without extension**. Internally hooks `cds.on('serving')` → `service.before('*')`, resolving locale from `req.locale || cds.context.locale || 'en'` and attaching a `CnmaTextBundle` to `cds.context.i18n`. Call once at bootstrap.

Text keys the package's own `DBHandler` references (define these in your bundle): `SERVICE_RETRIEVED_DATA`, `SERVICE_NO_DATA_FOUND`, `SERVICE_GET_DATA_FAILED_ENTITY` (`{0}` param), `ERR_VALIDATION`.

## `@cnma/cap-core/logger`

- `logger` — configured Winston instance (also default export). Level from `process.env.LOG_LEVEL || 'info'`. Colorized console + JSON base format.
- `log` — `{ info, warn, error, debug }(message, meta?)`.
- `getLogger(context: string)` — factory; returns the same 4 methods, each prefixing `[context]`.

## `@cnma/cap-core/destination`

### `class DestinationService`
Requires peers `@sap-cloud-sdk/connectivity` + `@sap-cloud-sdk/http-client` (lazy-required).
- `constructor(destinationName?: string = '')`
- `getDestinationName(): string`
- `getBTPDestination(): Promise<any | null>` — `{ destinationData, destinationConfig }` or `null`.
- `sendGetRequest(servicePath, requestPath): Promise<any>`
- `sendPostRequest(servicePath, requestPath, payload): Promise<any>` (fetches CSRF token)
- `sendPutRequest(servicePath, requestPath, payload): Promise<any>` (fetches CSRF token)

⚠️ Does **not** implement `delete`/`patch`/`fetchJwtToken`/`getAuthorizationTokenForSystemUser` despite `IDestinationService` declaring them.

## `@cnma/cap-core/middleware`

- `class BTPServiceLogging` (static): `logStart(destinationName, method, url, data?): ServiceCallLog`, `logSuccess(callLog, statusCode)`, `logError(callLog, error, statusCode?)`, `logDestinationRetrieval(destinationName, success, error?)`.
- `interface ServiceCallLog = { destinationName; method; url; startTime: number }`.

## `@cnma/cap-core/interfaces` (type-only)

- `IApiResponse<T> = { success; message; data: T | null }`
- `IServiceResponse<T> extends IApiResponse<T>` — adds `statusCode; toApiResponse()`
- `IValidationResponse<T> = { valid; message; toApiResponse() }`
- `ICommonService` — the `CommonService` method contract
- `Managed = { createdAt?; createdBy?; modifiedAt?; modifiedBy? }` (all `string`, optional) — a TS interface, **not** a CDS aspect
- `IBulkUpdateData = { condition: any; data: any }`
- `IDestinationService` — partly aspirational (see DestinationService gotcha)

## `@cnma/cap-core/react` (⚠️ stub)

- `useBackendText(): { getText: (key: string) => string }` — `getText` currently returns the key unchanged (OData function import not implemented). No components ship.

## Gotchas (consolidated)

- Import subpaths are flat (`/core`, `/text`, …) — `/srv/...` paths in docstrings are wrong.
- No CDS entities; no working React; `dist/` uncommitted; optional peers under-declared.
- `getText()` throws when unwired; `CommonService.getMessage()` does not.
- No `CHANGELOG.md`; only 3 commits of history.
