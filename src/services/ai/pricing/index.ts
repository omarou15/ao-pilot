/**
 * pricing/index.ts — Orchestration: price all DPGF lines for a project
 */

import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import type { DpgfLine } from "@/lib/types";
import { lookupPrices } from "./lookup-prices";
import { calculateLine } from "./calculate-line";

/**
 * Price all DPGF lines for a project.
 *
 * 1. Fetch dpgf_lines from DB
 * 2. Fetch CCTP text from project_files
 * 3. Fetch company to get default_margin
 * 4. For each line with quantity > 0: lookupPrices() then calculateLine()
 * 5. Lines with null quantity: skip pricing, mark for user input
 * 6. Update dpgf_lines in DB
 * 7. Log action
 * 8. Return updated lines
 */
export async function priceDpgf(projectId: string): Promise<DpgfLine[]> {
  const supabase = getServiceClient();

  // ─── 1. Fetch DPGF lines ────────────────────────────────────────
  const { data: lines, error: linesError } = await supabase
    .from("dpgf_lines")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (linesError) {
    throw new Error("Erreur lors du chargement des lignes DPGF: " + linesError.message);
  }

  if (!lines || lines.length === 0) {
    throw new Error("Aucune ligne DPGF trouvée pour ce projet");
  }

  // ─── 2. Fetch CCTP text ─────────────────────────────────────────
  const { data: cctpFiles } = await supabase
    .from("project_files")
    .select("parsed_content")
    .eq("project_id", projectId)
    .eq("file_type", "cctp");

  let cctpContext = "";
  if (cctpFiles && cctpFiles.length > 0) {
    cctpContext = cctpFiles
      .map((f) => {
        if (f.parsed_content && typeof f.parsed_content === "object") {
          return JSON.stringify(f.parsed_content);
        }
        return String(f.parsed_content ?? "");
      })
      .join("\n")
      .slice(0, 15000); // Increased from 8000 for better forfait pricing
  }

  // ─── 3. Fetch company for default_margin ────────────────────────
  const { data: project } = await supabase
    .from("projects")
    .select("company_id")
    .eq("id", projectId)
    .single();

  let marginPct = 30; // Default
  if (project?.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("id, default_margin")
      .eq("id", project.company_id)
      .single();

    if (company?.default_margin) {
      marginPct = company.default_margin;
    }
  }

  // ─── 4. Price each line ─────────────────────────────────────────
  const updatedLines: DpgfLine[] = [];

  for (const line of lines as DpgfLine[]) {
    // Skip lines without quantity — mark for user input
    if (line.quantity === null || line.quantity <= 0) {
      updatedLines.push({
        ...line,
        source_detail: {
          ...line.source_detail,
          _skipped: true,
          _reason: "Quantité manquante — saisie utilisateur requise",
        },
      });
      continue;
    }

    try {
      const pricing = await lookupPrices(
        {
          designation: line.designation,
          unit: line.unit ?? "u",
          quantity: line.quantity,
        },
        cctpContext
      );

      const calculated = calculateLine(line.quantity, pricing, marginPct);

      // ─── 6. Update line in DB ──────────────────────────────────
      const { data: updated, error: updateError } = await supabase
        .from("dpgf_lines")
        .update({
          unit_cost_material: calculated.unit_cost_material,
          unit_cost_labor: calculated.unit_cost_labor,
          labor_hours: calculated.labor_hours,
          total_cost: calculated.total_cost,
          margin_pct: calculated.margin_pct,
          unit_price_sale: calculated.unit_price_sale,
          total_price_sale: calculated.total_price_sale,
          source_detail: calculated.source_detail,
        })
        .eq("id", line.id)
        .select()
        .single();

      if (updateError) {
        console.error(
          `[pricing] Failed to update line ${line.id}:`,
          updateError.message
        );
        updatedLines.push(line);
      } else {
        updatedLines.push(updated as DpgfLine);
      }
    } catch (err) {
      console.error(
        `[pricing] Failed to price line "${line.designation}":`,
        err
      );
      updatedLines.push({
        ...line,
        source_detail: {
          ...line.source_detail,
          _error: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }

  // ─── 7. Audit log ──────────────────────────────────────────────
  if (project?.company_id) {
    logAction(supabase, {
      companyId: project.company_id,
      projectId,
      action: "project.price",
      details: {
        totalLines: lines.length,
        pricedLines: updatedLines.filter(
          (l) => l.total_price_sale !== null
        ).length,
        marginPct,
      },
    });
  }

  return updatedLines;
}
