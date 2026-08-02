import { Icon } from '@/components/ui/icon';
import { fetchDashboardMetrics } from '@/lib/services/admin';

/**
 * Admin dashboard — server component.
 *
 * Renders three metric cards (orders today, today's revenue, and the most
 * popular cake today) from `fetchDashboardMetrics`. When there is no activity
 * today the cards fall back to neutral zero/empty values and a shared empty
 * state explains that there is nothing yet.
 */
export default async function AdminDashboardPage() {
  const { ordersToday, revenueToday, popularCakes } =
    await fetchDashboardMetrics();

  const hasActivity = ordersToday > 0 || revenueToday > 0 || popularCakes.length > 0;
  const topCake = popularCakes[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Panel de administración</h1>
        <p className="text-body-md text-on-surface-variant">
          Resumen de la actividad de hoy.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="flex flex-col gap-2 rounded-2xl bg-surface-light p-6 shadow-card">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Icon name="receipt_long" size={1.25} weight={500} />
            <span className="text-label-md uppercase tracking-wide">
              Pedidos hoy
            </span>
          </div>
          <span className="text-display-md-mobile font-bold text-on-surface">
            {ordersToday}
          </span>
        </article>

        <article className="flex flex-col gap-2 rounded-2xl bg-surface-light p-6 shadow-card">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Icon name="payments" size={1.25} weight={500} />
            <span className="text-label-md uppercase tracking-wide">
              Ingresos hoy
            </span>
          </div>
          <span className="text-display-md-mobile font-bold text-secondary">
            ${revenueToday.toFixed(2)}
          </span>
        </article>

        <article className="flex flex-col gap-2 rounded-2xl bg-surface-light p-6 shadow-card">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Icon name="cake" size={1.25} weight={500} />
            <span className="text-label-md uppercase tracking-wide">
              Más popular
            </span>
          </div>
          <span className="text-headline-md font-semibold text-on-surface">
            {topCake ? topCake.name : 'Sin datos aún'}
          </span>
          {topCake ? (
            <span className="text-body-sm text-on-surface-variant">
              {topCake.orderCount} pedidos
            </span>
          ) : null}
        </article>
      </section>

      {!hasActivity && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-light/60 px-4 py-16 text-center">
          <Icon name="event_busy" size={2} weight={400} className="text-on-surface-variant" />
          <p className="text-body-md text-on-surface-variant">
            Sin datos aún. Cuando lleguen pedidos hoy, las métricas aparecerán acá.
          </p>
        </div>
      )}
    </div>
  );
}