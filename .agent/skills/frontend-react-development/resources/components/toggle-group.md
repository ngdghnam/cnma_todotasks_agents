# Toggle Group

> A group of toggle buttons where one or multiple items can be selected.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

<ToggleGroupPrimitive.Root>
  <ToggleGroupPrimitive.Item>
    {/* Label or Icon */}
  </ToggleGroupPrimitive.Item>
</ToggleGroupPrimitive.Root>
```

## Props API Reference

### ToggleGroup
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `"single" \| "multiple"` | **Required** | Determines whether single or multiple items can be selected. |
| `value` | `string \| string[]` | `undefined` | The controlled value of the selected item(s). |
| `defaultValue` | `string \| string[]` | `undefined` | The default value when uncontrolled. |
| `onValueChange` | `(value: string \| string[]) => void` | `undefined` | Callback invoked when selection changes. |
| `disabled` | `boolean` | `false` | Disables the entire toggle group. |
| `variant` | `"default" \| "outline"` | `"default"` | The visual styling variant. |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | The size preset for the buttons. |

### ToggleGroupItem
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | **Required** | The unique value associated with the item. |
| `disabled` | `boolean` | `false` | Disables this specific item. |
| `variant` | `"default" \| "outline"` | `undefined` | Overrides the variant set on the parent group. |
| `size` | `"default" \| "sm" \| "lg"` | `undefined` | Overrides the size set on the parent group. |

## Variants & Examples

### Single Selection

```tsx
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react"
import {  ToggleGroup, ToggleGroupItem  } from "@cnma/react-ui"

export default function ToggleGroupSingle() {
  return (
    <ToggleGroup type="single" defaultValue="center">
      <ToggleGroupItem value="left" aria-label="Toggle left align">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Toggle center align">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Toggle right align">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Multiple Selection

```tsx
import { Bold, Italic, Underline } from "lucide-react"
import {  ToggleGroup, ToggleGroupItem  } from "@cnma/react-ui"

export default function ToggleGroupMultiple() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### Outline Variant

```tsx
import {  ToggleGroup, ToggleGroupItem  } from "@cnma/react-ui"

export default function ToggleGroupOutline() {
  return (
    <ToggleGroup type="single" variant="outline">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  )
}
```

## Accessibility

- The component handles `role="group"` and `role="radio"` (or `checkbox`) internally based on the `type` prop.
- Proper keyboard navigation is built-in (arrow keys cycle through items when `type="single"`).
- Always provide `aria-label` for items if they contain only icons.

## Design Guidelines

### Do's
- ✅ Use Toggle Group for a set of related options where the user needs immediate visual feedback of the active state.
- ✅ Ensure icons used within the group are universally recognizable or properly labeled.

### Don'ts
- ❌ Don't use a Toggle Group for primary form submission inputs (like gender selection); use a Radio Group instead.
- ❌ Don't overcrowd the group with too many options. Use a Select or Combobox for long lists.
