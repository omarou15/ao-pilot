import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { generateProjectZip } from "@/services/export/generate-zip";

/**
 * GET /api/projects/:id/export
 * Generate and download the full project ZIP (DPGF + memoir + admin docs).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return Response.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();

    // Resolve user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      return Response.json(
        { data: null, error: "User not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, company_id")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single();

    if (projectError || !project) {
      return Response.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    // Generate ZIP
    const zipBuffer = await generateProjectZip(id);

    // Sanitize project name for filename
    const safeName = project.name
      .replace(/[^a-zA-Z0-9À-ÿ_\- ]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 80);

    // Fire-and-forget audit log
    logAction(supabase, {
      companyId: user.company_id,
      userId: user.id,
      projectId: id,
      action: "project.export",
    });

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="AO_Pilot_${safeName}.zip"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/projects/:id/export]", err);
    return Response.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
