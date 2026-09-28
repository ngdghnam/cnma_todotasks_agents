# Field

> A structured field layout with label, input, description, and error message slots.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Field>
  <FieldLabel />
  <FieldContent>
    {/* Input element (Input, Select, etc.) */}
  </FieldContent>
  <FieldDescription />
  <FieldError />
</Field>
```

## Props API Reference

### Field (Root)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | The layout orientation of the field elements. |
| `className` | `string` | — | Custom classes applied to the root field container. |

*Most child components (`FieldContent`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldTitle`) inherit standard HTML props like `className`.*

## Variants & Examples

### Default Field Layout
```tsx
import { 
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError
 } from "@cnma/react-ui";
import {  Input  } from "@cnma/react-ui";

<Field>
  <FieldLabel>Email Address</FieldLabel>
  <FieldContent>
    <Input type="email" placeholder="email@example.com" />
  </FieldContent>
  <FieldDescription>We will use this for primary contact.</FieldDescription>
</Field>
```

### Field with Error State
```tsx
<Field>
  <FieldLabel className="text-destructive">Username</FieldLabel>
  <FieldContent>
    <Input className="border-destructive" value="admin_1" />
  </FieldContent>
  <FieldError>This username is already taken.</FieldError>
</Field>
```

## Accessibility

- **Roles & Attributes:**
  - The `FieldLabel` should map its `htmlFor` to the associated Input's `id`.
  - The Input should use `aria-describedby` referencing the IDs of `FieldDescription` and `FieldError` for screen readers.

## Design Guidelines

### Do's
- Use the Field composition pattern to enforce visual consistency across all forms.
- Always provide a `FieldLabel`.

### Don'ts
- Don't use inline text or random `<span>` elements for form descriptions; always use `FieldDescription`.
- Don't manually position error messages; rely on the `FieldError` slot for standard layout.
