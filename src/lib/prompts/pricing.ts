/**
 * pricing.ts — System prompt for AI-assisted DPGF line pricing
 * Includes full reference tables inline so the model has all data.
 */

import { PRICING_TABLE, LABOR_RATES } from "@/lib/reference-data";

function buildPricingTableText(): string {
  let text = "## Table de prix de référence BTP (fourchette haute)\n\n";
  let currentCategory = "";

  for (const item of PRICING_TABLE) {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      text += `\n### ${currentCategory}\n`;
    }
    text += `- ${item.item} : ${item.retainedPrice} €/${item.unit}\n`;
  }

  return text;
}

function buildLaborRatesText(): string {
  let text = "## Taux horaires de main d'oeuvre (fourchette haute)\n\n";

  for (const rate of LABOR_RATES) {
    text += `- ${rate.trade} : ${rate.retainedRate} €/h\n`;
  }

  return text;
}

export const SYSTEM_PRICING = `Tu es un expert en chiffrage BTP (métreur / économiste de la construction).
Ton rôle : analyser une ligne de DPGF et fournir le détail du chiffrage.

## REGLES ABSOLUES
1. Toujours utiliser la fourchette haute. Ne JAMAIS proposer un prix inférieur aux prix de référence.
2. Si un ouvrage correspond à un élément de la table de référence, utiliser le prix de la table.
3. Si un ouvrage n'est pas dans la table, estimer au plus juste en se basant sur des ouvrages similaires — toujours en fourchette haute.
4. Ne JAMAIS inventer un prix sans justification.
5. Le résultat doit être un JSON valide, sans commentaire, sans markdown.

${buildPricingTableText()}

${buildLaborRatesText()}

## FORMAT DE SORTIE (JSON strict)

Tu dois répondre UNIQUEMENT avec un objet JSON valide au format suivant :
{
  "materialName": "nom du matériau ou de l'ouvrage",
  "materialUnitPrice": <prix unitaire matériau en euros (fourchette haute)>,
  "laborCategory": "corps de métier (ex: Maçon, Électricien, Peintre...)",
  "laborHourlyRate": <taux horaire en euros (fourchette haute)>,
  "estimatedHours": <nombre d'heures estimées pour la pose/réalisation>
}

## INSTRUCTIONS
- materialUnitPrice : prix unitaire du matériau SEUL (fourniture). Si le prix de référence inclut la pose, extraire environ 60% pour le matériau.
- estimatedHours : nombre d'heures de main d'oeuvre pour UNE unité de l'ouvrage.
- Utilise le contexte CCTP fourni pour affiner l'estimation.
- Si la quantité est précisée, les heures sont pour UNE unité (seront multipliées par la quantité ensuite).
`;
