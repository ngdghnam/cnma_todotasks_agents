# Navigation Menu

> A horizontal navigation component with dropdown panels for site-level navigation.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger />
      <NavigationMenuContent>
        <NavigationMenuLink />
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
  <NavigationMenuIndicator />
  <NavigationMenuViewport />
</NavigationMenu>
```

## Props API Reference

### NavigationMenu

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | — | The controlled value of the item to expand. |
| `defaultValue` | `string` | — | The value of the item to expand when initially rendered. |
| `onValueChange` | `(value: string) => void` | — | Event handler called when the value changes. |
| `dir` | `'ltr' | 'rtl'` | `'ltr'` | The reading direction of the menu. |
| `orientation` | `'horizontal' | 'vertical'` | `'horizontal'` | The orientation of the menu. |
| `delayDuration` | `number` | `200` | The duration from when the pointer enters the trigger until the content opens. |
| `skipDelayDuration` | `number` | `300` | How much time a user has to enter another trigger without incurring a delay again. |
| `viewport` | `boolean` | `true` | Whether to render the `NavigationMenuViewport` internally. If false, you can render it manually. |

### NavigationMenuList

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### NavigationMenuItem

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | — | A unique value that associates the item with an active value when the navigation menu is controlled. |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### NavigationMenuTrigger

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### NavigationMenuContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | — | Event handler called when the escape key is down. |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | — | Event handler called when a pointer event occurs outside the bounds of the component. |
| `onFocusOutside` | `(event: FocusOutsideEvent) => void` | — | Event handler called when focus moves outside the bounds of the component. |
| `onInteractOutside` | `(event: InteractOutsideEvent) => void` | — | Event handler called when an interaction happens outside the bounds of the component. |

### NavigationMenuLink

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `asChild` | `boolean` | `false` | Change the default rendered element for the one passed as a child, merging their props and behavior. |
| `active` | `boolean` | `false` | Used to visually indicate the link is active (e.g., current page). |
| `onSelect` | `(event: Event) => void` | — | Event handler called when the user selects a link (via mouse or keyboard). |

## Variants & Examples

### Default

```tsx
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
 } from "@cnma/react-ui"

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      shadcn/ui
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components that you can copy and paste.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a href="/docs/installation" className="block p-3 hover:bg-accent rounded-md">
                    <div className="font-medium mb-1">Installation</div>
                    <p className="text-sm text-muted-foreground">How to install dependencies and structure your app.</p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
             <a href="/docs" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
               Documentation
             </a>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

## Accessibility

Adheres to the [Navigation Menu WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

### Keyboard Interactions

| Key | Description |
| :--- | :--- |
| `Space` / `Enter` | When focus is on a `NavigationMenuTrigger`, opens the content. |
| `Escape` | Closes the open content and returns focus to the trigger. |
| `ArrowDown` | Opens the content and moves focus to the first item inside. |
| `ArrowRight` | Moves focus to the next item in the `NavigationMenuList` or `NavigationMenuContent`. |
| `ArrowLeft` | Moves focus to the previous item. |

## Design Guidelines

### ✅ Do
- Use for primary, top-level site navigation.
- Group related navigation links logically inside dropdown panels.
- Ensure the dropdown content is easy to navigate and scan.

### ❌ Don't
- Don't use for context menus or simple select lists.
- Don't overwhelm users with too many links inside a single dropdown panel.
- Don't use if a simple list of top-level links (like `Tabs` or standard `a` tags) suffices.
