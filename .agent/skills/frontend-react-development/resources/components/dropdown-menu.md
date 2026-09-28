# Dropdown Menu

> A menu that appears on click with a list of actions, commands, or navigation options.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    {/* Trigger element (e.g., Button) */}
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Label</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>Item 1</DropdownMenuItem>
      <DropdownMenuItem>Item 2</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem>Checkbox Item</DropdownMenuCheckboxItem>
    <DropdownMenuRadioGroup>
      <DropdownMenuRadioItem value="radio1">Radio 1</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>
```

## Props API Reference

### DropdownMenu
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | The reading direction of the dropdown menu. |
| `defaultOpen` | `boolean` | `false` | The open state of the dropdown menu when it is initially rendered. |
| `open` | `boolean` | — | The controlled open state of the dropdown menu. |
| `onOpenChange` | `(open: boolean) => void` | — | Event handler called when the open state of the dropdown menu changes. |
| `modal` | `boolean` | `true` | The modality of the dropdown menu. |

### DropdownMenuTrigger
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |

### DropdownMenuContent
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `loop` | `boolean` | `false` | When `true`, keyboard navigation will loop from last item to first, and vice versa. |
| `onCloseAutoFocus` | `(event: Event) => void` | — | Event handler called when focus moves to the trigger after closing. It can be prevented by calling `event.preventDefault`. |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | — | Event handler called when the escape key is down. |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | — | Event handler called when a pointer event occurs outside the bounds of the component. |
| `onInteractOutside` | `(event: React.FocusEvent \| MouseEvent \| TouchEvent) => void` | — | Event handler called when an interaction occurs outside the bounds of the component. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | The preferred side of the trigger to render against. |
| `sideOffset` | `number` | `4` | The distance in pixels from the trigger. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | The preferred alignment against the trigger. |
| `alignOffset` | `number` | `0` | An offset in pixels from the `"start"` or `"end"` alignment options. |
| `className` | `string` | — | Additional CSS classes for styling. |

### DropdownMenuItem
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child. |
| `disabled` | `boolean` | `false` | When `true`, prevents the user from interacting with the item. |
| `onSelect` | `(event: Event) => void` | — | Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item. |

### DropdownMenuCheckboxItem
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean \| "indeterminate"` | `false` | The controlled checked state of the item. |
| `onCheckedChange` | `(checked: boolean) => void` | — | Event handler called when the checked state changes. |

### DropdownMenuRadioItem
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | The unique value of the item. |

### DropdownMenuLabel
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inset` | `boolean` | `false` | When `true`, adds an inset padding to align with menu items that have indicators. |

## Variants & Examples

### Default

```tsx
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "@cnma/react-ui"
import {   Button  } from "@cnma/react-ui"
import { MoreHorizontal } from "lucide-react"

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### With Destructive Action

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "@cnma/react-ui"
import {   Button  } from "@cnma/react-ui"

export function DropdownMenuDestructive() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Checkboxes

```tsx
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"
import { useState } from "react"

export function DropdownMenuCheckboxes() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showActivityBar, setShowActivityBar] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Appearance</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
          Activity Bar
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Accessibility

- **Keyboard interactions:**
  - `Space` or `Enter`: Opens the dropdown menu and focuses the first item. Also triggers item selection.
  - `ArrowDown`: Focuses the next menu item.
  - `ArrowUp`: Focuses the previous menu item.
  - `ArrowRight`: Opens a submenu and focuses the first item.
  - `ArrowLeft`: Closes a submenu and focuses the trigger.
  - `Escape`: Closes the dropdown menu and returns focus to the trigger.
- **ARIA roles:**
  - Uses `menu` for the container and `menuitem` / `menuitemcheckbox` / `menuitemradio` for the items.
  - Focus management is handled automatically to trap focus within the modal menu content.

## Design Guidelines

### ✅ Do
- Use an Ellipsis (`...`) icon for row action menus.
- Group related items with `DropdownMenuSeparator`.
- Order menu items by expected frequency of use, placing the most common actions at the top.
- Place destructive actions (like Delete) at the bottom, preferably separated by a divider.

### ❌ Don't
- Don't use the Ellipsis icon for navigation menus — use Chevron Right or Down instead.
- Don't put more than ~10 items in a dropdown menu. If you have many options, consider using a `Command` component (searchable command palette) instead.
- Don't use a dropdown menu for simple select inputs. Use `Select` instead.
