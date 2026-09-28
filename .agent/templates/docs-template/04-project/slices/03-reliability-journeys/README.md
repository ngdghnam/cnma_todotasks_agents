# slices/03-reliability-journeys/

Per-feature "golden journey" reliability docs. One file per closed
feature describing the runtime path that proves the feature works
end-to-end (request → handler → repository → response, or UI gesture →
service call → observable outcome).

These docs are written at a feature's close stage and consumed at
cold-start so a fresh session can re-verify the feature without
re-deriving the path.

## When to add a file here

At feature close, when the close-stage Harness Delta promotes the
slice's runtime verification into a durable reliability journey.

## Format

One file per feature, named `<slice-id>.md` (e.g. `feature-NNN-<slug>.md`).
The body names the user-visible behavior, the repeatable command(s) or
UI path that exercises it, the failure signal that proves regression,
and the current evidence (automated + runtime).
