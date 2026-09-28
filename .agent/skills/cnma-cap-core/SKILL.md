---
name: cnma-cap-core
description: Consume the internal @cnma/cap-core package in a SAP CAP host app — shared service base classes (CommonService, DBHandler), typed response envelopes (ApiResponse/ServiceResponse/ValidationResponse), i18n text bundle, Winston logger, BTP destination client, and HTTP status enums. Use when wiring cross-cutting backend plumbing instead of re-inventing it.
---

# @cnma/cap-core Skill

**Package:** `@cnma/cap-core` · **Verified against:** v1.0.0 source (`srv/`, `db/`, `react/`).

`@cnma/cap-core` is the **foundation layer** every CNMA CAP app builds on. It ships shared TypeScript utilities — NOT CDS entities. Reach for it before writing your own response wrapper, logger, i18n resolver, or destination client.

## When to Use

- Standardizing action/function return shapes → use `ApiResponse` / `ServiceResponse` / `ValidationResponse`.
- Extending a base service with managed-field + i18n helpers → extend `CommonService`.
- Generic CRUD in a handler → `DBHandler`.
- Structured logging (no `console.log`, per coding standards) → `getLogger('MyContext')`.
- Reading i18n `.properties` text server-side → `registerI18nMiddleware` + `getText()`.
- Calling an S/4HANA / external system via a BTP destination → `DestinationService`.

## ⚠️ Reality Check (source-verified, README drifts)

Read these before copying anything from the package README:

1. **Import subpaths are FLAT**, not under `/srv`. Use `@cnma/cap-core/core`, `@cnma/cap-core/text`, `@cnma/cap-core/logger`, `@cnma/cap-core/response`, `@cnma/cap-core/destination`, `@cnma/cap-core/enum`, `@cnma/cap-core/interfaces`, `@cnma/cap-core/middleware`, or the root barrel `@cnma/cap-core`. Docstrings that say `@cnma/cap-core/srv/text` are **wrong** and will fail to resolve.
2. **No CDS entities ship.** `db/index.cds` is empty/commented; `db/variant-setting.cds` and `db/audit-log.cds` do **not** exist. Do not `using ... from '@cnma/cap-core/db/...'` expecting entities.
3. **React is a stub.** Only `useBackendText()` is exported and it currently returns the key verbatim (TODO upstream). Do not document/use it as working UI.
4. **`dist/` is not committed** — module resolution works from the npm-published package (built via `prepublishOnly`), but a raw `file:`/git dependency needs `npm run build` first.
5. **Optional peers are under-declared** (`winston`, `@sap/textbundle`, `@sap-cloud-sdk/*`, `react`) — npm won't warn if missing; failures appear at runtime. Install what you use.

## Core Recipes

### Typed response envelopes
```ts
import { ServiceResponse, ValidationResponse } from '@cnma/cap-core/response';
import { HTTP_STATUS } from '@cnma/cap-core/enum';

// success flag is derived from a 2xx statusCode
return new ServiceResponse(HTTP_STATUS.OK, 'Loaded', rows).toApiResponse();
return new ValidationResponse(false, 'companyCode is required').toApiResponse();
```

### Extend the base service
```ts
import { CommonService, ActionResponse } from '@cnma/cap-core/core';

export class InvoiceHandler extends CommonService {
  async onSubmit(req: any) {
    const msg = this.getMessage('inv.SUBMITTED');   // i18n; returns the key if i18n absent (never throws)
    this.setUpdateManaged(req.data, req.user.id);    // stamps modifiedAt/By
    return ActionResponse.ok(msg, { id: req.data.ID });
  }
}
```

### Generic CRUD
```ts
import { DBHandler } from '@cnma/cap-core/core';
const db = new DBHandler();
const res = await db.getData('*', MyEntity, { limit: 50 });   // '*' skips .where()
await db.batchCreateEntries(rows, MyEntity);
```

### Structured logging
```ts
import { getLogger } from '@cnma/cap-core/logger';
const log = getLogger('InvoiceProcessor');   // prefixes every line with [InvoiceProcessor]
log.info('Processing invoice', { id });
log.error('Extraction failed', { err });      // level via process.env.LOG_LEVEL (default 'info')
```

### i18n text bundle (server-side)
```ts
// srv/server.ts — wire ONCE at bootstrap. bundlePath = base path, NO extension.
import cds from '@sap/cds';
import path from 'path';
import { registerI18nMiddleware } from '@cnma/cap-core/text';
cds.on('bootstrap', () => registerI18nMiddleware(path.join(__dirname, 'i18n', 'i18n')));
export default cds.server;

// in a handler:
import { getText } from '@cnma/cap-core/text';
return getText().getMessage('inv.greeting', ['Ada']);   // ⚠️ THROWS if middleware not registered
```
> `CommonService.getMessage()` is the safe variant (returns the key, never throws). `getText()` throws if unwired. Pick per call site.

### BTP destination client
```ts
import { DestinationService } from '@cnma/cap-core/destination';
const s4 = new DestinationService('S4_DEST');           // requires @sap-cloud-sdk/* peers
const data = await s4.sendGetRequest('/sap/opu/odata/...', '/SupplierSet');
// Implemented: get/post/put + getBTPDestination. NOT implemented despite the interface: delete/patch/JWT helpers.
```

## Deep API reference

Full export table, method signatures, interface shapes, and every gotcha: **[references/api.md](references/api.md)**.

## Standards Alignment

- ✅ Satisfies the "no `console.log`, use structured logging" rule (`rules/coding-standards.md`) via `getLogger`.
- ✅ Response envelopes give a DRY, single-shape API return across handlers.
- ✅ BTP-native (`rules/simplicity-manifesto.md`): destination client uses SAP Cloud SDK, not a bespoke HTTP stack.
