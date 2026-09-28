# CAP Init - Initialize SAP CAP Project

> Initialize a new SAP CAP project following CNMA Clean Architecture structure.

## Usage

`/cap-init [--variant] [--java] [--full] [--frontend react|ui5]`

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--variant` | Include VariantSettings table and handlers | false |
| `--java` | Use Java backend (default: Node.js TypeScript) | false |
| `--full` | Generate full CAP with UI (DB+SRV+UI) | false |
| `--frontend` | Frontend type: `react` (Flat + @cnma/react-ui), `ui5` | react |

## Arguments

If flags are not provided, the command will prompt for:

1. **Project Name** — e.g., `cnma_notification_service`
2. **Namespace** — e.g., `cnma.notification` (dot-separated lowercase)
3. **Service Name** — e.g., `Test` (or leave blank for default)
   > **Default**: `Test` → `Test.cds`, `TestService`
4. **Backend Language** — Node.js TypeScript ★ or Java
5. **Project Type** — Full CAP (DB+SRV+UI) or Backend Only (DB+SRV)
6. **Frontend Type** — React v2 ★ or UI5 Freestyle (if Full CAP)
7. **Variant Management** — Yes/No

## Placeholder Mapping

| Placeholder | Replace With |
|-------------|--------------|
| `{{project_name}}` | Project's MTA name |
| `{{namespace}}` | Dot-notation namespace |
| `{{module_name}}` | Extracted from namespace (e.g., `notification`) |
| `{ServiceName}` | User-provided service name |
| `{{FeatureName}}` | Feature class name (PascalCase) |
| `{{feature_name}}` | Feature folder name (kebab-case) |

## CAP Standard Structure (Identical for Java and Node.js)

```
{{project_name}}/
├── db/
│   ├── schema/
│   │   └── *.cds              # CDS schema (namespace: {{namespace}})
│   └── undeploy.json          # EMPTY before deployment
└── srv/
    ├── {ServiceName}.cds      # Service definition
    ├── src/                   # Domain-driven source (Java: srv/src/main/java/cnma/)
    │   ├── common/            # Shared (interfaces, models, exceptions, services, util)
    │   ├── config/            # Application configuration
    │   ├── domain/            # Feature-based (SRP)
    │   │   └── __feature__/
    │   │       ├── handler/   # Event registration (SRP)
    │   │       ├── events/    # Event logic (OnRead*, OnBefore*, OnAfter*)
    │   │       ├── model/     # Entity & DTO
    │   │       ├── repository/ # Data access (CQN)
    │   │       └── service/   # Business logic (DIP)
    │   └── infrastructure/   # External systems (DIP)
    │       ├── database/      # DB operations
    │       ├── integration/   # External APIs (btp/, erp/, messaging/)
    │       ├── middleware/    # Request/response logging
    │       └── security/      # Auth & authorization
    ├── index.ts               # Module entry (Node.js only)
    └── server.ts              # CAP bootstrap (Node.js only)
```

## Architecture Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **domain/handler/** | `domain/*/handler/` | Event registration only |
| **domain/events/** | `domain/*/events/` | Event logic (OnRead*, OnBeforeCreate*, etc.) |
| **domain/service/** | `domain/*/service/` | Business logic (DIP) |
| **domain/repository/** | `domain/*/repository/` | Data access (CQN) |
| **infrastructure/database/** | `infrastructure/database/` | DB operations |
| **infrastructure/integration/** | `infrastructure/integration/` | External APIs |

## Examples

```bash
# Interactive mode
/cap-init

# Quick Node.js backend only
/cap-init --full

# Java backend with variant management
/cap-init --java --variant

# Full CAP with UI5 frontend
/cap-init --full --frontend ui5
```

## Notes

- **HDI Container Protection**: `db/undeploy.json` must be empty before deployment
- **Namespace Convention**: Always `cnma.{module_name}` (dot-separated lowercase)
- **Java/Node.js Parity**: Both implementations use IDENTICAL folder structure
- **UI Namespace**: Derived by replacing dots with `/` → `cnma/notification/app`
