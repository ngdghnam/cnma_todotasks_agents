# Token

> A removable tag/chip component for displaying selected values with a close button.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Token>
  <span className="token-label">
    {/* Content */}
  </span>
  <button className="token-remove-button">
    <XIcon />
  </button>
</Token>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The content displayed inside the token. |
| `onRemove` | `(event: React.MouseEvent) => void` | — | Callback fired when the remove button is clicked. |
| `removable`| `boolean` | — | Explicitly sets whether the token should display a remove button. |
| `className`| `string` | — | Optional CSS classes for custom styling. |

*(Inherits all `<span />` standard HTML attributes).*

## Variants & Examples

### Default (Removable)
```tsx
import {  Token  } from "@cnma/react-ui";

<Token onRemove={() => console.log("Removed React")}>
  React
</Token>
```

### Read-only
```tsx
<Token>
  TypeScript
</Token>
```

### Group of Tokens
```tsx
<div className="flex flex-wrap gap-2">
  {["Design", "Engineering", "Marketing"].map(dept => (
    <Token key={dept} onRemove={() => handleRemove(dept)}>
      {dept}
    </Token>
  ))}
</div>
```

## Accessibility

- **Keyboard:** 
  - The remove button receives focus via `Tab`.
  - Pressing `Enter` or `Space` on the remove button triggers the `onRemove` callback.
- **Roles & Attributes:**
  - The remove button has an `aria-label` like "Remove {content}" to announce its purpose.

## Design Guidelines

### Do's
- Use Token for selected values in MultiSelect inputs or filter bars.
- Provide a clear `onRemove` action for interactive tokens.

### Don'ts
- Don't use Token for status indicators or static labels — use `Badge` or `StatusBadge` instead.
- Don't overload a limited space with too many tokens; use an overflow or "Truncate" mechanism.
