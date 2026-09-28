# Skeleton

> A placeholder loading animation that mimics the shape of content being loaded.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Skeleton className="h-[20px] w-[100px] rounded-full" />
```

## Props API Reference

### Skeleton
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Use to set dimensions and shape (e.g., `h-4 w-[200px] rounded-full`). Will merge with default animation classes. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | — | Standard HTML div attributes. |

## Variants & Examples

### Default

```tsx
import {  Skeleton  } from "@cnma/react-ui"

export function SkeletonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
```

### Card Layout

```tsx
import {  Skeleton  } from "@cnma/react-ui"

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
```

## Accessibility

- **ARIA roles:**
  - Skeletons are decorative by default. If a skeleton is indicating a loading state for an entire area, ensure the parent container has `aria-busy="true"` or use `aria-live` regions appropriately to notify screen reader users of the loading state.
- **Animations:**
  - Consider respecting the user's `prefers-reduced-motion` system preference by disabling the pulsing animation if requested.

## Design Guidelines

### ✅ Do
- Match the skeleton's dimensions, margins, and shape as closely as possible to the final content it replaces.
- Use skeletons for content areas (cards, tables, text blocks) that take time to load, providing a better UX than spinners for layout-heavy pages.
- Group multiple skeletons to resemble lists or grids if that is the final layout.

### ❌ Don't
- Don't use a single large rectangular skeleton to cover an entire complex layout; break it down into smaller constituent shapes.
- Don't use skeletons for button loading states or small inline actions — use a `Spinner` instead.
