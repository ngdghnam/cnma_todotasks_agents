# @cnma/cap-identity — Full API Reference

Verified against **v1.0.25** source. `dist/` ships (CommonJS). No `CHANGELOG.md`.

## Export map

| Subpath | Contains |
|---|---|
| `@cnma/cap-identity/db/identity.cds` | all entities, namespace `cnma.identity` |
| `@cnma/cap-identity/db/common.cds` | `managedWithUser` aspect |
| `@cnma/cap-identity/srv` | backend barrel (5 classes) |
| `@cnma/cap-identity/srv/identity-service(.cds/.js)` | `IdentityService` def + impl (`/identity`) |
| `@cnma/cap-identity/srv/identity-admin-service(.cds/.js)` | `IdentityAdminService` def + impl (`/identity-admin`) |
| `@cnma/cap-identity/react` | React barrel |
| `@cnma/cap-identity/react/service` | `createIdentityService` factory |
| `@cnma/cap-identity/react/user/preferences` | preferences components |
| `@cnma/cap-identity/react/i18n` | side-effect ns injector (default export = i18next instance) |
| `@cnma/cap-identity/react/i18n/locales/en.json` | raw locale (de/ja in dist, not exported) |
| `@cnma/cap-identity/react/identity.css` | stylesheet, `ci-` prefixed classes |

## Dependencies / peers

- **dependency + peer:** `@cnma/react-ui` (`^1.0.9` dep, `>=1.0.0` peer).
- **optional peers:** `@sap/cds >=7`, `react`/`react-dom >=18`, `react-i18next >=14`, `i18next >=23`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`.

## CDS entities (namespace `cnma.identity`)

All `: cuid, managed` unless noted.

- **SupportTypes** — configurable principal types (USER/GROUP/TEAM…): `code String(20)!`, `name String(50)!`, `isEnabled Bool=true`, `description`, `icon String(50)`, `sortOrder Int=0`.
- **ShadowUsers** — JIT-provisioned only: `origin String(100)='sap.default'`, `userId String(100)!`, `idpUserId String(100)`, `email String(255)`, `firstName`, `lastName`, `displayName`, `isActive Bool=true`, `lastLoginAt Timestamp`, `memberships` (Assoc-many GroupMembers). `@assert.unique.idpIdentity: [origin, userId]`.
- **ShadowGroups**: `name String(100)!`, `description`, `type` (Assoc→SupportTypes, not null), `externalId String(255)`, `isActive Bool=true`, `groupEmail String(255)`, `emailNotificationMode String(20)='GROUP_ONLY'` (`GROUP_ONLY|MEMBERS_ONLY|BOTH`), `members` (Composition GroupMembers).
- **GroupMembers**: `user`(→ShadowUsers!), `group`(→ShadowGroups!), `memberRole String(50)='MEMBER'`, `source String(20)='MANUAL'` (`MANUAL|SAML|HR_SYNC`), `addedBy`(→ShadowUsers), `addedAt Timestamp`.
- **SamlGroupMappings**: `externalGroupName String(255)!`, `localGroup`(→ShadowGroups!), `isEnabled Bool=true`, `description`.
- **Themes**: `code String(30)!`, `name String(50)!`, `description`, `icon`, `sortOrder Int=0`, `isEnabled Bool=true`.
- **Languages**: `code String(10)!`, `name String(50)!`, `nativeName String(50)`, `sortOrder Int=0`, `isEnabled Bool=true`.
- **UserSettings** `: cuid, managedWithUser`: `user`(→ShadowUsers!), `theme`(→Themes), `language`(→Languages). Lazily provisioned on first `me()`.

### Aspect `managedWithUser` (from `db/common`)
`createdAt` (@cds.on.insert:$now), `createdBy`(→ShadowUsers), `modifiedAt` (@cds.on.insert+update:$now), `modifiedBy`(→ShadowUsers). UUID FK instead of string ids; requires `ManagedUserHandler` to populate.

### Shipped CDS services (auto-discovered when their `.cds` is in the model)
- **IdentityService** `@(path:'/identity')`, `@requires:'authenticated-user'` — read-only projections + writable UserSettings. Functions: `me() returns ShadowUsers`, `resolveGroupMembers(groupId: UUID) returns array of ShadowUsers`, `getUserGroups(userId: UUID) returns array of ShadowGroups`. Impl auto-registers `IdentityServiceHandler` + `UserSettingsHandler`.
- **IdentityAdminService** `@(path:'/identity-admin')`, `@requires:'admin'` — full CRUD + `importUsers(users: LargeString) returns LargeString`.

### Seed data
`db/data/Themes.csv`, `db/data/Languages.csv` — bare filenames (verify auto-load in host build).

## Backend API — `@cnma/cap-identity/srv`

Barrel exports exactly 5 classes:

### `IdentityProvisioner` (all-static, 5-min debounce cache)
- `static provisionUser(user: cds.User): Promise<ShadowUser | null>`
- `static getOrigin(user): string`
- `static getIdpUserId(user): string | undefined`
- `static getShadowUser(userId: string, origin?: string): Promise<ShadowUser | null>`
- `static getUserGroupIds(shadowUserId: string): Promise<string[]>`
- `static syncSamlGroups(shadowUser: ShadowUser, capUser: cds.User): Promise<void>`
- exports interface `ShadowUser` (backend shape, `Date` fields).

### `IdentityServiceHandler`
`constructor(srv: cds.ApplicationService)`; `register(): void`. Wires `me`/`resolveGroupMembers`/`getUserGroups`.

### `ManagedUserHandler`
`constructor(srv: cds.ApplicationService)`; `register(): void`. Sets `createdBy_ID`/`modifiedBy_ID` on CREATE/UPDATE. Only needed with `managedWithUser`.

### `UserResolverHelper`
`constructor(srv: cds.Service)`:
- `resolveUserUUID(userId, origin?): Promise<string | null>`
- `resolveMultipleUsers(userIds: string[], origin?): Promise<Map<string,string>>`
- `clearCache(): void`

### `UserImportHandler`
`constructor(srv: cds.ApplicationService)`; `register(): void`. Backs the `importUsers` action. Interfaces `ImportUserRow`, `ImportUserResult` (`status: 'created'|'exists'|'error'`).

**Not barrel-exported** (exist in dist; only if you wire services yourself): `UserSettingsHandler`, `UserSettingsProcessor`.

## React API — `@cnma/cap-identity/react`

```tsx
import {
  OrganizationManager,
  SupportTypesTab, UsersTab, GroupsTab, SamlMappingsTab, GroupMembersPanel,
  UserPreferencesDialog, UserPreferencesPage,
  i18n, createIdentityService,
} from '@cnma/cap-identity/react';
import type {
  SupportType, ShadowUser, ShadowGroup, GroupMember, SamlMapping,
  Theme, Language, UserSettings,
  IdentityHttpClient, OrganizationManagerProps, IdentityTabProps, UserPreferencesPageProps,
} from '@cnma/cap-identity/react';
import '@cnma/cap-identity/react/identity.css';
```

### `IdentityHttpClient` (host supplies)
```ts
{ get:<T=any>(url)=>Promise<T>; post:<T=any>(url,data?)=>Promise<T>;
  patch:<T=any>(url,data?)=>Promise<T>; delete:<T=any>(url)=>Promise<T>; }
