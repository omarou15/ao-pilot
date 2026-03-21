"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold">Erreur</h2>
      <p className="max-w-md text-muted-foreground">
        {error.message || "Une erreur inattendue est survenue dans le tableau de bord."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Réessayer
      </button>
    </div>
  );
}
