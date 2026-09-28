# Carousel

> A slideshow component for cycling through a set of content items.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
 } from "@cnma/react-ui"

export default () => (
  <Carousel>
    <CarouselContent>
      <CarouselItem>...</CarouselItem>
      <CarouselItem>...</CarouselItem>
      <CarouselItem>...</CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
)
```

## Props API Reference

### Carousel

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `opts` | `object` | `{}` | Embla Carousel options (e.g. `{ align: "start", loop: true }`). |
| `plugins` | `array` | `[]` | Embla Carousel plugins (e.g. `[Autoplay()]`). |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Orientation of the carousel. |
| `setApi` | `(api: CarouselApi) => void` | - | Callback to get the Embla Carousel API instance. |

## Variants & Examples

### Default

A basic horizontal carousel displaying single items.

```tsx
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
 } from "@cnma/react-ui"
import {   Card, CardContent  } from "@cnma/react-ui"

export function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

### Multiple Items Per Slide

Configure multiple visible items using responsive Tailwind flex basis classes (e.g. `md:basis-1/2 lg:basis-1/3`).

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
 } from "@cnma/react-ui"

export function CarouselSize() {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-sm"
    >
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              {/* Card content */}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

### Orientation

Support for vertical layout.

```tsx
<Carousel orientation="vertical" className="w-full max-w-xs">
  <CarouselContent className="-mt-1 h-[200px]">
    <CarouselItem className="pt-1 md:basis-1/2">...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

### API and Autoplay

You can access the `EmblaCarousel` API or use plugins like `Autoplay`.

```tsx
import Autoplay from "embla-carousel-autoplay"

export function CarouselPlugin() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      {/* ... */}
    </Carousel>
  )
}
```

## Accessibility

- **Keyboard Navigation**: Users can navigate between items using `ArrowLeft` and `ArrowRight` (or up/down for vertical).
- **Focus Management**: The container manages `aria-roledescription="carousel"`. Items and buttons are correctly typed.
- **Screen Reader Support**: Previous and next buttons feature visually hidden `aria-label` texts.

## Design Guidelines

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Include previous/next controls unless providing clear alternate navigational elements (like dots). | Don't use carousels for highly critical information; users might not scroll through it all. |
| Add appropriate margin or padding between items so focus rings aren't clipped. | Don't auto-rotate the carousel too fast without a way to pause or interact. |
| Use responsive classes on `CarouselItem` to adjust how many items show on different screen sizes. | Don't nest carousels inside one another. |
