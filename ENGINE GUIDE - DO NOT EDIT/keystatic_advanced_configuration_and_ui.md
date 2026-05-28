# 🧠 Zee Engine Mastermind Knowledge Base: Keystatic Advanced Configuration & Extensibility
### Last Updated: May 2026 | Status: ARCHITECTURAL MASTER PLAN

This document captures the advanced architectural patterns for extending the Keystatic CMS within the Zee Engine. It documents the paradigm shift from a simple TypeScript configuration to a rich, React-powered JSX environment (`.tsx`), the nuances of custom MDX content components, and the resolution of strict TypeScript compilation hurdles.

This is the definitive guide for engineers tasked with extending the CMS dashboard UI without breaking the multi-tenant Astro engine.

---

## 1. The Core Philosophy: Local-Only, React-Powered

Keystatic is unique in the Astro ecosystem because it is **not a hosted CMS**. It is an embedded React application that runs locally in the user's browser, writes directly to the local file system (via Git or local mode), and is subsequently compiled out of existence by Astro during the production build.

### The React Execution Context
Although the Zee Engine is built on Astro and Alpine.js, the `/keystatic` dashboard is a pure React application. This creates an environment boundary:
*   **The Frontend (Storefront):** Uses `.astro` components, Alpine.js, and strict Tailwind v4.
*   **The Backend (CMS Dashboard):** Uses React, Keystar UI (Keystatic's internal design system), and raw JSX.

You cannot import `.astro` components (like our `Icon.astro` primitive) into the Keystatic configuration. Attempting to do so will result in runtime crashes (e.g., `KeystarProvider` context errors), as React has no idea how to render Astro's server-side islands.

---

## 2. The `.tsx` Migration (Rich Dashboard Previews)

To unlock the full potential of Keystatic's WYSIWYG editor, the configuration file must be named `keystatic.config.tsx` (not `.ts`). 

### Why TSX?
Using a `.tsx` extension instructs the Vite bundler to parse raw React JSX within the configuration. This is required for two advanced capabilities:
1.  **Zero-Bloat UI Icons:** Injecting raw SVG paths directly into the CMS toolbar.
2.  **Live Visual Previews:** Rendering interactive, styled React components directly on the drafting canvas when a user inserts a custom block.

### The "Zero-Bloat" Icon Strategy
When adding custom tools (like a "Contact Token") to the Keystatic toolbar, they require an icon. 
*   **The Wrong Way:** Installing `@phosphor-icons/react` or `@heroicons/react` just to render one icon in the CMS. This bloats the `package.json` and risks dependency conflicts.
*   **The Zee Engine Way:** Since the storefront already uses `phosphor-icons-astro`, we "borrow" the raw SVG `<path>` data from the open-source library and inject it directly into the config as a static React node.

```tsx
// Example: Raw Phosphor Icon Injection
const contactIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="24" height="24" fill="currentColor">
    <path d="M224,48H32A16..." />
  </svg>
);
```
*Note: We set `width="24" height="24"` to ensure optical balance with Keystatic's default Lucide-based toolbar icons.*

---

## 3. Custom MDX Content Components: `mark`, `inline`, and `block`

Keystatic provides three distinct APIs for extending the rich-text editor, imported from `@keystatic/core/content-components`. Choosing the right one is critical for both the editor UX and the resulting MDX output.

### A. The `mark()` Component
*   **Purpose:** Wraps selected inline text with a semantic HTML tag (like `<strong>`, `<em>`, or `<a>`).
*   **Behavior:** Acts like a standard word-processor formatting tool. The user highlights text, clicks the icon, and fills out the schema (e.g., providing a URL or selecting an email address).
*   **Configuration:** Requires a `tag` property (e.g., `tag: 'a'`) which Keystatic uses to format the text visually in the editor.
*   **Use Case:** The `ContactMark`, which turns standard text into a `mailto:` or `tel:` link dynamically via the CMS.

### B. The `inline()` Component
*   **Purpose:** Inserts a standalone "chip" or "token" that sits seamlessly inside the flow of a sentence.
*   **Behavior:** It does not wrap text. It is a self-contained data node (e.g., `Please contact [Token] for help.`).
*   **Configuration:** Requires the `ContentView` property to render a React preview in the editor.
*   **Use Case:** The `ContactToken`, acting as a dynamic variable injection pill.

### C. The `block()` Component
*   **Purpose:** Inserts a full-width, structural element that breaks the paragraph flow.
*   **Behavior:** Sits on its own line. Ideal for rich media, complex forms, or stylized callouts.
*   **Configuration:** Like `inline()`, it uses the `ContentView` property. You can build complete, high-fidelity React interfaces inside this function to preview the block exactly as it might look on the frontend.
*   **Use Case:** Image Galleries, YouTube Embeds, or stylized Warning Banners.

### The `ContentView` Execution Pipeline
When building `inline` or `block` components, the `ContentView` function receives a `props` object containing the live, reactive values of the fields. As the user types in the Keystatic sidebar, the React preview on the canvas updates instantly.

```tsx
import { inline } from '@keystatic/core/content-components';

const contactToken = inline({
  label: 'Contact Token',
  icon: contactIcon,
  schema: { /* ... */ },
  ContentView: (props) => (
    <span style={{ background: '#f3ede6', padding: '2px 6px', borderRadius: '4px' }}>
      [Token] {props.value.contactType.discriminant}: {props.value.contactType.value}
    </span>
  )
});
```

---

## 4. Strict TypeScript Adherence & Image Fields

When migrating a large `keystatic.config.ts` to strict `.tsx`, TypeScript will aggressively flag deprecated properties or loose typings. 

### The `transformFilename` Revelation
A major failure point encountered during engine scaling was related to `fields.image`. 
Legacy tutorials or older versions of Keystatic often used a `filename` property to dictate how images should be saved (e.g., `filename: ({ slug }) => slug`).

**This is deprecated and invalid in strict TypeScript.**
The correct, type-safe property in `@keystatic/core` is `transformFilename`.

*   **Wrong:** `filename: ({ slug, count }) => \`${slug}-i${count}\``
*   **Right:** `transformFilename: (slug: string, count?: number) => \`${slug}-i${(count || 1) - 1}\``

**Key Takeaways for Image Fields:**
1.  **Always type the parameters:** `slug: string` and `count?: number`.
2.  **Handle undefined counts:** If an image field is not part of a gallery/array, `count` will be undefined. You must provide a fallback (e.g., `count || 1`) before performing mathematical operations like `- 1`.
3.  **Zero-Index Alignment:** As documented in the Ghost Operator guide, gallery arrays often require `count - 1` to align with the `g0.jpg` zero-index convention of the Media Master Repo.

---

## 5. Troubleshooting & Common Compilation Errors

If `npx astro check` or `npx tsc --noEmit` fails on the Keystatic configuration, consult this matrix:

| Error Message | Root Cause | Surgical Fix |
| :--- | :--- | :--- |
| `Type 'ComponentBlock' is not assignable to type 'MarkComponent'` | You placed a `block()` or `inline()` component inside an object that TypeScript inferred should only contain `mark()` configs, usually because of missing properties. | Ensure your `fields.mdx` `components` block correctly mixes imported `mark`, `inline`, and `block` components. Do not copy-paste configs blindly. |
| `Property 'icon' is missing in type...` | You forgot to define an `icon` on an `inline()` or `mark()` config. | Provide a React SVG element to the `icon` property. |
| `Property 'filename' does not exist in type...` | You are using the deprecated `filename` property inside `fields.image`. | Replace `filename` with `transformFilename`. |
| `Cannot find name 'inline'` | You forgot to import the specific component API. | Add it to your imports: `import { mark, inline, block } from '@keystatic/core/content-components';` |
| `Type 'string' is not assignable to type 'ReactElement'` | You returned a plain string from `ContentView` or `preview`. | Wrap the string in a basic React fragment or tag: `(props) => <span>{props.value}</span>`. |

---

## 6. Official References & Further Learning

To master Keystatic's rich editor capabilities, refer to these authoritative sources:

1.  **Egghead.io Keystatic Course (The Catalyst):** 
    *   *Reference:* "Build a custom Keystatic component block for rich live previews."
    *   *Concept:* Using `component()` (or `block()`) to hijack the editor canvas for dynamic React rendering.
2.  **Official Keystatic Documentation:**
    *   *URL:* [keystatic.com/docs/content-components](https://keystatic.com/docs/content-components)
    *   *Key Pages:* Read the specifications for `mark`, `inline`, and `block` carefully. They have slightly different prop signatures (`ContentView` vs `schema` requirements).
3.  **Phosphor Icons Library:**
    *   *URL:* [phosphoricons.com](https://phosphoricons.com/)
    *   *Workflow:* Search for an icon, inspect the page, and copy the raw `<path d="...">` directly into your `.tsx` config. Zero dependencies required.

---
**Summary:** By treating the Keystatic configuration not just as a schema definition, but as a robust React application in its own right, the Zee Engine empowers non-technical users with a beautiful, visual, and highly dynamic authoring environment—all while keeping the production Astro build lightweight and perfectly typed.