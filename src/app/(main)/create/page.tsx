'use client';

import { useCallback, useEffect, useState } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { useStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

/** Fallback sizes shown when Supabase is unreachable or the migration hasn't
 *  been applied yet. IDs are stable so `selectedSizeId` comparisons still work.
 *  Once the remote `ingredients` table has `tamaño` rows, those take over. */
const FALLBACK_SIZES: SizeOption[] = [
  { id: 'fallback-mini', name: 'Mini', description: '7cm — Ideal para 2-4 personas', additional_price: 0 },
  { id: 'fallback-mediano', name: 'Mediano', description: '14cm — Ideal para 6-8 personas', additional_price: 80 },
  { id: 'fallback-doble-piso', name: 'Doble piso', description: '14cm + 14cm — Dos niveles, ideal para 12-15 personas', additional_price: 150 },
  { id: 'fallback-grande', name: 'Grande', description: '20cm — Ideal para 15-20 personas', additional_price: 200 },
  { id: 'fallback-extra-grande', name: 'Extra grande', description: '24cm — Ideal para 25-30 personas', additional_price: 280 },
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

/** Strips the leading "Xcm — " prefix from descriptions since the cm
 *  measurement already appears below the cake icon. */
function cleanDescription(desc: string | null): string | null {
  if (!desc) return null;
  return desc.replace(/^\d+\s*cm(\s*\+\s*\d+\s*cm)?\s*[—–-]\s*/, '').trim() || null;
}

export default function CreatePage() {
  const supabase = createClient();
  const { currentStep, next, prev, isFirstStep, isLastStep } = useStepper(
    STEPS.length,
  );

  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  const selectedSize = sizes.find((s) => s.id === selectedSizeId) ?? null;

  const fetchSizes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, description, additional_price')
        .eq('type', 'tamaño')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setSizes(data as SizeOption[]);
        return;
      }
    } catch {
      // Supabase unreachable — fall through to fallback
    }
    setSizes(FALLBACK_SIZES);
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
                  </div>
                </Card>
              );
            })}
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
