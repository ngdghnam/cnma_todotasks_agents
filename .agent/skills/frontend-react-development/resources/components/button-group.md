# Button Group

> A container that visually groups related buttons into a single connected unit.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<ButtonGroup>
  <Button>Option 1</Button>
  <ButtonGroupSeparator />
  <Button>Option 2</Button>
  <ButtonGroupText>Label</ButtonGroupText>
</ButtonGroup>
```

## Props API Reference

### ButtonGroup
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction of the grouped items. |
| `className` | `string` | — | Additional CSS classes for styling. |

### ButtonGroupText
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Render as a child element. |
| `className` | `string` | — | Additional CSS classes for styling. |

### ButtonGroupSeparator
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Separator direction. Typically opposite to the group's orientation. |
| `className` | `string` | — | Additional CSS classes for styling. |

## Variants & Examples

### Horizontal (Default)

```tsx
import {  ButtonGroup  } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"

export function ButtonGroupDemo() {
  return (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  )
}
```

### With Separator

```tsx
import {  ButtonGroup, ButtonGroupSeparator  } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"
import { ChevronDown } from "lucide-react"

export function ButtonGroupSplit() {
  return (
    <ButtonGroup>
      <Button>Save Options</Button>
      <ButtonGroupSeparator />
      <Button variant="default" size="icon">
        <ChevronDown className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  )
}
```

### With Text Addon

```tsx
import {  ButtonGroup, ButtonGroupText  } from "@cnma/react-ui"
import {  Input  } from "@cnma/react-ui"

export function ButtonGroupAddon() {
  return (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <Input placeholder="example.com" className="rounded-l-none" />
    </ButtonGroup>
  )
}
```

### Vertical

```tsx
import {  ButtonGroup  } from "@cnma/react-ui"
import {  Button  } from "@cnma/react-ui"

export function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  )
}
```

## Accessibility

- **Keyboard interactions:**
  - Focus moves through standard `Tab` order. 
- **ARIA roles:**
  - Group is given `role="group"` to inform screen readers that these controls are related.
  - Provide an `aria-label` to the `ButtonGroup` if the grouping context is not clear from the surrounding content.

## Design Guidelines

### ✅ Do
- Group functionally related buttons together.
- Use an appropriate variant (e.g., `outline` or `ghost`) for grouped buttons so they don't visually overwhelm the UI, unless a primary split button is intended.
- Ensure all grouped buttons share the same size.

### ❌ Don't
- Don't use `ButtonGroup` for mutually exclusive selections where only one item can be active; use `ToggleGroup` or `RadioGroup` instead.
- Don't group unrelated actions; they should be separate buttons with adequate spacing.
