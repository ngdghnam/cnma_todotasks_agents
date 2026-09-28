# Label

> A text label for form controls that provides accessible labeling.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Label />
```

## Props API Reference

### Label

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `htmlFor` | `string` | — | The id of the element the label is associated with. |
| `className` | `string` | — | Additional CSS classes to apply. |

## Variants & Examples

### Default

```tsx
import {  Label  } from "@cnma/react-ui"
import {  Input  } from "@cnma/react-ui"

export function LabelDemo() {
  return (
    <div>
      <Label htmlFor="email">Email address</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  )
}
```

### Disabled Look
The label automatically dims when its paired input is disabled (`peer-disabled:opacity-50`).

```tsx
import {  Label  } from "@cnma/react-ui"
import {  Input  } from "@cnma/react-ui"

export function LabelDisabled() {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Input type="checkbox" id="terms" disabled className="peer" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    </div>
  )
}
```

## Accessibility

Built on top of Radix UI Label. Adheres to standard `<label>` semantics.

- Clicking the label focuses or activates the associated input control.
- Automatically handles dimming when the associated input uses a `peer-disabled:cursor-not-allowed peer-disabled:opacity-70` Tailwind setup.

## Design Guidelines

### ✅ Do
- Always pair every input (text, checkbox, radio, etc.) with a `Label`.
- Use `htmlFor` to clearly associate the label with the input's `id`.
- Keep label text concise and descriptive.

### ❌ Don't
- Don't use placeholder text in inputs as a replacement for visible labels.
- Don't use generic labels like "Field 1" or vague text.
- Don't embed multiple interactive elements inside a single label.
