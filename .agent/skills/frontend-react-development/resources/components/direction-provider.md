# Direction Provider

> A thin wrapper around Radix UI's DirectionProvider to establish text direction (LTR or RTL) for all nested components, essential for i18n support.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { DirectionProvider } from "@cnma/react-ui";

<DirectionProvider dir="rtl">
  <App />
</DirectionProvider>
```

## Props API Reference

### DirectionProvider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dir` / `direction` | `'ltr' \| 'rtl'` | — | **Required**. Sets the reading direction for all nested Radix primitives. |
| `children` | `React.ReactNode` | — | The application or component subtree. |

### Hooks
- `useDirection()`: Returns the current direction context (`"ltr"` or `"rtl"`).

## Accessibility
- Informs Radix primitives of the document direction so keyboard navigation (like Left/Right arrows in dropdowns or carousels) behaves correctly for RTL languages.

## Design Guidelines
- **Do** place this near the root of your application, wrapping all UI components.
