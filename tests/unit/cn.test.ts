import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils/cn';

describe('cn', () => {
  it('merges conflicting tailwind classes (tailwind-merge behavior)', () => {
    // px-2 and px-4 conflict; tailwind-merge keeps the last one.
    expect(cn('px-2', 'px-4')).toBe('px-4');
    // text-left beats text-center.
    expect(cn('text-center', 'text-left')).toBe('text-left');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
      'base active'
    );
    // Falsy values (false, null, undefined) are dropped by clsx.
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c');
  });

  it('handles empty args', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });
});
