import { cn } from '@/lib/utils/cn';

interface IconProps {
  name: string;
  weight?: number; // 100-700
  fill?: 0 | 1;
  size?: number; // rem
  className?: string;
}

/**
 * Material Symbols Outlined variable-font wrapper.
 * Server component — no client state/effects. The `material-symbols-outlined`
 * class is provided by the font loaded in the root layout (B04, layout.tsx).
 */
export function Icon({
  name,
  weight = 400,
  fill = 0,
  size = 1.5,
  className,
}: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined select-none leading-none', className)}
      style={{
        fontSize: `${size}rem`,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}