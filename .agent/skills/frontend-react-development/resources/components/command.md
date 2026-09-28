# Command

> A searchable command palette for finding and executing actions.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Command>
  <CommandInput />
  <CommandList>
    <CommandEmpty />
    <CommandGroup>
      <CommandItem>
        {/* Content */}
        <CommandShortcut />
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

## Props API Reference

| Component | Prop | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `Command` | `value` | `string` | — | The controlled value of the selected command item. |
| | `onValueChange` | `(value: string) => void` | — | Callback when the selected item changes. |
| | `shouldFilter` | `boolean` | `true` | Whether the command menu should filter items by the search input. |
| | `filter` | `(value: string, search: string) => number` | — | Custom filter function. |
| `CommandDialog` | `title` | `string` | — | Accessible title for the dialog. |
| | `description` | `string` | — | Accessible description for the dialog. |

*(Command built on top of `cmdk`. Refer to standard `cmdk` props for advanced usage).*

## Variants & Examples

### Inline Command
```tsx
import { 
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
 } from "@cnma/react-ui";

<Command className="border rounded-lg shadow-sm">
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### Dialog (⌘K)
```tsx
import {  CommandDialog, CommandShortcut  } from "@cnma/react-ui";

const [open, setOpen] = useState(false);

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search actions..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem onSelect={() => handleCreateOrder()}>
        Create Order
        <CommandShortcut>⌘N</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

## Accessibility

- **Keyboard:**
  - `ArrowDown` / `ArrowUp` to navigate items.
  - `Enter` to select the active item.
  - `Escape` to close the dialog (if rendered as a dialog).
- **Roles:**
  - Follows standard combobox ARIA patterns with `role="combobox"` on the input and `role="listbox"` on the list.
  - Items receive `role="option"` and `aria-selected` attributes.

## Design Guidelines

### Do's
- Use the Command menu for quick global navigation or executing complex actions via keyboard shortcuts (⌘K).
- Categorize results using `CommandGroup` to improve scannability.

### Don'ts
- Don't use Command instead of a standard `Select` or `DropdownMenu` when presenting a short, static list of options.
- Don't omit the `CommandEmpty` state, as it provides critical feedback when no results are found.
