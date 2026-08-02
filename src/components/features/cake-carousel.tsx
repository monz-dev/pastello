'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SearchBar } from '@/components/features/search-bar';
import { cn } from '@/lib/utils/cn';
import type { Tables } from '@/types/supabase';

interface CakeCarouselProps {
  cakes: Tables<'pre_designed_cakes'>[];
  /** Optional favorite toggle handler. When provided, cards show the heart button. */
  onFavorite?: (cakeId: string) => void;
  className?: string;
}

/**
 * CakeCarousel — client island that owns the search query and renders the
 * pre-designed cakes as a horizontal snap-scroll row of product Cards.
 *
 * The query state lives here (per design: CakeCarousel holds
 * `useState(searchQuery)`). The SearchBar is a controlled input that emits
 * the value; the carousel filters cakes by name (case-insensitive) and
 * renders matching cards. When the filtered set is empty an explicit empty
 * state replaces the scroll row.
 */
export function CakeCarousel({
  cakes,
  onFavorite,
  className,
}: CakeCarouselProps) {
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const filtered =
    trimmed.length === 0
      ? cakes
      : cakes.filter((cake) => cake.name.toLowerCase().includes(trimmed));

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <SearchBar
        cakes={cakes}
        value={query}
        onValueChange={setQuery}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-light/60 px-4 py-16 text-center">
          <span className="material-symbols-outlined text-[3rem] text-on-surface-variant">
            search_off
          </span>
          <p className="text-body-md text-on-surface-variant">
            {trimmed.length === 0
              ? 'No hay pasteles disponibles por ahora.'
              : `No encontramos pasteles para «${query}».`}
          </p>
        </div>
      ) : (
        <div
          data-testid="cake-scroll"
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0"
          role="region"
          aria-label="Catálogo de pasteles"
        >
          {filtered.map((cake) => (
            <div
              key={cake.id}
              className="w-[85vw] max-w-[400px] flex-shrink-0 snap-start sm:w-[45vw] sm:max-w-[360px] md:w-[380px] md:max-w-[380px] lg:w-auto lg:max-w-none lg:flex-shrink"
            >
              <Card
                variant="product"
                title={cake.name}
                description={cake.description ?? undefined}
                price={cake.price}
                imageUrl={cake.image_url}
                imageAlt={cake.name}
                category={cake.category ?? undefined}
                showFavorite={Boolean(onFavorite)}
                onFavorite={
                  onFavorite
                    ? () => {
                        onFavorite(cake.id);
                      }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}