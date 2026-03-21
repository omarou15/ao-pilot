"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold">Erreur critique</h2>
          <p className="max-w-md text-muted-foreground">
            {error.message || "L'application a rencontré une erreur inattendue."}
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
