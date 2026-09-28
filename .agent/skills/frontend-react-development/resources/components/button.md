# Button

> A versatile, interactive element for triggering actions and submitting forms.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import {  Button  } from "@cnma/react-ui"

export default () => (
  <Button variant="default" size="default">
    Submit
  </Button>
)
```

## Props API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link" \| "create" \| "filter" \| "action" \| "success" \| "subtle"` | `"default"` | The visual style of the button. |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | The size preset of the button. |
| `asChild` | `boolean` | `false` | Merges props onto child element instead of rendering a `<button>`. |
| `disabled` | `boolean` | `false` | Disables interaction and reduces opacity. |

## Variants & Examples

### Basic Hierarchy

In the CNMA design system, buttons follow the SAP Fiori action hierarchy: **Primary → Semantic → Secondary → Negative Path**.

```tsx
import {  Button  } from "@cnma/react-ui"

export function ButtonVariants() {
  return (
    <div className="flex gap-4">
      {/* Primary action — main CTA */}
      <Button variant="default">Save</Button>
      
      {/* Semantic action */}
      <Button variant="action">Continue</Button>
      <Button variant="success">Approve</Button>

      {/* Secondary — non-prominent actions */}
      <Button variant="secondary">Copy</Button>

      {/* Outline — negative path (Cancel) */}
      <Button variant="outline">Cancel</Button>
    </div>
  )
}
```

### Contextual Actions

For specific contexts like table filtering or destructive behavior.

```tsx
import {  Button  } from "@cnma/react-ui"

export function ContextualButtons() {
  return (
    <div className="flex gap-4">
      <Button variant="create">Create New</Button>
      <Button variant="filter">Apply Filters</Button>
      <Button variant="destructive">Delete Item</Button>
    </div>
  )
}
```

### Minimal Visual Weight

```tsx
import {  Button  } from "@cnma/react-ui"

export function MinimalButtons() {
  return (
    <div className="flex gap-4">
      <Button variant="ghost">More Options</Button>
      <Button variant="subtle">Details</Button>
      <Button variant="link">Learn more</Button>
    </div>
  )
}
```

### Sizes

Buttons scale proportionally. Use `icon` for icon-only buttons.

```tsx
import {  Button  } from "@cnma/react-ui"
import { Mail } from "lucide-react"

export function ButtonSizes() {
  return (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Mail className="size-4" /></Button>
    </div>
  )
}
```

### Loading State & Icons

```tsx
import {  Button  } from "@cnma/react-ui"
import { Loader2, Mail, ChevronRight } from "lucide-react"

export function ButtonStates() {
  return (
    <div className="flex gap-4">
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </Button>
      <Button>
        <Mail className="mr-2 h-4 w-4" /> Login with Email
      </Button>
      <Button variant="action">
        Continue <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
```

### As Link (Slot Pattern)

```tsx
import {  Button  } from "@cnma/react-ui"
import Link from "next/link"

export function ButtonAsLink() {
  return (
    <Button asChild>
      <Link href="/dashboard">Go to Dashboard</Link>
    </Button>
  )
}
```

## Accessibility

- **Keyboard**: Focusable via `Tab`, activated via `Enter` or `Space`.
- **Screen Reader**: Uses native `<button>` element; ensure you add an `aria-label` for buttons that only contain an icon (using `size="icon"`).
- **Focus**: Displays a visible focus ring (`ring-ring/50`) with `3px` width when receiving focus-visible.
- **Disabled**: The `disabled` attribute appropriately halts pointer events and applies `opacity-50`.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use `variant="default"` for the primary CTA on a page. | Don't use multiple primary buttons in the same toolbar. |
| Use `variant="outline"` for Cancel / negative path actions. | Don't use `variant="destructive"` for Cancel — it's exclusively for Delete/Remove. |
| Add a loading spinner + `disabled` state during async operations. | Don't leave buttons clickable while an action is processing. |
| Ensure adequate hit targets on mobile (at least 44x44px padding/margin equivalence). | Don't mix rectangular and pill-shaped buttons in the same view. |
