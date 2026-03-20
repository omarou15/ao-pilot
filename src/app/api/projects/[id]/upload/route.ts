import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { uploadFile } from "@/lib/storage";
import { logAction } from "@/lib/audit";
import { parseFile } from "@/services/parsing";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/msword", // doc
];
const ACCEPTED_EXTENSIONS = ["pdf", "xlsx", "xls", "docx", "doc"];

function getFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function inferFileType(name: string): string {
  const ext = getFileExtension(name);
  switch (ext) {
    case "pdf":
      return "pdf";
    case "xlsx":
    case "xls":
      return "excel";
    case "docx":
    case "doc":
      return "word";
    default:
      return "unknown";
  }
}

/**
 * POST /api/projects/:id/upload — multifile upload endpoint
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
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
      .eq("id", projectId)
      .eq("company_id", user.company_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { data: null, error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate all files before processing
    for (const file of files) {
      const ext = getFileExtension(file.name);

      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          {
            data: null,
            error: `File type not accepted: ${file.name}. Allowed: ${ACCEPTED_EXTENSIONS.join(", ")}`,
          },
          { status: 400 }
        );
      }

      if (!ACCEPTED_TYPES.includes(file.type) && file.type !== "") {
        // Some browsers may not set type; fall back to extension check above
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            data: null,
            error: `File too large: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB). Max: 50MB`,
          },
          { status: 400 }
        );
      }
    }

    interface ProjectFile {
      id: string;
      project_id: string;
      file_type: string;
      file_name: string;
      storage_path: string;
      mime_type: string;
      parsed_content: unknown;
      created_at: string;
    }

    const uploadedFiles: ProjectFile[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { path, error: uploadError } = await uploadFile(
        projectId,
        file.name,
        buffer,
        file.type
      );

      if (uploadError) {
        return NextResponse.json(
          { data: null, error: `Upload failed for ${file.name}: ${uploadError}` },
          { status: 500 }
        );
      }

      let parsedContent: unknown = null;
      let fileType = inferFileType(file.name);

      try {
        const parseResult = await parseFile(buffer, file.name, file.type);
        parsedContent = parseResult;
        fileType = parseResult.documentType;
      } catch (parseError) {
        console.error(`[parseFile] Failed for ${file.name}:`, parseError);
      }

      const { data: fileRecord, error: insertError } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          file_type: fileType,
          file_name: file.name,
          storage_path: path,
          mime_type: file.type,
          parsed_content: parsedContent,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { data: null, error: `DB insert failed for ${file.name}: ${insertError.message}` },
          { status: 500 }
        );
      }

      uploadedFiles.push(fileRecord as ProjectFile);
    }

    // Fire-and-forget audit log
    logAction(supabase, {
      companyId: user.company_id,
      userId: user.id,
      projectId,
      action: "files.upload",
      details: {
        count: uploadedFiles.length,
        fileNames: uploadedFiles.map((f) => f.file_name),
      },
    });

    return NextResponse.json(
      { data: uploadedFiles, error: null },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/projects/:id/upload]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
