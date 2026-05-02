# Global Motion Standard: Zelia Vance

> **Reference File**
> Stored to prevent hallucination and maintain architectural purity.
> This is the single source of truth for the "Soft Pulse" physics profile.

## The Problem with Previous Iterations
Using `ease-out` in plain CSS does not mathematically match Tailwind's `ease-out`. This caused "snappy glitches" when a container used Tailwind and an image used vanilla CSS.

## The Verified Solution (Tailwind Play)
By explicitly defining `transition-property: all` along with Tailwind's exact cubic-bezier curve in a single global utility, we achieve perfect synchronicity across all CSS properties (transforms, shadows, opacities, background colors) in both containers and child elements.

### The CSS (To be placed in global.css)
```css
@layer utilities {
  .motion-soft {
    transition-duration: 500ms;
    transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transition-property: all;
  }
}
```

### The HTML Usage Example
```html
<div class="flex h-screen items-center justify-center bg-zinc-950">
  <!-- We apply the .motion-soft class here -->
  <div class="motion-soft group cursor-pointer rounded-2xl bg-white/10 p-8 hover:bg-white/20 hover:scale-110">
    
    <div class="motion-soft h-16 w-16 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:bg-fuchsia-500 group-hover:shadow-[0_0_30px_rgba(217,70,239,0.8)]">
    </div>
    
    <p class="motion-soft mt-4 font-mono text-white opacity-50 group-hover:opacity-100">
      Zelia Vance Motion
    </p>
  </div>
</div>
```

## Rules of Engagement
1. **Never** hardcode `transition-all duration-500 ease-out` inline across dozens of files.
2. **Never** use vanilla CSS `ease-out` keywords when trying to sync with Tailwind components.
3. **Always** use `.motion-soft` when a component requires the premium, unified Zelia Vance physics profile.
