# Table

> A structured data display with rows and columns for tabular content.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<div class="relative w-full overflow-auto">
  <table class="w-full caption-bottom text-sm">
    <thead class="[&_tr]:border-b">
      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Header</th>
      </tr>
    </thead>
    <tbody class="[&_tr:last-child]:border-0">
      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        <td class="p-2 align-middle">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for any of the table sub-components. |
| `...props` | `React.HTMLAttributes` | — | Standard HTML attributes for `table`, `thead`, `tbody`, `tr`, `th`, `td`, etc. |

### Sub-components

| Sub-component | HTML Element | Description |
|------|------|-------------|
| `Table` | `<table>` | Root table container |
| `TableHeader` | `<thead>` | Table head section |
| `TableBody` | `<tbody>` | Table body section |
| `TableFooter` | `<tfoot>` | Table footer section |
| `TableRow` | `<tr>` | Table row |
| `TableHead` | `<th>` | Header cell |
| `TableCell` | `<td>` | Data cell |
| `TableCaption` | `<caption>` | Table caption |
| `TableToolbar` | `<div>` | Header toolbar above the table |

### TableToolbar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `React.ReactNode` | **Required** | The title of the table toolbar. |
| `children` | `React.ReactNode` | — | Additional content or actions. |
| `className` | `string` | — | Additional CSS classes for the toolbar. |

## Variants & Examples

### Default
```tsx
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
 } from "@cnma/react-ui";
import {  StatusBadge  } from "@cnma/react-ui";

export default function TableDemo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">INV001</TableCell>
          <TableCell><StatusBadge status="Approved" /></TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## Accessibility

- The table naturally uses standard HTML `<table>` elements which are highly accessible.
- Include a `TableCaption` when applicable to provide context for screen readers.
- Use `TableHead` inside `TableHeader` to properly mark column headers (`<th>`).

## Design Guidelines

- **Do** align numeric values and amounts to the right (`text-right`) for easier visual comparison.
- **Do** use a Chevron Right (`>`) in the last column if the row is navigable or clickable to open a detail view.
- **Don't** use `Table` for page layout. Use CSS Grid or Flexbox instead.
- **Don't** use Ellipsis (`...`) to denote row navigation. The ellipsis should be reserved for opening a row action menu (Dropdown Menu).
- **Don't** use this static Table component if you need complex features like sorting, pagination, and filtering; use the `Data Table` implementation instead.
