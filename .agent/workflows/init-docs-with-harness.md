---
description: Bootstrap the Harness Engineering scaffold for a new or greenfield project. Reads templates from .agent/templates/, substitutes project placeholders, writes to the repo. Run once per project.
---

# Init Docs With Harness

This workflow installs the **Harness Engineering** scaffold from project-local
templates in `.agent/templates/`. It is **self-contained** — does not depend on
any user-global Claude install. Any developer with the `.agent` submodule
checked out can run it.

After this workflow completes, run `.agent/workflows/harness-cold-start.md` to
verify the generated scaffold loads cleanly before opening the first slice.

## Template layout

```
.agent/templates/
  docs-template/         → copies to <repo>/docs/
    HARNESS_VERSION      → copied to <repo>/docs/04-project/harness/VERSION
    PRODUCT_BASELINE.md.tmpl
    README.md.tmpl
    01-product/
    02-business/
    03-technical/
    04-project/
    05-releases/
  root-template/         → copies to <repo>/
    AGENTS.md.tmpl
    ARCHITECTURE.md.tmpl
    CLAUDE.md
    CLEAN_STATE_CHECKLIST.md
    CONSTRAINTS.md
    PROGRESS.md.tmpl
    feature_list.json.tmpl
    session-handoff.json.tmpl
    init.ps1.tmpl
    init.sh.tmpl
  wiki-template/         → NOT copied at bootstrap; consumed at build time
    mkdocs.yml.tmpl       by .agent/workflows/build-product-wiki.md
    preprocess.py
    overrides/
    README.md
```

The wiki template is **not** scaffolded into `<repo>/` at bootstrap because
the product wiki is a build artifact, not a tracked file. It is rendered on
demand into `<repo>/dist/wiki/` after Sprint 0 closes. See
`.agent/workflows/build-product-wiki.md`.

- Files ending in `.tmpl` contain `{{PLACEHOLDER}}` tokens — substitute and strip `.tmpl` suffix on write.
- Files without `.tmpl` are copied verbatim.

---

## Phase 0 — Gather Project Parameters

Ask the user **exactly these 6 questions**. Do not infer from file contents.

```
1. Project name (slug, e.g. "cnma-purchase-order"):
2. Project title (human-readable):
3. Primary users (one sentence):
4. Job-to-be-done (one sentence):
5. Quality bar for acceptance (one sentence):
6. Tech stack (one sentence, e.g. "SAP CAP Node.js + SAPUI5"):
```

Map answers to placeholder keys:

| Question | Key |
|---|---|
| 1. Project name (slug) | `PROJECT_SLUG`, `PROJECT_NAME` |
| 2. Project title | `PROJECT_TITLE` |
| 3. Primary users | `PRODUCT_USERS`, `PRIMARY_USERS` |
| 4. Job-to-be-done | `PRODUCT_JTBD`, `JTBD` |
| 5. Quality bar | `PRODUCT_ACCEPTANCE`, `QUALITY_BAR` |
| 6. Tech stack | `STACK_DESC`, `STACK` |

### Derived values (do not ask)

| Key | How to derive |
|---|---|
| `REPO_ROOT` | `pwd` |
| `DATE`, `BOOTSTRAP_DATE` | today's date `YYYY-MM-DD` |
| `HARNESS_VERSION` | contents of `.agent/templates/docs-template/HARNESS_VERSION` |
| `HAS_FRONTEND` | `yes` if any `app/**/package.json` exists, else `no` |
| `BOOTSTRAP_CMD_WIN` | `powershell -ExecutionPolicy Bypass -File ./init.ps1` |
| `CMD_BUILD` | `package.json#scripts.build`; fallback `*fill at first slice close*` |
| `CMD_TEST` | `package.json#scripts.test`; fallback `npm test -- --passWithNoTests` |
| `CMD_DEV_BACKEND` | `package.json#scripts.dev` or `start`; fallback `*fill at first slice close*` |
| `CMD_DEV_FRONTEND` | `app/**/package.json#scripts.dev`; `n/a` if no frontend |
| `CMD_CAP_BUILD` | `npm run cds:build` if `@sap/cds` in deps; else `n/a` |
| `CMD_SCHEMA_DEPLOY` | `npx cds deploy --to sqlite` if CAP; else `n/a` |
| `BASELINE_01_*`, `BASELINE_02_*`, `BASELINE_03_*` | from Phase 2 detection |

Note: `BASELINE_01_OWNER` = `BA Lead`, `BASELINE_02_OWNER` = `BA Lead`,
`BASELINE_03_OWNER` = `Tech Lead`. `BASELINE_NN_TARGET` = `sprint-000` unless
status is `complete` (then `—`).

---

## Phase 1 — Wire .agent Submodule (if missing)

