import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import type { Tables } from '@/types/supabase';

type OrderRow = Tables<'orders'>;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-tertiary-container text-on-tertiary-container',
  confirmed: 'bg-primary-container text-on-primary-container',
  cancelled: 'bg-error-container text-on-error-container',
  ready: 'bg-secondary-container text-on-secondary-container',
  delivered: 'bg-surface-container-high text-on-surface',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  ready: 'Listo',
  delivered: 'Entregado',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleString('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

/**
 * Admin orders — server component listing every order with its date, total
 * and a status badge. Middleware guarantees only admins reach this route.
 */
export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_price, created_at, order_type')
    .order('created_at', { ascending: false });

  const rows: OrderRow[] = orders ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Pedidos</h1>
        <p className="text-body-md text-on-surface-variant">
          Todos los pedidos registrados, del más reciente al más antiguo.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-light/60 px-4 py-16 text-center">
          <Icon name="inbox" size={2} weight={400} className="text-on-surface-variant" />
          <p className="text-body-md text-on-surface-variant">
            No hay pedidos registrados todavía.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface-light shadow-card">
          <table className="w-full min-w-[640px] text-left text-body-md">
            <thead className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
              <tr>
                <th scope="col" className="px-4 py-3 text-label-md uppercase tracking-wide">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 text-label-md uppercase tracking-wide">
                  Tipo
                </th>
                <th scope="col" className="px-4 py-3 text-label-md uppercase tracking-wide">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-right text-label-md uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((order) => (
                <tr key={order.id} className="text-on-surface">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize">
                    {order.order_type === 'predesigned' ? 'Prediseñado' : order.order_type}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-label-sm font-semibold',
                        STATUS_STYLES[order.status] ??
                          'bg-surface-container-high text-on-surface',
                      )}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                    ${order.total_price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}