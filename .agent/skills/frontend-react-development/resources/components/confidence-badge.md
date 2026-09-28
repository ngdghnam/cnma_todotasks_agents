# Confidence Badge

> Visual indicator for AI/prediction confidence scores with built-in tooltips.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { ConfidenceBadge } from "@cnma/react-ui";

<ConfidenceBadge score={0.85} showIcon={true} />
```

## Props API Reference

### ConfidenceBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | `number` | **Required** | The confidence score, ranging from 0 to 1. |
| `thresholds` | `{ high: number, medium: number, low: number }` | `{ high: 0.8, medium: 0.5, low: 0 }` | Custom thresholds for determining confidence levels. |
| `showIcon` | `boolean` | `true` | Whether to show the Brain icon next to the score. |
| `className` | `string` | — | Optional CSS class name for the badge. |

## Variants & Examples

### Default (High Confidence)
```tsx
import { ConfidenceBadge } from "@cnma/react-ui";

export default function HighConfidenceDemo() {
  return <ConfidenceBadge score={0.92} />;
}
```

### Medium & Low Confidence
```tsx
import { ConfidenceBadge } from "@cnma/react-ui";

export default function MixedConfidenceDemo() {
  return (
    <div className="flex gap-2">
      <ConfidenceBadge score={0.65} /> {/* Medium */}
      <ConfidenceBadge score={0.25} /> {/* Low */}
    </div>
  );
}
```

## Accessibility
- The badge is wrapped in a `TooltipProvider` and includes a `TooltipContent` that explains the meaning of the confidence score.
- The trigger elements are appropriately labeled for screen readers.

## Design Guidelines
- **Do** use `ConfidenceBadge` for displaying machine learning predictions or AI confidence levels.
- **Do** rely on the default thresholds unless your specific AI model requires different tuning.
- **Don't** use this for non-AI statuses (use `StatusBadge` or `PriorityBadge` instead).
