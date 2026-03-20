import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";

/**
 * GET /api/projects — list projects for current user's company
 */
export async function GET() {
  try {
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

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("company_id", user.company_id)
      .order("created_at", { ascending: false });

    if (projectsError) {
      return NextResponse.json(
        { data: null, error: projectsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: projects, error: null });
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects — create a new project
 */
export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { name, status, deadline, metadata } = body as {
      name?: string;
      status?: string;
      deadline?: string;
      metadata?: Record<string, unknown>;
    };

    if (!name) {
      return NextResponse.json(
        { data: null, error: "Project name is required" },
        { status: 400 }
      );
    }

    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert({
        name,
        status: status ?? "draft",
        deadline: deadline ?? null,
        metadata: metadata ?? null,
        company_id: user.company_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { data: null, error: insertError.message },
        { status: 500 }
      );
    }

    // Fire-and-forget audit log
    logAction(supabase, {
      companyId: user.company_id,
      userId: user.id,
      projectId: project.id,
      action: "project.create",
      details: { name },
    });

    return NextResponse.json({ data: project, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
