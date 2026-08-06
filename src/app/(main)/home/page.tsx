import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CakeCarousel } from '@/components/features/cake-carousel';
import type { Tables } from '@/types/supabase';
import { cn } from '@/lib/utils/cn';

/**
 * Cake carousel skeleton — shown while the carousel is lazy/streamed.
 * Three ghost cards mimic the snap-scroll layout.
 */
function CakeCarouselSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-12 w-full animate-pulse rounded-full bg-surface-container-low" />
      <div className="flex gap-6 overflow-hidden pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-[85vw] max-w-[400px] flex-shrink-0 sm:w-[45vw] sm:max-w-[360px] md:w-[380px] md:max-w-[380px] lg:w-auto lg:max-w-none lg:flex-shrink"
          >
            <div className="aspect-square w-full animate-pulse rounded-lg bg-surface-container-low" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-surface-container-low" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-container-low" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Primary CTA button rendered as an anchor (server-compatible navigation). */
const CTA_PRIMARY =
  'inline-flex h-14 items-center justify-center gap-2 rounded-md bg-secondary px-8 text-body-lg font-semibold text-white transition duration-200 ease-in-out hover:brightness-110 active:scale-95';

const CTA_OUTLINE = cn(
  CTA_PRIMARY,
  'bg-surface-light border border-outline-variant text-primary hover:brightness-100',
);

/**
 * Home page — async server component.
 *
 * Fetches active pre-designed cakes server-side, then renders the CakeCarousel
 * client island (wrapped in a Suspense boundary with a skeleton fallback for
 * future streaming / lazy loading). Below the catalog sit the Quick Access
 * CTAs and a "¿Tienes una idea?" section.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: cakes } = await supabase
    .from('pre_designed_cakes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const activeCakes: Tables<'pre_designed_cakes'>[] = cakes ?? [];

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-md text-on-surface">Inicio</h1>
        <p className="text-body-md text-on-surface-variant">
          Explora nuestros pasteles prediseñados o crea el tuyo personalizado.
        </p>
      </div>

      <Suspense fallback={<CakeCarouselSkeleton />}>
        <CakeCarousel cakes={activeCakes} />
      </Suspense>

      {/* Quick Access CTAs */}
      <section className="flex flex-col gap-4">
        <h2 className="text-headline-sm text-on-surface">Acceso rápido</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/create" className={CTA_PRIMARY}>
            <span className="material-symbols-outlined leading-none">cake</span>
            Crear mi pastel
          </Link>
          <Link href="/custom" className={CTA_OUTLINE}>
            <span className="material-symbols-outlined leading-none">
              photo_camera
            </span>
            Subir imagen
          </Link>
        </div>
      </section>

      {/* "¿Tienes una idea?" section */}
      <section className="flex flex-col items-start gap-4 rounded-2xl bg-primary-container/40 p-6 md:p-8">
        <h2 className="text-headline-md text-on-primary-container">
          ¿Tienes una idea?
        </h2>
        <p className="text-body-md text-on-primary-container/80">
          Diseña tu pastel paso a paso: tamaño, pan, relleno y cobertura.
          Cuando estés listo, lo enviamos directamente a la pastelería.
        </p>
        <Link href="/create" className={CTA_PRIMARY}>
          <span className="material-symbols-outlined leading-none">
            auto_awesome
          </span>
          Empezar a crear
        </Link>
      </section>
    </div>
  );
}
