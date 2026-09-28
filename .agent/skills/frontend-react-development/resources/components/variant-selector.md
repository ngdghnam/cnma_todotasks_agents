# Variant Selector

> A SAP UI5-style variant management dropdown allowing users to switch between saved views, save new views, and manage existing ones.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { VariantSelector } from "@cnma/react-ui";

<VariantSelector
  variants={myVariants}
  activeVariantId={currentVariantId}
  activeVariantName={currentVariantName}
  onSelectVariant={(variant) => setActiveVariant(variant)}
/>
```

## Props API Reference

### Variant Object Definition
```typescript
interface Variant {
  id: string;
  name: string;
  isDefault?: boolean;
  createdBy?: string;
}
```

### VariantSelector

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variants` | `Variant[]` | `[]` | List of available variants/views saved by the user or system. |
| `activeVariantId` | `string \| null` | `null` | ID of the currently active variant, or `null` for the base "Standard" view. |
| `activeVariantName` | `string` | `'Standard'` | Name of the currently active variant. |
| `isLoading` | `boolean` | `false` | Whether the variants are currently fetching/loading. |
| `onSelectVariant` | `(variant: Variant \| null) => void` | — | Callback fired when a view is selected from the dropdown list. |
| `onSaveVariant` | `(name: string, isDefault: boolean) => void` | — | Callback fired when a new variant is saved via the "Save As" dialog. |
| `onDeleteVariant` | `(id: string) => void` | — | Callback fired when a variant is deleted via the "Manage Views" dialog. |
| `onSetDefault` | `(id: string) => void` | — | Callback fired when a variant is set as default via the "Manage Views" dialog. |

## Variants & Examples

### Default Usage
```tsx
import { useState } from 'react';
import { VariantSelector, type Variant } from "@cnma/react-ui";

export default function VariantSelectorDemo() {
  const [variants] = useState<Variant[]>([
    { id: '1', name: 'My High Priority', isDefault: true }
  ]);
  const [activeVariant, setActiveVariant] = useState<Variant | null>(null);

  return (
    <VariantSelector
      variants={variants}
      activeVariantId={activeVariant?.id || null}
      activeVariantName={activeVariant?.name || 'Standard'}
      onSelectVariant={setActiveVariant}
      onSaveVariant={(name, isDefault) => console.log('Saved:', name)}
    />
  );
}
```

## Accessibility
- Trigger acts as a standard popover trigger.
- Embedded dialogs ("Save As" and "Manage Views") are fully accessible standard modals (`Dialog`).
- Loading states are indicated visually and prevent interaction.

## Design Guidelines
- **Do** place this component above the `FilterBar` to control table layouts, filter configurations, and sorting logic simultaneously.
- **Do** provide backend integration for the save, delete, and default callbacks to persist user preferences.
