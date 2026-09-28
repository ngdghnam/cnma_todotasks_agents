# Stat Card

> A statistics card displaying a label, value, and an integrated mini donut chart. Supports different semantic color themes.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { StatCard } from "@cnma/react-ui";
import { Activity } from "lucide-react";

<StatCard
  label="Total Requests"
  value={150}
  total={200}
  icon={<Activity />}
  colorTheme="informative"
/>
```

## Props API Reference

### ColorTheme
`'informative' | 'attention' | 'positive' | 'negative'`

### StatCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **Required** | The primary label for the statistic. |
| `shortLabel` | `string` | — | An optional shorter label for mobile view. |
| `value` | `number` | **Required** | The main numeric value to display. |
| `total` | `number` | **Required** | The total value used to calculate the donut chart proportion. |
| `icon` | `React.ReactNode` | **Required** | The icon to display next to the label. |
| `colorTheme` | `ColorTheme` | **Required** | Semantic theme mapping to CNMA standard variables. |
| `segments` | `StatSegment[]` | — | Optional segments to render a multi-colored donut chart. |
| `unit` | `string` | `'reqs'` | The unit to display next to the value. |
| `donutSize` | `number` | `52` | The size of the donut chart. |
| `isActive` | `boolean` | `false` | Whether the card is active/selected (adds a glow border). |
| `onClick` | `() => void` | — | Optional click handler, making the card an interactive button. |
| `themeOverride` | `StatCardColors` | — | Optional custom colors to override the default palette. |

## Variants & Examples

### Interactive Filter Card
```tsx
import { StatCard } from "@cnma/react-ui";
import { AlertTriangle } from "lucide-react";

export default function Demo() {
  return (
    <StatCard
      label="Errors Found"
      value={5}
      total={100}
      icon={<AlertTriangle />}
      colorTheme="negative"
      unit="items"
      isActive={true}
      onClick={() => console.log('Filtered by errors')}
    />
  );
}
```

## Accessibility
- Functions as a standard `<button>` when `onClick` is provided, automatically handling focus-visible rings.

## Design Guidelines
- **Do** use StatCards as visual filters at the top of a Worklist or Dashboard.
- **Do** map `colorTheme` logically (e.g. `negative` for errors, `informative` for generic totals).
