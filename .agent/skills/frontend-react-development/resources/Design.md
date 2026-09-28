# Design Guideline for SAP BTP Web Applications — Version 2
*Built on the CNMA Boilerplate Design System*
**Version**: 2.0.0

---

## 1. Introduction & Principles

This guideline defines the design standards for web applications running on **SAP Business Technology Platform (BTP)**, whether integrated into **SAP Build Work Zone** or deployed as standalone applications. It supersedes Version 1 with concrete references to the implemented theme, components, and patterns.

**Core Philosophy**: *Enhanced Fiori — Zero Documentation*.
We adhere to SAP Fiori for consistency but strive for a design so intuitive that users need minimal documentation. The goal is to reduce clicks and provide relevant information strictly in context.

### Design Principles
| # | Principle | Meaning |
|---|-----------|---------|
| 1 | **Zero-Click / Intuitive** | The best help is a UI that doesn't need explanation. Labels descriptive, flows linear, no dead-ends |
| 2 | **Context Over Documentation** | If help is needed, it must be right there (field-level). Don't make the user search |
| 3 | **Agent-Readable** | Guideline is structured for AI scaffolding and automated review |
| 4 | **Palette-Driven** | One CSS variable change rebrands the entire app |

---

## 2. Floorplans

> **Detailed Catalog**: See [resources/floorplan_catalog.md](resources/floorplan_catalog.md) for full definitions and visual references.

### 2.1 General Rules
*   **Maximal Width**: Only for **List Reports**, Data/Card areas (Layer 3) should occupy the maximum available width within the Floorplan Background, respecting the mandatory `1rem` (16px) or `var(--ds-spacing-m)` container padding.

### 2.2 Layout
Standardized background layering for all floorplans (Theme A / SAP Fiori and Theme B / conarum):

```text
+---------------------------------------------------------------+
|  1. App Background: var(--background) (#EDEFF0)               |
|  (Outer Shell Area)                                           |
|                                                               |
|  +---------------------------------------------------------+  |
|  |  2. Floorplan Background: var(--ds-slate-50) (#F8FAFC)  |  |
|  |  (Main Content Container / Scrollable Area)             |  |
|  |                                                         |  |
|  |  +---------------------------------------------------+  |  |
|  |  |  3. Data/Card Area: var(--card) (#FFFFFF)         |  |  |
|  |  |  (Cards, Tables, Input Groups)                    |  |  |
|  |  +---------------------------------------------------+  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

| Layer | Variable | Hex | Usage |
|-------|----------|-----|-------|
| 1. App Background | `--background` | `#edeff0` | Outer shell area |
| 2. Floorplan Background | `--ds-slate-50` | `#f8fafc` | Main content container |
| 3. Card Surface | `--card` | `#ffffff` | Cards, tables, panels |
| Muted Surface | `--muted` | `#f2f2f2` | Subtle backgrounds, disabled |

### 2.3 Spacing & Gaps
*   **Card Separation**: All Data/Card areas (Layer 3) must be separated by a standard gap of `1rem` (16px) / `gap-4` or `var(--ds-spacing-m)`.
*   **Container Padding**: The Floorplan Background (Layer 2) should maintain a `1rem` (16px) / `p-4` padding on all sides to prevent cards from touching the application boundaries.
*   **Card Internal Padding**: Content within a Data/Card area (Layer 3) must maintain an internal padding of `1rem` (16px) / `p-4` or `var(--ds-spacing-m)` to ensure visual breathing room and consistent alignment with the outer container.

> **Rule of Thumb**: Always use Tailwind utility classes (e.g., `gap-4`, `p-4`) when writing React components (JSX/TSX). Only use CSS variables (e.g., `var(--ds-spacing-m)`) when writing custom styles inside `.css` files. This aligns perfectly with the `@cnma/react-ui` theme implementation.

### 2.4 Content Width Rules
The content area within a floorplan **must fill the available width** using `flex-1` or `w-full`. This ensures data-dense views (tables, forms, cards) utilize the full screen estate.

| Rule | Applies To | Example |
| :--- | :--- | :--- |
| **Fluid Width** (`w-full`, no `max-w-*`) | Object Pages, List Reports, Overview Pages | Tables, Forms, Card Grids |
| **Centered Max-Width** (`max-w-4xl mx-auto`) | Conversational / Article UIs only | Copilot Chat, Help Pages, Wizards |

*   **DO**: Let the main content area stretch to fill all horizontal space: `<main className="flex-1 overflow-y-auto p-4">`.
*   **DON'T**: Apply `max-w-3xl`, `max-w-5xl`, or any `max-w-*` on data-driven floorplans. This creates dead whitespace on wide screens.
*   **Exception**: A centered `max-w` is acceptable for text-heavy, conversational content (e.g., chat streams in the Copilot floorplan) where very long line lengths reduce readability.

