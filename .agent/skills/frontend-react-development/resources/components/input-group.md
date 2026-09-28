# Input Group

> An input field with prefix/suffix addons for context (icons, text, buttons).

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as React from "react"
import {  Input  } from "@cnma/react-ui"

<InputGroup>
  <InputGroupAddon>
    {/* text, icon, or button */}
  </InputGroupAddon>
  <InputGroupInput />
  <InputGroupAddon>
    {/* text, icon, or button */}
  </InputGroupAddon>
</InputGroup>
```

## Props API Reference

*(Note: `InputGroup`, `InputGroupAddon`, and `InputGroupInput` are currently not exported from `@cnma/react-ui`. You may need to use `InputContainer` or standard `Input` components instead.)*

## Variants & Examples

*(No examples available as the component is not implemented in the UI library.)*

## Accessibility

- When adding a text prefix (e.g., currency symbols, protocols), ensure the input has an appropriate `aria-label` or visible `<Label>`.
- If an icon is purely decorative, add `aria-hidden="true"` to the SVG.
- Buttons inside an `InputGroupAddon` should be fully reachable by keyboard navigation.

## Design Guidelines

### Do's
- ✅ Use addons to provide explicit context to data types (e.g., `.com`, `https://`, `$`).
- ✅ Use icon prefixes for recognizable search or filtering inputs.

### Don'ts
- ❌ Don't overcrowd an input with multiple prefixes and suffixes if simpler validation or helper text would suffice.
