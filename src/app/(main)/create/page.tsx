'use client';

import { useCallback, useEffect, useState } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { useStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

export default function CreatePage() {
  const supabase = createClient();
  const { currentStep, next, prev, isFirstStep, isLastStep } = useStepper(
    STEPS.length,
  );

  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  const selectedSize = sizes.find((s) => s.id === selectedSizeId) ?? null;

  const fetchSizes = useCallback(async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, description, additional_price')
      .eq('type', 'tamaño')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setSizes(data as SizeOption[]);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchSizes();
  }, [fetchSizes]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-headline-md text-on-surface">Crear pastel</h1>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <p className="text-body-md text-on-surface-variant">
        Paso {currentStep + 1}: {STEPS[currentStep].label}
      </p>

      {currentStep === 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-headline-sm text-on-surface">
            Elegí el tamaño de tu pastel
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sizes.map((size) => (
              <Card
                key={size.id}
                variant="selection"
                title={size.name}
                description={size.description ?? undefined}
                price={size.additional_price ?? 0}
                selected={selectedSizeId === size.id}
                onSelect={() => setSelectedSizeId(size.id)}
              />
            ))}
          </div>
        </div>
      )}

      {currentStep > 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-outline-variant bg-surface-light/60 px-4 py-20 text-center">
          <span className="text-headline-sm text-on-surface">
            Próximamente
          </span>
          <span className="text-body-md text-on-surface-variant">
            Selección de {STEPS[currentStep].label} disponible en la próxima
            actualización.
          </span>
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button variant="ghost" onClick={prev} disabled={isFirstStep}>
          Anterior
        </Button>
        <Button
          variant="primary"
          onClick={next}
          disabled={isLastStep || (currentStep === 0 && selectedSize === null)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
