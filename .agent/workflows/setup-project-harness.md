---
description: Setup the current AI-ready project harness for a target project. Reads reusable templates and inline rules from .agent/, creates project-owned AGENTS.md, CLEAN_STATE_CHECKLIST.md, ARCHITECTURE.md, .harness/, and docs/. Run once per project before bootstrap-project-context.
---

# Setup Project Harness

This workflow installs the current AI-ready project harness into a target
project repository. It reads reusable templates and inline rules from
`.agent/` (the AI Development Kit) and writes a **project-owned harness
instance** into the target project root.

## Core mental model

```
.agent/
  = AI Development Kit
  = reusable workflows, skills, agents, rules, templates

target project root/
  = project-owned output
  = generated harness instance
  = project-specific docs / state / memory
```

During setup:

```
Read from .agent/
Write to target project root
Never modify .agent/
```

Important distinction:

```
.agent/      teaches AI how to set up the harness.
.harness/    stores the installed harness settings for this project.
docs/        stores the project knowledge and delivery memory.
.agent/agents/harness/
             stores reusable, model-neutral worker definitions and runtime
             contracts. It never stores project state.
```

Run this workflow **once per project**, before
`bootstrap-project-context.md`. For an already-installed harness, use
`upgrade-project-harness.md` instead.

---

## Template layout

Expected source layout under `.agent/`:

```
.agent/templates/project-harness/
  HARNESS_VERSION                          (optional; default 0.3.0)

  root-template/
    AGENTS.md.tmpl
    CLEAN_STATE_CHECKLIST.md.tmpl
    ARCHITECTURE.md.tmpl
    README.md.tmpl
    CONTRIBUTING.md.tmpl

  harness-template/
    project.yml.tmpl
    workflows.yml.tmpl
    gates.yml.tmpl
    roles.yml.tmpl
    quality.yml.tmpl
    commands.yml.tmpl
    transitions.yml.tmpl
    publishing.yml.tmpl
    documents.yml.tmpl
    document-fulfillment.yml.tmpl
    harness-instance.yml.tmpl

  agent-runtime-template/
    .harness/
      agent-bindings.yml.tmpl
      orchestration-contract.yml.tmpl
      orchestration-contract-ba.yml.tmpl
      scripts/
        agent-runtime.mjs
        schema-validation.mjs

  schemas/
    document.schema.yml
    execution-plan.schema.yml
    feature.schema.yml
    feature-implementation.schema.yml
    handoff.schema.yml
    requirement.schema.yml
    sprint.schema.yml
    task.schema.yml
    user-story.schema.yml

  artifact-templates/
    adr-template.md
    execution-plan-template.md
    release-note-template.md
    requirement-template.md
    session-handoff-template.md
    sprint-template.md
    task-template.md
    test-case-template.md

  docs-template/
    README.md.tmpl
    00-project-control/
      README.md.tmpl
      current-state.yml.tmpl
      active-work.md.tmpl
      project-status.md.tmpl
      registers/
        README.md.tmpl
        document-register.md.tmpl
        document-completion-matrix.md.tmpl
        product-progress.md.tmpl
      logs/
        README.md.tmpl
        progress-log.md.tmpl
        transition-log.md.tmpl
        progress/.gitkeep
      questions/
        README.md.tmpl
        open-question-log.md.tmpl
        open-questions/open.md.tmpl
        open-questions/.gitkeep
        resolved/.gitkeep
      decisions/
        README.md.tmpl
        decision-log.md.tmpl
      risks/
        README.md.tmpl
        risk-assumption-log.md.tmpl
      quality/
        README.md.tmpl
        quality-score.md.tmpl
        improvement-log.md.tmpl
        recurring-issues.md.tmpl
        working-patterns.md.tmpl
        retrospective-log.md.tmpl
      archive/
    checklists/
      README.md
      instances/
        README.md
        feature-implementation/.gitkeep
        functional-spec/.gitkeep
        README.md.tmpl
        .gitkeep
    01-discovery/
    02-requirements/
    03-solution-design/
    04-delivery/
    05-testing-uat/
    06-release-go-live/
    07-handover-operation/
    references/
    generated/
    99-published/
```

### Template fallback rule

