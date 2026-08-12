import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  DeliveryStep,
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

  it('sets the date minimum to a future local date, not today', () => {
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
});
