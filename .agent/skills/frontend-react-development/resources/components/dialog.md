# Dialog

> A modal overlay that interrupts the user's workflow to request input or confirmation.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Dialog>
  <DialogTrigger />
  <DialogPortal>
    <DialogOverlay />
    <DialogContent>
      <DialogHeader>
        <DialogTitle />
        <DialogDescription />
      </DialogHeader>
      {/* Body */}
      <DialogFooter>
        <DialogClose />
      </DialogFooter>
    </DialogContent>
  </DialogPortal>
</Dialog>
```

## Props API Reference

### Dialog
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state of the dialog. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when the open state changes. |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state. |
| `modal` | `boolean` | `true` | When true, interaction with outside elements will be disabled. |

### DialogContent
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onInteractOutside` | `(event: Event) => void` | — | Callback when clicking outside the dialog content. |
| `onEscapeKeyDown` | `(event: Event) => void` | — | Callback when the escape key is pressed. |
| `className` | `string` | — | Additional CSS classes for styling. |

## Variants & Examples

### Default
```tsx
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
 } from "@cnma/react-ui";
import {  Button  } from "@cnma/react-ui";
import {  Input  } from "@cnma/react-ui";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <Input placeholder="Name" />
      <Input placeholder="Email" />
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Controlled State
```tsx
const [isOpen, setIsOpen] = useState(false);

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Controlled Dialog</DialogTitle>
      <DialogDescription>Triggered programmatically.</DialogDescription>
    </DialogHeader>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </DialogContent>
</Dialog>
```

## Accessibility

- **Keyboard:**
  - `Escape` closes the dialog.
  - `Tab` traps focus within the dialog to prevent background interaction.
- **Roles:**
  - Uses `role="dialog"` and `aria-modal="true"`.
  - Screen readers announce the `DialogTitle` and `DialogDescription` on entry.

## Design Guidelines

### Do's
- Always include a `DialogTitle` so screen readers can announce the context.
- Use `DialogFooter` to align action buttons logically (Cancel on the left, Save/Confirm on the right).
- Use `variant="outline"` for Cancel and `variant="default"` for primary actions.

### Don'ts
- Don't use a standard `Dialog` for destructive/irreversible actions (like Delete); use `AlertDialog` instead to prevent accidental overlay clicks from dismissing it.
- Don't nest a dialog inside another dialog.
- Don't put complex multi-step forms in a dialog — redirect to a full page or use a Wizard pattern.
