# Toggle

> A two-state button that can be switched on or off.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Toggle>
  {/* Icon or Text */}
</Toggle>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "outline"` | `"default"` | The visual style variant of the toggle. |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | The size preset. |
| `pressed` | `boolean` | — | The controlled pressed state of the toggle. |
| `defaultPressed` | `boolean` | `false` | The initial state (uncontrolled). |
| `onPressedChange` | `(pressed: boolean) => void` | — | Callback invoked when the pressed state changes. |
| `disabled` | `boolean` | `false` | Whether the toggle is disabled. |

## Variants & Examples

### Default
```tsx
import {  Toggle  } from "@cnma/react-ui";
import { Bold } from "lucide-react";

<Toggle aria-label="Toggle bold">
  <Bold className="h-4 w-4" />
</Toggle>
```

### Outline Variant with Text
```tsx
import { Italic } from "lucide-react";

<Toggle variant="outline" aria-label="Toggle italic">
  <Italic className="mr-2 h-4 w-4" />
  Italic
</Toggle>
```

### Sizes
```tsx
<Toggle size="sm">Small</Toggle>
<Toggle size="default">Default</Toggle>
<Toggle size="lg">Large</Toggle>
```

## Accessibility

- **Keyboard:**
  - `Space` or `Enter` toggles the pressed state.
  - Visible focus ring via `focus-visible`.
- **Roles:**
  - Functions as a button with `aria-pressed` mapped to the current state (true/false).
  - Must include an `aria-label` if the content is purely visual (e.g., an icon).

## Design Guidelines

### Do's
- Use Toggles for rich text formatting toolbars (Bold, Italic, Underline) or view mode switches (List vs. Grid).
- Group related toggles using `ToggleGroup`.

### Don'ts
- Don't use a Toggle to submit a form or trigger a side effect immediately (like saving data). Use a `Switch` for immediate settings changes.
- Don't omit the `aria-label` when only an icon is displayed inside the Toggle.
