---
name: cnma-cap-backend
description: Unified skill to scaffold and develop SAP CAP backend projects in either Java or Node.js following Conarum Clean Architecture.
---

# CNMA CAP Unified Backend Skill

## Purpose
Provide a single entry point for scaffolding and implementing SAP CAP backend modules. This skill supports both **Java** and **Node.js (TypeScript)** options, ensuring that regardless of the language choice, the project follows Conarum's **Clean Architecture** and **SOLID** standards.

## When to Use
- Initializing a new SAP CAP project.
- Adding a new service/module to an existing workspace.
- Refactoring backend code to meet professional architectural standards.

---

## MANDATORY: Language Selection
**When invoked, the Agent MUST check the context for `backend_language` parameter:**
- If `backend_language` is not provided, ask the User:
  > "Which language option would you like to use for this project?
  > 1. **Java** (Clean Architecture, Lombok, CQN)
  > 2. **Node.js TypeScript** (Clean Architecture, Strict Mode, cds.ql) ★ [default]"

- **Default**: If the user does not specify, use **Node.js TypeScript**.

**Template Selection:**
- `templates/db/` — Shared database schema (CDS definitions)
- `templates/java/` — Java backend templates
- `templates/node/` — Node.js TypeScript templates

---

## CAP Standard Structure

Both Java and Node.js follow the SAME CAP project structure:

```
CAP_PROJECT/
├── _i18n/                     # Localization (i18n.properties)
├── db/                        # Database layer (SHARED across backends)
│   ├── schema/                # CDS schema definitions
│   │   ├── SampleEntity.cds    # Template entity
│   │   └── VariantSettings.cds # Variant management (optional)
│   └── undeploy.json          # [IMPORTANT] Must be empty []
├── app/                       # UI layer (Full CAP only)
└── srv/                       # Service layer
    ├── {ServiceName}.cds     # Service definition (Node.js & Java)
    ├── src/                  # Source code (domain-driven)
    │   ├── common/           # Shared (dto, enums, exception, interfaces, model, service, util)
    │   ├── config/           # Application configuration
    │   ├── domain/           # DOMAIN LOGIC (Feature-based)
    │   │   └── __feature__/ # Feature module
    │   │       ├── handler/  # Event registration (SRP)
    │   │       ├── events/   # Event logic (OnRead*, OnBefore*, OnAfter*)
    │   │       ├── model/    # Entities & DTOs
    │   │       ├── repository/ # Data access (CQN)
    │   │       └── service/  # Business logic (DIP)
    │   └── infrastructure/  # EXTERNAL SYSTEMS
    │       ├── database/    # DB operations & transactions
    │       ├── integration/ # External integrations
    │       │   ├── btp/    # SAP BTP (Destination Service)
    │       │   ├── erp/    # SAP ERP (S/4HANA)
    │       │   └── messaging/ # Event Mesh
    │       ├── middleware/  # Request/response logging
    │       └── security/    # Auth & authorization
    ├── index.ts             # Module entry (Node.js)
    └── server.ts            # CAP bootstrap (Node.js only)
```

> **Note:** Java and Node.js structures are IDENTICAL at the folder level. Only file extensions differ.

---

## Architecture Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **domain/handler/** | `srv/src/domain/*/handler/` | Event registration (route to events/) |
| **domain/events/** | `srv/src/domain/*/events/` | Event logic (OnRead*, OnBefore*, OnAfter*) |
| **domain/service/** | `srv/src/domain/*/service/` | Reusable business logic |
| **domain/repository/** | `srv/src/domain/*/repository/` | Data access (CQN) |
| **infrastructure/database/** | `srv/src/infrastructure/database/` | DB operations & transactions |
| **infrastructure/integration/** | `srv/src/infrastructure/integration/` | External APIs (S/4HANA, BTP) |
| **infrastructure/messaging/** | `srv/src/infrastructure/messaging/` | Event publishing |
| **infrastructure/security/** | `srv/src/infrastructure/security/` | Auth & user context |

---

## Common Standards (Global)

### Service Name Convention (DEFAULT: `Test`)
If no service name is provided, use `Test` as default:
- Service file: `Test.cds`
- Service class: `TestService`
- Template placeholder: `{ServiceName}` → `Test`

### Namespace Convention (CRITICAL)
Every project **must** have a namespace prefix: `cnma.{module_name}` (dot-separated lowercase).

| Where | Format |
|-------|--------|
| CDS schema files | `namespace {{namespace}};` |
| CDS service definition | `using {{namespace}} as ns from '../db/...'` |
| `package.json` / Project name | `cnma_{module_name}_service` |

### CDS Event Naming Convention (MANDATORY)
**Pattern**: `On{Before|After}{CDS_Hook}{EntityName}Event`

| CDS Hook | Method/Class Pattern |
|----------|----------------------|
| `READ` | `onRead{Entity}` |
| `CREATE` | `onBeforeCreate{Entity}` / `onAfterCreate{Entity}` |
| `UPDATE` | `onBeforeUpdate{Entity}` / `onAfterUpdate{Entity}` |
| `DELETE` | `onAfterDelete{Entity}` |

### HDI Container Protection (CRITICAL)
After project initialization, **`db/undeploy.json` MUST be empty**:
```json
[]
```
Failure to do this will wipe all data in the shared HDI container.

---

## Java Backend

### Directory Structure
```
srv/src/main/java/cnma/{{module_name}}/
├── common/
│   ├── dto/
│   ├── enums/HttpStatusCode.java
│   ├── exception/ServiceException.java, ValidationException.java, NotFoundException.java
│   ├── interfaces/ICommon.java
│   ├── model/ApiResponse.java, ServiceResponse.java
│   ├── service/BaseService.java
│   └── util/AppLogger.java
├── config/
├── domain/__feature__/
│   ├── handler/BaseHandler.java, {{FeatureName}}Handler.java
│   ├── events/OnBeforeCreate{{FeatureName}}Event.java, OnAfterCreate{{FeatureName}}Event.java, etc.
│   ├── model/{{FeatureName}}.java, {{FeatureName}}DTO.java
│   ├── repository/{{FeatureName}}Repository.java
│   └── service/{{FeatureName}}Service.java
└── infrastructure/
    ├── database/DBHandler.java
    ├── integration/
    │   ├── btp/DestinationCloudService.java
    │   ├── erp/S4HANAClient.java
    │   └── messaging/MessagePublisher.java
    ├── middleware/BTPServiceLoggingMiddleware.java
    └── security/SecurityService.java, UserContext.java
