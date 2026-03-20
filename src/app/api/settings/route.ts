import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { companySettingsSchema } from "@/lib/validators";

/**
 * GET /api/settings — return company info for current user
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { data: null, error: "Non autorisé" },
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
        { data: null, error: "Utilisateur introuvable. Veuillez compléter l'onboarding." },
        { status: 404 }
      );
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", user.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { data: null, error: "Entreprise introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: company, error: null });
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return NextResponse.json(
      { data: null, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings — update company info
 */
export async function PATCH(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { data: null, error: "Non autorisé" },
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
        { data: null, error: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const parsed = companySettingsSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json(
        { data: null, error: firstError },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.siret !== undefined) updates.siret = parsed.data.siret;
    if (parsed.data.address !== undefined) updates.address = parsed.data.address;
    if (parsed.data.default_margin !== undefined) updates.default_margin = parsed.data.default_margin;

    // Also allow logo_url pass-through (not in zod schema yet)
    if (typeof body.logo_url === "string") updates.logo_url = body.logo_url;

    const { data: company, error: updateError } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", user.company_id)
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
      action: "company.update",
      details: updates,
    });

    return NextResponse.json({ data: company, error: null });
  } catch (err) {
    console.error("[PATCH /api/settings]", err);
    return NextResponse.json(
      { data: null, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
