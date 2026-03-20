import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";

/**
 * GET /api/projects/:id — get project detail with counts (files, dpgf lines)
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

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch counts in parallel
    const [filesResult, dpgfResult] = await Promise.all([
      supabase
        .from("project_files")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id),
      supabase
        .from("dpgf_lines")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id),
    ]);

    return NextResponse.json({
      data: {
        ...project,
        files_count: filesResult.count ?? 0,
        dpgf_lines_count: dpgfResult.count ?? 0,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/projects/:id]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/:id — update project (name, status, deadline, metadata)
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
    const { data: existing, error: existingError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, status, deadline, metadata } = body as {
      name?: string;
      status?: string;
      deadline?: string;
      metadata?: Record<string, unknown>;
    };

    // Build update payload — only include provided fields
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (status !== undefined) updates.status = status;
    if (deadline !== undefined) updates.deadline = deadline;
    if (metadata !== undefined) updates.metadata = metadata;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { data: null, error: "No fields to update" },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data: project, error: updateError } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
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
      action: "project.update",
      details: updates,
    });

    return NextResponse.json({ data: project, error: null });
  } catch (err) {
    console.error("[PATCH /api/projects/:id]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
