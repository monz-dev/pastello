/**
 * Google "G" logo glyph — the official four-color mark, the universal
 * affordance for "Continuar con Google". Kept inline (no network fetch for a
 * brand asset) and server-rendered (no client state). Sized to match the
 * Material Symbols icon scale used by the Button `icon` slot.
 */
export function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.14 2.74-2.42 3.58v3h3.91c2.29-2.11 3.53-5.22 3.53-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.91-3.01c-1.08.72-2.46 1.16-4.02 1.16-3.09 0-5.71-2.09-6.65-4.91H1.31v3.1A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.35 14.33A7.2 7.2 0 0 1 4.95 12c0-.81.14-1.59.39-2.33V6.57H1.31A11.99 11.99 0 0 0 0 12c0 1.94.47 3.77 1.31 5.43l4.04-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.81l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.31 6.57l4.04 3.1C6.29 6.84 8.91 4.75 12 4.75z"
      />
    </svg>
  );
}