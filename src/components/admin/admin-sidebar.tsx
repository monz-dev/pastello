'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/orders', label: 'Pedidos', icon: 'receipt_long' },
  { href: '/admin/catalog', label: 'Catálogo', icon: 'cake' },
  { href: '/admin/settings', label: 'Configuración', icon: 'settings' },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * AdminSidebar — client-side collapsible admin navigation.
 *
 * Desktop (≥md): a fixed `w-64` glass rail on the left, full height, content
 * offset by `pt-20` to clear the top nav band.
 * Mobile (<md): hidden off-canvas drawer revealed by a hamburger in a fixed
 * glass top bar; a translucent backdrop dismisses the drawer.
 *
 * Active item is derived from the current pathname and rendered with the
 * `secondary-container` fill and a filled icon.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar with hamburger — only visible below md. */}
      <div className="glass-effect fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 bg-surface/80 px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de administración"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition duration-200 active:scale-90"
        >
          <Icon name="menu" size={1.5} weight={600} />
        </button>
        <span className="text-headline-sm font-bold text-secondary">
          Pastello Admin
        </span>
      </div>

      {/* Mobile backdrop — dismisses the drawer when tapped. */}
      {open && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar rail. On mobile it slides in from the left; on desktop it is
          always visible and static. */}
      <aside
        className={cn(
          'glass-effect fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col gap-2 border-r border-outline-variant bg-surface/80 px-3 pb-6 pt-20 transition-transform duration-300 ease-in-out md:bottom-auto md:h-full md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="Administración">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-full px-4 py-3 text-body-md transition duration-200',
                  active
                    ? 'bg-secondary-container font-semibold text-on-secondary-container'
                    : 'font-medium text-on-surface-variant hover:bg-surface-container-high',
                )}
              >
                <Icon
                  name={item.icon}
                  size={1.4}
                  weight={active ? 600 : 400}
                  fill={active ? 1 : 0}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}