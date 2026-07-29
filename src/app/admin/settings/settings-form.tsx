'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils/cn';
import {
  updateBakerySettings,
  type BakerySettingsState,
} from '@/actions/update-bakery-settings';

/**
 * Theme options for the bakery storefront. The DB column defaults to
 * `system` (migration 00006); the admin can override to a fixed mode.
 */
const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const;

const INITIAL_STATE: BakerySettingsState = { success: false };

interface SettingsFormProps {
  /** Current bakery_settings row used to prefill the form. */
  initial: {
    whatsapp_number: string;
    business_hours: unknown;
    theme: string | null;
    social_links: unknown;
  } | null;
}

/**
 * Serializes a JSONB column value into a stable string for the editable
 * fields. `null` (unset) becomes an empty input so the admin can start typing.
 */
function stringifyJson(value: unknown): string {
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

/**
 * SettingsForm — client island rendered inside the admin settings page.
 *
 * Binds the Server Action `updateBakerySettings` to the form with
 * `useActionState` so React 19 drives the pending state and surfaces the
 * returned `{ success, error }` as inline feedback after each submit.
 */
export function SettingsForm({ initial }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBakerySettings,
    INITIAL_STATE,
  );

  const whatsapp = initial?.whatsapp_number ?? '';
  const hours = stringifyJson(initial?.business_hours);
  const theme = initial?.theme ?? 'system';
  const social = stringifyJson(initial?.social_links);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="whatsapp" className="text-label-md font-semibold text-on-surface">
          WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="numeric"
          defaultValue={whatsapp}
          placeholder="Ej: 5491100000000"
          aria-describedby="whatsapp-helper"
          className="min-h-12 w-full rounded-md border border-outline-variant bg-beige-soft px-4 text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <p id="whatsapp-helper" className="pl-1 text-body-sm text-on-surface-variant">
          Mínimo 8 dígitos, solo números (sin + ni espacios).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="hours" className="text-label-md font-semibold text-on-surface">
          Horarios de atención
        </label>
        <textarea
          id="hours"
          name="hours"
          defaultValue={hours}
          rows={4}
          spellCheck={false}
          placeholder='{ "mon": "9-18", "tue": "9-18" }'
          aria-describedby="hours-helper"
          className="w-full rounded-md border border-outline-variant bg-beige-soft px-4 py-3 font-mono text-body-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <p id="hours-helper" className="pl-1 text-body-sm text-on-surface-variant">
          Formato JSON (clave día → rango horario).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="theme" className="text-label-md font-semibold text-on-surface">
          Tema visual
        </label>
        <select
          id="theme"
          name="theme"
          defaultValue={theme}
          className="min-h-12 w-full rounded-md border border-outline-variant bg-beige-soft px-4 text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
          {THEME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="social" className="text-label-md font-semibold text-on-surface">
          Redes sociales
        </label>
        <textarea
          id="social"
          name="social"
          defaultValue={social}
          rows={4}
          spellCheck={false}
          placeholder='{ "instagram": "@pastello", "facebook": "pastello" }'
          aria-describedby="social-helper"
          className="w-full rounded-md border border-outline-variant bg-beige-soft px-4 py-3 font-mono text-body-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <p id="social-helper" className="pl-1 text-body-sm text-on-surface-variant">
          Formato JSON (red → handle o URL).
        </p>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'inline-flex h-12 items-center gap-2 rounded-md bg-secondary px-6 text-button-text font-semibold text-white transition duration-200 active:scale-95',
            isPending && 'cursor-not-allowed opacity-50',
          )}
        >
          {isPending ? (
            <>
              <Icon name="progress_activity" size={1.1} weight={600} />
              Guardando…
            </>
          ) : (
            'Guardar configuración'
          )}
        </button>

        {state.success && (
          <p
            role="status"
            className="flex items-center gap-1 text-body-md font-semibold text-primary"
          >
            <Icon name="check_circle" size={1.1} weight={500} />
            Configuración guardada.
          </p>
        )}

        {state.error && (
          <p
            role="alert"
            className="flex items-center gap-1 text-body-md font-semibold text-error"
          >
            <Icon name="error" size={1.1} weight={500} />
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}