Two write modes are supported:

```
Template mode:
  Use files from .agent/templates/project-harness/.

Inline fallback mode:
  If a required template is missing, generate a minimal valid stub
  using the structure and content defined inside this workflow.
```

**The workflow must not fail just because the template folder does not
exist yet.** Missing templates are not blockers — they are reported as
improvement items for the AI Development Kit in the post-setup report.

- Files ending in `.tmpl` contain `{{PLACEHOLDER}}` tokens — substitute
  and strip the `.tmpl` suffix on write.
- Files without `.tmpl` are copied verbatim.
- `.gitkeep` files are always copied verbatim (or created empty in
  fallback mode).

---

## Phase 0 — Resolve Project Parameters

Gather inputs **before writing any file**. Do not infer from file
contents. Ask the user exactly these questions:

```
1. PROJECT_NAME    (slug, e.g. "cnma-material-approval")
2. PROJECT_TITLE   (human readable, e.g. "Conarum Material Approval")
3. PROJECT_CODE    (short code, e.g. "CNMA")
4. PROJECT_TYPE    (e.g. "SAP BTP Application")
5. DELIVERY_MODEL  (e.g. "Agile", "Waterfall", "Hybrid")
6. STACK_DESC      (e.g. "SAP CAP Node.js + React + SAP BTP")
7. HARNESS_PROFILE (optional, e.g. "sap-btp-standard")
```

### Required inputs

| Input             | Required | Example                           |
| ----------------- | -------: | --------------------------------- |
| `PROJECT_NAME`    |      Yes | cnma-material-approval            |
| `PROJECT_TITLE`   |      Yes | Conarum Material Approval         |
| `PROJECT_CODE`    |      Yes | CNMA                              |
| `PROJECT_TYPE`    |      Yes | SAP BTP Application               |
| `DELIVERY_MODEL`  |      Yes | Agile                             |
| `STACK_DESC`      |      Yes | SAP CAP Node.js + React + SAP BTP |
| `HARNESS_PROFILE` | Optional | sap-btp-standard                  |

### Derived values (do not ask)

| Key               | How to derive                                                                   |
| ----------------- | ------------------------------------------------------------------------------- |
| `REPO_ROOT`       | current project root                                                            |
| `KIT_ROOT`        | `.agent`                                                                        |
| `DATE`            | current date `YYYY-MM-DD`                                                       |
| `SETUP_DATE`      | current date `YYYY-MM-DD`                                                       |
| `HARNESS_VERSION` | `.agent/templates/project-harness/HARNESS_VERSION` if exists, otherwise `0.3.0` |
| `HAS_FRONTEND`    | `yes` if any `app/**/package.json` exists, otherwise `no`                       |

### Placeholder mapping

| Placeholder           | Source            |
| --------------------- | ----------------- |
| `{{PROJECT_NAME}}`    | `PROJECT_NAME`    |
| `{{PROJECT_TITLE}}`   | `PROJECT_TITLE`  |
| `{{PROJECT_CODE}}`    | `PROJECT_CODE`    |
| `{{PROJECT_TYPE}}`    | `PROJECT_TYPE`    |
| `{{DELIVERY_MODEL}}`  | `DELIVERY_MODEL`  |
| `{{STACK_DESC}}`      | `STACK_DESC`      |
| `{{HARNESS_PROFILE}}` | `HARNESS_PROFILE` |
| `{{HARNESS_VERSION}}` | derived           |
| `{{SETUP_DATE}}`      | derived           |
| `{{KIT_ROOT}}`        | `.agent`          |

If any required input is missing, **stop and ask** before continuing.
Optional values may be left as the literal placeholder; record them in
the post-setup report.

---

## Phase 1 — Wire `.agent` Submodule

Check whether `.agent/` exists at the repo root.

If `.agent/` exists:

```
Continue.
```

If `.agent/` does not exist:

```
Stop. Report that the AI Development Kit submodule is missing.
```

The workflow may show this instruction to the user, but **must not
guess the submodule URL**:

```bash
git submodule add <agent-repo-url> .agent
git submodule update --init --recursive
```

The user must wire the submodule themselves, then re-run this workflow.

---

## Phase 2 — Inspect Existing Target Project

