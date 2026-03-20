import { HardHat } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1e3a5f] via-[#2a5a8f] to-[#3b82f6]">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
          <HardHat className="h-8 w-8 text-orange-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-[family-name:var(--font-space-grotesk)]">
          AO Pilot
        </h1>
        <p className="mt-1 text-sm text-white/70">
          Réponse aux Appels d&apos;Offres BTP
        </p>
      </div>
      <div className="glass rounded-2xl p-1">{children}</div>
    </div>
  )
}
