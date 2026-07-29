import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback route handler.
 *
 * After the user consents on the provider (e.g. Google), the provider redirects
 * here with a `code` query param. We exchange it for a Supabase session (which
 * sets the auth cookies server-side via the SSR client) and then redirect to the
 * `next` query param (defaults to `/home`).
 *
 * If the code is missing or the exchange fails, we send the user back to the
 * login page with an `error=auth_callback_error` flag so the login form can
 * surface an inline message.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}