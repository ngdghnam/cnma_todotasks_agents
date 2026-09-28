# Empty State

> A placeholder component for empty views with icon, title, description, and action slots.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      {/* Icon component */}
    </EmptyMedia>
    <EmptyTitle>Title text</EmptyTitle>
    <EmptyDescription>Description text</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    {/* Action button or other content */}
  </EmptyContent>
</Empty>
```

## Props API Reference

### Empty
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for styling. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Standard HTML div attributes. |

### EmptyHeader
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for styling. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Standard HTML div attributes. |

### EmptyMedia
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "icon"` | `"default"` | Visual style of the media element. |
| `className` | `string` | — | Additional CSS classes for styling. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Standard HTML div attributes. |

### EmptyTitle
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for styling. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Standard HTML div attributes. |

### EmptyDescription
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for styling. |
| `...props` | `HTMLAttributes<HTMLParagraphElement>` | — | Standard HTML p attributes. |

### EmptyContent
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for styling. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Standard HTML div attributes. |

## Variants & Examples

### Default

```tsx
import {  
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyContent 
 } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"
import { Inbox } from "lucide-react"

export function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox className="size-12" />
        </EmptyMedia>
        <EmptyTitle>No orders found</EmptyTitle>
        <EmptyDescription>Try adjusting your filters or create a new order.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create Order</Button>
      </EmptyContent>
    </Empty>
  )
}
```

### Minimal

```tsx
import {  Empty, EmptyHeader, EmptyTitle  } from "@cnma/react-ui"

export function EmptyMinimal() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No results match your search</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
}
```

## Accessibility

- **ARIA roles:**
  - Standard descriptive DOM elements. Ensure `title` is typically rendered as a heading (e.g., `<h3>` or `<h4>`) for document outline integrity.
  - If the empty state replaces a main content area (like a table body), ensure screen readers can intuitively read the empty message when they navigate to that section.

## Design Guidelines

### ✅ Do
- Always provide a helpful action (CTA) when possible so the user knows what to do next.
- Use relevant, recognizable icons that match the context (e.g., a file for documents, a magnifying glass for search).
- Keep the title concise and the description actionable.

### ❌ Don't
- Don't just show "No data" — always explain *why* it's empty and *what* the user can do.
- Don't use generic error icons (like a red X) for neutral empty states (like a new account with no items).
