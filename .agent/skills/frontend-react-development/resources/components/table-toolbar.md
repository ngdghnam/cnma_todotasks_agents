# Table Toolbar

> A standard toolbar component typically rendered above data tables. Acts as a container for table titles, search inputs, filtering controls, and global actions.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { TableToolbar } from "@cnma/react-ui";

<TableToolbar title="Users">
  <button>Add User</button>
</TableToolbar>
```

## Props API Reference

### TableToolbar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `React.ReactNode` | **Required** | The title to display in the toolbar. |
| `children` | `React.ReactNode` | — | Additional elements like action buttons, search fields, or variant selectors. |
| `className` | `string` | — | Optional CSS class name for the wrapper. |

## Variants & Examples

### With Actions
```tsx
import { TableToolbar } from "@cnma/react-ui";
import { Button, Input } from "@cnma/react-ui";

export default function TableDemo() {
  return (
    <TableToolbar title="Invoices">
      <Input placeholder="Search..." className="w-64" />
      <Button variant="primary">Create</Button>
    </TableToolbar>
  );
}
```

## Accessibility
- Ensure the title is rendered with appropriate heading tags (`<h1>`, `<h2>`) if passing a complex React node.

## Design Guidelines
- **Do** place this immediately above your `Table` or `DataTable` components to match SAP Fiori list header metrics.
- **Do** allow the layout to wrap on mobile (handled automatically by the component).
