# Avatar

> A circular image element for representing users or entities with a fallback.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import * as AvatarPrimitive from "@radix-ui/react-avatar"

<AvatarPrimitive.Root>
  <AvatarPrimitive.Image />
  <AvatarPrimitive.Fallback />
</AvatarPrimitive.Root>
```

## Props API Reference

### Avatar
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `undefined` | Add classes to change size (default is usually `size-10`) or shape. |

### AvatarImage
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | **Required** | The source URL of the image. |
| `alt` | `string` | `undefined` | Alternative text for screen readers. |
| `onLoadingStatusChange` | `(status: "idle" \| "loading" \| "loaded" \| "error") => void` | `undefined` | Callback invoked when the load status changes. |

### AvatarFallback
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `delayMs` | `number` | `undefined` | Delay in milliseconds before showing the fallback. |
| `children` | `React.ReactNode` | `undefined` | Typically 1-2 initials representing the entity. |

## Variants & Examples

### Default (With Image)

```tsx
import {  Avatar, AvatarFallback, AvatarImage  } from "@cnma/react-ui"

export default function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}
```

### Fallback Only

```tsx
import {  Avatar, AvatarFallback  } from "@cnma/react-ui"

export default function AvatarFallbackOnly() {
  return (
    <Avatar>
      <AvatarFallback>KM</AvatarFallback>
    </Avatar>
  )
}
```

### Custom Sizes

```tsx
import {  Avatar, AvatarFallback, AvatarImage  } from "@cnma/react-ui"

export default function AvatarSizes() {
  return (
    <div className="flex items-center space-x-4">
      {/* Small */}
      <Avatar className="size-8">
        <AvatarImage src="/avatar.jpg" alt="User" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      
      {/* Large */}
      <Avatar className="size-16">
        <AvatarImage src="/avatar.jpg" alt="User" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  )
}
```

## Accessibility

- The `AvatarImage` provides an `alt` tag for screen readers.
- If the image fails to load, the `AvatarFallback` is rendered, ensuring visual and semantic context is retained.
- If the avatar is purely decorative and adjacent to the user's name in text, the `alt` text can be empty to avoid redundancy.

## Design Guidelines

### Do's
- ✅ Always provide a meaningful `AvatarFallback` (like user initials).
- ✅ Ensure sufficient contrast for the fallback text and background.

### Don'ts
- ❌ Don't use avatars for non-entity images (use standard image tags instead).
- ❌ Don't stretch the avatar out of its 1:1 aspect ratio.
