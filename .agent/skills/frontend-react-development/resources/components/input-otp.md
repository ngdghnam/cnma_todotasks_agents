# Input OTP

> A specialized input for one-time password codes with auto-advancing segments.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
 } from "@cnma/react-ui"

export default () => (
  <InputOTP maxLength={6}>
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </InputOTP>
)
```

## Props API Reference

### InputOTP

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxLength` | `number` | **Required** | The maximum number of digits allowed. |
| `value` | `string` | - | Controlled value of the OTP input. |
| `onChange` | `(value: string) => void` | - | Callback when the value changes. |
| `render` | `function` | - | Custom render function if overriding slot behavior. |
| `containerClassName` | `string` | - | Additional class name for the input container. |

### InputOTPSlot

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `index` | `number` | **Required** | The index corresponding to this slot position (0-based). |

## Variants & Examples

### Default

A standard 6-digit OTP input split into two groups of three.

```tsx
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
 } from "@cnma/react-ui"

export function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
```

### Controlled with Forms

Integrates smoothly with React Hook Form and Zod for validation.

```tsx
"use client"

import {  zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
 } from "@cnma/react-ui"

const FormSchema = z.object({
  pin: z.string().min(4, {
    message: "Your one-time password must be 4 characters.",
  }),
})

export function InputOTPForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: "" },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={4} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the one-time password sent to your phone.
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

## Accessibility

- **Keyboard**: Handles `Backspace` cleanly to jump backwards. `ArrowLeft` and `ArrowRight` move through filled inputs.
- **Copy & Paste**: Automatically handles pasting a full code. Supports native OS SMS code suggestions.
- **Screen Reader**: Slots act as a cohesive input unit ensuring context isn't lost on screen readers.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Match `maxLength` exactly to your expected code length. | Don't construct OTP fields using 6 separate standard `<Input />` elements. |
| Use an `InputOTPSeparator` for readability if the code is longer than 4 digits. | Don't use `InputOTP` for passwords or sensitive strings that shouldn't be visible (use `<Input type="password" />`). |
| Automatically submit the form when the OTP is fully filled (if appropriate for the flow). | Don't disable paste functionality. |
