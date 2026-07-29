import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import type { Tables } from '@/types/supabase';

type OrderRow = Pick<
  Tables<'orders'>,
  'id' | 'status' | 'total_price' | 'created_at' | 'order_type'
>;

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
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

/**
 * My orders — server component.
 *
 * Lists the current user's orders (newest first). Works for both
 * authenticated customers and guest users: guests are signed-up silently on
 * first visit and receive a real session, so their orders carry the same
 * `user_id` and show up identically here. If there is no session at all, an
 * empty state prompts the visitor to start an order.
 */
export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orders: OrderRow[] = [];

  if (user) {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total_price, created_at, order_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    orders = (data ?? []) as OrderRow[];
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-headline-md text-on-surface">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant bg-surface-light/60 px-4 py-16 text-center">
          <Icon name="shopping_bag" size={2.5} weight={400} className="text-on-surface-variant" />
          <p className="text-body-md text-on-surface-variant">
            Aún no tenés pedidos.
          </p>
          {user ? (
            <Link
              href="/"
              className="mt-1 inline-flex h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary transition duration-200 hover:opacity-90 active:scale-95"
            >
              Hacer un pedido
            </Link>
          ) : (
            <Link
              href="/login"
              className="mt-1 inline-flex h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary transition duration-200 hover:opacity-90 active:scale-95"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-surface-light p-4 shadow-card"
            >
              <div className="flex flex-col gap-1">
                <span className="text-body-md font-semibold capitalize text-on-surface">
                  {order.order_type === 'predesigned' ? 'Prediseñado' : order.order_type}
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {formatDate(order.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-label-sm font-semibold',
                    STATUS_STYLES[order.status] ??
                      'bg-surface-container-high text-on-surface',
                  )}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <span className="text-headline-sm font-semibold text-secondary whitespace-nowrap">
                  ${order.total_price.toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}