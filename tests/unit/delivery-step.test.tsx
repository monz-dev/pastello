import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  DeliveryStep,
  getMinDate,
  getMinTimeForDate,
  TIME_SLOTS,
  type DeliveryType,
} from '@/components/features/delivery-step';

function renderStep() {
  const onDateChange = vi.fn();
  const onTimeChange = vi.fn();
  const onTypeChange = vi.fn<(value: DeliveryType) => void>();
  render(
    <DeliveryStep
      deliveryDate=""
      deliveryTime=""
      deliveryType={null}
      onDeliveryDateChange={onDateChange}
      onDeliveryTimeChange={onTimeChange}
      onDeliveryTypeChange={onTypeChange}
    />,
  );
  return { onDateChange, onTimeChange, onTypeChange };
}

describe('DeliveryStep', () => {
  it('offers exactly 28 fifteen-minute slots from 15:00 through 21:45', () => {
    renderStep();
    const options = screen.getByLabelText('Hora de entrega').querySelectorAll('option');
    expect(TIME_SLOTS).toHaveLength(28);
    expect(TIME_SLOTS[0]).toBe('15:00');
    expect(TIME_SLOTS.at(-1)).toBe('21:45');
    expect(options).toHaveLength(29);
  });

  it('sets the date minimum to at least 24 hours from now, not today', () => {
    renderStep();
    const min = screen.getByLabelText('Fecha de entrega').getAttribute('min');
    expect(min).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Must not be today's local date
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(min).not.toBe(todayStr);
  });

  it('renders selectable pickup and delivery cards', () => {
    const { onTypeChange } = renderStep();
    fireEvent.click(screen.getByRole('button', { name: /Recoger en tienda/i }));
    expect(onTypeChange).toHaveBeenCalledWith('pickup');
    expect(screen.getByRole('button', { name: /Entrega a domicilio/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows field errors', () => {
    render(
      <DeliveryStep
        deliveryDate=""
        deliveryTime=""
        deliveryType={null}
        onDeliveryDateChange={vi.fn()}
        onDeliveryTimeChange={vi.fn()}
        onDeliveryTypeChange={vi.fn()}
        dateError="Fecha inválida"
        timeError="Hora inválida"
        typeError="Selecciona una opción"
      />,
    );
    expect(screen.getByText('Fecha inválida')).toBeInTheDocument();
    expect(screen.getByText('Hora inválida')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una opción')).toBeInTheDocument();
  });

  it('displays the 24-hour scheduling constraint as helper text', () => {
    renderStep();
    expect(
      screen.getByText(/Puedes agendar tu entrega a partir de 24 horas desde este momento/i),
    ).toBeInTheDocument();
  });

  it('shows all 28 time slots when no minTime is provided', () => {
    render(
      <DeliveryStep
        deliveryDate=""
        deliveryTime=""
        deliveryType={null}
        onDeliveryDateChange={vi.fn()}
        onDeliveryTimeChange={vi.fn()}
        onDeliveryTypeChange={vi.fn()}
      />,
    );
    const options = screen.getByLabelText('Hora de entrega').querySelectorAll('option');
    expect(options).toHaveLength(29); // placeholder + 28 slots
  });

  it('filters time slots to only those >= minTime', () => {
    render(
      <DeliveryStep
        deliveryDate="2026-08-12"
        deliveryTime=""
        deliveryType={null}
        minTime="18:00"
        onDeliveryDateChange={vi.fn()}
        onDeliveryTimeChange={vi.fn()}
        onDeliveryTypeChange={vi.fn()}
      />,
    );
    const options = screen.getByLabelText('Hora de entrega').querySelectorAll('option');
    // Placeholder + slots from 18:00 through 21:45 in 15-min increments = 1 + 16
    expect(options).toHaveLength(17);
    // First slot should be 18:00
    expect(options[1].textContent).toBe('18:00');
    // Last slot should be 21:45
    expect(options[options.length - 1].textContent).toBe('21:45');
    // 15:00 should not appear
    const slotTexts = Array.from(options).map((opt) => opt.textContent);
    expect(slotTexts).not.toContain('15:00');
    expect(slotTexts).not.toContain('17:45');
  });
});

describe('getMinDate', () => {
  it('returns a YYYY-MM-DD string at least one day after today', () => {
    const result = getMinDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // 24h from now is always at least tomorrow unless we are exactly at midnight
    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const minDateStr = `${twentyFourHoursFromNow.getFullYear()}-${String(twentyFourHoursFromNow.getMonth() + 1).padStart(2, '0')}-${String(twentyFourHoursFromNow.getDate()).padStart(2, '0')}`;
    expect(result).toBe(minDateStr);
  });
});

describe('getMinTimeForDate', () => {
  it('returns null for a date after the minimum date', () => {
    const dayAfterMin = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const futureDate = `${dayAfterMin.getFullYear()}-${String(dayAfterMin.getMonth() + 1).padStart(2, '0')}-${String(dayAfterMin.getDate()).padStart(2, '0')}`;
    expect(getMinTimeForDate(futureDate)).toBeNull();
  });

  it('returns a HH:MM time for the minimum date', () => {
    const minDate = getMinDate();
    const result = getMinTimeForDate(minDate);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    // The minimum time must be exactly 24 hours from now
    const expected = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expectedStr = `${String(expected.getHours()).padStart(2, '0')}:${String(expected.getMinutes()).padStart(2, '0')}`;
    expect(result).toBe(expectedStr);
  });
});
