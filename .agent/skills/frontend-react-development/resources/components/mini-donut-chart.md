# Mini Donut Chart

> A lightweight SVG-based donut chart component used internally by `StatCard` but exposed for custom integrations.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { MiniDonutChart } from "@cnma/react-ui";

<MiniDonutChart
  value={75}
  total={100}
  themeColor="#3b82f6"
  trackColor="#e5e7eb"
/>
```

## Props API Reference

### MiniDonutChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | **Required** | The current value to represent. |
| `total` | `number` | **Required** | The total maximum value for the chart. |
| `themeColor` | `string` | **Required** | The primary stroke color for the active part of the donut. |
| `trackColor` | `string` | **Required** | The stroke color for the background track. |
| `segments` | `StatSegment[]` | — | Optional array of segments for a multi-colored donut. |
| `size` | `number` | `52` | The width and height of the SVG. |
| `strokeWidth` | `number` | `5` | The thickness of the donut stroke. |

## Variants & Examples

### Multi-segment Donut
```tsx
import { MiniDonutChart } from "@cnma/react-ui";

export default function DonutDemo() {
  const segments = [
    { value: 30, color: "green" },
    { value: 20, color: "red" }
  ];
  return (
    <MiniDonutChart
      value={0} // Ignored when segments are provided
      total={100}
      themeColor="transparent"
      trackColor="#ccc"
      segments={segments}
    />
  );
}
```

## Accessibility
- It's a purely visual SVG element. It should be accompanied by readable text (like the `value` in the `StatCard`) for screen readers.

## Design Guidelines
- **Don't** use this as a standalone primary chart for large data sets. It is specifically designed as a micro-visualization (`52px` by default).
