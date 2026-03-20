import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { priceDpgf } from "@/services/ai/pricing";

/**
 * POST /api/projects/:id/pricing — trigger pricing for all DPGF lines
 */
export async function POST(
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

    // Verify user exists and get company
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

    // Verify project belongs to user's company
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, company_id")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    // Run pricing engine
    const pricedLines = await priceDpgf(id);

    // Audit log
    logAction(supabase, {
      companyId: user.company_id,
      userId: user.id,
      projectId: id,
      action: "project.price",
      details: {
        linesCount: pricedLines.length,
        pricedCount: pricedLines.filter((l) => l.total_price_sale !== null)
          .length,
      },
    });

    return NextResponse.json({ data: pricedLines, error: null });
  } catch (err) {
    console.error("[POST /api/projects/:id/pricing]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
