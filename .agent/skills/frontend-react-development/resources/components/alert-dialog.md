# Alert Dialog

> A modal dialog for critical confirmations that blocks overlay dismissal.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<AlertDialog>
  <AlertDialogTrigger>
    {/* Trigger element */}
  </AlertDialogTrigger>
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Title</AlertDialogTitle>
        <AlertDialogDescription>Description</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Confirm</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialogPortal>
</AlertDialog>
```

## Props API Reference

### AlertDialog
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | `boolean` | `false` | The open state of the dialog when initially rendered. |
| `open` | `boolean` | — | The controlled open state of the dialog. |
| `onOpenChange` | `(open: boolean) => void` | — | Event handler called when the open state changes. |

### AlertDialogTrigger
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |

### AlertDialogContent
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | — | Event handler called when the escape key is down. |
| `className` | `string` | — | Additional CSS classes for styling. |

### AlertDialogAction
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `className` | `string` | — | Additional CSS classes for styling. |

### AlertDialogCancel
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `className` | `string` | — | Additional CSS classes for styling. |

## Variants & Examples

### Default (Destructive Action)

```tsx
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
 } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## Accessibility

- **Keyboard interactions:**
  - `Space` or `Enter`: Opens the dialog when focus is on the trigger. Triggers the buttons inside the dialog.
  - `Tab`: Moves focus to the next focusable element inside the dialog. Focus is trapped within the dialog.
  - `Shift + Tab`: Moves focus to the previous focusable element.
  - `Escape`: Closes the dialog.
- **ARIA roles:**
  - The `AlertDialogContent` has `role="alertdialog"`.
  - It automatically points `aria-labelledby` to the `AlertDialogTitle` and `aria-describedby` to the `AlertDialogDescription`.
- **Focus Management:**
  - Focus is automatically trapped within the modal when opened.
  - Upon closing, focus is returned to the element that originally triggered the dialog.

## Design Guidelines

### ✅ Do
- Use `AlertDialog` for Delete, Discard Changes, and other destructive or irreversible actions.
- Make the destructive action clear (e.g., "Delete", "Discard") instead of vague labels.
- Ensure you always provide an `AlertDialogCancel` option to allow the user to back out.

### ❌ Don't
- Don't use a regular `Dialog` for destructive actions, as users might accidentally dismiss it by clicking the overlay.
- Don't use vague labels like "OK" or "Yes". Be explicit about the action.
- Don't use `AlertDialog` for simple informative messages or non-destructive actions; use `Dialog` or `Toast` instead.