Before writing anything, classify the target project.

Check the presence of:

```
AGENTS.md
CLEAN_STATE_CHECKLIST.md
ARCHITECTURE.md
.harness/
.harness/harness-instance.yml
.harness/schemas/
.harness/templates/
docs/
docs/00-project-control/current-state.yml
```

Classify state:

| State         | Meaning                                           | Behavior                                    |
| ------------- | ------------------------------------------------- | ------------------------------------------- |
| `clean`       | No existing harness files                         | Safe to install                             |
| `partial`     | Some files exist but no harness instance metadata | Create missing files only, report conflicts |
| `installed`   | `.harness/harness-instance.yml` exists            | Treat as re-run; do not overwrite           |
| `conflicting` | Existing files conflict with generated targets    | Stop or require confirmation                |

Default rule:

```
Never overwrite existing project-owned files without explicit confirmation.
```

If state is `installed`, refer the user to `upgrade-project-harness.md`
and stop. If `conflicting`, list the conflicts and require explicit
user confirmation before continuing.

---

## Phase 3 — Generate Root Files

Render or copy:

```
AGENTS.md
CLEAN_STATE_CHECKLIST.md
ARCHITECTURE.md
README.md       (optional per project)
CONTRIBUTING.md (optional per project)
```

Source = `.agent/templates/project-harness/root-template/<file>.tmpl`.
Target = `<repo>/<file>` (strip `.tmpl`).

Write mode:

| File                       | Mode              |
| -------------------------- | ----------------- |
| `AGENTS.md`                | render-if-missing |
| `CLEAN_STATE_CHECKLIST.md` | render-if-missing |
| `ARCHITECTURE.md`          | render-if-missing |
| `README.md`                | render-if-missing |
| `CONTRIBUTING.md`          | render-if-missing |

Rules:

- If the source `.tmpl` is missing, generate a minimal valid stub
  inline (project title + harness version + "TBD" sections) and mark
  the template as missing in the report.
- If the target already exists, **skip and record as a conflict**. Do
  not overwrite.
- After write, root files are **project-owned** — not synced back to
  `.agent/`.

---

## Phase 4 — Generate `.harness/`

Create the project-owned runtime config, schemas, and artifact templates:

```
.harness/
  project.yml
  workflows.yml
  gates.yml
  roles.yml
  quality.yml
  commands.yml
  transitions.yml
  publishing.yml
  documents.yml
  document-fulfillment.yml
  harness-instance.yml

  schemas/
    document.schema.yml
    execution-plan.schema.yml
    feature.schema.yml
    feature-implementation.schema.yml
    handoff.schema.yml
    requirement.schema.yml
    sprint.schema.yml
    task.schema.yml
    user-story.schema.yml

  templates/
    adr-template.md
    execution-plan-template.md
    release-note-template.md
    requirement-template.md
    session-handoff-template.md
    sprint-template.md
    task-template.md
    test-case-template.md
```

Purpose:

| File                       | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `project.yml`              | Project harness pointers and source-of-truth paths |
| `workflows.yml`            | Runtime workflow rules for this project            |
| `gates.yml`                | Project gates and required checks                  |
| `roles.yml`                | BA/SA/DEV/QA/PM ownership and permissions          |
| `quality.yml`              | Quality, anti-fiction, navigation, memory rules    |
| `commands.yml`             | Supported harness commands                         |
| `transitions.yml`          | Object lifecycle transitions + PROPOSE/CONFIRM evidence protocol |
| `publishing.yml`           | Document publishing configuration                  |
| `documents.yml`            | Document inventory (id, phase, owner, gate)        |
| `document-fulfillment.yml` | Document maturity and fulfillment rules            |
| `harness-instance.yml`     | Installed harness metadata                         |
| `schemas/`                 | JSON-schema-style validators for artifacts         |
| `templates/`               | Artifact templates used at runtime                 |

Rules:

- YAML config source =
  `.agent/templates/project-harness/harness-template/<file>.tmpl`.
  Substitute placeholders (Phase 0 + derived).
- Schemas source = `.agent/templates/project-harness/schemas/`. Copy
  verbatim — no placeholder substitution.
