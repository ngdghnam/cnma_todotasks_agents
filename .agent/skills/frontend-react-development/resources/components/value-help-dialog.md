# Value Help Dialog

> A complex dialog component for selecting multiple items from a potentially large dataset, featuring deferred search capabilities and selection management.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { ValueHelpDialog } from "@cnma/react-ui";

<ValueHelpDialog
  title="Select Suppliers"
  triggerLabel="Select Suppliers..."
  selectedItems={selected}
  onSelect={setSelected}
  fetchItems={async () => await getInitialSuppliers()}
/>
```

## Props API Reference

### ValueHelpItem

```typescript
export interface ValueHelpItem {
  id: string;
  name: string;
  description?: string;
}
```

### ValueHelpDialog

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **Required** | The title of the dialog. |
| `triggerLabel` | `string` | **Required** | The label shown in the trigger input when no items are selected. |
| `selectedItems` | `ValueHelpItem[]` | **Required** | The currently selected items. |
| `onSelect` | `(items: ValueHelpItem[]) => void` | **Required** | Callback fired when selection is confirmed. |
| `fetchItems` | `() => Promise<ValueHelpItem[]>` | **Required** | Function to fetch initial items when dialog opens. |
| `searchItems` | `(term: string) => Promise<ValueHelpItem[]>` | — | Function to search items based on input. Debounced internally. |
| `inputClassName` | `string` | — | Additional CSS classes for the trigger input. |

## Variants & Examples

### With Search Integration
```tsx
import { ValueHelpDialog } from "@cnma/react-ui";

export default function DialogDemo() {
  return (
    <ValueHelpDialog
      title="Add Users"
      triggerLabel="Search for users..."
      selectedItems={[]}
      onSelect={(items) => console.log(items)}
      fetchItems={async () => [{ id: '1', name: 'John Doe' }]}
      searchItems={async (term) => fetch(`/api/search?q=${term}`).then(res => res.json())}
    />
  );
}
```

## Accessibility
- Uses Radix UI Dialog primitives which handle focus trapping, ARIA roles, and keyboard navigation.
- Screen readers will announce the dialog title and state.

## Design Guidelines
- **Do** use this in enterprise scenarios where standard dropdowns are insufficient for navigating the data volume.
- **Do** utilize the `searchItems` prop to handle server-side filtering.
