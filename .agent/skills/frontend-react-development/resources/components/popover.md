# Popover

> A floating panel that opens on click, used for interactive content like forms or pickers.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<button aria-haspopup="dialog" aria-expanded="true"> <!-- PopoverTrigger -->
  Open Popover
</button>

<!-- Rendered in a Portal -->
<div role="dialog" tabindex="-1"> <!-- PopoverContent -->
  <div class="z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
    <!-- Content goes here -->
  </div>
</div>
```

## Props API Reference

### Popover (Root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | `boolean` | `false` | The open state of the popover when it is initially rendered. Use when you do not need to control its open state. |
| `open` | `boolean` | — | The controlled open state of the popover. Must be used in conjunction with `onOpenChange`. |
| `onOpenChange` | `(open: boolean) => void` | — | Event handler called when the open state of the popover changes. |
| `modal` | `boolean` | `false` | Whether the popover should be modal. When `true`, interaction with outside elements will be disabled. |

### PopoverTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### PopoverContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | The preferred alignment against the trigger. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | The preferred side of the trigger to render against. |
| `sideOffset` | `number` | `4` | The distance in pixels from the trigger. |
| `alignOffset` | `number` | `0` | An offset in pixels from the `"start"` or `"end"` alignment options. |
| `avoidCollisions` | `boolean` | `true` | When `true`, overrides the `side` and `align` preferences to prevent collisions with window edges. |

## Variants & Examples

### Default
```tsx
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
 } from "@cnma/react-ui";
import {  Button  } from "@cnma/react-ui";

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Settings</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">Dimensions</h4>
          <p className="text-sm text-muted-foreground">
            Set the dimensions for the layer.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

## Accessibility

- Popovers use the `dialog` role.
- Focus is trapped inside the popover when `modal` is `true`.
- Pressing `Escape` or clicking outside the popover closes it and returns focus to the trigger.
- The `PopoverTrigger` has `aria-haspopup="dialog"` and manages `aria-expanded`.

## Design Guidelines

- **Do** use Popover for contextual help or inline configuration that shouldn't disrupt the main flow (e.g., date pickers, mini settings).
- **Do** keep popover content focused and compact.
- **Don't** use Popover for critical confirmations — use `AlertDialog` instead.
- **Don't** put long, complex forms in popovers — use `Dialog` or a dedicated page instead.
