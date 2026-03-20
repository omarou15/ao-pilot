export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          AO Pilot
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Réponse aux Appels d&apos;Offres BTP
        </p>
      </div>
      <div>{children}</div>
    </div>
  )
}
