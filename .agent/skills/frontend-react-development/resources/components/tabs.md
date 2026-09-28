# Tabs

> A set of layered panels that display one panel of content at a time.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Tabs>
  <TabsList>
    <TabsTrigger />
    <TabsTrigger />
  </TabsList>
  <TabsContent />
  <TabsContent />
</Tabs>
```

## Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | `string` | — | The value of the tab that should be active when initially rendered (uncontrolled). |
| `value` | `string` | — | The controlled value of the currently active tab. |
| `onValueChange` | `(value: string) => void` | — | Event handler called when the active tab changes. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | The orientation of the tab navigation. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction. |

### TabsTrigger
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **Required** | The unique value that associates the trigger with a content panel. |
| `disabled` | `boolean` | `false` | Whether the tab trigger is disabled. |

## Variants & Examples

### Default
```tsx
import {  Tabs, TabsList, TabsTrigger, TabsContent  } from "@cnma/react-ui";

<Tabs defaultValue="general" className="w-[400px]">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    <p>General account details.</p>
  </TabsContent>
  <TabsContent value="settings">
    <p>Application preferences and settings.</p>
  </TabsContent>
  <TabsContent value="advanced">
    <p>Advanced security controls.</p>
  </TabsContent>
</Tabs>
```

### Pill Style
```tsx
<Tabs defaultValue="components">
  <TabsList className="p-1 bg-muted/20 rounded-full h-auto">
    <TabsTrigger value="demos" className="rounded-full px-5 py-1.5 text-sm">
      Demos
    </TabsTrigger>
    <TabsTrigger value="components" className="rounded-full px-5 py-1.5 text-sm">
      Components
    </TabsTrigger>
  </TabsList>
  <TabsContent value="demos">Demo content</TabsContent>
  <TabsContent value="components">Component content</TabsContent>
</Tabs>
```

## Accessibility

- **Keyboard:**
  - `ArrowRight` / `ArrowLeft` navigates between tabs.
  - `Home` / `End` jumps to the first or last tab.
  - `Tab` moves focus to the active `TabsContent`.
- **Roles:**
  - Applies `role="tablist"` to the container.
  - Applies `role="tab"` to triggers and `role="tabpanel"` to content panels.

## Design Guidelines

### Do's
- Use tabs for navigating logically distinct sections within the same context (e.g., Object Page sections).
- Show counts in tab labels when relevant (e.g., "Items (12)").

### Don'ts
- Don't nest tabs within tabs — use accordions, sidebars, or cards instead.
- Don't use tabs if there's only one tab — just display the content directly.
- Don't mix tab visual styles (e.g., pill + underlined) in the same hierarchical view.
