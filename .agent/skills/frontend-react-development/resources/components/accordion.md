# Accordion

> A vertically stacked set of interactive headings that reveal or hide associated content.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Accordion>
  <AccordionItem>
    <AccordionTrigger />
    <AccordionContent />
  </AccordionItem>
</Accordion>
```

## Props API Reference

### Accordion

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `'single' | 'multiple'` | **Required** | Determines whether one or multiple items can be opened at the same time. |
| `value` | `string | string[]` | — | The controlled state of the item(s) to expand. |
| `defaultValue` | `string | string[]` | — | The value of the item(s) to expand when initially rendered and uncontrolled. |
| `onValueChange` | `(value: string | string[]) => void` | — | Event handler called when the expanded state of an item changes. |
| `collapsible` | `boolean` | `false` | When `type="single"`, allows closing content when clicking trigger for an open item. |
| `disabled` | `boolean` | `false` | When `true`, prevents the user from interacting with the accordion and all its items. |
| `dir` | `'ltr' | 'rtl'` | `'ltr'` | The reading direction of the accordion. |
| `orientation` | `'horizontal' | 'vertical'` | `'vertical'` | The orientation of the accordion. |

### AccordionItem

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | **Required** | A unique string that identifies the item. |
| `disabled` | `boolean` | `false` | When `true`, prevents the user from interacting with the item. |

### AccordionTrigger

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### AccordionContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `forceMount` | `boolean` | — | Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries. |

## Variants & Examples

### Single (One Item Open)

```tsx
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
 } from "@cnma/react-ui"

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

### Multiple (Many Items Open Simultaneously)

```tsx
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
 } from "@cnma/react-ui"

export function AccordionMultipleDemo() {
  return (
    <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
      <AccordionItem value="item-1">
        <AccordionTrigger>General Settings</AccordionTrigger>
        <AccordionContent>
          You can adjust your profile preferences here.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Advanced Settings</AccordionTrigger>
        <AccordionContent>
          Configure deep integrations and developer tools.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

## Accessibility

Adheres to the [Accordion WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

### Keyboard Interactions

| Key | Description |
| :--- | :--- |
| `Space` / `Enter` | When focus is on an `AccordionTrigger` of a collapsed section, expands the section. |
| `Tab` | Moves focus to the next focusable element. |
| `Shift + Tab` | Moves focus to the previous focusable element. |
| `ArrowDown` | Moves focus to the next `AccordionTrigger`. |
| `ArrowUp` | Moves focus to the previous `AccordionTrigger`. |
| `Home` | Moves focus to the first `AccordionTrigger`. |
| `End` | Moves focus to the last `AccordionTrigger`. |

## Design Guidelines

### ✅ Do
- Use `type="single" collapsible` for FAQs to keep the interface tidy.
- Use `type="multiple"` for settings or filter panels where users may need to compare information across sections.
- Keep trigger text concise and descriptive.

### ❌ Don't
- Don't use accordions for primary site navigation.
- Don't nest accordions within accordions; it creates cognitive overload and poor UX.
- Don't put too much content inside an accordion panel. If it's too long, consider splitting into sub-sections or separate pages.
