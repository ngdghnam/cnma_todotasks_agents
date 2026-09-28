# Sidebar

> A comprehensive responsive sidebar implementation, offering desktop/mobile transitions, cookie-based state persistence, collapsing functionality, and tooltips.

## Installation

```bash
npm install @cnma/react-ui
```

## Anatomy

```tsx
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@cnma/react-ui";

<SidebarProvider>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>Home</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <main>Content here</main>
</SidebarProvider>
```

## Props API Reference

### SidebarProvider
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | `boolean` | `true` | Initial state of the sidebar. |
| `open` | `boolean` | — | Controlled state of the sidebar. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback fired when the state changes. |

### Sidebar
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'left' \| 'right'` | `'left'` | Which side of the screen the sidebar anchors to. |
| `variant` | `'sidebar' \| 'floating' \| 'inset'` | `'sidebar'` | Visual presentation style. |
| `collapsible` | `'offcanvas' \| 'icon' \| 'none'` | `'offcanvas'` | How the sidebar collapses on desktop. |

## Variants & Examples

### Collapsible with Icons
```tsx
import { SidebarProvider, Sidebar, SidebarTrigger } from "@cnma/react-ui";

export default function Layout() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Sidebar content */}
      </Sidebar>
      <div>
        <SidebarTrigger />
        <h1>Main Content</h1>
      </div>
    </SidebarProvider>
  );
}
```

## Accessibility
- Uses Radix `Sheet` for the mobile view which guarantees focus trapping and aria-hidden management.
- Desktop sidebar utilizes `Tooltip` to ensure collapsed state buttons remain descriptive.
- Includes a keyboard shortcut (`Cmd+B` / `Ctrl+B`) to toggle the sidebar.

## Design Guidelines
- **Do** wrap your entire application shell in `<SidebarProvider>`.
- **Do** use `collapsible="icon"` for complex apps where users need screen real estate but still want quick access to navigation.
