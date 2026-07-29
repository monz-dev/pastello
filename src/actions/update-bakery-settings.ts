'use server';

import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/supabase';

/**
 * Immutable UUID of the single allowed `bakery_settings` row, enforced by a
 * CHECK constraint in migration 00006. The upsert always targets this row.
 * Kept module-private because a `"use server"` file may only export async
 * functions — values/types are still re-exportable via type-only exports.
 */
const BAKERY_SETTINGS_ROW_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Minimum digit count a WhatsApp number must have to be considered valid.
 * Only digits are accepted (no `+`, spaces, or dashes) to keep the contact
 * link deterministic downstream.
 */
const WHATSAPP_REGEX = /^\d{8,}$/;

export interface BakerySettingsState {
  success: boolean;
  error?: string;
}

/**
 * updateBakerySettings — Next 15 Server Action bound to the admin settings form
 * via `useActionState`. Validates the WhatsApp number, parses the JSON-encoded
 * `business_hours` and `social_links`, and upserts the single bakery_settings
 * row (RLS restricts UPDATE to admins).
 *
 * The `_prevState` argument is supplied by `useActionState` and intentionally
 * unused: every invocation is a fresh authoritative write keyed on `formData`.
 */
export async function updateBakerySettings(
  _prevState: BakerySettingsState,
  formData: FormData,
): Promise<BakerySettingsState> {
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();
  const hoursRaw = String(formData.get('hours') ?? '').trim();
  const theme = String(formData.get('theme') ?? 'system').trim();
  const socialRaw = String(formData.get('social') ?? '').trim();

  if (!WHATSAPP_REGEX.test(whatsapp)) {
    return {
      success: false,
      error: 'Número de WhatsApp inválido (mínimo 8 dígitos)',
    };
  }

  let businessHours: Json | null;
  try {
    businessHours = hoursRaw ? (JSON.parse(hoursRaw) as Json) : null;
  } catch {
    return { success: false, error: 'Horarios inválidos (JSON malformado)' };
  }

  let socialLinks: Json | null;
  try {
    socialLinks = socialRaw ? (JSON.parse(socialRaw) as Json) : null;
  } catch {
    return {
      success: false,
      error: 'Redes sociales inválidas (JSON malformado)',
    };
  }

  // The upsert payload is the well-formed bakery_settings row at runtime; the
  // cast is needed because the hand-authored `Database` type (see
  // src/types/supabase.ts) does not resolve the `.upsert` generic — it falls
  // back to `never[]`. This is behavior-preserving and should be removed once
  // `pnpm supabase:types` regenerates real types against a running local
  // stack (see pastello-guest-admin apply-progress, B2a deviation #2).
  const payload = {
    id: BAKERY_SETTINGS_ROW_ID,
    whatsapp_number: whatsapp,
    business_hours: businessHours,
    theme,
    social_links: socialLinks,
  } as never;

  const supabase = await createClient();
  const { error } = await supabase
    .from('bakery_settings')
    .upsert(payload);

  return { success: !error, error: error?.message };
}