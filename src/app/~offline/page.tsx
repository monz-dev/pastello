export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="material-symbols-outlined text-6xl text-primary">
        wifi_off
      </span>
      <h1 className="text-display-sm font-semibold text-on-surface">
        Sin conexión
      </h1>
      <p className="text-body-md text-on-surface-variant max-w-sm">
        Parece que no tienes internet. Algunas funciones no estarán disponibles
        hasta que vuelvas a conectarte.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full bg-primary px-6 py-3 text-label-lg text-on-primary hover:opacity-90 transition-opacity"
      >
        Reintentar
      </button>
    </div>
  );
}
