---
description: Cold-start gate — run at the beginning of every session before touching code. Audits harness state, stops at the first red, and requires repair before work continues.
---

# Harness Cold-Start Gate

Run this as **step 2 of every session**, immediately after confirming the repo
root and the active slice name (step 1). Stop at the first red. Repair or
downgrade the claim before adding scope. All checks must be green (or exempted
with a recorded reason in `PROGRESS.md` and `session-handoff.json#active_blockers`)
before you read `ARCHITECTURE.md` or open a plan.

Source of truth for check numbering: `CLEAN_STATE_CHECKLIST.md`.

---

## Pre-flight — Establish Session Context

Before running any check, establish:

1. **Confirm repo root.**
   ```powershell
   pwd
   ```
   Must match `session-handoff.json#repository`. If different, stop and
   determine correct working directory.

2. **Name the slice.** The developer must state which slice this session
   continues or starts (e.g. `"continue feature-002"`, `"start issue-003"`,
   `"draft concept-assignment"`). If not stated, **ask** — do not infer from
   the most recently touched plan. Once named, this slice is the anchor for
   every read and write in the session.

3. **Read `docs/04-project/ACTIVE_WORK.md`.** Identify all in-flight slices and their
   assignees. Do not write into another assignee's plan without explicit
   user instruction.

---

