import type { ReactNode } from 'react';

/**
 * Auth layout — centered container for login and registration screens.
 * Server component. No navigation chrome; full-height flex column centered.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface px-container-padding-mobile md:px-container-padding-desktop flex min-h-screen flex-col items-center justify-center gap-6 md:gap-8 py-8 md:py-16">
      {children}
    </div>
  );
}
