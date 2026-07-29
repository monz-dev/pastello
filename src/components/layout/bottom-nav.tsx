'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: 'home', href: '/home' },
  { id: 'create', label: 'Crear', icon: 'cake', href: '/create' },
  { id: 'orders', label: 'Pedidos', icon: 'receipt_long', href: '/orders' },
  { id: 'profile', label: 'Perfil', icon: 'person', href: '/profile' },
] as const;

interface BottomNavProps {
  /**
   * Optional override for the active item id. When omitted, the active item is
   * derived from `usePathname()` so the nav stays in sync with the current route
   * without callers having to recompute it.
   */
  activeItem?: string;
}

const NAV_IDS = NAV_ITEMS.map((item) => item.id) as readonly string[];

function deriveActiveItem(pathname: string): string {
  const first = pathname.split('/').filter(Boolean)[0];
  if (first && NAV_IDS.includes(first)) return first;
  return 'home';
}

/**
 * BottomNav — fixed glassmorphic mobile navigation. Visible only on mobile
 * (md:hidden). Each item is a `next/link` `<Link>` for prefetching and native
 * client-side routing; the active item is highlighted with a pill container.
 */
export function BottomNav({ activeItem }: BottomNavProps) {
  const pathname = usePathname();
  const active = activeItem ?? deriveActiveItem(pathname);

  return (
    <nav
      className="glass-effect fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around rounded-t-xl px-2 shadow-top md:hidden"
      aria-label="Navegación inferior"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex min-h-[44px] items-center gap-2 rounded-full px-4 transition duration-300 active:scale-90',
              isActive
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-variant/50',
            )}
          >
            <Icon
              name={item.icon}
              size={1.5}
              fill={isActive ? 1 : 0}
              weight={isActive ? 600 : 400}
            />
            <span className="text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}