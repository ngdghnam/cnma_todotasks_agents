# Combobox

> A searchable select input for large datasets with typeahead filtering.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {  Command } from "cmdk"

<PopoverPrimitive.Root>
  <PopoverPrimitive.Trigger>
    {/* display current value */}
  </PopoverPrimitive.Trigger>
  <PopoverPrimitive.Content>
    <Command>
      <Command.Input />
      <Command.List>
        <Command.Empty />
        <Command.Group>
          <Command.Item />
        </Command.Group>
      </Command.List>
    </Command>
  </PopoverPrimitive.Content>
</PopoverPrimitive.Root>
```

## Props API Reference

### Combobox
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `undefined` | The child components (`ComboboxTrigger`, `ComboboxContent`, etc.). |
| `value` | `string` | `undefined` | Controlled value for single selection. |
| `onValueChange` | `(value: string) => void` | `undefined` | Callback invoked when single selection changes. |
| `multiple` | `boolean` | `false` | Enables multiple selection mode. |
| `selectedValues` | `string[]` | `undefined` | Controlled array of values for multiple selection. |
| `onSelectedValuesChange` | `(values: string[]) => void` | `undefined` | Callback invoked when multiple selection changes. |
| `open` | `boolean` | `undefined` | Controlled open state of the popover. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback invoked when open state changes. |

### ComboboxTrigger
*(Also accepts all standard HTML `<button>` attributes).*

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `undefined` | Placeholder text for the trigger button. |
| `className` | `string` | `undefined` | Additional styling for the trigger. |

### ComboboxContent, ComboboxInput, ComboboxList, ComboboxEmpty, ComboboxGroup, ComboboxItem, ComboboxSeparator
These components act as wrappers around standard `Command` components and accept their respective props. `ComboboxItem` requires a `value` prop of type `string`.

## Variants & Examples

### Default

```tsx
import * as React from "react"
import { 
  Combobox, 
  ComboboxTrigger, 
  ComboboxContent, 
  ComboboxInput, 
  ComboboxList, 
  ComboboxEmpty, 
  ComboboxGroup, 
  ComboboxItem 
 } from "@cnma/react-ui"

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "ember", label: "Ember" },
]

export default function ComboboxDemo() {
  const [value, setValue] = React.useState("")

  return (
    <Combobox value={value} onValueChange={setValue}>
      <ComboboxTrigger placeholder="Select framework..." />
      <ComboboxContent>
        <ComboboxInput placeholder="Search frameworks..." />
        <ComboboxList>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxGroup>
            {frameworks.map((framework) => (
              <ComboboxItem key={framework.value} value={framework.value}>
                {framework.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
```

### Form Integration

Often used with react-hook-form or similar state management tools.

```tsx
// Typical wrapper within a form field
<FormField
  control={form.control}
  name="language"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Language</FormLabel>
      <Combobox value={field.value} onValueChange={field.onChange}>
        <ComboboxTrigger placeholder="Select language..." />
        <ComboboxContent>
          <ComboboxInput placeholder="Search language..." />
          <ComboboxList>
            <ComboboxEmpty>No language found.</ComboboxEmpty>
            <ComboboxGroup>
              {languages.map((language) => (
                <ComboboxItem key={language.value} value={language.value}>
                  {language.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Accessibility

- The combobox triggers a popover with a focus-trapped modal overlay.
- Search input receives focus automatically upon opening.
- Implements appropriate `aria-expanded`, `aria-controls`, and `aria-activedescendant` via `cmdk` and Radix UI primitives.
- Keyboard navigation (Arrow Up/Down, Enter, Escape) is fully supported natively.

## Design Guidelines

### Do's
- ✅ Use Combobox for lists with > 10 options, where standard Select drops usability.
- ✅ Provide a meaningful, localized `emptyMessage` to guide the user when a search fails.

### Don'ts
- ❌ Don't use Combobox for short lists (< 5 options) — use `Select` or `RadioGroup` instead.
- ❌ Don't rely solely on Combobox if adding custom, non-existent entries is required; use an autocomplete text input instead.
