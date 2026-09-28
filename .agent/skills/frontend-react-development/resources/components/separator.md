# Separator

> A visual divider between content sections.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as SeparatorPrimitive from "@radix-ui/react-separator"

<SeparatorPrimitive.Root>
  {/* decorative or semantic separation */}
</SeparatorPrimitive.Root>
```

## Props API Reference

| Prop          | Type                         | Default        | Description                                                                 |
| ------------- | ---------------------------- | -------------- | --------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | The orientation of the separator.                                           |
| `decorative`  | `boolean`                    | `true`         | Whether the separator is purely decorative. If true, it is hidden from AT.  |
| `asChild`     | `boolean`                    | `false`        | Change the default rendered element for the one passed as a child.          |
| `className`   | `string`                     | `undefined`    | Additional CSS classes for styling.                                         |

## Variants & Examples

### Default (Horizontal)

Displays a standard horizontal divider.

```tsx
import {  Separator  } from "@cnma/react-ui"

export default function SeparatorDemo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  )
}
```

### Vertical

Use `orientation="vertical"` for vertical division. Ensure the parent container has a defined height.

```tsx
import {  Separator  } from "@cnma/react-ui"

export default function SeparatorVertical() {
  return (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Option 1</div>
      <Separator orientation="vertical" />
      <div>Option 2</div>
    </div>
  )
}
```

## Accessibility

Built on Radix UI's Separator primitive, which includes proper ARIA semantics.

- When `decorative={true}` (default), the element has `role="none"`.
- When `decorative={false}`, it receives `role="separator"` and `aria-orientation` matching its visual orientation.

## Design Guidelines

### Do's
- ✅ Use Separators to group related content or distinctly separate completely different sections.
- ✅ Ensure clear spacing (margin/padding) around the separator.

### Don'ts
- ❌ Don't use a Separator purely for decoration when standard margins/padding would visually suffice.
- ❌ Don't override the `decorative` flag to `false` unless the separation has structural/semantic meaning for screen readers.
