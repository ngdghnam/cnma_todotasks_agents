# Sheet

> A panel that slides in from a screen edge for secondary content or forms.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { 
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
 } from "@cnma/react-ui"

export default () => (
  <Sheet>
    <SheetTrigger />
    <SheetContent>
      <SheetHeader>
        <SheetTitle />
        <SheetDescription />
      </SheetHeader>
      {/* Content */}
      <SheetFooter>
        <SheetClose />
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
```

## Props API Reference

### SheetContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | The edge of the screen the sheet should slide in from. |
| `asChild` | `boolean` | `false` | Merges props onto the child element. |

### Sheet

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | The controlled open state of the sheet. |
| `defaultOpen` | `boolean` | `false` | The uncontrolled default open state. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state changes. |

## Variants & Examples

### Default (Right side)

The most common placement for sheets, useful for detail panels or settings.

```tsx
import {   Button  } from "@cnma/react-ui"
import {  Input  } from "@cnma/react-ui"
import {  Label  } from "@cnma/react-ui"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
 } from "@cnma/react-ui"

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Profile</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

### Positioning (Side)

You can slide the sheet from any edge using the `side` prop.

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Top</Button>
  </SheetTrigger>
  <SheetContent side="top">
    <SheetHeader>
      <SheetTitle>Top Sheet</SheetTitle>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

### Sizes

You can adjust the size of the Sheet using Tailwind classes like `w-[400px]` or `sm:w-[540px]`.

```tsx
<SheetContent className="w-[400px] sm:w-[540px]">
  <SheetHeader>
    <SheetTitle>Wide Sheet</SheetTitle>
  </SheetHeader>
</SheetContent>
```

## Accessibility

- **ARIA Attributes**: Automatically handles `aria-modal="true"`, `role="dialog"`, `aria-labelledby`, and `aria-describedby` when using `SheetTitle` and `SheetDescription`.
- **Focus Management**: Focus is trapped inside the sheet while open. When closed, focus returns to the trigger.
- **Keyboard**: Pressing `Escape` closes the sheet.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use `Sheet` for complex forms or context-heavy secondary views. | Don't use `Sheet` for simple alerts or confirmations; use `Dialog` or `Alert Dialog` instead. |
| Provide a descriptive `SheetTitle` and `SheetDescription` for screen readers. | Don't stack multiple sheets over one another. This confuses navigation. |
| Use `side="bottom"` for mobile devices when appropriate (or use `Drawer`). | Don't forget to include a clear close or cancel action. |