```

### SOLID Principles
- **SRP**: Handler = routing, Service = logic, Repository = data
- **DIP**: Constructor injection only via `@RequiredArgsConstructor`

### Hard Rules
❌ **NEVER DO:**
1. God Handler (> 500 lines)
2. Field injection (`@Autowired`)
3. `db.run()` in handlers
4. `RuntimeException` (use `ServiceException`)
5. N+1 queries (use batch)
6. JPA `@Entity` (use CDS interfaces)

✅ **ALWAYS DO:**
1. Lombok (`@RequiredArgsConstructor`, `@Slf4j`, `@Data`)
2. Return `context.setResult()` in `@On` events
3. `CqnAnalyzer` for parameter extraction
4. Define entities in `.cds` first

---

## Node.js TypeScript Backend

### Directory Structure
```
srv/
├── src/
│   ├── common/
│   │   ├── dto/PaginationDTO.ts
│   │   ├── enum/HttpStatusCodeEnum.ts, BTPDestinationServices.ts
│   │   ├── exception/ServiceException.ts
│   │   ├── interfaces/ICommon.ts
│   │   ├── model/ActionResponse.ts, core/ApiResponse.ts
│   │   ├── repository/BaseRepository.ts
│   │   ├── service/BaseService.ts
│   │   └── util/DebugLogger.ts
│   ├── config/
│   ├── domain/__feature__/
│   │   ├── handler/BaseHandler.ts, {{FeatureName}}Handler.ts
│   │   ├── events/OnBeforeCreate{{FeatureName}}Event.ts, OnAfterCreate{{FeatureName}}Event.ts, etc.
│   │   ├── model/{{FeatureName}}Model.ts
│   │   ├── repository/{{FeatureName}}Repository.ts
│   │   └── service/{{FeatureName}}Service.ts
│   └── infrastructure/
│       ├── database/DBHandler.ts, index.ts
│       ├── integration/
│       │   ├── btp/DestinationCloudService.ts, index.ts
│       │   ├── erp/S4HANAClient.ts, index.ts
│       │   └── messaging/MessagePublisher.ts
│       ├── middleware/BTPServiceLoggingMiddleware.ts
│       └── security/SecurityService.ts
├── index.ts
└── server.ts
```

### SOLID Principles
- **SRP**: Handler = routing, Service = logic, Repository = data
- **DIP**: Constructor injection only

### Hard Rules
❌ **NEVER DO:**
1. `any` type (always use interfaces)
2. Business logic in handlers
3. Raw DB objects (map to DTO)
4. `console.log` (use `cds.log()`)
5. N+1 queries (use `.expand()`)

✅ **ALWAYS DO:**
1. TypeScript Strict Mode
2. `ApiResponse<T>` wrapper
3. Constructor injection
4. Unit tests for services

---

## Agent Verification Protocol (MANDATORY)

After scaffolding, run verification scripts:

**Java:**
```bash
node .agent/skills/cnma-cap-backend/scripts/check_java_imports.js
```

**Node.js:**
```bash
node .agent/skills/cnma-cap-backend/scripts/check_imports.js
node .agent/skills/cnma-cap-backend/scripts/verify-imports.js
```

---

## Development Manifesto
> *"Code is not just to run, code is for maintenance. Every line of code written must be a testament to professionalism, cleanliness, and architectural compliance."*
