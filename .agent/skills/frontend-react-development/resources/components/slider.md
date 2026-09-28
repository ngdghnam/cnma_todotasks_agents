# Slider

> A range input for selecting a numeric value by dragging a thumb along a track.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<Slider>
  <SliderTrack>
    <SliderRange />
  </SliderTrack>
  <SliderThumb />
</Slider>
```

## Props API Reference

### Slider

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `defaultValue` | `number[]` | — | The value of the slider when initially rendered. Use when you do not need to control the state of the slider. |
| `value` | `number[]` | — | The controlled value of the slider. Must be used in conjunction with `onValueChange`. |
| `onValueChange` | `(value: number[]) => void` | — | Event handler called when the value changes. |
| `onValueCommit` | `(value: number[]) => void` | — | Event handler called when the value changes at the end of an interaction (e.g., `onMouseUp`). |
| `min` | `number` | `0` | The minimum value for the range. |
| `max` | `number` | `100` | The maximum value for the range. |
| `step` | `number` | `1` | The stepping interval. |
| `disabled` | `boolean` | `false` | When `true`, prevents the user from interacting with the slider. |
| `orientation` | `'horizontal' | 'vertical'` | `'horizontal'` | The orientation of the slider. |
| `dir` | `'ltr' | 'rtl'` | `'ltr'` | The reading direction of the slider. |
| `inverted` | `boolean` | `false` | When `true`, the slider's track progresses in the opposite direction. |
| `minStepsBetweenThumbs` | `number` | `0` | The minimum permitted steps between multiple thumbs. |

## Variants & Examples

### Basic

```tsx
import {  Slider  } from "@cnma/react-ui"

export function SliderDemo() {
  return (
    <Slider
      defaultValue={[50]}
      max={100}
      step={1}
      className="w-[60%]"
    />
  )
}
```

### Range (Two Thumbs)

To create a range slider, simply pass an array with two values.

```tsx
import {  Slider  } from "@cnma/react-ui"

export function SliderRange() {
  return (
    <Slider
      defaultValue={[25, 75]}
      max={100}
      step={5}
      className="w-[60%]"
    />
  )
}
```

### Vertical

```tsx
import {  Slider  } from "@cnma/react-ui"

export function SliderVertical() {
  return (
    <Slider
      orientation="vertical"
      defaultValue={[50]}
      max={100}
      step={1}
      className="h-[200px]"
    />
  )
}
```

## Accessibility

Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) (or Multi-Thumb Slider).

### Keyboard Interactions

| Key | Description |
| :--- | :--- |
| `ArrowRight` / `ArrowUp` | Increments the value of the focused thumb by `step`. |
| `ArrowLeft` / `ArrowDown` | Decrements the value of the focused thumb by `step`. |
| `PageUp` | Increments the value of the focused thumb by a larger step (usually `step * 10`). |
| `PageDown` | Decrements the value of the focused thumb by a larger step (usually `step * 10`). |
| `Home` | Sets the value of the focused thumb to `min`. |
| `End` | Sets the value of the focused thumb to `max`. |

## Design Guidelines

### ✅ Do
- Use for adjusting settings like volume, brightness, or applying numeric filters.
- Provide clear visual labels or adjacent input fields if precise numeric entry is required.
- Use step increments that make logical sense for the data.

### ❌ Don't
- Don't use a slider for extremely precise numeric entry without providing a supplementary text input.
- Don't use a slider if the range of choices is extremely small (e.g., 1 to 3) — use a RadioGroup or Select instead.
