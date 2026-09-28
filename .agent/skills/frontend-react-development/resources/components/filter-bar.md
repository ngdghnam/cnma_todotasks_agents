# FilterBar

> A SAP Fiori-style filter bar with Go/Clear/Toggle controls for List Report filtering.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<FilterBar
  config={filters}
  values={values}
  onChange={setValues}
  onApply={handleApply}
/>
```

## Props API Reference

### FilterBar
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `FilterFieldConfig[]` | — | Filter field configurations (visible only). |
| `allFilterConfig` | `FilterFieldConfig[]` | — | ALL filter field configurations (for adapt-filter dialog). |
| `onAdaptFilter` | `(filters: { name: string; label: string; visible: boolean; }[]) => void` | — | Called when user applies filter visibility changes from adapt-filter dialog. |
| `values` | `FilterValues` | — | Current filter values. |
| `onChange` | `(values: FilterValues) => void` | — | Called when any filter value changes. |
| `onApply` | `(values: FilterValues) => void` | — | Called when "Go" button is clicked. |
| `onClear` | `() => void` | — | Called when "Clear" button is clicked. |
| `isLoading` | `boolean` | `false` | Whether data is loading. |
| `defaultExpanded` | `boolean` | `false` | Whether filter bar is initially expanded. |
| `className` | `string` | — | Custom class name. |
| `headerLeft` | `ReactNode` | — | Optional content rendered on the left side of the header row (e.g. VariantSelector). |

### BaseFilterConfig (Shared Props)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `string` | — | Unique key for the filter (used in filter values object). |
| `label` | `string` | — | Display label for the filter. |
| `labelKey` | `string` | — | Translation key for the label (optional). |
| `placeholder` | `string` | — | Placeholder text. |
| `required` | `boolean` | `false` | Whether the filter is required. |
| `visible` | `boolean` | `true` | Whether the filter is visible by default. |
| `width` | `string` | — | Custom width (e.g., '200px', '1fr'). |
| `apiKey` | `string` | — | API parameter name (defaults to 'key' if not specified). |
| `apiTransform` | `(value: any) => any` | — | Transform function to convert UI value to API value. |
| `type` | `"text" \| "select" \| "multiselect" \| "dateRange" \| "valueHelp"` | — | The UI component type. |

### TextFilterConfig (`type: 'text'`)
Standard text input field for free-text search.
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxLength` | `number` | — | Max length for input. |

### SelectFilterConfig (`type: 'select'`)
Single-select dropdown field.
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | — | Static options array (`{ value, label, icon? }`). |
| `optionsLoader` | `() => Promise<SelectOption[]>` | — | Async options loader. |

### MultiSelectFilterConfig (`type: 'multiselect'`)
Multi-select dropdown with checkboxes (SAP UI5 style).
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | — | Static options array. |
| `optionsLoader` | `() => Promise<SelectOption[]>` | — | Async options loader. |
| `showSelectAll` | `boolean` | `false` | Show "Select All" toggle button. |

### DateRangeFilterConfig (`type: 'dateRange'`)
Date range picker.
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `numberOfMonths` | `1 \| 2` | `1` | Number of months to show in calendar. |

### ValueHelpFilterConfig (`type: 'valueHelp'`)
SAP UI5 style Value Help dialog popup for large, searchable datasets.
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `valueHelpComponent` | `ComponentType<ValueHelpComponentProps>` | — | The ValueHelp dialog component to render. |
| `displayField` | `string \| ((item: any) => string)` | — | Field from selected item to display as token. |
| `valueField` | `string` | — | Field from selected item to use as value. |
| `multiple` | `boolean` | `false` | Whether to allow multiple selection. |

## Variants & Examples

### Default with Multiple Filter Types

```tsx
import { FilterBar } from "@cnma/react-ui"
import { useState } from "react"
import { SupplierValueHelp } from "./SupplierValueHelp" // Example component

export function FilterBarDemo() {
  const [values, setValues] = useState({})
  
  const statusOptions = [
    { label: "New", value: "new" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ]

  const categoryOptions = [
    { label: "Hardware", value: "hw" },
    { label: "Software", value: "sw" },
  ]

  const filters = [
    { key: "search", label: "Search", type: "text", width: "250px" },
    { key: "category", label: "Category", type: "select", options: categoryOptions },
    { key: "status", label: "Status", type: "multiselect", options: statusOptions, showSelectAll: true },
    { key: "date", label: "Date Range", type: "dateRange", numberOfMonths: 2 },
    { 
      key: "supplier", 
      label: "Supplier", 
      type: "valueHelp",
      valueHelpComponent: SupplierValueHelp,
      displayField: "name",
      valueField: "id",
      multiple: true
    },
  ]

  return (
    <FilterBar
      config={filters}
      values={values}
      onChange={setValues}
      onApply={(values) => console.log("Applied filters:", values)}
      onClear={() => setValues({})}
    />
  )
}
```

## Accessibility

- **Keyboard interactions:**
  - Standard focus management for all internal filter inputs (`Tab` through inputs, `Enter` to open dropdowns/selects).
  - Pressing `Enter` within any text filter should implicitly trigger the `onApply` ("Go") action if `liveUpdate` is false.
- **ARIA roles:**
  - Uses `role="search"` or `role="form"` appropriately for the filtering region.
  - Labels are correctly associated with their respective inputs via `htmlFor` and `id` bindings.

## Design Guidelines

### ✅ Do
- Use `FilterBar` at the top of List Report pages, directly above the `DataTable`.
- Organize the most frequently used filters first (e.g., Search, Status).
- Use `multiselect` (MultiSelectFilter) for small, static, finite lists (e.g., Statuses, Categories).
- Use `valueHelp` (ValueHelpFilter) for large, searchable datasets that require pagination or complex searching (e.g., Suppliers, Employees).
- Use `liveUpdate` only if the backend/API can handle rapid debounce filtering without lag; otherwise, rely on the explicit "Go" button.

### ❌ Don't
- Don't overwhelm the user with too many default visible filters. Consider adding an "Advanced Filters" or "Add Filter" toggle for complex pages.
- Don't use standard standalone inputs for table filtering if the `FilterBar` config system covers the use case.
