# Context Menu

> A menu triggered by right-clicking on an element.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    {/* Target Element */}
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem />
    <ContextMenuCheckboxItem />
    <ContextMenuRadioGroup>
      <ContextMenuRadioItem />
    </ContextMenuRadioGroup>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger />
      <ContextMenuSubContent />
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
```

## Props API Reference

| Component | Prop | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `ContextMenu` | `onOpenChange` | `(open: boolean) => void` | — | Event handler called when the open state changes. |
| | `dir` | `"ltr" \| "rtl"` | `"ltr"` | The reading direction of the context menu. |
| | `modal` | `boolean` | `true` | Whether the context menu should act as a modal. |
| `ContextMenuItem` | `inset` | `boolean` | — | Indents the item to align with checkbox/radio items. |
| | `variant` | `"default" \| "destructive"` | `"default"` | The variant of the menu item. |
| `ContextMenuSubTrigger` | `inset` | `boolean` | — | Indents the sub trigger to align with checkbox/radio items. |
| `ContextMenuLabel` | `inset` | `boolean` | — | Indents the label to align with checkbox/radio items. |

*For full Radix UI component props, refer to the underlying primitives.*

## Variants & Examples

### Default
```tsx
import { 
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut
 } from "@cnma/react-ui";

<ContextMenu>
  <ContextMenuTrigger className="flex h-32 items-center justify-center border border-dashed rounded-md">
    Right click here
  </ContextMenuTrigger>
  <ContextMenuContent className="w-64">
    <ContextMenuItem>
      Edit
      <ContextMenuShortcut>⌘E</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      Duplicate
      <ContextMenuShortcut>⌘D</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem className="text-destructive">
      Delete
      <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### With Submenus and Checkboxes
```tsx
<ContextMenu>
  <ContextMenuTrigger>Right click here</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuCheckboxItem checked>Show Toolbar</ContextMenuCheckboxItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Save Page As...</ContextMenuItem>
        <ContextMenuItem>Create Shortcut</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
```

## Accessibility

- **Keyboard:**
  - `ArrowDown` / `ArrowUp` navigates through the menu items.
  - `Enter` or `Space` selects an item.
  - `Escape` closes the menu.
  - `ArrowRight` opens submenus; `ArrowLeft` closes them.
- **Roles:**
  - The menu receives `role="menu"`.
  - Items receive `role="menuitem"`.
  - Focus is trapped within the open context menu.

## Design Guidelines

### Do's
- Provide keyboard shortcuts for commonly used context actions.
- Use logical groupings separated by `ContextMenuSeparator`.

### Don'ts
- Don't use a Context Menu as the only way to access critical actions; always provide a visible alternative (e.g., a Dropdown Menu or Button).
- Don't nest submenus too deeply (more than 2 levels) as it degrades usability.
