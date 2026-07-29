'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { GoogleGlyph } from '@/components/auth/google-glyph';
import { useAuth } from '@/hooks/use-auth';

const GENERIC_INVALID_CREDENTIALS = 'Email o contraseña incorrectos';
const CALLBACK_ERROR = 'No pudimos completar el inicio de sesión con Google. Intenta de nuevo.';
const OAUTH_UNAVAILABLE_HINT = 'Google no está disponible por ahora. Usa email y contraseña.';
const SIGNIN_LOADING_LABEL = 'Iniciando sesión…';

/**
 * Login page — email/password form with an optional Google OAuth button.
 *
 * Design contract (sdd/pastello-auth-home):
 * - Generic non-enumerating error on invalid credentials.
 * - Email is preserved across failed submits so the user can retry.
 * - On success, redirect to the `next` search param (set by the middleware when
 *   bouncing a protected route) or fall back to `/home`.
 * - Google OAuth degrades gracefully: if `signInWithOAuth` throws at runtime,
 *   the button is replaced with a neutral hint instead of leaving a dead CTA.
 */
export default function LoginPage() {
  const { signIn, signInWithOAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get('next') ?? '/home';
  const hasCallbackError = searchParams.get('error') === 'auth_callback_error';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthUnavailable, setOauthUnavailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    hasCallbackError ? CALLBACK_ERROR : null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        // Non-enumerating: any sign-in failure surfaces the same message so we
        // never leaks whether the email exists.
        setErrorMessage(GENERIC_INVALID_CREDENTIALS);
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setErrorMessage(null);
    try {
      await signInWithOAuth('google');
    } catch {
      // Google provider not enabled in Supabase dashboard, network blocked the
      // OAuth redirect, or the auth client rejected the provider. Hide the
      // button and fall back to email/password without breaking the page.
      setOauthUnavailable(true);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-stretch gap-6">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-headline-md font-bold text-secondary">Bienvenida de nuevo</h1>
        <p className="text-body-md text-on-surface-variant">
          Inicia sesión para continuar
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-primary-container/40 active:scale-90"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={1.25} weight={500} />
          </button>
        </div>

        {errorMessage && (
          <p role="alert" className="text-body-sm text-error">
            {errorMessage}
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth loading={submitting}>
          {submitting ? SIGNIN_LOADING_LABEL : 'Iniciar sesión'}
        </Button>
      </form>

      {!oauthUnavailable ? (
        <div className="flex flex-col items-center gap-3">
          <span className="text-label-md text-on-surface-variant">o</span>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleGoogle}
            icon={<GoogleGlyph />}
          >
            Continuar con Google
          </Button>
        </div>
      ) : (
        <p className="text-center text-body-sm text-on-surface-variant">
          {OAUTH_UNAVAILABLE_HINT}
        </p>
      )}

      <p className="text-center text-body-sm text-on-surface-variant">
        ¿No tenés cuenta?{' '}
        <Link
          href="/signup"
          className="font-semibold text-primary underline underline-offset-2 hover:text-primary-fixed-dim"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}