import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './settings-form';
import { Icon } from '@/components/ui/icon';

/**
 * Admin settings page — server component.
 *
 * Fetches the single `bakery_settings` row (RLS allows public SELECT) and
 * hands it to the client form island which binds the `updateBakerySettings`
 * server action via `useActionState`. When there is no row yet (fresh DB) the
 * form renders with empty fields and the upsert creates the row on first save.
 */
export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bakery_settings')
    .select('whatsapp_number, business_hours, theme, social_links')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .maybeSingle();

  const row = (data ?? null) as {
    whatsapp_number: string;
    business_hours: unknown;
    theme: string | null;
    social_links: unknown;
  } | null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Configuración</h1>
        <p className="text-body-md text-on-surface-variant">
          Datos de contacto y apariencia de la tienda.
        </p>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface-light p-6 shadow-card">
        <div className="mb-6 flex items-center gap-2 text-on-surface-variant">
          <Icon name="settings" size={1.4} weight={500} />
          <span className="text-label-md uppercase tracking-wide">
            Ajustes de la pastelería
          </span>
        </div>

        <SettingsForm initial={row} />
      </div>
    </div>
  );
}