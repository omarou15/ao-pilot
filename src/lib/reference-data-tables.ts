/**
 * Static BTP pricing & labor reference tables.
 * Pre-parsed from docs/reference/tables/ markdown files.
 * Update this file when reference prices change.
 */

import type { PricingItem, LaborRate } from "./reference-data";

export const PRICING_TABLE: PricingItem[] = [
  // Gros œuvre / Maçonnerie
  { category: "Gros œuvre / Maçonnerie", item: "Élévation mur parpaing", unit: "m²", lowPrice: 40, highPrice: 60, retainedPrice: 60 },
  { category: "Gros œuvre / Maçonnerie", item: "Élévation mur briques", unit: "m²", lowPrice: 50, highPrice: 80, retainedPrice: 80 },
  { category: "Gros œuvre / Maçonnerie", item: "Fondations superficielles", unit: "m²", lowPrice: 100, highPrice: 250, retainedPrice: 250 },
  { category: "Gros œuvre / Maçonnerie", item: "Dalle béton (ép. 12-15 cm)", unit: "m²", lowPrice: 50, highPrice: 90, retainedPrice: 90 },
  { category: "Gros œuvre / Maçonnerie", item: "Démolition mur non porteur", unit: "m²", lowPrice: 20, highPrice: 50, retainedPrice: 50 },
  { category: "Gros œuvre / Maçonnerie", item: "Démolition mur porteur (avec IPN)", unit: "forfait", lowPrice: 1500, highPrice: 4000, retainedPrice: 4000 },

  // Terrassement / VRD
  { category: "Terrassement / VRD", item: "Terrassement général", unit: "m³", lowPrice: 25, highPrice: 60, retainedPrice: 60 },
  { category: "Terrassement / VRD", item: "Tranchée (réseaux)", unit: "ml", lowPrice: 15, highPrice: 40, retainedPrice: 40 },
  { category: "Terrassement / VRD", item: "Enrobé / revêtement bitumeux", unit: "m²", lowPrice: 25, highPrice: 55, retainedPrice: 55 },

  // Isolation
  { category: "Isolation", item: "ITE (isolation thermique ext.)", unit: "m²", lowPrice: 100, highPrice: 200, retainedPrice: 200 },
  { category: "Isolation", item: "ITI laine de verre (ép. 120mm)", unit: "m²", lowPrice: 30, highPrice: 60, retainedPrice: 60 },
  { category: "Isolation", item: "Isolation combles perdus soufflée", unit: "m²", lowPrice: 20, highPrice: 45, retainedPrice: 45 },
  { category: "Isolation", item: "Isolation plancher bas", unit: "m²", lowPrice: 30, highPrice: 60, retainedPrice: 60 },

  // Plomberie / CVC
  { category: "Plomberie / CVC", item: "Point d'eau complet", unit: "u", lowPrice: 400, highPrice: 800, retainedPrice: 800 },
  { category: "Plomberie / CVC", item: "Remplacement chauffe-eau 200L", unit: "u", lowPrice: 800, highPrice: 1500, retainedPrice: 1500 },
  { category: "Plomberie / CVC", item: "Installation PAC air-eau", unit: "u", lowPrice: 8000, highPrice: 15000, retainedPrice: 15000 },
  { category: "Plomberie / CVC", item: "Radiateur (fourni posé)", unit: "u", lowPrice: 300, highPrice: 700, retainedPrice: 700 },
  { category: "Plomberie / CVC", item: "VMC simple flux", unit: "u", lowPrice: 400, highPrice: 900, retainedPrice: 900 },
  { category: "Plomberie / CVC", item: "VMC double flux", unit: "u", lowPrice: 2000, highPrice: 5000, retainedPrice: 5000 },

  // Électricité
  { category: "Électricité", item: "Point lumineux (fourni posé)", unit: "u", lowPrice: 80, highPrice: 200, retainedPrice: 200 },
  { category: "Électricité", item: "Prise de courant (fourni posé)", unit: "u", lowPrice: 60, highPrice: 150, retainedPrice: 150 },
  { category: "Électricité", item: "Tableau électrique complet", unit: "u", lowPrice: 800, highPrice: 2000, retainedPrice: 2000 },
  { category: "Électricité", item: "Mise aux normes NFC 15-100", unit: "forfait", lowPrice: 3000, highPrice: 8000, retainedPrice: 8000 },

  // Menuiserie extérieure
  { category: "Menuiserie extérieure", item: "Fenêtre PVC double vitrage (std)", unit: "u", lowPrice: 300, highPrice: 700, retainedPrice: 700 },
  { category: "Menuiserie extérieure", item: "Fenêtre ALU double vitrage", unit: "u", lowPrice: 500, highPrice: 1200, retainedPrice: 1200 },
  { category: "Menuiserie extérieure", item: "Porte d'entrée (fourni posé)", unit: "u", lowPrice: 1000, highPrice: 3000, retainedPrice: 3000 },
  { category: "Menuiserie extérieure", item: "Volet roulant électrique", unit: "u", lowPrice: 400, highPrice: 900, retainedPrice: 900 },

  // Peinture / Revêtements
  { category: "Peinture / Revêtements", item: "Peinture murs (2 couches)", unit: "m²", lowPrice: 20, highPrice: 40, retainedPrice: 40 },
  { category: "Peinture / Revêtements", item: "Peinture plafond", unit: "m²", lowPrice: 25, highPrice: 50, retainedPrice: 50 },
  { category: "Peinture / Revêtements", item: "Carrelage sol (fourni posé)", unit: "m²", lowPrice: 40, highPrice: 100, retainedPrice: 100 },
  { category: "Peinture / Revêtements", item: "Parquet flottant (fourni posé)", unit: "m²", lowPrice: 30, highPrice: 70, retainedPrice: 70 },
  { category: "Peinture / Revêtements", item: "Faïence murale (fourni posé)", unit: "m²", lowPrice: 50, highPrice: 120, retainedPrice: 120 },

  // Plâtrerie / Cloisons
  { category: "Plâtrerie / Cloisons", item: "Cloison placo BA13 simple", unit: "m²", lowPrice: 25, highPrice: 50, retainedPrice: 50 },
  { category: "Plâtrerie / Cloisons", item: "Cloison placo double (acoustique)", unit: "m²", lowPrice: 40, highPrice: 75, retainedPrice: 75 },
  { category: "Plâtrerie / Cloisons", item: "Faux plafond suspendu", unit: "m²", lowPrice: 30, highPrice: 70, retainedPrice: 70 },
  { category: "Plâtrerie / Cloisons", item: "Enduit plâtre (traditionnel)", unit: "m²", lowPrice: 20, highPrice: 45, retainedPrice: 45 },

  // Couverture / Charpente
  { category: "Couverture / Charpente", item: "Couverture tuiles (fourni posé)", unit: "m²", lowPrice: 50, highPrice: 120, retainedPrice: 120 },
  { category: "Couverture / Charpente", item: "Couverture ardoises", unit: "m²", lowPrice: 80, highPrice: 180, retainedPrice: 180 },
  { category: "Couverture / Charpente", item: "Charpente traditionnelle", unit: "m²", lowPrice: 60, highPrice: 120, retainedPrice: 120 },
  { category: "Couverture / Charpente", item: "Charpente fermette industrielle", unit: "m²", lowPrice: 45, highPrice: 80, retainedPrice: 80 },
  { category: "Couverture / Charpente", item: "Zinguerie (gouttières, descentes)", unit: "ml", lowPrice: 30, highPrice: 70, retainedPrice: 70 },
];

