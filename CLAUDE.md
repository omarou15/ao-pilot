@AGENTS.md

# AO Pilot — Application SaaS de Réponse aux Appels d'Offres BTP

## Description
Application web qui automatise intégralement la réponse aux appels d'offres BTP : upload du DCE → DPGF chiffré + mémoire technique + documents administratifs, prêts à déposer.

## Stack
- Frontend : Next.js 15+ (App Router) + React + Tailwind CSS + shadcn/ui
- Backend : Next.js API Routes (monorepo)
- BDD : Supabase (PostgreSQL + pgvector + Storage)
- Auth : Clerk (email + password + MFA)
- IA : Mistral API (mistral-large pour analyse/chiffrage, mistral-medium pour rédaction)
- File parsing : pdf-parse, xlsx (SheetJS), mammoth (docx)
- Hébergement : Vercel (frontend + API) + Supabase Cloud
- Paiement : Stripe (à intégrer)

## Règles métier CRITIQUES

### Chiffrage
1. Toujours chiffrer en **fourchette HAUTE** — prix marché SANS négociation fournisseur
2. Marge bénéfice = **exactement 30%** sur le coût réel (configurable par company dans settings)
3. Formule par ligne DPGF : `prix_vente = coût_réel × 1.30`
4. `coût_réel = (prix_matériau_unitaire × quantité) + (coût_MO_horaire × temps_estimé)`
5. Ne JAMAIS proposer un prix sans afficher le détail du calcul (transparence totale)
6. Ne JAMAIS inventer un prix — utiliser les ratios de docs/reference/tables/ ou rechercher

### Méthode de calcul (méthode Batiprix / déboursé sec)
- **Déboursé sec** = coût matériaux + coût main d'œuvre directe
- **Prix de revient** = déboursé sec + frais généraux
- **Prix de vente HT** = prix de revient × (1 + taux bénéfice)
- Pour AO Pilot v1 : on simplifie en `coût réel + 30%`

### Documents
- Le DPGF doit respecter EXACTEMENT la structure du DPGF vierge fourni dans le DCE
- Le mémoire technique doit être structuré selon les critères de jugement du RC
- Les documents administratifs requis sont listés dans le RC — ne JAMAIS en oublier un

### Dates
- La date limite de réponse est TOUJOURS extraite du RC ou de l'AAPC
- Rappels automatiques : J-7, J-3, J-1 avant la date limite

## Conventions de code
- TypeScript strict (no `any`)
- Nommage : camelCase (variables/fonctions), PascalCase (composants/types), snake_case (BDD)
- API : REST, réponses JSON avec `{ data, error }` systématique
- Composants : fichier unique par composant, dans `/src/components/`
- Pages : App Router Next.js, dans `/src/app/`
- Server Actions pour les mutations quand possible
- Zod pour la validation des inputs

## Structure du projet
```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Pages login/signup (Clerk)
│   ├── (dashboard)/       # Pages protégées
│   └── api/               # API Routes
├── components/            # Composants React
│   ├── ui/               # shadcn/ui
│   ├── layout/           # Header, Sidebar
│   ├── dpgf/             # Éditeur DPGF
│   └── memoire/          # Mémoire technique
├── lib/                   # Utilitaires (supabase, mistral, etc.)
└── services/             # Logique métier
    ├── parsing/          # Parsers PDF/Excel/Word
    └── ai/               # Pipeline IA
        ├── analyze/      # Analyse DCE
        ├── pricing/      # Chiffrage DPGF
        └── documents/    # Mémoire + docs admin
docs/reference/            # Base de connaissances métier
supabase/migrations/       # Migrations SQL
```

## Pièges connus
- DPGF Excel = structures très variables → parser flexible
- CCTP PDF scannés → prévoir OCR fallback
- Quantités parfois absentes du DPGF → déduire du CCTP
- JAMAIS de prix en fourchette basse
- AO privés sans RC formel → extraire du mail/doc accompagnement
