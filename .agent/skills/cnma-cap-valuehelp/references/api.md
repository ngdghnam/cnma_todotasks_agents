# @cnma/cap-valuehelp — Full API Reference

Verified against **v2.7.2** source (shipped `.d.ts` is authoritative over the README). CHANGELOG lags at 2.6.7.

## Export map

| Import specifier | Resolves to |
|---|---|
| `@cnma/cap-valuehelp/db/*` | raw `db/*` (e.g. `/db/valuehelp` → `valuehelp.cds`) |
| `@cnma/cap-valuehelp/srv` | `dist/srv/index.(d.ts/js)` |
| `@cnma/cap-valuehelp/react` | `dist/react/index.(d.ts/js)` |
| `@cnma/cap-valuehelp/react/valuehelp.css` | stylesheet |

No root export — use the subpaths. Peers: `@sap/cds >=7`, `react`/`react-dom >=18`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, Radix set. **Effectively required (not in `peerDependenciesMeta`): `@radix-ui/react-checkbox`, `@radix-ui/react-popover`.**

## CDS entity `ValueHelpList` (namespace `cnma.valuehelp`, `cuid, managed`)

Import: `using { ValueHelpList as vh_ValueHelpList } from '@cnma/cap-valuehelp/db/valuehelp';`
Unique: `@assert.unique.valueHelpPerObject: [valueHelpID, objectType]`.

| Field | Type / default | Purpose |
|---|---|---|
| `valueHelpID` | String(100) `@mandatory` | logical id referenced by widgets |
| `objectType` | String(50) `@mandatory` | document type scope |
| `description` | String(255) | |
| `sourceType` | String(20) = `'static'` | `static` \| `reference` \| `external` |
| `staticEntries` | LargeString | static: JSON `[{key,text,...}]` |
| `referenceTable` | String(100) | reference: source entity (short name) |
| `keyColumn` / `textColumn` | String(100) | reference: key/text columns |
| `filterColumn` / `defaultFilter` | String(100) / String(500) | reference: always-on `$filter` |
| `externalEndpoint` | String(500) | external: e.g. `"S4_DEST:/sap/opu/odata/.../F4_GLAccountSet"` |
| `externalMethod` | String(10) = `'GET'` | `GET` \| `POST` |
| `externalPayload` | LargeString | external POST body template (`{{var}}`) |
| `externalResponsePath` | String(500) | dot-path to result array |
| `externalContextFields` | String(500) | comma-separated row fields |
| `displayFormat` | String(20) = `'keyAndText'` | `keyOnly` \| `textOnly` \| `keyAndText` |
| `sortBy` | String(20) = `'text'` | `key` \| `text` |
| `dependsOn` | String(100) | cascading parent field |
| `returnMapping` | LargeString | JSON `[{sourceColumn,targetField}]` auto-fill |
| `searchConfig` | LargeString | JSON `{title,searchFields,resultColumns,returnField}` |
| `injectIntoPrompt` | Boolean = true | AI guard 1 |
| `isActive` | Boolean = true | |
| `disableValidation` | Boolean = false | opt out of on-blur "not found" warning (2.6.4) |

## Backend API — `@cnma/cap-valuehelp/srv`

```ts
import { ValueHelpHandler, ValueHelpPromptInjector, ValueHelpValidator } from '@cnma/cap-valuehelp/srv';
import type { ValueHelpConfig, ExternalFetcher, ExternalFetchResult,
              PromptInjectorConfig, ValidatorConfig } from '@cnma/cap-valuehelp/srv';
```

### `class ValueHelpHandler`
```ts
constructor(config: ValueHelpConfig)
interface ValueHelpConfig {
  entityName: string;                             // CDS-runtime name, e.g. 'ValueHelpList'
  allowedReferenceTables: Record<string,string>;  // short → FQ CDS entity
  externalFetcher?: ExternalFetcher;              // omit → external returns [] + warning
}
```
- `getValueHelp(req): Promise<string>` — JSON; response includes `config: { disableValidation }`; passes `req.locale` to fetcher.
- `getValueHelpSearch(req): Promise<string>` — F4 dialog data.
- `beforeSave(req): Promise<void>` — CREATE/UPDATE guard (required fields, JSON validity).

### `ExternalFetcher` (host implements)
```ts
type ExternalFetcher = (endpoint: string, options: {
  filter?: string; defaultFilter?: string;
  dependsOnColumn?: string; dependsOnValue?: string;
  searchFilters?: Record<string,string>;
  top?: number; skip?: number;
  language?: string;           // BCP-47 from req.locale → sap-language
  method?: string;             // 'GET' | 'POST'
  payloadTemplate?: string;    // POST body with {{var}}
  responsePath?: string;       // dot path to array
  contextValues?: Record<string,string>;
}) => Promise<ExternalFetchResult>;
interface ExternalFetchResult { rows: Record<string,unknown>[]; total?: number; }
```

### `class ValueHelpPromptInjector`
```ts
constructor(config: { valueHelpEntity: string; systemConfigEntity: string; thresholdKey?: string })
injectConstraints(schema: any, promptParts: string[]): Promise<void>   // mutates promptParts, returns void
```
Dual guard: per-list `injectIntoPrompt=true` AND global `SystemConfiguration.AI_VALUE_HELP_PROMPT_THRESHOLD` (default key).

