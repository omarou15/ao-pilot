/**
 * reference-data.ts — Parse BTP pricing & labor reference tables from markdown
 * Server-side only (uses fs.readFileSync)
 */

import fs from "fs";
import path from "path";

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

// ─── Parsing helpers ─────────────────────────────────────────────────

function extractNumber(text: string): number {
  // Remove bold markers, euro signs, unit suffixes, spaces, and non-breaking spaces
  const cleaned = text
    .replace(/\*\*/g, "")
    .replace(/€/g, "")
    .replace(/\/[a-zA-Z²³]+/g, "")
    .replace(/\s/g, "")
    .trim();
  const num = parseFloat(cleaned.replace(/,/g, "."));
  return isNaN(num) ? 0 : num;
}

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePricingTable(markdown: string): PricingItem[] {
  const items: PricingItem[] = [];
  let currentCategory = "";

  const lines = markdown.split("\n");
  for (const line of lines) {
    // Detect category headers (## ...)
    const headerMatch = line.match(/^##\s+(.+)/);
    if (headerMatch) {
      currentCategory = headerMatch[1].trim();
      continue;
    }

    // Parse table rows (skip header rows and separator rows)
    if (!line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length < 4) continue;
    if (cells[0] === "Ouvrage" || cells[0].startsWith("---")) continue;

    const item = cells[0];
    const unit = cells[1];
    const lowPrice = extractNumber(cells[2]);
    const highPrice = extractNumber(cells[3]);
    const retainedPrice = cells[4] ? extractNumber(cells[4]) : highPrice;

    if (lowPrice === 0 && highPrice === 0) continue;

    items.push({
      category: currentCategory,
      item,
      unit,
      lowPrice,
      highPrice,
      retainedPrice,
    });
  }

  return items;
}

function parseLaborTable(markdown: string): LaborRate[] {
  const rates: LaborRate[] = [];

  const lines = markdown.split("\n");
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length < 3) continue;
    if (
      cells[0] === "Métier" ||
      cells[0] === "Donnée" ||
      cells[0].startsWith("---")
    )
      continue;

    const trade = cells[0];
    const lowRate = extractNumber(cells[1]);
    const highRate = extractNumber(cells[2]);
    const retainedRate = cells[3] ? extractNumber(cells[3]) : highRate;

    if (lowRate === 0 && highRate === 0) continue;

    rates.push({ trade, lowRate, highRate, retainedRate });
  }

  return rates;
}

// ─── Load and export data ────────────────────────────────────────────

function loadMarkdown(relativePath: string): string {
  const fullPath = path.join(process.cwd(), relativePath);
  return fs.readFileSync(fullPath, "utf-8");
}

const pricingMd = loadMarkdown("docs/reference/tables/ratios-prix-btp.md");
const laborMd = loadMarkdown("docs/reference/tables/taux-horaires-mo.md");

export const PRICING_TABLE: PricingItem[] = parsePricingTable(pricingMd);
export const LABOR_RATES: LaborRate[] = parseLaborTable(laborMd);

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
