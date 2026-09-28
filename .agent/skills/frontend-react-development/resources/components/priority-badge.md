# Priority Badge

> Standardized badge for displaying priority or risk levels with consistent color-coding.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { PriorityBadge } from "@cnma/react-ui";

<PriorityBadge priority="High">High Priority</PriorityBadge>
```

## Props API Reference

### PriorityBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `priority` | `string` | **Required** | The priority string (e.g., 'Critical', 'High', 'Medium', 'Normal', 'Low'). |
| `children` | `React.ReactNode` | — | Optional override for the display text. If omitted, it displays the `priority` string. |
| `className` | `string` | — | Additional CSS classes for the component. |

## Variants & Examples

### Priority Levels
```tsx
import { PriorityBadge } from "@cnma/react-ui";

export default function PriorityDemo() {
  return (
    <div className="flex gap-2">
      <PriorityBadge priority="Critical" />
      <PriorityBadge priority="High" />
      <PriorityBadge priority="Medium" />
      <PriorityBadge priority="Low" />
    </div>
  );
}
```

## Accessibility
- Acts as a standard `Badge` primitive. Ensure surrounding context explains what the priority applies to.

## Design Guidelines
- **Do** use this component to centralize priority colors instead of hardcoding custom color maps in your pages.
- **Don't** use this for document workflows (use `DocumentStatusBadge` instead).
