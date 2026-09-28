# Item

> A versatile list item component with icon, title, description, and action slots.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { 
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
  ItemGroup,
  ItemSeparator
 } from "@cnma/react-ui"

export default () => (
  <ItemGroup>
    <Item>
      <ItemMedia>...</ItemMedia>
      <ItemContent>
        <ItemTitle>...</ItemTitle>
        <ItemDescription>...</ItemDescription>
      </ItemContent>
      <ItemActions>...</ItemActions>
    </Item>
    <ItemSeparator />
    <Item>
      <ItemHeader>...</ItemHeader>
      <ItemFooter>...</ItemFooter>
    </Item>
  </ItemGroup>
)
```

## Props API Reference

### Item

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | - | Additional CSS classes for styling the container. |
| `variant` | `"default" \| "outline"` | `"default"` | The visual style of the item. |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | The size preset of the item. |
| `asChild` | `boolean` | `false` | Merges props onto child element instead of rendering a `<div>`. |

### Component Breakdown

- `ItemGroup`: A container for grouping multiple `Item` components.
- `Item`: The root flex-box container ensuring standard spacing and alignment.
- `ItemSeparator`: A divider between items in a list.
- `ItemMedia`: A slot intended for avatars, images or Lucide icons, fixing them to standard dimensions.
- `ItemContent`: The text wrapper that stacks title and description vertically.
- `ItemTitle`: The primary label text.
- `ItemDescription`: Secondary information text, rendered in a muted color.
- `ItemActions`: A right-aligned slot intended for actions (like a Chevron, switch, or button).
- `ItemHeader`: Top section of an item for complex layouts.
- `ItemFooter`: Bottom section of an item for complex layouts.

## Variants & Examples

### User Profile Item

Combining an Avatar with text and an action button to simulate a user list.

```tsx
import {  User, ChevronRight } from "lucide-react"
import {  Button  } from "@cnma/react-ui"
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
 } from "@cnma/react-ui"

export function UserItemDemo() {
  return (
    <Item className="rounded-lg border p-4 shadow-sm">
      <ItemMedia>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <User className="h-5 w-5" />
        </div>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>John Doe</ItemTitle>
        <ItemDescription>Engineering Manager</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </ItemActions>
    </Item>
  )
}
```

### Settings Toggle Item

Pairing an `Item` with a `Switch` for a settings panel.

```tsx
import {  Bell } from "lucide-react"
import {  Switch  } from "@cnma/react-ui"
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
 } from "@cnma/react-ui"

export function SettingsItemDemo() {
  return (
    <Item className="py-3">
      <ItemMedia>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Push Notifications</ItemTitle>
        <ItemDescription>Receive alerts when your mentions are replied to.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch />
      </ItemActions>
    </Item>
  )
}
```

## Accessibility

- **Interactive Elements**: If the entire `Item` acts as a button or link, wrap it in the appropriate semantic tags (`<a>` or `<button>`) and manage `aria-labels` carefully. Avoid putting interactive elements inside an `Item` that is itself interactive, as nested active elements cause screen reader conflicts.
- **Reading Order**: The DOM order is visually and semantically logical: Icon -> Content -> Action.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use `Item` to rapidly build consistent lists inside `Card` or popovers. | Don't overcrowd the `ItemActions` slot with too many buttons. Limit to 1 or 2 primary actions. |
| Use `ItemDescription` for secondary, clarifying context. | Don't put large paragraphs of text in the `ItemDescription` — it is meant for 1-2 lines. |
| Ensure icon sizes in `ItemMedia` remain consistent (e.g., standardizing on 4x4 rem or Lucide default sizes). | Don't nest lists of `Item` components deeply without using appropriate `ul`/`li` semantics wrapper. |
