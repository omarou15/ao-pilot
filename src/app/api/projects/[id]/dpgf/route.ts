import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { calculateLine } from "@/services/ai/pricing/calculate-line";
import type { PricingBreakdown } from "@/services/ai/pricing/lookup-prices";

/**
 * GET /api/projects/:id/dpgf — fetch all DPGF lines sorted by sort_order
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();

    // Verify user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { data: null, error: "User not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch DPGF lines
    const { data: lines, error: linesError } = await supabase
      .from("dpgf_lines")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });

    if (linesError) {
      return NextResponse.json(
        { data: null, error: linesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: lines, error: null });
  } catch (err) {
    console.error("[GET /api/projects/:id/dpgf]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/:id/dpgf — update individual DPGF line
 * Body: { lineId: string, updates: { quantity?, unit_cost_material?, margin_pct?, ... } }
 * Recalculates totals if pricing-relevant fields change.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();

    // Verify user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { data: null, error: "User not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { lineId, updates } = body as {
      lineId?: string;
      updates?: Record<string, unknown>;
    };

    if (!lineId || !updates) {
      return NextResponse.json(
        { data: null, error: "lineId and updates are required" },
        { status: 400 }
      );
    }

    // Fetch existing line
    const { data: existingLine, error: lineError } = await supabase
      .from("dpgf_lines")
      .select("*")
      .eq("id", lineId)
      .eq("project_id", id)
      .single();

    if (lineError || !existingLine) {
      return NextResponse.json(
        { data: null, error: "DPGF line not found" },
        { status: 404 }
      );
    }

    // Merge updates with existing values
    const merged = { ...existingLine, ...updates };

    // Recalculate if pricing-relevant fields are present
    const pricingFields = [
      "quantity",
      "unit_cost_material",
      "unit_cost_labor",
      "labor_hours",
      "margin_pct",
    ];
    const needsRecalc = pricingFields.some(
      (f) => updates[f] !== undefined
    );

    let finalUpdates: Record<string, unknown> = { ...updates };

    if (needsRecalc && merged.quantity && merged.quantity > 0) {
      const sourceDetail = (existingLine.source_detail ?? {}) as Record<
        string,
        unknown
      >;

      const pricing: PricingBreakdown = {
        materialName:
          (sourceDetail.materialName as string) ?? existingLine.designation,
        materialUnitPrice:
          (updates.unit_cost_material as number) ??
          existingLine.unit_cost_material ??
          0,
        laborCategory:
          (sourceDetail.laborCategory as string) ?? "Manoeuvre / aide",
        laborHourlyRate:
          existingLine.unit_cost_labor && existingLine.labor_hours
            ? existingLine.unit_cost_labor / existingLine.labor_hours
            : 40,
        estimatedHours:
          (updates.labor_hours as number) ?? existingLine.labor_hours ?? 1,
        confidence: (sourceDetail.confidence as "high" | "medium" | "low") ?? "medium",
        source: (sourceDetail.source as "reference_table" | "ai_estimate") ?? "reference_table",
      };

      // Override with explicit updates
      if (updates.unit_cost_material !== undefined) {
        pricing.materialUnitPrice = updates.unit_cost_material as number;
      }
      if (updates.labor_hours !== undefined) {
        pricing.estimatedHours = updates.labor_hours as number;
      }

      const marginPct =
        (updates.margin_pct as number) ?? existingLine.margin_pct ?? 30;
      const quantity =
        (updates.quantity as number) ?? existingLine.quantity ?? 1;

      const calculated = calculateLine(quantity, pricing, marginPct);

      finalUpdates = {
        ...finalUpdates,
        unit_cost_material: calculated.unit_cost_material,
        unit_cost_labor: calculated.unit_cost_labor,
        labor_hours: calculated.labor_hours,
        total_cost: calculated.total_cost,
        margin_pct: calculated.margin_pct,
        unit_price_sale: calculated.unit_price_sale,
        total_price_sale: calculated.total_price_sale,
        source_detail: {
          ...calculated.source_detail,
          _editedBy: "user",
        },
      };
    }

    // Update in DB
    const { data: updatedLine, error: updateError } = await supabase
      .from("dpgf_lines")
      .update(finalUpdates)
      .eq("id", lineId)
      .eq("project_id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { data: null, error: updateError.message },
        { status: 500 }
      );
    }

    // Audit log
    logAction(supabase, {
      companyId: user.company_id,
      userId: user.id,
      projectId: id,
      action: "dpgf.update_line",
      details: { lineId, updates: Object.keys(updates) },
    });

    return NextResponse.json({ data: updatedLine, error: null });
  } catch (err) {
    console.error("[PATCH /api/projects/:id/dpgf]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
