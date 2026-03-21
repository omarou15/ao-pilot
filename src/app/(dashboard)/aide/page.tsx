"use client"

import { useState } from "react"
import {
  BookOpen,
  FolderPlus,
  Upload,
  Sparkles,
  Calculator,
  Download,
  ChevronRight,
  ChevronDown,
  FileUp,
  FileText,
  ClipboardList,
  Package,
  Settings,
  Shield,
  Lightbulb,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PipelineStep {
  number: number
  icon: React.ElementType
  title: string
  description: string
}

interface GuideSection {
  id: string
  icon: React.ElementType
  iconColor: string
  title: string
  content: React.ReactNode
}

interface FaqItem {
  question: string
  answer: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const pipelineSteps: PipelineStep[] = [
  {
    number: 1,
    icon: FolderPlus,
    title: "Créer un projet",
    description: "Initiez un nouveau dossier d'appel d'offres",
  },
  {
    number: 2,
    icon: Upload,
    title: "Uploader le DCE",
    description: "Importez les documents de consultation",
  },
  {
    number: 3,
    icon: Sparkles,
    title: "Analyser avec l'IA",
    description: "Extraction automatique des informations clés",
  },
  {
    number: 4,
    icon: Calculator,
    title: "Chiffrer le DPGF",
    description: "Calcul des prix avec tables de référence BTP",
  },
  {
    number: 5,
    icon: Download,
    title: "Exporter le dossier",
    description: "Téléchargez le dossier complet en ZIP",
  },
]

const guideSections: GuideSection[] = [
  {
    id: "create-project",
    icon: FolderPlus,
    iconColor: "text-[#1e3a5f]",
    title: "Créer un projet",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Cliquez sur <strong className="text-foreground">&quot;+ Nouveau projet&quot;</strong> depuis
          le tableau de bord pour démarrer un nouveau dossier d&apos;appel d&apos;offres.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Remplissez le <strong className="text-foreground">nom du projet</strong> (obligatoire),
            la <strong className="text-foreground">référence</strong> (optionnel), et le{" "}
            <strong className="text-foreground">type</strong> (public / privé).
          </li>
          <li>
            Le type aide l&apos;IA à adapter son analyse selon la source de l&apos;appel
            d&apos;offres (réglementation marchés publics vs. privés).
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "upload-dce",
    icon: FileUp,
    iconColor: "text-blue-600",
    title: "Uploader les fichiers du DCE",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Glissez-déposez ou sélectionnez vos fichiers DCE dans la zone
          d&apos;upload de la vue projet.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Formats acceptés</strong> : PDF, Excel (.xlsx,
            .xls), Word (.docx, .doc)
          </li>
          <li>
            <strong className="text-foreground">Taille maximale</strong> : 50 Mo par fichier
          </li>
          <li>
            <strong className="text-foreground">Fichiers typiques d&apos;un DCE</strong> :
            Règlement de Consultation (RC), CCTP, DPGF, Plans, Acte d&apos;Engagement
          </li>
          <li>
            L&apos;IA détecte automatiquement le type de chaque document (RC, CCTP, DPGF, plan,
            autre).
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "analyze-dce",
    icon: Sparkles,
    iconColor: "text-purple-600",
    title: "Analyser le DCE avec l'IA",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Cliquez sur <strong className="text-foreground">&quot;Analyser le DCE&quot;</strong> dans
          la vue projet. L&apos;IA Mistral analyse l&apos;ensemble des documents et extrait :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Les métadonnées du projet (nom, référence, date limite)</li>
          <li>Les lots et sous-lots identifiés</li>
          <li>Les critères de jugement du RC</li>
          <li>Les documents administratifs requis</li>
          <li>Les lignes du DPGF avec désignations, unités et quantités</li>
        </ul>
        <p>
          Des <strong className="text-foreground">rappels automatiques</strong> sont créés à J-7,
          J-3 et J-1 avant la date limite de soumission.
        </p>
      </div>
    ),
  },
  {
    id: "chiffrage",
    icon: Calculator,
    iconColor: "text-[#e67e22]",
    title: "Chiffrer le DPGF",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          Cliquez sur <strong className="text-foreground">&quot;Chiffrer le DPGF&quot;</strong>. Le
          moteur de chiffrage fonctionne en 2 étapes :
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Recherche dans les tables de référence</strong> :
            prix matériaux et taux horaires MO du BTP français (fourchette haute pour protéger votre
            marge)
          </li>
          <li>
            <strong className="text-foreground">Fallback IA</strong> : si aucune correspondance dans
            les tables, l&apos;IA Mistral estime le prix — ces lignes sont marquées
            &quot;À vérifier&quot;
          </li>
        </ol>

        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <p className="font-medium text-foreground">Niveaux de confiance :</p>
          <ul className="space-y-2">
            <li>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                <strong className="text-foreground">Référencé</strong>
              </span>{" "}
              — prix issu des tables de référence BTP, fiable
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                <strong className="text-foreground">Estimé</strong>
              </span>{" "}
              — prix IA cohérent avec les ratios connus, à surveiller
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                <strong className="text-foreground">À vérifier</strong>
              </span>{" "}
              — prix IA sans référence directe, vérification manuelle recommandée
            </li>
          </ul>
        </div>

        <div className="rounded-lg border p-4 bg-muted/30">
          <p className="font-medium text-foreground mb-1">Formule de calcul :</p>
          <code className="text-xs bg-muted px-2 py-1 rounded">
            Prix de vente = ⌈Coût réel x (1 + Marge%)⌉ (arrondi au supérieur)
          </code>
        </div>

        <ul className="list-disc pl-5 space-y-2">
          <li>La marge par défaut est de 30 % (configurable dans Paramètres).</li>
          <li>
            Chaque ligne est éditable : modifiez quantités, prix unitaires, marge directement dans
            le tableau.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "memoire",
    icon: FileText,
    iconColor: "text-teal-600",
    title: "Mémoire technique",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Dans l&apos;onglet <strong className="text-foreground">&quot;Mémoire technique&quot;</strong>{" "}
          de la vue projet, cliquez sur{" "}
          <strong className="text-foreground">&quot;Générer le mémoire technique&quot;</strong>.
        </p>
        <p>L&apos;IA génère des sections structurées adaptées aux critères du RC :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Présentation de l&apos;entreprise</li>
          <li>Moyens humains et matériels</li>
          <li>Méthodologie d&apos;intervention</li>
          <li>Planning prévisionnel</li>
          <li>Gestion de la qualité et sécurité</li>
          <li>Références et expériences similaires</li>
        </ul>
        <p>
          Chaque section est <strong className="text-foreground">éditable et validable</strong>{" "}
          individuellement. Le mémoire est exporté en format .docx dans le dossier final.
        </p>
      </div>
    ),
  },
  {
    id: "admin-docs",
    icon: ClipboardList,
    iconColor: "text-slate-600",
    title: "Documents administratifs",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Dans l&apos;onglet <strong className="text-foreground">&quot;Documents admin&quot;</strong>,
          l&apos;IA identifie les documents requis dans le RC et génère des templates :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>DC1 (Lettre de candidature)</li>
          <li>DC2 (Déclaration du candidat)</li>
          <li>Attestation sur l&apos;honneur</li>
        </ul>
        <p>
          Les documents non-générables (Kbis, attestation URSSAF, assurances) sont listés comme{" "}
          <strong className="text-foreground">&quot;À fournir&quot;</strong>.
        </p>
        <p>Cochez chaque document comme validé pour suivre votre progression.</p>
      </div>
    ),
  },
  {
    id: "export",
    icon: Package,
    iconColor: "text-[#27ae60]",
    title: "Exporter le dossier complet",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Dans l&apos;onglet <strong className="text-foreground">&quot;Export&quot;</strong>, le
          panneau d&apos;export affiche la checklist de complétude :
        </p>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-center gap-2">
            <span className="text-green-600">&#10003;</span> DPGF chiffré
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">&#10003;</span> Mémoire technique généré
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">&#10003;</span> Documents administratifs validés
          </li>
        </ul>
        <p>
          Quand tout est prêt (100 %), cliquez sur{" "}
          <strong className="text-foreground">&quot;Télécharger le dossier&quot;</strong>. Le ZIP
          contient :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">DPGF_chiffré.xlsx</code> — le
            bordereau complet avec détail des calculs
          </li>
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Mémoire_technique.docx</code>{" "}
            — le mémoire technique formaté
          </li>
          <li>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              Documents_administratifs/
            </code>{" "}
            — tous les documents admin générés
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "settings",
    icon: Settings,
    iconColor: "text-slate-600",
    title: "Paramètres",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Informations de l&apos;entreprise</strong> (nom,
            SIRET, adresse) — utilisées dans les documents générés
          </li>
          <li>
            <strong className="text-foreground">Marge bénéficiaire par défaut</strong> : 30 % par
            défaut, configurable de 0 à 100 %
          </li>
        </ul>
        <div className="rounded-lg border p-3 bg-muted/30 mt-2">
          <p className="text-xs text-foreground">
            Formule : <code className="bg-muted px-1.5 py-0.5 rounded">Coût réel x 1.30 = Prix de vente HT</code>
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "audit",
    icon: Shield,
    iconColor: "text-slate-600",
    title: "Journal d'audit",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">Réservé aux administrateurs.</strong>
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Trace toutes les actions : création de projet, upload, analyse, chiffrage, export
          </li>
          <li>Filtrable par projet</li>
          <li>Assure la traçabilité pour les contrôles internes</li>
        </ul>
      </div>
    ),
  },
]

