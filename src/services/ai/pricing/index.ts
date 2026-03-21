/**
 * pricing/index.ts — Orchestration: price all DPGF lines for a project
 */

import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import type { DpgfLine } from "@/lib/types";
import { lookupPrices } from "./lookup-prices";
import { calculateLine } from "./calculate-line";
import { findBestPriceMatch } from "@/lib/reference-data";

const BATCH_SIZE = 5;

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
      .slice(0, 8000); // Limit context size
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

  // ─── 4. Price lines in parallel batches ────────────────────────
  const updatedLines: DpgfLine[] = [];

  // Separate priceable vs skipped lines
  const priceable = (lines as DpgfLine[]).filter(
    (l) => l.quantity !== null && l.quantity > 0
  );
  const skipped = (lines as DpgfLine[])
    .filter((l) => l.quantity === null || l.quantity <= 0)
    .map((l) => ({
      ...l,
      source_detail: {
        ...l.source_detail,
        _skipped: true,
        _reason: "Quantité manquante — saisie utilisateur requise",
      },
    }));

  // Pre-filter: separate reference table matches (instant) from AI fallback lines
  const tableMatches: DpgfLine[] = [];
  const needsAi: DpgfLine[] = [];
  for (const line of priceable) {
    if (findBestPriceMatch(line.designation)) {
      tableMatches.push(line);
    } else {
      needsAi.push(line);
    }
  }

  // Helper: price a single line and update DB
  async function priceAndUpdate(line: DpgfLine): Promise<DpgfLine> {
    try {
      const pricing = await lookupPrices(
        {
          designation: line.designation,
          unit: line.unit ?? "u",
          quantity: line.quantity,
        },
        cctpContext
      );

      const calculated = calculateLine(line.quantity!, pricing, marginPct);

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
        return line;
      }
      return updated as DpgfLine;
    } catch (err) {
      console.error(
        `[pricing] Failed to price line "${line.designation}":`,
        err
      );
      return {
        ...line,
        source_detail: {
          ...line.source_detail,
          _error: err instanceof Error ? err.message : String(err),
        },
      };
    }
  }

  // Table matches: process sequentially (no network calls to Mistral, fast)
  for (const line of tableMatches) {
    updatedLines.push(await priceAndUpdate(line));
  }

  // AI fallback: process in parallel batches of BATCH_SIZE
  for (let i = 0; i < needsAi.length; i += BATCH_SIZE) {
    const batch = needsAi.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(priceAndUpdate));

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      updatedLines.push(
        result.status === "fulfilled" ? result.value : batch[j]
      );
    }
  }

  // Add skipped lines at the end
  updatedLines.push(...skipped);

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
