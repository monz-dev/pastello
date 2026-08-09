'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { useStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { CakeSizeIcon } from '@/components/features/cake-size-icon';
import { createClient } from '@/lib/supabase/client';

const STEPS = [
  { label: 'Tamaño' },
  { label: 'Pan' },
  { label: 'Relleno' },
  { label: 'Cobertura' },
  { label: 'Resumen' },
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
  const supabase = createClient();
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
    if (isLastStep) return true;
    return selections[currentStep] ?? false;
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

    // Step 4 — Resumen
    const selectedSize = sizes.find((s) => s.id === selectedSizeId) ?? null;
    const selectedPan = pans.find((p) => p.id === selectedPanId) ?? null;
    const selectedRelleno = rellenos.find((r) => r.id === selectedRellenoId) ?? null;
    const selectedCobertura = coberturas.find((c) => c.id === selectedCoberturaId) ?? null;

    const items: { label: string; name: string; description: string | null; price: number | null; extra?: string }[] = [
      { label: 'Tamaño', name: selectedSize?.name ?? '—', description: cleanDescription(selectedSize?.description ?? null), price: selectedSize?.additional_price ?? null, extra: selectedSize ? getSizeMeta(selectedSize.name).cm : undefined },
      { label: 'Pan', name: selectedPan?.name ?? '—', description: selectedPan?.description ?? null, price: selectedPan?.additional_price ?? null },
      { label: 'Relleno', name: selectedRelleno?.name ?? '—', description: selectedRelleno?.description ?? null, price: selectedRelleno?.additional_price ?? null },
      { label: 'Cobertura', name: selectedCobertura?.name ?? '—', description: selectedCobertura?.description ?? null, price: selectedCobertura?.additional_price ?? null },
    ];

    const total = items.reduce((acc, item) => acc + (item.price ?? 0), 0);

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-headline-sm text-on-surface">
          Resumen de tu pastel
        </h2>
        <Card variant="default" className="flex flex-col gap-4 p-6">
          {items.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 border-b border-outline-variant pb-3 last:border-b-0 last:pb-0">
              <div className="flex flex-col gap-1">
                <span className="text-label-md uppercase tracking-wide text-on-surface-variant">{item.label}</span>
                <span className="text-headline-sm text-on-surface">{item.name}</span>
                {item.description && (
                  <span className="text-body-sm text-on-surface-variant">{item.description}</span>
                )}
                {item.extra && (
                  <span className="text-body-sm text-on-surface-variant">{item.extra}</span>
                )}
              </div>
              <span className="text-headline-sm font-semibold text-secondary whitespace-nowrap">
                {formatPrice(item.price)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-outline pt-3">
            <span className="text-headline-sm text-on-surface">Total</span>
            <span className="text-headline-sm font-semibold text-secondary">
              {formatPrice(total)}
            </span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <h1 className="text-headline-md text-on-surface">Crear pastel</h1>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <p className="text-body-md text-on-surface-variant">
        Paso {currentStep + 1}: {STEPS[currentStep].label}
      </p>

      {renderStep()}

      {/* Sticky action footer — glassmorphism with running subtotal and nav */}
      <div className="glass-effect fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-between border-t border-outline-variant bg-surface/90 px-4 lg:px-8">
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
            onClick={next}
            disabled={getStepDisabled()}
            icon={
              <Icon name={isLastStep ? 'check' : 'arrow_forward'} />
            }
            iconPosition="right"
          >
            {isLastStep ? 'Finalizar' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  );
}
