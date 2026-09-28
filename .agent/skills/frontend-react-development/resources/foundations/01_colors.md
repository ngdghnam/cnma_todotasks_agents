# Foundation: Color System — Version 2

## 1. Architecture
The CNMA Boilerplate uses a **three-tier color architecture** defined in `theme.css`:

```
Palette (raw colors) → Semantic Tokens (role-based) → Component Styles (Tailwind classes)
```

## 2. Brand Colors
```css
:root {
  --color-brand:       #b10e10;  /* Primary button fills, active borders */
  --color-brand-hover: #990c0e;  /* Hover state for primary actions */
  --color-link:        #820a0c;  /* Text links */
}
```

> **Rule**: Change ONLY these 3 variables to rebrand the entire application.

## 3. Semantic Palette

| Token | Hex | Purpose | Tailwind Example |
|-------|-----|---------|-----------------|
| `--palette-positive` | `#256f3a` | Success | `text-success`, `bg-success-bg` |
| `--palette-negative` | `#aa0808` | Error | `text-error`, `bg-error-bg` |
| `--palette-critical` | `#e76500` | Warning | `text-warning`, `bg-warning-bg` |
| `--palette-informative` | `#0070f2` | Info | `text-info`, `bg-info-bg` |
| `--palette-neutral` | `#788fa6` | Muted | `text-muted-foreground` |

### Auto-Derived Backgrounds
Each palette color generates lighter variants using `color-mix()`:
```css
--color-success-bg: color-mix(in srgb, var(--palette-positive) 12%, #ffffff);  /* ~12% tint */
--color-error-bg:   color-mix(in srgb, var(--palette-negative) 12%, #ffffff);
```

## 4. Surface / Background Layers

| Layer | Token | Hex | Usage |
|-------|-------|-----|-------|
| App Shell | `--background` | `#edeff0` | Outermost background |
| Card | `--card` | `#ffffff` | Card surfaces, panels |
| Muted | `--muted` | `#f2f2f2` | Disabled, subtle areas |
| Accent | `--accent` | `#f2f2f2` | Hover highlights |

## 5. Status Colors for Badges
Status colors are auto-generated from their palette base. Each status produces 3 values:

```css
/* Example: "new" status uses critical (orange) palette */
--status-new: var(--palette-critical);
/* Theme generates: */
--color-status-new:        /* 12% tint background */
--color-status-new-text:   /* Full palette color */
--color-status-new-border: /* 40% tint border */
```

**Usage in Tailwind**: `bg-status-new text-status-new-text border-status-new-border`

## 6. Best Practices
- **DO** use CSS variables: `var(--color-brand)`, `var(--palette-positive)`
- **DON'T** hardcode hex values in component files
- **DO** use semantic tokens: `text-success` not `text-[#256f3a]`
- **DON'T** use brand red for error states — use `--palette-negative`
