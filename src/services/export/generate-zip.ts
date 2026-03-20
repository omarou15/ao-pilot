import archiver from "archiver";
import { PassThrough } from "stream";
import { getServiceClient } from "@/lib/supabase";
import { generateDpgfExcel } from "./generate-dpgf-excel";
import { generateMemoirDocx } from "./generate-memoir-docx";
import type { AdminDoc } from "@/lib/types";

/**
 * Generate a full project ZIP containing:
 *  - DPGF_chiffre.xlsx
 *  - Memoire_technique.docx
 *  - Documents_administratifs/ (generated admin docs as .txt)
 */
export async function generateProjectZip(projectId: string): Promise<Buffer> {
  // Generate main documents in parallel
  const [dpgfBuffer, memoirBuffer] = await Promise.all([
    generateDpgfExcel(projectId),
    generateMemoirDocx(projectId),
  ]);

  // Fetch generated admin docs
  const supabase = getServiceClient();
  const { data: adminDocs, error } = await supabase
    .from("admin_docs")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_generated", true);

  if (error) {
    throw new Error(`Failed to fetch admin docs: ${error.message}`);
  }

  const docs: AdminDoc[] = adminDocs ?? [];

  // Build ZIP archive
  const chunks: Buffer[] = [];
  const passthrough = new PassThrough();
  passthrough.on("data", (chunk: Buffer) => chunks.push(chunk));

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(passthrough);

  // Main documents
  archive.append(dpgfBuffer, { name: "DPGF_chiffre.xlsx" });
  archive.append(memoirBuffer, { name: "Memoire_technique.docx" });

  // Admin docs as text files in subfolder
  for (const doc of docs) {
    // Use doc_name for the filename, ensure .txt extension for generated docs
    const fileName = doc.doc_name.endsWith(".txt")
      ? doc.doc_name
      : `${doc.doc_name}.txt`;

    // For generated docs, fetch template_content from storage or use doc_name as placeholder
    // The template_content is typically stored inline or via storage_path
    if (doc.storage_path) {
      // Download file from Supabase Storage
      const { data: fileData, error: dlError } = await supabase.storage
        .from("documents")
        .download(doc.storage_path);

      if (!dlError && fileData) {
        const arrayBuffer = await fileData.arrayBuffer();
        archive.append(Buffer.from(arrayBuffer), {
          name: `Documents_administratifs/${doc.doc_name}`,
        });
        continue;
      }
    }

    // Fallback: create a placeholder text file
    archive.append(`Document administratif : ${doc.doc_name}\nType : ${doc.doc_type}\n`, {
      name: `Documents_administratifs/${fileName}`,
    });
  }

  await archive.finalize();

  return Buffer.concat(chunks);
}
