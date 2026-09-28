# Issue Workflow

## Purpose

A bug or regression against an already-closed feature uses this **separate**
lean workflow — not the eight-stage feature-slice lifecycle in
[implementation-workflow.md](implementation-workflow.md).

Features discover *unknown* behavior; issues correct *known* behavior. Mixing
the two flows makes routine fixes expensive and lets regressions hide in
feature-sized ceremony.

## When To Use This Workflow (vs. Feature Slice)

| Situation | Workflow |
|---|---|
| Closed feature produces a *regression signal* (journey doc or concept rule says X, code does Y) | **Issue** |
| Behavior was never specified | **Feature slice** |
| Cross-feature rule itself is wrong | **Concept slice** (then fix slices may follow) |
| User wants new behavior in a closed feature | **Feature slice** (not an issue) |

If *Triage* below cannot identify an owning feature, the issue closes without
code and is re-routed to one of the above.

## Lifecycle (Three Stages, Two User Gates)

### 1. Triage

Reproduce the symptom and identify the owning feature.

Outputs:

- **Symptom** — user's words verbatim plus reproduction steps.
- **Reproduction** — a deterministic command, request, or UI path that
  shows the bad behavior. Non-reproducible reports become a *monitor* row
  in `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md`, not an issue.
- **Feature Identification** — one of four results below.
- **Pattern Check** — scan `docs/04-project/slices/02-exec-plans/issues/root-causes.md` for prior issues
  with similar symptom/path; cite any. This is where the harness pays
  back the root-cause discipline.

Feature Identification follows a deterministic five-step search and
records the trace (even when one feature wins):

1. Match symptom against each `docs/04-project/slices/03-reliability-journeys/*.md` *Regression
   Signal*.
2. Trace the runtime path (endpoint → handler → service) against each
   closed plan's *Files To Create Or Change*.
3. Cross-check `feature_list.json` evidence arrays.
4. For rule-violation symptoms, follow the relevant concept's *Consumers*
   list.
5. Correlate suspected files with `git log` against completed plan dates.

Result categories:

| Result | Next Move |
|---|---|
| **Identified** (one feature wins) | proceed; record feature ID |
| **Ambiguous** (multiple candidates) | user picks at Triage→Fix gate, or split into multiple issues |
| **No owner — gap** (behavior never specified) | close issue without code; open a feature slice |
| **No owner — out of scope** (residue or un-sliced area) | close issue; record in `docs/04-project/slices/02-exec-plans/tech-debt-tracker.md` |

**Gate Triage → Fix: user approval** on reproduction and feature ID.

### 2. Fix

Output goes inside the same issue plan file; no separate stages.

- **Root Cause** — one paragraph naming the file and line where wrong.
  "It works now" is not a root cause.
- **Root-Cause Category** — exactly one from the controlled vocabulary
  below.
- **Diff scope** — files changed; smallest diff that fixes the cause.
- **Regression test** — a test that fails on old code, passes on new
  code. Mandatory; pure docs/typo fixes may declare a compression.
- **Self-Review** — scan the diff against `CONSTRAINTS.md`, the owning
  concept's *Rules*, and the relevant section of
  `docs/04-project/slices/02-exec-plans/issues/root-causes.md` for repeat-pattern signals.
- **Test** — regression test passes; full suite stays green; commands
  recorded.
- **Verify** — re-run the journey doc's runtime path; regression signal
  is gone; command + observation recorded.

Agent-internal — no user gate.

### 3. Close

- Update the owning feature's
  `docs/04-project/slices/03-reliability-journeys/feature-NNN-<slug>.md` *Current Evidence*.
- Append a one-line entry to `feature_list.json#fix_history` on the
  owning feature row: `{ id, category, date }`.
- Append a one-line row to `docs/04-project/slices/02-exec-plans/issues/index.md`.
- Append a one-line row under the matching category in
  `docs/04-project/slices/02-exec-plans/issues/root-causes.md`.
- Move the issue plan from `docs/04-project/slices/02-exec-plans/issues/active/` to
  `docs/04-project/slices/02-exec-plans/issues/closed/`.
- **Harness Deltas** — if `docs/04-project/slices/02-exec-plans/issues/root-causes.md` now shows a
  pattern (three or more entries under the same category against the
  same feature, or against the same module across features), propose
  a Harness Delta: a new self-review smell, a constraint, a concept
  amendment, or a coding-principles update. Each delta cites the
  pattern by linking the matching rows.

**Gate Fix → Close: user approval** on evidence, root-cause category,
and any Harness Deltas.

## Root-Cause Categories (Controlled Vocabulary)

