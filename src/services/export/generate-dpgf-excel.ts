import * as XLSX from "xlsx";
import { getServiceClient } from "@/lib/supabase";
import type { DpgfLine, PricingDetail } from "@/lib/types";

/**
 * Generate a DPGF Excel workbook for a project.
 * Sheet 1: DPGF summary (lot / sous-lot / designation / unit / qty / PU / total)
 * Sheet 2: Pricing detail breakdown per line
 */
export async function generateDpgfExcel(projectId: string): Promise<Buffer> {
  const supabase = getServiceClient();

  const { data: lines, error } = await supabase
    .from("dpgf_lines")
    .select("*")
    .eq("project_id", projectId)
    .order("lot", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch DPGF lines: ${error.message}`);
  }

  const dpgfLines: DpgfLine[] = lines ?? [];

  // --- Sheet 1: DPGF ---
  const dpgfRows = dpgfLines.map((line) => ({
    Lot: line.lot ?? "",
    "Sous-lot": line.sub_lot ?? "",
    "Désignation": line.designation,
    "Unité": line.unit ?? "",
    "Quantité": line.quantity ?? 0,
    "PU HT (€)": line.unit_price_sale ?? 0,
    "Total HT (€)": line.total_price_sale ?? 0,
  }));

  // Grand total row
  const grandTotal = dpgfLines.reduce(
    (sum, line) => sum + (line.total_price_sale ?? 0),
    0
  );

  dpgfRows.push({
    Lot: "",
    "Sous-lot": "",
    "Désignation": "TOTAL GÉNÉRAL",
    "Unité": "",
    "Quantité": 0,
    "PU HT (€)": 0,
    "Total HT (€)": grandTotal,
  });

  const dpgfSheet = XLSX.utils.json_to_sheet(dpgfRows);

  // --- Sheet 2: Détail calcul ---
  const detailRows = dpgfLines.map((line) => {
    const detail = (line.source_detail ?? {}) as Partial<PricingDetail>;
    return {
      "Désignation": line.designation,
      "Matériau": detail.materialName ?? "",
      "Prix matériau (€)": detail.materialUnitPrice ?? 0,
      "Catégorie MO": detail.laborCategory ?? "",
      "Taux horaire (€/h)": detail.laborHourlyRate ?? 0,
      Heures: line.labor_hours ?? 0,
      "Coût réel (€)": line.total_cost ?? 0,
      "Marge %": line.margin_pct,
      "Prix vente (€)": line.total_price_sale ?? 0,
      Confiance: detail.confidence ?? "",
    };
  });

  // Summary row
  const totalCostSum = dpgfLines.reduce(
    (sum, line) => sum + (line.total_cost ?? 0),
    0
  );

  detailRows.push({
    "Désignation": "TOTAL",
    "Matériau": "",
    "Prix matériau (€)": 0,
    "Catégorie MO": "",
    "Taux horaire (€/h)": 0,
    Heures: 0,
    "Coût réel (€)": totalCostSum,
    "Marge %": 0,
    "Prix vente (€)": grandTotal,
    Confiance: "",
  });

  const detailSheet = XLSX.utils.json_to_sheet(detailRows);

  // --- Workbook ---
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, dpgfSheet, "DPGF");
  XLSX.utils.book_append_sheet(workbook, detailSheet, "Détail calcul");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;

  return buffer;
}
