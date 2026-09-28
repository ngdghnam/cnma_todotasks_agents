# Badge

> A small status descriptor for UI elements, used to highlight categories, counts, or states.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Badge>
  {/* Icon or Text content */}
  Text
</Badge>
```

## Props API Reference

### Badge
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "destructive" \| "success" \| "outline" \| "secondary" \| "warning" \| "info" \| "positive" \| "negative" \| "attention" \| "informativeBlue" \| "informativeTeal" \| "obsoleted" \| "notifications" \| "risk" \| "subColor1"` | `"default"` | The visual style variant of the badge. |
| `hasBorder` | `boolean` | `false` | Whether the badge should have a border. |
| `asChild` | `boolean` | `false` | When `true`, merges its props onto its immediate child instead of rendering a `div` or `span`. Useful for rendering as a link (`<a>`). |
| `className` | `string` | — | Additional CSS classes applied to the badge. |
| `children` | `ReactNode` | — | The content rendered inside the badge. |

## Variants & Examples

### Default

```tsx
import {  Badge  } from "@cnma/react-ui"

export function BadgeDemo() {
  return <Badge>Default</Badge>
}
```

### All Variants

```tsx
import {  Badge  } from "@cnma/react-ui"

export function BadgeVariantsDemo() {
  return (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  )
}
```

### As Link

```tsx
import {  Badge  } from "@cnma/react-ui"

export function BadgeLinkDemo() {
  return (
    <Badge asChild>
      <a href="/orders">5 New Orders</a>
    </Badge>
  )
}
```

### With Icon

```tsx
import {  Badge  } from "@cnma/react-ui"
import { CheckCircle } from "lucide-react"

export function BadgeIconDemo() {
  return (
    <Badge variant="success">
      <CheckCircle className="size-3 mr-1" />
      Verified
    </Badge>
  )
}
```

## Accessibility

- **Keyboard interactions:**
  - By default, badges are not interactive and not focusable.
  - When used as a link (`asChild` with `<a>`), it becomes focusable via `Tab` and triggers on `Enter`.
- **Screen Readers:**
  - Content is read as standard inline text.
  - If a badge relies entirely on visual color for meaning, provide a visually hidden accessible text to describe the state.
- **Focus Ring:** Visible focus ring with `3px` ring on focus-visible when the badge is interactive.

## Design Guidelines

### ✅ Do
- Use `whitespace-nowrap` on badges to prevent text from wrapping awkwardly on smaller screens.
- Use `StatusBadge` (if available in your system) for business status values (e.g., "Approved", "In Progress") instead of raw badges.
- Keep badge text short (1-3 words).
- Use semantic variants (`success`, `warning`, `info`) for states that convey specific meanings.

### ❌ Don't
- Don't use `w-min` on badges — it can cause unintended text wrapping.
- Don't create per-page color maps or bespoke styles for status badges; use global semantic variants.
- Don't put long sentences or paragraphs inside badges.
- Don't use the `destructive` variant for neutral or non-error states.