| Category | Meaning |
|---|---|
| `logic` | Algorithm or branch error in the implementation |
| `null-handling` | Missing guard for undefined, null, empty, or absent field |
| `contract-drift` | Implementation diverged from product spec, journey doc, or planned response contract |
| `concept-violation` | Implementation contradicts a consumed concept's *Rules* |
| `residue` | Leftover code from a prior implementation triggered the bug |
| `env-config` | Misconfigured env, scope, role template, or deployment setting |
| `race` | Timing, ordering, or concurrency defect |
| `dependency` | Upstream library or external-service change broke behavior |
| `spec-gap` | Spec/concept itself was wrong or ambiguous — root fix is a spec/concept amendment, not a code patch |
| `test-gap` | Bug was preventable with a test that did not exist; missing test added as part of the fix |

The vocabulary is closed. A category that does not fit becomes a Harness
Delta at close that proposes a new category — never invented inline.

## Locations And IDs

- ID: `issue-NNN-<slug>` (separate ID space from `feature-NNN`).
- Active plan: `docs/04-project/slices/02-exec-plans/issues/active/issue-NNN-<slug>.md`.
- Closed plan: `docs/04-project/slices/02-exec-plans/issues/closed/issue-NNN-<slug>.md`.
- Index (TOC): `docs/04-project/slices/02-exec-plans/issues/index.md`.
- Root-cause roll-up: `docs/04-project/slices/02-exec-plans/issues/root-causes.md`.
- Feature-row history: `feature_list.json#fix_history[]` on the owning
  feature row.

Issues do **not** live under `docs/04-project/slices/02-exec-plans/features/`. Feature plans and issue
plans are separate trees so the *one in-progress feature* invariant in
`feature_list.json` is unaffected by parallel issue work.

## Lean Plan Template

```markdown
# Issue NNN: <one-line symptom>

## Owning Feature
feature-NNN — [spec](../../slices/01-product-specs/feature-NNN-<slug>.md) — [journey](../../slices/03-reliability-journeys/feature-NNN-<slug>.md)

## Symptom
User's words verbatim.

## Reproduction
- Steps / command / URL
- Observed
- Expected (cite journey signal or concept rule)

## Pattern Check
- Scanned `docs/04-project/slices/02-exec-plans/issues/root-causes.md`: <matches or "no prior matches">

## Root Cause
One paragraph. File + line.

## Root-Cause Category
<one of the controlled vocabulary>

## Fix
- Diff scope: <files>
- Regression test: <name + what it asserts>

## Evidence
- Regression test: failing → passing (commands)
- Full suite: command + result
- Runtime journey re-exercised: command + result

## Gates
- Triage → Fix: <user approval, date>
- Fix → Close: <user approval, date>

## Harness Deltas
*none* — or one-line each citing pattern rows in `docs/04-project/slices/02-exec-plans/issues/root-causes.md`.
```

## What Stays Strict

- Reproduction is mandatory. No reproduction → not an issue.
- Regression test is mandatory. No test → not closed.
- Root cause is mandatory and one paragraph.
- Root-cause category is mandatory at the Fix → Close gate.
- Owning feature must exist or be opened as a feature slice.
- Compression is allowed only for pure docs/typo fixes and must be
  declared in the plan.

## Awareness In Next Tasks

The root-cause log exists so future slices benefit from past defects.
This is enforced by the routing path, not by convention:

- **Cold-start gate** (`CLEAN_STATE_CHECKLIST.md`) requires reading
  `docs/04-project/slices/02-exec-plans/issues/root-causes.md` so every session begins aware of recent
  patterns.
- **Feature-slice *clarify*** scans the log for categories likely to
  re-occur in the new slice's surface area.
- **Self-review** (feature and issue) scans the matching category for
  repeat-pattern signals.
- **Close** in any workflow proposes a Harness Delta when a pattern
  threshold (≥3 entries in a category against the same feature or
  module) is met.

## Related

- [implementation-workflow.md](implementation-workflow.md) — feature-slice lifecycle.
- [../concepts/index.md](../concepts/index.md) — concept-slice workflow.
- [../../slices/02-exec-plans/issues/index.md](../../slices/02-exec-plans/issues/index.md) — issue TOC.
- [../../slices/02-exec-plans/issues/root-causes.md](../../slices/02-exec-plans/issues/root-causes.md) — root-cause roll-up.
- [../PLANS.md](../PLANS.md) — feature-plan structure.
- [../../../../CLEAN_STATE_CHECKLIST.md](../../../../CLEAN_STATE_CHECKLIST.md) — cold-start and end-of-session gates.
