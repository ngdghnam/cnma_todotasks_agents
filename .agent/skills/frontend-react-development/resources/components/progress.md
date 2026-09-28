# Progress

> A horizontal bar that indicates the completion progress of a task.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<div
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="60"
  class="relative h-2 w-full overflow-hidden rounded-full bg-primary/20"
>
  <div
    class="h-full w-full flex-1 bg-primary transition-all"
    style="transform: translateX(-40%);"
  ></div>
</div>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| null` | `0` | The current progress value (0-100). If `null` or `undefined`, the progress is visually indeterminate (depending on implementation). |
| `max` | `number` | `100` | The maximum progress value. |
| `getValueLabel` | `(value: number, max: number) => string` | — | A function to get the accessible label text representing the current value. |
| `className` | `string` | — | Additional CSS classes for the root element. |

## Variants & Examples

### Default
```tsx
import {  Progress  } from "@cnma/react-ui";
import { useEffect, useState } from "react";

export default function ProgressDemo() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="w-[60%]" />;
}
```

### With Label
```tsx
import {  Progress  } from "@cnma/react-ui";

export default function ProgressWithLabel() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading...</span>
        <span>60%</span>
      </div>
      <Progress value={60} />
    </div>
  );
}
```

## Accessibility

- The component has a `role` of `progressbar`.
- Uses `aria-valuenow` to indicate the current progress.
- Uses `aria-valuemin` and `aria-valuemax` to indicate the minimum and maximum values.
- Screen readers will announce the current progress value.

## Design Guidelines

- **Do** use `Progress` when the total completion time or percentage can be accurately determined.
- **Do** provide accompanying text or context (e.g., "Uploading 3 of 5 items") near the progress bar if the context isn't visually obvious.
- **Don't** use `Progress` for indeterminate loading states where completion percentage is unknown. Use a `Spinner` instead.
- **Don't** animate progress backwards unless the operation is explicitly reversing (e.g. un-filling a bucket).
