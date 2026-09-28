# Aspect Ratio

> A container that maintains a consistent width-to-height ratio for embedded media.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import {  AspectRatio  } from "@cnma/react-ui"

export default () => (
  <AspectRatio ratio={16 / 9}>
    <img src="..." alt="..." />
  </AspectRatio>
)
```

## Props API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ratio` | `number` | `1` | The desired aspect ratio (width / height) for the container. |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |

## Variants & Examples

### Default (16:9)

Displays an image or media element in a classic 16:9 aspect ratio, commonly used for videos or hero images.

```tsx
import {  AspectRatio  } from "@cnma/react-ui"
import Image from "next/image"

export function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9} className="bg-muted">
      <Image
        src="/images/placeholder.jpg"
        alt="A beautiful landscape"
        fill
        className="rounded-md object-cover"
      />
    </AspectRatio>
  )
}
```

### Square (1:1)

Ideal for avatars, grid galleries, or social media posts.

```tsx
import {  AspectRatio  } from "@cnma/react-ui"

export function AspectRatioSquare() {
  return (
    <AspectRatio ratio={1 / 1} className="bg-muted">
      <div className="flex h-full w-full items-center justify-center rounded-md border text-sm text-muted-foreground">
        1:1 Square
      </div>
    </AspectRatio>
  )
}
```

### Wide (21:9)

Suitable for panoramic imagery or cinematic content.

```tsx
import {  AspectRatio  } from "@cnma/react-ui"
import Image from "next/image"

export function AspectRatioWide() {
  return (
    <AspectRatio ratio={21 / 9} className="bg-muted">
      <Image
        src="/images/panorama.jpg"
        alt="A panoramic view"
        fill
        className="rounded-md object-cover"
      />
    </AspectRatio>
  )
}
```

## Accessibility

- **Semantic Elements**: Ensure that the child element inside `AspectRatio` provides meaningful accessibility context, such as `alt` text for images or `aria-label` for non-text content.
- **Focus Management**: If the content is interactive (like a video player), ensure keyboard focus behaves logically.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use `AspectRatio` to prevent layout shifts before media loads. | Don't use `AspectRatio` for purely textual content where height should depend on content length. |
| Keep images set to `object-cover` within the aspect ratio container to prevent distortion. | Don't force odd ratios that might cut off important parts of the image across breakpoints. |
