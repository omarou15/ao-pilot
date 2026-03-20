import { generateMemoir } from "./generate-memoir";
import { generateAdminDocs } from "./generate-admin-docs";
import type { MemoireSection, AdminDoc } from "@/lib/types";

export { generateMemoir } from "./generate-memoir";
export { generateAdminDocs } from "./generate-admin-docs";

/**
 * Generate all documents (memoir + admin docs) in parallel for a project.
 */
export async function generateAllDocuments(projectId: string): Promise<{
  memoir: MemoireSection[];
  adminDocs: AdminDoc[];
}> {
  const [memoir, adminDocs] = await Promise.all([
    generateMemoir(projectId),
    generateAdminDocs(projectId),
  ]);

  return { memoir, adminDocs };
}
