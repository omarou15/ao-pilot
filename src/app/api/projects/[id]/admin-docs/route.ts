import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { generateAdminDocs } from "@/services/ai/documents/generate-admin-docs";

/**
 * GET /api/projects/:id/admin-docs — fetch admin documents for a project
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

    const { data: docs, error: docsError } = await supabase
      .from("admin_docs")
      .select("*")
      .eq("project_id", id);

    if (docsError) {
      return NextResponse.json(
        { data: null, error: docsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: docs, error: null });
  } catch (err) {
    console.error("[GET /api/projects/:id/admin-docs]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/:id/admin-docs — trigger admin docs generation
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

    const docs = await generateAdminDocs(id);

    return NextResponse.json({ data: docs, error: null });
  } catch (err) {
    console.error("[POST /api/projects/:id/admin-docs]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/:id/admin-docs — update an admin document
 * Body: { docId: string, is_validated?: boolean, storage_path?: string }
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
    const { docId, is_validated, storage_path } = body as {
      docId: string;
      is_validated?: boolean;
      storage_path?: string;
    };

    if (!docId) {
      return NextResponse.json(
        { data: null, error: "docId is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (is_validated !== undefined) updates.is_validated = is_validated;
    if (storage_path !== undefined) updates.storage_path = storage_path;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { data: null, error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: doc, error: updateError } = await supabase
      .from("admin_docs")
      .update(updates)
      .eq("id", docId)
      .eq("project_id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { data: null, error: updateError.message },
        { status: 500 }
      );
    }

    // Fire-and-forget audit log
    logAction(supabase, {
      companyId: user.company_id,
      userId: user.id,
      projectId: id,
      action: "admin_docs.update",
      details: { docId, ...updates },
    });

    return NextResponse.json({ data: doc, error: null });
  } catch (err) {
    console.error("[PATCH /api/projects/:id/admin-docs]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
