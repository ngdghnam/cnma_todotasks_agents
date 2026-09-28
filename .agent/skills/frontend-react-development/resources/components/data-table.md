# Data Table

> A config-driven, full-featured table with sorting, selection, pagination, and mobile card mode.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<DataTable
  data={data}
  columns={columns}
  selection={{
    selectedIds: [],
    onSelectionChange: (ids) => console.log(ids)
  }}
  pagination={{
    page: 1,
    pageSize: 10,
    onPageChange: (page) => console.log(page)
  }}
/>
```

## Props API Reference

### DataTable
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<T>` | `[]` | The array of data objects to display. |
| `columns` | `DataTableColumn<T>[]` | `[]` | Configuration array defining the columns. |
| `isLoading` | `boolean` | `false` | Loading state for the table. |
| `isPlaceholderData` | `boolean` | `false` | Placeholder data state (for optimistic updates). |
| `error` | `Error \| null` | `null` | Error object. |
| `pagination` | `PaginationConfig` | — | Pagination configuration. |
| `selection` | `SelectionConfig` | — | Selection configuration. |
| `onRowClick` | `(row: T) => void` | — | Row click handler. |
| `isRowClickable` | `(row: T) => boolean` | — | Optional predicate to determine if a row is clickable. |
| `onRefresh` | `() => void` | — | Refresh handler. |
| `emptyMessageKey` | `string` | — | Empty state message key. |
| `errorMessageKey` | `string` | — | Error state message key. |
| `title` | `string` | — | Title to show above table. |
| `showFooter` | `boolean` | `true` | Show footer with pagination. |
| `className` | `string` | — | Custom CSS class for container. |
| `onScroll` | `(e: UIEvent<HTMLDivElement>) => void` | — | Scroll handler for infinite scroll. |
| `maxHeight` | `string` | — | Maximum height for table with scroll. |
| `isFetchingNextPage` | `boolean` | `false` | Loading state for infinite scroll. |
| `variant` | `"card" \| "borderless"` | `"card"` | Visual style variant for the table container. |

### DataTableColumn Config
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | — | Unique key for the column (field name in data). |
| `labelKey` | `string` | — | Translation key for header label. |
| `width` | `number` | `150` | Column width in pixels. |
| `minWidth` | `number` | `80` | Minimum column width in pixels. |
| `maxWidth` | `number` | — | Maximum column width in pixels. |
| `visible` | `boolean` | `true` | Whether this column is visible. |
| `renderType` | `"text" \| "link" \| "badge" \| "status" \| "date" \| "number" \| "duration" \| "custom"` | — | Render type for special formatting. |
| `className` | `string` | — | CSS classes for styling. |
| `render` | `(value: any, row: T) => ReactNode` | — | Custom render function (when renderType is 'custom'). |
| `badgeColorMap` | `Record<string, { bg: string, text: string }>` | — | Badge color mapping for value-based styling. |
| `pinned` | `"left" \| "right"` | — | Pin column to left or right (MUI Pro-style). |
| `pinnable` | `boolean` | `true` | Whether this column can be pinned by user. |
| `sortDirection` | `"asc" \| "desc" \| null` | — | Current sort direction. |
| `sortable` | `boolean` | `false` | Whether this column is sortable. |
| `hideable` | `boolean` | `true` | Whether this column can be hidden. |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Text alignment for column header and cells. |

## Variants & Examples

### Basic

```tsx
import {  DataTable  } from "@cnma/react-ui"

const data = [
  { id: 1, name: "Alice", status: "Active" },
  { id: 2, name: "Bob", status: "Inactive" },
]

const columns = [
  { key: "id", labelKey: "ID", sortable: true },
  { key: "name", labelKey: "Name", sortable: true },
  { key: "status", labelKey: "Status", renderType: "status" },
]

export function DataTableDemo() {
  return <DataTable data={data} columns={columns} />
}
```

### With Selection & Pagination

```tsx
import {  DataTable  } from "@cnma/react-ui"
import { useState } from "react"

export function DataTableAdvancedDemo({ items, columns }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  return (
    <DataTable
      data={items}
      columns={columns}
      selection={{
        selectedIds,
        onSelectionChange: setSelectedIds
      }}
      pagination={{
        page: 1,
        pageSize: 10,
        totalCount: 100,
        onPageChange: (page) => console.log("Page:", page)
      }}
    />
  )
}
```

## Accessibility

- **Keyboard interactions:**
  - Table headers with `sortable: true` are focusable and can be toggled via `Enter` or `Space`.
  - Row selection checkboxes are standard inputs focusable via `Tab`.
  - Expandable row toggles are buttons and focusable via `Tab`.
- **ARIA roles:**
  - Implements standard HTML table roles (`table`, `rowgroup`, `row`, `columnheader`, `cell`).
  - Sortable headers use `aria-sort="ascending|descending|none"`.

## Design Guidelines

### ✅ Do
- Use `DataTable` as the primary list view component for List Report floorplans.
- Use `renderType: "status"` for displaying status columns consistently.
- Always provide clear, concise column headers via `labelKey`.

### ❌ Don't
- Don't build custom bespoke table layouts or mapping logic if `DataTable` config can handle it.
- Don't flatten deeply nested complex data into massive concatenated strings in one cell.
- Don't create per-table color maps for statuses. Use standard status semantics.
