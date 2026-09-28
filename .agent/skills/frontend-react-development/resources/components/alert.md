# Alert

> A callout component for displaying important messages with contextual meaning.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import {  Alert, AlertTitle, AlertDescription  } from "@cnma/react-ui"

export default () => (
  <Alert>
    <AlertTitle>...</AlertTitle>
    <AlertDescription>...</AlertDescription>
  </Alert>
)
```

## Props API Reference

### Alert

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"default" \| "destructive"` | `"default"` | The visual style and intent of the alert. |
| `className` | `string` | - | Additional CSS classes for custom styling. |

### AlertTitle

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | - | Additional styling for the bold title text. |

### AlertDescription

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | - | Additional styling for the descriptive body text. |

## Variants & Examples

### Default

The Alert component is a section-level message component for persistent warnings or information. It maps to **Tier 2 (Section-Level)** in the CNMA message handling hierarchy.

```tsx
import { Terminal } from "lucide-react"
import {  Alert, AlertDescription, AlertTitle  } from "@cnma/react-ui"

export function AlertDemo() {
  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  )
}
```

### Destructive

For persistent error messages, blockages, or failure states that require user intervention.

```tsx
import { AlertCircle } from "lucide-react"
import {  Alert, AlertDescription, AlertTitle  } from "@cnma/react-ui"

export function AlertDestructive() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  )
}
```

### Contextual Variants (Informational)

You can swap out icons and styles to communicate specific system states.

```tsx
import { Info } from "lucide-react"
import {  Alert, AlertDescription, AlertTitle  } from "@cnma/react-ui"

export function AlertInfo() {
  return (
    <Alert>
      <Info className="h-4 w-4 text-blue-500" />
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>
        This order requires manager approval before processing.
      </AlertDescription>
    </Alert>
  )
}
```

## Accessibility

- **Semantic Role**: Uses `role="alert"` out-of-the-box which instructs screen readers to announce the message immediately without losing focus.
- **Read Order**: When using an icon, ensure it is placed _before_ the `AlertTitle` so it can be associated visually but handled properly by screen readers (the icon should usually have `aria-hidden="true"` if the title describes its meaning).
- **Contrast**: Destructive alerts ensure high-contrast red borders, backgrounds, and text specifically tuned for legibility.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use Alert for persistent, section-level feedback (e.g., forms failing to load, expiring licenses). | Don't use Alert for transient success messages or minor events — use a `Toast` or `Sonner` instead. |
| Pair `variant="destructive"` with error icons (like an octagon or alert circle). | Don't use auto-dismissing behavior on Alerts, especially critical errors. |
| Place Alerts at the very top of the relevant section they pertain to. | Don't stack more than 2-3 alerts. Aggregate errors into a summary if there are many. |
