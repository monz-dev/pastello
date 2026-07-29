'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResponse, Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { generateGuestCredentials } from '@/lib/utils/guest';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signInWithOAuth: (provider: 'google') => Promise<void>;
  signOut: () => Promise<void>;
}

/** Prefix used to identify auto-generated guest accounts in the auth pipeline. */
export const GUEST_EMAIL_PREFIX = 'guest-';

export const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  /**
   * Session resolved by the root server layout via `supabase.auth.getSession()`.
   * Passing `undefined` (no server resolution) keeps `isLoading` true until the
   * first `onAuthStateChange` event resolves it. Passing `null` means the
   * server already determined there is no session.
   */
  initialSession?: Session | null;
  children: ReactNode;
}

/**
 * AuthProvider — client context that propagates the Supabase session resolved
 * server-side at the root layout to any descendant that calls `useAuth()`.
 *
 * The auth helper methods (`signIn`, `signUp`, `signInWithOAuth`, `signOut`)
 * create a fresh browser Supabase client on demand and return Supabase's raw
 * `AuthResponse`, so the calling auth form can read `data` / `error` and drive
 * the redirect / inline-error UX without the provider coupling to routing.
 *
 * Guest mode: when the server reports `initialSession === null` (no session at
 * all), a silent anonymous `signUp` runs on mount so the visitor immediately
 * gets a real `auth.uid()` and existing RLS policies work unchanged. The
 * `isGuest` flag is derived from the email prefix and exposed to consumers.
 */
export function AuthProvider({ initialSession = null, children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(initialSession === undefined);

  // Subscribe to auth state changes so login/logout elsewhere propagates.
  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Silent guest sign-up: only when the server confirmed there is no session.
  // We attempt it once on mount; if the project does not auto-confirm new
  // users (or any other error occurs) we bail out gracefully and leave the
  // visitor unauthenticated rather than surfacing a blocking error.
  useEffect(() => {
    if (initialSession !== null) return;

    let cancelled = false;
    void (async () => {
      try {
        const { email, password } = generateGuestCredentials();
        const supabase = createClient();
        const result = await supabase.auth.signUp({ email, password });
        if (cancelled) return;

        const error = result?.error;
        if (error) {
          // Auto-confirm disabled or rate-limited — stay unauthenticated.
          console.warn('[AuthProvider] guest signUp failed:', error.message);
          return;
        }

        const newSession = result?.data?.session;
        if (newSession) {
          setSession(newSession);
          setIsLoading(false);
        }
        // If no session returned (email confirmation required), onAuthStateChange
        // or a subsequent event will populate the session when available.
      } catch (err) {
        console.warn('[AuthProvider] guest signUp error:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialSession]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isGuest:
        typeof session?.user?.email === 'string' &&
        session.user.email.startsWith(GUEST_EMAIL_PREFIX),
      signIn: (email, password) =>
        createClient().auth.signInWithPassword({ email, password }),
      signUp: (email, password) =>
        createClient().auth.signUp({ email, password }),
      signInWithOAuth: async (provider) => {
        await createClient().auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      },
      signOut: async () => {
        await createClient().auth.signOut();
        setSession(null);
      },
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Internal hook only used to surface the raw context; consumers should prefer
 * the typed `useAuth` from `@/hooks/use-auth`.
 */
export function useAuthContext(): AuthState | undefined {
  return useContext(AuthContext);
}