const faqItems: FaqItem[] = [
  {
    question: "Quels formats de fichiers sont acceptés ?",
    answer:
      "PDF, Excel (.xlsx, .xls), Word (.docx, .doc). Taille maximale : 50 Mo par fichier.",
  },
  {
    question: "Comment l'IA calcule-t-elle les prix ?",
    answer:
      "D'abord recherche dans les tables de référence BTP (fourchette haute), puis fallback IA Mistral si aucune correspondance. Les prix sont toujours arrondis au supérieur.",
  },
  {
    question: "Puis-je modifier les prix après le chiffrage ?",
    answer:
      "Oui, chaque ligne du DPGF est éditable. Modifiez quantités, prix unitaires matériaux/MO, et marge directement dans le tableau.",
  },
  {
    question: "Que signifient les badges de confiance ?",
    answer:
      "Référencé (vert) = table BTP fiable. Estimé (bleu) = IA cohérente, à surveiller. À vérifier (orange) = estimation IA sans référence directe.",
  },
  {
    question: "Comment changer la marge par défaut ?",
    answer:
      "Paramètres → Marge bénéficiaire par défaut. Vous pouvez aussi modifier la marge ligne par ligne dans le DPGF.",
  },
  {
    question: "Le dossier exporté est-il prêt à soumettre ?",
    answer:
      "Le ZIP contient tous les documents nécessaires. Vérifiez les documents marqués « À fournir » (Kbis, attestations) que vous devez ajouter manuellement.",
  },
]

