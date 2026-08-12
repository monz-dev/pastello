'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { useStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { CakeSizeIcon } from '@/components/features/cake-size-icon';
import {
  DeliveryStep,
  getMinDate,
  getMinTimeForDate,
  TIME_SLOTS,
  type DeliveryType,
} from '@/components/features/delivery-step';
import { createClient } from '@/lib/supabase/client';

const STEPS = [
  { label: 'Tamaño' },
  { label: 'Pan' },
  { label: 'Relleno' },
  { label: 'Cobertura' },
  { label: 'Resumen' },
  { label: 'Entrega' },
];

type SizeOption = {
  id: string;
  name: string;
  description: string | null;
  additional_price: number | null;
};

type IngredientOption = {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  additional_price: number | null;
};

type SelectedOption = Pick<
  SizeOption | IngredientOption,
  'id' | 'name' | 'description' | 'additional_price'
> & { image_url?: string };

const FALLBACK_SIZES: SizeOption[] = [
  { id: 'fallback-mini', name: 'Mini', description: '7cm — Ideal para 2-4 personas', additional_price: 40 },
  { id: 'fallback-mediano', name: 'Mediano', description: '14cm — Ideal para 6-8 personas', additional_price: 80 },
  { id: 'fallback-doble-piso', name: 'Doble piso', description: '14cm + 14cm — Dos niveles, ideal para 12-15 personas', additional_price: 150 },
  { id: 'fallback-grande', name: 'Grande', description: '20cm — Ideal para 15-20 personas', additional_price: 200 },
  { id: 'fallback-extra-grande', name: 'Extra grande', description: '24cm — Ideal para 25-30 personas', additional_price: 250 },
];

