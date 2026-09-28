# Spec Gaps

Lightweight artifact for DEV→BA hand-back when a published spec has a gap.

## When to create one

DEV is at `implementation-workflow.clarify` and finds the published spec is
missing or ambiguous on something needed to plan. Instead of guessing or
pausing the slice silently:

1. DEV creates a file `<feature-slice>-<NN>.md` in this directory using the
   template below.
2. DEV commits the spec-gap file (clarify stage allows this commit).
3. BA picks up the spec-gap via `ba-workflow.01-intake` (re-open or new
   slice as appropriate), updates the spec, runs through
   `02-clarify → 03-draft → 04-review → 05-publish` again.
4. BA's publish stage marks the spec-gap `Status: resolved`.
5. DEV pulls main, continues clarify with the updated spec.

## Template

```markdown
# Spec Gap: <short title>

- Slice: <feature-slice-id>
- Reporter: <dev assignee>
- Found at stage: implementation-workflow.clarify
- Found on: <YYYY-MM-DD>
- Status: open

## Gap

<What is missing or ambiguous in the published spec.>

## Why it blocks planning

<What planning decision cannot be made without this.>

## Suggested resolution

<Optional: what DEV thinks the answer might be, for BA to validate.>

## Resolution

<Filled by BA at publish. Link to the spec section that was added/changed.>
```

## Status values

- `open` — DEV raised, BA has not picked up
- `in-progress` — BA running ba-workflow against this gap
- `resolved` — BA published updated spec; DEV can resume
- `wont-fix` — BA decided no change needed; spec stays; DEV must accept and document trade-off in plan

## Conventions

- One file per gap, even if multiple gaps exist on the same slice
- Numbering `<NN>` is per-slice, monotonic, two-digit
- Keep the file short — it is a hand-back note, not a sub-spec
- Both BA and DEV must be able to read it without context
