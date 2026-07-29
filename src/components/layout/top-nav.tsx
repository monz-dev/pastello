'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { useAuth } from '@/hooks/use-auth';

const AVATAR_FALLBACK_LABEL = '?';

interface TopNavProps {
  title?: string;
  onMenuClick?: () => void;
  onCartClick?: () => void;
}

/**
 * Computes the avatar initial used in the authenticated pill: prefers the
 * user's `email` local part, falls back to `user_metadata.full_name`, then to
 * a neutral placeholder.
 */
function getAvatarInitial(user: { email?: string } | null): string {
  const email = user?.email;
  if (email && email.length > 0) {
    const localPart = email.split('@')[0] ?? '';
    if (localPart.length > 0) return localPart.charAt(0).toUpperCase();
  }
  return AVATAR_FALLBACK_LABEL;
}

/**
 * TopNav — fixed glassmorphic top bar with scroll-driven hide/show.
 * Hides on scroll down (translateY -100%), reveals on scroll up.
 * Left: hamburger menu. Center: "Pastello" logo (or `title` override). Right:
 *   - When authenticated: avatar pill opening a logout dropdown.
 *   - When unauthenticated: "Iniciar sesión" anchor linking to `/login`.
 * The cart button is always rendered to the right of the auth widget.
 */
export function TopNav({ title, onMenuClick, onCartClick }: TopNavProps) {
  const { direction, isAtTop } = useScrollDirection();
  const hidden = !isAtTop && direction === 'down';
  const { user, isGuest, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push('/home');
  }

  return (
    <header
      className={cn(
        'glass-effect fixed inset-x-0 top-0 z-50 h-16 shadow-sm transition-transform duration-300 ease-in-out',
        hidden ? '-translate-y-full' : 'translate-y-0',
      )}
    >
      <div className="flex h-full items-center justify-between px-container-padding-mobile">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition duration-200 active:scale-90"
        >
          <Icon name="menu" size={1.5} weight={600} />
        </button>

        <span className="text-display-lg-mobile font-bold text-secondary">
          {title ?? 'Pastello'}
        </span>

        <div className="flex items-center gap-1">
          {user ? (
            isGuest ? (
              <div className="flex items-center gap-2">
                <span className="flex h-8 items-center rounded-full bg-tertiary-container px-3 text-label-sm font-semibold text-on-tertiary-container">
                  Invitado
                </span>
                <Link
                  href="/signup"
                  className="flex h-10 items-center rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary transition duration-200 hover:opacity-90 active:scale-95"
                >
                  Crear cuenta
                </Link>
              </div>
            ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Cuenta"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container transition duration-200 active:scale-90"
              >
                <span className="text-label-md font-semibold">
                  {getAvatarInitial(user)}
                </span>
              </button>

              {menuOpen && (
                <>
                  {/* Click-outside overlay: invisible full-screen catcher that
                      closes the dropdown without trapping the click in the
                      menu itself. */}
                  <button
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-modal"
                  >
                    <div className="border-b border-outline-variant px-4 py-2 text-body-sm text-on-surface-variant">
                      {user.email ?? 'Cuenta'}
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-3 text-body-md text-on-surface transition hover:bg-surface-container-high"
                    >
                      <Icon name="logout" size={1.25} weight={500} />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
            )
          ) : (
            <Link
              href="/login"
              className="flex h-10 items-center rounded-full px-3 text-body-sm font-semibold text-primary transition duration-200 hover:bg-primary-container/40 active:scale-95"
            >
              Iniciar sesión
            </Link>
          )}

          <button
            type="button"
            onClick={onCartClick}
            aria-label="Carrito"
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition duration-200 active:scale-90"
          >
            <Icon name="shopping_bag" size={1.5} weight={600} />
          </button>
        </div>
      </div>
    </header>
  );
}