'use client';

import { Stepper } from '@/components/ui/stepper';
import { useStepper } from '@/hooks/use-stepper';
import { Button } from '@/components/ui/button';

/**
 * Create page placeholder — custom cake builder skeleton.
 * Client component because it owns step state via useStepper and renders the
 * interactive Stepper plus navigation buttons. Five mock steps match the
 * creation flow: Tamaño → Pan → Relleno → Cobertura → Resumen.
 */
const STEPS = [
  { label: 'Tamaño' },
  { label: 'Pan' },
  { label: 'Relleno' },
  { label: 'Cobertura' },
  { label: 'Resumen' },
];

export default function CreatePage() {
  const { currentStep, next, prev, isFirstStep, isLastStep } = useStepper(
    STEPS.length
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-headline-md text-on-surface">Crear pastel</h1>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <p className="text-body-md text-on-surface-variant">
        Paso {currentStep + 1}: {STEPS[currentStep].label}
      </p>

      <div className="flex justify-between gap-4">
        <Button variant="ghost" onClick={prev} disabled={isFirstStep}>
          Anterior
        </Button>
        <Button variant="primary" onClick={next} disabled={isLastStep}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
