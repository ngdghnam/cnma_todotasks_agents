# Date Picker

> A date input field that opens a Calendar popover for selection.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {  Calendar  } from "@cnma/react-ui"

<PopoverPrimitive.Root>
  <PopoverPrimitive.Trigger>
    {/* visual button input */}
  </PopoverPrimitive.Trigger>
  <PopoverPrimitive.Content>
    <Calendar />
  </PopoverPrimitive.Content>
</PopoverPrimitive.Root>
```

## Props API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | The id of the input field. |
| `value` | `string \| Date \| undefined` | `undefined` | The currently selected date. |
| `onChange` | `(value: string) => void` | `undefined` | Callback invoked when the date is changed. Returns a formatted string. |
| `placeholder` | `string` | `"Pick a date"` | Text displayed when no date is selected. |
| `disabled` | `boolean` | `false` | Whether the date picker is disabled. |
| `readOnly` | `boolean` | `false` | Prevents modifying the value. |
| `variant` | `'default' \| 'info' \| 'success' \| 'warning' \| 'destructive' \| 'readonly'` | `'default'` | Semantic visual state of the component. |
| `className` | `string` | `undefined` | Additional styling classes. |
| `minDate` | `Date` | `undefined` | The minimum selectable date. |
| `maxDate` | `Date` | `undefined` | The maximum selectable date. |
| `formatString` | `string` | `"yyyy-MM-dd"` | The format string used for the date string value. |
| `displayFormatter` | `(value: string \| Date) => string` | `undefined` | Optional locale-aware display formatter. Overrides formatString for display. |

## Variants & Examples

### Default

```tsx
import * as React from "react"
import {  DatePicker  } from "@cnma/react-ui"

export default function DatePickerDemo() {
  const [date, setDate] = React.useState<string>()

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Select a date..."
    />
  )
}
```

## Accessibility

- The date picker uses a Popover for the overlay, trapping focus inside the calendar when opened.
- Requires standard button ARIA labels (`aria-haspopup`, `aria-expanded`).
- The internal Calendar component handles robust keyboard navigation for month/year and date cell selection.

## Design Guidelines

### Do's
- ✅ Show a clear placeholder when no date is selected.
- ✅ Display an icon (like `CalendarIcon`) to indicate the field type.
- ✅ Provide sensible date formats, ideally localized to the user's preference.

### Don'ts
- ❌ Don't rely solely on the visual popover if raw text entry would be significantly faster for power users (consider a Masked Input in conjunction).
