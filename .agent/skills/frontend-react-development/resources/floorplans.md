# Floorplan Skills & Scaffold Prompts

This document provides AI agent skills/prompts for scaffolding specific floorplans, strictly adhering to the established rules and design guidelines.

## 06. Kanban Board

**Skill Prompt:**
```text
When instructed to scaffold a Kanban Board floorplan, you MUST adhere to the following rules:
1. WRAPPER: Use `<div className="space-y-4 p-2 sm:p-4">` as the main wrapper.
2. HEADER: Include a board header with a flex container `justify-between` holding the title/sprint info and right-aligned actions (e.g., Timeline, Add Task).
3. COLUMNS WRAPPER: Use `<div className="flex gap-4 overflow-x-auto pb-4">` to ensure horizontal scrolling for the board.
4. COLUMN CONTAINER: Each column must have `className="min-w-[300px] max-w-[320px] flex flex-col"`.
5. COLUMN HEADER: Ensure the header is styled with `rounded-t-lg border-t-2` and includes a status dot `w-2.5 h-2.5 rounded-full`, title, task count `<Badge variant="secondary" className="ml-auto text-xs">`, and an add button `<Button variant="ghost" size="icon">`. Ensure you map the colors properly per status.
6. TASK LIST BODY: Use `<div className="flex-1 space-y-2 p-2 bg-muted/20 rounded-b-lg border border-t-0 min-h-[200px]">` to house the task cards.
7. TASK CARD: Use `<Card className="border shadow-sm hover:shadow-md transition-all cursor-grab group">` and its `CardContent` with `p-3 space-y-2`.
8. CARD DETAILS: Include a `PriorityBadge`, title, description, tags (`Badge className="text-[10px] px-1.5 py-0"`), assignee, and due date. Provide an inline button for moving the task, using `opacity-0 group-hover:opacity-100 transition-opacity` to only show on hover.
9. DIALOG: Provide a task creation Dialog.
10. COMPONENT LIBRARY: Strictly import all components from `@cnma/react-ui`.
```

## 08. Copilot Full Page

**Skill Prompt:**
```text
When instructed to scaffold a Copilot Full Page floorplan, you MUST adhere to the following rules:
1. LAYOUT STRUCTURE: The root must be `<div className="flex flex-col h-full bg-muted/30">`. The inner area must use `<div className="flex-1 flex overflow-hidden">` to contain left, center, and right panels side-by-side.
2. HEADER: Top bar must have `bg-card border-b px-4 py-3 flex justify-between items-center shrink-0 z-10`.
3. LEFT PANEL (History): Use `<aside className="w-72 border-r bg-card flex flex-col shrink-0 animate-in slide-in-from-left-5 duration-300">`. It must contain a search input and a scrollable list of recent conversations.
4. CENTER CHAT STREAM: Use `<main className="flex-1 flex flex-col overflow-hidden min-w-0">`. The scrollable message area inside must have `className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"`. Use a `useRef` and `useEffect` to scroll to bottom upon message changes.
5. INPUT AREA: The bottom input area must have `className="px-4 py-3 bg-card border-t relative z-20"`. The inner input container must use `className="relative flex items-center gap-2 bg-muted/30 border rounded-2xl p-2 pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all"`. Use `<Input className="flex-1 h-9 bg-transparent border-0 focus-visible:ring-0 shadow-none text-sm px-0">` for user typing.
6. RIGHT PANEL (Context): Use `<aside className="w-80 border-l bg-card hidden lg:flex flex-col shrink-0">`. Inside, provide live data sections using `Card className="border shadow-none bg-muted/30"`.
7. COMPONENT LIBRARY: Strictly import all components from `@cnma/react-ui`.
8. VISUALS: Use `lucide-react` icons (e.g. `Sparkles`, `Paperclip`, `Send`). Ensure the background of the panels is `bg-card` and the main body background is `bg-muted/30`.
```

## Object Page Sidebar Skill

When asked to implement an **Object Page Sidebar**, you MUST adhere to the following rules:

1. **Root Wrapper**: Use `<div className="flex h-[calc(100vh-120px)] rounded-xl border bg-card shadow-sm overflow-hidden">`.
2. **Sidebar**: 
   - Wrap the sidebar in `<div className="w-56 bg-muted/20 border-r flex flex-col">`.
   - Wrap the navigation list inside a `ScrollArea`.
   - Navigation links should look like `<button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ...">`.
3. **Scroll Spy Navigation**: 
   - Implement an `IntersectionObserver` to automatically update the active sidebar link as the user scrolls. Use `-20% 0px -70% 0px` root margin for accuracy.
   - Sidebar buttons must trigger `scrollIntoView({ behavior: 'smooth' })` targeting the specific section ID.
4. **Content Area**: 
   - Must be wrapped in `<ScrollArea className="flex-1 p-4">`.
   - The inner wrapper must have `space-y-8 pb-32` to space out sections and allow the bottom-most section to scroll up properly.
5. **Sections**: 
   - Every major content group (Card or DataTable) must be wrapped in a container `<div id="section-{id}" className="scroll-mt-4">` to handle scroll offset below the header.
6. **Edit Mode**: Include an `isEditing` state that toggles input fields versus plain text display in the General and Supplier data cards.

