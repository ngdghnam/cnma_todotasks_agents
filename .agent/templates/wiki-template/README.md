# wiki-template/

Static-site generator config for the **product wiki** — the customer-facing
view of `01-product/` + `05-releases/`. Built by
`.agent/workflows/build-product-wiki.md`.

## Tool

[MkDocs Material](https://squidfunk.github.io/mkdocs-material/). Python-based,
single config file, no JavaScript build pipeline.

Install once per machine:

```bash
pip install mkdocs-material
```

## Source folders (customer-visible)

| Source | Why included |
|---|---|
| `docs/01-product/` | Vision, personas, roadmap, scope, user guide, FAQ |
| `docs/05-releases/` | Release history — momentum signal for pre-sales |

Folders **excluded** from the wiki: `02-business/`, `03-technical/`,
`04-project/`. Internal context, not customer-facing.

## Hiding internal content within a file

Wrap blocks that should NOT appear in the wiki:

```markdown
<!-- wiki:hide -->
## Open Points

1. Internal question still under discussion.
<!-- /wiki:hide -->
```

The preprocess step strips these blocks before MkDocs renders. The original
markdown file is untouched — only the staged copy under `.wiki-build/` is
modified.

## Filtering `planned` features

`product-roadmap.md` Feature Catalog rows with `Status: planned` are
automatically hidden from the wiki. Customer sees only `in-backlog`,
`in-flight`, and `shipped` rows — products you can talk about with
confidence.

## Branding

`overrides/main.html` is an empty hook for custom theme extension (logo,
color overrides, footer). Material default ships with a clean theme — only
override when product branding is finalized.

For palette / fonts, edit `mkdocs.yml.tmpl` (`theme.palette` and `theme.font`
keys).

## Build

```bash
.agent/workflows/build-product-wiki.md
```

Output: `<repo>/dist/wiki/index.html`. Open locally with a browser, or
upload `dist/wiki/` to any static host (GitHub Pages, Netlify, S3, BTP).

## Update triggers

The wiki rebuilds at:

- **Sprint 0 close** — first build, after 01-product is `complete`.
- **Release shipped** — Planner runs build after `in-flight → shipped` transition.
- **Slice close with Product Delta into `01-product/` or `05-releases/`** — slice owner runs build before marking slice closed.

All three are checklist items in the matching workflow's Close stage. Not
automated by CI by default — kept manual so PO can review the rendered output
before sharing.
