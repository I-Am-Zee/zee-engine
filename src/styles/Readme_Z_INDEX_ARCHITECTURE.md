# Z-Index Architecture

To prevent z-index wars and clipping bugs, we adhere strictly to the following global stacking context scale. 

> **Important Note:** Due to Tailwind CSS v4 compiler dropouts on local dev servers with dynamic `z-(--var)` and even static bracket `z-[100]` compilation, we DO NOT use CSS utility classes or inline styles for global z-index styling. 
> Instead, reference this document and use **our custom vanilla CSS utility classes** (defined in `global.css` under `.z-layer-*`) on all structural components to guarantee the browser flawlessly parses the stacking context while keeping HTML clean.

## Global Stacking Layers

| Component Level | Tailwind Class | Use Case |
|---|---|---|
| **Sticky UI** | `z-[50]` | Mobile sticky CTAs (Add to Cart, Buy Set, Lookbook actions) |
| **Dropdowns** | `z-[60]` | Navigation dropdowns (`NavDropdown`, `MenuToggle`) |
| **Toasts** | `z-[110]` | Push notifications (`CartToast`) |
| **Navbar** | `z-[100]` | Global desktop and mobile header (`Navbar`) |
| **Overlays** | `z-[110]` | Dimming underlays for modals and mobile menus |
| **Modals** | `z-[120]` | General popups, mobile drawer contents (`PopupModal`) |
| **Drawers** | `z-[200]` | High-priority side panels (`SideDrawer`) |
| **Snipcart** | `300 / 9999` | Snipcart DOM structural overrides (Maintained via `!important`) |
| **Lightbox** | `z-[400]` | Full-screen image galleries (Absolute highest priority) |

> **Note on Implementation:** Use Tailwind's arbitrary bracket syntax (e.g., `z-[100]`) on structural components to enforce these layers. Do NOT create custom CSS classes unless overriding third-party widgets like Snipcart.

## Component-Level Stacking
For elements strictly constrained inside a local stacking context (e.g., badges inside a `relative` glass card), you may use standard Tailwind classes like `z-10`, `z-20`, `z-30`. Note that these will NEVER escape their localized parent container and therefore will not overlap the global layers defined above.