If `.agent` is not yet a submodule:

```bash
git submodule add <agent-repo-url> .agent
git submodule update --init --recursive
```

Skip if already present.

---

## Phase 2 — Detect Existing Product Docs

For each of `docs/01-product/`, `docs/02-business/`, `docs/03-technical/`,
`docs/05-releases/`, decide baseline status by counting existing substantive files:

```powershell
@("01-product","02-business","03-technical","05-releases") | ForEach-Object {
  $path = "docs\$_"
  if (Test-Path $path) {
    $count = (Get-ChildItem $path -Recurse -File -Exclude README.md -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "$_ : $count substantive file(s)"
  } else {
    Write-Host "$_ : folder absent"
  }
}
```

| Detected | `BASELINE_NN_STATUS` | `BASELINE_NN_NOTES` |
|---|---|---|
| Folder absent / empty / only README | `not_started` | `No content yet — fill at Sprint 0` |
| 1–2 stub files | `seeded` | `Skeleton present; needs Sprint 0 expansion` |
| Multiple substantive but uneven | `partial` | `Existing content under <subpath>; needs audit at Sprint 0 — empty areas: <list>` |
| Full coverage matching scope | `complete` | `Audited <date>; covers <areas>` |

If any folder has ≥2 substantive files, **list them and confirm with the user**
before assigning status. **Never overwrite existing files** in product folders.

---

## Phase 3 — Copy `docs-template/` → `<repo>/docs/`

Walk every file under `.agent/templates/docs-template/`. For each file:

1. Compute target path:
   - `HARNESS_VERSION` → `<repo>/docs/04-project/harness/VERSION` (special case)
   - Everything else → `<repo>/docs/<same-relative-path>`, stripping `.tmpl` if present
2. If target already exists and is in a product folder (`01-product/`, `02-business/`, `03-technical/`, `05-releases/`) that Phase 2 marked as `seeded` / `partial` / `complete` — **skip** (preserve user content).
3. Otherwise:
   - If source ends `.tmpl`: read, substitute every `{{KEY}}` from Phase 0 + derived values, write to target without `.tmpl` suffix.
   - Else: copy verbatim.

Substitute every placeholder. If a value was never derived, leave the literal
`{{KEY}}` in the file and add it to the post-write report so the user knows
what to fill.

---

## Phase 4 — Copy `root-template/` → `<repo>/`

Walk every file under `.agent/templates/root-template/`. Same `.tmpl`
substitution rules as Phase 3. Target = `<repo>/<filename without .tmpl>`.

After write, make init.sh executable on Linux/macOS:

```bash
chmod +x init.sh
```

---

## Phase 5 — Optional: Skip frontend-only files

If `HAS_FRONTEND = no`, delete `<repo>/docs/04-project/harness/FRONTEND.md`
after copy. (The template ships it; project-level decision whether to keep.)

---

## Phase 6 — `.gitignore`

Ensure these entries exist in `<repo>/.gitignore` (create if absent, append if
present without duplicates):

```
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

## Phase 7 — Verify Structure

```powershell
@(
  "AGENTS.md",
  "ARCHITECTURE.md",
  "CONSTRAINTS.md",
  "CLEAN_STATE_CHECKLIST.md",
  "PROGRESS.md",
  "session-handoff.json",
  "feature_list.json",
  "init.ps1",
  "init.sh",
  "docs\README.md",
  "docs\PRODUCT_BASELINE.md",
  "docs\01-product\README.md",
  "docs\01-product\product-roadmap.md",
  "docs\02-business\README.md",
  "docs\03-technical\README.md",
  "docs\05-releases\README.md",
  "docs\04-project\README.md",
  "docs\04-project\ACTIVE_WORK.md",
  "docs\04-project\backlog.md",
  "docs\04-project\releases\README.md",
  "docs\04-project\sprints\sprint-000-product-foundation\commitments.md",
  "docs\04-project\harness\VERSION",
  "docs\04-project\harness\PLANS.md",
  "docs\04-project\harness\QUALITY_SCORE.md",
  "docs\04-project\harness\RELIABILITY.md",
  "docs\04-project\harness\SECURITY.md",
  "docs\04-project\harness\PRODUCT_SENSE.md",
  "docs\04-project\harness\DESIGN.md",
  "docs\04-project\harness\engineering\ba-workflow.md",
  "docs\04-project\harness\engineering\implementation-workflow.md",
  "docs\04-project\harness\engineering\issue-workflow.md",
  "docs\04-project\harness\engineering\sprint-workflow.md",
  "docs\04-project\harness\engineering\coding-principles.md",
  "docs\04-project\harness\engineering\core-beliefs.md",
  "docs\04-project\harness\engineering\index.md",
  "docs\04-project\harness\concepts\index.md",
  "docs\04-project\slices\01-product-specs\index.md",
  "docs\04-project\slices\02-exec-plans\features\completed\index.md",
  "docs\04-project\slices\02-exec-plans\issues\index.md",
  "docs\04-project\slices\02-exec-plans\issues\root-causes.md",
  "docs\04-project\slices\02-exec-plans\spec-gaps\README.md",
  "docs\04-project\slices\02-exec-plans\tech-debt-tracker.md"
) | ForEach-Object {
  if (Test-Path $_) { Write-Host "OK  $_" -ForegroundColor Green }
  else              { Write-Host "MISSING  $_" -ForegroundColor Red }
}
```

Fix any MISSING item before proceeding.

---

## Phase 8 — Post-Bootstrap Report

```
Harness v{{HARNESS_VERSION}} bootstrapped from .agent/templates/.

