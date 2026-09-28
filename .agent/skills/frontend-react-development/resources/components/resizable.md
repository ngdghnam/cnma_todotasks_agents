# Resizable

> A layout component with draggable dividers for resizable panes.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```html
<div class="flex h-full w-full">
  <!-- leftPanel content -->
  <div>...</div>
  <!-- Resizable drag handle -->
  <div class="relative w-1 cursor-col-resize ..."></div>
  <!-- rightPanel content -->
  <div>...</div>
</div>
```

## Props API Reference

### ResizablePanel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftPanel` | `React.ReactNode` | **Required** | The content to render in the left pane. |
| `rightPanel` | `React.ReactNode` | **Required** | The content to render in the right pane. |
| `initialLeftWidth` | `number` | — | The initial width of the left panel in pixels. |
| `minLeftWidth` | `number` | — | The minimum width of the left panel in pixels. |
| `maxLeftWidth` | `number` | — | The maximum width of the left panel in pixels. |
| `className` | `string` | — | Additional CSS classes for the container. |
| `onResize` | `(leftWidth: number) => void` | — | Callback fired when the panel is resized. |

### ResizablePanelGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS classes. |
| `...props` | `React.ComponentProps<typeof Group>` | — | Standard props from `react-resizable-panels`. |

### ResizableHandle

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `withHandle` | `boolean` | `false` | Whether to display a visual drag grip indicator on the handle. |
| `className` | `string` | — | Additional CSS classes for the handle. |

## Variants & Examples

### Default
```tsx
import {   ResizablePanel  } from "@cnma/react-ui";

export default function ResizableDemo() {
  return (
    <ResizablePanel
      initialLeftWidth={300}
      minLeftWidth={200}
      maxLeftWidth={500}
      leftPanel={
        <div className="flex h-full items-center justify-center p-6 bg-muted">
          <span className="font-semibold">Sidebar</span>
        </div>
      }
      rightPanel={
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Main Content</span>
        </div>
      }
    />
  );
}
```

### Advanced Layouts with react-resizable-panels

If you need a more advanced layout (e.g. multiple splits or vertical splits), you can still use the underlying components from `react-resizable-panels`:

```tsx
import {
  ResizablePanelGroup,
  ResizableHandle,
 } from "@cnma/react-ui";
import { Panel } from "react-resizable-panels";

export default function AdvancedResizableDemo() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <Panel defaultSize={20} minSize={10}>
        <div>Sidebar</div>
      </Panel>
      <ResizableHandle withHandle />
      <Panel defaultSize={80}>
        <div>Main Content</div>
      </Panel>
    </ResizablePanelGroup>
  );
}
```

## Accessibility

- The handle acts as a separator and is keyboard-navigable.
- Arrow keys can be used to resize panels when the handle is focused.
- `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` are dynamically managed to reflect pane sizes.

## Design Guidelines

- **Do** use `withHandle` if you want to provide an explicit visual cue (a grip icon) that the separator is draggable.
- **Do** set reasonable `minSize` constraints so panels cannot become unreadably small.
- **Don't** over-nest Resizable groups unless strictly necessary, as it can confuse the user's mental model of the layout.
