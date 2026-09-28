# Error Boundary

> A top-level React error boundary wrapper that catches render-time crashes and handles 403 Forbidden errors automatically.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { ErrorBoundary } from "@cnma/react-ui";

<ErrorBoundary>
  <YourAppOrComponent />
</ErrorBoundary>
```

## Props API Reference

### ErrorBoundary

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | **Required** | The child components to render and monitor for errors. |

## Variants & Examples

### Wrapping an Application
```tsx
import { ErrorBoundary } from "@cnma/react-ui";
import { AppContent } from "./AppContent";

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
```

## Accessibility
- Fallback UI provides clear text explaining the failure.
- Includes a primary button allowing the user to refresh the page to attempt recovery.

## Design Guidelines
- **Do** place `ErrorBoundary` high up in your component tree (e.g. near routing) to prevent the entire app from crashing white.
- **Do** rely on its built-in detection for 403 errors (it automatically renders `AccessDenied` if the error status implies it).
- **Don't** wrap every individual small component with this, as it acts as a page-level or section-level fallback.
