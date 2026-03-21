/**
 * reference-data.ts — BTP pricing & labor reference tables with fuzzy matching.
 * Data is imported from static tables (no runtime fs access).
 */

// ─── Interfaces ──────────────────────────────────────────────────────

export interface PricingItem {
  category: string;
  item: string;
  unit: string;
  lowPrice: number;
  highPrice: number;
  retainedPrice: number; // Always fourchette haute
}

export interface LaborRate {
  trade: string;
  lowRate: number;
  highRate: number;
  retainedRate: number;
}

// ─── Static data (pre-parsed from docs/reference/tables/) ────────────

export {
  PRICING_TABLE,
  LABOR_RATES,
} from "./reference-data-tables";

import {
  PRICING_TABLE,
  LABOR_RATES,
} from "./reference-data-tables";

// ─── Helpers ─────────────────────────────────────────────────────────

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Fuzzy matching ──────────────────────────────────────────────────

export function findBestPriceMatch(designation: string): PricingItem | null {
  const normalized = normalizeStr(designation);
  const tokens = normalized.split(" ").filter((t) => t.length > 2);

  let bestMatch: PricingItem | null = null;
  let bestScore = 0;

  for (const item of PRICING_TABLE) {
    const itemNorm = normalizeStr(item.item);
    const categoryNorm = normalizeStr(item.category);

    // Direct containment check
    if (normalized.includes(itemNorm) || itemNorm.includes(normalized)) {
      return item;
    }

    // Token-based scoring
    let score = 0;
    const itemTokens = (itemNorm + " " + categoryNorm)
      .split(" ")
      .filter((t) => t.length > 2);

    for (const token of tokens) {
      for (const itemToken of itemTokens) {
        if (itemToken.includes(token) || token.includes(itemToken)) {
          score += 1;
        }
      }
    }

    // Normalize by total tokens to favor more specific matches
    const normalizedScore =
      tokens.length > 0 ? score / Math.max(tokens.length, 1) : 0;

    if (normalizedScore > bestScore && score >= 2) {
      bestScore = normalizedScore;
      bestMatch = item;
    }
  }

  return bestMatch;
}

export function findLaborRate(trade: string): LaborRate | null {
  const normalized = normalizeStr(trade);
  const tokens = normalized.split(" ").filter((t) => t.length > 2);

  // Keywords mapping to trades
  const tradeKeywords: Record<string, string[]> = {
    macon: ["macon", "maconnerie", "gros oeuvre", "parpaing", "brique", "beton", "fondation", "dalle", "demolition"],
    terrassier: ["terrassement", "terrassier", "tranchee", "vrd", "enrobe"],
    "plombier / chauffagiste": ["plomberie", "plombier", "chauffage", "chauffagiste", "chauffe-eau", "pac", "radiateur", "vmc", "eau"],
    electricien: ["electricite", "electricien", "electrique", "prise", "lumineux", "tableau", "nfc"],
    menuisier: ["menuiserie", "menuisier", "fenetre", "porte", "volet"],
    charpentier: ["charpente", "charpentier"],
    couvreur: ["couverture", "couvreur", "tuile", "ardoise", "zinguerie", "gouttiere"],
    "platrier-plaquiste": ["platrerie", "platrier", "plaquiste", "placo", "cloison", "faux plafond", "enduit platre"],
    peintre: ["peinture", "peintre"],
    carreleur: ["carrelage", "carreleur", "faience"],
    "serrurier / metallier": ["serrurerie", "serrurier", "metallier", "metallerie"],
    "facadier (ravalement)": ["facade", "facadier", "ravalement"],
    etancheur: ["etancheite", "etancheur"],
    "climaticien (cvc)": ["climatisation", "climaticien", "cvc"],
    "manoeuvre / aide": ["manoeuvre", "aide"],
  };

  // Try keyword matching first
  for (const [rateTrade, keywords] of Object.entries(tradeKeywords)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword) || tokens.some((t) => keyword.includes(t) || t.includes(keyword))) {
        const rate = LABOR_RATES.find(
          (r) => normalizeStr(r.trade) === rateTrade
        );
        if (rate) return rate;
      }
    }
  }

  // Direct fuzzy match against trade names
  for (const rate of LABOR_RATES) {
    const rateNorm = normalizeStr(rate.trade);
    if (normalized.includes(rateNorm) || rateNorm.includes(normalized)) {
      return rate;
    }
  }

  return null;
}
