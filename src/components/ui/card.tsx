import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils/cn';

const CARD_VARIANT = {
  product: 'product',
  selection: 'selection',
  default: 'default',
} as const;
type CardVariant = keyof typeof CARD_VARIANT;

interface CardProps {
  variant?: CardVariant;
  /** product variant */
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  /** product: favorite toggle */
  showFavorite?: boolean;
  favorited?: boolean;
  onFavorite?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** selection: selected state + selection click */
  selected?: boolean;
  onSelect?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** generic content for default variant */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Card — server component by default. Interactive handlers (onFavorite, onSelect)
 * require a client parent. Three variants:
 *  - product: square image (card-zoom hover), glassmorphic favorite button,
 *    title/description/price with brand typographic hierarchy.
 *  - selection: selectable radio-style card; border-secondary when selected.
 *  - default: plain container, no image.
 */
export function Card({
  variant = 'default',
  title,
  description,
  price,
  imageUrl,
  imageAlt = '',
  category,
  showFavorite = true,
  favorited = false,
  onFavorite,
  selected = false,
  onSelect,
  children,
  className,
}: CardProps) {
  if (variant === 'product') {
    return (
      <article
        className={cn(
          'card-zoom group relative overflow-hidden rounded-lg bg-surface-light shadow-card',
          className,
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={imageAlt || title || ''}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
          {showFavorite && (
            <button
              type="button"
              onClick={onFavorite}
              aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              aria-pressed={favorited}
              className="glass-effect absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-secondary transition duration-200 active:scale-90"
            >
              <Icon name="favorite" fill={favorited ? 1 : 0} size={1.25} />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 p-4">
          {category && (
            <span className="text-label-md uppercase tracking-wide text-on-surface-variant">
              {category}
            </span>
          )}
          {title && <h3 className="text-headline-sm text-on-surface">{title}</h3>}
          {description && (
            <p className="text-body-sm text-on-surface-variant">{description}</p>
          )}
          {price !== undefined && (
            <p className="mt-1 text-headline-sm font-semibold text-secondary">
              ${price.toFixed(2)}
            </p>
          )}
        </div>
      </article>
    );
  }

  if (variant === 'selection') {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'flex w-full flex-col gap-2 rounded-lg bg-surface-light p-4 text-left transition-all duration-300',
          selected
            ? 'border-2 border-secondary shadow-elevated'
            : 'border-2 border-transparent hover:border-outline-variant',
          className,
        )}
      >
        {imageUrl && (
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-surface-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={imageAlt || title || ''}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        {title && <h3 className="text-headline-sm text-on-surface">{title}</h3>}
        {description && (
          <p className="text-body-sm text-on-surface-variant">{description}</p>
        )}
        {price !== undefined && (
          <p className="mt-1 text-headline-sm font-semibold text-secondary">
            ${price.toFixed(0)}
          </p>
        )}
        {children}
      </button>
    );
  }

  return (
    <article
      className={cn('rounded-lg bg-surface-light p-4 shadow-card', className)}
    >
      {title && <h3 className="text-headline-sm text-on-surface">{title}</h3>}
      {description && (
        <p className="mt-1 text-body-sm text-on-surface-variant">{description}</p>
      )}
      {children}
    </article>
  );
}