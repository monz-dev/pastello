import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { createClient } from '@/lib/supabase/server';
import { AuthProvider } from '@/components/providers/auth-provider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Pastello — Pastelería de Alta Gama',
  description:
    'Pasteles personalizados de alta gama. Elige, personaliza y pide tu pastel ideal.',
};

/**
 * RootLayout — Server component.
 * Loads the Inter font via next/font (zero layout shift, self-hosted) and the
 * Material Symbols Outlined variable font for the Icon system. Body uses the
 * surface background and body-md typography tokens from globals.css @theme.
 *
 * The Supabase session is resolved here once per request and handed to the
 * `<AuthProvider>` (client) so descendants (TopNav, BottomNav, pages) get a
 * single reactive auth surface instead of each calling `getSession()` again.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="es" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md antialiased">
        <AuthProvider initialSession={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
