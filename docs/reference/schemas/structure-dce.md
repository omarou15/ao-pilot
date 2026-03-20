# Structure type d'un DCE (Dossier de Consultation des Entreprises)

## Contenu standard d'un DCE

Un DCE contient généralement les documents suivants. Tous ne sont pas toujours présents, mais l'IA doit savoir les identifier quand ils le sont.

### 1. Pièces administratives
- **AAPC** (Avis d'Appel Public à la Concurrence) — parfois uniquement en ligne
- **RC** (Règlement de Consultation) — **CRITIQUE : contient les critères de jugement, la date limite, les pièces requises**
- **AE** (Acte d'Engagement) — formulaire à compléter et signer
- **DC1** / **DC2** — formulaires CERFA de candidature (parfois remplacés par le DUME)
- **CCAP** (Cahier des Clauses Administratives Particulières)

### 2. Pièces techniques
- **CCTP** (Cahier des Clauses Techniques Particulières) — **CRITIQUE : décrit tous les travaux à réaliser**
- **Plans** (architecturaux, techniques, coupes, détails) — PDF ou DWG
- **Rapport de sol** / études géotechniques (si applicable)
- **Diagnostic amiante / plomb** (si rénovation)
- **Audit énergétique / DPE** (si rénovation énergétique)

### 3. Pièces de prix
- **DPGF** (Décomposition du Prix Global et Forfaitaire) — **CRITIQUE : le document à chiffrer**
  - Format : Excel (.xlsx) le plus souvent, parfois PDF
  - Structure : lots > sous-lots > lignes d'ouvrages > quantité > prix unitaire > total
- **BPU** (Bordereau de Prix Unitaires) — alternative au DPGF pour les marchés à prix unitaires
- **DQE** (Détail Quantitatif Estimatif) — souvent accompagne le BPU
- **Cadre de devis** — parfois un format simplifié du DPGF

## Extraction prioritaire par l'IA

Quand un DCE est uploadé, l'IA doit extraire dans cet ordre :

1. **Date limite de réponse** (RC ou AAPC)
2. **Critères de jugement et pondération** (RC) — ex : Prix 40%, Valeur technique 50%, Délai 10%
3. **Structure des lots** (DPGF + CCTP)
4. **Lignes d'ouvrages à chiffrer** (DPGF)
5. **Spécifications techniques par ouvrage** (CCTP)
6. **Documents administratifs requis** (RC)
7. **Conditions particulières** (CCAP) — délais d'exécution, pénalités, conditions de paiement

## Formats de fichiers courants

| Type de document | Format habituel |
|---|---|
| RC, CCTP, CCAP | PDF (texte ou scanné) |
| DPGF, BPU, DQE | Excel (.xlsx) ou PDF |
| Plans | PDF, DWG |
| DC1, DC2, AE | PDF ou Word (.docx) |
| AAPC | PDF ou en ligne (BOAMP, JOUE) |

## Cas particuliers

### AO privés
- Pas toujours de RC formel → les infos sont dans le mail d'invitation ou un document libre
- Pas toujours de DPGF → parfois juste un descriptif + demande de devis libre
- Pas de DC1/DC2 → demande plus simple (Kbis, attestation assurance, références)

### AO avec visite obligatoire
- Le RC mentionne une visite de chantier obligatoire
- L'attestation de visite est un document requis dans la réponse
- La visite permet de recueillir des infos terrain (photos, état des lieux)
