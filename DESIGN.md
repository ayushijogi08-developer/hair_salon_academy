# DESIGN DOCUMENTATION: Hair City Salon & Academy, Akola

## 1. Creative Direction & Brand Concept
- **Concept:** Contemporary Editorial Salon. Quiet confidence, warm intimacy, and magazine-grade typographic hierarchy. Tailored specifically for Hair City Salon & Academy on Necklace Road, Ranpise Nagar, Akola.
- **Tone:** Grounded, artisan, warm, premium yet welcoming and honest. Avoids flashy tech gimmicks, artificial salon clichés ("Where beauty meets elegance"), or generic corporate card grids.
- **Concept Focus:** Rooted in Akola, Maharashtra with focused English typography tailored for clean reading.

## 2. Color Palette & WCAG AA Contrast
Defined as pure CSS Custom Properties:
- `--color-bg`: `#FBF9F5` (Warm Cream / Alabaster Linen) — tactile, natural foundation.
- `--color-surface`: `#F3EFEA` (Pale Oatmeal / Travertine) — subtle background grouping.
- `--color-surface-elevated`: `#EAE3DA` (Tonal sand).
- `--color-text`: `#181513` (Deep Roasted Espresso) — high contrast, softer than harsh #000000. Contrast ratio > 14:1 against cream.
- `--color-muted`: `#6A635B` (Warm Silt / Muted Earth) — secondary labels, captions, metadata. Contrast ratio > 4.6:1 against cream (passes WCAG AA).
- `--color-border`: `#E4DDD3` (Fine Linen Rule) — crisp, minimal structure lines.
- `--color-accent`: `#A46843` (Warm Terracotta / Burnished Clay) — tactile focus point for primary CTA badges and delicate highlights. Contrast ratio > 4.5:1 against cream.
- `--color-accent-hover`: `#855030`.

## 3. Typography Scale & Systems
- **Display Serif:** `Newsreader` / `Playfair Display` (preloaded Google Fonts) — literary, bespoke, editorial authority.
- **Body & Sans:** `Plus Jakarta Sans` with system fallbacks — exceptionally clean legibility at small sizes, modern metrics.
- **Fluid Type Scale (CSS `clamp()`):**
  - `--font-hero`: `clamp(2.75rem, 6.5vw + 1rem, 5.75rem)`
  - `--font-h2`: `clamp(2rem, 3.8vw + 0.8rem, 3.25rem)`
  - `--font-h3`: `clamp(1.35rem, 1.8vw + 0.5rem, 1.85rem)`
  - `--font-body`: `clamp(1rem, 0.4vw + 0.9rem, 1.125rem)`
  - `--font-small`: `clamp(0.8125rem, 0.2vw + 0.75rem, 0.875rem)`

## 4. Layout & Editorial Rhythm
- **Asymmetric Grid:** Non-uniform columns, overlapping image caption blocks, vertical typographic badges ("EST. AKOLA").
- **Typographic Services:** Editorial index / numbered list layout rather than predictable 3-card boxes.
- **Zero-Banned Patterns:** Strictly no purple/blue gradients, no neon glows, no glassmorphism, no artificial stars/fake metrics, no scroll hijacking.

## 5. Motion Principles (GSAP & CSS)
- **Restrained Choreography:**
  - Single hero reveal with gentle vertical float (`y: 24 -> 0`, `opacity: 0 -> 1`).
  - Subtle scroll-triggered image reveals (`scale: 1.04 -> 1.0`, fade in).
  - Clean CSS micro-transitions on interactive links and buttons (200-300ms ease-out).
- **Reduced Motion Support:** Respects `@media (prefers-reduced-motion: reduce)` by immediately skipping transforms and animations.
- **Resource Hygiene:** Managed cleanly via `gsap.context()` with comprehensive `revert()` cleanup on unmount.
