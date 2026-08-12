import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  auth: { getUser: vi.fn() },
}));

function ingredientChain(data: unknown[]) {
  const order = vi.fn().mockResolvedValue({ data, error: null });
  const eq = vi.fn();
  eq.mockReturnValue({ eq, order });
  const select = vi.fn().mockReturnValue({ eq });
  return { select };
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => supabaseMock),
}));

import CreatePage from '@/app/(main)/create/page';

describe('CreatePage scheduling wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'orders') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return ingredientChain([]);
    });
  });

  it('renders six steps and keeps Resumen navigable', async () => {
    render(<CreatePage />);
    await waitFor(() => expect(screen.getByText('Paso 1: Tamaño')).toBeInTheDocument());
    expect(screen.getByText('Entrega')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('does not accept same-day scheduling', async () => {
    render(<CreatePage />);
    await waitFor(() => expect(screen.getByText('Paso 1: Tamaño')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });
});
