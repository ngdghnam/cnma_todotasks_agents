# Value Help Combobox

> Input-based typeahead combobox (Value Help) for searching and selecting from a list of options.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { ValueHelpComboBox } from "@cnma/react-ui";

<ValueHelpComboBox
  entries={[{ key: 'de', text: 'Germany' }]}
  value={country}
  onChange={(key) => setCountry(key)}
  placeholder="Select country…"
/>
```

## Props API Reference

### ValueHelpEntry

```typescript
export interface ValueHelpEntry {
  key: string | number;
  text?: string;
  description?: string;
}
```

### ValueHelpComboBox

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entries` | `ValueHelpEntry[]` | **Required** | The option list to display in the dropdown. |
| `value` | `string` | — | Controlled value (the `key` of the selected entry). |
| `onChange` | `(key: string) => void` | — | Callback fired when an entry is selected. |
| `placeholder` | `string` | `"Type to search…"` | The placeholder text. |
| `disabled` | `boolean` | `false` | Whether the combobox is disabled. |
| `loading` | `boolean` | `false` | Whether the combobox is in a loading state (shows a spinner). |
| `className` | `string` | — | Additional CSS classes for the wrapper. |
| `onBatchFieldUpdate` | `(updates: Record<string, string>) => void` | — | Called with a map of sibling field updates when an entry is selected. |

## Variants & Examples

### Basic Setup
```tsx
import { ValueHelpComboBox } from "@cnma/react-ui";

export default function BasicComboBoxDemo() {
  const options = [
    { key: "1", text: "Apple", description: "Fruit" },
    { key: "2", text: "Carrot", description: "Vegetable" },
  ];
  return (
    <ValueHelpComboBox
      entries={options}
      placeholder="Search foods..."
    />
  );
}
```

## Accessibility
- Includes keyboard navigation (Arrow Up/Down, Enter, Escape).
- Currently portaled to `document.body` to prevent clipping, simulating native dropdown behavior.

## Design Guidelines
- **Do** use this component when you have a flat list of items that the user needs to filter quickly by typing.
- **Don't** use this for massive datasets requiring server-side pagination—use `ValueHelpDialog` instead.
