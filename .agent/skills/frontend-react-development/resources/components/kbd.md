# Kbd

> A styled keyboard key indicator for displaying keyboard shortcuts.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
```

## Props API Reference

### Kbd
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for styling. |
| `children` | `ReactNode` | — | The keyboard shortcut character, text, or icon. |
| `...props` | `HTMLAttributes<HTMLElement>` | — | Standard HTML kbd attributes. |

### KbdGroup
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes for styling. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Standard HTML div attributes. |

## Variants & Examples

### Default

```tsx
import {  Kbd  } from "@cnma/react-ui"

export function KbdDemo() {
  return (
    <p>
      Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open search.
    </p>
  )
}
```

### In Context

```tsx
import {  Kbd  } from "@cnma/react-ui"

export function KbdContextDemo() {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      Save: <Kbd>Ctrl</Kbd><Kbd>S</Kbd>
    </div>
  )
}
```

### Modifier Keys

```tsx
import {  Kbd  } from "@cnma/react-ui"

export function KbdModifiersDemo() {
  return (
    <div className="flex gap-2">
      <Kbd>⌘ Cmd</Kbd>
      <Kbd>⇧ Shift</Kbd>
      <Kbd>⌥ Opt</Kbd>
      <Kbd>⌃ Ctrl</Kbd>
    </div>
  )
}
```

## Accessibility

- **Screen Readers:**
  - `Kbd` generally renders standard HTML `<kbd>` tag visually styled.
  - When rendering symbols like `⌘` or `⇧`, ensure they are accompanied by a descriptive label like `Cmd` or `Shift` if screen readers struggle with raw symbol pronunciation, or use `aria-label` appropriately.

## Design Guidelines

### ✅ Do
- Use `Kbd` exclusively to document keyboard shortcuts, hotkeys, and command syntax.
- Place `Kbd` in context with the command it executes (e.g., in a `Tooltip` or `Command` menu).
- Group multiple keys tightly (with minimal spacing) to represent simultaneous keystrokes.

### ❌ Don't
- Don't use `Kbd` as a visual stylistic element for regular text.
- Don't overuse `Kbd` tags in long paragraphs where plain text would suffice.
