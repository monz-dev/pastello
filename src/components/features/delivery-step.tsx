'use client';

import { Card } from '@/components/ui/card';

const DELIVERY_TYPE = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
} as const;

export type DeliveryType = (typeof DELIVERY_TYPE)[keyof typeof DELIVERY_TYPE];

export const TIME_SLOTS = Array.from({ length: 28 }, (_, index) => {
  const totalMinutes = 15 * 60 + index * 15;
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
});

/** Earliest possible delivery: exactly 24 hours from now. */
function getMinDateTime(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

/** Returns the minimum delivery date as a local YYYY-MM-DD string. */
export function getMinDate(): string {
  const d = getMinDateTime();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns the earliest valid time (HH:MM) for a given date.
 * If the date is the minimum date, returns the 24h-from-now time;
 * otherwise returns null (any time is valid).
 */
export function getMinTimeForDate(dateStr: string): string | null {
  const minDate = getMinDate();
  if (dateStr !== minDate) return null;

  const min = getMinDateTime();
  const hh = String(min.getHours()).padStart(2, '0');
  const mm = String(min.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** @deprecated Use getMinDate() instead for the 24-hour constraint. */
export function getTomorrowDate(): string {
  return getMinDate();
}

interface DeliveryStepProps {
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: DeliveryType | null;
  onDeliveryDateChange: (value: string) => void;
  onDeliveryTimeChange: (value: string) => void;
  onDeliveryTypeChange: (value: DeliveryType) => void;
  /** Earliest allowed time for the currently selected date (HH:MM), or null if any time is allowed. */
  minTime?: string | null;
  dateError?: string;
  timeError?: string;
  typeError?: string;
}

export function DeliveryStep({
  deliveryDate,
  deliveryTime,
  deliveryType,
  onDeliveryDateChange,
  onDeliveryTimeChange,
  onDeliveryTypeChange,
  minTime,
  dateError,
  timeError,
  typeError,
}: DeliveryStepProps) {
  const availableSlots = minTime
    ? TIME_SLOTS.filter((slot) => slot >= minTime)
    : TIME_SLOTS;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-headline-sm text-on-surface">¿Cuándo quieres tu pedido?</h2>
        <p className="text-body-sm text-on-surface-variant">
          Puedes agendar tu entrega a partir de 24 horas desde este momento.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-label-md text-on-surface">
          Fecha de entrega
          <input
            aria-label="Fecha de entrega"
            type="date"
            min={getMinDate()}
            value={deliveryDate}
            onChange={(event) => onDeliveryDateChange(event.target.value)}
            className="min-h-12 rounded-md border border-outline-variant bg-beige-soft px-4 text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            aria-invalid={Boolean(dateError)}
          />
          {dateError && <span className="text-body-sm text-error">{dateError}</span>}
        </label>

        <label className="flex flex-col gap-2 text-label-md text-on-surface">
          Hora de entrega
          <select
            aria-label="Hora de entrega"
            value={deliveryTime}
            onChange={(event) => onDeliveryTimeChange(event.target.value)}
            className="min-h-12 rounded-md border border-outline-variant bg-beige-soft px-4 text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            aria-invalid={Boolean(timeError)}
          >
            <option value="">Selecciona una hora</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {timeError && <span className="text-body-sm text-error">{timeError}</span>}
        </label>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-label-md text-on-surface">¿Cómo recibirás tu pedido?</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            variant="selection"
            title="Recoger en tienda"
            description="Pasa por tu pedido en nuestro obrador."
            selected={deliveryType === DELIVERY_TYPE.PICKUP}
            onSelect={() => onDeliveryTypeChange(DELIVERY_TYPE.PICKUP)}
          />
          <Card
            variant="selection"
            title="Entrega a domicilio"
            description="Recibe tu pedido en la dirección indicada."
            selected={deliveryType === DELIVERY_TYPE.DELIVERY}
            onSelect={() => onDeliveryTypeChange(DELIVERY_TYPE.DELIVERY)}
          />
        </div>
        {typeError && <span className="text-body-sm text-error">{typeError}</span>}
      </fieldset>
    </div>
  );
}