export const LABOR_RATES: LaborRate[] = [
  { trade: "Maçon", lowRate: 35, highRate: 70, retainedRate: 70 },
  { trade: "Terrassier", lowRate: 60, highRate: 80, retainedRate: 80 },
  { trade: "Plombier / Chauffagiste", lowRate: 40, highRate: 70, retainedRate: 70 },
  { trade: "Électricien", lowRate: 35, highRate: 65, retainedRate: 65 },
  { trade: "Menuisier", lowRate: 35, highRate: 60, retainedRate: 60 },
  { trade: "Charpentier", lowRate: 40, highRate: 60, retainedRate: 60 },
  { trade: "Couvreur", lowRate: 40, highRate: 65, retainedRate: 65 },
  { trade: "Plâtrier-plaquiste", lowRate: 25, highRate: 45, retainedRate: 45 },
  { trade: "Peintre", lowRate: 25, highRate: 50, retainedRate: 50 },
  { trade: "Carreleur", lowRate: 35, highRate: 60, retainedRate: 60 },
  { trade: "Serrurier / Métallier", lowRate: 40, highRate: 70, retainedRate: 70 },
  { trade: "Façadier (ravalement)", lowRate: 35, highRate: 60, retainedRate: 60 },
  { trade: "Étancheur", lowRate: 40, highRate: 65, retainedRate: 65 },
  { trade: "Climaticien (CVC)", lowRate: 45, highRate: 75, retainedRate: 75 },
  { trade: "Manœuvre / aide", lowRate: 25, highRate: 40, retainedRate: 40 },
];