### `class ValueHelpValidator`
```ts
constructor(config: { valueHelpEntity: string })
validate(schema: any, extractedData: any,
         logCallback?: (msg: string, level?: 'Info'|'Warning'|'Error') => Promise<void>): Promise<string[]>
```
Warn-only; returns array of warning strings; never rejects.

## React API — `@cnma/cap-valuehelp/react`

```tsx
import {
  ValueHelpSelect, ValueHelpComboBox, ValueHelpMultiSelect, ValueHelpSearchInput, SearchHelpDialog,
  ValueHelpManager, useValueHelp, useSearchHelp,
} from '@cnma/cap-valuehelp/react';
import '@cnma/cap-valuehelp/react/valuehelp.css';
```

### Shared widget props — `ValueHelpBaseProps`
```ts
{ value?: string; onChange?: (v: string) => void;
  objectType: string;   // REQUIRED
  valueHelpID: string;  // REQUIRED
  dependsOnValue?: string; contextValues?: Record<string,string>;
  displayFormat?: 'keyOnly'|'textOnly'|'keyAndText';
  disabled?: boolean; placeholder?: string; className?: string;
  baseUrl?: string;     // default '/odata/v4/extraction' — override
}
// WithBatchUpdate: onBatchFieldUpdate?: (updates: Record<string,any>) => void;
```

| Widget | Props | Notes |
|---|---|---|
| `ValueHelpSelect` | `ValueHelpBaseProps & WithBatchUpdate` | dropdown |
| `ValueHelpComboBox` | `ValueHelpBaseProps & WithBatchUpdate` | typeahead + free text |
| `ValueHelpMultiSelect` | `ValueHelpBaseProps` (no batch) | token/chip input |
| `ValueHelpSearchInput` | `ValueHelpBaseProps & WithBatchUpdate` | F4 opens on icon click only; respects `config.disableValidation` |
| `SearchHelpDialog` | `SearchHelpDialogProps` | `{ objectType; valueHelpID; dependsOnValue?; baseUrl?; onSelect(row, returnMapping); onClose() }` |

### `ValueHelpManager` (admin, `forwardRef`)
```ts
interface ValueHelpManagerProps { objectType: string; serviceUrl?: string /* '/odata/v4/admin' */; httpClient?: HttpClient; }
interface HttpClient { get(url); post(url,data); put(url,data); delete(url); } // each → Promise<{data:any}>; falls back to window.fetch
interface ValueHelpManagerRef { savePendingChanges(): Promise<boolean>; }      // call via ref
```

### Hooks
```ts
useValueHelp({ objectType, valueHelpID, dependsOnValue?, contextValues?, baseUrl? })
// → { entries: ValueHelpEntry[]; returnMapping: ReturnMapping[]; loading; error; config: {disableValidation?}; handleSelection(key)=>Record<string,any> }

useSearchHelp({ objectType, valueHelpID, baseUrl? })
// → { config: SearchConfig|null; results; total; loading; error; search(filters); paginate(skip); returnMapping }
```
Exported types: `ValueHelpEntry {key,text,[extra]}`, `ReturnMapping {sourceColumn,targetField}`, `SearchConfig {title,searchFields,resultColumns,returnField}`, `SearchField`, `ResultColumn`, base/hook prop types, admin types.

## Host wiring summary

1. Service `.cds`: `using ... as vh_ValueHelpList`; declare `getValueHelp`/`getValueHelpSearch` actions + `@readonly` projection.
2. Admin `.cds`: full-CRUD projection under `@requires:'admin'`.
3. Handler: `new ValueHelpHandler(config)`; bind `getValueHelp`/`getValueHelpSearch`; `before(['CREATE','UPDATE'], 'ValueHelpList', beforeSave)`.
4. AI: `injectConstraints(schema, promptParts)` in the extraction prompt build; `validate(schema, extractedData, logCallback)` after.
5. React: widgets with explicit `baseUrl`; `ValueHelpManager` via ref; import the CSS.

## Gotchas (consolidated)

- README backend sigs stale — use `injectConstraints(schema, promptParts): void` and `validate(schema, extractedData, logCallback?): string[]`.
- `baseUrl` default `/odata/v4/extraction` — override on every widget/hook.
- External source needs `externalFetcher` or returns `[]`.
- `entityName` (handler config) = runtime entity; `valueHelpEntity` (injector/validator) = FQ/runtime name of the projected entity.
- `isActive` filter introspects the reference entity at runtime (2.6.7) — safe against SAP common tables lacking `isActive`.
- `disableValidation` flows DB → response `config` → `useValueHelp().config` → `ValueHelpSearchInput` skips on-blur warning.
- `ValueHelpMultiSelect` has no `onBatchFieldUpdate` (no returnMapping auto-fill).
- `ValueHelpManager` saves via `ref.savePendingChanges()`; give it an `httpClient` (axios) or it uses `window.fetch`.
- Import `vh_ValueHelpList` only in service `.cds`, never `db/schema.cds`.
- Version skew 2.7.2 vs CHANGELOG 2.6.7.
