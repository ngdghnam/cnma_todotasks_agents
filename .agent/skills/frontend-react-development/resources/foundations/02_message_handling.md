# Foundation: Message Handling — Version 2

## 1. Principles
Non-blocking feedback for success, contextual alerts for warnings, and blocking dialogs only for destructive actions.

### Anti-Spam Rule
- **DO** aggregate validation errors into a single footer badge
- **DON'T** show a toast for every field error

## 2. Message Tiers

### Tier 1: Transient (Toast)
| Aspect | Specification |
|--------|--------------|
| Component | `toast()` from `@cnma/react-ui/sonner` |
| Position | `top-right` (default, configurable in `sonner.tsx`) |
| Duration | 3–5 seconds (auto-dismiss) |
| Variants | `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()` |
| Styling | Themed via `Toaster` — left border colored by variant |

```tsx
import {  toast  } from "@cnma/react-ui";

toast.success("Changes saved", { description: "All fields updated." });
```

> **Rule**: Never use auto-dismissing toasts for critical errors.

### Tier 2: Section-Level (Alert)
| Aspect | Specification |
|--------|--------------|
| Component | `Alert` from shadcn/ui |
| Position | Inline at top of page, section, or card |
| Variants | `default` (info), `destructive` (error) |
| Duration | Persistent until dismissed or condition resolved |

### Tier 3: Field-Level (Form Validation)
| Aspect | Specification |
|--------|--------------|
| Component | Form field state (react-hook-form + zod) |
| Style | Red border (`ring-destructive`) + error text below input |
| Trigger | On blur or on submit |

### Tier 4: Aggregated Global (Message Manager)
| Aspect | Specification |
|--------|--------------|
| Component | Custom Footer Message Toggle |
| Position | Left side of floating footer |
| Appearance | Ghost button with error count badge |
| Interaction | Click opens popover → click message scrolls to field |

### Tier 5: Critical Blocking
| Aspect | Specification |
|--------|--------------|
| Component | `AlertDialog` from shadcn/ui |
| Position | Modal overlay |
| Use Cases | Delete, Unsaved changes, System error |

## 3. Decision Tree
```
User action → Success?
  ├─ Yes → toast.success() (Tier 1)
  └─ No → How many errors?
       ├─ Single field → Field-level error (Tier 3)
       ├─ Multiple fields → Footer badge (Tier 4)
       └─ System/blocking → AlertDialog (Tier 5)
```
