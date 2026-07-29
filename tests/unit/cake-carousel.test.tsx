import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CakeCarousel } from '@/components/features/cake-carousel';
import type { Tables } from '@/types/supabase';

/* ───────────────────────────────────────────────────────────── */
/*  Mock cake data                                                 */
/* ───────────────────────────────────────────────────────────── */

function createMockCakes(): Tables<'pre_designed_cakes'>[] {
  return [
    {
      id: 'cake-1',
      name: 'Chocolate Dream',
      description: 'Rich chocolate cake with ganache',
      ingredients: ['chocolate', 'cream'],
      size: 'M',
      price: 25.0,
      estimated_time: 48,
      image_url: 'https://example.com/cake1.jpg',
      category: 'chocolate',
      is_active: true,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'cake-2',
      name: 'Fresa Primavera',
      description: 'Vanilla sponge with fresh strawberries',
      ingredients: ['vanilla', 'strawberry'],
      size: 'L',
      price: 30.5,
      estimated_time: 72,
      image_url: 'https://example.com/cake2.jpg',
      category: 'frutal',
      is_active: true,
      created_at: '2026-01-16T00:00:00Z',
      updated_at: '2026-01-16T00:00:00Z',
    },
    {
      id: 'cake-3',
      name: 'Vainilla Clasica',
      description: 'Classic vanilla buttercream',
      ingredients: ['vanilla'],
      size: 'S',
      price: 18.0,
      estimated_time: 24,
      image_url: 'https://example.com/cake3.jpg',
      category: 'clasico',
      is_active: true,
      created_at: '2026-01-17T00:00:00Z',
      updated_at: '2026-01-17T00:00:00Z',
    },
  ];
}

describe('CakeCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a card for each cake with name and price', () => {
    const cakes = createMockCakes();
    render(<CakeCarousel cakes={cakes} />);

    expect(screen.getByText('Chocolate Dream')).toBeInTheDocument();
    expect(screen.getByText('Fresa Primavera')).toBeInTheDocument();
    expect(screen.getByText('Vainilla Clasica')).toBeInTheDocument();

    // Price format: Card renders `$${price.toFixed(2)}`
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('$30.50')).toBeInTheDocument();
    expect(screen.getByText('$18.00')).toBeInTheDocument();
  });

  it('renders a horizontal snap-scroll container', () => {
    const cakes = createMockCakes();
    render(<CakeCarousel cakes={cakes} />);

    const scrollContainer = screen.getByTestId('cake-scroll');
    expect(scrollContainer).toBeInTheDocument();
    // snap-x snap-mandatory classes are applied for horizontal scroll
    expect(scrollContainer.className).toContain('snap-x');
    expect(scrollContainer.className).toContain('overflow-x-auto');
  });

  it('filters cakes by name when the user searches', () => {
    const cakes = createMockCakes();
    render(<CakeCarousel cakes={cakes} />);

    const input = screen.getByPlaceholderText(
      'Buscar pasteles…',
    ) as HTMLInputElement;

    // Type "chocolate" — only Chocolate Dream should remain
    fireEvent.change(input, { target: { value: 'chocolate' } });

    expect(screen.getByText('Chocolate Dream')).toBeInTheDocument();
    expect(screen.queryByText('Fresa Primavera')).not.toBeInTheDocument();
    expect(screen.queryByText('Vainilla Clasica')).not.toBeInTheDocument();
  });

  it('shows an empty state when no cakes match the search', () => {
    const cakes = createMockCakes();
    render(<CakeCarousel cakes={cakes} />);

    const input = screen.getByPlaceholderText(
      'Buscar pasteles…',
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'pizza' } });

    expect(screen.queryByText('Chocolate Dream')).not.toBeInTheDocument();
    expect(
      screen.getByText(/No encontramos pasteles para «pizza»/),
    ).toBeInTheDocument();
  });

  it('fires onFavorite when provided and the heart button is clicked', () => {
    const cakes = createMockCakes();
    const onFavorite = vi.fn();
    render(<CakeCarousel cakes={cakes} onFavorite={onFavorite} />);

    // The first cake's favorite button has aria-label "Agregar a favoritos"
    const favoriteButtons = screen.getAllByLabelText('Agregar a favoritos');
    expect(favoriteButtons.length).toBeGreaterThan(0);

    fireEvent.click(favoriteButtons[0]);
    expect(onFavorite).toHaveBeenCalledWith('cake-1');
  });

  it('renders an empty state when the cakes array is empty', () => {
    render(<CakeCarousel cakes={[]} />);

    expect(screen.getByText('No hay pasteles disponibles por ahora.')).toBeInTheDocument();
  });
});