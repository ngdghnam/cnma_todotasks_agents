# Worklist Tab Bar

> A specialized tab bar component for filtering worklists, displaying counts with distinct visual variants optimized for different Fiori backgrounds.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { WorklistTabBar } from "@cnma/react-ui";

<WorklistTabBar
  tabs={[
    { key: 'all', label: 'All', count: 12 },
    { key: 'pending', label: 'Pending', count: 3 }
  ]}
  activeTab="all"
  onTabChange={(key) => setActiveTab(key)}
/>
```

## Props API Reference

### WorklistTab

```typescript
export interface WorklistTab {
  key: string;
  label: string;
  count: number;
}
```

### WorklistTabBar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `WorklistTab[]` | **Required** | The list of tabs to render. |
| `activeTab` | `string` | **Required** | The key of the currently active tab. |
| `onTabChange` | `(key: string) => void` | **Required** | Callback fired when a tab is clicked. |
| `variant` | `'underline' \| 'pills'` | `'underline'` | Visual style variant: Dashboard style vs Design-system style. |

## Variants & Examples

### Pills Variant
```tsx
import { WorklistTabBar } from "@cnma/react-ui";

export default function Demo() {
  return (
    <WorklistTabBar
      variant="pills"
      tabs={[{ key: '1', label: 'Active', count: 5 }]}
      activeTab="1"
      onTabChange={() => {}}
    />
  );
}
```

## Accessibility
- Uses semantic `<button>` tags, allowing keyboard navigation via standard focus/enter behaviors.

## Design Guidelines
- **Do** use `underline` variant on white/card backgrounds (Dashboard style).
- **Do** use `pills` variant when you need a contained, card-like look suitable for Fiori's blocky layouts on gray backgrounds.
