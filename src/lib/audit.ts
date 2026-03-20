import { SupabaseClient } from "@supabase/supabase-js";

interface AuditParams {
  companyId: string;
  userId?: string;
  projectId?: string;
  action: string;
  details?: Record<string, unknown>;
}

/**
 * Insert into audit_log table. Fire-and-forget safe — never throws.
 * Callers can skip awaiting this in route handlers if not needed.
 */
export async function logAction(
  supabase: SupabaseClient,
  params: AuditParams
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      company_id: params.companyId,
      user_id: params.userId ?? null,
      project_id: params.projectId ?? null,
      action: params.action,
      details: params.details ?? null,
    });

    if (error) {
      console.error("[audit] Failed to log action:", error.message);
    }
  } catch (err) {
    console.error("[audit] Unexpected error:", err);
  }
}
