---
description: Initialize a new SAP CAP Project following CNMA Clean Architecture structure
---

This workflow guides the agent to create a new SAP CAP project by leveraging specialized skills.

# Step 0: Language Selection (MANDATORY)
**Before proceeding, the Agent MUST ask the User:**
> "Which language would you like to use for this CAP project?
> - **Node.js TypeScript** ★ (default) — Clean Architecture, TypeScript, cds.ql"
> - **Java** — Clean Architecture, Lombok, CQN"

**Default**: If the user does not specify, use **Node.js TypeScript**.

Set context variable: `backend_language` = `node` | `java`

# Step 1: Ask User for Project Details
If the user hasn't provided them, ask for:
1. **Project Name** (e.g., `cnma_notification_service`)
2. **Namespace** (e.g., `cnma.notification` — used in CDS schemas, UI5 module paths, manifest.json, etc.)
   > Convention: `cnma.{module_name}` using dot-separated lowercase. Examples:
   > - `cnma.notification` → DB namespace `cnma.notification`, UI5 namespace `cnma/notification/app`
   > - `cnma.sustainability.main` → DB namespace `cnma.sustainability.main`, UI5 namespace `cnma/sustainability/main`
3. **Service Name** (e.g., `Test` or leave blank for default)
   > **Default**: If not provided, use `Test` as the service name
   > Service file will be: `{ServiceName}.cds` → `Test.cds`
   > Service class will be: `{ServiceName}Service` → `TestService`
4. **Project Type** (Full CAP [DB+SRV+UI] or Backend Only [DB+SRV])
5. **Frontend Type** (choose one — *Only if Full CAP is selected.*):
   - **A) UI5 Freestyle** — SAP UI5 with handler delegation pattern
   - **B) React v2 (Flat + @cnma/react-ui)** ★ — Flat structure (components/hooks/pages/services), consumes `@cnma/react-ui` package for UI components, styles and fonts. Mirrors `cnma_ai_agent_extraction_ui` structure.
5. **Variant Management** (Yes/No - Do they need VariantSettings table and handlers?)

# Step 2: Initialize Backend
**Always** run this step first to create the core structure.

1. Set the context variables:
   - `project_name` = user's project name (e.g., `cnma_notification_service`)
   - `namespace` = user's namespace (e.g., `cnma.notification`)
   - `backend_language` = selected language from Step 0 (`node` or `java`)
2. **Call Skill**: `/cnma-cap-backend`
   * Instruction: "Use the `cnma-cap-backend` skill to create the DB and SRV layers for project **{{project_name}}** with namespace **{{namespace}}** using **{{backend_language}}** backend language. Include the `--variant` flag if the user requested Variant Management."
   * The skill will use the language to select templates from:
     - `templates/node/` for Node.js TypeScript
     - `templates/java/` for Java
   * **CAP Standard Structure** (after generation):

```
{{project_name}}/
├── _i18n/                      # Localization translation properties files
│   ├── i18n.properties         # English default translations
│   └── i18n_de.properties      # German translations
├── db/
│   ├── schema/
│   │   └── *.cds              # CDS schema (namespace: {{namespace}})
│   └── undeploy.json           # EMPTY before deployment
└── srv/
    ├── {ServiceName}.cds      # Service definition (READ, CREATE, UPDATE, DELETE)
    ├── src/                    # Domain-driven source
    │   ├── common/            # Shared (interfaces, models, exceptions, services, util)
    │   ├── config/            # Application configuration
    │   └── domain/            # Feature-based (SRP)
    │       └── __feature__/
    │           ├── handler/   # Event registration (SRP)
    │           ├── events/    # Event logic (OnRead*, OnBefore*, OnAfter*)
    │           ├── model/     # Entity & DTO
    │           ├── repository/ # Data access (CQN)
    │           └── service/   # Business logic (DIP)
    │   └── infrastructure/    # External systems (DIP)
    │       ├── database/      # DB operations
    │       ├── integration/   # External APIs (btp/, erp/, messaging/)
    │       ├── middleware/    # Request/response logging
    │       └── security/      # Auth & authorization
    ├── index.ts                # Module entry (Node.js)
    └── server.ts               # CAP bootstrap (Node.js)
```

   * Replace placeholders in templates:
     - `{{namespace}}` → user's namespace (e.g., `cnma.notification`)
     - `{{module_name}}` → user's module name (e.g., `notification`)
     - `{{project_name}}` → user's project name (e.g., `cnma_notification_service`)

# Step 3: Initialize Frontend (Optional)
If the user selected **Full CAP**, proceed according to the chosen frontend type.

1. Determine the **UI namespace** from the base namespace:
   - Replace dots with `/` and append `/app` → e.g., `cnma.notification` → `cnma/notification/app`

## Option A: UI5 Freestyle
2. **Call Skill**: `/cnma-cap-frontend`
   * Instruction: "Use the `cnma-cap-frontend` skill to add the UI layer. Pass UI5 Freestyle and the namespace **{{namespace}}** (UI namespace: **{{ui_namespace}}**)."
   * The skill will use the namespace in:
     - UI5 `manifest.json` → `"id": "{{ui_namespace}}"`
     - UI5 `Component.js` → `UIComponent.extend("{{ui_namespace}}.Component")`
     - UI5 `index.html` → `data-sap-ui-resourceroots='{\"{{ui_namespace}}\": \"./\"}'`
     - UI5 `sap.ui.define` paths → `"{{ui_namespace}}/controller/..."`

## Option B: React v2 (Flat + @cnma/react-ui)
2. **Call Script**: Run the React scaffolding script to create the React app, copy `.npmrc`, and replace placeholders automatically:
   ```bash
   python .agent/skills/cnma-cap-frontend/scripts/scaffold_react.py app/{{project_name}}_ui --project-name {{project_name}} --namespace {{namespace}}
   ```
   - This script automatically copies files, brings over `.npmrc` for private repository resolution, and handles all placeholder replacements.
   - **Run**: `npm install` inside `app/{{project_name}}_ui/`

3. **Update `mta.yaml`** — Add modules following the `cnma-cap-frontend` skill's MTA Integration section:
   - UI module: `{{project_name}}_ui` (path: `app/{{project_name}}_ui`)
   - UI Deployer module: `{{project_name}}_ui_deployer`
   - Destination Content module: `{{project_name}}_destination_content`
   - Resources: xsuaa, html5_host, destination (if not already present)

# Step 4: Initialize DevOps (BTP Cloud Foundry)
**Call Skill**: `/cnma-devops-init-btp-cf`
* Instruction: "Use the `cnma-devops-init-btp-cf` skill to bootstrap BTP Cloud Foundry deployment files (mta.yaml, Jenkinsfile, .deploycfg, etc.) for **{{project_name}}**. Pass `--type full` if a UI was generated (Full CAP), or `--type srv-only` if backend-only."

# Step 5: Finalize
1. Run `npm install` in the project root.
2. Initialize git: `git init`.
3. Notify user that project `{{project_name}}` with namespace `{{namespace}}` is ready.

## Architecture Principles

| Principle | Description |
|-----------|-------------|
| **SRP** | Handler = routing, Service = logic, Repository = data |
| **DIP** | High-level modules depend on abstractions, not concretions |
| **Java/Node.js Parity** | Both implementations use IDENTICAL folder structure |

## HDI Container Protection (CRITICAL)
After scaffolding, **always verify** `db/undeploy.json` is empty:
```json
[]
```
This prevents accidental data loss in shared HDI containers.