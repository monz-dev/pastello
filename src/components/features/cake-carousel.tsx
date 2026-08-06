'use client';

import { useEffect, useRef, useState } from 'react';
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

const AUTOPLAY_INTERVAL_MS = 5_000;

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
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const initialQueryRef = useRef(true);

  const trimmed = query.trim().toLowerCase();
  const filtered =
    trimmed.length === 0
      ? cakes
      : cakes.filter((cake) => cake.name.toLowerCase().includes(trimmed));

  useEffect(() => {
    if (initialQueryRef.current) {
      initialQueryRef.current = false;
      return;
    }

    currentIndexRef.current = 0;
    scrollRef.current?.scrollTo?.({ left: 0, behavior: 'auto' });
  }, [trimmed]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || filtered.length < 2) return;

    const reducedMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    );
    let timer: ReturnType<typeof setInterval> | undefined;

    const advance = () => {
      if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) {
        if (timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
        return;
      }

      currentIndexRef.current =
        (currentIndexRef.current + 1) % filtered.length;
      const nextCard = scrollContainer.children[currentIndexRef.current];
      const nextLeft =
        currentIndexRef.current === 0
          ? 0
          : (nextCard as HTMLElement).offsetLeft;

      scrollContainer.scrollTo({ left: nextLeft, behavior: 'smooth' });
    };

    const updateTimer = () => {
      const canAutoplay =
        !isPaused &&
        !reducedMotionQuery?.matches &&
        scrollContainer.scrollWidth > scrollContainer.clientWidth;

      if (!canAutoplay) {
        if (timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
        return;
      }

      if (timer !== undefined) return;
      timer = setInterval(advance, AUTOPLAY_INTERVAL_MS);
    };

    const handleScroll = () => {
      const cards = Array.from(scrollContainer.children) as HTMLElement[];
      if (cards.length === 0) return;

      const scrollLeft = scrollContainer.scrollLeft;
      currentIndexRef.current = cards.reduce(
        (closestIndex, card, index) => {
          const closestDistance = Math.abs(
            cards[closestIndex].offsetLeft - scrollLeft,
          );
          const distance = Math.abs(card.offsetLeft - scrollLeft);
          return distance < closestDistance ? index : closestIndex;
        },
        0,
      );
    };

    const handleReducedMotionChange = () => updateTimer();
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(updateTimer);

    updateTimer();
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver?.observe(scrollContainer);
    window.addEventListener('resize', updateTimer);

    reducedMotionQuery?.addEventListener('change', handleReducedMotionChange);

    return () => {
      if (timer !== undefined) clearInterval(timer);
      scrollContainer.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateTimer);
      reducedMotionQuery?.removeEventListener(
        'change',
        handleReducedMotionChange,
      );
    };
  }, [filtered.length, isPaused]);

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
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0"
          role="region"
          aria-label="Catálogo de pasteles"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsPaused(false);
            }
          }}
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
