'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { GoogleGlyph } from '@/components/auth/google-glyph';
import { useAuth } from '@/hooks/use-auth';

const PASSWORD_MIN_LENGTH = 6;

const VALIDATION = {
  EMAIL_INVALID: 'Ingresa un correo electrónico válido.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres.',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
} as const;

const SIGNUP_ERRORS = {
  EMAIL_TAKEN: 'Este email ya está registrado.',
  GENERIC: 'No se pudo crear la cuenta. Intenta de nuevo.',
} as const;

const OAUTH_UNAVAILABLE_HINT = 'Google no está disponible por ahora. Usa email y contraseña.';
const SIGNUP_LOADING_LABEL = 'Creando cuenta…';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
  confirm?: string;
}

/**
 * Validates the signup form client-side BEFORE calling Supabase, per spec
 * REQ-001 (weak/short password and mismatched confirmation must error without
 * a network request). Returns a map of per-field messages; empty when valid.
 */
function validateSignup(email: string, password: string, confirm: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = VALIDATION.EMAIL_INVALID;
  if (password.length < PASSWORD_MIN_LENGTH) errors.password = VALIDATION.PASSWORD_TOO_SHORT;
  if (confirm !== password) errors.confirm = VALIDATION.PASSWORD_MISMATCH;
  return errors;
}

/**
 * Maps a Supabase signUp error to a user-facing message. Supabase returns
 * `User already registered` for a duplicate email; any other failure surfaces
 * a generic non-enumerating message.
 */
function mapSignUpError(message: string): string {
  if (/already registered|already been registered/i.test(message)) {
    return SIGNUP_ERRORS.EMAIL_TAKEN;
  }
  return SIGNUP_ERRORS.GENERIC;
}

/**
 * Signup page — email + password + confirmation form with optional Google
 * OAuth. Per spec REQ-001, validation (email format, password ≥ 6 chars,
 * confirmation match) runs client-side before any Supabase call. On success
 * the user is redirected to `/home` (Supabase auto-establishes a session on
 * signUp when email confirmation is disabled — the configured setup for this
 * project).
 */
export default function SignupPage() {
  const { signUp, signInWithOAuth } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthUnavailable, setOauthUnavailable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const validation = validateSignup(email, password, confirm);
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const { data, error } = await signUp(email.trim(), password);
      if (error) {
        setFormError(mapSignUpError(error.message));
        return;
      }
      // When email confirmation is disabled (this project's setup), signUp
      // returns an active session immediately. If no session yet, redirect to
      // login so the user can sign in with the credentials they just created.
      if (data.session) {
        router.push('/home');
        router.refresh();
      } else {
        router.push('/login');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setFormError(null);
    try {
      await signInWithOAuth('google');
    } catch {
      setOauthUnavailable(true);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-stretch gap-6">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-headline-md font-bold text-secondary">Crea tu cuenta</h1>
        <p className="text-body-md text-on-surface-variant">
          Empieza a diseñar tu pastel ideal
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
          error={fieldErrors.email}
        />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
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

        <Input
          label="Confirmar contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={fieldErrors.confirm}
          className="pr-12"
        />

        {formError && (
          <p role="alert" className="text-body-sm text-error">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth loading={submitting}>
          {submitting ? SIGNUP_LOADING_LABEL : 'Crear cuenta'}
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
        ¿Ya tienes una cuenta?{' '}
        <Link
          href="/login"
          className="font-semibold text-primary underline underline-offset-2 hover:text-primary-fixed-dim"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
