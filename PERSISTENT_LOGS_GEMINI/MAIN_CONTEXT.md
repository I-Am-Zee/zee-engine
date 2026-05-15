# Zelia Vance Engine - Main Context Reference
This is a multi-tenant e-commerce engine (Brand #1: Zelia Vance). Before attempting any task, agents MUST understand:
1. **Tailwind v4 Strict Syntax**: ALWAYS use the CSS variable shorthand (e.g., `bg-(--color-surface)`), never `bg-surface` or `bg-[var(--color-surface)]`. All tokens are in `global.css` `@theme`.
2. **Atomic Design & Primitives**: Components like `Heading.astro` and `Text.astro` manage their own fluid typography (`clamp()`). Do NOT override them with hardcoded `text-sm` or `text-3xl` classes.
3. **Alpine.js & Data Flow**: Never pass raw Astro collection entries to Alpine. Always flatten them into plain, JSON-safe objects first.
4. **Component Hierarchy**: `Primitives` (pure UI/props) -> `UI Components` (molecules) -> `Feature Components` (organisms with behaviors).
5. **Mandatory Reading**: Always refer to `AGENTS.md` and `@Project_Skill/` files for exact API signatures and execution protocols.
