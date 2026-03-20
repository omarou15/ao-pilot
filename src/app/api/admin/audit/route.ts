import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";

/**
 * GET /api/admin/audit — return paginated audit log for current user's company
 * Query params: page (default 1), limit (default 50), projectId (optional)
 * Requires admin role.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { data: null, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, company_id, role")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { data: null, error: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { data: null, error: "Accès non autorisé — cette page est réservée aux administrateurs." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const projectId = searchParams.get("projectId");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("audit_log")
      .select("*", { count: "exact" })
      .eq("company_id", user.company_id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data: entries, error: queryError, count } = await query;

    if (queryError) {
      return NextResponse.json(
        { data: null, error: queryError.message },
        { status: 500 }
      );
    }

    // Fire-and-forget audit log for viewing audit
    logAction(supabase, {
      companyId: user.company_id,
      userId: user.id,
      action: "audit.view",
      details: { page, limit, projectId },
    });

    return NextResponse.json({
      data: {
        entries: entries ?? [],
        total: count ?? 0,
        page,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/admin/audit]", err);
    return NextResponse.json(
      { data: null, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