Files written:
  Root:          <count>
  docs/ root:    <count> (README.md, PRODUCT_BASELINE.md)
  01-product/:   <count> (status: <BASELINE_01_STATUS>)
  02-business/:  <count> (status: <BASELINE_02_STATUS>)
  03-technical/: <count> (status: <BASELINE_03_STATUS>)
  04-project/:   <count>
    releases/:   README.md (first v0.1 plan pending Sprint 0)
    sprints/:    sprint-000-product-foundation/commitments.md
  05-releases/:  <count> (status: not_started)

Placeholders left literal: <list, or "none">

Next: run .agent/workflows/harness-cold-start.md, then route per detected state:
  Path A (greenfield, all not_started): open Sprint 0 (Product Foundation).
  Path B (partial brownfield): audit existing docs in Sprint 0 (per-folder).
  Path C (complete brownfield): backfill ARCHITECTURE.md + RELIABILITY.md, then open first feature slice.
```

---

## Phase 9 — Route Based On Detected State

### Path A — Greenfield (all rows `not_started`)

1. Open Sprint 0 — Planner hat per `sprint-workflow.md`. The committed
   slices are already listed in
   `docs/04-project/sprints/sprint-000-product-foundation/commitments.md`
   with explicit deliverable lists per folder.
2. BA hat runs each Product Foundation slice; Tech Lead hat runs
   `product-foundation-03-technical`.
3. Sprint 0 closes only when **every deliverable checkbox** is checked
   and `PRODUCT_BASELINE.md` flips all three folders to `complete`
   (or explicitly `deferred` with documented fly-blind acknowledgment).
4. First release plan `docs/04-project/releases/v0.1-<slug>.md` is
   produced as a mandatory output of `product-foundation-01-product`.

### Path B — Partial brownfield (mixed `seeded` / `partial` / `complete`)

For each folder marked `seeded` or `partial`, ask the user:

> Existing docs detected in `docs/<folder>/`. Choose:
> (a) **Audit + update at Sprint 0** — BA reads existing files, audits against current product reality, fills gaps, marks `complete`. Recommended when docs may be stale.
> (b) **Accept as-is and skip Sprint 0** — flip status to `complete` without re-reading. Only if docs are confirmed current.
> (c) **Per-folder choice.**

(a) → open Sprint 0 with the affected folders. (b) → update `PRODUCT_BASELINE.md`
to `complete` with Notes `Accepted as-is at bootstrap on <date>`.

### Path C — Complete brownfield (all rows `complete`)

1. **Backfill `ARCHITECTURE.md`** — scan working tree (`srv/`, `app/`, `db/`,
   build configs), propose the *What Exists In The Tree* table and *Layer
   Model*. User must approve before commit.
2. **Backfill `RELIABILITY.md`** — replace `*fill at first slice close*`
   placeholders with verified commands from Phase 0. Run each once; record
   result in *Current Baseline*.
3. **Backfill `feature_list.json`** — ask the user whether existing shipped
   features should be recorded as `passing` rows.
4. **First new feature slice** — BA intake → Publish; then DEV Clarify → Close.

---

## Always-True Final Note

Regardless of which path runs, the first DEV slice close will:
- update `ARCHITECTURE.md` if the layer model needs amendment,
- replace remaining `*fill at first slice close*` placeholders in
  `RELIABILITY.md` and `QUALITY_SCORE.md` with verified commands,
- record real evidence in `feature_list.json`.

These are **Harness Deltas** at the slice's close stage, not bootstrap work.

---

## Maintenance

When the harness design changes (new rules, file restructure):

1. Update the appropriate file(s) under `.agent/templates/`.
2. Bump `.agent/templates/docs-template/HARNESS_VERSION`.
3. Note the change in `.agent/templates/docs-template/README.md.tmpl` if it
   affects how members read the docs.

Member-side change is just `git submodule update --remote .agent` followed
by re-running this workflow on the affected folders — no need to re-bootstrap
the whole tree.
