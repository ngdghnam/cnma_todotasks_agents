# slices/04-quality/

Quality history. Index lives at `docs/04-project/harness/QUALITY_SCORE.md`; this
folder holds the per-domain and per-layer breakdowns the index links to,
plus an append-only history log.

## Files

| File | Scope |
|---|---|
| `history.md` | Append-only log of quality-score updates |
| `<domain>.md` | Per-domain history (added on first close that promotes the domain) |
| `layers.md` | Per-layer health (added on first close that scores layers) |

Add a new per-domain file when a new product domain appears and earns
its own tracked health score (typically at the first close-stage
Harness Delta that promotes the domain).