- Artifact templates source =
  `.agent/templates/project-harness/artifact-templates/`. Copy verbatim
  into `.harness/templates/`.
- `.harness/` is **project-owned**. It is **not a mirror of `.agent/`**;
  individual projects may later evolve their schemas and templates.
- If a YAML template is missing, write a minimal valid stub inline and
  flag the template as missing.
- If a schema or artifact template is missing in the kit, **do not invent
  one**. Skip the file and flag it as a kit defect in the report.

`harness-instance.yml` minimum contents:

```yaml
harness:
  installed: true
  version: {{HARNESS_VERSION}}
  profile: {{HARNESS_PROFILE}}
  installed_on: {{SETUP_DATE}}
  kit_root: {{KIT_ROOT}}

project:
  name: {{PROJECT_NAME}}
  title: {{PROJECT_TITLE}}
  code: {{PROJECT_CODE}}
  type: {{PROJECT_TYPE}}
  delivery_model: {{DELIVERY_MODEL}}
  stack: {{STACK_DESC}}
```

---

## Phase 4.1 — Install Workflow-First Agent Runtime

Install the reusable workflow-first runtime as a **separate project-owned
layer**. The agent definitions themselves remain in the read-only kit under
`.agent/agents/harness/`; they are never copied into project state and never
contain project knowledge.

Copy the full tree from:

```
.agent/templates/project-harness/agent-runtime-template/
```

to the target repository root. For `.tmpl` files, substitute Phase 0
placeholders and strip `.tmpl`; copy all other files verbatim. This installs:

```
.harness/
  agent-bindings.yml
  orchestration-contract.yml
  orchestration-contract-ba.yml
  scripts/
    agent-runtime.mjs
    schema-validation.mjs
```

Rules:

- These files are project-owned runtime configuration and can evolve through
  the project governance process. They are not a copy of agent identity,
  prompts, or memory.
- Bindings may select only an agent declared under
  `.agent/agents/harness/`; a project may narrow permissions but may not
  broaden a manifest permission.
- The runtime must remain model- and host-neutral. It creates a human-gated
  dispatch package; it does not invoke a vendor model or apply a lifecycle
  transition.
- Do not create `.harness/executions/` records, features, Sprints, baselines,
  handoffs, or implementation records during setup.
- Before claiming the runtime is ready, verify the target Node environment can
  resolve `yaml`, `ajv`, and `ajv-formats`. Report missing packages; do
  not install dependencies without the project's approval.

---

## Phase 5 — Generate `docs/` Project Wiki

Create the **full current structure** (no legacy 5-folder model):

```
docs/
  README.md

  00-project-control/
    README.md
    current-state.yml
    active-work.md
    project-status.md
    registers/
      README.md
      document-register.md
      document-completion-matrix.md
      product-progress.md
    logs/
      README.md
      progress-log.md
      transition-log.md
      progress/.gitkeep
    questions/
      README.md
      open-question-log.md
      open-questions/open.md
      open-questions/.gitkeep
      resolved/.gitkeep
    decisions/
      README.md
      decision-log.md
    risks/
      README.md
      risk-assumption-log.md
    quality/
      README.md
      quality-score.md
      improvement-log.md
      recurring-issues.md
      working-patterns.md
      retrospective-log.md
    archive/
      README.md
      .gitkeep

  01-discovery/
    README.md
    00-product-sense.md
    01-project-brief.md
    02-business-context.md
    03-initial-scope.md
    04-stakeholder-map.md
    05-initial-process-flow.md

  02-requirements/
    README.md
    requirements.yml
    features.yml
    user-stories.yml
    01-product-requirement.md
    02-business-requirements.md
    03-requirement-matrix.md
    04-fit-gap-analysis.md
    05-feature-catalog.md
    06-user-stories.md
    07-acceptance-criteria.md
    08-non-functional-requirements.md

  03-solution-design/
    README.md
    01-solution-architecture.md
    02-functional-design.md
    03-technical-design.md
    04-data-model.md
    05-integration-design.md
    06-api-contract.md
    07-security-authorization.md
    08-ui-screen-spec.md
    adr/
      README.md
      .gitkeep

  04-delivery/
    README.md
    sprint-planning.yml
    feature-implementations.yml
    functional-specs/
      README.md
      active/.gitkeep
      baselines/.gitkeep
    implementation-notes/
      README.md
      test-runs/.gitkeep
    track-handoffs/
      README.md
      ba-to-dev/.gitkeep
      dev-to-delivery/.gitkeep
    tasks/
      README.md
      .gitkeep
    sprints/
      README.md
      .gitkeep
    session-handoffs/
      README.md
      .gitkeep
    exec-plans/
      README.md
      active/.gitkeep
      completed/.gitkeep
    01-implementation-notes.md
    02-change-log.md
    03-defect-log.md
    04-delivery-evidence.md

  05-testing-uat/
    README.md
    01-test-strategy.md
    02-test-cases.md
    03-test-data.md
    04-integration-test-cases.md
    05-uat-script.md
    06-uat-result.md
    07-release-readiness.md

  06-release-go-live/
    README.md
    01-release-plan.md
    02-deployment-guide.md
    03-go-live-checklist.md
    04-rollback-plan.md
    05-release-notes.md
    06-production-config.md
    07-cutover-plan.md
    08-reliability.md

  07-handover-operation/
    README.md
    01-user-guide.md
    02-admin-guide.md
    03-runbook.md
    04-troubleshooting-guide.md
    05-support-model.md
    06-kt-material.md
    07-final-handover-checklist.md

  references/
    README.md

  generated/
    README.md

  99-published/
    README.md
```

