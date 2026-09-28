# Project Harness Template Package

This folder is the **AI Development Kit source** consumed by
`.agent/workflows/setup-project-harness.md`. It is **never copied wholesale**
into a target project. The setup workflow reads from here, substitutes
project placeholders, and writes a project-owned harness instance into the
target repo root.

## Layout

```
project-harness/
  HARNESS_VERSION              Semantic version of this template package.
  README.md                    This file.

  root-template/               -> rendered into <repo>/
    AGENTS.md.tmpl
    CLEAN_STATE_CHECKLIST.md.tmpl
    ARCHITECTURE.md.tmpl
    README.md.tmpl
    CONTRIBUTING.md.tmpl

  harness-template/            -> rendered into <repo>/.harness/
    project.yml.tmpl
    workflows.yml.tmpl
    gates.yml.tmpl
    roles.yml.tmpl
    quality.yml.tmpl
    commands.yml.tmpl
    publishing.yml.tmpl
    documents.yml.tmpl
    document-fulfillment.yml.tmpl
    harness-instance.yml.tmpl

  agent-runtime-template/      -> copied into <repo>/
    .harness/
      agent-bindings.yml.tmpl
      orchestration-contract.yml.tmpl
      orchestration-contract-ba.yml.tmpl
      scripts/
        agent-runtime.mjs
        schema-validation.mjs

  docs-template/               -> rendered into <repo>/docs/
    README.md.tmpl
    00-project-control/...
    01-discovery/...
    02-requirements/...
    03-solution-design/...
    04-delivery/...
    05-testing-uat/...
    06-release-go-live/...
    07-handover-operation/...
    references/...
    generated/...
    99-published/...

  schemas/                     -> copied verbatim into <repo>/.harness/schemas/
    document.schema.yml
    execution-plan.schema.yml
    feature.schema.yml
    handoff.schema.yml
    requirement.schema.yml
    sprint.schema.yml
    task.schema.yml
    user-story.schema.yml

  artifact-templates/          -> copied verbatim into <repo>/.harness/templates/
    adr-template.md
    execution-plan-template.md
    release-note-template.md
    requirement-template.md
    session-handoff-template.md
    sprint-template.md
    task-template.md
    test-case-template.md
    functional-spec-template.md
    track-boundary-handoff-template.yml
    implementation-notes-template.html
```

## Placeholder convention

- `.tmpl` files contain `{{PLACEHOLDER}}` tokens. The setup workflow
  substitutes from Phase 0 inputs and derived values, then strips the
  `.tmpl` suffix on write.
- Files without `.tmpl` are copied verbatim.
- `.gitkeep` files are kept verbatim.

## Harness agents

Reusable, model-neutral Harness agents live in
`.agent/agents/harness/`. They contain identity, instructions, skills,
schemas, completion contracts, runtime protocol, and evaluation rubrics only.
They do not contain project state. The project-owned
`.harness/agent-bindings.yml` chooses an agent from this package using the
live lifecycle state.

The initial team is Clarity (BA), Atlas (solution), Forge (implementation), and
Verity (quality). A human-gated runtime prepares context and records work; the
runtime never selects a model host or applies lifecycle transitions.

## Maintenance

When the harness design changes:

1. Edit files here.
2. Bump `HARNESS_VERSION`.
3. Note any breaking change in the project's `upgrade-project-harness.md`
   playbook.
4. Existing projects pick up changes by updating the `.agent` submodule
   and running `validate-project-harness.md`.

This kit is read-only during project setup: see the workflow's Phase 1
rule — `Never modify .agent/`.
