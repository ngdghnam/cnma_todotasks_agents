# Textarea

> A multi-line text input with semantic state variants for forms and longer text content.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as React from "react"

<textarea
  className={/* computed classes */}
  {...props}
/>
```

## Props API Reference

| Prop          | Type                                                 | Default     | Description                                                                        |
| ------------- | ---------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `variant`     | `"default" \| "readonly" \| "info" \| "success"`     | `"default"` | Visual state variant of the textarea.                                              |
| `disabled`    | `boolean`                                            | `false`     | Disables input and prevents interaction. Auto-applies `readonly` styling visually. |
| `readOnly`    | `boolean`                                            | `false`     | Prevents modification of the value. Auto-applies `readonly` visual variant.        |
| `className`   | `string`                                             | `undefined` | Additional CSS classes for styling.                                                |
| `rows`        | `number`                                             | `undefined` | Number of visible text lines.                                                      |

*(Also accepts all standard HTML `<textarea>` attributes).*

## Variants & Examples

### Default

```tsx
import {  Textarea  } from "@cnma/react-ui"

export default function TextareaDemo() {
  return <Textarea placeholder="Type your message here..." />
}
```

### Variants

Semantic variations to communicate different input states.

```tsx
import {  Textarea  } from "@cnma/react-ui"

export default function TextareaVariants() {
  return (
    <div className="grid gap-4 w-full max-w-sm">
      <Textarea variant="default" placeholder="Editable..." />
      <Textarea variant="readonly" value="Read only content" readOnly />
      <Textarea variant="info" value="Informational message" readOnly />
      <Textarea variant="success" value="Validated content" readOnly />
    </div>
  )
}
```

### Disabled

```tsx
import {  Textarea  } from "@cnma/react-ui"

export default function TextareaDisabled() {
  return <Textarea disabled placeholder="This is disabled" />
}
```

### With Label & Helper Text

```tsx
import {  Label  } from "@cnma/react-ui"
import {  Textarea  } from "@cnma/react-ui"

export default function TextareaWithText() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type your message here." id="message" />
      <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
    </div>
  )
}
```

## Accessibility

- Always associate a `<label>` or `<Label>` component with the `<textarea>` using `htmlFor` and `id`.
- Ensure focus states are clearly visible (handled by default utility classes).
- Use `aria-describedby` to link helper text or error messages to the textarea.

## Design Guidelines

### Do's
- ✅ Use Textarea for multi-line text (notes, descriptions, comments).
- ✅ Use semantic variants (`info`, `success`) for appropriate display states.
- ✅ Ensure a default sensible height (e.g., minimum 3 rows or `min-h-16`).

### Don'ts
- ❌ Don't use Textarea for single-line values — use the `Input` component instead.
- ❌ Don't hardcode border/background colors manually; rely on the semantic variants.
