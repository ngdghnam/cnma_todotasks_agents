# Checkbox

> A binary control for toggling a single option on or off.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import {   Checkbox  } from "@cnma/react-ui"

export default () => (
  <Checkbox />
)
```

## Props API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `checked` | `boolean \| "indeterminate"` | - | The controlled checked state of the checkbox. |
| `defaultChecked` | `boolean` | `false` | The initial state when uncontrolled. |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | - | Callback triggered when the state changes. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `required` | `boolean` | `false` | Marks the checkbox as required for form submission validation. |
| `name` | `string` | - | The name of the input field. |

## Variants & Examples

### Basic Toggle

The Checkbox component is built on Radix UI's primitive and provides a robust boolean toggle control.

```tsx
import {  Checkbox  } from "@cnma/react-ui"
import {  Label  } from "@cnma/react-ui"

export function CheckboxDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  )
}
```

### With Additional Text

If you need a description alongside the checkbox label.

```tsx
import {  Checkbox  } from "@cnma/react-ui"
import {  Label  } from "@cnma/react-ui"

export function CheckboxWithText() {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms1" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="terms1">Accept terms and conditions</Label>
        <p className="text-sm text-muted-foreground">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
```

### Disabled State

```tsx
import {  Checkbox  } from "@cnma/react-ui"
import {  Label  } from "@cnma/react-ui"

export function CheckboxDisabled() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms2" disabled />
      <Label htmlFor="terms2" className="text-muted-foreground">
        Accept terms and conditions
      </Label>
    </div>
  )
}
```

### React Hook Form Integration

A common pattern is integrating checkboxes within a form flow.

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {  Button  } from "@cnma/react-ui"
import {  Checkbox  } from "@cnma/react-ui"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
 } from "@cnma/react-ui"

const FormSchema = z.object({
  mobile: z.boolean().default(false).optional(),
})

export function CheckboxReactHookFormMultiple() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mobile: true,
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Use different settings for my mobile devices
                </FormLabel>
                <FormDescription>
                  You can manage your mobile notifications in the mobile settings page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Accessibility

- **Keyboard Support**: Focusable via `Tab`, toggled using `Space`.
- **Screen Reader**: Proper `role="checkbox"` mapping and state announcement (`checked`, `unchecked`, or `mixed`).
- **Label Association**: Always use the native `<Label htmlFor="...">` linked to the Checkbox `id` so clicking the text toggles the checkbox and screen readers read the text.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Always pair the checkbox with a visible `<Label>` for accessibility and expanded click area. | Don't use a checkbox for mutually exclusive options — use `RadioGroup` instead. |
| Use indeterminate state (`checked="indeterminate"`) for "Select All" table headers. | Don't use checkboxes for immediate actions — use a `Switch` for live toggles/settings. |
| Stack lists of checkboxes vertically for ease of reading. | Don't place complex components inside checkbox labels. |
