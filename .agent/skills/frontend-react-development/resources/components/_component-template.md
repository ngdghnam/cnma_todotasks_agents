# Component Name

> Brief Overview: A concise description of what the component is and what it does.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<!-- Provide a markdown code block showing the DOM structure with Radix UI / HTML primitives -->
<div data-component="root">
  <button aria-expanded="false">
    Trigger
  </button>
  <div role="dialog" tabindex="-1">
    Content
  </div>
</div>
```

## Props API Reference

<!-- Provide exhaustive markdown tables: Prop, Type, Default, Description -->

### Root Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `className` | `string` | — | Additional CSS classes for the component. |
| `disabled` | `boolean` | `false` | Whether the component is disabled. |

### Sub-component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment strategy. |

## Variants & Examples

<!-- Show detailed React code examples for Default, Primary, Destructive, Disabled, Sizes, etc. -->

### Default
```tsx
import {  ComponentName  } from "@cnma/react-ui";

export default function ComponentNameDemo() {
  return (
    <ComponentName>
      Default content
    </ComponentName>
  );
}
```

### Disabled State
```tsx
import {  ComponentName  } from "@cnma/react-ui";

export default function ComponentNameDisabled() {
  return (
    <ComponentName disabled>
      Cannot interact with me
    </ComponentName>
  );
}
```

## Accessibility

- Detail keyboard interactions (e.g., `Space`/`Enter` to activate, Arrow keys to navigate).
- Mention key ARIA roles (e.g., `role="dialog"`, `role="combobox"`).
- Specify focus management rules.
- State any required attributes for screen readers.

## Design Guidelines

- **Do** [describe a good practice or standard usage].
- **Do** [describe another good practice].
- **Don't** [describe a common anti-pattern or misuse].
- **Don't** [describe another anti-pattern].
