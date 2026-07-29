'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Splash page — entry screen with the Pastello wordmark, an "Entrar" CTA and a
 * 3-second auto-redirect to /home. Uses the `animate-fade-in` utility token
 * (defined in globals.css @theme as `--animate-fade-in`).
 */
export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-surface px-container-padding-mobile md:px-container-padding-desktop flex min-h-screen flex-col items-center justify-center gap-8 md:gap-12">
      <div className="animate-fade-in flex flex-col items-center gap-4">
        <h1 className="text-display-lg-mobile text-secondary">Pastello</h1>
        <p className="text-body-lg text-on-surface-variant">
          Pastelería de alta gama
        </p>
      </div>

      <Button
        variant="secondary"
        size="lg"
        onClick={() => router.push('/home')}
      >
        Entrar
      </Button>
    </div>
  );
}
