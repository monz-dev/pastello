'use client';

import { cn } from '@/lib/utils/cn';

interface StepperStep {
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

/**
 * Stepper — horizontal progress indicator with connecting line.
 * Controlled component: parent owns state (typically via useStepper) and passes
 * currentStep + onStepClick. 2-6 steps recommended.
 * Current step: scale + active-step-glow. Completed: bg-secondary. Pending: bg-surface-variant.
 */
export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  const total = steps.length;
  const lastIndex = Math.max(total - 1, 0);
  // Progress line percentage aligns to the center of the current step dot.
  const progress =
    total > 1 ? (Math.min(currentStep, lastIndex) / lastIndex) * 100 : 0;

  return (
    <div className="w-full">
      {/* Dots row */}
      <div className="relative flex items-start justify-between">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-5 h-1 -translate-y-1/2 rounded-full bg-surface-variant" />
        {/* Progress fill */}
        <div
          className="absolute left-0 top-5 h-1 -translate-y-1/2 rounded-full bg-secondary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />

        {steps.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          const clickable = Boolean(onStepClick);
          return (
            <div
              key={index}
              className="relative z-10 flex flex-1 flex-col items-center gap-2"
            >
              <button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onStepClick?.(index) : undefined}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-button-text transition-all duration-300',
                  active && 'active-step-glow scale-110 bg-secondary text-on-secondary',
                  completed && 'bg-secondary text-on-secondary',
                  !active && !completed && 'bg-surface-variant text-on-surface-variant',
                  clickable && !active && 'hover:brightness-110 active:scale-95',
                )}
                aria-current={active ? 'step' : undefined}
                aria-label={`Paso ${index + 1}: ${step.label}`}
              >
                {completed ? (
                  <span className="material-symbols-outlined leading-none" aria-hidden="true">
                    check
                  </span>
                ) : (
                  index + 1
                )}
              </button>
              <span
                className={cn(
                  'text-label-md text-center',
                  active ? 'text-secondary' : 'text-on-surface-variant',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}