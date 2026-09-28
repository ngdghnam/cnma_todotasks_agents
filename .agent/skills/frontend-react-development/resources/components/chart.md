# Chart

> Data visualization components for bar charts, line charts, area charts, and pie charts.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import {  ChartContainer, ChartTooltip, ChartLegend  } from "@cnma/react-ui"
import { BarChart, Bar } from "recharts"

<ChartContainer config={chartConfig}>
  <BarChart data={chartData}>
    {/* Recharts primitives */}
    <ChartTooltip />
    <ChartLegend />
    <Bar />
  </BarChart>
</ChartContainer>
```

## Props API Reference

### ChartContainer
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `config` | `ChartConfig` | **Required** | Object mapping data keys to labels, colors, and icons. |
| `children` | `React.ReactElement` | **Required** | The Recharts component. |
| `className` | `string` | `undefined` | Additional classes for the wrapper. Useful for setting explicit height/width. |

### ChartConfig
An object of type `Record<string, { label?: React.ReactNode; icon?: React.ComponentType; color?: string; theme?: Record<string, string> }>`

## Variants & Examples

### Basic Bar Chart

```tsx
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent  } from "@cnma/react-ui"

const data = [
  { month: "January", orders: 186, revenue: 80 },
  { month: "February", orders: 305, revenue: 200 },
]

const config = {
  orders: { label: "Orders", color: "#b10e10" },
  revenue: { label: "Revenue", color: "#0070f2" },
}

export default function ChartDemo() {
  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

## Accessibility

- The chart generates accessible CSS variables.
- Wrap charts with standard SR-only labels or `<figcaption>` if complex data is presented.
- Rely on high-contrast colors defined in the theme palette for the `ChartConfig`.

## Design Guidelines

### Do's
- ✅ Always set an explicit height (e.g., `h-[300px]`) on the `ChartContainer`.
- ✅ Use `ChartConfig` to handle color and label mappings rather than hardcoding.
- ✅ Use brand colors and semantic palette variants to ensure visual consistency.

### Don'ts
- ❌ Don't let charts auto-size vertically — they will collapse to 0 height.
- ❌ Don't use random colors outside of the predefined system theme.
