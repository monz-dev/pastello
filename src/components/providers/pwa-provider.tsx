'use client';

import { SerwistProvider as Serwist } from '@serwist/next/react';
import type { ReactNode } from 'react';

export function PWAProvider({ children }: { children: ReactNode }) {
  return <Serwist swUrl="/sw.js">{children}</Serwist>;
}
