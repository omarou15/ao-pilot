import { getServiceClient } from "@/lib/supabase";

const BUCKET = "dce-files";

/**
 * Upload a file buffer to Supabase Storage.
 * Path format: {projectId}/{timestamp}-{fileName}
 */
export async function uploadFile(
  projectId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ path: string; error: string | null }> {
  const supabase = getServiceClient();
  const path = `${projectId}/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    return { path: "", error: error.message };
  }

  return { path, error: null };
}

/**
 * Get the public URL for a file in the dce-files bucket.
 */
export function getFileUrl(path: string): string {
  const supabase = getServiceClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from the dce-files bucket.
 */
export async function deleteFile(path: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