## Analytical Dashboard Skill

When asked to implement an **Analytical Dashboard**, you MUST adhere to the following rules:

1. **Root Wrapper**: Use a simple vertical stack layout without restricted heights: `<div className="space-y-4 p-2 sm:p-4">`. Do NOT use `max-w-*` on the dashboard, let it fill the space.
2. **Top Filter Bar**: Place global filters here. If you don't have a dedicated `FilterBar` component, simulate one with a stylized container containing a title (e.g. "Procurement Insights") and filter inputs.
3. **KPI Row**: Use a responsive grid (e.g. `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`). 
   - Cards should have `className="border shadow-sm hover:shadow-md transition-shadow"`.
   - Inner content uses `<CardContent className="p-4">`.
   - Always display clear trend indicators (e.g. ↗ or ↘) with colored text (`text-primary`, `text-warning`, `text-destructive`).
4. **Charts Row**: Place Recharts elements in responsive grids (`lg:grid-cols-2`). 
   - All charts MUST be wrapped in `<ResponsiveContainer width="100%" height={280}>` (explicit height is required).
5. **Bottom Section**: Combine DataTables and secondary widgets (like Alerts) in a responsive grid. For example: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">` where the table takes `lg:col-span-2` and the widget takes the remaining column.

## List Report Skill

When asked to implement a **List Report**, you MUST adhere to the following rules:
1. **Root Wrapper**: Use a container with `flex flex-col min-h-[calc(100vh-120px)] gap-4 p-2 sm:p-4 bg-background`.
2. **Worklist Tabs (Optional)**: If segmenting data, use `WorklistTabBar` with `variant="pills"`.
3. **FilterBar**: Use `FilterBar` component for advanced filtering and `VariantSelector` for saving view variants.
4. **Main Content Card**: The data table wrapper must have `flex-1 bg-card rounded-xl border shadow-md min-w-0` and `style={{ overflowX: 'clip' }}`.
5. **Sticky Toolbar**: Wrap the table toolbar in `<div className="sticky top-0 z-30 bg-card rounded-t-xl">` so it stays visible during scroll.
6. **DataTable**: Use the `DataTable` component configured with `stickyHeader`, `stickyHeaderOffset`, and pagination.

## Object Page Tab Based Skill

When asked to implement an **Object Page Tab Based**, you MUST adhere to the following rules:
1. **Root Wrapper**: Use a scrollable container `<ScrollArea className="h-[calc(100vh-120px)] bg-muted/30">` with an inner wrapper `<div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">`.
2. **Object Header**: A fixed header displaying core KPIs and Title in a `Card`.
3. **Tabs Layout**: Use `Tabs` component to separate different sections.
4. **Sections**: Content for each tab goes into `TabsContent`, utilizing `Card` or `DataTable` for data.

## Process Flow Diagram Skill

When asked to implement a **Process Flow Diagram**, you MUST adhere to the following rules:
1. **Root Wrapper**: Use `<div className="flex h-full w-full">`.
2. **Canvas Area**: Wrap the React Flow component in `<div className="flex-1 relative">`.
3. **Detail Side Panel**: Wrap the side panel in `<div className="shrink-0 border-l bg-card/50 p-3">`.
4. **Custom Nodes**: Create custom nodes representing different steps and use status colors (emerald, blue, amber, etc.) for visual feedback.

## Wizard Process Skill

When asked to implement a **Wizard Process**, you MUST adhere to the following rules:
1. **Root Wrapper**: Use `<div className="flex flex-col h-[calc(100vh-120px)] bg-muted/30">`.
2. **Header**: Contains the Wizard Stepper component tracking progress.
3. **Body Area**: Use a `ScrollArea` that takes the remaining space, centered with `max-w-4xl mx-auto py-8 px-4`.
4. **Footer**: Sticky footer with Cancel/Back/Next/Submit actions.

## Flexible Column Layout Skill

When asked to implement a **Flexible Column Layout**, you MUST adhere to the following rules:
1. **Root Wrapper**: Use `<div className="flex h-[calc(100vh-120px)] bg-background overflow-hidden">`.
2. **Columns**: Divide the layout into Master, Detail, and potentially Sub-Detail columns using dynamic width classes (e.g. `w-full`, `w-1/3`, `w-2/3`, `w-[0px]`) based on the layout state.
3. **Transitions**: Ensure smooth transitions using `transition-all duration-300 overflow-hidden`.
4. **Independent Scrolling**: Each column must have its own scrolling container `flex-1 overflow-auto`.

## Settings Profile Skill

When asked to implement a **Settings Profile**, you MUST adhere to the following rules:
1. **Root Wrapper**: Use `<div className="flex flex-col h-full bg-muted/30 min-h-screen">`.
2. **Layout**: Split into a Master sidebar for navigation and a Detail panel for content using `<div className="flex-1 max-w-6xl mx-auto w-full flex overflow-hidden p-4 md:p-8 gap-8">`.
3. **Sidebar**: Use `<aside className="w-64 shrink-0 hidden md:block space-y-2">`.
4. **Main Panel**: Use `<main className="flex-1 space-y-6">` and render form fields or other configurations dynamically based on the active tab.
