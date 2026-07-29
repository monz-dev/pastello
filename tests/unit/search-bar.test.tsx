import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/features/search-bar';
import type { Tables } from '@/types/supabase';

/* ───────────────────────────────────────────────────────────── */
/*  Mock cake data + test wrapper                                  */
/* ───────────────────────────────────────────────────────────── */

function createMockCakes(): Tables<'pre_designed_cakes'>[] {
  return [
    {
      id: 'cake-1',
      name: 'Chocolate Dream',
      description: null,
      ingredients: null,
      size: 'M',
      price: 25.0,
      estimated_time: 48,
      image_url: 'https://example.com/cake1.jpg',
      category: 'chocolate',
      is_active: true,
      created_at: null,
      updated_at: null,
    },
    {
      id: 'cake-2',
      name: 'Fresa Primavera',
      description: null,
      ingredients: null,
      size: 'L',
      price: 30.5,
      estimated_time: 72,
      image_url: 'https://example.com/cake2.jpg',
      category: 'frutal',
      is_active: true,
      created_at: null,
      updated_at: null,
    },
    {
      id: 'cake-3',
      name: 'Choco Loco',
      description: null,
      ingredients: null,
      size: 'S',
      price: 22.0,
      estimated_time: 24,
      image_url: 'https://example.com/cake3.jpg',
      category: 'chocolate',
      is_active: true,
      created_at: null,
      updated_at: null,
    },
  ];
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onValueChange when the user types', () => {
    const cakes = createMockCakes();
    const onValueChange = vi.fn();
    render(
      <SearchBar
        cakes={cakes}
        value=""
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByPlaceholderText(
      'Buscar pasteles…',
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'choco' } });

    expect(onValueChange).toHaveBeenCalledWith('choco');
  });

  it('shows matching cake names in the dropdown when focused and value non-empty', () => {
    const cakes = createMockCakes();
    render(
      <SearchBar
        cakes={cakes}
        value="cho"
        onValueChange={vi.fn()}
      />,
    );

    // Focus the input to trigger the dropdown.
    const input = screen.getByPlaceholderText('Buscar pasteles…');
    fireEvent.focus(input);

    // "cho" matches "Chocolate Dream" and "Choco Loco".
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    // Both matching cakes should appear as options.
    expect(screen.getByRole('option', { name: /Chocolate Dream/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Choco Loco/ })).toBeInTheDocument();
    // Fresa Primavera should NOT appear.
    expect(screen.queryByRole('option', { name: /Fresa Primavera/ })).not.toBeInTheDocument();
  });

  it('does not show the dropdown when the value is empty', () => {
    const cakes = createMockCakes();
    render(
      <SearchBar
        cakes={cakes}
        value=""
        onValueChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clear button calls onValueChange with empty string', () => {
    const cakes = createMockCakes();
    const onValueChange = vi.fn();
    render(
      <SearchBar
        cakes={cakes}
        value="chocolate"
        onValueChange={onValueChange}
      />,
    );

    const clearButton = screen.getByLabelText('Limpiar búsqueda');
    fireEvent.click(clearButton);

    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it('clicking a dropdown option calls onValueChange with that cake name', () => {
    const cakes = createMockCakes();
    const onValueChange = vi.fn();
    render(
      <SearchBar
        cakes={cakes}
        value="choco"
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByPlaceholderText('Buscar pasteles…');
    fireEvent.focus(input);

    // The <li role="option"> wraps a <button>; click the button (not the li)
    // because the onClick handler lives on the button element.
    const option = screen.getByRole('option', { name: /Choco Loco/ });
    const optionButton = option.querySelector('button') as HTMLButtonElement;
    fireEvent.click(optionButton);

    expect(onValueChange).toHaveBeenCalledWith('Choco Loco');
  });
});