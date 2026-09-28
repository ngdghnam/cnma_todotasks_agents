# Calendar

> A date selection component for picking single dates or date ranges.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Calendar />
```

## Props API Reference

### Calendar

Built on top of `react-day-picker`. The `Calendar` component accepts all props from `DayPicker`.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mode` | `'single' | 'range' | 'multiple'` | `'single'` | The selection mode of the calendar. |
| `selected` | `Date | DateRange | Date[]` | — | The currently selected date(s). |
| `onSelect` | `(date: any) => void` | — | Event handler called when a date is selected. |
| `numberOfMonths` | `number` | `1` | The number of months rendered simultaneously. |
| `disabled` | `Matcher | Matcher[]` | — | Determines which dates should be disabled for selection. |
| `defaultMonth` | `Date` | — | The month to display when the calendar is first rendered. |
| `showOutsideDays` | `boolean` | `true` | Whether to show days from the previous or next month that fall in the current month's grid. |
| `buttonVariant` | `ButtonProps['variant']` | — | The visual variant applied to the calendar's day buttons. |
| `className` | `string` | — | Additional CSS classes applied to the root element. |
| `classNames` | `Record<string, string>` | — | Custom class names for internal elements of the calendar. |

## Variants & Examples

### Single Date

```tsx
import { useState } from "react"
import {  Calendar  } from "@cnma/react-ui"

export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  )
}
```

### Date Range

```tsx
import { useState } from "react"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"
import {  Calendar  } from "@cnma/react-ui"

export function CalendarDateRange() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  })

  return (
    <Calendar
      mode="range"
      selected={date}
      onSelect={setDate}
      numberOfMonths={2}
      className="rounded-md border"
    />
  )
}
```

### Multiple Dates

```tsx
import { useState } from "react"
import {  Calendar  } from "@cnma/react-ui"

export function CalendarMultiple() {
  const [dates, setDates] = useState<Date[] | undefined>([])

  return (
    <Calendar
      mode="multiple"
      selected={dates}
      onSelect={setDates}
      className="rounded-md border"
    />
  )
}
```

## Accessibility

Built using `react-day-picker` which follows WAI-ARIA authoring practices.

### Keyboard Interactions

| Key | Description |
| :--- | :--- |
| `Tab` | Moves focus to the calendar grid or navigation buttons. |
| `ArrowRight` | Moves focus to the next day. |
| `ArrowLeft` | Moves focus to the previous day. |
| `ArrowDown` | Moves focus to the same day in the next week. |
| `ArrowUp` | Moves focus to the same day in the previous week. |
| `PageDown` | Moves focus to the same day in the next month. |
| `PageUp` | Moves focus to the same day in the previous month. |
| `Enter` / `Space` | Selects the currently focused day. |

## Design Guidelines

### ✅ Do
- Use for tasks requiring explicit date selection.
- Disable past or future dates if they are invalid for the specific context.
- Use `numberOfMonths={2}` for selecting wide date ranges (like booking flights or reports).

### ❌ Don't
- Don't use a full inline Calendar for simple date of birth input; a masked text input or native date input is usually faster.
- Don't force users to click through 12 months to select a date in the previous year — provide year/month dropdowns if navigating far into the past/future is expected.
