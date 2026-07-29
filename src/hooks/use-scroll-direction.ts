'use client';

import { useEffect, useState } from 'react';

export interface UseScrollDirectionResult {
  direction: 'up' | 'down';
  isAtTop: boolean;
}

/**
 * useScrollDirection — detects vertical scroll direction with anti-flapping threshold.
 * `threshold` is the minimum delta (px) between two updates before direction switches,
 * and also defines the "at top" band (scrollY < threshold).
 */
export function useScrollDirection(threshold = 100): UseScrollDirectionResult {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      setIsAtTop(scrollY < threshold);

      const delta = scrollY - lastScrollY;
      if (Math.abs(delta) > threshold) {
        setDirection(delta > 0 ? 'down' : 'up');
        lastScrollY = scrollY;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initialize at top state on mount.
    setIsAtTop(window.scrollY < threshold);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return { direction, isAtTop };
}