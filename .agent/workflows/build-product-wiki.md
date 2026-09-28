---
description: Build the customer-facing product wiki from docs/01-product and docs/05-releases. Static HTML output for PO pre-sales and customer demos. Run after Sprint 0 close, after each release ships, or after any Product Delta touches 01-product or 05-releases.
---

# Build Product Wiki

This workflow renders a customer-facing static site from
`docs/01-product/` + `docs/05-releases/`. Output: `<repo>/dist/wiki/`.

Tool: [MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

## When to run

- **Sprint 0 close** — first build, once 01-product is `complete`.
- **Release shipped** — Planner runs build after `in-flight → shipped`.
- **Slice close with Product Delta into `01-product/` or `05-releases/`** — slice owner runs build before marking slice closed.

## Pre-checks

```bash
# Verify MkDocs Material installed
python -m mkdocs --version
pip show mkdocs-material | grep -i version
```

If missing:

```bash
pip install mkdocs-material
```

## Phase 1 — Stage filtered docs

Create a clean staging folder, copy only customer-visible source:

```powershell
$ErrorActionPreference = "Stop"

# Clean previous staging
if (Test-Path .wiki-build) { Remove-Item -Recurse -Force .wiki-build }
New-Item -ItemType Directory -Force .wiki-build\docs | Out-Null

# Copy customer-visible folders
Copy-Item -Recurse docs\01-product .wiki-build\docs\01-product
Copy-Item -Recurse docs\05-releases .wiki-build\docs\05-releases

# Render mkdocs.yml.tmpl into .wiki-build/mkdocs.yml with project placeholders
$tmpl = Get-Content .agent\templates\wiki-template\mkdocs.yml.tmpl -Raw
# Resolve placeholders — read project metadata
$projectTitle = (Select-String -Path PROGRESS.md -Pattern 'Project: (.+)' | Select-Object -First 1).Matches[0].Groups[1].Value
$projectJtbd = (Select-String -Path docs\04-project\harness\PRODUCT_SENSE.md -Pattern 'Job to be done: (.+)' | Select-Object -First 1).Matches[0].Groups[1].Value
$rendered = $tmpl -replace '\{\{PROJECT_TITLE\}\}', $projectTitle -replace '\{\{PRODUCT_JTBD\}\}', $projectJtbd
Set-Content -Path .wiki-build\mkdocs.yml -Value $rendered -Encoding utf8

# Copy theme overrides folder so MkDocs can find it
Copy-Item -Recurse .agent\templates\wiki-template\overrides .wiki-build\overrides
```

Bash equivalent:

```bash
set -e
rm -rf .wiki-build
mkdir -p .wiki-build/docs
cp -r docs/01-product .wiki-build/docs/01-product
cp -r docs/05-releases .wiki-build/docs/05-releases

project_title=$(grep -m1 'Project: ' PROGRESS.md | sed 's/.*Project: //')
project_jtbd=$(grep -m1 'Job to be done: ' docs/04-project/harness/PRODUCT_SENSE.md | sed 's/.*Job to be done: //')
sed -e "s|{{PROJECT_TITLE}}|$project_title|g" -e "s|{{PRODUCT_JTBD}}|$project_jtbd|g" \
  .agent/templates/wiki-template/mkdocs.yml.tmpl > .wiki-build/mkdocs.yml

cp -r .agent/templates/wiki-template/overrides .wiki-build/overrides
```

## Phase 2 — Preprocess staged docs

Strip `<!-- wiki:hide -->` blocks and filter `planned` rows from
`product-roadmap.md`:

```bash
python .agent/templates/wiki-template/preprocess.py .wiki-build/docs
```

This **only** modifies copies under `.wiki-build/`. The originals under
`docs/` are untouched.

## Phase 3 — Build with MkDocs

```bash
cd .wiki-build
python -m mkdocs build
cd ..
```

Output lands at `<repo>/dist/wiki/` (per the `site_dir` setting in
`mkdocs.yml.tmpl`).

## Phase 4 — Verify

```powershell
if (Test-Path dist\wiki\index.html) {
  Write-Host "✅ Wiki built: dist\wiki\index.html" -ForegroundColor Green
  Write-Host "Open with: start dist\wiki\index.html"
} else {
  Write-Host "❌ Build failed — check MkDocs warnings above" -ForegroundColor Red
}
```

## Phase 5 — Cleanup (optional)

```bash
rm -rf .wiki-build
```

The staging folder is gitignored (see Phase 6 of `init-docs-with-harness.md`
— ensure `.wiki-build/` and `dist/` are listed).

## Sharing the wiki

The output `<repo>/dist/wiki/` is a self-contained static site. Three
common share patterns:

| Pattern | How |
|---|---|
| Local demo | Open `dist/wiki/index.html` in browser |
| Internal share | Upload `dist/wiki/` to internal S3 / BTP static site / network share |
| Public host | `git subtree push --prefix dist/wiki origin gh-pages` (after configuring GitHub Pages) |

Auto-deploy is intentionally out of scope — PO reviews each rebuild before
sharing externally.

## Troubleshooting

- **Broken links in nav** — usually means Sprint 0 hasn't filled every
  deliverable yet (e.g. `user-manual/` is empty). MkDocs warns; build still
  succeeds. Fill the missing files or remove the nav entry from
  `mkdocs.yml.tmpl`.
- **`planned` rows still visible** — check the row uses `| planned |` (with
  spaces). Preprocess script matches case-insensitively but the pipe-and-cell
  shape matters.
- **MkDocs fails on a Mermaid block** — the template config enables Mermaid
  via `superfences`. If still broken, ensure
  `pip install pymdown-extensions` (usually installed with `mkdocs-material`).
