import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { Tables } from '@/types/supabase';

/* ───────────────────────────────────────────────────────────── */
/*  Hoisted mocks + mock data                                      */
/* ───────────────────────────────────────────────────────────── */

const mockCakes: Tables<'pre_designed_cakes'>[] = [
  {
    id: 'cake-1',
    name: 'Chocolate Dream',
    description: 'Rich chocolate cake with ganache',
    ingredients: ['chocolate'],
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
    description: 'Vanilla sponge with strawberries',
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
];

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
}));

/** Build the builder chain: from().select().eq().order() → resolves. */
function chainMocks(data: Tables<'pre_designed_cakes'>[]) {
  const order = vi.fn().mockResolvedValue({ data, error: null });
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  supabaseMock.from.mockReturnValue({ select });
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => supabaseMock.from(...args),
  }),
}));

/* Import AFTER mocks so the page uses the mocked Supabase client. */
import HomePage from '@/app/(main)/home/page';

/* ───────────────────────────────────────────────────────────── */
/*  Tests                                                          */
/* ───────────────────────────────────────────────────────────── */

describe('Home page integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chainMocks(mockCakes);
  });

  it('renders the heading, search bar, cake cards, and CTAs', async () => {
    // HomePage is async — awaiting it resolves the fetch and returns JSX.
    const result = render(await HomePage());

    // Page heading.
    expect(screen.getByText('Inicio')).toBeInTheDocument();

    // Search bar placeholder.
    expect(
      screen.getByPlaceholderText('Buscar pasteles…'),
    ).toBeInTheDocument();

    // Cake cards — names + prices.
    expect(screen.getByText('Chocolate Dream')).toBeInTheDocument();
    expect(screen.getByText('Fresa Primavera')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('$30.50')).toBeInTheDocument();

    // Quick Access CTAs.
    expect(screen.getByText('Crear mi pastel')).toBeInTheDocument();
    expect(screen.getByText('Subir imagen')).toBeInTheDocument();

    // "¿Tienes una idea?" section.
    expect(screen.getByText('¿Tienes una idea?')).toBeInTheDocument();
    expect(screen.getByText('Empezar a crear')).toBeInTheDocument();

    // CTA links point to the right routes.
    const createLink = screen.getByText('Crear mi pastel').closest('a');
    expect(createLink?.getAttribute('href')).toBe('/create');

    const customLink = screen.getByText('Subir imagen').closest('a');
    expect(customLink?.getAttribute('href')).toBe('/custom');

    result.unmount();
  });

  it('filters cakes through the search bar and updates visible cards', async () => {
    render(await HomePage());

    // All cakes visible initially.
    expect(screen.getByText('Chocolate Dream')).toBeInTheDocument();
    expect(screen.getByText('Fresa Primavera')).toBeInTheDocument();

    // Type "chocolate" → only Chocolate Dream remains.
    const input = screen.getByPlaceholderText(
      'Buscar pasteles…',
    ) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'chocolate' } });
    });

    expect(screen.getByText('Chocolate Dream')).toBeInTheDocument();
    expect(screen.queryByText('Fresa Primavera')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no cakes from Supabase', async () => {
    chainMocks([]);
    render(await HomePage());

    expect(
      screen.getByText('No hay pasteles disponibles por ahora.'),
    ).toBeInTheDocument();
  });
});