# Menubar

> A horizontal menu bar with dropdown menus, typically used for application-level actions.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger />
    <MenubarContent>
      <MenubarItem />
      <MenubarCheckboxItem />
      <MenubarRadioGroup>
        <MenubarRadioItem />
      </MenubarRadioGroup>
      <MenubarSeparator />
      <MenubarSub>
        <MenubarSubTrigger />
        <MenubarSubContent />
      </MenubarSub>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Props API Reference

### Menubar (Root)
| Component | Prop | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `Menubar` | `defaultValue` | `string` | — | Initially active menu item. |
| | `value` | `string` | — | Controlled active menu item. |
| | `onValueChange` | `(value: string) => void` | — | Callback when the active menu changes. |
| | `dir` | `"ltr" \| "rtl"` | `"ltr"` | The reading direction. |
| `MenubarItem` | `inset` | `boolean` | — | Indents the item to align with checkbox/radio items. |
| | `variant` | `"default" \| "destructive"` | `"default"` | The color variant of the menu item. |
| `MenubarSubTrigger`| `inset` | `boolean` | — | Indents the sub trigger to align with checkbox/radio items. |
| `MenubarLabel` | `inset` | `boolean` | — | Indents the label to align with checkbox/radio items. |

## Variants & Examples

### Default
```tsx
import { 
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
 } from "@cnma/react-ui";

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Tab
        <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        New Window
        <MenubarShortcut>⌘N</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Share</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Print...</MenubarItem>
    </MenubarContent>
  </MenubarMenu>

  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        Undo
        <MenubarShortcut>⌘Z</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Redo
        <MenubarShortcut>⇧⌘Z</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Accessibility

- **Keyboard:**
  - `ArrowRight` / `ArrowLeft` navigates between top-level triggers.
  - `ArrowDown` opens a menu or navigates down inside it.
  - `Enter` / `Space` executes an action.
- **Roles:**
  - `role="menubar"` on the root container.
  - Items utilize `role="menuitem"`, `menuitemcheckbox`, or `menuitemradio`.

## Design Guidelines

### Do's
- Use a Menubar for OS-like or complex application navigation patterns (e.g., desktop web applications).
- Always pair related actions and assign logical keyboard shortcuts.

### Don't
- Don't use a Menubar for simple website navigation; use a standard `NavigationMenu` or a series of Buttons instead.
