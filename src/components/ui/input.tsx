'use client';

import { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
}

/**
 * Input — controlled or uncontrolled floating-label field.
 * Min-height 48px. Focus: border-primary + ring-primary/30. Error: border-error + error-container.
 * Internal focus/blur state drives the floating label.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    prefixIcon,
    className,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    id,
    type = 'text',
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : '',
  );
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isControlled = value !== undefined && value !== null;
  const currentValue = isControlled ? String(value) : internalValue;
  const hasValue = currentValue.length > 0;
  const floated = focused || hasValue;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <div className="relative">
        {prefixIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {prefixIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={isControlled ? value : internalValue}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            'min-h-12 w-full rounded-md border bg-beige-soft px-4 pb-2 pt-4 text-body-md text-on-surface outline-none transition-colors duration-200',
            prefixIcon ? 'pl-12' : '',
            !hasError &&
              'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/30',
            hasError && 'border-error bg-error-container focus:border-error',
            className,
          )}
          aria-invalid={hasError || undefined}
          aria-describedby={
            helperText || hasError ? `${inputId}-helper` : undefined
          }
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-4 bg-beige-soft px-1 text-on-surface-variant transition-all duration-200',
            prefixIcon ? 'left-12' : '',
            floated
              ? '-top-2 text-label-md text-primary'
              : 'top-1/2 -translate-y-1/2 text-body-sm',
            hasError && floated && 'text-error',
          )}
        >
          {label}
        </label>
      </div>
      {hasError ? (
        <p id={`${inputId}-helper`} className="mt-1 pl-4 text-body-sm text-error">
          {error}
        </p>
      ) : (
        helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 pl-4 text-body-sm text-on-surface-variant"
          >
            {helperText}
          </p>
        )
      )}
    </div>
  );
});