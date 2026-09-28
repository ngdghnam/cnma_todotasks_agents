# Form

> A form wrapper integrating React Hook Form with Zod validation and shadcn field components.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
 } from "@cnma/react-ui"

export default () => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel />
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  </Form>
)
```

## Props API Reference

Forms rely heavily on React Hook Form.

### FormField

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | **Required** | The label text for the field. |
| `value` | `string \| number` | **Required** | The value of the field. |
| `onChange` | `(value: any) => void` | - | Callback when the value changes. |
| `type` | `"text" \| "number" \| "date"` | - | The type of the input field. |
| `variant` | `"default" \| "info" \| "success" \| "warning" \| "destructive" \| "readonly"` | - | The visual style variant of the field. |
| `disabled` | `boolean` | `false` | Whether the field is disabled. |
| `readOnly` | `boolean` | `false` | Whether the field is read-only. |
| `required` | `boolean` | `false` | Whether the field is marked as required. |
| `placeholder` | `string` | - | Placeholder text for the input. |
| `className` | `string` | - | Additional class name for the wrapper. |
| `labelClassName` | `string` | - | Additional class name for the label. |
| `layout` | `"stacked" \| "inline"` | - | Layout: 'stacked' = label on top (2 lines), 'inline' = label and input side by side (1 line). |
| `labelWidth` | `string` | - | Width of label in inline layout (e.g., '200px', '30%'). |
| `tooltip` | `string` | - | Custom tooltip text to show on hover. |
| `showTooltip` | `boolean` | - | Enable tooltip to show the field value (only works for readonly/disabled fields). |

### Components Breakdown

- `Form`: Provides the `FormProvider` context.
- `FormItem`: Container for a single field grouping (label, control, message).
- `FormLabel`: Standardized label wrapper linked to the input ID.
- `FormControl`: Wrapper around the actual input component linking aria-describedby.
- `FormDescription`: Provides helper text below or above the input.
- `FormMessage`: Handles rendering validation errors for the field.

## Variants & Examples

### Default Registration Form

```tsx
"use client"

import {  zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {  Button  } from "@cnma/react-ui"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
 } from "@cnma/react-ui"
import {  Input  } from "@cnma/react-ui"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### With Complex Controls (Checkbox)

```tsx
<FormField
  control={form.control}
  name="marketing_emails"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>
          Receive marketing emails
        </FormLabel>
        <FormDescription>
          You can turn this off at any time.
        </FormDescription>
      </div>
    </FormItem>
  )}
/>
```

## Accessibility

- **ID Generation**: `FormItem` uses `useId` to generate unique IDs for the input, mapping them automatically to `FormLabel`.
- **Aria Attributes**: `FormControl` automatically passes `aria-invalid` if an error exists, and `aria-describedby` linking to the `FormMessage` and `FormDescription`.
- **Focus Management**: React Hook Form can be configured to focus the first invalid field on submission.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use React Hook Form + Zod for all forms. | Don't manage form state manually with `useState` unless it's a very trivial single input. |
| Show `FormMessage` directly below the field for immediate feedback. | Don't show generic toasts for field validation errors; pinpoint the specific field error instead. |
| Use clear, concise `FormDescription` text for formatting requirements. | Don't hide validation rules from the user until they submit. |
