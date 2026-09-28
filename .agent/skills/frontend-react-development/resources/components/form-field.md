# Form Field

> A composite layout component pairing a label, input, and description in a standardized format.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<div class="space-y-2"> <!-- FormField wrapper -->
  <label class="text-sm font-medium leading-none">Label</label>
  <div class="relative">
    <input class="..." /> <!-- Any Input or Control element -->
  </div>
  <p class="text-[0.8rem] text-muted-foreground">Description text</p>
  <p class="text-[0.8rem] font-medium text-destructive">Error message</p>
</div>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | The label text for the field. |
| `value` | `string \| number` | — | The current value of the field. |
| `onChange` | `(value: any) => void` | — | Optional callback when the value changes. |
| `type` | `'text' \| 'number' \| 'date'` | — | Optional input type. |
| `variant` | `'default' \| 'info' \| 'success' \| 'warning' \| 'destructive' \| 'readonly'` | `'default'` | Visual variant of the field. |
| `disabled` | `boolean` | `false` | Whether the field is disabled. |
| `readOnly` | `boolean` | `false` | Whether the field is read-only. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `placeholder` | `string` | — | Placeholder text for the input. |
| `className` | `string` | — | Additional CSS classes for the wrapper element. |
| `labelClassName` | `string` | — | Additional CSS classes for the label element. |
| `layout` | `'stacked' \| 'inline'` | `'stacked'` | Layout: 'stacked' = label on top, 'inline' = label and input side by side. |
| `labelWidth` | `string` | — | Width of label in inline layout (e.g., '200px', '30%'). |
| `tooltip` | `string` | — | Custom tooltip text to show on hover. |
| `showTooltip` | `boolean` | `false` | Enable tooltip to show the field value (only works for readonly/disabled fields). |

## Variants & Examples

### Default (Stacked Layout)
```tsx
import {  FormField  } from "@cnma/react-ui";

export default function DefaultFormField() {
  return (
    <FormField 
      label="Email"
      value="john@example.com"
      type="text"
      placeholder="Enter your email"
    />
  );
}
```

### Inline Layout
```tsx
import {  FormField  } from "@cnma/react-ui";

export default function InlineFormField() {
  return (
    <FormField 
      label="Username" 
      value="shadcn"
      layout="inline"
      labelWidth="150px"
    />
  );
}
```

### Readonly & Tooltip
```tsx
import {  FormField  } from "@cnma/react-ui";

export default function ReadonlyFormField() {
  return (
    <FormField 
      label="User ID" 
      value="US-123456789"
      readOnly
      showTooltip
      tooltip="This is a generated User ID"
    />
  );
}
```

## Accessibility

- Automatically connects the label to the input control when correctly configured.
- Should use `aria-describedby` on the input, pointing to the IDs of the description or error message elements.
- The `error` state should ideally toggle `aria-invalid="true"` on the wrapped input.

## Design Guidelines

- **Do** provide clear and concise labels for all form fields.
- **Do** use descriptions for complex requirements (e.g., password constraints).
- **Don't** use placeholder text as a replacement for labels. Placeholders disappear when the user starts typing.
- **Don't** hide error messages; make them visible and colored appropriately (typically destructive/red).
