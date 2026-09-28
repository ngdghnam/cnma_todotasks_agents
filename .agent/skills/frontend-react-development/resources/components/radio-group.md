# Radio Group

> A set of mutually exclusive options where only one can be selected at a time.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<RadioGroup>
  <RadioGroupItem />
</RadioGroup>
```

## Props API Reference

### RadioGroup

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `defaultValue` | `string` | — | The value of the radio item that should be checked when initially rendered. Use when you do not need to control the state of the radio group. |
| `value` | `string` | — | The controlled value of the radio item to check. Should be used in conjunction with `onValueChange`. |
| `onValueChange` | `(value: string) => void` | — | Event handler called when the value changes. |
| `disabled` | `boolean` | `false` | When `true`, prevents the user from interacting with radio items. |
| `name` | `string` | — | The name of the group. Submitted with its owning form as part of a name/value pair. |
| `required` | `boolean` | `false` | When `true`, indicates that the user must check a radio item before the owning form can be submitted. |
| `orientation` | `'horizontal' | 'vertical' | undefined` | `undefined` | The orientation of the component. |
| `dir` | `'ltr' | 'rtl'` | `'ltr'` | The reading direction of the radio group. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode. |
| `loop` | `boolean` | `true` | When `true`, keyboard navigation will loop from last item to first, and vice versa. |

### RadioGroupItem

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `value` | `string` | **Required** | The value given as data when submitted with a `name`. |
| `disabled` | `boolean` | `false` | When `true`, prevents the user from interacting with the radio item. |
| `required` | `boolean` | `false` | When `true`, indicates that the user must check the radio item before the owning form can be submitted. |

## Variants & Examples

### Default

```tsx
import {  Label  } from "@cnma/react-ui"
import {  RadioGroup, RadioGroupItem  } from "@cnma/react-ui"

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  )
}
```

### Disabled

```tsx
import {  Label  } from "@cnma/react-ui"
import {  RadioGroup, RadioGroupItem  } from "@cnma/react-ui"

export function RadioGroupDisabled() {
  return (
    <RadioGroup disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
    </RadioGroup>
  )
}
```

## Accessibility

Adheres to the [Radio Group WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radiobutton/).

### Keyboard Interactions

| Key | Description |
| :--- | :--- |
| `Tab` | Moves focus to either the checked radio item or the first radio item in the group. |
| `Space` | When focus is on an unchecked radio item, checks it. |
| `ArrowDown` | Moves focus and checks the next radio item in the group. |
| `ArrowRight` | Moves focus and checks the next radio item in the group. |
| `ArrowUp` | Moves focus and checks the previous radio item in the group. |
| `ArrowLeft` | Moves focus and checks the previous radio item in the group. |

## Design Guidelines

### ✅ Do
- Use for 2-5 mutually exclusive options shown at once.
- Always pair each `RadioGroupItem` with a `Label`.
- Provide a sensible default value whenever possible.
- Keep the list of options short and concise.

### ❌ Don't
- Don't use for > 5 options — use a Select dropdown instead to save space.
- Don't use radio buttons for multi-select — use Checkbox instead.
- Don't leave a radio group without a default selection if an initial state makes sense for the user context.