### 2.5 Standard Floorplans

| Floorplan | Entry Point | Structure |
|-----------|-------------|-----------|
| **List Report** | Default for managing collections | IconTabBar + FilterBar + DataTable |
| **Object Page (Sidebar)** | Complex objects with many sections | Header + Left Nav + Content Area |
| **Object Page (Tabs)** | Moderate complexity | Header + Tab Bar + Content |
| **Overview / Dashboard** | High-level domain summary | Card grid with KPIs |
| **Flexible Column Layout** | Master-Detail | Split-screen list + detail |
| **Kanban Board** | Process tasks | Drag-and-drop columns |
| **Wizard Process** | Linear multi-step tasks | Progress stepper |
| **Analytical Dashboard** | Data visualization first | Charts + supporting tables |
| **Initial Page** | Empty state / Landing | Hero + CTA |
| **Settings / Profile** | User preferences | Form-based layout |

### 2.6 Page-Level Toolbars
The following action types are defined for header and footer toolbars:

| Type | What you need to know | Examples | Style |
| :--- | :--- | :--- | :--- |
| **Primary** | • Most important action<br>• Needs to stand out on the page<br>• Needed to move the workflow forward | *Edit*, *Save*, *Submit* | `variant="default"` (Brand fill) |
| **Semantic** | • Alternative to a primary action<br>• Usually come in pairs with a positive and a negative value<br>• Exception: If a single primary action has a strong semantic meaning (such as *Delete*), this might be emphasized using the semantic action. | *Approve* and *Reject*<br>*Accept* and *Decline* | **Accept Button** (Green)<br>**Reject Button** (Red) |
| **Secondary** | • All actions that are not primary or negative path actions<br>• Do not stand out on the page<br>• Might be collapsed in menus | *Copy* | `variant="ghost"` |
| **Negative Path** | • Navigates away from the current page without executing an action<br>• Usually one negative path action only | *Cancel*<br>*Close* (for modal dialogs) | `variant="outline"` |

---

## 3. Theming & Foundations