Rules:

- Render every `.tmpl` from
  `.agent/templates/project-harness/docs-template/` with placeholder
  substitution.
- If a template file is missing, generate a minimal inline stub:
  - For `.md`: frontmatter (title, status: `tbd`, owner: `tbd`) plus a
    one-line "TBD — fill at bootstrap-project-context." body.
  - For `.yml`: empty structured state (see Phase 6).
  - For README files: short folder purpose + AI usage rule + human
    review rule.
- Numbering rule: **only main documents are numbered.** Tracking,
  state, and log files (e.g. `current-state.yml`, `active-work.md`,
  `decision-log.md`, `risk-assumption-log.md`, `quality-score.md`,
  `progress-log.md`) are **not numbered**.
- Every major folder gets a `README.md`.

---

## Phase 6 — Initialize Empty Project State

Initialize **only empty state**. Do not bootstrap real project content.

### `docs/00-project-control/current-state.yml`

```yaml
current:
  lifecycle_status: initialized
  active_phase: 00-project-control
  active_sprint: null
  active_feature: null
  active_task: null
  active_branch: null
  latest_handoff: null

project:
  has_discovery_input: false
  has_requirements: false
  has_accepted_features: false
  has_committed_sprint: false

next_action:
  recommended: bootstrap_project_context
  reason: Harness is installed, but no real project work has been created yet.

references:
  active_work: docs/00-project-control/active-work.md
  open_questions: docs/00-project-control/questions/open-question-log.md
```

### `docs/02-requirements/requirements.yml`

```yaml
requirements: []
```

### `docs/02-requirements/features.yml`

```yaml
features: []
```

### `docs/02-requirements/user-stories.yml`

```yaml
user_stories: []
```

### `docs/04-delivery/sprint-planning.yml`

```yaml
sprint_planning:
  active_sprint: null
  candidate_stories: []
  committed_stories: []
  blocked_stories: []
```

---

## Phase 7 — Clean Initialization Rules

The workflow **must not** create:

```
fake task
fake sprint
fake feature
fake requirement
fake user story
fake session handoff
fake decision
fake risk
fake open question
fake project brief
fake business flow
fake customer context
```

Allowed content in generated documents:

```
TBD placeholders
empty arrays
empty tables
frontmatter metadata
folder README instructions
AI usage rules
human review rules
source-of-truth notes
```

If a source template contains real-looking sample business content
(named customers, fabricated requirements, sample stories with story
points, etc.), **report a template defect** in the post-setup report
and refuse to copy the sample content silently. Do not strip it
without surfacing the defect — surface and skip.

---

## Phase 8 — Generate `.gitignore`

Ensure these entries exist in `<repo>/.gitignore`. Create the file if
absent; append missing entries without duplicating existing ones.

