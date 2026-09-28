# Pagination

> Navigation controls for browsing through multi-page content.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<nav role="navigation" aria-label="pagination" class="mx-auto flex w-full justify-center">
  <ul class="flex flex-row items-center gap-1">
    <li>
      <a aria-label="Go to previous page" class="..." href="#">
        <svg><!-- ChevronLeft --></svg>
        <span>Previous</span>
      </a>
    </li>
    <li>
      <a aria-current="page" class="..." href="#">1</a>
    </li>
    <li>
      <a class="..." href="#">2</a>
    </li>
    <li>
      <span aria-hidden="true" class="flex h-9 w-9 items-center justify-center">
        <svg><!-- MoreHorizontal --></svg>
        <span class="sr-only">More pages</span>
      </span>
    </li>
    <li>
      <a aria-label="Go to next page" class="..." href="#">
        <span>Next</span>
        <svg><!-- ChevronRight --></svg>
      </a>
    </li>
  </ul>
</nav>
```

## Props API Reference

### PaginationLink

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isActive` | `boolean` | `false` | Applies the active state styling to the link and adds `aria-current="page"`. |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"icon"` | The size of the pagination link. |
| `href` | `string` | — | The URL to navigate to when clicked. |

### PaginationPrevious

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | The URL for the previous page. |
| `className` | `string` | — | Additional CSS classes. |

### PaginationNext

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | The URL for the next page. |
| `className` | `string` | — | Additional CSS classes. |

### PaginationEllipsis

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes. |

## Variants & Examples

### Default
```tsx
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
 } from "@cnma/react-ui";

export default function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

## Accessibility

- The root element is a `<nav>` with `role="navigation"` and `aria-label="pagination"`.
- The active page indicator uses `aria-current="page"`.
- `PaginationPrevious` and `PaginationNext` controls have appropriate `aria-label`s for screen readers.
- `PaginationEllipsis` uses `aria-hidden="true"` on the visual dots, but includes a screen-reader-only text (e.g., "More pages").

## Design Guidelines

- **Do** use pagination for large datasets where lazy loading (infinite scroll) is not appropriate.
- **Do** highlight the current page distinctly to provide users context of where they are.
- **Don't** show more than 5-7 individual page links at once to prevent horizontal overflow; use ellipses to truncate.
- **Don't** disable the Previous/Next buttons if they represent dead ends; instead, remove them or render them as visually disabled and prevent interaction.
