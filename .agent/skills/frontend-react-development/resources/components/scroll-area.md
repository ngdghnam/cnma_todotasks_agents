# Scroll Area

> A customizable scrollable container with styled scrollbars.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import {  ScrollArea, ScrollBar  } from "@cnma/react-ui"

export default () => (
  <ScrollArea>
    {/* Content */}
    <ScrollBar orientation="vertical" />
  </ScrollArea>
)
```

## Props API Reference

### ScrollArea

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `"auto" \| "always" \| "scroll" \| "hover"` | `"hover"` | Determines how the scrollbar is displayed. |
| `scrollHideDelay` | `number` | `600` | Delay in ms before scrollbar is hidden if `type` is `"hover"`. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | The reading direction. |

### ScrollBar

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | The orientation of the scrollbar. |

## Variants & Examples

### Default (Vertical Scrolling)

A standard vertical scroll area with a max-height.

```tsx
import {  ScrollArea  } from "@cnma/react-ui"

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

export function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-[200px] w-48 rounded-md border p-4">
      <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
      {tags.map((tag) => (
        <div key={tag} className="text-sm">
          {tag}
          <div className="my-2 border-t" />
        </div>
      ))}
    </ScrollArea>
  )
}
```

### Horizontal Scrolling

You can enable horizontal scrolling by including a `<ScrollBar orientation="horizontal" />`.

```tsx
import {  ScrollArea, ScrollBar  } from "@cnma/react-ui"
import {  Card  } from "@cnma/react-ui"

const items = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: `Item ${i + 1}`,
}))

export function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea className="w-[400px] rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {items.map((item) => (
          <Card key={item.id} className="w-[150px] p-4 shadow-sm">
            {item.title}
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
```

## Accessibility

- **Keyboard Support**: Native scrolling behavior works correctly with keyboard arrows or page up/down when the inner content is focused.
- **Scroll Thumbs**: Cross-browser styling ensures that scrollbars maintain contrast and visibility metrics.
- **RTL Support**: Handles right-to-left scrolling semantics automatically when `dir="rtl"` is provided.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use `ScrollArea` for customized, non-intrusive scrollbars across browsers. | Don't use `ScrollArea` on the primary `body` or `html` elements. Let the browser handle page-level scrolling. |
| Constrain the `ScrollArea` size explicitly with `h-*` or `w-*` so it doesn't expand infinitely. | Don't nest scroll areas deeply, which can cause "scroll trapping" where users struggle to scroll the outer container. |
| Use horizontal scroll areas for rows of cards or tags to preserve vertical rhythm. | Don't hide the scrollbar (`type="always"`) if users need obvious visual cues that content is scrollable. |
