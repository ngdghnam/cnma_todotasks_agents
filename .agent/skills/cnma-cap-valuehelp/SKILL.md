---
name: cnma-cap-valuehelp
description: Consume the internal @cnma/cap-valuehelp package in a SAP CAP host app — F4/Search-Help value lists (static JSON, reference-table, or external S/4 OData), backend ValueHelpHandler, AI prompt-injection + post-extraction validation for value-constrained fields, and 5 React widgets (Select/ComboBox/MultiSelect/SearchInput/SearchHelpDialog) plus a ValueHelpManager admin UI. Use when fields need a governed list of valid values or when AI extraction must be constrained to allowed codes.
---

# @cnma/cap-valuehelp Skill

**Package:** `@cnma/cap-valuehelp` · **Verified against:** v2.7.2 source (`dist/`, `db/`).

A centralized, DB-driven registry of valid values per field × document type — with React widgets, AI integration, and admin management. Namespace: **`cnma.valuehelp`**. One entity ships: **`ValueHelpList`**.

## When to Use

- A form field must offer a governed dropdown/search of allowed values (company codes, cost centers, tax codes…).
- AI document extraction must be constrained to valid values (prevent hallucinated codes) → `ValueHelpPromptInjector` + `ValueHelpValidator`.
- Values come from a static list, a reference table, or an external S/4HANA OData service.
- You need an admin page to manage value lists → `ValueHelpManager`.

## ⚠️ Reality Check (source-verified — the 37KB README's backend signatures are STALE)

**Trust the shipped `.d.ts`, not the README, for these two:**

1. `ValueHelpPromptInjector.injectConstraints(schema, promptParts): Promise<void>` — takes `(schema, promptParts)`, **mutates `promptParts` in place and returns `void`** (README shows it returning a string — wrong).
2. `ValueHelpValidator.validate(schema, extractedData, logCallback?): Promise<string[]>` — `schema` is the **first** arg; returns a **warning array** (warn-only, never blocks/rejects).

Also:
3. **`baseUrl` defaults to `/odata/v4/extraction`** on every widget/hook — almost always override it to your host service path.
4. **External `sourceType` silently returns `[]` + a warning if no `externalFetcher`** is passed to `ValueHelpHandler` — wire the fetcher or external helps appear empty.
5. Version skew: `package.json` = 2.7.2 but CHANGELOG stops at 2.6.7 — verify against source if you rely on a 2.7 feature.
6. Two React peers are effectively required (not optional): `@radix-ui/react-checkbox`, `@radix-ui/react-popover`.

## CDS Entity

Import the entity **into the service `.cds`** with an alias — **never into `db/schema.cds`** (avoids CDS circular refs with `file:` deps):
```cds
using { ValueHelpList as vh_ValueHelpList } from '@cnma/cap-valuehelp/db/valuehelp';
```
`ValueHelpList` (`cuid, managed`) drives everything via `sourceType` = `'static' | 'reference' | 'external'`. Key fields: `valueHelpID!`, `objectType!`, plus source-specific config (`staticEntries` JSON / `referenceTable`+`keyColumn`+`textColumn` / `externalEndpoint`+`externalMethod`+`externalResponsePath`), `returnMapping` (auto-fill), `searchConfig`, `injectIntoPrompt`, `disableValidation`. Full field list in [references/api.md](references/api.md).

## Backend Recipes

### Service definition (host owns the actions; package ships only the entity)
```cds
using { ValueHelpList as vh_ValueHelpList } from '@cnma/cap-valuehelp/db/valuehelp';
service MyService @(path: '/odata/v4/myservice') {
  @readonly entity ValueHelpList as projection on vh_ValueHelpList;
  action getValueHelp(valueHelpID: String, objectType: String, dependsOnValue: String) returns array of String;
  action getValueHelpSearch(valueHelpID: String, objectType: String, searchTerm: String,
                            filters: String, top: Integer, skip: Integer) returns String;
}
```

### Handler wiring
```ts
import { ValueHelpHandler } from '@cnma/cap-valuehelp/srv';
import type { ExternalFetcher } from '@cnma/cap-valuehelp/srv';

module.exports = (srv: any) => {
  const externalFetcher: ExternalFetcher = async (endpoint, options) => {
    // call S/4 via Cloud SDK / DestinationService; return { rows, total }
    return { rows: [], total: 0 };
  };
  const h = new ValueHelpHandler({
    entityName: 'ValueHelpList',                                    // CDS-runtime entity name
    allowedReferenceTables: { Suppliers: 'your.ns.Suppliers' },     // short → FQ CDS name
    externalFetcher,                                                // omit → external returns []
  });
  srv.on('getValueHelp',       h.getValueHelp.bind(h));
  srv.on('getValueHelpSearch', h.getValueHelpSearch.bind(h));
};
```

### Admin CRUD guard
```ts
srv.before(['CREATE','UPDATE'], 'ValueHelpList', h.beforeSave.bind(h));
```

### AI prompt injection (constrain extraction) — SHIPPED signature
```ts
import { ValueHelpPromptInjector } from '@cnma/cap-valuehelp/srv';
const injector = new ValueHelpPromptInjector({
  valueHelpEntity: 'ValueHelpList',
  systemConfigEntity: 'SystemConfiguration',
  thresholdKey: 'AI_VALUE_HELP_PROMPT_THRESHOLD',
});
await injector.injectConstraints(schema, promptParts);   // mutates promptParts, returns void
```

### Post-extraction validation — SHIPPED signature
```ts
import { ValueHelpValidator } from '@cnma/cap-valuehelp/srv';
const validator = new ValueHelpValidator({ valueHelpEntity: 'ValueHelpList' });
const warnings: string[] = await validator.validate(schema, extractedData, logCallback); // warn-only
```

## React Recipes

```tsx
import { ValueHelpSelect, ValueHelpSearchInput, ValueHelpManager } from '@cnma/cap-valuehelp/react';
import '@cnma/cap-valuehelp/react/valuehelp.css';   // required for widget styling

// Form field
<ValueHelpSelect
  objectType="INV" valueHelpID="companyCodes"
  value={form.companyCode} onChange={(v) => setField('companyCode', v)}
  baseUrl="/odata/v4/myservice"                      // ⚠️ override the /odata/v4/extraction default
/>

// Admin CRUD — saves via ref
const ref = useRef<ValueHelpManagerRef>(null);
<ValueHelpManager ref={ref} objectType="INV" serviceUrl="/odata/v4/admin" httpClient={axios} />
// later: await ref.current?.savePendingChanges();
```

Widgets: `ValueHelpSelect`, `ValueHelpComboBox`, `ValueHelpMultiSelect` (no batch auto-fill), `ValueHelpSearchInput`, `SearchHelpDialog`. Hooks: `useValueHelp`, `useSearchHelp`. Props tables in [references/api.md](references/api.md).

## Deep API reference

Full `ValueHelpList` fields, `ValueHelpConfig`/`ExternalFetcher` shapes, all widget props + hooks, and every gotcha: **[references/api.md](references/api.md)**.

## Standards Alignment

- ✅ `security-basics.md` input validation: governs allowed values at source; validator flags invalid extracted codes.
- ✅ DRY: one registry instead of per-form hardcoded lists.
- ✅ AI guardrails: prompt injection + validation reduce hallucinated values (ties to `ai-engineering` skill).
