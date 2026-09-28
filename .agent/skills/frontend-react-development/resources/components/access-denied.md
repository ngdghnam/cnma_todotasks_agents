# Access Denied

> A standardized full-page fallback view shown when authorization fails (e.g. 403 Forbidden).

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { AccessDenied } from "@cnma/react-ui";

<AccessDenied className="mt-4" />
```

## Props API Reference

### AccessDenied

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Optional extra class names for the container. |

## Variants & Examples

### Default Usage
```tsx
import { AccessDenied } from "@cnma/react-ui";

export default function AccessDeniedDemo() {
  return <AccessDenied />;
}
```

## Accessibility
- Contains clear semantic headings (`<h2>`) and descriptive text.
- Uses standard icons (`ShieldX`) for visual correlation.

## Design Guidelines
- **Do** render this component when an API returns a 403 Forbidden response.
- **Do** integrate this with `ErrorBoundary` to catch authorization failures at render-time.
- **Don't** use this for 404 Not Found errors.
