'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils/cn';
import type { Tables } from '@/types/supabase';

interface SearchBarProps {
  /** Cakes available for the quick-results dropdown. */
  cakes: Tables<'pre_designed_cakes'>[];
  /** Controlled input value. */
  value: string;
  /** Emits the new value on every keystroke. */
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MAX_DROPDOWN_RESULTS = 5;

/**
 * SearchBar — Airbnb-style glass search input.
 *
 * Renders a rounded glass container with a leading search Icon, a transparent
 * input, and a trailing clear button. When the value is non-empty and there
 * are matching cakes, a quick-results dropdown appears below the input.
 *
 * Controlled: the parent owns the value and filtering of the main catalog;
 * the dropdown here is a discovery shortcut that lets the user jump to a
 * specific cake name.
 */
export function SearchBar({
  cakes,
  value,
  onValueChange,
  placeholder = 'Buscar pasteles…',
  className,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = value.trim().toLowerCase();
  const matches =
    trimmed.length === 0
      ? []
      : cakes
          .filter((cake) => cake.name.toLowerCase().includes(trimmed))
          .slice(0, MAX_DROPDOWN_RESULTS);

  // Close the dropdown when clicking outside the container.
  useEffect(() => {
    if (!focused) return;
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [focused]);

  const showDropdown = focused && matches.length > 0;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'glass-effect flex items-center gap-3 rounded-full border bg-surface-light/90 px-5 py-3 shadow-card transition-colors duration-200',
          focused
            ? 'border-primary'
            : 'border-outline-variant hover:border-outline-variant/80',
        )}
      >
        <Icon
          name="search"
          size={1.5}
          className={focused ? 'text-primary' : 'text-on-surface-variant'}
        />
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setFocused(true)}
          aria-label={placeholder}
          className="flex-1 bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onValueChange('');
              setFocused(false);
            }}
            aria-label="Limpiar búsqueda"
            className="flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant transition active:scale-90 hover:bg-primary-container/40"
          >
            <Icon name="close" size={1.125} />
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          role="listbox"
          className="glass-effect absolute z-50 mt-2 w-full rounded-xl border border-outline-variant bg-surface-light/95 py-2 shadow-elevated"
        >
          {matches.map((cake) => (
            <li key={cake.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  onValueChange(cake.name);
                  setFocused(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary-container/30"
              >
                <span className="text-body-md text-on-surface">{cake.name}</span>
                {cake.category && (
                  <span className="text-label-md uppercase tracking-wide text-on-surface-variant">
                    {cake.category}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}