import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { extractDceMetadata, type DceMetadata } from "./extract-metadata";
import { extractDpgfLines, type DpgfLineInput } from "./extract-dpgf-lines";

export type { DceMetadata } from "./extract-metadata";
export type { DpgfLineInput } from "./extract-dpgf-lines";

interface ProjectFile {
  id: string;
  file_type: string;
  file_name: string;
  parsed_content: Record<string, unknown> | null;
}

/**
 * Full DCE analysis pipeline:
 * 1. Fetch project files
 * 2. Extract metadata (project name, deadline, lots, criteria, etc.)
 * 3. Extract DPGF lines
 * 4. Update project in DB
 * 5. Insert DPGF lines
 * 6. Create deadline reminders
 * 7. Audit log
 */
export async function analyzeDce(
  projectId: string
): Promise<{ metadata: DceMetadata; lines: DpgfLineInput[] }> {
  const supabase = getServiceClient();

  // 1. Fetch project files
  const { data: projectFiles, error: filesError } = await supabase
    .from("project_files")
    .select("id, file_type, file_name, parsed_content")
    .eq("project_id", projectId);

  if (filesError) {
    throw new Error(`Failed to fetch project files: ${filesError.message}`);
  }

  if (!projectFiles || projectFiles.length === 0) {
    throw new Error("No files found for this project. Please upload DCE documents first.");
  }

  const files = projectFiles as ProjectFile[];

  // Set project status to 'processing'
  await supabase
    .from("projects")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", projectId);

  // 2. Extract metadata from all parsed file texts
  const parsedFilesForMetadata = files
    .filter((f) => f.parsed_content?.text)
    .map((f) => ({
      fileType: f.file_type,
      text: String((f.parsed_content as Record<string, unknown>).text ?? ""),
      fileName: f.file_name,
    }));

  const metadata = await extractDceMetadata(parsedFilesForMetadata);

  // 3. Find DPGF and CCTP files
  const dpgfFile = files.find((f) => f.file_type === "dpgf");
  const cctpFile = files.find((f) => f.file_type === "cctp");

  const dpgfContent = dpgfFile?.parsed_content
    ? {
        text: String((dpgfFile.parsed_content as Record<string, unknown>).text ?? ""),
        structured: (dpgfFile.parsed_content as Record<string, unknown>).structured,
      }
    : { text: "" };

  const cctpText = cctpFile?.parsed_content
    ? String((cctpFile.parsed_content as Record<string, unknown>).text ?? "")
    : "";

  // 4. Extract DPGF lines
  const lines = await extractDpgfLines(dpgfContent, cctpText);

  // 5. Update project with metadata and set status to 'review'
  const projectUpdate: Record<string, unknown> = {
    name: metadata.projectName,
    reference: metadata.reference || null,
    deadline: metadata.deadline,
    source: metadata.source,
    status: "review",
    metadata: {
      lots: metadata.lots,
      criteria: metadata.criteria,
      requiredDocs: metadata.requiredDocs,
    },
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("projects")
    .update(projectUpdate)
    .eq("id", projectId);

  if (updateError) {
    console.error("[analyzeDce] Failed to update project:", updateError.message);
  }

  // 6. Insert DPGF lines into DB (delete existing first to allow re-analysis)
  if (lines.length > 0) {
    await supabase.from("dpgf_lines").delete().eq("project_id", projectId);

    const dpgfRows = lines.map((line) => ({
      project_id: projectId,
      lot: line.lot || null,
      sub_lot: line.sub_lot || null,
      designation: line.designation,
      unit: line.unit || null,
      quantity: line.quantity,
      sort_order: line.sort_order,
      margin_pct: 30, // Default margin as per CLAUDE.md
      source_detail: {},
      is_validated: false,
    }));

    const { error: insertError } = await supabase
      .from("dpgf_lines")
      .insert(dpgfRows);

    if (insertError) {
      console.error("[analyzeDce] Failed to insert DPGF lines:", insertError.message);
    }
  }

  // 7. Create deadline reminders (J-7, J-3, J-1)
  if (metadata.deadline) {
    await createDeadlineReminders(supabase, projectId, metadata.deadline);
  }

  // 8. Audit log
  const { data: project } = await supabase
    .from("projects")
    .select("company_id, created_by")
    .eq("id", projectId)
    .single();

  if (project) {
    logAction(supabase, {
      companyId: project.company_id,
      userId: project.created_by ?? undefined,
      projectId,
      action: "project.analyze",
      details: {
        lotsCount: metadata.lots.length,
        dpgfLinesCount: lines.length,
        hasDeadline: metadata.deadline !== null,
        source: metadata.source,
      },
    });
  }

  return { metadata, lines };
}

/**
 * Create reminders at J-7, J-3, and J-1 before the deadline.
 */
async function createDeadlineReminders(
  supabase: ReturnType<typeof getServiceClient>,
  projectId: string,
  deadlineStr: string
): Promise<void> {
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return;

  const offsets = [7, 3, 1]; // days before deadline
  const now = new Date();

  // Delete existing deadline reminders for this project
  await supabase
    .from("reminders")
    .delete()
    .eq("project_id", projectId)
    .eq("reminder_type", "deadline");

  const reminders = offsets
    .map((days) => {
      const reminderDate = new Date(deadline);
      reminderDate.setDate(reminderDate.getDate() - days);
      return {
        project_id: projectId,
        reminder_date: reminderDate.toISOString(),
        reminder_type: "deadline" as const,
      };
    })
    .filter((r) => new Date(r.reminder_date) > now); // Only future reminders

  if (reminders.length > 0) {
    const { error } = await supabase.from("reminders").insert(reminders);
    if (error) {
      console.error("[analyzeDce] Failed to create reminders:", error.message);
    }
  }
}
