# Card

> A container component for grouping related content with a consistent visual boundary.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Card>
  <CardHeader>
    <CardTitle />
    <CardDescription />
    <CardAction />
  </CardHeader>
  <CardContent />
  <CardFooter />
</Card>
```

## Props API Reference

### Card

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | — | Additional CSS classes to apply to the root container. |
| `children` | `React.ReactNode` | — | Content to render within the card. |

### CardHeader

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | — | Uses CSS Grid layout; automatically accommodates an action column when `CardAction` is present. |
| `children` | `React.ReactNode` | — | Content, typically `CardTitle`, `CardDescription`, and `CardAction`. |

### CardTitle

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | — | Additional CSS classes. Renders as an `<h3>` or `<h4>` by default. |

### CardDescription

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | — | Additional CSS classes for the muted subtitle text. |

### CardAction

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | — | Positioned at the top-right of the `CardHeader`, spanning both rows. |

### CardContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | — | Main content area with built-in horizontal and bottom padding. |

### CardFooter

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | — | Flex layout, primarily for action buttons at the bottom of the card. |

## Variants & Examples

### Basic

```tsx
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
 } from "@cnma/react-ui"

export function CardDemo() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <button>Cancel</button>
        <button>Deploy</button>
      </CardFooter>
    </Card>
  )
}
```

### With Action Button

```tsx
import {   Button  } from "@cnma/react-ui"
import { MoreHorizontal } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
 } from "@cnma/react-ui"

export function CardWithAction() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
        <CardDescription>Manage your purchase orders</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>List of recent orders.</p>
      </CardContent>
    </Card>
  )
}
```

### Dashboard KPI Card

```tsx
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
 } from "@cnma/react-ui"

export function DashboardCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$45,231.89</div>
        <p className="text-xs text-muted-foreground">
          +20.1% from last month
        </p>
      </CardContent>
    </Card>
  )
}
```

## Accessibility

- Cards themselves are typically just presentational containers (like `<div>` or `<section>`) and are not natively focusable.
- Ensure any interactive elements inside the card (buttons, links) are fully accessible via keyboard (`Tab` / `Space` / `Enter`).
- `CardTitle` usually maps to heading elements (`<h3>` or `<h4>`), which establishes a clear document outline for screen readers.

## Design Guidelines

### ✅ Do
- Use neutral card styles for dashboards.
- Maintain consistent spacing (e.g., `gap-4` or `p-4`) between cards in a grid or flex layout.
- Use `CardAction` for overflow menus or secondary actions that apply to the whole card.
- Let cards fill available width on data-driven pages for optimal responsiveness.

### ❌ Don't
- Don't create "Rainbow Dashboards" with arbitrary colored borders or heavy background colors.
- Don't let cards touch each other or the page boundary without padding.
- Don't crowd the `CardHeader` with too many buttons. If there are more than two actions, use an overflow menu (Dropdown).
- Don't apply fixed maximum widths (`max-w-*`) on cards in list reports or object pages unless specifically intended as a narrow widget.
