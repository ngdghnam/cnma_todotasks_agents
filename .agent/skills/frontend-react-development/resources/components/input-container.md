# Input Container

> A `div`-based component that visually mimics standard text inputs. Used as a container for complex composite components like multi-select dropdowns or tokens where a native `<input>` cannot wrap other DOM elements.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { InputContainer } from "@cnma/react-ui";

<InputContainer isOpen={false} variant="default">
  <span className="text-sm">Inner text or tokens</span>
</InputContainer>
```

## Props API Reference

### InputContainer

*Extends standard `div` props and `Input` variants.*

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Simulates a focused state (prominent border) when a dropdown/popover attached to it is open. |
| `disabled` | `boolean` | `false` | Applies disabled styling and sets `aria-disabled`. |
| `readOnly` | `boolean` | `false` | Applies read-only styling and sets `aria-readonly`. |
| `variant` | `'default' \| 'readonly' \| 'info' \| 'success' \| 'warning' \| 'destructive'` | `'default'` | Visual variant. Matches exactly the variants available on the standard `Input`. |
| `children` | `React.ReactNode` | — | The nested DOM elements (e.g. tokens, icons) |

## Variants & Examples

### Standard Composite Setup
```tsx
import { InputContainer, Token } from "@cnma/react-ui";

export default function InputContainerDemo() {
  return (
    <InputContainer isOpen={true}>
      <div className="flex gap-1 items-center flex-wrap">
        <Token>Approved</Token>
        <Token>Pending</Token>
        <input className="outline-none bg-transparent flex-1 min-w-[50px]" />
      </div>
    </InputContainer>
  );
}
```

## Accessibility
- Because it is a `div`, it applies `aria-disabled` and `aria-readonly` automatically.
- **Important**: Any actual accessibility logic (like `role="combobox"`, `aria-expanded`) must be applied by the parent component using this container.

## Design Guidelines
- **Do** use this when building custom comboboxes or token inputs to ensure exact Fiori styling matches native text inputs.
- **Don't** use this when a native `<input>` or `<Select>` suffices.