```gitignore
# Dependencies
node_modules/
app/*/node_modules/

# Build outputs
dist/
gen/
mta_archives/*.mtar

# Local development
.env
.env.local
*.sqlite
*.db

# Product wiki build artifacts
.wiki-build/
dist/wiki/

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## Phase 9 — Verify Structure

Run the following check. Every line must resolve to OK. Any MISSING
entry blocks setup completion.

```powershell
@(
  "AGENTS.md",
  "CLEAN_STATE_CHECKLIST.md",
  "ARCHITECTURE.md",

  ".harness\project.yml",
  ".harness\workflows.yml",
  ".harness\gates.yml",
  ".harness\roles.yml",
  ".harness\quality.yml",
  ".harness\commands.yml",
  ".harness\transitions.yml",
  ".harness\publishing.yml",
  ".harness\documents.yml",
  ".harness\document-fulfillment.yml",
  ".harness\harness-instance.yml",
  ".harness\\agent-bindings.yml",
  ".harness\\orchestration-contract.yml",
  ".harness\\orchestration-contract-ba.yml",
  ".harness\\scripts\\agent-runtime.mjs",
  ".harness\\scripts\\schema-validation.mjs",
  ".harness\schemas\document.schema.yml",
  ".harness\schemas\execution-plan.schema.yml",
  ".harness\schemas\feature.schema.yml",
  ".harness\schemas\feature-implementation.schema.yml",
  ".harness\schemas\handoff.schema.yml",
  ".harness\schemas\requirement.schema.yml",
  ".harness\schemas\sprint.schema.yml",
  ".harness\schemas\task.schema.yml",
  ".harness\schemas\user-story.schema.yml",
  ".harness\templates\adr-template.md",
  ".harness\templates\execution-plan-template.md",
  ".harness\templates\release-note-template.md",
  ".harness\templates\requirement-template.md",
  ".harness\templates\session-handoff-template.md",
  ".harness\templates\sprint-template.md",
  ".harness\templates\task-template.md",
  ".harness\templates\test-case-template.md",

  "docs\README.md",
  "docs\00-project-control\README.md",
  "docs\00-project-control\current-state.yml",
  "docs\00-project-control\active-work.md",
  "docs\00-project-control\project-status.md",
  "docs\00-project-control\registers\README.md",
  "docs\00-project-control\registers\document-register.md",
  "docs\00-project-control\registers\document-completion-matrix.md",
  "docs\00-project-control\registers\product-progress.md",
  "docs\00-project-control\logs\README.md",
  "docs\00-project-control\logs\progress-log.md",
  "docs\00-project-control\logs\transition-log.md",
  "docs\00-project-control\questions\README.md",
  "docs\00-project-control\questions\open-question-log.md",
  "docs\00-project-control\decisions\README.md",
  "docs\00-project-control\decisions\decision-log.md",
  "docs\00-project-control\risks\README.md",
  "docs\00-project-control\risks\risk-assumption-log.md",
  "docs\00-project-control\quality\README.md",
  "docs\00-project-control\quality\quality-score.md",

  "docs\01-discovery\README.md",
  "docs\01-discovery\00-product-sense.md",
  "docs\01-discovery\01-project-brief.md",

  "docs\02-requirements\README.md",
  "docs\02-requirements\requirements.yml",
  "docs\02-requirements\features.yml",
  "docs\02-requirements\user-stories.yml",

  "docs\03-solution-design\README.md",
  "docs\03-solution-design\01-solution-architecture.md",
  "docs\03-solution-design\adr\README.md",

  "docs\04-delivery\README.md",
  "docs\04-delivery\sprint-planning.yml",
  "docs\\04-delivery\\feature-implementations.yml",
  "docs\\04-delivery\\functional-specs\\README.md",
  "docs\\04-delivery\\functional-specs\\active\\.gitkeep",
  "docs\\04-delivery\\functional-specs\\baselines\\.gitkeep",
  "docs\\04-delivery\\implementation-notes\\README.md",
  "docs\\04-delivery\\track-handoffs\\README.md",
  "docs\\04-delivery\\track-handoffs\\ba-to-dev\\.gitkeep",
  "docs\\04-delivery\\track-handoffs\\dev-to-delivery\\.gitkeep",
  "docs\04-delivery\tasks\README.md",
  "docs\04-delivery\tasks\.gitkeep",
  "docs\04-delivery\sprints\README.md",
  "docs\04-delivery\sprints\.gitkeep",
  "docs\04-delivery\session-handoffs\README.md",
  "docs\04-delivery\session-handoffs\.gitkeep",
  "docs\04-delivery\exec-plans\README.md",

  "docs\05-testing-uat\README.md",
  "docs\06-release-go-live\README.md",
  "docs\06-release-go-live\08-reliability.md",
  "docs\07-handover-operation\README.md",
  "docs\references\README.md",
  "docs\generated\README.md",
  "docs\99-published\README.md"
) | ForEach-Object {
  if (Test-Path $_) { Write-Host "OK       $_" -ForegroundColor Green }
  else              { Write-Host "MISSING  $_" -ForegroundColor Red }
}
```

Validation must also confirm:

```
No fake task file exists.
No fake sprint file exists.
No fake feature exists.
No fake requirement exists.
No fake session handoff exists.
No unresolved critical placeholders remain (PROJECT_NAME, PROJECT_TITLE, PROJECT_CODE).
.agent/ was not modified by this run.
```

A literal `{{KEY}}` left in a non-critical optional field (e.g.
`HARNESS_PROFILE`) is acceptable and must be listed in the report.

---

## Phase 10 — Post-Setup Report

Emit this report verbatim, filling counts and lists:

```
Project harness setup completed.

