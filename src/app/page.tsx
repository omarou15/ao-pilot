import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  Brain,
  Package,
  Upload,
  Sparkles,
  Download,
  HardHat,
  ArrowRight,
  ChevronRight,
} from "lucide-react"

export default async function Home() {
  const { userId } = await auth()
  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#2a5a8f] px-6 py-20"
        style={{
          backgroundImage: `
            linear-gradient(to bottom right, #0f2744, #1e3a5f, #2a5a8f),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
        }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold leading-tight tracking-tight text-white lg:text-6xl">
            Répondez aux appels d&apos;offres BTP en 10 minutes
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 lg:text-xl">
            L&apos;IA qui analyse vos DCE, chiffre votre DPGF et génère votre
            mémoire technique automatiquement.
          </p>

          {/* Animated Stats Row */}
          <div className="mt-10 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">500+</div>
              <div className="mt-1 text-sm text-white/60">AO traités</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">30%</div>
              <div className="mt-1 text-sm text-white/60">marge garantie</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">10 min</div>
              <div className="mt-1 text-sm text-white/60">par dossier</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#e67e22] px-8 py-3 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-[#d35400]"
            >
              Commencer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-white/10"
            >
              Se connecter
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-center text-3xl font-bold tracking-tight text-[#1e3a5f] lg:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f] p-3 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#1e3a5f]">
                Chiffrage automatique
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Notre IA analyse votre DPGF et propose des prix basés sur des
                références marché vérifiées.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f] p-3 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#1e3a5f]">
                Mémoire technique IA
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Génération automatique du mémoire technique adapté aux critères
                du règlement de consultation.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f] p-3 text-white">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#1e3a5f]">
                Dossier complet
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Export ZIP prêt à soumettre : DPGF chiffré, mémoire technique,
                documents administratifs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-center text-3xl font-bold tracking-tight text-[#1e3a5f] lg:text-4xl">
            Comment ça marche
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f] text-lg font-bold text-white">
                1
              </div>
              {/* Connector line — hidden on mobile */}
              <div className="absolute right-0 top-6 hidden h-0.5 w-[calc(50%-24px)] bg-[#1e3a5f]/20 sm:block" />
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
                <Upload className="h-7 w-7 text-[#1e3a5f]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1e3a5f]">
                Uploadez votre DCE
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Glissez-déposez vos fichiers PDF, Excel et Word du dossier de
                consultation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f] text-lg font-bold text-white">
                2
              </div>
              <div className="absolute left-0 top-6 hidden h-0.5 w-[calc(50%-24px)] bg-[#1e3a5f]/20 sm:block" />
              <div className="absolute right-0 top-6 hidden h-0.5 w-[calc(50%-24px)] bg-[#1e3a5f]/20 sm:block" />
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
                <Sparkles className="h-7 w-7 text-[#1e3a5f]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1e3a5f]">
                L&apos;IA analyse et chiffre
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Extraction automatique des lots, chiffrage DPGF, génération du
                mémoire technique.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f] text-lg font-bold text-white">
                3
              </div>
              <div className="absolute left-0 top-6 hidden h-0.5 w-[calc(50%-24px)] bg-[#1e3a5f]/20 sm:block" />
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
                <Download className="h-7 w-7 text-[#1e3a5f]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1e3a5f]">
                Téléchargez le dossier
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Récupérez votre dossier complet au format ZIP, prêt à
                soumettre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="bg-[#1e3a5f] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-center text-3xl font-bold tracking-tight text-white lg:text-4xl">
            Ils nous font confiance
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">500+</div>
              <div className="mt-2 text-sm text-white/70">entreprises</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">2000+</div>
              <div className="mt-2 text-sm text-white/70">AO traités</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">85%</div>
              <div className="mt-2 text-sm text-white/70">taux de succès</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">10x</div>
              <div className="mt-2 text-sm text-white/70">plus rapide</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-[#e67e22] to-[#d35400] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white lg:text-4xl">
            Prêt à gagner plus d&apos;appels d&apos;offres ?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Commencez gratuitement — aucune carte de crédit requise.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-[#e67e22] shadow-lg transition-colors hover:bg-slate-50"
            >
              Démarrer maintenant
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2744] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-4">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="h-6 w-6 text-[#e67e22]" />
                <span className="text-lg font-bold text-white">AO Pilot</span>
              </div>
              <p className="mt-3 text-sm text-white/50">
                Automatisation des appels d&apos;offres BTP par l&apos;intelligence
                artificielle.
              </p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="font-semibold text-white">Produit</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    Démo
                  </a>
                </li>
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h4 className="font-semibold text-white">Entreprise</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    CGV
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white">Support</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/40">
            © 2026 AO Pilot. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
