# Drawer

> A bottom sheet panel for mobile-friendly secondary content.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Drawer>
  <DrawerTrigger />
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle />
      <DrawerDescription />
    </DrawerHeader>
    <div className="content">
      {/* Drawer Body */}
    </div>
    <DrawerFooter>
      <DrawerClose />
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when the open state changes. |
| `shouldScaleBackground` | `boolean` | `true` | Scales the background when the drawer opens (iOS-like effect). |
| `snapPoints` | `number[]` | — | Array of snap points (e.g., `[0.5, 1]`). |
| `activeSnapPoint` | `number` | — | Controlled active snap point. |
| `setActiveSnapPoint` | `(snapPoint: number) => void` | — | Callback when the active snap point changes. |

*(Built on top of `vaul`. Inherits all `vaul` root properties).*

## Variants & Examples

### Default
```tsx
import { 
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
 } from "@cnma/react-ui";
import {  Button  } from "@cnma/react-ui";

<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Move Goal</DrawerTitle>
      <DrawerDescription>Set your daily activity goal.</DrawerDescription>
    </DrawerHeader>
    <div className="p-4 flex items-center justify-center">
      [Content Goes Here]
    </div>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## Accessibility

- **Keyboard:**
  - `Escape` closes the drawer.
  - `Tab` traps focus inside the drawer while open.
- **Roles & Attributes:**
  - Handled identically to dialogs (`role="dialog"`, `aria-modal="true"`).
  - Uses `DrawerTitle` to supply the `aria-labelledby` property.

## Design Guidelines

### Do's
- Use the Drawer component primarily for mobile-first designs where a bottom sheet feels more native than a modal dialog.
- Provide a clear drag handle or close button to make dismissibility obvious.

### Don'ts
- Don't use a Drawer on wide desktop viewports — consider a `Sheet` (side panel) or `Dialog` (centered modal) instead.
- Don't put complex multi-step flows in a drawer that risk confusing users or causing accidental dismissal.