Harness profile : {{HARNESS_PROFILE}}
Harness version : {{HARNESS_VERSION}}
Project         : {{PROJECT_TITLE}} ({{PROJECT_NAME}})
Project code    : {{PROJECT_CODE}}
Stack           : {{STACK_DESC}}
Setup date      : {{SETUP_DATE}}

Files written:
  Root        : <count>
  .harness/   : <count>
  docs/       : <count>

Files skipped:
  <list or "none">

Conflicts:
  <list or "none">

Missing templates (reported to AI Development Kit):
  <list or "none">

Placeholders left literal:
  <list or "none">

Validation:
  <OK / WARN / FAIL with reasons>

Important:
  Setup installed only the harness shell.
  No real task, sprint, requirement, feature, or session handoff was created.
  This is expected.

Next:
  Run bootstrap-project-context workflow with real project input.
```

---

## Phase 11 — Route After Setup

Choose the next workflow based on the post-setup state of the target
project.

### Path A — New greenfield project

Condition:

```
has_discovery_input: false
has_requirements: false
active_task: null
```

Next action:

```
Run bootstrap-project-context workflow with real project input.
```

### Path B — Existing project with partial docs

Condition:

```
Some docs/ content existed before setup.
```

Next action:

```
Run documentation audit before bootstrap.
Do not overwrite existing docs.
Map existing docs into the new harness structure.
```

### Path C — Existing project with code but no docs

Condition:

```
Source code exists but docs/ is empty before setup.
```

Next action:

```
Run brownfield-discovery workflow.
Backfill product sense, architecture, reliability, and active work
from the current codebase.
```

---

## Non-Goals

This setup workflow must **not**:

```
create first real task
create first sprint
create real requirements
create real features
create real user stories
create real project brief
create fake business process
publish documents
compact memory
upgrade an already active harness
modify .agent/
```

Separate workflows handle those concerns:

```
bootstrap-project-context.md
validate-project-harness.md
upgrade-project-harness.md
publish-project-docs.md
compact-project-memory.md
brownfield-discovery.md
```

---

## Maintenance

When the harness design changes:

1. Update templates under `.agent/templates/project-harness/`.
2. Update this setup workflow if folder structure or setup phases change.
3. Bump `.agent/templates/project-harness/HARNESS_VERSION`.
4. Update the README in the template package.
5. Existing projects should update the `.agent` submodule and run
   `validate-project-harness.md`.
6. **Do not re-run setup blindly on active projects.** Use
   `upgrade-project-harness.md`.

---

## Final principle

```
Setup creates the harness shell.
Bootstrap creates the first real project context.
Delivery workflows create and update real work.
```