const tips = [
  "Glissez-déposez plusieurs fichiers à la fois pour gagner du temps",
  "Les échéances proches apparaissent en rouge dans le tableau de bord",
  "Cliquez sur une ligne DPGF pour voir le détail du calcul",
  "Exportez régulièrement pour sauvegarder votre progression",
]

/* ------------------------------------------------------------------ */
/*  Collapsible Section                                                */
/* ------------------------------------------------------------------ */

function CollapsibleCard({
  icon: Icon,
  iconColor,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors rounded-xl"
      >
        <div className={`shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex-1 font-medium text-sm text-foreground">{title}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <CardContent className="pt-0 pb-4">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

function CollapsibleFaq({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors rounded-xl"
      >
        <HelpCircle className="h-4 w-4 shrink-0 text-[#1e3a5f]" />
        <span className="flex-1 font-medium text-sm text-foreground">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <CardContent className="pt-0 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </CardContent>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AidePage() {
  return (
    <div className="space-y-12 pb-12">
      {/* ---- Header ---- */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-7 w-7 text-[#1e3a5f]" />
          <h1 className="text-2xl font-bold tracking-tight text-[#1e3a5f] font-[family-name:var(--font-space-grotesk)]">
            Guide d&apos;utilisation
          </h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Découvrez comment utiliser AO Pilot pour répondre aux appels d&apos;offres BTP en quelques
          minutes.
        </p>
      </div>

      {/* ---- Section 1 : Pipeline visuel ---- */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-6 font-[family-name:var(--font-space-grotesk)]">
          Vue d&apos;ensemble du flow
        </h2>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="flex items-center gap-2 md:gap-2 flex-1">
                {/* Step card */}
                <div className="flex flex-row md:flex-col items-center md:items-center gap-3 md:gap-2 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white text-sm font-bold">
                    {step.number}
                  </div>
                  <div className="flex flex-col md:items-center min-w-0">
                    <Icon className="hidden md:block h-5 w-5 text-[#1e3a5f] mb-1" />
                    <span className="text-sm font-medium text-foreground md:text-center">
                      {step.title}
                    </span>
                    <span className="text-xs text-muted-foreground md:text-center">
                      {step.description}
                    </span>
                  </div>
                </div>

                {/* Arrow (hidden on mobile, hidden after last) */}
                {idx < pipelineSteps.length - 1 && (
                  <ChevronRight className="hidden md:block h-5 w-5 shrink-0 text-muted-foreground/50" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ---- Section 2 : Guide détaillé ---- */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
          Guide détaillé
        </h2>
        <div className="space-y-3">
          {guideSections.map((s) => (
            <CollapsibleCard
              key={s.id}
              icon={s.icon}
              iconColor={s.iconColor}
              title={s.title}
            >
              {s.content}
            </CollapsibleCard>
          ))}
        </div>
      </section>

      {/* ---- Section 3 : FAQ ---- */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
          Foire aux questions
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <CollapsibleFaq key={item.question} {...item} />
          ))}
        </div>
      </section>

      {/* ---- Section 4 : Raccourcis et astuces ---- */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
          Raccourcis et astuces
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tips.map((tip) => (
            <Card key={tip}>
              <CardContent className="flex items-start gap-3 py-4">
                <Lightbulb className="h-5 w-5 shrink-0 text-[#e67e22] mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