const PAN_FALLBACK: IngredientOption[] = [
  { id: 'fallback-pan-1', name: 'Chocolate', description: 'Bizcocho de chocolate belga 70% cacao', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', additional_price: 0 },
  { id: 'fallback-pan-2', name: 'Vainilla', description: 'Bizcocho de vainilla orgánica de Madagascar', image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', additional_price: 0 },
  { id: 'fallback-pan-3', name: 'Red Velvet', description: 'Bizcocho red velvet clásico con cacao suave', image_url: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400', additional_price: 10 },
];

const RELLENO_FALLBACK: IngredientOption[] = [
  { id: 'fallback-relleno-1', name: 'Nutella', description: 'Crema de avellanas y cacao premium', image_url: 'https://images.unsplash.com/photo-1584839404042-8bc6300916da?w=400', additional_price: 15 },
  { id: 'fallback-relleno-2', name: 'Queso Crema', description: 'Relleno de queso crema batido artesanal', image_url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400', additional_price: 10 },
  { id: 'fallback-relleno-3', name: 'Oreo', description: 'Crema de galleta Oreo triturada con nata', image_url: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400', additional_price: 12 },
  { id: 'fallback-relleno-4', name: 'Chocolate', description: 'Ganache de chocolate negro intenso', image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', additional_price: 10 },
];

const COBERTURA_FALLBACK: IngredientOption[] = [
  { id: 'fallback-cobertura-1', name: 'Chocolate', description: 'Ganache brillante de chocolate 70%', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', additional_price: 0 },
  { id: 'fallback-cobertura-2', name: 'Queso Crema', description: 'Frosting de queso crema sedoso', image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', additional_price: 5 },
];

function getSizeMeta(name: string): { icon: 'mini' | 'mediano' | 'doble-piso' | 'grande' | 'extra-grande'; cm: string } {
  const n = name.toLowerCase().trim();
  if (n.includes('mini')) return { icon: 'mini', cm: '7 cm' };
  if (n.includes('doble') || n.includes('doble piso')) return { icon: 'doble-piso', cm: '14 cm + 14 cm' };
  if (n.includes('extra')) return { icon: 'extra-grande', cm: '24 cm' };
  if (n.includes('grande')) return { icon: 'grande', cm: '20 cm' };
  if (n.includes('mediano') || n.includes('mediana')) return { icon: 'mediano', cm: '14 cm' };
  return { icon: 'mediano', cm: '14 cm' };
}

function cleanDescription(desc: string | null): string | null {
  if (!desc) return null;
  return desc.replace(/^\d+\s*cm(\s*\+\s*\d+\s*cm)?\s*[—–-]\s*/, '').trim() || null;
}

async function fetchIngredients(
  supabase: ReturnType<typeof createClient>,
  type: string,
): Promise<IngredientOption[]> {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, description, image_url, additional_price')
      .eq('type', type)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as IngredientOption[];
    }
  } catch {
    // Supabase unreachable — caller uses fallback
  }
  return [];
}

function formatPrice(price: number | null): string {
  return `$${(price ?? 0).toFixed(0)}`;
}

export default function CreatePage() {
  const supabase = useMemo(() => createClient(), []);
  const { currentStep, next, prev, isFirstStep, isLastStep } = useStepper(
    STEPS.length,
  );

  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [pans, setPans] = useState<IngredientOption[]>([]);
  const [rellenos, setRellenos] = useState<IngredientOption[]>([]);
  const [coberturas, setCoberturas] = useState<IngredientOption[]>([]);

  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedPanId, setSelectedPanId] = useState<string | null>(null);
  const [selectedRellenoId, setSelectedRellenoId] = useState<string | null>(null);
  const [selectedCoberturaId, setSelectedCoberturaId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    date: undefined as string | undefined,
    time: undefined as string | undefined,
    type: undefined as string | undefined,
  });

  const allIngredients = useCallback(async () => {
    void (async () => {
      try {
        const { data: sizeData, error: sizeError } = await supabase
          .from('ingredients')
          .select('id, name, description, additional_price')
          .eq('type', 'tamaño')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!sizeError && sizeData && sizeData.length > 0) {
          setSizes(sizeData as SizeOption[]);
        } else {
          setSizes(FALLBACK_SIZES);
        }
      } catch {
        setSizes(FALLBACK_SIZES);
      }
    })();

    void (async () => {
      const data = await fetchIngredients(supabase, 'pan');
      setPans(data.length > 0 ? data : PAN_FALLBACK);
    })();

    void (async () => {
      const data = await fetchIngredients(supabase, 'relleno');
      setRellenos(data.length > 0 ? data : RELLENO_FALLBACK);
    })();

    void (async () => {
      const data = await fetchIngredients(supabase, 'cobertura');
      setCoberturas(data.length > 0 ? data : COBERTURA_FALLBACK);
    })();
  }, [supabase]);

  useEffect(() => {
    allIngredients();
  }, [allIngredients]);

  function getSelectedForStep(step: number): SizeOption | IngredientOption | null {
    const size = sizes.find((s) => s.id === selectedSizeId) ?? null;
    const pan = pans.find((p) => p.id === selectedPanId) ?? null;
    const relleno = rellenos.find((r) => r.id === selectedRellenoId) ?? null;
    const cobertura = coberturas.find((c) => c.id === selectedCoberturaId) ?? null;

    const selections = [size, pan, relleno, cobertura];
    return selections[step] ?? null;
  }

  function getStepDisabled(): boolean {
    const selections = [
      selectedSizeId === null,
      selectedPanId === null,
      selectedRellenoId === null,
      selectedCoberturaId === null,
    ];
    if (currentStep === 4) return false;
    if (currentStep === 5) {
      return !isDeliveryScheduleValid();
    }
    return selections[currentStep] ?? false;
  }

  function isDeliveryScheduleValid(): boolean {
    const minDate = getMinDate();
    if (!deliveryDate || deliveryDate < minDate) return false;
    if (!TIME_SLOTS.includes(deliveryTime)) return false;
    if (deliveryType === null) return false;

    // When delivery is on the minimum date, time must be at or after the 24h threshold
    const minTimeForDate = getMinTimeForDate(deliveryDate);
    if (minTimeForDate && deliveryTime < minTimeForDate) return false;

    return true;
  }

  function validateDeliverySchedule(): boolean {
    const minDate = getMinDate();
    const minTimeForDate = getMinTimeForDate(deliveryDate);

    const errors = {
      date:
        !deliveryDate || deliveryDate < minDate
          ? `Selecciona una fecha a partir del ${minDate.split('-').reverse().join('/')}.`
          : undefined,
      time: (() => {
        if (!deliveryTime || !TIME_SLOTS.includes(deliveryTime)) {
          return 'Selecciona una hora disponible.';
        }
        if (minTimeForDate && deliveryTime < minTimeForDate) {
          return `Para esta fecha, la hora mínima es ${minTimeForDate}.`;
        }
        return undefined;
      })(),
      type: deliveryType ? undefined : 'Selecciona cómo recibirás tu pedido.',
    };
    setFieldErrors(errors);
    return !errors.date && !errors.time && !errors.type;
  }

  async function handleSubmitOrder() {
    setSubmitError(null);
    if (!validateDeliverySchedule()) return;

    setIsSubmitting(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Necesitas iniciar sesión para confirmar tu pedido.');
      }

      const { error } = await supabase.from('orders').insert({
        order_type: 'custom_build',
        user_id: user.id,
        pan_choice: selectedPanId,
        relleno_choice: selectedRellenoId,
        cobertura_choice: selectedCoberturaId,
        size_choice: sizes.find((size) => size.id === selectedSizeId)?.name ?? null,
        total_price: subtotal,
        required_date: deliveryDate,
        delivery_type: deliveryType,
        delivery_time: deliveryTime,
      } as never);

      if (error) throw error;

      setSelectedSizeId(null);
      setSelectedPanId(null);
      setSelectedRellenoId(null);
      setSelectedCoberturaId(null);
      setDeliveryDate('');
      setDeliveryTime('');
      setDeliveryType(null);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No pudimos confirmar tu pedido. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Running subtotal across all selected ingredients
  const subtotal = [
    sizes.find((s) => s.id === selectedSizeId)?.additional_price ?? 0,
    pans.find((p) => p.id === selectedPanId)?.additional_price ?? 0,
    rellenos.find((r) => r.id === selectedRellenoId)?.additional_price ?? 0,
    coberturas.find((c) => c.id === selectedCoberturaId)?.additional_price ?? 0,
  ].reduce((acc, price) => acc + price, 0);

  // Scroll behavior on step change
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    // Skip initial render
    if (prevStepRef.current === currentStep) return;

    const direction = currentStep > prevStepRef.current ? 'next' : 'prev';
    prevStepRef.current = currentStep;

    // Wait for the DOM to reflect the new step before scrolling
    requestAnimationFrame(() => {
      if (direction === 'next') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll to the previously-selected card (aria-pressed="true")
        const selectedCard = document.querySelector<HTMLElement>('[aria-pressed="true"]');
        selectedCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, [currentStep]);

  function renderStep() {
    if (currentStep === 0) {
      return (
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-sm text-on-surface">
            Elige el tamaño de tu pastel
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sizes.map((size) => {
              const meta = getSizeMeta(size.name);
              return (
                <Card
                  key={size.id}
                  variant="selection"
                  selected={selectedSizeId === size.id}
                  onSelect={() => setSelectedSizeId(size.id)}
                >
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CakeSizeIcon size={meta.icon} cmLabel={meta.cm} />
                    <h3 className="text-headline-sm text-on-surface text-center">{size.name}</h3>
                    <p className="text-body-sm text-on-surface-variant text-center">
                      {cleanDescription(size.description) ?? size.description}
                    </p>
                    <span className="text-headline-sm font-semibold text-secondary">
                      {formatPrice(size.additional_price)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-sm text-on-surface">
            Elige el pan
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Todas las opciones están incluidas en el precio base, excepto las marcadas con costo extra.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pans.map((pan) => (
              <Card
                key={pan.id}
                variant="selection"
                imageUrl={pan.image_url}
                title={pan.name}
                description={pan.description ?? undefined}
                {...(pan.additional_price && pan.additional_price > 0
                  ? { price: pan.additional_price, pricePrefix: '+' }
                  : {})}
                selected={selectedPanId === pan.id}
                onSelect={() => setSelectedPanId(pan.id)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-sm text-on-surface">
            Elige el relleno
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Todas las opciones están incluidas en el precio base, excepto las marcadas con costo extra.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rellenos.map((relleno) => (
              <Card
                key={relleno.id}
                variant="selection"
                imageUrl={relleno.image_url}
                title={relleno.name}
                description={relleno.description ?? undefined}
                {...(relleno.additional_price && relleno.additional_price > 0
                  ? { price: relleno.additional_price, pricePrefix: '+' }
                  : {})}
                selected={selectedRellenoId === relleno.id}
                onSelect={() => setSelectedRellenoId(relleno.id)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-sm text-on-surface">
            Elige la cobertura
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Todas las opciones están incluidas en el precio base, excepto las marcadas con costo extra.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coberturas.map((cobertura) => (
              <Card
                key={cobertura.id}
                variant="selection"
                imageUrl={cobertura.image_url}
                title={cobertura.name}
                description={cobertura.description ?? undefined}
                {...(cobertura.additional_price && cobertura.additional_price > 0
                  ? { price: cobertura.additional_price, pricePrefix: '+' }
                  : {})}
                selected={selectedCoberturaId === cobertura.id}
                onSelect={() => setSelectedCoberturaId(cobertura.id)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 5) {
      const minTime = deliveryDate ? getMinTimeForDate(deliveryDate) : null;
      return (
        <DeliveryStep
          deliveryDate={deliveryDate}
          deliveryTime={deliveryTime}
          deliveryType={deliveryType}
          minTime={minTime}
          onDeliveryDateChange={(value) => {
            setDeliveryDate(value);
            setDeliveryTime('');
            setFieldErrors((current) => ({ ...current, date: undefined, time: undefined }));
          }}
          onDeliveryTimeChange={(value) => {
            setDeliveryTime(value);
            setFieldErrors((current) => ({ ...current, time: undefined }));
          }}
          onDeliveryTypeChange={(value) => {
            setDeliveryType(value);
            setFieldErrors((current) => ({ ...current, type: undefined }));
          }}
          dateError={fieldErrors.date}
          timeError={fieldErrors.time}
          typeError={fieldErrors.type}
        />
      );
    }

    // Step 4 — Resumen
    const selectedSize = sizes.find((s) => s.id === selectedSizeId) ?? null;
    const selectedPan = pans.find((p) => p.id === selectedPanId) ?? null;
    const selectedRelleno = rellenos.find((r) => r.id === selectedRellenoId) ?? null;
    const selectedCobertura = coberturas.find((c) => c.id === selectedCoberturaId) ?? null;

    const items: { label: string; name: string; description: string | null; price: number | null; icon: string; extra?: string }[] = [
      { label: 'Tamaño', name: selectedSize?.name ?? '—', description: cleanDescription(selectedSize?.description ?? null), price: selectedSize?.additional_price ?? null, icon: 'straighten', extra: selectedSize ? getSizeMeta(selectedSize.name).cm : undefined },
      { label: 'Pan', name: selectedPan?.name ?? '—', description: selectedPan?.description ?? null, price: selectedPan?.additional_price ?? null, icon: 'cake' },
      { label: 'Relleno', name: selectedRelleno?.name ?? '—', description: selectedRelleno?.description ?? null, price: selectedRelleno?.additional_price ?? null, icon: 'layers' },
      { label: 'Cobertura', name: selectedCobertura?.name ?? '—', description: selectedCobertura?.description ?? null, price: selectedCobertura?.additional_price ?? null, icon: 'brush' },
    ];

    const total = items.reduce((acc, item) => acc + (item.price ?? 0), 0);

    // Preview image: preferred cobertura, fallback to pan
    const previewImage = selectedCobertura?.image_url || selectedPan?.image_url || null;

    return (
      <div className="flex flex-col gap-6">
        {/* Section Title */}
        <div>
          <h2 className="text-headline-md text-on-surface mb-1">¡Casi listo!</h2>
          <p className="text-body-md text-on-surface-variant">Revisa los detalles de tu creación antes de finalizar.</p>
        </div>

        {/* Product Preview Canvas */}
        <section className="relative aspect-square rounded-3xl overflow-hidden bg-cream flex items-center justify-center shadow-sm">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(248,187,208,0.15),_transparent)]" />
          <div className="relative z-10 animate-float w-full h-full p-8 flex items-center justify-center">
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="max-w-full h-auto object-contain drop-shadow-2xl"
                src={previewImage}
                alt={selectedCobertura?.name ?? selectedPan?.name ?? 'Pastel'}
              />
            ) : (
              <Icon name="cake" size={6} className="text-primary/20" />
            )}
          </div>
          <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-border-subtle">
            <span className="text-headline-sm font-semibold text-secondary">
              {formatPrice(total)}
            </span>
          </div>
        </section>

        {/* Summary Selection List */}
        <section className="space-y-4">
          <h3 className="text-label-md uppercase tracking-widest text-outline">Detalles de tu Pastel</h3>
          {items.map((item) => (
            <div
              key={item.label}
              className="glass-effect rounded-2xl p-4 flex items-center justify-between border border-white/50 shadow-sm bg-surface/70 hover:translate-x-1 transition-transform duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary shrink-0">
                  <Icon name={item.icon} size={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm text-on-surface-variant">{item.label}</p>
                  <p className="text-headline-sm text-on-surface">{item.name}</p>
                  {item.description && (
                    <p className="text-body-sm text-on-surface-variant">{item.description}</p>
                  )}
                  {item.extra && (
                    <p className="text-body-sm text-on-surface-variant">{item.extra}</p>
                  )}
                </div>
              </div>
              {item.price !== null && (
                <span className="text-headline-sm font-semibold text-secondary whitespace-nowrap ml-4">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <h1 className="text-headline-md text-on-surface">Crear pastel</h1>

      {isSubmitted ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <Icon name="check_circle" size={3} className="text-secondary" />
          <h2 className="text-headline-md text-on-surface">¡Pedido confirmado!</h2>
          <p className="text-body-md text-on-surface-variant">
            Recibimos tu pedido y comenzaremos a prepararlo pronto.
          </p>
          <a href="/orders" className="text-body-md font-semibold text-secondary underline">
            Ver mis pedidos
          </a>
        </Card>
      ) : (
        <>
          <Stepper steps={STEPS} currentStep={currentStep} />

          <p className="text-body-md text-on-surface-variant">
            Paso {currentStep + 1}: {STEPS[currentStep].label}
          </p>

          {renderStep()}
          {submitError && (
            <p role="alert" className="text-body-md text-error">
              {submitError}
            </p>
          )}
        </>
      )}

      {/* Sticky action footer — glassmorphism with running subtotal and nav */}
      {!isSubmitted && <div className="glass-effect fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-between border-t border-outline-variant bg-surface/90 px-4 lg:px-8">
        <div className="flex items-baseline gap-2">
          <span className="text-body-sm text-on-surface-variant">Subtotal</span>
          <span className="text-headline-sm font-semibold text-secondary">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={isFirstStep}
            icon={<Icon name="arrow_back" />}
          >
            Anterior
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={isLastStep ? handleSubmitOrder : next}
            disabled={getStepDisabled()}
            loading={isSubmitting}
            icon={
              <Icon name={isLastStep ? 'check' : 'arrow_forward'} />
            }
            iconPosition="right"
          >
            {isLastStep ? 'Confirmar pedido' : 'Siguiente'}
          </Button>
        </div>
      </div>}
    </div>
  );
}
