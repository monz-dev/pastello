import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const BUTTON_VARIANT = {
  primary: 'bg-secondary text-white hover:brightness-110',
  secondary:
    'bg-surface-light border border-outline-variant text-primary hover:brightness-110',
  ghost: 'bg-transparent hover:bg-primary-container/40',
} as const;
type ButtonVariant = keyof typeof BUTTON_VARIANT;

const BUTTON_SIZE = {
  sm: 'h-9 px-4 text-body-sm',
  md: 'h-12 px-6 text-button-text',
  lg: 'h-14 px-8 text-body-lg',
} as const;
type ButtonSize = keyof typeof BUTTON_SIZE;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

/**
 * Inline SVG spinner — NOT Material Symbols, per T-025 spec.
 * Animates via Tailwind `animate-spin`.
 */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Button — server component by default.
 * `onClick` and other handlers can only be passed from a client parent.
 * Variants: primary (CTA), secondary (outline), ghost (transparent).
 * Sizes: sm 36px, md 48px (default), lg 56px.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-200 ease-in-out active:scale-95',
        fullWidth && 'w-full',
        BUTTON_VARIANT[variant],
        BUTTON_SIZE[size],
        isDisabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}