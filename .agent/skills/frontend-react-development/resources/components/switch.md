# Switch

> A toggle control for switching between two states (on/off).

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as SwitchPrimitive from "@radix-ui/react-switch"

<SwitchPrimitive.Root>
  <SwitchPrimitive.Thumb />
</SwitchPrimitive.Root>
```

## Props API Reference

| Prop               | Type                           | Default | Description                                            |
| ------------------ | ------------------------------ | ------- | ------------------------------------------------------ |
| `checked`          | `boolean`                      | `false` | The controlled state of the switch.                    |
| `defaultChecked`   | `boolean`                      | `false` | The default state when initially rendered (uncontrolled). |
| `onCheckedChange`  | `(checked: boolean) => void`   | `undefined` | Callback invoked when the state of the switch changes. |
| `disabled`         | `boolean`                      | `false` | When true, prevents the user from interacting with the switch. |
| `required`         | `boolean`                      | `false` | When true, indicates that the user must check the switch before the owning form can be submitted. |
| `name`             | `string`                       | `undefined` | The name of the switch. Submitted with its owning form as part of a name/value pair. |
| `value`            | `string`                       | `"on"`  | The value given as data when submitted with a `name`.  |
| `className`        | `string`                       | `undefined` | Additional styling classes.                            |

## Variants & Examples

### Default

```tsx
import {  Label  } from "@cnma/react-ui"
import {  Switch  } from "@cnma/react-ui"

export default function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  )
}
```

### Controlled

```tsx
import * as React from "react"
import {  Switch  } from "@cnma/react-ui"

export default function SwitchControlled() {
  const [enabled, setEnabled] = React.useState(false)

  return (
    <Switch checked={enabled} onCheckedChange={setEnabled} />
  )
}
```

### Disabled

```tsx
import {  Switch  } from "@cnma/react-ui"

export default function SwitchDisabled() {
  return <Switch disabled id="disabled-switch" />
}
```

## Accessibility

- Requires an associated label for screen readers. Use the `Label` component with matching `htmlFor` and `id`.
- Handled natively by Radix UI primitive to provide `role="switch"` and `aria-checked` states.
- Fully supports keyboard navigation (toggle with `Space` key).

## Design Guidelines

### Do's
- ✅ Use Switch for settings or preferences that take effect immediately when toggled.
- ✅ Place the label to the right (or left) of the switch consistently.
- ✅ Use positive wording for labels (e.g., "Enable notifications").

### Don'ts
- ❌ Don't use a Switch in forms that require a distinct "Submit" button; use a Checkbox instead.
- ❌ Don't use negative labels (e.g., "Disable notifications" turned off).
