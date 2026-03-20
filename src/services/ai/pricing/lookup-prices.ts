/**
 * lookup-prices.ts — Price lookup with reference table + AI fallback
 */

import {
  findBestPriceMatch,
  findLaborRate,
  PRICING_TABLE,
} from "@/lib/reference-data";
import { SYSTEM_PRICING } from "@/lib/prompts/pricing";
import { chatCompletion } from "@/lib/mistral";

export interface PricingBreakdown {
  materialName: string;
  materialUnitPrice: number;
  laborCategory: string;
  laborHourlyRate: number;
  estimatedHours: number;
  confidence: "high" | "medium" | "low";
  source: "reference_table" | "ai_estimate";
}

/**
 * Look up pricing for a DPGF line. Uses reference tables first, falls back to AI.
 * NEVER returns a price of 0.
 */
export async function lookupPrices(
  line: { designation: string; unit: string; quantity: number | null },
  cctpContext: string
): Promise<PricingBreakdown> {
  const priceMatch = findBestPriceMatch(line.designation);
  const laborMatch = findLaborRate(line.designation);

  // ─── Case 1: Reference table match found ────────────────────────
  if (priceMatch) {
    // The reference prices include fourniture + pose.
    // Split ~60% material / ~40% labor as per industry convention.
    const materialUnitPrice = Math.ceil(priceMatch.retainedPrice * 0.6);
    const laborRate = laborMatch?.retainedRate ?? 50; // fallback labor rate
    const laborCost = priceMatch.retainedPrice * 0.4;
    const estimatedHours = Math.max(
      0.5,
      Math.round((laborCost / laborRate) * 10) / 10
    );

    return {
      materialName: priceMatch.item,
      materialUnitPrice,
      laborCategory: laborMatch?.trade ?? "Manoeuvre / aide",
      laborHourlyRate: laborRate,
      estimatedHours,
      confidence: "high",
      source: "reference_table",
    };
  }

  // ─── Case 2: No reference match — call Mistral AI ───────────────
  const userMessage = `Ligne DPGF à chiffrer :
- Désignation : ${line.designation}
- Unité : ${line.unit}
- Quantité : ${line.quantity ?? "non précisée"}

Contexte CCTP :
${cctpContext.slice(0, 3000)}

Réponds UNIQUEMENT en JSON valide.`;

  let aiResult: PricingBreakdown | null = null;

  try {
    const response = await chatCompletion(
      [
        { role: "system", content: SYSTEM_PRICING },
        { role: "user", content: userMessage },
      ],
      "mistral-large-latest"
    );

    const responseText =
      typeof response === "string" ? response : String(response);

    // Extract JSON from response (handle possible markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        materialName?: string;
        materialUnitPrice?: number;
        laborCategory?: string;
        laborHourlyRate?: number;
        estimatedHours?: number;
      };

      if (
        parsed.materialUnitPrice !== undefined &&
        parsed.materialUnitPrice > 0
      ) {
        aiResult = {
          materialName: parsed.materialName ?? line.designation,
          materialUnitPrice: parsed.materialUnitPrice,
          laborCategory: parsed.laborCategory ?? "Manoeuvre / aide",
          laborHourlyRate: parsed.laborHourlyRate ?? 40,
          estimatedHours: parsed.estimatedHours ?? 1,
          confidence: "low",
          source: "ai_estimate",
        };
      }
    }
  } catch (err) {
    console.error("[lookup-prices] Mistral AI call failed:", err);
  }

  // ─── Guard rails on AI result ───────────────────────────────────
  if (aiResult) {
    // Check if AI price is lower than any partial match in the table
    const partialMatches = findPartialMatches(line.designation);
    if (partialMatches.length > 0) {
      const minTablePrice = Math.min(
        ...partialMatches.map((m) => m.retainedPrice)
      );
      // If AI material price is suspiciously low compared to table
      if (
        aiResult.materialUnitPrice + aiResult.laborHourlyRate * aiResult.estimatedHours <
        minTablePrice * 0.5
      ) {
        // Use the table price as the floor
        const bestPartial = partialMatches[0];
        aiResult.materialUnitPrice = Math.max(
          aiResult.materialUnitPrice,
          Math.ceil(bestPartial.retainedPrice * 0.6)
        );
        aiResult.confidence = "medium";
      } else {
        // AI price is coherent with known ratios
        aiResult.confidence = "medium";
      }
    }
    // else confidence stays 'low' — no table comparison possible

    // Ensure labor rate is not below reference if we have a match
    if (laborMatch) {
      aiResult.laborHourlyRate = Math.max(
        aiResult.laborHourlyRate,
        laborMatch.retainedRate
      );
      aiResult.laborCategory = laborMatch.trade;
    }

    return aiResult;
  }

  // ─── Case 3: Total failure — throw ─────────────────────────────
  throw new Error("Aucun prix trouvé pour: " + line.designation);
}

/**
 * Find pricing items that share at least one significant keyword with the designation
 */
function findPartialMatches(designation: string): typeof PRICING_TABLE {
  const normalized = designation
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

  const tokens = normalized.split(/\s+/).filter((t) => t.length > 3);

  return PRICING_TABLE.filter((item) => {
    const itemNorm = item.item
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ");

    return tokens.some((token) => itemNorm.includes(token));
  });
}
