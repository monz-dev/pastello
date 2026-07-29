import { Icon } from '@/components/ui/icon';

/**
 * Admin catalog placeholder — server component.
 *
 * Full catalog management lands in Slice B; this route just reserves the
 * section so the sidebar link resolves to a deliberate empty state instead of
 * a 404.
 */
export default function AdminCatalogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Catálogo</h1>
        <p className="text-body-md text-on-surface-variant">
          Gestión de pasteles prediseñados.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant bg-surface-light/60 px-4 py-20 text-center">
        <Icon name="cake" size={2.5} weight={400} className="text-on-surface-variant" />
        <div className="flex flex-col gap-1">
          <span className="text-headline-sm text-on-surface">
            Disponible en Slice B
          </span>
          <span className="text-body-md text-on-surface-variant">
            Acá vas a poder crear, editar y desactivar pasteles del catálogo.
          </span>
        </div>
      </div>
    </div>
  );
}