## Check 1 — Standard startup path works

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File ./init.ps1
```
```bash
# Linux / macOS
./init.sh
```

**Pass when:** exits 0.

**Red:** do not proceed. Investigate the failure output, fix the root cause (missing
dependencies, path issues, permission error), and re-run until green.

---

## Check 2 — CAP model builds (cold-start: whole-codebase)

```bash
npm run cds:build
```

**Pass when:** exits 0. Existing CDS association warnings are tolerated **only if**
each warning is already tracked with a row in
`docs/04-project/slices/02-exec-plans/tech-debt-tracker.md`.

**Red:** fix CDS errors. If a warning is genuinely pre-existing and unrelated to
the current slice, add a tech-debt row and record the exemption in
`PROGRESS.md` before proceeding.

---

## Check 3 — Tests run for declared scope

At cold-start the scope is whole-codebase:

```bash
npm test -- --passWithNoTests
```

**Pass when:** exits 0.

**Red:** fix failing tests, or record in the active plan's *whole-codebase
exemptions* (each failing file with a link to a `tech-debt-tracker.md` row)
before proceeding. A red with no documented exemption is a hard stop.

---

## Check 4 — Backend TypeScript builds

At cold-start the scope is whole-codebase:

```bash
npm run build
```

**Pass when:** exits 0. Every failing file must be listed in the active plan's
*whole-codebase exemptions*, each linking to a `tech-debt-tracker.md` row,
and none of those files may be in the current slice's scope.

**Red:** fix TypeScript errors, or record the exemption before proceeding.

---

## Check 5 — Current progress recorded

Open `PROGRESS.md`. Inspect the `Updated:` field and the "Current Verified
State" block.

**Pass when:**
- `Updated:` date is current (today, or < 1 session-day gap with a documented
  reason).
- "Current Verified State" points at the active plan (or explicitly states no
  plan is open).

**Red:** update `PROGRESS.md` before proceeding. A stale progress file means
the next check may operate on fiction.

---

## Check 6 — Feature state reflects reality

Inspect `feature_list.json` and `docs/04-project/ACTIVE_WORK.md` together.

Verify:
- Every `passing` entry has at least one linked evidence entry in its `evidence[]`
  array.
- **Exactly one `in_progress` per assignee** (or zero if no slice is active for
  that assignee). Multiple assignees may each have one in-flight entry.
- Every `in_progress` row in `feature_list.json` has a matching row in
  `docs/04-project/ACTIVE_WORK.md` (same slice ID, same assignee).
- Every row in `docs/04-project/ACTIVE_WORK.md` maps back to a `feature_list.json` entry.

**Pass when:** all invariants hold across both files.

**Red:** reconcile the discrepancy explicitly. Do not open code with stale
tracker state.

---

## Check 7 — Active slice stage is named

Open the active slice plan:
- Feature slices: `docs/04-project/slices/02-exec-plans/features/active/<slice>.md`
- Issue slices: `docs/04-project/slices/02-exec-plans/issues/active/<issue>.md`
- Concept slices: `docs/04-project/harness/concepts/<concept-slug>.md`

**Pass when:** current stage is one of the valid stages for its slice type:

| Slice type | Valid stages |
|---|---|
| Feature (DEV) | clarify / plan / implement / self-review / test / verify / close |
| Feature (BA) | intake / clarify / draft / review / publish |
| Concept | intake / clarify / draft / peer-review / publish |
| Issue | triage / fix / close |

**Red:** name the stage in the plan's progress log before proceeding.

---

## Check 8 — User approval gates are recorded

In the active plan, open the progress log section. Verify every crossed
stage transition has an explicit, dated approval line. No silent skips.

Required gates per slice type:

| Slice type | User gates |
|---|---|
| Feature (DEV) | clarify→plan, plan→implement, verify→close |
| Feature (BA) | intake→clarify, clarify→draft, review→publish |
| Concept | intake→clarify, clarify→draft, peer-review→publish |
| Issue | triage→fix, fix→close |

**Pass when:** every gate that was crossed has a recorded approval line.

**Red:** do not proceed — reconstruct the missing approval with the user, or
revert the plan to the last gate that was explicitly approved. Inferred
approval is a harness defect.

---

## Check 9 — Plan is implementation-ready before implement approval

**Only applies when the active slice is at `implement` or a later stage.**

Open the active plan. The following sections must be present and non-trivial
(not just headings — actual content):

- Concrete files to create or change (file paths)
- Module responsibilities per file
- Public APIs / types (names and shapes)
- Input/output shapes (request and response)
- Algorithms or decision tables
- Source-of-truth mappings
- Test cases (what each test asserts)
- Exclusions (what is explicitly out of scope for this slice)
- Unresolved blockers
- Declared verification scope:
  - *Slice scope* — explicit file list for targeted `tsc --noEmit` and `--testPathPattern`
  - *Module scope* — the service or module to widen to before verify→close
  - *Whole-codebase exemptions* — failing commands listed at plan→implement, each linked to a `tech-debt-tracker.md` row

**Pass when:** all sections are present and populated.

**Red:** do not write code. Fill the missing sections and get a fresh
plan→implement approval before implementation begins.

---

## Check 10 — No half-finished step undocumented

Open the active plan's progress log. Every step that was started must be
either:
- Marked complete with evidence, or
- Carried explicitly as an open decision or risk.

**Pass when:** no step is stranded mid-execution with no status.

**Red:** document the half-finished step (decision or risk) before proceeding.

---

## Check 11 — Harness changes trace to evidence

Run a diff of harness-owned files against `main`:

```bash
git diff main -- ARCHITECTURE.md CONSTRAINTS.md \
  "docs/04-project/harness/engineering/**" \
  "docs/04-project/harness/concepts/**" \
  "docs/04-project/slices/01-product-specs/**"