> **Source of Truth**: [`theme.css`](file:///cnma-boilerplate/src/styles/theme.css)
> **Detailed Foundation**: See [resources/foundations/01_colors.md](resources/foundations/01_colors.md), [Message Handling](resources/foundations/02_message_handling.md), and [Standard Labels](resources/foundations/labels/standard_labels_en.md).

### 3.1 Overview
*   **Typography**: Restricted to SAP Standard Fonts (`72` / `--font-sans`).
*   **Themes**: Support for **SAP Standard (Theme A)** and **conarum (Theme B)** dual themes.

### 3.2 Brand Colors
All brand colors are defined in `:root` and cascade through the entire system. **Change only these 3 values to rebrand.**

```css
--color-brand:       #b10e10;   /* Primary actions, active states */
--color-brand-hover: #990c0e;   /* Hover for primary actions */
--color-link:        #820a0c;   /* Text links */
```

### 3.3 Semantic Palette
Five base colors from which all status/feedback styling derives via `color-mix()`:

| Palette | Variable | Hex | Usage |
|---------|----------|-----|-------|
| Positive | `--palette-positive` | `#256f3a` | Success, approved, completed |
| Negative | `--palette-negative` | `#aa0808` | Error, rejected, cancelled |
| Critical | `--palette-critical` | `#e76500` | Warning, pending, action required |
| Informative | `--palette-informative` | `#0070f2` | Info, released, in progress |
| Neutral | `--palette-neutral` | `#788fa6` | Obsoleted, inactive, muted |

**Extended palettes**: `--palette-purple` (`#7800a4`), `--palette-teal` (`#0d7278`).

### 3.4 Status Colors (Auto-Derived)
Status colors are derived **automatically** from the palette with `color-mix()`. Adding a new status requires only **one line**:

```css
/* In :root: */
--status-myNewStatus: var(--palette-positive);

/* Auto-generated in @theme inline: */
--color-status-myNewStatus:        color-mix(in srgb, var(--status-myNewStatus) 12%, #ffffff);
--color-status-myNewStatus-text:   var(--status-myNewStatus);
--color-status-myNewStatus-border: color-mix(in srgb, var(--status-myNewStatus) 40%, #ffffff);
```

**Current Status Map**:

> **Note on Tailwind v4 Integration**: To ensure custom classes like `bg-status-new` work correctly, these status variables must be mapped to the Tailwind theme. In the `@cnma/react-ui` ecosystem, inject these custom utilities via the `@theme` directive in your application's root `theme.css`.

| Status | Palette | Tailwind Classes |
|--------|---------|-----------------| 
| New / Open | Critical (orange) | `bg-status-new text-status-new-text border-status-new-border` |
| In Progress | Critical (orange) | `bg-status-progress text-status-progress-text border-status-progress-border` |
| Released / Approved | Informative (blue) | `bg-status-released text-status-released-text border-status-released-border` |
| Sent / Shipped | Purple | `bg-status-sent text-status-sent-text border-status-sent-border` |
| Completed | Positive (green) | `bg-status-completed text-status-completed-text border-status-completed-border` |
| Obsoleted / Rejected | Neutral (grey) | `bg-status-obsoleted text-status-obsoleted-text border-status-obsoleted-border` |

#### StatusBadge Component
**Always** use the centralized `StatusBadge` component instead of defining per-page color maps:

```tsx
import { StatusBadge } from "@/components/common/StatusBadge";

// Pass any standard status string — it maps to the correct palette automatically:
<StatusBadge status="Approved" />
<StatusBadge status="In Progress" />
<StatusBadge status="Rejected" />
```

### 3.5 Accessibility (WCAG 2.1 AA)
**Rule**: All text must meet **WCAG 2.1 AA** standards (Minimum **4.5:1** contrast ratio).
*   **Primary Action Text**: White text on Brand Red (`#b10e10`) provides >5:1 ratio. **APPROVED**.
*   **Secondary Text**: Grey (`#666666`) on white provides a safe **5.7:1** ratio. Always prefer this over lighter greys like `#777777` which only borderline pass.
*   **Forbidden**: Do NOT use light red backgrounds with red text.

### 3.6 Standard Labels
*   **Uniformity**: Use the [Standard Labels List](resources/foundations/labels/standard_labels_en.md) to ensure consistent terminology across all applications.
*   **Strict Adherence**: Deviations (e.g., using "Vendor" instead of "Supplier") are not permitted without updating the central list.
*   **Localization**: The English list is the master; all translations (e.g., German) must be semantically equivalent to the defined standard.

---

## 4. Help System

> **Detailed Guide**: See [resources/help_system.md](resources/help_system.md) for comprehensive patterns and writing standards.

### 4.1 Contextual Help (Level 1)
*   **Goal**: Immediate assistance without leaving the context.
*   **Field Help**: Small "i" icon triggering a Popover.
*   **Section Help**: "Help" toggle in the section header that reveals explanations inline or in a side panel.

### 4.2 Step-by-Step Guides (Level 2)
*   **Goal**: Guided execution for complex, infrequent tasks (e.g., Onboarding).
*   **Pattern**: "Coach Marks" (Overlays) highlighting the next click.
*   **Tech**: Guided Tour libraries (e.g., `driver.js`).

### 4.3 Application Help & FAQ (Level 3)
*   **Goal**: Conceptual understanding.
*   **Location**: Side Panel (Shell Bar "?" Icon).
*   **Content**: Searchable knowledge base and Frequently Asked Questions.

### 4.4 Help Agent (Level 4)
*   **Goal**: Natural language assistance.
*   **Interface**: Chat widget embedded in the Help Side Panel.
*   **Capability**: "How do I approve this request?" → Agent guides the user or performs the action.

| Level | Pattern | Technology |
|-------|---------|------------|
| **1. Micro-Copy** | Descriptive labels, placeholders | Built-in |
| **2. Contextual** | `?` / `i` icon → Popover | shadcn Popover |
| **3. Guided Tour** | Coach marks overlays | driver.js |
| **4. Help Agent** | Conversational side panel | Custom AI chat |

---

## 5. Components

### 5.1 Standard Components (shadcn/ui)
We typically use **shadcn/ui** as our base component library.
*   **Philosophy**: Use standard `shadcn` components for all core interactions (Inputs, Dialogs, Selects, Cards).
*   **Customization**: Customize via `@theme inline` in `theme.css` and CSS variables to match Theme A (SAP) or Theme B (conarum) tokens.
*   **Allowed Libraries**:
    1.  **shadcn/ui**: The default for everything.
    2.  **cnma**: Official "conarum" released components (e.g., specific complex widgets).
*   **Constraint**: Do NOT use raw HTML/CSS for standard patterns if a shadcn component exists.

### 5.2 Enhanced Components (CNMA)

Where Fiori standard components are too rigid, we use enhanced React components and CNMA extend components, if defined and necessary.

> **Detailed Guide**: See folder [resources/enhanced_components](resources/enhanced_components) for implementation details and usage patterns.

| Component | File | Purpose |
|-----------|------|---------|
| `DataTable` | `ui/DataTable.tsx` | Config-driven table with sorting, selection, mobile card mode |
| `FilterBar` | `filterbar/FilterBar.tsx` | SAP-style filter bar with Go/Clear/Toggle |
| `MultiSelectFilter` | `ui/multi-select-filter.tsx` | Token-based multi-select with overflow detection |
| `StatusBadge` | `common/StatusBadge.tsx` | CVA-based status badge with auto color mapping |
| `TableToolbar` | `ui/TableToolbar.tsx` | Toolbar with title + action slots |
| `Token` | `ui/token.tsx` | Removable tag/chip |
| `ValueHelpFilter` | `ui/value-help-filter.tsx` | Dialog-based selection filter |

### 5.3 Toast Notifications
Use the pre-configured toast helper from `@cnma/react-ui/sonner`:

```tsx
import { toast } from "@cnma/react-ui/sonner";

toast("Event created");
toast.success("Saved!", { description: "Changes persisted." });
toast.error("Failed", { description: "Please retry." });
```

Default position is `top-right`, configurable in `sonner.tsx` via `DEFAULT_POSITION`.

### 5.4 Charts
Use `ChartContainer` from `@cnma/react-ui/chart` with a `ChartConfig` object:

```tsx
const config = {
  orders: { label: "Orders", color: "var(--color-brand)" },
  revenue: { label: "Revenue", color: "var(--palette-informative)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-[300px] w-full">
  <BarChart data={data}>
    <Bar dataKey="orders" fill="var(--color-orders)" />
    <Bar dataKey="revenue" fill="var(--color-revenue)" />
  </BarChart>
</ChartContainer>
```

> **Important**: Always set an explicit height (e.g. `h-[300px]`) on ChartContainer.

---

## 6. Message Handling

> **Detailed Guide**: See [resources/foundations/02_message_handling.md](resources/foundations/02_message_handling.md)

| Tier | Component | When | Duration |
|------|-----------|------|----------|
| **Transient** | `toast()` (sonner) | Success confirmations | 3-5s auto-dismiss |
| **Section-Level** | `Alert` (shadcn) | Warnings relevant to a section | Persistent |
| **Field-Level** | Form field state | Input validation errors | On blur / on submit |
| **Aggregated** | Footer Message Toggle | Multiple errors across tabs | Until resolved |
| **Blocking** | `AlertDialog` (shadcn) | Destructive / irreversible actions | Until dismissed |

### Anti-Spam Rule
- **DO**: Aggregate validation errors into a single footer badge
- **DON'T**: Show a separate toast for every field error

---

## 7. Best Practices (Do's and Don'ts)

### 7.1 Theming
*   **DO** use variables like `var(--color-brand)` for primary actions and active states.
*   **DON'T** hardcode hex values like `#b10e10` directly in components; use the CSS variables.
*   **DO** stick to neutral greys (`var(--muted)`) for secondary information.
*   **DON'T** use the brand red for negative/error states; use `var(--palette-negative)`.
*   **DO** use neutral card styles for dashboards. Distinguish groups via Headers, not colors.
*   **DON'T** create "Rainbow Dashboards" with different colored borders for every card. Keep the UI professional and uniform.

### 7.2 Typography
*   **DO** use SAP **72** or system fonts to maintain the "Native Fiori" feel.
*   **DON'T** import 3rd party web fonts (Montserrat, Poppins) unless building a specific marketing landing page.

### 7.3 Components
*   **DO** use **Pill-Shaped** buttons for the primary conarum theme.
*   **DON'T** mix rectangular (Standard Fiori) and pill-shaped buttons in the same view.
*   **DO** use **Table-in-Table** for nested parent-child data (e.g., Order → Positions).
*   **DON'T** force nested data into a flat list using complex concatenations.
*   **DO** use a **Chevron Right** (`>`) icon as the last column if the row navigates to a detail page.
*   **DON'T** use an Ellipsis (`...`) for navigation. Ellipsis is strictly for a "Row Actions" menu (Edit, Delete, etc.).
*   **DO** use `StatusBadge` component — never define per-page color maps.
*   **DO** use `whitespace-nowrap` on badges to prevent text wrapping.
*   **DO** use `toast()` from `@cnma/react-ui/sonner` — never import directly from `sonner`.
*   **DON'T** use `w-min` on badges (causes text wrapping).
*   **DON'T** use auto-dismissing toasts for critical errors.

### 7.4 Language
*   **DO** use **English** for all example text, labels, and mock data.
*   **DON'T** use German or other languages in code examples or demos (e.g., use "Cancel" instead of "Abbrechen").
*   **DO** consult the [Standard Labels List](resources/foundations/labels/standard_labels_en.md) for approved terminology.

### 7.5 Spacing & Layout
*   **DO** use `gap-4` / `p-4` for consistent spacing (16px).
*   **DON'T** apply `max-w-*` on data-driven floorplans.
*   **DO** let content fill full width: `<main className="flex-1 overflow-y-auto p-4">`.

---

## 8. Technology Stack Standards

This document serves as the **Single Source of Truth** for building applications within the Antigravity ecosystem. Applications are primarily deployed to **SAP BTP Foundry** and integrated into **SAP Build Work Zone**.

### 8.1 Core Framework
| Library | Version | Purpose |
|---------|---------|---------|
| **React** | 19+ | UI Framework (Actions, useOptimistic) |
| **TypeScript** | 5.x | Type safety (strict mode) |
| **Vite** | 7+ | Build tool & dev server |
| **React Router** | v7 | Client-side routing |

### 8.2 UI & Styling
| Library | Purpose |
|---------|---------|
| **shadcn/ui** | Component library (new-york style) |
| **Tailwind CSS v4** | Utility-first styling (theme via `@theme inline`) |
| **Lucide React** | Iconography (700+ icons) |
| **Recharts** | Charts & data visualization |
| **sonner** | Toast notifications |
| **Framer Motion** | Animations |

### 8.3 State & Data
| Library | Purpose |
|---------|---------|
| **TanStack Query** | Server state, caching, API calls |
| **Zustand** | Client state management |
| **React Hook Form** | Form handling with **Zod** validation |
| **react-i18next** | Internationalization |

---

## 9. Embedded Content Layout (Work Zone)

When running within **SAP Build Work Zone**, the application **must not** provide its own brand logo, global header, or main navigation sidebar.

*   **No Global Header**: Do not render a top bar with logo.
*   **No Global Sidebar**: Do not render a side navigation shell.
*   **Local Navigation**: Use horizontal tabs or a subtle local sidebar inside the content area.
*   **Fluid Width**: The main content area should be responsive and fill the container provided by the shell.

---

## 10. Specialized Patterns

### 10.1 Studio Pattern (Configuration)
A visual configuration UI for complex entities.
*   **Features**: Drag-and-drop schema builder, workflow editor (ReactFlow).
*   **Navigation**: Tab-based (Workflow, Form Schema, Rules, Status).

### 10.2 Dynamic Forms
Use the `DynamicForm` pattern for schema-driven forms where fields are rendered based on JSON metadata.

---

## 11. Animation & Feedback
*   **Transitions**: Use `framer-motion` for stagger animations on list entries.
*   **Hover States**: Use `transition-all duration-200`.
*   **Loading**: Buttons show spinner + disabled state. Use skeleton loaders for content areas.
*   **Toasts**: Non-blocking notifications via `toast()` from `@cnma/react-ui/sonner`.

---

## 12. Agent Integration (Design Consultant)
This guideline is designed to be machine-readable. AI Agents (like OpenCode, Claude, Cursor) should be configured to automatically enforce these rules via project-level `.clauderules` or `AGENTS.md` files.

A "Design Consultant" agent skill can be invoked to:
1.  **Scaffold**: `Creating a new List Report? Use template: src/templates/ListReport.tsx`. The agent must ensure all generated code uses `@cnma/react-ui` components rather than raw HTML.
2.  **Review**: `Checking buttons... Found rectangular buttons. Suggestion: Update to pill-shape using var(--color-brand) for conarum Theme adherence.`
3.  **Theme Validation**: The agent must automatically verify that no hard-coded colors exist in the components and that all spacing, color, and typography tokens strictly map back to the `@cnma/react-ui` base theme and Tailwind variables.

---

## 13. Implementation Checklist
1. [ ] **Initialize**: `npm create vite@latest -- --template react-ts`
2. [ ] **shadcn/ui**: `npx shadcn@latest init` (new-york style, slate base color).
3. [ ] **Theme**: Configure theme variables in `theme.css`.
4. [ ] **Brand Colors**: Set `--color-brand: #b10e10` (or your brand).
5. [ ] **Status Colors**: Add one line per status in `:root`.
6. [ ] **Work Zone Check**: Verify `App.tsx` has no standalone shell/sidebar.
7. [ ] **i18n**: Ensure `react-i18next` is configured for multi-language support.
8. [ ] **Toaster**: Mount `<Toaster />` in root layout.
9. [ ] **TypeScript**: Run `npx tsc --noEmit` — zero errors.
