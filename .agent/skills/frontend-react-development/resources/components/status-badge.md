# Status Badge

> A CVA-based badge with automatic color mapping for business status values.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<div class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap bg-[--palette-positive] text-white">
  Completed
</div>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | **Required** | The exact status string (e.g., `"Approved"`, `"In Progress"`). It determines the color mapping. |
| `children` | `React.ReactNode` | — | Optional override for display text. |
| `className` | `string` | — | Additional CSS classes for the badge. |

## Variants & Examples

### Default Usage
```tsx
import {  StatusBadge  } from "@cnma/react-ui";

export default function StatusBadgeDemo() {
  return (
    <div className="flex gap-2">
      <StatusBadge status="New" />
      <StatusBadge status="Approved" />
      <StatusBadge status="In Progress" />
      <StatusBadge status="Completed" />
      <StatusBadge status="Rejected" />
    </div>
  );
}
```

## Accessibility

- Screen readers will read the text inside the badge. If the color itself conveys meaning not apparent from the text, consider appending a visually hidden explanation.
- Focusable only if explicitly given a `tabindex` or placed inside an interactive element.

## Design Guidelines

- **Do** always use `StatusBadge` for business statuses instead of defining per-page color maps or using the generic `Badge` component.
- **Do** use `whitespace-nowrap` on badges so the text does not wrap awkwardly within constrained spaces.
- **Do** add new statuses by updating the mapping logic inside the component or adding a single line in `theme.css`.
- **Don't** use `w-min` on the badge, which may cause unwanted text wrapping.
- **Don't** hardcode status colors directly in your page components.

## Status → Palette Mapping

| Status | Palette Category | CSS Variable |
|--------|------------------|--------------|
| New / Open | Critical (orange) | `--palette-critical` |
| In Progress | Critical (orange) | `--palette-critical` |
| Released / Approved | Informative (blue)| `--palette-informative` |
| Sent / Shipped | Purple | `--palette-purple` |
| Completed | Positive (green) | `--palette-positive` |
| Obsoleted / Rejected| Neutral (grey) | `--palette-neutral` |