```

Every changed line must trace to one of:
- A closed slice's **Harness Deltas** section (cite the completed plan), or
- A **published concept slice** (cite the concept doc), or
- A **confirmed user requirement in this session** (record it inline), or
- A **revert** of a prior unsourced entry.

**Pass when:** every changed line in harness files has a traceable source.

**Red:** revert the unsourced change, or record it as a confirmed user
requirement this session (one-line reason required).

---

## Check 12 — Next session can continue without manual repair

Open `session-handoff.json`. Read `next_best_action[]`.

**Pass when:** every entry is:
- Specific — names a file, command, or slice
- Current — matches today's PROGRESS.md state
- Reachable — follows naturally from the verified state

**Red:** update `session-handoff.json` so the next agent can start cold.

---

## Check 13 — No unrelated worktree damage

```bash
git status
```

**Pass when:** every dirty file is either:
- In the current slice's declared scope, or
- A doc/tracker update (`PROGRESS.md`, `feature_list.json`, `session-handoff.json`,
  `docs/04-project/slices/**`, `docs/04-project/harness/QUALITY_SCORE.md`,
  `docs/04-project/harness/RELIABILITY.md`)

**Red:** investigate the unexpected dirty files. Do not use `git checkout --` or
`git restore` without understanding the origin of the changes — they may
represent in-progress work from a previous session.

---

## Check 14 — Index files stay thin

Inspect these files and confirm every table row cell is **one line**:

- `docs/04-project/slices/01-product-specs/index.md`
- `docs/04-project/harness/concepts/index.md`
- `docs/04-project/harness/QUALITY_SCORE.md`
- `docs/04-project/harness/RELIABILITY.md`
- `docs/04-project/slices/02-exec-plans/features/completed/index.md` (if it exists)
- `docs/04-project/slices/02-exec-plans/issues/index.md`

Per-feature, per-domain, per-layer, and per-issue detail belongs in its
linked per-X file — not in index cells.

**Pass when:** every cell is one line. Multi-line cells mean detail crept into the
index and must be extracted to its linked file.

**Red:** extract the verbose cell content into its linked file before proceeding.

---

## Check 15 — Root-cause log is read and in sync

**Step A — Read the log now** (this satisfies the "read at cold-start"
requirement):

Open and read: `docs/04-project/slices/02-exec-plans/issues/root-causes.md`

**Step B — Verify sync** across three locations for every closed issue:

1. `docs/04-project/slices/02-exec-plans/issues/index.md` — *Closed* row
2. `docs/04-project/slices/02-exec-plans/issues/root-causes.md` — category list entry
3. `feature_list.json#fix_history[]` on the owning feature row

**Step C — Pattern scan:** if any category holds ≥ 3 entries against the same
feature or module, check whether the most recent closing slice proposed a
Harness Delta. If not, note it as a finding before proceeding.

**Pass when:** all three locations are in sync AND you have read `root-causes.md`
this session.

**Red:** sync the three locations before proceeding.

---

## Check 16 — Diff stays inside declared verification scope

```bash
git diff
```

Every changed **code** file must be either:
- Listed in the active plan's declared **slice scope**, or
- A permitted tracker/doc update (see `CLEAN_STATE_CHECKLIST.md` row 16 for
  the full list)

If a code file outside the slice scope was edited, two routes are available:
1. Revert the out-of-scope file, or
2. Re-declare the slice scope in the active plan with a fresh plan→implement
   user-approval line.

Silently widening scope is a harness defect.

**Pass when:** every code change is in scope.

**Red:** revert or re-declare. Do not continue writing code until scope is clean.

---

## Check 17 — Evaluator rubric is filled before verify→close

**Only applies when the active slice is at `verify` stage.**

Open the active plan's evaluator rubric section. All four dimensions must
be scored A–D with cited evidence (commands, files, runtime observations):

| Dimension | A | B | C | D |
|---|---|---|---|---|
| Code correctness | all declared test scopes green | module scope green, slice scope green, exemptions hold | partial green with documented carry-over | red without accepted exemption |
| Architecture compliance | layer order clean, all consumed concept rules clean | minor deviations recorded as Harness Deltas | obvious deviations not yet addressed | violates a CONSTRAINTS.md row |
| Test coverage | main flow + boundary cases automated | main flow automated | skeleton only | no tests |
| Runtime evidence | structured runtime evidence row in feature_list.json for every declared surface | at least one request/response captured | declared runtime surface but no runtime evidence | no evidence and slice had a runtime surface |

`Runtime evidence` may be `N/A` **only if** the plan explicitly declared
*no runtime surface* with a one-line reason.

**Pass when:** rubric is filled with grades and cited evidence.

**Red:** fill the rubric before requesting verify→close approval.

---

## Check 19 — No forward-referenced slice IDs

Scan the following files for slice IDs in the form `feature-NNN-*`,
`concept-*`, `issue-*`, `adr-*`:

- `docs/04-project/releases/*.md` (outside the *Shipped Slices* table)
- `docs/04-project/sprints/*/commitments.md`
- `docs/04-project/decisions/*.md`
- *Consumers* tables in `docs/04-project/harness/concepts/*.md`

Every named slice ID must satisfy **at least one** of:
1. Has a row in `docs/04-project/backlog.md`, or
2. Has a product spec stub (≥ Intake note) under `docs/04-project/slices/01-product-specs/`, or
3. Has a completed exec plan under `docs/04-project/slices/02-exec-plans/features/completed/`

**Pass when:** every slice ID is grounded in one of the three locations.

**Red:** delete the forward-reference, or add the slice ID to `backlog.md` as a
one-line candidate. Do not create a full spec stub just to satisfy this check —
that is the same forward-reference problem in a different file.

---

## Check 18 — Live trackers are trimmed on close

**Only applies when a slice closed in the previous session.**

For the most recently closed slice, verify:

1. `feature_list.json#evidence[]` for that slice is reduced to ≤ 2 entries:
   - one close-gate command-shape entry, and
   - one runtime-shape entry (if the plan declared a runtime surface)
   Full evidence trail is in `docs/04-project/slices/02-exec-plans/features/completed/<slice>.md`.

2. `session-handoff.json#currently_verified` collapses all per-command keys
   for the closed slice into a single pointer key:
   `"<slice_id>_status": "passing (see feature_list.json)"`

3. `session-handoff.json#next_best_action[]` no longer contains an entry
   for the closed slice.

4. Every `session-handoff.json#active_blockers[]` entry owned by the closed
   slice is either deleted (resolved) or migrated to
   `docs/04-project/slices/02-exec-plans/issues/active/`.

**Size targets:** `feature_list.json` ≤ ~400 lines; `session-handoff.json` ≤ ~80 lines.

**Pass when:** trackers are within size targets and closed slice is trimmed.

**Red:** trim before starting new work. Bloated trackers slow every agent in
subsequent sessions.

---

## Check 20 — Product Baseline status is visible + roadmap populated

**Step A:** Open `docs/PRODUCT_BASELINE.md`. Verify:
- Rows exist for `01-product`, `02-business`, `03-technical`, `05-releases`.
- Every `partial` row has a **non-empty Notes column** naming which area is empty.
  A `partial` row with an empty Notes column is treated as `not_started`.

**Step B — INVALID STATE guard:** If `01-product` row shows `Status: complete`,
verify **both**:

1. `docs/01-product/product-roadmap.md` has ≥ 1 real row in the Feature
   Catalog table (a placeholder row `*empty — fill at Sprint 0*` does NOT
   count). Each real row must carry a non-empty `Target Release` cell using
   semver (e.g. `v0.1-mvp`).
2. The first release plan exists at `docs/04-project/releases/v0.1-*.md`
   with Sections 1–4 (Release Goal, Why, Scope, Ship criteria) populated.
   An empty `releases/` directory (only `README.md`) with a `complete`
   01-product baseline is invalid.

If either condition fails:

> **INVALID STATE — block task work.** Instruct the user to either:
> - Complete the missing artifact (Feature Catalog rows with `Target Release`,
>   or the first `v0.1-<slug>.md` release plan derived from the Foundation
>   wave), or
> - Downgrade `PRODUCT_BASELINE.md` `01-product` status to `partial`.

**Step C — Proposed-against-no-baseline scan:** Print a one-line count of
closed plans in `docs/04-project/slices/02-exec-plans/features/completed/` that carry the
`proposed-against-no-baseline` flag per product folder. If any folder has
> 10 such flags and its baseline status is still `not_started` or `partial`,
suggest opening a Product Foundation slice.

**Pass when:** all rows exist, no INVALID STATE, count printed.

**Red:** fix the invalid state before proceeding.

---

## All Checks Green — Proceed

Once all applicable checks are green:

1. Read `ARCHITECTURE.md` (step 3 of the `AGENTS.md` startup workflow).
2. Read the workflow doc for the hat you are wearing this session (per the
   Role Routing table in `AGENTS.md`).
3. Read `docs/04-project/harness/QUALITY_SCORE.md` for weak domains and layer health.
4. Open the active plan.
5. Begin work from the named stage.

---

## End-of-Session Reminder

Before closing any session, run the same check list as an **end-of-session
gate**. The difference from cold-start:

- Check 2 and 4 scope to whole-codebase at close (same as cold-start).
- Check 3 widens to module scope before verify→close, then whole-codebase at close.
- Check 18 applies if a slice closed **this** session.
- Every box must be green, or the exception must be in `PROGRESS.md` and
  `session-handoff.json#active_blockers` before you end.

Full gate rules: `CLEAN_STATE_CHECKLIST.md` *Operating Rules* section.
