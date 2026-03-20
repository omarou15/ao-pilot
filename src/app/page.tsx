import Link from "next/link"
import {
  Calculator,
  FileText,
  FolderCheck,
} from "lucide-react"

const features = [
  {
    icon: Calculator,
    title: "Chiffrage automatique",
    description:
      "Analyse du DPGF et chiffrage intelligent basé sur les prix du marché avec une marge de 30%.",
  },
  {
    icon: FileText,
    title: "Mémoire technique IA",
    description:
      "Génération automatique du mémoire technique structuré selon les critères du RC.",
  },
  {
    icon: FolderCheck,
    title: "Dossier complet prêt à déposer",
    description:
      "DPGF chiffré, mémoire technique et documents administratifs assemblés en un clic.",
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="bg-zinc-900 px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AO Pilot
          </h1>
          <p className="mt-4 text-lg text-zinc-300 sm:text-xl">
            Réponse aux Appels d&apos;Offres BTP en quelques heures
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Upload du DCE, chiffrage automatique, mémoire technique et dossier
            complet prêt à déposer.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-600 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="flex-1 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
            Tout ce qu&apos;il faut pour répondre aux appels d&apos;offres
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-lg border border-zinc-200 p-6 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                    <Icon className="h-6 w-6 text-zinc-700" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-6 text-center text-xs text-zinc-500">
        AO Pilot &mdash; Automatisation des appels d&apos;offres BTP
      </footer>
    </div>
  )
}
