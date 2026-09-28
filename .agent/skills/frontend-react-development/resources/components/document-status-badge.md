# Document Status Badge

> Domain-specific badge for document lifecycle statuses.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { DocumentStatusBadge } from "@cnma/react-ui";

<DocumentStatusBadge status="Pending Approval" />
```

## Props API Reference

### DocumentStatusBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'Draft' \| 'Pending Approval' \| 'Approved' \| 'Rejected' \| 'Expired'` | **Required** | The business status to display. |
| `className` | `string` | — | Additional CSS classes for the component. |
| `...props` | `BadgeProps` | — | Any other props supported by the underlying Badge component. |

## Variants & Examples

### All Document Statuses
```tsx
import { DocumentStatusBadge } from "@cnma/react-ui";

export default function DocumentStatusDemo() {
  return (
    <div className="flex gap-2">
      <DocumentStatusBadge status="Draft" />
      <DocumentStatusBadge status="Pending Approval" />
      <DocumentStatusBadge status="Approved" />
      <DocumentStatusBadge status="Rejected" />
      <DocumentStatusBadge status="Expired" />
    </div>
  );
}
```

## Accessibility
- Acts as a standard `Badge` primitive.

## Design Guidelines
- **Do** use this strictly for document-centric statuses to ensure consistent team-wide color palettes.
- **Don't** use this for financial posting logic (use `PostingStatusBadge` instead).