```

### `OrganizationManager(props: OrganizationManagerProps)` — the only self-contained widget
- `httpClient: IdentityHttpClient` (required)
- `baseUrl?: string` (default `'/odata/v4/admin'` — **override to your admin path**)
- `onError?: (msg) => void`, `onSuccess?: (msg) => void`, `className?`

### Tab components — ⚠️ not standalone
`SupportTypesTab`/`UsersTab`/`GroupsTab`/`SamlMappingsTab` real props: `{ service: IdentityAdminService; onError?; onSuccess? }`. `GroupMembersPanel`: `{ group: ShadowGroup; service; onClose; onError?; onSuccess? }`. `IdentityAdminService` is **not exported** publicly → use `OrganizationManager`. The barrel `IdentityTabProps` type does **not** match real tab props.

### Preferences
- `UserPreferencesPage(props)`: `{ httpClient; baseUrl?; onError?; onSuccess? }`.
- `UserPreferencesDialog(props)`: `{ open; onOpenChange; httpClient; baseUrl?; onError?; onSuccess? }` (`UserPreferencesDialogProps` type not exported).

### `createIdentityService(httpClient, baseUrl)` — factory (no singleton)
Returns `{ getThemes, getLanguages, getUserSettings, getUserSettingsExpanded, createUserSettings({theme_ID?, language_ID?}), updateUserSettings(id, {...}) }`.

### i18n / CSS
- `import '@cnma/cap-identity/react/i18n'` — side-effect; injects `identity` ns into the shared i18next singleton (no `.init()`). Components use `useTranslation('identity')`. Locales: en/de/ja in dist (only en exported).
- `import '@cnma/cap-identity/react/identity.css'` — `ci-`-prefixed classes.

## Host wiring summary

1. Include entities in `db/schema.cds` via the `using` lines above.
2. JIT: `IdentityProvisioner.provisionUser(req.user)` in `before('*')`.
3. (Optional) manual `IdentityServiceHandler` registration on `served`.
4. (Optional) `ManagedUserHandler` if using `managedWithUser`.
5. Map `admin` scope in `xs-security.json`.
6. React `OrganizationManager` with explicit `baseUrl`.

## Gotchas (consolidated)

- Admin baseUrl mismatch (`/identity-admin` vs default `/odata/v4/admin`) — pass `baseUrl`.
- Tabs need the non-exported `IdentityAdminService` — use `OrganizationManager`.
- No `identityService` singleton — use `createIdentityService`.
- Backend vs React `ShadowUser` types differ — don't cross-import.
- `i18n` is a non-reinit side-effect import.
- Seed CSVs use bare entity filenames — verify they load.
- `@cnma/react-ui` is both dep and peer — keep versions compatible.
- `dist` is CJS despite `import`/`require`/`default` all pointing to the same `.js`.
