import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/supabase';

interface ProfileFieldProps {
  label: string;
  value: string | null;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-md uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>
      <span className="text-body-md text-on-surface">
        {value && value.trim() !== '' ? value : '—'}
      </span>
    </div>
  );
}

/**
 * Avatar — renders the user's avatar image when available, otherwise a
 * rounded placeholder with the first letter of the full name or email.
 */
function Avatar({
  avatarUrl,
  fallback,
}: {
  avatarUrl: string | null;
  fallback: string;
}) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow-card" />;
  }
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-headline-md font-semibold text-white shadow-card">
      {fallback.charAt(0).toUpperCase()}
    </div>
  );
}

/**
 * Profile page — server component (read-only).
 *
 * The (main) layout + middleware guard already ensure the user is
 * authenticated before this component renders. Here we resolve the session
 * (for the user id), fetch the matching `profiles` row, and display the
 * fields read-only: email, full_name, phone, and avatar.
 */
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login?next=/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const typedProfile = profile as Tables<'profiles'> | null;

  const fullName = typedProfile?.full_name ?? null;
  const email = typedProfile?.email ?? session.user.email ?? null;
  const avatarUrl = typedProfile?.avatar_url ?? null;
  const phone = typedProfile?.phone ?? null;
  const avatarFallback = fullName ?? email ?? 'U';

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-headline-md text-on-surface">Perfil</h1>

      {typedProfile ? (
        <div className="flex flex-col gap-6 rounded-2xl bg-surface-light p-6 shadow-card md:p-8">
          <div className="flex items-center gap-6">
            <Avatar avatarUrl={avatarUrl} fallback={avatarFallback} />
            <div className="flex flex-col gap-1">
              <span className="text-headline-sm text-on-surface">
                {fullName ?? 'Sin nombre'}
              </span>
              <span className="text-body-sm text-on-surface-variant">
                {email}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-outline-variant pt-6 md:grid-cols-2 lg:grid-cols-3">
            <ProfileField label="Nombre completo" value={fullName} />
            <ProfileField label="Email" value={email} />
            <ProfileField label="Teléfono" value={phone} />
          </div>

          <p className="text-label-md text-on-surface-variant">
            Esta información es de solo lectura en esta fase.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-light/60 px-4 py-16 text-center">
          <span className="material-symbols-outlined text-[3rem] text-on-surface-variant">
            person_off
          </span>
          <p className="text-body-md text-on-surface-variant">
            No encontramos tu perfil. Contacta con soporte si crees que es un error.
          </p>
        </div>
      )}
    </div>
  );
}
