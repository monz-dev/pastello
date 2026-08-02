'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/layout/top-nav';
import { BottomNav } from '@/components/layout/bottom-nav';

/**
 * Main layout — wraps the authenticated experience with the fixed TopNav and
 * the mobile-only BottomNav. The active bottom-nav item is derived from the
 * current pathname so it stays in sync across the (main) routes.
 *
 * Padding: pt-20 clears the fixed TopNav (h-16), pb-32 clears the fixed
 * BottomNav (h-16) plus breathing room. Container padding switches at md.
 */
const NAV_IDS = ['home', 'create', 'orders', 'profile'] as const;

function getActiveItem(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && (NAV_IDS as readonly string[]).includes(first)) {
    return first;
  }
  return 'home';
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeItem = getActiveItem(pathname);

  return (
    <>
      <TopNav />
      <main className="px-container-padding-mobile md:px-container-padding-tablet lg:ml-64 lg:px-container-padding-desktop pt-20 pb-32 lg:pb-16">
        {children}
      </main>
      <BottomNav activeItem={activeItem} />
    </>
  );
}
