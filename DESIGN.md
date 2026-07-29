---
name: Pastello Luxe Narrative
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#504447'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#827377'
  outline-variant: '#d4c2c6'
  surface-tint: '#805062'
  primary: '#805062'
  on-primary: '#ffffff'
  primary-container: '#f8bbd0'
  on-primary-container: '#76485a'
  inverse-primary: '#f2b6cb'
  secondary: '#b7004d'
  on-secondary: '#ffffff'
  secondary-container: '#de2264'
  on-secondary-container: '#fffbff'
  tertiary: '#615e57'
  on-tertiary: '#ffffff'
  tertiary-container: '#d0cbc3'
  on-tertiary-container: '#58564f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e4'
  primary-fixed-dim: '#f2b6cb'
  on-primary-fixed: '#330f1f'
  on-primary-fixed-variant: '#65394b'
  secondary-fixed: '#ffd9de'
  secondary-fixed-dim: '#ffb2bf'
  on-secondary-fixed: '#3f0016'
  on-secondary-fixed-variant: '#90003b'
  tertiary-fixed: '#e7e2d9'
  tertiary-fixed-dim: '#cbc6bd'
  on-tertiary-fixed: '#1d1b16'
  on-tertiary-fixed-variant: '#494640'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  cream: '#FFF9F0'
  beige-soft: '#F5F5DC'
  surface-dark: '#121212'
  surface-light: '#FFFFFF'
  border-subtle: '#EFEFEF'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 64px
---

## Brand & Style

This design system is crafted for a high-end, bespoke confectionery experience. It balances the warmth of a neighborhood bakery with the clinical precision and premium finish of a luxury boutique. The aesthetic is rooted in **Minimalism** with **Glassmorphism** accents, prioritizing high-quality food photography as the primary visual driver.

The interface should feel airy and expansive, evoking a sense of calm and indulgence. By utilizing generous whitespace and a soft, rhythmic layout, the design system ensures that the intricate details of the pastries remain the focal point. The emotional response is one of effortless sophistication—user interactions should feel fluid, soft, and intentional, mirroring the texture of a premium buttercream.

Key visual principles:
- **Photography First:** Large, high-resolution imagery with soft natural lighting.
- **Translucency:** Subtle glass effects on navigation bars and overlays to maintain a sense of depth.
- **Fluidity:** Every transition should feel "creamy" rather than mechanical.

## Colors

The palette is built on a foundation of "Pastry Tones"—creams, whites, and soft beiges—complemented by varying intensities of pink. 

- **Primary:** The signature Pastel Pink (#F8BBD0) is used for soft backgrounds, selection states, and secondary emphasis.
- **Secondary:** Intense Pink (#D81B60) is reserved strictly for high-priority Call to Actions (CTAs) and critical interactive states to ensure accessibility and conversion.
- **Neutral:** A deep, off-black is used for typography to maintain high contrast without the harshness of pure black.
- **Surface Strategy:** In Light Mode, we use a mix of pure white and cream to create soft "paper-like" layering. In Dark Mode, the palette shifts to deep charcoals with subtle pink-tinted overlays to maintain the brand's warmth.

## Typography

The typography system uses **Inter** for its modern, clean, and highly legible characteristics. While the brand is luxury, we avoid traditional serifs in favor of a "Tech-Luxury" vibe similar to Apple.

Headlines use tighter letter spacing and heavier weights to create a strong visual anchor. Body text is optimized for readability with generous line heights. The "label-md" style is specifically designed for small metadata (like ingredients or dimensions), using all-caps and increased tracking to maintain a premium feel even at small scales.

## Layout & Spacing

This design system follows a **Mobile-First** fluid grid. The spacing logic is based on an 8px rhythmic scale (with 4px increments for micro-adjustments).

- **Mobile:** A single-column layout with 20px side margins. Cards and interactive elements span the full width of the safe area.
- **Desktop:** A centered 12-column fixed grid (max-width 1280px).
- **Vertical Rhythm:** We use "Stack" tokens to maintain consistency between elements. Section gaps are intentionally large (64px+) to enforce the "High-End" minimalist aesthetic and prevent the UI from feeling cluttered.

## Elevation & Depth

Elevation is achieved through **Tonal Layering** and **Ambient Shadows** rather than harsh outlines.

- **Surface Levels:** 
    - Level 0: Main background (White/Cream in light, Deep Charcoal in dark).
    - Level 1: Primary cards and containers (Subtle white fill with a 2% black shadow).
    - Level 2: Modals and floating elements (8% shadow with a larger blur radius).
- **Shadow Character:** Shadows should be tinted with a hint of the brand color (e.g., a very desaturated pink-tinted shadow) to avoid a "dirty" gray look on cream surfaces.
- **Backdrop Blur:** Navigation bars and sticky headers should use a 20px blur with 80% opacity to allow the content colors to bleed through as the user scrolls.

## Shapes

The shape language is "Extra Rounded" to evoke the organic, soft nature of the products. 

- **Primary Elements:** Buttons and Input fields use a 12px (0.75rem) radius.
- **Secondary Elements:** Product cards and image containers use a 24px (1.5rem) radius.
- **Selection Indicators:** Checkboxes and small selection chips should use a fully pill-shaped (rounded-full) geometry to provide a tactile, friendly feel.

## Components

- **Buttons:** Large hit areas (min 48px height). Primary CTA uses the Intense Pink with white text. Secondary buttons use a transparent background with a subtle border or a soft pastel pink fill.
- **Product Cards:** Full-width images on mobile with a slight zoom effect on hover/tap. The price and title should be clearly separated using the "Headline-sm" and "Body-md" typography.
- **Stepper:** A minimalist horizontal line with soft glowing dots. Current step is indicated by a scale-up animation and a transition to the Primary Pink.
- **Inputs:** Floating labels with a light beige or soft gray background. On focus, the border transitions to Primary Pink with a soft outer glow (bloom).
- **Chips:** Used for "Size" or "Flavor" selection. Unselected chips have a neutral border; selected chips have a Primary Pink background and a subtle bounce animation.
- **Bottom Navigation:** A glassmorphic bar with centered icons. The "Create" action should be a prominent, slightly elevated central icon.