# Input

> A text input field with semantic state variants for forms and data entry.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Input />
```

## Props API Reference

### Input

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'default' | 'readonly' | 'info' | 'success' | 'warning' | 'destructive'` | `'default'` | Visual state variant. Auto-falls back to `readonly` if `disabled` or `readOnly` are set without an explicit variant. |
| `type` | `string` | `'text'` | Standard HTML input type (e.g., `email`, `password`, `number`, `tel`). |
| `placeholder` | `string` | — | Placeholder text shown when input is empty. |
| `disabled` | `boolean` | `false` | When `true`, disables the input and prevents interaction. |
| `readOnly` | `boolean` | `false` | When `true`, makes the input read-only, preventing edits while maintaining focusability. |
| `className` | `string` | — | Additional CSS classes to apply. |

> **Auto-detection**: If `disabled` or `readOnly` is set and no explicit `variant` is provided, the component automatically uses the `"readonly"` variant.

## Variants & Examples

### Default

```tsx
import {  Input  } from "@cnma/react-ui"
import {  Label  } from "@cnma/react-ui"

export function InputDemo() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  )
}
```

### Semantic States

```tsx
import {  Input  } from "@cnma/react-ui"

export function InputStates() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input placeholder="Default — editable" />
      <Input value="Read only value" variant="readonly" readOnly />
      <Input value="Information" variant="info" readOnly />
      <Input value="Valid input" variant="success" readOnly />
      <Input value="Check this" variant="warning" readOnly />
      <Input value="Invalid input" variant="destructive" readOnly />
    </div>
  )
}
```

### Disabled

```tsx
import {  Input  } from "@cnma/react-ui"

export function InputDisabled() {
  return <Input disabled type="email" placeholder="Email" />
}
```

### File Input

```tsx
import {  Input  } from "@cnma/react-ui"
import {  Label  } from "@cnma/react-ui"

export function InputFile() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  )
}
```

## Accessibility

### Keyboard Interactions

| Key | Description |
| :--- | :--- |
| `Tab` | Standard HTML focus progression. |
| `Space` / Text entry | Input behavior as per standard HTML `<input>`. |

### Screen Readers & Focus
- Always provide a `<Label>` with a matching `htmlFor` attribute targeting the input's `id`.
- The focus state displays a brand-color border (`--color-brand`) with a `3px` ring.
- Input validation typically utilizes `aria-invalid="true"`, which triggers a destructive ring styling automatically.

## Design Guidelines

### ✅ Do
- Always pair inputs with a `<Label>` for accessibility.
- Use semantic variants (`success`, `warning`, `destructive`) to indicate validation state.
- Use `variant="readonly"` for display-only fields in detail views to clearly distinguish from editable fields.
- Group related fields closely, and provide clear error messages nearby for validation.

### ❌ Don't
- Don't use placeholder text as a replacement for permanent labels.
- Don't use color alone to convey meaning — always add accompanying text (e.g., error messages).
- Don't hardcode background colors on inputs — use the provided variant system.
- Don't spam multiple error toasts for individual field errors; render them next to the input.
