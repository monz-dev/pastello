import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind v4 ships tokens via `@theme` CSS custom properties, but tailwind-merge
 * has no JS config to read in v4. Without registration it does not know our
 * custom `--text-*` (font-size) or `--color-*` tokens, so it falls back to its
 * `text-color` group which (via an `isAny`-ish validator) swallows ANY
 * `text-*` class. The result: every component that combines a custom size
 * class (`text-body-md`) with a color class (`text-white` / `text-secondary`)
 * silently loses one of them, because both land in the same conflict group and
 * tailwind-merge keeps only the last.
 *
 * We register our theme tokens so tailwind-merge can tell `font-size` from
 * `text-color` (and box-shadow from shadow-color), preserving both when merged.
 *
 * NOTE: `fontSize` is NOT a default tailwind-merge theme group — font sizes must
 * be registered via `classGroups['font-size']`, while custom colors go in
 * `theme.colors`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      colors: [
        'surface',
        'surface-dim',
        'surface-bright',
        'surface-container-lowest',
        'surface-container-low',
        'surface-container',
        'surface-container-high',
        'surface-container-highest',
        'on-surface',
        'on-surface-variant',
        'inverse-surface',
        'inverse-on-surface',
        'outline',
        'outline-variant',
        'surface-tint',
        'primary',
        'on-primary',
        'primary-container',
        'on-primary-container',
        'inverse-primary',
        'primary-fixed',
        'primary-fixed-dim',
        'on-primary-fixed',
        'on-primary-fixed-variant',
        'secondary',
        'on-secondary',
        'secondary-container',
        'on-secondary-container',
        'secondary-fixed',
        'secondary-fixed-dim',
        'on-secondary-fixed',
        'on-secondary-fixed-variant',
        'tertiary',
        'on-tertiary',
        'tertiary-container',
        'on-tertiary-container',
        'tertiary-fixed',
        'tertiary-fixed-dim',
        'on-tertiary-fixed',
        'on-tertiary-fixed-variant',
        'error',
        'on-error',
        'error-container',
        'on-error-container',
        'cream',
        'beige-soft',
        'surface-dark',
        'surface-light',
        'border-subtle',
      ],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'display-lg',
            'display-lg-mobile',
            'headline-md',
            'headline-sm',
            'body-lg',
            'body-md',
            'body-sm',
            'label-md',
            'button-text',
          ],
        },
      ],
      shadow: [{ shadow: ['card', 'modal', 'elevated', 'top'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
