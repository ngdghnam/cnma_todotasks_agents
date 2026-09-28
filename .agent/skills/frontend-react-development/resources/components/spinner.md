# Spinner

> An animated loading indicator for inline or button loading states.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Spinner>
  <svg>
    <path />
  </svg>
</Spinner>
```

## Props API Reference

| Prop        | Type                                                                          | Default | Description                                              |
| ----------- | ----------------------------------------------------------------------------- | ------- | -------------------------------------------------------- |
| `className` | `string`                                                                      | —       | Override default styles, including size and color.       |
| `variant`   | `"default" \| "destructive" \| "success" \| "warning" \| "primary" \| "muted"`| —       | The color variant of the spinner.                        |
| `size`      | `"default" \| "sm" \| "md" \| "lg"`                                           | —       | Dimensions of the spinner.                               |

*(Inherits all `<svg>` props).*

## Variants & Examples

### Default
```tsx
import {  Spinner  } from "@cnma/react-ui";

<Spinner />
```

### In a Button
```tsx
import {  Button  } from "@cnma/react-ui";
import {  Spinner  } from "@cnma/react-ui";

<Button disabled>
  <Spinner className="mr-2" />
  Saving...
</Button>
```

### Custom Size & Color
```tsx
<Spinner className="size-8 text-primary" />
```

## Accessibility

- **Roles & Attributes:** Contains `role="status"` and `aria-label="Loading"` by default.
- **Screen Readers:** Announces the loading status effectively if the label is provided.

## Design Guidelines

### Do's
- Use the Spinner component for inline loading states or inside buttons.
- Keep the Spinner size consistent with adjacent text or icons (e.g., inside a button, match the icon size).

### Don'ts
- Don't use a Spinner for full-page loading transitions; consider a Skeleton or a larger layout loader instead.
- Don't omit an `aria-label` or accessible text if the Spinner is the only visual indicator on screen.
