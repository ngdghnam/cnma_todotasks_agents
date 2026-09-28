# Native Select

> A browser-native `<select>` element styled to match the design system.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<div class="relative">
  <select
    class="flex h-9 w-full appearance-none items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
  >
    <option value="1">Option 1</option>
  </select>
  <!-- Chevron Icon Overlay -->
  <svg class="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
</div>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for the `<select>` element. |
| `children` | `React.ReactNode` | — | The `<option>` or `<optgroup>` elements. |
| `...props` | `React.SelectHTMLAttributes` | — | All standard HTML select attributes (e.g., `value`, `onChange`, `disabled`, `required`). |

## Variants & Examples

### Default
```tsx
import {  NativeSelect  } from "@cnma/react-ui";

export default function NativeSelectDemo() {
  return (
    <NativeSelect defaultValue="apple">
      <option value="" disabled>Select a fruit...</option>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </NativeSelect>
  );
}
```

### Disabled State
```tsx
import {  NativeSelect  } from "@cnma/react-ui";

export default function NativeSelectDisabled() {
  return (
    <NativeSelect disabled>
      <option value="1">Option 1</option>
    </NativeSelect>
  );
}
```

## Accessibility

- Native `<select>` elements are naturally accessible and provide the best experience on mobile devices (using the OS-level picker).
- Ensure the select has an associated `<label>` or `aria-label`.
- If an option is meant to be a placeholder, set it as `disabled` and optionally `hidden` (or `value=""`).

## Design Guidelines

- **Do** use `NativeSelect` when building forms optimized for mobile devices or when you do not need the complex styling and custom rendering of the Radix-based `Select`.
- **Do** provide a clear default/placeholder option if no value is pre-selected.
- **Don't** use `NativeSelect` for very large searchable lists. Use `Combobox` instead.
- **Don't** try to deeply style the `<option>` elements, as OS-level rendering engines often ignore these styles.
