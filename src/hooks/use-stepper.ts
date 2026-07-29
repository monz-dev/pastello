'use client';

import { useCallback, useState } from 'react';

export interface UseStepperResult {
  currentStep: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  /** Percentage 0-100 based on position within the linear range. */
  progress: number;
}

/**
 * useStepper — linear step state with bounds clamping.
 * currentStep is clamped to [0, totalSteps - 1]; operations never overflow.
 */
export function useStepper(totalSteps: number, initialStep = 0): UseStepperResult {
  const clampedInitial = Math.min(
    Math.max(initialStep, 0),
    Math.max(totalSteps - 1, 0),
  );
  const [currentStep, setCurrentStep] = useState(clampedInitial);

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, Math.max(totalSteps - 1, 0)));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const goTo = useCallback(
    (step: number) => {
      setCurrentStep(Math.min(Math.max(step, 0), Math.max(totalSteps - 1, 0)));
    },
    [totalSteps],
  );

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === Math.max(totalSteps - 1, 0);
  const progress =
    totalSteps > 1
      ? (currentStep / (totalSteps - 1)) * 100
      : totalSteps === 1
        ? 100
        : 0;

  return { currentStep, next, prev, goTo, isFirstStep, isLastStep, progress };
}