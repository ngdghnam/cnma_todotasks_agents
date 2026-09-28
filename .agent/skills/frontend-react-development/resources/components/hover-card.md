# Hover Card

> A rich preview popup that appears when hovering over an element.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<HoverCard>
  <HoverCardTrigger />
  <HoverCardContent />
</HoverCard>
```

## Props API Reference

### HoverCard

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultOpen` | `boolean` | `false` | The open state of the hover card when it is initially rendered. Use when you do not need to control its open state. |
| `open` | `boolean` | — | The controlled open state of the hover card. Must be used in conjunction with `onOpenChange`. |
| `onOpenChange` | `(open: boolean) => void` | — | Event handler called when the open state of the hover card changes. |
| `openDelay` | `number` | `700` | The duration from when the mouse enters the trigger until the hover card opens. |
| `closeDelay` | `number` | `300` | The duration from when the mouse leaves the trigger or content until the hover card closes. |

### HoverCardTrigger

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### HoverCardContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `align` | `'start' | 'center' | 'end'` | `'center'` | The preferred alignment against the trigger. |
| `side` | `'top' | 'right' | 'bottom' | 'left'` | `'bottom'` | The preferred side of the trigger to render against when open. |
| `sideOffset` | `number` | `4` | The distance in pixels from the trigger. |
| `alignOffset` | `number` | `0` | An offset in pixels from the `"start"` or `"end"` alignment options. |
| `avoidCollisions` | `boolean` | `true` | When `true`, overrides the `side` and `align` preferences to prevent collisions with window edges. |

## Variants & Examples

### Default

```tsx
import {   Avatar, AvatarFallback, AvatarImage  } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
 } from "@cnma/react-ui"

export function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The React Framework – created and maintained by @vercel.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
```

## Accessibility

### Keyboard Interactions

| Key | Description |
| :--- | :--- |
| `Tab` | Moves focus to the trigger. |
| `Enter` | Opens the hover card if triggered by a focus event. |
| `Space` | Opens the hover card if triggered by a focus event. |
| `Escape` | Closes the open hover card. |

## Design Guidelines

### ✅ Do
- Use to display rich, non-essential preview content (like user profiles or link previews).
- Keep the content concise and easy to read quickly.
- Ensure the trigger itself has sufficient affordance to be interacted with.

### ❌ Don't
- Don't use for critical information or required actions. Users should be able to complete tasks without needing the hover card content.
- Don't use to replace standard Tooltips (for simple text).
- Don't nest hover cards within other popups or modals if it creates a confusing stacking context.
