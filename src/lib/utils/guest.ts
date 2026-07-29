/**
 * Guest credential helpers.
 *
 * Generates ephemeral credentials for silent anonymous sign-up so first-time
 * visitors get a real `auth.uid()` (all existing RLS policies work unchanged)
 * without requiring them to fill in a form.
 *
 * Uses the Web Crypto `crypto.randomUUID()` global, available in modern
 * browsers and in the Next.js 15 server runtime — no Node-only import so this
 * module is safe to bundle into client components.
 */
export interface GuestCredentials {
  email: string;
  password: string;
  id: string;
}

/**
 * Returns a fresh set of guest credentials: an email derived from a UUID and a
 * random UUID password. The email prefix `guest-` is the signal the AuthProvider
 * uses to derive the `isGuest` context flag.
 */
export function generateGuestCredentials(): GuestCredentials {
  const id = crypto.randomUUID();
  return {
    email: `guest-${id.slice(0, 8)}@pastello.app`,
    password: crypto.randomUUID(),
    id,
  };
}