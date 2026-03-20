/**
 * calculate-line.ts — Pure calculation (no AI). Applies margin and builds detail.
 */

import type { PricingBreakdown } from "./lookup-prices";

export interface CalculatedLine {
  unit_cost_material: number;
  unit_cost_labor: number;
  labor_hours: number;
  total_cost: number;
  margin_pct: number;
  unit_price_sale: number;
  total_price_sale: number;
  source_detail: {
    materialName: string;
    materialUnitPrice: number;
    materialQuantity: number;
    materialTotal: number;
    laborCategory: string;
    laborHourlyRate: number;
    laborHours: number;
    laborTotal: number;
    totalCost: number;
    marginPct: number;
    salePrice: number;
    confidence: "high" | "medium" | "low";
    source: string;
  };
}

/**
 * Calculate a DPGF line from pricing breakdown.
 *
 * Formula:
 *   materialTotal = materialUnitPrice * quantity
 *   laborTotal = laborHourlyRate * estimatedHours
 *   totalCost = materialTotal + laborTotal
 *   salePrice = Math.ceil(totalCost * (1 + marginPct / 100))   // ROUND UP
 *   unitPriceSale = quantity > 0 ? Math.ceil(salePrice / quantity) : salePrice
 */
export function calculateLine(
  quantity: number,
  pricing: PricingBreakdown,
  marginPct: number
): CalculatedLine {
  const materialTotal = pricing.materialUnitPrice * quantity;
  const laborTotal = pricing.laborHourlyRate * pricing.estimatedHours;
  const totalCost = materialTotal + laborTotal;
  const salePrice = Math.ceil(totalCost * (1 + marginPct / 100));
  const unitPriceSale =
    quantity > 0 ? Math.ceil(salePrice / quantity) : salePrice;

  return {
    unit_cost_material: pricing.materialUnitPrice,
    unit_cost_labor: pricing.laborHourlyRate * pricing.estimatedHours,
    labor_hours: pricing.estimatedHours,
    total_cost: totalCost,
    margin_pct: marginPct,
    unit_price_sale: unitPriceSale,
    total_price_sale: salePrice,
    source_detail: {
      materialName: pricing.materialName,
      materialUnitPrice: pricing.materialUnitPrice,
      materialQuantity: quantity,
      materialTotal,
      laborCategory: pricing.laborCategory,
      laborHourlyRate: pricing.laborHourlyRate,
      laborHours: pricing.estimatedHours,
      laborTotal,
      totalCost,
      marginPct,
      salePrice,
      confidence: pricing.confidence,
      source: pricing.source,
    },
  };
}
