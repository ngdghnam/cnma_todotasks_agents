# Breadcrumb

> A navigation aid showing the user's current location within a hierarchy.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as React from "react"
import {  Slot } from "@radix-ui/react-slot"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <a href="...">...</a>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>...</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Props API Reference

### Breadcrumb
*(Accepts all standard HTML `<nav>` attributes).*

### BreadcrumbLink
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | Merges props onto its immediate child. Useful for routing frameworks like Next.js `Link`. |
| `href` | `string` | `undefined` | The URL the link points to. |

### BreadcrumbPage
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `undefined` | Additional styling for the current page label. |

### BreadcrumbSeparator
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `undefined` | Custom icon or text for the separator. |

## Variants & Examples

### Default

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
 } from "@cnma/react-ui"

export default function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### With Custom Separator

```tsx
import {  Slash } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
 } from "@cnma/react-ui"

export default function BreadcrumbCustomSeparator() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### Collapsed with Ellipsis

```tsx
import { 
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
 } from "@cnma/react-ui"

export default function BreadcrumbCollapsed() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Active</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

## Accessibility

- Root `Breadcrumb` element renders a `<nav>` with `aria-label="breadcrumb"` automatically.
- Separators have `aria-hidden="true"` and `role="presentation"` so they are ignored by screen readers.
- `BreadcrumbPage` renders with `aria-current="page"` and `role="link"` for the active item.
- Keyboard focus is properly managed for interactive links.

## Design Guidelines

### Do's
- ✅ Display breadcrumbs at the top of the content area, ideally below primary navigation.
- ✅ Always provide a path back to the application's root/home page.
- ✅ Use the `BreadcrumbEllipsis` to truncate long paths (more than 4-5 items).

### Don'ts
- ❌ Don't use breadcrumbs as a replacement for primary navigation.
- ❌ Don't make the current page (last item) an interactive link.
