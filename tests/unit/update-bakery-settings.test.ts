import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ───────────────────────────────────────────────────────────── */
/*  Hoisted Supabase mock                                         */
/* ───────────────────────────────────────────────────────────── */
/*
 * Mocks `@/lib/supabase/server` so the server action's internal
 * `createClient()` resolves to a client whose `from('bakery_settings')`
 * returns an object exposing `upsert`, which the action `await`s. The same
 * `upsertFn` reference is reused across calls so tests can assert its call
 * arguments and override its resolved value per-case.
 */
const supabaseMock = vi.hoisted(() => {
  const upsertFn = vi.fn();
  const fromFn = vi.fn(() => ({ upsert: upsertFn }));
  return {
    upsertFn,
    fromFn,
    createClient: vi.fn().mockResolvedValue({ from: fromFn }),
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: supabaseMock.createClient,
}));

/* Import AFTER mocks so the action resolves the mocked createClient. */
import { updateBakerySettings } from '@/actions/update-bakery-settings';

/* ───────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
/* ───────────────────────────────────────────────────────────── */

const PREV_STATE = { success: false } as const;

function makeFormData(overrides: {
  whatsapp?: string;
  hours?: string;
  theme?: string;
  social?: string;
}): FormData {
  const fd = new FormData();
  fd.set('whatsapp', overrides.whatsapp ?? '12345678');
  fd.set(
    'hours',
    overrides.hours ?? JSON.stringify({ mon: '9-18', tue: '9-18' }),
  );
  fd.set('theme', overrides.theme ?? 'system');
  fd.set(
    'social',
    overrides.social ?? JSON.stringify({ instagram: '@pastello' }),
  );
  return fd;
}

/* ───────────────────────────────────────────────────────────── */
/*  Tests                                                         */
/* ───────────────────────────────────────────────────────────── */

describe('updateBakerySettings — WhatsApp validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.upsertFn.mockResolvedValue({ error: null });
  });

  it('rejects a non-numeric WhatsApp ("abc") without touching the database', async () => {
    const result = await updateBakerySettings(
      PREV_STATE,
      makeFormData({ whatsapp: 'abc' }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/inválido/i);
    expect(supabaseMock.createClient).not.toHaveBeenCalled();
    expect(supabaseMock.upsertFn).not.toHaveBeenCalled();
  });

  it('rejects a 7-digit WhatsApp ("1234567") without touching the database', async () => {
    const result = await updateBakerySettings(
      PREV_STATE,
      makeFormData({ whatsapp: '1234567' }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/mínimo 8/i);
    expect(supabaseMock.createClient).not.toHaveBeenCalled();
    expect(supabaseMock.upsertFn).not.toHaveBeenCalled();
  });

  it('accepts an 8-digit WhatsApp ("12345678") and persists via upsert', async () => {
    const result = await updateBakerySettings(
      PREV_STATE,
      makeFormData({ whatsapp: '12345678' }),
    );

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(supabaseMock.createClient).toHaveBeenCalledTimes(1);
    expect(supabaseMock.fromFn).toHaveBeenCalledWith('bakery_settings');
    expect(supabaseMock.upsertFn).toHaveBeenCalledTimes(1);

    const payload = supabaseMock.upsertFn.mock.calls[0][0];
    expect(payload).toMatchObject({
      id: '00000000-0000-0000-0000-000000000001',
      whatsapp_number: '12345678',
      theme: 'system',
    });
    expect(payload.business_hours).toEqual({ mon: '9-18', tue: '9-18' });
    expect(payload.social_links).toEqual({ instagram: '@pastello' });
  });

  it('accepts a longer numeric WhatsApp and stores the theme + parsed JSON', async () => {
    const result = await updateBakerySettings(
      PREV_STATE,
      makeFormData({
        whatsapp: '5491100000000',
        theme: 'dark',
        hours: JSON.stringify({ every: '8-20' }),
        social: JSON.stringify({ facebook: 'pastello' }),
      }),
    );

    expect(result.success).toBe(true);
    const payload = supabaseMock.upsertFn.mock.calls[0][0];
    expect(payload.whatsapp_number).toBe('5491100000000');
    expect(payload.theme).toBe('dark');
    expect(payload.business_hours).toEqual({ every: '8-20' });
    expect(payload.social_links).toEqual({ facebook: 'pastello' });
  });

  it('returns success:false with the Supabase error message when upsert fails', async () => {
    supabaseMock.upsertFn.mockResolvedValueOnce({
      error: { message: 'RLS denied update' },
    });

    const result = await updateBakerySettings(
      PREV_STATE,
      makeFormData({ whatsapp: '12345678' }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('RLS denied update');
  });
});