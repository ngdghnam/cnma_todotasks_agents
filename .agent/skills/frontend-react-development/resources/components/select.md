# Select

> A dropdown control for choosing a single value from a predefined list of options.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<button
  type="button"
  role="combobox"
  aria-controls="radix-:r0:"
  aria-expanded="false"
  aria-autocomplete="none"
  dir="ltr"
  data-state="closed"
>
  <!-- SelectTrigger -->
  <span style="pointer-events: none;">Select a fruit</span> <!-- SelectValue -->
  <!-- SelectIcon -->
</button>

<!-- Rendered in a Portal -->
<div role="presentation">
  <div role="listbox" id="radix-:r0:" data-state="open">
    <!-- SelectContent -->
    <div role="group">
      <!-- SelectGroup -->
      <div role="presentation">Fruits</div> <!-- SelectLabel -->
      <div role="option" aria-selected="false" data-state="unchecked" tabindex="-1">
        <!-- SelectItem -->
        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <!-- SelectItemIndicator (Check icon) -->
        </span>
        <span style="pointer-events: none;">Apple</span>
      </div>
    </div>
  </div>
</div>
```

## Props API Reference

### Select (Root)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | The controlled selected value. |
| `onValueChange` | `(value: string) => void` | — | Event handler called when the value changes. |
| `defaultValue` | `string` | — | The initial value of the select when uncontrolled. |
| `open` | `boolean` | — | The controlled open state of the select. |
| `onOpenChange` | `(open: boolean) => void` | — | Event handler called when the open state changes. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | The reading direction of the select. |
| `disabled` | `boolean` | `false` | Whether the select is disabled. |

### SelectTrigger
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `size` | `"sm" \| "default"` | `"default"` | The size of the select trigger. |
| `className` | `string` | — | Additional CSS classes for the trigger. |

### SelectContent
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `"item-aligned" \| "popper"` | `"popper"` | Positioning strategy for the content relative to the trigger. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Preferred side to render the content (only applies when `position="popper"`). |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment against the trigger (only applies when `position="popper"`). |

### SelectItem
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **Required** | The value of the item, submitted when selected. |
| `disabled` | `boolean` | `false` | Whether the item is disabled. |

## Variants & Examples

### Default
```tsx
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 } from "@cnma/react-ui";

export default function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### With Groups
```tsx
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
 } from "@cnma/react-ui";

export default function SelectGroupDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="grape">Grape</SelectItem>
          <SelectItem value="raspberry">Raspberry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

## Accessibility

- The select trigger uses the `combobox` role.
- The list of options uses the `listbox` role.
- Options within the listbox use the `option` role.
- Focus is managed automatically; opening the select places focus on the selected or first item.
- Supports keyboard navigation: `Space`/`Enter` opens the dropdown, Arrow keys navigate, `Escape` closes.
- Typeahead is supported for quickly finding options by their text content.

## Design Guidelines

- **Do** use `Select` for choosing a single option from a predefined list of approximately 4-20 items.
- **Do** provide a clear, concise placeholder in the `SelectValue`.
- **Do** group related options logically using `SelectGroup` and `SelectLabel` if the list is getting long.
- **Don't** use `Select` for fewer than 4 options—consider using a `RadioGroup` instead to expose all choices immediately.
- **Don't** use `Select` for very large datasets (e.g. country lists). Use `Combobox` to allow searching and filtering.
