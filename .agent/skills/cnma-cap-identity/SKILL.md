---
name: cnma-cap-identity
description: Consume the internal @cnma/cap-identity package in a SAP CAP host app — Shadow Directory (ShadowUsers/Groups/Members), JIT user provisioning from IAS/XSUAA, SAML group sync, UUID-based managedWithUser audit aspect, the /identity + /identity-admin services, and the React OrganizationManager admin UI. Use when the app needs a local user/group directory, first-login provisioning, or an org-management page.
---

# @cnma/cap-identity Skill

**Package:** `@cnma/cap-identity` · **Verified against:** v1.0.25 source (`dist/`, `db/`, `srv/`, `react/`).

Provides a **Shadow Directory** — a local mirror of IDP users/groups — plus JIT provisioning, SAML group sync, and an admin UI. Namespace for all CDS entities: **`cnma.identity`**. Requires `@cnma/react-ui` (both a real dependency `^1.0.9` and a peer).

## When to Use

- The app must reference users/groups locally (FK to a `ShadowUsers` UUID) rather than raw IDP strings.
- Users should be auto-created on first login (JIT) → `IdentityProvisioner.provisionUser` in a `before('*')` hook.
- SAML group claims must sync to local group memberships.
- You want UUID-based audit fields (`createdBy`/`modifiedBy` → ShadowUsers) → `managedWithUser` aspect + `ManagedUserHandler`.
- You need an org-management admin page → React `OrganizationManager`.
- You need to resolve an IDP user id → ShadowUser UUID (single or bulk) → `UserResolverHelper`.

## ⚠️ Reality Check (source-verified)

1. **Admin base URL mismatch.** The shipped `IdentityAdminService` is at `/identity-admin` (OData base `/odata/v4/identity-admin`), but `OrganizationManager`'s `baseUrl` **defaults to `/odata/v4/admin`** and README examples use `/odata/v4/admin`. **Always pass `baseUrl` explicitly** to match your deployment. `UserPreferencesDialog`/`Page` also default to `/odata/v4/admin` while `IdentityService` lives at `/identity`.
2. **Only `OrganizationManager` is practically consumable standalone.** The individual tabs (`UsersTab`, `GroupsTab`, …) need an `IdentityAdminService` instance that is **not exported** from any public subpath; the barrel `IdentityTabProps` type does not match their real props. Use `OrganizationManager` (it builds the service internally).
3. **No `identityService` singleton** — the `react/service` docstring is wrong. Use the `createIdentityService(httpClient, baseUrl)` factory.
4. **Two `ShadowUser` types differ** — backend (`@cnma/cap-identity/srv`, dates as `Date`) vs React (`@cnma/cap-identity/react`, dates as ISO strings, includes `memberships[]`). Don't cross-import.
5. **`i18n` import is a side-effect** that injects the `identity` namespace into the shared i18next singleton without calling `.init()` — the host owns init.
6. **Seed CSVs** ship as bare `db/data/Themes.csv` / `Languages.csv` (not the `namespace-Entity.csv` convention) — confirm they load in your build.

## CDS Entities

```cds
using { cnma.identity.ShadowUsers }       from '@cnma/cap-identity/db/identity';
using { cnma.identity.ShadowGroups }      from '@cnma/cap-identity/db/identity';
using { cnma.identity.GroupMembers }      from '@cnma/cap-identity/db/identity';
using { cnma.identity.SupportTypes }      from '@cnma/cap-identity/db/identity';
using { cnma.identity.SamlGroupMappings } from '@cnma/cap-identity/db/identity';
using { cnma.identity.managedWithUser }   from '@cnma/cap-identity/db/common';
```
Also available: `Themes`, `Languages`, `UserSettings`. **`ShadowUsers` are JIT-provisioned only — never create them manually.** Full field list in [references/api.md](references/api.md).

Opt-in UUID audit aspect:
```cds
using { cnma.identity.managedWithUser } from '@cnma/cap-identity/db/common';
entity MyEntity : cuid, managedWithUser { title : String; }   // createdBy/modifiedBy = FK to ShadowUsers
```

## Backend Recipes

### JIT provisioning (first-login auto-create)
```ts
import cds from '@sap/cds';
import { IdentityProvisioner } from '@cnma/cap-identity/srv';

export default class MyService extends cds.ApplicationService {
  async init() {
    this.before('*', async (req) => {
      if (req.user?.id) await IdentityProvisioner.provisionUser(req.user); // 5-min debounce cache
    });
    await super.init();
  }
}
```

### Register the shipped Identity service handler (only if host renames/defines it)
```ts
// srv/server.ts — redundant if you let CAP auto-discover the shipped IdentityService
import { IdentityServiceHandler } from '@cnma/cap-identity/srv';
cds.on('served', (services) => {
  for (const srv of services)
    if (srv.name === 'IdentityService') new IdentityServiceHandler(srv as cds.ApplicationService).register();
});
```

### managedWithUser audit population
```ts
import { ManagedUserHandler } from '@cnma/cap-identity/srv';
// inside init(): sets createdBy_ID / modifiedBy_ID on CREATE/UPDATE
new ManagedUserHandler(this).register();
```

### Resolve IDP id → ShadowUser UUID (batch, N+1-safe)
```ts
import { UserResolverHelper } from '@cnma/cap-identity/srv';
const resolver = new UserResolverHelper(this);
const map = await resolver.resolveMultipleUsers(userIds);  // Map<idpId, uuid>
```

### Admin scope
Map `$XSAPPNAME.admin` in `xs-security.json` (the admin service `@requires: 'admin'`).

## React Recipes

```tsx
import { OrganizationManager } from '@cnma/cap-identity/react';
import '@cnma/cap-identity/react/identity.css';   // classes prefixed 'ci-'
import '@cnma/cap-identity/react/i18n';           // side-effect: registers 'identity' ns

<OrganizationManager
  httpClient={httpClient}                          // { get, post, patch, delete }
  baseUrl="/odata/v4/identity-admin"               // ⚠️ set to your real admin path
  onError={(m) => toast.error(m)}
  onSuccess={(m) => toast.success(m)}
/>
```

User preferences (theme/language):
```tsx
import { UserPreferencesDialog, createIdentityService } from '@cnma/cap-identity/react';
const svc = createIdentityService(httpClient, '/odata/v4/identity'); // NOT a singleton — factory
<UserPreferencesDialog open={open} onOpenChange={setOpen} httpClient={httpClient} baseUrl="/odata/v4/identity" />
```

## Deep API reference

Every entity's fields, all 5 backend classes, all React components/props/hooks, i18n and CSS details, and the full gotcha list: **[references/api.md](references/api.md)**.

## Standards Alignment

- ✅ `security-basics.md`: RBAC via `@requires` on the shipped services; admin scope mapped in XSUAA.
- ✅ `simplicity-manifesto.md` "BTP Native" test: JIT provisioning off the IDP token — no bespoke user store or Keycloak.
- ✅ Layered architecture: package ships Service/Handler/Processor internally; host only wires hooks.
