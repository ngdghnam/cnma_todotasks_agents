# Selected Item Card

> A specialized card layout for displaying selected items as a collection of tokens. Commonly used in complex forms or list headers.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { SelectedItemCard } from "@cnma/react-ui";

<SelectedItemCard
  items={items}
  getItemId={(item) => item.id}
  getItemLabel={(item) => ({ primary: item.name })}
  onRemove={(id) => console.log("Remove", id)}
  onClearAll={() => console.log("Clear all")}
/>
```

## Props API Reference

### SelectedItemCard<T>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | **Required** | Array of selected items to display. |
| `getItemId` | `(item: T) => string` | **Required** | Function to extract a unique ID from an item. |
| `getItemLabel` | `(item: T) => { primary: string; secondary?: string }` | **Required** | Function to extract labels from an item. |
| `onRemove` | `(id: string) => void` | **Required** | Callback when an individual item is removed. |
| `onClearAll` | `() => void` | **Required** | Callback when the clear all button is clicked. |
| `maxWidth` | `string` | `'300px'` | Maximum width for each token before truncation occurs. |

## Variants & Examples

### Default Usage
```tsx
import { SelectedItemCard } from "@cnma/react-ui";

export default function CardDemo() {
  const selectedUsers = [
    { uuid: "123", fullName: "Alice", role: "Admin" }
  ];

  return (
    <SelectedItemCard
      items={selectedUsers}
      getItemId={(u) => u.uuid}
      getItemLabel={(u) => ({ primary: u.fullName, secondary: u.role })}
      onRemove={(id) => {}}
      onClearAll={() => {}}
    />
  );
}
```

## Accessibility
- Ensure screen reader users can identify the list of selected items and interact with the remove buttons.
- Button elements (`Token` removals) are explicitly interactive.

## Design Guidelines
- **Do** use this when multiple selections need to be visible and individually removable outside of a standard input field.
