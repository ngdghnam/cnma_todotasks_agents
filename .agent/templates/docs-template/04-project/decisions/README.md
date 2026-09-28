# decisions/

**Architecture Decision Records (ADRs).**

One markdown file per accepted architectural decision, named
`ADR-NNN-<short-slug>.md`. ADRs capture a decision's *context*,
*options considered*, *decision*, and *consequences* so a future reader
(or future agent) can reconstruct why the system looks the way it does.

## When to add an ADR

Add an ADR when a slice (feature, issue, or concept) makes a decision
that:

- shapes how more than one future slice is built, **and**
- would be expensive or risky to reverse later, **and**
- a future reader cannot recover from the code alone.

Routine implementation choices do not need an ADR — those live in the
slice's exec plan. Cross-feature rules without trade-off discussion
belong in `harness/concepts/`, not here.

## Suggested ADR sections

- **Status** — proposed / accepted / superseded.
- **Context** — the situation forcing a decision.
- **Options considered** — at least two, with trade-offs.
- **Decision** — what was chosen, in one paragraph.
- **Consequences** — positive and negative.
- **Triggered by** — slice ID and link to its exec plan.

## ADRs vs. concepts

| | Concept (`harness/concepts/`) | ADR (`decisions/`) |
|---|---|---|
| Shape | Prescriptive rule a slice consumes | Historical record of a choice |
| Tense | Present ("Authorization MUST...") | Past ("We chose X because Y") |
| Changes | Via a concept slice | New ADR superseding the old |

## Status

Empty as of project start. The first ADR is created when a slice makes a
decision meeting the criteria above.
