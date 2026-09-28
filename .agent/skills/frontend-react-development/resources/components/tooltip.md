# Tooltip

> A popup that displays informative text when hovering over or focusing an element.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      {/* Trigger element (e.g., Button) */}
    </TooltipTrigger>
    <TooltipContent>
      {/* Tooltip content string or elements */}
      <TooltipArrow />
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Props API Reference

### TooltipProvider
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `delayDuration` | `number` | `700` | The duration from when the mouse enters a tooltip trigger until the tooltip opens. |
| `skipDelayDuration` | `number` | `300` | How much time a user has to enter another trigger without incurring a delay again. |
| `disableHoverableContent` | `boolean` | `false` | Prevents TooltipContent from remaining open when hovering. |

### Tooltip
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | `boolean` | `false` | The open state of the tooltip when it is initially rendered. |
| `open` | `boolean` | — | The controlled open state of the tooltip. |
| `onOpenChange` | `(open: boolean) => void` | — | Event handler called when the open state of the tooltip changes. |
| `delayDuration` | `number` | `0` | Delay before showing (ms). Overrides provider setting. |

### TooltipTrigger
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |

### TooltipContent
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `aria-label` | `string` | — | An accessible label for the tooltip. |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | — | Event handler called when the escape key is down. |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | — | Event handler called when a pointer event occurs outside. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | The preferred side of the trigger to render against. |
| `sideOffset` | `number` | `4` | The distance in pixels from the trigger. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | The preferred alignment against the trigger. |
| `alignOffset` | `number` | `0` | An offset in pixels from the `"start"` or `"end"` alignment options. |
| `className` | `string` | — | Additional CSS classes for styling. |

## Variants & Examples

### Default

```tsx
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
 } from "@cnma/react-ui"
import {   Button  } from "@cnma/react-ui"

export function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### Custom Side

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
 } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"

export function TooltipSideDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right Side</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Right-aligned tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

## Accessibility

- **Keyboard interactions:**
  - `Tab`: Opens/closes the tooltip on focus/blur.
  - `Escape`: Closes the tooltip when focused or hovered.
- **ARIA roles:**
  - The `TooltipContent` uses the `tooltip` role.
  - The `TooltipTrigger` has `aria-describedby` set to the `id` of the `TooltipContent`.
- **Delay**: Configured with a zero delay by default in the system for responsiveness.

## Design Guidelines

### ✅ Do
- Use tooltips for icon-only buttons to explain the action.
- Keep tooltip text short and concise (under 10 words).
- Use `Hover Card` for richer preview popups.

### ❌ Don't
- Don't put critical information or interactive elements inside a tooltip. It's not discoverable and can be hard to reach.
- Don't rely on tooltips for mobile experiences, as they require hover functionality.
- Don't use tooltips on standard text links. Use a descriptive link text instead.
