# Toast

> Non-blocking, transient notifications for success confirmations and feedback.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
// Inside your root layout:
<Toaster />

// Inside your components:
import { toast } from "sonner"

toast("Event has been created")
```

## Props API Reference

### Toaster (Provider)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'` | `'bottom-right'` | Position of the toasts. |
| `expand` | `boolean` | `false` | When `true`, toasts will be expanded by default. |
| `duration` | `number` | `4000` | The duration (in milliseconds) before the toast auto-dismisses. |
| `visibleToasts` | `number` | `3` | Maximum number of visible toasts at one time. |
| `closeButton` | `boolean` | `false` | Adds a close button to all toasts. |
| `richColors` | `boolean` | `false` | Makes error/success state toasts colorful. |

### toast (Function)

The `toast` function can be used to trigger notifications.

| Method | Description |
| :--- | :--- |
| `toast(message, options?)` | Default toast |
| `toast.success(message, options?)` | Success toast |
| `toast.error(message, options?)` | Error toast |
| `toast.warning(message, options?)` | Warning toast |
| `toast.info(message, options?)` | Info toast |
| `toast.loading(message, options?)` | Loading spinner toast |
| `toast.promise(promise, { loading, success, error })` | Promise-based toast that updates state automatically |
| `toast.dismiss(id)` | Dismisses a specific toast, or all toasts if no ID is passed |

### Toast Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `description` | `React.ReactNode` | — | Additional detail text below the title. |
| `duration` | `number` | `4000` | Auto-dismiss time (ms) for this specific toast. |
| `action` | `{ label: string; onClick: () => void }` | — | Action button config. |
| `cancel` | `{ label: string; onClick: () => void }` | — | Cancel button config. |
| `id` | `string | number` | — | Unique identifier to update or dismiss a specific toast. |
| `icon` | `React.ReactNode` | — | Custom icon. |

## Variants & Examples

### Default & States

```tsx
import { toast } from "sonner"
import {  Button  } from "@cnma/react-ui"

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("Event has been created")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Saved successfully")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Connection unstable")}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info("New update available")}>
        Info
      </Button>
    </div>
  )
}
```

### With Description

```tsx
toast.success("Event created", {
  description: "Sunday, December 03, 2023 at 9:00 AM",
})
```

### With Action

```tsx
toast("Event deleted", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo clicked"),
  },
})
```

### Promise

```tsx
const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

toast.promise(promise, {
  loading: 'Loading...',
  success: () => {
    return 'Data loaded successfully';
  },
  error: 'Error loading data',
});
```

## Accessibility

Built using the `sonner` package, which manages focus sensibly.
- Toasts announce themselves to screen readers via an `aria-live` region (`polite` for default, `assertive` for errors).
- Toasts should not contain complex interactive elements except simple action buttons.
- Users can focus toasts with the keyboard shortcut (default `Alt + T` depending on configuration) if provided by a wrapper.

## Design Guidelines

### ✅ Do
- Use for transient feedback, like success confirmations ("Settings saved").
- Keep messages short and punchy.
- Always import from `@cnma/react-ui/sonner` or your local wrapper, not `sonner` directly (unless using standard boilerplate).

### ❌ Don't
- Don't use auto-dismissing toasts for critical errors that the user *must* read.
- Don't show a separate toast for every individual field error in a form — use inline field validation instead.
- Don't put crucial workflows inside a toast action button, as the toast will disappear.
