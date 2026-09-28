# Posting Status Badge

> Domain-specific badge for financial posting lifecycle statuses.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { PostingStatusBadge } from "@cnma/react-ui";

<PostingStatusBadge status="Posted" />
```

## Props API Reference

### PostingStatusBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'Unposted' \| 'Posting' \| 'Posted' \| 'Failed' \| 'Reversed'` | **Required** | The financial posting status to display. |
| `className` | `string` | — | Additional CSS classes for the component. |
| `...props` | `BadgeProps` | — | Any other props supported by the underlying Badge component. |

## Variants & Examples

### All Posting Statuses
```tsx
import { PostingStatusBadge } from "@cnma/react-ui";

export default function PostingStatusDemo() {
  return (
    <div className="flex gap-2">
      <PostingStatusBadge status="Unposted" />
      <PostingStatusBadge status="Posting" />
      <PostingStatusBadge status="Posted" />
      <PostingStatusBadge status="Failed" />
      <PostingStatusBadge status="Reversed" />
    </div>
  );
}
```

## Accessibility
- Acts as a standard `Badge` primitive.

## Design Guidelines
- **Do** use this strictly for posting-centric statuses (like ledgers or transactions) to ensure consistent team-wide color palettes.
- **Don't** use this for generic priority states.
